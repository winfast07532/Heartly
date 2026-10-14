(function(){
  'use strict';
  const C=window.PixelCore, $=id=>document.getElementById(id), KEY='heartly_pixel_v3';
  const embedded=window.parent!==window;
  function parentBridge(){try{return embedded && typeof parent.getPixelArtState==='function' ? parent : null;}catch(_){return null;}}
  function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)) || fallback;}catch(_){return fallback;}}
  let state=C.merge(C.migrate(read('pixelhue_v2',null),read('ph_custom_artworks',[])),read(KEY,null));
  let art=null, filled=new Set(), selected=1, tool='paint', replay=false, view='all', category='all', localOK=true;
  let saveTimer=0, toastTimer=0, renderFrame=0, activeHint=-1, keyboardCell=-1, libraryScroll=0;
  let w=0,h=0,dpr=1,base=1,scale=1,ox=0,oy=0;
  const canvas=$('pixel-canvas'),ctx=canvas.getContext('2d'), pointers=new Map();
  let gesture=null, pinching=false, overview=null,overviewKey='';
  const catalog=()=>[...window.HEARTLY_ARTWORKS,...Object.values(state.custom).filter(a=>!state.deleted[a.id]&&!a.draft)];
  const total=a=>a.cols*a.rows;
  const progress=a=>C.cells(a,state.works[a.id]).size;
  function notify(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2400);}
  function syncLabel(){
    const p=parentBridge();
    if(!localOK)return p?.pixelArtSyncStatus==='synced'&&!p?.pixelArtSavePending?'Saved to Heartly · device storage full':'Device storage full · save pending';
    if(!p)return 'Saved on this device';
    const s=p.pixelArtSyncStatus;
    if(saveTimer || s==='syncing')return 'Saved here · syncing…';
    if(p.pixelArtSavePending)return 'Saved here · cloud pending';
    return s==='synced' ? 'Saved to Heartly' : 'Saved here · cloud pending';
  }
  function showSave(){const label=syncLabel();$('save-status').textContent=label;$('library-save').textContent=label;}
  function persistLocal(){try{localStorage.setItem(KEY,JSON.stringify(C.pack(state)));localOK=true;}catch(_){localOK=false;}showSave();}
  function flush(){
    clearTimeout(saveTimer);saveTimer=0;
    const p=parentBridge();
    if(p){try{state=C.merge(state,p.commitPixelArtState(state));}catch(e){console.warn('Pixel Art sync:',e);}}
    persistLocal();
  }
  function save(){persistLocal();if(!saveTimer)saveTimer=setTimeout(flush,700);showSave();}
  window.flushPixelArt=flush;
  window.receiveHeartlyPixelState=function(incoming){
    state=C.merge(state,incoming);
    // Reward state comes from the parent, while painted cells merge locally.
    for(const [id,work] of Object.entries(incoming.works||{})) if(state.works[id]) state.works[id].rewarded=!!work.rewarded;
    if(art&&!replay){filled=C.cells(art,state.works[art.id]);renderPalette();updateProgress();requestDraw();}
    persistLocal();
    window.dispatchEvent(new Event('artwork-change'));
    if(!$('library').hidden)renderLibrary();
    if($('complete-dialog').open)updateReward();
  };
  function preview(canvas,a,partial,size=8){
    size=Math.min(size,Math.max(1,Math.floor(512/Math.max(a.cols,a.rows))));
    const c=canvas.getContext('2d');canvas.width=a.cols*size;canvas.height=a.rows*size;
    for(let r=0;r<a.rows;r++)for(let col=0;col<a.cols;col++){
      c.fillStyle=partial && !partial.has(r*a.cols+col) ? '#ded4d0' : a.colors[a.grid[r][col]];
      c.fillRect(col*size,r*size,size,size);
    }
  }
  function renderLibrary(){
    const list=catalog();
    const unfinished=list.filter(a=>progress(a)>0&&progress(a)<total(a));
    const completed=list.filter(a=>progress(a)===total(a));
    $('progress-count').textContent=unfinished.length;$('done-count').textContent=completed.length;
    $('collection-count').textContent=list.length+' pictures';
    const feature=unfinished.find(a=>a.id===state.lastArtwork)||unfinished[0]||list.filter(a=>a.isCustom&&progress(a)===0).sort((a,b)=>b.updatedAt-a.updatedAt)[0]||list.find(a=>progress(a)===0)||list[0];
    $('feature-tag').textContent=unfinished.includes(feature)?'A LITTLE MOMENT, UNFINISHED':'YOUR NEXT LITTLE ESCAPE';
    $('feature-title').textContent=feature.title;
    $('feature-description').textContent=unfinished.includes(feature)?Math.round(progress(feature)/total(feature)*100)+'% colored. Pick up right where you left off.':feature.desc||'Make a little room for something lovely.';
    $('feature-play').replaceChildren(document.createTextNode(unfinished.includes(feature)?'Keep coloring':'Start coloring'));
    const arrow=document.createElement('span');arrow.textContent='→';$('feature-play').append(arrow);
    $('feature-play').onclick=()=>openArt(feature.id);
    $('feature-size').textContent=feature.cols+' × '+feature.rows+' · '+Object.keys(feature.colors).length+' COLORS';
    preview($('feature-preview'),feature);
    const cats=[['all','All pictures'],['custom','From Robert'],['love','Little joys'],['nature','Nature'],['animals','Animals'],['objects','Objects'],['food','Food'],['fantasy','Daydreams']];
    $('categories').replaceChildren();
    cats.filter(([id])=>id==='all'||list.some(a=>a.category===id)).forEach(([id,label])=>{
      const b=document.createElement('button');b.textContent=label;b.className=category===id?'active':'';b.setAttribute('aria-pressed',String(category===id));b.onclick=()=>{category=id;renderLibrary();};$('categories').append(b);
    });
    const query=$('picture-search').value.trim().toLowerCase();
    const visible=list.filter(a=>a.title.toLowerCase().includes(query)&&(category==='all'||a.category===category)&&(view==='all'||(view==='progress'?progress(a)>0&&progress(a)<total(a):progress(a)===total(a))));
    $('gallery').replaceChildren();
    visible.forEach(a=>{
      const n=progress(a),done=n===total(a),card=document.createElement('button');card.className='art-card';
      card.setAttribute('aria-label',a.title+', '+(done?'completed':Math.round(n/total(a)*100)+'% colored'));
      const picture=document.createElement('div');picture.className='art-preview';
      const cv=document.createElement('canvas');preview(cv,a,n&&!done?C.cells(a,state.works[a.id]):null);cv.setAttribute('aria-hidden','true');picture.append(cv);
      const badge=document.createElement('span');badge.className='art-badge'+(done?' done':'');badge.textContent=done?'✓ Finished':n?Math.round(n/total(a)*100)+'%':a.cols+' × '+a.rows;picture.append(badge);
      const info=document.createElement('div');info.className='art-copy';const title=document.createElement('h3');title.textContent=a.title;
      const meta=document.createElement('div');meta.className='art-meta';const size=document.createElement('span');size.textContent=Object.keys(a.colors).length+' colors';const reward=document.createElement('span');reward.textContent=done?'View picture':'+'+C.reward(a)+' pts';meta.append(size,reward);info.append(title,meta);
      const bar=document.createElement('div');bar.className='card-progress';const fill=document.createElement('i');fill.style.width=(n/total(a)*100)+'%';bar.append(fill);info.append(bar);card.append(picture,info);card.onclick=()=>openArt(a.id);$('gallery').append(card);
    });
    $('empty').hidden=visible.length>0;
    $('empty').textContent=query?'No pictures match your search. Try another name.':view==='done'?'Your finished pictures will live here. Pick a picture and make it yours.':view==='progress'?'A fresh canvas is waiting. Start a picture in Discover.':'No pictures in this category yet.';
    showSave();
  }
  function openArt(id,again=false){
    if(art)flush();
    const found=catalog().find(a=>a.id===id);if(!found)return;
    overviewKey='';libraryScroll=window.scrollY;art=found;replay=again;filled=again?new Set():C.cells(art,state.works[id]);
    activeHint=-1;keyboardCell=-1;state.lastArtwork=id;tool='paint';
    selected=art.grid.flat().find((n,i)=>!filled.has(i)) || art.grid[0][0];
    $('art-title').textContent=art.title;$('library').hidden=true;$('studio').hidden=false;document.body.style.overflow='hidden';
    document.querySelectorAll('[data-tool]').forEach(b=>{b.classList.toggle('active',b.dataset.tool===tool);b.setAttribute('aria-pressed',String(b.dataset.tool===tool));});
    resize(true);renderPalette();updateProgress();save();
    if(base<12 && filled.size<total(art))notify('Pinch or tap + to see the numbers up close.');
    if(filled.size===total(art))showCompletion();
  }
  function back(){flush();$('complete-dialog').close();$('studio').hidden=true;$('library').hidden=false;document.body.style.overflow='';art=null;renderLibrary();window.scrollTo(0,libraryScroll);if(new URLSearchParams(location.search).get('manage')==='1')window.openArtworkManager?.();}
  function resize(fit=false){
    if(!art||$('studio').hidden)return;
    const rect=$('canvas-wrap').getBoundingClientRect();if(!rect.width||!rect.height)return;
    const oldW=w,oldH=h;w=rect.width;h=rect.height;dpr=Math.min(window.devicePixelRatio||1,3);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    base=Math.min((w-32)/art.cols,(h-80)/art.rows);
    if(fit||!oldW||!oldH)fitCanvas();else{ox+=(w-oldW)/2;oy+=(h-oldH)/2;clampCamera();requestDraw();}
  }
  function fitCanvas(){scale=1;ox=(w-art.cols*base)/2;oy=(h-56-art.rows*base)/2;requestDraw();}
  function clampCamera(){const cw=art.cols*base*scale,ch=art.rows*base*scale,available=h-56;ox=cw<w?(w-cw)/2:Math.max(w-cw-30,Math.min(30,ox));oy=ch<available?(available-ch)/2:Math.max(available-ch-16,Math.min(16,oy));}
  function zoom(factor,x=w/2,y=h/2){const next=Math.max(1,Math.min(Math.max(12,32/base),scale*factor)),ratio=next/scale;ox=x-(x-ox)*ratio;oy=y-(y-oy)*ratio;scale=next;clampCamera();requestDraw();}
  function requestDraw(){if(!renderFrame)renderFrame=requestAnimationFrame(()=>{renderFrame=0;draw();});}
  function draw(){
    if(!art)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const s=base*scale;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 '+Math.max(6,Math.min(19,s*.40))+'px -apple-system,system-ui,sans-serif';
    if(s<4&&total(art)>10000){
      const key=art.id+':'+filled.size+':'+selected;
      if(key!==overviewKey){overview=document.createElement('canvas');overview.width=art.cols;overview.height=art.rows;const oc=overview.getContext('2d'),im=oc.createImageData(art.cols,art.rows),colors={};
        for(const [n,hex] of Object.entries(art.colors))colors[n]=hex.match(/[a-f0-9]{2}/gi).map(v=>parseInt(v,16));
        for(let i=0;i<total(art);i++){const n=art.grid[Math.floor(i/art.cols)][i%art.cols],rgb=filled.has(i)?colors[n]:n===selected?[239,208,217]:[252,248,244];im.data.set([...rgb,255],i*4);}oc.putImageData(im,0,0);overviewKey=key;
      }
      ctx.imageSmoothingEnabled=false;ctx.drawImage(overview,ox,oy,art.cols*s,art.rows*s);$('zoom-label').textContent=Math.round(scale*100)+'%';return;
    }
    for(let r=Math.max(0,Math.floor(-oy/s));r<Math.min(art.rows,Math.ceil((h-oy)/s));r++)for(let c=Math.max(0,Math.floor(-ox/s));c<Math.min(art.cols,Math.ceil((w-ox)/s));c++){
      const i=r*art.cols+c,n=art.grid[r][c],painted=filled.has(i),x=ox+c*s,y=oy+r*s;
      ctx.fillStyle=painted?art.colors[n]:n===selected?'#efd0d9':'#fcf8f4';ctx.fillRect(x,y,s+.3,s+.3);
      if(!painted){ctx.strokeStyle=n===selected?'#bd869933':'#b8a6a233';ctx.lineWidth=.6;ctx.strokeRect(x,y,s,s);if(s>=7){ctx.fillStyle=n===selected?'#794352':'#9d9291';ctx.fillText(n,x+s/2,y+s/2+.5);}}
      if(i===activeHint||i===keyboardCell){ctx.strokeStyle='#8e294c';ctx.lineWidth=2.5;ctx.strokeRect(x+2,y+2,s-4,s-4);}
    }
    $('zoom-label').textContent=Math.round(scale*100)+'%';
  }
  function contrast(hex){const rgb=hex.match(/[a-f0-9]{2}/gi).map(n=>parseInt(n,16));return rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>155?'#39232b':'#ffffff';}
  function remaining(n){return art.grid.flat().reduce((sum,v,i)=>sum+(v===n&&!filled.has(i)?1:0),0);}
  function renderPalette(){
    if(!art)return;
    const counts={};for(let r=0;r<art.rows;r++)for(let c=0;c<art.cols;c++){const n=art.grid[r][c];if(!filled.has(r*art.cols+c))counts[n]=(counts[n]||0)+1;}
    const scroll=$('palette').scrollLeft,focus=document.activeElement?.dataset.color;
    $('palette').replaceChildren();
    [...new Set(art.grid.flat())].sort((a,b)=>a-b).forEach(n=>{
      const left=counts[n]||0,b=document.createElement('button');b.className='swatch'+(n===selected?' selected':'')+(!left?' finished':'');b.dataset.color=n;b.style.background=art.colors[n];b.style.color=contrast(art.colors[n]);
      b.textContent=left?n:'✓';b.setAttribute('aria-label','Color '+n+', '+left+' squares remaining');b.setAttribute('aria-pressed',String(n===selected));
      if(left){const count=document.createElement('small');count.textContent=left>=1000?(left/1000).toFixed(left>=10000?0:1)+'k':left; b.append(count);}
      b.onclick=()=>{selected=n;activeHint=-1;renderPalette();updateProgress();requestDraw();};$('palette').append(b);
    });
    $('palette').scrollLeft=scroll;
    if(focus)$('palette').querySelector('[data-color="'+focus+'"]')?.focus({preventScroll:true});
  }
  function updateProgress(){if(!art)return;const pct=Math.round(filled.size/total(art)*100);$('percent').textContent=pct+'%';$('progress-fill').style.width=pct+'%';$('paint-label').textContent=replay?'COLORING AGAIN · JUST FOR YOU':filled.size===total(art)?'EVERY LITTLE SQUARE, YOURS':'MAKE A LITTLE PROGRESS';$('color-instruction').textContent='COLOR '+selected;$('remaining').textContent=remaining(selected).toLocaleString()+' squares left';}
  function position(e){const rect=canvas.getBoundingClientRect();return {x:e.clientX-rect.left,y:e.clientY-rect.top};}
  function at(p){const s=base*scale,c=Math.floor((p.x-ox)/s),r=Math.floor((p.y-oy)/s);return c>=0&&c<art.cols&&r>=0&&r<art.rows?r*art.cols+c:-1;}
  function paint(i,region=false,defer=false){
    if(!art||i<0||filled.has(i)||art.grid[Math.floor(i/art.cols)][i%art.cols]!==selected)return false;
    const todo=[i];let changed=false;
    while(todo.length){const n=todo.pop();if(filled.has(n)||art.grid[Math.floor(n/art.cols)][n%art.cols]!==selected)continue;filled.add(n);changed=true;if(region){const r=Math.floor(n/art.cols),c=n%art.cols;if(c)todo.push(n-1);if(c<art.cols-1)todo.push(n+1);if(r)todo.push(n-art.cols);if(r<art.rows-1)todo.push(n+art.cols);}}
    if(changed&&!defer){activeHint=-1;record();renderPalette();updateProgress();requestDraw();}return changed;
  }
  function record(){
    if(!replay){const old=state.works[art.id];state.works[art.id]={filled:[...filled].sort((a,b)=>a-b),updatedAt:Date.now(),completedAt:filled.size===total(art)?old?.completedAt||Date.now():null,rewarded:!!old?.rewarded};save();}
    if(filled.size===total(art)){flush();showCompletion();}
  }
  function nextColor(){
    if(!art||remaining(selected)>0)return;
    const next=art.grid.flat().find((n,i)=>!filled.has(i));if(next){selected=next;renderPalette();updateProgress();$('palette').querySelector('[data-color="'+next+'"]')?.scrollIntoView({block:'nearest',inline:'center'});requestDraw();}
  }
  function line(a,b){const distance=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.ceil(distance/Math.max(1,base*scale/3));let changed=false;for(let i=0;i<=steps;i++)changed=paint(at({x:a.x+(b.x-a.x)*i/Math.max(1,steps),y:a.y+(b.y-a.y)*i/Math.max(1,steps)}),false,true)||changed;if(changed){activeHint=-1;record();renderPalette();updateProgress();requestDraw();}}

  canvas.addEventListener('pointerdown',e=>{
    if(!art||e.button>0)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);const p=position(e);pointers.set(e.pointerId,p);
    if(pointers.size===2){pinching=true;const [a,b]=[...pointers.values()];gesture={distance:Math.hypot(a.x-b.x,a.y-b.y),mid:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}};}
    else if(pointers.size===1){gesture={start:p,last:p,moved:false,mode:tool};pinching=false;}
  });
  canvas.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId)||!gesture)return;e.preventDefault();const p=position(e);pointers.set(e.pointerId,p);
    if(pointers.size>=2){const[a,b]=[...pointers.values()];const dist=Math.hypot(a.x-b.x,a.y-b.y),mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};if(gesture.distance>0)zoom(dist/gesture.distance,gesture.mid.x,gesture.mid.y);ox+=mid.x-gesture.mid.x;oy+=mid.y-gesture.mid.y;clampCamera();gesture={distance:dist,mid};requestDraw();return;}
    if(pinching)return;
    if(Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)>4)gesture.moved=true;
    if(gesture.moved){if(gesture.mode==='pan'){ox+=p.x-gesture.last.x;oy+=p.y-gesture.last.y;clampCamera();requestDraw();}else if(gesture.mode==='paint'){line(gesture.last,p);}gesture.last=p;}
  });
  function endPointer(e,cancelled=false){
    if(!pointers.has(e.pointerId))return;
    if(!cancelled&&!pinching&&gesture&&!gesture.moved){const i=at(position(e));if(gesture.mode!=='pan'&&!paint(i,gesture.mode==='fill')&&i>=0&&!filled.has(i))notify('Match this square’s number to your color.');}
    pointers.delete(e.pointerId);if(!pointers.size){gesture=null;pinching=false;nextColor();}
  }
  canvas.addEventListener('pointerup',e=>endPointer(e));canvas.addEventListener('pointercancel',e=>endPointer(e,true));
  canvas.addEventListener('lostpointercapture',e=>{if(pointers.has(e.pointerId))endPointer(e,true);});
  canvas.addEventListener('wheel',e=>{e.preventDefault();const p=position(e);zoom(Math.exp(-e.deltaY*.002),p.x,p.y);},{passive:false});
  canvas.addEventListener('keydown',e=>{
    if(!art)return;const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-art.cols,ArrowDown:art.cols}[e.key];
    if(delta!==undefined){e.preventDefault();keyboardCell=Math.max(0,Math.min(total(art)-1,(keyboardCell<0?0:keyboardCell)+delta));centerCell(keyboardCell);}
    else if(e.key===' '||e.key==='Enter'){e.preventDefault();if(keyboardCell<0)keyboardCell=0;paint(keyboardCell,tool==='fill');nextColor();}
    else if(e.key==='+')zoom(1.4);else if(e.key==='-')zoom(1/1.4);
  });
  function centerCell(i){const s=base*scale;ox=w/2-(i%art.cols+.5)*s;oy=(h-56)/2-(Math.floor(i/art.cols)+.5)*s;clampCamera();requestDraw();}
  function updateReward(){const work=state.works[art.id];$('reward-note').textContent=replay?'A little time, well spent.':work?.rewarded?'Completed · Heartly reward collected':parentBridge()?'+'+C.reward(art)+' points · waiting for cloud sync':'Open through Heartly to collect '+C.reward(art)+' points';}
  function showCompletion(){if(!art)return;preview($('completed-preview'),art);$('complete-title').textContent=art.title;updateReward();if(!$('complete-dialog').open)$('complete-dialog').showModal();}
  $('hint').onclick=()=>{nextColor();const i=art.grid.flat().findIndex((n,i)=>n===selected&&!filled.has(i));if(i<0){notify('This color is finished.');return;}scale=Math.max(scale,Math.max(12,28/base));activeHint=i;centerCell(i);};
  $('fit').onclick=fitCanvas;$('zoom-in').onclick=()=>zoom(1.5);$('zoom-out').onclick=()=>zoom(1/1.5);
  document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{tool=b.dataset.tool;document.querySelectorAll('[data-tool]').forEach(t=>{t.classList.toggle('active',t===b);t.setAttribute('aria-pressed',String(t===b));});});
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(t=>{t.classList.toggle('active',t===b);t.setAttribute('aria-pressed',String(t===b));});renderLibrary();});
  $('picture-search').oninput=renderLibrary;
  $('back').onclick=back;$('complete-library').onclick=back;
  $('exit').onclick=()=>{flush();const p=parentBridge();if(p&&typeof p.closePixelArt==='function')p.closePixelArt();else window.location.href='../index.html';};
  $('help').onclick=$('studio-help').onclick=()=>$('help-dialog').showModal();
  document.querySelectorAll('.dialog-close').forEach(b=>b.onclick=()=>$('help-dialog').close());
  $('replay').onclick=()=>{const id=art.id;$('complete-dialog').close();openArt(id,true);};
  $('download').onclick=()=>{const c=document.createElement('canvas');preview(c,art,null,Math.max(1,Math.floor(1024/Math.max(art.cols,art.rows))));c.toBlob(blob=>{if(!blob){notify('Picture could not be exported.');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=art.title.replace(/[^a-z0-9-]/gi,'-')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);},'image/png');};
  window.PixelLibrary={
    list:()=>Object.values(C.normalize(state).custom),
    save(a){const valid=C.artwork(a);if(!valid||!valid.id.startsWith('custom_'))throw Error('Invalid artwork.');if(state.deleted[valid.id])throw Error('This artwork was deleted on another device.');if(!state.custom[valid.id]&&Object.keys(state.custom).length>=60)throw Error('Your collection is full. Delete a picture before adding another.');valid.updatedAt=Math.max(Date.now(),(state.custom[valid.id]?.updatedAt||0)+1);state.custom[valid.id]=valid;save();renderLibrary();return C.artwork(valid);},
    remove(id){state.deleted[id]=Date.now();delete state.custom[id];flush();renderLibrary();},
    play:openArt,flush,preview,notify,status:syncLabel
  };
  window.devImportArtwork=async(file,opts,callback)=>{try{const a=await window.PixelImport(file,opts);if(Object.keys(state.custom).length>=60)throw new Error('The collection has reached 60 custom pictures.');state.custom[a.id]=a;flush();renderLibrary();callback?.(true,a.title);}catch(e){callback?.(false,e.message);}};
  window.devListArtworks=()=>Object.values(state.custom).map(a=>({id:a.id,title:a.title,cols:a.cols,rows:a.rows,colors:Object.keys(a.colors).length}));
  window.devRemoveArtwork=id=>{state.deleted[id]=Date.now();delete state.custom[id];flush();renderLibrary();};
  window.addEventListener('pagehide',flush);document.addEventListener('visibilitychange',()=>{if(document.hidden)flush();});
  window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){try{window.receiveHeartlyPixelState(JSON.parse(e.newValue));}catch(_){}}});
  new ResizeObserver(()=>resize()).observe($('canvas-wrap'));
  const p=parentBridge();if(p)state=C.merge(state,p.getPixelArtState());
  renderLibrary();flush();
})();
