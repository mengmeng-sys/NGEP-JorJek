-- =========================================================
-- JorJek MVP schema — run this whole file in Supabase's SQL Editor
-- Order matters: tables reference earlier tables, so this must run top-to-bottom.
--
-- Rewritten from your original version to use custom auth (bcrypt + JWT,
-- what auth.routes.js actually does) instead of Supabase Auth. Your
-- original had `profiles` extending `auth.users` via a trigger — that's
-- the standard Supabase-Auth pattern, but it's not what this backend does,
-- and it doesn't match the team's own documented decision from when
-- Prisma was dropped: "not a move to Supabase Auth/RLS/Realtime — just
-- swapping the DB client library."
--
-- Changes from your version, all flagged inline below:
--   1. profiles (+ its trigger/function tied to auth.users) replaced with
--      a self-contained users table.
--   2. Every foreign key that pointed at profiles(id) now points at
--      users(id) instead.
--   3. Added users.karma — karma.service.js reads/writes it, nothing had it.
--   4. Added posts.type — "question / offer / resource" is core to the
--      product per your project scope doc; there was nowhere to store it.
--   5. Added notifications, reports, and tag_follows tables — all three
--      are in-scope features (notifications, report/flag, tag auto-follow)
--      whose route/service code already exists but had no table to write to.
--   6. Fixed users.role's check constraint to match what auth.routes.js
--      actually sends ('STUDENT' / 'PROFESSOR', uppercase) — your version
--      had ('student', 'mentor'), which the signup route would have
--      violated the first time anyone signed up without a role.
-- Everything else (the nullable comment/vote columns, the vote exclusivity
-- check, the unique indexes, the ratings/mentoring_sessions checks) was
-- already correct in your version and is kept as-is.
--
-- Safe to run as a clean slate since there's no data yet.
-- =========================================================

-- ---------------------------------------------------------
-- Clean slate: drop everything from the previous (profiles-based) attempt.
-- ---------------------------------------------------------
drop table if exists public.ratings cascade;
drop table if exists public.mentoring_sessions cascade;
drop table if exists public.reports cascade;
drop table if exists public.notifications cascade;
drop table if exists public.tag_follows cascade;
drop table if exists public.votes cascade;
drop table if exists public.comments cascade;
drop table if exists public.post_tags cascade;
drop table if exists public.posts cascade;
drop table if exists public.skill_tags cascade;
drop table if exists public.users cascade;
drop table if exists public.profiles cascade;
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- ---------------------------------------------------------
-- users — self-contained, custom auth (bcrypt + JWT in auth.routes.js).
-- Not linked to Supabase's own auth.users; the backend owns signup/login.
-- Do NOT enable Row Level Security — the backend uses the service_role
-- key and enforces access itself via the requireAuth middleware.
-- ---------------------------------------------------------
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  display_name text not null,
  role text not null default 'STUDENT' check (role in ('STUDENT', 'PROFESSOR')),
  bio text,
  karma integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- skill_tags — curated taxonomy (admin/DB-role managed, not free text
-- typed by users on post creation — see the note from the schema review).
-- ---------------------------------------------------------
create table public.skill_tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text
);

-- ---------------------------------------------------------
-- posts
-- ---------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete cascade,
  type text not null default 'question' check (type in ('question', 'offer', 'resource')),
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- ---------------------------------------------------------
-- post_tags (junction)
-- ---------------------------------------------------------
create table public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.skill_tags(id),
  primary key (post_id, tag_id)
);

-- ---------------------------------------------------------
-- comments
-- ---------------------------------------------------------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- votes (one row targets a post OR a comment, never both)
-- ---------------------------------------------------------
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  value smallint not null check (value in (1, -1)),
  created_at timestamptz not null default now(),
  check (num_nonnulls(post_id, comment_id) = 1)
);

-- one vote per user per post, and separately, one vote per user per comment
create unique index votes_user_post_uniq
  on public.votes (user_id, post_id)
  where comment_id is null;

create unique index votes_user_comment_uniq
  on public.votes (user_id, comment_id)
  where post_id is null;

-- ---------------------------------------------------------
-- tag_follows (junction) — powers the tag auto-follow feature
-- ---------------------------------------------------------
create table public.tag_follows (
  user_id uuid not null references public.users(id) on delete cascade,
  tag_id uuid not null references public.skill_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, tag_id)
);

-- ---------------------------------------------------------
-- notifications
-- ---------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  payload jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- reports
-- ---------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  target_user_id uuid references public.users(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- mentoring_sessions
-- ---------------------------------------------------------
create table public.mentoring_sessions (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.users(id) on delete cascade,
  mentee_id uuid not null references public.users(id) on delete cascade,
  source_comment_id uuid references public.comments(id) on delete set null,
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'completed', 'cancelled')),
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  check (mentor_id <> mentee_id)
);

-- ---------------------------------------------------------
-- ratings
-- ---------------------------------------------------------
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.mentoring_sessions(id) on delete cascade,
  rater_id uuid not null references public.users(id) on delete cascade,
  ratee_id uuid not null references public.users(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  review_text text,
  created_at timestamptz not null default now(),
  unique (session_id, rater_id)
);
