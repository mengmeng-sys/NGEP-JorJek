-- =========================================================
-- JorJek Backup System Setup
-- Copy this ENTIRE file and run it in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- =========================================================

-- Migration 004: Create schema_migrations tracking table
create table if not exists public.schema_migrations (
  id serial primary key,
  name text unique not null,
  applied_at timestamptz not null default now()
);

create index if not exists idx_schema_migrations_name on public.schema_migrations (name);

-- Record that migrations 001-004 have been applied
insert into public.schema_migrations (name) values
  ('001_init.sql'),
  ('002_admin_enforcement.sql'),
  ('003_refresh_tokens.sql'),
  ('004_backup_infrastructure.sql')
on conflict (name) do nothing;
