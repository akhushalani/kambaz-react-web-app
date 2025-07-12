import Nav from "react-bootstrap/Nav";
import { Link, useLocation } from "react-router-dom";

export default function TOC() {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { to: "/Labs", label: "Labs" },
    { to: "/Labs/Lab1", label: "Lab 1" },
    { to: "/Labs/Lab2", label: "Lab 2" },
    { to: "/Labs/Lab3", label: "Lab 3" },
    { to: "/Labs/Lab4", label: "Lab 4" },
    { to: "/Kambaz", label: "Kambaz" },
  ];

  return (
    <Nav variant="pills">
      {links.map((link) => {
        const isActive = currentPath === link.to;

        return (
          <Nav.Item key={link.to}>
            <Nav.Link
              as={Link}
              to={link.to}
              active={isActive}
            >
              {link.label}
            </Nav.Link>
          </Nav.Item>
        );
      })}

      <Nav.Item>
        <Nav.Link href="https://github.com/akhushalani/kambaz-react-web-app">My GitHub</Nav.Link>
      </Nav.Item>
    </Nav>
  );
}
