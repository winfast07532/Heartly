/* ═══════════════════════════════════════════
   SETTINGS — real persistence & effects
   Wires up toggles that used to just flip a CSS
   class with no lasting effect, plus Backup &
   Restore and the About-section actions.
═══════════════════════════════════════════ */

/* ── Show relationship timer ── */
function relTimerVisible(){
  return localStorage.getItem('heartly.relTimerVisible') !== '0'; // default on
}
function applyRelTimerVisibility(){
  const on = relTimerVisible();
  document.querySelectorAll('.prof-timer, .together-hero').forEach(el => {
    el.style.display = on ? '' : 'none';
  });
}
function toggleRelTimer(el){
  el.classList.toggle('on');
  const on = el.classList.contains('on');
  localStorage.setItem('heartly.relTimerVisible', on ? '1' : '0');
  applyRelTimerVisibility();
}
window.toggleRelTimer = toggleRelTimer;

/* ── Relationship timer format (Days:Hours:Mins:Secs  <->  Years, Months, Days) ── */
const REL_TIMER_FORMATS = ['dhms', 'ymd'];
const REL_TIMER_FORMAT_LABELS = { dhms: 'Days : Hours : Mins : Secs', ymd: 'Years, Months, Days' };
function relTimerFormat(){
  const f = localStorage.getItem('heartly.relTimerFormat');
  return REL_TIMER_FORMATS.includes(f) ? f : 'dhms';
}
window.relTimerFormat = relTimerFormat;
function applyRelTimerFormatLabel(){
  const el = document.getElementById('sett-rel-timer-fmt');
  if(el) el.textContent = REL_TIMER_FORMAT_LABELS[relTimerFormat()];
}
function cycleRelTimerFormat(){
  const idx = REL_TIMER_FORMATS.indexOf(relTimerFormat());
  const next = REL_TIMER_FORMATS[(idx + 1) % REL_TIMER_FORMATS.length];
  localStorage.setItem('heartly.relTimerFormat', next);
  applyRelTimerFormatLabel();
  // Repaint both live timers immediately instead of waiting for their next tick
  if(typeof window._refreshTogetherTimer === 'function') window._refreshTogetherTimer();
  if(typeof window._refreshProfTimer === 'function') window._refreshProfTimer();
}
window.cycleRelTimerFormat = cycleRelTimerFormat;

/* ── Confetti on milestones ── */
function confettiEnabled(){
  return localStorage.getItem('heartly.confettiEnabled') !== '0'; // default on
}
window.confettiEnabled = confettiEnabled;

function toggleConfettiPref(el){
  el.classList.toggle('on');
  localStorage.setItem('heartly.confettiEnabled', el.classList.contains('on') ? '1' : '0');
}
window.toggleConfettiPref = toggleConfettiPref;

function fireConfetti(){
  if(!confettiEnabled()) return;
  const colors = ['#e05578', '#f07090', '#f5c870', '#6ee8b4', '#fff'];
  const host = document.body;
  for(let i = 0; i < 28; i++){
    const p = document.createElement('div');
    const size = 6 + Math.random() * 6;
    p.style.cssText = `position:fixed;top:-20px;left:${Math.random()*100}vw;` +
      `width:${size}px;height:${size*1.3}px;background:${colors[i % colors.length]};` +
      `z-index:9999;border-radius:2px;pointer-events:none;` +
      `opacity:.95;transform:rotate(${Math.random()*360}deg);` +
      `transition:transform 1.6s ease-in, top 1.6s cubic-bezier(.2,.6,.4,1), opacity 1.6s ease-in;`;
    host.appendChild(p);
    requestAnimationFrame(() => {
      p.style.top = (70 + Math.random()*25) + 'vh';
      p.style.transform = `translateX(${(Math.random()-.5)*160}px) rotate(${Math.random()*720}deg)`;
      p.style.opacity = '0';
    });
    setTimeout(() => p.remove(), 1700);
  }
}
window.fireConfetti = fireConfetti;

/* ── Hide letter previews ── */
function hidePreviewsEnabled(){
  return localStorage.getItem('heartly.hideLetterPreviews') === '1';
}
window.hidePreviewsEnabled = hidePreviewsEnabled;

function toggleHidePreviews(el){
  el.classList.toggle('on');
  localStorage.setItem('heartly.hideLetterPreviews', el.classList.contains('on') ? '1' : '0');
}
window.toggleHidePreviews = toggleHidePreviews;

/* ── Screenshot protection (blur app when backgrounded) ──
   True screenshot blocking isn't possible from a web app — this
   is the standard web approximation: blur sensitive content
   whenever the app loses focus or is hidden. */
function screenshotProtectionEnabled(){
  return localStorage.getItem('heartly.screenshotProtection') !== '0'; // default on
}
function applyBackgroundBlur(shouldBlur){
  const root = document.getElementById('P') || document.body;
  root.classList.toggle('privacy-blur', shouldBlur && screenshotProtectionEnabled());
}
function toggleScreenshotProtection(el){
  el.classList.toggle('on');
  localStorage.setItem('heartly.screenshotProtection', el.classList.contains('on') ? '1' : '0');
}
window.toggleScreenshotProtection = toggleScreenshotProtection;

document.addEventListener('visibilitychange', () => {
  applyBackgroundBlur(document.hidden);
});
window.addEventListener('blur', () => applyBackgroundBlur(true));
window.addEventListener('focus', () => applyBackgroundBlur(false));

/* ── Backup & Restore ── */
function exportBackup(){
  const data = {};
  for(let i = 0; i < localStorage.length; i++){
    const key = localStorage.key(i);
    if(key && (key.startsWith('heartly') || key === STORAGE_KEY)){
      data[key] = localStorage.getItem(key);
    }
  }
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `heartly-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  T('📦 Backup downloaded');
}
window.exportBackup = exportBackup;

async function importBackup(input){
  const file = input.files && input.files[0];
  if(!file) return;
  const ok = await appModal({
    icon: '📦',
    title: 'Restore this backup?',
    subtitle: 'This will overwrite your current letters, points, and settings.',
    confirmLabel: 'Restore',
    danger: true
  });
  if(!ok){
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const parsed = JSON.parse(reader.result);
      const data = parsed.data || parsed; // tolerate a raw key/value dump too
      Object.keys(data).forEach(key => localStorage.setItem(key, data[key]));
      T('✅ Backup restored — reloading...');
      setTimeout(() => location.reload(), 1000);
    }catch(e){
      T('❌ That file doesn\'t look like a valid Heartly backup');
    }
    input.value = '';
  };
  reader.onerror = () => { T('❌ Couldn\'t read that file'); input.value = ''; };
  reader.readAsText(file);
}
window.importBackup = importBackup;

/* ── About: What's new & Send feedback ── */
function openWhatsNew(){
  closeSettings();
  go('logs');
  setTimeout(() => {
    const el = document.getElementById('updates-log-section');
    if(el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 250);
}
window.openWhatsNew = openWhatsNew;

function sendFeedback(){
  const subject = encodeURIComponent('Heartly feedback');
  const body = encodeURIComponent('Hi Robert,\n\nHere\'s my feedback on Heartly:\n\n');
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
  T('💌 Opening your mail app...');
}
window.sendFeedback = sendFeedback;

/* ── Apply everything persisted on load ── */
document.addEventListener('DOMContentLoaded', () => {
  const on = (id) => document.getElementById(id);

  const reduceMotionOn = localStorage.getItem('heartly.reduceMotion') === '1';
  if(on('tog-reduce-motion')) on('tog-reduce-motion').classList.toggle('on', reduceMotionOn);
  document.documentElement.classList.toggle('reduce-motion', reduceMotionOn);
  document.documentElement.style.setProperty('--anim-dur', reduceMotionOn ? '0s' : '');

  if(on('tog-timer')) on('tog-timer').classList.toggle('on', relTimerVisible());
  applyRelTimerVisibility();
  applyRelTimerFormatLabel();

  if(on('tog-confetti')) on('tog-confetti').classList.toggle('on', confettiEnabled());
  if(on('tog-hideprev')) on('tog-hideprev').classList.toggle('on', hidePreviewsEnabled());
  if(on('tog-screenshot')) on('tog-screenshot').classList.toggle('on', screenshotProtectionEnabled());
});
