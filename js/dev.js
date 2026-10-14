/* ═══════════════════════════
   DEV PANEL — Letter Library
   (notes / surprises / letters editor + pixel-art importer)
═══════════════════════════ */
devCurrentTab = 'notes'; // already declared above
devEditIndex = null; // already declared above

function devTab(k){
  devCurrentTab=k;
  // Scope the active-state toggle to the Letter Library tab group only —
  // sibling tab groups (main Dev tabs, Wishlist tabs) share the same
  // .dv-tab-btn class and must not be affected.
  document.querySelectorAll('.dv-tabs[data-dev-subtab] .dv-tab-btn').forEach(t=>t.classList.toggle('on', t.dataset.dk===k));
  const addBtn = document.getElementById('dev-add-new-btn');
  if(addBtn) addBtn.textContent = k==='templates' ? '＋ Add New Template' : '＋ Add New Letter';
  _robDevListDirty = true;
  if(typeof renderDevListRob === 'function') renderDevListRob();
}
window.devTab=devTab;

function openDevEditor(index){
  if(devCurrentTab === 'templates') return openTemplateEditor(index);

  devEditIndex=index;
  const ed=document.getElementById('dev-editor');
  ed.classList.add('on');

  // Restore the rows the Templates editor hides — this modal is shared
  // between both editors, so undo any leftover display:none from a
  // previous template edit before showing the real letter fields.
  document.getElementById('dev-f-icon-row').style.display = 'block';
  document.getElementById('dev-f-locked-row').style.display = 'flex';
  document.getElementById('dev-f-tag-row').style.display = 'block';
  document.getElementById('dev-f-secret-row').style.display = 'flex';
  document.getElementById('dev-f-label').placeholder = 'e.g. Love Letter #2';

  // Template row/button only apply to real letters — show it here
  const tplRow = document.getElementById('dev-f-template-row');
  if(tplRow) tplRow.style.display = letterTemplates.length ? 'block' : 'none';
  const tplSaveBtn = document.getElementById('dev-save-as-template-btn');
  if(tplSaveBtn) tplSaveBtn.style.display = 'inline-block';
  populateTemplateSelect();

  const tagEl    = document.getElementById('dev-f-tag');
  const secretEl = document.getElementById('dev-f-secret');

  if(index===null){
    // New item
    document.getElementById('dev-editor-title').textContent='✏️ Add New Letter';
    document.getElementById('dev-f-label').value='';
    document.getElementById('dev-f-icon').value='letter';
    document.getElementById('dev-f-title').value='';
    document.getElementById('dev-f-body').value='';
    document.getElementById('dev-f-sig').value='— With love, always';
    document.getElementById('dev-f-locked').checked=false;
    document.getElementById('dev-f-price').value='';
    document.getElementById('dev-f-price-row').style.display='none';
    const previewEl=document.getElementById('dev-f-preview-once');
    if(previewEl) previewEl.checked=false;
    const previewRow=document.getElementById('dev-f-preview-row');
    if(previewRow) previewRow.style.display='none';
    if(tagEl) tagEl.value='';
    if(secretEl) secretEl.checked=false;
  } else {
    const it=ED[devCurrentTab][index];
    document.getElementById('dev-editor-title').textContent='✏️ Edit Letter';
    document.getElementById('dev-f-label').value=it.l.replace('\n',' ');
    document.getElementById('dev-f-icon').value=it.i||'letter';
    document.getElementById('dev-f-title').value=it.letter?it.letter.t:'';
    // Convert <br> back to newlines for editing
    document.getElementById('dev-f-body').value=it.letter?it.letter.b.replace(/<br><br>/g,'\n\n').replace(/<br>/g,'\n').replace(/<em>([^<]+)<\/em>/g,'$1'):'';
    document.getElementById('dev-f-sig').value=it.letter?it.letter.s:'';
    document.getElementById('dev-f-locked').checked=it.lk;
    document.getElementById('dev-f-price').value=it.price||'';
    document.getElementById('dev-f-price-row').style.display=it.lk?'block':'none';
    const previewEl=document.getElementById('dev-f-preview-once');
    if(previewEl) previewEl.checked=!!it.previewOnce;
    const previewRow=document.getElementById('dev-f-preview-row');
    if(previewRow) previewRow.style.display=it.lk?'flex':'none';
    if(tagEl) tagEl.value=it.tag||'';
    if(secretEl) secretEl.checked=!!it.secret;
  }
}
window.openDevEditor=openDevEditor;

function closeDevEditor(){
  document.getElementById('dev-editor').classList.remove('on');
  devEditIndex=null;
}
window.closeDevEditor=closeDevEditor;

/* ═══════════════════════════════════════════
   TEMPLATES
   Reusable title/body/sig blocks Robert can save
   once and drop back into any note/surprise/letter.
   Stored separately from ED — templates are never
   sent to Ana on their own, they're just a starting
   point for the real editor above.
═══════════════════════════════════════════ */
function populateTemplateSelect(){
  const sel = document.getElementById('dev-f-template-select');
  if(!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">— Select a template —</option>' +
    letterTemplates.map((tpl,i)=>`<option value="${i}">${(tpl.name||tpl.title||'Untitled').replace(/</g,'&lt;')}</option>`).join('');
  // Keep selection if it still exists after a re-render
  if(current && letterTemplates[current]) sel.value = current;
}
window.populateTemplateSelect=populateTemplateSelect;

// Fills the currently-open note/surprise/letter editor from the chosen
// template — every field a template carries: icon, title, body,
// signature, locked/price/preview, tag, and secret. Card Label is left
// alone since that's specific to the actual item being written.
function applyTemplateToEditor(){
  const sel = document.getElementById('dev-f-template-select');
  if(!sel || sel.value===''){ T('⚠️ Pick a template first'); return; }
  const tpl = letterTemplates[sel.value];
  if(!tpl) return;
  document.getElementById('dev-f-title').value = tpl.title || '';
  document.getElementById('dev-f-body').value  = tpl.body  || '';
  document.getElementById('dev-f-sig').value   = tpl.sig   || '';
  if(tpl.icon) document.getElementById('dev-f-icon').value = tpl.icon;
  document.getElementById('dev-f-locked').checked = !!tpl.locked;
  document.getElementById('dev-f-price-row').style.display = tpl.locked ? 'block' : 'none';
  document.getElementById('dev-f-preview-row').style.display = tpl.locked ? 'flex' : 'none';
  document.getElementById('dev-f-price').value = tpl.price || '';
  const previewEl = document.getElementById('dev-f-preview-once');
  if(previewEl) previewEl.checked = !!tpl.previewOnce;
  document.getElementById('dev-f-tag').value = tpl.tag || '';
  document.getElementById('dev-f-secret').checked = !!tpl.secret;
  T('📄 Template applied — tweak it, then Save');
}
window.applyTemplateToEditor=applyTemplateToEditor;

// Reads every field currently in the note/surprise/letter editor —
// same set a real letter has — and returns it as a plain object.
function _readTemplateFieldsFromEditor(){
  const locked = document.getElementById('dev-f-locked').checked;
  const previewEl = document.getElementById('dev-f-preview-once');
  return {
    icon: document.getElementById('dev-f-icon').value,
    title: document.getElementById('dev-f-title').value.trim(),
    body: document.getElementById('dev-f-body').value.trim(),
    sig: document.getElementById('dev-f-sig').value.trim(),
    locked: locked,
    price: locked ? (parseInt(document.getElementById('dev-f-price').value) || 0) : 0,
    previewOnce: locked ? (previewEl ? previewEl.checked : false) : false,
    tag: document.getElementById('dev-f-tag').value || '',
    secret: document.getElementById('dev-f-secret').checked
  };
}

// Saves whatever is currently set in the note/surprise/letter editor —
// icon, title, body, sig, locked/price/preview, tag, secret — as a
// brand-new reusable template.
function saveCurrentAsTemplate(){
  const fields = _readTemplateFieldsFromEditor();
  if(!fields.title && !fields.body){ T('⚠️ Write something first — title or body'); return; }
  const name = prompt('Name this template (e.g. "Good morning note"):', fields.title || 'New template');
  if(name===null) return; // cancelled
  letterTemplates.push(Object.assign({ name: name.trim() || 'Untitled template' }, fields));
  if(typeof saveState==='function') saveState();
  populateTemplateSelect();
  T('📄 Saved as template!');
}
window.saveCurrentAsTemplate=saveCurrentAsTemplate;

function openTemplateEditor(index){
  devEditIndex = index;
  const ed = document.getElementById('dev-editor');
  ed.classList.add('on');

  // Templates carry the full field set a real letter does — only the
  // "load a template into me" row doesn't make sense while editing a
  // template itself.
  const tplRow = document.getElementById('dev-f-template-row');
  if(tplRow) tplRow.style.display = 'none';
  const tplSaveBtn = document.getElementById('dev-save-as-template-btn');
  if(tplSaveBtn) tplSaveBtn.style.display = 'none';
  ['dev-f-icon-row','dev-f-locked-row','dev-f-tag-row','dev-f-secret-row'].forEach(id=>{
    const row = document.getElementById(id);
    if(row) row.style.display = id==='dev-f-locked-row' ? 'flex' : 'block';
  });

  const labelEl = document.getElementById('dev-f-label');
  labelEl.placeholder = 'e.g. Good morning note';

  const priceRow = document.getElementById('dev-f-price-row');
  const previewRow = document.getElementById('dev-f-preview-row');

  if(index===null){
    document.getElementById('dev-editor-title').textContent='📄 New Template';
    labelEl.value='';
    document.getElementById('dev-f-icon').value='letter';
    document.getElementById('dev-f-title').value='';
    document.getElementById('dev-f-body').value='';
    document.getElementById('dev-f-sig').value='';
    document.getElementById('dev-f-locked').checked=false;
    priceRow.style.display='none';
    previewRow.style.display='none';
    document.getElementById('dev-f-price').value='';
    document.getElementById('dev-f-preview-once').checked=false;
    document.getElementById('dev-f-tag').value='';
    document.getElementById('dev-f-secret').checked=false;
  } else {
    const tpl = letterTemplates[index];
    document.getElementById('dev-editor-title').textContent='📄 Edit Template';
    labelEl.value = tpl.name || '';
    document.getElementById('dev-f-icon').value = tpl.icon || 'letter';
    document.getElementById('dev-f-title').value = tpl.title || '';
    document.getElementById('dev-f-body').value  = tpl.body  || '';
    document.getElementById('dev-f-sig').value   = tpl.sig   || '';
    document.getElementById('dev-f-locked').checked = !!tpl.locked;
    priceRow.style.display = tpl.locked ? 'block' : 'none';
    previewRow.style.display = tpl.locked ? 'flex' : 'none';
    document.getElementById('dev-f-price').value = tpl.price || '';
    document.getElementById('dev-f-preview-once').checked = !!tpl.previewOnce;
    document.getElementById('dev-f-tag').value = tpl.tag || '';
    document.getElementById('dev-f-secret').checked = !!tpl.secret;
  }
}
window.openTemplateEditor=openTemplateEditor;

function saveTemplateItem(){
  const name = document.getElementById('dev-f-label').value.trim();
  if(!name){ T('⚠️ A name is required!'); return; }
  const tpl = Object.assign({ name }, _readTemplateFieldsFromEditor());
  if(devEditIndex===null){
    letterTemplates.push(tpl);
    T('✅ Template saved!');
  } else {
    letterTemplates[devEditIndex] = tpl;
    T('✅ Template updated!');
  }
  closeDevEditor();
  _robDevListDirty = true;
  renderDevListRob();
  if(typeof saveState==='function') saveState();
}
window.saveTemplateItem=saveTemplateItem;

async function deleteTemplate(index){
  const ok = await appModal({
    icon: '🗑️',
    title: 'Delete this template?',
    subtitle: 'This cannot be undone.',
    confirmLabel: 'Delete',
    danger: true
  });
  if(!ok) return;
  letterTemplates.splice(index,1);
  _robDevListDirty = true;
  T('🗑️ Template deleted');
  renderDevListRob();
  if(typeof saveState==='function') saveState();
}
window.deleteTemplate=deleteTemplate;

// Real "this letter just became available to Ana" side-effects, shared by
// every path that can flip a letter from unavailable → readable: creating
// a brand-new unlocked letter, editing a locked letter to unlock it, and
// tapping "🔓 Unlock" on an already-written locked letter. All three used
// to be wired up inconsistently (some notified, some didn't) — this is
// the single place that keeps push + in-app notification + the Sent
// archive + totalLettersSent in sync no matter which path triggered it.
function _devAnnounceLetterAvailable(cat, title, body, sig){
  const typeLabelMap = {notes:'a new note', surprises:'a surprise', letters:'a new letter'};
  const typeMap      = {notes:'note', surprises:'surprise', letters:'letter'};
  const typeLabel = typeLabelMap[cat] || 'a new letter';

  if(typeof triggerPush === 'function'){
    triggerPush('ana', '💌 New letter from Robert', `He just sent you ${typeLabel} — "${title}"`, 'heartly-new-letter');
  }
  // pushLetterNotif() is what actually increments totalLettersSent (the
  // real counter the Love Letters achievements read) and writes the
  // in-app notification log entry — every "letter available" path must
  // go through it or those achievements silently fall behind reality.
  if(typeof pushLetterNotif === 'function') pushLetterNotif(title, body, sig);

  // Real archive entry — this is what the Sent tab and the Dev calendar
  // actually read. Previously only the old, now-removed "Write" screen
  // ever pushed into sentLetters, so the Sent tab and calendar stayed
  // permanently empty once letters started being authored through this
  // Dev editor instead.
  if(typeof sentLetters !== 'undefined'){
    sentLetters.unshift({
      type: typeMap[cat] || 'letter',
      title, body, sig,
      date: 'Just now',
      ts: Date.now(),
      read: false
    });
    if(typeof renderSentLetters === 'function') renderSentLetters();
    if(typeof sentUnreadBadge !== 'undefined'){ sentUnreadBadge = true; if(typeof updateSentBadge==='function') updateSentBadge(); }
  }
  if(typeof renderCal === 'function' && calMonth) renderCal();
}

function saveDevItem(){
  if(devCurrentTab === 'templates') return saveTemplateItem();

  const label=document.getElementById('dev-f-label').value.trim();
  const icon=document.getElementById('dev-f-icon').value;
  const title=document.getElementById('dev-f-title').value.trim();
  const bodyRaw=document.getElementById('dev-f-body').value.trim();
  const sig=document.getElementById('dev-f-sig').value.trim();
  const locked=document.getElementById('dev-f-locked').checked;
  const priceEl=document.getElementById('dev-f-price');
  const tagEl=document.getElementById('dev-f-tag');
  const secretEl=document.getElementById('dev-f-secret');

  if(!label){ T('⚠️ A label is required!'); return; }
  if(!locked && (!title || !bodyRaw)){ T('⚠️ Title and body are required for an unlocked letter!'); return; }

  // Convert newlines to <br>
  const body=bodyRaw.replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');

  // Split label into 2 lines for grid display
  const words=label.split(' ');
  const mid=Math.ceil(words.length/2);
  const gridLabel=words.slice(0,mid).join(' ')+'\n'+words.slice(mid).join(' ');

  // Existing item being edited (if any) — used so editing text doesn't
  // silently wipe a price that was set separately, or reset read state
  const existing = devEditIndex!==null ? ED[devCurrentTab][devEditIndex] : null;

  // BUG (fixed): this used to hard-discard whatever title/body you typed
  // any time "Locked?" was checked — `locked ? null : {...}` — so a
  // locked letter written with real content saved with NO content at
  // all. That's why a one-time peek (or the eventual real unlock) only
  // ever showed generic placeholder text: there was nothing real stored
  // to show. Now: save the real content whenever you actually typed a
  // title/body, locked or not. Only stays null if you deliberately left
  // both blank (e.g. planning to fill it in later via "Add content to
  // unlock").
  const hasContent = !!(title || bodyRaw);
  const item={
    i:icon,
    l:gridLabel,
    lk:locked,
    letter: hasContent ? {t:title, b:body, s:sig} : null,
    tag: tagEl ? (tagEl.value || undefined) : (existing ? existing.tag : undefined),
    secret: secretEl ? (secretEl.checked || undefined) : (existing ? existing.secret : undefined)
  };
  // A surprise (surpriseType) item has no title/body of its own — its
  // "content" is the animation, not a letter object. Never let editing
  // through this generic editor strip that tag off; without it the item
  // silently stops being a surprise at all.
  if(existing && existing.surpriseType) item.surpriseType = existing.surpriseType;

  if(locked){
    const typed = priceEl ? parseInt(priceEl.value) : NaN;
    item.price = (!isNaN(typed) && typed>=0) ? typed : ((existing && existing.price) || 1000);

    // One-time free preview — Ana can open it once without paying, then
    // it locks back down at the same price. Toggle lives next to price.
    const previewEl = document.getElementById('dev-f-preview-once');
    item.previewOnce = previewEl ? previewEl.checked : false;
    // Preserve whether the one-time peek has already been used, unless
    // this is a brand-new item or the option was just turned on for the
    // first time (existing.previewOnce falsy) — then it's fresh.
    item.previewUsed = (existing && existing.previewOnce) ? !!existing.previewUsed : false;
  }
  if(existing){
    if(existing.read !== undefined) item.read = existing.read;
    if(existing.unlockedAt !== undefined) item.unlockedAt = existing.unlockedAt;
    if(existing.lk && !locked){
      // Just unlocked via the editor — treat as a fresh reveal for Ana
      item.read = false;
      item.unlockedAt = Date.now();
    }
  } else if(!locked){
    // Brand new, already-unlocked item — also fresh content for Ana
    item.read = false;
    item.unlockedAt = Date.now();
  }

  // A letter "becomes available" here in exactly two situations: it's a
  // brand-new item created already-unlocked, or an existing item that
  // was locked is being unlocked right now. Editing an already-unlocked
  // letter's text, or saving a still-locked letter, are not "new
  // availability" events and must not re-notify Ana or re-log a Sent
  // entry for content she may have already read.
  const isNewUnlocked   = devEditIndex===null && !locked;
  const justGotUnlocked = !!(existing && existing.lk && !locked);
  const becameAvailable = hasContent && (isNewUnlocked || justGotUnlocked);

  if(devEditIndex===null){
    ED[devCurrentTab].push(item);
    T('✅ New letter added to '+devCurrentTab+'!');
  } else {
    ED[devCurrentTab][devEditIndex]=item;
    T('✅ Letter updated!');
  }

  if(becameAvailable) _devAnnounceLetterAvailable(devCurrentTab, title, body, sig);

  closeDevEditor();
  _robDevListDirty = true;
  renderDevListRob();
  if(typeof saveState==='function') saveState();
  if(typeof renderHomeLetters==='function') renderHomeLetters();
  // Refresh explore grid if visible
  if(document.getElementById('s-explore').classList.contains('on')) renderGrid(devCurrentTab);
}
window.saveDevItem=saveDevItem;

async function devDelete(index){
  const ok = await appModal({
    icon: '🗑️',
    title: 'Delete this letter?',
    subtitle: 'This cannot be undone.',
    confirmLabel: 'Delete',
    danger: true
  });
  if(!ok) return;
  ED[devCurrentTab].splice(index,1);
  _robDevListDirty = true;
  T('🗑️ Letter deleted');
  renderDevListRob();
  if(typeof saveState==='function') saveState();
  if(typeof renderHomeLetters==='function') renderHomeLetters();
  if(document.getElementById('s-explore').classList.contains('on')) renderGrid(devCurrentTab);
}
window.devDelete=devDelete;

// Tapping "🔓 Unlock" on an already-written locked letter makes it
// available to Ana right now — that's a real send event, exactly like
// creating a new unlocked letter, so it goes through the same
// announce/notify/archive path. (Previously this silently flipped the
// flag with no push notification, no in-app notification log entry, and
// no Sent-tab/calendar record — Ana would never actually find out.)
function devUnlock(index){
  _robDevListDirty = true;
  const it=ED[devCurrentTab][index];
  // If no letter content yet, open editor to add content
  if(!it.letter){
    T('✏️ Add content to unlock this letter');
    openDevEditor(index);
    return;
  }
  it.lk=false;
  it.read=false;
  it.unlockedAt=Date.now();
  T('🔓 Letter unlocked!');
  _devAnnounceLetterAvailable(devCurrentTab, it.letter.t, it.letter.b, it.letter.s);
  renderDevListRob();
  if(typeof saveState==='function') saveState();
  if(typeof renderHomeLetters==='function') renderHomeLetters();
  if(document.getElementById('s-explore').classList.contains('on')) renderGrid(devCurrentTab);
}
window.devUnlock=devUnlock;

function devLock(index){
  _robDevListDirty = true;
  ED[devCurrentTab][index].lk=true;
  T('🔒 Letter locked');
  renderDevListRob();
  if(typeof saveState==='function') saveState();
  if(document.getElementById('s-explore').classList.contains('on')) renderGrid(devCurrentTab);
}
window.devLock=devLock;

// Lets Robert re-arm a one-time free preview after Ana has already used it
function devResetPreview(index){
  _robDevListDirty = true;
  const it=ED[devCurrentTab][index];
  if(!it || !it.previewOnce) return;
  it.previewUsed=false;
  T('🔄 Free peek reset — ready again');
  renderDevListRob();
  if(typeof saveState==='function') saveState();
}
window.devResetPreview=devResetPreview;

/* ═══════════════════════════════════════════════════
   PIXEL ART — DEV PANEL
   Robert imports images → Ana sees them in her game
═══════════════════════════════════════════════════ */

let _dvPaFile = null; // currently chosen file

// Preview chosen image in dev panel
function dvPaPreview(input){
  const file = input.files[0];
  if(!file) return;
  _dvPaFile = file;

  // Auto-fill title from filename
  const nameEl = document.getElementById('dv-pa-title');
  if(nameEl && !nameEl.value)
    nameEl.value = file.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ');

  // Show preview on small canvas
  const reader = new FileReader();
  reader.onload = e=>{
    const img = new Image();
    img.onload = ()=>{
      const prev = document.getElementById('dv-pa-preview');
      if(!prev) return;
      prev.style.display = 'block';
      const maxW = 200, maxH = 140;
      const scale = Math.min(maxW/img.width, maxH/img.height, 1);
      prev.width  = Math.round(img.width  * scale);
      prev.height = Math.round(img.height * scale);
      prev.getContext('2d').drawImage(img, 0, 0, prev.width, prev.height);
      const info = document.getElementById('dv-pa-info');
      if(info) info.textContent = img.width+'×'+img.height+'px · '+file.name;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
window.dvPaPreview = dvPaPreview;

// Import button — sends file to the game iframe's devImportArtwork API
function dvPaImport(){
  if(!_dvPaFile){ T('📂 Choose an image first'); return; }

  const title    = (document.getElementById('dv-pa-title')   ||{}).value||'Custom Art';
  const category = (document.getElementById('dv-pa-category')||{}).value||'custom';
  const cols     = parseInt((document.getElementById('dv-pa-cols')  ||{}).value)||32;
  const rows     = parseInt((document.getElementById('dv-pa-rows')  ||{}).value)||32;
  const maxColors= parseInt((document.getElementById('dv-pa-colors')||{}).value)||16;

  // Try to call the game's API if iframe is loaded
  const frame = document.getElementById('cbn-frame');
  const gameWin = frame && frame.contentWindow;

  if(gameWin && typeof gameWin.devImportArtwork === 'function'){
    const btn = document.getElementById('dv-pa-import-btn');
    if(btn){ btn.textContent = '⏳ Converting…'; btn.disabled = true; }

    gameWin.devImportArtwork(_dvPaFile, {title, category, cols, rows, maxColors, dither:'floyd'}, (ok, msg)=>{
      if(btn){ btn.textContent = '＋ Add to Ana\'s Game'; btn.disabled = false; }
      if(ok){
        T('🎨 "'+msg+'" added to Ana\'s game!');
        // Reset form
        _dvPaFile = null;
        const fi = document.getElementById('dv-pa-file');
        if(fi) fi.value = '';
        const ti = document.getElementById('dv-pa-title');
        if(ti) ti.value = '';
        document.getElementById('dv-pa-preview').style.display = 'none';
        document.getElementById('dv-pa-info').textContent = '';
        dvPaRefreshList();
      } else {
        T('❌ Import failed: '+msg);
      }
    });
  } else {
    // Game not open — write directly to localStorage so it loads next time
    dvPaImportDirect(_dvPaFile, {title, category, cols, rows, maxColors});
  }
}
window.dvPaImport = dvPaImport;

// Fallback: convert and save directly to localStorage without the game being open
async function dvPaImportDirect(file, opts){
  const btn = document.getElementById('dv-pa-import-btn');
  if(btn){ btn.disabled=true; btn.textContent='Converting…'; }
  try {
    const art = await window.PixelImport(file, opts);
    const state = window.getPixelArtState();
    if(Object.keys(state.custom).length >= 60) throw new Error('The collection has reached 60 custom pictures.');
    state.custom[art.id] = art;
    window.commitPixelArtState(state);
    _dvPaFile=null;
    ['dv-pa-file','dv-pa-title'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    document.getElementById('dv-pa-preview').style.display='none';
    document.getElementById('dv-pa-info').textContent='';
    dvPaRefreshList();
    T('Picture added to the coloring collection.');
  } catch(error) { T('Import failed: '+error.message); }
  finally { if(btn){btn.disabled=false;btn.textContent="＋ Add to Ana's Game";} }
}
// Refresh the custom artworks list in dev panel
function dvPaRefreshList(){
  const list = document.getElementById('dv-pa-list');
  const count = document.getElementById('dv-pa-count');
  if(!list || typeof window.getPixelArtState!=='function') return;
  const artworks = Object.values(window.getPixelArtState().custom);
  if(count) count.textContent=artworks.length;
  list.replaceChildren();
  if(!artworks.length){const empty=document.createElement('p');empty.textContent='No custom artworks yet';empty.style.cssText='font-size:11px;text-align:center;padding:14px';list.append(empty);}
  artworks.forEach(a=>{
    const row=document.createElement('div');row.className='dv-item-row';
    const body=document.createElement('div');body.className='dv-item-body';
    const title=document.createElement('div');title.className='dv-item-text';title.textContent=a.title;
    const meta=document.createElement('div');meta.className='dv-item-date';meta.textContent=a.cols+' × '+a.rows+' · '+Object.keys(a.colors).length+' colors';
    body.append(title,meta);
    const remove=document.createElement('button');remove.className='dv-item-del';remove.textContent='Remove';remove.onclick=()=>dvPaRemove(a.id);
    row.append(body,remove);list.append(row);
  });
}
window.dvPaRefreshList=dvPaRefreshList;
function dvPaRemove(id){
  const state=window.getPixelArtState();
  state.deleted[id]=Date.now();delete state.custom[id];
  window.commitPixelArtState(state);
  dvPaRefreshList();T('Artwork removed from the collection.');
}
window.dvPaRemove=dvPaRemove;
window.addEventListener('pixelart-state',dvPaRefreshList);
