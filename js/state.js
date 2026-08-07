

/* ═══════════════════════════════════
   ALL STATE DECLARATIONS — hoisted to
   prevent Temporal Dead Zone errors
═══════════════════════════════════ */
// Points & exchange
var ptsVal = 0;
var txHistoryOpen = false;
var ptsLog = []; // [{ts, amt}] — real history for weekly change display

// Notification state
var notifOpen = false;
var dismissedNotifs = new Set();
var readNotifs = new Set();
var notifLog = []; // [{id, type, ico, icoClass, title, sub, ts, read, dismissed, letterTitle, letterBody, letterSig}] — real events only

// User/auth
var currentUser = null;
var hasSeenWelcome = false;
var relationshipStartDate = null; // 'YYYY-MM-DD' — null means "not set yet, use the default"
var relationshipTimeline = []; // [{id, ico, title, sub, date, badge, style}] — Robert-authored, real timeline entries shown in Logs
var updatesLog = []; // [{version, dateLabel, items:[string]}] — Robert-authored, real changelog shown in Logs

// Letters & content
var sentLetters = [];
var currentLetterType = 'note';
var homeLettersData = [];

// Search
var searchOpen = false;
var searchQuery = '';

// Schedule
var scheduleEnabled = false;

// Theme
var activeTheme = 'rose';
var canvasThemeId = 'rose';
// THEMES pre-initialized so canvas IIFE can safely reference it
var THEMES = {
  rose: { name:'Midnight Rose', cost:0, unlocked:true, orbs:[[210,100,145],[175,55,105],[145,40,90],[80,15,55],[45,5,35],[30,2,22]], bgStops:['#1c0228','#120018','#07000e'] },
  royal: { name:'Royal Blue', cost:800, unlocked:false, orbs:[[58,65,200],[80,90,210],[50,55,180],[25,30,120],[15,18,80],[8,10,50]], bgStops:['#02052e','#010318','#01010e'] }
};

// Dev
var devCurrentTab = 'notes';
var devEditIndex = null;

// Buy sheet
var buyPending = null;

// Favourites
var favourites = [];

// Current open letter (for favourites)
var currentLetter = null;

// Profile
var profTimerInt;

// Splash
var spSlide = 0;

// Mood
var anaMood = {
  emoji: '🥰',
  label: 'Loved',
  msg: 'So loved 💕',
  time: 'Just now',
  history: [
    {emoji:'😊', label:'Happy',   time:'Yesterday'},
    {emoji:'💭', label:'Missing', time:'2 days ago'},
    {emoji:'🥰', label:'Loved',   time:'3 days ago'},
  ]
};

// Robert's mood (set by Robert, seen by Ana on Home)
var robertMood = {
  emoji: null,
  label: null,
  time: null
};

// Ana's messages to Robert
var anaMessages = [];


// Ana's Wish List
var shopMood       = false; // Ana buys from shop
var shopWishList   = false; // Ana buys from shop
var shopWriteToRob = false; // Ana buys from shop
var anaWishList    = [];   // Ana's wish list items
var robertWishList = [];   // Robert's wish list items
var anaSuggestions = [];   // Ana's suggestion box items

// ── DAILY STREAK ──
var currentStreak = 0;
var bestStreak    = 0;
var lastOpenDate  = null; // ms timestamp (Date.now()) of last streak increment
var streakShieldUsedDate = null; // ISO date string — shield used once per week

// Explore sort
var exploreSort = 'default'; // 'default' | 'newest' | 'oldest' | 'points'

// Sent tab unread badge state
var sentUnreadBadge = false;

// Long-press timer handle
var _lpTimer = null;

// Draft saving
var robDraft = null; // {title, body, sig, type} or null

// Calendar
var calMonth = null; // Date object for current calendar month
var calSelectedDate = null;

// Letter reactions — stored on sentLetters items as .reaction
// reaction: {emoji, label, time} or null
var REACTION_OPTS = [
  {emoji:'❤️', label:'Love it'},
  {emoji:'🥰', label:'So sweet'},
  {emoji:'😭', label:'Cried'},
  {emoji:'😂', label:'Made me laugh'},
  {emoji:'✨', label:'Magical'},
];

// ── SHOP UNLOCKS ──────────────────────────────────────────────
// Boosts
var shopStreakShield  = false; // protects streak once/week
var shopDailyBonus   = false; // daily +50 pts tap on home
var shopDailyBonusLastClaimed = null; // ISO date string
var shopDailyGiftBox  = false; // mystery box every 24hrs
var shopDailyGiftLastClaimed = null;  // date string
var shopHotStreak     = false; // auto +100 at 7-day streak
var shopVIPPass       = false; // all daily bonuses for a week
var shopVIPPassExpiry = null;  // ISO date string

// Relationship features
var shopCoupleSong   = null;  // {title, artist} or null
var shopAnniversaryCard = false;
var shopMemoryJar    = false; // unlocks memory jar feature
var memoryJarItems   = [];    // [{text, date}] Robert's memories
var shopLoveMap       = false; // 📍 pinned place cards on home
var loveMapPins       = [];    // [{label, emoji, desc, date}]
// New relationship items
var shopCountdown     = false; // countdown timer to a date
var shopCountdownData = null;  // {label, date}
var shopGoodNight     = false; // goodnight mode
var shopGoodNightTime = '22:00'; // HH:MM
var shopCoupleGoals   = false; // couple goals
var coupleGoalsList   = [];    // [{text, done}]
var shopDateNight     = false; // date night picker
var dateNightIdeas    = [];    // [string]
var shopDailyQuestion = false; // daily question
var dailyQuestionData = null;  // {question, answer, date}
var shopPhotoOfDay    = false; // photo of the day
var photoOfDayData    = null;  // {dataUrl, date}
// Game & Fun
var shopLuckySpin     = false; // lucky spin daily
var shopLuckySpinLastUsed = null;
var shopPuzzleOfWeek  = false; // puzzle of the week
var puzzleOfWeekData  = null;  // {message, grid, solved}

/* ═══════════════════════════════════════════
   LIFETIME COUNTERS — for achievements
   Incremented once, at the exact moment a real
   action happens (never derived/recomputed,
   never reset by claiming/spending/daily resets).
═══════════════════════════════════════════ */
var totalLettersSent          = 0; // real letters sent from the Dev tab (pushLetterNotif)
var totalPtsEarned            = 0; // sum of all positive point deltas, ever
var totalMoodsSet             = 0; // times Ana picked a mood
var totalBonusesClaimed       = 0; // Daily Bonus taps
var totalGiftBoxesOpened      = 0; // Daily Gift Box opens
var totalLuckySpins           = 0; // Lucky Spin uses
var everChangedTheme          = false; // set true the first time Ana picks a non-default theme

/* Love Clicker — reported by the game's own bridge (clicker/clicker-script.js)
   at the end of each real session, into the MAIN app's persisted state
   (not just the iframe's isolated localStorage), so achievements can see it. */
var clickerGamesPlayed  = 0; // real completed sessions
var clickerBestScore    = 0; // best single-session score, ever
var clickerLifetimeScore= 0; // sum of every real session's score, ever

/* ═══════════════════════════════════════════
   LOCALSTORAGE PERSISTENCE
═══════════════════════════════════════════ */
const STORAGE_KEY = 'heartly_v1';
let _saveTimer;

function saveState(){
  // Mark dirty IMMEDIATELY so sync knows not to overwrite
  // in-memory state during the 300ms debounce window.
  window._heartlyLocalDirty = Date.now();
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(function(){
    try {
      var themeUnlocks = {};
      if(typeof THEMES !== 'undefined'){
        Object.keys(THEMES).forEach(function(k){ themeUnlocks[k] = !!THEMES[k].unlocked; });
      }
      var s = {
        ptsVal: ptsVal,
        activeTheme: activeTheme,
        themeUnlocks: themeUnlocks,
        hasSeenWelcome: hasSeenWelcome,
        relationshipStartDate: relationshipStartDate,
        relationshipTimeline: relationshipTimeline,
        updatesLog: updatesLog,
        shopStreakShield: shopStreakShield,
        shopDailyBonus: shopDailyBonus,
        shopDailyBonusLastClaimed: shopDailyBonusLastClaimed,
        shopDailyGiftBox: shopDailyGiftBox,
        shopDailyGiftLastClaimed: shopDailyGiftLastClaimed,
        shopHotStreak: shopHotStreak,
        shopVIPPass: shopVIPPass,
        shopVIPPassExpiry: shopVIPPassExpiry,
        shopCoupleSong: shopCoupleSong,
        shopAnniversaryCard: shopAnniversaryCard,
        shopMemoryJar: shopMemoryJar,
        shopLoveMap: shopLoveMap,
        memoryJarItems: memoryJarItems,
        loveMapPins: loveMapPins,
        shopCountdown: shopCountdown,
        shopCountdownData: shopCountdownData,
        shopGoodNight: shopGoodNight,
        shopGoodNightTime: shopGoodNightTime,
        shopCoupleGoals: shopCoupleGoals,
        coupleGoalsList: coupleGoalsList,
        shopDateNight: shopDateNight,
        dateNightIdeas: dateNightIdeas,
        shopDailyQuestion: shopDailyQuestion,
        dailyQuestionData: dailyQuestionData,
        shopPhotoOfDay: shopPhotoOfDay,
        photoOfDayData: photoOfDayData,
        shopLuckySpin: shopLuckySpin,
        shopLuckySpinLastUsed: shopLuckySpinLastUsed,
        shopPuzzleOfWeek: shopPuzzleOfWeek,
        puzzleOfWeekData: puzzleOfWeekData,
        currentStreak: currentStreak,
        bestStreak: bestStreak,
        lastOpenDate: lastOpenDate,
        streakShieldUsedDate: streakShieldUsedDate,
        shopMood: shopMood,
        shopWishList: shopWishList,
        shopWriteToRob: shopWriteToRob,
        anaWishList: anaWishList,
        robertWishList: robertWishList,
        anaSuggestions: anaSuggestions,
        anaMessages: anaMessages,
        anaMood: anaMood,
        robertMood: robertMood,
        favourites: favourites,
        ptsLog: ptsLog,
        sentLetters: sentLetters,
        notifLog: notifLog,
        notifPrefs: (typeof notifPrefs !== 'undefined') ? notifPrefs : undefined,
        totalLettersSent: totalLettersSent,
        totalPtsEarned: totalPtsEarned,
        totalMoodsSet: totalMoodsSet,
        totalBonusesClaimed: totalBonusesClaimed,
        totalGiftBoxesOpened: totalGiftBoxesOpened,
        totalLuckySpins: totalLuckySpins,
        everChangedTheme: everChangedTheme,
        clickerGamesPlayed: clickerGamesPlayed,
        clickerBestScore: clickerBestScore,
        clickerLifetimeScore: clickerLifetimeScore,
        earnedAchievements: (typeof earnedAchievements !== 'undefined') ? earnedAchievements : undefined,
        ED: (typeof ED !== 'undefined') ? ED : undefined
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      if(typeof window.pushRemoteState === 'function') window.pushRemoteState(s);
    } catch(e){ console.warn('saveState failed:', e); }
  }, 300);
}

function loadState(){
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return;
    var s = JSON.parse(raw);
    applyState(s);
  } catch(e){ console.warn('loadState failed:', e); }
}

// Applies a state blob (from localStorage OR an incoming Supabase sync payload)
// to the in-memory app variables. Used by loadState() and by sync.js.
function applyState(s){
  try {
    if(!s) return;
    if(s.ptsVal                    !== undefined) ptsVal                    = s.ptsVal;
    if(s.activeTheme               !== undefined) activeTheme               = s.activeTheme;
    if(s.hasSeenWelcome            !== undefined) hasSeenWelcome            = s.hasSeenWelcome;
    if(s.relationshipStartDate     !== undefined) relationshipStartDate     = s.relationshipStartDate;
    if(s.relationshipTimeline      !== undefined) relationshipTimeline      = s.relationshipTimeline;
    if(s.updatesLog                !== undefined) updatesLog                = s.updatesLog;
    if(s.themeUnlocks && typeof THEMES !== 'undefined'){
      Object.keys(s.themeUnlocks).forEach(function(k){
        if(THEMES[k]) THEMES[k].unlocked = s.themeUnlocks[k];
      });
    }
    if(s.shopStreakShield          !== undefined) shopStreakShield          = s.shopStreakShield;
    if(s.shopDailyBonus           !== undefined) shopDailyBonus           = s.shopDailyBonus;
    if(s.shopDailyBonusLastClaimed !== undefined) shopDailyBonusLastClaimed = s.shopDailyBonusLastClaimed;
    if(s.shopDailyGiftBox         !== undefined) shopDailyGiftBox         = s.shopDailyGiftBox;
    if(s.shopDailyGiftLastClaimed !== undefined) shopDailyGiftLastClaimed = s.shopDailyGiftLastClaimed;
    if(s.shopHotStreak            !== undefined) shopHotStreak            = s.shopHotStreak;
    if(s.shopVIPPass              !== undefined) shopVIPPass              = s.shopVIPPass;
    if(s.shopVIPPassExpiry        !== undefined) shopVIPPassExpiry        = s.shopVIPPassExpiry;
    if(s.shopCoupleSong           !== undefined) shopCoupleSong           = s.shopCoupleSong;
    if(s.shopAnniversaryCard      !== undefined) shopAnniversaryCard      = s.shopAnniversaryCard;
    if(s.shopMemoryJar            !== undefined) shopMemoryJar            = s.shopMemoryJar;
    if(s.shopLoveMap              !== undefined) shopLoveMap              = s.shopLoveMap;
    if(s.memoryJarItems           !== undefined) memoryJarItems           = s.memoryJarItems;
    if(s.loveMapPins              !== undefined) loveMapPins              = s.loveMapPins;
    if(s.shopCountdown            !== undefined) shopCountdown            = s.shopCountdown;
    if(s.shopCountdownData        !== undefined) shopCountdownData        = s.shopCountdownData;
    if(s.shopGoodNight            !== undefined) shopGoodNight            = s.shopGoodNight;
    if(s.shopGoodNightTime         !== undefined && s.shopGoodNightTime) shopGoodNightTime = s.shopGoodNightTime;
    if(s.shopCoupleGoals          !== undefined) shopCoupleGoals          = s.shopCoupleGoals;
    if(s.coupleGoalsList          !== undefined) coupleGoalsList          = s.coupleGoalsList;
    if(s.shopDateNight            !== undefined) shopDateNight            = s.shopDateNight;
    if(s.dateNightIdeas           !== undefined) dateNightIdeas           = s.dateNightIdeas;
    if(s.shopDailyQuestion        !== undefined) shopDailyQuestion        = s.shopDailyQuestion;
    if(s.dailyQuestionData        !== undefined) dailyQuestionData        = s.dailyQuestionData;
    if(s.shopPhotoOfDay           !== undefined) shopPhotoOfDay           = s.shopPhotoOfDay;
    if(s.photoOfDayData           !== undefined) photoOfDayData           = s.photoOfDayData;
    if(s.shopLuckySpin            !== undefined) shopLuckySpin            = s.shopLuckySpin;
    if(s.shopLuckySpinLastUsed    !== undefined) shopLuckySpinLastUsed    = s.shopLuckySpinLastUsed;
    if(s.shopPuzzleOfWeek         !== undefined) shopPuzzleOfWeek         = s.shopPuzzleOfWeek;
    if(s.puzzleOfWeekData         !== undefined) puzzleOfWeekData         = s.puzzleOfWeekData;
    if(s.currentStreak            !== undefined) currentStreak            = s.currentStreak;
    if(s.bestStreak               !== undefined) bestStreak               = s.bestStreak;
    if(s.lastOpenDate             !== undefined) lastOpenDate             = s.lastOpenDate;
    if(s.streakShieldUsedDate     !== undefined) streakShieldUsedDate     = s.streakShieldUsedDate;
    if(s.shopMood                 !== undefined) shopMood                 = s.shopMood;
    if(s.shopWishList             !== undefined) shopWishList             = s.shopWishList;
    if(s.shopWriteToRob           !== undefined) shopWriteToRob           = s.shopWriteToRob;
    if(s.anaWishList              !== undefined) anaWishList              = s.anaWishList;
    if(s.robertWishList           !== undefined) robertWishList           = s.robertWishList;
    if(s.anaSuggestions           !== undefined) anaSuggestions           = s.anaSuggestions;
    if(s.anaMessages              !== undefined) anaMessages              = s.anaMessages;
    if(s.anaMood                  !== undefined) anaMood                  = s.anaMood;
    if(s.robertMood               !== undefined) robertMood               = s.robertMood;
    if(s.favourites               !== undefined) favourites               = s.favourites;
    if(s.ptsLog                   !== undefined) ptsLog                   = s.ptsLog;
    if(s.sentLetters              !== undefined) sentLetters              = s.sentLetters;
    if(s.notifLog                 !== undefined) notifLog                 = s.notifLog;
    if(s.notifPrefs && typeof notifPrefs !== 'undefined'){
      Object.keys(s.notifPrefs).forEach(function(k){ notifPrefs[k] = s.notifPrefs[k]; });
    }
    if(s.totalLettersSent          !== undefined) totalLettersSent          = s.totalLettersSent;
    if(s.totalPtsEarned            !== undefined) totalPtsEarned            = s.totalPtsEarned;
    if(s.totalMoodsSet             !== undefined) totalMoodsSet             = s.totalMoodsSet;
    if(s.totalBonusesClaimed       !== undefined) totalBonusesClaimed       = s.totalBonusesClaimed;
    if(s.totalGiftBoxesOpened      !== undefined) totalGiftBoxesOpened      = s.totalGiftBoxesOpened;
    if(s.totalLuckySpins           !== undefined) totalLuckySpins           = s.totalLuckySpins;
    if(s.everChangedTheme          !== undefined) everChangedTheme          = s.everChangedTheme;
    if(s.clickerGamesPlayed        !== undefined) clickerGamesPlayed        = s.clickerGamesPlayed;
    if(s.clickerBestScore          !== undefined) clickerBestScore          = s.clickerBestScore;
    if(s.clickerLifetimeScore      !== undefined) clickerLifetimeScore      = s.clickerLifetimeScore;
    if(s.earnedAchievements && typeof earnedAchievements !== 'undefined'){
      Object.keys(s.earnedAchievements).forEach(function(k){ earnedAchievements[k] = s.earnedAchievements[k]; });
    }
    if(s.ED && typeof ED !== 'undefined'){
      Object.keys(s.ED).forEach(function(k){ ED[k] = s.ED[k]; });
    }
  } catch(e){ console.warn('applyState failed:', e); }
}

window.saveState = saveState;
window.loadState = loadState;
window.applyState = applyState;

/* ═══════════════════════════════════════════
   LOGIN STREAK ENGINE
   Called on every login (after loadState).
   Increments +1 per login, but only once per
   rolling 24h window since the last increment.
═══════════════════════════════════════════ */
function getTodayISO(){
  var d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth()+1).padStart(2,'0') + '-' +
    String(d.getDate()).padStart(2,'0');
}

function getYesterdayISO(){
  var d = new Date();
  d.setDate(d.getDate() - 1);
  return d.getFullYear() + '-' +
    String(d.getMonth()+1).padStart(2,'0') + '-' +
    String(d.getDate()).padStart(2,'0');
}

function getDayBeforeYesterdayISO(){
  var d = new Date();
  d.setDate(d.getDate() - 2);
  return d.getFullYear() + '-' +
    String(d.getMonth()+1).padStart(2,'0') + '-' +
    String(d.getDate()).padStart(2,'0');
}

// Tap-to-check: how long until the streak ticks up by 1
function getNextStreakCountdown(){
  if(!lastOpenDate) return 'Open today to start your streak!';
  var msIn24h = 24 * 60 * 60 * 1000;
  var remaining = msIn24h - (Date.now() - lastOpenDate);
  if(remaining <= 0) return 'Come back now to lock in your +1!';
  var h = Math.floor(remaining / (60 * 60 * 1000));
  var m = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  if(h > 0) return 'Next +1 in ' + h + 'h ' + m + 'm';
  return 'Next +1 in ' + m + 'm';
}
window.getNextStreakCountdown = getNextStreakCountdown;

function showStreakInfo(){
  var headline = '🔥 ' + currentStreak + '-day streak';
  if(currentStreak >= bestStreak && currentStreak > 1) headline += ' — personal best!';
  T(headline + '. ' + getNextStreakCountdown());
}
window.showStreakInfo = showStreakInfo;

function checkAndUpdateStreak(){
  // Increments the streak by 1, but only once per rolling 24h window
  // since her last login — logging in again sooner doesn't count twice.
  var now = Date.now();
  var msIn24h = 24 * 60 * 60 * 1000;
  var msIn48h = 48 * 60 * 60 * 1000;

  if(lastOpenDate && (now - lastOpenDate) < msIn24h){
    // Logged in again within 24h — no change
    refreshStreakUI();
    return;
  }

  // A full day (or more) was skipped since the last open — streak is at risk.
  if(lastOpenDate && (now - lastOpenDate) >= msIn48h){
    var shieldAvailable = shopStreakShield &&
      (!streakShieldUsedDate || (now - new Date(streakShieldUsedDate).getTime()) >= 7 * msIn24h);

    if(shieldAvailable){
      // Shield absorbs the missed day — streak continues, shield goes on cooldown.
      streakShieldUsedDate = getTodayISO();
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
      lastOpenDate = now;
      saveState();
      refreshStreakUI();
      T('🛡️ Streak Shield protected your ' + currentStreak + '-day streak!');
      if(typeof renderStreakShieldCard === 'function') renderStreakShieldCard();
      if(typeof checkHotStreak === 'function') checkHotStreak();
      if(typeof checkStreakAchievements === 'function') checkStreakAchievements();
      return;
    }

    // No shield — streak breaks and restarts at 1.
    var lostStreak = currentStreak;
    currentStreak = 1;
    lastOpenDate = now;
    saveState();
    refreshStreakUI();
    T('💔 Streak reset — welcome back! Day 1');
    if(typeof logNotif === 'function' && (typeof notifPrefs === 'undefined' || notifPrefs.streak !== false)){
      logNotif({
        type: 'streak',
        title: 'Your streak ended',
        sub: 'Your ' + lostStreak + '-day streak reset — today starts a new one.'
      });
    }
    if(typeof renderStreakShieldCard === 'function') renderStreakShieldCard();
    return;
  }

  currentStreak++;
  bestStreak = Math.max(bestStreak, currentStreak);
  lastOpenDate = now;
  saveState();
  refreshStreakUI();

  // Streak milestone toasts
  if(currentStreak === 3)  T('⚡ 3-day streak! You\'re on fire!');
  if(currentStreak === 7)  T('🔥 7-day streak! One full week!');
  if(currentStreak === 14) T('🔥 14-day streak! Two solid weeks!');
  if(currentStreak === 30) T('🔥 30-day streak! A whole month!');
  if(currentStreak === 60) T('🔥 60-day streak! Unstoppable!');
  if(currentStreak === 100) T('🏆 100-day streak! LEGENDARY!');

  // Let Robert know when Ana hits a milestone — he's not the one looking at the screen right now
  if(typeof triggerPush === 'function' && [3,7,14,30,60,100].includes(currentStreak)){
    triggerPush('robert', '🔥 Streak milestone!', `Ana just hit a ${currentStreak}-day streak.`, 'heartly-streak-milestone');
  }
  // Also log it in Ana's own in-app notification panel, as a real event
  if([3,7,14,30,60,100].includes(currentStreak) && typeof logNotif === 'function' && (typeof notifPrefs === 'undefined' || notifPrefs.streak !== false)){
    logNotif({
      type: 'streak',
      title: `You're on a ${currentStreak}-day streak! 🔥`,
      sub: 'Open a letter today to keep it going'
    });
  }

  // Check hot streak bonus
  if(typeof checkHotStreak === 'function') checkHotStreak();
  // Check streak achievements
  if(typeof checkStreakAchievements === 'function') checkStreakAchievements();
  if(typeof renderStreakShieldCard === 'function') renderStreakShieldCard();
}
window.checkAndUpdateStreak = checkAndUpdateStreak;

/* ── Refresh all streak UI elements across the app ── */
function refreshStreakUI(){
  var s = currentStreak;
  var b = bestStreak;

  // Home streak card
  var strNum = document.querySelector('.str-num');
  if(strNum) strNum.textContent = s;

  // Home streak subtitle
  var strSub = document.querySelector('.str-sub');
  if(strSub){
    if(s === 1) strSub.textContent = 'Welcome back! Your streak starts now';
    else if(s < 7) strSub.textContent = 'Keep opening Heartly every day!';
    else if(s < 14) strSub.textContent = 'You\'re on a roll! Don\'t stop now';
    else if(s < 30) strSub.textContent = 'You\'ve opened Heartly every day';
    else if(s < 60) strSub.textContent = 'A whole month of dedication!';
    else if(s < 100) strSub.textContent = 'Incredible consistency!';
    else strSub.textContent = 'LEGENDARY streak! Unstoppable!';
  }

  // Home streak card onclick — shows time remaining until the next +1
  var streakCard = document.querySelector('.streak');
  if(streakCard) streakCard.onclick = function(e){ R(e, this); showStreakInfo(); };

  // Profile stat
  var profStreak = document.getElementById('prof-stat-streak');
  if(profStreak) profStreak.textContent = s;

  // Profile pstat grid (the 6-stat grid at top of profile)
  var pstatStreak = document.querySelector('.pstat:nth-child(3) .pstat-val');
  if(pstatStreak) pstatStreak.textContent = s;

  // Logs stat
  var logsStreak = document.getElementById('logs-streak');
  if(logsStreak) logsStreak.textContent = s;

  // Robert's view — Ana's streak
  var robStreak = document.getElementById('rob-stat-streak');
  if(robStreak) robStreak.textContent = s;

  // Expose for other modules
  window.currentStreak = currentStreak;
  window.bestStreak    = bestStreak;
}
window.refreshStreakUI = refreshStreakUI;

/* ═══════════════════════════════════════════
   POINTS LOG — real weekly change tracking
   Call logPtsChange(delta) whenever ptsVal
   actually changes from a real event (not
   from a pure visual re-animation).
═══════════════════════════════════════════ */
function logPtsChange(delta){
  if(!delta) return;
  ptsLog.push({ ts: Date.now(), amt: delta });
  if(delta > 0) totalPtsEarned += delta;
  // Keep the log bounded — drop anything older than 30 days
  var cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
  ptsLog = ptsLog.filter(function(e){ return e.ts >= cutoff; });
  saveState();
  refreshPtsChg();
  if(typeof checkAchievements === 'function') checkAchievements();
}
window.logPtsChange = logPtsChange;

function getWeeklyPtsChange(){
  var cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
  return ptsLog
    .filter(function(e){ return e.ts >= cutoff; })
    .reduce(function(sum, e){ return sum + e.amt; }, 0);
}
window.getWeeklyPtsChange = getWeeklyPtsChange;

function refreshPtsChg(){
  var el = document.getElementById('pts-chg');
  if(!el) return;
  var change = getWeeklyPtsChange();
  if(change > 0) el.textContent = '↑ +' + change.toLocaleString() + ' this week';
  else if(change < 0) el.textContent = '↓ ' + change.toLocaleString() + ' this week';
  else el.textContent = 'No change this week';
}
window.refreshPtsChg = refreshPtsChg;
