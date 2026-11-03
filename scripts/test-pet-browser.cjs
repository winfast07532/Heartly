const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(__dirname,'..'),C=require(root+'/pet/core.js');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg'};
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
       async rpc(){return {data:'ana',error:null}},
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
  let frame=page.frameLocator('#pet-frame');await frame.locator('#pet-name').fill('Mochi');await frame.locator('#adopt-form button').click();await frame.locator('#game').waitFor();
  assert.equal(cloud.data.ptsVal,500,'no sandbox grant');assert.equal(cloud.data.petState.pet.species,'cat');
  assert.equal(await frame.locator('.test-tools').count(),0);
  await frame.locator('#open-settings').click();assert.equal(await frame.locator('#theme-select').isDisabled(),true);await frame.locator('#settings-dialog [data-close]').click();
  let pet=page.frames().find(f=>f.url().includes('/pet/'));
  await pet.evaluate(()=>PetGame.execute('purchase',{itemId:'snack',price:25}));assert.equal(cloud.data.ptsVal,475);
  assert.equal(await page.evaluate(()=>ptsVal),475,'host wallet updated');
  await page.evaluate(()=>saveState());await page.waitForTimeout(700);assert.equal(cloud.data.ptsVal,475,'ordinary save keeps deduction');
  const snapshot=structuredClone(cloud.data);
  loseReply=true;await pet.evaluate(()=>PetGame.execute('purchase',{itemId:'snack',price:25}));assert.equal(cloud.data.ptsVal,450);
  await pet.evaluate(()=>PetGame.execute('purchase',{itemId:'snack',price:25}));assert.equal(cloud.data.ptsVal,450,'lost response retry not double charged');
  assert.equal(cloud.data.petState.quantities.snack,2);
  offline=true;await pet.evaluate(()=>PetGame.execute('purchase',{itemId:'snack',price:25}));assert.equal(cloud.data.ptsVal,450);offline=false;
  // Discard the never-delivered test request; the production retry is verified above.
  await page.evaluate(()=>localStorage.removeItem('heartly_pet_pending_action'));
  for(const width of [320,390,844,1280]){await page.setViewportSize({width,height:844});await page.waitForTimeout(80);assert.ok(await pet.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow '+width);}
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.resolve(__dirname,'pet-integrated-mobile.png')});
  await pet.evaluate(()=>PetRoomView.open());assert.equal(await pet.evaluate(()=>PetRoomView.active),true);
  await frame.locator('#room-only-exit').click();assert.equal(await pet.evaluate(()=>PetRoomView.active),false);
  await pet.evaluate(()=>{document.getElementById('room-only').requestFullscreen=undefined;return PetRoomView.open();});
  await page.locator('#close-pet').click();assert.equal(await page.locator('#pet-overlay').isHidden(),true);assert.equal(await page.locator('#pet-frame').getAttribute('src'),'about:blank');
  await page.evaluate(()=>openPetGame());frame=page.frameLocator('#pet-frame');await frame.locator('#game').waitFor();assert.equal(await frame.locator('#balance').textContent(),'450');
  // A restore must replace, not merge, pet inventory and wallet.
  await page.evaluate(s=>_applyIncoming(s,'backup-restore',new Date().toISOString()),snapshot);
  await page.waitForTimeout(100);assert.equal(await frame.locator('#balance').textContent(),'475');
  assert.equal(await page.evaluate(()=>petState.quantities.snack),1);
  assert.deepEqual(errors,[]);console.log('PASS live pet: adoption, real wallet, purchase, normal save, lost-response idempotency, offline failure, themes, responsive room, fullscreen exit, reopen and restore.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
