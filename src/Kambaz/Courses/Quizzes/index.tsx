import { ListGroup, Button, Dropdown, FormControl, InputGroup } from "react-bootstrap";
import { BsGripVertical, BsThreeDotsVertical, BsCheckCircleFill, BsSlashCircle } from "react-icons/bs";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { LuFilePenLine } from "react-icons/lu";
import { useParams, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import * as attemptsClient from "./attemptsClient";
import * as quizzesClient from "./client"; 

function formatDateTime(dateString?: string) {
  if (!dateString) return "—";
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  const date = new Date(dateString);
  return date.toLocaleString("en-US", options).replace(",", " at");
}

function availabilityLabel(now: Date, from?: string, until?: string) {
  const fromDate = from ? new Date(from) : undefined;
  const untilDate = until ? new Date(until) : undefined;

  if (fromDate && now < fromDate) {
    return `Not available until ${formatDateTime(from)}`;
  }
  if (untilDate && now > untilDate) {
    return "Closed";
  }
  if ((fromDate && now >= fromDate) || (!fromDate && (!untilDate || now <= untilDate))) {
    return "Available";
  }
  return "Available";
}

export default function Quizzes() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "dueDate" | "availableDate" | null>(null);
  const [search, setSearch] = useState("");
  const [lastScores, setLastScores] = useState<Record<string, number | null>>({});

  const currentUser = useSelector((state: any) => state.accountReducer.currentUser);
  const isFaculty = currentUser?.role === "FACULTY";
  const isStudent = currentUser?.role === "STUDENT";

  const fetchQuizzes = async () => {
    if (!cid) return;
    const data = await quizzesClient.findQuizzesForCourse(cid);
    setQuizzes(data || []);
  };

  useEffect(() => {
    fetchQuizzes();
  }, [cid]);

  useEffect(() => {
    const loadScores = async () => {
      if (!isStudent || !currentUser?._id || quizzes.length === 0) return;
      const entries = await Promise.all(
        quizzes.map(async (q: any) => {
          try {
            const attempts = await attemptsClient.findAttemptsForStudent(q._id, currentUser._id);
            const latest = attempts?.[0]?.score;   // newest-first per our API
            return [q._id, typeof latest === "number" ? latest : null] as const;
          } catch {
            return [q._id, null] as const;
          }
        })
      );
      const map: Record<string, number | null> = {};
      entries.forEach(([id, score]) => { map[id] = score; });
      setLastScores(map);
    };
    loadScores();
  }, [isStudent, currentUser?._id, quizzes]);

  const handleAddQuiz = async () => {
    if (!cid) return;
    const now = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
  

    const q = await quizzesClient.createQuiz(cid, {
      title: "New Quiz",
      published: false,
      type: "GRADED_QUIZ",
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
      availableFrom: now.toISOString(),
      availableUntil: new Date(now.getTime() + oneWeek).toISOString(),
      dueDate: new Date(now.getTime() + oneWeek).toISOString(),
      questions: [],
    });
  
    navigate(`/Kambaz/Courses/${cid}/Quizzes/${q._id}/Edit`);
  };

  const handleDelete = async (quizId: string) => {
    const ok = window.confirm("Delete this quiz?");
    if (!ok) return;
    await quizzesClient.deleteQuiz(quizId);
    fetchQuizzes();
  };

  const handlePublishToggle = async (quiz: any) => {
    const updated = { ...quiz, published: !quiz.published };
    await quizzesClient.updateQuiz(updated);
    fetchQuizzes();
  };

  const handleCopy = async (quizId: string) => {
    const toCourseId = window.prompt("Copy to course ID:");
    if (!toCourseId) return;
    await quizzesClient.copyQuiz(quizId, toCourseId);
  };

  const handleSort = (key: "name" | "dueDate" | "availableDate") => setSortBy(key);

  const now = new Date();

  const filtered = quizzes.filter((q) =>
    (q.title || "").toLowerCase().includes(search.trim().toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => {
    if (!sortBy) return 0;
    if (sortBy === "name") return (a.title || "").localeCompare(b.title || "");
    if (sortBy === "dueDate")
      return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
    return new Date(a.availableFrom || 0).getTime() - new Date(b.availableFrom || 0).getTime();
  });

  return (
    <div id="wd-quizzes">
      <div className="d-flex justify-content-between align-items-center mb-3">
      <InputGroup style={{ maxWidth: 420 }}>
        <InputGroup.Text
          className="bg-transparent">
          <IoSearch />
        </InputGroup.Text>
        <FormControl
          size="lg"
          id="wd-search-quiz"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

        {isFaculty && (
          <div className="d-flex gap-2 align-items-stretch">
            <Dropdown align="end">
              <Dropdown.Toggle id="wd-sort-dropdown" variant="outline-secondary" className="py-2">
                Sort {sortBy ? `(${sortBy})` : ""}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleSort("name")}>By name</Dropdown.Item>
                <Dropdown.Item onClick={() => handleSort("dueDate")}>By due date</Dropdown.Item>
                <Dropdown.Item onClick={() => handleSort("availableDate")}>By available date</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Button id="wd-add-quiz-btn" onClick={handleAddQuiz} variant="danger" className="py-2">
              + Quiz
            </Button>
          </div>
        )}
      </div>

      <ListGroup className="rounded-0" id="wd-quizzes-title">
        <ListGroup.Item className="wd-module p-0 mb-5 fs-5 border-gray">
          <div className="wd-title p-3 ps-2 bg-secondary">
            <BsGripVertical className="me-2 fs-3" />
            <IoMdArrowDropdown className="me-2 fs-3" />
            QUIZZES
          </div>

          {sorted.length === 0 && (
            <div className="p-4 text-muted" id="wd-quizzes-empty">
              No quizzes {search ? "match your search." : "yet."}{" "}
              {(!search && isFaculty) ? "Click “+ Quiz” to add your first quiz." : ""}
            </div>
          )}

          <ListGroup className="rounded-0">
            {sorted.map((quiz: any) => {
              const avail = availabilityLabel(now, quiz.availableFrom, quiz.availableUntil);
              const due = formatDateTime(quiz.dueDate);
              const pts = quiz.points ?? 0;
              const qcount = quiz.questionCount ?? 0;

              return (
                <ListGroup.Item key={quiz._id} className="wd-quiz p-3 ps-1 d-flex align-items-center">
                  <BsGripVertical className="me-2 fs-3" />
                  <LuFilePenLine className="me-2 fs-3" color={quiz.published ? "green" : "gray"} />

                  <div className="d-flex flex-column flex-grow-1">
                    <a
                      className="wd-quiz-link text-dark text-decoration-none fw-bold"
                      href={`#/Kambaz/Courses/${cid}/Quizzes/${quiz._id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}`);
                      }}
                    >
                      <strong>{quiz.title}</strong>
                    </a>
                    <div className="text-muted small" id="wd-quiz-description">
                      <span className={avail === "Closed" ? "text-danger" : "text-success"}>{avail}</span>
                      {" | "}
                      <strong>Due</strong> {due} {" | "}
                      <span>{pts} pts</span> {" | "}
                      <span>{qcount} questions</span>
                      {isStudent && (
                        <>
                          {" | "}
                          <span>
                            {typeof lastScores[quiz._id] === "number" ? lastScores[quiz._id] : "-"} / {pts}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {isFaculty && (
                    <Button
                      variant="link"
                      className="me-2 fs-5 text-decoration-none"
                      title={quiz.published ? "Unpublish" : "Publish"}
                      onClick={() => handlePublishToggle(quiz)}
                    >
                      {quiz.published ? (
                        <BsCheckCircleFill className="text-success" />
                      ) : (
                        <BsSlashCircle className="text-danger" />
                      )}
                    </Button>
                  )}

                  {isFaculty && (
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        <BsThreeDotsVertical />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/Edit`)}>
                          Edit
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleDelete(quiz._id)} className="text-danger">
                          Delete
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handlePublishToggle(quiz)}>
                          {quiz.published ? "Unpublish" : "Publish"}
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => handleCopy(quiz._id)}>Copy…</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </ListGroup.Item>
      </ListGroup>
    </div>
  );
}