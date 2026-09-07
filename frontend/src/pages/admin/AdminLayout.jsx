import { NavLink, Outlet, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import "@/admin.css";

// Admin Dashboard shell (SRS v1.0.0). Sidebar navigation architecture per
// SRS Section 4: Overview/Metrics, User Directory, Moderation Feed,
// Mentor Pipeline, Tags & Topics. Mounted at /admin in App.jsx.
// RBAC is enforced on the backend; this guard just redirects non-admins.
const NAV = [
  { to: "/admin", end: true, label: "Overview / Metrics" },
  { to: "/admin/users", end: false, label: "User Directory" },
  { to: "/admin/moderation", end: false, label: "Moderation Feed" },
  { to: "/admin/mentors", end: false, label: "Mentor Pipeline" },
  { to: "/admin/tags", end: false, label: "Tags & Topics" },
];

export default function AdminLayout() {
  const { loading, isAdmin } = useAuth();
  if (loading) return <div className="jd-empty">Loading…</div>;
  if (!isAdmin) return <Navigate to="/login" replace />;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="dot" />
          JorJek Admin
        </div>
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>
            {item.label}
          </NavLink>
        ))}
        <Link className="admin-back" to="/">
          ← Back to forum
        </Link>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}