import { FormControl, InputGroup, Button, Row, Col } from "react-bootstrap";
import { IoSearch } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
export default function AssignmentsControls() {
  return (
    <div id="wd-assignments-controls" className="text-nowrap">
      <Row>
        <Col>
          <InputGroup>
            <InputGroup.Text>
              <IoSearch />
            </InputGroup.Text>
            <FormControl size="lg" className="me-1 float-start" id="wd-search-assignment" placeholder="Search..." />
          </InputGroup>
        </Col>
        <Col>
          <Button variant="danger" size="lg" className="me-1 float-end" id="wd-add-assignment">
            <FaPlus className="position-relative me-2" style={{ bottom: "1px" }} />
            Assignment
          </Button>
          <Button variant="secondary" size="lg" className="me-1 float-end" id="wd-add-assignment">
            <FaPlus className="position-relative me-2" style={{ bottom: "1px" }} />
            Group
          </Button>
        </Col>
      </Row>
    </div>
  );
}