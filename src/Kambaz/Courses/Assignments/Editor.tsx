import { Form, FormControl, FormGroup, FormLabel, Row, Col, Card, Button } from "react-bootstrap";
export default function AssignmentEditor() {
  return (
    <Form id="wd-assignments-editor" className="p-3">
      <FormGroup as={Row} className="mb-3" controlId="wd-name">
        <FormLabel column sm={8}>Assignment Name</FormLabel>
        <Col sm={8}>
          <FormControl />
        </Col>
      </FormGroup>
      <Form.Group as={Row} className="mb-3" controlId="wd-description">
        <Col sm={8}>
          <FormControl as="textarea" rows={16} />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-4" controlId="wd-points">
        <Form.Label column sm={3} className="text-end">
          Points
        </Form.Label>
        <Col sm={4}>
          <Form.Control type="number" defaultValue={100} />
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mb-4" controlId="wd-group">
        <Form.Label column sm={3} className="text-end">
          Assignment Group
        </Form.Label>
        <Col sm={4}>
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
        <Col sm={4}>
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
        <Col sm={4}>
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
        <Col sm={4}>
          <Card body>
            <div className="mb-2 fw-bold">Assign To</div>
            <Form.Control id="wd-assign-to" defaultValue="Everyone" className="mb-3" />

            <div className="mb-2 fw-bold">Due</div>
            <Form.Control type="date" id="wd-due-date" defaultValue="2025-05-13" className="mb-3" />

            <Row>
              <Col>
                <div className="mb-2 fw-bold">Available from</div>
                <Form.Control type="date" id="wd-available-from" defaultValue="2025-05-06" />
              </Col>
              <Col>
                <div className="mb-2 fw-bold">Until</div>
                <Form.Control type="date" id="wd-available-until" defaultValue="2025-05-20" />
              </Col>
            </Row>
          </Card>
        </Col>
      </Form.Group>
      <hr className="my-4" />
      <Row className="justify-content-end">
        <Col sm={6}>
          <Button variant="secondary" id="wd-cancel" className="me-2">
            Cancel
          </Button>
          <Button variant="danger" id="wd-save">
            Save
          </Button>
        </Col>
      </Row>
    </Form>
);}
