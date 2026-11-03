const assert=require('node:assert/strict'),C=require('../pet/core.js');let now=Date.now(),s=C.empty(now),seq=0;
function run(kind,extra={}){const r=C.transact(s,{id:'care_'+(++seq),kind,...extra},now);s=r.state;return r;}
run('adopt',{name:'Mochi'});s.balance=1000;
assert.throws(()=>run('feed'),/Buy food/);assert.throws(()=>run('clean'),/Buy shampoo/);assert.throws(()=>run('toilet'),/Buy toilet paper/);assert.throws(()=>run('sleep'),/Buy a bed/);
for(const id of ['snack','soap','paper','bed'])run('purchase',{itemId:id,price:C.CATALOG.find(i=>i.id===id).price});
run('feed');run('clean');run('toilet');assert.equal(s.quantities.snack,0);assert.equal(s.quantities.soap,0);assert.equal(s.quantities.paper,0);
run('sleep');assert.equal(s.pet.sleeping,true);run('sleep');assert.equal(s.pet.sleeping,false);
const old=structuredClone(s);delete old.quantities.soap;delete old.quantities.paper;const migrated=C.validate(old);assert.equal(migrated.quantities.soap,0);assert.deepEqual(migrated.owned,s.owned);
console.log('PASS: purchases required, supplies consumed once, bed required, old ownership preserved.');
