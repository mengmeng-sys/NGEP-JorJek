-- =========================================================
-- JorJek MVP schema — run this whole file in Supabase's SQL Editor
-- Order matters: tables reference earlier tables, so this must run top-to-bottom.
-- =========================================================

-- ---------------------------------------------------------
-- profiles (extends Supabase's built-in auth.users)
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