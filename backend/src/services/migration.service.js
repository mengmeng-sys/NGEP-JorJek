const fs = require("fs");
const path = require("path");
const { supabase } = require("../config/db");

const MIGRATIONS_DIR = path.join(__dirname, "..", "..", "migrations");

function listMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

async function tableExists(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select("id")
    .limit(1);
  return !error;
}

async function getAppliedMigrations() {
  const exists = await tableExists("schema_migrations");
  if (!exists) return [];

  const { data, error } = await supabase
    .from("schema_migrations")
    .select("name, applied_at")
    .order("name");
  if (error) return [];
  return (data || []).map((r) => ({ name: r.name, appliedAt: r.applied_at }));
}

async function getStatus() {
  const files = listMigrationFiles();
  const applied = await getAppliedMigrations();
  const appliedMap = new Map(applied.map((a) => [a.name, a.appliedAt]));
  const tableReady = await tableExists("schema_migrations");

  return {
    tableReady,
    migrations: files.map((name) => ({
      name,
      applied: appliedMap.has(name),
      appliedAt: appliedMap.get(name) || null,
    })),
  };
}

async function recordMigration(name) {
  const { error } = await supabase
    .from("schema_migrations")
    .upsert({ name }, { onConflict: "name" });
  if (error) throw new Error(`Failed to record migration: ${error.message}`);
}

function getMigrationSql(name) {
  const filePath = path.join(MIGRATIONS_DIR, name);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Migration file not found: ${name}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

module.exports = {
  listMigrationFiles,
  getAppliedMigrations,
  getStatus,
  recordMigration,
  getMigrationSql,
  tableExists,
  MIGRATIONS_DIR,
};
