/* ═══════════════════════════════════════════
   APP MODAL
   A single reusable, on-brand dialog that replaces
   native browser prompt()/confirm() boxes everywhere
   in the app. Returns a Promise so call sites can
   just `await appModal({...})`.

   appModal({
     icon, title, subtitle,
     fields: [{ key, label, placeholder, value, type, maxLength, inputmode }],
     confirmLabel, cancelLabel, danger
   })

   - No fields  -> behaves like confirm(): resolves true / false
   - With fields -> behaves like prompt(): resolves { key: value, ... } / null
   - Pass cancelLabel: null to hide the Cancel button entirely
═══════════════════════════════════════════ */

let _amResolve = null;

function appModal(opts){
  opts = opts || {};
  return new Promise((resolve) => {
    _amResolve = resolve;

    document.getElementById('am-ico').textContent = opts.icon || '✨';
    document.getElementById('am-title').textContent = opts.title || '';

    const subEl = document.getElementById('am-sub');
    subEl.textContent = opts.subtitle || '';

    const fieldsWrap = document.getElementById('am-fields');
    fieldsWrap.innerHTML = '';
    (opts.fields || []).forEach(f => {
      const wrap = document.createElement('div');
      wrap.className = 'am-field-wrap';
      if(f.label){
        const lbl = document.createElement('div');
        lbl.className = 'am-field-label';
        lbl.textContent = f.label;
        wrap.appendChild(lbl);
      }
      const input = document.createElement('input');
      input.type = f.type || 'text';
      input.className = 'am-input';
      input.placeholder = f.placeholder || '';
      input.value = f.value || '';
      input.dataset.key = f.key;
      if(f.maxLength) input.maxLength = f.maxLength;
      if(f.inputmode) input.inputMode = f.inputmode;
      input.onkeydown = (e) => { if(e.key === 'Enter') _amSubmit(); };
      wrap.appendChild(input);
      fieldsWrap.appendChild(wrap);
    });

    document.getElementById('am-error').textContent = '';

    const confirmBtn = document.getElementById('am-confirm-btn');
    confirmBtn.textContent = opts.confirmLabel || 'OK';
    confirmBtn.className = 'am-btn am-confirm' + (opts.danger ? ' danger' : '');

    const cancelBtn = document.getElementById('am-cancel-btn');
    if(opts.cancelLabel === null){
      cancelBtn.style.display = 'none';
    } else {
      cancelBtn.style.display = 'block';
      cancelBtn.textContent = opts.cancelLabel || 'Cancel';
    }

    document.getElementById('APPMODAL').classList.add('show');
    setTimeout(() => {
      const firstInput = fieldsWrap.querySelector('input');
      if(firstInput) firstInput.focus(); else confirmBtn.focus();
    }, 250);
  });
}
window.appModal = appModal;

// Shows an inline error inside the open modal without closing it
// (used for validation, e.g. "Both names are required")
function amShowError(msg){
  const err = document.getElementById('am-error');
  if(err) err.textContent = msg;
}
window.amShowError = amShowError;

function _amClose(result){
  document.getElementById('APPMODAL').classList.remove('show');
  const cb = _amResolve;
  _amResolve = null;
  if(cb) cb(result);
}

function _amSubmit(){
  const inputs = document.getElementById('am-fields').querySelectorAll('input');
  if(inputs.length === 0){
    _amClose(true);
    return;
  }
  const result = {};
  inputs.forEach(inp => { result[inp.dataset.key] = inp.value.trim(); });
  _amClose(result);
}
window._amSubmit = _amSubmit;

function _amCancel(){
  const hasFields = document.getElementById('am-fields').children.length > 0;
  _amClose(hasFields ? null : false);
}
window._amCancel = _amCancel;
