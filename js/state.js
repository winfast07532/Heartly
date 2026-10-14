

/* ═══════════════════════════════════
   ALL STATE DECLARATIONS — hoisted to
   prevent Temporal Dead Zone errors
═══════════════════════════════════ */
// Points & exchange
var ptsVal = 0;
var pixelArtState = { version: 3, works: {}, custom: {}, deleted: {}, lastArtwork: null };
var txHistoryOpen = false;
var ptsLog = []; // [{ts, amt}] — real history for weekly change display
var txLog = [];  // [{icon, title, amt, type, ts}] — real, persisted transaction feed (was pure ephemeral DOM state before, resetting to hardcoded demo entries on every reload)

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
// Reusable text blocks Robert can save from the Letter Library editor and
// drop back into any new note/surprise/letter. {id, name, icon, title, body, sig}
var letterTemplates = [];


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

// Love Languages — Ana sets these in her Settings; Robert reads them
// (read-only) in the Dev tab. Was previously written straight to a raw
// `heartly.loveLangs` localStorage key, completely outside saveState/
// applyState — meaning it never synced to Supabase and Robert's Dev
// tab had no way to see it at all, no matter which device either of
// them was on. Now it's a normal piece of shared state like everything
// else here. [] means "not set yet, defaults get filled in on first
// display" (see loadLoveLanguages in js/profile.js).
var currentLoveLangs = [];

// Explore sort
var exploreSort = 'default'; // 'default' | 'newest' | 'oldest' | 'points'

/* ── GAME COSMETICS (LoveBlast + Love Clicker) ──
   Points-shop purchases, real content Ana buys with her own points.
   Both games read these directly off window.parent since they're
   same-origin iframes (see loveblast/script.js, clicker/clicker-script.js). */
var loveblastOwnedCosmetics = []; // ids like 'lb_color_rosegold'
var loveblastEquippedColor  = 'classic';
var loveblastEquippedShape  = 'classic';
var loveblastEquippedFx     = 'classic';

var clickerOwnedCosmetics = []; // ids like 'ck_heart_diamond'
var clickerEquippedHeart = 'classic';
var clickerEquippedCombo = 'classic';

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
// Whether the Hot Streak Bonus has already been paid out for the CURRENT
// streak run. Reset to false whenever the streak breaks and restarts, so
// the bonus can be earned again the next time a run reaches 7 days.
var hotStreakBonusAwarded = false;
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
// Separate from Good Night Mode (mood card) above — this is Robert's
// control over the actual "Goodnight Letter" home card (used to be
// pure fake logic: `dayOfYear % 2 === 0`, claiming a letter was
// waiting every other day regardless of whether one actually was).
// null = nothing scheduled. 'YYYY-MM-DD' = the date a letter is ready.
var goodnightLetterNextDate = null;
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

// Same idea, for Love Blast — previously this game had no equivalent
// bridge at all, so it had zero achievements while Love Clicker had 5.
var blastGamesPlayed    = 0;
var blastBestScore      = 0;
var blastLifetimeScore  = 0;

/* ═══════════════════════════════════════════
   LOCALSTORAGE PERSISTENCE
═══════════════════════════════════════════ */
const STORAGE_KEY = 'heartly_v1';
let _saveTimer;

function saveState(){
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(function(){
    try {
      var themeUnlocks = {};
      if(typeof THEMES !== 'undefined'){
        Object.keys(THEMES).forEach(function(k){ themeUnlocks[k] = !!THEMES[k].unlocked; });
      }
      var s = {
        ptsVal: ptsVal,
        pixelArtState: pixelArtState,
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
        hotStreakBonusAwarded: hotStreakBonusAwarded,
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
        letterTemplates: letterTemplates,
        anaMood: anaMood,
        robertMood: robertMood,
        favourites: favourites,
        ptsLog: ptsLog,
        txLog: txLog,
        sentLetters: sentLetters,
        currentLoveLangs: currentLoveLangs,
        loveblastOwnedCosmetics: loveblastOwnedCosmetics,
        loveblastEquippedColor: loveblastEquippedColor,
        loveblastEquippedShape: loveblastEquippedShape,
        loveblastEquippedFx: loveblastEquippedFx,
        clickerOwnedCosmetics: clickerOwnedCosmetics,
        clickerEquippedHeart: clickerEquippedHeart,
        clickerEquippedCombo: clickerEquippedCombo,
        notifLog: notifLog,
        notifPrefs: (typeof notifPrefs !== 'undefined') ? notifPrefs : undefined,
        goodnightLetterNextDate: (typeof goodnightLetterNextDate !== 'undefined') ? goodnightLetterNextDate : undefined,
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
        blastGamesPlayed: blastGamesPlayed,
        blastBestScore: blastBestScore,
        blastLifetimeScore: blastLifetimeScore,
        earnedAchievements: (typeof earnedAchievements !== 'undefined') ? earnedAchievements : undefined,
        achievementRewards: (typeof achievementRewards !== 'undefined') ? achievementRewards : undefined,
        ED: (typeof ED !== 'undefined') ? ED : undefined
      };
      // A full device cache must not prevent a valid cloud save (custom pixel
      // pictures can be larger than ordinary letters and game counters).
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
      catch(storageError) { console.warn('Local state cache is unavailable:', storageError); }
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
    if(s.pixelArtState && window.PixelCore) pixelArtState = window.PixelCore.merge(pixelArtState, s.pixelArtState);
    if(s.ptsVal                    !== undefined) ptsVal                    = s.ptsVal;
    if(s.activeTheme               !== undefined) activeTheme               = s.activeTheme;
    if(s.hasSeenWelcome            !== undefined) hasSeenWelcome            = s.hasSeenWelcome;
    if(s.relationshipStartDate     !== undefined) relationshipStartDate     = s.relationshipStartDate;
    if(s.relationshipTimeline      !== undefined) relationshipTimeline      = s.relationshipTimeline;
    if(s.updatesLog                !== undefined) updatesLog                = s.updatesLog;
    if(s.txLog                     !== undefined) txLog                     = s.txLog;
    if(s.goodnightLetterNextDate   !== undefined) goodnightLetterNextDate   = s.goodnightLetterNextDate;
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
    if(s.hotStreakBonusAwarded    !== undefined) hotStreakBonusAwarded    = s.hotStreakBonusAwarded;
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
    if(s.letterTemplates          !== undefined) letterTemplates          = s.letterTemplates;
    if(s.anaMood                  !== undefined) anaMood                  = s.anaMood;
    if(s.robertMood               !== undefined) robertMood               = s.robertMood;
    if(s.favourites               !== undefined) favourites               = s.favourites;
    if(s.ptsLog                   !== undefined) ptsLog                   = s.ptsLog;
    if(s.sentLetters              !== undefined) sentLetters              = s.sentLetters;
    if(s.currentLoveLangs         !== undefined) currentLoveLangs         = s.currentLoveLangs;
    if(s.loveblastOwnedCosmetics  !== undefined) loveblastOwnedCosmetics  = s.loveblastOwnedCosmetics;
    if(s.loveblastEquippedColor   !== undefined) loveblastEquippedColor   = s.loveblastEquippedColor;
    if(s.loveblastEquippedShape   !== undefined) loveblastEquippedShape   = s.loveblastEquippedShape;
    if(s.loveblastEquippedFx      !== undefined) loveblastEquippedFx      = s.loveblastEquippedFx;
    if(s.clickerOwnedCosmetics    !== undefined) clickerOwnedCosmetics    = s.clickerOwnedCosmetics;
    if(s.clickerEquippedHeart     !== undefined) clickerEquippedHeart     = s.clickerEquippedHeart;
    if(s.clickerEquippedCombo     !== undefined) clickerEquippedCombo     = s.clickerEquippedCombo;
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
    if(s.blastGamesPlayed          !== undefined) blastGamesPlayed          = s.blastGamesPlayed;
    if(s.blastBestScore            !== undefined) blastBestScore            = s.blastBestScore;
    if(s.blastLifetimeScore        !== undefined) blastLifetimeScore        = s.blastLifetimeScore;
    // Full replace, not merge — unlike notifPrefs/ED below, this needs to
    // support removal (e.g. the dev "Revoke" tool). A key-by-key merge can
    // only ever add achievements, never take one away, so a revoked
    // achievement would silently reappear on the other device the next
    // time it re-adds its own already-earned keys back in.
    if(s.earnedAchievements !== undefined && typeof earnedAchievements !== 'undefined'){
      earnedAchievements = s.earnedAchievements;
      window.earnedAchievements = earnedAchievements;
    }
    if(s.achievementRewards !== undefined && typeof achievementRewards !== 'undefined'){
      achievementRewards = s.achievementRewards;
      window.achievementRewards = achievementRewards;
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
  // Real calendar-day boundary in Europe/Bucharest, regardless of the
  // device's own timezone — the single source of truth for "today"
  // used by the streak and every other daily-reset feature.
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Bucharest' }); // 'YYYY-MM-DD'
}
window.getTodayISO = getTodayISO;

function _bucharestDateOf(msTimestamp){
  return new Date(msTimestamp).toLocaleDateString('en-CA', { timeZone: 'Europe/Bucharest' });
}

function getYesterdayISO(){
  return _bucharestDateOf(Date.now() - 86400000);
}

function getDayBeforeYesterdayISO(){
  return _bucharestDateOf(Date.now() - 2*86400000);
}

// Tap-to-check: how long until the streak ticks up by 1 (real time
// remaining until the next Bucharest midnight, since that's the actual
// day boundary the streak now uses).
function getNextStreakCountdown(){
  if(!lastOpenDate) return 'Open today to start your streak!';
  var todayBuch = getTodayISO();
  var lastOpenDay = _bucharestDateOf(lastOpenDate);
  if(lastOpenDay !== todayBuch) return 'Come back now to lock in your +1!';

  // ms remaining until the next Bucharest midnight
  var parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Bucharest', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false
  }).formatToParts(new Date());
  var get = t => parseInt(parts.find(p=>p.type===t).value, 10);
  var secondsIntoDay = get('hour')*3600 + get('minute')*60 + get('second');
  var remaining = (86400 - secondsIntoDay) * 1000;

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
  // Increments the streak by 1 once per real Bucharest calendar day.
  // "Today" always means the current date in Europe/Bucharest, no
  // matter what timezone the device itself is set to.
  var now = Date.now();
  var today = getTodayISO(); // Bucharest 'YYYY-MM-DD'
  var lastOpenDay = lastOpenDate ? _bucharestDateOf(lastOpenDate) : null;

  if(lastOpenDay === today){
    // Already opened today (Bucharest time) — no change
    refreshStreakUI();
    return;
  }

  var daysSince = lastOpenDay
    ? Math.round((new Date(today+'T00:00:00Z') - new Date(lastOpenDay+'T00:00:00Z')) / 86400000)
    : null;

  // More than one Bucharest day was skipped since the last open — streak is at risk.
  if(lastOpenDay && daysSince >= 2){
    var shieldAvailable = shopStreakShield &&
      (!streakShieldUsedDate || (now - new Date(streakShieldUsedDate+'T00:00:00Z').getTime()) >= 7 * 86400000);

    if(shieldAvailable){
      // Shield absorbs the missed day(s) — streak continues, shield goes on cooldown.
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
    hotStreakBonusAwarded = false; // new run — bonus can be earned again at day 7
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
  renderUniversalMilestone();
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

/* ═══════════════════════════════════════════
   UNIVERSAL MILESTONES — real progress ladder
   based on totalPtsEarned (lifetime points ever
   earned — doesn't drop when you spend, unlike
   ptsVal). Replaces what used to be a permanently
   frozen "450 of 1000 / Next Milestone: Memory
   Box" hardcoded in two places in index.html.
═══════════════════════════════════════════ */
var UNIVERSAL_MILESTONES = [
  { at: 250,   label: 'First Spark 💫' },
  { at: 500,   label: 'Warming Up 🔥' },
  { at: 1000,  label: 'Memory Box ✨' },
  { at: 2000,  label: 'Golden Hour 🌅' },
  { at: 3500,  label: 'Written in the Stars 🌌' },
  { at: 5000,  label: 'Forever Mode 💍' },
];
function renderUniversalMilestone(){
  var earned = totalPtsEarned || 0;
  var next = UNIVERSAL_MILESTONES.find(function(m){ return m.at > earned; });
  var pctText, labelText, pct;
  if(next){
    var prevAt = 0;
    for(var i=0;i<UNIVERSAL_MILESTONES.length;i++){
      if(UNIVERSAL_MILESTONES[i] === next) break;
      prevAt = UNIVERSAL_MILESTONES[i].at;
    }
    pct = Math.max(0, Math.min(100, Math.round((earned - prevAt) / (next.at - prevAt) * 100)));
    pctText = earned.toLocaleString() + ' of ' + next.at.toLocaleString();
    labelText = next.label;
  } else {
    pct = 100;
    pctText = earned.toLocaleString() + ' — all milestones reached';
    labelText = 'Everything unlocked 🏆';
  }
  ['prof','home'].forEach(function(scope){
    var bar = document.getElementById('milestone-bar-'+scope);
    var pts = document.getElementById('milestone-pts-'+scope);
    var lbl = document.getElementById('milestone-label-'+scope);
    if(bar) bar.style.setProperty('--w', pct+'%');
    if(pts) pts.textContent = pctText;
    if(lbl) lbl.textContent = labelText;
  });
}
window.renderUniversalMilestone = renderUniversalMilestone;
