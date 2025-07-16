import { Form, FormControl, FormGroup, FormLabel, Row, Col, Card, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import * as assignmentsClient from "./client";
import * as coursesClient from "../client";

export default function AssignmentEditor() {
  const { cid, aid } = useParams();
  const navigate = useNavigate();
  const isNew = aid === "new";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(100);
  const [dueDate, setDueDate] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");

  useEffect(() => {
    const loadAssignment = async () => {
      if (!isNew && cid) {
        try {
          const assignments = await coursesClient.findAssignmentsForCourse(cid);
          const existing = assignments.find((a: any) => a._id === aid);
          if (existing) {
            setTitle(existing.title || "");
            setDescription(existing.description || "");
            setPoints(existing.points || 100);
            setDueDate(existing.dueDate?.slice(0, 16) || "");
            setAvailableFrom(existing.availableFrom?.slice(0, 16) || "");
            setAvailableUntil(existing.availableUntil?.slice(0, 16) || "");
          }
        } catch (err) {
          console.error("Error loading assignment:", err);
        }
      }
    };

    loadAssignment();
  }, [isNew, aid, cid]);

  const handleSave = async () => {
    const assignmentData = {
      title,
      description,
      points,
      dueDate,
      availableFrom,
      availableUntil,
      course: cid,
    };
  
    try {
      if (isNew) {
        await assignmentsClient.createAssignment(assignmentData);
      } else {
        await assignmentsClient.updateAssignment({ ...assignmentData, _id: aid });
      }
      navigate(-1);
    } catch (err) {
      console.error("Error saving assignment:", err);
    }
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
            <Form.Control defaultValue="Everyone" className="mb-3" />

            <div className="mb-2 fw-bold">Due</div>
            <Form.Control
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mb-3"
            />

            <Row className="g-3">
              <Col xs={12} md={6}>
                <div className="mb-2 fw-bold">Available from</div>
                <Form.Control
                  type="datetime-local"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                />
              </Col>
              <Col xs={12} md={6}>
                <div className="mb-2 fw-bold">Until</div>
                <Form.Control
                  type="datetime-local"
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
          <Button variant="secondary" className="me-2" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSave}>
            Save
          </Button>
        </Col>
      </Row>
    </Form>
  );
}
