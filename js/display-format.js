/* Device-local display preferences. Calendar keys and saved instants are unchanged. */
(function(){
  'use strict';
  const dateLabels=['DD / MM / YYYY','MM / DD / YYYY','YYYY-MM-DD'];
  const timeLabels=['24-hour clock','12-hour (AM / PM)'];
  function preference(key,count){const n=Number(localStorage.getItem('heartly.'+key));return Number.isInteger(n)&&n>=0&&n<count?n:0;}
  function date(value){
    const d=value instanceof Date?value:new Date(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)?value+'T12:00:00':value);
    if(!Number.isFinite(d.getTime()))return '—';
    const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
    return [day+' / '+m+' / '+y,m+' / '+day+' / '+y,y+'-'+m+'-'+day][preference('dateFormat',3)];
  }
  function time(value){const d=new Date(value);return Number.isFinite(d.getTime())?d.toLocaleTimeString(preference('timeFormat',2)?'en-US':'en-GB',{hour:'2-digit',minute:'2-digit',hour12:!!preference('timeFormat',2)}):'—';}
  function labels(){
    const d=document.getElementById('sett-date-fmt'),t=document.getElementById('sett-time-fmt');
    if(d)d.textContent=dateLabels[preference('dateFormat',3)];
    if(t)t.textContent=timeLabels[preference('timeFormat',2)];
  }
  function cycle(key,count){
    localStorage.setItem('heartly.'+key,String((preference(key,count)+1)%count));labels();
    for(const name of ['syncRelationshipUI','syncSettingsRelationshipRows','renderProfileFavs','renderRobAnaMessages','renderSentLetters','renderNotifList','renderRobGoodnight','renderRelationshipTimeline'])if(typeof window[name]==='function')window[name]();
  }
  window.HeartlyFormat={date,time,dateTime:value=>date(value)+' · '+time(value),cycleDate:()=>cycle('dateFormat',3),cycleTime:()=>cycle('timeFormat',2)};
  document.addEventListener('DOMContentLoaded',labels);
})();
