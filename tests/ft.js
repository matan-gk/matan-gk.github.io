const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{if(!c){f++;console.log('FAIL',m);}else console.log('ok  ',m);};
(async()=>{const b=await chromium.launch({...T.launchOpts});const ctx=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:1.5});const pg=await ctx.newPage();
const ext=[];pg.on('request',r=>{const u=r.url();if(!u.startsWith('file:')&&!u.startsWith('data:'))ext.push(u);});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto(T.URL);await pg.evaluate(()=>localStorage.clear());await pg.reload();
await pg.fill('#pfName','נועה');await pg.click('.gopt:has(input[value=f])');await pg.click('[data-pact=save]');
await pg.evaluate(()=>{level=3;nextQuestion();});await pg.waitForTimeout(800);
await pg.evaluate(()=>document.fonts.ready);
const info=await pg.evaluate(()=>({faces:[...document.fonts].map(f=>f.family+' '+f.weight+' '+f.status), rubik:document.fonts.check('600 16px Rubik','שלום'), baloo:document.fonts.check('800 16px "Baloo 2"','123'),
  body:getComputedStyle(document.body).fontFamily}));
console.log(info.faces.join('\n'));
ok(info.faces.every(x=>!x.endsWith('error')),'no font failed to load');
ok(info.faces.filter(x=>x.endsWith('loaded')).length>=3,'fonts used on this screen are loaded (Hebrew + digits)');
ok(ext.length===0,'no outside requests: '+ext.join(','));
await pg.screenshot({path:'f1.png'});
await pg.evaluate(()=>{level=2;nextQuestion();});await pg.waitForTimeout(300);await pg.screenshot({path:'f2.png'});
await pg.evaluate(()=>openPanel('profiles'));await pg.evaluate(()=>openPanel('progress'));await pg.waitForTimeout(300);await pg.screenshot({path:'f3.png'});
ok(errs.length===0,'no page errors '+errs.join('|'));
console.log(f?'FAILURES':'ALL PASS');await b.close();})();
