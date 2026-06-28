/* ═══════════════════════════════════════════
   INTRO SCREEN
   Runs on every app open. z-index 500 covers
   everything beneath it. Fades out after ~2.9s
   and removes itself from view.
═══════════════════════════════════════════ */

(function(){

  const INTRO_DURATION = 2900; // ms — bar delay 1.2s + fill 1.6s + buffer

  var intro = document.getElementById('INTRO');
  if(!intro) return;

  // After bar finishes → fade out → hide
  setTimeout(function(){
    intro.classList.add('intro-done');
    setTimeout(function(){
      intro.classList.add('intro-hidden');
    }, 500);
  }, INTRO_DURATION);

})();
