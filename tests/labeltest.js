const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const S=require('fs').readFileSync(T.GAME,'utf8'); const i=S.indexOf('const WRONG_LABELS'), j=S.indexOf('function statsActivity');
const {classifyWrong:c,wrongLabelCounts:w,WRONG_LABELS:L}=new Function(S.slice(i,j)+';return {classifyWrong,wrongLabelCounts,WRONG_LABELS};')();
const cases=[[41,40,'off1'],[39,40,'off1'],[50,40,'off10'],[140,40,'off10'],[36,63,'swap'],[-5,5,'sign'],[10,5,'dbl'],[3,6,'dbl'],[30,50,'tens'],[47,43,'ones'],[7,200,'other'],[0,0,null],['abc',5,null],['',5,null],[2.5,3,'other']];
for(const [x,a,e] of cases) ok(c(x,a)===e,`classify(${x} chosen, ${a} right) = ${e}`);
ok(Object.keys(L).every(k=>L[k]&&L[k].length>3)&&['off1','off10','swap','sign','dbl','tens','ones','other'].every(k=>L[k]),'every label has Hebrew text');
const st={log:[{c:0,s:'a',x:'41',a:'40'},{c:0,s:'a',x:'51',a:'50'},{c:0,s:'a',x:'60',a:'50'},{c:1,s:'a'},{c:0,s:'b',x:'9',a:'3'},{c:0,s:'a',x:'כן',a:'לא'},{c:0,s:'a'}]};
const r=w(st,'a'); ok(r.n===3&&r.list[0].id==='off1'&&r.list[0].count===2,'counts per skill, non-numeric and unlogged ignored: '+JSON.stringify(r.list));
ok(w(st).n===4,'all skills together');
// shown in the Progress tab only with enough evidence
const b=await chromium.launch(T.launchOpts); const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.fill('#pfName','x'); await p.click('.gopt:has(input[value=n])'); await p.click('[data-pact=save]');
const out=await p.evaluate(()=>{ const pr=activeProfile(); const sk=Object.keys(SKILL_META)[0];
  const mk=(list)=>{ pr.stats=statsNew(); for(let i=0;i<9;i++) statsRecord(pr.stats,{skill:sk,level:1,ok:1,seconds:3}); list.forEach(([x,a])=>statsRecord(pr.stats,{skill:sk,level:1,ok:0,seconds:3,chosen:x,correct:a})); const rep=statsReport(pr.stats); return skDetail(rep.skills.find(s=>s.skill===sk),pr.stats); };
  return {few:mk([[41,40],[51,50]]), many:mk([[41,40],[51,50],[61,60],[36,63]]), scatter:mk([[41,40],[7,200],[9,500],[1,333]])};});
ok(!out.few.includes('סוג הטעות הנפוץ'),'fewer than 3 wrong answers: no label');
ok(out.many.includes('סוג הטעות הנפוץ')&&out.many.includes('קרוב ב-1')&&out.many.includes('3 מתוך 4'),'enough evidence: top label shown with counts');
ok(!out.scatter.includes('סוג הטעות הנפוץ'),'scattered mistakes: nothing claimed');
ok(errs.length===0,'no page errors '+errs);
console.log(f?'FAILURES '+f:'ALL PASS'); await b.close(); process.exit(f?1:0);})();
