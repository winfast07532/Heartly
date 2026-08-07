/* ═══════════════════════════════════════════
   DEV FACE ID
   Uses the WebAuthn platform authenticator
   (Face ID / Touch ID / Windows Hello) as an
   alternative to the dev password.

   Note: this app has no backend server, so
   there's nothing to verify a signature against —
   like most local-only PWAs, we simply trust a
   successful browser/OS biometric ceremony as
   proof of identity. It's a convenience unlock,
   not cryptographic auth against a server.
═══════════════════════════════════════════ */

const FACEID_CRED_KEY = 'heartly.devFaceIdCredId';
const FACEID_USER_KEY  = 'heartly.devFaceIdUserId';

function faceIdSupported(){
  return !!(window.PublicKeyCredential && navigator.credentials);
}
window.faceIdSupported = faceIdSupported;

async function faceIdPlatformAvailable(){
  if(!faceIdSupported()) return false;
  try{
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }catch(e){
    return false;
  }
}
window.faceIdPlatformAvailable = faceIdPlatformAvailable;

function faceIdIsSetUp(){
  return !!localStorage.getItem(FACEID_CRED_KEY);
}
window.faceIdIsSetUp = faceIdIsSetUp;

function randomBytes(len){
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return arr;
}

function bufToB64(buf){
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function b64ToBuf(b64){
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

async function setupDevFaceId(){
  if(!faceIdSupported()){
    T('❌ Face ID / biometric login isn\'t supported in this browser');
    return;
  }
  const available = await faceIdPlatformAvailable();
  if(!available){
    T('❌ No Face ID / Touch ID available on this device');
    return;
  }
  try{
    const userId = randomBytes(16);
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge: randomBytes(32),
        rp: { name: 'Heartly' },
        user: { id: userId, name: 'robert.dev', displayName: 'Robert (Dev)' },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },   // ES256
          { type: 'public-key', alg: -257 }  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required'
        },
        timeout: 60000
      }
    });
    if(!cred) throw new Error('No credential returned');
    localStorage.setItem(FACEID_CRED_KEY, bufToB64(cred.rawId));
    localStorage.setItem(FACEID_USER_KEY, bufToB64(userId));
    T('✅ Face ID enabled for Dev Mode');
    refreshFaceIdSettingsUI();
  }catch(e){
    T('❌ Face ID setup cancelled or failed');
  }
}
window.setupDevFaceId = setupDevFaceId;

function removeDevFaceId(){
  localStorage.removeItem(FACEID_CRED_KEY);
  localStorage.removeItem(FACEID_USER_KEY);
  T('🗑️ Face ID removed');
  refreshFaceIdSettingsUI();
}
window.removeDevFaceId = removeDevFaceId;

async function loginWithDevFaceId(){
  const credIdB64 = localStorage.getItem(FACEID_CRED_KEY);
  if(!credIdB64){ T('❌ Face ID isn\'t set up yet'); return; }
  if(!faceIdSupported()){ T('❌ Face ID isn\'t supported in this browser'); return; }
  try{
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(32),
        allowCredentials: [{ type: 'public-key', id: b64ToBuf(credIdB64) }],
        userVerification: 'required',
        timeout: 60000
      }
    });
    if(!assertion) throw new Error('No assertion returned');
    if(typeof closeDevPassword === 'function') closeDevPassword();
    doLogin('developer.login');
  }catch(e){
    T('❌ Face ID didn\'t match — try your password instead');
  }
}
window.loginWithDevFaceId = loginWithDevFaceId;

/* ── UI wiring ── */

// Show/hide the "Use Face ID" option on the password modal
async function refreshFaceIdLoginUI(){
  const btn = document.getElementById('dev-pw-faceid-btn');
  if(!btn) return;
  const canShow = faceIdIsSetUp() && await faceIdPlatformAvailable();
  btn.style.display = canShow ? 'flex' : 'none';
}
window.refreshFaceIdLoginUI = refreshFaceIdLoginUI;

// Update the Face ID card inside Dev Settings
function refreshFaceIdSettingsUI(){
  const statusEl = document.getElementById('dev-faceid-status');
  const setupBtn = document.getElementById('dev-faceid-setup-btn');
  const removeBtn = document.getElementById('dev-faceid-remove-btn');
  if(!statusEl) return;
  if(faceIdIsSetUp()){
    statusEl.textContent = '✅ Face ID is enabled for Dev Mode login';
    setupBtn.style.display = 'none';
    removeBtn.style.display = 'block';
  } else {
    statusEl.textContent = 'Use Face ID / Touch ID instead of typing your password';
    setupBtn.style.display = 'block';
    removeBtn.style.display = 'none';
  }
}
window.refreshFaceIdSettingsUI = refreshFaceIdSettingsUI;

// Wrap openDevPassword to also refresh the Face ID button each time the modal opens
(function(){
  const _origOpen = window.openDevPassword;
  window.openDevPassword = function(){
    _origOpen();
    refreshFaceIdLoginUI();
  };
})();

/* ═══════════════════════════════════════════
   ANA APP LOCK
   Face ID / Touch ID with a passcode fallback,
   gating entry into Ana's account each time the
   app is opened. Reuses the WebAuthn helpers above.
═══════════════════════════════════════════ */

const APPLOCK_ENABLED_KEY  = 'heartly.appLockEnabled';
const APPLOCK_PASSCODE_KEY = 'heartly.appLockPasscodeHash';
const ANA_FACEID_CRED_KEY  = 'heartly.anaFaceIdCredId';
const ANA_FACEID_USER_KEY  = 'heartly.anaFaceIdUserId';

let _appLockUnlockedThisSession = false; // resets every fresh page load — "require to open"

function appLockEnabled(){
  return localStorage.getItem(APPLOCK_ENABLED_KEY) === '1';
}
window.appLockEnabled = appLockEnabled;

function anaFaceIdIsSetUp(){
  return !!localStorage.getItem(ANA_FACEID_CRED_KEY);
}
window.anaFaceIdIsSetUp = anaFaceIdIsSetUp;

async function sha256Hex(str){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function setupAnaFaceId(){
  if(!(await faceIdPlatformAvailable())) return false;
  try{
    const userId = randomBytes(16);
    const names = (typeof getCoupleNames === 'function') ? getCoupleNames() : { ana: 'Ana' };
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge: randomBytes(32),
        rp: { name: 'Heartly' },
        user: { id: userId, name: 'ana.heartly', displayName: names.ana },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 }
        ],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 60000
      }
    });
    if(!cred) return false;
    localStorage.setItem(ANA_FACEID_CRED_KEY, bufToB64(cred.rawId));
    localStorage.setItem(ANA_FACEID_USER_KEY, bufToB64(userId));
    return true;
  }catch(e){
    return false;
  }
}

function removeAnaFaceId(){
  localStorage.removeItem(ANA_FACEID_CRED_KEY);
  localStorage.removeItem(ANA_FACEID_USER_KEY);
}

async function verifyAnaFaceId(){
  const credIdB64 = localStorage.getItem(ANA_FACEID_CRED_KEY);
  if(!credIdB64 || !faceIdSupported()) return false;
  try{
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(32),
        allowCredentials: [{ type: 'public-key', id: b64ToBuf(credIdB64) }],
        userVerification: 'required',
        timeout: 60000
      }
    });
    return !!assertion;
  }catch(e){
    return false;
  }
}

// Toggle handler for the "App lock" row in Settings
async function toggleAppLock(el){
  const turningOn = !el.classList.contains('on');

  if(turningOn){
    const result = await appModal({
      icon: '🔒',
      title: 'Create a passcode',
      subtitle: 'This is your fallback if Face ID isn\'t available.',
      fields: [
        { key: 'p1', label: 'Passcode (4–6 digits)', type: 'password', inputmode: 'numeric', maxLength: 6 },
        { key: 'p2', label: 'Confirm passcode', type: 'password', inputmode: 'numeric', maxLength: 6 }
      ],
      confirmLabel: 'Enable App Lock'
    });
    if(!result) return;
    if(!/^\d{4,6}$/.test(result.p1)){ T('⚠️ Passcode must be 4–6 digits'); return; }
    if(result.p2 !== result.p1){ T('⚠️ Passcodes didn\'t match'); return; }

    localStorage.setItem(APPLOCK_PASSCODE_KEY, await sha256Hex(result.p1));
    localStorage.setItem(APPLOCK_ENABLED_KEY, '1');
    el.classList.add('on');
    T('🔒 App Lock enabled');

    if(await faceIdPlatformAvailable()){
      const wantsFaceId = await appModal({
        icon: '🆔',
        title: 'Set up Face ID too?',
        subtitle: 'Unlock faster with Face ID / Touch ID.',
        confirmLabel: 'Set up Face ID',
        cancelLabel: 'Not now'
      });
      if(wantsFaceId){
        const ok = await setupAnaFaceId();
        T(ok ? '✅ Face ID enabled for App Lock' : '❌ Face ID setup didn\'t complete — your passcode still works');
      }
    }
  } else {
    const ok = await appModal({
      icon: '🔓',
      title: 'Turn off App Lock?',
      subtitle: 'Heartly will open without Face ID or a passcode.',
      confirmLabel: 'Turn off',
      danger: true
    });
    if(!ok) return;
    localStorage.removeItem(APPLOCK_ENABLED_KEY);
    localStorage.removeItem(APPLOCK_PASSCODE_KEY);
    removeAnaFaceId();
    el.classList.remove('on');
    T('🔓 App Lock turned off');
  }
}
window.toggleAppLock = toggleAppLock;

function refreshAppLockToggleUI(){
  const el = document.getElementById('tog-applock');
  if(el) el.classList.toggle('on', appLockEnabled());
}
window.refreshAppLockToggleUI = refreshAppLockToggleUI;

// Called when Ana's login card is tapped — gates entry behind the lock screen if enabled
function handleAnaLoginTap(){
  if(appLockEnabled() && !_appLockUnlockedThisSession){
    showAppLockScreen(() => doLogin('nevasta.lui.robert'));
  } else {
    doLogin('nevasta.lui.robert');
  }
}
window.handleAnaLoginTap = handleAnaLoginTap;

let _appLockSuccessCb = null;

function showAppLockScreen(onSuccess){
  _appLockSuccessCb = onSuccess;
  const ov = document.getElementById('APPLOCK');
  if(!ov) { onSuccess(); return; }
  ov.classList.add('show');
  const input = document.getElementById('applock-pw-input');
  const err = document.getElementById('applock-error');
  const faceBtn = document.getElementById('applock-faceid-btn');
  if(input){ input.value=''; }
  if(err){ err.textContent=''; }
  if(faceBtn) faceBtn.style.display = anaFaceIdIsSetUp() ? 'flex' : 'none';

  if(anaFaceIdIsSetUp()){
    setTimeout(tryAppLockFaceId, 350);
  } else if(input){
    setTimeout(() => input.focus(), 350);
  }
}
window.showAppLockScreen = showAppLockScreen;

function hideAppLockScreen(){
  const ov = document.getElementById('APPLOCK');
  if(ov) ov.classList.remove('show');
}

async function tryAppLockFaceId(){
  if(!(await faceIdPlatformAvailable())) return;
  const ok = await verifyAnaFaceId();
  if(ok) unlockAppLockSuccess();
}
window.tryAppLockFaceId = tryAppLockFaceId;

async function submitAppLockPasscode(){
  const input = document.getElementById('applock-pw-input');
  const err = document.getElementById('applock-error');
  if(!input) return;
  const entered = input.value.trim();
  const storedHash = localStorage.getItem(APPLOCK_PASSCODE_KEY);
  if(!entered){ if(err) err.textContent = 'Enter your passcode'; return; }
  const hash = await sha256Hex(entered);
  if(hash === storedHash){
    unlockAppLockSuccess();
  } else {
    if(err) err.textContent = 'Incorrect passcode — try again';
    input.value = '';
    input.classList.add('error');
    setTimeout(() => input.classList.remove('error'), 300);
  }
}
window.submitAppLockPasscode = submitAppLockPasscode;

function unlockAppLockSuccess(){
  _appLockUnlockedThisSession = true;
  hideAppLockScreen();
  const cb = _appLockSuccessCb;
  _appLockSuccessCb = null;
  if(cb) cb();
}

document.addEventListener('DOMContentLoaded', refreshAppLockToggleUI);
