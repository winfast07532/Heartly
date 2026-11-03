-- A separate server-only credential keeps cron working without a browser session.
do $$ begin
 if not exists(select 1 from vault.secrets where name='heartly_backup_cron') then
   perform vault.create_secret(gen_random_uuid()::text||gen_random_uuid()::text,'heartly_backup_cron','Heartly scheduled backup authentication');
 end if;
end $$;
create or replace function public.heartly_backup_cron_authorized(candidate text)
returns boolean language sql security definer set search_path='' as $$
 select length(candidate)>50 and exists(select 1 from vault.decrypted_secrets where name='heartly_backup_cron' and decrypted_secret=candidate);
$$;
revoke all on function public.heartly_backup_cron_authorized(text) from public,anon,authenticated;
grant execute on function public.heartly_backup_cron_authorized(text) to service_role;
do $$ begin
 perform cron.alter_job((select jobid from cron.job where jobname='backup-state-every-6h'),command := $cron$
  select net.http_post(
    url := 'https://kwtcdaapoqknerwvplze.supabase.co/functions/v1/backup-state',
    headers := jsonb_build_object('Content-Type','application/json','apikey','sb_publishable_uQzy4bdgclCGitmi0lEiyw_zralr47Z',
      'x-heartly-backup-key',(select decrypted_secret from vault.decrypted_secrets where name='heartly_backup_cron')),
    body := jsonb_build_object('action','run','source','cron'),
    timeout_milliseconds := 30000
  );
 $cron$);
end $$;
