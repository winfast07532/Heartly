/* ═══════════════════════════
   LOGIN
═══════════════════════════ */
currentUser = null; // already declared above

hasSeenWelcome = false; // already declared above

async function doLogin(username){
  currentUser = username;
  const lg = document.getElementById('LOGIN');
  lg.classList.add('gone');
  setTimeout(()=>{ lg.style.display='none'; }, 520);

  // Load state now so hasSeenWelcome is accurate
  if(typeof loadState === 'function') loadState();
  // Pull remote state before running any streak updates or checks
  if(typeof initSync === 'function') await initSync();

  if(username === 'developer.login'){
    setTimeout(()=>{ showRobertView(); }, 540);
  } else {
    // Every login adds +1 to the streak
    if(typeof checkAndUpdateStreak === 'function') checkAndUpdateStreak();

    if(!hasSeenWelcome){
      // First ever open — show welcome then splash
      hasSeenWelcome = true;
      if(typeof saveState === 'function') saveState();
      const splash = document.getElementById('splash');
      if(splash) splash.style.display = 'none';
      setTimeout(()=>{
        const wlc = document.getElementById('WELCOME');
        if(wlc) wlc.classList.add('show');
      }, 540);
    } else {
      // Return visit — skip welcome and splash entirely, go straight to app
      const splash = document.getElementById('splash');
      if(splash) splash.style.display = 'none';
      const wlc = document.getElementById('WELCOME');
      if(wlc){ wlc.style.display = 'none'; }
    }
  }
}
window.doLogin = doLogin;

// Wire shop unlocks and anniversary check after login
(function(){
  const _orig = window.doLogin;
  window.doLogin = async function(username){
    await _orig(username);
    // State already loaded inside doLogin — just apply everything
    if(typeof applyTheme === 'function' && activeTheme) applyTheme(activeTheme);
    // Sync pts display
    const el = document.getElementById('pts-display');
    if(el) el.textContent = Math.floor(ptsVal).toLocaleString();
    if(typeof applyShopUnlocks === 'function') applyShopUnlocks();
    if(typeof checkAnniversaryCard === 'function') checkAnniversaryCard();
    // Show/hide memory jar elements based on unlock state
    const jar    = document.getElementById('memory-jar-home');
    const robJar = document.getElementById('rob-memory-jar-card');
    if(jar)    jar.style.display    = shopMemoryJar ? 'block' : 'none';
    if(robJar) robJar.style.display = shopMemoryJar ? 'block' : 'none';
    
    // Re-render UI components immediately with the newly synced state
    if(typeof triggerAllUIRenders === 'function') triggerAllUIRenders();

    // Achievements: only check now, since real state (local + remote
    // sync) has actually been loaded at this point. Checking any
    // earlier would evaluate against blank defaults — see the note in
    // js/achievements.js for why that's unsafe.
    // Seed the 15 real surprise-catalog entries (once) — same safe
    // timing as achievements: only after real state has loaded.
    if(typeof seedSurpriseCatalog === 'function') seedSurpriseCatalog();

    if(typeof checkAchievements === 'function') checkAchievements();
    if(typeof renderAchievements === 'function') renderAchievements();
  };
})();

function closeWelcome(){
  const wlc = document.getElementById('WELCOME');
  wlc.classList.add('gone');
  setTimeout(()=>{
    wlc.classList.remove('show');
    wlc.classList.remove('gone');
    // Now show the splash onboarding
    const splash = document.getElementById('splash');
    if(splash){
      splash.style.display = 'flex';
      splash.classList.remove('gone');
    }
  }, 520);
}
window.closeWelcome = closeWelcome;

