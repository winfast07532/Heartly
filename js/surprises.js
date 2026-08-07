/* ═══════════════════════════════════════════════════════════
   SURPRISES — 15 interactive, code-drawn animations (no emoji,
   no uploads — every shape below is real SVG/CSS).

   ★★★ TO EDIT THE MESSAGE TEXT FOR ANY SURPRISE ★★★
   Find its entry in SURPRISE_DEFS below and change the `message`
   field. That's the only line you need to touch to change what
   it says. Everything else is the animation logic.

   ★★★ TO EDIT THE PRICE ★★★
   Change it from the app itself: Dev tab → Settings →
   🎁 Surprises Pricing. (The `price` field below is only the
   STARTING price for a fresh install — after that, the real
   price lives in ED.surprises[i].price and the Dev panel is
   what edits it from then on.)
═══════════════════════════════════════════════════════════ */

const SURPRISE_DEFS = [
  { id: 'flower-bouquet', ico: 'flower', label: '1', price: 750,
    message: "Aceste flori sunt pentru tine iubita! la fel de frumoase ca tine.", render: renderFlowerBouquet },
  { id: 'growing-flower', ico: 'flower', label: '2', price: 750,
    message: "La fel ca floarea asta, sentimentele mele pentru tine cresc din ce in ce mai mult", render: renderGrowingFlower },
  { id: 'petal-shower', ico: 'flower', label: '3', price: 750,
    message: "Te iubesc la infinit!", render: renderPetalShower },
  { id: 'gift-unwrap', ico: 'gift', label: '4', price: 750,
    message: "Acest cadou este... tu! tu esti un cadou pentru mine!", render: renderGiftUnwrap },
  { id: 'balloon-pop', ico: 'balloon', label: '5', price: 750,
    message: "Te iubesc", render: renderBalloonPop },
  { id: 'floating-hearts', ico: 'heart', label: '6', price: 750,
    message: "Apasa pentru multe inimi", render: renderFloatingHearts },
  { id: 'fireworks-names', ico: 'spark', label: '7', price: 750,
    message: "Ana & Robert — luminand cerul", render: renderFireworks },
  { id: 'confetti-cannon', ico: 'spark', label: '3 YEARS SPECIAL', price: 0,
    message: "3 YEARS SPECIAL - La multi ani!", render: renderConfettiCannon },
  { id: 'scratch-card', ico: 'ticket', label: '8', price: 750,
    message: "Esti cea mai buna iubita si meriti tot", render: renderScratchCard },
  { id: 'music-box', ico: 'note', label: '9', price: 750,
    message: "**“A Walk” — Tycho** Cauta pe youtube!", render: renderMusicBox },
  { id: 'snow-globe', ico: 'snow', label: '10', price: 750,
    message: "Acesti fulgi cad ca iubirea mea deasupra ta!", render: renderSnowGlobe },
  { id: 'candle-blowout', ico: 'cake', label: '11', price: 750,
    message: "Puneti o dorinta si scrio pe insta!", render: renderCandleBlowout },
  { id: 'popup-card', ico: 'heart', label: '12', price: 750,
    message: "Inima mea va bate mereu pentru tine!", render: renderPopupCard },
  { id: 'firefly-jar', ico: 'jar', label: '13', price: 750,
    message: "Imi luminezi mereu viata", render: renderFireflyJar },
  { id: 'wax-seal', ico: 'seal', label: '14', price: 750,
    message: "Esti persoana mea preferata!", render: renderWaxSeal },
];
window.SURPRISE_DEFS = SURPRISE_DEFS;

function seedSurpriseCatalog(){
  if(typeof ED === 'undefined') return;
  if(!ED.surprises) ED.surprises = [];
  if(ED.surprises.some(it => it.surpriseType)) return;
  SURPRISE_DEFS.forEach(def => {
    ED.surprises.push({ l: def.label, i: 'gift', lk: true, price: def.price, surpriseType: def.id, read: false });
  });
  if(typeof saveState === 'function') saveState();
}
window.seedSurpriseCatalog = seedSurpriseCatalog;

/* ── Shared timers ── */
let _spTimers = [];
function _spTimer(fn, ms){ const t = setTimeout(fn, ms); _spTimers.push(t); return t; }
function _spInterval(fn, ms){ const t = setInterval(fn, ms); _spTimers.push(t); return t; }
function _spClearTimers(){ _spTimers.forEach(t => { clearTimeout(t); clearInterval(t); }); _spTimers = []; }
function _spMsg(text){
  const el = document.createElement('div');
  el.className = 'sp-msg'; el.textContent = text;
  _spTimer(()=> el.classList.add('in'), 50);
  return el;
}
function _el(tag, cls, html){ const e = document.createElement(tag); if(cls) e.className = cls; if(html!==undefined) e.innerHTML = html; return e; }

function openSurprisePlayer(surpriseType){
  const def = SURPRISE_DEFS.find(d => d.id === surpriseType);
  if(!def) return;
  const stage = document.getElementById('sp-stage');
  const overlay = document.getElementById('surprise-player');
  if(!stage || !overlay) return;
  stage.innerHTML = '';
  _spClearTimers();
  def.render(stage, def.message);
  overlay.classList.add('show');
}
window.openSurprisePlayer = openSurprisePlayer;

function closeSurprisePlayer(){
  const overlay = document.getElementById('surprise-player');
  if(overlay) overlay.classList.remove('show');
  _spClearTimers();
  const stage = document.getElementById('sp-stage');
  if(stage) stage.innerHTML = '';
}
window.closeSurprisePlayer = closeSurprisePlayer;

/* ═══════════════════════════════════════════════════════════
   SVG SHAPE LIBRARY — real drawn vector art, colors follow the
   app's active theme via var(--rose-b) / var(--gold) etc.
═══════════════════════════════════════════════════════════ */
const SVG = {
  flowerHead: (hue) => `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <g transform="translate(50,50)">
        ${[0,72,144,216,288].map(a => `
          <ellipse cx="0" cy="-24" rx="15" ry="24" fill="${hue}" opacity=".92"
            transform="rotate(${a})"/>`).join('')}
        <circle r="12" fill="var(--gold)"/>
      </g>
    </svg>`,
  petal: (color) => `<svg viewBox="0 0 24 30" width="100%" height="100%">
      <path d="M12 0 C22 8, 22 22, 12 30 C2 22, 2 8, 12 0Z" fill="${color}"/>
    </svg>`,
  heart: (color) => `<svg viewBox="0 0 32 28" width="100%" height="100%">
      <path d="M16 27 C4 18 0 11 0 6.5 C0 1.5 4 -1 8 1 C11.5 3 14.5 6 16 8.5
        C17.5 6 20.5 3 24 1 C28 -1 32 1.5 32 6.5 C32 11 28 18 16 27Z" fill="${color}"/>
    </svg>`,
  balloon: (color) => `<svg viewBox="0 0 60 90" width="100%" height="100%">
      <ellipse cx="30" cy="34" rx="28" ry="34" fill="${color}"/>
      <ellipse cx="20" cy="20" rx="8" ry="12" fill="rgba(255,255,255,.25)"/>
      <path d="M27 67 Q30 72 33 67" stroke="${color}" stroke-width="3" fill="none"/>
      <line x1="30" y1="70" x2="30" y2="90" stroke="rgba(255,255,255,.4)" stroke-width="1.5"/>
    </svg>`,
  giftBoxBody: `<svg viewBox="0 0 100 70" width="100%" height="100%">
      <rect x="4" y="10" width="92" height="60" rx="4" fill="var(--rose-b)"/>
      <rect x="42" y="10" width="16" height="60" fill="var(--gold)"/>
    </svg>`,
  giftLid: `<svg viewBox="0 0 100 34" width="100%" height="100%">
      <rect x="0" y="14" width="100" height="20" rx="4" fill="var(--rose-b)" opacity=".92"/>
      <rect x="42" y="14" width="16" height="20" fill="var(--gold)"/>
      <path d="M50 14 C30 14 26 -6 42 2 C46 4 50 10 50 14 C50 10 54 4 58 2 C74 -6 70 14 50 14Z" fill="var(--gold)"/>
    </svg>`,
  spark: (color) => `<span style="display:block;width:100%;height:100%;border-radius:50%;background:${color};box-shadow:0 0 8px 1px ${color}"></span>`,
  musicNote: `<svg viewBox="0 0 40 60" width="100%" height="100%">
      <circle cx="10" cy="48" r="9" fill="var(--rose-b)"/>
      <circle cx="30" cy="42" r="9" fill="var(--rose-b)"/>
      <rect x="18" y="6" width="4" height="42" fill="var(--rose-b)"/>
      <rect x="38" y="0" width="4" height="36" fill="var(--rose-b)"/>
      <path d="M18 6 Q30 2 42 0 V10 Q30 12 18 16Z" fill="var(--rose-b)"/>
    </svg>`,
  crankKnob: `<svg viewBox="0 0 60 60" width="100%" height="100%">
      <circle cx="30" cy="30" r="10" fill="var(--gold)"/>
      <rect x="27" y="4" width="6" height="24" rx="3" fill="var(--gold)"/>
      <circle cx="30" cy="6" r="6" fill="var(--gold)"/>
    </svg>`,
  boxWithLid: (open) => `<svg viewBox="0 0 100 90" width="100%" height="100%">
      <rect x="10" y="40" width="80" height="46" rx="6" fill="#7a4a3a"/>
      <rect x="10" y="40" width="80" height="46" rx="6" fill="none" stroke="var(--gold)" stroke-width="2"/>
      <g style="transform-origin:15px 40px;transition:transform .5s cubic-bezier(.34,1.56,.64,1);transform:rotate(${open?-95:0}deg)">
        <rect x="10" y="26" width="80" height="18" rx="6" fill="#95604a"/>
      </g>
    </svg>`,
  house: `<svg viewBox="0 0 80 70" width="100%" height="100%">
      <polygon points="40,4 74,32 6,32" fill="var(--rose-b)"/>
      <rect x="16" y="32" width="48" height="34" fill="rgba(255,255,255,.14)"/>
      <rect x="34" y="44" width="12" height="22" fill="var(--rose-b)"/>
      <rect x="20" y="38" width="10" height="10" fill="var(--gold)" opacity=".8"/>
      <rect x="50" y="38" width="10" height="10" fill="var(--gold)" opacity=".8"/>
    </svg>`,
  snowflakeDot: `<span style="display:block;width:100%;height:100%;border-radius:50%;background:#fff;box-shadow:0 0 4px rgba(255,255,255,.8)"></span>`,
  cakeBody: `<svg viewBox="0 0 140 90" width="100%" height="100%">
      <rect x="8" y="50" width="124" height="34" rx="6" fill="var(--rose-b)"/>
      <rect x="8" y="50" width="124" height="10" fill="#fff" opacity=".22"/>
      <rect x="20" y="30" width="100" height="26" rx="6" fill="var(--gold)"/>
      <rect x="20" y="30" width="100" height="8" fill="#fff" opacity=".25"/>
      ${[26,50,74,98].map(x=>`<circle cx="${x+8}" cy="30" r="4" fill="#fff" opacity=".7"/>`).join('')}
    </svg>`,
  flame: `<svg viewBox="0 0 20 30" width="100%" height="100%">
      <path d="M10 30 C2 22 2 14 8 0 C10 8 16 10 16 18 C16 25 13 30 10 30Z" fill="url(#flameGrad)"/>
      <defs><linearGradient id="flameGrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#ff6a3d"/><stop offset="60%" stop-color="#ffb23d"/><stop offset="100%" stop-color="#fff3b0"/>
      </linearGradient></defs>
    </svg>`,
  envelope: (flapOpen) => `<svg viewBox="0 0 120 80" width="100%" height="100%">
      <rect x="4" y="10" width="112" height="66" rx="6" fill="var(--rose-b)" opacity=".85"/>
      <polygon points="4,10 60,50 116,10" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2"/>
      <g style="transform-origin:60px 10px;transition:transform .55s cubic-bezier(.34,1.56,.64,1);transform:rotateX(${flapOpen?150:0}deg)">
        <polygon points="4,10 60,48 116,10" fill="var(--gold)"/>
      </g>
    </svg>`,
  letterCard: `<svg viewBox="0 0 100 70" width="100%" height="100%">
      <rect x="2" y="2" width="96" height="66" rx="4" fill="#fff8f0"/>
      <line x1="14" y1="20" x2="86" y2="20" stroke="#e0c8a8" stroke-width="2"/>
      <line x1="14" y1="32" x2="86" y2="32" stroke="#e0c8a8" stroke-width="2"/>
      <line x1="14" y1="44" x2="60" y2="44" stroke="#e0c8a8" stroke-width="2"/>
    </svg>`,
  seal: `<svg viewBox="0 0 70 70" width="100%" height="100%">
      <circle cx="35" cy="35" r="30" fill="url(#sealGrad)"/>
      <circle cx="35" cy="35" r="30" fill="none" stroke="rgba(0,0,0,.15)" stroke-width="2"/>
      <path d="M35 20 C40 20 43 24 40 28 C46 27 48 33 43 36 C48 40 44 46 39 44
        C40 49 34 51 32 46 C28 50 23 47 25 42 C19 43 17 37 22 34 C17 30 21 24 26 26 C25 21 31 18 35 20Z"
        fill="rgba(255,255,255,.35)"/>
      <defs><radialGradient id="sealGrad"><stop offset="0%" stop-color="#e0546e"/><stop offset="100%" stop-color="#a52840"/></radialGradient></defs>
    </svg>`,
  jarBody: `<svg viewBox="0 0 90 100" width="100%" height="100%">
      <rect x="14" y="6" width="62" height="14" rx="4" fill="var(--gold)"/>
      <path d="M10 22 h70 v58 a20 20 0 01-20 20 H30 a20 20 0 01-20-20 Z" fill="rgba(160,200,255,.18)" stroke="rgba(255,255,255,.4)" stroke-width="2"/>
    </svg>`,
};

/* ══════════════════ 1. FLOWER BOUQUET ══════════════════ */
function renderFlowerBouquet(stage, message){
  const wrap = _el('div', 'sp-bouquet-wrap');
  wrap.innerHTML = `
    <div class="sp-cone"><svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,100 15,20 85,20" fill="var(--gold)" opacity=".9"/>
      <line x1="50" y1="100" x2="35" y2="18" stroke="rgba(255,255,255,.4)" stroke-width="1.5"/>
      <line x1="50" y1="100" x2="65" y2="18" stroke="rgba(255,255,255,.4)" stroke-width="1.5"/>
    </svg></div>`;
  stage.appendChild(wrap);
  stage.appendChild(_el('div', 'sp-hint', 'Tap to unwrap'));

  wrap.onclick = () => {
    wrap.onclick = null;
    wrap.classList.add('open');
    stage.querySelector('.sp-hint').remove();
    const cluster = _el('div', 'sp-flowers');
    const hues = ['#e0546e', '#f5c870', '#c85fa8', '#f07090', '#e0546e'];
    hues.forEach((hue, i) => {
      const f = _el('div', 'sp-flower', SVG.flowerHead(hue));
      cluster.appendChild(f);
      _spTimer(()=> f.classList.add('in'), 150 + i*130);
    });
    stage.appendChild(cluster);
    stage.appendChild(_spMsg(message));
  };
}

/* ══════════════════ 2. GROWING FLOWER ══════════════════ */
function renderGrowingFlower(stage, message){
  const pot = _el('div', 'sp-grow-scene');
  pot.innerHTML = `
    <div class="sp-grow-stem" id="sp-gstem"><svg viewBox="0 0 20 100" width="100%" height="100%">
      <path d="M10 100 L10 30" stroke="#4a9a5c" stroke-width="5" stroke-linecap="round"
        stroke-dasharray="70" stroke-dashoffset="70" id="sp-stem-path"/>
    </svg></div>
    <div class="sp-grow-head" id="sp-ghead"></div>
    <svg class="sp-grow-pot" viewBox="0 0 60 30"><path d="M6 0 L54 0 L46 30 L14 30Z" fill="var(--rose-b)"/></svg>`;
  stage.appendChild(pot);
  const btn = _el('button', 'sp-grow-btn', 'Water it');
  stage.appendChild(btn);

  let step = 0;
  const head = pot.querySelector('#sp-ghead');
  const stemPath = pot.querySelector('#sp-stem-path');
  btn.onclick = () => {
    step++;
    stemPath.style.transition = 'stroke-dashoffset .5s ease';
    stemPath.style.strokeDashoffset = Math.max(70 - step*24, 0);
    if(step === 1){
      head.innerHTML = `<svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="6" fill="#5cb56e"/></svg>`;
      head.style.width = '34px'; head.style.height = '34px'; head.style.opacity = '1';
    }
    if(step === 2){
      head.innerHTML = SVG.flowerHead('#f07090');
      head.style.width = '46px'; head.style.height = '46px'; head.style.opacity = '.7';
    }
    if(step >= 3){
      head.innerHTML = SVG.flowerHead('#f07090');
      head.style.width = '64px'; head.style.height = '64px'; head.style.opacity = '1';
      btn.remove();
      stage.appendChild(_spMsg(message));
    }
  };
}

/* ══════════════════ 3. PETAL SHOWER ══════════════════ */
function renderPetalShower(stage, message){
  const zone = _el('div'); zone.style.cssText = 'width:100%;height:220px;position:relative;overflow:hidden';
  stage.appendChild(zone);
  const colors = ['#f07090','#e0546e','#f5c870'];
  _spInterval(() => {
    const p = _el('div', 'sp-petal-shape', SVG.petal(colors[Math.floor(Math.random()*colors.length)]));
    p.style.left = Math.random()*90 + '%';
    p.style.setProperty('--drift', (Math.random()*60-30)+'px');
    p.style.animationDuration = (2 + Math.random()*1.5) + 's';
    zone.appendChild(p);
    _spTimer(()=> p.remove(), 3500);
  }, 220);
  _spTimer(()=> stage.appendChild(_spMsg(message)), 1200);
}

/* ══════════════════ 4. GIFT UNWRAP ══════════════════ */
function renderGiftUnwrap(stage, message){
  const box = _el('div', 'sp-gift-box');
  box.innerHTML = `<div class="sp-gift-lid">${SVG.giftLid}</div><div class="sp-gift-body">${SVG.giftBoxBody}</div>`;
  stage.appendChild(box);
  stage.appendChild(_el('div', 'sp-hint', 'Tap to unwrap'));

  box.onclick = () => {
    box.onclick = null;
    box.classList.add('open');
    stage.querySelector('.sp-hint').remove();
    if(typeof fireConfetti === 'function') fireConfetti();
    stage.appendChild(_spMsg(message));
  };
}

/* ══════════════════ 5. BALLOON POP ══════════════════ */
function renderBalloonPop(stage, message){
  const grid = _el('div', 'sp-balloon-grid');
  const colors = ['#e0546e','#f5c870','#c85fa8','#f07090','#6ee8b4','#e0546e'];
  let popped = 0;
  colors.forEach(c => {
    const b = _el('div', 'sp-balloon', SVG.balloon(c));
    b.onclick = () => {
      if(b.classList.contains('popped')) return;
      b.classList.add('popped');
      popped++;
      if(popped === colors.length) stage.appendChild(_spMsg(message));
    };
    grid.appendChild(b);
  });
  stage.appendChild(grid);
  stage.appendChild(_el('div', 'sp-hint', 'Pop every balloon'));
}

/* ══════════════════ 6. FLOATING HEARTS ══════════════════ */
function renderFloatingHearts(stage, message){
  stage.appendChild(_spMsg(message));
  const zone = _el('div'); zone.id = 'sp-heart-zone';
  stage.appendChild(zone);
  stage.appendChild(_el('div', 'sp-hint', 'Tap anywhere'));

  const colors = ['#e0546e','#f07090','#c85fa8','#f5c870'];
  zone.onclick = (e) => {
    const rect = zone.getBoundingClientRect();
    const h = _el('div', 'sp-fheart', SVG.heart(colors[Math.floor(Math.random()*colors.length)]));
    h.style.left = (e.clientX - rect.left - 12) + 'px';
    h.style.top = (e.clientY - rect.top - 10) + 'px';
    zone.appendChild(h);
    _spTimer(()=> h.remove(), 1900);
  };
}

/* ══════════════════ 7. FIREWORKS ══════════════════ */
function renderFireworks(stage, message){
  const zone = _el('div'); zone.id = 'sp-fw-zone';
  stage.appendChild(zone);
  stage.appendChild(_el('div', 'sp-hint', 'Tap to launch'));

  const colors = ['#f07090','#f5c870','#6ee8b4','#e0942c','#fff','#c85fa8'];
  function launch(x, y){
    for(let i=0;i<18;i++){
      const p = _el('div', 'sp-fw-particle', SVG.spark(colors[i % colors.length]));
      const angle = (i/18) * Math.PI * 2;
      const dist = 42 + Math.random()*32;
      p.style.setProperty('--fx', Math.cos(angle)*dist + 'px');
      p.style.setProperty('--fy', Math.sin(angle)*dist + 'px');
      p.style.left = x + 'px'; p.style.top = y + 'px';
      zone.appendChild(p);
      _spTimer(()=> p.remove(), 950);
    }
  }
  let launches = 0;
  zone.onclick = (e) => {
    const rect = zone.getBoundingClientRect();
    launch(e.clientX - rect.left, e.clientY - rect.top);
    launches++;
    if(launches === 1) _spTimer(()=> stage.appendChild(_spMsg(message)), 500);
  };
}

/* ══════════════════ 8. CONFETTI CANNON ══════════════════ */
function renderConfettiCannon(stage, message){
  const cannon = _el('div', 'sp-cannon');
  cannon.innerHTML = `<svg viewBox="0 0 80 80" width="100%" height="100%">
      <polygon points="10,50 55,20 65,32 24,64" fill="var(--rose-b)"/>
      <circle cx="14" cy="50" r="9" fill="var(--gold)"/>
    </svg>`;
  stage.appendChild(cannon);
  stage.appendChild(_el('div', 'sp-hint', 'Tap to celebrate'));

  cannon.onclick = () => {
    if(typeof fireConfetti === 'function') fireConfetti();
    if(!stage.querySelector('.sp-msg')) stage.appendChild(_spMsg(message));
  };
}

/* ══════════════════ 9. SCRATCH CARD ══════════════════ */
function renderScratchCard(stage, message){
  const wrap = _el('div', 'sp-scratch-wrap');
  const msgEl = _el('div', 'sp-scratch-msg'); msgEl.textContent = message;
  wrap.appendChild(msgEl);
  const canvas = document.createElement('canvas');
  canvas.id = 'sp-scratch-canvas'; canvas.width = 280; canvas.height = 160;
  wrap.appendChild(canvas);
  stage.appendChild(wrap);
  const hint = _el('div', 'sp-hint', 'Scratch to reveal');
  stage.appendChild(hint);

  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0,0,280,160);
  grad.addColorStop(0, '#b8b8c8'); grad.addColorStop(1, '#8a8a9a');
  ctx.fillStyle = grad; ctx.fillRect(0,0,280,160);
  for(let i=0;i<40;i++){
    ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.08})`;
    ctx.fillRect(Math.random()*280, Math.random()*160, 20, 2);
  }

  let scratching = false;
  function scratchAt(clientX, clientY){
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width/rect.width);
    const y = (clientY - rect.top) * (canvas.height/rect.height);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI*2); ctx.fill();
  }
  function checkDone(){
    const data = ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let clear = 0;
    for(let i=3;i<data.length;i+=4*20) if(data[i] < 50) clear++;
    if(clear / (data.length/4/20) > 0.5){
      canvas.style.transition = 'opacity .4s'; canvas.style.opacity = '0'; hint.remove();
    }
  }
  canvas.addEventListener('pointerdown', e => { scratching = true; scratchAt(e.clientX, e.clientY); });
  canvas.addEventListener('pointermove', e => { if(scratching){ scratchAt(e.clientX, e.clientY); checkDone(); } });
  window.addEventListener('pointerup', () => scratching = false);
}

/* ══════════════════ 10. MUSIC BOX ══════════════════ */
function renderMusicBox(stage, message){
  const crank = _el('div', 'sp-crank', SVG.crankKnob);
  const ring = _el('div', 'sp-wind-ring');
  const box = _el('div', 'sp-box-lid', SVG.boxWithLid(false));
  ring.appendChild(box);
  stage.appendChild(crank); stage.appendChild(ring);
  const hint = _el('div', 'sp-hint', 'Tap the key to wind it up');
  stage.appendChild(hint);

  let winds = 0;
  const NOTES = [523.25, 587.33, 659.25, 698.46, 783.99];
  function playNote(freq){
    try{
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.frequency.value = freq; osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } catch(e){}
  }
  crank.onclick = () => {
    winds++;
    crank.style.transform = `rotate(${winds*72}deg)`;
    ring.style.setProperty('--pct', Math.min(winds*20, 100));
    playNote(NOTES[(winds-1) % NOTES.length]);
    if(winds >= 5){
      crank.onclick = null;
      box.innerHTML = SVG.boxWithLid(true);
      hint.remove();
      stage.appendChild(_spMsg(message));
    }
  };
}

/* ══════════════════ 11. SNOW GLOBE ══════════════════ */
function renderSnowGlobe(stage, message){
  const globe = _el('div', 'sp-globe');
  globe.innerHTML = `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;width:60%;height:60%;margin:20%">${SVG.house}</div>`;
  stage.appendChild(globe);
  stage.appendChild(_el('div', 'sp-hint', 'Tap to shake'));

  let shakes = 0;
  globe.onclick = () => {
    shakes++;
    for(let i=0;i<16;i++){
      _spTimer(()=>{
        const f = _el('div', 'sp-snowflake', SVG.snowflakeDot);
        f.style.left = Math.random()*90 + '%';
        f.style.setProperty('--sdrift', (Math.random()*30-15)+'px');
        f.style.animationDuration = (1.5 + Math.random()) + 's';
        globe.appendChild(f);
        _spTimer(()=> f.remove(), 2600);
      }, i*35);
    }
    if(shakes === 1) _spTimer(()=> stage.appendChild(_spMsg(message)), 800);
  };
}

/* ══════════════════ 12. CANDLE BLOW-OUT ══════════════════ */
function renderCandleBlowout(stage, message){
  const scene = _el('div', 'sp-cake-scene');
  scene.innerHTML = `<div class="sp-cake">${SVG.cakeBody}</div>`;
  const row = _el('div', 'sp-candle-row');
  const flames = [];
  for(let i=0;i<3;i++){
    const f = _el('div', 'sp-flame', SVG.flame);
    row.appendChild(f); flames.push(f);
  }
  scene.appendChild(row);
  stage.appendChild(scene);

  const btn = _el('div', 'sp-blow-btn');
  btn.innerHTML = `<div class="sp-blow-ring"></div><svg viewBox="0 0 24 24" width="22" height="22" style="position:relative">
    <path d="M2 12c4-6 8-6 8 0s4 6 8 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
  stage.appendChild(btn);
  const hint = _el('div', 'sp-hint', 'Hold to blow');
  stage.appendChild(hint);

  const ring = btn.querySelector('.sp-blow-ring');
  let pct = 0, holding = false, blown = 0;
  function tick(){
    if(!holding) return;
    pct = Math.min(pct + 4, 100);
    ring.style.setProperty('--pct', pct);
    if(pct >= (blown+1)*33 && blown < flames.length){ flames[blown].classList.add('out'); blown++; }
    if(blown >= flames.length){ hint.remove(); stage.appendChild(_spMsg(message)); return; }
    _spTimer(tick, 60);
  }
  btn.addEventListener('pointerdown', () => { holding = true; tick(); });
  ['pointerup','pointerleave'].forEach(ev => btn.addEventListener(ev, () => { holding = false; }));
}

/* ══════════════════ 13. POP-UP CARD ══════════════════ */
function renderPopupCard(stage, message){
  const card = _el('div', 'sp-card');
  card.innerHTML = `<div class="sp-card-flap">${SVG.letterCard}</div><div class="sp-card-heart">${SVG.heart('#e0546e')}</div>`;
  stage.appendChild(card);
  stage.appendChild(_el('div', 'sp-hint', 'Tap the card'));

  card.onclick = () => {
    card.onclick = null;
    card.classList.add('open');
    stage.querySelector('.sp-hint').remove();
    _spTimer(()=> stage.appendChild(_spMsg(message)), 500);
  };
}

/* ══════════════════ 14. FIREFLY JAR ══════════════════ */
function renderFireflyJar(stage, message){
  const jar = _el('div', 'sp-jar', SVG.jarBody);
  stage.appendChild(jar);
  const zone = _el('div'); zone.id = 'sp-firefly-zone';
  stage.appendChild(zone);
  const hint = _el('div', 'sp-hint', 'Tap the jar');
  stage.appendChild(hint);

  jar.onclick = () => {
    jar.onclick = null;
    hint.remove();
    for(let i=0;i<18;i++){
      const f = _el('div', 'sp-firefly');
      f.style.left = '50%'; f.style.top = '10%';
      f.style.setProperty('--jx', (Math.random()*240-120)+'px');
      f.style.setProperty('--jy', (Math.random()*140-40)+'px');
      f.style.animationDelay = (Math.random()*0.4)+'s';
      zone.appendChild(f);
      _spTimer(()=> f.remove(), 3600);
    }
    _spTimer(()=> stage.appendChild(_spMsg(message)), 1400);
  };
}

/* ══════════════════ 15. WAX SEAL LETTER ══════════════════ */
function renderWaxSeal(stage, message){
  const seal = _el('div', 'sp-seal', SVG.seal);
  stage.appendChild(seal);
  stage.appendChild(_el('div', 'sp-hint', 'Tap the seal to break it'));

  seal.onclick = () => {
    seal.onclick = null;
    seal.classList.add('cracked');
    stage.querySelector('.sp-hint').remove();
    _spTimer(()=>{
      const env = _el('div', 'sp-envelope-wrap');
      env.innerHTML = `<div class="sp-envelope">${SVG.envelope(false)}</div><div class="sp-letter-slide">${SVG.letterCard}</div>`;
      stage.appendChild(env);
      _spTimer(()=>{
        env.querySelector('.sp-envelope').innerHTML = SVG.envelope(true);
        env.querySelector('.sp-letter-slide').classList.add('out');
      }, 300);
      _spTimer(()=> stage.appendChild(_spMsg(message)), 700);
    }, 400);
  };
}

/* ── Dev tab: Surprises Pricing panel ── */
function renderRobSurprisesPricing(){
  const list = document.getElementById('rob-surprises-pricing-list');
  if(!list || typeof ED === 'undefined' || !ED.surprises) return;
  const rows = ED.surprises.map((it, idx) => ({ it, idx })).filter(x => x.it.surpriseType);
  if(!rows.length){
    list.innerHTML = '<div style="font-size:12px;color:var(--tx3);text-align:center;padding:12px 0">Surprises haven\'t loaded yet — reopen the app once logged in</div>';
    return;
  }
  list.innerHTML = rows.map(({it, idx}) => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
      <div style="flex:1;font-size:12.5px;font-weight:700;color:#fff">${it.l}</div>
      <label style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--mint);white-space:nowrap" title="Ana can play it once for free, then it locks back to full price">
        <input type="checkbox" ${it.previewOnce?'checked':''} style="width:14px;height:14px;accent-color:var(--mint)"
          onchange="ED.surprises[${idx}].previewOnce = this.checked; if(this.checked && !ED.surprises[${idx}].previewUsed) ED.surprises[${idx}].previewUsed = false; saveState(); T(this.checked?'👀 One-time preview enabled':'👀 One-time preview off'); renderRobSurprisesPricing();">
        👀${it.previewOnce && it.previewUsed ? ' (used — ' : ''}${it.previewOnce && it.previewUsed ? `<a href="#" onclick="event.preventDefault();ED.surprises[${idx}].previewUsed=false;saveState();T('🔄 Preview reset');renderRobSurprisesPricing();" style="color:var(--mint);text-decoration:underline">reset</a>)` : ''}
      </label>
      <input type="number" value="${it.price}" min="0" step="10"
        style="width:70px;padding:6px 8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#fff;font-size:12px;text-align:right"
        onchange="ED.surprises[${idx}].price = Math.max(0, parseInt(this.value)||0); saveState(); T('💰 Price updated');" />
    </div>`).join('');
}
window.renderRobSurprisesPricing = renderRobSurprisesPricing;
