/* ═══════════════════════════════════════════
   PUSH NOTIFICATIONS — subscribe + trigger
   Real cross-device push via Supabase Edge Functions.
   Requires: supabase/migrations/001_push_notifications.sql run,
   and the send-push + evening-check functions deployed
   (see supabase/README.md for setup steps).
═══════════════════════════════════════════ */

// Same project the app already syncs state to (js/sync.js) — public anon key,
// safe to ship client-side, same trust model as the rest of this app.
const PUSH_SUPABASE_URL = 'https://kwtcdaapoqknerwvplze.supabase.co';
const PUSH_SUPABASE_KEY = 'sb_publishable_uQzy4bdgclCGitmi0lEiyw_zralr47Z';

// Public VAPID key — safe to ship client-side (the private key lives only
// in the Edge Function's secrets, never here).
// MUST match the VAPID_PUBLIC_KEY secret set on the send-push /
// evening-check Edge Functions (see supabase/README.md) — this was
// previously a DIFFERENT key than the one documented there, which meant
// every subscription was created under the wrong keypair and every real
// send would be silently rejected by the push service even after a
// device successfully subscribed.
const VAPID_PUBLIC_KEY = 'BOCB-Y0qVmC7xRN-1Wb8AcN5LoVddYyTNneTnKL-PXzyXk3w2k_uYkoG37xa7Oghv7ta99nUdt-lhbtfvHt06ug';

function _urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

function _pushRole() {
  return (typeof currentUser !== 'undefined' && currentUser === 'developer.login') ? 'robert' : 'ana';
}

// Subscribes this device for push and stores the subscription in Supabase.
// Call this right after Notification permission is granted.
async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    // Always start clean: a cached subscription may be bound to a previous
    // VAPID key pair. Re-subscribing under a stale key is exactly what
    // causes silent push failures (403 BadJwtToken) later on.
    if (sub) {
      try { await sub.unsubscribe(); } catch (_) {}
    }
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: _urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const json = sub.toJSON();
    const role = _pushRole();

    const res = await fetch(`${PUSH_SUPABASE_URL}/rest/v1/push_subscriptions?on_conflict=endpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': PUSH_SUPABASE_KEY,
        'Authorization': `Bearer ${PUSH_SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        role,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        updated_at: new Date().toISOString(),
      }),
    });

    return res.ok;
  } catch (err) {
    console.warn('[Heartly push] subscribe failed —', err);
    return false;
  }
}
window.subscribeToPush = subscribeToPush;

// Fire-and-forget: tells the Edge Function to push a notification to the
// given role. Never blocks or throws into the caller — a failed push
// should never break the letter-send / streak-update flow it's attached to.
function triggerPush(role, title, body, tag) {
  fetch(`${PUSH_SUPABASE_URL}/functions/v1/send-push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PUSH_SUPABASE_KEY}`,
    },
    body: JSON.stringify({ role, title, body, tag }),
  }).catch(err => console.warn('[Heartly push] trigger failed —', err));
}
window.triggerPush = triggerPush;
