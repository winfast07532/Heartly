/* ═══════════════════════════
   PROFILE PAGE
═══════════════════════════ */
function openProf(){
  document.getElementById('PROF').classList.add('open');
  startProfTimer();
}
function closeProf(){
  document.getElementById('PROF').classList.remove('open');
  clearInterval(profTimerInt);
}
window.openProf=openProf;
window.closeProf=closeProf;

const DEFAULT_REL_DATE = '2023-08-10';
const DEFAULT_COUPLE = { ana: 'Ana', robert: 'Robert' };

function getRelationshipDate(){
  // One-time migration: earlier versions stored this in a separate raw
  // localStorage key that never synced to the other device. If that key
  // has a value and the real synced variable doesn't yet, adopt it once.
  if(!relationshipStartDate){
    var legacy = localStorage.getItem('heartly.relDate');
    if(legacy){
      relationshipStartDate = legacy;
      if(typeof saveState === 'function') saveState();
    }
  }
  return relationshipStartDate || DEFAULT_REL_DATE;
}
function setRelationshipDate(dateStr){
  relationshipStartDate = dateStr;
  if(typeof saveState === 'function') saveState();
}
function getCoupleNames(){
  try{
    const raw = localStorage.getItem('heartly.coupleNames');
    if(raw){
      const parsed = JSON.parse(raw);
      return {
        ana: (parsed.ana || DEFAULT_COUPLE.ana).trim(),
        robert: (parsed.robert || DEFAULT_COUPLE.robert).trim()
      };
    }
  }catch(e){}
  return { ...DEFAULT_COUPLE };
}
function setCoupleNames(ana, robert){
  localStorage.setItem('heartly.coupleNames', JSON.stringify({
    ana: (ana || DEFAULT_COUPLE.ana).trim(),
    robert: (robert || DEFAULT_COUPLE.robert).trim()
  }));
}
function relStartDate(){
  return new Date(getRelationshipDate() + 'T00:00:00');
}
// Calendar-accurate breakdown (accounts for varying month lengths),
// not a naive division by 365/30.
function calendarDiff(start, end){
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  if(days < 0){
    months--;
    const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if(months < 0){
    years--;
    months += 12;
  }
  return { years, months, days };
}
function formatRelDatePretty(dateStr){
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US',{month:'long', day:'numeric', year:'numeric'});
}
// profTimerInt already declared above

function startProfTimer(){
  function update(){
    const fmt = (typeof relTimerFormat === 'function') ? relTimerFormat() : 'dhms';
    const el_d = document.getElementById('prof-d');
    const el_h = document.getElementById('prof-h');
    const el_m = document.getElementById('prof-m');
    const el_s = document.getElementById('prof-s');
    const l1 = document.getElementById('pt-l1'), l2 = document.getElementById('pt-l2'),
          l3 = document.getElementById('pt-l3'), l4 = document.getElementById('pt-l4');
    const u4 = document.getElementById('pt-u4'), sep3 = document.getElementById('pt-sep3');

    if(fmt === 'ymd'){
      const diff = calendarDiff(relStartDate(), new Date());
      if(u4) u4.style.display = 'none';
      if(sep3) sep3.style.display = 'none';
      if(l1) l1.textContent = 'Years';
      if(l2) l2.textContent = 'Months';
      if(l3) l3.textContent = 'Days';
      if(el_d) el_d.textContent = diff.years.toLocaleString();
      if(el_h) el_h.textContent = String(diff.months);
      if(el_m) el_m.textContent = String(diff.days);
    } else {
      const diff = new Date() - relStartDate();
      const d = Math.floor(diff/86400000);
      const h = Math.floor((diff%86400000)/3600000);
      const m = Math.floor((diff%3600000)/60000);
      const s = Math.floor((diff%60000)/1000);
      const pad = n=>String(n).padStart(2,'0');
      if(u4) u4.style.display = '';
      if(sep3) sep3.style.display = '';
      if(l1) l1.textContent = 'Days';
      if(l2) l2.textContent = 'Hours';
      if(l3) l3.textContent = 'Mins';
      if(l4) l4.textContent = 'Secs';
      if(el_d) el_d.textContent = d.toLocaleString();
      if(el_h) el_h.textContent = pad(h);
      if(el_m) el_m.textContent = pad(m);
      if(el_s) el_s.textContent = pad(s);
    }
  }
  clearInterval(profTimerInt);
  update();
  profTimerInt = setInterval(update,1000);
  window._refreshProfTimer = update;
}

/* ═══ PATCH openProf — wire live stats + theme sync ═══ */
(function(){
  const _orig = window.openProf;
  window.openProf = function(){
    _orig();
    updateProfStats();
  };
})();

function updateProfStats(){
  // Days together
  const days = Math.floor((new Date() - relStartDate()) / 86400000);
  const daysEl = document.getElementById('prof-stat-days');
  if(daysEl) daysEl.textContent = days.toLocaleString();

  // Points
  const ptsEl = document.getElementById('prof-stat-pts');
  if(ptsEl) ptsEl.textContent = Math.floor(ptsVal).toLocaleString();

  // Letters read (sent letters that are read)
  const readEl = document.getElementById('prof-stat-read');
  const readCount = (sentLetters || []).filter(l => l.read).length;
  if(readEl) readEl.textContent = readCount;

  // Streak — real value from state
  const streakEl = document.getElementById('prof-stat-streak');
  if(streakEl) streakEl.textContent = currentStreak;

  // Second stats grid (.pstat) — real values, same sources as above
  const pRead = document.getElementById('pstat-read');
  if(pRead){
    const exploreReadCount = ['notes','surprises','letters'].reduce((sum, cat) =>
      sum + ((typeof ED!=='undefined' && ED[cat]) ? ED[cat].filter(i => !i.lk && i.read).length : 0), 0);
    pRead.textContent = exploreReadCount.toLocaleString();
  }
  const pPts = document.getElementById('pstat-pts');
  if(pPts) pPts.textContent = Math.floor(ptsVal).toLocaleString();
  const pGames = document.getElementById('pstat-games');
  if(pGames) pGames.textContent = (typeof clickerGamesPlayed!=='undefined' ? clickerGamesPlayed : 0).toLocaleString();
  const pShop = document.getElementById('pstat-shop');
  if(pShop) pShop.textContent = (typeof _ownedShopItemCount==='function' ? _ownedShopItemCount() : 0);
  const pAch = document.getElementById('pstat-ach');
  if(pAch && typeof earnedAchievements!=='undefined' && typeof ACH_DATA!=='undefined'){
    pAch.textContent = Object.keys(earnedAchievements).length + '/' + ACH_DATA.length;
  }

  // Sync theme selectors — profile + settings + Robert all in sync
  document.querySelectorAll('.theme-opt').forEach(o => o.classList.remove('on'));
  ['sett-theme-', 'rob-sett-theme-'].forEach(prefix => {
    const opt = document.getElementById(prefix + activeTheme);
    if(opt) opt.classList.add('on');
  });
  
  // Load and display love languages
  loadLoveLanguages();
  updateLoveLangDisplay();

  // Sync relationship labels in profile/settings/logs
  syncRelationshipUI();
  syncSettingsRelationshipRows();
  syncAnaIdentity();
}
window.updateProfStats = updateProfStats;

function syncRelationshipUI(){
  const names = getCoupleNames();
  const prettyDate = formatRelDatePretty(getRelationshipDate());

  const profNames = document.querySelector('.prof-names');
  if(profNames) profNames.textContent = `${names.ana} & ${names.robert}`;

  const profSince = document.querySelector('.prof-since');
  if(profSince) profSince.textContent = `Together since ${prettyDate} 💕`;

  const togetherLbl = document.querySelector('.together-lbl');
  if(togetherLbl) togetherLbl.textContent = `💕 ${names.ana} & ${names.robert} — Together for`;

  const togetherSince = document.querySelector('.together-since');
  if(togetherSince) togetherSince.textContent = `Since ${prettyDate} 💕`;
}
window.syncRelationshipUI = syncRelationshipUI;

function syncSettingsRelationshipRows(){
  const names = getCoupleNames();
  const prettyDate = formatRelDatePretty(getRelationshipDate());

  const namesSub = document.getElementById('sett-couple-names-sub');
  if(namesSub) namesSub.textContent = `${names.ana} & ${names.robert}`;

  const annSub = document.getElementById('sett-anniversary-sub');
  if(annSub) annSub.textContent = prettyDate;

  const robAnnSub = document.getElementById('rob-rel-date-sub');
  if(robAnnSub) robAnnSub.textContent = prettyDate;

  const loveSub = document.getElementById('sett-love-lang-sub');
  if(loveSub){
    loadLoveLanguages();
    const top2 = [...currentLoveLangs]
      .sort((a,b)=>b.value-a.value)
      .slice(0,2)
      .map(x=>x.name)
      .join(' & ');
    loveSub.textContent = top2 || 'Set your love languages';
  }
}
window.syncSettingsRelationshipRows = syncSettingsRelationshipRows;

async function editCoupleNames(){
  const names = getCoupleNames();
  const result = await appModal({
    icon: '💑',
    title: 'Couple names',
    fields: [
      { key: 'ana', label: 'Your name', value: names.ana, placeholder: 'Ana' },
      { key: 'robert', label: 'Partner\'s name', value: names.robert, placeholder: 'Robert' }
    ],
    confirmLabel: 'Save'
  });
  if(!result) return;

  const cleanAna = result.ana;
  const cleanRob = result.robert;
  if(!cleanAna || !cleanRob){
    T('⚠️ Both names are required');
    return;
  }

  setCoupleNames(cleanAna, cleanRob);
  syncRelationshipUI();
  syncSettingsRelationshipRows();
  T('💕 Couple names updated');
}
window.editCoupleNames = editCoupleNames;

async function editAnniversaryDate(){
  const current = getRelationshipDate();
  const result = await appModal({
    icon: '📅',
    title: 'Anniversary date',
    subtitle: 'Format: YYYY-MM-DD',
    fields: [{ key: 'date', value: current, placeholder: '2023-08-10' }],
    confirmLabel: 'Save'
  });
  if(!result) return;

  const val = result.date;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(val)){
    T('⚠️ Use format YYYY-MM-DD');
    return;
  }
  const d = new Date(val + 'T00:00:00');
  if(Number.isNaN(d.getTime())){
    T('⚠️ Invalid date');
    return;
  }
  setRelationshipDate(val);
  startProfTimer();
  updateProfStats();
  syncRelationshipUI();
  syncSettingsRelationshipRows();
  T('💕 Anniversary date updated');
}
window.editAnniversaryDate = editAnniversaryDate;

function editLoveLanguageFromSettings(){
  closeSettings();
  openProf();
  setTimeout(function(){
    if(!loveLangsEditMode) toggleEditProfile();
  }, 120);
}
window.editLoveLanguageFromSettings = editLoveLanguageFromSettings;

/* ═══ ANA AVATAR + EDIT PROFILE ═══ */
const DEFAULT_ANA_AVATAR = 'A';
function getAnaAvatar(){
  const v = localStorage.getItem('heartly.anaAvatar');
  return (v && v.trim()) || DEFAULT_ANA_AVATAR;
}
function setAnaAvatar(val){
  localStorage.setItem('heartly.anaAvatar', val);
}
window.getAnaAvatar = getAnaAvatar;
window.setAnaAvatar = setAnaAvatar;

// Keeps every avatar bubble + name label that represents Ana in sync
function syncAnaIdentity(){
  const av = getAnaAvatar();
  const names = getCoupleNames();
  document.querySelectorAll('.js-ana-avatar').forEach(el => { el.textContent = av; });
  document.querySelectorAll('.js-ana-name').forEach(el => { el.textContent = names.ana; });
}
window.syncAnaIdentity = syncAnaIdentity;

async function editAnaProfile(){
  const names = getCoupleNames();
  const result = await appModal({
    icon: '💕',
    title: 'Edit profile',
    fields: [
      { key: 'name', label: 'Your name', value: names.ana, placeholder: 'Ana' },
      { key: 'avatar', label: 'Avatar — a letter or emoji', value: getAnaAvatar(), placeholder: 'A', maxLength: 2 }
    ],
    confirmLabel: 'Save'
  });
  if(!result) return;

  const cleanName = result.name;
  if(!cleanName){ T('⚠️ Name can\'t be empty'); return; }
  const cleanAvatar = result.avatar || cleanName.charAt(0).toUpperCase();

  setCoupleNames(cleanName, names.robert);
  setAnaAvatar(cleanAvatar);

  syncAnaIdentity();
  syncRelationshipUI();
  syncSettingsRelationshipRows();
  T('💕 Profile updated');
}
window.editAnaProfile = editAnaProfile;

// ═══ LOVE LANGUAGES EDIT ═══
const LOVE_LANGUAGES = [
  {name: 'Words of Affirmation', color: 'linear-gradient(90deg,#a02050,var(--rose))', default: 85},
  {name: 'Quality Time', color: 'linear-gradient(90deg,#b08020,var(--gold))', default: 72},
  {name: 'Acts of Service', color: 'linear-gradient(90deg,#208060,var(--mint))', default: 60},
  {name: 'Receiving Gifts', color: 'linear-gradient(90deg,#6030a0,#c8a8f0)', default: 48},
  {name: 'Physical Touch', color: 'linear-gradient(90deg,#a04060,#e898b8)', default: 35}
];

let loveLangsEditMode = false;
let currentLoveLangs = [];

function loadLoveLanguages() {
  try {
    const saved = localStorage.getItem('heartly.loveLangs');
    if (saved) {
      currentLoveLangs = JSON.parse(saved);
    } else {
      currentLoveLangs = LOVE_LANGUAGES.map(l => ({...l, value: l.default}));
      saveLoveLanguages();
    }
  } catch {
    currentLoveLangs = LOVE_LANGUAGES.map(l => ({...l, value: l.default}));
    saveLoveLanguages();
  }
}

function saveLoveLanguages() {
  localStorage.setItem('heartly.loveLangs', JSON.stringify(currentLoveLangs));
}

function updateLoveLangDisplay() {
  const section = document.querySelector('.prof-section:has(.ll-bar)');
  if (!section) return;
  
  let html = `
    <div class="prof-section-lbl">Love Languages</div>
    <div class="C" style="padding:14px 16px">
      <div style="display:flex;flex-direction:column;gap:12px">
  `;
  
  currentLoveLangs.forEach((lang, i) => {
    html += `
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:5px">
          <span style="font-size:12px;font-weight:700;color:#fff">${lang.name}</span>
          <span style="font-size:11px;color:var(--rose-b);font-weight:700">${lang.value}%</span>
        </div>
        <div class="ll-bar" style="--i:${i}">
          <div class="ll-fill" style="--w:${lang.value}%;${lang.color ? `background:${lang.color}` : ''}"></div>
        </div>
      </div>
    `;
  });
  
  html += '</div></div>';
  section.innerHTML = html;
}

function toggleEditProfile() {
  loveLangsEditMode = !loveLangsEditMode;
  
  const editBtn = document.querySelector('.prof-edit');
  const section = document.querySelector('.prof-section:has(.ll-bar)');
  
  if (loveLangsEditMode) {
    // Switch to edit mode
    editBtn.innerHTML = '✕ Cancel';
    editBtn.style.background = 'rgba(255,60,80,.2)';
    editBtn.style.color = '#fff';
    
    let editHtml = `
      <div class="prof-section-lbl">Edit Love Languages</div>
      <div class="C" style="padding:14px 16px">
        <div style="display:flex;flex-direction:column;gap:14px">
    `;
    
    currentLoveLangs.forEach((lang, i) => {
      editHtml += `
        <div>
          <div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px">${lang.name}</div>
          <div class="ll-bar">
            <div class="ll-fill" style="--w:${lang.value}%;${lang.color ? `background:${lang.color}` : ''}"></div>
          </div>
          <input type="range" min="0" max="100" value="${lang.value}" 
                 style="width:100%;margin-top:8px;height:6px;-webkit-appearance:none;background:rgba(255,255,255,.2);border-radius:3px"
                 class="love-lang-slider" data-index="${i}"
                 oninput="updateLiveSlider(this);R(event,this)">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--tx2);margin-top:4px">
            <span>0%</span><span>${lang.value}%</span><span>100%</span>
          </div>
        </div>
      `;
    });
    
    editHtml += `
          <div style="display:flex;gap:10px;padding-top:12px;border-top:1px solid rgba(255,255,255,.08)">
            <button class="prof-edit rw" onclick="saveLoveLanguages();toggleEditProfile();T('💕 Love languages saved!');R(event,this)" style="flex:1;background:var(--rose);color:#fff;font-weight:700">💾 Save</button>
            <button class="prof-edit rw" onclick="toggleEditProfile();R(event,this)" style="flex:1;background:rgba(255,255,255,.1);color:var(--tx2);font-weight:700">Cancel</button>
          </div>
        </div>
      </div>
    `;
    
    section.innerHTML = editHtml;
    
  } else {
    // Switch to display mode
    editBtn.innerHTML = `
      <svg viewBox="0 0 24 24" style="width:15px;height:15px"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      Edit
    `;
    editBtn.style.background = '';
    editBtn.style.color = 'var(--tx2)';
    updateLoveLangDisplay();
  }
}

function updateLiveSlider(slider) {
  const idx = parseInt(slider.dataset.index);
  const val = parseInt(slider.value);
  currentLoveLangs[idx].value = val;
  
  // Live update bar
  const bar = slider.closest('div').querySelector('.ll-fill');
  if (bar) {
    bar.style.setProperty('--w', val + '%');
  }
  
  // Update % label
  const pctSpan = slider.nextElementSibling.querySelector('span:nth-child(2)');
  if (pctSpan) pctSpan.textContent = val + '%';
}

// Patch existing button onclick — the header Edit button opens the
// real profile editor (name + avatar). Love language editing is reached
// separately via Settings > Relationship > Love language.
(function() {
  const btn = document.querySelector('.prof-edit');
  if(!btn) return;
  btn.onclick = function(e) {
    R(e, this);
    editAnaProfile();
  };
})();

document.addEventListener('DOMContentLoaded', function(){
  syncRelationshipUI();
  syncSettingsRelationshipRows();
  syncAnaIdentity();
});
