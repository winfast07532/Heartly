-- Pet state lives in the existing snapshot, so DB and GitHub backups restore it together.
-- Ordinary Heartly writes may change other fields, but cannot replace the pet.
create or replace function public.heartly_preserve_pet()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare old_total numeric := coalesce((old.data->>'petWalletTotal')::numeric,0);
        sent_total numeric := coalesce((new.data->>'petWalletTotal')::numeric,0);
begin
  if current_user in ('service_role','postgres','supabase_admin') then return new; end if;
  if old_total <> 0 and not (new.data ? 'petWalletTotal') then
    raise exception 'HEARTLY_REFRESH_REQUIRED: Refresh Heartly before saving from this older version.';
  end if;
  new.data := (new.data - 'petState' - 'petWalletTotal') ||
    jsonb_build_object('petState',old.data->'petState','petWalletTotal',old_total,
      'ptsVal',coalesce((new.data->>'ptsVal')::numeric,0)+old_total-sent_total);
  new.data := new.data || jsonb_build_object('petEarnedTotal',coalesce(old.data->'petEarnedTotal','0'::jsonb),
    'totalPtsEarned',coalesce((new.data->>'totalPtsEarned')::numeric,0)+coalesce((old.data->>'petEarnedTotal')::numeric,0)-coalesce((new.data->>'petEarnedTotal')::numeric,0));
  if (new.data->>'ptsVal')::numeric < 0 then raise exception 'HEARTLY_REFRESH_REQUIRED: Another device spent these points. Refresh Heartly.'; end if;
  return new;
end $$;
create or replace trigger heartly_preserve_pet before update on public.couple_state
for each row execute function public.heartly_preserve_pet();

create or replace function public.heartly_pet_context()
returns jsonb language sql security invoker set search_path = '' as $$
 select jsonb_build_object('petState',data->'petState','balance',data->'ptsVal',
   'txLog',data->'txLog','ptsLog',data->'ptsLog','petWalletTotal',coalesce(data->'petWalletTotal','0'::jsonb),'petEarnedTotal',coalesce(data->'petEarnedTotal','0'::jsonb),'updatedAt',updated_at)
 from public.couple_state where id='heartly-couple';
$$;

-- Only the Edge Function may commit a validated command. Optimistic locking
-- retries against fresh data if any Heartly write wins the race first.
create or replace function public.heartly_commit_pet(expected_at timestamptz, next_pet jsonb, wallet_delta numeric)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare current_row public.couple_state; next_data jsonb; next_balance numeric; next_total numeric;
begin
 select * into current_row from public.couple_state where id='heartly-couple' for update;
 if not found or current_row.updated_at is distinct from expected_at then return null; end if;
 next_balance := coalesce((current_row.data->>'ptsVal')::numeric,0)+wallet_delta;
 if next_balance < 0 or wallet_delta <> trunc(wallet_delta) then raise exception 'Invalid pet balance'; end if;
 next_total := coalesce((current_row.data->>'petWalletTotal')::numeric,0)+wallet_delta;
 next_data := current_row.data || jsonb_build_object('petState',next_pet,'ptsVal',next_balance,'petWalletTotal',next_total);
 if wallet_delta > 0 then
   next_data := next_data || jsonb_build_object('totalPtsEarned',coalesce((next_data->>'totalPtsEarned')::numeric,0)+wallet_delta,'petEarnedTotal',coalesce((next_data->>'petEarnedTotal')::numeric,0)+wallet_delta);
 end if;
 if wallet_delta<>0 then
   next_data:=jsonb_set(next_data,'{txLog}',jsonb_build_array(jsonb_build_object(
     'id','pet:'||(next_pet->'pet'->>'id')||':'||(next_pet->>'revision'),'ts',(next_pet->>'updatedAt')::numeric,
     'title','Little Home: '||coalesce(next_pet->'ledger'->0->>'label','Pet transaction'),'icon','🐾',
     'amt',case when wallet_delta>0 then '+' else '' end||wallet_delta::text,'type',case when wallet_delta>0 then 'earn' else 'spend' end))||coalesce(next_data->'txLog','[]'));
   next_data:=jsonb_set(next_data,'{ptsLog}',coalesce(next_data->'ptsLog','[]')||jsonb_build_array(jsonb_build_object(
     'id','pet:'||(next_pet->'pet'->>'id')||':'||(next_pet->>'revision'),'ts',(next_pet->>'updatedAt')::numeric,'amt',wallet_delta)));
 end if;
 next_data:=jsonb_set(next_data,'{txLog}',(select coalesce(jsonb_agg(value),'[]') from (select value from jsonb_array_elements(coalesce(next_data->'txLog','[]')) order by (value->>'ts')::numeric desc limit 100)t));
 next_data:=jsonb_set(next_data,'{ptsLog}',(select coalesce(jsonb_agg(value),'[]') from jsonb_array_elements(coalesce(next_data->'ptsLog','[]')) where (value->>'ts')::numeric>=extract(epoch from now()-interval '30 days')*1000));
 update public.couple_state set data=next_data,updated_by='pet-game',updated_at=clock_timestamp() where id=current_row.id;
 return public.heartly_pet_context();
end $$;
revoke all on function public.heartly_commit_pet(timestamptz,jsonb,numeric) from public,anon,authenticated;
grant execute on function public.heartly_commit_pet(timestamptz,jsonb,numeric) to service_role;
revoke all on function public.heartly_pet_context() from public,anon,authenticated;
grant execute on function public.heartly_pet_context() to service_role;
