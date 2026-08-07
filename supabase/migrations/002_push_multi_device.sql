-- ═══════════════════════════════════════════════════
-- Heartly push notifications — multi-device support
-- Already applied directly to the live project on 2026-07-13.
-- Kept here so a fresh environment / re-deploy ends up with the
-- same schema. Safe to re-run: guarded with IF EXISTS / IF NOT EXISTS.
-- ═══════════════════════════════════════════════════

-- Previously `role` was the primary key, meaning only ONE device could
-- ever be registered per person — subscribing from a second device
-- (e.g. a PC after already enabling on a phone) silently overwrote the
-- first, and pushes would only ever reach whichever device was newest.
--
-- This adds a surrogate id as the primary key and makes `endpoint`
-- unique instead, so each browser/device gets its own row and
-- send-push notifies all of them.

alter table push_subscriptions add column if not exists id uuid not null default gen_random_uuid();

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'push_subscriptions_pkey' and conrelid = 'push_subscriptions'::regclass
  ) then
    alter table push_subscriptions drop constraint push_subscriptions_pkey;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'push_subscriptions_id_pkey' and conrelid = 'push_subscriptions'::regclass
  ) then
    alter table push_subscriptions add constraint push_subscriptions_id_pkey primary key (id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'push_subscriptions_endpoint_key' and conrelid = 'push_subscriptions'::regclass
  ) then
    alter table push_subscriptions add constraint push_subscriptions_endpoint_key unique (endpoint);
  end if;
end $$;
