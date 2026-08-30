import { Link } from "react-router-dom";
import { NotificationBell } from "./NotificationBell";

// Owner: CS2
export function Navbar() {
  return (
    <nav>
      <Link to="/">JorJek</Link>
      <Link to="/posts/new">New post</Link>
      <Link to="/search">Search</Link>
      <NotificationBell />
    </nav>
  );
}
