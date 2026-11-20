// Parent-facing note on the home screen: progress is saved on this device (or not!), and a one-time "add to home screen" nudge
const T=require('./lib.js'); const http=require('http'), fs=require('fs'), path=require('path');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
const DIR=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png','.webmanifest':'application/manifest+json','.webp':'image/webp','.json':'application/json'};
const server=http.createServer((req,res)=>{ const u=decodeURIComponent(req.url.split('?')[0]); const file=path.join(DIR,u==='/'?'math-quest.html':u); if(!file.startsWith(DIR)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){ res.writeHead(404); return res.end('no'); } res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream','cache-control':'no-store'}); res.end(fs.readFileSync(file)); });
(async()=>{
await new Promise(r=>server.listen(0,'127.0.0.1',r)); const base='http://localhost:'+server.address().port+'/';
const b=await chromium.launch(T.launchOpts);
async function open(opts){ const ctx=await b.newContext({viewport:{width:360,height:800},...(opts||{})}); const p=await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(e.message));
  await p.goto(base); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(600); return p; }
const txt=(p,s)=>p.evaluate(s=>{ const e=document.querySelector(s); return e&&!e.hidden&&getComputedStyle(e).display!=='none' ? e.textContent.replace(/\s+/g,' ').trim() : null; },s);
let p=await open();
let t=await txt(p,'#saveNote');
ok(t&&t.includes('ההתקדמות נשמרת במכשיר הזה'),'the home screen says progress is saved on this device: '+t);
ok(t&&t.includes('אם מוחקים את נתוני הדפדפן'),'and says when it can be lost');
ok(!(t||'').includes('להוסיף את המשחק למסך הבית'),'no install nudge before the first reward');
// first reward -> nudge
await p.evaluate(()=>{ collection.push('🧁:0.0.0'); renderRewards(); }); await p.waitForTimeout(200);
t=await txt(p,'#saveNote'); ok(t&&t.includes('להוסיף את המשחק למסך הבית'),'after the first reward the nudge shows once (the service worker is available): '+t);
// the buttons are big enough to tap
const sizes=await p.evaluate(()=>[...document.querySelectorAll('#saveNote button')].map(b=>{ const r=b.getBoundingClientRect(); return [Math.round(r.width),Math.round(r.height)]; }));
ok(sizes.length>=2&&sizes.every(s=>s[0]>=44&&s[1]>=44),'buttons are at least 44px: '+JSON.stringify(sizes));
ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no sideways scroll at 360px');
// not shown while playing
await p.evaluate(()=>openGame(1)); await p.waitForTimeout(200);
ok(await txt(p,'#saveNote')===null,'hidden inside a game');
await p.evaluate(()=>{ goHome&&goHome(); }).catch(()=>{});
await p.evaluate(()=>{ gameView='home'; applyView(); }); await p.waitForTimeout(100);
// "how" opens the backup tab at the home-screen card
await p.click('[data-sn=howinstall]'); await p.waitForTimeout(400);
ok(await p.evaluate(()=>!document.getElementById('profOverlay').hidden&&profTab==='backup'&&!!document.getElementById('pwaCard')),'"how?" opens the backup tab where the home-screen card is');
await p.evaluate(()=>closeProfiles&&closeProfiles()).catch(()=>{}); await p.evaluate(()=>{ document.getElementById('profOverlay').hidden=true; });
// dismissing is remembered
await p.click('[data-sn=dismiss]'); await p.waitForTimeout(100);
ok(!((await txt(p,'#saveNote'))||'').includes('להוסיף את המשחק'),'dismissed');
await p.reload(); await p.waitForTimeout(800); await p.evaluate(()=>{ if(!collection.length){ collection.push('🧁:0.0.0'); } renderRewards(); });
ok(!((await txt(p,'#saveNote'))||'').includes('להוסיף את המשחק'),'and stays dismissed after a reload');
// install prompt available -> "install" button runs it
await p.evaluate(()=>{ localStorage.removeItem('cq_install_nudge_dismissed'); window.__pr=0; PWA.deferred={prompt(){ window.__pr++; }, userChoice:Promise.resolve({})}; renderSaveNote(); });
ok(await p.locator('[data-sn=install]').count()===1,'with the browser prompt available the button says install');
await p.click('[data-sn=install]'); await p.waitForTimeout(200);
ok(await p.evaluate(()=>window.__pr)===1,'and it runs the browser prompt');
// installed app: no nudge
await p.evaluate(()=>{ window.matchMedia=q=>({matches:/standalone/.test(q),addListener(){},removeListener(){}}); localStorage.removeItem('cq_install_nudge_dismissed'); renderSaveNote(); });
ok(!((await txt(p,'#saveNote'))||'').includes('להוסיף את המשחק'),'an installed app gets no nudge');
// cloud ok: says so
await p.evaluate(()=>{ cloud.ad={}; cloud.mode='google'; cloud.status='ok'; renderSaveNote(); });
t=await txt(p,'#saveNote'); ok(t&&t.includes('במכשיר הזה ובענן')&&!t.includes('אם מוחקים'),'with cloud backup on: saved here and in the cloud: '+t);
ok(p.errs.length===0,'no page errors '+p.errs.join('|'));
await p.context().close();
// saving fails (private mode, full storage): a clear warning
p=await open();
await p.evaluate(()=>{ Storage.prototype.setItem=function(){ throw new Error('full'); }; persist(); });
await p.waitForTimeout(200); t=await txt(p,'#saveNote');
ok(t&&t.includes('אי אפשר לשמור במכשיר הזה')&&t.includes('קוד שמירה'),'if saving fails the note warns and points to a save code: '+t);
ok(await p.evaluate(()=>document.querySelector('#saveNote [role=alert]')!==null),'announced as an alert');
await p.context().close();
// file:// (no service worker): note shown, no install nudge
{ const ctx=await b.newContext({viewport:{width:360,height:800}}); const q=await ctx.newPage(); await q.goto('file://'+path.join(DIR,'math-quest.html')); await q.evaluate(()=>localStorage.clear()); await q.reload(); await q.fill('#pfName','נועה'); await q.click('.gopt:has(input[value=f])'); await q.click('[data-pact=save]'); await q.waitForTimeout(400);
  await q.evaluate(()=>{ collection.push('🧁:0.0.0'); renderRewards(); }); const s=await txt(q,'#saveNote'); ok(s&&s.includes('נשמרת במכשיר')&&!s.includes('להוסיף את המשחק'),'opened from a file: the note, but no install nudge'); await ctx.close(); }
await b.close(); server.close(); process.exit(f?1:0);
})();
