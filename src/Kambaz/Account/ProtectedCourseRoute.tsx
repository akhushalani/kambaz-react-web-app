import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useParams } from "react-router";
import * as enrollmentClient from "../Courses/Enrollments/client";
import { Spinner } from "react-bootstrap";

export default function ProtectedCourseRoute({ children }: { children: any }) {
  const { cid } = useParams();
  const { currentUser } = useSelector((s: any) => s.accountReducer);

  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (!currentUser || !cid) {
        setAllowed(false);
        return;
      }
      try {
        const ok = await enrollmentClient.isEnrolled(currentUser._id, cid);
        if (!cancelled) setAllowed(ok);
      } catch (e) {
        console.error("Failed to check enrollment", e);
        if (!cancelled) setAllowed(false);
      }
    };

    check();
    return () => { cancelled = true; };
  }, [currentUser?._id, cid]);

  if (allowed === null) {
    // Loading state
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/Kambaz/Dashboard" replace />;
  }

  return children;
}