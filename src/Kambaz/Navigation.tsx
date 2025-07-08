import { AiOutlineDashboard } from "react-icons/ai";
import { IoCalendarOutline } from "react-icons/io5";
import { LiaBookSolid, LiaCogSolid } from "react-icons/lia";
import { FaInbox, FaRegCircleUser } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { ListGroup } from "react-bootstrap";

export default function KambazNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const getItemClass = (path: string, isAccount = false) => {
    if (currentPath.startsWith(path)) {
      return "text-center border-0 bg-white text-danger";
    }
    if (isAccount) {
      return "text-center border-0 bg-black text-white";
    }
    return "text-white bg-black text-center border-0";
  };
  
  const getIconClass = (path: string, isAccount = false) => {
    if (currentPath.startsWith(path)) {
      return "fs-1 text-danger";
    }
    if (isAccount) {
      return "fs-1 text-white";
    }
    return "fs-1 text-danger";
  };

  return (
    <ListGroup id="wd-kambaz-navigation" style={{ width: 120 }} 
      className="rounded-0 position-fixed
      bottom-0 top-0 d-none d-md-block bg-black z-2">
      
      <ListGroup.Item id="wd-neu-link" target="_blank" action
        href="https://www.northeastern.edu/"
        className="bg-black border-0 text-center">
        <img src="/images/NEU.png" width="75px" />
      </ListGroup.Item>

      <ListGroup.Item to="/Kambaz/Account" as={Link}
        className={getItemClass("/Kambaz/Account", true)}>
        <FaRegCircleUser className={getIconClass("/Kambaz/Account", true)} /><br />
        Account
      </ListGroup.Item>

      <ListGroup.Item to="/Kambaz/Dashboard" as={Link}
        className={getItemClass("/Kambaz/Dashboard")}>
        <AiOutlineDashboard className={getIconClass("/Kambaz/Dashboard")} /><br />
        Dashboard
      </ListGroup.Item>

      <ListGroup.Item to="/Kambaz/Dashboard" as={Link}
        className={getItemClass("/Kambaz/Courses")}>
        <LiaBookSolid className={getIconClass("/Kambaz/Courses")} /><br />
        Courses
      </ListGroup.Item>

      <ListGroup.Item to="/Kambaz/Calendar" as={Link}
        className={getItemClass("/Kambaz/Calendar")}>
        <IoCalendarOutline className={getIconClass("/Kambaz/Calendar")} /><br />
        Calendar
      </ListGroup.Item>

      <ListGroup.Item to="/Kambaz/Inbox" as={Link}
        className={getItemClass("/Kambaz/Inbox")}>
        <FaInbox className={getIconClass("/Kambaz/Inbox")} /><br />
        Inbox
      </ListGroup.Item>

      <ListGroup.Item to="/Labs" as={Link}
        className={getItemClass("/Labs")}>
        <LiaCogSolid className={getIconClass("/Labs")} /><br />
        Labs
      </ListGroup.Item>
    </ListGroup>
  );
}
