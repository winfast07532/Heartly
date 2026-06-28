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
    cost: 800,
    unlocked: false,
    orbs: [[58,65,200],[80,90,210],[50,55,180],[25,30,120],[15,18,80],[8,10,50]],
    bgStops: ['#02052e','#010318','#01010e'],
    accent: '#6b70e0',
    swatches: ['#2c2fa0','#4a50c8','#6b70e0','#9ba0f0','#d4d7ff'],
    desc: 'Midnight blue royalty. Cool, deep, and regal.',
  },
  sakura: {
    name: 'Sakura Pink',
    cost: 600,
    unlocked: false,
    orbs: [[200,80,130],[175,55,105],[155,45,90],[120,30,70],[80,15,50],[50,8,35]],
    bgStops: ['#1e0515','#13030d','#0a0208'],
    accent: '#f07099',
    swatches: ['#b83060','#e05585','#f07099','#f8b0c8','#ffd6e8'],
    desc: 'Soft, delicate sakura blossoms in the dark.',
  },
  golden: {
    name: 'Golden Hour',
    cost: 1000,
    unlocked: false,
    orbs: [[190,110,10],[170,90,8],[150,75,5],[110,55,3],[70,35,2],[45,20,1]],
    bgStops: ['#160c00','#0e0700','#070400'],
    accent: '#f0a030',
    swatches: ['#b86010','#d88020','#f0a030','#f8cc60','#ffe8a0'],
    desc: 'Warm amber and gold. Like a perfect sunset.',
  },
  starlight: {
    name: 'Starlight',
    cost: 1200,
    unlocked: false,
    orbs: [[80,40,160],[100,50,180],[60,30,140],[35,15,100],[20,8,70],[12,4,50]],
    bgStops: ['#0c0420','#070214','#04010e'],
    accent: '#b080f0',
    swatches: ['#5020a0','#7040c0','#9060e0','#b080f0','#d4b0ff'],
    desc: 'Deep cosmic purple. Among the stars.',
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
  saveState();

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

  const themeOrder = ['rose','royal','sakura','golden','starlight'];
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
  // ── UNLOCKS ──
  { id:'robert_mood',    cat:'unlocks',      ico:'💭', name:'Robert\'s Mood',     desc:'See Robert\'s mood on your home screen. He sets it daily from his panel.',            cost:250, stateKey:'shopMood'        },
  { id:'wish_list',      cat:'unlocks',      ico:'✨', name:'Wish List',          desc:'Unlock the Wish List on your home — add dreams, gifts and date ideas for Robert to see.',  cost:300, stateKey:'shopWishList'    },
  { id:'write_to_rob',   cat:'unlocks',      ico:'✍️', name:'Write to Robert',    desc:'Unlock the ability to send Robert personal messages anytime from your home screen.',       cost:200, stateKey:'shopWriteToRob'  },
  // ── BOOSTS ──
  { id:'streak_shield',    cat:'boosts',       ico:'🛡️', name:'Streak Shield',         desc:'If Ana misses a day, her streak is automatically protected. Once per week.',         cost:150,  stateKey:'shopStreakShield'     },
  { id:'daily_bonus',      cat:'boosts',       ico:'⚡', name:'Daily Bonus',            desc:'Unlocks a daily +50 pts tap on Ana\'s home screen. Collect every day.',             cost:200,  stateKey:'shopDailyBonus'      },
  { id:'daily_gift_box',   cat:'boosts',       ico:'🎁', name:'Daily Gift Box',         desc:'A mystery box unlocks every 24 hrs — win between +10 and +200 bonus pts.',         cost:350,  stateKey:'shopDailyGiftBox'    },
  { id:'hot_streak',       cat:'boosts',       ico:'🔥', name:'Hot Streak Bonus',       desc:'When your streak hits 7 days, an automatic +100 pts reward is triggered.',         cost:300,  stateKey:'shopHotStreak'       },
  // ── RELATIONSHIP ──
  { id:'couple_song',      cat:'relationship', ico:'🎵', name:'Couple Song',            desc:'Robert sets your song — title + artist shown on Ana\'s home with a note animation.',cost:600,  stateKey:'shopCoupleSong',     hasConfig:true },
  { id:'anniversary_card', cat:'relationship', ico:'🎂', name:'Anniversary Card',       desc:'A special full-screen celebration card appears on the 10th of every month.',                   cost:700,  stateKey:'shopAnniversaryCard' },
  { id:'memory_jar',       cat:'relationship', ico:'🫙', name:'Memory Jar',             desc:'Robert drops short memories into a jar. Ana shakes to reveal a random one.',        cost:500,  stateKey:'shopMemoryJar'       },
  { id:'love_map',         cat:'relationship', ico:'📍', name:'Love Map',               desc:'Robert pins special places on a map — first date, first trip, favourites.',         cost:900,  stateKey:'shopLoveMap',        hasConfig:true },
  { id:'countdown_timer',  cat:'relationship', ico:'📅', name:'Countdown Timer',        desc:'Robert sets a date — a trip, anniversary, or event. Ana sees it counting down.',   cost:400,  stateKey:'shopCountdown',      hasConfig:true },
  { id:'good_night',       cat:'relationship', ico:'🌙', name:'Good Night Mode',        desc:'Robert sets a time. A soft goodnight card appears on Ana\'s screen every night.',  cost:350,  stateKey:'shopGoodNight',      hasConfig:true },
  { id:'couple_goals',     cat:'relationship', ico:'💑', name:'Couple Goals',           desc:'Robert sets shared goals together. Ana marks progress as each one is reached.',     cost:600,  stateKey:'shopCoupleGoals',    hasConfig:true },
  { id:'date_night',       cat:'relationship', ico:'🎲', name:'Date Night Picker',      desc:'Robert adds date ideas to a list. Ana spins to get a random surprise pick.',       cost:450,  stateKey:'shopDateNight',      hasConfig:true },
  { id:'daily_question',   cat:'relationship', ico:'💬', name:'Daily Question',         desc:'Robert sets a question for Ana. She answers privately — only Robert can read it.',  cost:400,  stateKey:'shopDailyQuestion',  hasConfig:true },
  { id:'flower_delivery',  cat:'relationship', ico:'🌹', name:'Flower Delivery',        desc:'Robert sends Ana a virtual bouquet with a personal note she opens like a gift.',    cost:300,  stateKey:'shopFlowerDelivery', hasConfig:true },
  { id:'photo_of_day',     cat:'relationship', ico:'📸', name:'Photo of the Day',       desc:'Robert drops a daily photo. Ana sees it blurred — tap to unlock and reveal.',      cost:600,  stateKey:'shopPhotoOfDay',     hasConfig:true },
  { id:'milestones',       cat:'relationship', ico:'🏆', name:'Relationship Milestones',desc:'Earn badges for 1 month, 6 months, 1 year and beyond. Displayed on your profile.', cost:500,  stateKey:'shopMilestones'      },
  // ── GAMES & FUN ──
  { id:'lucky_spin',       cat:'games',        ico:'🎰', name:'Lucky Spin',             desc:'A slot-machine daily spin for bonus pts. Could win 50, 100, 200 or even 500 pts.', cost:450,  stateKey:'shopLuckySpin'       },
  { id:'puzzle_of_week',   cat:'games',        ico:'🧩', name:'Puzzle of the Week',     desc:'Robert hides a secret message in a weekly word puzzle. Ana must solve it to read.', cost:600, stateKey:'shopPuzzleOfWeek',   hasConfig:true },
  { id:'mini_challenge',   cat:'games',        ico:'🎪', name:'Mini Challenge',         desc:'Robert sets Ana a fun daily challenge. Complete it to earn bonus pts reward.',      cost:400,  stateKey:'shopMiniChallenge',  hasConfig:true },
];

const CAT_LABELS = { boosts:'⚡ Boosts', relationship:'💕 Relationship', games:'🎮 Games & Fun' };

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
  window[item.stateKey] = true;
  addTxItem(item.ico, item.name+' unlocked', 'Just now', '-'+item.cost, 'spend');
  T(item.ico+' '+item.name+' unlocked!');

  renderShopItems();
  applyShopUnlocks();
  // Update dev pts display
  if(typeof updateDevPtsDisplay==='function') updateDevPtsDisplay();
  saveState();
}
window.shopBuyItem = shopBuyItem;

function shopConfigure(id){
  if(id==='couple_song'){
    const title  = prompt('Song title:');   if(!title)  return;
    const artist = prompt('Artist name:');  if(!artist) return;
    shopCoupleSong = {title:title.trim(), artist:artist.trim()};
    T('🎵 Couple song set: '+shopCoupleSong.title);
    renderCoupleSong();
    saveState();
  }
  if(id==='love_map'){ openLoveMapAdmin(); }
  if(id==='countdown_timer'){ openCountdownAdmin(); }
  if(id==='voice_note'){ openVoiceNoteAdmin(); }
  if(id==='good_night'){ openGoodNightAdmin(); }
  if(id==='couple_goals'){ openCoupleGoalsAdmin(); }
  if(id==='memory_timeline'){ openMemoryTimelineAdmin(); }
  if(id==='date_night'){ openDateNightAdmin(); }
  if(id==='daily_question'){ openDailyQuestionAdmin(); }
  if(id==='playlist_builder'){ openPlaylistAdmin(); }
  if(id==='flower_delivery'){ openFlowerDeliveryAdmin(); }
  if(id==='photo_of_day'){ openPhotoOfDayAdmin(); }
  if(id==='puzzle_of_week'){ openPuzzleAdmin(); }
  if(id==='mini_challenge'){ openMiniChallengeAdmin(); }
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
  renderVoiceNoteCard();
  renderGoodNightCard();
  renderCoupleGoalsCard();
  renderMemoryTimelineCard();
  renderDateNightCard();
  renderDailyQuestionCard();
  renderPlaylistCard();
  renderFlowerCard();
  renderPhotoOfDayCard();
  renderMilestonesCard();
  renderLuckySpinCard();
  renderPuzzleCard();
  renderMiniChallengeCard();
}
window.applyShopUnlocks = applyShopUnlocks;

function renderCoupleSong(){
  const existing = document.getElementById('couple-song-card');
  if(existing) existing.remove();

  const sub = document.getElementById('sett-couple-song-sub');
  if(sub){
    if(shopCoupleSong && shopCoupleSong.title){
      sub.textContent = shopCoupleSong.title + (shopCoupleSong.artist ? ' — ' + shopCoupleSong.artist : '');
    } else {
      sub.textContent = 'Set your relationship anthem';
    }
  }

  if(!shopCoupleSong || !shopCoupleSong.title) return;

  // Insert on Ana's home after Robert mood card
  const moodCard = document.getElementById('rob-mood-home-card');
  if(!moodCard) return;
  const card = document.createElement('div');
  card.id = 'couple-song-card';
  card.className = 'couple-song-card rw';
  card.onclick = ()=>T('🎵 '+shopCoupleSong.title+' — '+shopCoupleSong.artist);
  card.innerHTML = `
    <div class="couple-song-note">🎵</div>
    <div class="couple-song-info">
      <div class="couple-song-title">${shopCoupleSong.title}</div>
      <div class="couple-song-artist">${shopCoupleSong.artist}</div>
    </div>`;
  moodCard.after(card);
}

function renderDailyBonus(){
  const existing = document.getElementById('daily-bonus-btn');
  if(existing) existing.remove();
  if(!shopDailyBonus) return;

  const today = new Date().toDateString();
  const claimed = shopDailyBonusLastClaimed === today;

  const writeBtn = document.getElementById('home-hub-dynamic');
  if(!writeBtn) return;

  const btn = document.createElement('button');
  btn.id = 'daily-bonus-btn';
  btn.className = 'write-to-rob-btn rw';
  btn.style.cssText = 'border-color:rgba(110,232,180,.22);opacity:'+(claimed?'.45':'1');
  btn.disabled = claimed;
  btn.onclick = claimed ? null : function(e){ claimDailyBonus(); R(e,this); };
  btn.innerHTML = `
    <div class="write-to-rob-btn-ico">${claimed?'✅':'⚡'}</div>
    <div class="write-to-rob-btn-lbl">
      <div class="write-to-rob-btn-title" style="color:rgba(110,232,180,.95)">${claimed?'Bonus claimed!':'Daily Bonus'}</div>
      <div class="write-to-rob-btn-sub" style="color:rgba(110,232,180,.5)">${claimed?'Come back tomorrow':'+50 pts — tap to claim'}</div>
    </div>`;
  writeBtn.appendChild(btn);
}

function claimDailyBonus(){
  const today = new Date().toDateString();
  if(shopDailyBonusLastClaimed === today){ T('✅ Already claimed today!'); return; }
  shopDailyBonusLastClaimed = today;
  const old = ptsVal;
  ptsVal += 50;
  animatePts(old, ptsVal, 600);
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
  if(typeof spawnConfetti==='function') spawnConfetti();
}

// Memory Jar — Robert adds, Ana shakes
function addMemory(text){
  if(!text||!text.trim()) return;
  const now = new Date();
  memoryJarItems.unshift({text:text.trim(), date:now.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})});
  T('🫙 Memory added to the jar!');
  renderRobMemoryJar();
  saveState();
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

function openLoveMapAdmin(){
  const emoji = prompt('Place emoji (e.g. 🍽️ 🏖️ ✈️):') || '📍';
  if(!emoji.trim()) return;
  const label = prompt('Place name (e.g. "First Date — Lucia\'s"):');
  if(!label||!label.trim()) return;
  const desc  = prompt('Short description (optional):') || '';
  const date  = prompt('Date (e.g. "Aug 10, 2024", optional):') || '';
  loveMapPins.unshift({ emoji:emoji.trim().slice(0,4), label:label.trim(), desc:desc.trim(), date:date.trim() });
  renderRobLoveMap();
  renderLoveMap();
  T('📍 Pin added: '+label.trim());
  showSuccess('📍','Pin added!','rgba(224,85,120,.2)');
  saveState();
}
window.openLoveMapAdmin = openLoveMapAdmin;

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
  const existing = document.getElementById('daily-gift-btn');
  if(existing) existing.remove();
  if(!shopDailyGiftBox) return;
  const today = new Date().toDateString();
  const claimed = shopDailyGiftLastClaimed === today;
  const writeBtn = document.getElementById('home-hub-dynamic');
  if(!writeBtn) return;
  const btn = document.createElement('button');
  btn.id = 'daily-gift-btn';
  btn.className = 'write-to-rob-btn rw';
  btn.style.cssText = 'border-color:rgba(255,195,80,.22);opacity:'+(claimed?'.45':'1');
  btn.disabled = claimed;
  btn.onclick = claimed ? null : function(e){ claimDailyGift(); R(e,this); };
  btn.innerHTML = `
    <div class="write-to-rob-btn-ico">${claimed?'✅':'🎁'}</div>
    <div class="write-to-rob-btn-lbl">
      <div class="write-to-rob-btn-title" style="color:rgba(255,195,80,.95)">${claimed?'Gift opened!':'Daily Gift Box'}</div>
      <div class="write-to-rob-btn-sub" style="color:rgba(255,195,80,.5)">${claimed?'Come back tomorrow':'Mystery pts — tap to open'}</div>
    </div>`;
  writeBtn.appendChild(btn);
}
function claimDailyGift(){
  const today = new Date().toDateString();
  if(shopDailyGiftLastClaimed===today){ T('✅ Already opened today!'); return; }
  shopDailyGiftLastClaimed = today;
  const prizes = [10,20,30,50,50,75,100,100,150,200];
  const won = prizes[Math.floor(Math.random()*prizes.length)];
  const old = ptsVal; ptsVal += won;
  animatePts(old, ptsVal, 700);
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
    addTxItem('🔥','Hot Streak Bonus — 7 day streak!','Just now','+100','earn');
    T('🔥 Hot Streak! +100 bonus pts!');
    showSuccess('🔥','Streak Bonus!','rgba(255,120,50,.2)');
    saveState();
  }
}
window.checkHotStreak = checkHotStreak;

/* ─── COUNTDOWN TIMER ────────────────────── */
function renderCountdownCard(){
  const existing = document.getElementById('countdown-card');
  if(existing) existing.remove();
  if(!shopCountdown || !shopCountdownData) return;
  const target = new Date(shopCountdownData.date);
  const now = new Date();
  const diff = target - now;
  if(diff < 0) return;
  const days = Math.floor(diff/(1000*60*60*24));
  const hrs  = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
  const mins = Math.floor((diff%(1000*60*60))/(1000*60));
  const moodCard = document.getElementById('rob-mood-home-card');
  if(!moodCard) return;
  const card = document.createElement('div');
  card.id = 'countdown-card';
  card.className = 'couple-song-card rw';
  card.style.cssText = 'border-color:rgba(100,200,255,.18);background:rgba(100,200,255,.05)';
  card.innerHTML = `
    <div class="couple-song-note" style="font-size:22px">📅</div>
    <div class="couple-song-info">
      <div class="couple-song-title">${shopCountdownData.label}</div>
      <div class="couple-song-artist">${days}d ${hrs}h ${mins}m to go</div>
    </div>`;
  moodCard.after(card);
  // live tick
  clearInterval(window._countdownTick);
  window._countdownTick = setInterval(renderCountdownCard, 60000);
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
function renderVoiceNoteCard(){
  const existing = document.getElementById('voice-note-card');
  if(existing) existing.remove();
  if(!shopVoiceNote || !shopVoiceNoteData) return;
  const moodCard = document.getElementById('rob-mood-home-card');
  if(!moodCard) return;
  const card = document.createElement('div');
  card.id = 'voice-note-card';
  card.className = 'couple-song-card rw';
  card.style.cssText = 'border-color:rgba(255,150,200,.18);background:rgba(255,150,200,.05);cursor:pointer';
  card.onclick = ()=>{ const a=new Audio(shopVoiceNoteData.dataUrl); a.play(); T('🎤 Playing voice note...'); };
  card.innerHTML = `
    <div class="couple-song-note" style="font-size:22px">🎤</div>
    <div class="couple-song-info">
      <div class="couple-song-title">${shopVoiceNoteData.label||'Voice Note from Robert'}</div>
      <div class="couple-song-artist">Tap to play</div>
    </div>`;
  moodCard.after(card);
}
function openVoiceNoteAdmin(){
  _shopModal('voicenote-modal','🎤 Voice Note',`
    <div style="display:flex;flex-direction:column;gap:14px">
      <div>
        <label style="font-size:11px;color:var(--tx2);display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em">Note label</label>
        <input id="vn-label" placeholder="e.g. Good morning love" style="width:100%;padding:12px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:14px;font-family:inherit;box-sizing:border-box">
      </div>
      <div>
        <label style="font-size:11px;color:var(--tx2);display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em">Upload audio file</label>
        <input id="vn-file" type="file" accept="audio/*" style="width:100%;padding:10px 0;color:var(--tx2);font-size:13px;font-family:inherit">
      </div>
      <button onclick="saveVoiceNote()" class="shop-unlock-btn rw" style="margin-top:4px;width:100%;padding:14px;font-size:14px">Save Voice Note</button>
    </div>
  `);
}
function saveVoiceNote(){
  const label = document.getElementById('vn-label').value.trim();
  const file  = document.getElementById('vn-file').files[0];
  if(!file){ T('⚠️ Please select an audio file'); return; }
  const reader = new FileReader();
  reader.onload = e=>{
    shopVoiceNoteData = {label:label||'Voice Note', dataUrl:e.target.result};
    document.getElementById('voicenote-modal').remove();
    T('🎤 Voice note saved!');
    renderVoiceNoteCard();
    saveState();
  };
  reader.readAsDataURL(file);
}
window.openVoiceNoteAdmin = openVoiceNoteAdmin;
window.saveVoiceNote = saveVoiceNote;
window.renderVoiceNoteCard = renderVoiceNoteCard;

/* ─── GOOD NIGHT MODE ────────────────────── */
function renderGoodNightCard(){
  // Just set up the interval check; actual card shows at the set time
  clearInterval(window._goodNightCheck);
  if(!shopGoodNight) return;
  function check(){
    if(!shopGoodNight) return;
    const [h,m] = shopGoodNightTime.split(':').map(Number);
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
  const existing = document.getElementById('couple-goals-card');
  if(existing) existing.remove();
  if(!shopCoupleGoals || !coupleGoalsList.length) return;
  const moodCard = document.getElementById('rob-mood-home-card');
  if(!moodCard) return;
  const done = coupleGoalsList.filter(g=>g.done).length;
  const card = document.createElement('div');
  card.id = 'couple-goals-card';
  card.className = 'couple-song-card rw';
  card.style.cssText = 'flex-direction:column;align-items:flex-start;gap:10px;padding:16px;border-color:rgba(255,180,80,.18);background:rgba(255,180,80,.04)';
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;width:100%">
      <span style="font-size:20px">💑</span>
      <span style="font-size:13px;font-weight:800;color:#fff;flex:1">Couple Goals</span>
      <span style="font-size:11px;color:rgba(255,180,80,.7)">${done}/${coupleGoalsList.length} done</span>
    </div>
    ${coupleGoalsList.slice(0,3).map((g,i)=>`
      <div style="display:flex;align-items:center;gap:8px;width:100%;cursor:pointer" onclick="toggleGoal(${i})">
        <div style="width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,180,80,.4);display:flex;align-items:center;justify-content:center;flex-shrink:0;background:${g.done?'rgba(255,180,80,.3)':'transparent'}">
          ${g.done?'<div style="width:8px;height:8px;background:rgba(255,180,80,.9);border-radius:50%"></div>':''}
        </div>
        <span style="font-size:12px;color:${g.done?'var(--tx3)':'var(--tx2)'};text-decoration:${g.done?'line-through':'none'}">${g.text}</span>
      </div>`).join('')}`;
  moodCard.after(card);
}
function toggleGoal(i){
  if(!coupleGoalsList[i]) return;
  coupleGoalsList[i].done = !coupleGoalsList[i].done;
  if(coupleGoalsList[i].done){ T('💑 Goal achieved: '+coupleGoalsList[i].text); showSuccess('💑','Goal Achieved!','rgba(255,180,80,.2)'); }
  renderCoupleGoalsCard();
  saveState();
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
function renderMemoryTimelineCard(){
  const existing = document.getElementById('memory-timeline-card');
  if(existing) existing.remove();
  if(!shopMemoryTimeline || !memoryTimelineItems.length) return;
  const moodCard = document.getElementById('rob-mood-home-card');
  if(!moodCard) return;
  const card = document.createElement('div');
  card.id = 'memory-timeline-card';
  card.className = 'couple-song-card rw';
  card.style.cssText = 'flex-direction:column;align-items:flex-start;gap:0;padding:16px;border-color:rgba(200,150,255,.18);background:rgba(200,150,255,.04)';
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;width:100%;margin-bottom:12px">
      <span style="font-size:20px">🗓️</span>
      <span style="font-size:13px;font-weight:800;color:#fff">Memory Timeline</span>
    </div>
    <div style="width:100%;overflow-x:auto;display:flex;gap:0;padding-bottom:4px">
      ${memoryTimelineItems.map((m,i)=>`
        <div style="display:flex;flex-direction:column;align-items:center;min-width:80px;padding:0 4px">
          <div style="width:10px;height:10px;border-radius:50%;background:var(--rose,#e05578);margin-bottom:6px;flex-shrink:0"></div>
          ${i<memoryTimelineItems.length-1?`<div style="position:absolute;width:76px;height:2px;background:rgba(200,150,255,.2);margin-top:4px"></div>`:''}
          <div style="font-size:10px;font-weight:800;color:#fff;text-align:center;line-height:1.3">${m.title}</div>
          <div style="font-size:9px;color:var(--tx3);text-align:center;margin-top:2px">${m.date}</div>
        </div>`).join('')}
    </div>`;
  moodCard.after(card);
}
function openMemoryTimelineAdmin(){
  _shopModal('memory-timeline-modal','🗓️ Memory Timeline',`
    <div style="display:flex;flex-direction:column;gap:12px">
      <div id="mt-list" style="display:flex;flex-direction:column;gap:8px;max-height:180px;overflow-y:auto">
        ${memoryTimelineItems.map((m,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,.04);border-radius:10px"><div style="flex:1"><div style="font-size:12px;font-weight:700;color:#fff">${m.title}</div><div style="font-size:10px;color:var(--tx3)">${m.date}</div></div><button class="dev-btn del rw" onclick="memoryTimelineItems.splice(${i},1);document.getElementById('memory-timeline-modal').remove();openMemoryTimelineAdmin();R(event,this)">🗑️</button></div>`).join('') || '<div style="font-size:12px;color:var(--tx3);text-align:center;padding:8px">No milestones yet</div>'}
      </div>
      <input id="mt-title" placeholder="Milestone title (e.g. First date)" style="width:100%;padding:12px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:14px;font-family:inherit;box-sizing:border-box">
      <input id="mt-date" placeholder="Date (e.g. Aug 10, 2023)" style="width:100%;padding:12px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:14px;font-family:inherit;box-sizing:border-box">
      <button onclick="addTimelineMilestone()" class="shop-unlock-btn rw" style="width:100%;padding:14px;font-size:14px">Add Milestone</button>
    </div>
  `);
}
function addTimelineMilestone(){
  const title = document.getElementById('mt-title').value.trim();
  const date  = document.getElementById('mt-date').value.trim();
  if(!title){ T('⚠️ Enter a title'); return; }
  memoryTimelineItems.push({title, date:date||''});
  T('🗓️ Milestone added!');
  document.getElementById('memory-timeline-modal').remove();
  openMemoryTimelineAdmin();
  renderMemoryTimelineCard();
  saveState();
}
window.openMemoryTimelineAdmin = openMemoryTimelineAdmin;
window.addTimelineMilestone = addTimelineMilestone;
window.renderMemoryTimelineCard = renderMemoryTimelineCard;

/* ─── DATE NIGHT PICKER ──────────────────── */
function renderDateNightCard(){
  const existing = document.getElementById('date-night-card');
  if(existing) existing.remove();
  if(!shopDateNight || !dateNightIdeas.length) return;
  const moodCard = document.getElementById('rob-mood-home-card');
  if(!moodCard) return;
  const card = document.createElement('div');
  card.id = 'date-night-card';
  card.className = 'couple-song-card rw';
  card.style.cssText = 'border-color:rgba(255,100,150,.18);background:rgba(255,100,150,.04);cursor:pointer';
  card.onclick = ()=>{
    const pick = dateNightIdeas[Math.floor(Math.random()*dateNightIdeas.length)];
    T('🎲 Date Night: '+pick);
    card.querySelector('.couple-song-artist').textContent = pick;
  };
  card.innerHTML = `
    <div class="couple-song-note" style="font-size:22px">🎲</div>
    <div class="couple-song-info">
      <div class="couple-song-title">Date Night Picker</div>
      <div class="couple-song-artist">Tap to spin a date idea</div>
    </div>`;
  moodCard.after(card);
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
  const existing = document.getElementById('daily-question-card');
  if(existing) existing.remove();
  if(!shopDailyQuestion || !dailyQuestionData) return;
  const moodCard = document.getElementById('rob-mood-home-card');
  if(!moodCard) return;
  const today = new Date().toDateString();
  const answered = dailyQuestionData.date === today && dailyQuestionData.answer;
  const card = document.createElement('div');
  card.id = 'daily-question-card';
  card.className = 'couple-song-card rw';
  card.style.cssText = 'flex-direction:column;align-items:flex-start;gap:10px;padding:16px;border-color:rgba(100,220,255,.18);background:rgba(100,220,255,.04)';
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;width:100%">
      <span style="font-size:20px">💬</span>
      <span style="font-size:13px;font-weight:800;color:#fff;flex:1">Daily Question</span>
    </div>
    <div style="font-size:12.5px;color:var(--tx2);line-height:1.5">${dailyQuestionData.question}</div>
    ${answered
      ? `<div style="font-size:11px;color:rgba(100,220,255,.7);font-style:italic">Answered today ✓</div>`
      : `<div style="display:flex;gap:8px;width:100%">
           <input id="dq-answer" placeholder="Your answer..." style="flex:1;padding:10px 12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:13px;font-family:inherit">
           <button onclick="submitDailyAnswer()" class="shop-unlock-btn rw" style="padding:10px 16px;font-size:12px">Send</button>
         </div>`}`;
  moodCard.after(card);
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

/* ─── PLAYLIST BUILDER ───────────────────── */
function renderPlaylistCard(){
  const existing = document.getElementById('playlist-card');
  if(existing) existing.remove();
  if(!shopPlaylist || !playlistItems.length) return;
  const moodCard = document.getElementById('rob-mood-home-card');
  if(!moodCard) return;
  const card = document.createElement('div');
  card.id = 'playlist-card';
  card.className = 'couple-song-card rw';
  card.style.cssText = 'flex-direction:column;align-items:flex-start;gap:8px;padding:16px;border-color:rgba(150,255,150,.18);background:rgba(150,255,150,.04)';
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;width:100%">
      <span style="font-size:20px">🎵</span>
      <span style="font-size:13px;font-weight:800;color:#fff">Our Playlist</span>
      <span style="font-size:10px;color:var(--tx3);margin-left:auto">${playlistItems.length} tracks</span>
    </div>
    ${playlistItems.slice(0,4).map(t=>`
      <div style="display:flex;align-items:center;gap:8px;width:100%">
        <div style="width:6px;height:6px;border-radius:50%;background:rgba(150,255,150,.6);flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:11px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.title}</div>
          <div style="font-size:10px;color:var(--tx3)">${t.artist}</div>
        </div>
      </div>`).join('')}`;
  moodCard.after(card);
}
function openPlaylistAdmin(){
  _shopModal('playlist-modal','🎵 Playlist Builder',`
    <div style="display:flex;flex-direction:column;gap:12px">
      <div id="pl-list" style="display:flex;flex-direction:column;gap:6px;max-height:160px;overflow-y:auto">
        ${playlistItems.map((t,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,.04);border-radius:10px"><div style="flex:1"><div style="font-size:12px;font-weight:700;color:#fff">${t.title}</div><div style="font-size:10px;color:var(--tx3)">${t.artist}</div></div><button class="dev-btn del rw" onclick="playlistItems.splice(${i},1);document.getElementById('playlist-modal').remove();openPlaylistAdmin();R(event,this)">🗑️</button></div>`).join('') || '<div style="font-size:12px;color:var(--tx3);text-align:center;padding:8px">No tracks yet</div>'}
      </div>
      <input id="pl-title" placeholder="Song title" style="width:100%;padding:12px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:14px;font-family:inherit;box-sizing:border-box">
      <input id="pl-artist" placeholder="Artist" style="width:100%;padding:12px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:14px;font-family:inherit;box-sizing:border-box">
      <button onclick="addPlaylistTrack()" class="shop-unlock-btn rw" style="width:100%;padding:14px;font-size:14px">Add Track</button>
    </div>
  `);
}
function addPlaylistTrack(){
  const title  = document.getElementById('pl-title').value.trim();
  const artist = document.getElementById('pl-artist').value.trim();
  if(!title){ T('⚠️ Enter a song title'); return; }
  playlistItems.push({title, artist:artist||''});
  T('🎵 Track added!');
  document.getElementById('playlist-modal').remove();
  openPlaylistAdmin();
  renderPlaylistCard();
  saveState();
}
window.openPlaylistAdmin = openPlaylistAdmin;
window.addPlaylistTrack = addPlaylistTrack;
window.renderPlaylistCard = renderPlaylistCard;

/* ─── FLOWER DELIVERY ────────────────────── */
function renderFlowerCard(){
  const existing = document.getElementById('flower-card');
  if(existing) existing.remove();
  if(!shopFlowerDelivery) return;
  const unread = flowerDeliveries.filter(f=>!f.seen);
  if(!unread.length) return;
  const latest = unread[0];
  const moodCard = document.getElementById('rob-mood-home-card');
  if(!moodCard) return;
  const card = document.createElement('div');
  card.id = 'flower-card';
  card.className = 'couple-song-card rw';
  card.style.cssText = 'border-color:rgba(255,100,180,.22);background:rgba(255,100,180,.06);cursor:pointer';
  card.onclick = ()=>{
    latest.seen = true;
    card.style.opacity='0.5';
    T('🌹 '+latest.note);
    showSuccess('🌹','Flowers from Robert!','rgba(255,100,180,.2)');
    saveState();
    setTimeout(renderFlowerCard, 800);
  };
  card.innerHTML = `
    <div class="couple-song-note" style="font-size:28px">🌹</div>
    <div class="couple-song-info">
      <div class="couple-song-title">Robert sent you flowers</div>
      <div class="couple-song-artist">Tap to open your bouquet</div>
    </div>`;
  moodCard.after(card);
}
function openFlowerDeliveryAdmin(){
  _shopModal('flower-modal','🌹 Flower Delivery',`
    <div style="display:flex;flex-direction:column;gap:14px">
      <div>
        <label style="font-size:11px;color:var(--tx2);display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em">Your note to Ana</label>
        <textarea id="fl-note" placeholder="e.g. These are for you, always..." rows="3" style="width:100%;padding:12px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:14px;font-family:inherit;box-sizing:border-box;resize:none"></textarea>
      </div>
      <button onclick="sendFlowers()" class="shop-unlock-btn rw" style="width:100%;padding:14px;font-size:14px">Send Bouquet 🌹</button>
    </div>
  `);
}
function sendFlowers(){
  const note = document.getElementById('fl-note').value.trim();
  if(!note){ T('⚠️ Write a note first'); return; }
  flowerDeliveries.unshift({note, date:new Date().toLocaleDateString(), seen:false});
  document.getElementById('flower-modal').remove();
  T('🌹 Bouquet sent to Ana!');
  showSuccess('🌹','Flowers sent!','rgba(255,100,180,.2)');
  renderFlowerCard();
  saveState();
}
window.openFlowerDeliveryAdmin = openFlowerDeliveryAdmin;
window.sendFlowers = sendFlowers;
window.renderFlowerCard = renderFlowerCard;

/* ─── PHOTO OF THE DAY ───────────────────── */
function renderPhotoOfDayCard(){
  const existing = document.getElementById('photo-day-card');
  if(existing) existing.remove();
  if(!shopPhotoOfDay || !photoOfDayData) return;
  const moodCard = document.getElementById('rob-mood-home-card');
  if(!moodCard) return;
  const card = document.createElement('div');
  card.id = 'photo-day-card';
  card.className = 'couple-song-card rw';
  card.style.cssText = 'padding:0;overflow:hidden;border-color:rgba(255,200,100,.18)';
  let unlocked = photoOfDayData.unlocked || false;
  card.innerHTML = `
    <div style="position:relative;width:100%;height:120px;overflow:hidden;border-radius:inherit">
      <img src="${photoOfDayData.dataUrl}" style="width:100%;height:100%;object-fit:cover;filter:${unlocked?'none':'blur(16px) brightness(.7)'}">
      ${!unlocked?`<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;cursor:pointer" onclick="unlockPhotoOfDay()">
        <div style="font-size:28px">📸</div>
        <div style="font-size:12px;font-weight:800;color:#fff">Tap to reveal today's photo</div>
      </div>`:`<div style="position:absolute;bottom:8px;right:10px;font-size:10px;color:rgba(255,255,255,.6)">${photoOfDayData.date||''}</div>`}
    </div>`;
  moodCard.after(card);
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

/* ─── RELATIONSHIP MILESTONES ────────────── */
const MILESTONE_DEFS = [
  {id:'m1mo',  label:'1 Month',  months:1,  ico:'💕'},
  {id:'m3mo',  label:'3 Months', months:3,  ico:'🌸'},
  {id:'m6mo',  label:'6 Months', months:6,  ico:'✨'},
  {id:'m1yr',  label:'1 Year',   months:12, ico:'🎂'},
  {id:'m2yr',  label:'2 Years',  months:24, ico:'💍'},
  {id:'m5yr',  label:'5 Years',  months:60, ico:'👑'},
];
function renderMilestonesCard(){
  const existing = document.getElementById('milestones-card');
  if(existing) existing.remove();
  if(!shopMilestones) return;
  const moodCard = document.getElementById('rob-mood-home-card');
  if(!moodCard) return;
  // Start date: Aug 10, 2024
  const start = new Date('2024-08-10');
  const now   = new Date();
  const monthsAgo = (now.getFullYear()-start.getFullYear())*12 + now.getMonth()-start.getMonth();
  const earned = MILESTONE_DEFS.filter(m=>monthsAgo>=m.months);
  if(!earned.length) return;
  const card = document.createElement('div');
  card.id = 'milestones-card';
  card.className = 'couple-song-card rw';
  card.style.cssText = 'flex-direction:column;align-items:flex-start;gap:10px;padding:16px;border-color:rgba(255,220,80,.18);background:rgba(255,220,80,.04)';
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;width:100%">
      <span style="font-size:20px">🏆</span>
      <span style="font-size:13px;font-weight:800;color:#fff">Relationship Milestones</span>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      ${earned.map(m=>`
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 14px;background:rgba(255,220,80,.08);border:1px solid rgba(255,220,80,.18);border-radius:14px">
          <div style="font-size:24px">${m.ico}</div>
          <div style="font-size:10px;font-weight:800;color:rgba(255,220,80,.9)">${m.label}</div>
        </div>`).join('')}
    </div>`;
  moodCard.after(card);
}
window.renderMilestonesCard = renderMilestonesCard;

/* ─── LUCKY SPIN ─────────────────────────── */
function renderLuckySpinCard(){
  const existing = document.getElementById('lucky-spin-btn');
  if(existing) existing.remove();
  if(!shopLuckySpin) return;
  const today = new Date().toDateString();
  const used  = shopLuckySpinLastUsed === today;
  const writeBtn = document.getElementById('home-hub-dynamic');
  if(!writeBtn) return;
  const btn = document.createElement('button');
  btn.id = 'lucky-spin-btn';
  btn.className = 'write-to-rob-btn rw';
  btn.style.cssText = 'border-color:rgba(200,100,255,.22);opacity:'+(used?'.45':'1');
  btn.disabled = used;
  btn.onclick = used ? null : function(e){ doLuckySpin(); R(e,this); };
  btn.innerHTML = `
    <div class="write-to-rob-btn-ico">${used?'✅':'🎰'}</div>
    <div class="write-to-rob-btn-lbl">
      <div class="write-to-rob-btn-title" style="color:rgba(200,100,255,.95)">${used?'Spun today!':'Lucky Spin'}</div>
      <div class="write-to-rob-btn-sub" style="color:rgba(200,100,255,.5)">${used?'Come back tomorrow':'Daily spin — win up to 500 pts'}</div>
    </div>`;
  writeBtn.appendChild(btn);
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
    <div id="slot-display" style="display:flex;gap:16px;padding:24px 32px;background:rgba(255,255,255,.05);border-radius:20px;border:1px solid rgba(255,255,255,.1)">
      <div id="sa" style="font-size:48px;width:56px;text-align:center">🎰</div>
      <div id="sb" style="font-size:48px;width:56px;text-align:center">🎰</div>
      <div id="sc" style="font-size:48px;width:56px;text-align:center">🎰</div>
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
      const old = ptsVal; ptsVal += won;
      animatePts(old, ptsVal, 700);
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
  const existing = document.getElementById('puzzle-card');
  if(existing) existing.remove();
  if(!shopPuzzleOfWeek || !puzzleOfWeekData) return;
  const writeBtn = document.getElementById('home-hub-dynamic');
  if(!writeBtn) return;
  const btn = document.createElement('button');
  btn.id = 'puzzle-card';
  btn.className = 'write-to-rob-btn rw';
  btn.style.cssText = 'border-color:rgba(100,220,180,.22);'+(puzzleOfWeekData.solved?'opacity:.5':'');
  btn.onclick = puzzleOfWeekData.solved ? null : function(e){ openPuzzleForAna(); R(e,this); };
  btn.innerHTML = `
    <div class="write-to-rob-btn-ico">${puzzleOfWeekData.solved?'✅':'🧩'}</div>
    <div class="write-to-rob-btn-lbl">
      <div class="write-to-rob-btn-title" style="color:rgba(100,220,180,.95)">${puzzleOfWeekData.solved?'Puzzle solved!':'Puzzle of the Week'}</div>
      <div class="write-to-rob-btn-sub" style="color:rgba(100,220,180,.5)">${puzzleOfWeekData.solved?'Robert hid: "'+puzzleOfWeekData.message+'"':'Robert hid a secret message — solve it!'}</div>
    </div>`;
  writeBtn.appendChild(btn);
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
    addTxItem('🧩','Puzzle of the Week solved!','Just now','+100','earn');
    document.getElementById('puzzle-play-modal').remove();
    T('🧩 Correct! +100 pts! Message: "'+puzzleOfWeekData.message+'"');
    showSuccess('🧩','Puzzle Solved!','rgba(100,220,180,.2)');
    renderPuzzleCard();
    saveState();
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

/* ─── MINI CHALLENGE ─────────────────────── */
function renderMiniChallengeCard(){
  const existing = document.getElementById('mini-challenge-card');
  if(existing) existing.remove();
  if(!shopMiniChallenge || !miniChallengeData) return;
  const today = new Date().toDateString();
  const done  = miniChallengeData.done && miniChallengeData.date===today;
  const writeBtn = document.getElementById('home-hub-dynamic');
  if(!writeBtn) return;
  const btn = document.createElement('button');
  btn.id = 'mini-challenge-card';
  btn.className = 'write-to-rob-btn rw';
  btn.style.cssText = 'border-color:rgba(255,160,60,.22);opacity:'+(done?'.5':'1');
  btn.disabled = done;
  btn.onclick = done ? null : function(e){ completeMiniChallenge(); R(e,this); };
  btn.innerHTML = `
    <div class="write-to-rob-btn-ico">${done?'✅':'🎪'}</div>
    <div class="write-to-rob-btn-lbl">
      <div class="write-to-rob-btn-title" style="color:rgba(255,160,60,.95)">${done?'Challenge done!':'Mini Challenge'}</div>
      <div class="write-to-rob-btn-sub" style="color:rgba(255,160,60,.5)">${done?'See you tomorrow':'${miniChallengeData.challenge}'}</div>
    </div>`;
  // Fix template literal issue
  btn.querySelector('.write-to-rob-btn-sub').textContent = done ? 'See you tomorrow' : miniChallengeData.challenge;
  writeBtn.appendChild(btn);
}
function completeMiniChallenge(){
  const today = new Date().toDateString();
  miniChallengeData.done = true;
  miniChallengeData.date = today;
  const old = ptsVal; ptsVal += 75;
  animatePts(old, ptsVal, 700);
  addTxItem('🎪','Mini Challenge completed!','Just now','+75','earn');
  T('🎪 Challenge done! +75 pts!');
  showSuccess('🎪','+75 pts!','rgba(255,160,60,.2)');
  renderMiniChallengeCard();
  saveState();
}
function openMiniChallengeAdmin(){
  _shopModal('mini-challenge-modal','🎪 Mini Challenge',`
    <div style="display:flex;flex-direction:column;gap:14px">
      <div>
        <label style="font-size:11px;color:var(--tx2);display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em">Today's challenge for Ana</label>
        <textarea id="mc-text" placeholder="e.g. Take a photo of something that made you smile today" rows="3" style="width:100%;padding:12px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:14px;font-family:inherit;box-sizing:border-box;resize:none">${miniChallengeData&&miniChallengeData.challenge||''}</textarea>
      </div>
      <button onclick="saveMiniChallenge()" class="shop-unlock-btn rw" style="width:100%;padding:14px;font-size:14px">Set Challenge</button>
    </div>
  `);
}
function saveMiniChallenge(){
  const text = document.getElementById('mc-text').value.trim();
  if(!text){ T('⚠️ Enter a challenge'); return; }
  miniChallengeData = {challenge:text, done:false, date:null};
  document.getElementById('mini-challenge-modal').remove();
  T('🎪 Challenge set!');
  renderMiniChallengeCard();
  saveState();
}
window.openMiniChallengeAdmin = openMiniChallengeAdmin;
window.saveMiniChallenge = saveMiniChallenge;
window.completeMiniChallenge = completeMiniChallenge;
window.renderMiniChallengeCard = renderMiniChallengeCard;

