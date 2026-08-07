/* ═══════════════════════════
   THEME SYSTEM
═══════════════════════════ */
var THEMES = {
  rose: {
    name: 'Midnight Rose',
    cost: 0,
    unlocked: true,
    orbs: [[210,100,145],[175,55,105],[145,40,90],[80,15,55],[45,5,35],[30,2,22]],
    bgStops: ['#1c0228','#120018','#07000e'],
    accent: '#e05578',
    swatches: ['#a02050','#e05578','#f07090','#f5c870','#6ee8b4'],
    desc: 'The classic. Deep velvet dark with rose accents.',
  },
  royal: {
    name: 'Royal Blue',
    cost: 1400,
    unlocked: false,
    orbs: [[58,65,200],[80,90,210],[50,55,180],[25,30,120],[15,18,80],[8,10,50]],
    bgStops: ['#02052e','#010318','#01010e'],
    accent: '#6b70e0',
    swatches: ['#3d4099','#6a72d6','#f0bc60','#f09aac','#c0c8ff'],
    desc: 'Midnight blue royalty. Cool, deep, and regal.',
  },
  sakura: {
    name: 'Sakura Pink',
    cost: 1100,
    unlocked: false,
    orbs: [[200,80,130],[175,55,105],[155,45,90],[120,30,70],[80,15,50],[50,8,35]],
    bgStops: ['#1e0515','#13030d','#0a0208'],
    accent: '#f07099',
    swatches: ['#b83060','#f07099','#f0b878','#8ce8c0','#f0c0e0'],
    desc: 'Soft, delicate sakura blossoms in the dark.',
  },
  golden: {
    name: 'Golden Hour',
    cost: 2200,
    unlocked: false,
    orbs: [[190,110,10],[170,90,8],[150,75,5],[110,55,3],[70,35,2],[45,20,1]],
    bgStops: ['#160c00','#0e0700','#070400'],
    accent: '#f0a030',
    swatches: ['#b86010','#e0942c','#ffd8a8','#6ec8c8','#f0a878'],
    desc: 'Warm amber and gold. Like a perfect sunset.',
  },
  starlight: {
    name: 'Starlight',
    cost: 2800,
    unlocked: false,
    orbs: [[80,40,160],[100,50,180],[60,30,140],[35,15,100],[20,8,70],[12,4,50]],
    bgStops: ['#0c0420','#070214','#04010e'],
    accent: '#b080f0',
    swatches: ['#5a3aa0','#a878e0','#e8c878','#78c8f0','#d8b8ff'],
    desc: 'Deep cosmic purple. Among the stars.',
  },
  emerald: {
    name: 'Emerald Garden',
    cost: 1800,
    unlocked: false,
    orbs: [[52,224,122],[40,196,105],[30,164,88],[18,110,58],[9,68,34],[4,36,18]],
    bgStops: ['#011a10','#01100a','#010704'],
    accent: '#34e07a',
    swatches: ['#0e8f45','#22c55e','#ffd685','#56c8f0','#e0a8f0'],
    desc: 'True vivid emerald green. Fresh, alive, and full of growth.',
  },
  orange: {
    name: 'Sunset Orange',
    cost: 2000,
    unlocked: false,
    orbs: [[245,96,28],[214,73,15],[164,47,4],[112,32,3],[68,19,2],[38,10,1]],
    bgStops: ['#0f0400','#040100','#000000'],
    accent: '#f5601c',
    swatches: ['#a42f04','#e0581f','#ffd24d','#38d9c4','#ffb199'],
    desc: 'Blazing sunset red-orange. Hot, bold, and full of energy.',
  },
  turquoise: {
    name: 'Turquoise Tide',
    cost: 2000,
    unlocked: false,
    orbs: [[56,230,232],[38,204,204],[30,180,179],[18,124,124],[10,78,78],[5,44,44]],
    bgStops: ['#021718','#011618','#010c0d'],
    accent: '#38e6e8',
    swatches: ['#10a8a3','#38d6d6','#f0b854','#7dffb0','#b8a0f0'],
    desc: 'Crystal turquoise waters. Cool, crisp, and refreshing.',
  },
  mono: {
    name: 'Noir & Ivory',
    cost: 2600,
    unlocked: false,
    orbs: [[220,220,220],[188,188,188],[152,152,152],[104,104,104],[64,64,64],[32,32,32]],
    bgStops: ['#171717','#111111','#0c0c0c'],
    accent: '#8f8f8f',
    swatches: ['#646464','#8f8f8f','#ffcf5c','#5ee0c0','#c9a8ff'],
    desc: 'Timeless black & white with vivid pops of accent color.',
  },
  crimson: {
    name: 'Crimson Ember',
    cost: 3200,
    unlocked: false,
    orbs: [[220,40,55],[190,25,40],[160,15,30],[100,8,18],[60,4,10],[35,2,6]],
    bgStops: ['#200308','#150204','#0a0102'],
    accent: '#e83850',
    swatches: ['#a8102c','#d63850','#f0a050','#7098b0','#f0b8b8'],
    desc: 'Bold crimson and ember. Passionate, fierce, unforgettable.',
  },
};

activeTheme = 'rose'; // already declared above

function applyTheme(id, el){
  const theme = THEMES[id];
  if(!theme) return;

  if(!theme.unlocked){
    if(ptsVal < theme.cost){ T('❌ Need '+theme.cost+' pts to unlock '+theme.name+'!'); return; }
    const old = ptsVal;
    ptsVal -= theme.cost;
    animatePts(old, ptsVal, 600);
    logPtsChange(-(theme.cost));
    theme.unlocked = true;
    addTxItem('🎨', theme.name+' theme unlocked', 'Just now', '-'+theme.cost, 'spend');
    T('🎨 '+theme.name+' unlocked & applied!');
    // Hide pts badge on the card
    const ptsBadge = document.getElementById('tpts-'+id);
    if(ptsBadge) ptsBadge.style.display='none';
  } else {
    T('🎨 '+theme.name+' applied!');
  }

  activeTheme = id;
  if(id !== 'rose') everChangedTheme = true;
  saveState();
  if(typeof checkAchievements === 'function') checkAchievements();

  // Remove all theme classes, apply new
  document.documentElement.className = document.documentElement.className
    .replace(/\btheme-\S+/g,'').trim();
  if(id !== 'rose') document.documentElement.classList.add('theme-'+id);

  // Sync all theme selectors across Ana settings, Robert settings, shop
  document.querySelectorAll('[data-theme-id]').forEach(el=>{
    const tid = el.dataset.themeId;
    const isActive = tid === id;
    el.classList.toggle('shop-theme-active', isActive);
    const badge = el.querySelector('.theme-active-badge');
    if(badge) badge.style.display = isActive ? 'block' : 'none';
    const ptsBadge = el.querySelector('.shop-pts-badge');
    if(ptsBadge && isActive) ptsBadge.style.display = 'none';
  });
  // Legacy badge IDs (settings selectors)
  document.querySelectorAll('.theme-active-badge').forEach(b=>b.style.display='none');
  ['tbadge-'+id, 'rob-tbadge-'+id].forEach(bid=>{
    const b = document.getElementById(bid);
    if(b) b.style.display='block';
  });
  // Sync old-style theme-opt selectors
  document.querySelectorAll('.theme-opt').forEach(o=>o.classList.remove('on'));
  ['sett-theme-','rob-sett-theme-'].forEach(prefix=>{
    const opt = document.getElementById(prefix+id);
    if(opt) opt.classList.add('on');
  });

  updateCanvasTheme(id);
  if(typeof updateProfStats==='function') updateProfStats();
  // Re-render ribbon so it picks up new theme vars
}
window.applyTheme = applyTheme;

// Inject canvas theme colors
canvasThemeId = 'rose'; // already declared above
function updateCanvasTheme(id){
  canvasThemeId = id;
}

// Expose for canvas to read
window.getCanvasTheme = ()=> canvasThemeId;
window.THEMES = THEMES;


/* ── DEV: Add points ── */
function devAddPts(amt){
  const old = ptsVal;
  ptsVal += amt;
  animatePts(old, ptsVal, 600);
  logPtsChange(amt);
  addTxItem('🛠️','Dev: Points added','Just now','+'+amt,'earn');
  T('🛠️ +'+amt.toLocaleString()+' pts added!');
  updateDevPtsDisplay();
  saveState();
}
function devAddCustomPts(){
  const val = parseInt(document.getElementById('dev-custom-pts').value);
  if(!val || val < 1){ T('⚠️ Enter a valid amount'); return; }
  devAddPts(val);
  document.getElementById('dev-custom-pts').value='';
}
function updateDevPtsDisplay(){
  const el = document.getElementById('dev-pts-display');
  if(el) el.textContent = Math.floor(ptsVal).toLocaleString();
}
window.devAddPts=devAddPts;
window.devAddCustomPts=devAddCustomPts;


/* ═══════════════════════════════════════════
   SHOP RENDERER
═══════════════════════════════════════════ */
function renderShop(){
  const list = document.getElementById('shop-themes-list');
  if(!list) return;

  const themeOrder = ['rose','royal','sakura','golden','starlight','emerald','orange','turquoise','mono','crimson'];
  list.innerHTML = themeOrder.map(id => {
    const t = THEMES[id];
    if(!t) return '';
    const isActive = activeTheme === id;
    const swatches = (t.swatches||[]).map(c =>
      `<div class="shop-swatch" style="background:${c}"></div>`
    ).join('');

    let actionHTML;
    if(isActive){
      actionHTML = `<div class="shop-active-badge theme-active-badge" id="shop-tbadge-${id}">✓ Active</div>`;
    } else if(t.unlocked){
      actionHTML = `
        <div class="shop-active-badge theme-active-badge" id="shop-tbadge-${id}" style="display:none">✓ Active</div>
        <button class="shop-apply-btn rw" onclick="applyTheme('${id}');R(event,this)">Apply</button>`;
    } else {
      actionHTML = `
        <div class="shop-active-badge theme-active-badge" id="shop-tbadge-${id}" style="display:none">✓ Active</div>
        <div class="shop-pts-badge shop-pts-badge-${id}">🪙 ${t.cost.toLocaleString()} pts</div>
        <button class="shop-unlock-btn rw" onclick="shopUnlock('${id}');R(event,this)">Unlock</button>`;
    }

    return `<div class="shop-theme-row rw ${isActive?'shop-theme-active':''}" data-theme-id="${id}" onclick="">
      <div class="shop-swatches">${swatches}</div>
      <div class="shop-theme-info">
        <div class="shop-theme-name">${t.name}${t.cost===0?' — <span style="color:var(--mint);font-size:10px">Free</span>':''}</div>
        <div class="shop-theme-desc">${t.desc||''}</div>
      </div>
      <div class="shop-theme-action">${actionHTML}</div>
    </div>`;
  }).join('');
}
window.renderShop = renderShop;

function shopUnlock(id){
  const t = THEMES[id];
  if(!t) return;
  if(t.unlocked){ applyTheme(id); renderShop(); return; }
  if(ptsVal < t.cost){ T('❌ Need '+t.cost.toLocaleString()+' pts to unlock '+t.name+'!'); return; }
  const old = ptsVal;
  ptsVal -= t.cost;
  animatePts(old, ptsVal, 600);
  logPtsChange(-(t.cost));
  t.unlocked = true;
  addTxItem('🎨', t.name+' theme unlocked', 'Just now', '-'+t.cost, 'spend');
  T('🎨 '+t.name+' unlocked!');
  applyTheme(id);
  renderShop();
  saveState();
}
window.shopUnlock = shopUnlock;

// Re-render shop whenever Exchange tab opens
(function(){
  const _origGo = window.go;
  window.go = function(id){
    _origGo(id);
    if(id === 'exchange') renderShop();
  };
})();

// Initial render if already on exchange
document.addEventListener('DOMContentLoaded', function(){
  renderShop();
});

/* ═══════════════════════════════════════════
   SHOP — NON-THEME ITEMS
═══════════════════════════════════════════ */

const SHOP_ITEMS = [
  // ── UNLOCKS ── (cheapest tier — gateway features, first things worth saving for)
  { id:'write_to_rob',   cat:'unlocks',      ico:'✍️', name:'Write to Robert',    desc:'Unlock the ability to send Robert personal messages anytime from your home screen.',       cost:350, stateKey:'shopWriteToRob'  },
  { id:'robert_mood',    cat:'unlocks',      ico:'💭', name:'Robert\'s Mood',     desc:'See Robert\'s mood on your home screen. He sets it daily from his panel.',            cost:450, stateKey:'shopMood'        },
  { id:'wish_list',      cat:'unlocks',      ico:'✨', name:'Wish List',          desc:'Unlock the Wish List on your home — add dreams, gifts and date ideas for Robert to see.',  cost:550, stateKey:'shopWishList'    },
  // ── BOOSTS ── (income-generating perks — priced so they take real saving to reach, then pay themselves back slowly)
  { id:'streak_shield',    cat:'boosts',       ico:'🛡️', name:'Streak Shield',         desc:'If Ana misses a day, her streak is automatically protected. Once per week.',         cost:500,  stateKey:'shopStreakShield'     },
  { id:'daily_bonus',      cat:'boosts',       ico:'⚡', name:'Daily Bonus',            desc:'Unlocks a daily +50 pts tap on Ana\'s home screen. Collect every day.',             cost:900,  stateKey:'shopDailyBonus'      },
  { id:'hot_streak',       cat:'boosts',       ico:'🔥', name:'Hot Streak Bonus',       desc:'When your streak hits 7 days, an automatic +100 pts reward is triggered.',         cost:1000, stateKey:'shopHotStreak'       },
  { id:'daily_gift_box',   cat:'boosts',       ico:'🎁', name:'Daily Gift Box',         desc:'A mystery box unlocks every 24 hrs — win between +10 and +200 bonus pts.',         cost:1200, stateKey:'shopDailyGiftBox'    },
  { id:'lucky_spin',       cat:'boosts',       ico:'🎰', name:'Lucky Spin',             desc:'A slot-machine daily spin for bonus pts. Could win 50, 100, 200 or even 500 pts.', cost:1600, stateKey:'shopLuckySpin'       },
  // ── RELATIONSHIP ── (the emotional core of the app — highest tier, the big long-term saves)
  { id:'good_night',       cat:'relationship', ico:'🌙', name:'Good Night Mode',        desc:'Robert sets a time. A soft goodnight card appears on Ana\'s screen every night.',  cost:1200, stateKey:'shopGoodNight',      hasConfig:true },
  { id:'countdown_timer',  cat:'relationship', ico:'📅', name:'Countdown Timer',        desc:'Robert sets a date — a trip, anniversary, or event. Ana sees it counting down.',   cost:1300, stateKey:'shopCountdown',      hasConfig:true },
  { id:'daily_question',   cat:'relationship', ico:'💬', name:'Daily Question',         desc:'Robert sets a question for Ana. She answers privately — only Robert can read it.',  cost:1400, stateKey:'shopDailyQuestion',  hasConfig:true },
  { id:'date_night',       cat:'relationship', ico:'🎲', name:'Date Night Picker',      desc:'Robert adds date ideas to a list. Ana spins to get a random surprise pick.',       cost:1500, stateKey:'shopDateNight',      hasConfig:true },
  { id:'memory_jar',       cat:'relationship', ico:'🫙', name:'Memory Jar',             desc:'Robert drops short memories into a jar. Ana shakes to reveal a random one.',        cost:1700, stateKey:'shopMemoryJar'       },
  { id:'couple_song',      cat:'relationship', ico:'🎵', name:'Couple Song',            desc:'Robert sets your song — title + artist shown on Ana\'s home with a note animation.',cost:1900, stateKey:'shopCoupleSong',     hasConfig:true },
  { id:'couple_goals',     cat:'relationship', ico:'💑', name:'Couple Goals',           desc:'Robert sets shared goals together. Ana marks progress as each one is reached.',     cost:2000, stateKey:'shopCoupleGoals',    hasConfig:true },
  { id:'photo_of_day',     cat:'relationship', ico:'📸', name:'Photo of the Day',       desc:'Robert drops a daily photo. Ana sees it blurred — tap to unlock and reveal.',      cost:2100, stateKey:'shopPhotoOfDay',     hasConfig:true },
  { id:'anniversary_card', cat:'relationship', ico:'🎂', name:'Anniversary Card',       desc:'A special full-screen celebration card appears on the 10th of every month.',                   cost:2400, stateKey:'shopAnniversaryCard' },
  { id:'love_map',         cat:'relationship', ico:'📍', name:'Love Map',               desc:'Robert pins special places on a map — first date, first trip, favourites.',         cost:3000, stateKey:'shopLoveMap',        hasConfig:true },
  // ── GAMES & FUN ──
  { id:'puzzle_of_week',   cat:'games',        ico:'🧩', name:'Puzzle of the Week',     desc:'Robert hides a secret message in a weekly word puzzle. Ana must solve it to read.', cost:2000, stateKey:'shopPuzzleOfWeek',   hasConfig:true },
];

const CAT_LABELS = { unlocks:'🔓 Unlocks', boosts:'⚡ Boosts', relationship:'💕 Relationship', games:'🎮 Games & Fun' };

/* ── Unified home-hub feature card ───────────────────────────
   Every purchased relationship/games feature renders through this,
   so the home hub has ONE consistent look instead of a different
   ad hoc accent color and layout per feature. Two states:
   - configured: shows the feature's real content (bodyHTML, or the
     simple icon/title/sub row if no bodyHTML given)
   - pending: feature is owned but Robert hasn't set it up yet — shown
     as a dimmed placeholder instead of vanishing entirely, so buying
     something always visibly does something.
   Nothing renders at all until the item is actually owned. */
function renderHubFeatureCard(id, opts){
  const existing = document.getElementById(id);
  if(existing) existing.remove();
  if(!opts.owned) return null;

  const hub = document.getElementById('home-hub-dynamic');
  if(!hub) return null;

  const card = document.createElement('div');
  card.id = id;
  const tappable = opts.tappable !== false;
  card.className = 'hub-feature-card' + (tappable ? ' rw tappable' : '') + (opts.configured ? '' : ' pending');

  if(tappable){
    if(opts.configured && opts.onClick){
      card.onclick = function(e){ opts.onClick(); if(typeof R==='function') R(e, card); };
    } else if(!opts.configured){
      card.onclick = function(e){ T('💤 ' + (opts.pendingToast || "Robert hasn't set this up yet")); if(typeof R==='function') R(e, card); };
    }
  }

  if(opts.configured && opts.bodyHTML){
    card.innerHTML = opts.bodyHTML;
  } else {
    card.innerHTML = `
      <div class="hfc-ico">${opts.ico}</div>
      <div class="hfc-body">
        <div class="hfc-title">${opts.title}</div>
        <div class="hfc-sub">${opts.configured ? (opts.sub||'') : (opts.pendingText || "Robert hasn't set this up yet 💤")}</div>
      </div>`;
  }
  hub.appendChild(card);
  return card;
}
window.renderHubFeatureCard = renderHubFeatureCard;

function renderShopItems(){
  const list = document.getElementById('shop-items-list');
  if(!list) return;

  let html = '';
  let lastCat = null;

  SHOP_ITEMS.forEach(item=>{
    if(item.cat !== lastCat){
      html += `<div class="shop-cat-lbl">${CAT_LABELS[item.cat]||item.cat}</div>`;
      lastCat = item.cat;
    }
    const owned = !!window[item.stateKey];
    const actionHTML = owned
      ? `<div class="shop-owned-badge">✓ Owned</div>`
      : `<div class="shop-pts-badge">🪙 ${item.cost.toLocaleString()} pts</div>
         <button class="shop-unlock-btn rw" onclick="shopBuyItem('${item.id}');R(event,this)">Unlock</button>`;

    html += `<div class="shop-item${owned?' owned':''}">
      <div class="shop-item-ico">${item.ico}</div>
      <div class="shop-item-info">
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-desc">${item.desc}</div>
      </div>
      <div class="shop-item-action">${actionHTML}</div>
    </div>`;
  });

  list.innerHTML = html;
}
window.renderShopItems = renderShopItems;

function shopBuyItem(id){
  const item = SHOP_ITEMS.find(i=>i.id===id);
  if(!item) return;
  if(window[item.stateKey]){ T('✓ Already owned!'); return; }
  if(ptsVal < item.cost){ T('❌ Need '+item.cost.toLocaleString()+' pts to unlock '+item.name); return; }

  const old = ptsVal;
  ptsVal -= item.cost;
  animatePts(old, ptsVal, 600);
  logPtsChange(-(item.cost));
  window[item.stateKey] = true;
  addTxItem(item.ico, item.name+' unlocked', 'Just now', '-'+item.cost, 'spend');
  T(item.ico+' '+item.name+' unlocked!');

  renderShopItems();
  applyShopUnlocks();
  // Update dev pts display
  if(typeof updateDevPtsDisplay==='function') updateDevPtsDisplay();
  saveState();
  if(typeof checkAchievements === 'function') checkAchievements();
}
window.shopBuyItem = shopBuyItem;

async function shopConfigure(id){
  if(id==='couple_song'){
    const result = await appModal({
      icon: '🎵',
      title: 'Your couple song',
      fields: [
        { key: 'title', label: 'Song title', placeholder: 'e.g. Perfect' },
        { key: 'artist', label: 'Artist', placeholder: 'e.g. Ed Sheeran' }
      ],
      confirmLabel: 'Save'
    });
    if(!result || !result.title || !result.artist) return;
    shopCoupleSong = {title:result.title, artist:result.artist};
    T('🎵 Couple song set: '+shopCoupleSong.title);
    renderCoupleSong();
    saveState();
  }
  if(id==='love_map'){ openLoveMapAdmin(); }
  if(id==='countdown_timer'){ openCountdownAdmin(); }
  if(id==='good_night'){ openGoodNightAdmin(); }
  if(id==='couple_goals'){ openCoupleGoalsAdmin(); }
  if(id==='date_night'){ openDateNightAdmin(); }
  if(id==='daily_question'){ openDailyQuestionAdmin(); }
  if(id==='photo_of_day'){ openPhotoOfDayAdmin(); }
  if(id==='puzzle_of_week'){ openPuzzleAdmin(); }
}
window.shopConfigure = shopConfigure;

function editCoupleSongFromSettings(){
  if(typeof shopConfigure === 'function'){
    shopConfigure('couple_song');
  }
  const sub = document.getElementById('sett-couple-song-sub');
  if(sub && shopCoupleSong && shopCoupleSong.title){
    sub.textContent = shopCoupleSong.title + (shopCoupleSong.artist ? ' — ' + shopCoupleSong.artist : '');
  }
}
window.editCoupleSongFromSettings = editCoupleSongFromSettings;

// Apply all visual unlocks after load or purchase
function applyShopUnlocks(){
  // Couple Song
  renderCoupleSong();

  // Mood card visibility
  const moodHomeCard = document.getElementById('rob-mood-home-card');
  if(moodHomeCard) moodHomeCard.style.display = shopMood ? 'block' : 'none';

  // Wishlist + Write to Robert visibility
  if(typeof applyWishlistUnlocks==='function') applyWishlistUnlocks();

  // Memory Jar visibility
  const jarBtn = document.getElementById('memory-jar-home');
  if(jarBtn) jarBtn.style.display = shopMemoryJar ? 'block' : 'none';
  const robJarCard = document.getElementById('rob-memory-jar-card');
  if(robJarCard) robJarCard.style.display = shopMemoryJar ? 'block' : 'none';
  if(shopMemoryJar) renderRobMemoryJar();

  // Daily Bonus tap
  renderDailyBonus();

  // Love Map visibility
  const loveMapHome = document.getElementById('love-map-home');
  if(loveMapHome) loveMapHome.style.display = shopLoveMap ? 'block' : 'none';
  const robLoveMapCard = document.getElementById('rob-love-map-card');
  if(robLoveMapCard) robLoveMapCard.style.display = shopLoveMap ? 'block' : 'none';
  if(shopLoveMap){ renderLoveMap(); renderRobLoveMap(); }

  // New items
  renderDailyGiftBox();
  renderCountdownCard();
  renderGoodNightCard();
  renderCoupleGoalsCard();
  renderDateNightCard();
  renderDailyQuestionCard();
  renderPhotoOfDayCard();
  renderLuckySpinCard();
  renderPuzzleCard();
  renderStreakShieldCard();
}
window.applyShopUnlocks = applyShopUnlocks;

/* ─── STREAK SHIELD ──────────────────────── */
function renderStreakShieldCard(){
  const msIn24h = 24*60*60*1000;
  const onCooldown = streakShieldUsedDate &&
    (Date.now() - new Date(streakShieldUsedDate).getTime()) < 7*msIn24h;
  let sub = 'Active — ready to protect';
  if(onCooldown){
    const daysLeft = Math.ceil((7*msIn24h - (Date.now() - new Date(streakShieldUsedDate).getTime())) / msIn24h);
    sub = 'Used — recharges in ' + daysLeft + ' day' + (daysLeft===1?'':'s');
  }
  renderHubFeatureCard('streak-shield-card', {
    owned: shopStreakShield,
    configured: true,
    ico: '🛡️',
    title: 'Streak Shield',
    sub: sub,
    onClick: function(){ T(onCooldown ? '🛡️ Shield recharging — ' + sub.toLowerCase() : '🛡️ Streak Shield is active and ready'); }
  });
}
window.renderStreakShieldCard = renderStreakShieldCard;

function renderCoupleSong(){
  const sub = document.getElementById('sett-couple-song-sub');
  if(sub){
    if(shopCoupleSong && shopCoupleSong.title){
      sub.textContent = shopCoupleSong.title + (shopCoupleSong.artist ? ' — ' + shopCoupleSong.artist : '');
    } else {
      sub.textContent = 'Set your relationship anthem';
    }
  }

  const configured = !!(shopCoupleSong && shopCoupleSong.title);
  renderHubFeatureCard('couple-song-card', {
    owned: !!shopCoupleSong,
    configured: configured,
    ico: '🎵',
    title: configured ? shopCoupleSong.title : 'Couple Song',
    sub: configured ? (shopCoupleSong.artist || '') : '',
    pendingText: "Robert hasn't set your song yet 💤",
    onClick: configured ? function(){ T('🎵 '+shopCoupleSong.title+' — '+shopCoupleSong.artist); } : null
  });
}

function renderDailyBonus(){
  const today = new Date().toDateString();
  const claimed = shopDailyBonusLastClaimed === today;
  renderHubFeatureCard('daily-bonus-btn', {
    owned: shopDailyBonus,
    configured: !claimed,
    ico: claimed ? '✅' : '⚡',
    title: claimed ? 'Bonus claimed!' : 'Daily Bonus',
    sub: claimed ? 'Come back tomorrow' : '+50 pts — tap to claim',
    onClick: claimed ? null : claimDailyBonus
  });
}

function claimDailyBonus(){
  const today = new Date().toDateString();
  if(shopDailyBonusLastClaimed === today){ T('✅ Already claimed today!'); return; }
  shopDailyBonusLastClaimed = today;
  totalBonusesClaimed++;
  const old = ptsVal;
  ptsVal += 50;
  animatePts(old, ptsVal, 600);
  logPtsChange(50);
  addTxItem('⚡','Daily Bonus claimed','Just now','+50','earn');
  T('⚡ +50 pts Daily Bonus!');
  showSuccess('⚡','Daily Bonus!','rgba(110,232,180,.2)');
  renderDailyBonus(); // update button state
  saveState();
}
window.claimDailyBonus = claimDailyBonus;

// Anniversary Card — check on load
function checkAnniversaryCard(){
  if(!shopAnniversaryCard) return;
  const now = new Date();
  if(now.getDate()===10){ // 10th of every month
    showAnniversaryCard();
  }
}

function showAnniversaryCard(){
  if(document.getElementById('anniversary-overlay')) return;
  const ov = document.createElement('div');
  ov.id = 'anniversary-overlay';
  ov.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(7,0,16,.92);backdrop-filter:blur(20px);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px';
  ov.innerHTML=`
    <div style="font-size:72px;margin-bottom:12px;animation:hb 2s ease infinite">🎂</div>
    <div style="font-size:28px;font-weight:900;color:#fff;margin-bottom:8px;text-align:center">Happy Anniversary!</div>
    <div style="font-size:14px;color:var(--tx2);text-align:center;margin-bottom:28px;line-height:1.6">Celebrating you every month 💕<br>The 10th — ${new Date().toLocaleString('en-GB',{month:'long',year:'numeric'})}</div>
    <button style="background:linear-gradient(135deg,#a02050,var(--rose));color:#fff;border:none;border-radius:var(--rp);padding:15px 40px;font-size:15px;font-weight:900;font-family:'Nunito',sans-serif;cursor:pointer" onclick="document.getElementById('anniversary-overlay').remove()">Celebrate 🎉</button>`;
  document.body.appendChild(ov);
  if(typeof fireConfetti==='function') fireConfetti();
}

// Memory Jar — Robert adds, Ana shakes
function addMemory(text){
  if(!text||!text.trim()) return;
  const now = new Date();
  memoryJarItems.unshift({text:text.trim(), date:now.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})});
  T('🫙 Memory added to the jar!');
  renderRobMemoryJar();
  saveState();
  if(typeof checkAchievements === 'function') checkAchievements();
}
window.addMemory = addMemory;

function shakeMemoryJar(){
  if(!memoryJarItems.length){ T('🫙 The jar is empty — Robert hasn\'t added memories yet'); return; }
  const m = memoryJarItems[Math.floor(Math.random()*memoryJarItems.length)];
  // Show as a toast-style overlay
  const ov = document.getElementById('memory-reveal');
  if(ov){
    document.getElementById('memory-reveal-text').textContent = m.text;
    document.getElementById('memory-reveal-date').textContent = m.date;
    ov.style.opacity = '1';
    ov.style.pointerEvents = 'all';
  }
}
window.shakeMemoryJar = shakeMemoryJar;

function renderRobMemoryJar(){
  const list = document.getElementById('rob-memory-list');
  if(!list) return;
  list.innerHTML = memoryJarItems.length
    ? memoryJarItems.map((m,i)=>`
        <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <div style="font-size:16px">🫙</div>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:700;color:#fff;line-height:1.4">${m.text}</div>
            <div style="font-size:10px;color:var(--tx3);margin-top:2px">${m.date}</div>
          </div>
          <button class="dev-btn del rw" onclick="memoryJarItems.splice(${i},1);renderRobMemoryJar();saveState();R(event,this)">🗑️</button>
        </div>`).join('')
    : '<div style="font-size:12px;color:var(--tx3);text-align:center;padding:12px 0">No memories yet — add one below</div>';
}
window.renderRobMemoryJar = renderRobMemoryJar;

/* ═══════════════════════════════════════════
   LOVE MAP — ANA'S HOME CARD
═══════════════════════════════════════════ */
function renderLoveMap(){
  const wrap = document.getElementById('love-map-pins-list');
  if(!wrap) return;
  if(!loveMapPins.length){
    wrap.innerHTML = '<div style="font-size:12px;color:var(--tx3);text-align:center;padding:14px 0">Robert hasn\'t pinned any places yet 📍</div>';
    return;
  }
  wrap.innerHTML = loveMapPins.map((p,i)=>`
    <div class="love-map-pin" style="animation-delay:${i*55}ms">
      <div class="love-map-pin-ico">${p.emoji||'📍'}</div>
      <div class="love-map-pin-body">
        <div class="love-map-pin-label">${p.label}</div>
        <div class="love-map-pin-desc">${p.desc||''}</div>
        <div class="love-map-pin-date">${p.date||''}</div>
      </div>
    </div>`).join('');
}
window.renderLoveMap = renderLoveMap;

/* ═══════════════════════════════════════════
   LOVE MAP — ROBERT'S ADMIN
═══════════════════════════════════════════ */
function renderRobLoveMap(){
  const list = document.getElementById('rob-love-map-list');
  if(!list) return;
  list.innerHTML = loveMapPins.length
    ? loveMapPins.map((p,i)=>`
        <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <div style="font-size:20px;flex-shrink:0">${p.emoji||'📍'}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:12.5px;font-weight:700;color:#fff">${p.label}</div>
            <div style="font-size:11px;color:var(--tx2);margin-top:1px">${p.desc||''}</div>
            <div style="font-size:10px;color:var(--tx3);margin-top:2px">${p.date||''}</div>
          </div>
          <button class="dev-btn del rw" onclick="loveMapPins.splice(${i},1);renderRobLoveMap();renderLoveMap();saveState();R(event,this)">🗑️</button>
        </div>`).join('')
    : '<div style="font-size:12px;color:var(--tx3);text-align:center;padding:12px 0">No pins yet — add one below</div>';
}
window.renderRobLoveMap = renderRobLoveMap;

async function openLoveMapAdmin(){
  const result = await appModal({
    icon: '📍',
    title: 'Add a Love Map pin',
    fields: [
      { key: 'emoji', label: 'Emoji', placeholder: '🍽️ 🏖️ ✈️', value: '📍', maxLength: 4 },
      { key: 'label', label: 'Place name', placeholder: 'e.g. First Date — Lucia\'s' },
      { key: 'desc', label: 'Description (optional)', placeholder: '' },
      { key: 'date', label: 'Date (optional)', placeholder: 'e.g. Aug 10, 2024' }
    ],
    confirmLabel: 'Add pin'
  });
  if(!result || !result.label) return;
  const emoji = result.emoji || '📍';
  loveMapPins.unshift({ emoji:emoji.slice(0,4), label:result.label, desc:result.desc, date:result.date });
  renderRobLoveMap();
  renderLoveMap();
  T('📍 Pin added: '+result.label);
  showSuccess('📍','Pin added!','rgba(224,85,120,.2)');
  saveState();
  if(typeof checkAchievements === 'function') checkAchievements();
}
window.openLoveMapAdmin = openLoveMapAdmin;

/* ═══════════════════════════════════════════
   RELATIONSHIP TIMELINE — fully Robert-authored,
   real entries only. Replaces what used to be a
   hardcoded block of fake milestones in the Logs page.
═══════════════════════════════════════════ */

const TL_BADGE_STYLES = {
  done:     { dot:'done',     badge:'done',     badgeText:'✓ Done' },
  special:  { dot:'special',  badge:'done',     badgeText:'✓ Milestone' },
  upcoming: { dot:'upcoming', badge:'upcoming', badgeText:'Upcoming' },
  soon:     { dot:'upcoming', badge:'soon',     badgeText:'Coming soon' },
};

function renderRelationshipTimeline(){
  const list = document.getElementById('timeline-list');
  if(!list) return;

  const anchorSub = document.getElementById('tl-anchor-sub');
  if(anchorSub && typeof getRelationshipDate === 'function' && typeof formatRelDatePretty === 'function'){
    anchorSub.textContent = 'Together since ' + formatRelDatePretty(getRelationshipDate());
  }

  if(!relationshipTimeline.length){
    list.innerHTML = '<div style="text-align:center;padding:20px 0;font-size:12px;color:var(--tx3)">Robert hasn\'t added anything to your timeline yet 💤</div>';
    return;
  }

  list.innerHTML = relationshipTimeline.map((t, i) => {
    const style = TL_BADGE_STYLES[t.style] || TL_BADGE_STYLES.done;
    const isLast = i === relationshipTimeline.length - 1;
    return `<div class="tl-item" style="animation-delay:${i*.04}s">
      <div class="tl-left">
        <div class="tl-dot ${style.dot}">${t.ico || '💕'}</div>
        ${isLast ? '' : `<div class="tl-line ${style.dot === 'done' ? 'done' : ''}"></div>`}
      </div>
      <div class="tl-body">
        <div class="tl-title">${t.title}</div>
        ${t.sub ? `<div class="tl-sub">${t.sub}</div>` : ''}
        ${t.date ? `<div class="tl-date">${t.date}</div>` : ''}
        <span class="tl-badge ${style.badge}">${t.badgeText || style.badgeText}</span>
      </div>
    </div>`;
  }).join('');
}
window.renderRelationshipTimeline = renderRelationshipTimeline;

function renderRobTimelineList(){
  const list = document.getElementById('rob-timeline-list');
  if(!list) return;
  list.innerHTML = relationshipTimeline.length
    ? relationshipTimeline.map((t,i)=>`
        <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <div style="font-size:20px;flex-shrink:0">${t.ico||'💕'}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:12.5px;font-weight:700;color:#fff">${t.title}</div>
            <div style="font-size:11px;color:var(--tx2);margin-top:1px">${t.sub||''}</div>
            <div style="font-size:10px;color:var(--tx3);margin-top:2px">${t.date||''}</div>
          </div>
          <button class="dev-btn del rw" onclick="relationshipTimeline.splice(${i},1);renderRobTimelineList();renderRelationshipTimeline();saveState();R(event,this)">🗑️</button>
        </div>`).join('')
    : '<div style="font-size:12px;color:var(--tx3);text-align:center;padding:12px 0">No timeline entries yet — add one below</div>';
}
window.renderRobTimelineList = renderRobTimelineList;

async function openTimelineAdmin(){
  const result = await appModal({
    icon: '🗓️',
    title: 'Add a timeline entry',
    subtitle: 'Shows up on Ana\'s Logs page, in order',
    fields: [
      { key: 'emoji', label: 'Emoji', placeholder: '💕 💌 🔥 💍', value: '💕', maxLength: 4 },
      { key: 'title', label: 'Title', placeholder: 'e.g. First letter sent' },
      { key: 'sub', label: 'Description (optional)', placeholder: 'e.g. Your first goodnight letter' },
      { key: 'date', label: 'Date / label (optional)', placeholder: 'e.g. August 10, 2023' },
      { key: 'style', label: "Style: done, special, upcoming, or soon", value: 'done', placeholder: 'done' },
    ],
    confirmLabel: 'Add to timeline'
  });
  if(!result || !result.title) return;
  const style = TL_BADGE_STYLES[result.style] ? result.style : 'done';

  relationshipTimeline.push({
    ico: (result.emoji || '💕').slice(0,4),
    title: result.title,
    sub: result.sub || '',
    date: result.date || '',
    style: style
  });
  renderRobTimelineList();
  renderRelationshipTimeline();
  T('🗓️ Timeline entry added: ' + result.title);
  showSuccess('🗓️','Added to timeline!','rgba(224,85,120,.2)');
  saveState();
  if(typeof checkAchievements === 'function') checkAchievements();
}
window.openTimelineAdmin = openTimelineAdmin;

/* ═══════════════════════════════════════════
   UPDATES & WHAT'S NEW — fully Robert-authored,
   real entries only. Replaces what used to be a
   hardcoded static changelog in the Logs page.
═══════════════════════════════════════════ */

function renderUpdatesLog(){
  const list = document.getElementById('updates-log-list');
  if(!list) return;

  if(!updatesLog.length){
    list.innerHTML = '<div style="text-align:center;padding:20px 0;font-size:12px;color:var(--tx3)">No updates posted yet 💤</div>';
    return;
  }

  // Newest first
  list.innerHTML = updatesLog.map((u, i) => {
    const itemsHtml = (u.items||[]).map(it => `<li>${it}</li>`).join('');
    const divider = i < updatesLog.length - 1 ? '<div class="update-divider"></div>' : '';
    return `<div class="update-item">
      <div class="update-version">${u.version}</div>
      <div class="update-date">${u.dateLabel}</div>
      <ul class="update-list">${itemsHtml}</ul>
    </div>${divider}`;
  }).join('');
}
window.renderUpdatesLog = renderUpdatesLog;

function renderRobUpdatesList(){
  const list = document.getElementById('rob-updates-list');
  if(!list) return;
  list.innerHTML = updatesLog.length
    ? updatesLog.map((u,i)=>`
        <div style="display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <div style="flex:1;min-width:0">
            <div style="font-size:12.5px;font-weight:800;color:#fff">${u.version} <span style="font-weight:600;color:var(--tx3);font-size:10.5px">— ${u.dateLabel}</span></div>
            <div style="font-size:11px;color:var(--tx2);margin-top:3px">${(u.items||[]).join(' · ')}</div>
          </div>
          <button class="dev-btn del rw" onclick="updatesLog.splice(${i},1);renderRobUpdatesList();renderUpdatesLog();saveState();R(event,this)">🗑️</button>
        </div>`).join('')
    : '<div style="font-size:12px;color:var(--tx3);text-align:center;padding:12px 0">No updates yet — post one below</div>';
}
window.renderRobUpdatesList = renderRobUpdatesList;

async function openUpdatesAdmin(){
  const result = await appModal({
    icon: '📋',
    title: 'Post an update',
    subtitle: "Shows up on Ana's Logs page, newest first",
    fields: [
      { key: 'version', label: 'Version / title', placeholder: 'e.g. v1.1' },
      { key: 'dateLabel', label: 'Date label', placeholder: 'e.g. This week' },
      { key: 'itemsText', label: "What's new — separate items with |", placeholder: 'New feature added | Fixed a bug | Improved something' },
    ],
    confirmLabel: 'Post update'
  });
  if(!result || !result.version) return;

  const items = (result.itemsText||'').split('|').map(s=>s.trim()).filter(Boolean);
  if(!items.length){ T('⚠️ Add at least one update item'); return; }

  updatesLog.unshift({
    version: result.version,
    dateLabel: result.dateLabel || 'Just now',
    items: items
  });
  renderRobUpdatesList();
  renderUpdatesLog();
  T('📋 Update posted: ' + result.version);
  showSuccess('📋','Update posted!','rgba(224,85,120,.2)');
  saveState();
}
window.openUpdatesAdmin = openUpdatesAdmin;

// Hook renderShop to also render items
(function(){
  const _orig = window.renderShop;
  window.renderShop = function(){
    _orig();
    renderShopItems();
  };
})();

// Apply unlocks on login / init
(function(){
  const _origShow = window.showRobertView || function(){};
  // Apply after a short delay to let DOM settle
  setTimeout(applyShopUnlocks, 800);
})();

/* ═══════════════════════════════════════════
   NEW SHOP FEATURES — 17 ITEMS
═══════════════════════════════════════════ */

// ── HELPER: inject a home card after a reference element ──
function _injectCard(id, refId, html){
  const existing = document.getElementById(id);
  if(existing) existing.remove();
  const ref = document.getElementById(refId) || document.querySelector('.home-section, #s-home');
  if(!ref) return null;
  const el = document.createElement('div');
  el.id = id;
  el.innerHTML = html;
  ref.after ? ref.after(el) : ref.parentNode.insertBefore(el, ref.nextSibling);
  return el;
}

// ── HELPER: shop overlay modal ──
function _shopModal(id, title, bodyHTML, onClose){
  const existing = document.getElementById(id);
  if(existing) existing.remove();
  const ov = document.createElement('div');
  ov.id = id;
  ov.style.cssText='position:fixed;inset:0;z-index:8800;background:rgba(7,0,16,.93);backdrop-filter:blur(18px);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:0';
  ov.innerHTML=`
    <div style="width:100%;max-width:420px;background:var(--card,#1a0a2e);border-radius:24px 24px 0 0;padding:28px 24px 36px;box-sizing:border-box">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <div style="font-size:17px;font-weight:900;color:#fff">${title}</div>
        <button onclick="document.getElementById('${id}').remove();${onClose||''}" style="background:rgba(255,255,255,.08);border:none;border-radius:50%;width:32px;height:32px;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center">×</button>
      </div>
      ${bodyHTML}
    </div>`;
  document.body.appendChild(ov);
  return ov;
}

/* ─── DAILY GIFT BOX ─────────────────────── */
function renderDailyGiftBox(){
  const today = new Date().toDateString();
  const claimed = shopDailyGiftLastClaimed === today;
  renderHubFeatureCard('daily-gift-btn', {
    owned: shopDailyGiftBox,
    configured: !claimed,
    ico: claimed ? '✅' : '🎁',
    title: claimed ? 'Gift opened!' : 'Daily Gift Box',
    sub: claimed ? 'Come back tomorrow' : 'Mystery pts — tap to open',
    onClick: claimed ? null : claimDailyGift
  });
}
function claimDailyGift(){
  const today = new Date().toDateString();
  if(shopDailyGiftLastClaimed===today){ T('✅ Already opened today!'); return; }
  shopDailyGiftLastClaimed = today;
  totalGiftBoxesOpened++;
  const prizes = [10,20,30,50,50,75,100,100,150,200];
  const won = prizes[Math.floor(Math.random()*prizes.length)];
  const old = ptsVal; ptsVal += won;
  animatePts(old, ptsVal, 700);
  logPtsChange(won);
  addTxItem('🎁','Daily Gift Box opened','Just now','+'+won,'earn');
  T('🎁 Gift Box! You won +'+won+' pts!');
  showSuccess('🎁','+'+ won +' pts!','rgba(255,195,80,.2)');
  renderDailyGiftBox();
  saveState();
}
window.claimDailyGift = claimDailyGift;
window.renderDailyGiftBox = renderDailyGiftBox;

/* ─── HOT STREAK BONUS ───────────────────── */
function checkHotStreak(){
  if(!shopHotStreak) return;
  const streak = window.currentStreak || 0;
  if(streak >= 7){
    const today = new Date().toDateString();
    const key = 'hotStreakLastBonus';
    if(localStorage.getItem(key)===today) return;
    localStorage.setItem(key, today);
    const old = ptsVal; ptsVal += 100;
    animatePts(old, ptsVal, 700);
    logPtsChange(100);
    addTxItem('🔥','Hot Streak Bonus — 7 day streak!','Just now','+100','earn');
    T('🔥 Hot Streak! +100 bonus pts!');
    showSuccess('🔥','Streak Bonus!','rgba(255,120,50,.2)');
    saveState();
  }
}
window.checkHotStreak = checkHotStreak;

/* ─── COUNTDOWN TIMER ────────────────────── */
function renderCountdownCard(){
  const configured = !!shopCountdownData;
  let sub = '';
  if(configured){
    const target = new Date(shopCountdownData.date);
    const now = new Date();
    const diff = target - now;
    if(diff < 0){
      sub = "It's here! 🎉";
    } else {
      const days = Math.floor(diff/(1000*60*60*24));
      const hrs  = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
      const mins = Math.floor((diff%(1000*60*60))/(1000*60));
      sub = `${days}d ${hrs}h ${mins}m to go`;
    }
  }
  renderHubFeatureCard('countdown-card', {
    owned: shopCountdown,
    configured: configured,
    ico: '📅',
    title: configured ? shopCountdownData.label : 'Countdown Timer',
    sub: sub,
    pendingText: "Robert hasn't set a countdown yet 💤",
    tappable: false
  });
  // live tick
  clearInterval(window._countdownTick);
  if(shopCountdown) window._countdownTick = setInterval(renderCountdownCard, 60000);
}
function openCountdownAdmin(){
  _shopModal('countdown-modal','📅 Countdown Timer',`
    <div style="display:flex;flex-direction:column;gap:14px">
      <div>
        <label style="font-size:11px;color:var(--tx2);display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em">Event name</label>
        <input id="cd-label" placeholder="e.g. Our Paris Trip" style="width:100%;padding:12px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:14px;font-family:inherit;box-sizing:border-box">
      </div>
      <div>
        <label style="font-size:11px;color:var(--tx2);display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em">Date</label>
        <input id="cd-date" type="date" style="width:100%;padding:12px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:14px;font-family:inherit;box-sizing:border-box">
      </div>
      <button onclick="saveCountdown()" class="shop-unlock-btn rw" style="margin-top:4px;width:100%;padding:14px;font-size:14px">Save Countdown</button>
    </div>
  `);
}
function saveCountdown(){
  const label = document.getElementById('cd-label').value.trim();
  const date  = document.getElementById('cd-date').value;
  if(!label||!date){ T('⚠️ Please fill both fields'); return; }
  shopCountdownData = {label, date};
  document.getElementById('countdown-modal').remove();
  T('📅 Countdown set: '+label);
  renderCountdownCard();
  saveState();
}
window.openCountdownAdmin = openCountdownAdmin;
window.saveCountdown = saveCountdown;
window.renderCountdownCard = renderCountdownCard;

/* ─── VOICE NOTE ─────────────────────────── */

/* ─── GOOD NIGHT MODE ────────────────────── */
function renderGoodNightCard(){
  const time = shopGoodNightTime || '22:00';
  renderHubFeatureCard('good-night-card', {
    owned: shopGoodNight,
    configured: true, // always has a sensible default time
    ico: '🌙',
    title: 'Good Night Mode',
    sub: 'Active every night at ' + time,
    tappable: false
  });

  // Just set up the interval check; actual overlay shows at the set time
  clearInterval(window._goodNightCheck);
  if(!shopGoodNight) return;
  function check(){
    if(!shopGoodNight) return;
    const [h,m] = time.split(':').map(Number);
    const now = new Date();
    if(now.getHours()===h && now.getMinutes()===m){
      const key='gnShown'+now.toDateString();
      if(!sessionStorage.getItem(key)){
        sessionStorage.setItem(key,'1');
        showGoodNightOverlay();
      }
    }
  }
  check();
  window._goodNightCheck = setInterval(check, 30000);
}
function showGoodNightOverlay(){
  if(document.getElementById('goodnight-overlay')) return;
  const ov = document.createElement('div');
  ov.id='goodnight-overlay';
  ov.style.cssText='position:fixed;inset:0;z-index:9900;background:rgba(5,0,18,.96);backdrop-filter:blur(24px);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:36px;animation:fadeIn .6s ease';
  ov.innerHTML=`
    <div style="font-size:64px;margin-bottom:16px">🌙</div>
    <div style="font-size:26px;font-weight:900;color:#fff;margin-bottom:10px;text-align:center">Good Night, Ana</div>
    <div style="font-size:14px;color:var(--tx2);text-align:center;line-height:1.7;margin-bottom:32px">Robert is thinking of you.<br>Sleep well, my love 💕</div>
    <button onclick="document.getElementById('goodnight-overlay').remove()" style="background:linear-gradient(135deg,#a02050,var(--rose,#e05578));color:#fff;border:none;border-radius:var(--rp,50px);padding:14px 40px;font-size:15px;font-weight:900;font-family:'Nunito',sans-serif;cursor:pointer">Good Night ✨</button>`;
  document.body.appendChild(ov);
}
function openGoodNightAdmin(){
  _shopModal('goodnight-modal','🌙 Good Night Mode',`
    <div style="display:flex;flex-direction:column;gap:14px">
      <div>
        <label style="font-size:11px;color:var(--tx2);display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em">Show at (local time)</label>
        <input id="gn-time" type="time" value="${shopGoodNightTime||'22:00'}" style="width:100%;padding:12px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:14px;font-family:inherit;box-sizing:border-box">
      </div>
      <button onclick="saveGoodNight()" class="shop-unlock-btn rw" style="margin-top:4px;width:100%;padding:14px;font-size:14px">Save Time</button>
    </div>
  `);
}
function saveGoodNight(){
  const time = document.getElementById('gn-time').value;
  if(!time){ T('⚠️ Pick a time'); return; }
  shopGoodNightTime = time;
  document.getElementById('goodnight-modal').remove();
  T('🌙 Good Night Mode set for '+time);
  renderGoodNightCard();
  saveState();
}
window.openGoodNightAdmin = openGoodNightAdmin;
window.saveGoodNight = saveGoodNight;
window.renderGoodNightCard = renderGoodNightCard;

/* ─── COUPLE GOALS ───────────────────────── */
function renderCoupleGoalsCard(){
  const configured = coupleGoalsList.length > 0;
  const done = configured ? coupleGoalsList.filter(g=>g.done).length : 0;
  const bodyHTML = configured ? `
    <div style="display:flex;flex-direction:column;gap:10px;width:100%">
      <div style="display:flex;align-items:center;gap:8px;width:100%">
        <span class="hfc-ico">💑</span>
        <span class="hfc-title" style="flex:1">Couple Goals</span>
        <span style="font-size:11px;color:var(--tx3)">${done}/${coupleGoalsList.length} done</span>
      </div>
      ${coupleGoalsList.slice(0,3).map((g,i)=>`
        <div style="display:flex;align-items:center;gap:8px;width:100%;cursor:pointer" onclick="toggleGoal(${i})">
          <div style="width:18px;height:18px;border-radius:50%;border:2px solid rgba(224,85,120,.35);display:flex;align-items:center;justify-content:center;flex-shrink:0;background:${g.done?'rgba(224,85,120,.3)':'transparent'}">
            ${g.done?'<div style="width:8px;height:8px;background:var(--rose-b);border-radius:50%"></div>':''}
          </div>
          <span style="font-size:12px;color:${g.done?'var(--tx3)':'var(--tx2)'};text-decoration:${g.done?'line-through':'none'}">${g.text}</span>
        </div>`).join('')}
    </div>` : null;

  renderHubFeatureCard('couple-goals-card', {
    owned: shopCoupleGoals,
    configured: configured,
    ico: '💑',
    title: 'Couple Goals',
    pendingText: "Robert hasn't added any goals yet 💤",
    bodyHTML: bodyHTML,
    tappable: !configured
  });
}
function toggleGoal(i){
  if(!coupleGoalsList[i]) return;
  coupleGoalsList[i].done = !coupleGoalsList[i].done;
  if(coupleGoalsList[i].done){ T('💑 Goal achieved: '+coupleGoalsList[i].text); showSuccess('💑','Goal Achieved!','rgba(255,180,80,.2)'); }
  renderCoupleGoalsCard();
  saveState();
  if(typeof checkAchievements === 'function') checkAchievements();
}
function openCoupleGoalsAdmin(){
  _shopModal('couple-goals-modal','💑 Couple Goals',`
    <div style="display:flex;flex-direction:column;gap:12px">
      <div id="cg-list" style="display:flex;flex-direction:column;gap:8px;max-height:200px;overflow-y:auto">
        ${coupleGoalsList.map((g,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,.04);border-radius:10px"><span style="flex:1;font-size:12px;color:#fff">${g.text}</span><button class="dev-btn del rw" onclick="coupleGoalsList.splice(${i},1);document.getElementById('couple-goals-modal').remove();openCoupleGoalsAdmin();R(event,this)">🗑️</button></div>`).join('') || '<div style="font-size:12px;color:var(--tx3);text-align:center;padding:8px">No goals yet</div>'}
      </div>
      <input id="cg-input" placeholder="Add a goal..." style="width:100%;padding:12px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:14px;font-family:inherit;box-sizing:border-box">
      <button onclick="addCoupleGoal()" class="shop-unlock-btn rw" style="width:100%;padding:14px;font-size:14px">Add Goal</button>
    </div>
  `);
}
function addCoupleGoal(){
  const val = document.getElementById('cg-input').value.trim();
  if(!val){ T('⚠️ Enter a goal'); return; }
  coupleGoalsList.push({text:val, done:false});
  T('💑 Goal added!');
  document.getElementById('couple-goals-modal').remove();
  openCoupleGoalsAdmin();
  renderCoupleGoalsCard();
  saveState();
}
window.openCoupleGoalsAdmin = openCoupleGoalsAdmin;
window.addCoupleGoal = addCoupleGoal;
window.toggleGoal = toggleGoal;
window.renderCoupleGoalsCard = renderCoupleGoalsCard;

/* ─── MEMORY TIMELINE ────────────────────── */
/* ─── PLAYLIST BUILDER (removed — see below) ────────── */
/* ─── DATE NIGHT PICKER ──────────────────── */
function renderDateNightCard(){
  const configured = dateNightIdeas.length > 0;
  const card = renderHubFeatureCard('date-night-card', {
    owned: shopDateNight,
    configured: configured,
    ico: '🎲',
    title: 'Date Night Picker',
    sub: 'Tap to spin a date idea',
    pendingText: "Robert hasn't added any date ideas yet 💤",
    onClick: configured ? function(){
      const pick = dateNightIdeas[Math.floor(Math.random()*dateNightIdeas.length)];
      T('🎲 Date Night: '+pick);
      const subEl = document.querySelector('#date-night-card .hfc-sub');
      if(subEl) subEl.textContent = pick;
    } : null
  });
}
function openDateNightAdmin(){
  _shopModal('date-night-modal','🎲 Date Night Picker',`
    <div style="display:flex;flex-direction:column;gap:12px">
      <div id="dn-list" style="display:flex;flex-direction:column;gap:8px;max-height:180px;overflow-y:auto">
        ${dateNightIdeas.map((d,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,.04);border-radius:10px"><span style="flex:1;font-size:12px;color:#fff">${d}</span><button class="dev-btn del rw" onclick="dateNightIdeas.splice(${i},1);document.getElementById('date-night-modal').remove();openDateNightAdmin();R(event,this)">🗑️</button></div>`).join('') || '<div style="font-size:12px;color:var(--tx3);text-align:center;padding:8px">No ideas yet</div>'}
      </div>
      <input id="dn-input" placeholder="Add a date idea..." style="width:100%;padding:12px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:14px;font-family:inherit;box-sizing:border-box">
      <button onclick="addDateNightIdea()" class="shop-unlock-btn rw" style="width:100%;padding:14px;font-size:14px">Add Idea</button>
    </div>
  `);
}
function addDateNightIdea(){
  const val = document.getElementById('dn-input').value.trim();
  if(!val){ T('⚠️ Enter a date idea'); return; }
  dateNightIdeas.push(val);
  T('🎲 Idea added!');
  document.getElementById('date-night-modal').remove();
  openDateNightAdmin();
  renderDateNightCard();
  saveState();
}
window.openDateNightAdmin = openDateNightAdmin;
window.addDateNightIdea = addDateNightIdea;
window.renderDateNightCard = renderDateNightCard;

/* ─── DAILY QUESTION ─────────────────────── */
function renderDailyQuestionCard(){
  const configured = !!dailyQuestionData;
  let bodyHTML = null;
  if(configured){
    const today = new Date().toDateString();
    const answered = dailyQuestionData.date === today && dailyQuestionData.answer;
    bodyHTML = `
      <div style="display:flex;flex-direction:column;gap:10px;width:100%">
        <div style="display:flex;align-items:center;gap:8px;width:100%">
          <span class="hfc-ico">💬</span>
          <span class="hfc-title">Daily Question</span>
        </div>
        <div style="font-size:12.5px;color:var(--tx2);line-height:1.5">${dailyQuestionData.question}</div>
        ${answered
          ? `<div style="font-size:11px;color:var(--rose-b);font-style:italic">Answered today ✓</div>`
          : `<div style="display:flex;gap:8px;width:100%">
               <input id="dq-answer" placeholder="Your answer..." style="flex:1;padding:10px 12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:13px;font-family:inherit">
               <button onclick="submitDailyAnswer()" class="shop-unlock-btn rw" style="padding:10px 16px;font-size:12px">Send</button>
             </div>`}`;
  }
  renderHubFeatureCard('daily-question-card', {
    owned: shopDailyQuestion,
    configured: configured,
    ico: '💬',
    title: 'Daily Question',
    pendingText: "Robert hasn't asked a question yet 💤",
    bodyHTML: bodyHTML,
    tappable: !configured
  });
}
function submitDailyAnswer(){
  const ans = document.getElementById('dq-answer').value.trim();
  if(!ans){ T('⚠️ Write an answer first'); return; }
  dailyQuestionData.answer = ans;
  dailyQuestionData.date = new Date().toDateString();
  T('💬 Answer saved!');
  showSuccess('💬','Answer sent!','rgba(100,220,255,.2)');
  renderDailyQuestionCard();
  saveState();
  if(typeof checkAchievements === 'function') checkAchievements();
}
function openDailyQuestionAdmin(){
  _shopModal('daily-question-modal','💬 Daily Question',`
    <div style="display:flex;flex-direction:column;gap:14px">
      <div>
        <label style="font-size:11px;color:var(--tx2);display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em">Question for Ana</label>
        <textarea id="dq-input" placeholder="e.g. What made you smile today?" rows="3" style="width:100%;padding:12px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:14px;font-family:inherit;box-sizing:border-box;resize:none">${dailyQuestionData&&dailyQuestionData.question||''}</textarea>
      </div>
      <button onclick="saveDailyQuestion()" class="shop-unlock-btn rw" style="width:100%;padding:14px;font-size:14px">Set Question</button>
    </div>
  `);
}
function saveDailyQuestion(){
  const q = document.getElementById('dq-input').value.trim();
  if(!q){ T('⚠️ Enter a question'); return; }
  dailyQuestionData = {question:q, answer:null, date:null};
  document.getElementById('daily-question-modal').remove();
  T('💬 Question set!');
  renderDailyQuestionCard();
  saveState();
}
window.openDailyQuestionAdmin = openDailyQuestionAdmin;
window.saveDailyQuestion = saveDailyQuestion;
window.submitDailyAnswer = submitDailyAnswer;
window.renderDailyQuestionCard = renderDailyQuestionCard;


/* ─── PHOTO OF THE DAY ───────────────────── */
function renderPhotoOfDayCard(){
  const configured = !!photoOfDayData;
  let bodyHTML = null;
  if(configured){
    const unlocked = photoOfDayData.unlocked || false;
    bodyHTML = `
      <div style="position:relative;width:100%;height:120px;overflow:hidden;border-radius:12px;margin:4px 0">
        <img src="${photoOfDayData.dataUrl}" style="width:100%;height:100%;object-fit:cover;filter:${unlocked?'none':'blur(16px) brightness(.7)'}">
        ${!unlocked?`<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;cursor:pointer" onclick="unlockPhotoOfDay()">
          <div style="font-size:28px">📸</div>
          <div style="font-size:12px;font-weight:800;color:#fff">Tap to reveal today's photo</div>
        </div>`:`<div style="position:absolute;bottom:8px;right:10px;font-size:10px;color:rgba(255,255,255,.6)">${photoOfDayData.date||''}</div>`}
      </div>`;
  }
  renderHubFeatureCard('photo-day-card', {
    owned: shopPhotoOfDay,
    configured: configured,
    ico: '📸',
    title: 'Photo of the Day',
    pendingText: "Robert hasn't posted a photo yet 💤",
    bodyHTML: bodyHTML,
    tappable: false
  });
}
function unlockPhotoOfDay(){
  if(!photoOfDayData) return;
  photoOfDayData.unlocked = true;
  T('📸 Photo unlocked!');
  showSuccess('📸','Photo revealed!','rgba(255,200,100,.2)');
  renderPhotoOfDayCard();
  saveState();
}
function openPhotoOfDayAdmin(){
  _shopModal('photo-modal','📸 Photo of the Day',`
    <div style="display:flex;flex-direction:column;gap:14px">
      <div>
        <label style="font-size:11px;color:var(--tx2);display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em">Upload photo</label>
        <input id="pod-file" type="file" accept="image/*" style="width:100%;padding:10px 0;color:var(--tx2);font-size:13px;font-family:inherit">
      </div>
      <button onclick="savePhotoOfDay()" class="shop-unlock-btn rw" style="width:100%;padding:14px;font-size:14px">Set Today's Photo</button>
    </div>
  `);
}
function savePhotoOfDay(){
  const file = document.getElementById('pod-file').files[0];
  if(!file){ T('⚠️ Select a photo first'); return; }
  const reader = new FileReader();
  reader.onload = e=>{
    photoOfDayData = {dataUrl:e.target.result, date:new Date().toLocaleDateString(), unlocked:false};
    document.getElementById('photo-modal').remove();
    T('📸 Photo of the day set!');
    renderPhotoOfDayCard();
    saveState();
  };
  reader.readAsDataURL(file);
}
window.openPhotoOfDayAdmin = openPhotoOfDayAdmin;
window.savePhotoOfDay = savePhotoOfDay;
window.unlockPhotoOfDay = unlockPhotoOfDay;
window.renderPhotoOfDayCard = renderPhotoOfDayCard;

/* ─── LUCKY SPIN ─────────────────────────── */
function renderLuckySpinCard(){
  const today = new Date().toDateString();
  const used  = shopLuckySpinLastUsed === today;
  renderHubFeatureCard('lucky-spin-btn', {
    owned: shopLuckySpin,
    configured: !used,
    ico: used ? '✅' : '🎰',
    title: used ? 'Spun today!' : 'Lucky Spin',
    sub: used ? 'Come back tomorrow' : 'Daily spin — win up to 500 pts',
    onClick: used ? null : doLuckySpin
  });
}
function doLuckySpin(){
  const today = new Date().toDateString();
  if(shopLuckySpinLastUsed===today){ T('✅ Already spun today!'); return; }
  // Slot animation overlay
  const prizes = [50,50,50,100,100,200,200,500];
  const won = prizes[Math.floor(Math.random()*prizes.length)];
  const ov = document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:9800;background:rgba(7,0,18,.95);backdrop-filter:blur(20px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px';
  const slots = ['🍒','🍋','💎','⭐','🌸','💰','🎯','🏆'];
  let spins=0;
  const maxSpins=18;
  let a='?', b='?', c='?';
  ov.innerHTML=`
    <div style="font-size:14px;font-weight:800;color:var(--tx2);text-transform:uppercase;letter-spacing:.15em">Lucky Spin</div>
    <div id="slot-display" style="display:flex;gap:16px;padding:28px 30px;background:rgba(255,255,255,.05);border-radius:20px;border:1px solid rgba(255,255,255,.1)">
      <div id="sa" style="font-size:76px;width:84px;text-align:center;line-height:1">🎰</div>
      <div id="sb" style="font-size:76px;width:84px;text-align:center;line-height:1">🎰</div>
      <div id="sc" style="font-size:76px;width:84px;text-align:center;line-height:1">🎰</div>
    </div>
    <div id="spin-result" style="font-size:13px;color:var(--tx2);min-height:20px"></div>`;
  document.body.appendChild(ov);
  const tick = setInterval(()=>{
    spins++;
    document.getElementById('sa').textContent = slots[Math.floor(Math.random()*slots.length)];
    document.getElementById('sb').textContent = slots[Math.floor(Math.random()*slots.length)];
    document.getElementById('sc').textContent = slots[Math.floor(Math.random()*slots.length)];
    if(spins>=maxSpins){
      clearInterval(tick);
      shopLuckySpinLastUsed = today;
      totalLuckySpins++;
      const old = ptsVal; ptsVal += won;
      animatePts(old, ptsVal, 700);
      logPtsChange(won);
      addTxItem('🎰','Lucky Spin win','Just now','+'+won,'earn');
      document.getElementById('spin-result').textContent = '🎉 You won +'+won+' pts!';
      document.getElementById('spin-result').style.cssText='font-size:22px;font-weight:900;color:#fff';
      setTimeout(()=>{ ov.remove(); renderLuckySpinCard(); showSuccess('🎰','+'+won+' pts!','rgba(200,100,255,.2)'); saveState(); },1800);
    }
  }, 80);
}
window.renderLuckySpinCard = renderLuckySpinCard;
window.doLuckySpin = doLuckySpin;

/* ─── PUZZLE OF THE WEEK ─────────────────── */
function renderPuzzleCard(){
  const configured = !!puzzleOfWeekData;
  const solved = configured && puzzleOfWeekData.solved;
  renderHubFeatureCard('puzzle-card', {
    owned: shopPuzzleOfWeek,
    configured: configured,
    ico: solved ? '✅' : '🧩',
    title: solved ? 'Puzzle solved!' : 'Puzzle of the Week',
    sub: solved ? 'Message: "'+puzzleOfWeekData.message+'"' : "Robert hid a secret message — solve it!",
    pendingText: "Robert hasn't hidden a puzzle yet 💤",
    onClick: (configured && !solved) ? openPuzzleForAna : null
  });
}
function openPuzzleForAna(){
  if(!puzzleOfWeekData || puzzleOfWeekData.solved) return;
  // Simple word scramble puzzle
  const msg = puzzleOfWeekData.message.toUpperCase();
  const words = msg.split(' ');
  const scrambled = words.map(w=>w.split('').sort(()=>Math.random()-.5).join('')).join(' ');
  _shopModal('puzzle-play-modal','🧩 Solve the Puzzle',`
    <div style="display:flex;flex-direction:column;gap:16px">
      <div style="text-align:center;padding:16px;background:rgba(100,220,180,.06);border-radius:14px;border:1px solid rgba(100,220,180,.15)">
        <div style="font-size:11px;color:var(--tx3);margin-bottom:8px;text-transform:uppercase;letter-spacing:.1em">Unscramble the message</div>
        <div style="font-size:20px;font-weight:900;color:rgba(100,220,180,.9);letter-spacing:.1em">${scrambled}</div>
      </div>
      <input id="puzzle-ans" placeholder="Your answer..." style="width:100%;padding:12px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:14px;font-family:inherit;box-sizing:border-box;text-transform:uppercase">
      <button onclick="checkPuzzleAnswer()" class="shop-unlock-btn rw" style="width:100%;padding:14px;font-size:14px">Submit Answer</button>
    </div>
  `);
}
function checkPuzzleAnswer(){
  const ans = document.getElementById('puzzle-ans').value.trim().toUpperCase();
  const correct = puzzleOfWeekData.message.toUpperCase();
  if(ans === correct){
    puzzleOfWeekData.solved = true;
    const old = ptsVal; ptsVal += 100;
    animatePts(old, ptsVal, 700);
    logPtsChange(100);
    addTxItem('🧩','Puzzle of the Week solved!','Just now','+100','earn');
    document.getElementById('puzzle-play-modal').remove();
    T('🧩 Correct! +100 pts! Message: "'+puzzleOfWeekData.message+'"');
    showSuccess('🧩','Puzzle Solved!','rgba(100,220,180,.2)');
    renderPuzzleCard();
    saveState();
    if(typeof checkAchievements === 'function') checkAchievements();
  } else {
    T('❌ Not quite — try again!');
    document.getElementById('puzzle-ans').style.borderColor='rgba(224,85,120,.5)';
    setTimeout(()=>{ if(document.getElementById('puzzle-ans')) document.getElementById('puzzle-ans').style.borderColor='rgba(255,255,255,.1)'; },1000);
  }
}
function openPuzzleAdmin(){
  _shopModal('puzzle-admin-modal','🧩 Puzzle of the Week',`
    <div style="display:flex;flex-direction:column;gap:14px">
      <div style="font-size:12px;color:var(--tx2);line-height:1.5">Hide a secret message for Ana. She'll need to unscramble it to reveal your words.</div>
      <div>
        <label style="font-size:11px;color:var(--tx2);display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em">Secret message</label>
        <input id="puz-msg" placeholder="e.g. I love you forever" style="width:100%;padding:12px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:14px;font-family:inherit;box-sizing:border-box">
      </div>
      <button onclick="savePuzzle()" class="shop-unlock-btn rw" style="width:100%;padding:14px;font-size:14px">Hide Message</button>
    </div>
  `);
}
function savePuzzle(){
  const msg = document.getElementById('puz-msg').value.trim();
  if(!msg){ T('⚠️ Enter a message'); return; }
  puzzleOfWeekData = {message:msg, solved:false};
  document.getElementById('puzzle-admin-modal').remove();
  T('🧩 Puzzle set! Ana will need to solve it.');
  renderPuzzleCard();
  saveState();
}
window.openPuzzleAdmin = openPuzzleAdmin;
window.savePuzzle = savePuzzle;
window.openPuzzleForAna = openPuzzleForAna;
window.checkPuzzleAnswer = checkPuzzleAnswer;
window.renderPuzzleCard = renderPuzzleCard;

/* Called by clicker/clicker-script.js (same-origin iframe) at the end of
   every real completed session, via window.parent.reportClickerSession(...).
   This is what makes real Love Clicker achievements possible — before this,
   the game's score lived only in the iframe's own isolated localStorage,
   invisible to the rest of the app. */
function reportClickerSession(finalScore, isNewBest){
  if(typeof finalScore !== 'number' || finalScore < 0) return;
  clickerGamesPlayed++;
  clickerLifetimeScore += finalScore;
  if(finalScore > clickerBestScore) clickerBestScore = finalScore;
  if(typeof saveState === 'function') saveState();
  if(typeof checkAchievements === 'function') checkAchievements();
}
window.reportClickerSession = reportClickerSession;

