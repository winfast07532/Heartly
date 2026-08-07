/* ═══════════════════════════
   EXCHANGE — ANIMATED COUNTER
═══════════════════════════ */
// ptsVal declared earlier — see below
txHistoryOpen = false; // already declared above

// Show the real weekly change (not the static placeholder in index.html)
setTimeout(function(){ if(typeof refreshPtsChg === 'function') refreshPtsChg(); }, 0);

// Animate counter from current to target
function animatePts(from, to, duration){
  const el = document.getElementById('pts-display');
  if(!el) return;
  if(to < from){ el.style.animation='none'; void el.offsetWidth; el.style.animation='ptsSpend .5s ease'; }
  const start = performance.now();
  const diff = to - from;
  function step(now){
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3); // ease-out cubic
    const val = Math.round(from + diff * ease);
    el.textContent = val.toLocaleString();
    if(p < 1) requestAnimationFrame(step);
    else { el.textContent = to.toLocaleString(); ptsVal = to; }
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

// Keep transaction feed compact when collapsed
function refreshTxCollapse(){
  const list   = document.getElementById('tx-list');
  const extra  = document.getElementById('tx-extra');
  const toggle = document.getElementById('tx-toggle');
  if(!list || !extra || !toggle) return;

  const items = Array.from(list.querySelectorAll('.tx-item'));
  const hiddenCount = Math.max(0, items.length - TX_VISIBLE_COLLAPSED);

  if(txHistoryOpen){
    items.forEach(it => it.style.display = '');
    extra.style.display = 'block';
    toggle.textContent = '▴ Show less';
  } else {
    items.forEach((it, idx) => {
      it.style.display = idx < TX_VISIBLE_COLLAPSED ? '' : 'none';
    });
    extra.style.display = 'none';
    toggle.textContent = hiddenCount > 0
      ? `▾ Show ${hiddenCount} more transactions`
      : '▾ Show more history';
  }
}

// Add a new transaction item to the top of the list
function addTxItem(icon, title, date, amt, type){
  const list = document.getElementById('tx-list');
  if(!list) return;
  const item = document.createElement('div');
  item.className = 'tx-item';
  item.style.animationDelay = '0s';
  item.innerHTML = `
    <div class="tx-ico ${type}">${icon}</div>
    <div class="tx-body"><div class="tx-title">${title}</div><div class="tx-date">${date}</div></div>
    <div class="tx-amt ${type}">${amt}</div>`;
  list.insertBefore(item, list.firstChild);
  refreshTxCollapse();
}

// Toggle full history
function toggleTxHistory(){
  txHistoryOpen = !txHistoryOpen;
  refreshTxCollapse();
}
window.toggleTxHistory = toggleTxHistory;

// Initialize compact transaction feed on load
setTimeout(refreshTxCollapse, 0);
