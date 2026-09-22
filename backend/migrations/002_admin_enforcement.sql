-- Migration 002: Admin enforcement and mentor applications
-- Adds moderation_actions and mentor_applications tables

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

create table if not exists public.mentor_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  department text,
  credential_summary text,
  claimed_tags text[] not null default '{}',
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  review_note text,
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_mentor_applications_status
  on public.mentor_applications (status, created_at desc);
