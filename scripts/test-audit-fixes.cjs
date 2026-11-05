const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),M=require('../js/state-merge.js'),C=require('../pet/core.js'),N=require('../pet/notifications.js');
const base={ptsVal:500,totalPtsEarned:500,ED:{notes:[],letters:[]}};
const a=structuredClone(base),b=structuredClone(base);a.ED.notes.push({l:'New note'});b.ptsVal+=100;
const merged=M.state(base,b,a);assert.equal(merged.ptsVal,600);assert.equal(merged.ED.notes.length,1);
const conflict=structuredClone(base);conflict.ED.notes.push({l:'Different note'});
assert.throws(()=>M.state(base,conflict,a),/SAVE_CONFLICT/);
const petRemote={...base,ptsVal:475,petWalletTotal:-25,petEarnedTotal:0,petState:{revision:2}};
assert.equal(M.state(base,b,petRemote).ptsVal,575,'pet spending and unrelated earnings both retained');
assert.equal(M.merge([],[{id:'a',ts:Date.now(),amt:25}],[{id:'a',ts:Date.now(),amt:25}],'ptsLog').length,1);
const now=Date.now();let s=C.transact(C.empty(now),{id:'audit_adopt',kind:'adopt',name:'Mochi'},now).state;
assert.deepEqual(N.evaluate(s,now+72*C.HOUR,C).filter(x=>x.low).map(x=>x.metric),['hunger','happiness','cleanliness','energy']);
assert.equal(C.advance(s,now+72*C.HOUR).pet.needs.energy,20);
s.pet.sleeping=true;assert.equal(C.advance(s,now+72*C.HOUR).pet.needs.energy,100);
s.pet.vacation=true;assert.deepEqual(C.advance(s,now+72*C.HOUR).pet.needs,s.pet.needs);
for(const [file,fn] of [['clicker/clicker-script.js','awardLoveClickerPoints'],['loveblast/script.js','awardLoveBlastPoints']]){
 const text=fs.readFileSync(require('path').resolve(__dirname,'..',file),'utf8');let claims=0;const parent={ptsVal:0,reportClickerSession(){},reportBlastSession(){},claimGameMilestones(){claims++;}};
 for(let device=0;device<2;device++){const context={window:{parent},localStorage:{getItem(){return null;},setItem(){}}};vm.runInNewContext('(function heartlyBridge(){'+text.split('(function heartlyBridge(){')[1],context);context.window[fn](2000,false);}
 assert.equal(parent.ptsVal,268,'only unchanged session rewards are paid locally');assert.equal(claims,2,'milestones go through shared authority');
}
const old=JSON.parse(require('node:child_process').execFileSync('git',['show','HEAD:pet/config.js'],{cwd:require('path').resolve(__dirname,'..'),encoding:'utf8'}).split('const config = ')[1].split(';')[0]);
const current=require('../pet/config.js');assert.deepEqual(current.items,old.items);assert.equal(current.dailyReward,old.dailyReward);
console.log('PASS: disjoint saves, explicit conflicts, pet wallet reconciliation, log deduplication, multi-day decay/all four alerts, sleeping/vacation, shared milestone routing and unchanged prices/rewards.');
