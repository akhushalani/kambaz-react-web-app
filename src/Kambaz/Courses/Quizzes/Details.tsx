import { useEffect, useMemo, useState } from "react";
import { Button, Card, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { BsCheckCircleFill, BsSlashCircle } from "react-icons/bs";
import * as quizzesClient from "./client";

type QuizType = "GRADED_QUIZ" | "PRACTICE_QUIZ" | "GRADED_SURVEY" | "UNGRADED_SURVEY";

const TYPE_LABEL: Record<QuizType, string> = {
  GRADED_QUIZ: "Graded Quiz",
  PRACTICE_QUIZ: "Practice Quiz",
  GRADED_SURVEY: "Graded Survey",
  UNGRADED_SURVEY: "Ungraded Survey",
};

function formatDateTime(dateString?: string | null) {
  if (!dateString) return "—";
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  const date = new Date(dateString);
  return date.toLocaleString("en-US", options);
}

export default function QuizDetails() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((s: any) => s.accountReducer.currentUser);
  const isFaculty = currentUser?.role === "FACULTY";
  const isStudent = currentUser?.role === "STUDENT";

  const [quiz, setQuiz] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!qid) return;
      const q = await quizzesClient.findQuizById(qid);
      setQuiz(applyDefaults(q));
    };
    load();
  }, [qid]);

  const points = useMemo(() => {
    const list = quiz?.questions ?? [];
    return list.reduce((sum: number, it: any) => sum + (Number(it?.points) || 0), 0);
  }, [quiz]);

  if (!quiz) return null;

  const handlePublishToggle = async () => {
    if (!qid || !quiz) return;
    const prev = quiz.published;
    const next = !prev;
  
    setQuiz({ ...quiz, published: next });
    try {
      await quizzesClient.updateQuiz({ _id: qid, published: next });
    } catch (e) {
      setQuiz({ ...quiz, published: prev });
      console.error("Failed to toggle publish:", e);
    }
  };

  const typeLabel = TYPE_LABEL[(quiz.type as QuizType) ?? "GRADED_QUIZ"] ?? "Graded Quiz";

  return (
    <div id="wd-quiz-details" className="mt-3">
      <div className="d-flex justify-content-center align-items-center mb-3 gap-2">
        {isStudent && (
            <Button
            id="wd-quiz-start"
            variant="primary"
            onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/Take`)}
            >
            Start Quiz
            </Button>
        )}

        {isFaculty && (
            <>
            <Button
                id="wd-quiz-preview"
                variant="secondary"
                onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/Preview`)}
            >
                Preview
            </Button>

            <Button
                id="wd-quiz-edit"
                variant="outline-secondary"
                onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/Edit`)}
            >
                Edit
            </Button>

            <Button
                id="wd-quiz-publish-toggle"
                variant={quiz.published ? "outline-secondary" : "success"}
                onClick={handlePublishToggle}
                title={quiz.published ? "Unpublish" : "Publish"}
            >
                {quiz.published ? (
                <> <BsSlashCircle className="me-1" /> Unpublish</>
                ) : (
                <> <BsCheckCircleFill className="me-1" /> Publish</>
                )}
            </Button>
            </>
        )}
      </div>

      <Card className="border-0">
        <Card.Body className="border rounded p-4">
          <h3 className="mb-4">{quiz.title ?? "Untitled Quiz"}</h3>
          <Table borderless className="w-auto">
            <tbody>
              <tr>
                <td className="text-end pe-4 fw-semibold">Quiz Type</td>
                <td>{typeLabel}</td>
              </tr>
              <tr>
                <td className="text-end pe-4 fw-semibold">Points</td>
                <td>{points}</td>
              </tr>
              <tr>
                <td className="text-end pe-4 fw-semibold">Assignment Group</td>
                <td>{quiz.assignmentGroup}</td>
              </tr>
              <tr>
                <td className="text-end pe-4 fw-semibold">Shuffle Answers</td>
                <td>{quiz.shuffleAnswers ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td className="text-end pe-4 fw-semibold">Time Limit</td>
                <td>{quiz.timeLimit} Minutes</td>
              </tr>
              <tr>
                <td className="text-end pe-4 fw-semibold">Multiple Attempts</td>
                <td>{quiz.multipleAttempts ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td className="text-end pe-4 fw-semibold">How Many Attempts</td>
                <td>{quiz.multipleAttempts ? quiz.attemptLimit : 1}</td>
              </tr>
              <tr>
                <td className="text-end pe-4 fw-semibold">Show Correct Answers</td>
                <td>{quiz.showCorrectAnswers}</td>
              </tr>
              <tr>
                <td className="text-end pe-4 fw-semibold">Access Code</td>
                <td>{quiz.accessCode ? "••••" : "—"}</td>
              </tr>
              <tr>
                <td className="text-end pe-4 fw-semibold">One Question at a Time</td>
                <td>{quiz.oneQuestionAtATime ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td className="text-end pe-4 fw-semibold">Webcam Required</td>
                <td>{quiz.webcamRequired ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td className="text-end pe-4 fw-semibold">Lock Questions After Answering</td>
                <td>{quiz.lockAfterAnswering ? "Yes" : "No"}</td>
              </tr>
            </tbody>
          </Table>

          <Table className="mt-3">
            <thead>
              <tr>
                <th>Due</th>
                <th>For</th>
                <th>Available from</th>
                <th>Until</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{formatDateTime(quiz.dueDate)}</td>
                <td>Everyone</td>
                <td>{formatDateTime(quiz.availableFrom)}</td>
                <td>{formatDateTime(quiz.availableUntil)}</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}

function applyDefaults(q: any) {
  return {
    title: q?.title ?? "Untitled Quiz",
    type: q?.type ?? "GRADED_QUIZ",
    assignmentGroup: q?.assignmentGroup ?? "Quizzes",
    shuffleAnswers: q?.shuffleAnswers ?? true,
    timeLimit: q?.timeLimit ?? 20,
    multipleAttempts: q?.multipleAttempts ?? false,
    attemptLimit: q?.attemptLimit ?? 1,
    showCorrectAnswers: q?.showCorrectAnswers ?? "Immediately",
    accessCode: q?.accessCode ?? "",
    oneQuestionAtATime: q?.oneQuestionAtATime ?? true,
    webcamRequired: q?.webcamRequired ?? false,
    lockAfterAnswering: q?.lockAfterAnswering ?? false,
    dueDate: q?.dueDate ?? null,
    availableFrom: q?.availableFrom ?? null,
    availableUntil: q?.availableUntil ?? null,
    questions: q?.questions ?? [],
    ...q,
  };
}