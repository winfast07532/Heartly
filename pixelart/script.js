
// ============================================================
//  ARTWORK DATA
// ============================================================
const ARTWORKS = [
  {
    id:'sunset', title:'Pixel Sunset', category:'nature', difficulty:1,
    xpReward:150, desc:'Warm colors fill the evening sky', isDaily:true,
    cols:16, rows:16,
    colors:{1:'#1a1a2e',2:'#e94560',3:'#f5a623',4:'#ffd700',5:'#ff6b35',6:'#2d4a7a',7:'#0a3d62',8:'#c0a060',9:'#8B4513',10:'#228B22'},
    grid:[
      [7,7,7,7,7,6,6,6,6,6,7,7,7,7,7,7],
      [7,7,7,6,6,6,6,3,3,6,6,6,7,7,7,7],
      [7,7,6,6,6,3,3,4,4,3,3,6,6,7,7,7],
      [7,6,6,3,3,4,4,4,4,4,4,3,3,6,6,7],
      [6,6,3,3,4,4,2,2,2,2,4,4,3,3,6,6],
      [6,3,3,4,4,2,2,2,2,2,2,4,4,3,3,6],
      [5,5,4,4,2,2,2,4,4,2,2,2,4,4,5,5],
      [5,5,5,4,4,2,4,4,4,4,2,4,4,5,5,5],
      [5,5,5,5,4,4,4,4,4,4,4,4,5,5,5,5],
      [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
      [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],
      [9,9,9,8,8,8,8,8,8,8,8,8,8,9,9,9],
      [9,9,9,9,9,10,10,9,9,10,10,9,9,9,9,9],
      [10,9,9,9,10,10,10,9,9,10,10,10,9,9,9,10],
      [10,10,9,10,10,10,10,9,9,10,10,10,10,9,10,10],
      [10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],
    ]
  },
  {
    id:'cat', title:'Pixel Cat', category:'animals', difficulty:1,
    xpReward:120, desc:'A cute tabby cat portrait',
    cols:16, rows:16,
    colors:{1:'#1a1a2e',2:'#f5deb3',3:'#d2691e',4:'#ff6b35',5:'#2c2c2c',6:'#ff9999',7:'#4a4a8a',8:'#ffffff',9:'#90ee90',10:'#ffd700'},
    grid:[
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,3,3,1,1,1,1,1,1,3,3,1,1,1],
      [1,1,3,3,3,3,1,1,1,1,3,3,3,3,1,1],
      [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
      [1,3,2,2,2,2,2,2,2,2,2,2,2,2,3,1],
      [1,2,2,5,2,2,2,2,2,2,2,2,5,2,2,1],
      [1,2,2,5,2,2,2,2,2,2,2,2,5,2,2,1],
      [1,2,2,2,2,4,4,2,2,4,4,2,2,2,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,2,2,6,2,2,2,2,2,2,6,2,2,2,1],
      [1,2,2,2,2,3,3,3,3,3,3,2,2,2,2,1],
      [1,1,2,2,3,3,3,3,3,3,3,3,2,2,1,1],
      [1,1,1,2,2,2,3,3,3,3,2,2,2,1,1,1],
      [1,1,1,1,2,2,2,2,2,2,2,2,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ]
  },
  {
    id:'rocket', title:'Space Rocket', category:'objects', difficulty:2,
    xpReward:200, desc:'A rocket blasting through the cosmos',
    cols:16, rows:16,
    colors:{1:'#0a0a1a',2:'#e0e0e0',3:'#c0392b',4:'#3498db',5:'#f39c12',6:'#2ecc71',7:'#9b59b6',8:'#ecf0f1',9:'#f1c40f',10:'#1abc9c'},
    grid:[
      [1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,2,2,2,2,1,1,1,1,1,1],
      [1,1,1,1,1,2,2,3,3,2,2,1,1,1,1,1],
      [1,1,1,1,2,2,3,3,3,3,2,2,1,1,1,1],
      [1,1,1,2,2,3,3,8,8,3,3,2,2,1,1,1],
      [1,1,2,2,3,3,8,4,4,8,3,3,2,2,1,1],
      [1,2,2,3,3,3,8,4,4,8,3,3,3,2,2,1],
      [2,2,3,3,3,3,3,2,2,3,3,3,3,3,2,2],
      [2,3,3,3,3,3,3,2,2,3,3,3,3,3,3,2],
      [2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2],
      [2,2,3,5,3,3,3,3,3,3,3,3,5,3,2,2],
      [1,2,2,5,5,3,3,3,3,3,3,5,5,2,2,1],
      [1,1,2,5,5,5,9,9,9,9,5,5,5,2,1,1],
      [1,1,6,6,5,9,9,9,9,9,9,5,6,6,1,1],
      [1,6,6,6,9,9,5,5,5,5,9,9,6,6,6,1],
      [6,6,6,9,9,5,1,1,1,1,5,9,9,6,6,6],
    ]
  },
  {
    id:'dragon', title:'Fire Dragon', category:'fantasy', difficulty:2,
    xpReward:220, desc:'A mighty dragon breathing fire',
    cols:16, rows:16,
    colors:{1:'#0a0a1a',2:'#2d5a27',3:'#4a8f3c',4:'#c0392b',5:'#e74c3c',6:'#f39c12',7:'#f1c40f',8:'#ffffff',9:'#7f8c8d',10:'#d35400'},
    grid:[
      [1,1,1,1,1,1,1,1,1,1,1,1,2,2,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,1],
      [1,1,2,2,1,1,1,1,1,1,2,2,3,2,2,1],
      [1,2,2,2,2,1,1,1,1,2,2,3,3,3,2,1],
      [2,2,3,2,2,2,1,1,2,2,3,3,4,3,2,1],
      [2,3,3,3,2,2,2,2,2,3,3,4,4,4,3,2],
      [2,3,3,4,4,3,2,2,3,3,4,4,5,4,3,2],
      [1,2,3,4,4,4,3,3,3,4,4,5,5,4,2,1],
      [1,2,3,3,4,4,4,4,4,4,5,5,8,5,2,1],
      [1,1,2,3,3,4,9,9,4,5,5,8,8,2,1,1],
      [1,1,1,2,4,9,9,9,9,5,8,6,2,1,1,1],
      [1,1,1,2,4,4,9,9,5,6,6,2,1,1,1,1],
      [1,1,2,3,4,4,5,5,6,6,10,2,1,1,1,1],
      [1,2,3,3,3,5,6,6,10,10,2,1,1,1,1,1],
      [2,2,3,3,5,6,7,7,7,2,1,1,1,1,1,1],
      [1,2,3,5,6,7,7,1,1,1,1,1,1,1,1,1],
    ]
  },
  {
    id:'cottage', title:'Forest Cottage', category:'nature', difficulty:2,
    xpReward:180, desc:'A cozy cabin in the woods',
    cols:16, rows:16,
    colors:{1:'#87CEEB',2:'#228B22',3:'#8B4513',4:'#A0522D',5:'#D2691E',6:'#FF6347',7:'#FFD700',8:'#FFFFFF',9:'#696969',10:'#32CD32'},
    grid:[
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,7,7,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,6,6,6,6,1,1,1,1,1,1],
      [1,1,1,1,1,6,6,6,6,6,6,1,1,1,1,1],
      [1,1,1,1,6,6,6,6,6,6,6,6,1,1,1,1],
      [1,1,1,6,6,6,6,6,6,6,6,6,6,1,1,1],
      [1,1,6,6,6,6,6,6,6,6,6,6,6,6,1,1],
      [1,1,4,4,4,4,4,4,4,4,4,4,4,4,1,1],
      [1,1,5,5,5,5,5,5,5,5,5,5,5,5,1,1],
      [1,1,5,5,8,8,5,5,5,5,3,3,5,5,1,1],
      [1,1,5,5,8,8,5,5,5,5,3,3,5,5,1,1],
      [1,1,5,5,8,8,5,5,5,5,3,3,5,5,1,1],
      [1,1,5,5,5,5,5,9,9,5,5,5,5,5,1,1],
      [2,2,5,5,5,5,5,9,9,5,5,5,5,5,2,2],
      [2,2,2,10,10,10,10,10,10,10,10,10,10,2,2,2],
      [2,2,10,10,10,10,10,10,10,10,10,10,10,10,2,2],
    ]
  },
  {
    id:'fish', title:'Tropical Fish', category:'animals', difficulty:1,
    xpReward:130, desc:'A colorful fish in the deep sea',
    cols:16, rows:16,
    colors:{1:'#003366',2:'#0066cc',3:'#FF6B00',4:'#FFD700',5:'#FF0000',6:'#FFFFFF',7:'#00CED1',8:'#FF69B4',9:'#32CD32',10:'#87CEEB'},
    grid:[
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,2,2,2,1,1,1,1,1,1,2,2,2,2,1],
      [1,2,7,2,2,2,1,1,1,1,2,2,2,7,2,1],
      [2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2],
      [2,2,2,3,3,3,3,3,3,3,3,3,2,2,2,2],
      [1,2,2,3,4,4,3,3,3,3,4,4,3,2,2,1],
      [1,1,2,3,4,6,4,3,3,4,6,4,3,2,1,1],
      [1,1,2,3,3,4,4,5,5,4,4,3,3,2,1,1],
      [1,1,2,3,3,4,5,5,5,5,4,3,3,2,1,1],
      [1,1,2,3,3,3,4,4,4,4,3,3,3,2,1,1],
      [1,2,2,3,3,3,3,3,3,3,3,3,2,2,2,1],
      [2,2,2,2,3,3,3,3,3,3,3,2,2,2,2,2],
      [2,9,2,2,2,2,2,3,3,2,2,2,2,2,9,2],
      [2,9,9,2,2,2,2,2,2,2,2,2,2,9,9,2],
      [1,2,9,9,2,2,2,2,2,2,2,2,9,9,2,1],
      [1,1,2,2,2,2,1,1,1,1,2,2,2,2,1,1],
    ]
  },
  {
    id:'mushroom', title:'Magic Mushroom', category:'fantasy', difficulty:1,
    xpReward:100, desc:'Enchanted forest mushroom',
    cols:16, rows:16,
    colors:{1:'#2d5016',2:'#5a8f3c',3:'#cc0000',4:'#ff3333',5:'#ffffff',6:'#f5deb3',7:'#deb887',8:'#8fbc8f',9:'#90ee90',10:'#ffff88'},
    grid:[
      [1,1,1,1,1,1,2,2,2,2,1,1,1,1,1,1],
      [1,1,1,1,2,2,8,8,8,8,2,2,1,1,1,1],
      [1,1,1,2,8,3,3,3,3,3,3,8,2,1,1,1],
      [1,1,2,3,3,3,4,4,4,4,3,3,3,2,1,1],
      [1,2,3,3,4,5,5,4,4,5,5,4,3,3,2,1],
      [2,3,3,4,4,5,5,4,4,5,5,4,4,3,3,2],
      [2,3,4,4,4,4,4,4,4,4,4,4,4,4,3,2],
      [2,3,3,4,4,4,4,4,4,4,4,4,4,3,3,2],
      [1,2,3,3,3,4,4,5,5,4,4,3,3,3,2,1],
      [1,1,2,2,3,3,3,3,3,3,3,3,2,2,1,1],
      [1,1,1,2,7,6,6,6,6,6,6,7,2,1,1,1],
      [1,1,1,2,7,6,6,6,6,6,6,7,2,1,1,1],
      [1,1,1,2,7,7,6,6,6,6,7,7,2,1,1,1],
      [1,1,9,9,9,9,7,7,7,7,9,9,9,9,1,1],
      [1,9,9,9,9,9,9,9,9,9,9,9,9,9,9,1],
      [9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9],
    ]
  },
];

// ============================================================
//  GAME STATE
// ============================================================
let STATE = {
  player:{xp:0,level:1,streak:0,lastPlayDate:null,completedArtworks:[],totalCells:0,correctCells:0},
  settings:{errors:true,numbers:true,autoselect:true},
  currentArtworkId:null,
  artworkProgress:{},
};

function saveState(){try{localStorage.setItem('pixelhue_v2',JSON.stringify(STATE));}catch(e){}}
function loadState(){
  try{
    const d=localStorage.getItem('pixelhue_v2');
    if(d){
      const p=JSON.parse(d);
      STATE.player=Object.assign({xp:0,level:1,streak:0,lastPlayDate:null,completedArtworks:[],totalCells:0,correctCells:0},p.player||{});
      STATE.settings=Object.assign({errors:true,numbers:true,autoselect:true},p.settings||{});
      STATE.artworkProgress=p.artworkProgress||{};
      STATE.currentArtworkId=p.currentArtworkId||null;
    }
  }catch(e){}
}

// ============================================================
//  ENGINE STATE
// ============================================================
const ENGINE = {
  artwork:null, cells:[], undoStack:[], redoStack:[],
  selectedColorId:1, activeTool:'brush',
  startTime:0, wrongFills:0, totalFills:0,
  cam:{x:0,y:0,scale:1,minScale:0.25,maxScale:16},
  cellSize:0, canvas:null, ctx:null, containerW:0, containerH:0,
  isPointerDown:false, lastPaintedCell:-1,
  activeTouches:{},
  pinchStartDist:0, pinchStartScale:0,
  pinchStartMidX:0, pinchStartMidY:0,
  pinchStartCamX:0, pinchStartCamY:0,
  // Smart gesture state
  gestureDownX:0, gestureDownY:0, gestureDownCamX:0, gestureDownCamY:0,
  gestureMoved:false, gestureIsPan:false, gestureLocked:false,
  gestureDownTime:0,
  // Double-tap detection
  lastTapTime:0, lastTapX:0, lastTapY:0,
  animatedCells:{}, modalArtId:null,
  numbersVisible:true,
};

// ============================================================
//  LEVEL SYSTEM
// ============================================================
const LEVELS=[
  {name:'Novice',xp:0},{name:'Sketcher',xp:200},{name:'Colorist',xp:500},
  {name:'Artist',xp:1000},{name:'Master',xp:2000},{name:'Virtuoso',xp:3500},
  {name:'Legend',xp:5500},{name:'Myth',xp:8000},
];
function getCurrentLevel(){let lv=0;for(let i=0;i<LEVELS.length;i++){if(STATE.player.xp>=LEVELS[i].xp)lv=i;}return lv;}
function getNextLevelXp(){const lv=getCurrentLevel();return lv+1<LEVELS.length?LEVELS[lv+1].xp:null;}
function addXp(amount){
  const prev=getCurrentLevel();STATE.player.xp+=amount;
  const next=getCurrentLevel();STATE.player.level=next+1;
  if(next>prev)showToast('Level Up! Now '+LEVELS[next].name);
}

// ============================================================
//  NAVIGATION
// ============================================================
let currentScreen='home-screen';
function navigateTo(screenId){
  if(screenId===currentScreen)return;
  document.querySelector('.screen.active')?.classList.remove('active');
  document.getElementById(screenId)?.classList.add('active');
  document.querySelectorAll('.tab-btn').forEach(b=>{b.classList.toggle('active',b.dataset.screen===screenId);});
  currentScreen=screenId;
  if(screenId==='home-screen')refreshHomeScreen();
  if(screenId==='gallery-screen')refreshGallery();
  if(screenId==='settings-screen')refreshSettings();
}

// ============================================================
//  HOME
// ============================================================
function refreshHomeScreen(){
  document.getElementById('stat-level').textContent=STATE.player.level;
  document.getElementById('stat-completed').textContent=STATE.player.completedArtworks.length;
  document.getElementById('stat-streak').textContent=STATE.player.streak;
  document.getElementById('home-streak').textContent=STATE.player.streak+' day streak';
  const lv=getCurrentLevel(),nextXp=getNextLevelXp();
  document.getElementById('level-label').textContent=`Level ${STATE.player.level} — ${LEVELS[lv].name}`;
  const xpInLevel=STATE.player.xp-LEVELS[lv].xp,xpNeeded=nextXp?nextXp-LEVELS[lv].xp:100;
  const pct=nextXp?Math.min(100,Math.round(xpInLevel/xpNeeded*100)):100;
  document.getElementById('xp-label').textContent=`${STATE.player.xp} / ${nextXp||'MAX'} XP`;
  document.getElementById('level-fill').style.width=pct+'%';
  const daily=ARTWORKS.find(a=>a.isDaily)||ARTWORKS[0];
  drawMiniCanvas(document.getElementById('daily-mini-canvas'),daily);
  document.getElementById('daily-title').textContent=daily.title;
  document.getElementById('daily-desc').textContent=daily.desc;
  buildArtworkGrid();
}

function buildArtworkGrid(){
  const grid=document.getElementById('artwork-grid');
  const activeCat=document.querySelector('.cat-chip.active')?.dataset.cat||'all';
  const filtered=activeCat==='all'?ARTWORKS:ARTWORKS.filter(a=>a.category===activeCat);
  grid.innerHTML='';
  filtered.forEach(art=>{
    const prog=STATE.artworkProgress[art.id];
    const total=art.cols*art.rows;
    const filled=prog?prog.filledCount:0;
    const pct=Math.round(filled/total*100);
    const completed=STATE.player.completedArtworks.includes(art.id);
    const lvReq=(art.difficulty-1)*2;
    const locked=STATE.player.level<lvReq&&!completed;
    const colorCount=Object.keys(art.colors).length;
    const card=document.createElement('div');
    card.className='artwork-card';
    card.innerHTML=`
      <div class="artwork-card-img">
        <canvas class="mini-canvas art-preview-canvas" width="100" height="100" data-id="${art.id}"></canvas>
      </div>
      <div class="artwork-card-info">
        <h4>${art.title}</h4>
        <div class="artwork-card-meta">
          <span class="meta-tag">${colorCount} colors · ${total} cells</span>
          ${completed?`<span style="font-size:10px;color:var(--green);font-weight:700;">Done</span>`:''}
        </div>
        <div class="difficulty-dots">
          ${[1,2,3].map(d=>`<div class="dot${d<=art.difficulty?' filled':''}"></div>`).join('')}
        </div>
        <div class="progress-mini"><div class="progress-mini-fill" style="width:${pct}%"></div></div>
      </div>
      ${locked?`<div class="lock-overlay"><svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>`:''}
    `;
    if(!locked)card.addEventListener('click',()=>startGame(art.id));
    grid.appendChild(card);
    requestAnimationFrame(()=>{
      const c=card.querySelector('.art-preview-canvas');
      if(c)drawMiniCanvas(c,art,prog?.cells);
    });
  });
}

// ============================================================
//  MINI CANVAS
// ============================================================
function drawMiniCanvas(canvas,art,cells){
  try{
    const W=canvas.width,H=canvas.height,ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);
    // Sample at max 20x20 for fast thumbnail — avoids freezing on large grids
    const THUMB=20;
    const stepC=Math.max(1,Math.floor(art.cols/THUMB));
    const stepR=Math.max(1,Math.floor(art.rows/THUMB));
    const tCols=Math.ceil(art.cols/stepC);
    const tRows=Math.ceil(art.rows/stepR);
    const cw=W/tCols,ch=H/tRows;
    for(let r=0;r<tRows;r++){
      for(let col=0;col<tCols;col++){
        const sr=Math.min(r*stepR,art.rows-1);
        const sc=Math.min(col*stepC,art.cols-1);
        const colorId=art.grid[sr][sc];
        const idx=sr*art.cols+sc;
        const filled=cells?cells[idx]?.filled:false;
        ctx.fillStyle=(filled||!cells)?art.colors[colorId]:'#2a2a48';
        ctx.fillRect(col*cw,r*ch,cw+1,ch+1);
      }
    }
  }catch(e){}
}

// ============================================================
//  GAME START
// ============================================================
function startGame(artworkId){
  const art=ARTWORKS.find(a=>a.id===artworkId);
  if(!art)return;
  ENGINE.artwork=art;
  ENGINE.undoStack=[];ENGINE.redoStack=[];
  ENGINE.wrongFills=0;ENGINE.totalFills=0;
  ENGINE.startTime=Date.now();ENGINE.animatedCells={};
  ENGINE.selectedColorId=parseInt(Object.keys(art.colors)[0]);
  ENGINE.activeTool='brush';
  ENGINE.inputMode='draw'; // 'draw' | 'pan'
  ENGINE.cam={x:0,y:0,scale:1,minScale:0.25,maxScale:16};
  ENGINE.isPointerDown=false;ENGINE.gestureMoved=false;ENGINE.gestureIsPan=false;ENGINE.gestureLocked=false;
  ENGINE.activeTouches={};ENGINE.lastTapTime=0;ENGINE.numbersVisible=STATE.settings.numbers;

  const prog=STATE.artworkProgress[artworkId];
  ENGINE.cells=[];
  for(let r=0;r<art.rows;r++){
    for(let c=0;c<art.cols;c++){
      const idx=r*art.cols+c;
      ENGINE.cells.push({colorId:art.grid[r][c],filled:prog?.cells[idx]?.filled||false});
    }
  }
  STATE.currentArtworkId=artworkId;saveState();
  document.getElementById('game-artwork-title').textContent=art.title;
  document.getElementById('game-artwork-cat').textContent=art.category+' · '+art.difficulty+'★';
  updateNumbersToggleBtn();
  ENGINE.inputMode='draw';
  const mDraw=document.getElementById('mode-draw'),mPan=document.getElementById('mode-pan');
  if(mDraw){mDraw.classList.add('active');}
  if(mPan){mPan.classList.remove('active');}
  setActiveTool('brush');buildPalette();
  buildRemainingCounts(); // build O(1) cache for tap performance
  navigateTo('game-screen');
  requestAnimationFrame(()=>{initCanvas();centerCamera();renderAll();updateProgressRing();updateCellsLeftCounter();showGestureBanner();});
}

// ============================================================
//  CANVAS INIT & CAMERA
// ============================================================
function initCanvas(){
  // Invalidate offscreen cache — cellSize is about to change
  _cacheCanvas=null; _cacheCtx=null; _cacheDirty=true;
  const container=document.getElementById('canvas-container');
  ENGINE.canvas=document.getElementById('pixel-canvas');
  ENGINE.ctx=ENGINE.canvas.getContext('2d');
  ENGINE.containerW=container.clientWidth;
  ENGINE.containerH=container.clientHeight;
  const art=ENGINE.artwork;
  const BASE=Math.min(Math.floor(ENGINE.containerW/art.cols),Math.floor(ENGINE.containerH/art.rows),32);
  ENGINE.cellSize=Math.max(BASE,4);
  ENGINE.canvas.width=art.cols*ENGINE.cellSize;
  ENGINE.canvas.height=art.rows*ENGINE.cellSize;
}

function centerCamera(){
  const art=ENGINE.artwork;
  const cw=art.cols*ENGINE.cellSize,ch=art.rows*ENGINE.cellSize;
  const fitScale=Math.min(ENGINE.containerW/cw,ENGINE.containerH/ch)*0.92;
  ENGINE.cam.scale=fitScale;
  ENGINE.cam.x=(ENGINE.containerW-cw*fitScale)/2;
  ENGINE.cam.y=(ENGINE.containerH-ch*fitScale)/2;
  applyTransform();
}

function applyTransform(){
  ENGINE.canvas.style.transform=`translate(${ENGINE.cam.x}px,${ENGINE.cam.y}px) scale(${ENGINE.cam.scale})`;
}

function clampCamera(){
  if(!ENGINE.artwork)return;
  const cw=ENGINE.artwork.cols*ENGINE.cellSize*ENGINE.cam.scale;
  const ch=ENGINE.artwork.rows*ENGINE.cellSize*ENGINE.cam.scale;
  const margin=80,W=ENGINE.containerW,H=ENGINE.containerH;
  ENGINE.cam.x=Math.min(W-margin,Math.max(-(cw-margin),ENGINE.cam.x));
  ENGINE.cam.y=Math.min(H-margin,Math.max(-(ch-margin),ENGINE.cam.y));
}

// ============================================================
//  RENDER ENGINE
// ============================================================
let rafId=null,needsRender=false;
function requestRender(){needsRender=true;if(!rafId)rafId=requestAnimationFrame(renderLoop);}
function renderLoop(){
  rafId=null;
  if(needsRender){
    needsRender=false;
    try{ renderAll(); }catch(e){ console.error('renderAll error:',e); }
  }
}

// ── Offscreen cache canvas — pre-rendered grid ──────────────
let _cacheCanvas=null, _cacheCtx=null, _cacheDirty=true, _cacheSelectedId=-1;

function ensureCache(){
  const art=ENGINE.artwork; if(!art) return;
  const cs=ENGINE.cellSize;
  const w=art.cols*cs, h=art.rows*cs;
  if(!_cacheCanvas||_cacheCanvas.width!==w||_cacheCanvas.height!==h){
    _cacheCanvas=document.createElement('canvas');
    _cacheCanvas.width=w; _cacheCanvas.height=h;
    _cacheCtx=_cacheCanvas.getContext('2d');
    _cacheDirty=true;
  }
}

// Redraw the full grid onto the offscreen cache (called only when needed)
function rebuildCache(){
  const art=ENGINE.artwork; if(!art||!_cacheCtx) return;
  const ctx=_cacheCtx, cs=ENGINE.cellSize;
  const cols=art.cols, rows=art.rows;
  const showNums=ENGINE.numbersVisible;
  const selectedId=ENGINE.selectedColorId;
  ctx.clearRect(0,0,_cacheCanvas.width,_cacheCanvas.height);
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const idx=r*cols+c;
      drawCellToCtx(ctx,ENGINE.cells[idx],art,c,r,cs,selectedId,showNums);
    }
  }
  _cacheDirty=false;
  _cacheSelectedId=selectedId;
}

// Draw a single cell onto any context
function drawCellToCtx(ctx,cell,art,c,r,cs,selectedId,showNums){
  const x=c*cs, y=r*cs;
  const isSelected=cell.colorId===selectedId;
  if(cell.filled){
    ctx.fillStyle=art.colors[cell.colorId];
    ctx.fillRect(x,y,cs,cs);
    if(cs>6){ctx.strokeStyle='rgba(0,0,0,0.08)';ctx.lineWidth=0.5;ctx.strokeRect(x+0.25,y+0.25,cs-0.5,cs-0.5);}
  }else{
    ctx.fillStyle=isSelected?'rgba(124,92,246,0.2)':'#20203a';
    ctx.fillRect(x,y,cs,cs);
    ctx.strokeStyle=isSelected?'rgba(167,139,250,0.6)':'rgba(255,255,255,0.06)';
    ctx.lineWidth=isSelected?0.8:0.5;
    ctx.strokeRect(x+0.25,y+0.25,cs-0.5,cs-0.5);
    if(showNums&&cs>=14){
      const fontSize=Math.max(Math.floor(cs*0.42),7);
      ctx.font=`700 ${fontSize}px -apple-system,sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillStyle=isSelected?'rgba(200,180,255,0.95)':'rgba(255,255,255,0.22)';
      ctx.fillText(cell.colorId,x+cs/2,y+cs/2);
    }
  }
}

// Dirty cells queue — only repaint changed cells
const _dirtyCells = new Set();
function markCellDirty(idx){ _dirtyCells.add(idx); }
function markAllDirty(){ _cacheDirty=true; _dirtyCells.clear(); }

function renderAll(){
  const art=ENGINE.artwork; if(!art) return;
  const ctx=ENGINE.ctx, cs=ENGINE.cellSize;
  const now=Date.now();

  ensureCache();

  // Rebuild full cache if needed (color selection changed, zoom changed, etc.)
  if(_cacheDirty || ENGINE.selectedColorId!==_cacheSelectedId){
    rebuildCache();
    _dirtyCells.clear();
  } else if(_dirtyCells.size>0){
    // Only repaint changed cells on cache
    const selectedId=ENGINE.selectedColorId;
    const showNums=ENGINE.numbersVisible;
    _dirtyCells.forEach(idx=>{
      const r=Math.floor(idx/art.cols), c=idx%art.cols;
      drawCellToCtx(_cacheCtx,ENGINE.cells[idx],art,c,r,cs,selectedId,showNums);
    });
    _dirtyCells.clear();
  }

  // Blit cache to main canvas in one drawImage call
  ctx.clearRect(0,0,ENGINE.canvas.width,ENGINE.canvas.height);
  if(_cacheCanvas) ctx.drawImage(_cacheCanvas,0,0);

  // Draw animations on top (only active ones)
  const animKeys=Object.keys(ENGINE.animatedCells);
  let hasAnims=false;
  animKeys.forEach(idx=>{
    const anim=ENGINE.animatedCells[idx];
    const elapsed=now-anim.startTime;
    const r2=Math.floor(idx/art.cols), c2=idx%art.cols;
    const x=c2*cs, y=r2*cs;
    if(anim.type==='correct'&&elapsed<400){
      ctx.fillStyle=`rgba(34,211,160,${(1-elapsed/400)*0.5})`;
      ctx.fillRect(x,y,cs,cs); hasAnims=true;
    }else if(anim.type==='wrong'&&elapsed<500){
      ctx.fillStyle=`rgba(248,113,113,${(1-elapsed/500)*0.6})`;
      ctx.fillRect(x,y,cs,cs); hasAnims=true;
    }else if(anim.type==='hint'&&elapsed<2100){
      const flash=Math.sin(elapsed/200*Math.PI);
      if(flash>0){ctx.fillStyle=`rgba(251,191,36,${flash*0.6})`;ctx.fillRect(x,y,cs,cs);}
      hasAnims=true;
    }else{
      delete ENGINE.animatedCells[idx];
    }
  });
  if(hasAnims) needsRender=true;
  if(needsRender) rafId=requestAnimationFrame(renderLoop);
}

// ============================================================
//  PAINT
// ============================================================
function paintCell(idx){
  if(idx<0||idx>=ENGINE.cells.length)return;
  const cell=ENGINE.cells[idx];
  if(cell.filled)return;
  if(idx===ENGINE.lastPaintedCell)return;
  ENGINE.lastPaintedCell=idx;
  const correct=cell.colorId===ENGINE.selectedColorId;
  if(correct){
    ENGINE.undoStack.push({idx,prevFilled:false});ENGINE.redoStack=[];
    cell.filled=true;
    ENGINE.animatedCells[idx]={type:'correct',startTime:Date.now()};
    ENGINE.totalFills++;
    if(ENGINE.remainingCounts) ENGINE.remainingCounts[cell.colorId]=Math.max(0,(ENGINE.remainingCounts[cell.colorId]||1)-1);
    markCellDirty(idx); // only this cell changed
    debounceSaveProgress();updateProgressRing();updateCellsLeftCounter();
    const rem=getRemaining(ENGINE.selectedColorId);
    updatePaletteRemaining();
    if(rem===0)fireColorCompleteBurst(ENGINE.selectedColorId);
    if(STATE.settings.autoselect&&rem===0)autoSelectNextColor();
    if(isComplete())triggerCompletion();
  }else{
    if(STATE.settings.errors){ENGINE.animatedCells[idx]={type:'wrong',startTime:Date.now()};ENGINE.wrongFills++;}
  }
  needsRender=true;if(!rafId)rafId=requestAnimationFrame(renderLoop);
}

function getRemaining(colorId){
  // Use cached counts for O(1) lookup instead of filtering every tap
  if(ENGINE.remainingCounts && ENGINE.remainingCounts[colorId] !== undefined)
    return ENGINE.remainingCounts[colorId];
  return ENGINE.cells.filter(c=>c.colorId===colorId&&!c.filled).length;
}
function buildRemainingCounts(){
  try{
    ENGINE.remainingCounts={};
    ENGINE.cells.forEach(cell=>{
      if(!cell.filled) ENGINE.remainingCounts[cell.colorId]=(ENGINE.remainingCounts[cell.colorId]||0)+1;
    });
  }catch(e){}
}

function autoSelectNextColor(){
  const art=ENGINE.artwork;
  const next=Object.keys(art.colors).map(Number).find(id=>getRemaining(id)>0);
  if(next!=null){ENGINE.selectedColorId=next;buildPalette();markAllDirty();needsRender=true;if(!rafId)rafId=requestAnimationFrame(renderLoop);}
}

function isComplete(){return ENGINE.cells.every(c=>c.filled);}

// ============================================================
//  COLOR COMPLETION BURST
// ============================================================
function fireColorCompleteBurst(colorId){
  const art=ENGINE.artwork;
  const color=art.colors[colorId];
  // Find the swatch element for particle origin
  const sw=document.querySelector(`.color-swatch[data-color-id="${colorId}"]`);
  const container=document.getElementById('canvas-container');
  const rect=sw?sw.getBoundingClientRect():container.getBoundingClientRect();
  const ox=sw?(rect.left+rect.width/2-container.getBoundingClientRect().left):container.clientWidth/2;
  const oy=sw?(rect.top+rect.height/2-container.getBoundingClientRect().top):container.clientHeight/2;

  for(let i=0;i<10;i++){
    const dot=document.createElement('div');
    dot.className='burst-dot';
    const angle=(i/10)*Math.PI*2;
    const dist=40+Math.random()*30;
    dot.style.cssText=`left:${ox}px;top:${oy}px;background:${color};--tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist}px;animation-delay:${i*0.02}s;`;
    container.appendChild(dot);
    setTimeout(()=>dot.remove(),600);
  }
  showToast('Color ' + colorId + ' complete!');
}

// ============================================================
//  TOOLS
// ============================================================
function setActiveTool(tool){
  ENGINE.activeTool=tool;
  document.querySelectorAll('.tool-btn').forEach(b=>{
    const t=b.id.replace('tool-','');
    b.classList.toggle('active',t===tool);
  });
}

function doMagicWand(startIdx){
  const art=ENGINE.artwork,cell=ENGINE.cells[startIdx];
  if(cell.filled||cell.colorId!==ENGINE.selectedColorId)return;
  const targetId=cell.colorId,visited=new Set(),queue=[startIdx],toPaint=[];
  const cols=art.cols,rows=art.rows;
  while(queue.length){
    const idx=queue.shift();
    if(visited.has(idx))continue;
    visited.add(idx);
    const c=ENGINE.cells[idx];
    if(c.colorId===targetId&&!c.filled){
      toPaint.push(idx);
      const r=Math.floor(idx/cols),co=idx%cols;
      if(r>0)queue.push((r-1)*cols+co);
      if(r<rows-1)queue.push((r+1)*cols+co);
      if(co>0)queue.push(r*cols+(co-1));
      if(co<cols-1)queue.push(r*cols+(co+1));
    }
  }
  if(toPaint.length){
    ENGINE.undoStack.push({batch:toPaint.map(i=>({idx:i,prevFilled:false}))});ENGINE.redoStack=[];
    toPaint.forEach(i=>{ENGINE.cells[i].filled=true;ENGINE.animatedCells[i]={type:'correct',startTime:Date.now()};});
    saveProgress();updateProgressRing();updateCellsLeftCounter();
    const rem=getRemaining(ENGINE.selectedColorId);
    updatePaletteRemaining();
    if(rem===0)fireColorCompleteBurst(ENGINE.selectedColorId);
    if(STATE.settings.autoselect&&rem===0)autoSelectNextColor();
    if(isComplete())triggerCompletion();
    toPaint.forEach(i=>markCellDirty(i));needsRender=true;if(!rafId)rafId=requestAnimationFrame(renderLoop);showToast(`Filled ${toPaint.length} cells!`);
  }
  setActiveTool('brush');
}

function doFillAll(){
  const colorId=ENGINE.selectedColorId;
  const toPaint=ENGINE.cells.map((_,i)=>i).filter(i=>ENGINE.cells[i].colorId===colorId&&!ENGINE.cells[i].filled);
  if(!toPaint.length){showToast('Already complete!');return;}
  ENGINE.undoStack.push({batch:toPaint.map(i=>({idx:i,prevFilled:false}))});ENGINE.redoStack=[];
  toPaint.forEach(i=>{ENGINE.cells[i].filled=true;ENGINE.animatedCells[i]={type:'correct',startTime:Date.now()};});
  saveProgress();updateProgressRing();updateCellsLeftCounter();
  const rem=getRemaining(ENGINE.selectedColorId);
  updatePaletteRemaining();
  if(rem===0)fireColorCompleteBurst(ENGINE.selectedColorId);
  if(STATE.settings.autoselect&&rem===0)autoSelectNextColor();
  if(isComplete())triggerCompletion();
  requestRender();setActiveTool('brush');
}

function doHint(){
  const colorId=ENGINE.selectedColorId;
  const unfilled=ENGINE.cells.map((_,i)=>i).filter(i=>ENGINE.cells[i].colorId===colorId&&!ENGINE.cells[i].filled);
  if(!unfilled.length){showToast('All cells filled!');return;}
  const target=unfilled[Math.floor(Math.random()*unfilled.length)];
  ENGINE.animatedCells[target]={type:'hint',startTime:Date.now()};
  scrollCellIntoView(target);requestRender();setActiveTool('brush');
}

function scrollCellIntoView(idx){
  const art=ENGINE.artwork,r=Math.floor(idx/art.cols),c=idx%art.cols,cs=ENGINE.cellSize;
  const cx=c*cs+cs/2,cy=r*cs+cs/2;
  ENGINE.cam.x=ENGINE.containerW/2-cx*ENGINE.cam.scale;
  ENGINE.cam.y=ENGINE.containerH/2-cy*ENGINE.cam.scale;
  clampCamera();applyTransform();
}

function doUndo(){
  if(!ENGINE.undoStack.length){showToast('Nothing to undo');return;}
  const action=ENGINE.undoStack.pop();
  if(action.batch){
    ENGINE.redoStack.push({batch:action.batch.map(a=>({idx:a.idx,prevFilled:ENGINE.cells[a.idx].filled}))});
    action.batch.forEach(a=>{ENGINE.cells[a.idx].filled=a.prevFilled;});
  }else{
    ENGINE.redoStack.push({idx:action.idx,prevFilled:ENGINE.cells[action.idx].filled});
    ENGINE.cells[action.idx].filled=action.prevFilled;
  }
  saveProgress();updateProgressRing();updateCellsLeftCounter();buildPalette();requestRender();
}

function doRedo(){
  if(!ENGINE.redoStack.length){showToast('Nothing to redo');return;}
  const action=ENGINE.redoStack.pop();
  if(action.batch){
    ENGINE.undoStack.push({batch:action.batch.map(a=>({idx:a.idx,prevFilled:a.prevFilled}))});
    action.batch.forEach(a=>{ENGINE.cells[a.idx].filled=true;});
  }else{
    ENGINE.undoStack.push({idx:action.idx,prevFilled:action.prevFilled});
    ENGINE.cells[action.idx].filled=!action.prevFilled;
  }
  saveProgress();updateProgressRing();updateCellsLeftCounter();buildPalette();requestRender();
}

// ============================================================
//  PALETTE
// ============================================================
function buildPalette(){
  const art=ENGINE.artwork,scroll=document.getElementById('palette-scroll');
  scroll.innerHTML='';
  Object.entries(art.colors).forEach(([idStr,color])=>{
    const id=parseInt(idStr),rem=getRemaining(id);
    if(rem===0)return;
    const div=document.createElement('div');
    div.className='color-swatch'+(id===ENGINE.selectedColorId?' active':'');
    div.dataset.colorId=id;
    // Also set as attribute for querySelector
    div.setAttribute('data-color-id',id);
    div.innerHTML=`
      <div class="swatch-circle" style="background:${color}">
        <span class="swatch-num">${id}</span>
      </div>
      <span class="swatch-remaining">${rem}</span>
    `;
    div.addEventListener('click',()=>{
      ENGINE.selectedColorId=id;
      document.querySelectorAll('.color-swatch').forEach(s=>s.classList.remove('active'));
      div.classList.add('active');
      setActiveTool('brush');
      requestRender();
    });
    scroll.appendChild(div);
  });
}

function updatePaletteRemaining(){
  let selectedStillExists=false;
  document.querySelectorAll('.color-swatch').forEach(sw=>{
    const id=parseInt(sw.dataset.colorId),rem=getRemaining(id);
    if(rem===0){sw.remove();}
    else{sw.querySelector('.swatch-remaining').textContent=rem;if(id===ENGINE.selectedColorId)selectedStillExists=true;}
  });
  if(!selectedStillExists){
    const firstSwatch=document.querySelector('.color-swatch');
    if(firstSwatch){
      const nextId=parseInt(firstSwatch.dataset.colorId);
      ENGINE.selectedColorId=nextId;firstSwatch.classList.add('active');requestRender();
    }
  }
}

// ============================================================
//  PROGRESS RING
// ============================================================
function updateProgressRing(){
  const total=ENGINE.cells.length,filled=ENGINE.cells.filter(c=>c.filled).length;
  const pct=Math.round(filled/total*100);
  document.getElementById('progress-pct').textContent=pct+'%';
  const canvas=document.getElementById('progress-ring-canvas'),ctx=canvas.getContext('2d');
  const W=canvas.width,H=canvas.height,cx=W/2,cy=H/2,r=15,lw=3;
  ctx.clearRect(0,0,W,H);
  ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=lw;ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+(pct/100)*Math.PI*2);ctx.strokeStyle='#7c5cf6';ctx.lineWidth=lw;ctx.lineCap='round';ctx.stroke();
}

function updateCellsLeftCounter(){
  const total=ENGINE.cells.length,filled=ENGINE.cells.filter(c=>c.filled).length;
  const left=total-filled;
  document.getElementById('cells-left-counter').textContent=left+' cells left';
}

// ============================================================
//  NUMBERS TOGGLE
// ============================================================
function updateNumbersToggleBtn(){
  const btn=document.getElementById('btn-toggle-numbers');
  btn.classList.toggle('active-toggle',ENGINE.numbersVisible);
}
function toggleNumbers(){
  ENGINE.numbersVisible=!ENGINE.numbersVisible;
  updateNumbersToggleBtn();
  showToast(ENGINE.numbersVisible?'Numbers on':'Numbers off');
  requestRender();
}

// ============================================================
//  GESTURE HINT BANNER
// ============================================================
let bannerTimer=null;
function showGestureBanner(){
  const b=document.getElementById('gesture-banner');
  b.classList.add('show');
  if(bannerTimer)clearTimeout(bannerTimer);
  bannerTimer=setTimeout(()=>b.classList.remove('show'),2800);
}

// ============================================================
//  SAVE PROGRESS
// ============================================================
// Debounced save — max one write every 2 seconds during painting
let _saveTimer=null;
function debounceSaveProgress(){
  if(_saveTimer) return; // already scheduled
  _saveTimer=setTimeout(()=>{
    _saveTimer=null;
    saveProgress();
  }, 2000);
}
function saveProgress(){
  if(!ENGINE.artwork) return;
  const id=ENGINE.artwork.id;
  STATE.artworkProgress[id]={
    cells:ENGINE.cells.map(c=>({filled:c.filled})),
    filledCount:ENGINE.cells.filter(c=>c.filled).length,
    completedAt:STATE.artworkProgress[id]?.completedAt||null,
  };
  saveState();
}

// ============================================================
//  COMPLETION
// ============================================================
function triggerCompletion(){
  const art=ENGINE.artwork,id=art.id;
  if(!STATE.player.completedArtworks.includes(id))STATE.player.completedArtworks.push(id);
  STATE.artworkProgress[id].completedAt=new Date().toISOString();
  const xp=art.xpReward;addXp(xp);
  // ── HEARTLY BRIDGE: award pts to parent frame ──
  try{
    const p=window.parent;
    if(p&&p!==window){
      const hPts=Math.round(xp*0.8); // convert XP → Heartly pts
      const old=p.ptsVal||0;
      p.ptsVal=old+hPts;
      if(typeof p.animatePts==='function') p.animatePts(old,p.ptsVal,800);
      if(typeof p.addTxItem==='function')  p.addTxItem('🎨','Pixel Art: '+art.title,'Just now','+'+hPts,'earn');
      if(typeof p.T==='function')          p.T('🎨 +'+hPts+' pts — '+art.title+' complete!');
      if(typeof p.saveState==='function')  p.saveState();
    }
  }catch(e){}
  const today=new Date().toDateString();
  if(STATE.player.lastPlayDate!==today){
    const yesterday=new Date(Date.now()-86400000).toDateString();
    STATE.player.streak=STATE.player.lastPlayDate===yesterday?STATE.player.streak+1:1;
    STATE.player.lastPlayDate=today;
  }
  saveState();
  const elapsed=Math.round((Date.now()-ENGINE.startTime)/1000);
  const mins=Math.floor(elapsed/60),secs=elapsed%60;
  const acc=ENGINE.totalFills>0?Math.round(((ENGINE.totalFills-ENGINE.wrongFills)/ENGINE.totalFills)*100):100;
  document.getElementById('comp-subtitle').textContent=`You completed "${art.title}"`;
  document.getElementById('comp-xp').textContent=`+${xp} XP`;
  document.getElementById('comp-time').textContent=`${mins}:${secs.toString().padStart(2,'0')}`;
  document.getElementById('comp-acc').textContent=acc+'%';
  document.getElementById('comp-cells').textContent=ENGINE.cells.length;
  document.getElementById('completion-overlay').classList.add('show');
  launchConfetti();
}

// ============================================================
//  CONFETTI
// ============================================================
const CC=['#7c5cf6','#a78bfa','#22d3a0','#fbbf24','#f87171','#60a5fa','#34d399'];
let confettiParts=[],confettiRaf=null;
function launchConfetti(){
  const canvas=document.getElementById('confetti-canvas');
  canvas.width=window.innerWidth;canvas.height=window.innerHeight;
  const ctx=canvas.getContext('2d');
  confettiParts=[];
  for(let i=0;i<120;i++){
    confettiParts.push({x:Math.random()*canvas.width,y:-20-Math.random()*200,w:6+Math.random()*6,h:3+Math.random()*4,color:CC[Math.floor(Math.random()*CC.length)],vx:(Math.random()-0.5)*4,vy:2+Math.random()*4,rot:Math.random()*360,rotV:(Math.random()-0.5)*8,alpha:1});
  }
  if(confettiRaf)cancelAnimationFrame(confettiRaf);
  function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    let alive=false;
    confettiParts.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;p.vy+=0.06;p.rot+=p.rotV;
      if(p.y>canvas.height-50)p.alpha-=0.02;
      if(p.alpha>0)alive=true;
      ctx.save();ctx.globalAlpha=Math.max(0,p.alpha);
      ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle=p.color;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
    });
    if(alive)confettiRaf=requestAnimationFrame(loop);
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  loop();
}

// ============================================================
//  INPUT SYSTEM  — native Touch Events (Safari-safe)
//
//  1 finger:
//    tap              → paint single cell
//    drag             → paint every cell crossed (draw swipe)
//    double-tap       → zoom in/out toggle
//    long-press 450ms → magic wand flood fill
//
//  2 fingers (any time a second finger lands):
//    drawing is immediately suspended
//    pinch → zoom centred between fingers
//    drag both fingers → pan
//    when second finger lifts → 1-finger draw resumes
//
//  Page scroll is suppressed while canvas is touched.
// ============================================================
const LONG_PRESS_MS = 450;
let longPressTimer  = null;

// ── Touch state ──────────────────────────────────────────────
const T = {
  // 1-finger draw state
  drawing      : false,   // currently in 1-finger draw mode
  startX       : 0,
  startY       : 0,
  moved        : false,   // finger moved far enough to be a drag
  lastCell     : -1,      // last painted cell index (avoid repaints)

  // camera pan state (2-finger AND 1-finger-on-background)
  panning      : false,
  panStartX    : 0,
  panStartY    : 0,
  panCamX      : 0,
  panCamY      : 0,

  // pinch state
  pinching     : false,
  pinchDist    : 0,
  pinchScale   : 0,
  pinchMidX    : 0,
  pinchMidY    : 0,
  pinchCamX    : 0,
  pinchCamY    : 0,

  // double-tap detection
  lastTapTime  : 0,
  lastTapX     : 0,
  lastTapY     : 0,
};

function setupInput(){
  const el = document.getElementById('canvas-container');

  el.addEventListener('touchstart',   onTouchStart,  {passive:false});
  el.addEventListener('touchmove',    onTouchMove,   {passive:false});
  el.addEventListener('touchend',     onTouchEnd,    {passive:false});
  el.addEventListener('touchcancel',  onTouchEnd,    {passive:false});

  // Mouse wheel zoom (desktop / trackpad)
  el.addEventListener('wheel', onWheel, {passive:false});
  el.addEventListener('contextmenu', e=>e.preventDefault());
}

// ── Helpers ──────────────────────────────────────────────────
function clearLongPress(){
  if(longPressTimer){clearTimeout(longPressTimer);longPressTimer=null;}
}

function touchMid(touches){
  // Returns {x,y,dist} for the first two touches
  const a=touches[0], b=touches[1];
  const dx=a.clientX-b.clientX, dy=a.clientY-b.clientY;
  return {
    x:(a.clientX+b.clientX)/2,
    y:(a.clientY+b.clientY)/2,
    dist:Math.sqrt(dx*dx+dy*dy)
  };
}

function resetDrawState(){
  T.drawing=false; T.moved=false; T.lastCell=-1;
}
function resetPanState(){
  T.panning=false;
}
function resetPinchState(){
  T.pinching=false;
}

// ── touchstart ───────────────────────────────────────────────
function onTouchStart(e){
  e.preventDefault();
  const touches=e.touches;

  if(touches.length===1){
    clearLongPress();
    resetPanState();
    resetPinchState();

    const t=touches[0];
    const cx=t.clientX, cy=t.clientY;

    T.startX=cx; T.startY=cy;
    T.moved=false; T.lastCell=-1;

    // Double-tap?
    const now=Date.now();
    const ddx=Math.abs(cx-T.lastTapX), ddy=Math.abs(cy-T.lastTapY);
    if(now-T.lastTapTime<320 && ddx<30 && ddy<30){
      T.lastTapTime=0;
      handleDoubleTap(cx,cy);
      return;
    }
    T.lastTapTime=now; T.lastTapX=cx; T.lastTapY=cy;

    if(ENGINE.inputMode==='pan'){
      // PAN mode: 1 finger drags the camera
      T.drawing=false;
      T.panning=true;
      T.startX=cx; T.startY=cy;          // reuse startX/Y as pan anchor
      T.panCamX=ENGINE.cam.x; T.panCamY=ENGINE.cam.y;
      return;
    }

    // DRAW mode
    T.drawing=true;
    ENGINE.lastPaintedCell=-1;           // clear dedup so new stroke always registers

    // Paint the cell immediately on touch-down
    const idx=screenToCell(cx,cy);
    if(idx>=0) handleDraw(idx);

    // Long-press timer for magic wand
    longPressTimer=setTimeout(()=>{
      if(T.drawing && !T.moved){
        const i=screenToCell(T.startX,T.startY);
        if(i>=0){doMagicWand(i);showRipple(T.startX,T.startY);}
        resetDrawState();
      }
    }, LONG_PRESS_MS);

  } else if(touches.length===2){
    // Second finger landed — stop drawing immediately
    clearLongPress();
    resetDrawState();
    resetPanState();

    // Initialise pinch
    const m=touchMid(touches);
    T.pinching=true;
    T.pinchDist=m.dist;
    T.pinchScale=ENGINE.cam.scale;
    T.pinchMidX=m.x; T.pinchMidY=m.y;
    T.pinchCamX=ENGINE.cam.x; T.pinchCamY=ENGINE.cam.y;
  }
}

// ── touchmove ────────────────────────────────────────────────
function onTouchMove(e){
  e.preventDefault();
  const touches=e.touches;

  if(touches.length>=2 && T.pinching){
    // ── Pinch zoom + two-finger pan ──
    const m=touchMid(touches);
    const scaleDelta=m.dist/T.pinchDist;
    const newScale=Math.min(ENGINE.cam.maxScale,
                   Math.max(ENGINE.cam.minScale, T.pinchScale*scaleDelta));

    const container=document.getElementById('canvas-container');
    const rect=container.getBoundingClientRect();
    // Pivot point = initial pinch midpoint in container-local coords
    const pivX=T.pinchMidX-rect.left;
    const pivY=T.pinchMidY-rect.top;
    // Pan delta: how much the mid-point has moved since pinch started
    const panDX=m.x-T.pinchMidX;
    const panDY=m.y-T.pinchMidY;

    ENGINE.cam.x = pivX - (pivX - T.pinchCamX)*(newScale/T.pinchScale) + panDX;
    ENGINE.cam.y = pivY - (pivY - T.pinchCamY)*(newScale/T.pinchScale) + panDY;
    ENGINE.cam.scale=newScale;
    clampCamera(); applyTransform();
    return;
  }

  if(touches.length===1){
    const t=touches[0];
    const cx=t.clientX, cy=t.clientY;
    const dx=cx-T.startX, dy=cy-T.startY;
    const dist=Math.sqrt(dx*dx+dy*dy);

    if(dist>4) { clearLongPress(); T.moved=true; }

    if(T.drawing){
      // DRAW mode — paint every cell the finger crosses
      const idx=screenToCell(cx,cy);
      if(idx>=0 && idx!==T.lastCell){
        handleDraw(idx);
        T.lastCell=idx;
      }
    } else if(T.panning){
      // PAN mode — move camera
      ENGINE.cam.x=T.panCamX+dx;
      ENGINE.cam.y=T.panCamY+dy;
      clampCamera(); applyTransform();
    }
  }
}

// ── touchend / touchcancel ───────────────────────────────────
function onTouchEnd(e){
  e.preventDefault();
  clearLongPress();
  const remaining=e.touches.length;

  if(remaining===0){
    // All fingers lifted
    ENGINE.lastPaintedCell=-1;
    resetDrawState();
    resetPanState();
    resetPinchState();
  } else if(remaining===1){
    // Went from 2 fingers → 1 finger
    // Re-initialise 1-finger state for potential continued pan/draw
    resetPinchState();
    const t=e.touches[0];
    T.startX=t.clientX; T.startY=t.clientY;
    T.moved=false; T.lastCell=-1;
    T.drawing=true;   // ready to draw again with the remaining finger

    // Also set up pan anchor in case finger is on background
    T.panCamX=ENGINE.cam.x; T.panCamY=ENGINE.cam.y;
  }
}

// ============================================================
//  DOUBLE-TAP ZOOM
// ============================================================
function handleDoubleTap(cx,cy){
  const container=document.getElementById('canvas-container');
  const rect=container.getBoundingClientRect();
  const lx=cx-rect.left,ly=cy-rect.top;
  const currentScale=ENGINE.cam.scale;
  const fitScale=getFitScale();
  // Toggle: if zoomed in → zoom out to fit; if at fit → zoom in 3x
  const targetScale=currentScale>fitScale*1.2?fitScale:fitScale*3;
  animateZoomTo(lx,ly,targetScale);
  showRipple(cx,cy);
}

function getFitScale(){
  const art=ENGINE.artwork;
  if(!art)return 1;
  const cw=art.cols*ENGINE.cellSize,ch=art.rows*ENGINE.cellSize;
  return Math.min(ENGINE.containerW/cw,ENGINE.containerH/ch)*0.92;
}

function animateZoomTo(pivotX,pivotY,targetScale){
  const startScale=ENGINE.cam.scale;
  const startX=ENGINE.cam.x,startY=ENGINE.cam.y;
  const newX=pivotX-(pivotX-startX)*(targetScale/startScale);
  const newY=pivotY-(pivotY-startY)*(targetScale/startScale);
  const dur=280,t0=Date.now();
  function step(){
    const t=Math.min(1,(Date.now()-t0)/dur);
    const ease=1-Math.pow(1-t,3);
    ENGINE.cam.scale=startScale+(targetScale-startScale)*ease;
    ENGINE.cam.x=startX+(newX-startX)*ease;
    ENGINE.cam.y=startY+(newY-startY)*ease;
    clampCamera();applyTransform();markAllDirty();needsRender=true;if(!rafId)rafId=requestAnimationFrame(renderLoop);
    if(t<1)requestAnimationFrame(step);
  }
  step();
}

function showRipple(cx,cy){
  const container=document.getElementById('canvas-container');
  const rect=container.getBoundingClientRect();
  const r=document.createElement('div');
  r.className='dt-ripple';
  r.style.left=(cx-rect.left)+'px';
  r.style.top=(cy-rect.top)+'px';
  container.appendChild(r);
  setTimeout(()=>r.remove(),450);
}

// initPinch / handlePinch are now inlined into onTouchStart / onTouchMove above.

function onWheel(e){
  e.preventDefault();
  const container=document.getElementById('canvas-container');
  const rect=container.getBoundingClientRect();
  const mx=e.clientX-rect.left,my=e.clientY-rect.top;
  const delta=e.deltaY>0?0.9:1.1;
  const newScale=Math.min(ENGINE.cam.maxScale,Math.max(ENGINE.cam.minScale,ENGINE.cam.scale*delta));
  ENGINE.cam.x=mx-(mx-ENGINE.cam.x)*(newScale/ENGINE.cam.scale);
  ENGINE.cam.y=my-(my-ENGINE.cam.y)*(newScale/ENGINE.cam.scale);
  ENGINE.cam.scale=newScale;
  clampCamera();applyTransform();markAllDirty();needsRender=true;if(!rafId)rafId=requestAnimationFrame(renderLoop);
}

function screenToCell(sx,sy){
  const art=ENGINE.artwork;
  if(!art)return -1;
  const container=document.getElementById('canvas-container');
  const rect=container.getBoundingClientRect();
  const lx=sx-rect.left,ly=sy-rect.top;
  const cx=(lx-ENGINE.cam.x)/ENGINE.cam.scale,cy=(ly-ENGINE.cam.y)/ENGINE.cam.scale;
  const cs=ENGINE.cellSize;
  const c=Math.floor(cx/cs),r=Math.floor(cy/cs);
  if(c<0||c>=art.cols||r<0||r>=art.rows)return -1;
  return r*art.cols+c;
}

function handleDraw(idx){
  if(idx<0)return;
  const tool=ENGINE.activeTool;
  if(tool==='brush')paintCell(idx);
  else if(tool==='wand')doMagicWand(idx);
  else if(tool==='fill')doFillAll();
  else if(tool==='hint')doHint();
}

// ============================================================
//  GALLERY
// ============================================================
function refreshGallery(){
  const filter=document.querySelector('.filter-chip.active')?.dataset.filter||'all';
  const grid=document.getElementById('gallery-grid');
  const countEl=document.getElementById('gallery-count');
  countEl.textContent=STATE.player.completedArtworks.length+' done';
  let items=ARTWORKS;
  if(filter==='completed')items=ARTWORKS.filter(a=>STATE.player.completedArtworks.includes(a.id));
  else if(filter==='in-progress')items=ARTWORKS.filter(a=>{
    const p=STATE.artworkProgress[a.id];
    return p&&p.filledCount>0&&!STATE.player.completedArtworks.includes(a.id);
  });
  grid.innerHTML='';
  if(!items.length){
    grid.innerHTML=`<div class="empty-gallery">
      <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      <h3>Nothing here yet</h3>
      <p>${filter==='in-progress'?'No artworks in progress.<br>Start one from Home!':'Complete some artworks to see them here!'}</p>
    </div>`;
    return;
  }
  items.forEach(art=>{
    const prog=STATE.artworkProgress[art.id];
    const isComp=STATE.player.completedArtworks.includes(art.id);
    const filled=prog?.filledCount||0;
    const total=art.cols*art.rows;
    const pct=Math.round(filled/total*100);
    const inProgress=prog&&filled>0&&!isComp;
    const item=document.createElement('div');
    item.className='gallery-item';
    item.innerHTML=`
      <div class="gallery-preview">
        <canvas class="mini-canvas gallery-art-canvas" width="130" height="130" data-id="${art.id}"></canvas>
        ${inProgress?`<div class="gallery-continue-badge">Tap to Continue</div>`:''}
      </div>
      <div class="gallery-item-info">
        <h4>${art.title}</h4>
        <div class="gallery-completion">
          <span>${art.category}</span>
          <span class="pct" style="color:${isComp?'var(--green)':'var(--yellow)'}">${pct}%</span>
        </div>
      </div>
    `;
    item.addEventListener('click',()=>openGalleryModal(art));
    grid.appendChild(item);
    requestAnimationFrame(()=>{
      const c=item.querySelector('.gallery-art-canvas');
      if(c)drawMiniCanvas(c,art,prog?.cells);
    });
  });
}

function openGalleryModal(art){
  ENGINE.modalArtId=art.id;
  const prog=STATE.artworkProgress[art.id];
  const isComp=STATE.player.completedArtworks.includes(art.id);
  const filled=prog?.filledCount||0,total=art.cols*art.rows;
  const pct=Math.round(filled/total*100);
  document.getElementById('modal-title').textContent=art.title;
  document.getElementById('modal-status').textContent=isComp?'Complete':filled>0?'In Progress':'Not Started';
  document.getElementById('modal-status').style.color=isComp?'var(--green)':filled>0?'var(--yellow)':'var(--text2)';
  document.getElementById('modal-completion').textContent=pct+'%';
  document.getElementById('modal-xp').textContent=isComp?'+'+art.xpReward+' XP':'—';
  const continueBtn=document.getElementById('modal-continue-btn');
  continueBtn.textContent=isComp?'Paint Again':filled>0?'Continue':'Start';
  const mc=document.getElementById('modal-preview-canvas');
  const sz=Math.min(260,window.innerWidth-80);
  mc.width=sz;mc.height=sz;
  drawMiniCanvas(mc,art,prog?.cells);
  document.getElementById('gallery-modal').classList.add('open');
}

// ============================================================
//  SETTINGS
// ============================================================
function refreshSettings(){
  document.getElementById('s-errors').checked=STATE.settings.errors;
  document.getElementById('s-numbers').checked=STATE.settings.numbers;
  document.getElementById('s-autoselect').checked=STATE.settings.autoselect;
  document.getElementById('total-xp-display').textContent=STATE.player.xp+' XP lifetime';
}

// ============================================================
//  TOAST
// ============================================================
let toastTimer=null;
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  if(toastTimer)clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),2200);
}

// ============================================================
//  RESIZE
// ============================================================
window.addEventListener('resize',()=>{
  if(ENGINE.artwork&&currentScreen==='game-screen'){
    const container=document.getElementById('canvas-container');
    ENGINE.containerW=container.clientWidth;ENGINE.containerH=container.clientHeight;
    centerCamera();requestRender();
  }
});

// ============================================================
//  EVENT BINDINGS
// ============================================================
function bindEvents(){
  setupImport();
  document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>navigateTo(btn.dataset.screen));
  });
  document.getElementById('cat-scroll').addEventListener('click',e=>{
    const chip=e.target.closest('.cat-chip');
    if(!chip)return;
    document.querySelectorAll('.cat-chip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');buildArtworkGrid();
  });
  document.getElementById('daily-play-btn').addEventListener('click',e=>{
    e.stopPropagation();
    const daily=ARTWORKS.find(a=>a.isDaily)||ARTWORKS[0];startGame(daily.id);
  });
  document.getElementById('daily-card').addEventListener('click',()=>{
    const daily=ARTWORKS.find(a=>a.isDaily)||ARTWORKS[0];startGame(daily.id);
  });
  document.getElementById('game-back-btn').addEventListener('click',()=>{
  try{
    if(window.parent&&window.parent!==window&&typeof window.parent.closePixelArt==='function'){
      window.parent.closePixelArt();return;
    }
  }catch(e){}
  navigateTo('home-screen');
});

  // Numbers toggle in topbar
  document.getElementById('btn-toggle-numbers').addEventListener('click',toggleNumbers);

  // Zoom to fit
  document.getElementById('btn-zoom-fit').addEventListener('click',()=>{if(ENGINE.artwork){centerCamera();requestRender();}});

  // Draw / Pan mode buttons
  document.getElementById('mode-draw').addEventListener('click',()=>{
    ENGINE.inputMode='draw';
    document.getElementById('mode-draw').classList.add('active');
    document.getElementById('mode-pan').classList.remove('active');
  });
  document.getElementById('mode-pan').addEventListener('click',()=>{
    ENGINE.inputMode='pan';
    document.getElementById('mode-pan').classList.add('active');
    document.getElementById('mode-draw').classList.remove('active');
  });

  // Tools
  document.getElementById('tool-wand').addEventListener('click',()=>setActiveTool('wand'));
  document.getElementById('tool-fill').addEventListener('click',()=>setActiveTool('fill'));
  document.getElementById('tool-hint').addEventListener('click',()=>setActiveTool('hint'));
  document.getElementById('tool-undo').addEventListener('click',doUndo);
  document.getElementById('tool-redo').addEventListener('click',doRedo);

  // Completion
  document.getElementById('comp-continue-btn').addEventListener('click',()=>{
    document.getElementById('completion-overlay').classList.remove('show');
    navigateTo('gallery-screen');
  });

  // Gallery filter
  document.querySelectorAll('.filter-chip').forEach(chip=>{
    chip.addEventListener('click',()=>{
      document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');refreshGallery();
    });
  });

  // Gallery modal
  document.getElementById('modal-close-btn').addEventListener('click',()=>{
    document.getElementById('gallery-modal').classList.remove('open');
  });
  document.getElementById('modal-continue-btn').addEventListener('click',()=>{
    document.getElementById('gallery-modal').classList.remove('open');
    if(ENGINE.modalArtId)startGame(ENGINE.modalArtId);
  });
  document.getElementById('gallery-modal').addEventListener('click',e=>{
    if(e.target===document.getElementById('gallery-modal'))
      document.getElementById('gallery-modal').classList.remove('open');
  });

  // Settings toggles
  ['errors','numbers','autoselect'].forEach(key=>{
    document.getElementById('s-'+key).addEventListener('change',e=>{
      STATE.settings[key]=e.target.checked;saveState();
      if(key==='numbers'){
        ENGINE.numbersVisible=e.target.checked;
        updateNumbersToggleBtn();
        if(ENGINE.artwork)requestRender();
      }
    });
  });

  // Reset
  document.getElementById('reset-btn').addEventListener('click',()=>{
    if(confirm('Reset all progress? This cannot be undone.')){
      localStorage.removeItem('pixelhue_v2');
      STATE={player:{xp:0,level:1,streak:0,lastPlayDate:null,completedArtworks:[],totalCells:0,correctCells:0},settings:{errors:true,numbers:true,autoselect:true},currentArtworkId:null,artworkProgress:{}};
      ENGINE.artwork=null;
      refreshSettings();refreshHomeScreen();showToast('Progress reset!');
    }
  });

  setupInput();
}

// ============================================================
//  INIT
// ============================================================
// ============================================================
//  IMAGE IMPORT SYSTEM
//  Converts any image → pixel art color-by-number artwork
//  Supports up to 250x250 grid and 96 colors
// ============================================================
const IMPORT = {
  sourceImg: null,
  pendingArtwork: null,
  previewDebounce: null,
};

function openImportModal(){
  document.getElementById('import-modal').classList.add('show');
}
function closeImportModal(){
  document.getElementById('import-modal').classList.remove('show');
}

function setupImport(){
  document.getElementById('open-import-btn').addEventListener('click', openImportModal);
  document.getElementById('import-close-btn').addEventListener('click', closeImportModal);
  document.getElementById('import-modal').addEventListener('click', e=>{
    if(e.target===document.getElementById('import-modal')) closeImportModal();
  });

  const fileInput = document.getElementById('import-file-input');
  const dropZone  = document.getElementById('drop-zone');

  fileInput.addEventListener('change', e=>{
    if(e.target.files[0]) loadImportFile(e.target.files[0]);
  });
  dropZone.addEventListener('dragover', e=>{e.preventDefault();dropZone.classList.add('hover');});
  dropZone.addEventListener('dragleave', ()=>dropZone.classList.remove('hover'));
  dropZone.addEventListener('drop', e=>{
    e.preventDefault();dropZone.classList.remove('hover');
    if(e.dataTransfer.files[0]) loadImportFile(e.dataTransfer.files[0]);
  });

  // Sliders + select → re-run preview with debounce
  ['grid-cols','grid-rows','max-colors','dither-mode'].forEach(id=>{
    document.getElementById(id).addEventListener('input', ()=>{
      if(id==='grid-cols') document.getElementById('grid-cols-val').textContent=document.getElementById('grid-cols').value;
      if(id==='grid-rows') document.getElementById('grid-rows-val').textContent=document.getElementById('grid-rows').value;
      if(id==='max-colors') document.getElementById('max-colors-val').textContent=document.getElementById('max-colors').value;
      if(IMPORT.sourceImg) scheduleImportPreview();
    });
  });

  document.getElementById('btn-start-import').addEventListener('click', ()=>{
    if(IMPORT.pendingArtwork) launchImportedArtwork();
  });
}

function loadImportFile(file){
  const reader = new FileReader();
  reader.onload = e=>{
    const img = new Image();
    img.onload = ()=>{
      IMPORT.sourceImg = img;
      document.getElementById('import-source-img').src = e.target.result;
      document.getElementById('import-preview').classList.add('show');
      // Auto-set grid size based on aspect ratio (default 32 wide)
      const aspect = img.width / img.height;
      const defaultCols = 32;
      const defaultRows = Math.max(8, Math.min(250, Math.round(defaultCols / aspect)));
      document.getElementById('grid-cols').value = defaultCols;
      document.getElementById('grid-rows').value = defaultRows;
      document.getElementById('grid-cols-val').textContent = defaultCols;
      document.getElementById('grid-rows-val').textContent = defaultRows;
      document.getElementById('import-title-input').value = file.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ');
      scheduleImportPreview();
    };
    img.crossOrigin='anonymous';
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function scheduleImportPreview(){
  clearTimeout(IMPORT.previewDebounce);
  IMPORT.previewDebounce = setTimeout(runImportPreview, 180);
}

function runImportPreview(){
  if(!IMPORT.sourceImg) return;
  const cols     = parseInt(document.getElementById('grid-cols').value);
  const rows     = parseInt(document.getElementById('grid-rows').value);
  const maxCol   = parseInt(document.getElementById('max-colors').value);
  const dither   = document.getElementById('dither-mode').value;

  setProcessing(true, 'Generating pixel art...');

  // Use a short timeout so the UI can repaint before heavy work
  setTimeout(()=>{
    try{
      const artwork = convertImageToArtwork(IMPORT.sourceImg, cols, rows, maxCol, dither);
      IMPORT.pendingArtwork = artwork;
      drawImportPreview(artwork);
      updateImportInfo(artwork);
      document.getElementById('btn-start-import').disabled = false;
    }catch(err){
      showToast('Conversion failed — try a simpler image');
    }
    setProcessing(false);
  }, 20);
}

function setProcessing(on, label=''){
  const ov = document.getElementById('processing-overlay');
  document.getElementById('processing-label').textContent = label;
  ov.classList.toggle('show', on);
}

// ── Core conversion ──────────────────────────────────────────
function convertImageToArtwork(img, cols, rows, maxColors, dither, titleOverride){
  // 1. Downscale image to grid size using an offscreen canvas
  // Multi-step downscale for better quality (halve each time until near target)
  let src = img, srcW = img.width, srcH = img.height;
  while(srcW > cols*2 || srcH > rows*2){
    const step = document.createElement('canvas');
    step.width  = Math.max(cols, Math.floor(srcW/2));
    step.height = Math.max(rows, Math.floor(srcH/2));
    const sc = step.getContext('2d');
    sc.imageSmoothingEnabled = true;
    sc.imageSmoothingQuality = 'high';
    sc.drawImage(src, 0, 0, step.width, step.height);
    src = step; srcW = step.width; srcH = step.height;
  }
  const offscreen = document.createElement('canvas');
  offscreen.width  = cols;
  offscreen.height = rows;
  const ctx = offscreen.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, cols, rows);
  const raw = ctx.getImageData(0, 0, cols, rows);

  // 2. Build pixel array [{r,g,b}]
  let pixels = [];
  for(let i=0;i<raw.data.length;i+=4){
    pixels.push({r:raw.data[i], g:raw.data[i+1], b:raw.data[i+2]});
  }

  // 3. Quantize colors (median cut → k-means refinement)
  let palette = medianCut(pixels, maxColors);
  // K-means: refine palette with 8 iterations for much better color accuracy
  palette = kMeansRefine(pixels, palette, 8);

  // 4. Apply dithering & map every pixel to nearest palette color
  const grid2d = [];
  const pixelsCopy = pixels.map(p=>({...p}));

  for(let row=0;row<rows;row++){
    const gridRow = [];
    for(let col=0;col<cols;col++){
      const idx = row*cols+col;
      const px  = pixelsCopy[idx];
      const nearest = nearestColor(px, palette);
      const colorIdx = nearest.idx+1; // 1-based
      gridRow.push(colorIdx);

      if(dither!=='none'){
        const er=px.r-nearest.r, eg=px.g-nearest.g, eb=px.b-nearest.b;
        if(dither==='floyd'){
          diffuse(pixelsCopy, cols, rows, idx, er, eg, eb, col, row);
        } else {
          // Ordered (Bayer 4x4)
          const bayer=[[ 0, 8, 2,10],[12, 4,14, 6],[ 3,11, 1, 9],[15, 7,13, 5]];
          const threshold=(bayer[row%4][col%4]/16-0.5)*30;
          pixelsCopy[idx]={r:clamp255(px.r+threshold),g:clamp255(px.g+threshold),b:clamp255(px.b+threshold)};
        }
      }
    }
    grid2d.push(gridRow);
  }

  // 5. Build color map (1-based id → hex)
  const colors={};
  palette.forEach((c,i)=>{ colors[i+1]=rgbToHex(c.r,c.g,c.b); });

  // 6. Prune unused color ids
  const used=new Set(grid2d.flat());
  const remap={};let newId=1;
  const newColors={};
  [...used].sort((a,b)=>a-b).forEach(old=>{ remap[old]=newId; newColors[newId]=colors[old]; newId++; });
  const finalGrid=grid2d.map(row=>row.map(id=>remap[id]));

  const artId='custom_'+Date.now();
  return {
    id: artId,
    title: (typeof titleOverride!=='undefined' ? titleOverride : (document.getElementById('import-title-input')?.value.trim()||'My Artwork')),
    category: 'custom',
    difficulty: Math.ceil(Object.keys(newColors).length/20),
    xpReward: cols*rows,
    desc: `${cols}×${rows} custom pixel art`,
    cols, rows,
    colors: newColors,
    grid: finalGrid,
    isCustom: true,
  };
}

// Floyd-Steinberg error diffusion
function diffuse(pixels, cols, rows, idx, er, eg, eb, col, row){
  // Standard Floyd-Steinberg error diffusion offsets
  // [rowOffset, colOffset, weight]
  const w=[[0,1,7/16],[1,-1,3/16],[1,0,5/16],[1,1,1/16]];
  w.forEach(([dr,dc,wt])=>{
    const nr=row+dr, nc=col+dc;
    if(nr>=0&&nr<rows&&nc>=0&&nc<cols){
      const ni=nr*cols+nc;
      pixels[ni].r=clamp255(pixels[ni].r+er*wt);
      pixels[ni].g=clamp255(pixels[ni].g+eg*wt);
      pixels[ni].b=clamp255(pixels[ni].b+eb*wt);
    }
  });
}

function clamp255(v){return Math.max(0,Math.min(255,Math.round(v)));}
function rgbToHex(r,g,b){return'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');}
function colorDist(a,b){
  // Weighted perceptual RGB distance — human eye is most sensitive to green
  const dr=a.r-b.r, dg=a.g-b.g, db=a.b-b.b;
  return 2*dr*dr + 4*dg*dg + 3*db*db;
}
function nearestColor(px, palette){
  let best=null,bestD=Infinity;
  palette.forEach((c,i)=>{const d=colorDist(px,c);if(d<bestD){bestD=d;best={...c,idx:i};}});
  return best;
}

// ── K-means palette refinement ───────────────────────────────
// Runs after median cut to iteratively improve centroid placement
function kMeansRefine(pixels, palette, iterations){
  // Sample for speed
  const MAX_SAMPLE = 6000;
  const sample = pixels.length > MAX_SAMPLE
    ? pixels.filter((_,i)=>i%Math.floor(pixels.length/MAX_SAMPLE)===0)
    : pixels;

  let centroids = palette.map(p=>({r:p.r,g:p.g,b:p.b}));

  for(let iter=0;iter<iterations;iter++){
    // Assign each pixel to nearest centroid
    const clusters = centroids.map(()=>({r:0,g:0,b:0,count:0}));
    sample.forEach(px=>{
      let best=0, bestD=Infinity;
      centroids.forEach((c,i)=>{
        const d=colorDist(px,c);
        if(d<bestD){bestD=d;best=i;}
      });
      clusters[best].r+=px.r;
      clusters[best].g+=px.g;
      clusters[best].b+=px.b;
      clusters[best].count++;
    });
    // Recompute centroids
    let changed=false;
    clusters.forEach((cl,i)=>{
      if(cl.count===0) return; // keep old centroid if no pixels assigned
      const nr=Math.round(cl.r/cl.count);
      const ng=Math.round(cl.g/cl.count);
      const nb=Math.round(cl.b/cl.count);
      if(nr!==centroids[i].r||ng!==centroids[i].g||nb!==centroids[i].b) changed=true;
      centroids[i]={r:nr,g:ng,b:nb};
    });
    if(!changed) break; // converged early
  }
  return centroids;
}

// ── Median cut color quantization (fixed — no early exit) ────
function medianCut(pixels, maxColors){
  // Sample pixels for speed on large grids (max 8000 samples)
  let sample = pixels;
  if(pixels.length > 8000){
    const step = Math.floor(pixels.length / 8000);
    sample = pixels.filter((_,i)=>i%step===0);
  }

  let buckets = [sample.slice()];

  // Keep splitting until we have enough buckets or can't split anymore
  while(buckets.length < maxColors){
    // Find bucket with highest volume (product of ranges) — better than just span
    let bestIdx = 0, bestScore = -1;
    buckets.forEach((b,i)=>{
      if(b.length < 2) return;
      const rng = channelRange(b);
      // Score = range * bucket size so large diverse buckets split first
      const score = rng.span * b.length;
      if(score > bestScore){ bestScore = score; bestIdx = i; }
    });
    if(bestScore <= 0) break; // all buckets have 1 pixel, can't split more

    const bucket = buckets.splice(bestIdx, 1)[0];
    const range  = channelRange(bucket);
    bucket.sort((a,b)=>a[range.ch]-b[range.ch]);
    const mid = Math.floor(bucket.length / 2);
    buckets.push(bucket.slice(0, mid));
    buckets.push(bucket.slice(mid));
  }

  return buckets.filter(b=>b.length>0).map(avgColor);
}

function channelRange(pixels){
  let rMin=255,rMax=0,gMin=255,gMax=0,bMin=255,bMax=0;
  pixels.forEach(p=>{
    rMin=Math.min(rMin,p.r);rMax=Math.max(rMax,p.r);
    gMin=Math.min(gMin,p.g);gMax=Math.max(gMax,p.g);
    bMin=Math.min(bMin,p.b);bMax=Math.max(bMax,p.b);
  });
  const ranges={r:rMax-rMin,g:gMax-gMin,b:bMax-bMin};
  const ch=Object.entries(ranges).reduce((a,b)=>b[1]>a[1]?b:a)[0];
  return{ch,span:ranges[ch]};
}

function avgColor(pixels){
  const n=pixels.length||1;
  return{
    r:Math.round(pixels.reduce((s,p)=>s+p.r,0)/n),
    g:Math.round(pixels.reduce((s,p)=>s+p.g,0)/n),
    b:Math.round(pixels.reduce((s,p)=>s+p.b,0)/n),
  };
}

// ── Preview canvas ────────────────────────────────────────────
function drawImportPreview(art){
  const canvas = document.getElementById('import-preview-canvas');
  const maxPx  = 160;
  const scale  = Math.max(1, Math.min(Math.floor(maxPx/art.cols), Math.floor(maxPx/art.rows)));
  canvas.width  = art.cols*scale;
  canvas.height = art.rows*scale;
  const ctx = canvas.getContext('2d');
  for(let r=0;r<art.rows;r++){
    for(let c=0;c<art.cols;c++){
      ctx.fillStyle = art.colors[art.grid[r][c]];
      ctx.fillRect(c*scale, r*scale, scale, scale);
    }
  }
}

function updateImportInfo(art){
  const colorCount = Object.keys(art.colors).length;
  const cellCount  = art.cols*art.rows;
  document.getElementById('import-info-row').innerHTML=`
    <span class="import-badge">${art.cols}×${art.rows}</span>
    <span class="import-badge">${colorCount} colors</span>
    <span class="import-badge">${cellCount.toLocaleString()} cells</span>
    <span class="import-badge">+${art.xpReward} XP</span>
  `;
}

function launchImportedArtwork(){
  const art = IMPORT.pendingArtwork;
  if(!art) return;
  art.title = document.getElementById('import-title-input').value.trim() || art.title;
  // Push into ARTWORKS array so gallery + home see it
  const existing = ARTWORKS.findIndex(a=>a.id===art.id);
  if(existing>=0) ARTWORKS.splice(existing,1,art);
  else ARTWORKS.push(art);
  // Persist the custom artwork definition in localStorage
  saveCustomArtworks();
  closeImportModal();
  startGame(art.id);
}

function saveCustomArtworks(){
  const customs = ARTWORKS.filter(a=>a.isCustom);
  try{localStorage.setItem('ph_custom_artworks', JSON.stringify(customs));}catch(e){}
}

// ── DEV API — called by Robert's Heartly dev panel ──────────
// Robert passes a File object; the game converts + saves it.
// Callback(true, title) on success, callback(false, error) on failure.
window.devImportArtwork = function(file, options, callback){
  const title    = options.title    || file.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ');
  const cols     = options.cols     || 32;
  const rows     = options.rows     || 32;
  const maxColors= options.maxColors|| 16;
  const dither   = options.dither   || 'floyd';
  const category = options.category || 'custom';

  const reader = new FileReader();
  reader.onload = e=>{
    const img = new Image();
    img.onload = ()=>{
      try{
        const art = convertImageToArtwork(img, cols, rows, maxColors, dither, title);
        art.title    = title;
        art.category = category;
        art.isCustom = true;

        // Push into live ARTWORKS array
        const existing = ARTWORKS.findIndex(a=>a.id===art.id);
        if(existing>=0) ARTWORKS.splice(existing,1,art);
        else ARTWORKS.push(art);

        saveCustomArtworks();
        // Refresh gallery if visible
        if(typeof renderGallery==='function') renderGallery();
        if(typeof renderHomeGallery==='function') renderHomeGallery();
        if(callback) callback(true, art.title);
      }catch(err){
        if(callback) callback(false, err.message);
      }
    };
    img.onerror = ()=>{ if(callback) callback(false, 'Image load failed'); };
    img.crossOrigin='anonymous';
    img.src = e.target.result;
  };
  reader.onerror = ()=>{ if(callback) callback(false, 'File read failed'); };
  reader.readAsDataURL(file);
};

// List all custom artworks (for Robert's dev panel to display)
window.devListArtworks = function(){
  return ARTWORKS.filter(a=>a.isCustom).map(a=>({id:a.id,title:a.title,cols:a.cols,rows:a.rows,colors:Object.keys(a.colors).length}));
};

// Remove a custom artwork by id
window.devRemoveArtwork = function(id){
  const idx = ARTWORKS.findIndex(a=>a.id===id);
  if(idx>=0){ ARTWORKS.splice(idx,1); saveCustomArtworks(); if(typeof renderHomeGallery==='function') renderHomeGallery(); }
};

function loadCustomArtworks(){
  try{
    const raw = localStorage.getItem('ph_custom_artworks');
    if(raw){
      const customs = JSON.parse(raw);
      customs.forEach(art=>{ if(!ARTWORKS.find(a=>a.id===art.id)) ARTWORKS.push(art); });
    }
  }catch(e){}
}

function init(){
  loadState();
  loadCustomArtworks();
  const bar=document.getElementById('loading-bar');
  let w=0;
  const iv=setInterval(()=>{
    w+=Math.random()*25+10;
    bar.style.width=Math.min(w,95)+'%';
    if(w>=95){
      clearInterval(iv);
      setTimeout(()=>{
        bar.style.width='100%';
        setTimeout(()=>{
          document.getElementById('loading-screen').classList.add('hidden');
          document.getElementById('home-screen').classList.add('active');
          refreshHomeScreen();
          bindEvents();
          if(STATE.currentArtworkId&&STATE.artworkProgress[STATE.currentArtworkId]){
            const art=ARTWORKS.find(a=>a.id===STATE.currentArtworkId);
            if(art&&!STATE.player.completedArtworks.includes(STATE.currentArtworkId)){
              setTimeout(()=>showToast('Resume "'+art.title+'" from Gallery'),700);
            }
          }
        },280);
      },300);
    }
  },100);
}

document.addEventListener('DOMContentLoaded',init);
