/* ═══════════════════════════════════════════
   ACHIEVEMENTS SYSTEM — 30 hardcoded, collapsible
═══════════════════════════════════════════ */

const ACH_DATA = [
  /* ── Love Letters (8) ── */
  {
    id:'first-letter', cat:'letters',
    earned:true,
    ico:'💌',
    name:'First Letter',
    desc:'Read your very first letter from Robert',
  },
  {
    id:'50-letters', cat:'letters',
    earned:true,
    ico:'✉️',
    name:'50 Letters',
    desc:'Read 50 letters from Robert',
  },
  {
    id:'100-letters', cat:'letters',
    earned:true,
    ico:'📬',
    name:'100 Letters',
    desc:'Read 100 letters — a true love story',
  },
  {
    id:'first-surprise', cat:'letters',
    earned:true,
    ico:'🎁',
    name:'Surprise!',
    desc:'Received your first surprise package',
  },
  {
    id:'night-owl', cat:'letters',
    earned:false,
    ico:'🌙',
    name:'Night Owl',
    desc:'Read a letter after midnight',
  },
  {
    id:'reply-sent', cat:'letters',
    earned:true,
    ico:'💬',
    name:'Replied',
    desc:'Sent your first message back to Robert',
  },
  {
    id:'500-letters', cat:'letters',
    earned:false,
    ico:'⭐',
    name:'500 Letters',
    desc:'A landmark of love — 500 letters read',
  },

  /* ── Streaks (6) ── */
  {
    id:'streak-3', cat:'streaks',
    earned:true,
    ico:'⚡',
    name:'3-Day Streak',
    desc:'Opened Heartly 3 days in a row',
  },
  {
    id:'streak-7', cat:'streaks',
    earned:true,
    ico:'🔥',
    name:'7-Day Streak',
    desc:'One full week without missing a day',
  },
  {
    id:'streak-14', cat:'streaks',
    earned:true,
    ico:'🔥',
    name:'14-Day Streak',
    desc:'Two solid weeks of dedication',
  },
  {
    id:'streak-30', cat:'streaks',
    earned:false,
    ico:'🔥',
    name:'30-Day Streak',
    desc:'A whole month of love and consistency',
  },
  {
    id:'streak-60', cat:'streaks',
    earned:false,
    ico:'🔥',
    name:'60-Day Streak',
    desc:'Two months — unwavering',
  },
  {
    id:'streak-100', cat:'streaks',
    earned:false,
    ico:'🏆',
    name:'100-Day Legend',
    desc:'100 consecutive days — legendary dedication',
  },

  /* ── Milestones (7) ── */
  {
    id:'1-month', cat:'milestones',
    earned:true,
    ico:'💕',
    name:'1 Month Together',
    desc:'One full month of Ana & Robert',
  },
  {
    id:'6-months', cat:'milestones',
    earned:true,
    ico:'💖',
    name:'Half a Year',
    desc:'6 beautiful months together',
  },
  {
    id:'1-year', cat:'milestones',
    earned:true,
    ico:'👑',
    name:'1 Year Together',
    desc:'A full year of love — passed on Aug 10, 2024',
  },
  {
    id:'500-days', cat:'milestones',
    earned:true,
    ico:'🗓️',
    name:'500 Days',
    desc:'500 days side by side',
  },
  {
    id:'2-years', cat:'milestones',
    earned:false,
    ico:'💞',
    name:'2 Years Together',
    desc:'Two full years of Ana & Robert',
  },
  {
    id:'first-birthday', cat:'milestones',
    earned:false,
    ico:'🎂',
    name:'Birthday Celebrated',
    desc:'Remembered each other on their birthday',
  },
  {
    id:'1000-days', cat:'milestones',
    earned:false,
    ico:'💎',
    name:'1,000 Days',
    desc:'One thousand days — a legend of love',
  },

  /* ── Games (5) ── */
  {
    id:'first-game', cat:'games',
    earned:true,
    ico:'🎮',
    name:'First Play',
    desc:'Played your first mini-game in Heartly',
  },
  {
    id:'block-blast-win', cat:'games',
    earned:true,
    ico:'🧩',
    name:'Block Master',
    desc:'Completed your first Block Blast level',
  },
  {
    id:'color-by-number', cat:'games',
    earned:true,
    ico:'🎨',
    name:'Color Artist',
    desc:'Finished a Color by Number puzzle',
  },
  {
    id:'high-score', cat:'games',
    earned:false,
    ico:'📈',
    name:'High Scorer',
    desc:'Reached 10,000 points in any game',
  },
  {
    id:'all-games', cat:'games',
    earned:false,
    ico:'🕹️',
    name:'Gamer',
    desc:'Played every game in Heartly',
  },

  /* ── Points & Shop (4) ── */
  {
    id:'first-purchase', cat:'shop',
    earned:true,
    ico:'🛍️',
    name:'First Purchase',
    desc:'Unlocked something in the shop',
  },
  {
    id:'1000-pts', cat:'shop',
    earned:true,
    ico:'🪙',
    name:'1,000 Points',
    desc:'Accumulated 1,000 total points',
  },
  {
    id:'5000-pts', cat:'shop',
    earned:true,
    ico:'💰',
    name:'5,000 Points',
    desc:'A dedicated collector of love points',
  },
  {
    id:'theme-unlock', cat:'shop',
    earned:false,
    ico:'🎨',
    name:'Theme Collector',
    desc:'Unlocked all 5 themes',
  },
];

const ACH_CATS = [
  { id:'letters',    label:'Love Letters',     ico:'💌', color:'var(--rose-b)' },
  { id:'streaks',    label:'Streaks',           ico:'🔥', color:'#ff8c42' },
  { id:'milestones', label:'Milestones',        ico:'💕', color:'var(--rose-b)' },
  { id:'games',      label:'Games',             ico:'🎮', color:'var(--mint)' },
  { id:'shop',       label:'Points & Shop',     ico:'🪙', color:'var(--gold)' },
];

// Track collapsed state per category (collapsed by default on app open)
var _achCollapsed = {
  letters: true,
  streaks: true,
  milestones: true,
  games: true,
  shop: true
};

function renderAchievements(){
  var container = document.getElementById('ach-categories');
  if(!container) return;

  var totalEarned = ACH_DATA.filter(function(a){ return a.earned; }).length;
  var total       = ACH_DATA.length;

  // Update totals
  var badge = document.getElementById('ach-total-badge');
  if(badge) badge.textContent = totalEarned + ' / ' + total;
  var fill = document.getElementById('ach-progress-fill');
  if(fill) fill.style.width = Math.round(totalEarned/total*100) + '%';

  container.innerHTML = ACH_CATS.map(function(cat){
    var items   = ACH_DATA.filter(function(a){ return a.cat === cat.id; });
    var earned  = items.filter(function(a){ return a.earned; }).length;
    var isOpen  = !_achCollapsed[cat.id];

    var itemsHtml = items.map(function(a, i){
      return '<div class="ach-item' + (a.earned ? '' : ' locked') + '" style="animation-delay:' + (i*.04) + 's" onclick="achTap(\''+a.id+'\')">'+
        '<div class="ach-item-ico' + (a.earned ? '' : ' locked') + '">' + a.ico + '</div>'+
        '<div class="ach-item-body">'+
          '<div class="ach-item-name">' + a.name + '</div>'+
          '<div class="ach-item-desc">' + a.desc + '</div>'+
        '</div>'+
        (a.earned ? '<div class="ach-item-check"><svg viewBox="0 0 24 24" fill="none" stroke="var(--mint)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>' :
                    '<div class="ach-item-lock"><svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>')+
      '</div>';
    }).join('');

    return '<div class="ach-cat">'+
      '<div class="ach-cat-header" onclick="toggleAchCat(\''+cat.id+'\')">'+
        '<div class="ach-cat-ico" style="background:rgba(255,255,255,.07)">' + cat.ico + '</div>'+
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
    var earned5 = ACH_DATA.filter(function(a){ return a.earned; }).slice(0,6);
    profIcons.innerHTML = earned5.map(function(a){
      return '<div class="prof-ach-ico">' + a.ico + '</div>';
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
  if(a.earned){
    T('Earned: ' + a.name + ' — ' + a.desc);
  } else {
    T('Locked: ' + a.desc);
  }
}
window.achTap = achTap;

// Render on page load + when logs tab is opened
(function(){
  var _origGo = window.go;
  window.go = function(s){
    _origGo(s);
    if(s === 'logs') setTimeout(renderAchievements, 80);
  };
  // Also render once on DOMContentLoaded in case logs is the first screen
  document.addEventListener('DOMContentLoaded', function(){
    renderAchievements();
  });
})();
