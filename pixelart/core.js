/* Shared, DOM-free save validation. Colored cells only grow: concurrent devices
   merge their work instead of replacing one another's painted pixels. */
(function (root) {
  'use strict';
  const safeId = id => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,90}$/.test(id) && !['__proto__','constructor','prototype'].includes(id);
  const empty = () => ({ version: 3, works: {}, custom: {}, deleted: {}, lastArtwork: null });
  function artwork(a) {
    if(a?.gridBytes && Number.isInteger(a.cols)&&Number.isInteger(a.rows)&&a.cols>0&&a.rows>0&&a.cols<=1000&&a.rows<=1000){try{const raw=atob(a.gridBytes);if(raw.length!==a.cols*a.rows)return null;a={...a,grid:Array.from({length:a.rows},(_,r)=>Array.from({length:a.cols},(_,c)=>raw.charCodeAt(r*a.cols+c)))};}catch(_){return null;}}
    if (!a || !safeId(a.id) || !Number.isInteger(a.cols) || !Number.isInteger(a.rows) || a.cols < 1 || a.rows < 1 || a.cols > 1000 || a.rows > 1000) return null;
    if (!a.colors || Object.keys(a.colors).length > 100 || !Array.isArray(a.grid) || a.grid.length !== a.rows) return null;
    const colors = {};
    for (const [key, color] of Object.entries(a.colors)) {
      if (!/^(?:[1-9][0-9]?|100)$/.test(key) || !/^#[0-9a-f]{6}$/i.test(color)) return null;
      colors[key] = color;
    }
    if (a.grid.some(row => !Array.isArray(row) || row.length !== a.cols || row.some(n => !Number.isInteger(n) || !colors[n]))) return null;
    return { id:a.id, title:String(a.title || 'Untitled picture').slice(0,80), category:String(a.category || 'custom').slice(0,30), cols:a.cols, rows:a.rows, colors, grid:a.grid.map(r=>r.slice()), isCustom:!!a.isCustom, draft:a.draft===true, updatedAt:Number.isFinite(a.updatedAt)?a.updatedAt:0, desc:String(a.desc || '').slice(0,160) };
  }
  function normalize(input) {
    const out = empty();
    if (!input || typeof input !== 'object') return out;
    for (const [id, art] of Object.entries(input.custom || {}).slice(0,60)) {
      const valid = artwork(art);
      if (valid && id === valid.id && id.startsWith('custom_')) out.custom[id] = valid;
    }
    for (const [id, stamp] of Object.entries(input.deleted || {}).slice(0,300)) if(safeId(id) && Number.isFinite(stamp)) out.deleted[id] = stamp;
    for (const [id, original] of Object.entries(input.works || {}).slice(0,300)) {
      let p=original;if(p?.filledBits){try{const raw=atob(p.filledBits);if(raw.length>125000)continue;const filled=[];for(let i=0;i<raw.length;i++){const byte=raw.charCodeAt(i);for(let bit=0;bit<8;bit++)if(byte&(1<<bit))filled.push(i*8+bit);}p={...p,filled};}catch(_){continue;}}
      if(!safeId(id) || !p || !Array.isArray(p.filled)) continue;
      out.works[id] = { filled:[...new Set(p.filled.filter(n=>Number.isInteger(n)&&n>=0&&n<1000000))].sort((a,b)=>a-b), completedAt:Number.isFinite(p.completedAt) ? p.completedAt : null, rewarded:p.rewarded===true, updatedAt:Number.isFinite(p.updatedAt) ? p.updatedAt : 0 };
    }
    out.lastArtwork = safeId(input.lastArtwork) ? input.lastArtwork : null;
    return out;
  }
  function merge(left, right) {
    const a = normalize(left), b = normalize(right);
    for (const [id, art] of Object.entries(b.custom)) { const old=a.custom[id]; if(!old || art.updatedAt>old.updatedAt || (art.updatedAt===old.updatedAt && JSON.stringify(art)>JSON.stringify(old))) a.custom[id]=art; }
    for (const [id, ts] of Object.entries(b.deleted)) a.deleted[id] = Math.max(a.deleted[id] || 0, ts);
    for (const id of Object.keys(a.deleted)) delete a.custom[id];
    for (const [id, p] of Object.entries(b.works)) {
      const old = a.works[id];
      if (!old) a.works[id] = p;
      else a.works[id] = { filled:[...new Set([...old.filled,...p.filled])].sort((x,y)=>x-y), completedAt:old.completedAt && p.completedAt ? Math.min(old.completedAt,p.completedAt) : old.completedAt || p.completedAt, rewarded:old.rewarded || p.rewarded, updatedAt:Math.max(old.updatedAt,p.updatedAt) };
    }
    a.lastArtwork = b.lastArtwork || a.lastArtwork;
    return a;
  }
  function migrate(legacy, customs) {
    const out = empty();
    for (const art of Array.isArray(customs) ? customs : []) { const a=artwork(art); if(a && a.id.startsWith('custom_')) out.custom[a.id]=a; }
    for (const [id,p] of Object.entries(legacy?.artworkProgress || {})) {
      if(!safeId(id) || !Array.isArray(p.cells)) continue;
      const complete = !!p.completedAt || !!legacy?.player?.completedArtworks?.includes(id);
      out.works[id] = { filled:p.cells.flatMap((c,i)=>c?.filled ? [i] : []), completedAt:complete ? (Date.parse(p.completedAt)||1) : null, rewarded:complete, updatedAt:0 };
    }
    out.lastArtwork=legacy?.currentArtworkId || null;
    return normalize(out);
  }
  function cells(art, work) { return new Set((work?.filled || []).filter(i=>i < art.cols*art.rows)); }
  function reward(art) { return Math.min(120, Math.max(30, Math.round(art.cols*art.rows/4))); }

  function bytes64(bytes){let text='';for(let i=0;i<bytes.length;i+=16384)text+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(text);}
  function pack(input){
    const out=normalize(input);
    for(const a of Object.values(out.custom))if(a.cols*a.rows>10000){a.gridBytes=bytes64(Uint8Array.from(a.grid.flat()));delete a.grid;}
    for(const p of Object.values(out.works))if(p.filled.length>10000){const bytes=new Uint8Array(Math.ceil((p.filled[p.filled.length-1]+1)/8));for(const i of p.filled)bytes[i>>3]|=1<<(i&7);p.filledBits=bytes64(bytes);delete p.filled;}
    return out;
  }
  root.PixelCore = {empty,normalize,merge,migrate,artwork,cells,reward,pack};
  if(typeof module !== 'undefined') module.exports=root.PixelCore;
})(typeof window !== 'undefined' ? window : globalThis);
