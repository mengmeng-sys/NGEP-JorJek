#!/usr/bin/env node
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TABLES = [
  { name: "users", idCol: "id" },
  { name: "skill_tags", idCol: "id" },
  { name: "posts", idCol: "id" },
  { name: "post_tags", idCol: "post_id" },
  { name: "comments", idCol: "id" },
  { name: "votes", idCol: "id" },
  { name: "tag_follows", idCol: "user_id" },
  { name: "saved_posts", idCol: "user_id" },
  { name: "notifications", idCol: "id" },
  { name: "reports", idCol: "id" },
  { name: "mentoring_sessions", idCol: "id" },
  { name: "ratings", idCol: "id" },
  { name: "moderation_actions", idCol: "id" },
  { name: "mentor_applications", idCol: "id" },
  { name: "refresh_tokens", idCol: "id" },
  { name: "schema_migrations", idCol: "id" },
];

async function main() {
  console.log("=== TABLE STATUS ===");
  const existing = new Set();
  for (const { name, idCol } of TABLES) {
    const { data, error } = await supabase.from(name).select(idCol).limit(1);
    if (error) {
      console.log(`  ✗ ${name}: ${error.code || error.message?.substring(0, 60)}`);
    } else {
      console.log(`  ✓ ${name}: exists`);
      existing.add(name);
    }
  }

  console.log("\n=== STORAGE BUCKETS ===");
  const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
  if (bucketErr) {
    console.log("  Error listing buckets:", bucketErr.message);
  } else if (buckets && buckets.length > 0) {
    buckets.forEach((b) =>
      console.log(`  ${b.name} (${b.public ? "public" : "private"})`)
    );
  } else {
    console.log("  (none)");
  }

  const hasBackups = buckets?.some((b) => b.name === "backups");
  if (!hasBackups) {
    console.log("\n  Creating 'backups' bucket (private)...");
    const { data, error } = await supabase.storage.createBucket("backups", {
      public: false,
    });
    if (error) {
      console.log("  ✗ Failed:", error.message);
    } else {
      console.log("  ✓ Created:", data?.name);
    }
  }

  console.log("\n=== MIGRATION STATUS ===");
  const hasSchemaMigrations = existing.has("schema_migrations");
  if (!hasSchemaMigrations) {
    console.log("  schema_migrations: MISSING");
    console.log("  → Run 004_backup_infrastructure.sql in Supabase SQL Editor");
  } else {
    const { data: applied } = await supabase
      .from("schema_migrations")
      .select("name")
      .order("name");
    const appliedNames = (applied || []).map((r) => r.name);
    console.log("  Applied:", appliedNames.length ? appliedNames.join(", ") : "(none)");
  }

  console.log("\n=== WHAT NEEDS TO HAPPEN ===");
  if (!hasSchemaMigrations) {
    console.log("  1. Run migration 004_backup_infrastructure.sql in Supabase SQL Editor");
  }
  const missingTables = TABLES.filter((t) => !existing.has(t.name) && t.name !== "schema_migrations");
  if (missingTables.length > 0) {
    console.log("  Missing tables:", missingTables.map((t) => t.name).join(", "));
    console.log("  → Run migrations 001-003 in Supabase SQL Editor (skip parts that already exist)");
  }

  if (hasSchemaMigrations && missingTables.length === 0) {
    console.log("  ✓ Database is ready!");
  }
  console.log("  Then: restart Render backend + redeploy frontend to Vercel");
}

main().catch((e) => {
  console.error("Setup check failed:", e.message);
  process.exit(1);
});
