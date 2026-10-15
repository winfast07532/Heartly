/* Pixel Art shares Heartly's existing couple_state JSON sync; no second login,
   exposed secrets, or new public table. The existing couple access model applies. */
(function () {
  'use strict';
  const C = window.PixelCore;
  let imported = false;
  let unconfirmedRewards=new Set();
  try { unconfirmedRewards=new Set(JSON.parse(localStorage.getItem('heartly_pixel_pending_rewards')||'[]')); } catch(_) {}
  function rememberPendingRewards(){
    try {localStorage.setItem('heartly_pixel_pending_rewards',JSON.stringify([...unconfirmedRewards]));}catch(_){}
  }
  let pendingAssists={};
  try{pendingAssists=JSON.parse(localStorage.getItem('heartly_pixel_pending_assists')||'{}');}catch(_){}
  function rememberAssists(){localStorage.setItem('heartly_pixel_pending_assists',JSON.stringify(pendingAssists));}
  window.getPixelArtBalance=()=>ptsVal;
  window.spendPixelArtAbility=function(kind,artId){
    const cost={hint:50,fill:100}[kind];
    const art=pixelArtState.custom[artId];
    if(!cost||!art||art.draft||pixelArtState.deleted[artId])return {ok:false,message:'This picture is no longer available.'};
    if(!_realDataConfirmed||!currentUser||!navigator.onLine||window.pixelArtSyncStatus==='offline')return {ok:false,message:'Reconnect to Heartly before using a paid tool.'};
    if(ptsVal<cost)return {ok:false,message:'You need '+cost+' points for this tool.'};
    const id=crypto.randomUUID(),entry={artId,kind,ts:Date.now()};
    pendingAssists[id]=entry;
    try{rememberAssists();}catch(_){delete pendingAssists[id];return {ok:false,message:'Device storage is full. Free some space before using a paid tool.'};}
    pixelArtState.assists=pixelArtState.assists||{};pixelArtState.assists[id]=entry;
    const old=ptsVal;ptsVal-=cost;
    if(typeof logPtsChange==='function')logPtsChange(-cost);
    if(typeof animatePts==='function')animatePts(old,ptsVal,600);
    if(typeof addTxItem==='function')addTxItem('🎨','Pixel Art: '+(kind==='hint'?'Find a cell':'Fill')+' · '+art.title,'Just now','-'+cost,'spend');
    window.pixelArtSavePending=true;saveState();
    return {ok:true,balance:ptsVal};
  };
  window.pixelArtSyncStatus = 'local';
  window.pixelArtSavePending = false;
  function importLocal() {
    if(imported) return;
    imported=true;
    try {
      const legacy=C.migrate(JSON.parse(localStorage.getItem('pixelhue_v2')||'null'), JSON.parse(localStorage.getItem('ph_custom_artworks')||'[]'));
      pixelArtState=C.merge(pixelArtState,C.merge(legacy,JSON.parse(localStorage.getItem('heartly_pixel_v3')||'null')));
    } catch(e) { console.warn('Pixel Art local import:',e); }
  }
  function notify() {
    window.dispatchEvent(new Event('pixelart-state'));
    for(const frameId of ['cbn-frame','developer-artwork-frame']){const game=document.getElementById(frameId)?.contentWindow;
    try { if(game && typeof game.receiveHeartlyPixelState==='function') game.receiveHeartlyPixelState(pixelArtState); } catch(_) {}}
  }
  window.getPixelArtState=function(){ importLocal(); return C.normalize(pixelArtState); };
  window.commitPixelArtState=function(incoming){
    importLocal();
    const clean=C.normalize(incoming);
    // The parent owns reward receipts; an old iframe copy cannot resurrect a
    // receipt that was rolled back after a failed cloud write.
    for(const [id,work] of Object.entries(clean.works)) work.rewarded=!!pixelArtState.works[id]?.rewarded;
    pixelArtState=C.merge(pixelArtState,clean);
    window.pixelArtSavePending=true;
    window.settlePixelArtRewards();
    saveState();
    notify();
    return C.normalize(pixelArtState);
  };
  window.settlePixelArtRewards=function(){
    // Never award against a blank/stale state while the initial cloud pull is pending.
    if(typeof _realDataConfirmed==='undefined' || !_realDataConfirmed || !currentUser) return;
    const catalog=[...window.HEARTLY_ARTWORKS,...Object.values(pixelArtState.custom || {})];
    let changed=false;
    for(const art of catalog){
      const work=pixelArtState.works[art.id];
      if(art.draft || pixelArtState.deleted[art.id] || !work || work.rewarded || C.cells(art,work).size!==art.cols*art.rows) continue;
      work.rewarded=true;
      unconfirmedRewards.add(art.id);
      rememberPendingRewards();
      work.completedAt=work.completedAt || Date.now();
      const amount=C.reward(art), old=ptsVal;
      ptsVal+=amount;
      totalPtsEarned+=amount;
      ptsLog.push({ts:Date.now(),amt:amount});
      if(typeof animatePts==='function') animatePts(old,ptsVal,600);
      if(typeof addTxItem==='function') addTxItem('🎨','Pixel Art: '+art.title,'Just now','+'+amount,'earn');
      changed=true;
    }
    if(changed){ window.pixelArtSavePending=true; saveState(); if(typeof checkAchievements==='function') checkAchievements(); }
  };
  window.pixelArtCloudAcknowledged=function(sent){
    for(const id of Object.keys(pendingAssists))if(sent?.assists?.[id])delete pendingAssists[id];
    try{rememberAssists();}catch(_){}
    for(const id of unconfirmedRewards) if(sent?.works?.[id]?.rewarded) unconfirmedRewards.delete(id);
    rememberPendingRewards();
    // Clear pending only for exactly the state this write/pull acknowledged.
    window.pixelArtSavePending=JSON.stringify(C.normalize(sent))!==JSON.stringify(C.normalize(pixelArtState));
  };
  window.pixelArtCloudReceived=function(remote){
    for(const [id,entry] of Object.entries(pendingAssists)){
      if(remote?.assists?.[id])delete pendingAssists[id];
      else {
        const cost={hint:50,fill:100}[entry.kind];
        if(!cost)continue;
        pixelArtState.assists=pixelArtState.assists||{};pixelArtState.assists[id]=entry;
        ptsVal-=cost;
        if(typeof logPtsChange==='function')logPtsChange(-cost);
      }
    }
    try{rememberAssists();}catch(_){}

    // applyState has just replaced the balance with the cloud balance. If a
    // previous offline reward never reached it, reapply that reward once to
    // this confirmed balance instead of losing it or counting it twice.
    for(const id of unconfirmedRewards){
      if(pixelArtState.works[id]) pixelArtState.works[id].rewarded=remote?.works?.[id]?.rewarded===true;
    }
    unconfirmedRewards.clear();rememberPendingRewards();
    window.pixelArtCloudAcknowledged(remote);
  };
  window.pixelArtDidSync=function(status){
    window.pixelArtSyncStatus=status;
    if(status==='synced'){
      window.settlePixelArtRewards();
      if(window.pixelArtSavePending) saveState();
    }
    notify();
  };
})();
