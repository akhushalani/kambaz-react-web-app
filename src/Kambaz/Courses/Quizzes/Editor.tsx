import { Nav } from "react-bootstrap";
import { Link, Route, Routes, useLocation, useParams } from "react-router-dom";
import QuizDetailsEditor from "./DetailsEditor";
import QuizQuestionsEditor from "./QuestionsEditor";

export default function QuizEditor() {
  const { cid, qid } = useParams();
  const loc = useLocation();
  const base = `/Kambaz/Courses/${cid}/Quizzes/${qid}/Edit`;
  const onDetails = loc.pathname === base;
  const onQuestions = loc.pathname.startsWith(`${base}/Questions`);

  return (
    <div id="wd-quiz-editor" className="mt-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <Nav variant="tabs">
          <Nav.Item>
            <Nav.Link as={Link} to={base} active={onDetails} id="wd-quiz-tab-details">
              Details
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              as={Link}
              to={`${base}/Questions`}
              active={onQuestions}
              id="wd-quiz-tab-questions"
            >
              Questions
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      <Routes>
        <Route index element={<QuizDetailsEditor />} />
        <Route path="Questions" element={<QuizQuestionsEditor />} />
      </Routes>
    </div>
  );
}