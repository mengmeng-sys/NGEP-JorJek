-- =========================================================
-- JorJek MVP schema — run this whole file in Supabase's SQL Editor
-- Order matters: tables reference earlier tables, so this must run top-to-bottom.
-- =========================================================

-- ---------------------------------------------------------
-- profiles (extends Supabase's built-in auth.users)
-- ---------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null,
  role text not null default 'student' check (role in ('student', 'mentor')),
  bio text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up via Supabase Auth
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- skill_tags
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
  author_id uuid not null references public.profiles(id) on delete cascade,
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
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- votes (one row targets a post OR a comment, never both)
-- ---------------------------------------------------------
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
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
-- mentoring_sessions
-- ---------------------------------------------------------
create table public.mentoring_sessions (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.profiles(id) on delete cascade,
  mentee_id uuid not null references public.profiles(id) on delete cascade,
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
  rater_id uuid not null references public.profiles(id) on delete cascade,
  ratee_id uuid not null references public.profiles(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  review_text text,
  created_at timestamptz not null default now(),
  unique (session_id, rater_id)
);