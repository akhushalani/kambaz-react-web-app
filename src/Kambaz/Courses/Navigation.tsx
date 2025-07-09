import { Link, useLocation, useParams } from "react-router-dom";

export default function CourseNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { cid } = useParams();

  const links = [
    { to: "/Kambaz/Courses/" + cid +"/Home", id: "wd-course-home-link", label: "Home" },
    { to: "/Kambaz/Courses/" + cid +"/Modules", id: "wd-course-modules-link", label: "Modules" },
    { to: "/Kambaz/Courses/" + cid +"/Piazza", id: "wd-course-piazza-link", label: "Piazza" },
    { to: "/Kambaz/Courses/" + cid +"/Zoom", id: "wd-course-zoom-link", label: "Zoom" },
    { to: "/Kambaz/Courses/" + cid +"/Assignments", id: "wd-course-assignments-link", label: "Assignments" },
    { to: "/Kambaz/Courses/" + cid +"/Quizzes", id: "wd-course-quizzes-link", label: "Quizzes" },
    { to: "/Kambaz/Courses/" + cid +"/People", id: "wd-course-people-link", label: "People" },
  ];

  return (
    <div id="wd-courses-navigation" className="wd list-group fs-5 rounded-0">
      {links.map((link) => {
        const isActive = currentPath.startsWith(link.to);
        const classes = `list-group-item border border-0 ${
          isActive ? "active" : "text-danger"
        }`;

        return (
          <Link key={link.to} to={link.to} id={link.id} className={classes}>
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
