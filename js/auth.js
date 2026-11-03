/* Supabase sessions are separate from device-local Face ID / app lock. */
(function(){
  'use strict';
  let pending=null,requiredRole=null;
  function client(){
    if(!_sb)_sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
    return _sb;
  }
  async function membership(){
    const {data,error}=await client().rpc('heartly_member_role');
    if(error||!['ana','robert'].includes(data))return null;
    return data;
  }
  const dialog=document.createElement('dialog');dialog.id='heartly-auth';
  dialog.innerHTML='<form id="heartly-auth-form"><button type="button" id="auth-cancel" aria-label="Close sign in">×</button><h2>Welcome to your Heartly.</h2><p>Sign in to keep your shared home and progress safe.</p><label>Email<input id="auth-email" type="email" autocomplete="username" required></label><label>Password<input id="auth-password" type="password" autocomplete="current-password" minlength="10" required></label><p id="auth-message" role="status"></p><button id="auth-submit" type="submit">Sign in</button><button id="auth-signup" type="button">Create my account</button><button id="auth-switch" type="button" hidden>Use a different account</button></form>';
  document.body.append(dialog);
  const $=id=>document.getElementById(id);
  function message(text){$('auth-message').textContent=text;}
  function finish(value){if(dialog.open)dialog.close();const resolve=pending;pending=null;resolve?.(value);}
  $('auth-cancel').onclick=()=>finish(false);dialog.addEventListener('cancel',()=>finish(false));
  $('auth-switch').onclick=async()=>{await client().auth.signOut();$('auth-switch').hidden=true;message('Sign in with your own Heartly account.');};
  async function submit(create){
    if(!$('heartly-auth-form').reportValidity())return;
    const email=$('auth-email').value.trim(),password=$('auth-password').value;
    $('auth-submit').disabled=$('auth-signup').disabled=true;message(create?'Creating your account…':'Signing in…');
    try{
      const result=create?await client().auth.signUp({email,password,options:{emailRedirectTo:location.origin+'/index.html'}}):await client().auth.signInWithPassword({email,password});
      if(result.error)throw result.error;
      $('auth-password').value='';
      if(create&&!result.data.session){message('Check your email to confirm your account, then return here and sign in.');return;}
      const role=await membership();
      if(!role)throw Error('This email has not been granted access to your Heartly home.');
      if(requiredRole&&role!==requiredRole){$('auth-switch').hidden=false;throw Error('This part of Heartly is available to Robert’s account.');}
      finish(true);
    }catch(error){message(error.message||'Could not sign in. Please try again.');}
    finally{$('auth-submit').disabled=$('auth-signup').disabled=false;}
  }
  $('heartly-auth-form').onsubmit=e=>{e.preventDefault();submit(false);};$('auth-signup').onclick=()=>submit(true);
  window.HeartlyAuth={
    client,
    async require(role=null){
      const {data}=await client().auth.getSession();
      if(data.session){const actual=await membership();if(actual&&(!role||actual===role))return true;}
      if(pending)return false;
      requiredRole=role;message('Use the email address approved for your Heartly account.');$('auth-switch').hidden=!data.session;
      dialog.showModal();$('auth-email').focus();return new Promise(resolve=>pending=resolve);
    },
    async token(){
      const {data,error}=await client().auth.getSession();
      if(error||!data.session)throw Error('Please sign in again to save your progress.');
      return data.session.access_token;
    },
    async signOut(){await client().auth.signOut();location.reload();}
  };
})();
