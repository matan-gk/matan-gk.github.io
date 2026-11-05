const T=require('./lib.js');
const {chromium}=require('playwright'); const http=require('http'), fs=require('fs'), path=require('path');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
const DIR=path.dirname(T.GAME), PAGE=path.basename(T.GAME);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png','.webmanifest':'application/manifest+json'};
let release=1;                                  // flipping this serves a "new version" of the game and of sw.js
const server=http.createServer((req,res)=>{
  const u=decodeURIComponent(req.url.split('?')[0]); const file=path.join(DIR,u==='/'?PAGE:u);
  if(!file.startsWith(DIR)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){ res.writeHead(404); return res.end('no'); }
  let body=fs.readFileSync(file);
  if(release===2&&u==='/sw.js') body=Buffer.from(body.toString().replace(/const VERSION = '[^']*'/,"const VERSION = '9999.test'"));
  if(release===2&&u==='/'+PAGE) body=Buffer.from(body.toString().replace('</body>','<!--release2--></body>'));
  res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream','cache-control':'no-store'}); res.end(body);
});
(async()=>{
await new Promise(r=>server.listen(0,'127.0.0.1',r)); const base='http://localhost:'+server.address().port;
const b=await chromium.launch(T.launchOpts);
// ---- static checks on the files ----
const man=JSON.parse(fs.readFileSync(path.join(DIR,'manifest.webmanifest'),'utf8'));
ok(man.name&&man.short_name&&man.lang==='he'&&man.dir==='rtl'&&man.display==='standalone','manifest: names, Hebrew, right-to-left, standalone');
ok(man.start_url==='./'+PAGE&&fs.existsSync(path.join(DIR,PAGE)),'manifest start_url points at the game file');
const sizes={}; for(const i of man.icons){ const buf=fs.readFileSync(path.join(DIR,i.src)); sizes[i.src]=[buf.readUInt32BE(16),buf.readUInt32BE(20)]; ok(sizes[i.src][0]+'x'+sizes[i.src][1]===i.sizes,'icon '+i.src+' is really '+i.sizes); }
ok(man.icons.some(i=>i.purpose==='maskable')&&man.icons.some(i=>i.sizes==='512x512'&&i.purpose==='any'),'has a 512 icon and a maskable one');
const apple=fs.readFileSync(path.join(DIR,'apple-touch-icon.png')); ok(apple.readUInt32BE(16)===180,'apple-touch-icon is 180x180');
const sw=fs.readFileSync(path.join(DIR,'sw.js'),'utf8'), game=fs.readFileSync(T.GAME,'utf8');
const swV=(sw.match(/const VERSION = '([^']*)'/)||[])[1], appV=(game.match(/const APP_VERSION = '([^']*)'/)||[])[1];
ok(swV&&swV===appV,'sw.js VERSION equals APP_VERSION ('+swV+' / '+appV+'): a new release must change both');
ok(/rel="manifest"/.test(game)&&/rel="apple-touch-icon"/.test(game)&&/name="theme-color"/.test(game),'game links the manifest, touch icon and theme colour');
ok(!/firebase|gstatic|google/i.test(sw.replace(/Firebase and Google are never touched/,'')),'service worker never mentions or caches outside origins');
// ---- from a local file (no service worker possible): nothing breaks, no card ----
{ const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.fill('#pfName','x'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]');
  await p.evaluate(()=>openPanel('backup')); ok(!(await p.textContent('#profBody')).includes('מסך הבית'),'file:// shows no home-screen card'); ok(errs.length===0,'file:// no page errors '+errs); await p.context().close(); }
// ---- served over http: install, offline, update ----
const ctx=await b.newContext({viewport:{width:390,height:844}}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(base+'/'+PAGE); await p.evaluate(()=>localStorage.clear()); await p.reload();
await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
await p.waitForFunction(()=>navigator.serviceWorker.controller,null,{timeout:10000}).catch(()=>{});
await p.reload(); await p.waitForTimeout(500);
ok(await p.evaluate(()=>!!navigator.serviceWorker.controller),'service worker controls the page after install');
const cached=await p.evaluate(async()=>{ const ks=await caches.keys(); const c=await caches.open(ks[0]); return {keys:ks,urls:(await c.keys()).map(r=>new URL(r.url).pathname)}; });
ok(cached.keys.length===1&&cached.keys[0]==='cq-'+swV,'one cache named for the version: '+cached.keys);
ok(cached.urls.includes('/'+PAGE)&&cached.urls.includes('/icon-192.png')&&cached.urls.includes('/manifest.webmanifest'),'game, manifest and icons are cached: '+cached.urls.join(' '));
ok(await p.evaluate(()=>PWA.supported&&PWA.ready),'page knows it is offline-ready');
await p.evaluate(()=>openPanel('backup')); const card=await p.textContent('#profBody');
ok(card.includes('מסך הבית וגישה בלי אינטרנט')&&card.includes('יעבוד גם בלי אינטרנט'),'backup page shows the home-screen card and offline status');
ok(card.includes('התקנה'),'non-iOS: tells how to install');
// the browser's own install prompt
await p.evaluate(()=>{ window.__prompted=0; PWA.deferred={prompt(){ window.__prompted++; },userChoice:Promise.resolve({outcome:'accepted'})}; renderProfiles(); });
ok(await p.locator('[data-pact=pwainstall]').count()===1,'install button appears when the browser offers it'); await p.click('[data-pact=pwainstall]'); await p.waitForTimeout(100);
ok(await p.evaluate(()=>window.__prompted)===1&&await p.locator('[data-pact=pwainstall]').count()===0,'install button triggers the prompt once and disappears');
await p.screenshot({path:'pwa_card.png'});
await p.evaluate(()=>closeProfiles&&closeProfiles());
// offline: reload with the network off
await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(800);
ok(await p.evaluate(()=>typeof nextQuestion==='function'&&!!document.getElementById('menuBtn')),'offline: the game opens from the saved copy');
ok((await p.textContent('#menuBtn')).includes('נועה'),'offline: the profile and progress are there');
await p.evaluate(()=>{ nextQuestion(); }); ok((await p.textContent('#qtext')).length>3,'offline: questions work');
const img=await p.evaluate(()=>fetch('icon-192.png').then(r=>r.ok).catch(()=>false)); ok(img,'offline: icons come from the cache');
await ctx.setOffline(false);
// update: the server now has a new release
release=2; await p.evaluate(()=>navigator.serviceWorker.getRegistration().then(r=>r.update())); await p.waitForSelector('#pwaToast',{timeout:10000}).catch(()=>{});
ok(await p.locator('#pwaToast').count()===1&&(await p.textContent('#pwaToast')).includes('גרסה חדשה'),'a new release shows the "new version" notice');
ok(await p.evaluate(async()=>(await caches.keys()).length)===2,'old and new caches coexist until reload');
await Promise.all([p.waitForNavigation({timeout:15000}).catch(()=>{}), p.click('#pwaReload')]); await p.waitForTimeout(800);
ok((await p.content()).includes('release2'),'after "reload" the new version is running');
ok(await p.evaluate(async()=>{ const k=await caches.keys(); return k.length===1&&k[0]==='cq-9999.test'; }),'old cache is deleted');
ok((await p.textContent('#menuBtn')).includes('נועה'),'progress survived the update');
// dismissing the notice
ok(await p.locator('#pwaToast').count()===0,'no notice after the update');
// iOS: instructions instead of a button
const ios=await (await b.newContext({viewport:{width:390,height:844},userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'})).newPage();
await ios.goto(base+'/'+PAGE); await ios.evaluate(()=>localStorage.clear()); await ios.reload(); await ios.fill('#pfName','x'); await ios.click('.gopt:has(input[value=n])'); await ios.click('[data-pact=save]'); await ios.waitForTimeout(1200);
await ios.evaluate(()=>openPanel('backup')); const it=await ios.textContent('#profBody');
ok(it.includes('הוספה למסך הבית')&&it.includes('כפתור השיתוף'),'iPhone: step-by-step "Add to Home Screen" instructions');
// installed (standalone): confirmation instead of instructions
const st=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); await st.addInitScript(()=>{ const m=window.matchMedia.bind(window); window.matchMedia=q=>q.includes('standalone')?{matches:true,media:q,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}:m(q); });
await st.goto(base+'/'+PAGE); await st.evaluate(()=>localStorage.clear()); await st.reload(); await st.fill('#pfName','x'); await st.click('.gopt:has(input[value=n])'); await st.click('[data-pact=save]'); await st.waitForTimeout(1200);
await st.evaluate(()=>openPanel('backup')); const sc=await st.textContent('#profBody'); ok(sc.includes('מותקן ופועל במסך מלא')&&!sc.includes('כפתור השיתוף'),'installed app: says so, no install instructions');
ok(errs.length===0,'no page errors '+errs);
console.log(f?'FAILURES '+f:'ALL PASS'); await b.close(); server.close(); process.exit(f?1:0);})();
