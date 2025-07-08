import { Link, useLocation } from "react-router-dom";

export default function AccountNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { to: "/Kambaz/Account/Signin", label: "Sign in" },
    { to: "/Kambaz/Account/Signup", label: "Sign up" },
    { to: "/Kambaz/Account/Profile", label: "Profile" },
  ];

  return (
    <div id="wd-account-navigation" className="wd list-group fs-5 rounded-0">
      {links.map((link) => {
        const isActive = currentPath === link.to;
        const classes = `list-group-item border border-0 ${
          isActive ? "active" : "text-danger"
        }`;

        return (
          <Link key={link.to} to={link.to} className={classes}>
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
