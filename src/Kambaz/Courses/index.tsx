import { useEffect, useState } from "react";
import CourseNavigation from "./Navigation";
import { Navigate, Route, Routes, useParams, useLocation } from "react-router";
import Modules from "./Modules";
import Home from "./Home";
import Assignments from "./Assignments";
import AssignmentEditor from "./Assignments/Editor";
import Quizzes from "./Quizzes";
import { FaAlignJustify } from "react-icons/fa6";
import PeopleTable from "./People/Table";
import { useSelector } from "react-redux";
import * as coursesClient from "./client"; 
import QuizDetails from "./Quizzes/Details";
import QuizEditor from "./Quizzes/Editor";
import QuizRunner from "./Quizzes/Runner";

export default function Courses() {
  const { cid } = useParams();
  const { pathname } = useLocation();

  const courses = useSelector((state: any) => state.coursesReducer.courses);
  const course = courses.find((c: any) => c._id === cid);

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const loadPeople = async () => {
      if (!cid) return;
      try {
        const result = await coursesClient.findPeopleForCourse(cid);
        setUsers(result || []);
      } catch (err) {
        console.error("Failed to load people for course", err);
        setUsers([]);
      }
    };
    loadPeople();
  }, [cid]);

  return (
    <div id="wd-courses">
      <h2 className="text-danger">
        <FaAlignJustify className="me-4 fs-4 mb-1" />
        {course?.name} &gt; {pathname.split("/")[4]}
      </h2>
      <hr />
      <div className="d-flex">
        <div className="d-none d-md-block">
          <CourseNavigation />
        </div>
        <div className="flex-fill">
          <Routes>
            <Route path="/" element={<Navigate to="Home" />} />
            <Route path="Home" element={<Home />} />
            <Route path="Modules" element={<Modules />} />
            <Route path="Assignments" element={<Assignments />} />
            <Route path="Assignments/:aid" element={<AssignmentEditor />} />
            <Route path="Quizzes" element={<Quizzes />} />
            <Route path="Quizzes/:qid" element={<QuizDetails />} />
            <Route path="Quizzes/:qid/Edit/*" element={<QuizEditor />} />
            <Route path="Quizzes/:qid/Preview" element={<QuizRunner mode="faculty" />} />
            <Route path="Quizzes/:qid/Take" element={<QuizRunner mode="student" />} />
            <Route path="People" element={<PeopleTable users={users} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}