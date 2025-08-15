import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import * as quizzesClient from "./client";
import * as attemptsClient from "./attemptsClient";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";

type Mode = "faculty" | "student";
type QType = "MCQ" | "TRUE_FALSE" | "FILL_BLANK";

type BaseQ = { _id: string; type: QType; title: string; points: number; prompt: string };
type McqQ = BaseQ & { type: "MCQ"; choices: string[]; correctIndex: number };
type TfQ  = BaseQ & { type: "TRUE_FALSE"; correct: boolean };
type FibBlank = { id: string; label: string; acceptableAnswers: string[] };
type FibQ = BaseQ & { type: "FILL_BLANK"; blanks: FibBlank[] };
type AnyQ = McqQ | TfQ | FibQ;

const BLANK_TOKEN_RE = /\[\[blank(?:\d+)?\]\]/gi;

function newId() {
  return (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2));
}

function normalize(qq: any): AnyQ {
  const base: BaseQ = {
    _id: qq?._id ?? newId(),
    type: (qq?.type as QType) ?? "MCQ",
    title: qq?.title ?? "Question",
    points: Number(qq?.points ?? 1),
    prompt: qq?.prompt ?? "",
  };
  if (base.type === "TRUE_FALSE") {
    return { ...(base as TfQ), type: "TRUE_FALSE", correct: !!qq?.correct };
  }
  if (base.type === "FILL_BLANK") {
    const blanks: FibBlank[] = (Array.isArray(qq?.blanks) ? qq.blanks : []).map((b: any, i: number) => ({
      id: b?.id ?? newId(),
      label: b?.label ?? `Blank ${i + 1}`,
      acceptableAnswers: Array.isArray(b?.acceptableAnswers) ? b.acceptableAnswers : [""],
    }));
    return { ...(base as FibQ), type: "FILL_BLANK", blanks };
  }
  const choices =
    Array.isArray(qq?.choices) && qq.choices.length >= 2 ? qq.choices : ["Choice 1", "Choice 2"];
  const correctIndex =
    typeof qq?.correctIndex === "number" && qq.correctIndex >= 0 && qq.correctIndex < choices.length
      ? qq.correctIndex
      : 0;
  return { ...(base as McqQ), type: "MCQ", choices, correctIndex };
}

function parsePrompt(prompt: string) {
  const parts: Array<{ kind: "text" | "blank"; text?: string; idx?: number }> = [];
  let last = 0, bi = 0, m: RegExpExecArray | null;
  while ((m = BLANK_TOKEN_RE.exec(prompt)) !== null) {
    if (m.index > last) parts.push({ kind: "text", text: prompt.slice(last, m.index) });
    parts.push({ kind: "blank", idx: bi++ });
    last = m.index + m[0].length;
  }
  if (last < prompt.length) parts.push({ kind: "text", text: prompt.slice(last) });
  return parts;
}

const norm = (s: string) => (s ?? "").trim().toLowerCase();

function gradeOne(q: AnyQ, ans: any): { correct: boolean } {
  if (q.type === "MCQ") return { correct: Number(ans) === (q as McqQ).correctIndex };
  if (q.type === "TRUE_FALSE") return { correct: ans === (q as TfQ).correct };
  const fib = q as FibQ;
  const as: string[] = Array.isArray(ans) ? ans : [];
  if (as.length < fib.blanks.length) return { correct: false };
  const ok = fib.blanks.every((b, i) => {
    const pool = (b.acceptableAnswers || []).map(norm).filter(Boolean);
    return pool.includes(norm(as[i]));
  });
  return { correct: ok };
}

function gradeAll(questions: AnyQ[], answers: Record<string, any>) {
  let score = 0;
  const per: Record<string, boolean> = {};
  for (const q of questions) {
    const r = gradeOne(q, answers[q._id]);
    per[q._id] = r.correct;
    if (r.correct) score += q.points;
  }
  return { score, per };
}

function RenderFIB({
  q, value, disabled, onChange,
}: { q: FibQ; value: string[]; disabled: boolean; onChange: (vals: string[]) => void; }) {
  const parts = parsePrompt(q.prompt);
  const blanksCount = parts.filter(p => p.kind === "blank").length || q.blanks.length || 1;
  const vals = Array.isArray(value) ? [...value] : [];
  while (vals.length < blanksCount) vals.push("");
  const update = (i: number, v: string) => { const next = [...vals]; next[i] = v; onChange(next); };

  return (
    <div className="mb-3" style={{ whiteSpace: "pre-wrap" }}>
      {parts.length
        ? parts.map((p, i) =>
            p.kind === "text" ? (
              <span key={i}>{p.text}</span>
            ) : (
              <Form.Control
                key={i}
                size="sm"
                type="text"
                disabled={disabled}
                value={vals[p.idx ?? 0] || ""}
                onChange={(e) => update(p.idx ?? 0, e.target.value)}
                style={{ display: "inline-block", width: 160, margin: "0 6px" }}
              />
            )
          )
        : q.blanks.map((_, i) => (
            <Form.Control
              key={i}
              size="sm"
              type="text"
              disabled={disabled}
              value={vals[i] || ""}
              onChange={(e) => update(i, e.target.value)}
              style={{ display: "inline-block", width: 160, margin: "0 6px" }}
            />
          ))}
    </div>
  );
}

export default function QuizRunner({ mode }: { mode: Mode }) {
  const { cid, qid } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((s: any) => s.accountReducer.currentUser);
  const isFaculty = mode === "faculty";
  const studentId = currentUser?._id;

  const [quiz, setQuiz] = useState<any | null>(null);
  const [questions, setQuestions] = useState<AnyQ[]>([]);
  const [idx, setIdx] = useState(0);

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctMap, setCorrectMap] = useState<Record<string, boolean>>({});

  const [attempts, setAttempts] = useState<any[]>([]);
  const attemptsAllowed = useMemo(() => {
    const multi = !!quiz?.multipleAttempts;
    const limit = Number(quiz?.attemptLimit ?? 1);
    return multi ? Math.max(1, limit) : 1;
  }, [quiz]);
  const attemptsLeft = Math.max(0, attemptsAllowed - attempts.length);
  const canTake = !isFaculty && attemptsLeft > 0;

  const totalPoints = useMemo(
    () => questions.reduce((s, q) => s + (Number(q.points) || 0), 0),
    [questions]
  );

  useEffect(() => {
    const load = async () => {
      if (!qid) return;
      const q = await quizzesClient.findQuizById(qid);
      const qs: AnyQ[] = (q?.questions || []).map(normalize);
      setQuiz(q);
      setQuestions(qs);

      const init: Record<string, any> = {};
      for (const qq of qs) {
        if (qq.type === "MCQ") init[qq._id] = -1;
        else if (qq.type === "TRUE_FALSE") init[qq._id] = null;
        else init[qq._id] = Array((qq as FibQ).blanks.length || 1).fill("");
      }
      setAnswers(init);

      if (mode === "student" && studentId) {
        const list = await attemptsClient.findAttemptsForStudent(qid, studentId);
        setAttempts(list || []);
        if (list?.length) {
          const last = list[0];
          setSubmitted(true);
          setScore(last.score);
          setCorrectMap(last.perQuestionCorrect || {});
          setAnswers(last.answers || init);
        }
      } else {
        setSubmitted(false);
      }
    };
    load();
  }, [qid, mode, studentId]);

  const current = questions[idx];
  const canPrev = idx > 0;
  const canNext = idx < questions.length - 1;

  const onSubmit = async () => {
    const { score: sc, per } = gradeAll(questions, answers);
    setScore(sc);
    setCorrectMap(per);
    setSubmitted(true);

    if (mode === "student" && studentId && qid) {
      const saved = await attemptsClient.createAttempt(qid, {
        studentId,
        answers,
      });
      const list = await attemptsClient.findAttemptsForStudent(qid, studentId);
      setAttempts(list || []);
    }
  };

  const onRetake = () => {
    if (mode === "student" && !canTake) return;

    const reset: Record<string, any> = {};
    for (const qq of questions) {
      if (qq.type === "MCQ") reset[qq._id] = -1;
      else if (qq.type === "TRUE_FALSE") reset[qq._id] = null;
      else reset[qq._id] = Array((qq as FibQ).blanks.length || 1).fill("");
    }
    setAnswers(reset);
    setSubmitted(false);
    setScore(0);
    setCorrectMap({});
    setIdx(0);
  };

  if (!quiz) return null;

  return (
    <div id="wd-quiz-runner" className="mt-3">
      {isFaculty && (
        <Alert variant="warning" className="mb-3">
          <strong>This is a preview of the published version of the quiz.</strong>
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="mb-0">{quiz.title || "Untitled Quiz"}</h3>
        <div className="text-muted">Points {totalPoints}</div>
      </div>

      {quiz.description && (
        <div className="mb-3">
          <h5 className="mb-2">Quiz Instructions</h5>
          <div>{quiz.description}</div>
        </div>
      )}

      {current && (
        <Card className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <span className="fw-semibold">Question {idx + 1}</span>
              {submitted && (
                correctMap[current._id] ? (
                  <BsCheckCircleFill className="text-success" />
                ) : (
                  <BsXCircleFill className="text-danger" />
                )
              )}
            </div>
            <div>{current.points} pts</div>
          </Card.Header>
          <Card.Body>
            {current.type === "FILL_BLANK" ? (
              <RenderFIB
                q={current as FibQ}
                value={answers[current._id]}
                disabled={submitted || (mode === "student" && !canTake)}
                onChange={(vals) =>
                  setAnswers((a) => ({ ...a, [current._id]: vals }))
                }
              />
            ) : (
              <div className="mb-3" style={{ whiteSpace: "pre-wrap" }}>
                {current.prompt}
              </div>
            )}

            {current.type === "MCQ" && (
              <Form>
                {(current as McqQ).choices.map((c, i) => {
                  const isChecked = answers[current._id] === i;
                  const isCorrect = i === (current as McqQ).correctIndex;
                  const showSuccess = submitted && isCorrect;
                  const showDanger  = submitted && isChecked && !isCorrect;
                  return (
                    <Form.Check
                      key={i}
                      type="radio"
                      name={`mcq-${current._id}`}
                      label={c}
                      disabled={submitted || (mode === "student" && !canTake)}
                      checked={isChecked}
                      onChange={() => setAnswers((a) => ({ ...a, [current._id]: i }))}
                      className={showSuccess ? "text-success" : showDanger ? "text-danger" : ""}
                    />
                  );
                })}
              </Form>
            )}

            {current.type === "TRUE_FALSE" && (
              <Form>
                {["True", "False"].map((label, i) => {
                  const val = i === 0;
                  const isChecked = answers[current._id] === val;
                  const isCorrect = (current as TfQ).correct === val;
                  const showSuccess = submitted && isCorrect;
                  const showDanger  = submitted && isChecked && !isCorrect;
                  return (
                    <Form.Check
                      key={label}
                      type="radio"
                      name={`tf-${current._id}`}
                      label={label}
                      disabled={submitted || (mode === "student" && !canTake)}
                      checked={isChecked}
                      onChange={() => setAnswers((a) => ({ ...a, [current._id]: val }))}
                      className={showSuccess ? "text-success" : showDanger ? "text-danger" : ""}
                    />
                  );
                })}
              </Form>
            )}
          </Card.Body>
        </Card>
      )}

      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            disabled={idx === 0 || submitted}
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline-secondary"
            disabled={idx >= questions.length - 1 || submitted}
            onClick={() => setIdx((i) => Math.min(questions.length - 1, i + 1))}
          >
            Next
          </Button>
        </div>

        {!submitted ? (
          <Button
            variant="primary"
            disabled={mode === "student" && !canTake}
            onClick={onSubmit}
          >
            {isFaculty ? "Submit Preview" : "Submit Quiz"}
          </Button>
        ) : (
          <div className="d-flex align-items-center gap-3">
            <div className="fw-semibold">
              Score: {score} / {totalPoints}
            </div>
            {(isFaculty || (mode === "student" && attemptsLeft > 0)) && (
              <Button variant="outline-secondary" onClick={onRetake}>
                {isFaculty ? "Retake Preview" : `Retake (${attemptsLeft} left)`}
              </Button>
            )}
            {isFaculty && (
              <Button
                variant="secondary"
                onClick={() =>
                  navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/Edit/Questions`)
                }
              >
                Edit Quiz
              </Button>
            )}
          </div>
        )}
      </div>

      {questions.length > 1 && (
        <div className="mt-4">
          <h5>Questions</h5>
          <ul className="mb-0">
            {questions.map((q, i) => (
              <li key={q._id}>
                <Button
                  variant="link"
                  className={`p-0 ${submitted ? (correctMap[q._id] ? "text-success" : "text-danger") : ""}`}
                  onClick={() => setIdx(i)}
                >
                  {q.title || `Question ${i + 1}`}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mode === "student" && !isFaculty && (
        <div className="mt-3 text-muted small">
          {attempts.length > 0
            ? `Last attempt on ${new Date(attempts[0].submittedAt).toLocaleString()}.`
            : "No attempts yet."}
          {" "}
          {quiz.multipleAttempts
            ? `You may attempt up to ${attemptsAllowed} time(s).`
            : "Only one attempt allowed."}
        </div>
      )}
    </div>
  );
}