import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import "@/admin.css";

// Small inline icon set for the sidebar — no new dependency, matches how
// Navbar.jsx already inlines its own SVGs elsewhere in this codebase.
function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="7" width="4" height="14" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M17 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9l10-5 10 5-10 5-10-5z" />
      <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.6 13.4 11 3.8A2 2 0 0 0 9.6 3.2L3 3v6.6a2 2 0 0 0 .6 1.4l9.6 9.6a2 2 0 0 0 2.8 0l4.6-4.6a2 2 0 0 0 0-2.8z" />
      <circle cx="7.5" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const NAV = [
  { to: "/admin", end: true, label: "Overview", icon: OverviewIcon },
  { to: "/admin/users", end: false, label: "User Directory", icon: UsersIcon },
  { to: "/admin/moderation", end: false, label: "Moderation Feed", icon: ShieldIcon },
  { to: "/admin/mentors", end: false, label: "Mentor Pipeline", icon: CapIcon },
  { to: "/admin/tags", end: false, label: "Tags & Topics", icon: TagIcon },
];

function initialsOf(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return "A";
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function AdminLayout() {
  const { loading, isAdmin, user, logout } = useAuth();
  if (loading) return <div className="jd-empty">Loading…</div>;
  if (!isAdmin) return <Navigate to="/login" replace />;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/jorjek_logo.jpg" alt="JorJek" className="admin-logo" />
        </div>

        <nav className="admin-nav">
          {NAV.map(({ to, end, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={end} className="admin-side-link">
              <span className="admin-nav-icon">
                <Icon />
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/*
          Admin accounts never see the regular forum (App.jsx redirects them
          straight back to /admin), and Navbar — the only other place a "Log
          out" button exists — is hidden on every /admin route. So this is
          the only way out of the dashboard.
        */}
        <div className="admin-account">
          <div className="admin-account-row">
            <span className="admin-avatar">{initialsOf(user?.displayName)}</span>
            <div className="admin-account-info">
              <div className="admin-account-name">{user?.displayName || "Admin"}</div>
              <div className="admin-account-role">
                {user?.role === "SUPER_ADMIN" ? "Super Admin" : "Moderator"}
              </div>
            </div>
          </div>
          <button type="button" className="admin-side-link admin-logout" onClick={logout}>
            <span className="admin-nav-icon">
              <LogoutIcon />
            </span>
            <span>Log out</span>
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
