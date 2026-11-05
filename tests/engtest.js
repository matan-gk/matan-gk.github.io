const T=require('./lib.js');
const E=T.extract('// ===== STATS ENGINE =====','// ===== /STATS ENGINE =====',['STATS_CONFIG','SKILL_META','statsNew','statsSanitize','statsRecord','assessSkill','trendSkill','lifetimeSkill','statsReport','numericErrorPatterns','statsBand','statsActivity','statsDateKey']); let fails=0;
const ok=(c,m)=>{ if(!c){fails++;console.log('FAIL',m);} else console.log('ok  ',m); };
const day=86400000, T0=new Date(2026,0,1,10).getTime();
const rec=(st,skill,okk,i,extra={})=>E.statsRecord(st,{skill,level:1,bonus:false,ok:okk,seconds:5+(i%3),t:T0+i*60000,chosen:okk?undefined:extra.x,correct:extra.a});
// 1. insufficient data
let st=E.statsNew(); for(let i=0;i<7;i++) rec(st,'gSharing',true,i);
let a=E.assessSkill(st,'gSharing'); ok(!a.ready&&a.band.id==='unknown','7 answers => not enough data');
rec(st,'gSharing',true,7); a=E.assessSkill(st,'gSharing'); ok(a.ready&&a.band.id==='solid','8/8 => solid');
// 2. bands boundaries
const mk=(c,n)=>{const s=E.statsNew();for(let i=0;i<n;i++)rec(s,'gChange',i<c,i);return E.assessSkill(s,'gChange').band.id;};
ok(mk(17,20)==='solid','85% => solid'); ok(mk(16,20)==='ontheway','80% => on the way'); ok(mk(12,20)==='ontheway','60% => on the way'); ok(mk(11,20)==='practice','55% => practice');
// 3. label independent of history: stable 75% vs dropped from 90% to 75% get same label, different trend
const stable=E.statsNew(), dropped=E.statsNew();
for(let i=0;i<60;i++) rec(stable,'gMachine',i%4!==0,i);                 // always 75%
for(let i=0;i<30;i++) rec(dropped,'gMachine',i%10!==0,i);               // 90%
for(let i=30;i<60;i++) rec(dropped,'gMachine',i%4!==0,i);               // then 75%
const A1=E.assessSkill(stable,'gMachine'),A2=E.assessSkill(dropped,'gMachine');
ok(A1.band.id==='ontheway'&&A2.band.id==='ontheway'&&Math.abs(A1.accuracy-A2.accuracy)<1e-9,'same label for stable-75 and dropped-90->75');
const T1=E.trendSkill(stable,'gMachine'),T2=E.trendSkill(dropped,'gMachine');
ok(T1.dir==='flat'&&T2.dir==='down','trend differs: flat vs down ('+T1.dir+','+T2.dir+')');
// trend not ready with <8 in previous window
const few=E.statsNew(); for(let i=0;i<35;i++) rec(few,'gSequence',true,i); ok(E.trendSkill(few,'gSequence').ready===false,'trend needs 8 in both windows');
// 4. window is per skill, not global
const mix=E.statsNew(); for(let i=0;i<40;i++) rec(mix,'gA',false,i); for(let i=0;i<100;i++) rec(mix,'gB',true,100+i);
ok(E.assessSkill(mix,'gA').n===30 && E.assessSkill(mix,'gA').accuracy===0,'window per skill (gA keeps its own last 30 despite 100 gB answers after)');
// 5. rollup at cap, lifetime preserved
const cap=E.statsNew(); const cfg=Object.assign({},E.STATS_CONFIG,{logCap:50});
for(let i=0;i<130;i++) E.statsRecord(cap,{skill:'gGroups',level:2,ok:i%2===0,seconds:4,t:T0+i*3600000},cfg);
ok(cap.log.length===50,'log capped at 50'); const lt=E.lifetimeSkill(cap,'gGroups'); ok(lt.n===130&&lt.correct===65,'lifetime totals survive rollup ('+lt.n+','+lt.correct+')');
ok(Object.keys(cap.daily).length>0,'daily summaries exist'); ok(E.statsActivity(cap).totalAnswers===130,'activity counts rolled + raw');
// 6. time cap & wrong-answer payload
const t=E.statsNew(); const r=E.statsRecord(t,{skill:'gX',level:1,ok:false,seconds:9999,chosen:'12',correct:2,t:T0}); ok(r.d===120&&r.x==='12'&&r.a==='2','seconds capped; wrong payload stored');
// 7. numeric error patterns
const ep=E.statsNew(); [['12','2'],['12','2'],['3','2'],['abc','2']].forEach((p,i)=>E.statsRecord(ep,{skill:'gX',ok:false,seconds:3,chosen:p[0],correct:p[1],t:T0+i}));
const np=E.numericErrorPatterns(ep,'gX'); ok(np.patterns[0].diff===10&&np.patterns[0].count===2&&np.other===1,'error patterns: +10 x2, other 1');
// 8. sanitize garbage
const g=E.statsSanitize({log:[{s:'a',t:1,c:1,d:3},{s:5},null,{s:'b',t:'x',c:1},{s:'z',t:5,c:0,d:-3,x:{},a:2}],daily:{'2026-01-01':{gA:{n:3,c:5}, gB:{n:4,c:2,t:9}}, bad:5}});
ok(g.log.length===2&&g.log[1].d===0&&Object.keys(g.daily['2026-01-01']).length===1,'sanitize drops malformed records'); ok(E.statsSanitize(null).log.length===0&&E.statsSanitize('x').v===1,'sanitize null/str');
// 9. config-driven: change thresholds & labels, per-skill shift
const cfg2=JSON.parse(JSON.stringify(E.STATS_CONFIG)); cfg2.bands=[{id:'a',min:0.9,emoji:'A',label:'x'},{id:'b',min:0.5,emoji:'B',label:'y'},{id:'c',min:0,emoji:'C',label:'z'}];
const s16=E.statsNew(); for(let i=0;i<20;i++) rec(s16,'gChange',i<16,i); ok(E.assessSkill(s16,'gChange',cfg2).band.id==='b'&&E.assessSkill(s16,'gChange').band.id==='ontheway','custom bands/labels via config');
E.SKILL_META.gChange.bandShift=-0.10; ok(E.statsBand(0.76,'gChange').id==='solid','per-skill bandShift lowers threshold'); delete E.SKILL_META.gChange.bandShift;
// 10. report shape
const rep=E.statsReport(dropped); ok(rep.skills.length===1&&rep.areas[0].area==='patterns'&&rep.areas[0].band.id==='ontheway'&&rep.weakest[0]==='gMachine'&&rep.skills[0].trend.dir==='down','report: skills, areas, weakest, trend');
ok(E.statsReport(E.statsNew()).overall.ready===false,'empty report is safe');
console.log(fails?('FAILURES: '+fails):'ALL PASS');
