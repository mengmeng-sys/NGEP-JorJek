-- ---------------------------------------------------------
-- JorJek: privacy settings migration
-- Run this in Supabase's SQL Editor if the `users` table was
-- created from an older version of database.sql.
-- ---------------------------------------------------------

alter table public.users
  add column if not exists show_profile_to_guests boolean not null default true,
  add column if not exists allow_direct_requests boolean not null default true,
  add column if not exists show_online_status boolean not null default false,
  add column if not exists receive_email_notifications boolean not null default true;