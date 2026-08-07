/* ═══════════════════════════
   SPLASH / ONBOARDING
═══════════════════════════ */
spSlide=0; // already declared above
const spTotal=3;

function spNext(){
  if(spSlide < spTotal-1){
    // Move to next slide
    document.getElementById('sl-'+spSlide).classList.remove('on');
    spSlide++;
    document.getElementById('sl-'+spSlide).classList.add('on');
    // Update dots
    document.querySelectorAll('.sp-dot').forEach((d,i)=>d.classList.toggle('on',i===spSlide));
    // On last slide change button text
    if(spSlide===spTotal-1){
      document.getElementById('sp-cta').textContent='Begin your story 💕';
    }
  } else {
    spDone();
  }
}

function spDone(){
  const sp=document.getElementById('splash');
  sp.classList.add('gone');
  setTimeout(()=>sp.style.display='none', 520);
}
window.spNext=spNext;
window.spDone=spDone;
