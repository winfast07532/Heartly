/* ═══════════════════════════════════════════════════
   HEARTLY ICONS — replaces interface emoji with inline SVG icons.

   How it works:
   1. ICON_SVG holds hand-drawn minimal line-icon paths (24x24, stroke-based).
   2. EMOJI_ICON_MAP maps each emoji character used in the app to an icon name.
   3. icon(name) returns the SVG markup for a name.
   4. iconify(str) swaps every mapped emoji in a string for its icon markup —
      used anywhere text is built as HTML (toasts, innerHTML template strings).
   5. A DOM pass + MutationObserver automatically converts emoji that show up
      as plain text anywhere in the page, live, without touching every
      individual render function.

   EXCLUSION: anything inside an element marked [data-no-iconify] is left
   completely alone — used to protect the actual authored letter/note
   content (title, body, signature) from being touched. Interface chrome
   only, never Robert's writing.
═══════════════════════════════════════════════════ */

const ICON_SVG = {
  heart:        '<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 000-7.8z"/>',
  'heart-o':     '<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 000-7.8z"/>',
  'heart-broken':'<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 000-7.8z"/><path d="M13 6l-2 5 2.5 2L11 17"/>',
  'heart-pair':  '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M4 20c0-3 2-5 4-5s4 2 4 5M12 20c0-3 2-5 4-5s4 2 4 5"/>',
  flame:        '<path d="M12 2c1 3-2 4-2 7a4 4 0 108 0c1.5 1.5 2 3.5 2 5.5A6.5 6.5 0 0113 21a6.5 6.5 0 01-6.5-6.5C6.5 10 8 6 12 2z"/>',
  zap:          '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
  trophy:       '<path d="M8 4h8v4a4 4 0 01-8 0V4z"/><path d="M8 5H5a2 2 0 002 4M16 5h3a2 2 0 01-2 4"/><path d="M10 13v2a2 2 0 004 0v-2M9 21h6M12 17v4"/>',
  gift:         '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M4 13h16M12 9v11M12 9C10 6 7 5 6 6.5S7 9 12 9zM12 9c2-3 5-4 6-2.5S17 9 12 9z"/>',
  coin:         '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5c0-1.2 1.1-2 2.5-2s2.5.8 2.5 2-1.1 1.7-2.5 2-2.5.8-2.5 2 1.1 2 2.5 2 2.5-.8 2.5-2"/>',
  lock:         '<rect x="4" y="11" width="16" height="9" rx="1.5"/><path d="M8 11V7a4 4 0 018 0v4"/>',
  unlock:       '<rect x="4" y="11" width="16" height="9" rx="1.5"/><path d="M8 11V7a4 4 0 017.6-1.8"/>',
  edit:         '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',
  trash:        '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  settings:     '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.9 2.9l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6V21a2 2 0 01-4 0v-.2a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.9-2.9l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.2a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.9-2.9l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.6V3a2 2 0 014 0v.2a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.9 2.9l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.6 1H21a2 2 0 010 4h-.2a1.7 1.7 0 00-1.6 1z"/>',
  mail:         '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 6.5l9 6.5 9-6.5"/>',
  'mail-heart': '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 6.5l9 6.5 9-6.5"/><path d="M12 9.5c-.6-.6-1.6-.6-2.1 0-.6.6-.6 1.5 0 2.1l2.1 2 2.1-2c.6-.6.6-1.5 0-2.1-.5-.6-1.5-.6-2.1 0z" fill="currentColor" stroke="none"/>',
  music:        '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  camera:       '<path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  image:        '<rect x="3" y="4" width="18" height="16" rx="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-5-9 9"/>',
  palette:      '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="10" r="1" fill="currentColor" stroke="none"/><path d="M12 21a2 2 0 01-2-2c0-1 1-1.5 1-2.5S10 15 9 15H8a5 5 0 010-10"/>',
  puzzle:       '<path d="M9 4h4v2a1.5 1.5 0 003 0V4h4v4h-2a1.5 1.5 0 000 3h2v4h-4v-2a1.5 1.5 0 00-3 0v2H9v-4H7a1.5 1.5 0 010-3h2z"/>',
  sparkles:     '<path d="M12 3l1.2 4.6L18 9l-4.8 1.4L12 15l-1.2-4.6L6 9l4.8-1.4z"/><path d="M19 15l.6 2.3L22 18l-2.4.7L19 21l-.6-2.3L16 18l2.4-.7z"/>',
  dice:         '<rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="8.5" cy="15.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" stroke="none"/>',
  shield:       '<path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6z"/>',
  flower:       '<circle cx="12" cy="12" r="2.5"/><path d="M12 9.5a2.5 3.5 0 110-5 2.5 3.5 0 010 5zM12 19.5a2.5 3.5 0 100-5 2.5 3.5 0 000 5zM9.5 12a3.5 2.5 0 11-5 0 3.5 2.5 0 015 0zM19.5 12a3.5 2.5 0 10-5 0 3.5 2.5 0 005 0z"/>',
  check:        '<path d="M4 12l6 6L20 6"/>',
  x:            '<path d="M6 6l12 12M18 6L6 18"/>',
  'alert-triangle':'<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5v.1"/>',
  calendar:     '<rect x="3" y="5" width="18" height="16" rx="1.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  clock:        '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  moon:         '<path d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 0010.5 10.5z"/>',
  sun:          '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  'bar-chart':  '<path d="M4 20V10M12 20V4M20 20v-7"/>',
  'trending-up':'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  'message-circle':'<path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>',
  'message-dots':'<path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/><circle cx="8" cy="12" r=".6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r=".6" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r=".6" fill="currentColor" stroke="none"/>',
  user:         '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  users:        '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><path d="M16 5a3.5 3.5 0 010 7M22 20c0-3-2-5.3-4.5-5.9"/>',
  gamepad:      '<rect x="2" y="8" width="20" height="10" rx="4"/><path d="M7 11v4M5 13h4M15.5 12h.01M18.5 14h.01"/>',
  bell:         '<path d="M18 8a6 6 0 00-12 0c0 5-2 6-2 6h16s-2-1-2-6"/><path d="M10 20a2 2 0 004 0"/>',
  'bell-off':   '<path d="M8 8a6 6 0 016-2M18 8a6 6 0 011.5 6.5M20 20l-16-16"/><path d="M18 14s2 1 2 0H4s2-1 2-6c0-.4 0-.8.1-1.2M10 20a2 2 0 004 0"/>',
  gem:          '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l3 6-3 12M15 3l-3 6 3 12"/>',
  star:         '<path d="M12 2l3.1 6.3 7 1-5 4.9 1.2 6.9-6.3-3.3-6.2 3.3 1.2-7-5-4.8 6.9-1z"/>',
  target:       '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  rocket:       '<path d="M12 2c3 1 5.5 4 5.5 8.5C17.5 15 12 20 12 20s-5.5-5-5.5-9.5C6.5 6 9 3 12 2z"/><circle cx="12" cy="10" r="1.6"/><path d="M8 17l-2.5 3M16 17l2.5 3"/>',
  home:         '<path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z"/>',
  pin:          '<path d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.3"/>',
  save:         '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h8V4M8 21v-6h8v6"/>',
  jar:          '<path d="M8 3h8v3H8z"/><path d="M6 6h12l1 14a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 015 20z"/>',
  eye:          '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  pencil:       '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',
  cake:         '<path d="M5 21h14v-6a3 3 0 00-3-3H8a3 3 0 00-3 3z"/><path d="M9 12V8M12 12V8M15 12V8M9 5.5a1 1 0 112 0M12 5.5a1 1 0 112 0M15 5.5a1 1 0 112 0"/>',
  book:         '<path d="M4 5.5A2.5 2.5 0 016.5 3H20v16H6.5A2.5 2.5 0 004 21.5z"/><path d="M20 3v16"/>',
  'arrow-right':'<path d="M4 12h16M14 6l6 6-6 6"/>',
  'arrow-up':   '<path d="M12 20V4M6 10l6-6 6 6"/>',
  'arrow-down': '<path d="M12 4v16M6 14l6 6 6-6"/>',
  undo:         '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-2"/>',
  globe:        '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z"/>',
  crown:        '<path d="M4 18h16l1-9-5 3-4-6-4 6-5-3z"/>',
  cash:         '<rect x="2" y="6" width="20" height="12" rx="1.5"/><circle cx="12" cy="12" r="3"/>',
  folder:       '<path d="M3 6.5A1.5 1.5 0 014.5 5H9l2 2h8.5A1.5 1.5 0 0121 8.5v10A1.5 1.5 0 0119.5 20h-15A1.5 1.5 0 013 18.5z"/>',
  brush:        '<path d="M9.5 14.5c-2 2-2.5 4-4.5 4.5 0-2 0-4.5 2-6.5l7-7 2.5 2.5z"/><path d="M15 5l4 4"/>',
  spark:        '<path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z"/>',
  wand:         '<path d="M4 20L18 6M15 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>',
  cutlery:      '<path d="M7 3v7a2 2 0 002 2v9M9 3v6M7 3v6M11 3v18M15 3c-1.5 0-2 2-2 4s.5 4 2 4V21"/>',
  plane:        '<path d="M2 12l8-3 6-7 2 1-4 7 5 1 3-3 1 1-3 4-9 1-4 3-2-1 2-3z"/>',
  waves:        '<path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
  ring:         '<circle cx="12" cy="15" r="5"/><path d="M9.5 10L12 3l2.5 7"/>',
  bulb:         '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-3 11.2c.5.4.9 1 1 1.8h4c.1-.8.5-1.4 1-1.8A6 6 0 0012 3z"/>',
  shuffle:      '<path d="M2 6h4l10 12h4M16 6h4v4M2 18h4l4-5M16 18h4v-4"/>',
  'thumbs-up':  '<path d="M7 11v9H4v-9zM7 11l3-7a2 2 0 012 2v4h5.5a1.5 1.5 0 011.4 2l-2 6a1.5 1.5 0 01-1.4 1H7"/>',
  hourglass:    '<path d="M6 2h12M6 22h12M7 2c0 5 4 6.5 5 8 1-1.5 5-3 5-8M7 22c0-5 4-6.5 5-8 1 1.5 5 3 5 8"/>',
  'map-pin':    '<path d="M12 21s7-6.5 7-11.5A7 7 0 105 9.5C5 14.5 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.3"/>',
  cart:         '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2l2.6 12.4a2 2 0 002 1.6h8a2 2 0 002-1.9L21 7H6"/>',
  wrench:       '<path d="M14.7 6.3a4 4 0 10-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.8 2.8-2-2z"/>',
  refresh:      '<path d="M3 12a9 9 0 0115.4-6.4L21 8M21 3v5h-5"/><path d="M21 12a9 9 0 01-15.4 6.4L3 16M3 21v-5h5"/>',
  'arrow-left': '<path d="M20 12H4M10 18l-6-6 6-6"/>',
  'id-badge':   '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 17c0-1.7 1.3-3 3-3s3 1.3 3 3M14 9h4M14 13h4"/>',
  new:          '<path d="M12 2l1.2 4.6L18 8l-4.8 1.4L12 14l-1.2-4.6L6 8l4.8-1.4z"/><circle cx="18" cy="17" r="4"/>',
  play:         '<path d="M6 4l14 8-14 8z" fill="currentColor" stroke="none"/>',
  'chevron-down':'<path d="M6 9l6 6 6-6"/>',
  'chevron-up': '<path d="M6 15l6-6 6 6"/>',
  dot:          '<circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/>',
};

// Emoji character -> icon name. Anything not in here falls back to 'spark'
// so the interface never shows a bare, un-converted emoji.
const EMOJI_ICON_MAP = {
  '💕':'heart','💖':'heart','💗':'heart','💓':'heart','💘':'heart','💞':'heart','❤':'heart','❤️':'heart',
  '💛':'heart','💙':'heart','♥':'heart','♡':'heart-o','💔':'heart-broken','💑':'heart-pair','🥰':'heart',
  '🔥':'flame','⚡':'zap','🏆':'trophy','🎁':'gift','🪙':'coin','💰':'coin','💎':'gem',
  '🔒':'lock','🔐':'lock','🔓':'unlock','📝':'edit','✍':'pencil','✏':'pencil','🗑':'trash',
  '⚙':'settings','🛠':'settings','💌':'mail-heart','✉':'mail','📬':'mail',
  '🎵':'music','🎤':'music','📸':'camera','📷':'camera','🖼':'image','🎨':'palette','🖌':'brush',
  '🧩':'puzzle','🎪':'sparkles','✨':'sparkles','🎰':'dice','🎲':'dice','🛡':'shield',
  '🌹':'flower','🌸':'flower','💐':'flower','🌟':'star','⭐':'star',
  '✅':'check','✓':'check','❌':'x','✕':'x','⚠':'alert-triangle',
  '📅':'calendar','🗓':'calendar','📍':'pin','📌':'pin','🕐':'clock','⏰':'clock',
  '🌙':'moon','☀':'sun','📊':'bar-chart','📈':'trending-up','💬':'message-circle','💭':'message-dots',
  '👁':'eye','🙈':'eye','👤':'user','👩':'user','👥':'users','🎮':'gamepad','🕹':'gamepad',
  '🎯':'target','🚀':'rocket','🏠':'home','💾':'save','🫙':'jar','🎂':'cake','📖':'book',
  '→':'arrow-right','↑':'arrow-up','↓':'arrow-down','↔':'arrow-right','↩':'undo',
  '🌍':'globe','👑':'crown','📂':'folder','🪄':'wand','💥':'spark','🍽':'cutlery',
  '🏖':'waves','🌊':'waves','✈':'plane','💍':'ring','💡':'bulb','🛍':'gift','📋':'book',
  '😊':'heart','😄':'heart','😂':'heart','😭':'heart-broken','🐶':'heart','🍒':'cake','🍋':'cake','🍬':'cake',
  '🪣':'jar','🎉':'sparkles',
  '🛒':'cart','🔧':'wrench','🔔':'bell','🔕':'bell-off','↻':'refresh','←':'arrow-left',
  '🆔':'id-badge','🆕':'new','⏳':'hourglass','⏱':'clock',
  '▶':'play','▸':'play','▾':'chevron-down','▴':'chevron-up','▼':'chevron-down','▲':'chevron-up','●':'dot','•':'dot',
};

const _emojiChars = Object.keys(EMOJI_ICON_MAP).sort((a,b)=>b.length-a.length).map(e=>e.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
const EMOJI_TEST_REGEX = new RegExp('(' + _emojiChars.join('|') + ')', 'g');

function icon(name, size){
  size = size || 16;
  const path = ICON_SVG[name] || ICON_SVG.spark || ICON_SVG.sparkles;
  return '<svg class="ic" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-3px;flex-shrink:0">'+path+'</svg>';
}
window.icon = icon;

// Swap every mapped emoji in a plain/HTML string for its icon markup.
// Safe to call on strings with no emoji at all (returns them unchanged).
function iconify(str){
  if(!str || typeof str !== 'string') return str;
  if(!EMOJI_TEST_REGEX.test(str)){ EMOJI_TEST_REGEX.lastIndex = 0; return str; }
  EMOJI_TEST_REGEX.lastIndex = 0;
  return str.replace(EMOJI_TEST_REGEX, function(m){
    const name = EMOJI_ICON_MAP[m];
    return name ? icon(name) : icon('sparkles');
  });
}
window.iconify = iconify;

/* ── Live DOM conversion ──
   Converts emoji that appear as plain text anywhere in the page into
   icon elements, automatically, without needing every render function
   to call iconify() itself. Skips anything under [data-no-iconify]
   (Robert's actual letter/note content). */
function _isProtected(node){
  let el = node.nodeType === 1 ? node : node.parentElement;
  while(el){
    if(el.nodeType === 1 && (el.closest && el.closest('[data-no-iconify]'))) return true;
    if(el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.tagName === 'OPTION' || el.tagName === 'SELECT') return true;
    el = el.parentElement;
  }
  return false;
}

function _iconifyTextNode(textNode){
  const data = textNode.nodeValue;
  if(!data || !EMOJI_TEST_REGEX.test(data)){ EMOJI_TEST_REGEX.lastIndex = 0; return; }
  EMOJI_TEST_REGEX.lastIndex = 0;
  if(_isProtected(textNode)) return;

  const frag = document.createDocumentFragment();
  let lastIdx = 0;
  let match;
  EMOJI_TEST_REGEX.lastIndex = 0;
  while((match = EMOJI_TEST_REGEX.exec(data))){
    if(match.index > lastIdx) frag.appendChild(document.createTextNode(data.slice(lastIdx, match.index)));
    const name = EMOJI_ICON_MAP[match[0]] || 'sparkles';
    const span = document.createElement('span');
    span.innerHTML = icon(name);
    frag.appendChild(span.firstChild);
    lastIdx = match.index + match[0].length;
  }
  if(lastIdx < data.length) frag.appendChild(document.createTextNode(data.slice(lastIdx)));
  if(textNode.parentNode) textNode.parentNode.replaceChild(frag, textNode);
}

function iconifyDOM(root){
  root = root || document.body;
  if(_isProtected(root)) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: function(n){
      return _isProtected(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  let n;
  while((n = walker.nextNode())) nodes.push(n);
  nodes.forEach(_iconifyTextNode);
}
window.iconifyDOM = iconifyDOM;

(function initIconify(){
  function start(){
    iconifyDOM(document.body);
    const observer = new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        if(m.type === 'characterData'){
          _iconifyTextNode(m.target);
        } else if(m.type === 'childList'){
          m.addedNodes.forEach(function(node){
            if(node.nodeType === 3) _iconifyTextNode(node);
            else if(node.nodeType === 1) iconifyDOM(node);
          });
        }
      });
    });
    observer.observe(document.body, { childList:true, subtree:true, characterData:true });
    window._heartlyIconObserver = observer;
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
