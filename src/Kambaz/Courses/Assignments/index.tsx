import { ListGroup } from "react-bootstrap";
import AssignmentsControls from "./AssignmentsControls";
import { BsGripVertical } from "react-icons/bs";
import { IoMdArrowDropdown } from "react-icons/io";
import AssignmentToolbarControlButtons from "./AssignmentToolbarControlButtons";
import { LuFilePenLine } from "react-icons/lu";
import AssignmentControlButtons from "./AssignmentControlButtons";
import { useParams } from "react-router";
import * as db from "../../Database";

function formatDateTime(dateString: string) {
  const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" };
  const date = new Date(dateString);
  return date.toLocaleString("en-US", options).replace(",", " at");
}

export default function Assignments() {
  const { cid } = useParams();
  const assignments = db.assignments;
  return (
    <div id="wd-assignments">
      <AssignmentsControls /><br />
      <ListGroup className="rounded-0" id="wd-assignments-title">
        <ListGroup.Item className="wd-module p-0 mb-5 fs-5 border-gray">
          <div className="wd-title p-3 ps-2 bg-secondary"> 
            <BsGripVertical className="me-2 fs-3" /><IoMdArrowDropdown className="me-2 fs-3" />ASSIGNMENTS <AssignmentToolbarControlButtons />
          </div>
          <ListGroup className="wd-assignments rounded-0">
            {assignments
              .filter((assignment: any) => assignment.course === cid)
              .map((assignment: any) => (
            <ListGroup.Item className="wd-assignment p-3 ps-1 d-flex align-items-center">
              <BsGripVertical className="me-2 fs-3" />
              <LuFilePenLine className="me-2 fs-3" color="green" />
              <div className="d-flex flex-column flex-grow-1">
                <a className="wd-assignment-link" href={`#/Kambaz/Courses/${cid}/Assignments/${assignment._id}`}>
                  <strong>{assignment.title}</strong>
                </a>
                <div className="text-muted small" id="wd-assignment-description">
                  <span className="text-danger">Multiple Modules</span> | 
                  <strong> Not available until</strong> {formatDateTime(assignment.availableFrom)} | 
                  <strong> Due</strong> {formatDateTime(assignment.dueDate)} | 
                  <span> {assignment.points} pts</span>
                </div>
              </div>
              <AssignmentControlButtons />
            </ListGroup.Item>
          ))}</ListGroup>
        </ListGroup.Item>
      </ListGroup>
    </div>
);}
