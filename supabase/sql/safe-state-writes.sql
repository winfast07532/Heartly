-- No gameplay data deletion. Invoker RPCs retain existing membership RLS.
create or replace function public.heartly_merge_json(b jsonb,l jsonb,r jsonb,p text default '')
returns jsonb language plpgsql security invoker set search_path='' as $$
declare k text; v jsonb; out jsonb:='{}';
begin
  if l is not distinct from b then return r; end if;
  if r is not distinct from b or l is not distinct from r then return l; end if;
  if p in ('txLog','ptsLog') and jsonb_typeof(l)='array' and jsonb_typeof(r)='array' then
    select coalesce(jsonb_agg(x order by (x->>'ts')::numeric desc),'[]') into out from
      (select distinct on(coalesce(value->>'id',value::text)) value as x from jsonb_array_elements(r||l) order by coalesce(value->>'id',value::text)) t;
    if p='txLog' then select coalesce(jsonb_agg(value),'[]') into out from(select value from jsonb_array_elements(out) limit 100)t;
    else select coalesce(jsonb_agg(value),'[]') into out from jsonb_array_elements(out) where (value->>'ts')::numeric>=extract(epoch from now()-interval '30 days')*1000; end if;
    return out;
  end if;
  if jsonb_typeof(l)='object' and jsonb_typeof(r)='object' and (b is null or jsonb_typeof(b)='object') then
    for k in select jsonb_object_keys(coalesce(b,'{}')||l||r) loop
      v:=public.heartly_merge_json(b->k,l->k,r->k,case when p='' then k else p||'.'||k end);
      if v is not null then out:=out||jsonb_build_object(k,v); end if;
    end loop;
    return out;
  end if;
  raise exception 'SAVE_CONFLICT: %',p;
end $$;
create or replace function public.heartly_ordinary_state(s jsonb)
returns jsonb language sql immutable security invoker set search_path='' as $$
  select (coalesce(s,'{}')-'petState'-'petWalletTotal'-'petEarnedTotal'-'gameMilestoneReceipts'-'stateWriteReceipts') || jsonb_build_object(
    'ptsVal',coalesce((s->>'ptsVal')::numeric,0)-coalesce((s->>'petWalletTotal')::numeric,0),
    'totalPtsEarned',coalesce((s->>'totalPtsEarned')::numeric,0)-coalesce((s->>'petEarnedTotal')::numeric,0));
$$;
create or replace function public.heartly_save_state(base_data jsonb,next_data jsonb,request_id text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare row_data public.couple_state; merged jsonb; receipts jsonb;
begin
  if public.heartly_member_role() is null then raise exception 'Sign in to Heartly'; end if;
  if length(request_id)<10 or length(request_id)>100 or jsonb_typeof(next_data)<>'object' then raise exception 'Invalid save'; end if;
  select * into row_data from public.couple_state where id='heartly-couple' for update;
  if not found then raise exception 'Shared save is missing. Restore a backup before saving.'; end if;
  if row_data.data->'stateWriteReceipts' ? request_id then return to_jsonb(row_data); end if;
  merged:=public.heartly_merge_json(public.heartly_ordinary_state(base_data),public.heartly_ordinary_state(next_data),public.heartly_ordinary_state(row_data.data));
  select coalesce(jsonb_object_agg(key,value),'{}') into receipts from (select key,value from jsonb_each(coalesce(row_data.data->'stateWriteReceipts','{}')) order by value desc limit 99)t;
  merged:=merged||jsonb_build_object('petState',row_data.data->'petState','petWalletTotal',coalesce(row_data.data->'petWalletTotal','0'),'petEarnedTotal',coalesce(row_data.data->'petEarnedTotal','0'),
    'ptsVal',(merged->>'ptsVal')::numeric+coalesce((row_data.data->>'petWalletTotal')::numeric,0),
    'totalPtsEarned',(merged->>'totalPtsEarned')::numeric+coalesce((row_data.data->>'petEarnedTotal')::numeric,0),
    'gameMilestoneReceipts',coalesce(row_data.data->'gameMilestoneReceipts','{}'),'stateWriteReceipts',receipts||jsonb_build_object(request_id,extract(epoch from clock_timestamp())));
  if (merged->>'ptsVal')::numeric<0 then raise exception 'SAVE_CONFLICT: points already spent on another device'; end if;
  perform set_config('heartly.safe_write','1',true);
  update public.couple_state set data=merged,updated_at=clock_timestamp(),updated_by=public.heartly_member_role() where id=row_data.id returning * into row_data;
  return to_jsonb(row_data);
end $$;
create or replace function public.heartly_require_safe_write()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if current_user not in ('service_role','postgres','supabase_admin') and coalesce(current_setting('heartly.safe_write',true),'')<>'1' then
    raise exception 'HEARTLY_REFRESH_REQUIRED: Close and reopen Heartly to use safe saves.';
  end if; return new;
end $$;
-- Install this guard only after the new frontend has been published.
-- create or replace trigger heartly_require_safe_write before insert or update on public.couple_state for each row execute function public.heartly_require_safe_write();
revoke all on function public.heartly_merge_json(jsonb,jsonb,jsonb,text),public.heartly_ordinary_state(jsonb),public.heartly_save_state(jsonb,jsonb,text),public.heartly_require_safe_write() from public,anon;
grant execute on function public.heartly_merge_json(jsonb,jsonb,jsonb,text),public.heartly_ordinary_state(jsonb),public.heartly_save_state(jsonb,jsonb,text) to authenticated,service_role;
