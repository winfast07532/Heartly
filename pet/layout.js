(function(root){
 'use strict';
 const WIDTH=640,HEIGHT=480,GAP=7;
 const PET={x:222,y:245,w:196,h:210};
 const BOWL={x:145,y:390,w:60,h:50};
 const overlaps=(a,b,gap=GAP)=>a.x<b.x+b.w+gap&&a.x+a.w+gap>b.x&&a.y<b.y+b.h+gap&&a.y+a.h+gap>b.y;
 function size(item,scale=1){const crop=item.sprite?.crop;const w=crop?.[2]||({bed:128,yarn:32,mouse:48,plant:32}[item.id]||64),h=crop?.[3]||({bed:96,yarn:32,mouse:32,plant:64}[item.id]||64);const target=Math.max(32,Math.min(112,Math.max(w,h)*2));const ratio=Math.min(target/w,150/h)*scale;return {w:Math.max(16,Math.round(w*ratio)),h:Math.max(16,Math.round(h*ratio))};}
 function explain(rect,placements=[],ignoreId=null,item=null){
   if(!['x','y','w','h'].every(k=>Number.isFinite(rect[k]))||rect.w<12||rect.h<12||rect.w>200||rect.h>240)return 'Choose a supported item size.';
   if(rect.x<12||rect.y<52||rect.x+rect.w>628||rect.y+rect.h>450)return 'Keep the whole item inside the room.';
   if(overlaps(rect,PET))return 'Leave this space clear for your cat and its animations.';
   if(overlaps(rect,BOWL))return 'Leave the food bowl clear.';
   if(item&&(item.zone||'floor')==='floor'&&rect.y+rect.h<390)return 'Place floor furniture on the floor, not on the wall.';
   if(item?.zone==='wall'&&rect.y+rect.h>315)return 'Keep wall decorations above the floor.';
   if(placements.some(p=>p.id!==ignoreId&&overlaps(rect,p)))return 'This item would overlap another decoration.';
   return '';
 }
 function firstFit(item,placements=[],ignoreId=null,scale=1){const dimensions=size(item,scale);const candidates=item.zone==='wall'?[64,96,128,160,192,224]:[432,400].map(bottom=>Math.floor((bottom-dimensions.h)/8)*8);for(const y of candidates)for(let x=16;x+dimensions.w<=624;x+=16){const rect={x,y,...dimensions};if(!explain(rect,placements,ignoreId,item))return rect;}return null;}
 function validate(placements,catalog,owned){if(!Array.isArray(placements)||placements.length>40)throw Error('The room has too many decorations.');const ids=new Set();for(const p of placements){const item=catalog.find(i=>i.id===p?.itemId);if(!p||typeof p.id!=='string'||ids.has(p.id)||!owned.includes(p.itemId)||!item||item.slot==='theme'||item.kind==='consumable'||explain(p,placements.filter(other=>other!==p),null,item))throw Error('The saved room has overlapping or invalid decorations.');ids.add(p.id);}return placements;}
 const api={WIDTH,HEIGHT,PET,BOWL,GAP,overlaps,size,explain,firstFit,validate};if(typeof module!=='undefined')module.exports=api;else root.PetLayout=api;
})(typeof window!=='undefined'?window:globalThis);
