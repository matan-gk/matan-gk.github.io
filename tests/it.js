const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{if(!c){f++;console.log('FAIL',m);}else console.log('ok  ',m);};
(async()=>{const b=await chromium.launch({...T.launchOpts});const ctx=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:1.5});const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto(T.URL);await pg.evaluate(()=>localStorage.clear());await pg.reload();
await pg.fill('#pfName','נועה');await pg.click('.gopt:has(input[value=f])');await pg.click('[data-pact=save]');await pg.waitForTimeout(300);let h1home=await pg.evaluate(()=>document.querySelector('h1').textContent);await pg.evaluate(()=>openGame(level));
await pg.waitForTimeout(300);
let r=await pg.evaluate(()=>({n:document.querySelectorAll('.ic').length, names:[...new Set([...document.querySelectorAll('.ic')].map(e=>e.className))].length}));r.h1=h1home;
ok(r.n>=8,'icons on first screen: '+r.n+' ('+r.names+' kinds)'); ok(r.h1.includes('🦄'),'h1 text still contains the emoji (textContent intact)');
await pg.screenshot({path:'i1.png'});
// real UI click on an emoji MCQ (odd-one-out) : find via generators
const res=await pg.evaluate(()=>{ for(let i=0;i<60;i++){ level=4; nextQuestion(); const btns=[...document.querySelectorAll('#answerArea .choice, .choice')]; if(btns.length && btns.some(b=>/[\u{1F300}-\u{1FAFF}]/u.test(b.textContent))) return {ok:true,i,txt:btns.map(b=>b.textContent)}; } return {ok:false}; });
console.log('   emoji choices:',JSON.stringify(res));
if(res.ok){ const good=await pg.evaluate(()=>String(current.answer)); 
  const idx=await pg.evaluate(()=>{const btns=[...document.querySelectorAll('.choice')]; return btns.findIndex(b=>b.textContent==String(current.answer)||b.dataset.key===String(current.answer));});
  ok(idx>=0,'correct choice found via textContent (emoji text intact)'); await pg.locator('.choice').nth(idx).click(); await pg.waitForTimeout(200);
  ok(await pg.locator('#feedback.good').count()===1,'clicking the correct emoji choice is accepted'); }
// level 2 symbol puzzle with images
await pg.evaluate(()=>{level=2;nextQuestion();});await pg.waitForTimeout(300);await pg.screenshot({path:'i2.png'});
// panel + progress
await pg.evaluate(()=>{for(let i=0;i<40;i++){nextQuestion();checkAnswer(i%3?current.answer:'__w__',null,null);} nextQuestion();});
await pg.evaluate(()=>openPanel('profiles'));await pg.waitForTimeout(250);await pg.screenshot({path:'i3.png'});
await pg.evaluate(()=>openPanel('progress'));await pg.waitForTimeout(250);await pg.screenshot({path:'i4.png'});
await pg.click('#profClose');
// rewards room
await pg.evaluate(()=>{for(let i=0;i<30;i++){collection.push(STICKERS[i%14]);} golden.push('🦄'); lollipops.push(1,1);renderRewards();});
await pg.click('#rewardsStrip');await pg.waitForTimeout(300);await pg.screenshot({path:'i5.png'});
ok(errs.length===0,'no page errors '+errs.join('|'));
console.log(f?'FAILURES':'ALL PASS');await b.close();})();
