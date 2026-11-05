const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(__dirname,'..'),C=require(root+'/pet/core.js'),M=require(root+'/js/state-merge.js');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
 try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  let cloud={id:'heartly-couple',data:{ptsVal:500,petWalletTotal:0,totalPtsEarned:500,hasSeenWelcome:true},updated_at:new Date().toISOString()},petCalls=0,offline=false,loseReply=false;
  await ctx.route('**/*',async route=>{
   const u=new URL(route.request().url());
   if(u.hostname==='cdn.jsdelivr.net')return route.fulfill({contentType:'application/javascript',body:`window.supabase={createClient(){
     return {
       auth:{async getSession(){return {data:{session:window.__signedOut?null:{access_token:'verified-test-session'}}}},async signOut(){window.__signedOut=true;return {}},async signInWithPassword(){window.__signedOut=false;return {data:{session:{access_token:'verified-test-session'}}}}},
       async rpc(name,args){if(name==='heartly_save_state')return (await fetch('/__save',{method:'POST',body:JSON.stringify(args)})).json();return {data:'ana',error:null}},
       from(){return {
         select(){return this},eq(){return this},
         async maybeSingle(){return (await fetch('/__db')).json()},
         upsert(value){return {select(){return this},async single(){return (await fetch('/__db',{method:'POST',body:JSON.stringify(value)})).json()}}}
       }},
       channel(){return {on(){return this},subscribe(cb){queueMicrotask(()=>cb('SUBSCRIBED'));return this}}}
     };
   }};`});
   if(u.pathname.endsWith('/pet-action')){
    if(route.request().headers().authorization!=='Bearer verified-test-session')return route.fulfill({status:401,json:{error:'Sign in first.'}});
    if(offline)return route.abort();
    try{
     const {command}=JSON.parse(route.request().postData());let s=cloud.data.petState?structuredClone(cloud.data.petState):C.empty(Date.now());s.balance=cloud.data.ptsVal;
     const result=C.transact(s,command,Date.now());if(!result.duplicate){cloud.data.petWalletTotal+=result.state.balance-s.balance;cloud.data.ptsVal=result.state.balance;cloud.data.petState=result.state;petCalls++;}
     if(loseReply){loseReply=false;return route.abort();}
     return route.fulfill({json:{message:result.message,reaction:result.reaction,petState:cloud.data.petState,petWalletTotal:cloud.data.petWalletTotal,balance:cloud.data.ptsVal,serverNow:Date.now()}});
    }catch(e){return route.fulfill({status:400,json:{error:e.message}});}
   }
   if(u.hostname!=='127.0.0.1')return route.abort();
   if(u.pathname==='/__save'){
    const args=JSON.parse(route.request().postData());
    try{if(!cloud.data.stateWriteReceipts?.[args.request_id]){cloud.data=M.state(args.base_data,args.next_data,cloud.data);cloud.data.stateWriteReceipts={...cloud.data.stateWriteReceipts,[args.request_id]:Date.now()};cloud.updated_at=new Date().toISOString();}return route.fulfill({json:{data:cloud,error:null}});}catch(e){return route.fulfill({json:{data:null,error:{message:e.message}}});}
   }
   if(u.pathname==='/__db'){
    if(route.request().method()==='POST'){
     const next=JSON.parse(route.request().postData());next.data.ptsVal+=cloud.data.petWalletTotal-(next.data.petWalletTotal||0);next.data.petState=cloud.data.petState;next.data.petWalletTotal=cloud.data.petWalletTotal;cloud=next;
    }
    return route.fulfill({json:{data:cloud,error:null}});
   }
   try{const f=path.resolve(root,u.pathname.slice(1));if(!f.startsWith(root+path.sep))throw Error();return route.fulfill({body:fs.readFileSync(f),contentType:mime[path.extname(f)]||'application/octet-stream'});}catch(_){return route.fulfill({status:404,body:''});}
  });
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:9755/index.html');
  await page.evaluate(()=>{window.__signedOut=true;window.HeartlyAuth.require();});
  await page.locator('#heartly-auth').waitFor();await page.locator('#auth-cancel').click();
  assert.equal(await page.locator('#heartly-auth').isVisible(),false);
  await page.evaluate(()=>window.__signedOut=false);
  await page.evaluate(async()=>{currentUser='ana';checkAchievements=()=>{};triggerAllUIRenders=()=>{};refreshStreakUI=()=>{};await initSync();for(const id of ['LOGIN','splash','INTRO'])document.getElementById(id).style.display='none';await openPetGame();});

  await page.evaluate(()=>closePetGame());
  assert.equal(await page.evaluate(()=>saveState(true)),true);
  cloud.data.ED.notes.push({l:'Remote note',lk:false});cloud.updated_at=new Date().toISOString();
  assert.equal(await page.evaluate(()=>{ptsVal+=100;return saveState(true);}),true);
  assert.equal(cloud.data.ED.notes.at(-1).l,'Remote note');assert.equal(cloud.data.ptsVal,600);
  assert.equal(await page.evaluate(()=>ED.notes.at(-1).l),'Remote note');
  cloud.data.ED.notes.push({l:'Second remote note',lk:false});cloud.updated_at=new Date(Date.now()+1).toISOString();
  assert.equal(await page.evaluate(()=>{ED.notes.push({l:'Conflicting local note',lk:false});return saveState(true);}),false);
  await page.locator('#save-conflict').waitFor();assert.equal(cloud.data.ED.notes.at(-1).l,'Second remote note');
  assert.ok(await page.evaluate(()=>localStorage.getItem('heartly_unsynced_conflict').includes('Conflicting local note')));
  await page.locator('#save-conflict button').filter({hasText:'Load latest'}).click();
  const prices=await page.evaluate(async()=>{
    ED.letters=[{l:'Free',lk:true,price:0,letter:{t:'Test',b:'Test',s:'Test'}}];ptsVal=2000;
    openBuySheet(0,'letters');const displayed=document.getElementById('buy-cost').textContent;window.confirmBuyLetter();const charged=2000-ptsVal;
    await new Promise(r=>setTimeout(r,200));
    ED.letters=[{l:'Paid',lk:true,price:100,letter:{t:'Test',b:'Test',s:'Test'}}];ptsVal=200;openBuySheet(0,'letters');ptsVal=0;
    const success=[];window.showSuccess=(...args)=>success.push(args[1]);window.confirmBuyLetter();await new Promise(r=>setTimeout(r,200));
    return {displayed,charged,success,locked:ED.letters[0].lk};
  });
  assert.equal(prices.displayed,'0 pts');assert.equal(prices.charged,0);assert.deepEqual(prices.success,[]);assert.equal(prices.locked,true);
  assert.deepEqual(errors,[]);console.log('PASS: browser disjoint remote edits retained, conflicting edits preserved locally, conflict recovery, zero prices and no false purchase success.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
