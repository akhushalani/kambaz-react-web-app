import { useEffect, useState } from "react";
import { Button, Row, Col, Card, FormControl } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import * as userClient from "../Account/client";
import * as courseClient from "../Courses/client";
import * as enrollmentClient from "../Courses/Enrollments/client";
export default function Dashboard() {
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const isFaculty = currentUser?.role === "FACULTY";

  const [showAllCourses, setShowAllCourses] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [draftCourse, setDraftCourse] = useState({
    name: "New Course",
    number: "New Number",
    startDate: "2023-09-10",
    endDate: "2023-12-15",
    description: "New Description",
  });

  const fetchMyCourses = async () => {
    try {
      const result = await userClient.findMyCourses();
      setCourses(result);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const result = await courseClient.fetchAllCourses(currentUser._id);
      setCourses(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (showAllCourses) {
      fetchAllCourses();
    } else {
      fetchMyCourses();
    }
  }, [showAllCourses]);

  const handleEnroll = async (courseId: string) => {
    await enrollmentClient.enrollInCourse(currentUser._id, courseId);
    if (showAllCourses) {
      fetchAllCourses();
    } else {
      fetchMyCourses();
    }
  };

  const handleUnenroll = async (courseId: string) => {
    await enrollmentClient.unenrollInCourse(currentUser._id, courseId);
    if (showAllCourses) {
      fetchAllCourses();
    } else {
      fetchMyCourses();
    }
  };

  const handleAddCourse = async () => {
    await userClient.createCourse(draftCourse);
    fetchAllCourses();
    setDraftCourse({
      name: "New Course",
      number: "New Number",
      startDate: "2023-09-10",
      endDate: "2023-12-15",
      description: "New Description",
    });
  };

  const handleUpdateCourse = async () => {
    await courseClient.updateCourse(draftCourse);
    fetchAllCourses();
    setDraftCourse({
      name: "New Course",
      number: "New Number",
      startDate: "2023-09-10",
      endDate: "2023-12-15",
      description: "New Description",
    });
  };

  const handleDeleteCourse = async (courseId: string) => {
    await courseClient.deleteCourse(courseId);
    if (showAllCourses) {
      fetchAllCourses();
    } else {
      fetchMyCourses();
    }
  };

  useEffect(() => {
    console.log("DEBUG: Current courses state:", courses);
  }, [courses]);

  return (
    <div id="wd-dashboard">
      <div className="d-flex justify-content-between align-items-center">
        <h1 id="wd-dashboard-title">Dashboard</h1>
        <Button variant="primary" onClick={() => setShowAllCourses(!showAllCourses)}>
          Enrollments
        </Button>
      </div>
      <hr />

      {!showAllCourses && isFaculty && (
        <div>
          <h5>
            New Course
            <button
              className="btn btn-primary float-end"
              onClick={handleAddCourse}
            >
              Add
            </button>
            <button
              className="btn btn-warning float-end me-2"
              onClick={handleUpdateCourse}
            >
              Update
            </button>
          </h5>
          <br />
          <FormControl
            value={draftCourse.name}
            className="mb-2"
            onChange={(e) => setDraftCourse({ ...draftCourse, name: e.target.value })}
          />
          <FormControl
            as="textarea"
            value={draftCourse.description}
            rows={3}
            onChange={(e) => setDraftCourse({ ...draftCourse, description: e.target.value })}
          />
          <hr />
        </div>
      )}

      <div id="wd-dashboard-courses">
        <Row xs={1} md={5} className="g-4">
          {courses.map((course: any) => (
            <Col key={course._id} className="wd-dashboard-course" style={{ width: "300px" }}>
              <Card>
                <Link
                  to={`/Kambaz/Courses/${course._id}/Home`}
                  className="wd-dashboard-course-link text-decoration-none text-dark"
                >
                  <Card.Img src="/images/reactjs.jpg" variant="top" width="100%" height={160} />
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
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteCourse(course._id);
                          }}
                          className="btn btn-danger float-end"
                        >
                          Delete
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
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
                        {course.isEnrolled ? (
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
          ))}
        </Row>
      </div>
    </div>
  );
}
