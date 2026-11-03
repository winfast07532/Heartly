/* A room-only view with native fullscreen where available and a fixed fallback. */
(function(){
  'use strict';
  const room=document.getElementById('room'),tools=document.querySelector('.room-tools');
  const button=document.createElement('button');button.id='view-room-only';button.className='secondary';button.type='button';button.textContent='Full screen';button.setAttribute('aria-label','View only the room in full screen');tools.append(button);
  const theater=document.createElement('section');theater.id='room-only';theater.hidden=true;theater.setAttribute('role','dialog');theater.setAttribute('aria-modal','true');theater.setAttribute('aria-label','Room view');
  const ambient=document.createElement('canvas');ambient.id='room-only-ambient';ambient.width=640;ambient.height=480;ambient.setAttribute('aria-hidden','true');
  const label=document.createElement('span');label.id='room-only-label';
  const exit=document.createElement('button');exit.id='room-only-exit';exit.type='button';exit.textContent='Close ×';exit.setAttribute('aria-label','Close room view');
  theater.append(ambient,label,exit);document.body.append(theater);
  const home=room.parentNode,after=room.nextSibling,shell=document.querySelector('.app-shell');let active=false,scrollY=0;
  async function open(){
    if(active||!PetGame.state?.pet)return;
    window.PetDesigner?.close();window.PetRoomLife?.reset();scrollY=window.scrollY;active=true;
    theater.hidden=false;theater.append(room);label.textContent=PetGame.state.pet.name+'’s room';
    document.documentElement.classList.add('room-only-open');shell.inert=true;
    exit.focus({preventScroll:true});PetStudio.drawRoom();
    ambient.getContext('2d').drawImage(document.getElementById('room-scene'),0,0);
    if(typeof theater.requestFullscreen==='function'&&document.fullscreenEnabled){try{await theater.requestFullscreen();}catch(_){/* Room-only view still works. */}}
  }
  async function close(){
    if(!active)return;active=false;
    if(document.fullscreenElement===theater){try{await document.exitFullscreen();}catch(_){}}
    home.insertBefore(room,after);theater.hidden=true;document.documentElement.classList.remove('room-only-open');shell.inert=false;
    PetStudio.drawRoom();window.scrollTo(0,scrollY);button.focus({preventScroll:true});
  }
  button.onclick=open;exit.onclick=close;
  document.addEventListener('fullscreenchange',()=>{if(active&&document.fullscreenElement!==theater)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){e.preventDefault();close();}});
  window.addEventListener('pet-route',e=>{if(active&&e.detail.view!=='room')close();});
  window.PetRoomView={get active(){return active;},open,close};
})();
