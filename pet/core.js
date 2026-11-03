/* Deterministic sandbox game rules. Host storage, wallet and clock live in adapters.js. */
(function(root){
  'use strict';
  const Content=root.PetContent||(typeof require==='function'?require('./content.js'):{items:[]});
  const Layout=root.PetLayout||(typeof require==='function'?require('./layout.js'):null);
  const Config=root.PetConfig||(typeof require==='function'?require('./config.js'):null);
  const HOUR=3600000,DAY=24*HOUR;
  const RULES=Object.freeze({feed:{...Config.care.feed,cooldown:Config.care.feed.cooldownHours*HOUR},play:{...Config.care.play,cooldown:Config.care.play.cooldownHours*HOUR},clean:{...Config.care.clean,cooldown:Config.care.clean.cooldownHours*HOUR},claim:Config.dailyReward,xpPerCare:Config.xpPerCare,xpCap:Config.xpDailyCap});
  const FEATURED=Object.freeze({
    'pack_976b43105d6b4d3e':{name:'Honey climbing tower',description:'A sunny lookout and a place to scratch.',price:300},
    'pack_31fb3da8f8e91d96':{name:'Ivory climbing tower',description:'A second little perch for curious paws.',price:300},
    'pack_fff8d8925be6dd8c':{name:'Blue cloud nest',description:'A soft blue spot for a slow afternoon.',price:300},
    'pack_a794edbc75410162':{name:'Stone cloud nest',description:'A cool gray spot to curl up beside.',price:300},
    'pack_0e30925f7e7e3de4':{name:'Little olive tree',description:'A leafy friend for the corner.',price:200},
    'pack_ed66a6c6b4605e9a':{name:'Lilac potted plant',description:'A little green with a soft lilac pot.',price:200},
    'pack_b5c53923aedcf1a9':{name:'Blue curtain window',description:'A little view with soft blue curtains.',price:100},
    'pack_7e0301aa0c3277a3':{name:'Teal curtain window',description:'A colorful window for a cozy wall.',price:100},
    'pack_68b0b876c5b3cacc':{name:'Blue cloud rug',description:'A soft landing for little paws.',price:100},
    'pack_b60c26d725828e2e':{name:'Blush cloud rug',description:'A warm rug for a quiet room.',price:100},
    'pack_room_dcd62e797a19':{name:'Classic room',description:'A gentle backdrop for your little home.',price:500},
    'pack_room_cf05e65d57eb':{name:'Linen room',description:'Warm walls for your companion.',price:500},
    'pack_0f2698943d686d7a':{name:'Ceramic food bowl',description:'A pretty bowl for a favorite corner.',price:50},
    'pack_c7b73dc68dbb2c99':{name:'Blue food bowl',description:'A little splash of color for dinner.',price:50}
  });
  const CATALOG=Object.freeze([
    {id:'snack',name:'Little crunchies',category:'treats',price:25,kind:'consumable',description:'A small snack. +10 hunger and a happy little moment.',visual:'food'},
    {id:'treat',name:'Something special',category:'treats',price:100,kind:'consumable',description:'An extra lovely treat. +20 hunger and +15 happiness.',visual:'treat'},
    {id:'yarn',name:'A ball of yarn',category:'toys',price:150,slot:'toy',description:'For very important cat business. A toy for your room.',visual:'yarn'},
    {id:'mouse',name:'Pocket mouse',category:'toys',price:150,slot:'toy',description:'A tiny friend for a tiny friend. Equip it in your room.',visual:'mouse'},
    {id:'bed',name:'Cloud bed',category:'room',price:300,slot:'bed',description:'A soft place to dream. Sleep is always free.',visual:'bed'},
    {id:'plant',name:'A little green',category:'room',price:200,slot:'plant',description:'A leafy corner to make the room feel like home.',visual:'plant'},
    {id:'rose',name:'Peach afternoon',category:'room',price:500,slot:'theme',description:'Warm walls for the room you share.',visual:'rose'},
    {id:'sand',name:'Sunday linen',category:'room',price:500,slot:'theme',description:'A quiet, sandy room for slower days.',visual:'sand'}
  ].map(i=>({...i,featured:true})).concat(Content.items.map(i=>FEATURED[i.id]?{...i,...FEATURED[i.id],featured:true}:i)).map(i=>({...i,price:Config.items[i.id]?.price??i.price})));
  const clone=v=>JSON.parse(JSON.stringify(v));
  const clamp=(v,lo=0,hi=100)=>Math.max(lo,Math.min(hi,v));
  const integer=(v,min,max)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const timestamp=v=>Number.isFinite(v)&&v>=0&&v<=8640000000000000;
  const safeId=v=>typeof v==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(v)&&!['__proto__','constructor','prototype'].includes(v);
  function dayKey(time){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Bucharest',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(time);const p=Object.fromEntries(parts.map(v=>[v.type,v.value]));return `${p.year}-${p.month}-${p.day}`;}
  const BADGES=['dailyCare','firstPurchase','firstDecoration','bond4'];
  function empty(now){return {version:1,revision:0,updatedAt:now,clockOffset:0,pet:null,balance:0,owned:['starter'],quantities:{snack:0,treat:0},equipped:{theme:'starter',bed:null,toy:null,plant:null},placements:[],favoriteIds:[],savedLooks:[],badges:[],receipts:{},preferences:{sound:false,haptics:false},ledger:[]};}
  function day(p,now){const key=dayKey(now);if(p.daily.key!==key)p.daily={key,care:[],xp:0,claimed:false};return p.daily;}
  function level(xp){return xp>=300?4:xp>=150?3:xp>=50?2:1;}
  function nextLevel(xp){return [50,150,300].find(n=>n>xp)||null;}
  function advance(state,now){
    const s=clone(state),p=s.pet;if(!p)return s;
    now=Math.max(now,p.lastAt);const hours=Math.min(DAY,now-p.lastAt)/HOUR;
    if(!p.vacation){for(const [key,rate] of [['hunger',3],['happiness',2],['cleanliness',2]])p.needs[key]=Math.max(Math.min(p.needs[key],20),p.needs[key]-rate*hours);
      p.needs.energy=p.sleeping?clamp(p.needs.energy+hours*12):Math.max(Math.min(p.needs.energy,20),p.needs.energy-hours);
    }
    p.lastAt=now;day(p,now);return s;
  }
  function validate(raw){
    if(!raw||raw.version!==1||!integer(raw.revision,0,1e9)||!integer(raw.balance,0,1e9)||!timestamp(raw.updatedAt)||!Number.isFinite(raw.clockOffset)||Math.abs(raw.clockOffset)>3650*DAY)throw Error('This is not a valid version 1 pet save.');
    if(!Array.isArray(raw.owned)||new Set(raw.owned).size!==raw.owned.length||raw.owned.some(id=>id!=='starter'&&!CATALOG.some(i=>i.id===id&&i.kind!=='consumable'))||!raw.owned.includes('starter'))throw Error('The save contains invalid room items.');
    if(!raw.quantities||!integer(raw.quantities.snack,0,999)||!integer(raw.quantities.treat,0,999))throw Error('The save contains invalid treat quantities.');
    for(const slot of ['theme','bed','toy','plant']){const id=raw.equipped?.[slot];if(id!==null&&!(id==='starter'&&slot==='theme')&&!CATALOG.some(i=>i.id===id&&i.slot===slot&&raw.owned.includes(id)))throw Error('The save contains an invalid equipped item.');}
    if(!raw.preferences||typeof raw.preferences.sound!=='boolean'||typeof raw.preferences.haptics!=='boolean'||!Array.isArray(raw.ledger)||raw.ledger.length>100)throw Error('The save settings or history are invalid.');
    if(raw.ledger.some(e=>!timestamp(e?.at)||!Number.isSafeInteger(e.amount)||Math.abs(e.amount)>1e9||typeof e.label!=='string'||e.label.length>300))throw Error('The point history is invalid.');
    if(!raw.receipts||typeof raw.receipts!=='object'||Array.isArray(raw.receipts)||Object.keys(raw.receipts).length>10000||Object.entries(raw.receipts).some(([id,r])=>!safeId(id)||!Number.isFinite(r?.at)||typeof r?.command!=='string'))throw Error('The save contains invalid action receipts.');
    const p=raw.pet;if(p!==null){
      if(!p||!safeId(p.id)||p.species!=='cat'||typeof p.name!=='string'||!p.name.trim()||p.name.length>24||!timestamp(p.adoptedAt)||!timestamp(p.lastAt)||!integer(p.xp,0,1e9)||typeof p.sleeping!=='boolean'||typeof p.vacation!=='boolean')throw Error('The pet details are invalid.');
      if(['hunger','happiness','cleanliness','energy'].some(n=>!Number.isFinite(p.needs?.[n])||p.needs[n]<0||p.needs[n]>100))throw Error('The pet needs are invalid.');
      if(!p.cooldowns||Object.values(p.cooldowns).some(t=>!Number.isFinite(t))||!p.daily||!/^\d{4}-\d{2}-\d{2}$/.test(p.daily.key)||!Array.isArray(p.daily.care)||p.daily.care.some(a=>!['feed','play','clean'].includes(a))||!integer(p.daily.xp,0,1000000)||typeof p.daily.claimed!=='boolean'||!Array.isArray(p.history)||p.history.length>40)throw Error('The care history is invalid.');
      if(new Set(p.daily.care).size!==p.daily.care.length||p.history.some(e=>!timestamp(e?.at)||typeof e.label!=='string'||e.label.length>300||typeof e.kind!=='string'))throw Error('The care history is invalid.');
    }
    const clean=clone(raw);if(!Array.isArray(clean.placements)){clean.placements=[];for(const slot of ['bed','toy','plant']){const item=CATALOG.find(i=>i.id===clean.equipped[slot]);if(item){const rect=Layout.firstFit(item,clean.placements);if(rect)clean.placements.push({id:'slot_'+slot,itemId:item.id,...rect});}}}Layout.validate(clean.placements,CATALOG,clean.owned);
    // Old standalone saves can contain retired mini-game records. Keep the pet,
    // room and test balance, while removing the games and their visible history.
    delete clean.arcade;delete clean.memory;
    if(clean.badges!==undefined&&!Array.isArray(clean.badges))throw Error('The memory book is invalid.');
    clean.badges=Array.isArray(clean.badges)?clean.badges.filter(b=>BADGES.includes(b)):[];
    if(!clean.badges.length&&clean.pet){
      if(clean.pet.daily.care.length===3)clean.badges.push('dailyCare');
      if(clean.owned.length>1)clean.badges.push('firstPurchase');
      if(clean.placements.length)clean.badges.push('firstDecoration');
      if(clean.pet.xp>=300)clean.badges.push('bond4');
    }
    if(new Set(clean.badges).size!==clean.badges.length)throw Error('The memory book is invalid.');
    if(clean.pet)clean.pet.history=clean.pet.history.filter(e=>!['arcade','memoryFinish'].includes(e.kind));
    clean.ledger=clean.ledger.filter(e=>!['Paw Chase daily reward','Memory Match daily reward'].includes(e.label));
    clean.receipts=Object.fromEntries(Object.entries(clean.receipts).filter(([,r])=>!['arcade','memoryFinish'].includes(r.command)));
    if(clean.favoriteIds===undefined)clean.favoriteIds=[];if(!Array.isArray(clean.favoriteIds)||clean.favoriteIds.length>100||new Set(clean.favoriteIds).size!==clean.favoriteIds.length||clean.favoriteIds.some(id=>!CATALOG.some(i=>i.id===id)))throw Error('The favorite items are invalid.');
    if(clean.savedLooks===undefined)clean.savedLooks=[];if(!Array.isArray(clean.savedLooks)||clean.savedLooks.length>3||new Set(clean.savedLooks.map(l=>l?.id)).size!==clean.savedLooks.length)throw Error('The saved room looks are invalid.');
    for(const look of clean.savedLooks){if(!look||!safeId(look.id)||typeof look.name!=='string'||!look.name.trim()||look.name.length>24||!(look.theme==='starter'||CATALOG.some(i=>i.id===look.theme&&i.slot==='theme'&&clean.owned.includes(i.id))))throw Error('A saved room look is invalid.');Layout.validate(look.placements,CATALOG,clean.owned);}
    return clean;
  }
  function transact(state,request,now){
    if(!safeId(request.id))throw Error('This action needs a valid ID.');
    if(state.receipts[request.id]){if(state.receipts[request.id].command!==request.kind)throw Error('This action ID was already used for a different action.');return {state:clone(state),message:'Already saved.',duplicate:true};}
    if(Object.keys(state.receipts).length>=10000)throw Error('Too many actions today. Please come back tomorrow.');
    const s=advance(state,now);now=Math.max(now,s.pet?.lastAt||s.updatedAt);let p=s.pet,message='',reaction='Excited';
    const kind=request.kind;
    if(kind==='adopt'){
      if(p)throw Error('Your companion is already home.');const name=String(request.name||'').trim();if(!name||name.length>24)throw Error('Give your cat a name between 1 and 24 characters.');
      p=s.pet={id:request.id,species:'cat',name,adoptedAt:now,lastAt:now,needs:{hunger:90,happiness:90,cleanliness:90,energy:90},xp:0,sleeping:false,vacation:false,cooldowns:{},daily:{key:dayKey(now),care:[],xp:0,claimed:false},history:[]};message=`Welcome home, ${name}.`;
    }else if(kind==='preferences'){s.preferences={sound:!!request.sound,haptics:!!request.haptics};message='Preferences saved.';
    }else{
      if(!p)throw Error('Bring your companion home first.');
      if(['feed','play','clean','water','pet','use'].includes(kind)&&(p.sleeping||p.vacation))throw Error(p.vacation?'Return from vacation first.':'Your cat is sleeping. Wake them first.');
      if(['feed','play','clean'].includes(kind)){
        if(p.cooldowns[kind]>now)throw Error('A little rest first. This care action is on cooldown.');
        const key={feed:'hunger',play:'happiness',clean:'cleanliness'}[kind];if(p.needs[key]>=99.999)throw Error(`${p.name} does not need that right now.`);
        if(kind==='play'&&p.needs.energy<RULES.play.energy)throw Error('A little nap first. Playing needs 10 energy.');
        p.needs[key]=clamp(p.needs[key]+RULES[kind].gain);if(kind==='play')p.needs.energy-=RULES.play.energy;
        p.cooldowns[kind]=now+RULES[kind].cooldown;const d=day(p,now);if(!d.care.includes(kind))d.care.push(kind);const xp=Math.max(0,Math.min(RULES.xpPerCare,RULES.xpCap-d.xp));p.xp+=xp;d.xp+=xp;
        if(level(p.xp)>=3&&!s.owned.includes('plant'))s.owned.push('plant');
        if(level(p.xp)>=4&&!s.owned.includes('bed'))s.owned.push('bed');
        reaction=kind==='feed'?'Eating':kind==='play'?'Dance':'Surprised';message={feed:'Dinner is served. +30 hunger.',play:'A little playtime. +20 happiness.',clean:'Fresh and cozy. +40 cleanliness.'}[kind];
      }else if(kind==='water'){
        if(p.cooldowns.water>now)throw Error('The water is already fresh.');p.cooldowns.water=now+HOUR;message='Fresh water. On the house.';
      }else if(kind==='pet'){
        if(p.cooldowns.pet>now)throw Error('Give them a moment.');p.cooldowns.pet=now+3000;message='A little love goes a long way.';
      }else if(kind==='sleep'){if(p.vacation)throw Error('Return from vacation first.');p.sleeping=!p.sleeping;reaction=p.sleeping?'Sleep':'Sleepy';message=p.sleeping?'Sweet dreams. Energy restores while you are away.':'Good morning, little friend.';
      }else if(kind==='vacation'){p.vacation=!p.vacation;p.lastAt=now;message=p.vacation?'Vacation on. Needs and care rewards are paused.':'Welcome back. Care is active again.';
      }else if(kind==='rename'){const name=String(request.name||'').trim();if(!name||name.length>24)throw Error('Use a name between 1 and 24 characters.');p.name=name;message='A lovely name.';
      }else if(kind==='claim'){
        const d=day(p,now);if(p.vacation)throw Error('Rewards are paused on vacation.');if(d.claimed)throw Error('Today’s care reward is already collected.');if(!['feed','play','clean'].every(a=>d.care.includes(a)))throw Error('Feed, play and clean today to collect this reward.');d.claimed=true;s.balance+=RULES.claim;message='+'+RULES.claim+' Heartly points. A little care, rewarded.';s.ledger.unshift({at:now,amount:RULES.claim,label:'Daily care reward'});
      }else if(kind==='purchase'){
        const item=CATALOG.find(i=>i.id===request.itemId);if(!item)throw Error('This item is unavailable.');if(request.price!==item.price)throw Error('The price changed. Review the item again.');if(item.kind!=='consumable'&&s.owned.includes(item.id))throw Error('You already own this item.');if(item.kind==='consumable'&&s.quantities[item.id]>=999)throw Error('Your treat cupboard is full.');if(s.balance<item.price)throw Error(`You need ${item.price-s.balance} more Heartly points.`);
        s.balance-=item.price;if(item.kind==='consumable')s.quantities[item.id]++;else s.owned.push(item.id);s.ledger.unshift({at:now,amount:-item.price,label:item.name});message=`${item.name} is yours.`;
      }else if(kind==='place'){
        const item=CATALOG.find(i=>i.id===request.itemId);
        if(!item||item.slot==='theme'||item.kind==='consumable'||!s.owned.includes(item.id))throw Error('Choose a decoration you own.');
        s.placements=s.placements||[];const placementId=request.placementId||request.id;
        if(!safeId(placementId))throw Error('Invalid decoration ID.');
        const old=s.placements.find(p=>p.id===placementId);
        if(old&&old.itemId!==item.id)throw Error('This decoration changed. Select it again.');
        if(!old&&s.placements.length>=40)throw Error('Your room has reached 40 decorations.');
        const rect={id:placementId,itemId:item.id,x:request.x,y:request.y,w:request.w,h:request.h};
        const problem=Layout.explain(rect,s.placements,placementId,item);if(problem)throw Error(problem);
        s.placements=s.placements.filter(p=>p.id!==placementId);s.placements.push(rect);message='Decoration placed. Your cat’s space stays clear.';
      }else if(kind==='toggleFavorite'){
        if(!CATALOG.some(i=>i.id===request.itemId))throw Error('Choose an item in the catalog.');
        if(s.favoriteIds.includes(request.itemId)){s.favoriteIds=s.favoriteIds.filter(id=>id!==request.itemId);message='Removed from favorites.';}
        else{if(s.favoriteIds.length>=100)throw Error('Your favorites list is full.');s.favoriteIds.push(request.itemId);message='Saved to favorites.';}
      }else if(kind==='saveLook'){
        const name=String(request.name||'').trim();if(!name||name.length>24)throw Error('Use a room look name between 1 and 24 characters.');if(s.savedLooks.length>=3)throw Error('You can save up to three room looks.');
        s.savedLooks.push({id:request.id,name,theme:s.equipped.theme,placements:clone(s.placements)});message='Room look saved. You can restore it whenever you like.';
      }else if(kind==='loadLook'){
        const look=s.savedLooks.find(l=>l.id===request.lookId);if(!look)throw Error('That room look is unavailable.');Layout.validate(look.placements,CATALOG,s.owned);s.equipped.theme=look.theme;s.placements=clone(look.placements);message='Room look restored. No points spent.';
      }else if(kind==='restoreRoom'){
        const theme=request.theme;if(!(theme==='starter'||CATALOG.some(i=>i.id===theme&&i.slot==='theme'&&s.owned.includes(i.id))))throw Error('Choose a room background you own.');Layout.validate(request.placements,CATALOG,s.owned);s.equipped.theme=theme;s.placements=clone(request.placements);message='Room edit undone. No points spent.';
      }else if(kind==='deleteLook'){
        if(!s.savedLooks.some(l=>l.id===request.lookId))throw Error('That room look is unavailable.');s.savedLooks=s.savedLooks.filter(l=>l.id!==request.lookId);message='Saved room look deleted. Your current room stays as it is.';
      }else if(kind==='removePlacement'){
        s.placements=(s.placements||[]).filter(p=>p.id!==request.placementId);message='Put away. You still own the decoration.';
      }else if(kind==='clearRoom'){
        s.placements=[];s.equipped.bed=s.equipped.toy=s.equipped.plant=null;message='Decorations put away. Everything stays in your collection.';
      }else if(kind==='equip'){
        const item=CATALOG.find(i=>i.id===request.itemId);const slot=request.slot;if(!['bed','toy','theme','plant'].includes(slot))throw Error('Choose a valid room slot.');
        if(request.itemId!==null&&!(request.itemId==='starter'&&slot==='theme')&&(!item||item.slot!==slot||!s.owned.includes(item.id)))throw Error('You do not own this room item.');
        if(slot!=='theme'){
          s.placements=(s.placements||[]).filter(p=>p.id!=='slot_'+slot);
          if(request.itemId!==null){const size=Layout.firstFit(item,s.placements);if(!size)throw Error('No clear space is available. Open the room editor to make room.');s.placements.push({id:'slot_'+slot,itemId:item.id,...size});}
        }
        s.equipped[slot]=slot==='theme'&&request.itemId===null?'starter':request.itemId;message='A little room refresh. No points spent.';
      }else if(kind==='use'){
        if(!['snack','treat'].includes(request.itemId)||!s.quantities[request.itemId])throw Error('That treat is not in your cupboard.');if(p.needs.hunger>=99.999&&p.needs.happiness>=99.999)throw Error('Save that treat for later. Your cat is already content.');
        s.quantities[request.itemId]--;p.needs.hunger=clamp(p.needs.hunger+(request.itemId==='snack'?10:20));if(request.itemId==='treat')p.needs.happiness=clamp(p.needs.happiness+15);reaction='Eating';message='A tiny treat, a very happy cat.';
      }else throw Error('That action is not supported.');
    }
    if(p&&!['preferences','equip','toggleFavorite','saveLook','loadLook','deleteLook','restoreRoom'].includes(kind)){p.history.unshift({at:now,kind,label:message});p.history=p.history.slice(0,40);}
    const badge=id=>{if(!s.badges.includes(id))s.badges.push(id);};
    if(p?.daily.care.length===3)badge('dailyCare');if(kind==='purchase')badge('firstPurchase');if(kind==='place')badge('firstDecoration');if(p?.xp>=300)badge('bond4');
    s.ledger=s.ledger.slice(0,100);s.receipts[request.id]={at:now,command:kind};s.revision++;s.updatedAt=now;
    return {state:s,message,reaction};
  }
  function mood(p){if(p.vacation)return 'On a little holiday';if(p.sleeping)return 'Dreaming of good things';if(p.needs.hunger<35)return 'A little hungry';if(p.needs.energy<30)return 'Ready for a nap';if(p.needs.cleanliness<35)return 'Could use a freshen up';if(p.needs.happiness<40)return 'Would love some company';return 'Happy to be home';}
  const api={HOUR,DAY,RULES,CATALOG,empty,validate,advance,transact,dayKey,level,nextLevel,mood};
  if(typeof module!=='undefined')module.exports=api;else root.PetCore=api;
})(typeof window!=='undefined'?window:globalThis);
