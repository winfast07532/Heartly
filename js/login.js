/* ═══════════════════════════
   LOGIN
═══════════════════════════ */
currentUser = null; // already declared above

hasSeenWelcome = false; // already declared above

function doLogin(username){
  currentUser = username;
  const lg = document.getElementById('LOGIN');
  lg.classList.add('gone');
  setTimeout(()=>{ lg.style.display='none'; }, 520);

  if(username === 'developer.login'){
    setTimeout(()=>{ showRobertView(); }, 540);
  } else {
    // Load state now so hasSeenWelcome is accurate
    if(typeof loadState === 'function') loadState();

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
  window.doLogin = function(username){
    _orig(username);
    setTimeout(function(){
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
    }, 900);
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

