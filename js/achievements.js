/* ═══════════════════════════════════════════
   ACHIEVEMENTS SYSTEM — 50 real, state-driven achievements
   Every achievement's earned/locked status comes from a check()
   function that reads real app state (letters actually sent,
   streaks actually hit, points actually earned, features Robert
   actually configured, etc). Nothing here is a hardcoded boolean.

   Earning is permanent: once check() returns true, the id + the
   real timestamp it happened is written to earnedAchievements and
   persisted. After that we trust the record, not a live re-check —
   so an achievement never disappears just because e.g. a streak
   later resets.
═══════════════════════════════════════════ */

/* Line-icon replacements for the emoji used in ACH_DATA below.
   Native color emoji (blue speech bubbles, yellow bolts, red gifts...)
   clashed against the app's pink icon boxes, so achievement icons are
   rendered through this map instead of the raw emoji character. */
const ACH_ICON_PATHS = {
  '🧱': '<rect x="3" y="4" width="8" height="6" rx="1"/><rect x="13" y="4" width="8" height="6" rx="1"/><rect x="3" y="14" width="8" height="6" rx="1"/><rect x="13" y="14" width="8" height="6" rx="1"/>',
  '💌': '<path d="M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M3 6l9 7 9-7"/>',
  '✉️': '<path d="M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M3 6l9 7 9-7"/>',
  '📬': '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>',
  '🎁': '<rect x="3" y="8" width="18" height="4"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 010-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 010 5"/>',
  '🌙': '<path d="M20.5 14.5A8.5 8.5 0 119.5 3.5a6.5 6.5 0 0011 11z"/>',
  '💬': '<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l2.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>',
  '⭐': '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/>',
  '⚡': '<path d="M13 2L3 14h7l-1 8 11-14h-7l1-6z"/>',
  '🔥': '<path d="M12 2s-3 4-3 8a3 3 0 006 0c0-1.5-.8-2.3-1-2.5.9.6 3 2.6 3 5.5a5 5 0 01-10 0c0-6.5 5-8 5-11z"/>',
  '🏆': '<circle cx="12" cy="8" r="5"/><path d="M8.2 13.4L7 22l5-3 5 3-1.2-8.6"/>',
  '💕': '<path d="M12 21s-6.7-4.35-9.3-8.5C.8 9 2 5.5 5.6 5c2-.3 3.6.9 4.4 2.2.8-1.3 2.4-2.5 4.4-2.2 3.6.5 4.8 4 2.9 7.5C18.7 16.65 12 21 12 21z"/>',
  '💖': '<path d="M12 21s-6.7-4.35-9.3-8.5C.8 9 2 5.5 5.6 5c2-.3 3.6.9 4.4 2.2.8-1.3 2.4-2.5 4.4-2.2 3.6.5 4.8 4 2.9 7.5C18.7 16.65 12 21 12 21z"/>',
  '💞': '<path d="M12 21s-6.7-4.35-9.3-8.5C.8 9 2 5.5 5.6 5c2-.3 3.6.9 4.4 2.2.8-1.3 2.4-2.5 4.4-2.2 3.6.5 4.8 4 2.9 7.5C18.7 16.65 12 21 12 21z"/>',
  '👑': '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8z"/>',
  '🗓️': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
  '💎': '<path d="M6 3h12l3 5-9 13L3 8z"/><path d="M3 8h18"/><path d="M9 3l3 5-3 13"/><path d="M15 3l-3 5 3 13"/>',
  '🧩': '<path d="M9 3h4v2.5a1.5 1.5 0 003 0V3h4v4h-2.5a1.5 1.5 0 000 3H20v4h-4v-2.5a1.5 1.5 0 00-3 0V17H9v-4H6.5a1.5 1.5 0 010-3H9V3z"/>',
  '🎮': '<rect x="2" y="7" width="20" height="10" rx="4"/><path d="M7 9.5v5"/><path d="M4.5 12h5"/><circle cx="16" cy="10.5" r="1"/><circle cx="18.5" cy="13" r="1"/>',
  '🕹️': '<rect x="2" y="7" width="20" height="10" rx="4"/><path d="M7 9.5v5"/><path d="M4.5 12h5"/><circle cx="16" cy="10.5" r="1"/><circle cx="18.5" cy="13" r="1"/>',
  '🎨': '<path d="M12 2a10 10 0 000 20c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.4-.7-.4-1.1 0-.9.7-1.5 1.6-1.5H16a4 4 0 004-4c0-5.8-4.5-10.5-8-10.5z"/><circle cx="7" cy="10.5" r="1.3"/><circle cx="11.5" cy="7" r="1.3"/><circle cx="16" cy="10" r="1.3"/><circle cx="8.5" cy="15" r="1.3"/>',
  '📈': '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 6h6v6"/>',
  '🛍️': '<path d="M6 8V6a4 4 0 118 0v2"/><path d="M4.5 8h11l1 12H3.5z"/>',
  '🪙': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/>',
  '💰': '<rect x="2" y="7" width="20" height="12" rx="2"/><circle cx="12" cy="13" r="3"/><path d="M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2"/>',
  '🫙': '<path d="M7 4h10v3.5L18 9v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9l1-1.5V4z"/><path d="M9 4V2.5h6V4"/>',
  '📍': '<path d="M12 21s-7-7.5-7-12a7 7 0 0114 0c0 4.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  '✨': '<path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z"/><path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15z"/>',
  '💑': '<circle cx="8.5" cy="8" r="3"/><circle cx="15.5" cy="8" r="3"/><path d="M2 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6"/><path d="M9 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6"/>',
  '🎰': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 9v6"/><path d="M12 9v6"/><path d="M16 9v6"/>',
  '🎪': '<path d="M12 2l8 6-8 4-8-4 8-6z"/><path d="M4 8v12h16V8"/><path d="M12 12v8"/>',
  '🌹': '<circle cx="12" cy="7" r="4"/><path d="M12 11v10"/><path d="M12 16c-2 0-4 1-4 3"/><path d="M12 18c2 0 4 1 4 3"/>',
  '🔒': '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>',
  '🎭': '<path d="M12 3c-4 0-7 2-7 5v3c0 4 3 7 7 7s7-3 7-7V8c0-3-3-5-7-5z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/>',
};

// Renders the SVG for a given achievement emoji, falling back to the
// raw emoji if it's ever used somewhere not in the map above.
function achIco(emoji){
  const path = ACH_ICON_PATHS[emoji];
  if(!path) return emoji;
  return '<svg viewBox="0 0 24 24" fill="none" stroke="var(--rose-b)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+path+'</svg>';
}
window.achIco = achIco;

/* Persisted, permanent record of what's actually been earned:
   { [achievementId]: timestampWhenEarned }. Restored/saved via
   applyState/saveState in state.js. */
var earnedAchievements = {};
window.earnedAchievements = earnedAchievements;

/* Real, persisted, Robert-editable point reward per achievement.
   Falls back to each achievement's default `pts` value in ACH_DATA
   until Robert overrides it from Dev tab → Settings → 🏆 Achievement Rewards. */
var achievementRewards = {};
window.achievementRewards = achievementRewards;
function _achRewardFor(id){
  if(achievementRewards[id] !== undefined) return achievementRewards[id];
  const a = ACH_DATA.find(x => x.id === id);
  return a ? (a.pts || 0) : 0;
}

/* Counts how many real shop items are currently owned, generically —
   reads SHOP_ITEMS + window[stateKey] rather than naming items here,
   so this stays correct if the catalog changes. */
function _ownedShopItemCount(){
  if(typeof SHOP_ITEMS === 'undefined') return 0;
  return SHOP_ITEMS.filter(function(it){ return !!window[it.stateKey]; }).length;
}

const ACH_DATA = [
  /* ── Love Letters (7) — driven by totalLettersSent, a counter
     incremented once, for real, every time Robert actually sends a
     new unlocked letter/note/surprise from the Dev tab. ── */
  { id:'first-letter', cat:'letters', ico:'💌', name:'First Letter',
    pts:50, desc:'Receive your first letter from Robert',
    check: function(){ return totalLettersSent >= 1; } },
  { id:'letters-10', cat:'letters', ico:'✉️', name:'10 Letters',
    pts:100, desc:'Receive 10 letters from Robert',
    check: function(){ return totalLettersSent >= 10; } },
  { id:'letters-25', cat:'letters', ico:'📬', name:'25 Letters',
    pts:150, desc:'Receive 25 letters — a real habit forming',
    check: function(){ return totalLettersSent >= 25; } },
  { id:'letters-50', cat:'letters', ico:'⭐', name:'50 Letters',
    pts:250, desc:'Receive 50 letters from Robert',
    check: function(){ return totalLettersSent >= 50; } },
  { id:'letters-100', cat:'letters', ico:'💎', name:'100 Letters',
    pts:400, desc:'Receive 100 letters — a true love story',
    check: function(){ return totalLettersSent >= 100; } },
  { id:'night-owl', cat:'letters', ico:'🌙', name:'Night Owl',
    pts:75, desc:'Receive a letter sent between midnight and 4am',
    check: function(){
      return notifLog.some(function(n){
        if(n.type !== 'letter') return false;
        var h = new Date(n.ts).getHours();
        return h >= 0 && h < 4;
      });
    } },
  { id:'reply-sent', cat:'letters', ico:'💬', name:'Wrote Back',
    pts:50, desc:'Send your first message to Robert',
    check: function(){ return anaMessages.length >= 1; } },

  /* ── Streaks (6) — driven by bestStreak, so it stays earned even
     if the current streak later resets. ── */
  { id:'streak-3',   cat:'streaks', ico:'⚡', name:'3-Day Streak',
    pts:50, desc:'Open Heartly 3 days in a row',
    check: function(){ return bestStreak >= 3; } },
  { id:'streak-7',   cat:'streaks', ico:'🔥', name:'7-Day Streak',
    pts:100, desc:'One full week without missing a day',
    check: function(){ return bestStreak >= 7; } },
  { id:'streak-14',  cat:'streaks', ico:'🔥', name:'14-Day Streak',
    pts:150, desc:'Two solid weeks of dedication',
    check: function(){ return bestStreak >= 14; } },
  { id:'streak-30',  cat:'streaks', ico:'🔥', name:'30-Day Streak',
    pts:250, desc:'A whole month of love and consistency',
    check: function(){ return bestStreak >= 30; } },
  { id:'streak-60',  cat:'streaks', ico:'🔥', name:'60-Day Streak',
    pts:350, desc:'Two months — unwavering',
    check: function(){ return bestStreak >= 60; } },
  { id:'streak-100', cat:'streaks', ico:'🏆', name:'100-Day Legend',
    pts:500, desc:'100 consecutive days — legendary dedication',
    check: function(){ return bestStreak >= 100; } },

  /* ── Games (5) — real Love Clicker stats, reported live through the
     game's cross-frame bridge (clicker/clicker-script.js) into this
     app's own persisted state, not the game's separate localStorage. ── */
  { id:'game-first',   cat:'games', ico:'🧩', name:'First Play',
    pts:50, desc:'Play a full round of Love Clicker',
    check: function(){ return clickerGamesPlayed >= 1; } },
  { id:'game-score-1k', cat:'games', ico:'📈', name:'Getting Good',
    pts:100, desc:'Score 1,000+ in a single Love Clicker round',
    check: function(){ return clickerBestScore >= 1000; } },
  { id:'game-score-5k', cat:'games', ico:'📈', name:'High Scorer',
    pts:200, desc:'Score 4,000+ in a single Love Clicker round',
    check: function(){ return clickerBestScore >= 4000; } },
  { id:'game-lifetime-25k', cat:'games', ico:'🎮', name:'Regular Player',
    pts:250, desc:'Reach 25,000 lifetime Love Clicker score',
    check: function(){ return clickerLifetimeScore >= 25000; } },
  { id:'game-played-10', cat:'games', ico:'🕹️', name:'Gamer',
    pts:150, desc:'Complete 10 rounds of Love Clicker',
    check: function(){ return clickerGamesPlayed >= 10; } },

  /* ── Love Blast (5) — mirrors the Love Clicker set above, using the
     same reportBlastSession() bridge from loveblast/script.js. ── */
  { id:'blast-first',   cat:'games', ico:'🧱', name:'First Blast',
    pts:50, desc:'Play a full round of Love Blast',
    check: function(){ return blastGamesPlayed >= 1; } },
  { id:'blast-score-1k', cat:'games', ico:'📈', name:'Block Buster',
    pts:100, desc:'Score 1,000+ in a single Love Blast round',
    check: function(){ return blastBestScore >= 1000; } },
  { id:'blast-score-5k', cat:'games', ico:'📈', name:'Blast Master',
    pts:200, desc:'Score 5,000+ in a single Love Blast round',
    check: function(){ return blastBestScore >= 5000; } },
  { id:'blast-lifetime-25k', cat:'games', ico:'🎮', name:'Blast Regular',
    pts:250, desc:'Reach 25,000 lifetime Love Blast score',
    check: function(){ return blastLifetimeScore >= 25000; } },
  { id:'blast-played-10', cat:'games', ico:'🕹️', name:'Blast Gamer',
    pts:150, desc:'Complete 10 rounds of Love Blast',
    check: function(){ return blastGamesPlayed >= 10; } },

  /* ── Points (5) — lifetime earned, never decreases when spent. ── */
  { id:'pts-500',   cat:'points', ico:'🪙', name:'500 Points Earned',
    pts:50, desc:'Earn 500 points total',
    check: function(){ return totalPtsEarned >= 500; } },
  { id:'pts-1000',  cat:'points', ico:'🪙', name:'1,000 Points Earned',
    pts:75, desc:'Earn 1,000 points total',
    check: function(){ return totalPtsEarned >= 1000; } },
  { id:'pts-2500',  cat:'points', ico:'💰', name:'2,500 Points Earned',
    pts:100, desc:'Earn 2,500 points total',
    check: function(){ return totalPtsEarned >= 2500; } },
  { id:'pts-5000',  cat:'points', ico:'💰', name:'5,000 Points Earned',
    pts:150, desc:'A dedicated collector of love points',
    check: function(){ return totalPtsEarned >= 5000; } },
  { id:'pts-10000', cat:'points', ico:'💎', name:'10,000 Points Earned',
    pts:250, desc:'10,000 lifetime points — serious dedication',
    check: function(){ return totalPtsEarned >= 10000; } },

  /* ── Shop Collection (5) — generic count of owned SHOP_ITEMS. ── */
  { id:'shop-first',  cat:'shop', ico:'🛍️', name:'First Unlock',
    pts:50, desc:'Unlock your first item from the shop',
    check: function(){ return _ownedShopItemCount() >= 1; } },
  { id:'shop-5',      cat:'shop', ico:'🛍️', name:'Collector',
    pts:100, desc:'Own 5 shop items',
    check: function(){ return _ownedShopItemCount() >= 5; } },
  { id:'shop-10',     cat:'shop', ico:'🎨', name:'Curator',
    pts:150, desc:'Own 10 shop items',
    check: function(){ return _ownedShopItemCount() >= 10; } },
  { id:'shop-15',     cat:'shop', ico:'📈', name:'Completionist',
    pts:200, desc:'Own 15 shop items',
    check: function(){ return _ownedShopItemCount() >= 15; } },
  { id:'shop-all',    cat:'shop', ico:'👑', name:'Everything, Always',
    pts:300, desc:'Own every item in the shop',
    check: function(){ return typeof SHOP_ITEMS!=='undefined' && SHOP_ITEMS.length>0 && _ownedShopItemCount() >= SHOP_ITEMS.length; } },

  /* ── Relationship features (10) — real usage of features Robert
     configured, not just owning them. ── */
  { id:'jar-first',   cat:'relationship', ico:'🫙', name:'Memory Keeper',
    pts:50, desc:'Have a first memory in the jar',
    check: function(){ return memoryJarItems.length >= 1; } },
  { id:'jar-10',      cat:'relationship', ico:'🫙', name:'Jar Full of Love',
    pts:150, desc:'Fill the memory jar with 10 memories',
    check: function(){ return memoryJarItems.length >= 10; } },
  { id:'map-first',   cat:'relationship', ico:'📍', name:'First Pin',
    pts:50, desc:'Have a first place pinned on the Love Map',
    check: function(){ return loveMapPins.length >= 1; } },
  { id:'map-5',       cat:'relationship', ico:'📍', name:'Cartographer of Love',
    pts:150, desc:'Pin 5 places on the Love Map',
    check: function(){ return loveMapPins.length >= 5; } },
  { id:'wish-first',  cat:'relationship', ico:'✨', name:'First Wish',
    pts:50, desc:'Add a wish to your Wish List',
    check: function(){ return anaWishList.length >= 1; } },
  { id:'wish-5',      cat:'relationship', ico:'✨', name:'Dream Big',
    pts:100, desc:'Add 5 wishes to your Wish List',
    check: function(){ return anaWishList.length >= 5; } },
  { id:'goal-first',  cat:'relationship', ico:'💑', name:'Goal Setter',
    pts:50, desc:'Have a first Couple Goal set',
    check: function(){ return coupleGoalsList.length >= 1; } },
  { id:'goal-3done',  cat:'relationship', ico:'💑', name:'Goal Crusher',
    pts:150, desc:'Complete 3 Couple Goals together',
    check: function(){ return coupleGoalsList.filter(function(g){return g.done;}).length >= 3; } },
  { id:'puzzle-solved', cat:'relationship', ico:'🧩', name:'Puzzle Solver',
    pts:100, desc:'Solve the Puzzle of the Week',
    check: function(){ return !!(puzzleOfWeekData && puzzleOfWeekData.solved); } },
  { id:'question-answered', cat:'relationship', ico:'💬', name:'Open Book',
    pts:75, desc:"Answer Robert's Daily Question",
    check: function(){ return !!(dailyQuestionData && dailyQuestionData.answer); } },

  /* ── Engagement (6) — real lifetime counts of using the daily
     boosts, not just owning them once. ── */
  { id:'bonus-15',     cat:'engagement', ico:'⚡', name:'Bonus Hunter',
    pts:100, desc:'Claim the Daily Bonus 15 times',
    check: function(){ return totalBonusesClaimed >= 15; } },
  { id:'gift-15',      cat:'engagement', ico:'🎁', name:'Gift Grabber',
    pts:100, desc:'Open the Daily Gift Box 15 times',
    check: function(){ return totalGiftBoxesOpened >= 15; } },
  { id:'spin-15',      cat:'engagement', ico:'🎰', name:'Feeling Lucky',
    pts:100, desc:'Use Lucky Spin 15 times',
    check: function(){ return totalLuckySpins >= 15; } },
  { id:'spin-30',      cat:'engagement', ico:'🎰', name:'Jackpot Chaser',
    pts:200, desc:'Use Lucky Spin 30 times',
    check: function(){ return totalLuckySpins >= 30; } },

  /* ── Misc (5) — other genuine one-off real actions. ── */
  { id:'mood-set',     cat:'misc', ico:'🎭', name:'Mood Ring',
    pts:50, desc:"Share how you're feeling for the first time",
    check: function(){ return totalMoodsSet >= 1; } },
  { id:'rob-mood-set', cat:'misc', ico:'💬', name:'In Sync',
    pts:50, desc:"See Robert share his mood for the first time",
    check: function(){ return !!(robertMood && robertMood.emoji); } },
  { id:'theme-changed', cat:'misc', ico:'🎨', name:'New Look',
    pts:50, desc:'Switch to a different theme',
    check: function(){ return everChangedTheme === true; } },
  { id:'shield-used',   cat:'misc', ico:'🔒', name:'Shielded',
    pts:75, desc:'Have the Streak Shield protect a missed day',
    check: function(){ return !!streakShieldUsedDate; } },
];

const ACH_CATS = [
  { id:'letters',      label:'Love Letters',   ico:'💌', color:'var(--rose-b)' },
  { id:'streaks',      label:'Streaks',        ico:'🔥', color:'#ff8c42' },
  { id:'games',        label:'Games',          ico:'🎮', color:'var(--mint)' },
  { id:'points',       label:'Points',         ico:'🪙', color:'var(--gold)' },
  { id:'shop',         label:'Shop Collection',ico:'🛍️', color:'var(--gold)' },
  { id:'relationship', label:'Relationship',   ico:'💑', color:'var(--rose-b)' },
  { id:'engagement',   label:'Daily Habits',   ico:'⚡', color:'var(--mint)' },
  { id:'misc',         label:'Extras',         ico:'✨', color:'var(--mint)' },
];

// Track collapsed state per category (collapsed by default on app open)
var _achCollapsed = {};
ACH_CATS.forEach(function(c){ _achCollapsed[c.id] = true; });

/* Evaluates every achievement's real check() against current state.
   Anything newly true gets recorded (permanently) in earnedAchievements
   with the real moment it happened, celebrated once, then persisted.
   Safe to call often — already-earned achievements are never re-evaluated. */
var _checkingAchievements = false;
function checkAchievements(){
  if(_checkingAchievements) return []; // guard against re-entrant calls (logPtsChange below also calls checkAchievements)
  _checkingAchievements = true;
  var newlyEarned = [];
  try {
    ACH_DATA.forEach(function(a){
      if(earnedAchievements[a.id]) return; // already earned — permanent, don't re-check
      try {
        if(a.check()){
          earnedAchievements[a.id] = Date.now();
          newlyEarned.push(a);
        }
      } catch(e){ /* state not ready yet — skip silently, will catch next call */ }
    });
  } finally {
    _checkingAchievements = false;
  }

  if(newlyEarned.length){
    if(typeof saveState === 'function') saveState();
    newlyEarned.forEach(function(a){
      var reward = _achRewardFor(a.id);
      if(reward > 0 && typeof ptsVal !== 'undefined'){
        var old = ptsVal;
        ptsVal += reward;
        if(typeof animatePts === 'function') animatePts(old, ptsVal, 600);
        if(typeof logPtsChange === 'function') logPtsChange(reward);
        if(typeof addTxItem === 'function') addTxItem(a.ico, a.name + ' unlocked', 'Just now', '+'+reward, 'earn');
      }
      if(typeof T === 'function') T('🏆 Achievement unlocked: ' + a.name + (reward>0 ? ' (+'+reward+' pts)' : ''));
      if(typeof showSuccess === 'function') showSuccess(a.ico, a.name, 'rgba(224,85,120,.2)');
    });
    renderAchievements();
  }
  return newlyEarned;
}
window.checkAchievements = checkAchievements;
// Alias kept for the existing call sites in state.js (streak update path)
window.checkStreakAchievements = checkAchievements;

function renderRobAchievementRewards(){
  const list = document.getElementById('rob-ach-rewards-list');
  if(!list || typeof ACH_DATA === 'undefined') return;

  list.innerHTML = ACH_CATS.map(cat => {
    const items = ACH_DATA.filter(a => a.cat === cat.id);
    if(!items.length) return '';
    const rows = items.map(a => `
      <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05)">
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:700;color:#fff">${a.name}</div>
          <div style="font-size:10px;color:var(--tx3)">${a.desc}</div>
        </div>
        <input type="number" value="${_achRewardFor(a.id)}" min="0" step="10"
          style="width:70px;padding:6px 8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#fff;font-size:12px;text-align:right;flex-shrink:0"
          onchange="achievementRewards['${a.id}'] = Math.max(0, parseInt(this.value)||0); saveState(); T('💰 Reward updated');" />
      </div>`).join('');
    return `<div style="margin-bottom:6px">
      <div style="font-size:10px;font-weight:800;letter-spacing:.06em;color:var(--tx3);text-transform:uppercase;margin:10px 0 2px">${cat.label}</div>
      ${rows}
    </div>`;
  }).join('');
}
window.renderRobAchievementRewards = renderRobAchievementRewards;

function renderAchievements(){
  var container = document.getElementById('ach-categories');
  if(!container) return;

  var totalEarned = ACH_DATA.filter(function(a){ return !!earnedAchievements[a.id]; }).length;
  var total       = ACH_DATA.length;

  // Update totals
  var badge = document.getElementById('ach-total-badge');
  if(badge) badge.textContent = totalEarned + ' / ' + total;
  // Same total also shown in a second spot (Ana's Profile page) — used
  // to be a permanently-stuck hardcoded "12 / 30" that never updated
  var badgeProf = document.getElementById('ach-total-badge-prof');
  if(badgeProf) badgeProf.textContent = totalEarned + ' / ' + total;
  var fill = document.getElementById('ach-progress-fill');
  if(fill) fill.style.width = Math.round(totalEarned/total*100) + '%';

  container.innerHTML = ACH_CATS.map(function(cat){
    var items   = ACH_DATA.filter(function(a){ return a.cat === cat.id; });
    if(!items.length) return '';
    var earned  = items.filter(function(a){ return !!earnedAchievements[a.id]; }).length;
    var isOpen  = !_achCollapsed[cat.id];

    var itemsHtml = items.map(function(a, i){
      var isEarned = !!earnedAchievements[a.id];
      return '<div class="ach-item' + (isEarned ? '' : ' locked') + '" style="animation-delay:' + (i*.04) + 's" onclick="achTap(\''+a.id+'\')">'+
        '<div class="ach-item-ico' + (isEarned ? '' : ' locked') + '">' + achIco(a.ico) + '</div>'+
        '<div class="ach-item-body">'+
          '<div class="ach-item-name">' + a.name + '</div>'+
          '<div class="ach-item-desc">' + a.desc + '</div>'+
        '</div>'+
        (isEarned ? '<div class="ach-item-check"><svg viewBox="0 0 24 24" fill="none" stroke="var(--mint)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>' :
                    '<div class="ach-item-lock"><svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>')+
      '</div>';
    }).join('');

    return '<div class="ach-cat">'+
      '<div class="ach-cat-header" onclick="toggleAchCat(\''+cat.id+'\')">'+
        '<div class="ach-cat-ico" style="background:rgba(255,255,255,.07)">' + achIco(cat.ico) + '</div>'+
        '<div class="ach-cat-info">'+
          '<div class="ach-cat-name">' + cat.label + '</div>'+
          '<div class="ach-cat-prog">' + earned + ' / ' + items.length + '</div>'+
        '</div>'+
        '<div class="ach-cat-bar-wrap">'+
          '<div class="ach-cat-mini-bar"><div class="ach-cat-mini-fill" style="width:'+Math.round(earned/items.length*100)+'%;background:'+cat.color+'"></div></div>'+
        '</div>'+
        '<div class="ach-cat-chevron' + (isOpen ? ' open' : '') + '">'+
          '<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'+
        '</div>'+
      '</div>'+
      '<div class="ach-cat-body' + (isOpen ? ' open' : '') + '" id="ach-body-'+cat.id+'">'+
        itemsHtml +
      '</div>'+
    '</div>';
  }).join('');

  // Also refresh the profile preview icons
  var profIcons = document.getElementById('prof-ach-icons');
  if(profIcons){
    var earnedList = ACH_DATA.filter(function(a){ return !!earnedAchievements[a.id]; })
      .sort(function(a,b){ return earnedAchievements[b.id] - earnedAchievements[a.id]; })
      .slice(0,6);
    profIcons.innerHTML = earnedList.map(function(a){
      return '<div class="prof-ach-ico">' + achIco(a.ico) + '</div>';
    }).join('');
  }
}
window.renderAchievements = renderAchievements;

function toggleAchCat(catId){
  _achCollapsed[catId] = !_achCollapsed[catId];
  var body    = document.getElementById('ach-body-' + catId);
  var headers = document.querySelectorAll('.ach-cat-header');
  // find the correct chevron
  headers.forEach(function(h){
    if(h.getAttribute('onclick') && h.getAttribute('onclick').indexOf(catId) > -1){
      var chev = h.querySelector('.ach-cat-chevron');
      if(chev) chev.classList.toggle('open', !_achCollapsed[catId]);
    }
  });
  if(body){
    body.classList.toggle('open', !_achCollapsed[catId]);
  }
}
window.toggleAchCat = toggleAchCat;

function achTap(id){
  var a = ACH_DATA.find(function(x){ return x.id === id; });
  if(!a) return;
  if(earnedAchievements[a.id]){
    var when = new Date(earnedAchievements[a.id]).toLocaleDateString();
    T('Earned ' + when + ': ' + a.name + ' — ' + a.desc);
  } else {
    T('Locked: ' + a.desc);
  }
}
window.achTap = achTap;

// NOTE: achievement checks are intentionally NOT run on DOMContentLoaded.
// At that point loadState()/initSync() haven't run yet (they only run
// inside doLogin, after the user actually taps a login card), so every
// variable here is still at its blank in-memory default. Checking then
// would falsely "earn" date-based achievements (e.g. milestones, which
// compare today's real date against a fixed relationship start date)
// against empty state, immediately call saveState() before real data
// was ever loaded, and flag local state dirty for sync — risking a
// blank/default state overwriting the real synced data on Supabase.
// See js/login.js for the real hook point, right after state is loaded.
(function(){
  var _origGo = window.go;
  window.go = function(s){
    _origGo(s);
    if(s === 'logs'){
      setTimeout(function(){ checkAchievements(); renderAchievements(); }, 80);
    }
  };
})();

/* ═══════════════════════════════════════════
   DEV TESTING TOOL — Robert's Danger Zone only
   Simulates realistic values for every real stat each achievement's
   check() actually reads, then runs the real checkAchievements() —
   so this exercises the genuine check logic (and would catch a typo'd
   variable name or wrong comparison), rather than just flipping a
   flag to "earned". Only touches the specific counters/arrays used
   by achievements — never touches points, letters content, or
   anything else a real save relies on beyond what's needed here.
═══════════════════════════════════════════ */
function dvSimulateAchievementStats(){
  // Snapshot everything we're about to touch, so it can be restored
  // exactly afterward — achievements get permanently recorded in
  // earnedAchievements, but no fake content is left sitting in real
  // lists like the memory jar or wish list.
  var snapshot = {
    totalLettersSent: totalLettersSent, bestStreak: bestStreak, totalPtsEarned: totalPtsEarned,
    totalBonusesClaimed: totalBonusesClaimed, totalGiftBoxesOpened: totalGiftBoxesOpened,
    totalLuckySpins: totalLuckySpins,
    totalMoodsSet: totalMoodsSet, everChangedTheme: everChangedTheme,
    streakShieldUsedDate: streakShieldUsedDate,
    clickerGamesPlayed: clickerGamesPlayed, clickerBestScore: clickerBestScore, clickerLifetimeScore: clickerLifetimeScore,
    blastGamesPlayed: blastGamesPlayed, blastBestScore: blastBestScore, blastLifetimeScore: blastLifetimeScore,
    robertMood: JSON.parse(JSON.stringify(robertMood)),
    memoryJarItems: memoryJarItems.slice(), loveMapPins: loveMapPins.slice(),
    anaWishList: anaWishList.slice(), coupleGoalsList: coupleGoalsList.slice(),
    puzzleOfWeekData: puzzleOfWeekData ? JSON.parse(JSON.stringify(puzzleOfWeekData)) : null,
    dailyQuestionData: dailyQuestionData ? JSON.parse(JSON.stringify(dailyQuestionData)) : null,
    anaMessages: anaMessages.slice(),
    notifLog: notifLog.slice()
  };

  // Stage values high enough to pass every check() — temporarily.
  totalLettersSent = 120; bestStreak = 120; totalPtsEarned = 12000;
  totalBonusesClaimed = 20; totalGiftBoxesOpened = 20; totalLuckySpins = 35;
  totalMoodsSet = 5; everChangedTheme = true;
  streakShieldUsedDate = getTodayISO();
  clickerGamesPlayed = 12; clickerBestScore = 6000; clickerLifetimeScore = 30000;
  blastGamesPlayed = 12; blastBestScore = 6000; blastLifetimeScore = 30000;
  robertMood = {emoji:'🥰', label:'Loved', time:'Just now'};
  memoryJarItems = new Array(10).fill(0).map(function(_,i){ return {text:'x', date:'x'}; });
  loveMapPins    = new Array(5).fill(0).map(function(_,i){ return {emoji:'📍', label:'x', desc:'', date:''}; });
  anaWishList    = new Array(5).fill(0).map(function(_,i){ return {text:'x', cat:'Other', ico:'✨', status:'pending', by:'ana'}; });
  coupleGoalsList = new Array(3).fill(0).map(function(_,i){ return {text:'x', done:true}; });
  puzzleOfWeekData = {message:'TEST', solved:true};
  dailyQuestionData = {question:'x', answer:'x', date:getTodayISO()};
  anaMessages = [{text:'x', time:'Just now', read:true}];
  var nightOwlTs = new Date(); nightOwlTs.setHours(2,0,0,0);
  notifLog = [{id:'test-nightowl', type:'letter', ico:'💌', icoClass:'rose', title:'x', sub:'x', ts:nightOwlTs.getTime(), read:true, dismissed:false}];

  // Run the REAL check pass — this is what actually exercises each
  // achievement's genuine logic and permanently records earned ones.
  var earned = checkAchievements();

  // Restore every real value exactly as it was.
  totalLettersSent = snapshot.totalLettersSent; bestStreak = snapshot.bestStreak; totalPtsEarned = snapshot.totalPtsEarned;
  totalBonusesClaimed = snapshot.totalBonusesClaimed; totalGiftBoxesOpened = snapshot.totalGiftBoxesOpened;
  totalLuckySpins = snapshot.totalLuckySpins;
  totalMoodsSet = snapshot.totalMoodsSet; everChangedTheme = snapshot.everChangedTheme;
  streakShieldUsedDate = snapshot.streakShieldUsedDate;
  clickerGamesPlayed = snapshot.clickerGamesPlayed; clickerBestScore = snapshot.clickerBestScore; clickerLifetimeScore = snapshot.clickerLifetimeScore;
  blastGamesPlayed = snapshot.blastGamesPlayed; blastBestScore = snapshot.blastBestScore; blastLifetimeScore = snapshot.blastLifetimeScore;
  robertMood = snapshot.robertMood;
  memoryJarItems = snapshot.memoryJarItems; loveMapPins = snapshot.loveMapPins;
  anaWishList = snapshot.anaWishList; coupleGoalsList = snapshot.coupleGoalsList;
  puzzleOfWeekData = snapshot.puzzleOfWeekData; dailyQuestionData = snapshot.dailyQuestionData;
  anaMessages = snapshot.anaMessages;
  notifLog = snapshot.notifLog;

  saveState();
  renderAchievements();
  T('🏆 Test pass complete — ' + earned.length + ' new achievement(s) permanently unlocked (check Logs tab). All other data restored.');
}
window.dvSimulateAchievementStats = dvSimulateAchievementStats;

function dvResetAchievementStats(){
  earnedAchievements = {};
  window.earnedAchievements = earnedAchievements;
  saveState();
  renderAchievements();
  T('↩️ All earned achievements cleared — real progress (streaks, points, etc.) is untouched');
}
window.dvResetAchievementStats = dvResetAchievementStats;
