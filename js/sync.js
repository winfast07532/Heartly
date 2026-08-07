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
let _initialSyncCompleted = false;
let _lastPullTime = 0;
let _initPromise = null;
let _isPushing = false;
let _pendingPushState = null;

function updateSyncIndicator(status){
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
  _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  _syncReady = true;
  console.log('[Heartly sync] initializing…');
  updateSyncIndicator('syncing');

  _initPromise = new Promise((resolve) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if(!resolved) {
        resolved = true;
        _initialSyncCompleted = true; // allow saving locally even if sync initial pull times out
        console.warn('[Heartly sync] initial pull timed out — proceeding offline');
        updateSyncIndicator('offline');
        _subscribeToRemote();
        resolve();
      }
    }, 3500); // 3.5s timeout

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
        updateSyncIndicator('synced');
        return; // nothing changed since we last applied this — skip (e.g. just refocused the tab)
      }
      console.log('[Heartly sync] pulled remote state, last updated by', data.updated_by || '(unknown)');
      _applyIncoming(data.data, data.updated_by, data.updated_at);
      updateSyncIndicator('synced');
    } else {
      // No shared row yet — this is the very first device to sync.
      // Seed the cloud with whatever's already on this device.
      console.log('[Heartly sync] no remote row yet — seeding from local state');
      await _pushLocalNow();
      updateSyncIndicator('synced');
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

        // Skip our OWN write echoing back.
        const sameUser = payload.new.updated_by && typeof currentUser !== 'undefined' && payload.new.updated_by === currentUser;
        const justPushed = (Date.now() - _lastPushedAt) < 4000;
        if(sameUser && justPushed){
          console.log('[Heartly sync] ignoring echo of our own write');
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

function _isLocalDirty(){
  // Local state is dirty if saveState() was called recently (within 8s)
  // and the push hasn't completed yet. This covers the 300ms debounce,
  // the network round-trip, and any queued pushes.
  if(!window._heartlyLocalDirty) return false;
  return (Date.now() - window._heartlyLocalDirty) < 8000;
}

function _applyIncoming(dataBlob, updatedBy, updatedAt){
  if(_isLocalDirty() || _isPushing || _pendingPushState) {
    console.log('[Heartly sync] skipping remote apply — local state is dirty / push pending');
    return;
  }
  _applyingRemote = true;
  try {
    applyState(dataBlob);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(dataBlob));
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
  
  // Re-render UI components immediately with the newly synced state
  if(typeof triggerAllUIRenders === 'function') triggerAllUIRenders();

  if(typeof T === 'function' && typeof currentUser !== 'undefined'){
    const otherName = (currentUser === 'developer.login') ? 'Ana' : 'Robert';
    T('💞 Synced with ' + otherName);
  }
}

// Called by state.js's saveState() every time it writes to localStorage
async function pushRemoteState(stateObj){
  if(!_syncReady || _applyingRemote) return;
  if(!_initialSyncCompleted){
    console.warn('[Heartly sync] push blocked — initial pull still pending');
    return;
  }
  if(_isPushing){
    _pendingPushState = stateObj;
    return;
  }
  
  _isPushing = true;
  _lastPushedAt = Date.now();
  updateSyncIndicator('syncing');
  const nowStr = new Date().toISOString();
  
  try {
    const { error } = await _sb
      .from(SYNC_TABLE)
      .upsert({
        id: SYNC_ROW_ID,
        data: stateObj,
        updated_by: (typeof currentUser !== 'undefined' ? currentUser : null),
        updated_at: nowStr,
      });
    if(error){
      console.warn('[Heartly sync] push FAILED —', error.message, error);
      updateSyncIndicator('offline');
    } else {
      console.log('[Heartly sync] pushed state to cloud ✓');
      _lastAppliedUpdatedAt = nowStr; // prevent echo pull from overwriting local state
      // NOTE: intentionally NOT clearing window._heartlyLocalDirty here.
      // The realtime echo of this exact write can arrive after this success
      // callback fires; if we'd already cleared "dirty", that echo could be
      // misread as a fresh remote update and applied on top of local state,
      // reverting things like a letter's read flag. Letting it decay via
      // _isLocalDirty()'s own time window keeps that echo guarded too.
      updateSyncIndicator('synced');
    }
  } catch(e){
    console.warn('[Heartly sync] push error —', e);
    updateSyncIndicator('offline');
  } finally {
    _isPushing = false;
    if(_pendingPushState){
      const nextState = _pendingPushState;
      _pendingPushState = null;
      setTimeout(() => pushRemoteState(nextState), 50);
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
