import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

// Small inline icons for the metric cards — same approach as AdminLayout.jsx.
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

function PostIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 10h8M8 14h5" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22V4" />
      <path d="M4 4h13l-2.5 4L17 12H4" />
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

const METRICS = [
  { key: "users", label: "Total users", icon: UsersIcon, accent: true },
  { key: "posts", label: "Posts", icon: PostIcon, accent: false },
  { key: "comments", label: "Comments", icon: CommentIcon, accent: false },
  { key: "reportsPending", label: "Pending reports", icon: FlagIcon, accent: true },
  { key: "mentorsPending", label: "Mentor applications", icon: CapIcon, accent: false },
];

export default function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/api/admin/overview")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="jd-empty">Failed to load overview: {error}</p>;
  if (!data) return <p className="jd-empty">Loading overview…</p>;

  const { totals, accountStanding, roles, karmaTop, sessionThroughput, recentReports } = data;
  const throughput = ["requested", "confirmed", "completed", "cancelled"];

  return (
    <>
      <h1>Overview / Metrics</h1>
      <p className="admin-subtitle">
        Real-time analytics, session throughput, and karma distribution across JorJek.
      </p>

      <div className="admin-metrics">
        {METRICS.map(({ key, label, icon: Icon, accent }) => (
          <div className="admin-card" key={key}>
            <div className="admin-card-head">
              <div className="admin-card-icon">
                <Icon />
              </div>
            </div>
            <div className="metric-label">{label}</div>
            <div className={`metric-value ${accent ? "metric-accent" : ""}`}>{totals[key]}</div>
          </div>
        ))}
      </div>

      <div className="admin-metrics">
        <div className="admin-card">
          <div className="metric-label">Account standing</div>
          <div>
            Active <b>{accountStanding.ACTIVE || 0}</b> · Suspended <b>{accountStanding.SUSPENDED || 0}</b> · Banned{" "}
            <b>{accountStanding.BANNED || 0}</b>
          </div>
        </div>
        <div className="admin-card">
          <div className="metric-label">Roles</div>
          <div>
            Super admins <b>{roles.SUPER_ADMIN || 0}</b> · Moderators <b>{roles.MODERATOR || 0}</b> · Professors{" "}
            <b>{roles.PROFESSOR || 0}</b> · Students <b>{roles.STUDENT || 0}</b>
          </div>
        </div>
        <div className="admin-card">
          <div className="metric-label">Session throughput</div>
          <div>
            {throughput.map((s) => (
              <span key={s} className="jd-badge jd-badge-pending" style={{ marginRight: 6 }}>
                {s}: {sessionThroughput[s] ?? 0}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Karma distribution — top contributors</h2>
        <div className="admin-panel-body">
          {karmaTop.length === 0 ? (
            <div className="jd-empty">No contributors yet.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Contributor</th>
                  <th>Karma</th>
                </tr>
              </thead>
              <tbody>
                {karmaTop.map((u) => (
                  <tr key={u.id}>
                    <td>{u.display_name}</td>
                    <td>
                      <span className="jd-badge jd-badge-active">{u.karma}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="admin-panel">
        <h2>Oldest pending reports</h2>
        <div className="admin-panel-body">
          {recentReports.length === 0 ? (
            <div className="jd-empty">Moderation queue is clear.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Reason</th>
                  <th>Filed</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.target_user_id}</td>
                    <td>{r.reason}</td>
                    <td className="jd-muted">{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
