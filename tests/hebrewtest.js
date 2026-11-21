// Hebrew proofread regression: wording slips found by reading every question template.
const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts); const p=await (await b.newContext()).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
const gen=n=>p.evaluate(n=>{const o=[];for(let i=0;i<400;i++){const q=window[n]();o.push(String(q.text).replace(/<[^>]*>/g,' '));}return o;},n);
const R=await gen('gRoundsTransfer');
ok(R.every(t=>!/ב-1 סבבים/.test(t)),'rounds game never says "ב-1 סבבים"');
ok(R.some(t=>/בסבב אחד/.test(t)),'rounds game says "בסבב אחד" when it is one round');
const A=await gen('gAnalogyWord');
ok(A.every(t=>!/שייך ל-/.test(t)&&/ : /.test(t)),'word analogy is shown as pairs (no "שייך ל-")');
// no hyphen glued before a Hebrew letter in any generated text, except the allowed ב-/ל-/ו- before digits or Latin
const all=await p.evaluate(()=>{const o=[];const seen=new Set();for(const lv in pools)for(const g of pools[lv])seen.add(g);if(typeof BONUS_POOL!=='undefined')BONUS_POOL.forEach(g=>seen.add(g));
  for(const g of seen){for(let i=0;i<60;i++){try{const q=g();o.push([g.name,String(q.text).replace(/<[^>]*>/g,' ')]);}catch(e){}}}return o;});
const bad=all.filter(([n,t])=>/[בלמכש]-[א-ת]/.test(t.replace(/[֑-ׇ]/g,''))&&!/^gSh/.test(n)).slice(0,5);
ok(bad.length===0,'no prefix-hyphen before a Hebrew word '+JSON.stringify(bad));
const S=await p.evaluate(()=>{const o=[];for(let i=0;i<300;i++){o.push(String(gShSynonyms().text));}return o;});
ok(S.every(t=>!/הַמִּילִּים הַמִּילִּים/.test(t)),'synonyms question has no doubled word');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close(); process.exit(f?1:0);})();
