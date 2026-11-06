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

  assert.equal(await page.evaluate(()=>favourites.length),0,'fresh profile has no example favourites');
  await page.evaluate(async()=>{currentUser='ana';await initSync();for(const id of ['LOGIN','splash','INTRO','WELCOME'])document.getElementById(id).style.display='none';});
  const result=await page.evaluate(()=>{
    ED.notes=[{l:'Read',lk:false,read:true,letter:{t:'Read',b:'Test',s:'R'}}];sentLetters=[];updateProfStats();
    const counts=[document.getElementById('pstat-read').textContent,document.getElementById('prof-stat-read').textContent];
    const before=ptsVal;openLetter('Robert','New favourite','Test','Robert');saveToFavourites();closeMod();
    const unchanged=ptsVal===before;
    cycleDate();cycleTimeFmt();
    const stamp=new Date(2026,10,6,17,8);
    return {counts,unchanged,date:HeartlyFormat.date(stamp),time:HeartlyFormat.time(stamp),favourite:favourites[0]};
  });
  assert.deepEqual(result.counts,['1','1']);assert.equal(result.unchanged,true);assert.equal(result.date,'11 / 06 / 2026');assert.match(result.time,/05:08 PM/);assert.ok(result.favourite.savedAt);
  await page.evaluate(()=>saveState(true));await page.reload();
  assert.equal(await page.locator('#sett-date-fmt').textContent(),'MM / DD / YYYY');assert.equal(await page.locator('#sett-time-fmt').textContent(),'12-hour (AM / PM)');
  assert.equal(await page.evaluate(()=>HeartlyFormat.date('2026-11-06')),'11 / 06 / 2026');
  assert.equal(await page.evaluate(()=>{HeartlyFormat.cycleDate();return HeartlyFormat.date('2026-11-06');}),'2026-11-06');
  assert.equal(await page.evaluate(()=>{HeartlyFormat.cycleDate();return HeartlyFormat.date('2026-11-06');}),'06 / 11 / 2026');
  assert.deepEqual(errors,[]);
  const now=Date.now();for(const [kind,item,key] of [['feed','fish','hunger'],['play','play_yarn','happiness'],['clean','kit1','cleanliness']]){
    let state=C.transact(C.empty(now),{id:'adopt_test',kind:'adopt',name:'Cat'},now).state;state.pet.needs[key]=95;state.quantities[item]=1;
    const result=C.transact(state,{id:'care_test',kind,itemId:item},now);assert.match(result.message,/\+5 /);assert.equal(result.state.pet.needs[key],100);assert.equal(result.state.quantities[item],0);
  }
  console.log('PASS: fresh favourites, matching read counters, no invented favourite rewards, date/time persistence and rendering, capped care messages.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
