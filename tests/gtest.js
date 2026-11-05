const T=require('./lib.js');
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({...T.launchOpts});
const bad=/(?<![א-ת])(פתרי|לחצי|בחרי|נסי|קיבלת(?!ם)|את מדהימה|כתבי|ספרי|חשבי|התחילי|בואי|שמחה מאוד|חוגגת|הצליחי|השלימי)/;
for(const g of ['m','n']){
 const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
 await p.fill('#pfName','X');await p.click('.gopt:has(input[value='+g+'])');await p.click('[data-pact=save]');await p.waitForTimeout(300);
 const txt=[];
 const grab=async()=>txt.push(await p.evaluate(()=>document.body.innerText+' '+[...document.querySelectorAll('[aria-label],[placeholder],[alt],[title]')].map(e=>(e.getAttribute('aria-label')||'')+' '+(e.placeholder||'')+' '+(e.alt||'')+' '+(e.title||'')).join(' ')));
 await grab();
 for(const t of ['profiles','progress','backup','report','guide']){await p.evaluate(t=>openPanel(t),t);await grab();await p.click('#profClose');}
 // levels + rewards room + several questions
 await p.evaluate(()=>{try{document.getElementById('rewardsStrip').click()}catch(e){}});await grab();await p.keyboard.press('Escape');
 for(let i=0;i<40;i++){
  await p.evaluate(()=>{try{score+=0;}catch(e){}});
  await grab();
  const inp=p.locator('#numAns');
  if(await inp.count()){await inp.fill('1');await p.keyboard.press('Enter');}
  else{const c=p.locator('.choice, .opt, #choices button').first();if(await c.count())await c.click({timeout:500}).catch(()=>{});}
  await p.waitForTimeout(120);
  const nx=p.locator('#nextBtn');if(await nx.isVisible().catch(()=>false))await nx.click().catch(()=>{});
 }
 const all=txt.join('\n');const m=all.match(new RegExp('.{20}'+bad.source+'.{20}','g'));
 console.log(g,'screens',txt.length,'hits',m);console.log('errs',errs);
 const real=(m||[]).filter(h=>!/"לחצי כאן"/.test(h)&&!/ספרי אגדות/.test(h)); if(real.length||errs.length){ console.log('FAIL wording for gender '+g+': '+real.join(' | ')+' '+errs); process.exitCode=1; }
 await p.close();}
await b.close(); if(!process.exitCode) console.log('ALL PASS');})();
