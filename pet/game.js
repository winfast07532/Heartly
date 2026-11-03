(function(){
  'use strict';
  const C=PetCore,A=PetAdapter,$=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const FRAMES={Idle:10,Idle2:10,Eating:15,Excited:12,Dance:4,Sleep:4,Sleepy:8,LayDown:12,Waiting:6,Surprised:12};
  let state=null,view='room',filter='picks',busy=false,lockedUntil=0,reactionUntil=0,reaction='Idle',frameIndex=0,lastFrame=0,lastCareFrame=0,toastTimer=0,speechTimer=0,purchase=null,audio=null,frameHandle=0,shopSignature='',inventorySignature='',shopPage=0,inventoryPage=0;
  const PICKS=new Set(C.CATALOG.filter(i=>i.featured).map(i=>i.id));
  const views=['room','shop','inventory','details'];
  function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3300);}
  function duration(ms){const minutes=Math.max(1,Math.ceil(ms/60000));return minutes>=60?`${Math.floor(minutes/60)}h${minutes%60?' '+minutes%60+'m':''}`:`${minutes}m`;}
  function personality(p,time){if(p.vacation)return 'Taking a safe little break. Everything will be here when you return.';if(p.sleeping)return 'Curled up and dreaming. Energy is coming back.';if(p.needs.hunger<35)return 'Those little paws are hoping for dinner.';if(p.needs.cleanliness<35)return 'A fresh room would make this cat very happy.';if(p.needs.energy<30)return 'A soft nap sounds lovely right now.';if(p.needs.happiness<40)return 'Your cat is waiting for a little company.';const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Bucharest',hour:'numeric',hourCycle:'h23'}).format(time));return hour<11?'Good morning! Your cat is ready for a gentle start.':hour>=20?'A quiet evening together feels just right.':p.xp>=150?'Your familiar little friend is glad you are here.':'A curious little friend is exploring home.';}
  function sound(){if(!state.preferences.sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.setValueAtTime(520,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(780,audio.currentTime+.12);gain.gain.setValueAtTime(.035,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.24);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.25);}catch(_){}}
  function react(kind='Excited',speech='♡'){
    reaction=kind;reactionUntil=performance.now()+1800;lockedUntil=performance.now()+1000;frameIndex=0;lastFrame=0;
    $('pet-speech').textContent=speech;$('pet-speech').hidden=false;clearTimeout(speechTimer);speechTimer=setTimeout(()=>$('pet-speech').hidden=true,1900);
    if(state.preferences.haptics)navigator.vibrate?.(20);sound();renderCare();
  }
  async function execute(kind,extra={}){
    if(busy)return false;
    if(['feed','play','clean','sleep','pet','water','use'].includes(kind)&&performance.now()<lockedUntil){toast('One little moment…');return false;}
    busy=true;renderCare();
    try{const result=await A.execute({id:A.id(),kind,...extra});state=A.load();$('save-status').textContent='Synced with Heartly';render();toast(result.message);
      if(['feed','play','clean','pet','water','sleep','use'].includes(kind)){
        const respond=()=>react(result.reaction,kind==='feed'||kind==='use'?'nom nom':kind==='sleep'&&state.pet.sleeping?'zzz':'♡');
        if(!window.PetRoomLife?.care(kind,respond))respond();
      }
      return true;
    }catch(error){toast(error.message);$('save-status').textContent='Not saved. Please try again.';return false;}
    finally{busy=false;renderCare();}
  }
  function visual(item){
    if(item.sprite){const spec=item.sprite,[x,y,w,h]=spec.crop,ratio=Math.min(110/w,115/h);const el=document.createElement('div');el.className='pack-visual';el.style.cssText='width:'+Math.round(w*ratio)+'px;height:'+Math.round(h*ratio)+'px;background-image:url("'+encodeURI(spec.file)+'");background-size:'+spec.width*ratio+'px '+spec.height*ratio+'px;background-position:-'+x*ratio+'px -'+y*ratio+'px';el.setAttribute('aria-hidden','true');return el;}
const v=document.createElement('div');v.className='item-sprite item-'+item.visual;v.setAttribute('aria-hidden','true');return v;}
  function button(text,fn){const el=document.createElement('button');el.className='secondary';el.textContent=text;el.onclick=fn;return el;}
  function product(item,inventory=false){
    const card=document.createElement('article');card.className='product';card.dataset.item=item.id;
    const art=document.createElement('div');art.className='product-visual';art.append(visual(item));const favorite=document.createElement('button');favorite.type='button';favorite.className='favorite-button';favorite.textContent=state.favoriteIds.includes(item.id)?'♥':'♡';favorite.setAttribute('aria-label',(state.favoriteIds.includes(item.id)?'Remove ':'Add ')+item.name+(state.favoriteIds.includes(item.id)?' from favorites':' to favorites'));favorite.setAttribute('aria-pressed',String(state.favoriteIds.includes(item.id)));favorite.onclick=()=>execute('toggleFavorite',{itemId:item.id});art.append(favorite);const copy=document.createElement('div');copy.className='product-copy';const title=document.createElement('h3');title.textContent=item.name;const desc=document.createElement('p');desc.textContent=item.description;
    const bottom=document.createElement('div');bottom.className='product-bottom';const price=document.createElement('strong');price.textContent=inventory?(item.kind==='consumable'?`${state.quantities[item.id]} in your cupboard`:'Yours to keep'):`✦ ${item.price} Heartly points`;
    let action;
    if(inventory){if(item.kind==='consumable'){const kind={snack:'feed',soap:'clean',paper:'toilet'}[item.id];action=button(kind?({feed:'Serve food',clean:'Wash',toilet:'Toilet'})[kind]:'Give a treat',()=>kind?execute(kind):execute('use',{itemId:item.id}));}else{const equipped=state.equipped[item.slot]===item.id;action=button(item.slot==='theme'?(equipped?'In your room':'Use room'):'Arrange in room',()=>{if(item.slot==='theme')execute('equip',{slot:'theme',itemId:item.id});else window.PetRoomEditor?.open(item.id);});if(item.slot==='theme')action.disabled=equipped;}}
    else{const owned=state.owned.includes(item.id);action=button(owned?'Owned':'Take a look',()=>openPurchase(item));action.disabled=owned;}
    bottom.append(price,action);copy.append(title,desc,bottom);card.append(art,copy);return card;
  }
  function openPurchase(item){
    if(busy||state.owned.includes(item.id))return;purchase={...item,idempotency:A.id()};$('purchase-preview').replaceChildren(visual(item));$('purchase-name').textContent=item.name;$('purchase-description').textContent=item.description;$('purchase-cost').textContent=`${item.price} Heartly points`;$('purchase-balance').textContent=`Your balance: ${state.balance.toLocaleString()}`;$('purchase-error').hidden=true;$('confirm-purchase').disabled=false;$('confirm-purchase').textContent='Bring it home';$('purchase-dialog').showModal();
  }
  async function buy(){
    if(!purchase||busy)return;busy=true;const item=purchase;$('confirm-purchase').disabled=true;
    try{const result=await A.execute({id:item.idempotency,kind:'purchase',itemId:item.id,price:item.price});state=A.load();purchase=null;$('purchase-dialog').close();render();toast(result.message+' Find it in your collection.');sound();}
    catch(error){$('purchase-error').textContent=error.message;$('purchase-error').hidden=false;$('confirm-purchase').disabled=false;}
    finally{busy=false;}
  }
  function renderCare(){
    if(!state?.pet)return;const p=state.pet,now=A.now(state),locked=busy||performance.now()<lockedUntil;
    document.querySelectorAll('#inventory-view .product button').forEach(button=>button.disabled=busy);
    $('claim').disabled=busy||p.vacation||p.daily.claimed||p.daily.care.length<3;
    for(const b of document.querySelectorAll('[data-care]')){const kind=b.dataset.care,until=p.cooldowns[kind]||0;const asleep=p.sleeping||p.vacation;const key={feed:'hunger',play:'happiness',clean:'cleanliness'}[kind];let label=({feed:'FOOD × '+(state.quantities.snack||0),clean:'SHAMPOO × '+(state.quantities.soap||0),sleep:p.sleeping?'WAKE':'BED REQUIRED'})[kind]||'FREE';
      if(kind!=='sleep'&&until>now)label=duration(until-now);else if(kind!=='sleep'&&p.needs[key]>=99.999)label='CONTENT';
      b.disabled=locked||p.vacation||(kind!=='sleep'&&(asleep||until>now||p.needs[key]>=99.999||(kind==='play'&&p.needs.energy<10)));b.querySelector('small').textContent=label;
    }
    $('toilet').disabled=locked||p.sleeping||p.vacation||p.cooldowns.toilet>now;$('toilet').lastElementChild.textContent='Rolls: '+(state.quantities.paper||0);
    if(!p.sleeping&&state.owned.some(id=>id==='bed'||C.CATALOG.find(i=>i.id===id)?.category==='beds'))document.querySelector('[data-care=sleep] small').textContent='BED READY';
    $('sleep-label').textContent=p.sleeping?'Wake':'Sleep';$('water').disabled=locked||p.sleeping||p.vacation||p.cooldowns.water>now;$('water').lastElementChild.textContent=p.cooldowns.water>now?'Fresh for '+duration(p.cooldowns.water-now):'Free';
    $('pet-sprite').disabled=locked||p.sleeping||p.vacation;
  }
  function render(){
    const p=state.pet;$('welcome').hidden=!!p;$('game').hidden=!p;$('bottom-nav').hidden=!p;$('recovery').hidden=true;
    if(!p){window.dispatchEvent(new Event('pet-render'));return;}
    $('balance').textContent=state.balance.toLocaleString();$('pet-display-name').textContent=p.name;$('pet-sprite').setAttribute('aria-label','Pet '+p.name);$('pet-mood').textContent=C.mood(p);$('mood-copy').textContent=personality(p,A.now(state));$('page-description').textContent=p.vacation?'A little holiday. Your friend is safe and cozy.':p.sleeping?'Quiet paws. Someone’s having a little nap.':'There’s someone happy to see you.';
    const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Bucharest',hour:'numeric',hourCycle:'h23'}).format(A.now(state)));$('room-weather').textContent=p.sleeping?'Sweet dreams ☾':hour<11?'Morning light ☀':hour<18?'A cozy afternoon ✦':'Evening glow ☾';
    $('room').dataset.theme=state.equipped.theme;$('room-name');document.querySelector('.room-name').textContent={starter:'THE SUNNY ROOM',rose:'PEACH AFTERNOON',sand:'SUNDAY LINEN'}[state.equipped.theme];
    $('room-bed').hidden=!state.equipped.bed;$('room-plant').hidden=!state.equipped.plant;const toy=state.equipped.toy;$('room-toy').hidden=!toy;$('room-toy').className='item-sprite item-'+(toy==='mouse'?'mouse':'yarn');$('room-mess').hidden=p.needs.cleanliness>=45;$('pet-state-badge').textContent=p.vacation?'ON HOLIDAY':p.sleeping?'SLEEPING':'AT HOME';
    const needs=$('needs');if(!needs.children.length)for(const [key,name] of [['hunger','Hunger'],['happiness','Happiness'],['cleanliness','Cleanliness'],['energy','Energy']]){const row=document.createElement('div');row.className='need';row.dataset.need=key;const label=document.createElement('div');label.className='need-label';const text=document.createElement('span');text.textContent=name;const value=document.createElement('strong');label.append(text,value);const track=document.createElement('div');track.className='need-track';track.setAttribute('role','progressbar');track.setAttribute('aria-label',name);track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.append(document.createElement('i'));row.append(label,track);needs.append(row);}
    for(const el of needs.children){const n=Math.round(p.needs[el.dataset.need]);el.querySelector('strong').textContent=n+'%';el.querySelector('i').style.width=n+'%';el.querySelector('[role=progressbar]').setAttribute('aria-valuenow',n);}
    const level=C.level(p.xp),next=C.nextLevel(p.xp),start=[0,50,150,300][level-1];$('bond-badge').textContent='BOND '+level;$('bond-description').textContent=['Getting to know each other','A familiar little face','Very good company','Your little companion'][level-1];$('bond-xp').textContent=next?`${p.xp} / ${next} XP`:`${p.xp} XP · best friends`;$('bond-bar').style.width=(next?(p.xp-start)/(next-start)*100:100)+'%';
    $('daily-checks').replaceChildren();for(const [key,label] of [['feed','Fed'],['play','Played'],['clean','Freshened up']]){const el=document.createElement('span');el.textContent=label;el.className=p.daily.care.includes(key)?'done':'';$('daily-checks').append(el);}
    $('claim').disabled=busy||p.vacation||p.daily.claimed||p.daily.care.length<3;$('claim').textContent=p.daily.claimed?'Collected today':p.vacation?'Paused on holiday':'Collect '+C.RULES.claim+' points';
    if(view==='shop')renderShop();if(view==='inventory')renderInventory();if(view==='details')renderDetails();renderCare();
    $('sound-toggle').checked=state.preferences.sound;$('haptic-toggle').checked=state.preferences.haptics;window.dispatchEvent(new Event('pet-render'));
  }
  function renderShop(){
    const query=$('shop-search')?.value.trim().toLowerCase()||'';
    const sort=$('shop-sort')?.value||'featured',signature=JSON.stringify([state.owned,state.favoriteIds,filter,query,shopPage,sort]);if(signature===shopSignature)return;shopSignature=signature;
    const list=C.CATALOG.filter(i=>(query&&filter!=='favorites'||filter==='all'||filter==='picks'&&PICKS.has(i.id)||filter==='favorites'&&state.favoriteIds.includes(i.id)||i.category===filter||(filter==='room'&&!['treats','toys'].includes(i.category)))&&(!query||(i.name+' '+(i.source||'')).toLowerCase().includes(query)));
    if(sort==='price-low')list.sort((a,b)=>a.price-b.price||a.name.localeCompare(b.name));else if(sort==='price-high')list.sort((a,b)=>b.price-a.price||a.name.localeCompare(b.name));else if(sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
    const pages=Math.max(1,Math.ceil(list.length/24));shopPage=Math.min(shopPage,pages-1);
    $('shop-grid').replaceChildren(...list.slice(shopPage*24,shopPage*24+24).map(i=>product(i)));
    if($('shop-count'))$('shop-count').textContent=list.length+' items · page '+(shopPage+1)+' of '+pages;
    if($('shop-prev'))$('shop-prev').disabled=shopPage===0;if($('shop-next'))$('shop-next').disabled=shopPage>=pages-1;
    if(!list.length){const empty=document.createElement('p');empty.className='empty';empty.textContent='No matching items. Try a different name or category.';$('shop-grid').append(empty);}
  }
  function renderInventory(){
    const query=$('inventory-search')?.value.trim().toLowerCase()||'';
    const favoritesOnly=$('inventory-favorites-only')?.checked||false,signature=JSON.stringify([state.owned,state.quantities,state.equipped,state.favoriteIds,query,inventoryPage,favoritesOnly]);if(signature===inventorySignature)return;inventorySignature=signature;
    const items=C.CATALOG.filter(i=>(i.kind==='consumable'?state.quantities[i.id]>0:state.owned.includes(i.id))&&(!favoritesOnly||state.favoriteIds.includes(i.id))&&(!query||(i.name+' '+(i.source||'')).toLowerCase().includes(query)));
    const pages=Math.max(1,Math.ceil(items.length/24));inventoryPage=Math.min(inventoryPage,pages-1);
    $('inventory-grid').replaceChildren(...items.slice(inventoryPage*24,inventoryPage*24+24).map(i=>product(i,true)));$('inventory-empty').hidden=!!items.length;$('inventory-empty').textContent=favoritesOnly?'No favorite items in your collection yet. Tap a heart in the shop or collection.':'Your collection is waiting for its first little find. The shop has treats, toys and cozy things.';$('starter-theme').textContent=state.equipped.theme==='starter'?'In your room':'Use room';$('starter-theme').disabled=state.equipped.theme==='starter';
    if($('inventory-count'))$('inventory-count').textContent=items.length+' owned items · page '+(inventoryPage+1)+' of '+pages;
    if($('inventory-prev'))$('inventory-prev').disabled=inventoryPage===0;if($('inventory-next'))$('inventory-next').disabled=inventoryPage>=pages-1;
  }
  function renderDetails(){const p=state.pet;$('detail-name').textContent=p.name;$('detail-age').textContent='Home since '+new Date(p.adoptedAt).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})+'. Bond '+C.level(p.xp)+'.';if(document.activeElement!==$('rename-input'))$('rename-input').value=p.name;$('vacation').textContent=p.vacation?'Return from vacation':'Start vacation';$('milestones').replaceChildren();
    for(const [xp,text] of [[0,'A little place to call home'],[50,'Bond 2: A familiar little face'],[150,'Bond 3: The little plant unlocks'],[300,'Bond 4: Best friends']]){const el=document.createElement('p');el.className=p.xp>=xp?'unlocked':'';el.textContent=(p.xp>=xp?'✓ ':'○ ')+text+(p.xp<xp?` · ${xp} XP`:'');$('milestones').append(el);}
  }
  function route(){const next=location.hash.slice(1);view=views.includes(next)?next:'room';for(const name of views)$(name+'-view').hidden=name!==view;for(const a of document.querySelectorAll('[data-page]'))a.setAttribute('aria-current',a.dataset.page===view?'page':'false');$('page-title').textContent={room:'Home, sweet little home.',shop:'A little something lovely.',inventory:'Little finds. Lots of love.',details:'Someone to come home to.'}[view];if(state)render();window.dispatchEvent(new CustomEvent('pet-route',{detail:{view}}));window.scrollTo(0,0);if(!frameHandle)frameHandle=requestAnimationFrame(animate);}
  function recovery(error){state=null;$('welcome').hidden=$('game').hidden=$('bottom-nav').hidden=true;$('recovery').hidden=false;$('recovery-message').textContent=error.message+' Close Little Home and reopen it after Heartly finishes syncing. Your cloud save has not been reset.';$('save-status').textContent='Could not load your companion';}
  function reload(){try{state=A.load();route();}catch(error){recovery(error);}}
  function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);}
  function animate(t){frameHandle=0;if(document.hidden||document.querySelector('dialog[open]'))return;const welcome=!$('welcome').hidden;if(!welcome&&view!=='room')return;const el=welcome?document.querySelector('.welcome-cat'):$('pet-sprite');
    if(welcome||state?.pet){const p=state?.pet;const kind=welcome?'Idle':p.sleeping?'Sleep':p.vacation?'LayDown':t<reactionUntil?reaction:window.PetRoomLife?.walking?'Idle2':p.needs.energy<35?'Sleepy':p.xp>=50?'Idle2':'Idle';window.PetRoomLife?.frame(t,t<reactionUntil);const frames=FRAMES[kind];if(t-lastFrame>150){lastFrame=t;frameIndex=reduced.matches?0:(frameIndex+1)%frames;const size=el.clientWidth||128;el.style.backgroundImage=`url('assets/cat/${kind}.png')`;el.style.backgroundSize=`${size*frames}px ${size}px`;el.style.backgroundPosition=`-${frameIndex*size}px 0`;}if(state&&t-lastCareFrame>250){renderCare();lastCareFrame=t;}}
    frameHandle=requestAnimationFrame(animate);
  }
  $('adopt-form').onsubmit=async e=>{e.preventDefault();const button=e.submitter;button.disabled=true;const okay=await execute('adopt',{name:$('pet-name').value});button.disabled=false;if(okay){location.hash='room';route();}};
  document.querySelectorAll('[data-care]').forEach(b=>b.onclick=()=>execute(b.dataset.care));$('toilet').onclick=()=>execute('toilet');$('water').onclick=()=>execute('water');$('pet-sprite').onclick=()=>execute('pet');$('claim').onclick=()=>execute('claim');
  $('shop-filters').onclick=e=>{const b=e.target.closest('[data-filter]');if(!b)return;filter=b.dataset.filter;shopPage=0;shopSignature='';document.querySelectorAll('[data-filter]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));renderShop();};
  $('shop-sort').onchange=()=>{shopPage=0;shopSignature='';renderShop();};$('inventory-favorites-only').onchange=()=>{inventoryPage=0;inventorySignature='';renderInventory();};
  $('confirm-purchase').onclick=buy;$('purchase-dialog').addEventListener('close',()=>purchase=null);
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
  $('open-settings').onclick=()=>{if(state){$('sound-toggle').checked=state.preferences.sound;$('haptic-toggle').checked=state.preferences.haptics;}$('settings-dialog').showModal();};
  for(const id of ['sound-toggle','haptic-toggle'])$(id).onchange=()=>execute('preferences',{sound:$('sound-toggle').checked,haptics:$('haptic-toggle').checked});
  $('rename-form').onsubmit=e=>{e.preventDefault();execute('rename',{name:$('rename-input').value});};$('vacation').onclick=()=>execute('vacation');$('starter-theme').onclick=()=>execute('equip',{slot:'theme',itemId:'starter'});
  document.addEventListener('close',()=>{if(!frameHandle)frameHandle=requestAnimationFrame(animate);},true);
  window.addEventListener('hashchange',route);A.subscribe(()=>{try{state=A.load();render();}catch(e){recovery(e);}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameHandle);frameHandle=0;audio?.suspend();}else{try{state=A.load();render();}catch(e){recovery(e);}if(!frameHandle)frameHandle=requestAnimationFrame(animate);}});
  setInterval(()=>{if(!document.hidden&&!busy){try{state=A.load();if(state.pet){render();}}catch(e){recovery(e);}}},15000);
  window.PetGame={get state(){return state;},execute,toast,render,visual,react,
    catalogChange(delta=0){shopPage=delta===0?0:Math.max(0,shopPage+delta);shopSignature='';renderShop();},
    inventoryChange(delta=0){inventoryPage=delta===0?0:Math.max(0,inventoryPage+delta);inventorySignature='';renderInventory();}
  };
  reload();if(!frameHandle)frameHandle=requestAnimationFrame(animate);
})();
