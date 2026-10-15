
/* ═══════════════════════════════════
   POINTS SPEND ANIMATION
═══════════════════════════════════ */
// Patch animatePts to add spend animation
(function(){
  const _origAnimatePts = animatePts;
  window.animatePts = function(from, to, duration){
    const el = document.getElementById('pts-display');
    if(el && to < from){
      el.classList.add('spend');
      setTimeout(()=>el.classList.remove('spend'), 500);
    }
    _origAnimatePts(from, to, duration);
  };
})();


/* ── PRICE EDITOR ── */
function saveLetterPrice(index, panel){ _robDevListDirty = true;
  const inputId = 'price-' + panel + '-' + index;
  const input = document.getElementById(inputId);
  if(!input) return;
  const val = parseInt(input.value);
  if(isNaN(val) || val < 0){ T('⚠️ Invalid price'); return; }
  ED[devCurrentTab][index].price = val;
  T('🪙 Price set to ' + val.toLocaleString() + ' pts');
  renderDevListRob();
  if(typeof saveState==='function') saveState();
  // Re-render explore if visible
  if(document.getElementById('s-explore') && document.getElementById('s-explore').classList.contains('on')){
    renderGrid(devCurrentTab);
  }
}
window.saveLetterPrice = saveLetterPrice;


/* ═══════════════════════════
   DEV PASSWORD
═══════════════════════════ */
// Password-based developer login is disabled until server-side authentication is configured.

function openDevPassword(){
  const modal = document.getElementById('DEV-PW');
  const input = document.getElementById('dev-pw-input');
  const err   = document.getElementById('pw-error');
  input.value = '';
  input.type  = 'password';
  document.getElementById('pw-eye').textContent = '👁';
  err.textContent = 'Password login is disabled until secure authentication is configured.';
  input.disabled = true;
  input.classList.remove('error');
  modal.classList.add('show');
  setTimeout(()=>input.focus(), 200);
}
window.openDevPassword = openDevPassword;

function closeDevPassword(){
  document.getElementById('DEV-PW').classList.remove('show');
}
window.closeDevPassword = closeDevPassword;

function submitDevPassword(){
  document.getElementById('dev-pw-input').value = '';
  document.getElementById('pw-error').textContent = 'Password login is disabled until secure authentication is configured.';
}
window.submitDevPassword = submitDevPassword;

function togglePwVisibility(){
  const input = document.getElementById('dev-pw-input');
  const eye   = document.getElementById('pw-eye');
  if(input.type === 'password'){
    input.type = 'text';
    eye.textContent = '🙈';
  } else {
    input.type = 'password';
    eye.textContent = '👁';
  }
}
window.togglePwVisibility = togglePwVisibility;

// Also protect "Switch to Developer" button in profile
(function(){
  const _origSwitchToRobert = window.switchToRobert;
  window.switchToRobert = function(){
    closeProf();
    setTimeout(openDevPassword, 300);
  };
})();


/* ═══════════════════════════════════════════
   TRANSLATION SYSTEM
═══════════════════════════════════════════ */

/* ═══════════════════════════
   SETTINGS
═══════════════════════════ */
var notifPrefs = {letters:true, streak:true, goodnight:true, milestone:true, points:true, surprise:true};

function openSettings(){
  const s = document.getElementById('SETTINGS');
  s.style.display = 'flex';
  requestAnimationFrame(()=> s.classList.add('open'));
  // Sync theme options
  document.querySelectorAll('.theme-opt').forEach(el => el.classList.remove('on'));
  const activeOpt = document.getElementById('sett-theme-' + activeTheme);
  if(activeOpt) activeOpt.classList.add('on');
  // Sync notif toggles
  Object.keys(notifPrefs).forEach(k=>{
    const tog = document.getElementById('tog-'+k);
    if(tog) tog.classList.toggle('on', notifPrefs[k]);
  });
}
window.openSettings = openSettings;

function closeSettings(){
  const s = document.getElementById('SETTINGS');
  s.classList.remove('open');
  setTimeout(()=>{ s.style.display='none'; }, 350);
}
window.closeSettings = closeSettings;

function toggleNotifPref(key, el){
  notifPrefs[key] = !notifPrefs[key];
  el.classList.toggle('on', notifPrefs[key]);
  if(typeof saveState === 'function') saveState();
  updateNBadge();
}
window.toggleNotifPref = toggleNotifPref;

function applyThemeFromSettings(id, el){
  applyTheme(id, el);
  // Sync all theme option selectors (Ana settings + Robert settings)
  document.querySelectorAll('.theme-opt').forEach(o=>o.classList.remove('on'));
  ['sett-theme-','rob-sett-theme-'].forEach(prefix=>{
    const opt = document.getElementById(prefix+id);
    if(opt) opt.classList.add('on');
  });
}
window.applyThemeFromSettings = applyThemeFromSettings;

/* ═══════════════════════════
   ANA WRITES TO ROBERT
═══════════════════════════ */
function openAnaWrite(){
  document.getElementById('ANA-WRITE').classList.add('on');
  document.getElementById('ANA-WRITE-dim').classList.add('on');
  setTimeout(()=>document.getElementById('ana-write-input').focus(), 350);
}
window.openAnaWrite = openAnaWrite;

function closeAnaWrite(){
  document.getElementById('ANA-WRITE').classList.remove('on');
  document.getElementById('ANA-WRITE-dim').classList.remove('on');
}
window.closeAnaWrite = closeAnaWrite;

function sendAnaMessage(){
  const input = document.getElementById('ana-write-input');
  const text  = input.value.trim();
  if(!text || text.length < 2){ T('⚠️ Write something first 💕'); return; }

  const now = new Date();
  const time = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
  anaMessages.unshift({ text, time: 'Today, ' + time, read: false });

  input.value = '';
  document.getElementById('ana-write-count').textContent = '0';
  closeAnaWrite();
  T('💌 Message sent to Robert!');

  renderRobAnaMessages();
  saveState();
  if(typeof checkAchievements === 'function') checkAchievements();
}
window.sendAnaMessage = sendAnaMessage;

function renderRobAnaMessages(){
  const list = document.getElementById('rob-ana-messages-list');
  if(!list) return;
  if(!anaMessages || anaMessages.length === 0){
    list.innerHTML = '<div style="text-align:center;padding:12px 0;font-size:12px;color:var(--tx3)">No messages yet — Ana hasn\'t written yet 💭</div>';
    return;
  }
  list.innerHTML = anaMessages.map((m, i)=>`
    <div class="ana-msg-row" style="animation-delay:${i*.04}s">
      <div class="ana-msg-text">"${m.text}"</div>
      <div class="ana-msg-meta">
        <div class="ana-msg-time">${m.time}</div>
        ${!m.read ? '<div class="ana-msg-unread">New</div>' : ''}
      </div>
    </div>
  `).join('');
}
window.renderRobAnaMessages = renderRobAnaMessages;


/* ═══════════════════════════
   ROBERT PROFILE STATS
═══════════════════════════ */
function updateRobProfile(){
  const days = Math.floor((new Date() - relStartDate()) / 86400000);
  const sentEl = document.getElementById('rob-prof-sent');
  const daysEl = document.getElementById('rob-prof-days');
  const ptsEl  = document.getElementById('rob-prof-pts');
  if(sentEl) sentEl.textContent = sentLetters ? sentLetters.length : 0;
  if(daysEl) daysEl.textContent = days.toLocaleString();
  if(ptsEl)  ptsEl.textContent  = Math.floor(ptsVal).toLocaleString();
}
window.updateRobProfile = updateRobProfile;



/* ═══ SUCCESS ANIMATIONS — ANA'S ACTIONS ═══ */

// Write to Robert — success
(function(){
  const _orig = window.sendAnaMessage;
  window.sendAnaMessage = function(){
    const input = document.getElementById('ana-write-input');
    const text  = input ? input.value.trim() : '';
    if(!text || text.length < 2){ _orig(); return; }
    _orig();
    setTimeout(()=> showSuccess('💕', 'Sent!', 'rgba(224,85,120,.2)'), 150);
  };
})();

/* ═══ SWIPE DISMISS — ANA WRITE SHEET ═══ */
(function(){
  const sheet = document.getElementById('ANA-WRITE');
  const dim   = document.getElementById('ANA-WRITE-dim');
  if(sheet && dim) setupSwipeDismiss(sheet, dim, closeAnaWrite);
})();

/* ═══ EXPLORE SORT ═══ */
function setExploreSort(key, btn){
  exploreSort = key;
  document.querySelectorAll('.sort-btn').forEach(b=> b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  renderGrid(curTab);
}
window.setExploreSort = setExploreSort;

/* ═══ EXPLORE PIN ═══ */
function pinLetter(cat, origIdx){
  if(explorePinned && explorePinned.cat===cat && explorePinned.idx===origIdx){
    explorePinned = null;
    T('📌 Letter unpinned');
  } else {
    explorePinned = {cat, idx:origIdx};
    T('📌 Letter pinned as featured!');
  }
  renderGrid(cat);
}
window.pinLetter = pinLetter;

/* ═══ LONG-PRESS MOOD — ANA'S SIDE ═══ */
document.addEventListener('DOMContentLoaded', function(){
  // Wire long-press on Ana's mood pickers
  setTimeout(function(){
    document.querySelectorAll('#s-home .mood').forEach(function(el){
      setupLongPress(el, function(){
        const hist = anaMood.history;
        if(!hist || !hist.length){ T('No mood history yet 💭'); return; }
        const rows = hist.slice(0,5).map(m=>`
          <div class="lp-pop-row">
            <div class="lp-pop-emoji">${m.emoji}</div>
            <div class="lp-pop-label">${m.label}</div>
            <div class="lp-pop-time">${m.time}</div>
          </div>`).join('');
        showLpPop(`<div class="lp-pop-title">Your Mood History</div>${rows}`, el);
      }, 600);
    });
  }, 800);
});

/* ═══ BLOCK BLAST ═══ */
function openLoveBlast() {
  document.getElementById('bb-overlay').classList.add('show');
  // Reload iframe fresh each time
  const frame = document.getElementById('bb-frame');
  frame.src = 'loveblast/index.html';
}
window.openLoveBlast = openLoveBlast;

function closeLoveBlast() {
  document.getElementById('bb-overlay').classList.remove('show');
}
window.closeLoveBlast = closeLoveBlast;

/* ═══ COLOR BY NUMBER ═══ */
// Load the iframe src once on first open; subsequent opens just show the overlay
// (keeps level progress state alive — same pattern as blockblast)
let _pixelArtLoaded = false;
const PIXEL_ART_MAINTENANCE = false;
function openPixelArt() {
  if (PIXEL_ART_MAINTENANCE) {
    if (typeof T === 'function') T('🛠️ Color by Number is under maintenance — check back soon!');
    return;
  }
  const overlay = document.getElementById('cbn-overlay');
  overlay.classList.add('show');
  if (!_pixelArtLoaded) {
    document.getElementById('cbn-frame').src = 'pixelart/index.html';
    _pixelArtLoaded = true;
  }
}
window.openPixelArt = openPixelArt;
window.openCBN = openPixelArt; // alias

function closePixelArt() {
  const frame = document.getElementById('cbn-frame');
  try {
    const game=frame.contentWindow;
    game?.document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());
    if(typeof game?.flushPixelArt==='function')game.flushPixelArt();
  } catch(error) { console.warn('Pixel Art exit save:',error); }
  finally {
    document.getElementById('cbn-overlay').classList.remove('show');
    frame.blur();
    if(typeof applyBackgroundBlur==='function')applyBackgroundBlur(document.hidden);
  }
}
window.closePixelArt = closePixelArt;
window.closeCBN = closePixelArt; // alias

/* ═══ COLOR BY NUMBER — DEV PANEL ═══ */
// Add a new level to the live game by pushing to LEVELS and refreshing.
// The level JSON file must already exist at heartly4.3/levels/<file>.
function cbnAddLevel(){
  const frame = document.getElementById('cbn-frame');
  const idEl   = document.getElementById('cbn-level-id');
  const nameEl = document.getElementById('cbn-level-name');
  const fileEl = document.getElementById('cbn-level-file');
  const sizeEl = document.getElementById('cbn-level-size');
  if(!idEl||!nameEl||!fileEl||!sizeEl){ T('⚠️ Dev panel fields not found'); return; }
  const id   = parseInt(idEl.value);
  const name = nameEl.value.trim();
  const file = fileEl.value.trim();
  const size = parseInt(sizeEl.value)||32;
  if(!id||!name||!file){ T('⚠️ Fill in all level fields'); return; }
  try{
    const win = frame.contentWindow;
    if(win.LEVELS.find(l=>l.id===id)){ T('⚠️ Level ID '+id+' already exists'); return; }
    win.LEVELS.push({id, name, file, size});
    win.refreshLevels();
    T('🎨 Level "'+name+'" added!');
    idEl.value=''; nameEl.value=''; fileEl.value=''; sizeEl.value='32';
  }catch(e){ T('❌ Open Color by Number first'); }
}
window.cbnAddLevel = cbnAddLevel;


/* ═══════════════════════════════════════════
   SETTINGS HELPERS
═══════════════════════════════════════════ */

var _dateFmts = ['DD / MM / YYYY', 'MM / DD / YYYY', 'YYYY-MM-DD'];
var _dateFmtIdx = 0;
function cycleDate(row){
  _dateFmtIdx = (_dateFmtIdx + 1) % _dateFmts.length;
  var el = document.getElementById('sett-date-fmt');
  if(el) el.textContent = _dateFmts[_dateFmtIdx];
}
window.cycleDate = cycleDate;

var _timeFmts = ['24-hour clock', '12-hour (AM / PM)'];
var _timeFmtIdx = 0;
function cycleTimeFmt(row){
  _timeFmtIdx = (_timeFmtIdx + 1) % _timeFmts.length;
  var el = document.getElementById('sett-time-fmt');
  if(el) el.textContent = _timeFmts[_timeFmtIdx];
}
window.cycleTimeFmt = cycleTimeFmt;

function toggleReduceMotion(el){
  el.classList.toggle('on');
  var on = el.classList.contains('on');
  document.documentElement.style.setProperty('--anim-dur', on ? '0s' : '');
  document.documentElement.classList.toggle('reduce-motion', on);
  localStorage.setItem('heartly.reduceMotion', on ? '1' : '0');
}
window.toggleReduceMotion = toggleReduceMotion;

async function settClearCache(){
  const ok = await appModal({
    icon: '🧹',
    title: 'Clear app cache?',
    subtitle: 'The page will reload.',
    confirmLabel: 'Clear cache',
    danger: true
  });
  if(!ok) return;
  try {
    if('caches' in window){
      caches.keys().then(function(names){
        names.forEach(function(n){ caches.delete(n); });
      });
    }
    T('Cache cleared — reloading...');
    setTimeout(function(){ location.reload(true); }, 1000);
  } catch(e){ T('Could not clear cache'); }
}
window.settClearCache = settClearCache;

async function settResetData(){
  const ok = await appModal({
    icon: '⚠️',
    title: 'Reset ALL app data?',
    subtitle: 'This cannot be undone.',
    confirmLabel: 'Reset everything',
    danger: true
  });
  if(!ok) return;
  try {
    localStorage.clear();
    T('All data reset — reloading...');
    setTimeout(function(){ location.reload(); }, 1200);
  } catch(e){ T('Could not reset data: ' + e.message); }
}
window.settResetData = settResetData;


/* ═══ LOVE CLICKER ═══ */
let _clickerLoaded = false;
function openClicker() {
  const overlay = document.getElementById('clicker-overlay');
  overlay.classList.add('show');
  if (!_clickerLoaded) {
    document.getElementById('clicker-frame').src = 'clicker/index.html';
    _clickerLoaded = true;
  }
}
window.openClicker = openClicker;

function closeClicker() {
  document.getElementById('clicker-overlay').classList.remove('show');
}
window.closeClicker = closeClicker;

/* ═══ HOW TO PLAY MODAL ═══ */
const HTP_DATA = {
  loveblast: {
    ico: '💗', title: 'Love Blast', sub: 'Block puzzle game',
    steps: [
      { ico: '🧩', title: 'Place pieces', body: 'Drag the 3 pieces at the bottom onto the 8×8 grid. Pieces cannot be rotated.' },
      { ico: '✨', title: 'Clear lines', body: 'Fill a complete row or column to clear it and score points. The line disappears instantly.' },
      { ico: '🔥', title: 'Chain combos', body: 'Clear multiple lines at once for a combo bonus — the more lines, the bigger the multiplier.' },
      { ico: '🪙', title: 'Earn Heartly pts', body: 'Every game earns you Heartly points. The higher your score, the more you earn.' },
      { ico: '💡', title: 'Game over', body: 'The game ends when no piece can fit anywhere on the board. Plan ahead!' },
    ]
  },

  pixelart: {
    ico: '🎨', title: 'Pixel Art', sub: 'Color by number game',
    steps: [
      { ico: '🖼️', title: 'Pick a picture', body: 'Choose a picture in Discover, or continue one from In progress. Finished pictures live in Completed.' },
      { ico: '🎨', title: 'Select a color', body: 'Tap a color in the palette at the bottom. The number on each cell tells you which color goes there.' },
      { ico: '🖌️', title: 'Paint the cells', body: 'Tap cells on the grid to fill them. Only correct colors are accepted — wrong taps are ignored.' },
      { ico: '🪄', title: 'Find your flow', body: 'Pinch to zoom, use two fingers to move, or choose Move. Fill colors a connected group; Find a cell helps with the last squares. Tools are free.' },
      { ico: '🏆', title: 'Save & collect', body: 'Progress saves automatically through Heartly. Each picture earns points once; you can replay finished pictures for fun and save them as images.' },
    ]
  },
  clicker: {
    ico: '💖', title: 'Love Clicker', sub: 'Tap & dodge reflex game',
    steps: [
      { ico: '💖', title: 'Tap the hearts', body: 'Hearts pop up briefly around the board. Tap each one before it fades to score points.' },
      { ico: '💔', title: 'Dodge the decoys', body: 'Broken hearts are traps — tapping one breaks your combo and costs you points. Let them expire untouched.' },
      { ico: '🔥', title: 'Build your combo', body: 'Consecutive correct taps raise a combo multiplier, up to ×3. One miss or wrong tap resets it to zero.' },
      { ico: '💛', title: 'Golden hearts', body: 'Rare golden hearts are worth much more, but vanish faster — high risk, high reward.' },
      { ico: '⏱️', title: 'Beat the clock', body: 'Each round is 75 seconds and gets faster and harder as it goes. Your final score converts into Heartly points.' },
    ]
  }
};

function showHowToPlay(game) {
  const d = HTP_DATA[game];
  if (!d) return;
  document.getElementById('htp-ico').textContent   = d.ico;
  document.getElementById('htp-title').textContent = d.title;
  document.getElementById('htp-sub').textContent   = d.sub;
  document.getElementById('htp-steps').innerHTML   = d.steps.map(s => `
    <div style="display:flex;gap:12px;align-items:flex-start;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:12px 14px">
      <div style="font-size:22px;flex-shrink:0;width:32px;text-align:center">${s.ico}</div>
      <div>
        <div style="font-size:13px;font-weight:800;color:#fff;margin-bottom:3px">${s.title}</div>
        <div style="font-size:12px;color:rgba(255,255,255,.55);line-height:1.55">${s.body}</div>
      </div>
    </div>`).join('');

  const modal = document.getElementById('htp-modal');
  const sheet = document.getElementById('htp-sheet');
  modal.style.opacity = '1';
  modal.style.pointerEvents = 'all';
  sheet.style.transform = 'translateY(0)';

  // Tap backdrop to close
  modal.onclick = function(e) { if (e.target === modal) closeHowToPlay(); };
}
window.showHowToPlay = showHowToPlay;

function closeHowToPlay() {
  const modal = document.getElementById('htp-modal');
  const sheet = document.getElementById('htp-sheet');
  modal.style.opacity = '0';
  modal.style.pointerEvents = 'none';
  sheet.style.transform = 'translateY(40px)';
}
window.closeHowToPlay = closeHowToPlay;

function triggerAllUIRenders(){
  console.log('[Heartly sync] Triggering all UI renders with the latest state…');
  
  if(typeof renderHomeLetters === 'function') {
    try { renderHomeLetters(); } catch(e) { console.warn('renderHomeLetters failed:', e); }
  }
  
  if(typeof renderGrid === 'function') {
    try {
      const tab = (typeof curTab !== 'undefined') ? curTab : 'notes';
      renderGrid(tab);
    } catch(e) { console.warn('renderGrid failed:', e); }
  }
  
  if(typeof renderShop === 'function') {
    try { renderShop(); } catch(e) { console.warn('renderShop failed:', e); }
  }
  
  if(typeof updateLogsStats === 'function') {
    try { updateLogsStats(); } catch(e) { console.warn('updateLogsStats failed:', e); }
  }
  
  if(typeof renderAchievements === 'function') {
    try { renderAchievements(); } catch(e) { console.warn('renderAchievements failed:', e); }
  }
  
  if(typeof renderWishList === 'function') {
    try { renderWishList(); } catch(e) { console.warn('renderWishList failed:', e); }
  }
  if(typeof renderSuggestionList === 'function') {
    try { renderSuggestionList(); } catch(e) { console.warn('renderSuggestionList failed:', e); }
  }
  
  if(typeof renderSentLetters === 'function') {
    try { renderSentLetters(); } catch(e) { console.warn('renderSentLetters failed:', e); }
  }
  if(typeof renderDevListRob === 'function') {
    try { renderDevListRob(); } catch(e) { console.warn('renderDevListRob failed:', e); }
  }
  if(typeof renderCal === 'function') {
    try { renderCal(); } catch(e) { console.warn('renderCal failed:', e); }
  }
  
  if(typeof renderRobMemoryJar === 'function') {
    try { renderRobMemoryJar(); } catch(e) { console.warn('renderRobMemoryJar failed:', e); }
  }
  if(typeof renderRobLoveMap === 'function') {
    try { renderRobLoveMap(); } catch(e) { console.warn('renderRobLoveMap failed:', e); }
  }
  if(typeof renderLoveMap === 'function') {
    try { renderLoveMap(); } catch(e) { console.warn('renderLoveMap failed:', e); }
  }
  if(typeof renderRobTimelineList === 'function') {
    try { renderRobTimelineList(); } catch(e) { console.warn('renderRobTimelineList failed:', e); }
  }
  if(typeof renderRelationshipTimeline === 'function') {
    try { renderRelationshipTimeline(); } catch(e) { console.warn('renderRelationshipTimeline failed:', e); }
  }
  if(typeof renderRobUpdatesList === 'function') {
    try { renderRobUpdatesList(); } catch(e) { console.warn('renderRobUpdatesList failed:', e); }
  }
  if(typeof renderUpdatesLog === 'function') {
    try { renderUpdatesLog(); } catch(e) { console.warn('renderUpdatesLog failed:', e); }
  }
  if(typeof renderUniversalMilestone === 'function') {
    try { renderUniversalMilestone(); } catch(e) { console.warn('renderUniversalMilestone failed:', e); }
  }
  if(typeof renderTxHistory === 'function') {
    try { renderTxHistory(); } catch(e) { console.warn('renderTxHistory failed:', e); }
  }
  if(typeof updateGoodnight === 'function') {
    try { updateGoodnight(); } catch(e) { console.warn('updateGoodnight failed:', e); }
  }
  if(typeof renderRobGoodnight === 'function') {
    try { renderRobGoodnight(); } catch(e) { console.warn('renderRobGoodnight failed:', e); }
  }

  // Mood cards were previously never refreshed on an incoming remote sync —
  // only when the local device itself picked a mood. That meant Robert's
  // dashboard could sit on a stale "Ana mood" card indefinitely until he
  // happened to open the Activity tab (which separately calls this),
  // and vice versa for Ana's "Robert mood" home card.
  if(typeof updateRobMoodCard === 'function') {
    try { updateRobMoodCard(); } catch(e) { console.warn('updateRobMoodCard failed:', e); }
  }
  if(typeof updateRobMoodHomeCard === 'function') {
    try { updateRobMoodHomeCard(); } catch(e) { console.warn('updateRobMoodHomeCard failed:', e); }
  }
}
window.triggerAllUIRenders = triggerAllUIRenders;
