import { Link } from "react-router-dom";
import { Row, Col, Card, Button } from "react-bootstrap";
import { FormControl } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { addCourse, deleteCourse, updateCourse } from "../Courses/reducer";
import { addEnrollment, removeEnrollment } from "../Courses/Enrollments/reducer";
import { useState } from "react";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const courses = useSelector((state: any) => state.coursesReducer.courses);
  const enrollments = useSelector((state: any) => state.enrollmentsReducer.enrollments);
  const isFaculty = currentUser?.role === "FACULTY";

  const [showAllCourses, setShowAllCourses] = useState(false);
  const [draftCourse, setDraftCourse] = useState({
    name: "New Course",
    number: "New Number",
    startDate: "2023-09-10",
    endDate: "2023-12-15",
    description: "New Description",
  });

  const myEnrollmentIds = enrollments
    .filter((e: any) => e.user === currentUser._id)
    .map((e: any) => e.course);

  const displayedCourses = showAllCourses
    ? courses
    : courses.filter((c: any) => myEnrollmentIds.includes(c._id));

  const enrolledCount = myEnrollmentIds.length;

  const handleAddCourse = () => {
    dispatch(addCourse(draftCourse));
    resetDraft();
  };

  const handleUpdateCourse = () => {
    dispatch(updateCourse(draftCourse));
    resetDraft();
  };

  const resetDraft = () => {
    setDraftCourse({
      name: "New Course",
      number: "New Number",
      startDate: "2023-09-10",
      endDate: "2023-12-15",
      description: "New Description",
    });
  };

  const handleEnroll = (courseId: string) => {
    dispatch(addEnrollment({ user: currentUser._id, course: courseId }));
  };

  const handleUnenroll = (courseId: string) => {
    const enrollment = enrollments.find(
      (e: any) => e.user === currentUser._id && e.course === courseId
    );
    if (enrollment) {
      dispatch(removeEnrollment(enrollment._id));
    }
  };

  return (
    <div id="wd-dashboard">
      <div className="d-flex justify-content-between align-items-center">
        <h1 id="wd-dashboard-title">Dashboard</h1>
        <Button
          variant="primary"
          onClick={() => setShowAllCourses(!showAllCourses)}
        >
          Enrollments
        </Button>
      </div>
      <hr />

      {isFaculty && (
        <div>
          <h5>
            New Course
            <button
              className="btn btn-primary float-end"
              id="wd-add-new-course-click"
              onClick={handleAddCourse}
            >
              Add
            </button>
            <button
              className="btn btn-warning float-end me-2"
              onClick={handleUpdateCourse}
              id="wd-update-course-click"
            >
              Update
            </button>
          </h5>
          <br />
          <FormControl
            value={draftCourse.name}
            className="mb-2"
            onChange={(e) =>
              setDraftCourse({ ...draftCourse, name: e.target.value })
            }
          />
          <FormControl
            as="textarea"
            value={draftCourse.description}
            rows={3}
            onChange={(e) =>
              setDraftCourse({ ...draftCourse, description: e.target.value })
            }
          />
          <hr />
        </div>
      )}

      {!showAllCourses && (
        <>
          <h2 id="wd-dashboard-published">
            Published Courses ({enrolledCount})
          </h2>
          <hr />
        </>
      )}

      <div id="wd-dashboard-courses">
        <Row xs={1} md={5} className="g-4">
          {displayedCourses.map((course: any) => {
            const isEnrolled = myEnrollmentIds.includes(course._id);
            return (
              <Col key={course._id} className="wd-dashboard-course" style={{ width: "300px" }}>
                <Card>
                  <Link
                    to={`/Kambaz/Courses/${course._id}/Home`}
                    className="wd-dashboard-course-link text-decoration-none text-dark"
                  >
                    <Card.Img
                      src="/images/reactjs.jpg"
                      variant="top"
                      width="100%"
                      height={160}
                    />
                    <Card.Body className="card-body">
                      <Card.Title className="wd-dashboard-course-title text-nowrap overflow-hidden">
                        {course.name}
                      </Card.Title>
                      <Card.Text
                        className="wd-dashboard-course-description overflow-hidden"
                        style={{ height: "100px" }}
                      >
                        {course.description}
                      </Card.Text>
                      {!showAllCourses && (
                        <Button variant="primary">Go</Button>
                      )}

                      {!showAllCourses && isFaculty && (
                        <>
                          <button
                            onClick={(event) => {
                              event.preventDefault();
                              dispatch(deleteCourse(course._id));
                            }}
                            className="btn btn-danger float-end"
                            id="wd-delete-course-click"
                          >
                            Delete
                          </button>
                          <button
                            id="wd-edit-course-click"
                            onClick={(event) => {
                              event.preventDefault();
                              setDraftCourse(course);
                            }}
                            className="btn btn-warning me-2 float-end"
                          >
                            Edit
                          </button>
                        </>
                      )}

                      {showAllCourses && (
                        <div className="d-flex justify-content-end mt-2">
                          {isEnrolled ? (
                            <Button
                              variant="danger"
                              onClick={(e) => {
                                e.preventDefault();
                                handleUnenroll(course._id);
                              }}
                            >
                              Unenroll
                            </Button>
                          ) : (
                            <Button
                              variant="success"
                              onClick={(e) => {
                                e.preventDefault();
                                handleEnroll(course._id);
                              }}
                            >
                              Enroll
                            </Button>
                          )}
                        </div>
                      )}

                    </Card.Body>
                  </Link>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
}
