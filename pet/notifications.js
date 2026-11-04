/* Shared, side-effect-free notification policy. No wallet or save writes. */
(function(root){
  'use strict';
  const threshold=30;
  const labels={hunger:'Hunger',happiness:'Happiness',cleanliness:'Cleanliness',energy:'Energy'};
  const advice={hunger:'Time for a meal.',happiness:'A cat toy would help.',cleanliness:'Time for a care kit.',energy:'A nap in bed would help.'};
  function evaluate(raw,now,core){
    if(!raw?.pet)return [];
    const state=core.advance(core.validate(raw),now),pet=state.pet;
    if(pet.vacation)return [];
    return Object.entries(labels).map(([metric,label])=>({
      petId:pet.id,metric,low:pet.needs[metric]<threshold,
      title:`${pet.name} · ${label} is low`,
      body:`${label} is ${Math.floor(pet.needs[metric])}%. ${advice[metric]}`,
      tag:`heartly-pet-${metric}`,url:'index.html?pet=1'
    }));
  }
  const api={threshold,evaluate};
  if(typeof module!=='undefined')module.exports=api;else root.PetNotifications=api;
})(globalThis);
