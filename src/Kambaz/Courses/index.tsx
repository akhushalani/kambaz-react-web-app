import { useEffect, useState } from "react";
import CourseNavigation from "./Navigation";
import { Navigate, Route, Routes, useParams, useLocation } from "react-router";
import Modules from "./Modules";
import Home from "./Home";
import Assignments from "./Assignments";
import AssignmentEditor from "./Assignments/Editor";
import { FaAlignJustify } from "react-icons/fa6";
import PeopleTable from "./People/Table";
import { useSelector } from "react-redux";
import * as coursesClient from "./client"; 

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
            <Route path="People" element={<PeopleTable users={users} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}