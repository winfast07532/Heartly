/* ═══════════════════════════════════════════════════
   LOVE CLICKER — Tap & Dodge
   Hearts pop up and fade fast; tap them before they're
   gone. Broken hearts are decoys — dodge them or your
   combo breaks. Spawn rate, target lifespan, and decoy
   frequency all ramp up over the session, so real score
   requires sustained accuracy under pressure, not just
   raw tap speed.
═══════════════════════════════════════════════════ */

// Length of a session in seconds. Was a fixed 75s; now selectable from
// the menu (Easy/Medium/Hard) before starting — see selectClickerMode().
let SESSION_LEN = 90; // default = Medium
let clickerMode = 'medium';
const CLICKER_MODES = { easy: 45, medium: 90, hard: 135 };

let sessionActive   = false;
let sessionStart    = 0;
let spawnTimer       = null;

let score            = 0;
let combo            = 0;
let bestComboThisRound = 0;
let tappedCount      = 0;
let missedCount      = 0; // real hearts left untapped
let wrongCount        = 0; // decoys tapped

let bestScore = 0;
const BEST_KEY = 'hly_clicker_best_v1';
try { bestScore = parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0; } catch(e){}
function saveBest(){ try { localStorage.setItem(BEST_KEY, String(bestScore)); } catch(e){} }

// ── ICONS ──
let iconUidCounter = 0;
function nextIconId(prefix){ return prefix + (iconUidCounter++); }

const HEART_PATH = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z';

function getHeartSkin(){
  return (window.parent && window.parent.clickerEquippedHeart) || 'classic';
}

function heartIconSVG(kind){
  const id = nextIconId('gh');
  if(kind === 'decoy'){
    return `<svg viewBox="0 0 24 24">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#9a8a92"/><stop offset="1" stop-color="#6b4a55"/>
      </linearGradient></defs>
      <path fill="url(#${id})" d="${HEART_PATH}"/>
      <path d="M12 6 L10 11 L13.2 13.5 L9.5 18" fill="none" stroke="#2a1218" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>
    </svg>`;
  }
  if(kind === 'golden'){
    return `<svg viewBox="0 0 24 24">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff2c0"/><stop offset=".55" stop-color="#f5c870"/><stop offset="1" stop-color="#d4941f"/>
      </linearGradient></defs>
      <path fill="url(#${id})" d="${HEART_PATH}"/>
      <path d="M17 4l.6 1.5L19 6l-1.4.5L17 8l-.6-1.5L15 6l1.4-.5z" fill="#fff8e0" opacity="0.9"/>
    </svg>`;
  }
  // Normal (real, tappable) heart — this is the one heart-skin cosmetics affect.
  // Decoy/golden keep their fixed gradients since those colors carry
  // gameplay meaning (danger / bonus) and shouldn't be reskinned.
  const skin = getHeartSkin();
  if(skin === 'ck_heart_diamond'){
    return `<svg viewBox="0 0 24 24">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#eaf8ff"/><stop offset=".5" stop-color="#9fd8f0"/><stop offset="1" stop-color="#5aa8d0"/>
      </linearGradient></defs>
      <path fill="url(#${id})" d="${HEART_PATH}"/>
      <path d="M7 8 L12 5 L17 8 L12 12 Z" fill="#fff" opacity="0.35"/>
    </svg>`;
  }
  if(skin === 'ck_heart_rainbow'){
    return `<svg viewBox="0 0 24 24">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ff8fab"/><stop offset=".33" stop-color="#f5c870"/>
        <stop offset=".66" stop-color="#6ee8b4"/><stop offset="1" stop-color="#a08cf0"/>
      </linearGradient></defs>
      <path fill="url(#${id})" d="${HEART_PATH}"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 24 24">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff8fab"/><stop offset="1" stop-color="#e05c7a"/>
    </linearGradient></defs>
    <path fill="url(#${id})" d="${HEART_PATH}"/>
  </svg>`;
}

function trophyIconSVG(){
  const id = nextIconId('gt');
  return `<svg viewBox="0 0 24 24">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff2c0"/><stop offset=".55" stop-color="#f5c870"/><stop offset="1" stop-color="#d4941f"/>
    </linearGradient></defs>
    <path fill="url(#${id})" d="M7 3h10v5a5 5 0 0 1-10 0V3z"/>
    <path fill="none" stroke="url(#${id})" stroke-width="1.6" stroke-linecap="round" d="M7 4H4.5a1.5 1.5 0 0 0-1.5 1.5v1A4.5 4.5 0 0 0 7.5 11M17 4h2.5A1.5 1.5 0 0 1 21 5.5v1A4.5 4.5 0 0 1 16.5 11"/>
    <rect fill="url(#${id})" x="11" y="12" width="2" height="4" rx="1"/>
    <rect fill="url(#${id})" x="8" y="18" width="8" height="2" rx="1"/>
    <path fill="url(#${id})" d="M8.5 20h7l-.8 1.6a1 1 0 0 1-.9.4h-3.6a1 1 0 0 1-.9-.4z"/>
  </svg>`;
}

function statsIconSVG(){
  const id = nextIconId('gs');
  return `<svg viewBox="0 0 24 24">
    <defs><linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#e05c7a"/><stop offset="1" stop-color="#ff8fab"/>
    </linearGradient></defs>
    <rect fill="url(#${id})" x="4" y="12" width="4" height="8" rx="1"/>
    <rect fill="url(#${id})" x="10" y="7" width="4" height="13" rx="1"/>
    <rect fill="url(#${id})" x="16" y="3" width="4" height="17" rx="1"/>
  </svg>`;
}

function lerp(a, b, t){ return a + (b - a) * t; }
function getProgress(){
  if(!sessionActive) return 0;
  const elapsed = (performance.now() - sessionStart) / 1000;
  return Math.max(0, Math.min(1, elapsed / SESSION_LEN));
}
function getComboMultiplier(){
  return Math.min(3, 1 + Math.floor(combo / 6) * 0.5);
}

// ── ELEMENTS ──
let boardEl, scoreValEl, timeBadgeEl, timerFillEl, comboPillEl, comboTxtEl;
document.addEventListener('DOMContentLoaded', function(){
  boardEl      = document.getElementById('board');
  scoreValEl   = document.getElementById('score-val');
  timeBadgeEl  = document.getElementById('time-badge');
  timerFillEl  = document.getElementById('timer-fill');
  comboPillEl  = document.getElementById('combo-pill');
  comboTxtEl   = document.getElementById('combo-txt');
  updateMenuBest();
});

// ── MENU / MANAGEMENT ──
function updateMenuBest(){
  const el = document.getElementById('menu-best');
  if(!el) return;
  el.innerHTML = bestScore > 0 ? (trophyIconSVG() + '<span>Best Score: ' + bestScore.toLocaleString() + '</span>') : '';
}

function showMenu(){
  sessionActive = false;
  if(spawnTimer) clearTimeout(spawnTimer);
  if(boardEl) boardEl.innerHTML = '';
  document.getElementById('ov-gameover').classList.add('hidden');
  document.getElementById('ov-menu').classList.remove('hidden');
  updateMenuBest();
}
window.showMenu = showMenu;

function selectClickerMode(mode){
  if(!CLICKER_MODES[mode]) return;
  clickerMode = mode;
  SESSION_LEN = CLICKER_MODES[mode];
  document.querySelectorAll('.clicker-mode-btn').forEach(function(b){
    b.classList.toggle('on', b.dataset.mode === mode);
  });
  timeBadgeEl.textContent = SESSION_LEN + 's';
  updateHardModeAura();
}
window.selectClickerMode = selectClickerMode;

// Hard Mode Aura — purchasable cosmetic. Purely visual (a border
// glow on the game area) shown only while Hard mode is both selected
// AND owned — ties a cosmetic reward to actually playing on the
// hardest difficulty, per the "difficulty-tied reward" category.
function updateHardModeAura(){
  const p = window.parent;
  const owned = !!(p && p.clickerOwnedCosmetics && p.clickerOwnedCosmetics.includes('ck_hard_aura'));
  const gameWrap = document.getElementById('game-wrap');
  if(gameWrap) gameWrap.classList.toggle('hard-aura', owned && clickerMode === 'hard');
}

// ══════════════════════════════════════════
// SKINS SHOP
// Points-only purchases, same window.parent read/write pattern as
// awardLoveClickerPoints already uses.
// ══════════════════════════════════════════
const CK_SKIN_CATALOG = {
  heart: [
    {id:'classic', name:'Classic', cost:0, swatch:'#e05c7a'},
    {id:'ck_heart_diamond', name:'Diamond Hearts', cost:350, swatch:'#9fd8f0'},
    {id:'ck_heart_rainbow', name:'Rainbow Hearts', cost:350, swatch:'#ff8fab'},
  ],
  combo: [
    {id:'classic', name:'Classic Burst', cost:0, icon:'💥'},
    {id:'ck_combo_trail', name:'Combo Trail', cost:300, icon:'»'},
    {id:'ck_combo_sparkle', name:'Combo Sparkle', cost:300, icon:'✦'},
  ],
  hard: [
    {id:'ck_hard_aura', name:'Hard Mode Aura', cost:400, icon:'🔥', desc:'Glowing border, only shows while playing Hard'},
  ],
};
const CK_EQUIP_KEY = { heart:'clickerEquippedHeart', combo:'clickerEquippedCombo' };
let ckSkinsTab = 'heart';

function openSkinsShop(){
  document.getElementById('ov-skins').classList.remove('hidden');
  renderSkinsList();
}
window.openSkinsShop = openSkinsShop;

function closeSkinsShop(){
  document.getElementById('ov-skins').classList.add('hidden');
}
window.closeSkinsShop = closeSkinsShop;

function skinsTab(cat){
  ckSkinsTab = cat;
  document.querySelectorAll('.skins-tab').forEach(t=>t.classList.toggle('on', t.dataset.sk===cat));
  renderSkinsList();
}
window.skinsTab = skinsTab;

function renderSkinsList(){
  const p = window.parent;
  const pts = (p && p.ptsVal) || 0;
  const ptsRow = document.getElementById('skins-pts-row');
  if(ptsRow) ptsRow.textContent = '🪙 ' + Math.floor(pts).toLocaleString() + ' pts';

  const owned = (p && p.clickerOwnedCosmetics) || [];
  const list = document.getElementById('skins-list');
  if(!list) return;

  if(ckSkinsTab === 'hard'){
    // Single one-time purchase, no separate "equip" step — it's
    // simply active whenever Hard mode is being played.
    const item = CK_SKIN_CATALOG.hard[0];
    const isOwned = owned.includes(item.id);
    list.innerHTML = `<div class="skin-item${isOwned?' equipped':''}">
      <div class="skin-swatch">${item.icon}</div>
      <div class="skin-info">
        <div class="skin-name">${item.name}</div>
        <div class="skin-price">${isOwned ? item.desc : item.cost+' pts'}</div>
      </div>
      ${isOwned ? '<button class="skin-btn equipped" disabled>✓ Owned</button>' : `<button class="skin-btn buy" onclick="buySkin('hard','${item.id}',${item.cost})">Buy ${item.cost}</button>`}
    </div>`;
    return;
  }

  const equipKey = CK_EQUIP_KEY[ckSkinsTab];
  const equipped = (p && p[equipKey]) || 'classic';
  list.innerHTML = CK_SKIN_CATALOG[ckSkinsTab].map(item=>{
    const isOwned = item.id==='classic' || owned.includes(item.id);
    const isEquipped = equipped===item.id;
    const swatchStyle = item.swatch ? `background:${item.swatch}` : 'background:rgba(255,255,255,.08)';
    let btn;
    if(isEquipped) btn = `<button class="skin-btn equipped" disabled>✓ Equipped</button>`;
    else if(isOwned) btn = `<button class="skin-btn equip" onclick="equipSkin('${ckSkinsTab}','${item.id}')">Equip</button>`;
    else btn = `<button class="skin-btn buy" onclick="buySkin('${ckSkinsTab}','${item.id}',${item.cost})">Buy ${item.cost}</button>`;
    return `<div class="skin-item${isEquipped?' equipped':''}">
      <div class="skin-swatch" style="${swatchStyle}">${item.icon||''}</div>
      <div class="skin-info">
        <div class="skin-name">${item.name}</div>
        <div class="skin-price">${item.cost===0?'Free':item.cost+' pts'}</div>
      </div>
      ${btn}
    </div>`;
  }).join('');
}

function buySkin(category, id, cost){
  const p = window.parent;
  if(!p || p===window) return;
  const balance = p.ptsVal || 0;
  if(balance < cost){
    if(typeof p.T==='function') p.T('⚠️ Not enough points — need '+cost);
    return;
  }
  const old = balance;
  p.ptsVal = balance - cost;
  if(typeof p.animatePts==='function') p.animatePts(old, p.ptsVal, 500);
  if(!p.clickerOwnedCosmetics) p.clickerOwnedCosmetics = [];
  p.clickerOwnedCosmetics.push(id);
  if(typeof p.addTxItem==='function') p.addTxItem('🎨','Love Clicker skin: '+id,'Just now','-'+cost,'spend');
  if(typeof p.T==='function') p.T('🎨 Skin unlocked!');
  if(typeof p.saveState==='function') p.saveState();
  if(category !== 'hard') equipSkin(category, id); // auto-equip a fresh purchase
  else { updateHardModeAura(); renderSkinsList(); }
}
window.buySkin = buySkin;

function equipSkin(category, id){
  const p = window.parent;
  if(!p || p===window) return;
  p[CK_EQUIP_KEY[category]] = id;
  if(typeof p.saveState==='function') p.saveState();
  renderSkinsList();
}
window.equipSkin = equipSkin;


function resetSessionState(){
  score = 0; combo = 0; bestComboThisRound = 0;
  tappedCount = 0; missedCount = 0; wrongCount = 0;
  boardEl.innerHTML = '';
  scoreValEl.textContent = '0';
  scoreValEl.classList.remove('bump','bad');
  comboPillEl.classList.remove('show','max');
  timeBadgeEl.textContent = SESSION_LEN + 's';
  timeBadgeEl.classList.remove('urgent');
  timerFillEl.style.width = '100%';
  timerFillEl.classList.remove('urgent');
}

function startGame(){
  document.getElementById('ov-menu').classList.add('hidden');
  document.getElementById('ov-gameover').classList.add('hidden');
  resetSessionState();
  updateHardModeAura();
  sessionActive = true;
  sessionStart = performance.now();
  requestAnimationFrame(timerLoop);
  scheduleNextSpawn();
}
window.startGame = startGame;

function quitToMenu(){
  if(sessionActive){
    sessionActive = false;
    if(spawnTimer) clearTimeout(spawnTimer);
    const isNewBest = score > bestScore;
    if(isNewBest) bestScore = score;
    saveBest();
    if(score > 0 && typeof awardLoveClickerPoints === 'function') awardLoveClickerPoints(score, isNewBest);
    if(boardEl) boardEl.innerHTML = '';
  }
  try {
    if(window.parent && typeof window.parent.closeClicker === 'function') window.parent.closeClicker();
  } catch(e){}
}
window.quitToMenu = quitToMenu;

// ── TIMER LOOP ──
function timerLoop(now){
  if(!sessionActive) return;
  const elapsed = (now - sessionStart) / 1000;
  const timeLeft = Math.max(0, SESSION_LEN - elapsed);
  const pct = (timeLeft / SESSION_LEN) * 100;
  timerFillEl.style.width = pct + '%';
  const secs = Math.ceil(timeLeft);
  timeBadgeEl.textContent = secs + 's';
  const urgent = timeLeft <= 15;
  timerFillEl.classList.toggle('urgent', urgent);
  timeBadgeEl.classList.toggle('urgent', urgent);
  if(timeLeft <= 0){ endGame(); return; }
  requestAnimationFrame(timerLoop);
}

// ── SPAWNING ──
function scheduleNextSpawn(){
  if(!sessionActive) return;
  const p = getProgress();
  const interval = lerp(950, 480, p);
  spawnTimer = setTimeout(spawnTarget, interval);
}

function spawnTarget(){
  if(!sessionActive) return;
  const rect = boardEl.getBoundingClientRect();
  const p = getProgress();
  const lifespan = lerp(1500, 850, p);
  const decoyChance = lerp(0.15, 0.38, p);

  let type;
  const roll = Math.random();
  if(roll < decoyChance) type = 'decoy';
  else if(Math.random() < 0.08) type = 'golden';
  else type = 'normal';

  const size = type === 'golden' ? 40 : 52;
  const margin = size / 2 + 10;
  const w = Math.max(rect.width, size * 2 + 20);
  const h = Math.max(rect.height, size * 2 + 20);
  const x = margin + Math.random() * Math.max(1, (w - margin * 2));
  const y = margin + Math.random() * Math.max(1, (h - margin * 2));

  const el = document.createElement('button');
  el.className = 'tgt' + (type === 'golden' ? ' tgt-golden' : type === 'decoy' ? ' tgt-decoy' : '');
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  el.innerHTML = heartIconSVG(type);
  boardEl.appendChild(el);

  requestAnimationFrame(() => {
    el.classList.add('shrinking');
    el.style.transitionDuration = lifespan + 'ms';
    el.style.transform = 'translate(-50%,-50%) scale(0.25)';
  });

  const expireTimer = setTimeout(() => expireTarget(el, type), lifespan);
  el.addEventListener('pointerdown', function(e){
    e.preventDefault();
    clearTimeout(expireTimer);
    hitTarget(el, type, x, y);
  }, { once: true });

  scheduleNextSpawn();
}

function hitTarget(el, type, x, y){
  el.classList.add('hit');
  setTimeout(() => el.remove(), 220);
  spawnRipple(x, y, type);
  spawnBurst(x, y, type);

  if(type === 'decoy'){
    combo = 0;
    wrongCount++;
    const penalty = Math.min(score, 15);
    score -= penalty;
    updateScoreDisplay(true);
    spawnFloat(x, y, '-' + penalty, 'bad');
    updateComboUI();
    return;
  }

  tappedCount++;
  combo++;
  bestComboThisRound = Math.max(bestComboThisRound, combo);
  const mult = getComboMultiplier();
  const base = type === 'golden' ? 35 : 10;
  const gained = Math.round(base * mult);
  score += gained;
  updateScoreDisplay(false);
  spawnFloat(x, y, '+' + gained, type === 'golden' ? 'good' : '');
  updateComboUI();
  if(combo >= 3) spawnComboEffect(x, y);
}

// Combo FX cosmetic — an extra flourish layered on top of the normal
// tap burst once a real streak (combo >= 3) is going. Purely visual,
// same window.parent read pattern as the heart/color skins.
function spawnComboEffect(x, y){
  const fx = (window.parent && window.parent.clickerEquippedCombo) || 'classic';
  if(fx === 'classic') return;
  const isTrail = fx === 'ck_combo_trail';
  const glyph = isTrail ? '»' : '✦';
  const hues = isTrail ? ['#ff8fab','#ffb0c8'] : ['#ffe680','#fff8d0'];
  const count = 5;
  for(let i = 0; i < count; i++){
    const el = document.createElement('div');
    el.className = 'particle particle-glyph';
    el.textContent = glyph;
    const angle = Math.random() * Math.PI * 2;
    const dist = 20 + Math.random() * 40;
    el.style.setProperty('--tx', (Math.cos(angle) * dist) + 'px');
    el.style.setProperty('--ty', (Math.sin(angle) * dist - 30) + 'px');
    el.style.setProperty('--dur', (0.4 + Math.random() * 0.3) + 's');
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = hues[Math.floor(Math.random() * hues.length)];
    el.style.fontSize = (10 + Math.random() * 6) + 'px';
    boardEl.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }
}

function spawnRipple(x, y, type){
  const r = document.createElement('div');
  r.className = 'tap-ripple ' + (type === 'golden' ? 'ripple-gold' : type === 'decoy' ? 'ripple-bad' : 'ripple-good');
  r.style.left = x + 'px';
  r.style.top = y + 'px';
  boardEl.appendChild(r);
  setTimeout(() => r.remove(), 520);
}

function spawnBurst(x, y, type){
  const colors = type === 'golden' ? ['#ffe36b','#f5c870','#fff2c0']
               : type === 'decoy'  ? ['#8a8a95','#6b4a55']
               : ['#ff8fab','#e05c7a','#ff6b8f'];
  const count = type === 'golden' ? 16 : type === 'decoy' ? 7 : 10;
  for(let i = 0; i < count; i++){
    const p = document.createElement('div');
    p.className = 'particle';
    const angle = (Math.PI * 2 * i / count) + (Math.random() * 0.5 - 0.25);
    const dist = 26 + Math.random() * 42;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    const size = 4 + Math.random() * 4;
    p.style.setProperty('--tx', tx + 'px');
    p.style.setProperty('--ty', ty + 'px');
    p.style.setProperty('--dur', (0.5 + Math.random() * 0.4) + 's');
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    boardEl.appendChild(p);
    setTimeout(() => p.remove(), 950);
  }
}

function expireTarget(el, type){
  el.classList.add('expired');
  setTimeout(() => el.remove(), 220);
  if(type !== 'decoy'){
    combo = 0;
    missedCount++;
    updateComboUI();
  }
  // a decoy expiring untapped means it was correctly dodged — no penalty, combo unaffected
}

function updateScoreDisplay(bad){
  scoreValEl.textContent = Math.max(0, score).toLocaleString();
  scoreValEl.classList.remove('bump','bad');
  void scoreValEl.offsetWidth;
  scoreValEl.classList.add(bad ? 'bad' : 'bump');
  setTimeout(() => scoreValEl.classList.remove('bump','bad'), 250);
}

function updateComboUI(){
  if(combo >= 2){
    const mult = getComboMultiplier();
    comboTxtEl.textContent = 'COMBO ×' + (Number.isInteger(mult) ? mult : mult.toFixed(1));
    comboPillEl.classList.add('show');
    comboPillEl.classList.toggle('max', mult >= 3);
    comboPillEl.classList.remove('pulse');
    void comboPillEl.offsetWidth;
    comboPillEl.classList.add('pulse');
  } else {
    comboPillEl.classList.remove('show','max','pulse');
  }
}

function spawnFloat(x, y, text, cls){
  const f = document.createElement('div');
  f.className = 'score-float' + (cls ? ' ' + cls : '');
  f.style.left = x + 'px';
  f.style.top = y + 'px';
  f.textContent = text;
  boardEl.appendChild(f);
  setTimeout(() => f.remove(), 850);
}

// ── GAME OVER ──
function endGame(){
  sessionActive = false;
  if(spawnTimer) clearTimeout(spawnTimer);
  boardEl.querySelectorAll('.tgt').forEach(el => el.remove());

  const isNewBest = score > bestScore;
  if(isNewBest) bestScore = score;
  saveBest();

  document.getElementById('go-score').textContent = score.toLocaleString();
  const goIcoEl = document.getElementById('go-ico');
  goIcoEl.innerHTML = isNewBest ? trophyIconSVG() : heartIconSVG('normal');
  goIcoEl.classList.toggle('new-best', isNewBest);
  document.getElementById('go-best-ico').innerHTML = isNewBest ? trophyIconSVG() : statsIconSVG();
  document.getElementById('go-best-txt').textContent = isNewBest ? 'New Best Score!' : ('Best: ' + bestScore.toLocaleString());
  document.getElementById('go-tapped').textContent = tappedCount;
  document.getElementById('go-combo').textContent = '×' + bestComboThisRound;
  document.getElementById('go-missed').textContent = wrongCount + missedCount;
  document.getElementById('ov-gameover').classList.remove('hidden');
  if(isNewBest && score > 0) spawnConfetti();

  if(typeof awardLoveClickerPoints === 'function') awardLoveClickerPoints(score, isNewBest);
}

function spawnConfetti(){
  const host = document.getElementById('ov-gameover');
  const colors = ['#ff8fab','#f5c870','#e05c7a','#ffffff','#a02050'];
  for(let i = 0; i < 44; i++){
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.style.left = (40 + Math.random() * 20) + '%';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.setProperty('--fall-x', (Math.random() * 220 - 110) + 'px');
    c.style.setProperty('--fall-rot', (Math.random() * 720 - 360) + 'deg');
    c.style.animationDelay = (Math.random() * 0.3) + 's';
    c.style.animationDuration = (1.6 + Math.random() * 0.9) + 's';
    host.appendChild(c);
    setTimeout(() => c.remove(), 2700);
  }
}

// ── LOADING SCREEN ──
(function(){
  const bar = document.getElementById('loading-bar');
  let w = 0;
  const iv = setInterval(() => {
    w += Math.random() * 25 + 10;
    bar.style.width = Math.min(w, 95) + '%';
    if(w >= 95){
      clearInterval(iv);
      setTimeout(() => {
        bar.style.width = '100%';
        setTimeout(() => {
          document.getElementById('loading-screen').classList.add('hidden');
        }, 280);
      }, 300);
    }
  }, 80);
})();

// ── BACKGROUND CANVAS PARTICLES ──
(function initParticles(){
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize(){
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const N = 45;
  for(let i = 0; i < N; i++){
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.35 + 0.05,
    });
  }

  function drawParticle(p){
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(224,92,122,${p.alpha})`;
    ctx.fill();
  }

  function tick(){
    ctx.clearRect(0, 0, W, H);
    for(const p of particles){
      p.x += p.vx;
      p.y += p.vy;
      if(p.x < 0) p.x = W;
      if(p.x > W) p.x = 0;
      if(p.y < 0) p.y = H;
      if(p.y > H) p.y = 0;
      drawParticle(p);
    }
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ══════════════════════════════════════════════════════
   HEARTLY INTEGRATION BRIDGE
   Converts in-round score into real Heartly points — the
   exact same conversion curve, cap, and milestone shape as
   Love Blast, so both games feed the real economy under
   identical, hard-to-farm rules.
══════════════════════════════════════════════════════ */
(function heartlyBridge(){

  const PER_SESSION_CAP = 30000;
  function scoreToPoints(s){
    if(!s || s <= 0) return 0;
    return Math.max(1, Math.min(PER_SESSION_CAP, Math.floor(Math.sqrt(s) * 3.0)));
  }

  const LIFETIME_MILESTONES = [
    { threshold: 2000,     pts: 30,  label: '2K lifetime score' },
    { threshold: 10000,    pts: 50,  label: '10K lifetime score' },
    { threshold: 50000,    pts: 90,  label: '50K lifetime score' },
    { threshold: 200000,   pts: 160, label: '200K lifetime score' },
    { threshold: 1000000,  pts: 280, label: '1M lifetime score' },
    { threshold: 5000000,  pts: 450, label: '5M lifetime score — Legend!' },
  ];

  const BRIDGE_KEY = 'hly_clicker_bridge_v1';
  let bridgeState = { totalScore: 0, milestones: {} };
  try {
    const raw = JSON.parse(localStorage.getItem(BRIDGE_KEY) || 'null');
    if(raw) bridgeState = raw;
  } catch(e){}

  function saveBridge(){
    try { localStorage.setItem(BRIDGE_KEY, JSON.stringify(bridgeState)); } catch(e){}
  }

  function awardToHeartly(pts, label, icon){
    if(!pts) return;
    try {
      const p = window.parent;
      if(!p || p === window) return;
      const old = p.ptsVal || 0;
      p.ptsVal = old + pts;
      if(typeof p.animatePts === 'function')   p.animatePts(old, p.ptsVal, 800);
      if(typeof p.addTxItem  === 'function')    p.addTxItem(icon || '💖', 'Love Clicker: ' + label, 'Just now', '+' + pts, 'earn');
      if(typeof p.T          === 'function')    p.T((icon || '💖') + ' +' + pts + ' pts — ' + label + '!');
      if(typeof p.logPtsChange === 'function')  p.logPtsChange(pts);
      if(typeof p.saveState  === 'function')    p.saveState();
    } catch(e){}
  }

  function awardLoveClickerPoints(finalScore, isNewBest){
    const gained = scoreToPoints(finalScore);
    if(gained > 0){
      const label = isNewBest ? 'New best — ' + finalScore.toLocaleString() + ' pts scored' : finalScore.toLocaleString() + ' pts scored';
      awardToHeartly(gained, label, '💖');
    }

    bridgeState.totalScore = (bridgeState.totalScore || 0) + (finalScore || 0);
    LIFETIME_MILESTONES.forEach(m => {
      if(!bridgeState.milestones[m.threshold] && bridgeState.totalScore >= m.threshold){
        bridgeState.milestones[m.threshold] = true;
        awardToHeartly(m.pts, m.label, '🏆');
      }
    });
    saveBridge();

    // Report the real session to the main app's persisted state (separate
    // from this iframe's own localStorage) so achievements can see it.
    try {
      const p = window.parent;
      if(p && p !== window && typeof p.reportClickerSession === 'function'){
        p.reportClickerSession(finalScore, isNewBest);
      }
    } catch(e){}
  }

  window.awardLoveClickerPoints = awardLoveClickerPoints;

})();
