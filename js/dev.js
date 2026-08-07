/* ═══════════════════════════
   DEV PANEL
═══════════════════════════ */
devCurrentTab = 'notes'; // already declared above
devEditIndex = null; // already declared above

function devTab(k){
  devCurrentTab=k;
  // Scope the active-state toggle to the Letter Library tab group only —
  // sibling tab groups (main Dev tabs, Wishlist tabs) share the same
  // .dv-tab-btn class and must not be affected.
  document.querySelectorAll('.dv-tabs[data-dev-subtab] .dv-tab-btn').forEach(t=>t.classList.toggle('on', t.dataset.dk===k));
  _robDevListDirty = true;
  if(typeof renderDevListRob === 'function') renderDevListRob();
}
window.devTab=devTab;

function openDevEditor(index){
  devEditIndex=index;
  const ed=document.getElementById('dev-editor');
  ed.classList.add('on');

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
  }
}
window.openDevEditor=openDevEditor;

function closeDevEditor(){
  document.getElementById('dev-editor').classList.remove('on');
  devEditIndex=null;
}
window.closeDevEditor=closeDevEditor;

function saveDevItem(){
  const label=document.getElementById('dev-f-label').value.trim();
  const icon=document.getElementById('dev-f-icon').value;
  const title=document.getElementById('dev-f-title').value.trim();
  const bodyRaw=document.getElementById('dev-f-body').value.trim();
  const sig=document.getElementById('dev-f-sig').value.trim();
  const locked=document.getElementById('dev-f-locked').checked;
  const priceEl=document.getElementById('dev-f-price');

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

  const item={
    i:icon,
    l:gridLabel,
    lk:locked,
    letter:locked?null:{t:title, b:body, s:sig}
  };

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

  const isNewUnlockedLetter = devEditIndex===null && !locked;

  if(devEditIndex===null){
    ED[devCurrentTab].push(item);
    T('✅ New letter added to '+devCurrentTab+'!');
  } else {
    ED[devCurrentTab][devEditIndex]=item;
    T('✅ Letter updated!');
  }

  // Notify Ana — only for brand-new, immediately-unlocked letters (not
  // locked/scheduled items sitting behind a price, and not edits to
  // existing letters).
  if(isNewUnlockedLetter){
    const typeLabelMap = {notes:'a new note', surprises:'a surprise', letters:'a new letter'};
    const typeLabel = typeLabelMap[devCurrentTab] || 'a new letter';
    if(typeof triggerPush === 'function'){
      triggerPush('ana', '💌 New letter from Robert', `He just sent you ${typeLabel} — "${title}"`, 'heartly-new-letter');
    }
    if(typeof pushLetterNotif === 'function') pushLetterNotif(title, body, sig);
  }

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
  _robDevListDirty = true;
  renderDevListRob();
  if(typeof saveState==='function') saveState();
  if(typeof renderHomeLetters==='function') renderHomeLetters();
  if(document.getElementById('s-explore').classList.contains('on')) renderGrid(devCurrentTab);
}
window.devDelete=devDelete;

function devUnlock(index){ _robDevListDirty = true;
  const it=ED[devCurrentTab][index];
  it.lk=false;
  // If no letter content yet, open editor to add content
  if(!it.letter){
    T('✏️ Add content to unlock this letter');
    openDevEditor(index);
    return;
  }
  it.read=false;
  it.unlockedAt=Date.now();
  T('🔓 Letter unlocked!');
  _robDevListDirty = true;
  renderDevListRob();
  if(typeof saveState==='function') saveState();
  if(typeof renderHomeLetters==='function') renderHomeLetters();
  if(document.getElementById('s-explore').classList.contains('on')) renderGrid(devCurrentTab);
}
window.devUnlock=devUnlock;

function devLock(index){ _robDevListDirty = true;
  ED[devCurrentTab][index].lk=true;
  T('🔒 Letter locked');
  _robDevListDirty = true;
  renderDevListRob();
  if(typeof saveState==='function') saveState();
  if(document.getElementById('s-explore').classList.contains('on')) renderGrid(devCurrentTab);
}
window.devLock=devLock;

// Lets Robert re-arm a one-time free preview after Ana has already used it
function devResetPreview(index){ _robDevListDirty = true;
  const it=ED[devCurrentTab][index];
  if(!it || !it.previewOnce) return;
  it.previewUsed=false;
  T('🔄 Free peek reset — ready again');
  renderDevListRob();
  if(typeof saveState==='function') saveState();
}
window.devResetPreview=devResetPreview;

/* ═══ PATCH openDevEditor + saveDevItem for tag & secret ═══ */
(function(){
  const _origOpen = window.openDevEditor;
  window.openDevEditor = function(index){
    _origOpen(index);
    const tagEl = document.getElementById('dev-f-tag');
    const secretEl = document.getElementById('dev-f-secret');
    if(!tagEl || !secretEl) return;
    if(index === null){
      tagEl.value = '';
      secretEl.checked = false;
    } else {
      const it = ED[devCurrentTab][index];
      tagEl.value = it.tag || '';
      secretEl.checked = !!it.secret;
    }
  };

  const _origSave = window.saveDevItem;
  window.saveDevItem = function(){
    // Capture tag + secret + the target index BEFORE calling original —
    // the original calls closeDevEditor() which resets devEditIndex to
    // null, so reading it afterward always pointed at the wrong item.
    const tagEl    = document.getElementById('dev-f-tag');
    const secretEl = document.getElementById('dev-f-secret');
    const tag    = tagEl    ? tagEl.value    : '';
    const secret = secretEl ? secretEl.checked : false;
    const wasNewItem = devEditIndex === null;
    const targetIndex = devEditIndex;

    _origSave();

    // Apply tag + secret to the item that was just saved/updated
    const items = ED[devCurrentTab];
    const idx = wasNewItem ? items.length - 1 : targetIndex;
    if(items[idx]){
      items[idx].tag    = tag || undefined;
      items[idx].secret = secret || undefined;
    }
    _robDevListDirty = true;
    renderDevListRob();
    if(document.getElementById('s-explore').classList.contains('on')) renderGrid(devCurrentTab);
  };
})();

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
function dvPaImportDirect(file, opts){
  const reader = new FileReader();
  reader.onload = e=>{
    const img = new Image();
    img.onload = ()=>{
      try{
        // Inline minimal quantizer (same logic as game's convertImageToArtwork)
        const cols=opts.cols||32, rows=opts.rows||32, maxColors=Math.min(opts.maxColors||16,32);
        const offscreen=document.createElement('canvas');
        offscreen.width=cols; offscreen.height=rows;
        const ctx=offscreen.getContext('2d');
        ctx.drawImage(img,0,0,cols,rows);
        const raw=ctx.getImageData(0,0,cols,rows);

        // Simple median-cut-like: collect unique colors, clamp to maxColors
        const pixels=[], colorMap={};
        for(let i=0;i<raw.data.length;i+=4){
          const r=Math.round(raw.data[i]/16)*16;
          const g=Math.round(raw.data[i+1]/16)*16;
          const b=Math.round(raw.data[i+2]/16)*16;
          const hex='#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
          if(!colorMap[hex]) colorMap[hex]=Object.keys(colorMap).length+1;
          pixels.push(colorMap[hex]);
        }

        // Merge to maxColors if too many
        const colorKeys=Object.keys(colorMap);
        if(colorKeys.length>maxColors){
          // Keep only the first maxColors, remap rest to nearest
          const keep=colorKeys.slice(0,maxColors);
          const remap={};
          colorKeys.forEach((k,i)=>{ remap[i+1]=Math.min(i+1,maxColors); });
          pixels.forEach((p,i)=>{ pixels[i]=remap[p]; });
          // Rebuild colorMap
          Object.keys(colorMap).forEach(k=>{ if(!keep.includes(k)) delete colorMap[k]; });
        }

        // Build grid
        const grid=[];
        for(let r=0;r<rows;r++){
          const row=[];
          for(let c=0;c<cols;c++) row.push(pixels[r*cols+c]);
          grid.push(row);
        }
        const colors={};
        Object.entries(colorMap).forEach(([hex,idx])=>{ colors[idx]=hex; });

        const art={
          id:'custom_'+Date.now(),
          title:opts.title||'Custom Art',
          category:opts.category||'custom',
          difficulty:2,
          xpReward:cols*rows,
          desc:cols+'×'+rows+' pixel art',
          cols, rows, colors, grid, isCustom:true,
        };

        // Save to localStorage key the game reads
        let existing=[];
        try{ existing=JSON.parse(localStorage.getItem('ph_custom_artworks')||'[]'); }catch(e){}
        existing.push(art);
        localStorage.setItem('ph_custom_artworks',JSON.stringify(existing));

        T('🎨 "'+art.title+'" saved — open the game to see it!');
        _dvPaFile=null;
        const fi=document.getElementById('dv-pa-file'); if(fi) fi.value='';
        const ti=document.getElementById('dv-pa-title'); if(ti) ti.value='';
        const prev=document.getElementById('dv-pa-preview'); if(prev) prev.style.display='none';
        const info=document.getElementById('dv-pa-info'); if(info) info.textContent='';
        dvPaRefreshList();
      }catch(err){
        T('❌ Conversion failed: '+err.message);
      }
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}

// Refresh the custom artworks list in dev panel
function dvPaRefreshList(){
  const listEl  = document.getElementById('dv-pa-list');
  const countEl = document.getElementById('dv-pa-count');
  if(!listEl) return;

  // Try getting from live game first
  const frame = document.getElementById('cbn-frame');
  const gameWin = frame && frame.contentWindow;
  let artworks = [];

  if(gameWin && typeof gameWin.devListArtworks==='function'){
    artworks = gameWin.devListArtworks();
  } else {
    // Fallback: read from localStorage
    try{
      const raw = localStorage.getItem('ph_custom_artworks');
      if(raw) artworks = JSON.parse(raw).map(a=>({id:a.id,title:a.title,cols:a.cols,rows:a.rows,colors:Object.keys(a.colors).length}));
    }catch(e){}
  }

  if(countEl) countEl.textContent = artworks.length;

  listEl.innerHTML = artworks.length
    ? artworks.map(a=>`
        <div class="dv-item-row">
          <div class="dv-item-body">
            <div class="dv-item-text">${a.title}</div>
            <div class="dv-item-date">${a.cols}×${a.rows} · ${a.colors} colors</div>
          </div>
          <div class="dv-item-del" onclick="dvPaRemove('${a.id}')">🗑</div>
        </div>`).join('')
    : '<div style="font-size:11px;color:rgba(0,255,180,.25);text-align:center;padding:14px 0">No custom artworks yet</div>';
}
window.dvPaRefreshList = dvPaRefreshList;

// Remove a custom artwork
function dvPaRemove(id){
  const frame = document.getElementById('cbn-frame');
  const gameWin = frame && frame.contentWindow;

  if(gameWin && typeof gameWin.devRemoveArtwork==='function'){
    gameWin.devRemoveArtwork(id);
  } else {
    // Remove from localStorage directly
    try{
      let existing=JSON.parse(localStorage.getItem('ph_custom_artworks')||'[]');
      existing=existing.filter(a=>a.id!==id);
      localStorage.setItem('ph_custom_artworks',JSON.stringify(existing));
    }catch(e){}
  }
  T('🗑 Artwork removed');
  dvPaRefreshList();
}
window.dvPaRemove = dvPaRemove;


