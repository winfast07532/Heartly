import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import '../../../pet/config.js';
import '../../../pet/content.js';
import '../../../pet/layout.js';
import '../../../pet/core.js';

const C = (globalThis as any).PetCore;
const config = (globalThis as any).PetConfig;
const headers = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'apikey,content-type,authorization,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const reply = (body: unknown, status=200) => new Response(JSON.stringify(body),{status,headers});
const clientKey = 'sb_publishable_uQzy4bdgclCGitmi0lEiyw_zralr47Z';

Deno.serve(async req => {
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(req.method!=='POST')return reply({error:'Use POST.'},405);
  try {
    const authorization=req.headers.get('authorization')||'';
    if(!authorization.startsWith('Bearer '))return reply({error:'Sign in to Heartly to care for your companion.'},401);
    const userClient=createClient(Deno.env.get('SUPABASE_URL')!,clientKey,{global:{headers:{Authorization:authorization}},auth:{persistSession:false}});
    const {data:identity,error:authError}=await userClient.auth.getUser(authorization.slice(7));
    if(authError||!identity.user||!identity.user.email_confirmed_at||identity.user.is_anonymous)return reply({error:'Please sign in again.'},401);
    const {data:memberRole,error:memberError}=await userClient.rpc('heartly_member_role');
    if(memberError||!['robert','ana'].includes(memberRole))return reply({error:'This account does not have access to this Heartly home.'},403);
    const text=await req.text();if(text.length>32000)return reply({error:'This action is too large.'},413);
    const {command,configVersion}=JSON.parse(text);
    const issued=Number(command?.id?.split('_')[0]);
    if(!Number.isSafeInteger(issued)||issued<Date.now()-86400000||issued>Date.now()+300000)return reply({error:'This action expired. Close and reopen Little Home, then try again.'},400);
    if(configVersion!==config.version)return reply({error:'The shop was updated. Close and reopen Little Home.'},409);
    const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
    for(let attempt=0;attempt<5;attempt++){
      const {data:context,error}=await db.rpc('heartly_pet_context');
      if(error||!context)throw Error('Heartly could not load your cloud save. Try again.');
      const state=context.petState?C.validate(context.petState):C.empty(Date.now());
      state.balance=Number(context.balance||0);state.clockOffset=0;
      for(const [id,receipt] of Object.entries(state.receipts))if((receipt as any).at<Date.now()-2*86400000)delete state.receipts[id];
      // Never import the standalone wallet, clock or progress into live Heartly.
      const result=C.transact(state,command,Date.now());
      if(result.duplicate)return reply({...result,...context,serverNow:Date.now()});
      const delta=result.state.balance-state.balance;
      const {data:saved,error:commitError}=await db.rpc('heartly_commit_pet',{expected_at:context.updatedAt,next_pet:result.state,wallet_delta:delta});
      if(commitError)throw Error('Could not save your pet. Please try again.');
      if(saved)return reply({message:result.message,reaction:result.reaction,...saved,serverNow:Date.now()});
    }
    return reply({error:'Heartly is syncing another change. Please try again.'},409);
  }catch(error){return reply({error:error instanceof Error?error.message:'Could not save this action.'},400);}
});
