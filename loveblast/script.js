
// ══════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════
const PIECE_COLORS = [
  {bg:'#d44010',hi:'#f07040',sh:'#802010'},
  {bg:'#b81830',hi:'#e05060',sh:'#700010'},
  {bg:'#0e9820',hi:'#40cc50',sh:'#086010'},
  {bg:'#1030b0',hi:'#3060d8',sh:'#0820708'},
  {bg:'#7010a0',hi:'#a040d0',sh:'#440060'},
  {bg:'#10a0d0',hi:'#40c8f0',sh:'#087090'},
  {bg:'#c03080',hi:'#e060a8',sh:'#801050'},
];
// Flat colors for canvas — top/left/right/bottom for 3D bevel
function mkColor(hex){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  const li=(r2,g2,b2)=>`rgb(${Math.min(255,r2)},${Math.min(255,g2)},${Math.min(255,b2)})`;
  return{
    bg:hex,
    top:li(r+80,g+60,b+60),
    left:li(r+40,g+30,b+30),
    right:li(r-40,g-35,b-35),
    bot:li(r-70,g-60,b-60),
  };
}
const COLORS = PIECE_COLORS.map(p=>mkColor(p.bg));
const EMPTY  = {bg:'#110e1c',top:'#1a1628',left:'#0e0c18',right:'#0b0910',bot:'#080710'};
const HOVER_OK  = {bg:'rgba(224,85,120,.22)',top:'rgba(255,140,170,.4)',left:'rgba(200,70,100,.2)',right:'rgba(160,40,80,.15)',bot:'rgba(120,20,60,.1)'};
const HOVER_BAD = {bg:'rgba(255,50,50,.15)',top:'rgba(255,90,90,.25)',left:'rgba(220,40,40,.13)',right:'rgba(180,30,30,.1)',bot:'rgba(140,20,20,.07)'};
const BREAK_C   = {bg:'rgba(255,255,255,.95)',top:'#fff',left:'rgba(255,255,255,.8)',right:'rgba(255,255,255,.6)',bot:'rgba(255,255,255,.4)'};

const PIECES=[
  [[1,0,0],[1,1,1]],[[1,1],[1,0],[1,0]],[[1,1,1],[0,0,1]],[[0,1],[0,1],[1,1]],
  [[0,0,1],[1,1,1]],[[1,0],[1,0],[1,1]],[[1,1,1],[1,0,0]],[[1,1],[0,1],[0,1]],
  [[1,1,1],[0,1,0]],[[1,0],[1,1],[1,0]],[[0,1,0],[1,1,1]],[[0,1],[1,1],[0,1]],
  [[0,1,1],[1,1,0]],[[1,0],[1,1],[0,1]],[[1,1,0],[0,1,1]],[[0,1],[1,1],[1,0]],
  [[1,1,1],[1,1,1],[1,1,1]],[[1,1],[1,1]],
  [[1],[1],[1],[1]],[[1,1,1,1]],
  [[1],[1],[1]],[[1,1,1]],
  [[1],[1]],[[1,1]],
  [[1]],
];
const WEIGHTS=[2,2,2,2,2,2,2,2,1.5,1.5,1.5,1.5,1,1,1,1,2,5,2,2,4,4,3,3,8];
const TOTAL_W=WEIGHTS.reduce((a,b)=>a+b,0);

// ══════════════════════════════════════════
// STATE
// ══════════════════════════════════════════
let mode='classic',boardSize=8,handSize=3;
let board,hand,score,combo,lastBrokenLine;
let best={classic:0,chaos:0};
let BS=38,isAnimating=false;

// drag
let drag=null,hoverCell=null,canPlace=false;

// elements
const gridCanvas=document.getElementById('grid-canvas');
const gc=gridCanvas.getContext('2d');
const flashCanvas=document.getElementById('flash-canvas');
const fc=flashCanvas.getContext('2d');
const ghostCanvas=document.getElementById('ghost-canvas');
const ghc=ghostCanvas.getContext('2d');

// ══════════════════════════════════════════
// ANIMATED BACKGROUND (subtle floating orbs)
// ══════════════════════════════════════════
(function(){
  const bgc=document.getElementById('bg-canvas');
  const bx=bgc.getContext('2d');
  function resizeBg(){bgc.width=window.innerWidth;bgc.height=window.innerHeight}
  resizeBg();
  window.addEventListener('resize',resizeBg);
  const orbs=[
    {x:.2,y:.15,r:.28,c:'rgba(224,85,120,.07)',vx:.0002,vy:.0003},
    {x:.8,y:.7, r:.32,c:'rgba(160,32,80,.06)', vx:-.0003,vy:.0002},
    {x:.5,y:.5, r:.2, c:'rgba(224,85,120,.04)',vx:.0001,vy:-.0002},
  ];
  let t=0;
  function draw(){
    bx.clearRect(0,0,bgc.width,bgc.height);
    orbs.forEach(o=>{
      const x=(o.x+Math.sin(t*o.vx*100)*0.06)*bgc.width;
      const y=(o.y+Math.cos(t*o.vy*100)*0.06)*bgc.height;
      const r=o.r*Math.min(bgc.width,bgc.height);
      const g=bx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,o.c);g.addColorStop(1,'transparent');
      bx.fillStyle=g;bx.beginPath();bx.arc(x,y,r,0,Math.PI*2);bx.fill();
    });
    t++;requestAnimationFrame(draw);
  }
  draw();
})();

// ══════════════════════════════════════════
// RESIZE
// ══════════════════════════════════════════
function resize(){
  const hdrH=document.getElementById('hdr').offsetHeight;
  const comboH=document.getElementById('combo-bar').offsetHeight;
  const handH=document.getElementById('hand-wrap').offsetHeight||110;
  const avail=Math.min(window.innerWidth-24,window.innerHeight-hdrH-comboH-handH-24);
  BS=Math.floor(avail/boardSize);
  const sz=BS*boardSize;
  gridCanvas.width=sz;gridCanvas.height=sz;
  gridCanvas.style.width=sz+'px';gridCanvas.style.height=sz+'px';
  flashCanvas.width=sz;flashCanvas.height=sz;
  flashCanvas.style.width=sz+'px';flashCanvas.style.height=sz+'px';
  drawBoard();renderHand();
}

// ══════════════════════════════════════════
// DRAWING
// ══════════════════════════════════════════
function drawBlock(ctx,x,y,c,sz,radius){
  sz=sz||BS;radius=radius||Math.max(2,Math.floor(sz*.12));
  const bw=Math.max(2,Math.floor(sz*.13));
  // Rounded fill
  ctx.fillStyle=c.bg;
  roundRect(ctx,x,y,sz,sz,radius);
  ctx.fill();
  // Bevel top
  ctx.fillStyle=c.top;roundRect(ctx,x,y,sz,bw,radius,true);ctx.fill();
  // Bevel left
  ctx.fillStyle=c.left;roundRect(ctx,x,y,bw,sz,radius,true);ctx.fill();
  // Bevel right
  ctx.fillStyle=c.right;roundRect(ctx,x+sz-bw,y,bw,sz,radius,true);ctx.fill();
  // Bevel bottom
  ctx.fillStyle=c.bot;roundRect(ctx,x,y+sz-bw,sz,bw,radius,true);ctx.fill();
  // Inner shine
  const shine=ctx.createLinearGradient(x,y,x,y+sz*.4);
  shine.addColorStop(0,'rgba(255,255,255,.14)');
  shine.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=shine;
  roundRect(ctx,x+bw,y+bw,sz-bw*2,sz*.35,Math.max(1,radius-2),true);
  ctx.fill();
}

function roundRect(ctx,x,y,w,h,r,noPath){
  r=Math.min(r,w/2,h/2);
  if(!noPath)ctx.beginPath();
  else ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}

function drawBoard(){
  if(!board)return;
  gc.clearRect(0,0,gridCanvas.width,gridCanvas.height);
  const gap=1;
  const bsz=BS-gap;

  let foot={},breakR=new Set(),breakC=new Set();
  if(drag&&hoverCell){
    const m=drag.piece.matrix,ox=hoverCell.x,oy=hoverCell.y;
    canPlace=true;
    for(let r=0;r<m.length;r++)
      for(let c=0;c<m[r].length;c++){
        if(!m[r][c])continue;
        const bx=ox+c,by=oy+r;
        if(bx<0||bx>=boardSize||by<0||by>=boardSize||board[by][bx])canPlace=false;
        foot[by+'_'+bx]=true;
      }
    if(canPlace){
      let tb=board.map(r=>[...r]);
      for(let r=0;r<m.length;r++)for(let c=0;c<m[r].length;c++)if(m[r][c])tb[oy+r][ox+c]='p';
      for(let r=0;r<boardSize;r++)if(tb[r].every(c=>c))breakR.add(r);
      for(let c=0;c<boardSize;c++)if(tb.every(r=>r[c]))breakC.add(c);
    }
  }

  for(let r=0;r<boardSize;r++){
    for(let c=0;c<boardSize;c++){
      const px=c*BS+gap/2,py=r*BS+gap/2,key=r+'_'+c;
      const inBreak=breakR.has(r)||breakC.has(c);
      if(board[r][c])drawBlock(gc,px,py,inBreak?BREAK_C:board[r][c],bsz);
      else if(foot[key])drawBlock(gc,px,py,inBreak?BREAK_C:(canPlace?HOVER_OK:HOVER_BAD),bsz);
      else drawBlock(gc,px,py,EMPTY,bsz);
    }
  }
}

function drawPiece(ctx,matrix,color,sz,ox,oy){
  ox=ox||0;oy=oy||0;
  const gap=1,bsz=sz-gap;
  for(let r=0;r<matrix.length;r++)
    for(let c=0;c<matrix[r].length;c++)
      if(matrix[r][c])drawBlock(ctx,ox+c*sz+gap/2,oy+r*sz+gap/2,color,bsz);
}

function renderHand(){
  const hw=document.getElementById('hand-wrap');
  for(let i=0;i<handSize;i++){
    let slot=document.getElementById('slot-'+i);
    if(!slot)continue;
    const p=hand[i];
    if(!p){slot.classList.add('empty');continue;}
    slot.classList.remove('empty','dragging');
    let pc=document.getElementById('pc-'+i);
    if(!pc){pc=document.createElement('canvas');pc.id='pc-'+i;slot.appendChild(pc);}
    const slotSz=slot.offsetWidth||96;
    const pbs=Math.min(28,Math.floor((slotSz-16)/Math.max(p.matrix.length,p.matrix[0].length)));
    const pw=p.matrix[0].length*pbs,ph=p.matrix.length*pbs;
    pc.width=pw;pc.height=ph;
    pc.style.width=pw+'px';pc.style.height=ph+'px';
    pc.style.display='block';
    const ctx=pc.getContext('2d');
    ctx.clearRect(0,0,pw,ph);
    drawPiece(ctx,p.matrix,p.color,pbs);
    // Highlight slots that can be placed
    slot.classList.toggle('highlight',canAnyFit(p.matrix));
  }
}

// ══════════════════════════════════════════
// GAME LOGIC
// ══════════════════════════════════════════
function rndPiece(){
  let r=Math.random()*TOTAL_W;
  for(let i=0;i<PIECES.length;i++){
    r-=WEIGHTS[i];
    if(r<0)return{matrix:PIECES[i],color:COLORS[Math.floor(Math.random()*COLORS.length)]};
  }
  return{matrix:PIECES[0],color:COLORS[0]};
}

function fillHand(){
  for(let i=0;i<handSize;i++)if(hand[i]===null)hand[i]=rndPiece();
  renderHand();
  checkGameOver();
}

function canFit(matrix,gx,gy){
  for(let r=0;r<matrix.length;r++)
    for(let c=0;c<matrix[r].length;c++)
      if(matrix[r][c]){
        const bx=gx+c,by=gy+r;
        if(bx<0||bx>=boardSize||by<0||by>=boardSize)return false;
        if(board[by][bx])return false;
      }
  return true;
}

function canAnyFit(matrix){
  for(let gy=0;gy<boardSize;gy++)
    for(let gx=0;gx<boardSize;gx++)
      if(canFit(matrix,gx,gy))return true;
  return false;
}

function anyMoveExists(){
  for(let i=0;i<handSize;i++){
    if(!hand[i])continue;
    if(canAnyFit(hand[i].matrix))return true;
  }
  return false;
}

function checkGameOver(){
  if(isAnimating)return;
  if(!anyMoveExists())setTimeout(doGameOver,400);
}

function placePiece(slotIdx,gx,gy){
  const p=hand[slotIdx];
  if(!p)return false;
  const m=p.matrix;
  for(let r=0;r<m.length;r++)
    for(let c=0;c<m[r].length;c++)
      if(m[r][c]){
        const bx=gx+c,by=gy+r;
        if(bx<0||bx>=boardSize||by<0||by>=boardSize||board[by][bx])return false;
      }
  // Place
  let blocks=0;
  for(let r=0;r<m.length;r++)
    for(let c=0;c<m[r].length;c++)
      if(m[r][c]){board[gy+r][gx+c]=p.color;blocks++;}

  // Find lines
  let clearR=[],clearC=[];
  for(let r=0;r<boardSize;r++)if(board[r].every(c=>c))clearR.push(r);
  for(let c=0;c<boardSize;c++)if(board.every(r=>r[c]))clearC.push(c);
  const lines=clearR.length+clearC.length;

  // Score
  let pts=blocks;
  if(lines>0){
    lastBrokenLine=0;combo+=lines;
    pts+=Math.round(lines*boardSize*Math.max(1,combo/2)*blocks);
    updateCombo(combo);
  } else {
    lastBrokenLine++;
    if(lastBrokenLine>=handSize){combo=0;updateCombo(0);}
  }
  pts=Math.round(pts);
  addScore(pts);
  showScoreFloat(pts,gx,gy);

  hand[slotIdx]=null;

  if(lines>0){
    isAnimating=true;
    // Draw board with break highlight
    drawBoard();
    // Flash overlay
    flashLines(clearR,clearC,()=>{
      for(let r of clearR)board[r]=Array(boardSize).fill(null);
      for(let col of clearC)board.forEach(r=>r[col]=null);
      spawnParticles(clearR,clearC);
      isAnimating=false;
      drawBoard();
      if(hand.every(p=>p===null))fillHand();
      else{renderHand();checkGameOver();}
    });
  } else {
    drawBoard();
    if(hand.every(p=>p===null))fillHand();
    else{renderHand();checkGameOver();}
  }
  return true;
}

function flashLines(rows,cols,cb){
  let t=0;
  const FPS=3,frames=FPS;
  fc.clearRect(0,0,flashCanvas.width,flashCanvas.height);
  flashCanvas.style.opacity='1';
  function frame(){
    fc.clearRect(0,0,flashCanvas.width,flashCanvas.height);
    const alpha=0.85*(1-t/frames);
    fc.fillStyle=`rgba(255,255,255,${alpha})`;
    rows.forEach(r=>fc.fillRect(0,r*BS,flashCanvas.width,BS));
    cols.forEach(c=>fc.fillRect(c*BS,0,BS,flashCanvas.height));
    t++;
    if(t<=frames)requestAnimationFrame(frame);
    else{flashCanvas.style.opacity='0';fc.clearRect(0,0,flashCanvas.width,flashCanvas.height);cb();}
  }
  frame();
}

function spawnParticles(rows,cols){
  const gr=gridCanvas.getBoundingClientRect();
  const positions=new Set();
  rows.forEach(r=>cols.forEach(c=>positions.add(r+'_'+c)));
  rows.forEach(r=>{for(let c=0;c<boardSize;c+=2)positions.add(r+'_'+c);});
  cols.forEach(c=>{for(let r=0;r<boardSize;r+=2)positions.add(r+'_'+c);});
  let count=0;
  positions.forEach(key=>{
    if(count>20)return;count++;
    const [r,c]=key.split('_').map(Number);
    const px=gr.left+c*BS+BS/2,py=gr.top+r*BS+BS/2;
    const hues=['#e05578','#f5c870','#6ee8b4','#c8a8f0'];
    for(let i=0;i<3;i++){
      const el=document.createElement('div');
      el.className='particle';
      const angle=Math.random()*Math.PI*2;
      const dist=30+Math.random()*50;
      el.style.cssText=`left:${px}px;top:${py}px;background:${hues[Math.floor(Math.random()*hues.length)]};--tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist-40}px;--dur:${0.5+Math.random()*.4}s;width:${4+Math.random()*5}px;height:${4+Math.random()*5}px`;
      document.body.appendChild(el);
      setTimeout(()=>el.remove(),(0.5+.4)*1000+100);
    }
  });
}

// ══════════════════════════════════════════
// UI HELPERS
// ══════════════════════════════════════════
function addScore(pts){
  score+=pts;
  const el=document.getElementById('score-val');
  el.textContent=score.toLocaleString();
  el.classList.remove('bump');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{el.classList.add('bump');setTimeout(()=>el.classList.remove('bump'),200);}));
}

function updateCombo(c){
  const pill=document.getElementById('combo-pill');
  const txt=document.getElementById('combo-txt');
  const ico=document.getElementById('combo-ico');
  if(c>1){
    txt.textContent='COMBO ×'+c;
    ico.textContent=c>=5?'🔥':c>=3?'💕':'💗';
    pill.classList.add('show');
  } else {
    pill.classList.remove('show');
  }
}

function showScoreFloat(pts,gx,gy){
  const el=document.createElement('div');
  el.className='score-float';
  el.textContent='+'+pts.toLocaleString();
  const gr=gridCanvas.getBoundingClientRect();
  const x=gr.left+(gx+(drag?drag.piece.matrix[0].length/2:0))*BS;
  const y=gr.top+(gy+(drag?drag.piece.matrix.length/2:0))*BS;
  el.style.left=(x-20)+'px';
  el.style.top=(y-10)+'px';
  el.style.color=pts>200?'#ffd050':pts>50?'#ff9fc0':'#fff';
  el.style.fontSize=pts>200?'22px':pts>50?'18px':'14px';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),1000);
}

// ══════════════════════════════════════════
// DRAG
// ══════════════════════════════════════════
function startDrag(idx,cx,cy){
  const p=hand[idx];
  if(!p||isAnimating)return;
  drag={slotIdx:idx,piece:p};
  const gw=p.matrix[0].length*BS,gh=p.matrix.length*BS;
  ghostCanvas.width=gw;ghostCanvas.height=gh;
  ghostCanvas.style.width=gw+'px';ghostCanvas.style.height=gh+'px';
  ghc.clearRect(0,0,gw,gh);
  drawPiece(ghc,p.matrix,p.color,BS);
  document.getElementById('drag-ghost').style.display='block';
  document.getElementById('slot-'+idx).classList.add('dragging');
  moveDrag(cx,cy);
}

function moveDrag(cx,cy){
  if(!drag)return;
  const p=drag.piece;
  const gw=p.matrix[0].length*BS,gh=p.matrix.length*BS;
  const ghost=document.getElementById('drag-ghost');
  // Offset piece up so finger doesn't cover it
  const offY=40;
  ghost.style.left=(cx-gw/2)+'px';
  ghost.style.top=(cy-gh/2-offY)+'px';

  const gr=gridCanvas.getBoundingClientRect();
  const relX=(cx-gw/2)-gr.left;
  const relY=(cy-offY-gh/2)-gr.top;
  const nx=Math.round(relX/BS),ny=Math.round(relY/BS);
  if(!hoverCell||hoverCell.x!==nx||hoverCell.y!==ny){
    hoverCell={x:nx,y:ny};
    drawBoard();
    renderHand(); // update highlights
  }
}

function endDrag(cx,cy){
  if(!drag)return;
  document.getElementById('drag-ghost').style.display='none';
  const slot=document.getElementById('slot-'+drag.slotIdx);
  if(slot)slot.classList.remove('dragging');

  if(hoverCell&&canPlace){
    placePiece(drag.slotIdx,hoverCell.x,hoverCell.y);
  }
  drag=null;hoverCell=null;canPlace=false;
  drawBoard();renderHand();
}

// Touch
document.addEventListener('touchstart',e=>{
  const slot=e.target.closest('.piece-slot');
  if(!slot)return;
  const idx=parseInt(slot.id.replace('slot-',''));
  if(isNaN(idx)||!hand[idx])return;
  e.preventDefault();
  const t=e.touches[0];
  startDrag(idx,t.clientX,t.clientY);
},{passive:false});
document.addEventListener('touchmove',e=>{
  if(!drag)return;
  e.preventDefault();
  moveDrag(e.touches[0].clientX,e.touches[0].clientY);
},{passive:false});
document.addEventListener('touchend',e=>{
  if(!drag)return;
  e.preventDefault();
  endDrag(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
},{passive:false});

// Mouse
document.addEventListener('mousedown',e=>{
  const slot=e.target.closest('.piece-slot');
  if(!slot)return;
  const idx=parseInt(slot.id.replace('slot-',''));
  if(isNaN(idx)||!hand[idx])return;
  startDrag(idx,e.clientX,e.clientY);
});
document.addEventListener('mousemove',e=>{if(drag)moveDrag(e.clientX,e.clientY);});
document.addEventListener('mouseup',e=>{if(drag)endDrag(e.clientX,e.clientY);});

// ══════════════════════════════════════════
// GAME FLOW
// ══════════════════════════════════════════
function selectMode(m){
  mode=m;
  document.getElementById('mc-classic').classList.toggle('on',m==='classic');
  document.getElementById('mc-chaos').classList.toggle('on',m==='chaos');
  const b=best[m];
  document.getElementById('menu-best').textContent=b>0?'🏆 Best: '+b.toLocaleString():'';
}

function showMenu(){
  document.getElementById('ov-menu').classList.remove('hidden');
  document.getElementById('ov-gameover').classList.add('hidden');
  selectMode(mode);
}

function startGame(){
  boardSize=mode==='chaos'?10:8;
  handSize=mode==='chaos'?5:3;
  board=Array.from({length:boardSize},()=>Array(boardSize).fill(null));
  hand=Array(handSize).fill(null);
  score=0;combo=0;lastBrokenLine=0;isAnimating=false;

  document.getElementById('score-val').textContent='0';
  document.getElementById('mode-badge').textContent=mode==='chaos'?'Chaos Mode':'Classic Mode';
  updateCombo(0);
  document.getElementById('ov-menu').classList.add('hidden');
  document.getElementById('ov-gameover').classList.add('hidden');

  // Rebuild slots
  const hw=document.getElementById('hand-wrap');
  hw.innerHTML='';
  for(let i=0;i<handSize;i++){
    const slot=document.createElement('div');
    slot.className='piece-slot';slot.id='slot-'+i;
    hw.appendChild(slot);
  }

  resize();
  fillHand();
}

function doGameOver(){
  if(isAnimating)return;
  const isNew=score>best[mode];
  if(isNew)best[mode]=score;
  document.getElementById('go-score').textContent=score.toLocaleString();
  document.getElementById('go-best-ico').textContent=isNew?'🏆':'📊';
  document.getElementById('go-best-txt').textContent=isNew?'New Best Score!':'Best: '+best[mode].toLocaleString();
  document.getElementById('ov-gameover').classList.remove('hidden');
}

window.addEventListener('resize',()=>{if(board)resize();});

// ── LOADING SCREEN ──
(function(){
  const bar = document.getElementById('loading-bar');
  let w = 0;
  const iv = setInterval(() => {
    w += Math.random() * 25 + 10;
    bar.style.width = Math.min(w, 95) + '%';
    if (w >= 95) {
      clearInterval(iv);
      setTimeout(() => {
        bar.style.width = '100%';
        setTimeout(() => {
          document.getElementById('loading-screen').classList.add('hidden');
          showMenu();
        }, 280);
      }, 300);
    }
  }, 80);
})();
