import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

const STATUS_BADGE = { pending: "pending", approved: "approved", rejected: "rejected" };
const SESSION_BADGE = { requested: "pending", confirmed: "accepted", rejected: "rejected", completed: "completed", cancelled: "cancelled" };

// Flip this to false once the pipeline is ready to go live — it's the only
// thing gating the blurred "Coming Soon" preview below.
const COMING_SOON = true;

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export default function MentorPipelinePage() {
  const [tab, setTab] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);
  const [note, setNote] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  async function loadApplications() {
    const data = await apiFetch("/api/admin/mentors");
    setApplications(data.applications);
  }

  async function loadSessions() {
    const data = await apiFetch("/api/admin/sessions");
    setSessions(data.sessions);
  }

  useEffect(() => {
    Promise.all([loadApplications(), loadSessions()]).catch((e) => setError(e.message));
  }, []);

  async function reviewApp(app, action) {
    setSaving(true);
    try {
      await apiFetch(`/api/admin/mentors/${app.id}/action`, {
        method: "POST",
        body: JSON.stringify({ action, note: note[app.id]?.trim() || null }),
      });
      setToast({ kind: "ok", text: `${app.applicant.display_name} ${action}ed as mentor.` });
      await loadApplications();
      await loadSessions();
    } catch (e) {
      setToast({ kind: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  }

  const pendingApps = applications.filter((a) => a.status === "pending");

  return (
    <>
      <h1>Mentor Pipeline</h1>
      <p className="admin-subtitle">
        Verify mentor credentials, departments, and claimed skill tags; monitor live sessions and cancellations.
      </p>

      <div className={COMING_SOON ? "jd-coming-soon-wrap" : undefined}>
        <div className={COMING_SOON ? "jd-coming-soon-content" : undefined} aria-hidden={COMING_SOON || undefined}>
          {toast && (
            <div className="jd-alert" style={toast.kind === "error" ? { background: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" } : undefined}>
              {toast.text}
            </div>
          )}

          <div className="admin-filters" style={{ borderRadius: "var(--jd-radius)", border: "1px solid var(--jd-border)", marginBottom: 20 }}>
            <button className={`jd-btn ${tab === "applications" ? "jd-btn-primary" : ""}`} onClick={() => setTab("applications")}>
              Verification queue ({pendingApps.length})
            </button>
            <button className={`jd-btn ${tab === "sessions" ? "jd-btn-primary" : ""}`} onClick={() => setTab("sessions")}>
              Active sessions
            </button>
          </div>

          {error && <div className="jd-empty">Failed to load: {error}</div>}

          {tab === "applications" && (
            <>
              {applications.length === 0 ? (
                <div className="jd-empty">No mentor applications yet.</div>
              ) : (
                <div className="jd-stack">
                  {applications.map((app) => (
                    <div key={app.id} className="jd-mentor-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <p className="author-line" style={{ margin: 0 }}>
                          {app.applicant.display_name} <span className="email">{app.applicant.email}</span>
                        </p>
                        <span className={`jd-badge jd-badge-${STATUS_BADGE[app.status] ?? "pending"}`}>{app.status}</span>
                      </div>
                      <div className="jd-muted" style={{ margin: "6px 0" }}>
                        {app.department} · Karma {app.applicant.karma} · Role {app.applicant.role}
                        {app.applicant.is_mentor ? " · already a mentor" : ""}
                      </div>
                      {app.credential_summary && (
                        <div className="jd-muted" style={{ marginBottom: 8 }}>
                          Credentials: {app.credential_summary}
                        </div>
                      )}
                      <div style={{ marginBottom: 14 }}>
                        {app.claimed_tags.map((t) => (
                          <span key={t} className="jd-tag">#{t}</span>
                        ))}
                      </div>

                      {app.status === "pending" ? (
                        <>
                          <textarea
                            rows={2}
                            style={{ width: "100%", border: "1px solid var(--jd-border)", borderRadius: "var(--jd-radius)", padding: 10, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 10 }}
                            placeholder="Review note (optional) — e.g. transcript verified…"
                            value={note[app.id] ?? ""}
                            onChange={(e) => setNote({ ...note, [app.id]: e.target.value })}
                          />
                          <div className="jd-action-row">
                            <button className="jd-btn jd-btn-sm jd-btn-success" disabled={saving} onClick={() => reviewApp(app, "approve")}>
                              Approve application
                            </button>
                            <button className="jd-btn jd-btn-sm jd-btn-danger" disabled={saving} onClick={() => reviewApp(app, "reject")}>
                              Reject
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="jd-muted">
                          {app.reviewed_by ? `Reviewed by ${app.reviewed_by}` : "Reviewed"}{app.reviewed_at ? ` · ${new Date(app.reviewed_at).toLocaleString()}` : ""}
                          {app.review_note ? ` · "${app.review_note}"` : ""}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "sessions" && (
            <div className="admin-panel">
              {sessions.length === 0 ? (
                <div className="jd-empty">No sessions yet.</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Requester</th>
                      <th>Mentor</th>
                      <th>Meeting link</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>Cancellation log</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr key={s.id}>
                        <td>{s.requester}</td>
                        <td>{s.mentor}</td>
                        <td>
                          {s.meeting_link ? (
                            <a href={s.meeting_link} target="_blank" rel="noreferrer" style={{ color: "var(--jd-accent)" }}>
                              Open Meet
                            </a>
                          ) : (
                            <span className="jd-muted">—</span>
                          )}
                        </td>
                        <td>
                          <span className={`jd-badge ${s.capacity.enrolled >= s.capacity.max ? "jd-badge-banned" : "jd-badge-active"}`}>
                            {s.capacity.enrolled}/{s.capacity.max}
                          </span>
                        </td>
                        <td>
                          <span className={`jd-badge jd-badge-${SESSION_BADGE[s.status] ?? "pending"}`}>{s.status}</span>
                        </td>
                        <td className="jd-muted">
                          {s.status === "cancelled" ? `${s.cancel_reason ?? "Cancelled"}${s.cancelled_at ? ` (${new Date(s.cancelled_at).toLocaleString()})` : ""}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {COMING_SOON && (
          <div className="jd-coming-soon-overlay">
            <div className="jd-coming-soon-card">
              <div className="jd-coming-soon-icon">
                <ClockIcon />
              </div>
              <h2>Coming Soon</h2>
              <p>The mentor verification pipeline is still being finalized and isn't open yet.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
