create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists public.waitlist_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  email citext not null unique,
  social text,
  stage text not null check (stage in ('idea', 'validando', 'mvp', 'lanzado')),
  project text,
  source_path text,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.guide_downloads (
  id uuid primary key default gen_random_uuid(),
  download_type text not null check (download_type in ('base', 'with_answers')),
  answers jsonb not null default '{}'::jsonb,
  answer_count integer not null default 0 check (answer_count >= 0),
  source_path text,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.waitlist_leads enable row level security;
alter table public.guide_downloads enable row level security;

drop policy if exists "Anyone can join the waitlist" on public.waitlist_leads;
create policy "Anyone can join the waitlist"
  on public.waitlist_leads
  for insert
  to anon
  with check (true);

drop policy if exists "Anyone can register guide downloads" on public.guide_downloads;
create policy "Anyone can register guide downloads"
  on public.guide_downloads
  for insert
  to anon
  with check (true);

grant usage on schema public to anon;
revoke select, update, delete on public.waitlist_leads from anon, authenticated;
revoke select, update, delete on public.guide_downloads from anon, authenticated;
revoke insert on public.waitlist_leads from authenticated;
revoke insert on public.guide_downloads from authenticated;
grant insert on public.waitlist_leads to anon;
grant insert on public.guide_downloads to anon;
