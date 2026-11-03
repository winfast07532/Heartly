/* Live Heartly adapter: no sandbox balance, import, reset or clock controls. */
(function(){
  'use strict';
  const host=parent!==window&&parent.HeartlyPet;
  function load(){
    if(!host)throw Error('Open Little Home from Heartly’s Play screen.');
    const raw=host.snapshot(),s=raw.petState?PetCore.validate(raw.petState):PetCore.empty(Date.now());
    s.balance=raw.balance;s.clockOffset=0;
    return PetCore.advance(s,host.now());
  }
  window.PetAdapter={mode:'heartly',id:()=>Math.floor(host.now())+'_'+crypto.randomUUID(),now:()=>host?.now()||Date.now(),load,
    execute:command=>host.execute(command,PetConfig.version),
    subscribe(callback){const listener=()=>callback();parent.addEventListener('heartly-pet-state',listener);window.addEventListener('pagehide',()=>parent.removeEventListener('heartly-pet-state',listener),{once:true});return ()=>parent.removeEventListener('heartly-pet-state',listener);}
  };
})();
