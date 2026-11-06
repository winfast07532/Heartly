-- Reconstruct retained pet ledger entries only; no wallet/reward changes.
do $$
declare r public.couple_state; e jsonb; tx jsonb; pts jsonb; entry_id text; amount numeric; stamp numeric;
begin
 select * into r from public.couple_state where id='heartly-couple' for update;
 tx:=coalesce(r.data->'txLog','[]');pts:=coalesce(r.data->'ptsLog','[]');
 for e in select value from jsonb_array_elements(coalesce(r.data->'petState'->'ledger','[]')) loop
   amount:=(e->>'amount')::numeric;stamp:=(e->>'at')::numeric;
   entry_id:='pet-history:'||coalesce(r.data->'petState'->'pet'->>'id','legacy')||':'||stamp||':'||amount;
   if not exists(select 1 from jsonb_array_elements(tx) x where x->>'id'=entry_id or ((x->>'id') like 'pet:%' and (x->>'ts')::numeric=stamp)) then
     tx:=tx||jsonb_build_array(jsonb_build_object('id',entry_id,'ts',stamp,'title','Little Home: '||(e->>'label'),'icon','🐾','amt',case when amount>0 then '+' else '' end||amount::text,'type',case when amount>0 then 'earn' else 'spend' end));
   end if;
   if not exists(select 1 from jsonb_array_elements(pts) x where x->>'id'=entry_id or ((x->>'id') like 'pet:%' and (x->>'ts')::numeric=stamp)) then
     pts:=pts||jsonb_build_array(jsonb_build_object('id',entry_id,'ts',stamp,'amt',amount));
   end if;
 end loop;
 select coalesce(jsonb_agg(value order by (value->>'ts')::numeric desc),'[]') into tx from (select value from jsonb_array_elements(tx) order by (value->>'ts')::numeric desc limit 100)t;
 select coalesce(jsonb_agg(value),'[]') into pts from jsonb_array_elements(pts) where (value->>'ts')::numeric>=extract(epoch from now()-interval '30 days')*1000;
 update public.couple_state set data=data||jsonb_build_object('txLog',tx,'ptsLog',pts),updated_at=clock_timestamp(),updated_by='pet-history' where id=r.id;
  if (select data-'txLog'-'ptsLog' from public.couple_state where id=r.id) is distinct from (r.data-'txLog'-'ptsLog') then raise exception 'History backfill changed gameplay data'; end if;
end $$;
