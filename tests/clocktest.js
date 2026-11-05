const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=m])');await p.click('[data-pact=save]');await p.waitForTimeout(300);
// level order and button
const lv=await p.evaluate(()=>[...document.querySelectorAll('.levelbtn')].map(b=>b.innerText.replace(/\s+/g,' ')));
console.log(lv);ok(lv.length===8&&lv[3].includes('שעון'),'clock level listed fourth (after the numbers castle)');
// angles + time words
const r=await p.evaluate(()=>{
 const out={angles:[],words:[],bad:[]};
 for(const [h,m] of [[3,0],[3,30],[12,0],[6,45],[11,55],[1,5]]){const d=document.createElement('div');d.innerHTML=clockSVG(h,m);const s=d.querySelector('svg');out.angles.push([h,m,+s.dataset.ha,+s.dataset.ma,s.querySelector('.clk-h').getAttribute('transform'),s.querySelector('.clk-m').getAttribute('transform')]);}
 for(const t of [cT(3,0),cT(3,15),cT(3,30),cT(3,45),cT(3,40),cT(3,50),cT(11,55),cT(12,45),cT(3,5),cT(3,35)]) out.words.push(cStr(t)+' = '+timeWords(t));
 out.dur=[15,30,45,60,75,90,105,120,135,20].map(durWords);
 // generator sanity: answer among choices, 4 distinct choices, clock time matches answer for read questions
 for(const g of [gClockHour,gClockQuarter,gClockFive,gClockWords,gClockPick,gClockLater,bClock_Earlier,bClock_Duration]) for(let i=0;i<300;i++){
   const q=g(); const keys=q.choices.map(c=>typeof c==='object'?c.key:c);
   if(new Set(keys).size!==4) out.bad.push(g.name+' choices not 4 distinct '+keys);
   if(!keys.includes(q.answer)) out.bad.push(g.name+' answer missing');
   const d=document.createElement('div');d.innerHTML=q.text;
   if(['gClockHour','gClockQuarter','gClockFive'].includes(g.name)){const tm=d.querySelector('svg').dataset.time; if(tm!==q.answer) out.bad.push('mismatch '+tm+' '+q.answer);}
   if(g.name==='gClockQuarter'||g.name==='gClockHour'){ const m=+q.answer.split(':')[1]; if(g===gClockQuarter&&![15,45].includes(m)) out.bad.push('quarter m '+m); if(g===gClockHour&&![0,30].includes(m)) out.bad.push('hour m '+m); }
   if(g===bClock_Duration){ const sv=[...d.querySelectorAll('svg')].map(x=>x.dataset.time); }
   if(/undefined|NaN|(^|\s)-\d+ דקות/.test(q.text+keys.join(' '))) out.bad.push(g.name+' bad text '+keys);
 }
 return out;});
console.log(JSON.stringify(r.angles));console.log(r.words.join(' | '));console.log(r.dur.join(' | '));
ok(r.bad.length===0,'2400 generated questions are consistent '+r.bad.slice(0,5));
const a=r.angles; ok(a[1][2]===105&&a[1][3]===180,'3:30 hands: hour 105deg, minute 180deg'); ok(a[3][2]===202.5&&a[3][3]===270,'6:45 hour 202.5');ok(a[2][2]===0,'12:00 hour 0');ok(a[4][2]===357.5&&a[4][3]===330,'11:55 hour 357.5');
// check duration answer correctness
const dok=await p.evaluate(()=>{let bad=0;for(let i=0;i<400;i++){const q=bClock_Duration();const d=document.createElement('div');d.innerHTML=q.text;const [s,e]=[...d.querySelectorAll('svg')].map(x=>x.dataset.time.split(':').map(Number));const mins=((e[0]%12)*60+e[1]-((s[0]%12)*60+s[1])+720)%720;if(durWords(mins)!==q.answer)bad++;}return bad;});
ok(dok===0,'duration answers match the two clocks');
const lok=await p.evaluate(()=>{let bad=0;for(let i=0;i<400;i++){const q=gClockLater();const d=document.createElement('div');d.innerHTML=q.text;const t=d.querySelector('svg').dataset.time.split(':').map(Number);const m=d.textContent.match(/בעוד (.+?), מה/)[1];const map={'רבע שעה':15,'חצי שעה':30,'45 דקות':45,'שעה':60,'20 דקות':20,'40 דקות':40,'שעה ורבע':75,'שעה וחצי':90};const tot=((t[0]%12)*60+t[1]+map[m]+720)%720;if(cStr(tot)!==q.answer)bad++;}return bad;});
ok(lok===0,'later answers match the clock');
// play the level
await p.click('.levelbtn:nth-child(4)');await p.waitForTimeout(200);
ok(await p.evaluate(()=>level)===6,'level 6 selected');
for(let i=0;i<6;i++){
  await p.evaluate(i=>{current=[gClockHour,gClockQuarter,gClockFive,gClockWords,gClockPick,gClockLater][i]();current.skill=[gClockHour,gClockQuarter,gClockFive,gClockWords,gClockPick,gClockLater][i].name;document.getElementById('qlabel').textContent=current.label;document.getElementById('qtext').innerHTML=grpShapes(current.text);renderAnswerArea(current,checkAnswer);},i);
  await p.locator('#card').scrollIntoViewIfNeeded();await p.screenshot({path:'c_q'+i+'.png'});
}
await p.evaluate(()=>{startQTimer();});
await p.click('#helpBtn');await p.waitForTimeout(200);
ok((await p.textContent('#helpBody')).includes('מה שואלים'),'help opens for a clock skill');await p.screenshot({path:'c_help.png'});
await p.evaluate(()=>{closeHelp();});
// answering a clock question records stats under the clock area
await p.evaluate(()=>{nextQuestion();});
const sk=await p.evaluate(()=>current.skill);ok(await p.evaluate(s=>pools[6].some(g=>g.name===s),sk),'level 6 draws clock-section questions: '+sk);
const rpt=await p.evaluate(()=>{const tmp=document.createElement('div');tmp.innerHTML=current.text;return 1;});
await p.click('.choice');await p.waitForTimeout(200);
const rep=await p.evaluate(()=>cqStats());ok(rep&&rep.areas.some(a=>a.area==='clock'),'clock area appears in the stats report');
// bonus
await p.evaluate(()=>{renderBonus();});await p.screenshot({path:'c_bonus.png'});ok(/bClock/.test(await p.evaluate(()=>current.skill)),'bonus is a clock bonus');
// level 5 mix and persistence
await p.evaluate(()=>{level=5;let seen=0;for(let i=0;i<300;i++){nextQuestion();if(/^gClock/.test(current.skill))seen++;}window.__seen=seen;});
ok(await p.evaluate(()=>__seen)>5,'level 5 mixes in clock questions ('+await p.evaluate(()=>__seen)+'/300)');
await p.evaluate(()=>{level=6;saveState();});await p.reload();ok(await p.evaluate(()=>level)===6,'level 6 survives reload');
ok(errs.length===0,'no page errors '+errs.join('|'));
console.log(f?'FAILURES '+f:'ALL PASS');await b.close();})();
