import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { BsCheckCircleFill, BsSlashCircle } from "react-icons/bs";
import * as quizzesClient from "./client";

type QuizType = "GRADED_QUIZ" | "PRACTICE_QUIZ" | "GRADED_SURVEY" | "UNGRADED_SURVEY";

const GROUPS = ["Quizzes", "Exams", "Assignments", "Project"];

function toLocalDT(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}
function toISOFromLocal(local: string) {
  if (!local) return null;
  const d = new Date(local);
  return d.toISOString();
}

export default function QuizDetailsEditor() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    type: "GRADED_QUIZ" as QuizType,
    assignmentGroup: "Quizzes",
    shuffleAnswers: true,
    timeLimit: 20,
    multipleAttempts: false,
    attemptLimit: 1,
    showCorrectAnswers: "Immediately",
    accessCode: "",
    oneQuestionAtATime: true,
    webcamRequired: false,
    lockAfterAnswering: false,
    dueDate: null as string | null,
    availableFrom: null as string | null,
    availableUntil: null as string | null,
    questions: [] as any[],
    published: false,
  });

  useEffect(() => {
    const load = async () => {
      if (!qid) return;
      const q = await quizzesClient.findQuizById(qid);
      setForm({
        title: q?.title ?? "Untitled Quiz",
        description: q?.description ?? "",
        type: (q?.type ?? "GRADED_QUIZ") as QuizType,
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
        published: q?.published ?? false,
      });
      setLoading(false);
    };
    load();
  }, [qid]);

  const points = useMemo(
    () => (form.questions || []).reduce((s: number, it: any) => s + (Number(it?.points) || 0), 0),
    [form.questions]
  );

  const onChange = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async (patch: any) => {
    if (!qid) return;
    await quizzesClient.updateQuiz({ _id: qid, ...patch });
  };

  const handleSave = async () => {
    await save({
      ...form,
      dueDate: form.dueDate,
      availableFrom: form.availableFrom,
      availableUntil: form.availableUntil,
    });
    navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}`);
  };

  const handleSavePublish = async () => {
    await save({
      ...form,
      published: true,
    });
    navigate(`/Kambaz/Courses/${cid}/Quizzes`); // list
  };

  const handleCancel = () => {
    navigate(`/Kambaz/Courses/${cid}/Quizzes`);
  };

  if (loading) return null;

  return (
    <div id="wd-quiz-details-editor">
      <div className="d-flex justify-content-end align-items-center gap-3 mb-2">
        <div className="text-muted">Points {points}</div>
        <div className="text-muted">
          {form.published ? (
            <>
              Published <BsCheckCircleFill className="text-success me-1" />
            </>
          ) : (
            <>
              Not Published <BsSlashCircle className="text-danger me-1" />
            </>
          )}
        </div>
      </div>

      <Card className="border-0">
        <Card.Body className="border rounded p-4">
          {/* Title */}
          <Form.Group className="mb-3" controlId="wd-quiz-title">
            <Form.Control
              type="text"
              placeholder="Unnamed Quiz"
              value={form.title}
              onChange={(e) => onChange("title", e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="wd-quiz-description">
            <Form.Label className="fw-semibold">Quiz Instructions:</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              placeholder="Type instructions..."
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="wd-quiz-type">
                <Form.Label className="fw-semibold">Quiz Type</Form.Label>
                <Form.Select
                  value={form.type}
                  onChange={(e) => onChange("type", e.target.value as QuizType)}
                >
                  <option value="GRADED_QUIZ">Graded Quiz</option>
                  <option value="PRACTICE_QUIZ">Practice Quiz</option>
                  <option value="GRADED_SURVEY">Graded Survey</option>
                  <option value="UNGRADED_SURVEY">Ungraded Survey</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="wd-quiz-group">
                <Form.Label className="fw-semibold">Assignment Group</Form.Label>
                <Form.Select
                  value={form.assignmentGroup}
                  onChange={(e) => onChange("assignmentGroup", e.target.value)}
                >
                  {GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g.toUpperCase()}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="mb-3">
            <div className="fw-semibold mb-2">Options</div>

            <Form.Check
              className="mb-2"
              type="checkbox"
              id="wd-quiz-shuffle"
              label="Shuffle Answers"
              checked={!!form.shuffleAnswers}
              onChange={(e) => onChange("shuffleAnswers", e.target.checked)}
            />

            <InputGroup className="mb-2" hasValidation>
              <InputGroup.Checkbox
                id="wd-quiz-has-time-limit"
                checked={form.timeLimit !== null && form.timeLimit !== undefined}
                onChange={(e) =>
                  onChange("timeLimit", e.target.checked ? (form.timeLimit ?? 20) : 0)
                }
              />
              <InputGroup.Text>Time Limit</InputGroup.Text>
              <Form.Control
                type="number"
                min={0}
                value={form.timeLimit ?? 0}
                onChange={(e) => onChange("timeLimit", Number(e.target.value))}
              />
              <InputGroup.Text>Minutes</InputGroup.Text>
            </InputGroup>

            <Form.Check
              className="mb-2"
              type="checkbox"
              id="wd-quiz-multiple-attempts"
              label="Allow Multiple Attempts"
              checked={!!form.multipleAttempts}
              onChange={(e) => onChange("multipleAttempts", e.target.checked)}
            />

            {form.multipleAttempts && (
              <InputGroup className="mb-2">
                <InputGroup.Text>Max Attempts</InputGroup.Text>
                <Form.Control
                  type="number"
                  min={1}
                  value={form.attemptLimit ?? 1}
                  onChange={(e) => onChange("attemptLimit", Number(e.target.value))}
                />
              </InputGroup>
            )}

            <Form.Group className="mb-2" controlId="wd-quiz-show-correct">
              <Form.Label>Show Correct Answers</Form.Label>
              <Form.Select
                value={form.showCorrectAnswers}
                onChange={(e) => onChange("showCorrectAnswers", e.target.value)}
              >
                <option>Immediately</option>
                <option>After Due Date</option>
                <option>After Last Attempt</option>
                <option>Never</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2" controlId="wd-quiz-access-code">
              <Form.Label>Access Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="(optional)"
                value={form.accessCode ?? ""}
                onChange={(e) => onChange("accessCode", e.target.value)}
              />
            </Form.Group>

            <Form.Check
              className="mb-2"
              type="checkbox"
              id="wd-quiz-one-q"
              label="One Question at a Time"
              checked={!!form.oneQuestionAtATime}
              onChange={(e) => onChange("oneQuestionAtATime", e.target.checked)}
            />

            <Form.Check
              className="mb-2"
              type="checkbox"
              id="wd-quiz-webcam"
              label="Webcam Required"
              checked={!!form.webcamRequired}
              onChange={(e) => onChange("webcamRequired", e.target.checked)}
            />

            <Form.Check
              className="mb-2"
              type="checkbox"
              id="wd-quiz-lock-after"
              label="Lock Questions After Answering"
              checked={!!form.lockAfterAnswering}
              onChange={(e) => onChange("lockAfterAnswering", e.target.checked)}
            />
          </div>

          <Row className="mt-4">
            <Col md={12} lg={10} xl={8}>
              <Card className="mb-3">
                <Card.Body>
                  <div className="fw-semibold mb-2">Assign</div>
                  {/* Assigned to — ignored per spec */}
                  <Form.Group className="mb-3">
                    <Form.Label>Assign to</Form.Label>
                    <Form.Control value="Everyone" disabled readOnly />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="wd-quiz-due">
                        <Form.Label>Due</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          value={toLocalDT(form.dueDate)}
                          onChange={(e) => onChange("dueDate", toISOFromLocal(e.target.value))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}></Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="wd-quiz-available-from">
                        <Form.Label>Available from</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          value={toLocalDT(form.availableFrom)}
                          onChange={(e) => onChange("availableFrom", toISOFromLocal(e.target.value))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="wd-quiz-until">
                        <Form.Label>Until</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          value={toLocalDT(form.availableUntil)}
                          onChange={(e) => onChange("availableUntil", toISOFromLocal(e.target.value))}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 pt-3">
            <Button variant="outline-secondary" onClick={handleCancel} id="wd-quiz-cancel">
              Cancel
            </Button>
            <Button variant="success" onClick={handleSavePublish} id="wd-quiz-save-publish">
              Save & Publish
            </Button>
            <Button variant="danger" onClick={handleSave} id="wd-quiz-save">
              Save
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}