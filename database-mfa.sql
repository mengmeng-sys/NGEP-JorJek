-- =========================================================
-- MFA (TOTP Authenticator) migration for JorJek
-- Run this in Supabase SQL Editor
-- =========================================================

-- Add MFA columns to users table
alter table public.users
  add column if not exists totp_secret text,
  add column if not exists totp_enabled boolean not null default false,
  add column if not exists totp_backup_codes jsonb,
  add column if not exists otp_code text,
  add column if not exists otp_expires_at timestamptz,
  add column if not exists token_version integer not null default 0;

-- Index for faster lookups
create index if not exists users_totp_enabled_idx on public.users (totp_enabled) where totp_enabled = true;
