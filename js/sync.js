/* ═══════════════════════════════════════════════════
   HEARTLY SYNC — real-time cross-device sync (Ana ↔ Robert)
   Backed by Supabase. Does NOT change the data model —
   it just moves the exact same JSON blob that saveState()
   already builds into a shared cloud row, and pushes/pulls
   it in real time via Supabase Realtime.

   Load order requirement: this file must load AFTER
   state.js (needs applyState/saveState) and AFTER the
   Supabase JS CDN script, and BEFORE login.js runs doLogin.
═══════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://kwtcdaapoqknerwvplze.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uQzy4bdgclCGitmi0lEiyw_zralr47Z';
const SYNC_ROW_ID  = 'heartly-couple'; // fixed id — single shared row for the two of you
const SYNC_TABLE   = 'couple_state';
const LOCAL_KEY    = 'heartly_v1'; // must match STORAGE_KEY in state.js

let _sb = null;
let _channel = null;
let _applyingRemote = false; // guard: don't re-push while applying an incoming update
let _lastPushedAt = 0;       // guard: don't re-apply the echo of our OWN write
let _lastAppliedUpdatedAt = null; // guard: don't re-apply/re-toast unchanged data on refocus
let _syncReady = false;
let _initialSyncCompleted = false; // "we stopped WAITING" — timeout can set this
let _realDataConfirmed = false;    // "we actually know what's in the cloud" — ONLY a real pull success sets this. THIS is what's allowed to gate pushRemoteState.
let _lastPullTime = 0;
let _initPromise = null;
let _isPushing = false;
let _pushQueued = false; // was: the actual stale stateObj — see _flushPendingPushIfAny for why that was unsafe
let _conflictNoticeShown=false;
let _syncBase=null,_syncDirty=false,_editVersion=0,_syncConflict=false,_pendingStateWrite=null;
window.heartlyMarkDirty=()=>{_syncDirty=true;_editVersion++;};
function showSaveConflict(snapshot,message){
  _syncConflict=true;
  try{localStorage.setItem('heartly_unsynced_conflict',JSON.stringify({at:Date.now(),data:snapshot,message}));}catch(_){}
  let box=document.getElementById('save-conflict');
  if(!box){box=document.createElement('div');box.id='save-conflict';box.setAttribute('role','alert');box.style.cssText='position:fixed;bottom:90px;left:16px;right:16px;z-index:99999;padding:16px;border-radius:14px;background:#321727;color:white;border:1px solid #e05578;font:14px/1.5 system-ui';document.body.append(box);}
  box.replaceChildren();const text=document.createElement('p');text.textContent='Another device changed the same information. Your local changes are kept here; cloud data was not overwritten.';
  const download=document.createElement('button');download.textContent='Download my local copy';download.onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({data:snapshot},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='heartly-unsynced-changes.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  const refresh=document.createElement('button');refresh.textContent='Load latest cloud save';refresh.onclick=async()=>{_syncConflict=false;_syncDirty=false;_pendingStateWrite=null;_pushQueued=false;clearTimeout(_saveTimer);_lastAppliedUpdatedAt=null;try{localStorage.setItem('heartly_conflict_archive',localStorage.getItem('heartly_unsynced_conflict')||'');localStorage.removeItem('heartly_unsynced_conflict');}catch(_){}await _pullRemoteState(true);box.remove();};
  box.append(text,download,refresh);
}


// Flushes any push that got queued (via pushRemoteState) while we
// didn't yet know what was really in the cloud.
//
// BUG (fixed): this used to store and later push the EXACT stateObj
// object captured at the moment saveState() first ran — built from
// whatever local vars were in memory BEFORE the real remote data
// ever got merged in via applyState(). By the time this flushed
// (right after a successful pull), the real data had already been
// applied — but this then pushed the old stale pre-merge object
// straight over it anyway, silently re-clobbering it a second time.
// Now this just remembers THAT a save was requested, and re-runs
// saveState() fresh — which rebuilds the object from current
// in-memory state, correctly reflecting whatever applyState() just
// merged in.
function _flushPendingPushIfAny(){
  if(_pushQueued && !_isPushing){
    _pushQueued = false;
    if(typeof saveState === 'function') saveState();
  }
}

function updateSyncIndicator(status){
  if(typeof window.pixelArtDidSync === 'function') window.pixelArtDidSync(status);
  const el = document.getElementById('sync-dot');
  if(!el) return;
  el.className = 'sync-dot ' + status;
  if(status === 'syncing'){
    el.title = 'Syncing...';
  } else if(status === 'offline'){
    el.title = 'Offline / Connection issues';
  } else if(status === 'synced'){
    el.title = 'Synced';
    clearTimeout(window._syncDotTimeout);
    window._syncDotTimeout = setTimeout(() => {
      el.className = 'sync-dot';
    }, 2000);
  }
}

function initSync(){
  if(_initPromise) return _initPromise;
  if(typeof window.supabase === 'undefined' || !window.supabase.createClient){
    console.warn('[Heartly sync] Supabase library not loaded — running offline-only.');
    _initialSyncCompleted = true;
    _initPromise = Promise.resolve();
    return _initPromise;
  }
  _sb = _sb || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  _syncReady = true;
  console.log('[Heartly sync] initializing…');
  updateSyncIndicator('syncing');

  _initPromise = new Promise((resolve) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if(!resolved) {
        resolved = true;
        _initialSyncCompleted = true; // stop making the caller wait —
        // but do NOT set _realDataConfirmed here. This used to be the
        // same flag, which was the actual bug: on a slow pull (cold
        // connection, spotty mobile network — completely normal, not
        // an edge case), this timeout fired, and pushRemoteState()
        // treated "we stopped waiting" as "we know what's in the
        // cloud" and pushed immediately. checkAndUpdateStreak() runs
        // on every single login right after this and calls
        // saveState() — so on any slow-pull login, the device's
        // still-default local state got pushed straight over the
        // real shared row. That is what "every refresh erases the
        // data" actually was. Now: the app can proceed and render
        // locally without hanging, but nothing pushes to the cloud
        // until a pull has genuinely succeeded — the 15s poll
        // fallback below keeps retrying in the background.
        console.warn('[Heartly sync] initial pull timed out — proceeding locally, pushes stay queued until a real pull succeeds');
        updateSyncIndicator('offline');
        _subscribeToRemote();
        resolve();
      }
    }, 6000); // was 3.5s — real mobile networks + a Realtime handshake regularly exceed that

    _pullRemoteState(true).then(() => {
      _initialSyncCompleted = true;
      if(!resolved){
        resolved = true;
        clearTimeout(timeout);
        _subscribeToRemote();
        resolve();
      }
    }).catch(err => {
      console.warn('[Heartly sync] initial pull promise rejected —', err);
      _initialSyncCompleted = true;
      // NOTE: intentionally NOT calling _flushPendingPushIfAny() or
      // setting _realDataConfirmed here — the pull actually failed,
      // so we still don't know what's in the cloud. Same reasoning
      // as the timeout branch above.
      if(!resolved){
        resolved = true;
        clearTimeout(timeout);
        _subscribeToRemote();
        resolve();
      }
    });
  });

  // Realtime websockets get silently dropped when a phone locks/backgrounds
  // (very common for iOS PWAs). There's no reliable "reconnected" event we
  // can trust, so just re-pull whenever the app becomes visible/focused
  // again — cheap, and guarantees you never get stuck stale until reload.
  document.addEventListener('visibilitychange', () => {
    if(document.visibilityState === 'visible' && _syncReady) _pullRemoteState(false);
  });
  window.addEventListener('focus', () => {
    if(_syncReady) _pullRemoteState(false);
  });

  // Always-on periodic fallback polling (every 15 seconds) to ensure devices stay synced
  // even if WebSockets are blocked, drop, or if Supabase Replication is disabled in the dashboard.
  if(!window._heartlyPollFallback){
    window._heartlyPollFallback = setInterval(() => _pullRemoteState(false), 15000);
  }

  return _initPromise;
}

async function _pullRemoteState(force = false){
  if(!force && (Date.now() - _lastPullTime) < 5000){
    console.log('[Heartly sync] skipping pull — throttled');
    return;
  }
  _lastPullTime = Date.now();
  updateSyncIndicator('syncing');
  try {
    const { data, error } = await _sb
      .from(SYNC_TABLE)
      .select('data, updated_by, updated_at')
      .eq('id', SYNC_ROW_ID)
      .maybeSingle();

    if(error){
      console.warn('[Heartly sync] pull failed —', error.message, error);
      updateSyncIndicator('offline');
      return;
    }

    if(data && data.data){
      if(data.updated_at && data.updated_at === _lastAppliedUpdatedAt){
        _realDataConfirmed = true;
        updateSyncIndicator('synced');
        _flushPendingPushIfAny();
        return; // nothing changed since we last applied this — skip (e.g. just refocused the tab)
      }
      console.log('[Heartly sync] pulled remote state, last updated by', data.updated_by || '(unknown)');
      _applyIncoming(data.data, data.updated_by, data.updated_at);
      _realDataConfirmed = true;
      if(!_conflictNoticeShown){_conflictNoticeShown=true;try{const copy=JSON.parse(localStorage.getItem('heartly_unsynced_conflict')||'null');if(copy?.data)showSaveConflict(copy.data,copy.message);}catch(_){}}
      updateSyncIndicator('synced');
      _flushPendingPushIfAny();
    } else {
      // No shared row yet — this is the very first device to sync.
      // Seed the cloud with whatever's already on this device.
      // _realDataConfirmed must be set BEFORE calling _pushLocalNow():
      // that goes through the normal pushRemoteState() gate, which
      // would otherwise just re-queue itself forever, since nothing
      // else will ever flip this flag in a true "no row yet" case.
      console.log('[Heartly sync] no remote row yet — seeding from local state');
      _realDataConfirmed = true;
      await _pushLocalNow();
      updateSyncIndicator('synced');
      _flushPendingPushIfAny();
    }
  } catch(e){
    console.warn('[Heartly sync] pull error —', e);
    updateSyncIndicator('offline');
  }
}

function _subscribeToRemote(){
  _channel = _sb
    .channel('heartly-couple-state')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: SYNC_TABLE, filter: `id=eq.${SYNC_ROW_ID}` },
      (payload) => {
        const incoming = payload.new && payload.new.data;
        if(!incoming) return;

        // Skip if this matches what we already applied
        if(payload.new.updated_at && payload.new.updated_at === _lastAppliedUpdatedAt){
          return;
        }

        console.log('[Heartly sync] incoming remote change from', payload.new.updated_by || '(unknown)');
        updateSyncIndicator('syncing');
        _applyIncoming(incoming, payload.new.updated_by, payload.new.updated_at);
        updateSyncIndicator('synced');
      }
    )
    .subscribe((status, err) => {
      console.log('[Heartly sync] realtime channel status:', status, err || '');
      if(status === 'CHANNEL_ERROR' || status === 'TIMED_OUT'){
        updateSyncIndicator('offline');
      } else if(status === 'SUBSCRIBED'){
        updateSyncIndicator('synced');
      }
    });
}

function _applyIncoming(dataBlob, updatedBy, updatedAt){
  if(_realDataConfirmed&&updatedBy!=='backup-restore'&&(_syncDirty||_isPushing||_syncConflict)&&updatedBy!=='pet-game')return;
  if(updatedBy==='backup-restore'){_syncDirty=false;_syncConflict=false;_pendingStateWrite=null;document.getElementById('save-conflict')?.remove();}

  // Apply confirmed cloud data only when it cannot replace pending edits.
  // Pending edits are merged by the row-locked save RPC; pet deltas remain live.
  _applyingRemote = true;
  try {
    const petOnly=updatedBy==='pet-game' && _realDataConfirmed && typeof window.petCloudAcknowledged==='function';
    if(petOnly){
      window.petCloudAcknowledged(dataBlob);
    }else {applyState(dataBlob);_syncBase=structuredClone(dataBlob);if(!_realDataConfirmed)_syncDirty=false;}
    window.dispatchEvent(new Event('heartly-pet-state'));
    if(!petOnly && typeof window.pixelArtCloudReceived === 'function') window.pixelArtCloudReceived(dataBlob.pixelArtState);
    const cached=petOnly?Object.assign(JSON.parse(localStorage.getItem(LOCAL_KEY)||'{}'),{petState,petWalletTotal,petEarnedTotal,ptsVal,totalPtsEarned}):dataBlob;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(cached));
    if(updatedAt) _lastAppliedUpdatedAt = updatedAt;
  } catch(e){
    console.warn('[Heartly sync] failed to apply incoming state —', e);
  }
  _applyingRemote = false;

  // Best-effort UI refresh so the change is visible without a manual reload
  if(typeof refreshStreakUI === 'function') refreshStreakUI();
  if(typeof refreshPtsChg === 'function') refreshPtsChg();
  if(typeof applyTheme === 'function' && typeof activeTheme !== 'undefined' && activeTheme) applyTheme(activeTheme);
  const el = document.getElementById('pts-display');
  if(el && typeof ptsVal !== 'undefined') el.textContent = Math.floor(ptsVal).toLocaleString();

  // Re-render UI components with the newly synced state — debounced.
  // The other person's app can write state on lots of small actions in
  // quick succession (reading a message, switching tabs, editing in Dev),
  // and each write used to trigger its own full triggerAllUIRenders() pass
  // immediately. Several card grids re-render their DOM on every call,
  // replaying their .3s fadeUp entrance animation each time — with writes
  // landing seconds apart, that looked/felt like the whole app was
  // "refreshing" every few seconds. Now rapid-fire incoming updates
  // within a short window collapse into a single re-render instead of one
  // per write.
  clearTimeout(window._heartlyRenderDebounce);
  window._heartlyRenderDebounce = setTimeout(() => {
    if(typeof triggerAllUIRenders === 'function') triggerAllUIRenders();
  }, 600);

  // Previously toasted "Synced with Robert/Ana" here on every single
  // incoming update. Since the other person's app pushes state on lots of
  // small actions (marking a message read, switching tabs, etc.), this
  // fired constantly and felt like spam. The sync-dot indicator already
  // communicates live sync status quietly — no toast needed.
}

// Called by state.js's saveState() every time it writes to localStorage
async function pushRemoteState(stateObj){
  if(!_syncReady || _applyingRemote || _syncConflict) return false;
  if(!_realDataConfirmed){
    // BUG (fixed): this used to check _initialSyncCompleted, which a
    // timed-out (not actually successful) pull could also set — see
    // the long comment in initSync(). That let a save fire before we
    // ever confirmed what's really in the cloud, pushing local
    // defaults straight over real shared data. _realDataConfirmed
    // only ever becomes true after an actual successful pull.
    _pushQueued = true;
    console.warn('[Heartly sync] push queued — real cloud state not confirmed yet');
    return;
  }
  if(_isPushing){
    _pushQueued = true;
    return;
  }
  
  _isPushing = true;
  _lastPushedAt = Date.now();
  updateSyncIndicator('syncing');
  const version=_editVersion;
  const request=_pendingStateWrite||{base_data:_syncBase||{},next_data:structuredClone(stateObj),request_id:crypto.randomUUID()};
  _pendingStateWrite=request;
  try {
    const {data:savedRow,error}=await _sb.rpc('heartly_save_state',request);
    if(error){
      if(error.message?.includes('SAVE_CONFLICT')){_pendingStateWrite=null;showSaveConflict(getStateSnapshot(),error.message);}
      updateSyncIndicator('offline');return false;
    }
    if(!savedRow?.data)throw Error('Save response is incomplete');
    _pendingStateWrite=null;
    const current=getStateSnapshot();
    const newer=_editVersion!==version||JSON.stringify(request.next_data)!==JSON.stringify(stateObj);
    let display=savedRow.data;
    if(newer){try{display=HeartlyMerge.state(request.next_data,current,savedRow.data);}catch(e){_syncBase=structuredClone(savedRow.data);showSaveConflict(current,e.message);return false;}}
    if((current.petState?.revision||0)>(display.petState?.revision||0)){
      display={...display,petState:current.petState,ptsVal:display.ptsVal+current.petWalletTotal-(display.petWalletTotal||0),totalPtsEarned:display.totalPtsEarned+current.petEarnedTotal-(display.petEarnedTotal||0),petWalletTotal:current.petWalletTotal,petEarnedTotal:current.petEarnedTotal,txLog:HeartlyMerge.merge([],display.txLog||[],current.txLog||[],'txLog'),ptsLog:HeartlyMerge.merge([],display.ptsLog||[],current.ptsLog||[],'ptsLog')};
    }
    _syncBase=structuredClone(savedRow.data);_lastAppliedUpdatedAt=savedRow.updated_at;
    _applyingRemote=true;try{applyState(display);localStorage.setItem(LOCAL_KEY,JSON.stringify(display));}finally{_applyingRemote=false;}
    _syncDirty=newer;_pushQueued=newer;
    if(typeof window.pixelArtCloudAcknowledged==='function')window.pixelArtCloudAcknowledged(savedRow.data.pixelArtState);
    window.dispatchEvent(new Event('heartly-pet-state'));
    if(typeof refreshPtsChg==='function')refreshPtsChg();if(typeof renderTxHistory==='function')renderTxHistory();
    const balance=document.getElementById('pts-display');if(balance)balance.textContent=Math.floor(ptsVal).toLocaleString();
    updateSyncIndicator('synced');return true;
  } catch(e){
    console.warn('[Heartly sync] push error —', e);
    updateSyncIndicator('offline');
    return false;
  } finally {
    _isPushing = false;
    // Same staleness fix as _flushPendingPushIfAny: re-run saveState()
    // fresh rather than replaying the stateObj captured whenever this
    // call started queuing.
    if(_pushQueued&&!_syncConflict){
      _pushQueued = false;
      setTimeout(() => { if(typeof saveState === 'function') saveState(); }, 50);
    }
  }
}

async function _pushLocalNow(){
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if(!raw) return;
    await pushRemoteState(JSON.parse(raw));
  } catch(e){
    console.warn('[Heartly sync] initial seed failed —', e);
  }
}

window.initSync = initSync;
window.pushRemoteState = pushRemoteState;

// Milestone receipts and bonuses are committed once under the shared row lock.
let _milestoneQueue=Promise.resolve();
window.claimGameMilestones=function(game,legacy){
  _milestoneQueue=_milestoneQueue.then(async()=>{
    if(await saveState(true)!==true)return;
    const {data,error}=await _sb.rpc('heartly_claim_game_milestones',{game_name:game,legacy_claims:legacy||{}});
    if(error){T('Milestone reward could not sync. It will be retried next time you play.');return;}
    _applyIncoming(data.data,'game-milestone',data.updated_at);
    if(data.awarded)T('🏆 +'+data.awarded+' points — shared game milestone!');
  }).catch(error=>console.warn('Milestone sync:',error));
  return _milestoneQueue;
};
