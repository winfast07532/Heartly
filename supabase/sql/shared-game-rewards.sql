-- Shared once-only milestone receipts, preserving existing reward amounts.
create or replace function public.heartly_claim_game_milestones(game_name text,legacy_claims jsonb default '{}')
returns jsonb language plpgsql security invoker set search_path='' as $$
declare row_data public.couple_state; score numeric; threshold integer; prize integer; receipts jsonb; total integer:=0; stamp numeric:=extract(epoch from clock_timestamp())*1000; entry jsonb; i integer;
  thresholds integer[]:=array[2000,10000,50000,200000,1000000,5000000];
  prizes integer[]:=array[30,50,90,160,280,450];
begin
  if public.heartly_member_role() is null or game_name not in ('clicker','blast') then raise exception 'Invalid game access'; end if;
  select * into row_data from public.couple_state where id='heartly-couple' for update;
  score:=coalesce((row_data.data->>(game_name||'LifetimeScore'))::numeric,0);
  receipts:=coalesce(row_data.data->'gameMilestoneReceipts','{}');
  for i in 1..array_length(thresholds,1) loop
    threshold:=thresholds[i];prize:=prizes[i];
    if not (receipts ? (game_name||'_'||threshold)) and (score>=threshold or legacy_claims->>threshold::text='true') then
      receipts:=receipts||jsonb_build_object(game_name||'_'||threshold,stamp);
      if legacy_claims->>threshold::text='true' then continue; end if;
      total:=total+prize;
      entry:=jsonb_build_object('id','milestone:'||game_name||':'||threshold,'ts',stamp,'amt','+'||prize,'type','earn','icon','🏆','title',case when game_name='clicker' then 'Love Clicker' else 'Love Blast' end||': '||threshold||' lifetime score');
      row_data.data:=jsonb_set(row_data.data,'{txLog}',jsonb_build_array(entry)||coalesce(row_data.data->'txLog','[]'));
      row_data.data:=jsonb_set(row_data.data,'{ptsLog}',coalesce(row_data.data->'ptsLog','[]')||jsonb_build_array(jsonb_build_object('id',entry->>'id','ts',stamp,'amt',prize)));
    end if;
  end loop;
  row_data.data:=row_data.data||jsonb_build_object('gameMilestoneReceipts',receipts,'ptsVal',coalesce((row_data.data->>'ptsVal')::numeric,0)+total,'totalPtsEarned',coalesce((row_data.data->>'totalPtsEarned')::numeric,0)+total);
  perform set_config('heartly.safe_write','1',true);
  update public.couple_state set data=row_data.data,updated_at=clock_timestamp(),updated_by='game-milestone' where id=row_data.id returning * into row_data;
  return jsonb_build_object('data',row_data.data,'updated_at',row_data.updated_at,'awarded',total);
end $$;
revoke all on function public.heartly_claim_game_milestones(text,jsonb) from public,anon;
grant execute on function public.heartly_claim_game_milestones(text,jsonb) to authenticated;

-- Existing shared lifetime totals already include old games. Record earned
-- thresholds without paying them again; local receipts are also imported on use.
do $$ declare r public.couple_state; g text; n integer; receipts jsonb; begin
 select * into r from public.couple_state where id='heartly-couple' for update;
 receipts:=coalesce(r.data->'gameMilestoneReceipts','{}');
 foreach g in array array['clicker','blast'] loop foreach n in array array[2000,10000,50000,200000,1000000,5000000] loop
   if coalesce((r.data->>(g||'LifetimeScore'))::numeric,0)>=n and not(receipts?(g||'_'||n)) then receipts:=receipts||jsonb_build_object(g||'_'||n,extract(epoch from now())*1000); end if;
 end loop; end loop;
 update public.couple_state set data=data||jsonb_build_object('gameMilestoneReceipts',receipts) where id=r.id;
end $$;
