-- Migration 004: Backup & migration tracking infrastructure
-- Creates tables needed for the admin backup system to function

create table if not exists public.schema_migrations (
  id serial primary key,
  name text unique not null,
  applied_at timestamptz not null default now()
);

create index if not exists idx_schema_migrations_name on public.schema_migrations (name);
