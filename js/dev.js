/* ═══════════════════════════
   DEV PANEL
═══════════════════════════ */
devCurrentTab = 'notes'; // already declared above
devEditIndex = null; // already declared above

function openDev(){
  document.getElementById('DEV').classList.add('open');
  renderDevList();
  updateDevPtsDisplay();
}
function closeDev(){
  document.getElementById('DEV').classList.remove('open');
}
window.openDev=openDev;
window.closeDev=closeDev;

function devTab(k){
  devCurrentTab=k;
  document.querySelectorAll('.dev-tab').forEach(t=>t.classList.toggle('on', t.dataset.dk===k));
  renderDevList();
}
window.devTab=devTab;

function renderDevList(){
  const list=document.getElementById('dev-list');
  if(!list) return;
  const items=ED[devCurrentTab]||[];
  list.innerHTML=items.map((it,i)=>{
    const title=it.letter?it.letter.t:it.l.replace('\n',' ');
    const preview=it.letter?it.letter.b.replace(/<[^>]+>/g,'').substring(0,60)+'…':'Locked — no content';
    const price=it.price||0;
    return `<div class="dev-item${!it.letter?' locked-item':''}" style="animation-delay:${i*.03}s">
      <div class="dev-item-head">
        <div class="dev-item-title">${title}</div>
        ${it.lk?'<span style="font-size:9px;color:var(--tx3);background:rgba(255,255,255,.06);padding:2px 8px;border-radius:999px">LOCKED</span>':''}
      </div>
      <div class="dev-item-sub">${preview}</div>
      ${it.lk ? `<div class="dev-item-price">
        <span class="dev-price-label">🪙 Price</span>
        <input class="dev-price-input" type="number" id="price-main-${i}" value="${price}" min="0" max="99999" placeholder="0">
        <button class="dev-price-save rw" onclick="saveLetterPrice(${i}, 'main');R(event,this)">Save</button>
      </div>` : `<div class="dev-item-price"><span class="dev-price-label">🔓 Unlocked</span><span class="dev-price-free">Free to read</span></div>`}
      <div class="dev-item-actions">
        <button class="dev-btn edit" onclick="openDevEditor(${i})">✏️ Edit</button>
        ${it.lk?`<button class="dev-btn unlock" onclick="devUnlock(${i})">🔓 Unlock</button>`:`<button class="dev-btn unlock" onclick="devLock(${i})">🔒 Lock</button>`}
        <button class="dev-btn del" onclick="devDelete(${i})">🗑️ Delete</button>
      </div>
    </div>`;
  }).join('');
}

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

  if(!label||!title||!bodyRaw){ T('⚠️ Label, title and body are required!'); return; }

  // Convert newlines to <br>
  const body=bodyRaw.replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');

  // Split label into 2 lines for grid display
  const words=label.split(' ');
  const mid=Math.ceil(words.length/2);
  const gridLabel=words.slice(0,mid).join(' ')+'\n'+words.slice(mid).join(' ');

  const item={
    i:icon,
    l:gridLabel,
    lk:locked,
    letter:locked?null:{t:title, b:body, s:sig}
  };

  if(devEditIndex===null){
    ED[devCurrentTab].push(item);
    T('✅ New letter added to '+devCurrentTab+'!');
  } else {
    ED[devCurrentTab][devEditIndex]=item;
    T('✅ Letter updated!');
  }

  _robDevListDirty = true;
  closeDevEditor();
  renderDevList();
  // Refresh explore grid if visible
  if(document.getElementById('s-explore').classList.contains('on')) renderGrid(devCurrentTab);
}
window.saveDevItem=saveDevItem;

function devDelete(index){
  if(!confirm('Delete this letter? This cannot be undone.')) return;
  ED[devCurrentTab].splice(index,1);
  _robDevListDirty = true;
  T('🗑️ Letter deleted');
  renderDevList();
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
  T('🔓 Letter unlocked!');
  renderDevList();
  if(document.getElementById('s-explore').classList.contains('on')) renderGrid(devCurrentTab);
}
window.devUnlock=devUnlock;

function devLock(index){ _robDevListDirty = true;
  ED[devCurrentTab][index].lk=true;
  T('🔒 Letter locked');
  renderDevList();
  if(document.getElementById('s-explore').classList.contains('on')) renderGrid(devCurrentTab);
}
window.devLock=devLock;

// Show dev trigger button only for dev account
function initDevMode(){
  if(currentUser==='developer.login'){
    document.getElementById('dev-trigger').classList.add('show');
  }
}


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
    // Capture tag + secret before calling original (which reads other fields)
    const tagEl    = document.getElementById('dev-f-tag');
    const secretEl = document.getElementById('dev-f-secret');
    const tag    = tagEl    ? tagEl.value    : '';
    const secret = secretEl ? secretEl.checked : false;

    _origSave();

    // Apply tag + secret to the item that was just saved/updated
    const items = ED[devCurrentTab];
    const idx = devEditIndex !== null ? devEditIndex : items.length - 1;
    if(items[idx]){
      items[idx].tag    = tag || undefined;
      items[idx].secret = secret || undefined;
    }
    _robDevListDirty = true;
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

// Hook dvTab to refresh list when pixel art tab is opened
(function(){
  const _orig = window.dvTab;
  window.dvTab = function(id){
    _orig(id);
    if(id==='pixelart') dvPaRefreshList();
  };
})();
