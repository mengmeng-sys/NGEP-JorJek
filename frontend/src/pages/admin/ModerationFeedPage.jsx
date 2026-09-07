import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

// Content Moderation Queue (SRS 2.2): feeds from user-submitted flags across
// posts and threaded comments. Triage workflow: dismiss / soft-delete / rule
// enforcement (targeted warnings referencing Community Rules).
const RULES = ["Rule 1: Be Respectful", "Rule 2: Stay On-Topic", "Rule 3: No Spam", "Rule 4: No Unapproved Promotion"];
const STATUS_BADGE = { pending: "pending", dismissed: "dismissed", approved: "active", warned: "warned" };
const FILTERS = ["", "pending", "dismissed", "approved", "warned"];

export default function ModerationFeedPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [expanded, setExpanded] = useState(null); // report id being triaged
  const [note, setNote] = useState("");
  const [rule, setRule] = useState(RULES[0]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  async function load() {
    const qs = filter ? `?status=${filter}` : "";
    const data = await apiFetch(`/api/admin/reports${qs}`);
    setReports(data.reports);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  function openTriage(r) {
    if (expanded === r.id) {
      setExpanded(null);
      return;
    }
    setExpanded(r.id);
    setNote("");
  }

  async function triage(r, action) {
    if (action === "warn" && !rule) {
      setToast({ kind: "error", text: "Choose a Community Rule for the warning." });
      return;
    }
    setSaving(true);
    try {
      await apiFetch(`/api/admin/reports/${r.id}/action`, {
        method: "POST",
        body: JSON.stringify({ action, rule: action === "warn" ? rule : undefined, moderationNote: note.trim() || undefined }),
      });
      setToast({ kind: "ok", text: `${r.target_type} report resolved.` });
      setExpanded(null);
      load();
    } catch (e) {
      setToast({ kind: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h1>Moderation Feed</h1>
      <p className="admin-subtitle">
        Triage flagged posts, comments, and nested replies with audit reasons (SRS 2.2).
      </p>

      {toast && (
        <div className="jd-alert" style={toast.kind === "error" ? { background: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" } : undefined}>
          {toast.text}
        </div>
      )}

      <div className="admin-filters" style={{ borderRadius: "var(--jd-radius)", border: "1px solid var(--jd-border)", marginBottom: 20 }}>
        {FILTERS.map((f) => (
          <button
            key={f || "all"}
            className={`jd-btn ${filter === f ? "jd-btn-primary" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f ? `${f} reports` : "All reports"}
          </button>
        ))}
      </div>

      {error ? (
        <div className="jd-empty">Failed to load the moderation queue: {error}</div>
      ) : reports.length === 0 ? (
        <div className="jd-empty">No {filter || ""} reports in the queue.</div>
      ) : (
        <div className="jd-stack">
          {reports.map((r) => (
            <div key={r.id} className="jd-report-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="target-type">Flagged {r.target_type} · {r.target_id}</span>
                <span className={`jd-badge jd-badge-${STATUS_BADGE[r.status] ?? "pending"}`}>{r.status}</span>
              </div>
              <p className="author-line">
                {r.author.name} <span className="email">{r.author.email}</span>
              </p>
              <div className="snippet">{r.snippet}</div>
              <p className="reason">⚠ {r.reason}</p>
              <div className="jd-muted" style={{ marginBottom: 12 }}>
                Reported by {r.reporter.name} · {new Date(r.created_at).toLocaleString()}
                {r.flagged_deleted ? " · content already hidden" : ""}
              </div>

              {r.status === "pending" ? (
                <>
                  <div className="jd-action-row">
                    <button className="jd-btn jd-btn-sm jd-btn-success" disabled={saving} onClick={() => triage(r, "dismiss")}>
                      Approve / Dismiss
                    </button>
                    <button className="jd-btn jd-btn-sm jd-btn-danger" disabled={saving} onClick={() => triage(r, "soft_delete")}>
                      Soft delete
                    </button>
                    <button className="jd-btn jd-btn-sm jd-btn-primary" disabled={saving} onClick={() => openTriage(r)}>
                      {expanded === r.id ? "Close warning" : "Send rule warning"}
                    </button>
                  </div>

                  {expanded === r.id && (
                    <div style={{ marginTop: 16 }}>
                      <label style={{ fontSize: 13, fontWeight: 600 }}>Reference a Community Rule</label>
                      <div className="jd-rule-picker">
                        {RULES.map((rl) => (
                          <button
                            key={rl}
                            type="button"
                            className={`jd-option ${rule === rl ? "selected" : ""}`}
                            onClick={() => setRule(rl)}
                          >
                            {rl}
                          </button>
                        ))}
                      </div>
                      <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginTop: 12 }}>
                        Note to the member (optional)
                      </label>
                      <textarea
                        rows={2}
                        style={{ width: "100%", border: "1px solid var(--jd-border)", borderRadius: "var(--jd-radius)", padding: 10, fontFamily: "inherit" }}
                        placeholder="Audit reason…"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                      <div style={{ marginTop: 10 }}>
                        <button className="jd-btn jd-btn-sm jd-btn-primary" disabled={saving} onClick={() => triage(r, "warn")}>
                          {saving ? "Sending…" : "Send warning"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="jd-muted">
                  Resolved by {r.resolved_by ?? "unknown"}{r.resolved_at ? ` · ${new Date(r.resolved_at).toLocaleString()}` : ""}
                  {r.moderation_note ? ` · “${r.moderation_note}”` : ""}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}