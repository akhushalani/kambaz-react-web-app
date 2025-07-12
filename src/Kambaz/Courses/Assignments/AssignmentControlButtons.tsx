import { IoEllipsisVertical } from "react-icons/io5";
import { FaTrash } from "react-icons/fa6";
import GreenCheckmark from "../GreenCheckmark";
import { useSelector } from "react-redux";
export default function AssignmentControlButtons(
  { assignmentId, deleteAssignment }: { assignmentId: string, deleteAssignment: (assignmentId: string) => void; }
) {
  const currentUser = useSelector((state: any) => state.accountReducer.currentUser);
  const isFaculty = currentUser?.role === "FACULTY";
  return (
    <div className="float-end ms-auto">
      {isFaculty && (
        <FaTrash className="text-danger me-2 mb-1" onClick={() => deleteAssignment(assignmentId)} />
      )}
      <GreenCheckmark />
      <IoEllipsisVertical className="fs-4" />
    </div> );}