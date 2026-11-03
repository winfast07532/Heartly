const assert=require('node:assert/strict'),C=require('../pet/core.js');let now=Date.now(),seq=0;
function home(){let s=C.empty(now);s=C.transact(s,{id:'adopt_'+(++seq),kind:'adopt',name:'Mochi'},now).state;s.balance=1000;return s;}
function run(s,kind,extra={}){return C.transact(s,{id:'care_'+(++seq),kind,...extra},now).state;}
let s=home();assert.throws(()=>run(s,'feed'),/food/);assert.throws(()=>run(s,'clean'),/care kit/);assert.throws(()=>run(s,'sleep'),/bed/);
for(const [id,gain] of [['kit1',20],['kit2',50],['kit3',90],['snack',30],['fish',50],['chicken',70]]){
 s=home();const item=C.CATALOG.find(i=>i.id===id);s=run(s,'purchase',{itemId:id,price:item.price});const need=item.careAction==='clean'?'cleanliness':'hunger';s.pet.needs[need]=5;
 const request={id:'once_'+(++seq),kind:item.careAction,itemId:id};s=C.transact(s,request,now).state;assert.equal(s.pet.needs[need],5+gain);assert.equal(s.quantities[id],0);assert.equal(C.transact(s,request,now).state.quantities[id],0);
}
s=home();s.quantities.soap=2;s.quantities.paper=3;delete s.careVersion;s.pet.cooldowns.clean=now+999999;
let migrated=C.validate(s);assert.equal(migrated.quantities.kit1,3);assert.equal(migrated.quantities.kit2,2);assert.equal(migrated.quantities.soap,0);assert.equal(migrated.pet.cooldowns.clean,0);
assert.deepEqual(C.validate(migrated).quantities,migrated.quantities);assert.equal(migrated.balance,s.balance);assert.deepEqual(migrated.owned,s.owned);
assert.throws(()=>run(s,'purchase',{itemId:'soap',price:35}),/unavailable/);
s=run(home(),'purchase',{itemId:'bed',price:300});s=run(s,'sleep');assert.equal(s.pet.sleeping,true);
console.log('PASS: all kit/food gains, one-use consumption, idempotent retry, legacy conversion exactly once, unchanged wallet/ownership, retired supplies blocked and bed requirement.');
