import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { BsTrash } from "react-icons/bs";
import * as quizzesClient from "./client";

type QType = "MCQ" | "TRUE_FALSE" | "FILL_BLANK";

type BaseQ = {
  _id: string;
  type: QType;
  title: string;
  points: number;
  prompt: string;
};

type McqQ = BaseQ & {
  type: "MCQ";
  choices: string[];
  correctIndex: number; 
};

type TfQ = BaseQ & {
  type: "TRUE_FALSE";
  correct: boolean;
};

type FibBlank = { id: string; label: string; acceptableAnswers: string[] };

type FibQ = BaseQ & {
  type: "FILL_BLANK";
  blanks: FibBlank[];
};

type AnyQ = McqQ | TfQ | FibQ;

const TYPE_LABEL: Record<QType, string> = {
  MCQ: "Multiple Choice",
  TRUE_FALSE: "True/False",
  FILL_BLANK: "Fill in a Blank",
};

const newId = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2));

const BLANK_TOKEN_RE = /\[\[blank(?:\d+)?\]\]/gi;

function countBlankTokens(prompt: string): number {
  return (prompt.match(BLANK_TOKEN_RE) || []).length;
}

function syncBlanksWithPrompt(blanks: FibBlank[], prompt: string): FibBlank[] {
  const needed = countBlankTokens(prompt);
  if (needed === 0) {
    // If author hasn't inserted tokens, keep whatever they have
    return blanks.length ? blanks : [{ id: newId(), label: "Blank 1", acceptableAnswers: [""] }];
  }
  const next = [...blanks];
  while (next.length < needed) {
    next.push({ id: newId(), label: `Blank ${next.length + 1}`, acceptableAnswers: [""] });
  }
  while (next.length > needed) next.pop();
  return next.map((b, i) => ({ ...b, label: `Blank ${i + 1}` }));
}

export default function QuizQuestionsEditor() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [, setQuiz] = useState<any | null>(null);
  const [questions, setQuestions] = useState<AnyQ[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, AnyQ>>({}); // per-question edit buffer

  useEffect(() => {
    const load = async () => {
      if (!qid) return;
      const q = await quizzesClient.findQuizById(qid);
      setQuiz(q);
      const qs: AnyQ[] = (q?.questions || []).map(normalizeQuestion);
      setQuestions(qs);
      setLoading(false);
    };
    load();
  }, [qid]);

  const totalPoints = useMemo(
    () => questions.reduce((s, q) => s + (Number(q.points) || 0), 0),
    [questions]
  );

  if (loading) return null;

  const openEditor = (id: string) => {
    const q = questions.find((x) => x._id === id);
    if (!q) return;
    setDrafts((d) => ({ ...d, [id]: structuredClone(q) as AnyQ }));
    setEditingId(id);
  };

  const closeEditorDiscard = (id: string) => {
    // drop draft, keep original
    setDrafts((d) => {
      const { [id]: _, ...rest } = d;
      return rest;
    });
    setEditingId((cur) => (cur === id ? null : cur));
  };

  const applyDraft = (id: string) => {
    const draft = drafts[id];
    if (!draft) return;
    setQuestions((qs) => qs.map((q) => (q._id === id ? draft : q)));
    setEditingId((cur) => (cur === id ? null : cur));
  };

  const addNewQuestion = () => {
    const id = newId();
    const nextNum = questions.length + 1;
    const q: McqQ = {
      _id: id,
      type: "MCQ",
      title: `Question ${nextNum}`,
      points: 1,
      prompt: "",
      choices: ["Choice 1", "Choice 2"],
      correctIndex: 0,
    };
    setQuestions((qs) => [...qs, q]);
    setDrafts((d) => ({ ...d, [id]: structuredClone(q) }));
    setEditingId(id);
  };

  const deleteQuestion = async (id: string) => {
    const ok = window.confirm("Delete this question?");
    if (!ok) return;
  
    setQuestions((qs) => {
      const next = qs.filter((q) => q._id !== id);
      return next;
    });
  
    setDrafts((d) => {
      const { [id]: _omit, ...rest } = d;
      return rest;
    });
    setEditingId((cur) => (cur === id ? null : cur));
  };

  const changeType = (id: string, nextType: QType) => {
    setDrafts((d) => {
      const cur = d[id];
      if (!cur) return d;
      let converted: AnyQ;
      if (nextType === "MCQ") {
        converted = {
          _id: cur._id,
          type: "MCQ",
          title: cur.title,
          points: cur.points,
          prompt: cur.prompt,
          choices: ["Choice 1", "Choice 2"],
          correctIndex: 0,
        };
      } else if (nextType === "TRUE_FALSE") {
        converted = {
          _id: cur._id,
          type: "TRUE_FALSE",
          title: cur.title,
          points: cur.points,
          prompt: cur.prompt,
          correct: true,
        };
      } else {
        converted = {
          _id: cur._id,
          type: "FILL_BLANK",
          title: cur.title,
          points: cur.points,
          prompt: cur.prompt,
          blanks: [{ id: newId(), label: "Blank 1", acceptableAnswers: [""] }],
        };
      }
      return { ...d, [id]: converted };
    });
  };

  const handleSaveAll = async () => {
    if (!qid) return;
    let finalQs = questions;
    if (editingId && drafts[editingId]) {
      finalQs = questions.map((q) => (q._id === editingId ? drafts[editingId] : q));
    }
    await quizzesClient.updateQuiz({ _id: qid, questions: finalQs });
    setQuestions(finalQs);
    setEditingId(null);
    setDrafts({});
  };

  const handleCancelAll = () => {
    navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/Edit`);
  };

  return (
    <div id="wd-quiz-questions-editor" className="mt-3">
      <div className="d-flex justify-content-end align-items-center gap-3 mb-3">
        <div className="text-muted">Points {totalPoints}</div>
      </div>

      <div className="d-flex justify-content-center mb-3">
        <Button variant="outline-secondary" onClick={addNewQuestion}>
          + New Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <Alert variant="light" className="text-muted text-center">
          No questions yet. Click <strong>+ New Question</strong> to add one.
        </Alert>
      ) : null}

      <div className="d-flex flex-column gap-3">
        {questions.map((q) => {
          const isEditing = editingId === q._id;
          const draft = drafts[q._id];
          return (
            <Card key={q._id}>
              {!isEditing ? (
                <Card.Body className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-semibold">{q.title || "(Untitled question)"}</div>
                    <div className="text-muted small">
                      {TYPE_LABEL[q.type]} &middot; pts: {q.points}
                    </div>
                    <div className="mt-2">{q.prompt || <em className="text-muted">No prompt</em>}</div>
                    {q.type === "MCQ" && (
                      <ul className="mt-2 mb-0">
                        {(q as McqQ).choices.map((c, i) => (
                          <li key={i} className={i === (q as McqQ).correctIndex ? "fw-semibold" : ""}>
                            {c} {i === (q as McqQ).correctIndex ? "(correct)" : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                    {q.type === "TRUE_FALSE" && (
                      <div className="mt-2">Correct answer: {(q as TfQ).correct ? "True" : "False"}</div>
                    )}
                    {q.type === "FILL_BLANK" && (
                      <div className="mt-2">
                        <div className="mb-1">Acceptable answer(s):</div>

                        {Array.isArray((q as FibQ).blanks) && (q as FibQ).blanks.length > 0 ? (
                          <ul className="mb-0">
                            {(q as FibQ).blanks.map((b, i) => {
                              const answers = (b.acceptableAnswers || [])
                                .map((s) => s.trim())
                                .filter(Boolean);
                              return (
                                <li key={b.id || i}>
                                  {(b.label || `Blank ${i + 1}`)}: {answers.length ? answers.join(", ") : "—"}
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <span>
                            {(((q as any).acceptableAnswers as string[]) || [])
                              .map((x) => x.trim())
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <Button variant="outline-secondary" onClick={() => openEditor(q._id)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      className="ms-2"
                      onClick={() => deleteQuestion(q._id)}
                    >
                      <BsTrash className="me-1" /> Delete
                    </Button>
                  </div>
                </Card.Body>
              ) : (
                <Card.Body>
                  <Row className="g-2 align-items-center mb-2">
                    <Col md={6}>
                      <InputGroup>
                        <InputGroup.Text>Title</InputGroup.Text>
                        <Form.Control
                          value={draft.title}
                          onChange={(e) =>
                            setDrafts((d) => ({ ...d, [q._id]: { ...draft, title: e.target.value } as AnyQ }))
                          }
                        />
                      </InputGroup>
                    </Col>
                    <Col md="auto" className="ms-auto">
                      <div className="d-flex align-items-center gap-3">
                        <Form.Select
                          value={draft.type}
                          onChange={(e) => changeType(q._id, e.target.value as QType)}
                        >
                          <option value="MCQ">Multiple Choice</option>
                          <option value="TRUE_FALSE">True/False</option>
                          <option value="FILL_BLANK">Fill in a Blank</option>
                        </Form.Select>
                        <InputGroup style={{ minWidth: 60 }}>
                          <InputGroup.Text>pts:</InputGroup.Text>
                          <Form.Control
                            type="number"
                            min={0}
                            value={draft.points}
                            onChange={(e) =>
                              setDrafts((d) => ({
                                ...d,
                                [q._id]: { ...draft, points: Number(e.target.value) } as AnyQ,
                              }))
                            }
                          />
                        </InputGroup>
                      </div>
                    </Col>
                  </Row>

                  {draft.type === "MCQ" && (
                    <div className="text-muted small mb-2">
                        Enter your question and multiple answers, then select the one correct answer.
                    </div>
                  )}
                  {draft.type === "TRUE_FALSE" && (
                    <div className="text-muted small mb-2">
                        Enter your question text, the select if True or False is the correct answer.
                    </div>
                  )}
                  {draft.type === "FILL_BLANK" && (
                    <div className="text-muted small mb-2">
                        Enter your question text, then define all possible correct answers for the blank.
                        Students will see the question followed by a small text box to type their answer.
                    </div>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Question:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Type the question prompt…"
                      value={draft.prompt}
                      onChange={(e) => {
                        const newPrompt = e.target.value;
                        if (draft.type === "FILL_BLANK") {
                          const fib = draft as FibQ;
                          const synced = syncBlanksWithPrompt(fib.blanks, newPrompt);
                          setDrafts((d) => ({ ...d, [q._id]: { ...fib, prompt: newPrompt, blanks: synced } }));
                        } else {
                          setDrafts((d) => ({ ...d, [q._id]: { ...draft, prompt: newPrompt } as AnyQ }));
                        }
                      }}
                    />
                    {draft.type === "FILL_BLANK" && (
                      <div className="mt-1">
                        <Button
                          size="sm"
                          variant="link"
                          className="p-0"
                          onClick={() => {
                            const token = (draft.prompt?.endsWith(" ") ? "" : " ") + "[[blank]] ";
                            const newPrompt = (draft.prompt || "") + token;
                            const fib = draft as FibQ;
                            const synced = syncBlanksWithPrompt(fib.blanks, newPrompt);
                            setDrafts((d) => ({ ...d, [q._id]: { ...fib, prompt: newPrompt, blanks: synced } }));
                          }}
                        >
                          + Insert Blank
                        </Button>
                      </div>
                    )}
                  </Form.Group>

                  {/* TYPE-SPECIFIC EDITORS */}
                  {draft.type === "MCQ" && (
                    <MultipleChoiceEditor
                      q={draft as McqQ}
                      onChange={(next) => setDrafts((d) => ({ ...d, [q._id]: next }))}
                    />
                  )}
                  {draft.type === "TRUE_FALSE" && (
                    <TrueFalseEditor
                      q={draft as TfQ}
                      onChange={(next) => setDrafts((d) => ({ ...d, [q._id]: next }))}
                    />
                  )}
                  {draft.type === "FILL_BLANK" && (
                    <FillBlankEditor
                      q={draft as FibQ}
                      onChange={(next) => setDrafts((d) => ({ ...d, [q._id]: next }))}
                    />
                  )}

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button variant="outline-secondary" onClick={() => closeEditorDiscard(q._id)}>
                      Cancel
                    </Button>
                    <Button variant="outline-danger" onClick={() => deleteQuestion(q._id)}>
                      <BsTrash className="me-1" /> Delete Question
                    </Button>
                    <Button variant="danger" onClick={() => applyDraft(q._id)}>
                      Update Question
                    </Button>
                  </div>
                </Card.Body>
              )}
            </Card>
          );
        })}
      </div>

      {/* Footer: screen-level actions */}
      <hr className="my-4" />
      <div className="d-flex justify-content-end gap-2">
        <Button variant="outline-secondary" onClick={handleCancelAll}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleSaveAll}>
          Save
        </Button>
      </div>
    </div>
  );
}

/* ---------- Editors ---------- */

function MultipleChoiceEditor({
  q,
  onChange,
}: {
  q: McqQ;
  onChange: (next: McqQ) => void;
}) {
  const setChoice = (idx: number, val: string) =>
    onChange({ ...q, choices: q.choices.map((c, i) => (i === idx ? val : c)) });

  const addChoice = () => onChange({ ...q, choices: [...q.choices, "New choice"] });

  const removeChoice = (idx: number) => {
    const nextChoices = q.choices.filter((_, i) => i !== idx);
    let nextCorrect = q.correctIndex;
    if (idx === q.correctIndex) nextCorrect = 0;
    else if (idx < q.correctIndex) nextCorrect = q.correctIndex - 1;
    onChange({ ...q, choices: nextChoices, correctIndex: Math.max(0, nextCorrect) });
  };

  return (
    <div>
      <div className="fw-semibold mb-2">Answers:</div>
      <div className="d-flex flex-column gap-2">
        {q.choices.map((c, i) => (
          <InputGroup key={i}>
            <InputGroup.Radio
              checked={q.correctIndex === i}
              onChange={() => onChange({ ...q, correctIndex: i })}
              aria-label={`Mark choice ${i + 1} as correct`}
            />
            <Form.Control value={c} onChange={(e) => setChoice(i, e.target.value)} />
            <Button
              variant="outline-secondary"
              onClick={() => removeChoice(i)}
              disabled={q.choices.length <= 2}
              title="Remove choice"
            >
              🗑
            </Button>
          </InputGroup>
        ))}
      </div>
      <div className="mt-2">
        <Button size="sm" variant="link" onClick={addChoice}>
          + Add Another Answer
        </Button>
      </div>
    </div>
  );
}

function TrueFalseEditor({ q, onChange }: { q: TfQ; onChange: (next: TfQ) => void }) {
  return (
    <div>
      <div className="fw-semibold mb-2">Correct Answer:</div>
      <div className="d-flex gap-4">
        <Form.Check
          type="radio"
          inline
          id="tf-true"
          label="True"
          checked={q.correct === true}
          onChange={() => onChange({ ...q, correct: true })}
        />
        <Form.Check
          type="radio"
          inline
          id="tf-false"
          label="False"
          checked={q.correct === false}
          onChange={() => onChange({ ...q, correct: false })}
        />
      </div>
    </div>
  );
}

function FillBlankEditor({
  q,
  onChange,
}: {
  q: FibQ;
  onChange: (next: FibQ) => void;
}) {
  const setAnswer = (blankIdx: number, ansIdx: number, val: string) => {
    const blanks = q.blanks.map((b, i) =>
      i === blankIdx
        ? { ...b, acceptableAnswers: b.acceptableAnswers.map((a, j) => (j === ansIdx ? val : a)) }
        : b
    );
    onChange({ ...q, blanks });
  };

  const addAnswer = (blankIdx: number) => {
    const blanks = q.blanks.map((b, i) =>
      i === blankIdx ? { ...b, acceptableAnswers: [...b.acceptableAnswers, ""] } : b
    );
    onChange({ ...q, blanks });
  };

  const removeAnswer = (blankIdx: number, ansIdx: number) => {
    const blanks = q.blanks.map((b, i) => {
      if (i !== blankIdx) return b;
      if (b.acceptableAnswers.length <= 1) return b; // keep at least one row
      return {
        ...b,
        acceptableAnswers: b.acceptableAnswers.filter((_, j) => j !== ansIdx),
      };
    });
    onChange({ ...q, blanks });
  };

  return (
    <div>
      <div className="text-muted small mb-2">
        Use <code>[[blank]]</code> in the prompt for each blank. This panel syncs automatically.
      </div>

      {q.blanks.map((b, i) => (
        <div key={b.id} className="mb-3">
          <div className="fw-semibold mb-2">{b.label}</div>

          <div className="d-flex flex-column gap-2">
            {b.acceptableAnswers.map((ans, j) => (
              <div key={j} className="d-flex align-items-center gap-2">
                <div className="text-muted" style={{ minWidth: 130 }}>
                  Possible Answer:
                </div>
                <div className="flex-grow-1">
                  <Form.Control
                    value={ans}
                    placeholder={j === 0 ? "2" : j === 1 ? "two" : ""}
                    onChange={(e) => setAnswer(i, j, e.target.value)}
                  />
                </div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  title="Remove answer"
                  onClick={() => removeAnswer(i, j)}
                  disabled={b.acceptableAnswers.length <= 1}
                >
                  <BsTrash />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-2">
            <Button
              size="sm"
              variant="link"
              className="text-danger p-0"
              onClick={() => addAnswer(i)}
            >
              + Add Another Answer
            </Button>
          </div>

          {i < q.blanks.length - 1 && <hr className="mt-3 mb-2" />}
        </div>
      ))}
    </div>
  );
}

function normalizeQuestion(raw: any): AnyQ {
  const base: BaseQ = {
    _id: raw?._id ?? newId(),
    type: (raw?.type as QType) ?? "MCQ",
    title: raw?.title ?? "Untitled Question",
    points: Number(raw?.points ?? 1),
    prompt: raw?.prompt ?? "",
  };

  if (base.type === "TRUE_FALSE") {
    return {
      ...(base as TfQ),
      type: "TRUE_FALSE",
      correct: !!raw?.correct,
    };
  }
  if (base.type === "FILL_BLANK") {
    // Back-compat: accept old { acceptableAnswers: [...] } shape
    let blanks: FibBlank[] = [];
    if (Array.isArray(raw?.blanks) && raw.blanks.length) {
      blanks = raw.blanks.map((b: any, i: number) => ({
        id: b?.id ?? newId(),
        label: b?.label ?? `Blank ${i + 1}`,
        acceptableAnswers: Array.isArray(b?.acceptableAnswers) ? b.acceptableAnswers : [""],
      }));
    } else if (Array.isArray(raw?.acceptableAnswers)) {
      blanks = [{ id: newId(), label: "Blank 1", acceptableAnswers: raw.acceptableAnswers }];
    } else {
      blanks = [{ id: newId(), label: "Blank 1", acceptableAnswers: [""] }];
    }
  
    return {
      ...(base as FibQ),
      type: "FILL_BLANK",
      blanks: syncBlanksWithPrompt(blanks, base.prompt),
    };
  }
  // default MCQ
  const choices =
    Array.isArray(raw?.choices) && raw.choices.length >= 2
      ? raw.choices
      : ["Choice 1", "Choice 2"];
  const correctIndex =
    typeof raw?.correctIndex === "number" && raw.correctIndex >= 0 && raw.correctIndex < choices.length
      ? raw.correctIndex
      : 0;
  return {
    ...(base as McqQ),
    type: "MCQ",
    choices,
    correctIndex,
  };
}
