/* Pure horizontal movement planner. The full cat frame never crosses furniture. */
(function(root){
  'use strict';
  const L=root.PetLayout||(typeof require==='function'?require('./layout.js'):null);
  const CENTER=320,MIN=L.PET.w/2+12,MAX=L.WIDTH-L.PET.w/2-12;
  function safe(center,placements=[]){
    if(!Number.isFinite(center)||center<MIN||center>MAX)return false;
    const frame={x:center-L.PET.w/2,y:L.PET.y,w:L.PET.w,h:L.PET.h};
    return !placements.some(p=>L.overlaps(frame,p));
  }
  function reachable(start,target,placements=[]){
    if(!safe(start,placements))start=CENTER;
    if(!safe(start,placements))return null;
    const direction=Math.sign(target-start);if(!direction)return start;
    const end=Math.max(MIN,Math.min(MAX,target));let last=start;
    for(let next=start+direction*4;direction>0?next<=end:next>=end;next+=direction*4){
      if(!safe(next,placements))return last;
      last=next;
    }
    return safe(end,placements)?end:last;
  }
  const api={CENTER,MIN,MAX,safe,reachable};
  if(typeof module!=='undefined')module.exports=api;else root.PetMovement=api;
})(typeof window!=='undefined'?window:globalThis);
