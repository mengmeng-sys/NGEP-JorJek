const { supabase } = require("../config/db");

const BACKUP_BUCKET = "backups";
const ATTACHMENTS_BUCKET = "attachments";

const TABLES = [
  { name: "users", conflict: "id" },
  { name: "skill_tags", conflict: "id" },
  { name: "posts", conflict: "id" },
  { name: "post_tags", conflict: "post_id,tag_id" },
  { name: "comments", conflict: "id" },
  { name: "votes", conflict: "id" },
  { name: "tag_follows", conflict: "user_id,tag_id" },
  { name: "saved_posts", conflict: "user_id,post_id" },
  { name: "notifications", conflict: "id" },
  { name: "reports", conflict: "id" },
  { name: "mentoring_sessions", conflict: "id" },
  { name: "ratings", conflict: "id" },
  { name: "moderation_actions", conflict: "id" },
  { name: "mentor_applications", conflict: "id" },
  { name: "refresh_tokens", conflict: "id" },
];

const TABLES_BY_NAME = Object.fromEntries(TABLES.map((t) => [t.name, t]));

async function fetchAllRows(tableName) {
  const allRows = [];
  let page = 0;
  const pageSize = 1000;
  for (;;) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .range(from, to);
    if (error) throw new Error(`Failed to read ${tableName}: ${error.message}`);
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < pageSize) break;
    page++;
  }
  return allRows;
}

async function listAllFiles(bucket, prefix) {
  const allFiles = [];
  let offset = 0;
  const limit = 100;
  for (;;) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw new Error(`Failed to list ${bucket}: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const item of data) {
      if (item.id === null) {
        const subFiles = await listAllFiles(bucket, item.name);
        allFiles.push(
          ...subFiles.map((f) => ({ ...f, name: `${item.name}/${f.name}` }))
        );
      } else {
        allFiles.push(item);
      }
    }
    if (data.length < limit) break;
    offset += limit;
  }
  return allFiles;
}

async function createBackup() {
  const backup = {
    version: 1,
    timestamp: new Date().toISOString(),
    tables: {},
    files: [],
  };

  const rowCounts = {};
  for (const { name } of TABLES) {
    const rows = await fetchAllRows(name);
    backup.tables[name] = rows;
    rowCounts[name] = rows.length;
  }

  try {
    const files = await listAllFiles(ATTACHMENTS_BUCKET, "");
    backup.files = files.map((f) => ({ name: f.name, size: f.metadata?.size ?? null }));
  } catch {
    backup.files = [];
  }

  const backupName = `backup-${Date.now()}.json`;
  const backupBlob = Buffer.from(JSON.stringify(backup));

  const { error: uploadErr } = await supabase.storage
    .from(BACKUP_BUCKET)
    .upload(backupName, backupBlob, {
      contentType: "application/json",
      upsert: false,
    });
  if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

  return { name: backupName, rowCounts, fileCount: backup.files.length };
}

async function listBackups() {
  const { data, error } = await supabase.storage
    .from(BACKUP_BUCKET)
    .list("", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });
  if (error) throw new Error(`List failed: ${error.message}`);

  return (data || [])
    .filter((f) => f.name.endsWith(".json"))
    .map((f) => ({
      name: f.name,
      size: f.metadata?.size ?? null,
      created_at: f.created_at,
    }));
}

async function getBackup(name) {
  const { data, error } = await supabase.storage.from(BACKUP_BUCKET).download(name);
  if (error) throw new Error(`Download failed: ${error.message}`);
  const text = await data.text();
  return JSON.parse(text);
}

async function deleteBackup(name) {
  const { error } = await supabase.storage.from(BACKUP_BUCKET).remove([name]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

async function restoreBackup(name) {
  const backup = await getBackup(name);

  if (!backup.tables || typeof backup.tables !== "object") {
    throw new Error("Invalid backup format: missing tables");
  }

  const restoreOrder = TABLES.map((t) => t.name);

  for (const tableName of restoreOrder) {
    const rows = backup.tables[tableName];
    if (!Array.isArray(rows) || rows.length === 0) continue;

    const table = TABLES_BY_NAME[tableName];
    if (!table) continue;

    const { error: delErr } = await supabase
      .from(tableName)
      .delete()
      .not("id", "is", null);
    if (delErr) {
      const firstKey = table.conflict.split(",")[0];
      const { error: delErr2 } = await supabase
        .from(tableName)
        .delete()
        .not(firstKey, "is", null);
      if (delErr2) {
        throw new Error(`Restore: failed to clear ${tableName}: ${delErr2.message}`);
      }
    }

    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error: upsertErr } = await supabase
        .from(tableName)
        .upsert(batch, { onConflict: table.conflict });
      if (upsertErr) {
        throw new Error(`Restore failed on ${tableName}: ${upsertErr.message}`);
      }
    }
  }

  return {
    restored: true,
    tables: Object.keys(backup.tables),
    rowCounts: Object.fromEntries(
      Object.entries(backup.tables).map(([k, v]) => [k, v.length])
    ),
  };
}

module.exports = {
  createBackup,
  listBackups,
  getBackup,
  deleteBackup,
  restoreBackup,
  TABLES,
};
