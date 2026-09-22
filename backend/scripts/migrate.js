#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { supabase } = require("../src/config/db");

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

async function ensureTable() {
  const { error } = await supabase.from("schema_migrations").select("id").limit(1);
  if (error && error.code === "42P01") {
    console.log("Creating schema_migrations table...");
    console.log("Run this SQL in Supabase SQL Editor:");
    console.log("");
    console.log(`  create table if not exists public.schema_migrations (
    id serial primary key,
    name text unique not null,
    applied_at timestamptz not null default now()
  );`);
    console.log("");
    process.exit(1);
  }
}

async function getApplied() {
  const { data } = await supabase.from("schema_migrations").select("name");
  return new Set((data || []).map((r) => r.name));
}

async function run() {
  await ensureTable();

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const applied = await getApplied();
  const pending = files.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log("No pending migrations.");
    return;
  }

  console.log(`${pending.length} pending migration(s):\n`);
  for (const file of pending) {
    console.log(`  • ${file}`);
  }
  console.log("");
  console.log("Apply these migrations in Supabase SQL Editor.");
  console.log("After running them, record each with:");
  console.log("");
  for (const file of pending) {
    console.log(`  INSERT INTO schema_migrations (name) VALUES ('${file}');`);
  }
  console.log("");
}

run().catch((err) => {
  console.error("Migration check failed:", err.message);
  process.exit(1);
});
