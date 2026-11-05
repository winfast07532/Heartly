/* Three-way merge: disjoint edits survive; conflicting edits never silently win. */
(function(root){
  const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
  function merge(base,local,remote,path=''){
    if(equal(local,base))return remote;
    if(equal(remote,base)||equal(local,remote))return local;
    if(['txLog','ptsLog'].includes(path)&&Array.isArray(local)&&Array.isArray(remote)){
      const values=[...new Map([...remote,...local].map(x=>[x.id||JSON.stringify(x),x])).values()];
      return path==='txLog'?values.sort((a,b)=>b.ts-a.ts).slice(0,100):values.filter(x=>x.ts>=Date.now()-30*86400000);
    }
    if(object(local)&&object(remote)&&(object(base)||base===undefined)){
      const out={};for(const key of new Set([...Object.keys(base||{}),...Object.keys(local),...Object.keys(remote)])){
        const value=merge(base?.[key],local[key],remote[key],path?path+'.'+key:key);if(value!==undefined)out[key]=value;
      }return out;
    }
    throw Error('SAVE_CONFLICT: '+(path||'shared state'));
  }
  const protectedKeys=['petState','petWalletTotal','petEarnedTotal','gameMilestoneReceipts','stateWriteReceipts'];
  function ordinary(s){s=structuredClone(s||{});s.ptsVal=Number(s.ptsVal||0)-Number(s.petWalletTotal||0);s.totalPtsEarned=Number(s.totalPtsEarned||0)-Number(s.petEarnedTotal||0);for(const k of protectedKeys)delete s[k];return s;}
  function state(base,local,remote){const out=merge(ordinary(base),ordinary(local),ordinary(remote));for(const k of protectedKeys)if(k in remote)out[k]=remote[k];out.ptsVal+=Number(remote.petWalletTotal||0);out.totalPtsEarned+=Number(remote.petEarnedTotal||0);return out;}
  const api={merge,state};if(typeof module!=='undefined')module.exports=api;else root.HeartlyMerge=api;
})(globalThis);
