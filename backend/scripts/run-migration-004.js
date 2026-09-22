#!/usr/bin/env node
require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function main() {
  const sqlFile = path.join(__dirname, "..", "migrations", "004_backup_infrastructure.sql");
  const sql = fs.readFileSync(sqlFile, "utf8");

  const client = new Client({
    host: "aws-0-ap-northeast-2.pooler.supabase.com",
    port: 6543,
    user: "postgres.jpcnqthawkjdsofjxhdp",
    password: "Tj47KgtShxaQ5dq6",
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    options: "project=jpcnqthawkjdsofjxhdp",
  });

  console.log("Connecting...");
  await client.connect();

  console.log("Running migration 004_backup_infrastructure.sql...");
  const result = await client.query(sql);
  console.log("Done:", result.command || "OK");

  const verify = await client.query("SELECT count(*) FROM schema_migrations");
  console.log("schema_migrations table ready, rows:", verify.rows[0].count);

  await client.end();
}

main().catch((e) => {
  console.error("Migration failed:", e.message);
  process.exit(1);
});
