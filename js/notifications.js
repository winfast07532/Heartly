/* ═══════════════════════════
   NOTIFICATION SYSTEM — state driven
═══════════════════════════ */
// ptsVal declared here so NOTIF_DEFS arrow functions can reference it
ptsVal = 3200; // already declared above
notifOpen = false; // already declared above

// Notification definitions — generated from real app state
const NOTIF_DEFS = [
  {
    id: 'new-letter',
    ico: '💌', icoClass: 'rose',
    color: 'var(--rose-b)',
    title: () => {
      const latest = sentLetters && sentLetters[0];
      return latest ? 'New letter from Robert' : 'New letter from Robert';
    },
    sub: () => {
      const latest = sentLetters && sentLetters[0];
      return latest ? '"' + latest.title + '" — just arrived' : '"Missing Your Laugh" — just arrived';
    },
    time: '5 minutes ago',
    action: () => {
      const latest = sentLetters && sentLetters[0];
      if(latest){
        const body = latest.body.replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
        openLetter('From Robert', latest.title, body, latest.sig);
      } else {
        go('explore');
      }
    }
  },
  {
    id: 'streak',
    ico: '🔥', icoClass: 'rose',
    color: 'var(--rose-b)',
    title: () => 'You\'re on a ' + 14 + '-day streak! 🔥',
    sub: () => 'Open a letter today to keep it going',
    time: 'Today',
    action: () => { go('home'); T('🔥 Keep that streak alive!'); }
  },
  {
    id: 'goodnight',
    ico: '🌙', icoClass: 'mint',
    color: 'var(--mint)',
    title: () => {
      // Check if countdown is "Ready"
      const cd = document.getElementById('cdown');
      return cd && cd.textContent === 'Ready!' ? 'Goodnight letter is ready! 🌙' : 'Goodnight letter coming tonight';
    },
    sub: () => {
      const cd = document.getElementById('cdown');
      return cd && cd.textContent === 'Ready!'
        ? 'Robert left you something — open it now'
        : 'Robert writes every 2 days — check back soon';
    },
    time: 'Tonight',
    action: () => { go('home'); T('🌙 Check your goodnight letter!'); }
  },
  {
    id: 'milestone',
    ico: '💕', icoClass: 'rose',
    color: 'var(--rose-b)',
    title: () => {
      const days = Math.floor((new Date() - new Date('2023-08-10T00:00:00')) / 86400000);
      return days + ' days together 💕';
    },
    sub: () => {
      const days = Math.floor((new Date() - new Date('2023-08-10T00:00:00')) / 86400000);
      const months = Math.floor(days/30);
      return months + ' months of love, letters, and moments';
    },
    time: 'Always',
    action: () => { openProf(); }
  },
  {
    id: 'points',
    ico: '🪙', icoClass: 'gold',
    color: 'var(--gold)',
    title: () => 'You have ' + Math.floor(ptsVal).toLocaleString() + ' points!',
    sub: () => {
      if(ptsVal >= 1000) return 'You can unlock the Royal Blue theme in Exchange';
      return 'Keep reading letters to earn more points';
    },
    time: 'Today',
    action: () => { go('exchange'); }
  },
  {
    id: 'surprise',
    ico: '🎁', icoClass: 'rose',
    color: 'var(--rose-b)',
    title: () => 'Daily surprise waiting for you 🎁',
    sub: () => {
      const cd = document.getElementById('cdown');
      return cd ? 'Unlocks in ' + cd.textContent : 'Check the countdown on Home';
    },
    time: 'Today',
    action: () => { go('home'); T('🎁 Check your surprise countdown!'); }
  },
];

// Track which notifs have been dismissed this session
dismissedNotifs = new Set(); // already declared above
// Track which are "read" (tapped)
readNotifs = new Set(); // already declared above

function getActiveNotifs(){
  return NOTIF_DEFS.filter(n => !dismissedNotifs.has(n.id));
}

function getUnreadCount(){
  return getActiveNotifs().filter(n => !readNotifs.has(n.id)).length;
}

function renderNotifList(){
  const list = document.getElementById('np-list');
  if(!list) return;
  const active = getActiveNotifs();

  if(active.length === 0){
    list.innerHTML = '<div style="text-align:center;padding:20px 0;font-size:12px;color:var(--tx3)">All caught up! 💕</div>';
    return;
  }

  const colorMap = { rose:'var(--rose-b)', mint:'var(--mint)', gold:'var(--gold)' };

  list.innerHTML = active.map((n, i) => {
    const isRead = readNotifs.has(n.id);
    const dotColor = colorMap[n.icoClass] || 'var(--rose-b)';
    return `<div class="ni${isRead?'':' unread'} rw" style="animation-delay:${i*.04}s"
      onclick="niTapById('${n.id}');R(event,this)">
      <div class="ni-ico ${n.icoClass}">${n.ico}</div>
      <div class="ni-body">
        <div class="ni-title">${n.title()}</div>
        <div class="ni-sub">${n.sub()}</div>
        <div class="ni-time">${n.time}</div>
      </div>
      ${!isRead ? `<div class="ni-dot" style="background:${dotColor}"></div>` : ''}
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
  const n = NOTIF_DEFS.find(x => x.id === id);
  if(!n) return;

  // Mark read
  readNotifs.add(id);
  updateNBadge();
  renderNotifList();

  setTimeout(()=>{
    closeNotif();
    if(n.action) n.action();
  }, 180);
}
window.niTapById = niTapById;

function clearNotifs(){
  // Dismiss all
  NOTIF_DEFS.forEach(n => dismissedNotifs.add(n.id));
  readNotifs.clear();
  const items = document.querySelectorAll('.ni');
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

// Add a new notification when Robert sends a letter
function pushLetterNotif(){
  // Reset dismiss so new letter shows
  dismissedNotifs.delete('new-letter');
  readNotifs.delete('new-letter');
  updateNBadge();
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

function updateSettingsNotifStatus(){
  const status  = getPushStatus();
  const titleEl = document.getElementById('sett-notif-title');
  const subEl   = document.getElementById('sett-notif-sub');
  const btnEl   = document.getElementById('sett-notif-btn');
  const icoEl   = document.getElementById('sett-notif-ico');
  const boxEl   = document.getElementById('sett-notif-status');
  if(!titleEl) return;

  if(status === 'granted'){
    titleEl.textContent = 'Push notifications enabled';
    subEl.textContent   = 'You will receive alerts from Heartly';
    btnEl.textContent   = 'Enabled';
    btnEl.style.cssText = 'background:rgba(110,232,180,.15);border-color:rgba(110,232,180,.3);color:var(--mint);pointer-events:none';
    if(boxEl) boxEl.style.borderColor = 'rgba(110,232,180,.2)';
    if(icoEl) icoEl.style.color = 'var(--mint)';
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
}
window.updateSettingsNotifStatus = updateSettingsNotifStatus;

function requestPushPermission(){
  if(!('Notification' in window)){
    T('Add Heartly to your Home Screen first');
    return;
  }
  if(Notification.permission === 'granted'){
    T('Notifications already enabled');
    updateSettingsNotifStatus();
    return;
  }
  if(Notification.permission === 'denied'){
    T('Go to iPhone Settings > Safari to allow notifications');
    return;
  }
  Notification.requestPermission().then(function(result){
    updateSettingsNotifStatus();
    if(result === 'granted'){
      T('Notifications enabled!');
      // Show a welcome push after a short delay
      setTimeout(function(){
        sendLocalNotif('Heartly', 'You will now receive updates from Robert');
      }, 1200);
    } else {
      T('Notifications not enabled');
    }
  });
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
  // Reset all dismissed so the panel shows everything again
  dismissedNotifs.clear();
  readNotifs.clear();
  updateNBadge();
  openNotif();
  T('In-app notifications refreshed!');
}
window.devTestInAppNotif = devTestInAppNotif;

function devResetLocalStorage(){
  if(!confirm('Reset ALL localStorage? This cannot be undone.')) return;
  try {
    localStorage.clear();
    T('localStorage cleared — reload the app');
    setTimeout(function(){ location.reload(); }, 1200);
  } catch(e){
    T('Could not clear storage: ' + e.message);
  }
}
window.devResetLocalStorage = devResetLocalStorage;


