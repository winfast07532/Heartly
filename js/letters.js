/* ═══════════════════════════
   HOME LETTERS + LETTERS
═══════════════════════════ */

const HOME_FALLBACK = [
  {
    title: 'Missing Your Laugh',
    pre: '"Missing your laugh..."',
    age: '5 MINS AGO',
    body: 'There are moments in every ordinary day — a misheard lyric, a clumsy coincidence, something small and weightless — when my first instinct is still to turn and tell you.<br><br>I miss your laugh specifically. Not just laughter — <em>yours</em>. The way it starts reluctant, like it\'s trying to stay small, and then escapes you entirely.',
    sig: '— Always yours, Robert 🌹'
  },
  {
    title: 'Counting Stars',
    pre: '"Counting stars for you..."',
    age: '2 HOURS AGO',
    body: 'Last night I counted three stars before the clouds came. Three felt like enough.<br><br>The first I named after your courage. The second, your kindness. The third — the sound of my name in your voice. The specific way you say it. Like it matters.',
    sig: '— Under the same sky, Robert ✨'
  },
  {
    title: 'Saturday Morning',
    pre: '"Saturday morning thoughts..."',
    age: 'YESTERDAY',
    body: 'Saturday mornings used to feel like waiting for something that never quite arrived.<br><br>Now they feel like potential. Like the specific kind of quiet that\'s not empty — it\'s holding its breath.',
    sig: '— Thinking of you always, Robert ☀️'
  },
];

// Home letters data store (parallel to DOM)
homeLettersData = []; // already declared above

function renderHomeLetters(){
  const list = document.getElementById('home-letters-list');
  if(!list) return;

  const recentSent = (typeof sentLetters !== 'undefined' ? sentLetters : [])
    .filter(l => l.title && l.body && !l.scheduled)
    .slice(0, 3);

  const items = [];
  recentSent.forEach(l => {
    items.push({
      title: l.title,
      pre: '"' + l.body.replace(/<[^>]+>/g,'').substring(0,35) + '..."',
      age: l.date || 'Just now',
      body: l.body.replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>'),
      sig: l.sig,
      isNew: true
    });
  });
  HOME_FALLBACK.slice(0, Math.max(0, 3 - items.length)).forEach(f => items.push({...f, isNew:false}));

  // Store data for click handler
  homeLettersData = items.slice(0,3);

  list.innerHTML = homeLettersData.map((it, i) => {
    const newBadge = it.isNew
      ? '<span style="font-size:9px;color:var(--mint);font-weight:800;background:rgba(110,232,180,.1);border:1px solid rgba(110,232,180,.2);border-radius:999px;padding:1px 7px;margin-left:4px">NEW</span>'
      : '';
    const dot = it.isNew
      ? '<div class="lr-dot" style="background:var(--mint);box-shadow:0 0 7px rgba(110,232,180,.6)"></div>'
      : '<div class="lr-dot"></div>';
    return `<div class="LR rw" style="animation-delay:${(i+1)*.06}s" data-letter-idx="${i}" onclick="openHomeLetter(${i},event)">
      <div class="lr-tx">
        <div class="lr-from">From Robert: ${newBadge}</div>
        <div class="lr-pre">${it.age} — ${it.pre}</div>
      </div>
      ${dot}
    </div>`;
  }).join('');
}

function openHomeLetter(i, e){
  const it = homeLettersData[i];
  if(!it) return;
  openLetter('From Robert', it.title, it.body, it.sig);
  if(e) R(e, e.currentTarget);
}
window.openHomeLetter = openHomeLetter;

// home letters re-render handled in unified go

// Initial render
renderHomeLetters();

// home re-render after send handled in sendLetter itself


/* ═══════════════════════════
   LETTER PURCHASE SYSTEM
═══════════════════════════ */
buyPending = null; // already declared above

const BUY_CAT_LABEL = {
  notes: '📝 Short Note',
  surprises: '🎁 Surprise',
  letters: '💌 Letter'
};

function openBuySheet(index, category){
  const it = ED[category][index];
  if(!it || !it.lk) return;

  buyPending = {index, category};

  const price = it.price || 1000;
  const title = it.l.replace('\n',' ');
  const canAfford = ptsVal >= price;

  // Populate sheet
  document.getElementById('buy-tag').textContent = BUY_CAT_LABEL[category] || '💌 Letter';
  document.getElementById('buy-title').textContent = '"' + title + '"';

  // Preview — show a teaser
  const teasers = {
    notes: 'A personal note from Robert, written just for you. Unlock to read every word.',
    surprises: 'A surprise Robert put together especially for you. Unlock to discover what\'s inside.',
    letters: 'A full heartfelt letter from Robert. Unlock to read this one-of-a-kind message.'
  };
  document.getElementById('buy-preview').textContent = teasers[category] || 'Unlock to read this letter.';

  document.getElementById('buy-cost').textContent = price.toLocaleString() + ' pts';

  const balanceEl = document.getElementById('buy-balance');
  balanceEl.textContent = 'You have ' + Math.floor(ptsVal).toLocaleString() + ' pts';
  balanceEl.className = 'buy-balance ' + (canAfford ? 'ok' : 'low');

  const btn = document.getElementById('buy-confirm-btn');
  btn.disabled = !canAfford;
  btn.textContent = canAfford ? '🔓 Unlock this letter' : '❌ Not enough points';

  document.getElementById('BUY-SHEET').classList.add('on');
}
window.openBuySheet = openBuySheet;

function closeBuySheet(){
  document.getElementById('BUY-SHEET').classList.remove('on');
  buyPending = null;
}
window.closeBuySheet = closeBuySheet;

function confirmBuyLetter(){
  if(!buyPending) return;
  const {index, category} = buyPending;
  const it = ED[category][index];
  if(!it) return;

  const price = it.price || 1000;
  if(ptsVal < price){ T('❌ Not enough points!'); return; }

  // Deduct points
  const old = ptsVal;
  ptsVal -= price;
  animatePts(old, ptsVal, 600);
  addTxItem('🔓', 'Letter unlocked — "' + it.l.replace('\n',' ') + '"', 'Just now', '-' + price, 'spend');

  // Unlock the letter — set lk false and add placeholder content if none
  it.lk = false;
  if(!it.letter){
    it.letter = {
      t: it.l.replace('\n',' '),
      b: 'This letter is now unlocked. Robert will write the full content here.',
      s: '— Always yours, Robert 🌹'
    };
  }

  closeBuySheet();
  T('🔓 Letter unlocked! Reading now...');
  saveState();

  // Re-render grid and open letter
  renderGrid(category);
  setTimeout(()=>{
    openLetter('From Robert',
      it.letter.t,
      it.letter.b,
      it.letter.s
    );
  }, 400);
}
window.confirmBuyLetter = confirmBuyLetter;

// Close on backdrop tap
document.getElementById('BUY-SHEET').addEventListener('click', e=>{
  if(e.target === document.getElementById('BUY-SHEET')) closeBuySheet();
});


/* ═══════════════════════════
   LOGS — TOGETHER TIMER
═══════════════════════════ */
function startTogetherTimer(){
  const REL = new Date('2023-08-10T00:00:00');
  function update(){
    const diff = new Date() - REL;
    const d = Math.floor(diff/86400000);
    const h = Math.floor((diff%86400000)/3600000);
    const m = Math.floor((diff%3600000)/60000);
    const s = Math.floor((diff%60000)/1000);
    const pad = n => String(n).padStart(2,'0');
    const el_d = document.getElementById('tg-days');
    const el_h = document.getElementById('tg-hours');
    const el_m = document.getElementById('tg-mins');
    const el_s = document.getElementById('tg-secs');
    if(el_d) el_d.textContent = d.toLocaleString();
    if(el_h) el_h.textContent = pad(h);
    if(el_m) el_m.textContent = pad(m);
    if(el_s) el_s.textContent = pad(s);
  }
  update();
  setInterval(update, 1000);
}
startTogetherTimer();

function updateLogsStats(){
  // Points
  const lp = document.getElementById('logs-pts');
  if(lp) lp.textContent = Math.floor(ptsVal).toLocaleString();
  // Sent letters count
  const ls = document.getElementById('logs-sent');
  if(ls) ls.textContent = sentLetters ? sentLetters.length : 3;
  // Category breakdown — count unlocked items
  const ln = document.getElementById('lb-notes');
  const lsur = document.getElementById('lb-surprises');
  const ll = document.getElementById('lb-letters');
  if(ln)   ln.textContent   = (ED.notes    ||[]).filter(i=>!i.lk).length;
  if(lsur) lsur.textContent = (ED.surprises||[]).filter(i=>!i.lk).length;
  if(ll)   ll.textContent   = (ED.letters  ||[]).filter(i=>!i.lk).length;

  // Anniversary badge — check if next anniversary has passed
  const now = new Date();
  const thisYear = now.getFullYear();
  let nextAnn = new Date(thisYear, 7, 10); // Aug 10 this year
  if(nextAnn <= now) nextAnn = new Date(thisYear+1, 7, 10);
  const annEl = document.getElementById('tl-next-anniversary');
  const annBadge = document.getElementById('tl-anniversary-badge');
  if(annEl) annEl.textContent = nextAnn.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  const daysUntil = Math.ceil((nextAnn-now)/86400000);
  if(annBadge) annBadge.textContent = daysUntil <= 30 ? 'In ' + daysUntil + ' days!' : 'In ' + Math.ceil(daysUntil/30) + ' months';
  if(annBadge && daysUntil <= 30){
    annBadge.className='tl-badge soon';
  }
}

// logs update handled in unified go

/* ═══════════════════════════
   EXPLORE SEARCH
═══════════════════════════ */
searchOpen = false; // already declared above
searchQuery = ''; // already declared above

function toggleSearchBar(){
  searchOpen = !searchOpen;
  const banner = document.getElementById('search-banner');
  const btn = document.getElementById('search-toggle-btn');
  if(searchOpen){
    banner.classList.add('open');
    btn.classList.add('active');
    setTimeout(()=>document.getElementById('search-input').focus(), 350);
  } else {
    banner.classList.remove('open');
    btn.classList.remove('active');
    clearSearch();
  }
}
window.toggleSearchBar = toggleSearchBar;

function onSearchInput(val){
  searchQuery = val.trim().toLowerCase();
  const clearBtn = document.getElementById('search-clear');
  if(clearBtn) clearBtn.classList.toggle('show', searchQuery.length > 0);
  renderGrid(curTab);
}
window.onSearchInput = onSearchInput;

function clearSearch(){
  searchQuery = '';
  const inp = document.getElementById('search-input');
  if(inp) inp.value = '';
  const clearBtn = document.getElementById('search-clear');
  if(clearBtn) clearBtn.classList.remove('show');
  renderGrid(curTab);
}
window.clearSearch = clearSearch;

// Search support is now built into the main renderGrid above

/* ═══════════════════════════
   SCHEDULED LETTERS
═══════════════════════════ */
scheduleEnabled = false; // already declared above

// Set min date to tomorrow
(function(){
  const inp = document.getElementById('rob-schedule-date');
  if(inp){
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate()+1);
    inp.min = tomorrow.toISOString().split('T')[0];
    inp.value = tomorrow.toISOString().split('T')[0];
  }
})();

function toggleSchedule(){
  scheduleEnabled = !scheduleEnabled;
  const toggle = document.getElementById('schedule-toggle');
  const row    = document.getElementById('schedule-date-row');
  const btn    = document.getElementById('rob-send-btn');
  if(toggle) toggle.classList.toggle('on', scheduleEnabled);
  if(row)    row.classList.toggle('open', scheduleEnabled);
  if(btn)    btn.innerHTML = scheduleEnabled ? '🕐 &nbsp; Schedule for Ana' : '💌 &nbsp; Send to Ana';
}
window.toggleSchedule = toggleSchedule;

// sendLetter schedule logic merged into main function above

// Check scheduled letters on nav — auto-unlock if date passed
// schedule check handled in unified go

function checkScheduledLetters(){
  const today = new Date().toISOString().split('T')[0];
  ['notes','surprises','letters'].forEach(cat=>{
    (ED[cat]||[]).forEach(it=>{
      if(it.scheduleDate && it.lk && it.scheduleDate <= today){
        it.lk = false;
      }
    });
  });
}
checkScheduledLetters();

// Update sent letters to show scheduled badge



/* ═══════════════════════════════════
   ENVELOPE MODAL — openLetter override
═══════════════════════════════════ */
// Store current letter for favourites

/* ═══ ENVELOPE MODAL ═══ */
function openLetter(from, title, body, sig){
  currentLetter = {from, title, body, sig};

  // Update fav button state
  const favBtn = document.getElementById('fav-btn');
  if(favBtn){
    const alreadySaved = favourites.some(f => f.title === title);
    favBtn.innerHTML = alreadySaved ? '♥ Saved!' : '♡ Save to Favourites';
    favBtn.style.opacity = alreadySaved ? '.6' : '1';
  }

  // Fill content
  document.getElementById('m-from').textContent = '💌 ' + from;
  document.getElementById('m-title').textContent = '"' + title + '"';
  document.getElementById('m-body').innerHTML = body;
  document.getElementById('m-sig').textContent = sig || '';

  // Read receipt — mark matching sent letter as read
  if(typeof sentLetters !== 'undefined'){
    const match = sentLetters.find(l => l.title === title);
    if(match && !match.read){
      match.read = true;
      if(typeof renderSentLetters === 'function') renderSentLetters();
    }
  }

  // Show modal — MB slides up from bottom
  const mod = document.getElementById('MOD');
  const mb  = document.getElementById('MB');
  mb.classList.remove('slide-up');
  mb.style.transform = '';
  mb.style.transition = '';
  mod.style.display = 'flex';
  requestAnimationFrame(()=>{
    mod.classList.add('on');
    requestAnimationFrame(()=>{
      mb.classList.add('slide-up');
    });
  });
}
window.openLetter = openLetter;

function closeMod(){
  currentLetter = null;
  const mod = document.getElementById('MOD');
  const mb  = document.getElementById('MB');
  mb.style.transition = 'transform .3s ease';
  mb.style.transform  = 'translateY(110%)';
  mod.classList.remove('mod-ready');
  setTimeout(()=>{
    mod.classList.remove('on');
    mod.style.display = 'none';
    mb.style.transform  = '';
    mb.style.transition = '';
  }, 340);
}
window.closeMod = closeMod;

// Close on backdrop tap
document.getElementById('MOD').addEventListener('click', e=>{
  if(e.target === document.getElementById('MOD')) closeMod();
});

/* ═══════════════════════════════════
   FAVOURITES SYSTEM
═══════════════════════════════════ */
// favourites seeded below
favourites = [
  {title:'Missing Your Laugh', from:'From Robert', body:'There are moments in every ordinary day — a misheard lyric, a clumsy coincidence, something small and weightless — when my first instinct is still to turn and tell you.<br><br>I miss your laugh specifically. Not just laughter — <em>yours</em>. The way it starts reluctant, like it\'s trying to stay small, and then escapes you entirely.<br><br>Save this for a quiet evening. Read it slowly. You deserve that unhurried kind of moment.', sig:'— Always yours, Robert 🌹', savedDate:'May 15'},
  {title:'Counting Stars', from:'From Robert', body:'Last night I counted three stars before the clouds came. Three felt like enough.<br><br>The first I named after your courage — the quiet kind that simply shows up. The second, your kindness. The third — the sound of my name in your voice. The specific way you say it. Like it matters.<br><br>Three stars. More than enough.', sig:'— Under the same sky, Robert ✨', savedDate:'May 12'},
  {title:'Saturday Morning', from:'From Robert', body:'Saturday mornings used to feel like waiting for something that never quite arrived.<br><br>Now they feel like potential. Like the specific kind of quiet that\'s not empty — it\'s holding its breath.<br><br>Somewhere across the distance you\'re doing something ordinary. And somehow that\'s enough to make Saturday mornings feel like the best part of the week.', sig:'— Thinking of you always, Robert ☀️', savedDate:'May 10'},
];

function saveToFavourites(){
  if(!currentLetter) return;
  const already = favourites.some(f => f.title === currentLetter.title);
  if(already){
    T('♥ Already in your favourites!');
    return;
  }
  const today = new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short'});
  favourites.unshift({...currentLetter, savedDate: today});
  T('♥ Saved to Favourites!');
  // Update button
  const favBtn = document.getElementById('fav-btn');
  if(favBtn){ favBtn.innerHTML = '♥ Saved!'; favBtn.style.opacity = '.6'; }
  // Re-render profile favs if open
  renderProfileFavs();
  // Add points
  const old = ptsVal;
  ptsVal += 25;
  animatePts(old, ptsVal, 400);
  addTxItem('♥', 'Letter saved to favourites', 'Just now', '+25', 'earn');
  saveState();
}
window.saveToFavourites = saveToFavourites;

function renderProfileFavs(){
  const list = document.getElementById('prof-favs-list');
  if(!list) return;

  if(favourites.length === 0){
    list.innerHTML = '<div style="text-align:center;padding:16px 0;font-size:12px;color:var(--tx3)">No favourites yet — save a letter you love 💕</div>';
    return;
  }

  const icons = ['💌','⭐','☀️','🌙','💕','🌹','✨','💎'];
  const bgs = ['rgba(224,85,120,.18)','rgba(245,200,112,.14)','rgba(110,232,180,.12)','rgba(180,120,255,.14)'];

  list.innerHTML = favourites.map((f, i) => {
    const icon = icons[i % icons.length];
    const bg = bgs[i % bgs.length];
    return `<div class="fav-row rw" style="animation-delay:${i*.05}s" data-fav-idx="${i}" onclick="openFav(${i})">
      <div class="fav-ico" style="background:${bg}">${icon}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:#fff">"${f.title}"</div>
        <div style="font-size:11px;color:var(--tx2);margin-top:2px">From Robert · Saved ${f.savedDate}</div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
    </div>`;
  }).join('');
}
window.renderProfileFavs = renderProfileFavs;

function openFav(i){
  const f = favourites[i];
  if(!f) return;
  window.openLetter(f.from, f.title, f.body, f.sig);
}
window.openFav = openFav;

// Re-render favs when profile opens
(function(){
  const _origOpenProf = window.openProf;
  window.openProf = function(){
    _origOpenProf();
    renderProfileFavs();
  };
})();

// Initial render
renderProfileFavs();

/* ═══════════════════════════════════
   LOGS TIMELINE — real calculated dates
═══════════════════════════════════ */
(function(){
  const REL = new Date('2023-08-10T00:00:00');
  const now = new Date();

  // Calculate milestone dates
  const sixMonths = new Date(REL); sixMonths.setMonth(sixMonths.getMonth()+6);
  const oneYear   = new Date(REL); oneYear.setFullYear(oneYear.getFullYear()+1);
  const eighteenM = new Date(REL); eighteenM.setMonth(eighteenM.getMonth()+18);
  const twoYear   = new Date(REL); twoYear.setFullYear(twoYear.getFullYear()+2);

  const fmt = d => d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  const daysUntil = d => Math.ceil((d-now)/86400000);

  // Update 1-year badge — it's in the past
  const badge1y = document.getElementById('tl-1year-badge');
  if(badge1y) badge1y.textContent = '✓ ' + fmt(oneYear);

  // Update anniversary date text
  const annDate = document.getElementById('tl-anniversary-date');
  if(annDate) annDate.textContent = fmt(oneYear);

  // Next anniversary
  let nextAnn = new Date(now.getFullYear(), 7, 10);
  if(nextAnn <= now) nextAnn = new Date(now.getFullYear()+1, 7, 10);
  const dtu = daysUntil(nextAnn);
  const annEl = document.getElementById('tl-next-anniversary');
  const annBadge = document.getElementById('tl-anniversary-badge');
  if(annEl) annEl.textContent = fmt(nextAnn);
  if(annBadge){
    annBadge.textContent = dtu <= 30 ? 'In ' + dtu + ' days!' : 'In ' + Math.ceil(dtu/30) + ' months';
    if(dtu <= 30) annBadge.className = 'tl-badge soon';
  }
})();
/* ═══ PATCH saveToFavourites — success animation ═══ */
(function(){
  const _orig = window.saveToFavourites;
  window.saveToFavourites = function(){
    if(!currentLetter) return;
    const already = favourites.some(f => f.title === currentLetter.title);
    if(already){ T('♥ Already in your favourites!'); return; }
    _orig();
    setTimeout(()=> showSuccess('♥', 'Saved!', 'rgba(224,85,120,.2)'), 100);
  };
})();

/* ═══ PATCH confirmBuyLetter — unlock shimmer + success ═══ */
(function(){
  const _origConfirm = window.confirmBuyLetter;
  if(!_origConfirm) return;
  window.confirmBuyLetter = function(){
    _origConfirm();
    setTimeout(()=>{
      showUnlockShimmer();
      showSuccess('🔓', 'Unlocked!', 'rgba(245,200,112,.2)');
    }, 100);
  };
})();

/* ═══ LETTER REACTIONS ═══ */

// Patch openLetter to render reaction strip
(function(){
  var _orig = window.openLetter;
  window.openLetter = function(from, title, body, sig){
    _orig(from, title, body, sig);
    renderReactionStrip(title);
  };
})();

function renderReactionStrip(title){
  var strip = document.getElementById('reaction-strip');
  if(!strip) return;

  // Find existing reaction for this letter
  var match = sentLetters.find(function(l){ return l.title === title; });
  var current = match ? match.reaction : null;

  strip.innerHTML = '<div class="reaction-lbl">React</div>' +
    REACTION_OPTS.map(function(r){
      var picked = current && current.emoji === r.emoji ? ' picked' : '';
      return '<div class="reaction-opt rw' + picked + '" onclick="pickReaction(\'' +
        title.replace(/'/g,"\\'") + '\',\'' + r.emoji + '\',\'' + r.label + '\');R(event,this)">' +
        '<div class="reaction-opt-ico">' + r.emoji + '</div>' +
      '</div>';
    }).join('');
}
window.renderReactionStrip = renderReactionStrip;

function pickReaction(title, emoji, label){
  var match = sentLetters.find(function(l){ return l.title === title; });
  if(!match) return;

  // Toggle off if same reaction picked again
  if(match.reaction && match.reaction.emoji === emoji){
    match.reaction = null;
    T('Reaction removed');
  } else {
    var now = new Date();
    var time = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    match.reaction = {emoji:emoji, label:label, time:'Today, ' + time};
    showSuccess(emoji, label, 'rgba(224,85,120,.15)');
    T(emoji + ' ' + label + '!');
  }

  // Re-render strip and sent list
  renderReactionStrip(title);
  if(typeof renderSentLetters === 'function') renderSentLetters();
  saveState();
}
window.pickReaction = pickReaction;
