import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import * as courseClient from "../client";  // adjust path to wherever you put your client method

export default function PeopleTable() {
  const { cid } = useParams();
  const [people, setPeople] = useState<any[]>([]);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        if (cid) {
          const result = await courseClient.findPeopleForCourse(cid);
          setPeople(result);
        }
      } catch (err) {
        console.error("Error fetching people:", err);
      }
    };

    fetchPeople();
  }, [cid]);

  return (
    <div id="wd-people-table">
      <Table striped>
        <thead>
          <tr>
            <th>Name</th>
            <th>Login ID</th>
            <th>Section</th>
            <th>Role</th>
            <th>Last Activity</th>
            <th>Total Activity</th>
          </tr>
        </thead>
        <tbody>
          {people.map((user: any) => (
            <tr key={user._id}>
              <td className="wd-full-name text-nowrap">
                <FaUserCircle className="me-2 fs-1 text-secondary" />
                <span className="wd-first-name">{user.firstName} </span>
                <span className="wd-last-name">{user.lastName}</span>
              </td>
              <td className="wd-login-id">{user.loginId}</td>
              <td className="wd-section">{user.section}</td>
              <td className="wd-role">{user.role}</td>
              <td className="wd-last-activity">{user.lastActivity}</td>
              <td className="wd-total-activity">{user.totalActivity}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
