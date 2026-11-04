-- Additive only: never modifies couple_state, points, pet inventory or backups.
create table if not exists public.pet_alert_delivery (
  pet_id text not null,
  metric text not null check (metric in ('hunger','happiness','cleanliness','energy')),
  subscription_id uuid not null,
  notified boolean not null default false,
  lease uuid,
  lease_until timestamptz,
  primary key(pet_id,metric,subscription_id)
);
alter table public.pet_alert_delivery enable row level security;
revoke all on public.pet_alert_delivery from public,anon,authenticated;
grant all on public.pet_alert_delivery to service_role;

do $$ begin
  if not exists(select 1 from vault.secrets where name='heartly_pet_cron') then
    perform vault.create_secret(gen_random_uuid()::text||gen_random_uuid()::text,'heartly_pet_cron');
  end if;
end $$;
create or replace function public.heartly_pet_cron_authorized(candidate text)
returns boolean language sql security definer set search_path='' as $$
  select length(candidate)>30 and exists(select 1 from vault.decrypted_secrets where name='heartly_pet_cron' and decrypted_secret=candidate);
$$;
revoke all on function public.heartly_pet_cron_authorized(text) from public,anon,authenticated;
grant execute on function public.heartly_pet_cron_authorized(text) to service_role;

create or replace function public.heartly_claim_pet_alert(pet_id_arg text,metric_arg text,subscription_arg uuid,low_arg boolean,expected_at timestamptz)
returns uuid language plpgsql security invoker set search_path='' as $$
declare result uuid;
begin
  -- A concurrent care action must win over a stale notification scan.
  perform 1 from public.couple_state where id='heartly-couple' and updated_at=expected_at and data->'petState'->'pet'->>'id'=pet_id_arg for share;
  if not found then return null; end if;
  insert into public.pet_alert_delivery(pet_id,metric,subscription_id) values(pet_id_arg,metric_arg,subscription_arg) on conflict do nothing;
  if not low_arg then
    update public.pet_alert_delivery set notified=false,lease=null,lease_until=null where pet_id=pet_id_arg and metric=metric_arg and subscription_id=subscription_arg;
    return null;
  end if;
  update public.pet_alert_delivery set lease=gen_random_uuid(),lease_until=clock_timestamp()+interval '2 minutes'
  where pet_id=pet_id_arg and metric=metric_arg and subscription_id=subscription_arg and not notified and (lease_until is null or lease_until<clock_timestamp()) returning lease into result;
  return result;
end $$;
create or replace function public.heartly_finish_pet_alert(pet_id_arg text,metric_arg text,subscription_arg uuid,lease_arg uuid,delivered_arg boolean)
returns void language sql security invoker set search_path='' as $$
  update public.pet_alert_delivery set notified=delivered_arg,lease=null,lease_until=null where pet_id=pet_id_arg and metric=metric_arg and subscription_id=subscription_arg and lease=lease_arg;
$$;
revoke all on function public.heartly_claim_pet_alert(text,text,uuid,boolean,timestamptz),public.heartly_finish_pet_alert(text,text,uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.heartly_claim_pet_alert(text,text,uuid,boolean,timestamptz),public.heartly_finish_pet_alert(text,text,uuid,uuid,boolean) to service_role;

-- Rearm immediately after successful care, even between scheduled scans.
create or replace function public.heartly_rearm_pet_alerts()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if current_user not in ('service_role','postgres','supabase_admin') then return new; end if;
  update public.pet_alert_delivery set notified=false,lease=null,lease_until=null
  where pet_id=new.data->'petState'->'pet'->>'id'
    and (new.data->'petState'->'pet'->'needs'->>metric)::numeric>=30;
  return new;
end $$;
create or replace trigger heartly_rearm_pet_alerts after update on public.couple_state
for each row when (old.data->'petState' is distinct from new.data->'petState') execute function public.heartly_rearm_pet_alerts();
revoke all on function public.heartly_rearm_pet_alerts() from public,anon,authenticated;

-- Run only after the worker is deployed. The token stays inside Vault.
select cron.schedule('heartly-pet-needs','*/5 * * * *',$job$
  select net.http_post(
    url:='https://kwtcdaapoqknerwvplze.supabase.co/functions/v1/pet-notifications',
    headers:=jsonb_build_object('Content-Type','application/json','x-pet-cron',(select decrypted_secret from vault.decrypted_secrets where name='heartly_pet_cron')),
    body:='{}'::jsonb,timeout_milliseconds:=30000
  );
$job$);
