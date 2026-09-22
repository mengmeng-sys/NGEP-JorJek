import { useEffect, useState, useCallback } from "react";
import { backupApi } from "@/lib/api";

function formatBytes(bytes) {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export default function BackupRecoveryPage() {
  const [backups, setBackups] = useState([]);
  const [migrations, setMigrations] = useState([]);
  const [tableReady, setTableReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(null);
  const [sqlPreview, setSqlPreview] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [backupRes, migRes] = await Promise.all([
        backupApi.list(),
        backupApi.migrations(),
      ]);
      setBackups(backupRes.backups || []);
      setMigrations(migRes.migrations || []);
      setTableReady(migRes.tableReady !== false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function showToast(kind, text) {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleBackup() {
    setBusy(true);
    try {
      const res = await backupApi.create();
      showToast("ok", `Backup created: ${res.name} (${Object.values(res.rowCounts).reduce((a, b) => a + b, 0)} rows, ${res.fileCount} files)`);
      await load();
    } catch (e) {
      showToast("error", e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRestore() {
    if (!confirmRestore) return;
    setBusy(true);
    try {
      const res = await backupApi.restore(confirmRestore.name);
      showToast("ok", `Restored from ${confirmRestore.name}. Safety backup: ${res.safetyBackup}`);
      setConfirmRestore(null);
    } catch (e) {
      showToast("error", e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(name) {
    if (!window.confirm(`Delete backup ${name}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await backupApi.remove(name);
      showToast("ok", `Deleted ${name}`);
      await load();
    } catch (e) {
      showToast("error", e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handlePreviewSql(name) {
    try {
      const res = await backupApi.migrationSql(name);
      setSqlPreview({ name, sql: res.sql });
    } catch (e) {
      showToast("error", e.message);
    }
  }

  async function handleApplyMigration(name) {
    setBusy(true);
    try {
      await backupApi.applyMigration(name);
      showToast("ok", `Marked ${name} as applied`);
      setSqlPreview(null);
      await load();
    } catch (e) {
      showToast("error", e.message);
    } finally {
      setBusy(false);
    }
  }

  const appliedCount = migrations.filter((m) => m.applied).length;
  const pendingCount = migrations.length - appliedCount;

  return (
    <>
      <h1>Backup &amp; Recovery</h1>
      <p className="admin-subtitle">
        Create on-demand backups of all database tables and the file storage manifest.
        Restores are preceded by an automatic safety backup. Schema migrations track
        which DDL changes have been applied to the database.
      </p>

      {toast && (
        <div
          className="jd-alert"
          style={
            toast.kind === "error"
              ? { background: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" }
              : undefined
          }
        >
          {toast.text}
        </div>
      )}

      {confirmRestore && (
        <div className="jd-alert" style={{ background: "#fef3c7", borderColor: "#fcd34d", color: "#92400e" }}>
          <strong>Restore from {confirmRestore.name}?</strong>
          <p style={{ margin: "8px 0" }}>
            All current data will be replaced. A safety backup will be created first.
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="jd-btn jd-btn-primary" disabled={busy} onClick={handleRestore}>
              {busy ? "Restoring…" : "Confirm Restore"}
            </button>
            <button className="jd-btn" disabled={busy} onClick={() => setConfirmRestore(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {sqlPreview && (
        <div className="admin-panel">
          <h2>Migration: {sqlPreview.name}</h2>
          <div className="admin-panel-body">
            <p style={{ marginBottom: "12px", color: "#6b7280", fontSize: "14px" }}>
              Copy this SQL and run it in Supabase SQL Editor, then mark as applied below.
            </p>
            <pre
              style={{
                background: "#1e293b",
                color: "#e2e8f0",
                padding: "16px",
                borderRadius: "8px",
                overflow: "auto",
                fontSize: "13px",
                lineHeight: "1.5",
                maxHeight: "300px",
              }}
            >
              {sqlPreview.sql}
            </pre>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button
                className="jd-btn jd-btn-primary"
                disabled={busy}
                onClick={() => {
                  navigator.clipboard.writeText(sqlPreview.sql);
                  showToast("ok", "SQL copied to clipboard");
                }}
              >
                Copy SQL
              </button>
              <button
                className="jd-btn"
                disabled={busy}
                onClick={() => handleApplyMigration(sqlPreview.name)}
              >
                Mark as Applied
              </button>
              <button className="jd-btn" onClick={() => setSqlPreview(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-panel">
        <h2>Database Backups</h2>
        <div className="admin-panel-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ color: "#6b7280", fontSize: "14px" }}>
              {backups.length} backup{backups.length !== 1 ? "s" : ""} stored
            </span>
            <button className="jd-btn jd-btn-primary" disabled={busy} onClick={handleBackup}>
              {busy ? "Creating…" : "Create Backup"}
            </button>
          </div>

          {loading ? (
            <div className="jd-empty">Loading backups…</div>
          ) : error ? (
            <div className="jd-empty">Failed to load: {error}</div>
          ) : backups.length === 0 ? (
            <div className="jd-empty">No backups yet. Create your first one above.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Backup File</th>
                  <th>Size</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => (
                  <tr key={b.name}>
                    <td>{b.name}</td>
                    <td>{formatBytes(b.size)}</td>
                    <td>{formatDate(b.created_at)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="jd-btn jd-btn-sm"
                          disabled={busy}
                          onClick={() => setConfirmRestore(b)}
                        >
                          Restore
                        </button>
                        <button
                          className="jd-btn jd-btn-sm jd-btn-danger"
                          disabled={busy}
                          onClick={() => handleDelete(b.name)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="admin-panel">
        <h2>Schema Migrations</h2>
        <div className="admin-panel-body">
          {!tableReady ? (
            <div className="jd-empty" style={{ background: "#fef3c7", borderColor: "#fcd34d" }}>
              <strong>Migration tracking not initialized.</strong>
              <p style={{ marginTop: "8px" }}>
                Run the following SQL in Supabase SQL Editor to enable migration tracking:
              </p>
              <pre
                style={{
                  background: "#1e293b",
                  color: "#e2e8f0",
                  padding: "12px",
                  borderRadius: "6px",
                  marginTop: "8px",
                  fontSize: "12px",
                  overflow: "auto",
                }}
              >{`create table if not exists public.schema_migrations (
  id serial primary key,
  name text unique not null,
  applied_at timestamptz not null default now()
);`}</pre>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ color: "#6b7280", fontSize: "14px" }}>
                  {appliedCount} applied · {pendingCount} pending
                </span>
              </div>

              {migrations.length === 0 ? (
                <div className="jd-empty">No migrations defined.</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Migration</th>
                      <th>Status</th>
                      <th>Applied At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {migrations.map((m) => (
                      <tr key={m.name}>
                        <td>{m.name}</td>
                        <td>
                          <span className={`jd-badge ${m.applied ? "jd-badge-success" : "jd-badge-warning"}`}>
                            {m.applied ? "Applied" : "Pending"}
                          </span>
                        </td>
                        <td>{formatDate(m.appliedAt)}</td>
                        <td>
                          <button
                            className="jd-btn jd-btn-sm"
                            onClick={() => handlePreviewSql(m.name)}
                          >
                            View SQL
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
