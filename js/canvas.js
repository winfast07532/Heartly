/* ═══════════════════════════
   CANVAS BACKGROUND
   Exact mockup match:
   • Large bright rose/pink bloom centered at top
   • Fades to near-black purple at bottom
   • Soft drifting orbs add depth
   • Twinkling sparkle particles
═══════════════════════════ */
(function(){
  const cv=document.getElementById('bgc'), cx=cv.getContext('2d');
  cv.width=window.innerWidth; cv.height=window.innerHeight;
  window.addEventListener('resize',()=>{cv.width=window.innerWidth;cv.height=window.innerHeight;});

  // Orbs — responsive positions as fractions of screen
  const W=()=>cv.width, H=()=>cv.height;
  const orbBase=[
    {fx:.5, fy:.08, fr:.30,a:.70,vx:.14,vy:.09},
    {fx:.79,fy:.15, fr:.22,a:.40,vx:-.11,vy:.12},
    {fx:.20,fy:.21, fr:.19,a:.32,vx:.09,vy:-.10},
    {fx:.56,fy:.41, fr:.20,a:.28,vx:-.09,vy:.08},
    {fx:.36,fy:.68, fr:.16,a:.20,vx:.07,vy:-.07},
    {fx:.71,fy:.85, fr:.14,a:.15,vx:-.06,vy:.06},
  ];
  function getOrbs(){
    const theme = (typeof window.getCanvasTheme==='function')?window.getCanvasTheme():'rose';
    const cols = (window.THEMES&&window.THEMES[theme])?window.THEMES[theme].orbs:window.THEMES.rose.orbs;
    return orbBase.map((o,i)=>({...o,col:cols[i]||cols[0]}));
  }

  // Sparkles
  const PTS=36;
  const pts=Array.from({length:PTS},(_,i)=>({
    x:Math.random()*cv.width, y:Math.random()*cv.height,
    r:.5+Math.random()*1.5,
    vx:(Math.random()-.5)*.22, vy:(Math.random()-.5)*.22,
    phase:Math.random()*Math.PI*2,
    spd:.01+Math.random()*.018,
    rose:i%6===0,
  }));

  // Throttle to 30fps — halves GPU load on mobile
  const FPS=30, INTERVAL=1000/FPS;
  let lastT=0, frameCount=0;

  function draw(t){
    requestAnimationFrame(draw);
    // Skip frame if not enough time has passed (30fps cap)
    if(t-lastT < INTERVAL) return;
    lastT=t;
    frameCount++;
    // Skip entirely if page is hidden (backgrounded)
    if(document.hidden) return;

    cx.clearRect(0,0,W(),H());
    // Deep base
    const _tid=(typeof window.getCanvasTheme==='function')?window.getCanvasTheme():'rose';
    const _stops=(window.THEMES&&window.THEMES[_tid])?window.THEMES[_tid].bgStops:['#1c0228','#120018','#07000e'];
    const bg=cx.createLinearGradient(0,0,0,H());
    bg.addColorStop(0,_stops[0]);
    bg.addColorStop(.4,_stops[1]);
    bg.addColorStop(1,_stops[2]);
    cx.fillStyle=bg; cx.fillRect(0,0,W(),H());

    // Orbs
    const orbs=getOrbs();
    orbs.forEach(o=>{
      const px=o.fx*W()+Math.sin(t*.00022*o.vx*7)*28;
      const py=o.fy*H()+Math.cos(t*.00022*o.vy*6)*20;
      const r=o.fr*Math.min(W(),H()*1.2);
      const rg=cx.createRadialGradient(px,py,0,px,py,r);
      rg.addColorStop(0,`rgba(${o.col},${o.a})`);
      rg.addColorStop(.6,`rgba(${o.col},${o.a*.3})`);
      rg.addColorStop(1,'rgba(0,0,0,0)');
      cx.fillStyle=rg;
      cx.beginPath();cx.arc(px,py,r,0,Math.PI*2);cx.fill();
    });

    // Sparkles — always update position, draw every frame
    pts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.phase+=p.spd;
      if(p.x<0)p.x=W();if(p.x>W())p.x=0;
      if(p.y<0)p.y=H();if(p.y>H())p.y=0;
      const a=(Math.sin(p.phase)*.5+.5)*.7;
      const s=1+Math.sin(p.phase*.9)*.35;
      cx.beginPath();cx.arc(p.x,p.y,p.r*s,0,Math.PI*2);
      const _tc=(typeof window.getCanvasTheme==='function')?window.getCanvasTheme():'rose';
      const _sc=_tc==='royal'?`rgba(107,112,220,${a})`:`rgba(230,100,140,${a})`;
      cx.fillStyle=p.rose?_sc:`rgba(255,255,255,${a*.65})`;
      cx.fill();
    });
  }
  requestAnimationFrame(draw);
})();


