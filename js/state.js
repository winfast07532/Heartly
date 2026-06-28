

/* ═══════════════════════════════════
   ALL STATE DECLARATIONS — hoisted to
   prevent Temporal Dead Zone errors
═══════════════════════════════════ */
// Points & exchange
var ptsVal = 3200;
var txHistoryOpen = false;

// Notification state
var notifOpen = false;
var dismissedNotifs = new Set();
var readNotifs = new Set();

// User/auth
var currentUser = null;
var hasSeenWelcome = false;

// Letters & content
var sentLetters = [
  {type:'letter', title:'Missing Your Laugh', body:'There are moments in every ordinary day when my first instinct is still to turn and tell you something small...', sig:'— Always yours, Robert 🌹', date:'Today, 9:41 AM', read:true},
  {type:'note',   title:'Counting Stars',     body:'Last night I counted three stars before the clouds came. Three felt like enough...', sig:'— Under the same sky, Robert ✨', date:'Yesterday', read:true},
  {type:'letter', title:'Saturday Morning',   body:'Saturday mornings used to feel like waiting for something that never quite arrived...', sig:'— Thinking of you always, Robert ☀️', date:'2 days ago', read:false},
];
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
var lastOpenDate  = null; // ISO date string 'YYYY-MM-DD'
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
var shopVoiceNote     = false; // Robert records voice note
var shopVoiceNoteData = null;  // {dataUrl, label}
var shopGoodNight     = false; // goodnight mode
var shopGoodNightTime = '22:00'; // HH:MM
var shopCoupleGoals   = false; // couple goals
var coupleGoalsList   = [];    // [{text, done}]
var shopMemoryTimeline= false; // memory timeline
var memoryTimelineItems=[];    // [{title, date, note}]
var shopDateNight     = false; // date night picker
var dateNightIdeas    = [];    // [string]
var shopDailyQuestion = false; // daily question
var dailyQuestionData = null;  // {question, answer, date}
var shopPlaylist      = false; // playlist builder
var playlistItems     = [];    // [{title, artist}]
var shopFlowerDelivery= false; // virtual flower delivery
var flowerDeliveries  = [];    // [{note, date, seen}]
var shopPhotoOfDay    = false; // photo of the day
var photoOfDayData    = null;  // {dataUrl, date}
var shopMilestones    = false; // relationship milestones badges
// Game & Fun
var shopLuckySpin     = false; // lucky spin daily
var shopLuckySpinLastUsed = null;
var shopPuzzleOfWeek  = false; // puzzle of the week
var puzzleOfWeekData  = null;  // {message, grid, solved}
var shopMiniChallenge = false; // mini challenge
var miniChallengeData = null;  // {challenge, done, date}

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
        activeTheme: activeTheme,
        themeUnlocks: themeUnlocks,
        hasSeenWelcome: hasSeenWelcome,
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
        shopVoiceNote: shopVoiceNote,
        shopVoiceNoteData: shopVoiceNoteData,
        shopGoodNight: shopGoodNight,
        shopGoodNightTime: shopGoodNightTime,
        shopCoupleGoals: shopCoupleGoals,
        coupleGoalsList: coupleGoalsList,
        shopMemoryTimeline: shopMemoryTimeline,
        memoryTimelineItems: memoryTimelineItems,
        shopDateNight: shopDateNight,
        dateNightIdeas: dateNightIdeas,
        shopDailyQuestion: shopDailyQuestion,
        dailyQuestionData: dailyQuestionData,
        shopPlaylist: shopPlaylist,
        playlistItems: playlistItems,
        shopFlowerDelivery: shopFlowerDelivery,
        flowerDeliveries: flowerDeliveries,
        shopPhotoOfDay: shopPhotoOfDay,
        photoOfDayData: photoOfDayData,
        shopMilestones: shopMilestones,
        shopLuckySpin: shopLuckySpin,
        shopLuckySpinLastUsed: shopLuckySpinLastUsed,
        shopPuzzleOfWeek: shopPuzzleOfWeek,
        puzzleOfWeekData: puzzleOfWeekData,
        shopMiniChallenge: shopMiniChallenge,
        miniChallengeData: miniChallengeData,
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
        favourites: favourites
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch(e){ console.warn('saveState failed:', e); }
  }, 300);
}

function loadState(){
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return;
    var s = JSON.parse(raw);
    if(s.ptsVal                    !== undefined) ptsVal                    = s.ptsVal;
    if(s.activeTheme               !== undefined) activeTheme               = s.activeTheme;
    if(s.hasSeenWelcome            !== undefined) hasSeenWelcome            = s.hasSeenWelcome;
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
    if(s.shopVoiceNote            !== undefined) shopVoiceNote            = s.shopVoiceNote;
    if(s.shopVoiceNoteData        !== undefined) shopVoiceNoteData        = s.shopVoiceNoteData;
    if(s.shopGoodNight            !== undefined) shopGoodNight            = s.shopGoodNight;
    if(s.shopGoodNightTime        !== undefined) shopGoodNightTime        = s.shopGoodNightTime;
    if(s.shopCoupleGoals          !== undefined) shopCoupleGoals          = s.shopCoupleGoals;
    if(s.coupleGoalsList          !== undefined) coupleGoalsList          = s.coupleGoalsList;
    if(s.shopMemoryTimeline       !== undefined) shopMemoryTimeline       = s.shopMemoryTimeline;
    if(s.memoryTimelineItems      !== undefined) memoryTimelineItems      = s.memoryTimelineItems;
    if(s.shopDateNight            !== undefined) shopDateNight            = s.shopDateNight;
    if(s.dateNightIdeas           !== undefined) dateNightIdeas           = s.dateNightIdeas;
    if(s.shopDailyQuestion        !== undefined) shopDailyQuestion        = s.shopDailyQuestion;
    if(s.dailyQuestionData        !== undefined) dailyQuestionData        = s.dailyQuestionData;
    if(s.shopPlaylist             !== undefined) shopPlaylist             = s.shopPlaylist;
    if(s.playlistItems            !== undefined) playlistItems            = s.playlistItems;
    if(s.shopFlowerDelivery       !== undefined) shopFlowerDelivery       = s.shopFlowerDelivery;
    if(s.flowerDeliveries         !== undefined) flowerDeliveries         = s.flowerDeliveries;
    if(s.shopPhotoOfDay           !== undefined) shopPhotoOfDay           = s.shopPhotoOfDay;
    if(s.photoOfDayData           !== undefined) photoOfDayData           = s.photoOfDayData;
    if(s.shopMilestones           !== undefined) shopMilestones           = s.shopMilestones;
    if(s.shopLuckySpin            !== undefined) shopLuckySpin            = s.shopLuckySpin;
    if(s.shopLuckySpinLastUsed    !== undefined) shopLuckySpinLastUsed    = s.shopLuckySpinLastUsed;
    if(s.shopPuzzleOfWeek         !== undefined) shopPuzzleOfWeek         = s.shopPuzzleOfWeek;
    if(s.puzzleOfWeekData         !== undefined) puzzleOfWeekData         = s.puzzleOfWeekData;
    if(s.shopMiniChallenge        !== undefined) shopMiniChallenge        = s.shopMiniChallenge;
    if(s.miniChallengeData        !== undefined) miniChallengeData        = s.miniChallengeData;
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
  } catch(e){ console.warn('loadState failed:', e); }
}

window.saveState = saveState;
window.loadState = loadState;

/* ═══════════════════════════════════════════
   DAILY STREAK ENGINE
   Called once per app open (after loadState).
   Compares today vs lastOpenDate to decide
   whether to increment, maintain, or reset.
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

function checkAndUpdateStreak(){
  var today     = getTodayISO();
  var yesterday = getYesterdayISO();

  if(!lastOpenDate){
    // First ever open — start streak at 1
    currentStreak = 1;
    bestStreak = Math.max(bestStreak, 1);
    lastOpenDate = today;
    saveState();
    refreshStreakUI();
    return;
  }

  if(lastOpenDate === today){
    // Already opened today — no change
    refreshStreakUI();
    return;
  }

  if(lastOpenDate === yesterday){
    // Consecutive day — increment streak
    currentStreak++;
    bestStreak = Math.max(bestStreak, currentStreak);
    lastOpenDate = today;
    saveState();
    refreshStreakUI();

    // Streak milestone toasts
    if(currentStreak === 3)  T('⚡ 3-day streak! You\'re on fire!');
    if(currentStreak === 7)  T('🔥 7-day streak! One full week!');
    if(currentStreak === 14) T('🔥 14-day streak! Two solid weeks!');
    if(currentStreak === 30) T('🔥 30-day streak! A whole month!');
    if(currentStreak === 60) T('🔥 60-day streak! Unstoppable!');
    if(currentStreak === 100) T('🏆 100-day streak! LEGENDARY!');

    // Check hot streak bonus
    if(typeof checkHotStreak === 'function') checkHotStreak();
    // Check streak achievements
    if(typeof checkStreakAchievements === 'function') checkStreakAchievements();
    return;
  }

  // Missed at least one day — check streak shield
  var dayBeforeYesterday = getDayBeforeYesterdayISO();
  if(lastOpenDate === dayBeforeYesterday && shopStreakShield){
    // Missed exactly 1 day — check if shield is available this week
    var shieldAvailable = true;
    if(streakShieldUsedDate){
      var shieldDate = new Date(streakShieldUsedDate);
      var now = new Date();
      var daysSinceShield = Math.floor((now - shieldDate) / 86400000);
      if(daysSinceShield < 7) shieldAvailable = false;
    }
    if(shieldAvailable){
      // Shield protects the streak!
      streakShieldUsedDate = today;
      currentStreak++; // still counts as consecutive
      bestStreak = Math.max(bestStreak, currentStreak);
      lastOpenDate = today;
      saveState();
      refreshStreakUI();
      T('🛡️ Streak Shield activated! Your ' + currentStreak + '-day streak is safe!');
      if(typeof showSuccess === 'function') showSuccess('🛡️', 'Streak Saved!', 'rgba(110,232,180,.15)');
      if(typeof checkHotStreak === 'function') checkHotStreak();
      if(typeof checkStreakAchievements === 'function') checkStreakAchievements();
      return;
    }
  }

  // Streak broken — reset to 1
  var lostStreak = currentStreak;
  currentStreak = 1;
  bestStreak = Math.max(bestStreak, lostStreak);
  lastOpenDate = today;
  saveState();
  refreshStreakUI();
  if(lostStreak > 1){
    T('💔 Streak reset — you missed a day. Starting fresh!');
  }
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

  // Home streak card onclick
  var streakCard = document.querySelector('.streak');
  if(streakCard){
    streakCard.setAttribute('onclick', 'T(\'🔥 ' + s + '-day streak! ' + (s >= b && s > 1 ? 'Personal best!' : 'Keep it going!') + '\');R(event,this)');
  }

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
