import { ListGroup } from "react-bootstrap";
import AssignmentsControls from "./AssignmentsControls";
import { BsGripVertical } from "react-icons/bs";
import { IoMdArrowDropdown } from "react-icons/io";
import AssignmentToolbarControlButtons from "./AssignmentToolbarControlButtons";
import { LuFilePenLine } from "react-icons/lu";
import AssignmentControlButtons from "./AssignmentControlButtons";
export default function Assignments() {
  return (
    <div id="wd-assignments">
      <AssignmentsControls /><br />
      <ListGroup className="rounded-0" id="wd-assignments-title">
        <ListGroup.Item className="wd-module p-0 mb-5 fs-5 border-gray">
          <div className="wd-title p-3 ps-2 bg-secondary"> 
            <BsGripVertical className="me-2 fs-3" /><IoMdArrowDropdown className="me-2 fs-3" />ASSIGNMENTS <AssignmentToolbarControlButtons />
          </div>
          <ListGroup className="wd-assignments rounded-0">
            <ListGroup.Item className="wd-assignment p-3 ps-1 d-flex align-items-center">
              <BsGripVertical className="me-2 fs-3" />
              <LuFilePenLine className="me-2 fs-3" color="green" />
              <div className="d-flex flex-column flex-grow-1">
                <a className="wd-assignment-link" href="#/Kambaz/Courses/1234/Assignments/123">
                  <strong>A1</strong>
                </a>
                <div className="text-muted small" id="wd-assignment-description">
                  <span className="text-danger">Multiple Modules</span> | 
                  <strong> Not available until</strong> May 6 at 12:00am | 
                  <strong> Due</strong> May 13 at 11:59pm | 
                  100 pts
                </div>
              </div>
              <AssignmentControlButtons />
            </ListGroup.Item>
            <ListGroup.Item className="wd-assignment p-3 ps-1 d-flex align-items-center">
              <BsGripVertical className="me-2 fs-3" />
              <LuFilePenLine className="me-2 fs-3" color="green" />
              <div className="d-flex flex-column flex-grow-1">
                <a className="wd-assignment-link" href="#/Kambaz/Courses/1234/Assignments/234">
                  <strong>A2</strong>
                </a>
                <div className="text-muted small" id="wd-assignment-description">
                  <span className="text-danger">Multiple Modules</span> | 
                  <strong> Not available until</strong> May 13 at 12:00am | 
                  <strong> Due</strong> May 20 at 11:59pm | 
                  100 pts
                </div>
              </div>
              <AssignmentControlButtons />
            </ListGroup.Item>
            <ListGroup.Item className="wd-assignment p-3 ps-1 d-flex align-items-center">
              <BsGripVertical className="me-2 fs-3" />
              <LuFilePenLine className="me-2 fs-3" color="green" />
              <div className="d-flex flex-column flex-grow-1">
                <a className="wd-assignment-link" href="#/Kambaz/Courses/1234/Assignments/123">
                  <strong>A3</strong>
                </a>
                <div className="text-muted small" id="wd-assignment-description">
                  <span className="text-danger">Multiple Modules</span> | 
                  <strong> Not available until</strong> May 20 at 12:00am | 
                  <strong> Due</strong> May 27 at 11:59pm | 
                  100 pts
                </div>
              </div>
              <AssignmentControlButtons />
            </ListGroup.Item>
          </ListGroup>
        </ListGroup.Item>
      </ListGroup>
    </div>
);}
