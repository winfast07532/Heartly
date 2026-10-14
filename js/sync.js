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
  _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
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

function _applyIncoming(dataBlob, updatedBy, updatedAt){
  // BUG (fixed) — this is the real, deterministic cause of "every
  // refresh reverts to old data." This function used to bail out
  // whenever _isLocalDirty()/_isPushing/_pushQueued was true —
  // intended to avoid clobbering an in-flight local edit with a
  // stale echo of our own write. But _isLocalDirty() goes true for
  // 8 seconds after ANY saveState() call, and checkAndUpdateStreak()
  // calls saveState() on every single login, right after this sync
  // step. So the sequence was: pull succeeds → tries to apply the
  // real cloud data → blocked, because a save from moments earlier
  // was still "dirty" → the real data never actually lands in
  // memory → the queued save (still holding stale/default values)
  // gets flushed right after and pushed to the cloud, overwriting
  // the correct data that had just arrived but was silently
  // dropped. This happened on very close to every login, not as a
  // rare race. The actual echo-prevention this was trying to
  // provide already exists correctly, upstream: _pullRemoteState
  // compares the pulled updated_at against _lastAppliedUpdatedAt
  // and skips re-processing our own just-pushed write. That's the
  // right mechanism — genuinely fresh cloud data should always be
  // applied, full stop.
  _applyingRemote = true;
  try {
    applyState(dataBlob);
    if(typeof window.pixelArtCloudReceived === 'function') window.pixelArtCloudReceived(dataBlob.pixelArtState);
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
  if(!_syncReady || _applyingRemote) return;
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
      _lastAppliedUpdatedAt = nowStr; // this IS the real echo guard: _pullRemoteState
      // compares an incoming updated_at against this value and skips
      // re-processing our own just-pushed write. That's sufficient on
      // its own — no separate "dirty" window is needed on top of it.
      if(typeof window.pixelArtCloudAcknowledged === 'function') window.pixelArtCloudAcknowledged(stateObj.pixelArtState);
      updateSyncIndicator('synced');
    }
  } catch(e){
    console.warn('[Heartly sync] push error —', e);
    updateSyncIndicator('offline');
  } finally {
    _isPushing = false;
    // Same staleness fix as _flushPendingPushIfAny: re-run saveState()
    // fresh rather than replaying the stateObj captured whenever this
    // call started queuing.
    if(_pushQueued){
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
