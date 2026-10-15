/* Navigation and presentation for the existing developer controls. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const sections={overview:['Your workspace','A clear place for the things you make for Ana.'],content:['Letters & notes','Edit the content library and review your letter calendar.'],artwork:['Pictures for Ana','Upload a photo, adjust the pixel preview, then publish when it is ready.'],features:['Features & achievements','Configure unlocked experiences and manage what Ana can access.'],pts:['Points & rewards','Review Ana’s balance and adjust it when needed.'],tools:['Maintenance','Notifications, backups and advanced account controls.']};
  function health(){const status=window.pixelArtSyncStatus;const pending=window.pixelArtSavePending;$('studio-sync').textContent=status==='synced'&&!pending?'Saved to Heartly':status==='syncing'?'Saving to Heartly…':status==='offline'?'Offline · changes waiting to sync':'Saved here · cloud sync pending';const list=window.getPixelArtState?Object.values(getPixelArtState().custom):[];$('studio-art-count').textContent=list.filter(a=>!a.draft).length+' published · '+list.filter(a=>a.draft).length+' drafts';}
  const artwork=$('dv-artwork');
  let artworkHeight=680;
  function expandArtwork(on){
    artwork.classList.toggle('studio-expanded',on);
    $('ROBERT').classList.toggle('artwork-expanded',on);
    artwork.querySelector('button').textContent=on?'Back to Studio':'Expand workspace';
    $('developer-artwork-frame').style.height=on?'':artworkHeight+'px';
  }
  window.resizeArtworkWorkspace=function(height){
    if(!Number.isFinite(height))return;
    artworkHeight=Math.max(480,Math.ceil(height));
    if(!artwork.classList.contains('studio-expanded'))$('developer-artwork-frame').style.height=artworkHeight+'px';
  };
  const originalTab=window.dvTab;
  window.dvTab=function(id){if(!sections[id])return;if(id!=='artwork')expandArtwork(false);originalTab(id);const [title,description]=sections[id];$('studio-section-title').textContent=title;$('studio-section-description').textContent=description;document.querySelectorAll('#dv-tabs [data-dv]').forEach(b=>b.setAttribute('aria-current',b.dataset.dv===id?'page':'false'));if(id==='artwork'){if($('developer-artwork-frame').getAttribute('src')==='about:blank')$('developer-artwork-frame').src='pixelart/index.html?manage=1';else $('developer-artwork-frame').contentWindow.openArtworkManager?.();if(matchMedia('(max-width:600px)').matches){expandArtwork(true);}}health();requestAnimationFrame(()=>{const sc=$('rob-scroll');if(id==='overview')sc.scrollTop=0;else sc.scrollTop+=$('studio-section-intro').getBoundingClientRect().top-sc.getBoundingClientRect().top-$('dv-tabs').offsetHeight-16;});};
  const originalShow=window.showRobertView;
  window.showRobertView=function(){originalShow();dvUpdateHeader();dvTab('overview');};
  window.studioFullscreenArtwork=function(){expandArtwork(!artwork.classList.contains('studio-expanded'));};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('dv-artwork').classList.contains('studio-expanded'))studioFullscreenArtwork();});
  const library=$('dev-list-rob').closest('.dv-card');library.classList.add('studio-letter-library');$('dv-content').prepend(library);
  // Existing bottom navigation uses divs; make it keyboard-operable too.
  document.querySelectorAll('#rob-tabs .rob-tab').forEach(tab=>{tab.tabIndex=0;tab.setAttribute('role','button');tab.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tab.click();}};});
  // Label legacy form controls from their own placeholders without changing their handlers.
  document.querySelectorAll('#ROBERT input,#ROBERT textarea').forEach(input=>{if(!input.labels?.length&&!input.getAttribute('aria-label')&&input.placeholder)input.setAttribute('aria-label',input.placeholder.replace(/[…]/g,''));});
  document.querySelectorAll('#dev-editor .dev-field').forEach(field=>{const label=field.querySelector('label'),input=field.querySelector('input,textarea,select');if(label&&input?.id)label.htmlFor=input.id;});
  // Keep risky maintenance tools separate and collapsed until explicitly opened.
  const danger=[...document.querySelectorAll('#dv-tools .dv-card')].find(card=>card.querySelector('.dv-head-lbl')?.textContent.includes('Danger Zone'));
  if(danger){const details=document.createElement('details');details.className='studio-advanced';const summary=document.createElement('summary');summary.textContent='Advanced controls · resets and bulk changes';danger.before(details);details.append(summary,danger);}
  window.addEventListener('pixelart-state',health);
})();
