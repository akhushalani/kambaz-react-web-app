import { useSelector } from "react-redux";
import { Navigate, useParams } from "react-router";
export default function ProtectedCourseRoute({ children }: { children: any }) {
  const { cid } = useParams();
  const currentUser = useSelector((state: any) => state.accountReducer.currentUser);
  const enrollments = useSelector((state: any) => state.enrollmentsReducer.enrollments);

  const isEnrolled = enrollments.some(
    (e: any) => e.user === currentUser?._id && e.course === cid
  );

  if (!isEnrolled) {
    return <Navigate to="/Kambaz/Dashboard" replace />;
  }

  return children;
}
