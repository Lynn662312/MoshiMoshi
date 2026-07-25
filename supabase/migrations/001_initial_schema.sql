create extension if not exists pgcrypto;

create table if not exists public.rescue_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('locker', 'transport', 'hotel', 'other')),
  situation text not null,
  location_context text,
  known_information text,
  status text not null default 'active' check (status in ('active', 'resolved', 'archived')),
  diagnosis jsonb,
  rescue_plan jsonb,
  conversation_history jsonb not null default '[]'::jsonb,
  provider_metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rescue_sessions_user_created_idx
  on public.rescue_sessions (user_id, created_at desc);

alter table public.rescue_sessions enable row level security;

revoke all on table public.rescue_sessions from anon;
grant select, insert, update, delete on table public.rescue_sessions to authenticated;

create policy "Users can read their own rescue sessions"
  on public.rescue_sessions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own rescue sessions"
  on public.rescue_sessions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own rescue sessions"
  on public.rescue_sessions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own rescue sessions"
  on public.rescue_sessions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_rescue_session_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_rescue_session_updated_at() from public;

create trigger rescue_sessions_set_updated_at
before update on public.rescue_sessions
for each row execute function public.set_rescue_session_updated_at();
