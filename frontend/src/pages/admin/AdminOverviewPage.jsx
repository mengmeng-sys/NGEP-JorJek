import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

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
        <div className="admin-card">
          <div className="metric-label">Total users</div>
          <div className="metric-value metric-accent">{totals.users}</div>
        </div>
        <div className="admin-card">
          <div className="metric-label">Posts</div>
          <div className="metric-value">{totals.posts}</div>
        </div>
        <div className="admin-card">
          <div className="metric-label">Comments</div>
          <div className="metric-value">{totals.comments}</div>
        </div>
        <div className="admin-card">
          <div className="metric-label">Pending reports</div>
          <div className="metric-value metric-accent">{totals.reportsPending}</div>
        </div>
        <div className="admin-card">
          <div className="metric-label">Mentor applications</div>
          <div className="metric-value">{totals.mentorsPending}</div>
        </div>
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
