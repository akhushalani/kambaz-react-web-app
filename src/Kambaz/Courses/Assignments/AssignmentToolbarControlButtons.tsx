import { Button } from "react-bootstrap";
import { BsPlus } from "react-icons/bs";
import { IoEllipsisVertical } from "react-icons/io5";
export default function AssignmentToolbarControlButtons() {
  return (
    <div className="float-end">
      <Button variant="secondary" className="rounded-pill border-dark btn-light" disabled>40% of Total</Button>
      <BsPlus className="fs-2" />
      <IoEllipsisVertical className="fs-4" />
    </div>
  );
}