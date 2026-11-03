/* One shared cat, one Heartly wallet, one backup snapshot. */
(function(){
  'use strict';
  let busy=false,offset=0,returnFocus=null;
  const notify=()=>window.dispatchEvent(new Event('heartly-pet-state'));
  window.petCloudAcknowledged=function(data){
    if((data.petState?.revision||0)<(petState?.revision||0))return;
    // Account for pet purchases made while this device was saving another feature.
    const total=Number(data.petWalletTotal||0);
    ptsVal+=total-petWalletTotal;petWalletTotal=total;petState=data.petState||null;
    const earned=Number(data.petEarnedTotal||0);totalPtsEarned+=earned-petEarnedTotal;petEarnedTotal=earned;
    const el=document.getElementById('pts-display');if(el)el.textContent=Math.floor(ptsVal).toLocaleString();
    notify();
  };
  window.HeartlyPet={
    snapshot:()=>({petState:petState?structuredClone(petState):null,balance:ptsVal}),
    now:()=>Date.now()+offset,
    async execute(command,configVersion){
      if(busy)throw Error('Your previous action is still saving.');
      if(!currentUser||!_realDataConfirmed||!navigator.onLine)throw Error('Reconnect to Heartly to care for your cat or spend points.');
      busy=true;
      try{
        const token=await window.HeartlyAuth.token();
        if(command.kind==='purchase'){
          const deadline=Date.now()+10000;
          while(_isPushing && Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,50));
          if(_isPushing || await saveState(true)!==true)throw Error('Heartly could not sync your points. Please try again.');
        }
        const pendingKey='heartly_pet_pending_action';
        const pending=JSON.parse(localStorage.getItem(pendingKey)||'null');
        const request=pending||{command,configVersion};
        localStorage.setItem(pendingKey,JSON.stringify(request));
        const response=await fetch(SUPABASE_URL+'/functions/v1/pet-action',{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_KEY,Authorization:'Bearer '+token},body:JSON.stringify(request),signal:AbortSignal.timeout(20000)});
        const result=await response.json();
        if(!response.ok||result.error){if(response.status<500)localStorage.removeItem(pendingKey);throw Error(result.error||'Your action could not be saved.');}
        localStorage.removeItem(pendingKey);
        offset=result.serverNow-Date.now();
        // Realtime may already have delivered this same transaction.
        window.petCloudAcknowledged(result);
        // Cache the newly acknowledged fields without causing a second cloud write.
        try{const cached=JSON.parse(localStorage.getItem('heartly_v1')||'{}');Object.assign(cached,{petState,petWalletTotal,petEarnedTotal,ptsVal,totalPtsEarned});localStorage.setItem('heartly_v1',JSON.stringify(cached));}catch(_){}
        if(pending&&pending.command.id!==command.id)result.message='Your previous action was recovered. Review your room before trying another action.';
        return result;
      }finally{busy=false;}
    }
  };
  window.openPetGame=async function(){
    if(!await window.HeartlyAuth.require())return;
    if(!currentUser||!_realDataConfirmed){if(typeof T==='function')T('Let Heartly finish syncing, then open Little Home.');return;}
    returnFocus=document.activeElement;
    const overlay=document.getElementById('pet-overlay');overlay.hidden=false;
    document.getElementById('pet-frame').src='pet/index.html';
    document.getElementById('close-pet').focus();
  };
  window.closePetGame=async function(){
    if(busy){if(typeof T==='function')T('Saving your pet—one moment.');return;}
    const frame=document.getElementById('pet-frame');
    try{await frame.contentWindow?.PetRoomView?.close();frame.contentWindow?.document.querySelectorAll('dialog[open]').forEach(d=>d.close());}catch(_){}
    document.getElementById('pet-overlay').hidden=true;frame.src='about:blank';
    if(typeof applyBackgroundBlur==='function')applyBackgroundBlur(document.hidden);
    returnFocus?.focus({preventScroll:true});
  };
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('pet-overlay').hidden)window.closePetGame();});
})();
