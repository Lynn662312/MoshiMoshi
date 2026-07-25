alter table public.rescue_sessions
  add column if not exists preferred_language text not null default 'English';

alter table public.rescue_sessions
  drop constraint if exists rescue_sessions_preferred_language_check;

alter table public.rescue_sessions
  add constraint rescue_sessions_preferred_language_check
  check (preferred_language in ('English', 'Simplified Chinese'));
