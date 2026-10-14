/* ═══════════════════════════
   NOTIFICATION SYSTEM — state driven
═══════════════════════════ */
// ptsVal declared here so components below can reference it
ptsVal = 0; // already declared above (state.js) — kept in sync with the real starting balance
notifOpen = false; // already declared above

// Notification panel — driven entirely by real events (letters actually
// sent, streak milestones actually hit). No hardcoded/example entries:
// if nothing real happened yet, the panel is empty.

const NOTIF_ICON_MAP = {
  letter:   { ico: '\ud83d\udc8c', icoClass: 'rose' },
  streak:   { ico: '\ud83d\udd25', icoClass: 'rose' },
};

// Appends a real notification event to the persisted log. Called only from
// actual event trigger points (a letter being sent, a streak milestone),
// never synthetically generated on render.
function logNotif(entry){
  const meta = NOTIF_ICON_MAP[entry.type] || { ico: '\ud83d\udc95', icoClass: 'rose' };
  const full = Object.assign({
    id: 'n' + Date.now() + Math.random().toString(36).slice(2, 7),
    ts: Date.now(),
    read: false,
    dismissed: false,
    ico: meta.ico,
    icoClass: meta.icoClass
  }, entry);

  notifLog.unshift(full);
  if(notifLog.length > 50) notifLog.length = 50;

  if(typeof saveState === 'function') saveState();
  updateNBadge();
  if(notifOpen) renderNotifList();
  return full;
}
window.logNotif = logNotif;

function getActiveNotifs(){
  return notifLog.filter(n => !n.dismissed);
}

function getUnreadCount(){
  return getActiveNotifs().filter(n => !n.read).length;
}

function timeAgo(ts){
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if(diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if(diffMin < 60) return diffMin + 'm ago';
  const diffHr = Math.floor(diffMin / 60);
  if(diffHr < 24) return diffHr + 'h ago';
  const diffDay = Math.floor(diffHr / 24);
  if(diffDay < 7) return diffDay + 'd ago';
  return new Date(ts).toLocaleDateString();
}

function renderNotifList(){
  const list = document.getElementById('np-list');
  if(!list) return;
  const active = getActiveNotifs();

  if(active.length === 0){
    list.innerHTML = '<div style="text-align:center;padding:20px 0;font-size:12px;color:var(--tx3)">All caught up! \ud83d\udc95</div>';
    return;
  }

  const colorMap = { rose:'var(--rose-b)', mint:'var(--mint)', gold:'var(--gold)' };

  list.innerHTML = active.map((n, i) => {
    const dotColor = colorMap[n.icoClass] || 'var(--rose-b)';
    return `<div class="ni${n.read?'':' unread'} rw" style="animation-delay:${i*.04}s"
      onclick="niTapById('${n.id}');R(event,this)">
      <div class="ni-ico ${n.icoClass}">${n.ico}</div>
      <div class="ni-body">
        <div class="ni-title">${n.title}</div>
        <div class="ni-sub">${n.sub}</div>
        <div class="ni-time">${timeAgo(n.ts)}</div>
      </div>
      ${!n.read ? `<div class="ni-dot" style="background:${dotColor}"></div>` : ''}
    </div>`;
  }).join('');
}

function toggleNotif(){
  notifOpen ? closeNotif() : openNotif();
}
function openNotif(){
  notifOpen = true;
  renderNotifList();
  document.getElementById('NP').classList.add('open');
  document.getElementById('NP-dim').classList.add('on');
}
function closeNotif(){
  notifOpen = false;
  document.getElementById('NP').classList.remove('open');
  document.getElementById('NP-dim').classList.remove('on');
}

function niTapById(id){
  const n = notifLog.find(x => x.id === id);
  if(!n) return;

  n.read = true;
  if(typeof saveState === 'function') saveState();
  updateNBadge();
  renderNotifList();

  setTimeout(()=>{
    closeNotif();
    if(n.type === 'letter'){
      if(typeof openLetter === 'function'){
        openLetter('From Robert', n.letterTitle, n.letterBody, n.letterSig);
      }
    } else if(n.type === 'streak'){
      go('home');
      T('\ud83d\udd25 Keep that streak alive!');
    }
  }, 180);
}
window.niTapById = niTapById;

function clearNotifs(){
  const items = document.querySelectorAll('.ni');
  notifLog.forEach(n => { n.dismissed = true; });
  if(typeof saveState === 'function') saveState();
  items.forEach((el,i)=>{
    setTimeout(()=>{
      el.style.transition='all .3s ease';
      el.style.opacity='0';
      el.style.transform='translateX(20px)';
      setTimeout(()=>el.remove(), 300);
    }, i * 60);
  });
  updateNBadge();
  setTimeout(closeNotif, items.length * 60 + 350);
}

function updateNBadge(){
  const badge = document.getElementById('np-badge');
  const ndot  = document.getElementById('ndot');
  const count = getUnreadCount();

  badge.classList.remove('is-unread', 'is-read');

  if(count > 0){
    badge.textContent = count + ' new';
    badge.classList.add('is-unread');
    if(ndot){
      ndot.style.display = 'flex';
      ndot.textContent = count > 9 ? '9+' : count;
    }
  } else {
    badge.textContent = 'All read';
    badge.classList.add('is-read');
    if(ndot) ndot.style.display = 'none';
  }
}

function pushLetterNotif(letterTitle, letterBody, letterSig){
  totalLettersSent++;
  if(typeof saveState === 'function') saveState();
  if(typeof checkAchievements === 'function') checkAchievements();
  if(typeof notifPrefs !== 'undefined' && notifPrefs.letters === false) return;
  logNotif({
    type: 'letter',
    title: 'New letter from Robert',
    sub: '"' + letterTitle + '" — just arrived',
    letterTitle: letterTitle,
    letterBody: letterBody,
    letterSig: letterSig
  });
}
window.pushLetterNotif = pushLetterNotif;

// Init
window.toggleNotif=toggleNotif;
window.openNotif=openNotif;
window.closeNotif=closeNotif;
window.clearNotifs=clearNotifs;


/* ═══════════════════════════════════════════════
   PUSH NOTIFICATION SYSTEM (iOS Safari PWA)
═══════════════════════════════════════════════ */

function getPushStatus(){
  if(!('Notification' in window)) return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

// Checks whether THIS device's actual push subscription (if any) is the one
// on file in Supabase for the role currently active in this session. OS-level
// Notification.permission is granted per-origin, not per-role, so it alone
// can't tell us whether this specific device is registered as 'ana' or
// 'robert' — a device can look "enabled" while actually being mismatched
// or missing entirely from the table.
async function getDeviceRoleSubStatus(){
  if(!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported';
  const perm = getPushStatus();
  if(perm !== 'granted') return perm; // 'default' | 'denied' | 'unsupported'

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if(!sub) return 'not-subscribed';

    const role = _pushRole();
    const res = await fetch(
      `${PUSH_SUPABASE_URL}/rest/v1/push_subscriptions?select=role,endpoint&endpoint=eq.${encodeURIComponent(sub.endpoint)}`,
      { headers: { 'apikey': PUSH_SUPABASE_KEY, 'Authorization': `Bearer ${PUSH_SUPABASE_KEY}` } }
    );
    const rows = await res.json();
    if(rows.length && rows[0].role === role) return 'subscribed';
    if(rows.length) return 'wrong-role';
    return 'not-subscribed';
  } catch(_) {
    return 'unknown';
  }
}
window.getDeviceRoleSubStatus = getDeviceRoleSubStatus;

async function updateSettingsNotifStatus(){
  const status = await getDeviceRoleSubStatus();
  // 'sett-notif' = Ana's Settings screen, 'rob-notif' = Robert's dashboard Settings tab.
  // Both share the same markup/CSS classes, just different element ids, so keep them in sync here.
  ['sett-notif', 'rob-notif'].forEach(function(prefix){
    const titleEl = document.getElementById(prefix+'-title');
    const subEl   = document.getElementById(prefix+'-sub');
    const btnEl   = document.getElementById(prefix+'-btn');
    const icoEl   = document.getElementById(prefix+'-ico');
    const boxEl   = document.getElementById(prefix+'-status');
    if(!titleEl) return;

    // The button is NEVER disabled — tapping it always re-registers this
    // device under whichever role is currently active. This is what lets
    // someone fix a mismatched/stale registration without needing to reset
    // OS-level permissions first.
    if(status === 'subscribed'){
      titleEl.textContent = 'Push notifications enabled';
      subEl.textContent   = 'This device will receive alerts from Heartly';
      btnEl.textContent   = 'Enabled';
      btnEl.style.cssText = 'background:rgba(110,232,180,.15);border-color:rgba(110,232,180,.3);color:var(--mint)';
      if(boxEl) boxEl.style.borderColor = 'rgba(110,232,180,.2)';
      if(icoEl) icoEl.style.color = 'var(--mint)';
    } else if(status === 'wrong-role'){
      titleEl.textContent = 'Registered to the other account';
      subEl.textContent   = 'Tap Enable to register this device here instead';
      btnEl.textContent   = 'Enable';
      btnEl.style.cssText = 'background:rgba(255,180,60,.12);border-color:rgba(255,180,60,.3);color:#ffb43c';
      if(boxEl) boxEl.style.borderColor = 'rgba(255,180,60,.2)';
      if(icoEl) icoEl.style.color = '#ffb43c';
    } else if(status === 'denied'){
      titleEl.textContent = 'Notifications blocked';
      subEl.textContent   = 'Go to iPhone Settings > Safari > Heartly to allow';
      btnEl.textContent   = 'Blocked';
      btnEl.style.cssText = 'background:rgba(255,80,80,.1);border-color:rgba(255,80,80,.2);color:#ff6b6b;pointer-events:none';
      if(boxEl) boxEl.style.borderColor = 'rgba(255,80,80,.15)';
      if(icoEl) icoEl.style.color = '#ff6b6b';
    } else if(status === 'unsupported'){
      titleEl.textContent = 'Notifications unavailable';
      subEl.textContent   = 'Add Heartly to your Home Screen for push alerts';
      btnEl.textContent   = 'Learn more';
    } else {
      titleEl.textContent = 'Push notifications off';
      subEl.textContent   = 'Tap to receive alerts from Heartly';
      btnEl.textContent   = 'Enable';
      btnEl.style.cssText = '';
    }
  });
}
window.updateSettingsNotifStatus = updateSettingsNotifStatus;

async function requestPushPermission(){
  if(!('Notification' in window)){
    T('Add Heartly to your Home Screen first');
    return;
  }
  if(Notification.permission === 'granted'){
    const ok = typeof subscribeToPush === 'function' ? await subscribeToPush() : false;
    await updateSettingsNotifStatus();
    T(ok ? 'This device is registered for notifications' : 'Could not register this device — try again');
    return;
  }
  if(Notification.permission === 'denied'){
    T('Go to iPhone Settings > Safari to allow notifications');
    return;
  }
  const result = await Notification.requestPermission();
  if(result === 'granted'){
    const ok = typeof subscribeToPush === 'function' ? await subscribeToPush() : false;
    await updateSettingsNotifStatus();
    T(ok ? 'Notifications enabled!' : 'Could not register this device — try again');
    if(ok){
      setTimeout(function(){
        sendLocalNotif('Heartly', 'You will now receive updates from Robert');
      }, 1200);
    }
  } else {
    await updateSettingsNotifStatus();
    T('Notifications not enabled');
  }
}
window.requestPushPermission = requestPushPermission;

/* Show a local notification via the SW (no server needed) */
function sendLocalNotif(title, body, tag){
  tag = tag || 'heartly-local';
  if(!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready.then(function(reg){
    reg.showNotification(title, {
      body:    body,
      icon:    'assets/icon.jpg',
      badge:   'assets/icon.jpg',
      tag:     tag,
      vibrate: [200, 100, 200],
    });
  }).catch(function(){});
}
window.sendLocalNotif = sendLocalNotif;

/* ── Sync settings panel when opened ── */
(function(){
  var _origOpen = window.openSettings;
  window.openSettings = function(){
    _origOpen();
    updateSettingsNotifStatus();
  };
})();


/* ═══════════════════════════════════════════════
   DEV TOOLS — push test + localStorage reset
═══════════════════════════════════════════════ */

function devTestPushNotif(){
  if(Notification.permission !== 'granted'){
    T('Enable notifications in Settings first');
    return;
  }
  sendLocalNotif(
    'New letter from Robert',
    '"Missing Your Laugh" — just arrived',
    'heartly-dev-test'
  );
  T('Push notification sent!');
}
window.devTestPushNotif = devTestPushNotif;

function devTestInAppNotif(){
  // QA helper: un-dismiss and mark everything unread again so the panel
  // is easy to eyeball during testing, without fabricating fake entries.
  notifLog.forEach(function(n){ n.dismissed = false; n.read = false; });
  if(typeof saveState === 'function') saveState();
  updateNBadge();
  openNotif();
  T(notifLog.length ? 'In-app notifications refreshed!' : 'No real notifications yet — send a letter or hit a streak milestone first');
}
window.devTestInAppNotif = devTestInAppNotif;

async function devResetLocalStorage(){
  const ok = await appModal({
    icon: '⚠️',
    title: 'Reset ALL progress?',
    subtitle: 'Points, streak, shop unlocks, wishlist, moods, and letters read — for BOTH Ana and Robert. This clears the shared data too, not just this device. Your written letters/notes and love languages are kept. Cannot be undone.',
    confirmLabel: 'Reset everything',
    danger: true
  });
  if(!ok) return;
  try {
    // Extra safety net on top of the real fix below: snapshot the
    // current live row to the backups table right before resetting,
    // in case any field is ever missed from `blank` again in the
    // future. Best-effort — never blocks the reset if it fails.
    if(typeof triggerManualBackup === 'function'){
      try { await triggerManualBackup('pre-reset'); } catch(e){ console.warn('pre-reset backup failed:', e); }
    }
    // BUG (fixed) — this is what wiped a real couple's actual written
    // letters/notes on 2026-08-25. The old comment below was WRONG:
    // leaving `ED` out of this object only protects it locally, because
    // applyState() (the function that reads a state blob back INTO the
    // app) skips fields that are absent. But this object doesn't go
    // through applyState() — it goes straight to pushRemoteState(),
    // which does a plain Supabase `.upsert({ data: stateObj })`: a full
    // replacement of the entire remote row, no merging, no skipping.
    // Omitting ED here doesn't "preserve" it remotely — it means the
    // saved row ends up with NO ED field AT ALL, and every device that
    // syncs after this pull down nothing. Same reasoning applies to
    // currentLoveLangs — that's Ana's own real, self-reported content,
    // not "progress," and belongs in the same protected category.
    // Fix: read the REAL current values and include them explicitly.
    var blank = {
      ED: (typeof ED !== 'undefined') ? ED : undefined,
      currentLoveLangs: (typeof currentLoveLangs !== 'undefined') ? currentLoveLangs : undefined,
      ptsVal:0, activeTheme:'default', themeUnlocks:{}, hasSeenWelcome:false,
      shopStreakShield:false, shopDailyBonus:false, shopDailyBonusLastClaimed:null,
      shopDailyGiftBox:false, shopDailyGiftLastClaimed:null, shopHotStreak:false,
      shopVIPPass:false, shopVIPPassExpiry:null, shopCoupleSong:false, shopAnniversaryCard:false,
      shopMemoryJar:false, shopLoveMap:false, memoryJarItems:[], loveMapPins:[],
      shopCountdown:false, shopCountdownData:null,
      shopGoodNight:false, shopGoodNightTime:null, shopCoupleGoals:false, coupleGoalsList:[],
      shopDateNight:false, dateNightIdeas:[],
      shopDailyQuestion:false, dailyQuestionData:null,
      shopPhotoOfDay:false, photoOfDayData:null,
      shopLuckySpin:false, shopLuckySpinLastUsed:null,
      shopPuzzleOfWeek:false, puzzleOfWeekData:null,
      currentStreak:0, bestStreak:0, lastOpenDate:null, streakShieldUsedDate:null,
      shopMood:false, shopWishList:false, shopWriteToRob:false,
      anaWishList:[], robertWishList:[], anaSuggestions:[], anaMessages:[],
      anaMood:null, robertMood:null, favourites:[], ptsLog:[], sentLetters:[],
      // Added later than this reset tool was originally written — included
      // so a real reset genuinely zeroes these out too, not just the
      // fields that existed when this function was first built.
      notifLog:[], earnedAchievements:{},
      totalLettersSent:0, totalPtsEarned:0, totalMoodsSet:0,
      totalBonusesClaimed:0, totalGiftBoxesOpened:0, totalLuckySpins:0,
      everChangedTheme:false,
      clickerGamesPlayed:0, clickerBestScore:0, clickerLifetimeScore:0
    };

    localStorage.removeItem(STORAGE_KEY);

    if(typeof window.pushRemoteState === 'function'){
      T('🗑️ Resetting shared data…');
      Promise.resolve(window.pushRemoteState(blank)).finally(function(){
        setTimeout(function(){ location.reload(); }, 900);
      });
    } else {
      T('🗑️ Local data reset — reload the app');
      setTimeout(function(){ location.reload(); }, 900);
    }
  } catch(e){
    T('Could not reset: ' + e.message);
  }
}
window.devResetLocalStorage = devResetLocalStorage;


