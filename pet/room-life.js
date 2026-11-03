/* Small, collision-safe room journeys and contextual furniture reactions. */
(function(){
  'use strict';
  const G=PetGame,M=PetMovement,L=PetLayout,room=document.getElementById('room'),cat=document.getElementById('pet-sprite');
  let center=M.CENTER,walking=false,timer=0,nextWander=performance.now()+9000,lastFrame=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function stop(){clearTimeout(timer);walking=false;cat.classList.remove('walking');}
  function place(x){center=x;cat.style.left=(x/L.WIDTH*100)+'%';room.style.setProperty('--cat-x',(x/L.WIDTH*100)+'%');}
  function snap(x){cat.style.transition='none';place(x);void cat.offsetWidth;cat.style.transition='';}
  function visibleCenter(){const roomBox=room.getBoundingClientRect(),box=cat.getBoundingClientRect();return roomBox.width?(box.left+box.width/2-roomBox.left)/roomBox.width*L.WIDTH:center;}
  function move(target,after){
    const state=G.state;if(!state?.pet||state.pet.sleeping||state.pet.vacation||document.getElementById('room-view').hidden||window.PetDesigner?.editing)return false;
    const wasWalking=walking,here=wasWalking?visibleCenter():center;stop();
    if(!M.safe(here,state.placements)){snap(M.CENTER);}else if(wasWalking)snap(here);
    const end=M.reachable(center,target,state.placements);if(end===null)return false;
    const distance=Math.abs(end-center);if(distance<5){after?.();nextWander=performance.now()+9000;return true;}
    const duration=reduced.matches?0:Math.max(480,Math.min(1900,distance*8));
    cat.dataset.facing=end<center?'left':'right';cat.style.setProperty('--walk-duration',duration+'ms');
    walking=true;cat.classList.add('walking');place(end);
    timer=setTimeout(()=>{walking=false;cat.classList.remove('walking');nextWander=performance.now()+9000+Math.random()*5000;after?.();},duration+40);
    return true;
  }
  function visit(rect,respond){
    if(!rect)return false;
    const midpoint=rect.x+rect.w/2;
    return move(midpoint,respond);
  }
  function care(kind,respond){
    const state=G.state;if(!state?.pet||document.getElementById('room-view').hidden)return false;
    if(kind==='feed'||kind==='use'||kind==='water')return move(L.BOWL.x+L.BOWL.w+L.PET.w/2+L.GAP+10,respond);
    if(kind==='play'){
      const toy=state.placements.find(p=>/toy|yarn|mouse/i.test(PetCore.CATALOG.find(i=>i.id===p.itemId)?.category||p.itemId));
      if(toy)return visit(toy,respond);
      return move(390,respond);
    }
    if(kind==='sleep'){
      stop();snap(M.CENTER);return false;
    }
    return false;
  }
  function frame(now,reacting){
    if(now-lastFrame<250)return;lastFrame=now;
    const state=G.state;
    if(!state?.pet||state.pet.sleeping||state.pet.vacation||document.hidden||document.querySelector('dialog[open]')||document.getElementById('room-view').hidden||window.PetDesigner?.editing||walking||reacting||now<nextWander)return;
    const targets=[320,365,410,455,500];const options=targets.filter(x=>Math.abs(x-center)>45&&M.reachable(center,x,state.placements)!==null);
    if(options.length)move(options[Math.floor(Math.random()*options.length)]);
    else nextWander=now+10000;
  }
  window.addEventListener('pet-route',e=>{if(e.detail.view!=='room'){stop();snap(M.CENTER);}});
  window.addEventListener('pet-render',()=>{if(walking&&!M.safe(center,G.state?.placements||[])){stop();snap(M.CENTER);}});
  document.getElementById('arrange-room').addEventListener('click',()=>{if(window.PetDesigner?.editing){stop();snap(M.CENTER);}});
  place(center);
  window.PetRoomLife={get walking(){return walking;},visit,care,frame,reset(){stop();snap(M.CENTER);}};
})();
