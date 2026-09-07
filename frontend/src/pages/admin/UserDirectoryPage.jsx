import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

// User Directory (SRS 2.1): filterable table by university domain / account
// standing / role, and enforcement modals for timed suspensions (24h, 7d, 30d),
// permanent bans, or restores — each requiring a mandatory moderator note.
const STATUS_LABEL = { ACTIVE: "active", SUSPENDED: "suspended", BANNED: "banned" };
const DURATIONS = [
  { days: 1, label: "24 hours" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
];

export default function UserDirectoryPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: "", role: "", status: "" });
  const [selected, setSelected] = useState(null); // user being acted on
  const [note, setNote] = useState("");
  const [action, setAction] = useState("suspend"); // suspend | ban
  const [duration, setDuration] = useState(7);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [log, setLog] = useState(null); // enforcement/karma log for inspect

  async function loadUsers(params = filters) {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.role) qs.set("role", params.role);
    if (params.status) qs.set("status", params.status);
    const data = await apiFetch(`/api/admin/users${qs.toString() ? `?${qs}` : ""}`);
    setUsers(data.users);
  }

  useEffect(() => {
    loadUsers(filters).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  function openEnforce(user) {
    setSelected(user);
    setAction(user.status === "BANNED" ? "restore" : user.status === "SUSPENDED" ? "restore" : "suspend");
    setDuration(7);
    setNote("");
    setLog(null);
  }

  async function inspect(user) {
    const data = await apiFetch(`/api/admin/users/${user.id}/actions`);
    setSelected(user);
    setLog(data);
  }

  async function submitEnforcement() {
    if (action !== "restore" && !note.trim()) {
      setToast({ kind: "error", text: "A mandatory moderator note is required (SRS 2.1)." });
      return;
    }
    setSaving(true);
    try {
      await apiFetch(`/api/admin/users/${selected.id}/action`, {
        method: "POST",
        body: JSON.stringify({
          action,
          duration_days: action === "suspend" ? duration : undefined,
          reason: note.trim(),
        }),
      });
      setToast({ kind: "ok", text: `Enforcement applied to ${selected.displayName}.` });
      const next = { ...filters };
      loadUsers(next);
      setSelected(null);
    } catch (e) {
      setToast({ kind: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  }

  function closeModal() {
    setSelected(null);
    setLog(null);
  }

  return (
    <>
      <h1>User Directory</h1>
      <p className="admin-subtitle">
        Manage accounts, assign roles, enforce suspensions/bans, and inspect karma &amp; enforcement logs.
      </p>

      {toast && (
        <div className={`jd-alert ${toast.kind === "error" ? "jd-alert-error" : ""}`} style={toast.kind === "error" ? { background: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" } : undefined}>
          {toast.text}
        </div>
      )}

      <div className="admin-panel">
        <div className="admin-filters">
          <input
            placeholder="Search by name or @cadt.edu.kh email…"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
            <option value="">All roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="MODERATOR">Moderator</option>
            <option value="PROFESSOR">Professor</option>
            <option value="STUDENT">Student</option>
          </select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All standings</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="BANNED">BANNED</option>
          </select>
        </div>

        {error ? (
          <div className="jd-empty">Failed to load users: {error}</div>
        ) : users.length === 0 ? (
          <div className="jd-empty">No users match the current filters.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Domain</th>
                <th>Role</th>
                <th>Standing</th>
                <th>Karma</th>
                <th>Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.displayName} {u.isMentor ? "· ⭐ Mentor" : ""}</td>
                  <td className="jd-muted">{u.cadtEmail}</td>
                  <td>
                    <span className="jd-badge jd-badge-role">{u.role}</span>
                  </td>
                  <td>
                    <span className={`jd-badge jd-badge-${STATUS_LABEL[u.status] ?? "active"}`}>{u.status}</span>
                    {u.suspendedUntil && u.status === "SUSPENDED" && (
                      <div className="jd-muted" style={{ marginTop: 4 }}>
                        until {new Date(u.suspendedUntil).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td>{u.karma}</td>
                  <td className="jd-muted">{u._count.posts} posts · {u._count.comments} comments</td>
                  <td>
                    <button className="jd-btn jd-btn-sm" onClick={() => inspect(u)}>
                      Inspect
                    </button>{" "}
                    <button className="jd-btn jd-btn-sm jd-btn-primary" onClick={() => openEnforce(u)}>
                      {u.status === "BANNED" || u.status === "SUSPENDED" ? "Restore" : "Enforce"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && log === null && (
        <div className="jd-modal-overlay" onClick={closeModal}>
          <div className="jd-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Enforcement — {selected.displayName}</h3>
            <p className="jd-modal-sub">{selected.cadtEmail}</p>

            {selected.status === "BANNED" || selected.status === "SUSPENDED" ? (
              <>
                <p>This account is currently {selected.status.toLowerCase()}. You can restore it to ACTIVE.</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="jd-btn jd-btn-primary" onClick={() => { setAction("restore"); submitEnforcement(); }}>
                    Restore account
                  </button>
                </div>
              </>
            ) : (
              <>
                <label>Action</label>
                <div className="jd-option-row">
                  <button type="button" className={`jd-option ${action === "suspend" ? "selected" : ""}`} onClick={() => setAction("suspend")}>
                    Timed suspension
                  </button>
                  <button type="button" className={`jd-option ${action === "ban" ? "selected" : ""}`} onClick={() => setAction("ban")}>
                    Permanent ban
                  </button>
                </div>

                {action === "suspend" ? (
                  <>
                    <label>Duration (SRS 2.1)</label>
                    <div className="jd-option-row">
                      {DURATIONS.map((d) => (
                        <button
                          key={d.days}
                          type="button"
                          className={`jd-option ${duration === d.days ? "selected" : ""}`}
                          onClick={() => setDuration(d.days)}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}

                <label>Mandatory moderator note</label>
                <textarea
                  rows={3}
                  placeholder='e.g. Violation of Community Rule #3: Unapproved commercial promotion'
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </>
            )}

            <div className="jd-modal-footer">
              <button className="jd-btn" onClick={closeModal}>
                Cancel
              </button>
              {!(selected.status === "BANNED" || selected.status === "SUSPENDED") && (
                <button className="jd-btn jd-btn-primary" disabled={saving} onClick={submitEnforcement}>
                  {saving ? "Applying…" : action === "ban" ? "Ban account" : "Suspend for duration"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {selected && log !== null && (
        <div className="jd-modal-overlay" onClick={closeModal}>
          <div className="jd-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{log.user.displayName}</h3>
            <p className="jd-modal-sub">
              {log.user.cadtEmail} · Standing: <b>{log.user.status}</b> · Karma: <b>{log.user.karma}</b>
            </p>
            {log.actions.length === 0 ? (
              <div className="jd-muted">No enforcement history.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Note</th>
                    <th>By</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {log.actions.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <span className="jd-badge jd-badge-role">{a.type}</span>
                      </td>
                      <td className="jd-muted">{a.reason}</td>
                      <td className="jd-muted">{a.admin.displayName}</td>
                      <td className="jd-muted">{new Date(a.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="jd-modal-footer">
              <button className="jd-btn" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}