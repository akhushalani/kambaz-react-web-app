import { FormControl, InputGroup, Button, Row, Col } from "react-bootstrap";
import { IoSearch } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
export default function AssignmentsControls() {
  const navigate = useNavigate();
  const { cid } = useParams();
  const handleAddAssignment = () => {
    navigate(`/Kambaz/Courses/${cid}/Assignments/new`);
  };
  const currentUser = useSelector((state: any) => state.accountReducer.currentUser);
  const isFaculty = currentUser?.role === "FACULTY";
  return (
    <div id="wd-assignments-controls" className="text-nowrap">
      <Row>
        <Col>
          <InputGroup>
            <InputGroup.Text
              className="bg-transparent">
              <IoSearch />
            </InputGroup.Text>
            <FormControl
              size="lg"
              className="me-1 float-start border-start-0"
              id="wd-search-assignment"
              placeholder="Search..."
            />
          </InputGroup>
        </Col>
        <Col>
          {isFaculty && (
          <Button
            variant="danger"
            size="lg"
            className="me-1 float-end"
            id="wd-add-assignment"
            onClick={handleAddAssignment}
          >
            <FaPlus className="position-relative me-2" style={{ bottom: "1px" }} />
            Assignment
          </Button>
          )}
          {isFaculty && (
          <Button
            variant="secondary"
            size="lg"
            className="me-1 float-end"
            id="wd-add-group"
          >
            <FaPlus className="position-relative me-2" style={{ bottom: "1px" }} />
            Group
          </Button>
          )}
        </Col>
      </Row>
    </div>
  );
}
