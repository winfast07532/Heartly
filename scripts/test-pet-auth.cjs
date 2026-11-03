const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const {stripTypeScriptTypes}=require('node:module');
const C=require('../pet/core.js'),Config=require('../pet/config.js');
function load(name){
 let handler,commits=0,petState=null,wallet=500,total=0;
 const client=(url,key,options)=>({
  auth:{async getUser(token){return token==='invalid'?{error:Error('invalid')}:{data:{user:{email_confirmed_at:token==='unconfirmed'?null:'2026-01-01',is_anonymous:token==='anonymous'}}}}},
  async rpc(name,args){
   if(name==='heartly_member_role')return {data:({'Bearer member':'ana','Bearer developer':'robert'})[options?.global?.headers?.Authorization]||null};
   if(name==='heartly_backup_cron_authorized')return {data:args.candidate==='cron-test-token'};
   if(name==='heartly_pet_context')return {data:{petState,balance:wallet,petWalletTotal:total,updatedAt:'current'}};
   if(name==='heartly_commit_pet'){commits++;petState=args.next_pet;wallet+=args.wallet_delta;total+=args.wallet_delta;return {data:{petState,balance:wallet,petWalletTotal:total,updatedAt:'current'}};}
   return {data:null};
  }
 });
 const filename=path.resolve(__dirname,'../supabase/functions',name,'index.ts');
 const source=fs.readFileSync(filename,'utf8').replace(/^import .*;\r?\n/gm,'');
 const context={console,Response,Request,Date,JSON,globalThis:null,PetCore:C,PetConfig:Config,createClient:client,Deno:{env:{get:name=>name==='SUPABASE_SERVICE_ROLE_KEY'?'service':'https://example.test'},serve:fn=>handler=fn}};
 context.globalThis=context;vm.runInNewContext(stripTypeScriptTypes(source,{mode:'strip'}),context,{filename});
 return {call(token,body={},extra={}){return handler(new Request('https://example.test',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...extra},body:JSON.stringify(body)}));},get commits(){return commits;}};
}
(async()=>{
 const pet=load('pet-action');
 for(const [token,status] of [[null,401],['invalid',401],['unconfirmed',401],['anonymous',401],['outsider',403]])assert.equal((await pet.call(token)).status,status);
 assert.equal(pet.commits,0,'unauthorized calls never touch state');
 const command={id:Date.now()+'_adopt',kind:'adopt',name:'Mochi'};
 assert.equal((await pet.call('member',{configVersion:Config.version,command})).status,200);assert.equal(pet.commits,1);
 await pet.call('member',{configVersion:Config.version,command});assert.equal(pet.commits,1,'retry does not commit twice');
 const backups=load('backup-state');
 for(const [token,status] of [[null,401],['invalid',401],['outsider',403],['member',403]])assert.equal((await backups.call(token,{action:'restore',id:1})).status,status);
 assert.equal((await backups.call(null,{action:'restore',id:1},{'x-heartly-backup-key':'cron-test-token'})).status,403,'cron cannot restore');
 assert.equal((await backups.call(null,{action:'list'},{'x-heartly-backup-key':'wrong'})).status,401);
 console.log('PASS: verified-account authorization, outsiders/unconfirmed/anonymous denied, idempotent authorized action, backup restore role checks, cron cannot restore.');
})().catch(e=>{console.error(e);process.exitCode=1;});
