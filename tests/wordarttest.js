// Word questions get illustrations: the portraits of the kids in the story and a picture of a fruit, pet or treat it mentions, above the text, as pictures only
const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts);
const ctx=await b.newContext({viewport:{width:360,height:800}}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
await p.evaluate(()=>{ document.querySelectorAll('.milestone').forEach(e=>e.remove()); openGame(1); }); await p.waitForTimeout(200);
// 1. over many generated questions: every illustration is really in the story
const r=await p.evaluate(()=>{
  let n=0, withArt=0, bad=[], kids=0, things=0, max=0, grid=0;
  for(let lv=1; lv<=9; lv++){ const pool=(typeof pools!=='undefined'&&pools[lv])||[]; for(const g of pool){ for(let i=0;i<12;i++){ let q; try{ q=genQ(g); }catch(e){ continue; } n++; const a=q.art||[]; if(a.length) withArt++; max=Math.max(max,a.length);
    const t=String(q.text).replace(/<[^>]*>/g,' ');
    for(const x of a){ if(x.k==='kid'){ kids++; if(t.indexOf(x.n)<0) bad.push('kid '+x.n+' not in: '+t.slice(0,60)); if(!x.s) bad.push('no portrait'); } else { things++; if(!x.s&&!x.cup) bad.push('no picture '+x.n); } }
    if(q.tool && a.length){ grid++; } } } }
  return {n, withArt, bad:bad.slice(0,5), kids, things, max, grid}; });
console.log('   ',JSON.stringify(r));
ok(r.n>200&&r.withArt>r.n*0.05,'a good share of the word questions have illustrations ('+r.withArt+' of '+r.n+')');
ok(r.bad.length===0,'every portrait is of a kid named in the question and every illustration has its picture '+r.bad.join('|'));
ok(r.max<=4,'at most 4 illustrations ('+r.max+')');
ok(r.kids>0&&r.things>0,'kids ('+r.kids+') and things ('+r.things+') both occur');
ok(r.grid===0,'the clue grid questions have none (the grid shows the same pictures)');
// 2. words -> pictures
const w=await p.evaluate(()=>{ const kid=PEOPLE[8]; const mk=t=>artFor({text:t},[kid]).map(x=>x.k+':'+x.n);
  return {a:mk('תהילה אכלה 3 תפוחים ו-2 בננות'), b:mk('לתהילה יש חתולים ודג אחד, ולכלב אין'), c:mk('תהילה אפתה 12 קאפקייקס'), d:mk('4 תפוחי אדמה ודגל'), e:mk('בלי שמות: 5 ענבים'), f:artFor({text:'תהילה ו-תום',tool:1},[PEOPLE[8],PEOPLE[1]]).length}; });
ok(JSON.stringify(w.a)==='["kid:תהילה","fruit:תפוח","fruit:בננה"]','kid, then fruits in the order of the text '+JSON.stringify(w.a));
ok(w.b.includes('pet:חתול')&&w.b.includes('pet:דג')&&w.b.includes('pet:כלב'),'pets with prefixes and plurals are found '+JSON.stringify(w.b));
ok(w.c.includes('treat:🧁'),'a cupcake question shows a cupcake '+JSON.stringify(w.c));
ok(!w.d.some(x=>x.includes('תפוח')||x.includes('דג')),'potatoes ("תפוחי אדמה") and a flag ("דגל") are not fruit or fish '+JSON.stringify(w.d));
ok(w.e.length===1&&w.e[0]==='fruit:ענבים','a kid who was not picked gets no portrait, but the fruit does');
ok(w.f===0,'no illustrations on a question with a tool');
// 3. on the page
const shown=await p.evaluate(async()=>{ for(let i=0;i<80;i++){ nextQuestion(); if(current.art&&current.art.some(x=>x.k==='kid')) break; } await new Promise(r=>setTimeout(r,500)); const d=document.getElementById('qart'); const im=[...d.querySelectorAll('img')]; const r=d.getBoundingClientRect(); const cr=document.getElementById('card').getBoundingClientRect();
  return {hidden:d.hidden, n:im.length, loaded:im.every(i=>i.complete&&i.naturalWidth>0), cap:d.querySelectorAll('figcaption').length, kidsN:current.art.filter(x=>x.k==='kid').length, h:Math.round(r.height), inCard:r.left>=cr.left-1&&r.right<=cr.right+1, aria:d.getAttribute('aria-hidden'), before:!!(d.compareDocumentPosition(document.getElementById('qtext'))&4)}; });
ok(!shown.hidden&&shown.n>=1&&shown.loaded,'the strip shows and its pictures load '+JSON.stringify(shown));
ok(shown.cap===shown.kidsN&&shown.inCard&&shown.before,'each portrait has its name under it; the strip is inside the card, above the text');
const none=await p.evaluate(()=>{ for(let i=0;i<200;i++){ nextQuestion(); if(!(current.art||[]).length) break; } return document.getElementById('qart').hidden; });
ok(none,'a question without illustrations leaves no gap (strip hidden)');
ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no sideways scroll at 360px');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close(); process.exit(f?1:0);
})();
