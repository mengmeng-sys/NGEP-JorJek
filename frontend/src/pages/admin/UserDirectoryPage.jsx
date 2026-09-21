import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { adminApi } from "@/lib/api";

const ROLES = ["STUDENT", "PROFESSOR", "MODERATOR", "SUPER_ADMIN"];

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
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [action, setAction] = useState("suspend");
  const [duration, setDuration] = useState(7);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [log, setLog] = useState(null);

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
    setAction(user.status === "BANNED" || user.status === "SUSPENDED" ? "restore" : "suspend");
    setDuration(7);
    setNote("");
    setLog(null);
  }

  async function inspect(user) {
    const data = await apiFetch(`/api/admin/users/${user.id}/actions`);
    setSelected(user);
    setLog(data);
  }

  async function changeRole(user, newRole) {
    if (newRole === user.role) return;
    try {
      await adminApi.updateRole(user.id, newRole);
      setToast({ kind: "ok", text: `${user.display_name} changed to ${newRole}.` });
      loadUsers(filters);
    } catch (e) {
      setToast({ kind: "error", text: e.message });
    }
  }

  async function submitEnforcement(overrideAction) {
    const act = overrideAction ?? action;
    // The backend requires a non-empty `reason` for every enforcement action,
    // restore included (see admin.routes.js) — this must match, otherwise
    // clicking "Restore account" with a blank note silently round-trips to
    // the server just to get rejected with a 400 instead of an inline hint.
    if (!note.trim()) {
      setToast({
        kind: "error",
        text:
          act === "restore"
            ? "A moderator note explaining the restoration is required."
            : "A mandatory moderator note is required (SRS 2.1).",
      });
      return;
    }
    setSaving(true);
    try {
      await apiFetch(`/api/admin/users/${selected.id}/action`, {
        method: "POST",
        body: JSON.stringify({
          action: act,
          duration_days: act === "suspend" ? duration : undefined,
          reason: note.trim(),
        }),
      });
      setToast({ kind: "ok", text: `Enforcement applied to ${selected.display_name}.` });
      loadUsers(filters);
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
        <div className="jd-alert" style={toast.kind === "error" ? { background: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" } : undefined}>
          {toast.text}
        </div>
      )}

      <div className="admin-panel">
        <div className="admin-filters">
          <input
            placeholder="Search by name or email…"
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
                <th>Email</th>
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
                  <td>{u.display_name} {u.is_mentor ? "· ⭐ Mentor" : ""}</td>
                  <td className="jd-muted">{u.email}</td>
                   <td>
                     <select
                       value={u.role}
                       onChange={(e) => changeRole(u, e.target.value)}
                       className="jd-role-select"
                     >
                       {ROLES.map((r) => (
                         <option key={r} value={r}>{r}</option>
                       ))}
                     </select>
                   </td>
                  <td>
                    <span className={`jd-badge jd-badge-${STATUS_LABEL[u.status] ?? "active"}`}>{u.status}</span>
                    {u.suspended_until && u.status === "SUSPENDED" && (
                      <div className="jd-muted" style={{ marginTop: 4 }}>
                        until {new Date(u.suspended_until).toLocaleDateString()}
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
            <h3>Enforcement — {selected.display_name}</h3>
            <p className="jd-modal-sub">{selected.email}</p>

            {selected.status === "BANNED" || selected.status === "SUSPENDED" ? (
              <>
                <p>This account is currently {selected.status.toLowerCase()}. You can restore it to ACTIVE.</p>
                <label>Moderator note</label>
                <textarea
                  rows={2}
                  placeholder="Reason for restoration (required)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="jd-btn jd-btn-primary" disabled={saving} onClick={() => submitEnforcement("restore")}>
                    {saving ? "Restoring…" : "Restore account"}
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
                <button className="jd-btn jd-btn-primary" disabled={saving} onClick={() => submitEnforcement()}>
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
            <h3>{log.user.display_name}</h3>
            <p className="jd-modal-sub">
              {log.user.email} · Standing: <b>{log.user.status}</b> · Karma: <b>{log.user.karma}</b>
            </p>
            {log.actions.length === 0 ? (
              <div className="jd-muted">No enforcement history.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Note</th>
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
                      <td className="jd-muted">{new Date(a.created_at).toLocaleString()}</td>
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
