/* ═══ NEXT LETTER DATE ═══
   Real, Dev-controlled — Robert sets goodnightLetterNextDate from the
   Dev tab. Used to be pure fake logic (`dayOfYear % 2 === 0`), which
   claimed a letter was waiting every other calendar day regardless of
   whether Robert had actually written or scheduled anything. */
function updateGoodnight(){
  const el  = document.getElementById('cdown');
  const lbl = document.getElementById('cd-label');
  const sub = document.getElementById('cd-sub');
  if(!el) return;

  const dateStr = (typeof goodnightLetterNextDate !== 'undefined') ? goodnightLetterNextDate : null;

  if(!dateStr){
    if(lbl) lbl.textContent = 'No letter scheduled';
    el.textContent = '—';
    if(sub) sub.textContent = 'Robert hasn\'t scheduled one yet';
    return;
  }

  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local
  if(dateStr <= todayStr){
    if(lbl) lbl.textContent = 'Letter available';
    el.textContent = 'Tonight 🌹';
    if(sub) sub.textContent = 'Robert left you a letter 💌';
  } else {
    const target = new Date(dateStr + 'T00:00:00');
    const dayName = target.toLocaleDateString('en-GB', { weekday:'long' });
    const dateLbl = target.toLocaleDateString('en-GB', { day:'numeric', month:'long' });
    if(lbl) lbl.textContent = 'Next letter';
    el.textContent = dayName + ', ' + dateLbl;
    if(sub) sub.textContent = 'Robert\'s got one coming 🌙';
  }
}
updateGoodnight();

/* ═══ NAV ═══ */
const SUB={home:'',explore:'EXPLORE',play:'PLAY',exchange:'EXCHANGE',logs:'LOGS'};
function go(id){
  document.querySelectorAll('.SC').forEach(s=>s.classList.remove('on'));
  document.querySelectorAll('.tb').forEach(b=>b.classList.remove('on'));
  document.getElementById('pltb').classList.remove('on');
  const sc=document.getElementById('s-'+id);
  if(sc){sc.classList.add('on');document.getElementById('SW').scrollTop=0}
  if(id==='play')document.getElementById('pltb').classList.add('on');
  else{const b=document.querySelector(`.tb[data-s="${id}"]`);if(b)b.classList.add('on')}
  document.getElementById('absub').textContent=SUB[id]||'';
}

/* ═══ TOAST ═══ */
let TT;
function T(m){const el=document.getElementById('toast');el.innerHTML=(typeof iconify==='function')?iconify(m):m;el.classList.add('on');clearTimeout(TT);TT=setTimeout(()=>el.classList.remove('on'),2200)}
window.T=T;

/* ═══ RIPPLE ═══ */
function R(e,el){const r=el.getBoundingClientRect(),s=Math.max(r.width,r.height)*1.6,d=document.createElement('div');d.className='rpx';d.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;el.appendChild(d);setTimeout(()=>d.remove(),500)}
window.R=R;

/* ═══ MOOD ═══ */
// Mood state
// anaMood already declared above

function pickMood(el, emoji, msg){
  document.querySelectorAll('.mood').forEach(m=>{
    m.classList.remove('picked');
    m.style.background='rgba(255,255,255,.05)';
    m.style.borderColor='rgba(255,255,255,.08)';
  });
  el.classList.add('picked');
  T(emoji+' '+msg);
  showSuccess(emoji, msg.split(' ')[0] || 'Mood set!', 'rgba(224,85,120,.15)');

  // Save mood state
  const label = el.querySelector('.mood-lbl').textContent;
  anaMood.history.unshift({emoji, label, time: anaMood.time});
  if(anaMood.history.length > 6) anaMood.history.pop();
  anaMood.emoji = emoji;
  anaMood.label = label;
  anaMood.msg   = msg;
  anaMood.time  = 'Just now';
  totalMoodsSet++;
  if(typeof checkAchievements === 'function') checkAchievements();

  // Update Robert's activity view if visible
  updateRobMoodCard();
  saveState();
}
window.pickMood=pickMood;

function updateRobMoodCard(){
  const ico   = document.querySelector('.ana-mood-ico');
  const title = document.querySelector('.ana-mood-title');
  const sub   = document.querySelector('.ana-mood-sub');
  const hist  = document.getElementById('rob-mood-history');

  if(ico)   ico.textContent   = anaMood.emoji;
  if(title) title.textContent = 'Ana is feeling ' + anaMood.label.toLowerCase();
  if(sub)   sub.textContent   = 'She picked "' + anaMood.label + '" — ' + anaMood.time;

  if(hist){
    hist.innerHTML = anaMood.history.slice(0,4).map(m=>`
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
        <div style="font-size:20px;flex-shrink:0">${m.emoji}</div>
        <div style="flex:1;font-size:12px;font-weight:700;color:#fff">${m.label}</div>
        <div style="font-size:10px;color:var(--tx3)">${m.time}</div>
      </div>
    `).join('');
  }
}

/* ═══ ROBERT MOOD PICKER ═══ */
function pickRobMood(el, emoji, label){
  // Highlight selected in Robert's picker
  el.closest('.mood-row').querySelectorAll('.mood').forEach(m=>{
    m.classList.remove('picked');
    m.style.background='rgba(255,255,255,.05)';
    m.style.borderColor='rgba(255,255,255,.08)';
  });
  el.classList.add('picked');

  // Save state
  robertMood.emoji = emoji;
  robertMood.label = label;
  robertMood.time  = 'Just now';
  if(typeof checkAchievements === 'function') checkAchievements();

  T(emoji + ' Your mood is set — Ana can see it now 💕');
  showSuccess(emoji, 'Mood set!', 'rgba(110,232,180,.15)');

  // Update Ana's home card
  updateRobMoodHomeCard();
  saveState();
}
window.pickRobMood = pickRobMood;

function updateRobMoodHomeCard(){
  const inner = document.getElementById('rob-mood-home-inner');
  if(!inner) return;
  if(!robertMood.emoji){
    inner.innerHTML = '<div class="rob-mood-home-empty">Robert hasn\'t shared his mood yet 🌙</div>';
    return;
  }
  inner.innerHTML = `
    <div class="rob-mood-home-emoji">${robertMood.emoji}</div>
    <div class="rob-mood-home-info">
      <div class="rob-mood-home-label">Robert is feeling ${robertMood.label.toLowerCase()}</div>
      <div class="rob-mood-home-time">${robertMood.time}</div>
    </div>
  `;
}
window.updateRobMoodHomeCard = updateRobMoodHomeCard;
/* openLetter and closeMod defined below */

/* ═══ EXPLORE ═══ */
const ICO={
  letter:`<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.82)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 8l10 7 10-7"/></svg>`,
  tip:`<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.82)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  date:`<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.82)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>`,
  gift:`<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.82)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v10H4V12M22 7H2v5h20zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>`,
  note:`<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.82)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
};
const ED={
  // Real launch starts genuinely empty — Robert adds real letters,
  // surprises, and notes for Ana through the Dev tab (saveDevItem() in
  // js/dev.js pushes directly into these arrays), so whatever shows up
  // here from now on is real, not placeholder/demo content.
  notes:[],
  surprises:[],
  letters:[],
};
let curTab='notes';
function renderGrid(k){
  curTab=k;
  const g=document.getElementById('xg');
  if(!g) return;
  let items=(ED[k]||[]).map((it,i)=>({...it,_origIdx:i}));
  // Search filter
  if(typeof searchQuery!=='undefined' && searchQuery){
    items=items.filter(it=>{
      const lbl=it.l.replace('\n',' ').toLowerCase();
      const ttl=it.letter?it.letter.t.toLowerCase():'';
      return lbl.includes(searchQuery)||ttl.includes(searchQuery);
    });
  }
  if(items.length===0){
    const msg = (typeof searchQuery!=='undefined' && searchQuery)
      ? 'No letters found 💭'
      : "Nothing here yet — check back soon 💌";
    g.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:24px 0;font-size:12px;color:var(--tx3)">'+msg+'</div>';
    return;
  }
  // Store for safe index-based opening (no content in onclick attr)
  window._gridItems = items;
  window._gridCat   = k;

  g.innerHTML=items.map((it,i)=>{
    const origIdx=it._origIdx!==undefined?it._origIdx:i;
    const price=it.price||1000;
    let ch;
    if(it.lk){
      ch=`openBuySheet(${origIdx},'${k}');R(event,this)`;
    } else if(it.letter || it.surpriseType){
      ch=`openGridLetter(${i});R(event,this)`;
    } else {
      ch=`T('✨ Opening…');R(event,this)`;
    }
    return `<div class="xi ${it.lk?'xlk':''} rw" style="animation-delay:${i*.04}s" onclick="${ch}">
      ${!it.lk?`<div class="xi-d${it.read===false?' new':''}"></div>`:''}
      <div class="xi-i">${ICO[it.i]||ICO.letter}</div>
      <span class="xi-l">${it.l.replace('\n','<br>')}</span>
      ${it.lk?`<span class="xi-price">🪙 ${price.toLocaleString()} pts</span>`:''}
    </div>`;
  }).join('');
}
function openGridLetter(i){
  const items = window._gridItems;
  if(!items || !items[i]) return;

  const cat = window._gridCat;
  const origIdx = items[i]._origIdx;
  const source = cat && ED[cat] ? ED[cat][origIdx] : null;

  // Interactive surprises (animations) open in the surprise player,
  // not the normal text-letter reader.
  if(source && source.surpriseType){
    if(typeof openSurprisePlayer === 'function') openSurprisePlayer(source.surpriseType);
    if(source.read === false){
      source.read = true;
      renderGrid(cat);
      if(typeof saveState === 'function') saveState();
    }
    return;
  }

  if(!items[i].letter) return;
  const it = items[i].letter;

  if(cat === 'notes'){
    if(typeof openNoteCard === 'function') openNoteCard(it.t, it.b, it.s);
  } else {
    openLetter('Heartly', it.t, it.b, it.s);
  }

  if(source && source.read === false){
    source.read = true;
    renderGrid(cat);
    if(typeof renderHomeLetters === 'function') renderHomeLetters();
    if(typeof saveState === 'function') saveState();
  }
}
window.openGridLetter = openGridLetter;

renderGrid('notes');
// Populate Ana's "Robert's mood" home card on first paint — previously it
// only rendered after Robert actively picked a mood in the same session,
// so a fresh load showed stale/empty state even if a mood was already saved.
if(typeof updateRobMoodHomeCard === 'function') updateRobMoodHomeCard();
document.getElementById('stabs').addEventListener('click',e=>{
  const b=e.target.closest('.stab');if(!b)return;
  document.querySelectorAll('.stab').forEach(s=>s.classList.remove('on'));
  b.classList.add('on');renderGrid(b.dataset.k);
});

/* ═══ ENHANCED BUTTON PRESS (global scale feedback) ═══ */
(function(){
  let pressed = null;
  function release(){
    if(!pressed)return;
    const {el,transform,transition}=pressed;
    el.style.transform=transform;
    el.style.transition=transition;
    pressed=null;
  }
  document.addEventListener('touchstart',e=>{
    release();
    const el=e.target.closest('.rw');
    if(!el||e.touches.length!==1)return;
    pressed={el,transform:el.style.transform,transition:el.style.transition};
    el.style.transition='transform .08s ease';
    el.style.transform=(getComputedStyle(el).transform==='none'?'':getComputedStyle(el).transform)+' scale(.96)';
  },{passive:true});
  for(const type of ['touchmove','touchend','touchcancel'])document.addEventListener(type,release,{passive:true});
  window.addEventListener('blur',release);
})();

/* ═══ SUCCESS BURST ═══ */
function showSuccess(ico, label, color){
  // Remove any existing burst
  const old = document.getElementById('_sburst');
  if(old) old.remove();

  const burst = document.createElement('div');
  burst.id = '_sburst';
  burst.className = 'success-burst';
  burst.innerHTML = `
    <div class="success-ring" style="background:${color||'rgba(224,85,120,.15)'};border:2px solid ${color||'rgba(224,85,120,.4)'}">
      <div class="success-ring-ico">${ico}</div>
      <div class="success-ring-lbl">${label}</div>
    </div>`;
  document.body.appendChild(burst);
  setTimeout(()=>{ if(burst.parentNode) burst.remove(); }, 700);
}
window.showSuccess = showSuccess;

/* ═══ UNLOCK SHIMMER ═══ */
function showUnlockShimmer(){
  const s = document.createElement('div');
  s.className = 'unlock-sweep';
  document.body.appendChild(s);
  setTimeout(()=>{ if(s.parentNode) s.remove(); }, 600);
}
window.showUnlockShimmer = showUnlockShimmer;

/* ═══ LONG-PRESS ENGINE ═══ */
function setupLongPress(el, callback, ms){
  ms = ms || 600;
  let timer = null;
  let moved = false;

  function start(e){
    cancel();
    if(e.touches.length!==1)return;
    moved = false;
    timer = setTimeout(()=>{
      if(!moved){
        callback(e);
        navigator.vibrate && navigator.vibrate(30);
      }
    }, ms);
  }
  function cancel(){ clearTimeout(timer); timer = null; }
  function move(){ moved = true; cancel(); }

  el.addEventListener('touchstart', start, {passive:true});
  el.addEventListener('touchend', cancel, {passive:true});
  el.addEventListener('touchcancel', cancel, {passive:true});
  el.addEventListener('touchmove', move, {passive:true});
  el.addEventListener('contextmenu', e=>{ e.preventDefault(); });
}
window.setupLongPress = setupLongPress;

/* ═══ LONG-PRESS POPOVER ═══ */
let lpDismissTimer=null;
function dismissLpOutside(e){
  const pop=document.getElementById('_lppop');
  if(pop&&!pop.contains(e.target))closeLpPop();
}
function showLpPop(html, targetEl){
  closeLpPop();
  const pop = document.createElement('div');
  pop.id = '_lppop';
  pop.className = 'lp-pop';
  pop.innerHTML = html;

  // Position near element
  const r = targetEl ? targetEl.getBoundingClientRect() : {top:window.innerHeight/2, left:window.innerWidth/2, width:0};
  pop.style.cssText = `top:${Math.max(8, Math.min(r.top - 10, window.innerHeight - 220))}px;left:${Math.max(8, Math.min(r.left, window.innerWidth - 296))}px`;

  document.body.appendChild(pop);

  // Dismiss on tap outside
  lpDismissTimer=setTimeout(()=>{
    document.addEventListener('touchstart', dismissLpOutside, {passive:true});
    document.addEventListener('click', dismissLpOutside);
  }, 100);
}
window.showLpPop = showLpPop;

function closeLpPop(){
  clearTimeout(lpDismissTimer);
  document.removeEventListener('touchstart',dismissLpOutside);
  document.removeEventListener('click',dismissLpOutside);
  const p = document.getElementById('_lppop');
  if(p) p.remove();
}
window.closeLpPop = closeLpPop;

/* ═══ SWIPE DOWN TO DISMISS SHEETS ═══ */
function setupSwipeDismiss(sheetEl, dimEl, closeFunc){
  let startY=0, currentY=0, dragging=false, originalTransform='';
  const inner=sheetEl.querySelector('[id$="-INNER"]')||sheetEl.firstElementChild;
  if(!inner)return;
  const handle=inner.querySelector('.sheet-handle,.buy-handle');
  if(handle){
    handle.style.touchAction='none';
    handle.style.boxSizing='content-box';
    handle.style.padding='12px 14px';
    handle.style.backgroundClip='content-box';
  }
  function reset(){
    if(dragging)inner.style.transform=originalTransform;
    dragging=false;
  }
  sheetEl.addEventListener('touchstart',e=>{
    reset();
    if(e.touches.length!==1||!e.target.closest('.sheet-handle,.buy-handle'))return;
    startY=currentY=e.touches[0].clientY;
    originalTransform=inner.style.transform;
    dragging=true;
  },{passive:true});
  sheetEl.addEventListener('touchmove',e=>{
    if(!dragging)return;
    if(e.touches.length!==1){reset();return;}
    currentY=e.touches[0].clientY;
    inner.style.transform=`translateY(${Math.max(0,currentY-startY)}px)`;
  },{passive:true});
  sheetEl.addEventListener('touchend',()=>{
    const dismiss=dragging&&currentY-startY>80;
    reset();
    if(dismiss)closeFunc();
  },{passive:true});
  sheetEl.addEventListener('touchcancel',reset,{passive:true});
}
window.setupSwipeDismiss = setupSwipeDismiss;

/* ═══ PATCHED renderGrid — sort, pin, tags, secret ═══ */
(function(){
  const _orig = window.renderGrid || renderGrid;
  window.renderGrid = function(k){
    curTab = k;
    const g = document.getElementById('xg');
    if(!g) return;

    let items = (ED[k]||[]).map((it,i)=>({...it, _origIdx:i}));

    // Search filter
    if(typeof searchQuery !== 'undefined' && searchQuery){
      items = items.filter(it=>{
        const lbl = it.l.replace('\n',' ').toLowerCase();
        const ttl = it.letter ? it.letter.t.toLowerCase() : '';
        return lbl.includes(searchQuery) || ttl.includes(searchQuery);
      });
    }

    // Sort
    const sort = typeof exploreSort !== 'undefined' ? exploreSort : 'default';
    if(sort === 'newest'){
      items = items.slice().sort((a,b)=> a._origIdx - b._origIdx);
    } else if(sort === 'oldest'){
      items = items.slice().sort((a,b)=> b._origIdx - a._origIdx);
    } else if(sort === 'points'){
      items = items.slice().sort((a,b)=> (b.price||0) - (a.price||0));
    }

    if(items.length === 0){
      const msg = (typeof searchQuery!=='undefined' && searchQuery)
        ? 'No letters found 💭'
        : "Nothing here yet — check back soon 💌";
      g.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:24px 0;font-size:12px;color:var(--tx3)">'+msg+'</div>';
      return;
    }

    window._gridItems = items;
    window._gridCat   = k;

    // Pinned featured card
    let pinnedHTML = '';
    if(typeof explorePinned !== 'undefined' && explorePinned && explorePinned.cat === k){
      const pit = ED[k][explorePinned.idx];
      if(pit && pit.letter && !pit.lk){
        const pidx = items.findIndex(it=> it._origIdx === explorePinned.idx);
        pinnedHTML = `<div class="xi xi-pinned rw" onclick="openGridLetter(${pidx});R(event,this)">
          <div style="flex:1">
            <div class="xi-pinned-badge">⭐ Featured</div>
            <div class="xi-pinned-title" data-no-iconify>${pit.letter.t}</div>
            <div class="xi-pinned-sub" data-no-iconify>${pit.letter.b.replace(/<[^>]+>/g,'').substring(0,60)}…</div>
          </div>
          <div style="font-size:28px">${ICO[pit.i]?'':''}</div>
        </div>`;
      }
    }

    const gridItems = items.map((it,i)=>{
      const origIdx = it._origIdx !== undefined ? it._origIdx : i;
      const price   = it.price || 1000;
      const isSecret = it.secret && !it.lk;

      let ch;
      if(it.lk){
        ch = `openBuySheet(${origIdx},'${k}');R(event,this)`;
      } else if(it.letter || it.surpriseType){
        ch = `openGridLetter(${i});R(event,this)`;
      } else {
        ch = `T('✨ Opening…');R(event,this)`;
      }

      const tagHTML = it.tag ? `<span class="xi-tag ${it.tag.toLowerCase()}">${it.tag}</span>` : '';

      if(isSecret){
        return `<div class="xi xi-secret rw" style="animation-delay:${i*.04}s">
          <div class="xi-secret-blur">
            <div class="xi-secret-ico">🔒</div>
            <div class="xi-secret-lbl">Mystery</div>
          </div>
          <div class="xi-d"></div>
          <div class="xi-i">${ICO[it.i]||ICO.letter}</div>
          <span class="xi-l">???</span>
        </div>`;
      }

      return `<div class="xi ${it.lk?'xlk':''} rw" style="animation-delay:${i*.04}s" onclick="${ch}">
        ${!it.lk?`<div class="xi-d${it.read===false?' new':''}"></div>`:''}
        <div class="xi-i">${ICO[it.i]||ICO.letter}</div>
        <span class="xi-l">${it.l.replace('\n','<br>')}${tagHTML}</span>
        ${it.lk?`<span class="xi-price">🪙 ${price.toLocaleString()} pts</span>`:''}
      </div>`;
    });

    g.innerHTML = pinnedHTML + gridItems.join('');
  };
  // Re-run initial render with patched version
  if(typeof curTab !== 'undefined') window.renderGrid(curTab);
})();
