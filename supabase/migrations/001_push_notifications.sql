-- ═══════════════════════════════════════════════════
-- Heartly push notifications — schema
-- Run this once in the Supabase SQL Editor
-- (Project → SQL Editor → New query → paste → Run)
-- ═══════════════════════════════════════════════════

-- One row per device role. Only two roles exist in this app: 'ana' and 'robert'.
-- Re-subscribing (new device, cleared browser data, etc.) just overwrites the row.
create table if not exists push_subscriptions (
  role       text primary key check (role in ('ana','robert')),
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  updated_at timestamptz not null default now()
);

-- Tiny table so the scheduled function doesn't send the same
-- goodnight / streak-reminder push twice in one day.
create table if not exists push_log (
  key       text primary key,
  sent_date date not null
);

alter table push_subscriptions enable row level security;
alter table push_log enable row level security;

-- This app has no real auth — it's a single couple using the public anon
-- key client-side (same trust model as the existing couple_state table).
-- The Edge Functions use the service role key instead, so in practice these
-- policies only need to allow the browser to upsert its own subscription.
drop policy if exists "public read subs"   on push_subscriptions;
drop policy if exists "public upsert subs" on push_subscriptions;
drop policy if exists "public update subs" on push_subscriptions;

create policy "public read subs"   on push_subscriptions for select using (true);
create policy "public upsert subs" on push_subscriptions for insert with check (true);
create policy "public update subs" on push_subscriptions for update using (true);

-- push_log is only touched by the Edge Function (service role bypasses RLS),
-- so no public policies are needed on it.
