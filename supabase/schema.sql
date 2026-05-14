create extension if not exists "pgcrypto";

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  report_json jsonb not null,
  created_at timestamptz not null default now()
);
