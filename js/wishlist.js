/* ═══════════════════════════
   WISH LIST — ANA & ROBERT
   + ANA'S SUGGESTION BOX
═══════════════════════════ */

var _wishCat = 'Experiences';
var WISH_CATS = [
  {label:'Experiences', ico:'🌍'},
  {label:'Gifts',       ico:'🎁'},
  {label:'Dates',       ico:'🌹'},
  {label:'Dreams',      ico:'✨'},
];

/* ── OPEN / CLOSE ─────────────────────────────────── */
function openWishList(){
  const sheet = document.getElementById('WISH-SHEET');
  const dim   = document.getElementById('WISH-dim');
  if(!sheet) return;
  renderWishList();
  sheet.classList.add('on');
  dim.classList.add('on');
}
window.openWishList = openWishList;

function closeWishList(){
  document.getElementById('WISH-SHEET').classList.remove('on');
  document.getElementById('WISH-dim').classList.remove('on');
}
window.closeWishList = closeWishList;

function openAddWish(){
  const sheet = document.getElementById('ADD-WISH-SHEET');
  const dim   = document.getElementById('ADD-WISH-dim');
  if(!sheet) return;
  document.getElementById('wish-input').value = '';
  _wishCat = 'Experiences';
  renderWishCatBtns();
  sheet.classList.add('on');
  dim.classList.add('on');
  setTimeout(()=> document.getElementById('wish-input').focus(), 350);
}
window.openAddWish = openAddWish;

function closeAddWish(){
  document.getElementById('ADD-WISH-SHEET').classList.remove('on');
  document.getElementById('ADD-WISH-dim').classList.remove('on');
}
window.closeAddWish = closeAddWish;

/* ── ANA'S WISH LIST ──────────────────────────────── */
function selectWishCat(cat){ _wishCat=cat; renderWishCatBtns(); }
window.selectWishCat = selectWishCat;

function renderWishCatBtns(){
  const row = document.getElementById('wish-cat-row');
  if(!row) return;
  row.innerHTML = WISH_CATS.map(c=>`
    <button class="wish-cat-btn rw ${_wishCat===c.label?'on':''}" onclick="selectWishCat('${c.label}');R(event,this)">
      ${c.ico} ${c.label}
    </button>`).join('');
}

function saveWish(){
  const input = document.getElementById('wish-input');
  const text  = input.value.trim();
  if(!text || text.length<2){ T('Write your wish first ✨'); return; }
  const cat = WISH_CATS.find(c=>c.label===_wishCat)||WISH_CATS[0];
  anaWishList.unshift({text, cat:cat.label, ico:cat.ico, status:'pending', by:'ana'});
  closeAddWish();
  renderWishList();
  showSuccess('✨','Wish added!','rgba(224,85,120,.2)');
  T('✨ Wish added to your list!');
  saveState();
}
window.saveWish = saveWish;

/* Render the wish list sheet — shows Ana's AND Robert's wishes in tabs */
var _wishViewTab = 'ana';
function renderWishList(){
  const listEl = document.getElementById('wish-list');
  if(!listEl) return;

  // Tab header
  const tabs = document.getElementById('wish-sheet-tabs');
  if(tabs){
    tabs.innerHTML = `
      <button class="wish-tab-btn ${_wishViewTab==='ana'?'on':''}" onclick="setWishViewTab('ana')">✨ My Wishes</button>
      <button class="wish-tab-btn ${_wishViewTab==='rob'?'on':''}" onclick="setWishViewTab('rob')">💙 Robert's</button>`;
  }

  const items = _wishViewTab==='ana' ? anaWishList : robertWishList;
  if(!items.length){
    listEl.innerHTML = `<div style="text-align:center;padding:28px 0;font-size:12px;color:var(--tx3)">${
      _wishViewTab==='ana' ? 'No wishes yet — add your first one ✨' : 'Robert hasn\'t added any wishes yet 💙'
    }</div>`;
    return;
  }
  listEl.innerHTML = items.map((w,i)=>`
    <div class="wish-item ${w.status==='done'?'done':''}" style="animation-delay:${i*.04}s">
      <div class="wish-item-ico">${w.ico||'✨'}</div>
      <div class="wish-item-info">
        <div class="wish-item-text">${w.text}</div>
        <div class="wish-item-cat">${w.cat||'Wish'}</div>
      </div>
      ${w.status==='planned'?'<div class="wish-item-status planned">📌 Planned</div>':''}
      ${w.status==='done'?'<div class="wish-item-status done-badge">✅ Done</div>':''}
    </div>`).join('');
}
window.renderWishList = renderWishList;

function setWishViewTab(tab){
  _wishViewTab = tab;
  renderWishList();
}
window.setWishViewTab = setWishViewTab;

/* ── ROBERT'S VIEW (DEV PANEL) ────────────────────── */
var _dvWishTab = 'ana';
function dvWishTab(tab, btn){
  _dvWishTab = tab;
  // Only toggle within the wishlist tab group
  if(btn){
    const group = btn.closest('.dv-tabs');
    if(group) group.querySelectorAll('.dv-tab-btn').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on');
  }
  ['ana','rob','suggest'].forEach(t=>{
    const el = document.getElementById('dv-wish-'+t);
    if(el) el.style.display = t===tab ? 'block' : 'none';
  });
  if(tab==='ana')     renderRobWishList();
  if(tab==='rob')     renderRobOwnWishList();
  if(tab==='suggest') renderRobSuggestions();
}
window.dvWishTab = dvWishTab;

// Ana's wishes in Robert's panel
function renderRobWishList(){
  const list = document.getElementById('rob-wish-list');
  if(!list) return;
  if(!anaWishList.length){
    list.innerHTML='<div style="text-align:center;padding:16px 0;font-size:12px;color:var(--tx3)">Ana hasn\'t added any wishes yet 💭</div>';
    return;
  }
  list.innerHTML = anaWishList.map((w,i)=>`
    <div class="wish-item ${w.status==='done'?'done':''}" style="animation-delay:${i*.04}s">
      <div class="wish-item-ico">${w.ico||'✨'}</div>
      <div class="wish-item-info">
        <div class="wish-item-text">${w.text}</div>
        <div class="wish-item-cat">${w.cat||'Wish'}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
        ${w.status==='pending'?`<button class="dev-pts-btn rw" style="padding:5px 10px;font-size:10px" onclick="markWish(${i},'planned');R(event,this)">📌 Plan</button>`:''}
        ${w.status==='planned'?`<button class="dev-pts-btn rw" style="padding:5px 10px;font-size:10px;background:rgba(110,232,180,.12);border-color:rgba(110,232,180,.3);color:var(--mint)" onclick="markWish(${i},'done');R(event,this)">✅ Done</button>`:''}
        ${w.status==='done'?'<div class="wish-item-status done-badge">✅ Done</div>':''}
      </div>
    </div>`).join('');
}
window.renderRobWishList = renderRobWishList;

function markWish(i, status){
  if(!anaWishList[i]) return;
  anaWishList[i].status = status;
  renderRobWishList();
  T(status==='planned'?'📌 Marked as planned!':'✅ Wish fulfilled!');
  if(status==='done') showSuccess('✅','Done!','rgba(110,232,180,.2)');
  saveState();
}
window.markWish = markWish;

// Robert's own wishlist
function dvAddRobWish(){
  const inp = document.getElementById('rob-wish-input');
  const catEl = document.getElementById('rob-wish-cat');
  if(!inp||!inp.value.trim()){ T('Write a wish first'); return; }
  const catMap = {'Experiences':'🌍','Gifts':'🎁','Dates':'🌹','Dreams':'✨'};
  const cat = catEl ? catEl.value : 'Dreams';
  const ico = catMap[cat]||'💙';
  robertWishList.unshift({text:inp.value.trim(), ico, cat, status:'pending', by:'robert'});
  inp.value='';
  renderRobOwnWishList();
  saveState();
  T(ico+' Added to your wish list!');
}
window.dvAddRobWish = dvAddRobWish;

function renderRobOwnWishList(){
  const list = document.getElementById('rob-own-wish-list');
  if(!list) return;
  if(!robertWishList.length){
    list.innerHTML='<div style="font-size:11px;color:rgba(0,255,180,.25);text-align:center;padding:12px 0">Your wish list is empty</div>';
    return;
  }
  list.innerHTML = robertWishList.map((w,i)=>`
    <div class="dv-item-row">
      <div class="dv-item-body">
        <div class="dv-item-text">${w.text}</div>
      </div>
      <div class="dv-item-del" onclick="robertWishList.splice(${i},1);renderRobOwnWishList();saveState()">🗑</div>
    </div>`).join('');
}
window.renderRobOwnWishList = renderRobOwnWishList;

/* ── SUGGESTION BOX ───────────────────────────────── */
function saveSuggestion(){
  const inp = document.getElementById('suggestion-input');
  if(!inp||!inp.value.trim()){ T('Write your suggestion first 💬'); return; }
  const now = new Date();
  anaSuggestions.unshift({
    text: inp.value.trim(),
    date: now.toLocaleDateString('en-GB',{day:'numeric',month:'short'}),
    seen: false,
  });
  inp.value = '';
  renderSuggestionList();
  showSuccess('💬','Suggestion sent!','rgba(110,232,180,.15)');
  T('💬 Suggestion sent to Robert!');
  saveState();
}
window.saveSuggestion = saveSuggestion;

function renderSuggestionList(){
  const list = document.getElementById('suggestion-list');
  if(!list) return;
  if(!anaSuggestions.length){
    list.innerHTML='<div style="font-size:11px;color:var(--tx3);text-align:center;padding:8px 0">Your suggestions will appear here</div>';
    return;
  }
  list.innerHTML = anaSuggestions.slice(0,5).map((s,i)=>`
    <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);animation:fadeUp .25s ease ${i*.04}s both">
      <div style="font-size:18px;flex-shrink:0">💬</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:700;color:#fff;line-height:1.45">${s.text}</div>
        <div style="font-size:10px;color:var(--tx3);margin-top:2px">${s.date}</div>
      </div>
      <div style="font-size:9px;font-weight:800;color:${s.seen?'rgba(110,232,180,.7)':'rgba(245,200,112,.7)'};flex-shrink:0">${s.seen?'Seen':'Sent'}</div>
    </div>`).join('');
}
window.renderSuggestionList = renderSuggestionList;

// Robert sees Ana's suggestions
function renderRobSuggestions(){
  const list = document.getElementById('rob-suggestion-list');
  if(!list) return;

  const unread = anaSuggestions.filter(s=>!s.seen).length;

  if(!anaSuggestions.length){
    list.innerHTML=`
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px 0">
        <div style="font-size:28px;opacity:.35">💬</div>
        <div style="font-size:11px;color:rgba(0,255,180,.3);text-align:center">No suggestions from Ana yet</div>
      </div>`;
    return;
  }

  // Header with unread count + mark all button
  const header = unread > 0
    ? `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="font-size:10px;font-weight:800;color:rgba(245,200,112,.8);letter-spacing:.5px">${unread} UNREAD</div>
        <button class="dv-btn small warn" onclick="markAllSuggestionsSeen()" style="padding:5px 10px;font-size:10px">Mark all seen</button>
       </div>`
    : `<div style="font-size:10px;color:rgba(0,255,180,.3);margin-bottom:10px;text-align:right">${anaSuggestions.length} total · all seen</div>`;

  list.innerHTML = header + anaSuggestions.map((s,i)=>`
    <div style="
      background:${s.seen ? 'rgba(255,255,255,.03)' : 'rgba(0,255,180,.06)'};
      border:1px solid ${s.seen ? 'rgba(255,255,255,.07)' : 'rgba(0,255,180,.18)'};
      border-radius:12px;padding:11px 13px;margin-bottom:8px;
      transition:all .2s;position:relative;overflow:hidden;
    ">
      ${!s.seen ? '<div style="position:absolute;top:0;left:0;width:3px;height:100%;background:var(--dev-accent);border-radius:3px 0 0 3px"></div>' : ''}
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="font-size:18px;flex-shrink:0;margin-top:1px">💬</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:700;color:${s.seen ? 'rgba(255,255,255,.65)' : '#fff'};line-height:1.5;margin-bottom:4px">${s.text}</div>
          <div style="font-size:10px;color:rgba(0,255,180,.4);font-weight:700">${s.date}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end;flex-shrink:0">
          ${!s.seen
            ? `<button class="dv-btn small" onclick="markSuggestionSeen(${i})" style="padding:5px 10px;font-size:10px;white-space:nowrap">✓ Mark seen</button>`
            : `<div style="font-size:9px;font-weight:800;color:rgba(110,232,180,.6);padding:4px 8px;background:rgba(110,232,180,.08);border:1px solid rgba(110,232,180,.15);border-radius:var(--rp)">Seen</div>`
          }
          <div class="dv-item-del" onclick="anaSuggestions.splice(${i},1);renderRobSuggestions();saveState()" style="opacity:.4;font-size:13px;cursor:pointer;padding:2px">🗑</div>
        </div>
      </div>
    </div>`).join('');
}
window.renderRobSuggestions = renderRobSuggestions;

function markAllSuggestionsSeen(){
  anaSuggestions.forEach(s=>s.seen=true);
  renderRobSuggestions();
  renderSuggestionList();
  saveState();
  T('✓ All suggestions marked as seen');
}
window.markAllSuggestionsSeen = markAllSuggestionsSeen;

function markSuggestionSeen(i){
  if(!anaSuggestions[i]) return;
  anaSuggestions[i].seen = true;
  renderRobSuggestions();
  renderSuggestionList(); // update Ana's view
  saveState();
  T('✓ Marked as seen');
}
window.markSuggestionSeen = markSuggestionSeen;

/* ── WISH SHEET TABS CSS injection ────────────────── */
(function(){
  const s = document.createElement('style');
  s.textContent=`
    .wish-tab-btn{
      flex:1;padding:8px 10px;border-radius:8px;
      font-size:12px;font-weight:800;color:var(--tx2);
      cursor:pointer;transition:all .18s;text-align:center;
      font-family:'Nunito',sans-serif;background:none;border:none;
    }
    .wish-tab-btn.on{
      background:var(--rose-d);color:var(--rose-b);
      border:1px solid var(--rose-g);
    }
    #wish-sheet-tabs{
      display:flex;gap:4px;
      background:rgba(255,255,255,.05);
      border-radius:10px;padding:3px;
      margin-bottom:12px;
    }
  `;
  document.head.appendChild(s);
})();

/* ── APPLY SHOP UNLOCKS ───────────────────────────── */
// Called by login.js after login and by applyShopUnlocks in themes.js
function applyWishlistUnlocks(){
  const wishRow  = document.getElementById('home-wishlist-row');
  const writeRow = document.getElementById('home-write-row');
  if(wishRow)  wishRow.style.display  = shopWishList   ? 'block' : 'none';
  if(writeRow) writeRow.style.display = shopWriteToRob ? 'block' : 'none';
  renderSuggestionList();
}
window.applyWishlistUnlocks = applyWishlistUnlocks;

/* ── SWIPE DISMISS ────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function(){
  const ws=document.getElementById('WISH-SHEET'), wd=document.getElementById('WISH-dim');
  if(ws&&wd) setupSwipeDismiss(ws,wd,closeWishList);
  const aws=document.getElementById('ADD-WISH-SHEET'), awd=document.getElementById('ADD-WISH-dim');
  if(aws&&awd) setupSwipeDismiss(aws,awd,closeAddWish);
});
