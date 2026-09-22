-- Migration 001: Initial schema
-- Creates the base tables for the JorJek platform

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  display_name text not null,
  role text not null default 'STUDENT' check (role in ('STUDENT', 'PROFESSOR', 'MODERATOR', 'SUPER_ADMIN')),
  bio text,
  gen integer,
  department text,
  specialization text,
  avatar_url text,
  karma integer not null default 0,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'SUSPENDED', 'BANNED')),
  suspended_until timestamptz,
  is_mentor boolean not null default false,
  token_version integer not null default 0,
  otp_code text,
  otp_expires_at timestamptz,
  totp_secret text,
  totp_enabled boolean not null default false,
  totp_backup_codes jsonb,
  show_profile_to_guests boolean not null default true,
  allow_direct_requests boolean not null default true,
  show_online_status boolean not null default false,
  receive_email_notifications boolean not null default true,
  email_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.skill_tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  featured boolean not null default false
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete cascade,
  type text not null default 'question' check (type in ('question', 'offer', 'resource')),
  title text not null,
  body text,
  image_url text,
  allow_mentoring boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.skill_tags(id),
  primary key (post_id, tag_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  body text not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  value smallint not null check (value in (1, -1)),
  created_at timestamptz not null default now(),
  check (num_nonnulls(post_id, comment_id) = 1)
);

create unique index if not exists votes_user_post_uniq
  on public.votes (user_id, post_id)
  where comment_id is null;

create unique index if not exists votes_user_comment_uniq
  on public.votes (user_id, comment_id)
  where post_id is null;

create table if not exists public.tag_follows (
  user_id uuid not null references public.users(id) on delete cascade,
  tag_id uuid not null references public.skill_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, tag_id)
);

create table if not exists public.saved_posts (
  user_id uuid not null references public.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  payload jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  target_user_id uuid references public.users(id) on delete cascade,
  reason text not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'DISMISSED', 'WARNED')),
  moderation_note text,
  resolved_at timestamptz,
  resolved_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.mentoring_sessions (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.users(id) on delete cascade,
  mentee_id uuid not null references public.users(id) on delete cascade,
  source_comment_id uuid references public.comments(id) on delete set null,
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'completed', 'cancelled')),
  scheduled_at timestamptz,
  meeting_link text,
  max_students integer not null default 3,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now(),
  check (mentor_id <> mentee_id)
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.mentoring_sessions(id) on delete cascade,
  rater_id uuid not null references public.users(id) on delete cascade,
  ratee_id uuid not null references public.users(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  review_text text,
  created_at timestamptz not null default now(),
  unique (session_id, rater_id)
);
