/* ═══════════════════════════
   EXCHANGE — ANIMATED COUNTER
═══════════════════════════ */
// ptsVal declared earlier — see below
txHistoryOpen = false; // already declared above

// Show the real weekly change (not the static placeholder in index.html)
setTimeout(function(){ if(typeof refreshPtsChg === 'function') refreshPtsChg(); }, 0);

// Animate counter from current to target — PURELY VISUAL. The real
// ptsVal is always set by the caller BEFORE calling this (every call
// site does `ptsVal += amt` first, then calls this just for the
// count-up effect).
//
// BUG (fixed): this used to also do `ptsVal = to` when the animation
// finished, using whatever `to` value was frozen in at the moment
// THIS call started. If a second point-award landed while the first
// animation was still running, both loops fought over the same
// on-screen number every frame, and whichever one finished LAST
// silently overwrote the real (already-correct, already-higher)
// ptsVal back down to its own stale target — actually deleting
// points from the real balance, not just a visual glitch.
let _ptsAnimGen = 0;
function animatePts(from, to, duration){
  const el = document.getElementById('pts-display');
  if(!el) return;
  const myGen = ++_ptsAnimGen; // invalidates any still-running older animation
  if(to < from){ el.style.animation='none'; void el.offsetWidth; el.style.animation='ptsSpend .5s ease'; }
  const start = performance.now();
  const diff = to - from;
  function step(now){
    if(myGen !== _ptsAnimGen) return; // a newer award started — stop, don't fight it for the DOM
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3); // ease-out cubic
    const val = Math.round(from + diff * ease);
    el.textContent = val.toLocaleString();
    if(p < 1) requestAnimationFrame(step);
    else el.textContent = ptsVal.toLocaleString(); // show the REAL current total, not this call's frozen target
  }
  requestAnimationFrame(step);
}

// Initial badge update
setTimeout(updateNBadge, 500);

// Unified go — handles all screen-specific logic
const _goOrig = window.go;
window.go = function(id){
  _goOrig(id);
  if(id==='exchange'){
    const el=document.getElementById('pts-display');
    if(el){ const cur=ptsVal; el.textContent='0'; setTimeout(()=>animatePts(0,cur,900),200); }
  }
  if(typeof checkScheduledLetters==='function') checkScheduledLetters();
  if(id==='home') if(typeof renderHomeLetters==='function') renderHomeLetters();
  if(id==='explore') if(typeof renderGrid==='function' && typeof curTab!=='undefined') renderGrid(curTab);
  if(id==='logs') if(typeof updateLogsStats==='function') updateLogsStats();
};

// Transaction feed collapse config
const TX_VISIBLE_COLLAPSED = 3;
const TX_LOG_MAX = 100; // keep this many, drop older

// Add a new transaction — persists to txLog (synced via Supabase, same
// as everything else in state) AND updates the DOM. Used to be DOM-only:
// real transactions vanished on every reload, leaving just the 4
// hardcoded demo entries baked into index.html.
function addTxItem(icon, title, dateLabelIgnored, amt, type){
  txLog.unshift({ icon: icon, title: title, amt: amt, type: type, ts: Date.now() });
  if(txLog.length > TX_LOG_MAX) txLog.length = TX_LOG_MAX;
  saveState();
  renderTxHistory();
}

// Renders the full feed fresh from txLog — the actual source of truth.
function renderTxHistory(){
  const list = document.getElementById('tx-list');
  if(!list) return;
  if(!txLog.length){
    list.innerHTML = '<div style="text-align:center;padding:16px 0;font-size:12px;color:var(--tx3)">No transactions yet — read a letter or play a game to start earning 💕</div>';
    refreshTxCollapse();
    return;
  }
  list.innerHTML = txLog.map(function(tx, i){
    return `<div class="tx-item" style="animation-delay:${Math.min(i,4)*.04}s">
      <div class="tx-ico ${tx.type}">${tx.icon}</div>
      <div class="tx-body"><div class="tx-title">${tx.title}</div><div class="tx-date">${typeof timeAgo==='function' ? timeAgo(tx.ts) : ''}</div></div>
      <div class="tx-amt ${tx.type}">${tx.amt}</div>
    </div>`;
  }).join('');
  refreshTxCollapse();
}
window.renderTxHistory = renderTxHistory;

// Keep transaction feed compact when collapsed
function refreshTxCollapse(){
  const list   = document.getElementById('tx-list');
  const toggle = document.getElementById('tx-toggle');
  if(!list || !toggle) return;

  const items = Array.from(list.querySelectorAll('.tx-item'));
  const hiddenCount = Math.max(0, items.length - TX_VISIBLE_COLLAPSED);

  if(txHistoryOpen){
    items.forEach(it => it.style.display = '');
    toggle.textContent = '▴ Show less';
  } else {
    items.forEach((it, idx) => {
      it.style.display = idx < TX_VISIBLE_COLLAPSED ? '' : 'none';
    });
    toggle.textContent = hiddenCount > 0
      ? `▾ Show ${hiddenCount} more transactions`
      : '▾ Show more history';
  }
}

// Toggle full history
function toggleTxHistory(){
  txHistoryOpen = !txHistoryOpen;
  refreshTxCollapse();
}
window.toggleTxHistory = toggleTxHistory;

// Initialize on load
setTimeout(function(){ if(typeof renderTxHistory === 'function') renderTxHistory(); }, 0);
