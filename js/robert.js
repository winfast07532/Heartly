/* ═══════════════════════════
   ROBERT'S VIEW
═══════════════════════════ */

// Sent letters store
// sentLetters already declared above

currentLetterType = 'note'; // already declared above

/* ═══════════════════════════
   VIEW ENTRY
═══════════════════════════ */
function showRobertView(){
  document.getElementById('ROBERT').classList.add('show');
  renderRobGoodnight();
  updateRobProfile();
  if(typeof updateSettingsNotifStatus === 'function') updateSettingsNotifStatus();
  // Dev is the default tab now — render its list on load
  if(typeof renderDevListRob === 'function') renderDevListRob();
  // Was previously only rendered when opening the Activity tab, so the
  // dashboard could open showing a stale/blank "Ana's mood" card.
  if(typeof updateRobMoodCard === 'function') updateRobMoodCard();
  updateSentBadge();
  setTimeout(initRobMoodLongPress, 400);
}
window.showRobertView = showRobertView;

/* ═══════════════════════════
   TAB NAVIGATION
═══════════════════════════ */
function robNav(id){
  document.querySelectorAll('.rob-SC').forEach(s=>s.classList.remove('on'));
  document.querySelectorAll('.rob-tab').forEach(t=>t.classList.remove('on'));
  const screen = document.getElementById('rob-'+id);
  if(screen) screen.classList.add('on');
  const tab = document.querySelector('.rob-tab[data-rs="'+id+'"]');
  if(tab) tab.classList.add('on');
  document.getElementById('rob-scroll').scrollTop=0;

  // Only do expensive renders when actually switching to that tab
  if(id==='dev'){
    if(_robDevListDirty) renderDevListRob();
    dvUpdateHeader();
    dvTab('content');
    if(!calMonth) initCal(); else renderCal();
  }
  if(id==='sent'){
    renderSentLetters();
    sentUnreadBadge = false;
    updateSentBadge();
  }
  if(id==='activity'){
    startRobTimer();
    renderRobAnaMessages();
    renderRobWishList();
    // Mark all Ana's messages as read when Robert opens Activity
    anaMessages.forEach(m=>{ m.read = true; });
    // Show unread suggestion badge
    const unread = (typeof anaSuggestions!=='undefined') ? anaSuggestions.filter(s=>!s.seen).length : 0;
    const sugTab = document.querySelector('.dv-tab-btn[onclick*="suggest"]');
    if(sugTab) sugTab.textContent = unread > 0 ? `💬 Suggestions (${unread})` : '💬 Suggestions';
  }
  if(id==='robsettings'){
    if(typeof refreshFaceIdSettingsUI === 'function') refreshFaceIdSettingsUI();
    if(typeof updateSettingsNotifStatus === 'function') updateSettingsNotifStatus();
    if(typeof syncSettingsRelationshipRows === 'function') syncSettingsRelationshipRows();
    if(typeof renderRobSurprisesPricing === 'function') renderRobSurprisesPricing();
    if(typeof renderRobAchievementRewards === 'function') renderRobAchievementRewards();
    if(typeof dvRenderMemoryList === 'function') dvRenderMemoryList();
    if(typeof renderRobLoveMap === 'function') renderRobLoveMap();
    if(typeof renderRobTimelineList === 'function') renderRobTimelineList();
    if(typeof renderRobUpdatesList === 'function') renderRobUpdatesList();
  }
}
window.robNav=robNav;

/* ═══════════════════════════
   GOODNIGHT LETTER SCHEDULER
   Real date-based controls (Dev tab). Replaces the old fake
   `dayOfYear % 2 === 0` countdown that ran regardless of anything
   Robert actually scheduled.
═══════════════════════════ */
function renderRobGoodnight(){
  const statusEl = document.getElementById('rob-gn-status');
  const dateEl   = document.getElementById('rob-gn-date');
  if(!statusEl && !dateEl) return;

  const dateStr = (typeof goodnightLetterNextDate !== 'undefined') ? goodnightLetterNextDate : null;
  if(dateEl) dateEl.value = dateStr || '';

  if(!statusEl) return;
  if(!dateStr){
    statusEl.textContent = 'Nothing scheduled — Ana\'s home card will say so';
    return;
  }
  const todayStr = new Date().toLocaleDateString('en-CA');
  if(dateStr <= todayStr){
    statusEl.textContent = '🌙 Live now — Ana sees "Letter available, Tonight"';
  } else {
    const target = new Date(dateStr + 'T00:00:00');
    statusEl.textContent = '📅 Scheduled for ' + target.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });
  }
}
window.renderRobGoodnight = renderRobGoodnight;

function _saveGoodnightDate(dateStr){
  // BUG (fixed): before this, NOTHING ever notified Ana when a real
  // Goodnight Letter actually became available — the only push that
  // mentioned a "goodnight letter" was the unrelated shopGoodNight shop
  // feature's nightly cron push, which fires every night purely because
  // Ana bought "Good Night Mode" (a generic animated card), regardless
  // of whether Robert had ever scheduled anything here. So the wording
  // was wrong for that feature, AND the feature that's actually real —
  // this one — sent no notification of its own. Fixed by triggering an
  // accurate, one-time push right here, the moment this date actually
  // goes live, completely decoupled from shopGoodNight.
  const todayStr = new Date().toLocaleDateString('en-CA');
  const wasLive = !!(goodnightLetterNextDate && goodnightLetterNextDate <= todayStr);
  goodnightLetterNextDate = dateStr || null;
  const isLiveNow = !!(goodnightLetterNextDate && goodnightLetterNextDate <= todayStr);
  saveState();
  renderRobGoodnight();
  if(typeof updateGoodnight === 'function') updateGoodnight();

  if(isLiveNow && !wasLive && typeof triggerPush === 'function'){
    triggerPush('ana', '💌 Goodnight letter is ready', 'Robert left you a real goodnight letter tonight — open Heartly to read it.', 'heartly-goodnight-letter');
  }
}

function dvSetGoodnightLetter(){
  const input = document.getElementById('rob-gn-date');
  if(!input || !input.value){ T('⚠️ Pick a date first'); return; }
  _saveGoodnightDate(input.value);
  T('🌙 Goodnight letter scheduled');
}
window.dvSetGoodnightLetter = dvSetGoodnightLetter;

function dvGoodnightTonight(){
  _saveGoodnightDate(new Date().toLocaleDateString('en-CA'));
  T('🌙 Marked ready for tonight');
}
window.dvGoodnightTonight = dvGoodnightTonight;

function dvClearGoodnightLetter(){
  _saveGoodnightDate(null);
  T('✕ Goodnight letter cleared');
}
window.dvClearGoodnightLetter = dvClearGoodnightLetter;

/* ═══════════════════════════
   ANA STATS (Activity tab)
═══════════════════════════ */
function startRobTimer(){
  // Days together
  const el = document.getElementById('rob-timer-days');
  if(el){
    const diff = new Date() - relStartDate();
    el.textContent = Math.floor(diff/86400000).toLocaleString();
  }
  // Points
  const pts = document.getElementById('rob-stat-pts');
  if(pts) pts.textContent = Math.floor(ptsVal).toLocaleString();
  // Letters sent
  const read = document.getElementById('rob-stat-read');
  if(read) read.textContent = sentLetters ? sentLetters.filter(l=>l.read).length : 0;
  // Mood
  updateRobMoodCard();
  // Dev pts display
  updateDevPtsDisplay();
}
window.startRobTimer = startRobTimer;

/* ═══════════════════════════
   DEV LETTER LIBRARY LIST
   (mirrors the main dev list — actions live in js/dev.js)
═══════════════════════════ */
var _robDevListCache = null;
var _robDevListDirty = true;
function renderDevListRob(){
  const list = document.getElementById('dev-list-rob');
  if(!list) return;
  // Only render if dirty flag set
  if(!_robDevListDirty) return;
  _robDevListDirty = false;

  if(devCurrentTab === 'templates') return renderTemplatesListRob(list);

  const items = ED[devCurrentTab]||[];

  // Update count badge
  const countEl = document.getElementById('rob-dev-count');
  if(countEl) countEl.textContent = items.length + ' letter' + (items.length!==1?'s':'');

  list.innerHTML = items.map((it,i)=>{
    const isSurprise = !!it.surpriseType;
    const title   = it.letter ? it.letter.t : it.l.replace('\n',' ');
    const preview = isSurprise ? '🎬 Animated surprise — edit name/price in Surprises Pricing below' : (it.letter ? it.letter.b.replace(/<[^>]+>/g,'').substring(0,55)+'…' : 'Locked — no content yet');
    const price   = it.price || 0;
    const showPrice = it.lk;
    return `<div class="dev-item${!it.letter && !isSurprise?' locked-item':''}" style="animation-delay:${i*.03}s">
      <div class="dev-item-head">
        <div class="dev-item-title" data-no-iconify>${title}</div>
        ${it.lk?'<span style="font-size:9px;color:var(--tx3);background:rgba(255,255,255,.06);padding:2px 8px;border-radius:999px">LOCKED</span>':''}
        ${it.lk && it.previewOnce?`<span style="font-size:9px;color:var(--mint);background:rgba(110,232,180,.1);padding:2px 8px;border-radius:999px">${it.previewUsed?'👀 PEEKED':'👀 FREE PEEK'}</span>`:''}
      </div>
      <div class="dev-item-sub" data-no-iconify>${preview}</div>
      ${showPrice ? `<div class="dev-item-price">
        <span class="dev-price-label">🪙 Price</span>
        <input class="dev-price-input" type="number" id="price-rob-${i}" value="${price}" min="0" max="99999" placeholder="0">
        <button class="dev-price-save rw" onclick="saveLetterPrice(${i}, 'rob');R(event,this)">Save</button>
      </div>` : `<div class="dev-item-price"><span class="dev-price-label">🔓 Unlocked</span><span class="dev-price-free">Free to read</span></div>`}
      <div class="dev-item-actions">
        ${isSurprise
          ? `<span class="dev-btn" style="opacity:.5;cursor:default" title="Surprises don't have text content — rename/reprice them in the Surprises Pricing panel below instead, editing here would break the animation">✏️ Use Surprises Pricing ↓</span>`
          : `<button class="dev-btn edit" onclick="openDevEditor(${i})">✏️ Edit</button>`}
        ${it.lk
          ? `<button class="dev-btn unlock" onclick="devUnlock(${i})">🔓 Unlock</button>`
          : `<button class="dev-btn unlock" onclick="devLock(${i})">🔒 Lock</button>`}
        ${!it.lk ? `<button class="dev-btn rw" style="background:rgba(200,168,240,.1);border-color:rgba(200,168,240,.2);color:var(--lilac)" onclick="${it.secret?'revealSecret':'markSecret'}('${devCurrentTab}',${i});R(event,this)">${it.secret?'🔓 Reveal':'🔒 Secret'}</button>` : ''}
        ${it.lk && it.previewOnce && it.previewUsed ? `<button class="dev-btn rw" style="background:rgba(110,232,180,.1);border-color:rgba(110,232,180,.25);color:var(--mint)" onclick="devResetPreview(${i});R(event,this)">🔄 Reset peek</button>` : ''}
        ${isSurprise ? '' : `<button class="dev-btn del" onclick="devDelete(${i})">🗑️</button>`}
      </div>
    </div>`;
  }).join('');
}
window.renderDevListRob=renderDevListRob;

// Templates tab — reuses the dev-list-rob container but reads/writes
// letterTemplates instead of ED[cat]. Templates have no lock/price/secret
// state, so this list is much simpler than the letter list above.
function renderTemplatesListRob(list){
  const items = letterTemplates||[];
  const countEl = document.getElementById('rob-dev-count');
  if(countEl) countEl.textContent = items.length + ' template' + (items.length!==1?'s':'');

  if(!items.length){
    list.innerHTML = `<div class="dev-item" style="text-align:center;color:var(--tx2);font-size:13px;padding:20px">
      No templates yet — open any note/surprise/letter and tap "📄 Save as Template" to create one.
    </div>`;
    return;
  }

  list.innerHTML = items.map((tpl,i)=>{
    const preview = (tpl.body||'').replace(/\n+/g,' ').substring(0,55) + ((tpl.body||'').length>55?'…':'');
    return `<div class="dev-item" style="animation-delay:${i*.03}s">
      <div class="dev-item-head">
        <div class="dev-item-title" data-no-iconify>${tpl.name || tpl.title || 'Untitled template'}</div>
      </div>
      <div class="dev-item-sub" data-no-iconify>${preview || 'No body text'}</div>
      <div class="dev-item-actions">
        <button class="dev-btn edit" onclick="openTemplateEditor(${i})">✏️ Edit</button>
        <button class="dev-btn del" onclick="deleteTemplate(${i})">🗑️</button>
      </div>
    </div>`;
  }).join('');
}
window.renderTemplatesListRob=renderTemplatesListRob;

/* ═══════════════════════════
   ACCOUNT SWITCHING
═══════════════════════════ */
function switchToRobert(){
  // Close profile
  closeProf();
  setTimeout(()=>{
    showRobertView();
  }, 300);
}
window.switchToRobert = switchToRobert;

function switchToAna(){
  document.getElementById('ROBERT').classList.remove('show');
  currentUser = 'nevasta.lui.robert';
  T('👩 Switched to Ana\'s account');
}
window.switchToAna = switchToAna;

function switchToLogin(){
  document.getElementById('ROBERT').classList.remove('show');
  closeProf();
  const lg = document.getElementById('LOGIN');
  lg.style.display = 'flex';
  lg.classList.remove('gone');
  currentUser = null;
}
window.switchToLogin = switchToLogin;

/* ═══════════════════════════
   SENT ARCHIVE
   Real entries are pushed by js/dev.js (_devAnnounceLetterAvailable)
   any time a letter actually becomes available to Ana — creating a new
   unlocked letter, unlocking a previously-locked one, or editing a
   locked one to unlock it. This list is the true record of what Ana
   has actually been sent, not a separate authoring step.
═══════════════════════════ */
function renderSentLetters(){
  const list = document.getElementById('sent-list');
  if(!list) return;
  if(!sentLetters || sentLetters.length === 0){
    list.innerHTML = '<div style="text-align:center;padding:30px 0;font-size:13px;color:var(--tx3)">No letters sent yet.<br>Write Ana something beautiful 💕</div>';
    return;
  }
  const typeIcon  = {letter:'💌', note:'📝', surprise:'🎁'};
  const typeLabel = {letter:'Letter', note:'Short Note', surprise:'Surprise'};
  list.innerHTML = sentLetters.map((l,i)=>{
    const onclick = l.scheduled
      ? `T('🕐 Scheduled for ${(l.scheduleDate||'soon')}')`
      : `previewSent(${i})`;
    const badge = l.scheduled
      ? `<span class="sent-scheduled-badge">🕐 Scheduled</span>`
      : `<span class="sent-read-badge ${l.read?'read':'unread'}">${l.read?'✓ Read by Ana':'Unread'}</span>`;
    // Strip HTML tags for the plain-text preview snippet — real letter
    // bodies are stored as HTML (<br> line breaks) since that's what
    // the letter modal renders via innerHTML.
    const plainBody = (l.body||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    return `<div class="sent-item" style="animation-delay:${i*.04}s" onclick="${onclick}">
      <div class="sent-item-head">
        <div class="sent-item-title"><span>${typeIcon[l.type]||'💌'}</span> <span data-no-iconify>${l.title}</span></div>
        <div class="sent-item-date">${l.date}</div>
      </div>
      <div class="sent-item-preview" data-no-iconify>"${plainBody.substring(0,80)}${plainBody.length>80?'…':''}"</div>
      <div class="sent-item-footer">
        <span class="sent-type-tag">${typeLabel[l.type]||'Letter'}</span>
        ${badge}
        ${l.reaction ? '<span class="sent-reaction" data-no-iconify title="'+l.reaction.label+'">'+l.reaction.emoji+'</span>' : ''}
      </div>
    </div>`;
  }).join('');
}
window.renderSentLetters=renderSentLetters;

function previewSent(i){
  const l = sentLetters[i];
  if(!l) return;
  // l.body is already real HTML (<br> line breaks) for anything sent
  // through the current Dev-tab pipeline.
  openLetter('From Robert', l.title, l.body, l.sig);
}
window.previewSent=previewSent;

function updateSentBadge(){
  const tab = document.querySelector('.rob-tab[data-rs="sent"]');
  if(!tab) return;
  let badge = tab.querySelector('.rob-tab-badge');
  if(sentUnreadBadge){
    if(!badge){
      badge = document.createElement('div');
      badge.className = 'rob-tab-badge';
      tab.style.position = 'relative';
      tab.appendChild(badge);
    }
  } else {
    if(badge) badge.remove();
  }
}
window.updateSentBadge = updateSentBadge;

/* ═══ LONG-PRESS MOOD HISTORY ═══ */
function initMoodLongPress(){
  document.querySelectorAll('.mood-row .mood').forEach(function(el){
    setupLongPress(el, function(e){
      const hist = anaMood.history;
      if(!hist || !hist.length){
        T('No mood history yet 💭');
        return;
      }
      const rows = hist.slice(0,5).map(m=>`
        <div class="lp-pop-row">
          <div class="lp-pop-emoji">${m.emoji}</div>
          <div class="lp-pop-label">${m.label}</div>
          <div class="lp-pop-time">${m.time}</div>
        </div>`).join('');
      showLpPop(`<div class="lp-pop-title">Mood History</div>${rows}`, el);
    }, 600);
  });
}
window.initMoodLongPress = initMoodLongPress;

// Also wire long-press on Robert's own mood row in Activity
function initRobMoodLongPress(){
  const row = document.querySelector('#rob-activity .mood-row');
  if(!row) return;
  row.querySelectorAll('.mood').forEach(function(el){
    setupLongPress(el, function(){
      // Show Ana's mood history (Robert sees it)
      const hist = anaMood.history;
      if(!hist || !hist.length){ T('No mood history yet 💭'); return; }
      const rows = hist.slice(0,5).map(m=>`
        <div class="lp-pop-row">
          <div class="lp-pop-emoji">${m.emoji}</div>
          <div class="lp-pop-label">${m.label}</div>
          <div class="lp-pop-time">${m.time}</div>
        </div>`).join('');
      showLpPop(`<div class="lp-pop-title">Ana's Mood History</div>${rows}`, el);
    }, 600);
  });
}
window.initRobMoodLongPress = initRobMoodLongPress;

/* ═══ SECRET LETTERS — REVEAL ═══ */
function revealSecret(cat, idx){
  if(!ED[cat] || !ED[cat][idx]) return;
  ED[cat][idx].secret = false;
  _robDevListDirty = true;
  renderDevListRob();
  renderGrid(cat);
  showSuccess('🔓', 'Revealed!', 'rgba(245,200,112,.2)');
  T('🔓 Secret letter revealed to Ana!');
}
window.revealSecret = revealSecret;

function markSecret(cat, idx){
  if(!ED[cat] || !ED[cat][idx]) return;
  ED[cat][idx].secret = true;
  _robDevListDirty = true;
  renderDevListRob();
  renderGrid(cat);
  T('🔒 Letter hidden as secret mystery');
}
window.markSecret = markSecret;

/* ═══════════════════════════
   SCHEDULING CALENDAR (Dev tab)
   Shows real sent letters on the day they went out. Dots are derived
   from each sentLetters entry's real timestamp (`ts`) — falls back to
   the legacy 'Just now' display string for any entry saved by an
   older build before `ts` existed, so history isn't lost on upgrade.
═══════════════════════════ */
function initCal(){
  calMonth = new Date();
  calMonth.setDate(1);
  renderCal();
}
window.initCal = initCal;

function renderCal(){
  var container = document.getElementById('rob-cal-grid');
  var titleEl   = document.getElementById('rob-cal-title');
  if(!container || !titleEl) return;

  var now   = new Date();
  var year  = calMonth.getFullYear();
  var month = calMonth.getMonth();

  titleEl.textContent = calMonth.toLocaleDateString('en-GB',{month:'long',year:'numeric'});

  // Get all sent-letter dates
  var letterDates = {}; // 'YYYY-MM-DD' -> [{title, type, scheduled}]
  sentLetters.forEach(function(l){
    var dateStr = null;
    if(l.scheduleDate){
      dateStr = l.scheduleDate; // legacy scheduled entry — already YYYY-MM-DD
    } else if(typeof l.ts === 'number'){
      dateStr = _toDateStr(new Date(l.ts));
    } else if(l.date === 'Just now'){
      // Legacy entry with no real timestamp — best guess is "today"
      dateStr = _toDateStr(now);
    }
    if(dateStr){
      if(!letterDates[dateStr]) letterDates[dateStr] = [];
      letterDates[dateStr].push({title:l.title, type:l.type, scheduled:!!l.scheduled});
    }
  });

  // Build grid
  var firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  // Shift so week starts Monday
  firstDay = (firstDay + 6) % 7;
  var daysInMonth  = new Date(year, month+1, 0).getDate();
  var daysInPrev   = new Date(year, month, 0).getDate();

  var cells = [];
  // Prev month padding
  for(var i = firstDay - 1; i >= 0; i--){
    cells.push({day: daysInPrev - i, thisMonth: false, dateStr: null});
  }
  // This month
  for(var d = 1; d <= daysInMonth; d++){
    var ds = _toDateStrFromParts(year, month, d);
    cells.push({day:d, thisMonth:true, dateStr:ds,
      isToday: ds === _toDateStr(now),
      letters: letterDates[ds] || []
    });
  }
  // Next month padding to complete grid rows
  var remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for(var n = 1; n <= remaining; n++){
    cells.push({day:n, thisMonth:false, dateStr:null});
  }

  container.innerHTML = cells.map(function(c){
    var cls = 'rob-cal-day';
    if(!c.thisMonth) cls += ' other-month';
    if(c.isToday) cls += ' today';
    var dots = '';
    if(c.letters && c.letters.length){
      dots = c.letters.map(function(l){
        return '<div class="rob-cal-dot' + (l.scheduled ? ' scheduled' : '') + '"></div>';
      }).join('');
    }
    var onclick = c.thisMonth && c.letters && c.letters.length
      ? 'calSelectDate("' + c.dateStr + '")'
      : '';
    return '<div class="' + cls + '" ' + (onclick ? 'onclick="' + onclick + '"' : '') + '>' +
      '<div class="rob-cal-dn">' + c.day + '</div>' +
      dots +
      '</div>';
  }).join('');

  // Re-render popup if a date is selected
  if(calSelectedDate && letterDates[calSelectedDate]){
    renderCalPop(calSelectedDate, letterDates[calSelectedDate]);
  } else {
    clearCalPop();
  }
}
window.renderCal = renderCal;

function calSelectDate(dateStr){
  if(calSelectedDate === dateStr){
    calSelectedDate = null;
    clearCalPop();
    return;
  }
  calSelectedDate = dateStr;
  // Find letters for this date
  var letters = [];
  sentLetters.forEach(function(l){
    var ds = l.scheduleDate ||
      (typeof l.ts === 'number' ? _toDateStr(new Date(l.ts)) :
        (l.date === 'Just now' ? _toDateStr(new Date()) : null));
    if(ds === dateStr) letters.push({title:l.title, type:l.type, scheduled:!!l.scheduled});
  });
  renderCalPop(dateStr, letters);
}
window.calSelectDate = calSelectDate;

function renderCalPop(dateStr, letters){
  var pop = document.getElementById('rob-cal-pop');
  if(!pop) return;
  var d = new Date(dateStr + 'T00:00:00');
  var label = d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
  var typeIco = {note:'📝', surprise:'🎁', letter:'💌'};
  pop.style.display = 'block';
  pop.innerHTML = letters.map(function(l){
    return '<div class="rob-cal-pop-row">' +
      '<div class="rob-cal-pop-type">' + (typeIco[l.type]||'💌') + '</div>' +
      '<div class="rob-cal-pop-title">' + l.title + '</div>' +
      '<div class="rob-cal-pop-status" style="background:rgba(' +
        (l.scheduled ? '245,200,112,.1);color:var(--gold);border:1px solid rgba(245,200,112,.2)' :
                       '110,232,180,.1);color:var(--mint);border:1px solid rgba(110,232,180,.2)') +
      '">' + (l.scheduled ? '🕐 Scheduled' : '✅ Sent') + '</div>' +
    '</div>';
  }).join('');
}

function clearCalPop(){
  var pop = document.getElementById('rob-cal-pop');
  if(pop) pop.style.display = 'none';
}

function calPrevMonth(){
  calMonth.setMonth(calMonth.getMonth() - 1);
  calSelectedDate = null;
  renderCal();
}
window.calPrevMonth = calPrevMonth;

function calNextMonth(){
  calMonth.setMonth(calMonth.getMonth() + 1);
  calSelectedDate = null;
  renderCal();
}
window.calNextMonth = calNextMonth;

// Helpers
function _toDateStr(d){
  return d.getFullYear() + '-' +
    String(d.getMonth()+1).padStart(2,'0') + '-' +
    String(d.getDate()).padStart(2,'0');
}
function _toDateStrFromParts(y, m, d){
  return y + '-' + String(m+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
}

/* ═══════════════════════════════════════════════
   DEV PANEL — FULL CONTROL SYSTEM
═══════════════════════════════════════════════ */

// ── SUB-TAB NAVIGATION ──────────────────────────────────────
function dvTab(id){
  document.querySelectorAll('.dv-pane').forEach(p=>p.style.display='none');
  document.querySelectorAll('#dv-tabs .dv-tab-btn').forEach(b=>b.classList.remove('on'));
  const pane = document.getElementById('dv-'+id);
  if(pane) pane.style.display='flex', pane.style.flexDirection='column', pane.style.gap='12px';
  const btn = document.querySelector('#dv-tabs .dv-tab-btn[data-dv="'+id+'"]');
  if(btn) btn.classList.add('on');

  // Refresh content on switch
  if(id==='content')  dvRenderLoveLanguages();
  if(id==='features'){ dvRenderShopPanel(); dvRenderAchievementsPanel(); dvRenderFeatures(); }
  if(id==='pts')      dvRenderPts();
  if(id==='tools'){
    if(typeof dvPaRefreshList==='function') dvPaRefreshList();
    dvRenderBackups();
  }
}
window.dvTab = dvTab;

// ── LOVE LANGUAGES (read-only — Ana sets these in her own Settings) ──
// Real, synced data: currentLoveLangs now flows through saveState/
// applyState like everything else (see js/state.js), so whatever Ana
// last saved on her device shows up here once it syncs, exactly like
// her mood or her wish list already do. Robert can't edit these here —
// they're Ana's own self-reported answers, not a Dev-tool toggle.
function dvRenderLoveLanguages(){
  const list = document.getElementById('dv-love-lang-list');
  if(!list) return;
  if(!currentLoveLangs || !currentLoveLangs.length){
    list.innerHTML = '<div style="font-size:11px;color:rgba(0,255,180,.3);text-align:center;padding:14px 0">Ana hasn\'t set these yet</div>';
    return;
  }
  const sorted = [...currentLoveLangs].sort((a,b)=>b.value-a.value);
  list.innerHTML = sorted.map((lang,i)=>`
    <div style="margin-bottom:${i===sorted.length-1?0:12}px">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px">
        <span style="font-size:12px;font-weight:700;color:#fff">${i===0?'🥇 ':''}${lang.name}</span>
        <span style="font-size:11px;color:rgba(0,255,180,.7);font-weight:700">${lang.value}%</span>
      </div>
      <div class="dv-bar-track">
        <div class="dv-bar-fill" style="width:${lang.value}%;background:${lang.color||'rgba(0,255,180,.5)'}"></div>
      </div>
    </div>`).join('');
}
window.dvRenderLoveLanguages = dvRenderLoveLanguages;

// ── HEADER STATS ────────────────────────────────────────────
function dvUpdateHeader(){
  const pEl = document.getElementById('dv-pts-val');
  const sEl = document.getElementById('dv-sent-val');
  if(pEl) pEl.textContent = Math.floor(ptsVal).toLocaleString();
  if(sEl) sEl.textContent = sentLetters ? sentLetters.length : 0;
}
window.dvUpdateHeader = dvUpdateHeader;

// ── SHOP PANEL — shows each shop item + robert config button ─
function dvRenderShopPanel(){
  const list = document.getElementById('dv-shop-list');
  if(!list || typeof SHOP_ITEMS==='undefined') return;

  list.innerHTML = SHOP_ITEMS.map(item=>{
    const owned = !!window[item.stateKey];
    const statusColor = owned ? 'rgba(0,255,180,.8)' : 'rgba(255,255,255,.25)';
    const statusTxt   = owned ? '✓ ACTIVE' : 'LOCKED';
    return `<div class="dv-toggle-row">
      <div class="dv-toggle-ico">${item.ico}</div>
      <div class="dv-toggle-info">
        <div class="dv-toggle-name">${item.name}</div>
        <div class="dv-toggle-desc" style="color:${statusColor};font-weight:800;font-size:9px;letter-spacing:.5px">${statusTxt}</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center;flex-shrink:0">
        ${item.hasConfig && owned ? `<button class="dv-btn small purple" onclick="dvOpenFeatureConfig('${item.id}')">Config</button>` : ''}
        ${!owned ? `<button class="dv-btn small" onclick="dvForceUnlock('${item.id}')">Grant</button>` : ''}
        ${owned  ? `<button class="dv-btn small danger" onclick="dvRevoke('${item.id}')">Revoke</button>` : ''}
      </div>
    </div>`;
  }).join('');
}
window.dvRenderShopPanel = dvRenderShopPanel;

function dvForceUnlock(id){
  if(typeof shopBuyItem==='function'){
    // Skip cost — directly set
    const item = SHOP_ITEMS.find(i=>i.id===id);
    if(!item) return;
    window[item.stateKey] = true;
    if(typeof applyShopUnlocks==='function') applyShopUnlocks();
    if(typeof addTxItem==='function') addTxItem(item.ico,'[DEV] '+item.name+' granted','Just now','FREE','earn');
    if(typeof T==='function') T(item.ico+' '+item.name+' granted');
    if(typeof saveState==='function') saveState();
    dvRenderShopPanel();
    dvRenderFeatures();
  }
}
window.dvForceUnlock = dvForceUnlock;

function dvRevoke(id){
  const item = SHOP_ITEMS && SHOP_ITEMS.find(i=>i.id===id);
  if(!item) return;
  window[item.stateKey] = typeof window[item.stateKey]==='boolean' ? false : null;
  if(typeof applyShopUnlocks==='function') applyShopUnlocks();
  if(typeof saveState==='function') saveState();
  T('Revoked: '+item.name);
  dvRenderShopPanel();
  dvRenderFeatures();
}
window.dvRevoke = dvRevoke;

async function dvForceUnlockAllShop(){
  const ok = await appModal({ icon: '🎁', title: 'Grant ALL shop items for free?', confirmLabel: 'Grant all' });
  if(!ok) return;
  if(typeof SHOP_ITEMS==='undefined') return;
  SHOP_ITEMS.forEach(item=>{ window[item.stateKey] = true; });
  if(typeof applyShopUnlocks==='function') applyShopUnlocks();
  if(typeof saveState==='function') saveState();
  if(typeof checkAchievements === 'function') checkAchievements();
  T('✓ All shop items unlocked');
  dvRenderShopPanel();
  dvRenderFeatures();
}
window.dvForceUnlockAllShop = dvForceUnlockAllShop;

// ── ACHIEVEMENTS PANEL — grant/revoke any achievement manually ──
function dvRenderAchievementsPanel(){
  const list = document.getElementById('dv-ach-list');
  if(!list || typeof ACH_DATA==='undefined') return;

  list.innerHTML = ACH_DATA.map(a=>{
    const earned = !!earnedAchievements[a.id];
    const statusColor = earned ? 'rgba(0,255,180,.8)' : 'rgba(255,255,255,.25)';
    const statusTxt   = earned ? '✓ EARNED' : 'LOCKED';
    return `<div class="dv-toggle-row">
      <div class="dv-toggle-ico">${achIco(a.ico)}</div>
      <div class="dv-toggle-info">
        <div class="dv-toggle-name">${a.name}</div>
        <div class="dv-toggle-desc" style="color:${statusColor};font-weight:800;font-size:9px;letter-spacing:.5px">${statusTxt}</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center;flex-shrink:0">
        ${!earned ? `<button class="dv-btn small" onclick="dvGrantAchievement('${a.id}')">Grant</button>` : ''}
        ${earned  ? `<button class="dv-btn small danger" onclick="dvRevokeAchievement('${a.id}')">Revoke</button>` : ''}
      </div>
    </div>`;
  }).join('');
}
window.dvRenderAchievementsPanel = dvRenderAchievementsPanel;

function dvGrantAchievement(id){
  const a = ACH_DATA.find(x=>x.id===id);
  if(!a) return;
  earnedAchievements[id] = Date.now();
  if(typeof saveState==='function') saveState();
  if(typeof T==='function') T(a.ico+' '+a.name+' granted');
  if(typeof renderAchievements==='function') renderAchievements();
  dvRenderAchievementsPanel();
}
window.dvGrantAchievement = dvGrantAchievement;

function dvRevokeAchievement(id){
  const a = ACH_DATA.find(x=>x.id===id);
  if(!a) return;
  delete earnedAchievements[id];
  if(typeof saveState==='function') saveState();
  if(typeof T==='function') T('Revoked: '+a.name);
  if(typeof renderAchievements==='function') renderAchievements();
  dvRenderAchievementsPanel();
}
window.dvRevokeAchievement = dvRevokeAchievement;

async function dvGrantAllAchievements(){
  // BUG (fixed): this used to hardcode "Grant ALL 55 achievements" from
  // an earlier build that had 55 achievements across 9 categories. The
  // real list has since been reworked down to 49 across 8 categories
  // (see readme.md changelog) and the count drifted out of sync with
  // reality. Reading ACH_DATA.length directly means this label can
  // never go stale again, no matter how the achievement list changes.
  const count = (typeof ACH_DATA !== 'undefined') ? ACH_DATA.length : '';
  const ok = await appModal({ icon: '🏆', title: `Grant ALL ${count} achievements?`, confirmLabel: 'Grant all' });
  if(!ok) return;
  if(typeof ACH_DATA==='undefined') return;
  ACH_DATA.forEach(a=>{ earnedAchievements[a.id] = Date.now(); });
  if(typeof saveState==='function') saveState();
  T('✓ All achievements granted');
  if(typeof renderAchievements === 'function') renderAchievements();
  dvRenderAchievementsPanel();
}
window.dvGrantAllAchievements = dvGrantAllAchievements;

async function dvRevokeAllAchievements(){
  const ok = await appModal({ icon: '🚫', title: 'Revoke ALL achievements?', subtitle: 'Note: any achievement whose real condition is still met (e.g. a streak or points total already earned) will re-appear the next time the app checks stats.', confirmLabel: 'Revoke all' });
  if(!ok) return;
  earnedAchievements = {};
  window.earnedAchievements = earnedAchievements;
  if(typeof saveState==='function') saveState();
  T('Revoked all achievements');
  if(typeof renderAchievements === 'function') renderAchievements();
  dvRenderAchievementsPanel();
}
window.dvRevokeAllAchievements = dvRevokeAllAchievements;

function dvOpenFeatureConfig(id){
  const map = {
    'couple_song':'dv-feat-couple-song','memory_jar':'dv-feat-memory-jar',
    'countdown_timer':'dv-feat-countdown','good_night':'dv-feat-goodnight',
    'couple_goals':'dv-feat-couple-goals',
    'date_night':'dv-feat-date-night','daily_question':'dv-feat-daily-q',
    'photo_of_day':'dv-feat-photo','puzzle_of_week':'dv-feat-puzzle',
  };
  const cardId = map[id];
  if(!cardId) return;
  const card = document.getElementById(cardId);
  if(card) card.scrollIntoView({behavior:'smooth',block:'start'});
}
window.dvOpenFeatureConfig = dvOpenFeatureConfig;

// ── FEATURES PANEL — shows only unlocked configurable items ─
function dvRenderFeatures(){
  // Show/hide each feature card based on unlock state
  const map = {
    'shopCoupleSong':     'dv-feat-couple-song',
    'shopMemoryJar':      'dv-feat-memory-jar',
    'shopCountdown':      'dv-feat-countdown',
    'shopGoodNight':      'dv-feat-goodnight',
    'shopCoupleGoals':    'dv-feat-couple-goals',
    'shopDateNight':      'dv-feat-date-night',
    'shopDailyQuestion':  'dv-feat-daily-q',
    'shopPhotoOfDay':     'dv-feat-photo',
    'shopPuzzleOfWeek':   'dv-feat-puzzle',
  };
  let anyVisible = false;
  Object.entries(map).forEach(([stateKey, cardId])=>{
    const card = document.getElementById(cardId);
    if(!card) return;
    const show = !!window[stateKey];
    card.style.display = show ? 'block' : 'none';
    if(show) anyVisible = true;
  });
  const noFeat = document.getElementById('dv-no-features');
  if(noFeat) noFeat.style.display = anyVisible ? 'none' : 'block';

  // Populate existing data
  if(shopCoupleSong){
    const t = document.getElementById('dv-song-title');
    const a = document.getElementById('dv-song-artist');
    if(t) t.value = shopCoupleSong.title||'';
    if(a) a.value = shopCoupleSong.artist||'';
  }
  if(shopCountdownData){
    const l = document.getElementById('dv-cd-label');
    const d = document.getElementById('dv-cd-date');
    if(l) l.value = shopCountdownData.label||'';
    if(d) d.value = shopCountdownData.date||'';
  }
  const gnt = document.getElementById('dv-gn-time');
  if(gnt) gnt.value = shopGoodNightTime||'22:00';
  if(dailyQuestionData){
    const dq = document.getElementById('dv-dq-input');
    if(dq) dq.value = dailyQuestionData.question||'';
  }

  dvRenderMemoryList();
  dvRenderGoalsList();
  dvRenderDateNightList();
}
window.dvRenderFeatures = dvRenderFeatures;

// ── COUPLE SONG ─────────────────────────────────────────────
function dvSetCoupleSong(){
  const title  = (document.getElementById('dv-song-title') ||{}).value||'';
  const artist = (document.getElementById('dv-song-artist')||{}).value||'';
  if(!title.trim()){ T('⚠️ Enter a song title'); return; }
  shopCoupleSong = {title:title.trim(), artist:artist.trim()};
  if(typeof renderCoupleSong==='function') renderCoupleSong();
  if(typeof saveState==='function') saveState();
  T('🎵 Couple song set: '+shopCoupleSong.title);
}
window.dvSetCoupleSong = dvSetCoupleSong;

// ── MEMORY JAR ──────────────────────────────────────────────
function dvAddMemory(){
  const inp = document.getElementById('dv-memory-input');
  if(!inp||!inp.value.trim()){ T('⚠️ Write a memory first'); return; }
  const now = new Date();
  memoryJarItems.unshift({text:inp.value.trim(), date:now.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})});
  inp.value='';
  dvRenderMemoryList();
  if(typeof saveState==='function') saveState();
  if(typeof checkAchievements === 'function') checkAchievements();
  T('🫙 Memory added!');
}
window.dvAddMemory = dvAddMemory;

function dvRenderMemoryList(){
  const list = document.getElementById('dv-memory-list');
  if(!list) return;
  list.innerHTML = memoryJarItems.length
    ? memoryJarItems.map((m,i)=>`<div class="dv-item-row">
        <div class="dv-item-body"><div class="dv-item-text">${m.text}</div><div class="dv-item-date">${m.date}</div></div>
        <div class="dv-item-del" onclick="memoryJarItems.splice(${i},1);dvRenderMemoryList();saveState()">🗑</div>
      </div>`).join('')
    : '<div style="font-size:11px;color:rgba(0,255,180,.25);text-align:center;padding:12px 0">No memories yet</div>';
}
window.dvRenderMemoryList = dvRenderMemoryList;

// ── COUNTDOWN ───────────────────────────────────────────────
function dvSetCountdown(){
  const label = (document.getElementById('dv-cd-label')||{}).value||'';
  const date  = (document.getElementById('dv-cd-date') ||{}).value||'';
  if(!label.trim()||!date){ T('⚠️ Fill in label and date'); return; }
  shopCountdown     = true;
  shopCountdownData = {label:label.trim(), date};
  if(typeof saveState==='function') saveState();
  if(typeof applyShopUnlocks==='function') applyShopUnlocks();
  T('📅 Countdown set: '+label);
}
window.dvSetCountdown = dvSetCountdown;

// ── GOOD NIGHT ───────────────────────────────────────────────
function dvSetGoodNight(){
  const t = (document.getElementById('dv-gn-time')||{}).value||'22:00';
  shopGoodNightTime = t;
  if(typeof saveState==='function') saveState();
  T('🌙 Goodnight mode set for '+t);
}
window.dvSetGoodNight = dvSetGoodNight;

// ── COUPLE GOALS ─────────────────────────────────────────────
function dvAddGoal(){
  const inp = document.getElementById('dv-goal-input');
  if(!inp||!inp.value.trim()){ T('⚠️ Write a goal first'); return; }
  coupleGoalsList.push({text:inp.value.trim(), done:false});
  inp.value='';
  dvRenderGoalsList();
  if(typeof saveState==='function') saveState();
  T('💑 Goal added!');
}
window.dvAddGoal = dvAddGoal;

function dvRenderGoalsList(){
  const list = document.getElementById('dv-goals-list');
  if(!list) return;
  list.innerHTML = coupleGoalsList.length
    ? coupleGoalsList.map((g,i)=>`<div class="dv-item-row">
        <div class="dv-item-body"><div class="dv-item-text" style="${g.done?'text-decoration:line-through;opacity:.5':''}">${g.text}</div></div>
        <div class="dv-item-del" onclick="coupleGoalsList.splice(${i},1);dvRenderGoalsList();saveState()">🗑</div>
      </div>`).join('')
    : '<div style="font-size:11px;color:rgba(0,255,180,.25);text-align:center;padding:12px 0">No goals yet</div>';
}
window.dvRenderGoalsList = dvRenderGoalsList;

// ── DATE NIGHT ───────────────────────────────────────────────
function dvAddDateNight(){
  const inp = document.getElementById('dv-dn-input');
  if(!inp||!inp.value.trim()){ T('⚠️ Write a date idea first'); return; }
  dateNightIdeas.push(inp.value.trim());
  inp.value='';
  dvRenderDateNightList();
  if(typeof saveState==='function') saveState();
  T('🎲 Date idea added!');
}
window.dvAddDateNight = dvAddDateNight;

function dvRenderDateNightList(){
  const list = document.getElementById('dv-datenight-list');
  if(!list) return;
  list.innerHTML = dateNightIdeas.length
    ? dateNightIdeas.map((d,i)=>`<div class="dv-item-row">
        <div class="dv-item-body"><div class="dv-item-text">${d}</div></div>
        <div class="dv-item-del" onclick="dateNightIdeas.splice(${i},1);dvRenderDateNightList();saveState()">🗑</div>
      </div>`).join('')
    : '<div style="font-size:11px;color:rgba(0,255,180,.25);text-align:center;padding:12px 0">No ideas yet</div>';
}
window.dvRenderDateNightList = dvRenderDateNightList;

// ── DAILY QUESTION ───────────────────────────────────────────
function dvSetDailyQuestion(){
  const inp = document.getElementById('dv-dq-input');
  if(!inp||!inp.value.trim()){ T('⚠️ Write a question first'); return; }
  dailyQuestionData = {question:inp.value.trim(), answer:null, date:getTodayISO()};
  if(typeof saveState==='function') saveState();
  T('💬 Daily question set!');
}
window.dvSetDailyQuestion = dvSetDailyQuestion;

// ── PHOTO OF THE DAY ────────────────────────────────────────
function dvSetPhotoOfDay(input){
  const file = input.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    photoOfDayData = {dataUrl:e.target.result, date:getTodayISO()};
    const prev = document.getElementById('dv-photo-preview');
    if(prev) prev.textContent = '✓ Photo set for today';
    if(typeof saveState==='function') saveState();
    if(typeof applyShopUnlocks==='function') applyShopUnlocks();
    T('📸 Photo of the day set!');
  };
  reader.readAsDataURL(file);
}
window.dvSetPhotoOfDay = dvSetPhotoOfDay;

// ── PUZZLE ───────────────────────────────────────────────────
function dvSetPuzzle(){
  const inp = document.getElementById('dv-puzzle-msg');
  if(!inp||!inp.value.trim()){ T('⚠️ Write a secret message first'); return; }
  puzzleOfWeekData = {message:inp.value.trim(), solved:false};
  if(typeof saveState==='function') saveState();
  T('🧩 Puzzle of the week set!');
}
window.dvSetPuzzle = dvSetPuzzle;

// ── POINTS ───────────────────────────────────────────────────
function dvAddPts(amt){
  devAddPts(amt);
  dvRenderPts();
}
window.dvAddPts = dvAddPts;

function dvAddCustomPts(){
  const val = parseInt((document.getElementById('dv-custom-pts')||{}).value||0);
  if(!val||val<1){ T('⚠️ Enter a valid amount'); return; }
  devAddPts(val);
  document.getElementById('dv-custom-pts').value='';
  dvRenderPts();
}
window.dvAddCustomPts = dvAddCustomPts;

async function dvResetPts(){
  const ok = await appModal({ icon: '⚠️', title: 'Reset Ana\'s points to 0?', confirmLabel: 'Reset', danger: true });
  if(!ok) return;
  const old=ptsVal; ptsVal=0;
  if(typeof animatePts==='function') animatePts(old,0,600);
  if(typeof saveState==='function') saveState();
  dvRenderPts(); T('Points reset to 0');
}
window.dvResetPts = dvResetPts;

function dvRenderPts(){
  const big = document.getElementById('dv-pts-big');
  if(big) big.textContent = Math.floor(ptsVal).toLocaleString();
  const hdr = document.getElementById('dv-pts-val');
  if(hdr) hdr.textContent = Math.floor(ptsVal).toLocaleString();
  // Unlock status list
  const ul = document.getElementById('dv-unlock-status');
  if(!ul || typeof SHOP_ITEMS==='undefined') return;
  ul.innerHTML = SHOP_ITEMS.map(item=>{
    const owned = !!window[item.stateKey];
    return `<div class="dv-toggle-row">
      <div class="dv-toggle-ico">${item.ico}</div>
      <div class="dv-toggle-info">
        <div class="dv-toggle-name">${item.name}</div>
        <div class="dv-toggle-desc">Cost: ${item.cost} pts</div>
      </div>
      <div style="font-size:10px;font-weight:800;color:${owned?'rgba(0,255,180,.8)':'rgba(255,255,255,.2)'}">${owned?'✓ OWNED':'LOCKED'}</div>
    </div>`;
  }).join('');
}
window.dvRenderPts = dvRenderPts;

/* ═══════════════════════════════════════════════════
   CLOUD BACKUPS (Tools tab)
   Built after the 2026-08-25 data-loss incident. Every snapshot is
   an independent row in couple_state_backups (a table nothing else
   in the app ever writes to) AND a commit to a private GitHub repo —
   two copies, on two different services, that a bug in THIS app can
   never touch. See supabase/functions/backup-state/index.ts.
═══════════════════════════════════════════════════ */
const BACKUP_FN_URL = `${SUPABASE_URL}/functions/v1/backup-state`;

async function _callBackupFn(body){
  const res = await fetch(BACKUP_FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY },
    body: JSON.stringify(body)
  });
  return res.json();
}

// Used by devResetLocalStorage()'s pre-reset safety net (notifications.js)
// and by anything else that wants a safety snapshot before a risky action.
async function triggerManualBackup(reason){
  return _callBackupFn({ action:'run', source: reason || 'manual' });
}
window.triggerManualBackup = triggerManualBackup;

async function dvBackupNow(){
  const btn = document.getElementById('dv-backup-now-btn');
  if(btn){ btn.textContent = '⏳ Backing up…'; btn.disabled = true; }
  try {
    const result = await triggerManualBackup('manual');
    if(result.ok){
      const gh = result.github && result.github.ok ? ' + GitHub' : ' (GitHub failed — Supabase copy still saved)';
      T('✅ Backed up' + gh);
    } else {
      T('❌ Backup failed: ' + (result.reason || 'unknown error'));
    }
  } catch(e){
    T('❌ Backup failed: ' + e.message);
  }
  if(btn){ btn.textContent = '☁️ Backup Now'; btn.disabled = false; }
  dvRenderBackups();
}
window.dvBackupNow = dvBackupNow;

function _backupAgeLabel(iso){
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs/60000);
  if(mins < 1) return 'just now';
  if(mins < 60) return mins+'m ago';
  const hrs = Math.floor(mins/60);
  if(hrs < 24) return hrs+'h ago';
  return Math.floor(hrs/24)+'d ago';
}

async function dvRenderBackups(){
  const list = document.getElementById('dv-backups-list');
  const status = document.getElementById('dv-backups-status');
  if(!list) return;
  list.innerHTML = '<div style="font-size:11px;color:rgba(0,255,180,.3);text-align:center;padding:12px 0">Loading…</div>';
  try {
    const result = await _callBackupFn({ action:'list' });
    if(!result.ok || !result.items || !result.items.length){
      list.innerHTML = '<div style="font-size:11px;color:rgba(0,255,180,.3);text-align:center;padding:12px 0">No backups yet — tap "Backup Now" to create the first one</div>';
      if(status) status.textContent = 'No backups yet';
      return;
    }
    if(status) status.textContent = 'Last backup: ' + _backupAgeLabel(result.items[0].takenAt) + ' · ' + result.items.length + ' snapshot' + (result.items.length!==1?'s':'') + ' kept';
    list.innerHTML = result.items.map(b=>{
      const c = b.counts;
      const when = new Date(b.takenAt).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
      return `<div class="dev-item">
        <div class="dev-item-head">
          <div class="dev-item-title">${when}</div>
          <span style="font-size:9px;color:var(--dev-tx3);background:rgba(255,255,255,.06);padding:2px 8px;border-radius:999px;text-transform:uppercase">${b.source}</span>
        </div>
        <div class="dev-item-sub">📝 ${c.notes} notes · 💌 ${c.letters} letters · 🏆 ${c.achievements} achievements · 🛒 ${c.shopItemsOwned}/${c.shopItemsTotal} shop · 🪙 ${c.pts} pts · 🔥 ${c.streak} streak</div>
        <div class="dev-item-actions">
          <button class="dv-btn small" onclick="dvRestoreBackup(${b.id}, '${when}');R(event,this)">↩️ Restore this</button>
        </div>
      </div>`;
    }).join('');
  } catch(e){
    list.innerHTML = '<div style="font-size:11px;color:var(--dev-red);text-align:center;padding:12px 0">Could not load backups: '+e.message+'</div>';
  }
}
window.dvRenderBackups = dvRenderBackups;

async function dvRestoreBackup(id, whenLabel){
  const ok = await appModal({
    icon: '↩️',
    title: 'Restore this backup?',
    subtitle: `This replaces EVERYTHING currently live — points, streak, achievements, shop unlocks, and all written notes/letters — with the snapshot from ${whenLabel}. Whatever is live right now gets its own safety snapshot first, so this itself can't cause permanent loss. Both devices should reopen the app after this to pick up the restored data.`,
    confirmLabel: 'Restore',
    danger: true
  });
  if(!ok) return;
  T('⏳ Restoring…');
  try {
    const result = await _callBackupFn({ action:'restore', id });
    if(result.ok){
      T('✅ Restored from ' + whenLabel + ' — reloading…');
      setTimeout(()=>location.reload(), 1200);
    } else {
      T('❌ Restore failed: ' + (result.reason || 'unknown error'));
    }
  } catch(e){
    T('❌ Restore failed: ' + e.message);
  }
}
window.dvRestoreBackup = dvRestoreBackup;
