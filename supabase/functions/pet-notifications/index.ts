import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import '../../../pet/config.js';
import '../../../pet/content.js';
import '../../../pet/layout.js';
import '../../../pet/core.js';
import '../../../pet/notifications.js';

const reply=(body:unknown,status=200)=>Response.json(body,{status});
Deno.serve(async req=>{
  if(req.method!=='POST')return reply({error:'Use POST'},405);
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  try{
    const {data:authorized,error:authError}=await db.rpc('heartly_pet_cron_authorized',{candidate:req.headers.get('x-pet-cron')||''});
    if(authError||!authorized)return reply({error:'Unauthorized'},401);
    const {data:row,error}=await db.from('couple_state').select('data,updated_at').eq('id','heartly-couple').single();
    if(error)throw error;
    const checks=(globalThis as any).PetNotifications.evaluate(row.data.petState,Date.now(),(globalThis as any).PetCore);
    if(!checks.length)return reply({ok:true,checked:0,sent:0});
    const {data:subs,error:subError}=await db.from('push_subscriptions').select('id,endpoint,p256dh,auth').in('role',['ana','robert']);
    if(subError)throw subError;
    webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT')||'mailto:heartly@example.com',Deno.env.get('VAPID_PUBLIC_KEY')!.trim(),Deno.env.get('VAPID_PRIVATE_KEY')!.trim());
    let sent=0,failed=0;
    for(const check of checks)await Promise.all((subs||[]).map(async sub=>{
      const args={pet_id_arg:check.petId,metric_arg:check.metric,subscription_arg:sub.id};
      const {data:lease,error:claimError}=await db.rpc('heartly_claim_pet_alert',{...args,low_arg:check.low,expected_at:row.updated_at});
      if(claimError)throw claimError;
      if(!lease)return;
      let delivered=false;
      try{
        await webpush.sendNotification({endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth}},JSON.stringify({title:check.title,body:check.body,tag:check.tag,url:check.url}),{TTL:1800,timeout:5000});
        delivered=true;sent++;
      }catch(error){
        failed++;
        // Retain subscription data; existing push maintenance handles expired devices.
        console.warn('Pet push failed',sub.id,check.metric,(error as any)?.statusCode||'network');
      }
      const {error:finishError}=await db.rpc('heartly_finish_pet_alert',{...args,lease_arg:lease,delivered_arg:delivered});
      if(finishError)throw finishError;
    }));
    return reply({ok:failed===0,checked:checks.length,sent,failed});
  }catch(error){console.error('Pet notification check failed',String(error));return reply({error:'Pet notification check failed'},500);}
});
