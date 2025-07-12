import { Form, FormControl, FormGroup, FormLabel, Row, Col, Card, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { addAssignment, updateAssignment } from "./reducer";

export default function AssignmentEditor() {
  const { cid, aid } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isNew = aid === "new";

  const assignments = useSelector((state: any) => state.assignmentsReducer.assignments);
  const existing = assignments.find((a: any) => a._id === aid);

  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [points, setPoints] = useState(existing?.points || 100);
  const [dueDate, setDueDate] = useState(existing?.dueDate?.slice(0, 16) || "");
  const [availableFrom, setAvailableFrom] = useState(existing?.availableFrom?.slice(0, 16) || "");
  const [availableUntil, setAvailableUntil] = useState(existing?.availableUntil?.slice(0, 16) || "");

  const handleSave = () => {
    if (isNew) {
      dispatch(addAssignment({
        title,
        description,
        points,
        dueDate,
        availableFrom,
        availableUntil,
        course: cid
      }));
    } else {
      dispatch(updateAssignment({
        _id: aid,
        title,
        description,
        points,
        dueDate,
        availableFrom,
        availableUntil,
        course: cid
      }));
    }
    navigate(-1);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Form id="wd-assignments-editor" className="p-3">
      <FormGroup as={Row} className="mb-3" controlId="wd-name">
        <FormLabel column sm={8}>Assignment Name</FormLabel>
        <Col sm={8}>
          <FormControl
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Assignment Name"
          />
        </Col>
      </FormGroup>

      <Form.Group as={Row} className="mb-3" controlId="wd-description">
        <Col sm={8}>
          <FormControl
            as="textarea"
            rows={16}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-4" controlId="wd-points">
        <Form.Label column sm={3} className="text-end">
          Points
        </Form.Label>
        <Col sm={5}>
          <Form.Control
            type="number"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-4" controlId="wd-group">
        <Form.Label column sm={3} className="text-end">
          Assignment Group
        </Form.Label>
        <Col sm={5}>
          <Form.Select defaultValue="ASSIGNMENTS">
            <option value="ASSIGNMENTS">ASSIGNMENTS</option>
            <option value="QUIZZES">QUIZZES</option>
            <option value="EXAMS">EXAMS</option>
            <option value="PROJECT">PROJECT</option>
          </Form.Select>
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-4" controlId="wd-display-grade-as">
        <Form.Label column sm={3} className="text-end">
          Display Grade as
        </Form.Label>
        <Col sm={5}>
          <Form.Select defaultValue="PERCENTAGE">
            <option value="PERCENTAGE">Percentage</option>
            <option value="RAW-SCORE">Raw Score</option>
          </Form.Select>
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-4 align-items-start" controlId="wd-submission-type">
        <Form.Label column sm={3} className="text-end pt-2">
          Submission Type
        </Form.Label>
        <Col sm={5}>
          <Card body>
            <Form.Select defaultValue="ONLINE" className="mb-3">
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </Form.Select>

            <div className="mb-2 fw-bold">Online Entry Options</div>
            <Form.Check type="checkbox" id="wd-text-entry" label="Text Entry" />
            <Form.Check type="checkbox" id="wd-website-url" label="Website URL" />
            <Form.Check type="checkbox" id="wd-media-recordings" label="Media Recordings" />
            <Form.Check type="checkbox" id="wd-student-annotation" label="Student Annotation" />
            <Form.Check type="checkbox" id="wd-file-upload" label="File Uploads" />
          </Card>
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-4 align-items-start" controlId="wd-assign-to">
        <Form.Label column sm={3} className="text-end pt-2">
          Assign
        </Form.Label>
        <Col sm={5}>
          <Card body>
            <div className="mb-2 fw-bold">Assign To</div>
            <Form.Control id="wd-assign-to" defaultValue="Everyone" className="mb-3" />

            <div className="mb-2 fw-bold">Due</div>
            <Form.Control
              type="datetime-local"
              id="wd-due-datetime"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mb-3"
            />

            <Row className="g-3">
              <Col xs={12} md={6}>
                <div className="mb-2 fw-bold">Available from</div>
                <Form.Control
                  type="datetime-local"
                  id="wd-available-from-datetime"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                />
              </Col>
              <Col xs={12} md={6}>
                <div className="mb-2 fw-bold">Until</div>
                <Form.Control
                  type="datetime-local"
                  id="wd-available-until-datetime"
                  value={availableUntil}
                  onChange={(e) => setAvailableUntil(e.target.value)}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Form.Group>

      <hr className="my-4" />

      <Row className="justify-content-end">
        <Col sm={6}>
          <Button variant="secondary" id="wd-cancel" className="me-2" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="danger" id="wd-save" onClick={handleSave}>
            Save
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
