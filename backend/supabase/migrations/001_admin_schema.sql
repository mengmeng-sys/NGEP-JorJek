-- =========================================================
-- Admin Dashboard schema extensions for Supabase
-- Run this in Supabase SQL Editor after the base schema
-- =========================================================

-- ---------------------------------------------------------
-- Extend users table
-- ---------------------------------------------------------
alter table public.users
  add column if not exists status text not null default 'ACTIVE'
    check (status in ('ACTIVE', 'SUSPENDED', 'BANNED')),
  add column if not exists suspended_until timestamptz,
  add column if not exists is_mentor boolean not null default false,
  add column if not exists token_version integer not null default 0,
  add column if not exists email_verified boolean not null default false;

-- Extend role to include MODERATOR and SUPER_ADMIN
alter table public.users
  drop constraint if exists users_role_check;
alter table public.users
  add constraint users_role_check
    check (role in ('STUDENT', 'PROFESSOR', 'MODERATOR', 'SUPER_ADMIN'));

-- ---------------------------------------------------------
-- Extend reports table
-- ---------------------------------------------------------
alter table public.reports
  add column if not exists status text not null default 'PENDING'
    check (status in ('PENDING', 'APPROVED', 'DISMISSED', 'WARNED')),
  add column if not exists moderation_note text,
  add column if not exists resolved_at timestamptz,
  add column if not exists resolved_by uuid references public.users(id) on delete set null;

-- ---------------------------------------------------------
-- Extend skill_tags table
-- ---------------------------------------------------------
alter table public.skill_tags
  add column if not exists featured boolean not null default false;

-- ---------------------------------------------------------
-- moderation_actions — audit trail for suspensions/bans/warnings
-- ---------------------------------------------------------
create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.users(id) on delete cascade,
  target_user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('SUSPEND', 'BAN', 'WARN', 'RESTORE')),
  duration_days integer,
  reason text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_moderation_actions_target
  on public.moderation_actions (target_user_id, created_at desc);

create index if not exists idx_moderation_actions_admin
  on public.moderation_actions (admin_id, created_at desc);

-- ---------------------------------------------------------
-- mentor_applications — verification pipeline
-- ---------------------------------------------------------
create table if not exists public.mentor_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  department text,
  credential_summary text,
  claimed_tags text[] not null default '{}',
  status text not null default 'PENDING'
    check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  review_note text,
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_mentor_applications_status
  on public.mentor_applications (status, created_at desc);

-- ---------------------------------------------------------
-- Add deleted_at to posts and comments for soft delete (SRS 2.2)
-- ---------------------------------------------------------
alter table public.posts
  add column if not exists deleted_at timestamptz;

alter table public.comments
  add column if not exists deleted_at timestamptz;

-- ---------------------------------------------------------
-- Extend mentoring_sessions table
-- ---------------------------------------------------------
alter table public.mentoring_sessions
  add column if not exists meeting_link text,
  add column if not exists max_students integer not null default 3,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancel_reason text;
