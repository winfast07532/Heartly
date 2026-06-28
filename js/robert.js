/* ═══════════════════════════
   ROBERT'S VIEW
═══════════════════════════ */

// Sent letters store
// sentLetters already declared above

currentLetterType = 'note'; // already declared above

function showRobertView(){
  document.getElementById('ROBERT').classList.add('show');
  startRobCountdown(); // guarded - only starts once
  updateRobProfile();
  // Only render what's needed for the active tab (Write by default)
  // Sent/Dev/Activity render on-demand when tabs are clicked
}

function robNav(id){
  document.querySelectorAll('.rob-SC').forEach(s=>s.classList.remove('on'));
  document.querySelectorAll('.rob-tab').forEach(t=>t.classList.remove('on'));
  const screen = document.getElementById('rob-'+id);
  if(screen) screen.classList.add('on');
  const tab = document.querySelector('.rob-tab[data-rs="'+id+'"]');
  if(tab) tab.classList.add('on');
  document.getElementById('rob-scroll').scrollTop=0;
  // Only do expensive renders when actually switching to that tab
  if(id==='dev' && _robDevListDirty) renderDevListRob();
  if(id==='sent') renderSentLetters();
  if(id==='activity'){
    startRobTimer();
    renderRobAnaMessages();
    // Mark all Ana's messages as read when Robert opens Activity
    anaMessages.forEach(m=>{ m.read = true; });
  }
}
window.robNav=robNav;

function setLetterType(btn){
  document.querySelectorAll('.letter-type-btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  currentLetterType = btn.dataset.type;
  // Update send button icon to match type
  const sendBtn = document.getElementById('rob-send-btn');
  if(sendBtn && !scheduleEnabled){
    const icons = {note:'📝', surprise:'🎁', letter:'💌'};
    const ic = icons[currentLetterType] || '💌';
    sendBtn.innerHTML = ic + ' &nbsp; Send to Ana';
  }
}
window.setLetterType=setLetterType;

function updatePreview(){
  const title = document.getElementById('rob-title').value || 'Your title will appear here';
  const body  = document.getElementById('rob-body').value || 'Start writing to see a preview of your letter...';
  const sig   = document.getElementById('rob-sig').value || '— Always yours, Robert 🌹';
  document.getElementById('prev-title').textContent = title;
  document.getElementById('prev-body').innerHTML = body.replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>') ;
  document.getElementById('prev-sig').textContent = sig;
}
window.updatePreview=updatePreview;

function updateCharCount(){
  const len = (document.getElementById('rob-body').value||'').length;
  document.getElementById('rob-char-count').textContent = len;
}
window.updateCharCount=updateCharCount;

function sendLetter(){
  const title = document.getElementById('rob-title').value.trim();
  const body  = document.getElementById('rob-body').value.trim();
  const sig   = (document.getElementById('rob-sig').value||'').trim() || '— Always yours, Robert 🌹';

  if(!title){ T('⚠️ Please give your letter a title!'); return; }
  if(!body || body.length < 10){ T('⚠️ Write a bit more before sending 💕'); return; }

  const iconMap = {note:'note', surprise:'gift', letter:'letter'};
  const catMap  = {note:'notes', surprise:'surprises', letter:'letters'};
  const cat     = catMap[currentLetterType] || 'notes';
  const icon    = iconMap[currentLetterType] || 'letter';
  const htmlBody = body.replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
  const words   = title.split(' ');
  const mid     = Math.ceil(words.length/2);
  const gridLabel = words.slice(0,mid).join(' ') + '\n' + words.slice(mid).join(' ');

  if(scheduleEnabled){
    const dateVal = document.getElementById('rob-schedule-date').value;
    if(!dateVal){ T('⚠️ Pick a date to schedule!'); return; }
    const schedDate = new Date(dateVal + 'T00:00:00');
    sentLetters.unshift({
      type:currentLetterType, title, body, sig,
      date:'Scheduled for ' + schedDate.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}),
      read:false, scheduled:true, scheduleDate:dateVal
    });
    ED[cat].unshift({i:icon, l:gridLabel, lk:true, letter:{t:title,b:htmlBody,s:sig}, price:0, scheduleDate:dateVal});
    T('🕐 Scheduled! Ana\'s letter unlocks on ' + schedDate.toLocaleDateString('en-GB',{day:'numeric',month:'long'}));
  } else {
    ED[cat].unshift({i:icon, l:gridLabel, lk:false, letter:{t:title,b:htmlBody,s:sig}});
    sentLetters.unshift({type:currentLetterType, title, body, sig, date:'Just now', read:false});
    T('💌 Letter sent to Ana! She can read it in Explore.');
  }

  // Clear form
  document.getElementById('rob-title').value='';
  document.getElementById('rob-body').value='';
  document.getElementById('rob-char-count').textContent='0';
  updatePreview();

  if(typeof pushLetterNotif==='function') pushLetterNotif();
  setTimeout(()=>{ if(typeof renderHomeLetters==='function') renderHomeLetters(); },300);
  setTimeout(()=>robNav('sent'),600);
  renderSentLetters();
}
window.sendLetter=sendLetter;

// Render sent letters list
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
    return `<div class="sent-item" style="animation-delay:${i*.04}s" onclick="${onclick}">
      <div class="sent-item-head">
        <div class="sent-item-title">${typeIcon[l.type]||'💌'} ${l.title}</div>
        <div class="sent-item-date">${l.date}</div>
      </div>
      <div class="sent-item-preview">"${l.body.substring(0,80)}${l.body.length>80?'…':''}"</div>
      <div class="sent-item-footer">
        <span class="sent-type-tag">${typeLabel[l.type]||'Letter'}</span>
        ${badge}
        ${l.reaction ? '<span class="sent-reaction" title="'+l.reaction.label+'">'+l.reaction.emoji+'</span>' : ''}
      </div>
    </div>`;
  }).join('');
}
window.renderSentLetters=renderSentLetters;

function previewSent(i){
  const l = sentLetters[i];
  openLetter('From Robert', l.title, l.body.replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>'), l.sig);
}
window.previewSent=previewSent;

// Robert's countdown mirror (same as Ana's)
var _robCdInterval = null;
function startRobCountdown(){
  if(_robCdInterval) return; // already running
  function update(){
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(),0,0)) / 86400000);
    const daysUntil = dayOfYear % 2 === 0 ? 1 : 0;
    const nextMidnight = new Date(now);
    nextMidnight.setDate(now.getDate() + daysUntil);
    nextMidnight.setHours(0,0,0,0);
    const diff = nextMidnight - now;
    const f = n => String(n).padStart(2,'0');
    const el = document.getElementById('rob-cd');
    if(!el) return;
    if(diff <= 0){
      el.textContent = 'Tonight!';
    } else {
      const h = Math.floor(diff/3600000);
      const m = Math.floor((diff%3600000)/60000);
      const s = Math.floor((diff%60000)/1000);
      el.textContent = `${f(h)}:${f(m)}:${f(s)}`;
    }
  }
  update();
  _robCdInterval = setInterval(update,1000);
}

// Days together counter + wire all Ana stats
function startRobTimer(){
  // Days together
  const el = document.getElementById('rob-timer-days');
  if(el){
    const diff = new Date() - new Date('2023-08-10T00:00:00');
    el.textContent = Math.floor(diff/86400000).toLocaleString();
  }
  // Points
  const pts = document.getElementById('rob-stat-pts');
  if(pts) pts.textContent = Math.floor(ptsVal).toLocaleString();
  // Letters sent
  const read = document.getElementById('rob-stat-read');
  if(read) read.textContent = sentLetters ? sentLetters.filter(l=>l.read).length + 3 : 3;
  // Mood
  updateRobMoodCard();
  // Dev pts display
  updateDevPtsDisplay();
}

// Dev list inside Robert's view (mirrors the main dev list)
var _robDevListCache = null;
var _robDevListDirty = true;
function renderDevListRob(){
  const list = document.getElementById('dev-list-rob');
  if(!list) return;
  // Only render if dirty flag set
  if(!_robDevListDirty) return;
  _robDevListDirty = false;
  const items = ED[devCurrentTab]||[];

  // Update count badge
  const countEl = document.getElementById('rob-dev-count');
  if(countEl) countEl.textContent = items.length + ' letter' + (items.length!==1?'s':'');

  list.innerHTML = items.map((it,i)=>{
    const title   = it.letter ? it.letter.t : it.l.replace('\n',' ');
    const preview = it.letter ? it.letter.b.replace(/<[^>]+>/g,'').substring(0,55)+'…' : 'Locked — no content';
    const price   = it.price || 0;
    const showPrice = it.lk;
    return `<div class="dev-item${!it.letter?' locked-item':''}" style="animation-delay:${i*.03}s">
      <div class="dev-item-head">
        <div class="dev-item-title">${title}</div>
        ${it.lk?'<span style="font-size:9px;color:var(--tx3);background:rgba(255,255,255,.06);padding:2px 8px;border-radius:999px">LOCKED</span>':''}
      </div>
      <div class="dev-item-sub">${preview}</div>
      ${showPrice ? `<div class="dev-item-price">
        <span class="dev-price-label">🪙 Price</span>
        <input class="dev-price-input" type="number" id="price-rob-${i}" value="${price}" min="0" max="99999" placeholder="0">
        <button class="dev-price-save rw" onclick="saveLetterPrice(${i}, 'rob');R(event,this)">Save</button>
      </div>` : `<div class="dev-item-price"><span class="dev-price-label">🔓 Unlocked</span><span class="dev-price-free">Free to read</span></div>`}
      <div class="dev-item-actions">
        <button class="dev-btn edit" onclick="openDevEditor(${i})">✏️ Edit</button>
        ${it.lk
          ? `<button class="dev-btn unlock" onclick="devUnlock(${i})">🔓 Unlock</button>`
          : `<button class="dev-btn unlock" onclick="devLock(${i})">🔒 Lock</button>`}
        <button class="dev-btn del" onclick="devDelete(${i});renderDevListRob()">🗑️</button>
      </div>
    </div>`;
  }).join('');
}
window.renderDevListRob=renderDevListRob;


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

/* ═══ SUCCESS ANIMATIONS — SEND LETTER ═══ */
(function(){
  const _orig = window.sendLetter;
  window.sendLetter = function(){
    const title = document.getElementById('rob-title').value.trim();
    const body  = document.getElementById('rob-body').value.trim();
    if(!title || !body || body.length < 10){ _orig(); return; }
    _orig();
    // Only fire success if letter was actually valid (toast won't be error)
    setTimeout(()=>{
      showSuccess('💌', 'Sent!', 'rgba(110,232,180,.15)');
      // Mark sent badge
      sentUnreadBadge = true;
      updateSentBadge();
    }, 100);
  };
})();

/* ═══ SENT TAB BADGE ═══ */
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

// Clear badge when Sent tab is opened
(function(){
  const _origRobNav = window.robNav;
  window.robNav = function(id){
    _origRobNav(id);
    if(id === 'sent'){
      sentUnreadBadge = false;
      updateSentBadge();
    }
    if(id === 'activity'){
      renderRobWishList();
      // Show unread suggestion badge
      const unread = (typeof anaSuggestions!=='undefined') ? anaSuggestions.filter(s=>!s.seen).length : 0;
      const sugTab = document.querySelector('.dv-tab-btn[onclick*="suggest"]');
      if(sugTab) sugTab.textContent = unread > 0 ? `💬 Suggestions (${unread})` : '💬 Suggestions';
    }
  };
})();

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

// Override renderDevListRob to show secret/reveal buttons
(function(){
  const _orig = window.renderDevListRob;
  window.renderDevListRob = function(){
    _orig();
    // Add secret toggle buttons to each dev item
    const items = ED[devCurrentTab]||[];
    items.forEach((it, i)=>{
      const actions = document.querySelectorAll('#dev-list-rob .dev-item-actions')[i];
      if(!actions) return;
      if(!it.lk) { // only unlocked letters can be secret
        const secretBtn = document.createElement('button');
        secretBtn.className = 'dev-btn rw';
        secretBtn.style.cssText = 'background:rgba(200,168,240,.1);border-color:rgba(200,168,240,.2);color:var(--lilac)';
        secretBtn.textContent = it.secret ? '🔓 Reveal' : '🔒 Secret';
        secretBtn.onclick = function(e){
          it.secret ? revealSecret(devCurrentTab, i) : markSecret(devCurrentTab, i);
          R(e, this);
        };
        actions.appendChild(secretBtn);
      }
    });
  };
})();

// Init long presses after Robert's view shows
(function(){
  const _origShow = window.showRobertView;
  window.showRobertView = function(){
    _origShow();
    setTimeout(initRobMoodLongPress, 400);
  };
})();

/* ═══ DRAFT SAVING ═══ */
var _draftKey = 'heartly_rob_draft';

function saveDraft(){
  var title = document.getElementById('rob-title');
  var body  = document.getElementById('rob-body');
  var sig   = document.getElementById('rob-sig');
  if(!title) return;
  var draft = {
    title: title.value,
    body:  body  ? body.value  : '',
    sig:   sig   ? sig.value   : '',
    type:  currentLetterType,
    saved: Date.now()
  };
  // Only save if there's actual content
  if(!draft.title && !draft.body) {
    localStorage.removeItem(_draftKey);
    return;
  }
  try { localStorage.setItem(_draftKey, JSON.stringify(draft)); } catch(e){}
}
window.saveDraft = saveDraft;

function loadDraft(){
  try {
    var raw = localStorage.getItem(_draftKey);
    if(!raw) return null;
    return JSON.parse(raw);
  } catch(e){ return null; }
}

function clearDraft(){
  try { localStorage.removeItem(_draftKey); } catch(e){}
  hideDraftBanner();
}
window.clearDraft = clearDraft;

function restoreDraft(draft){
  if(!draft) return;
  var title = document.getElementById('rob-title');
  var body  = document.getElementById('rob-body');
  var sig   = document.getElementById('rob-sig');
  if(title) title.value = draft.title || '';
  if(body)  body.value  = draft.body  || '';
  if(sig)   sig.value   = draft.sig   || '';
  // Restore letter type
  if(draft.type){
    currentLetterType = draft.type;
    document.querySelectorAll('.letter-type-btn').forEach(function(b){
      b.classList.toggle('on', b.dataset.type === draft.type);
    });
  }
  updatePreview();
  updateCharCount();
  hideDraftBanner();
  T('📝 Draft restored!');
}
window.restoreDraft = restoreDraft;

function showDraftBanner(draft){
  var existing = document.getElementById('rob-draft-banner');
  if(existing) return; // already showing
  var writeScreen = document.getElementById('rob-write');
  if(!writeScreen) return;
  var ago = draft.saved ? _draftAge(draft.saved) : 'recently';
  var banner = document.createElement('div');
  banner.id = 'rob-draft-banner';
  banner.className = 'draft-banner';
  banner.innerHTML =
    '<div class="draft-banner-ico">📝</div>' +
    '<div class="draft-banner-txt">Resume draft?' +
      '<div class="draft-banner-sub">Saved ' + ago + ' — ' + (draft.title || 'Untitled') + '</div>' +
    '</div>' +
    '<div class="draft-banner-btns">' +
      '<button class="draft-yes-btn rw" onclick="restoreDraft(_loadedDraft);R(event,this)">Yes</button>' +
      '<button class="draft-discard-btn rw" onclick="clearDraft();R(event,this)">Discard</button>' +
    '</div>';
  // Insert as first child of write screen
  writeScreen.insertBefore(banner, writeScreen.firstChild);
  window._loadedDraft = draft;
}

function hideDraftBanner(){
  var b = document.getElementById('rob-draft-banner');
  if(b) b.remove();
}
window.hideDraftBanner = hideDraftBanner;

function _draftAge(ts){
  var diff = Date.now() - ts;
  var mins = Math.floor(diff / 60000);
  if(mins < 1) return 'just now';
  if(mins < 60) return mins + 'm ago';
  var hrs = Math.floor(mins / 60);
  if(hrs < 24) return hrs + 'h ago';
  return Math.floor(hrs / 24) + 'd ago';
}

// Wire auto-save to all Write tab inputs
(function(){
  var _origShow = window.showRobertView;
  window.showRobertView = function(){
    _origShow();
    // Check for saved draft after view is shown
    setTimeout(function(){
      var draft = loadDraft();
      if(draft && (draft.title || draft.body)){
        showDraftBanner(draft);
      }
      // Wire input listeners for auto-save
      ['rob-title','rob-body','rob-sig'].forEach(function(id){
        var el = document.getElementById(id);
        if(el && !el._draftWired){
          el.addEventListener('input', saveDraft);
          el._draftWired = true;
        }
      });
    }, 400);
  };
})();

// Clear draft on successful send
(function(){
  var _origSend = window.sendLetter;
  window.sendLetter = function(){
    _origSend();
    // Clear draft after send (give sendLetter time to validate)
    setTimeout(function(){
      var titleEl = document.getElementById('rob-title');
      // If title is now empty, send was successful
      if(titleEl && !titleEl.value.trim()){
        clearDraft();
      }
    }, 200);
  };
})();

/* ═══ SCHEDULING CALENDAR ═══ */

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

  // Get all scheduled + sent letter dates
  var letterDates = {}; // 'YYYY-MM-DD' -> [{title, type, scheduled}]
  sentLetters.forEach(function(l){
    var dateStr = null;
    if(l.scheduleDate){
      dateStr = l.scheduleDate; // already YYYY-MM-DD
    } else if(l.date === 'Just now' || l.date === 'Today, ' + _todayLabel()){
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

  container.innerHTML = cells.map(function(c, i){
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
      : (c.isToday ? '' : '');
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
    var ds = l.scheduleDate || (l.date === 'Just now' ? _toDateStr(new Date()) : null);
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

// Re-render calendar when switching to Dev tab
(function(){
  var _origRobNav = window.robNav;
  window.robNav = function(id){
    _origRobNav(id);
    if(id === 'dev'){
      if(!calMonth) initCal();
      else renderCal();
    }
  };
})();

// Helpers
function _toDateStr(d){
  return d.getFullYear() + '-' +
    String(d.getMonth()+1).padStart(2,'0') + '-' +
    String(d.getDate()).padStart(2,'0');
}
function _toDateStrFromParts(y, m, d){
  return y + '-' + String(m+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
}
function _todayLabel(){
  return new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
}

/* ═══════════════════════════════════════════════
   DEV PANEL — FULL CONTROL SYSTEM
═══════════════════════════════════════════════ */

// ── SUB-TAB NAVIGATION ──────────────────────────────────────
function dvTab(id){
  document.querySelectorAll('.dv-pane').forEach(p=>p.style.display='none');
  document.querySelectorAll('.dv-tab-btn').forEach(b=>b.classList.remove('on'));
  const pane = document.getElementById('dv-'+id);
  if(pane) pane.style.display='flex', pane.style.flexDirection='column', pane.style.gap='12px';
  const btn = document.querySelector('.dv-tab-btn[data-dv="'+id+'"]');
  if(btn) btn.classList.add('on');

  // Refresh content on switch
  if(id==='shop')     dvRenderShopPanel();
  if(id==='features') dvRenderFeatures();
  if(id==='pts')      dvRenderPts();
}
window.dvTab = dvTab;

// ── HEADER STATS ────────────────────────────────────────────
function dvUpdateHeader(){
  const pEl = document.getElementById('dv-pts-val');
  const sEl = document.getElementById('dv-sent-val');
  if(pEl) pEl.textContent = Math.floor(ptsVal).toLocaleString();
  if(sEl) sEl.textContent = sentLetters ? sentLetters.length : 0;
}

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

function dvForceUnlockAllShop(){
  if(!confirm('Grant ALL shop items for free?')) return;
  if(typeof SHOP_ITEMS==='undefined') return;
  SHOP_ITEMS.forEach(item=>{ window[item.stateKey] = true; });
  if(typeof applyShopUnlocks==='function') applyShopUnlocks();
  if(typeof saveState==='function') saveState();
  T('✓ All shop items unlocked');
  dvRenderShopPanel();
  dvRenderFeatures();
}
window.dvForceUnlockAllShop = dvForceUnlockAllShop;

function dvOpenFeatureConfig(id){
  dvTab('features');
  // Small delay to let pane render
  setTimeout(()=>{
    const map = {
      'couple_song':'dv-feat-couple-song','memory_jar':'dv-feat-memory-jar',
      'countdown_timer':'dv-feat-countdown','good_night':'dv-feat-goodnight',
      'couple_goals':'dv-feat-couple-goals','memory_timeline':'dv-feat-timeline',
      'date_night':'dv-feat-date-night','daily_question':'dv-feat-daily-q',
      'playlist_builder':'dv-feat-playlist','flower_delivery':'dv-feat-flower',
      'photo_of_day':'dv-feat-photo','puzzle_of_week':'dv-feat-puzzle',
      'mini_challenge':'dv-feat-challenge',
    };
    const cardId = map[id];
    if(!cardId) return;
    const card = document.getElementById(cardId);
    if(card) card.scrollIntoView({behavior:'smooth',block:'start'});
  }, 150);
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
    'shopMemoryTimeline': 'dv-feat-timeline',
    'shopDateNight':      'dv-feat-date-night',
    'shopDailyQuestion':  'dv-feat-daily-q',
    'shopPlaylist':       'dv-feat-playlist',
    'shopFlowerDelivery': 'dv-feat-flower',
    'shopPhotoOfDay':     'dv-feat-photo',
    'shopPuzzleOfWeek':   'dv-feat-puzzle',
    'shopMiniChallenge':  'dv-feat-challenge',
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
  dvRenderTimelineList();
  dvRenderDateNightList();
  dvRenderPlaylistList();
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

// ── MEMORY TIMELINE ──────────────────────────────────────────
function dvAddTimeline(){
  const title = (document.getElementById('dv-tl-title')||{}).value||'';
  const date  = (document.getElementById('dv-tl-date') ||{}).value||'';
  const note  = (document.getElementById('dv-tl-note') ||{}).value||'';
  if(!title.trim()||!date){ T('⚠️ Fill in title and date'); return; }
  memoryTimelineItems.push({title:title.trim(), date, note:note.trim()});
  memoryTimelineItems.sort((a,b)=>new Date(a.date)-new Date(b.date));
  ['dv-tl-title','dv-tl-date','dv-tl-note'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  dvRenderTimelineList();
  if(typeof saveState==='function') saveState();
  T('🗓️ Milestone added!');
}
window.dvAddTimeline = dvAddTimeline;

function dvRenderTimelineList(){
  const list = document.getElementById('dv-timeline-list');
  if(!list) return;
  list.innerHTML = memoryTimelineItems.length
    ? memoryTimelineItems.map((m,i)=>`<div class="dv-item-row">
        <div class="dv-item-body">
          <div class="dv-item-text">${m.title}</div>
          <div class="dv-item-date">${m.date}${m.note?' — '+m.note:''}</div>
        </div>
        <div class="dv-item-del" onclick="memoryTimelineItems.splice(${i},1);dvRenderTimelineList();saveState()">🗑</div>
      </div>`).join('')
    : '<div style="font-size:11px;color:rgba(0,255,180,.25);text-align:center;padding:12px 0">No milestones yet</div>';
}

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

// ── DAILY QUESTION ───────────────────────────────────────────
function dvSetDailyQuestion(){
  const inp = document.getElementById('dv-dq-input');
  if(!inp||!inp.value.trim()){ T('⚠️ Write a question first'); return; }
  dailyQuestionData = {question:inp.value.trim(), answer:null, date:new Date().toDateString()};
  if(typeof saveState==='function') saveState();
  T('💬 Daily question set!');
}
window.dvSetDailyQuestion = dvSetDailyQuestion;

// ── PLAYLIST ─────────────────────────────────────────────────
function dvAddPlaylistItem(){
  const t = (document.getElementById('dv-pl-title') ||{}).value||'';
  const a = (document.getElementById('dv-pl-artist')||{}).value||'';
  if(!t.trim()){ T('⚠️ Enter a song title'); return; }
  playlistItems.push({title:t.trim(), artist:a.trim()});
  ['dv-pl-title','dv-pl-artist'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  dvRenderPlaylistList();
  if(typeof saveState==='function') saveState();
  T('🎵 Song added to playlist!');
}
window.dvAddPlaylistItem = dvAddPlaylistItem;

function dvRenderPlaylistList(){
  const list = document.getElementById('dv-playlist-list');
  if(!list) return;
  list.innerHTML = playlistItems.length
    ? playlistItems.map((p,i)=>`<div class="dv-item-row">
        <div class="dv-item-body">
          <div class="dv-item-text">${p.title}</div>
          <div class="dv-item-date">${p.artist}</div>
        </div>
        <div class="dv-item-del" onclick="playlistItems.splice(${i},1);dvRenderPlaylistList();saveState()">🗑</div>
      </div>`).join('')
    : '<div style="font-size:11px;color:rgba(0,255,180,.25);text-align:center;padding:12px 0">No songs yet</div>';
}

// ── FLOWER DELIVERY ──────────────────────────────────────────
function dvSendFlower(){
  const inp = document.getElementById('dv-flower-note');
  if(!inp){ return; }
  const note = inp.value.trim()||'With love 🌹';
  flowerDeliveries.unshift({note, date:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short'}), seen:false});
  inp.value='';
  if(typeof saveState==='function') saveState();
  if(typeof applyShopUnlocks==='function') applyShopUnlocks();
  T('🌹 Bouquet sent to Ana!');
}
window.dvSendFlower = dvSendFlower;

// ── PHOTO OF THE DAY ────────────────────────────────────────
function dvSetPhotoOfDay(input){
  const file = input.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    photoOfDayData = {dataUrl:e.target.result, date:new Date().toDateString()};
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

// ── MINI CHALLENGE ───────────────────────────────────────────
function dvSetChallenge(){
  const inp = document.getElementById('dv-chal-input');
  if(!inp||!inp.value.trim()){ T('⚠️ Write a challenge first'); return; }
  miniChallengeData = {challenge:inp.value.trim(), done:false, date:new Date().toDateString()};
  if(typeof saveState==='function') saveState();
  T('🎪 Challenge set!');
}
window.dvSetChallenge = dvSetChallenge;

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

function dvResetPts(){
  if(!confirm('Reset Ana\'s points to 0?')) return;
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

// ── WIRE INTO robNav ─────────────────────────────────────────
(function(){
  const _origRobNav = window.robNav;
  window.robNav = function(id){
    _origRobNav(id);
    if(id==='dev'){
      dvUpdateHeader();
      // Init to content tab
      dvTab('content');
      if(!calMonth) initCal(); else renderCal();
    }
  };
})();
