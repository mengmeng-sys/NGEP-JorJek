-- =========================================================
-- Security: refresh_tokens table for token rotation
-- Run this in Supabase SQL Editor
-- =========================================================

create table if not exists public.refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text unique not null,
  user_id uuid not null references public.users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_refresh_tokens_user_id on public.refresh_tokens(user_id);
create index if not exists idx_refresh_tokens_hash on public.refresh_tokens(token_hash);
create index if not exists idx_refresh_tokens_expires on public.refresh_tokens(expires_at);

-- Auto-cleanup expired tokens (optional, run periodically)
-- delete from public.refresh_tokens where expires_at < now() - interval '7 days';
