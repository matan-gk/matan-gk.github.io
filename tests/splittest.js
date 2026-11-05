// The split build (small page + assets folder) must behave like the single file: nothing embedded, every link resolves, every picture loads, icons show.
const T=require('./lib.js');const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),http=require('http'),cp=require('child_process');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++;};
(async()=>{
const out=path.join(__dirname,'..');   // the repository itself is the site: no build step any more
const game=process.env.GAME||path.join(out,'math-quest.html');
const listed=JSON.parse(fs.readFileSync(path.join(out,'assets.json'),'utf8'));const onDisk=fs.readdirSync(path.join(out,'assets')).filter(f=>/^[0-9a-f]{12}\./.test(f)).sort();
const res={page_bytes:fs.statSync(game).size,assets:onDisk.length};
ok(res.page_bytes<900000&&res.assets>100&&res.assets<2500,'the page is small ('+Math.round(res.page_bytes/1024)+' KB) with '+res.assets+' picture and font files');
ok(JSON.stringify(listed)===JSON.stringify(onDisk),'assets.json lists exactly the files in assets/ (run tools/externalize.py after changing art)');
const page=fs.readFileSync(game,'utf8');
ok(onDisk.every(f=>page.includes('assets/'+f)),'every file in assets/ is used by the page (no stale files)');
ok(!/data:(image|font)\/[a-z0-9+.-]+;base64,/.test(page),'no embedded picture or font left in the page (run tools/externalize.py)');
const refs=[...new Set([...page.matchAll(/assets\/[0-9a-f]{12}\.[a-z0-9]+/g)].map(m=>m[0]))];
ok(refs.length>0&&refs.every(r=>fs.existsSync(path.join(out,r))),'every link in the page points to an existing file ('+refs.length+')');
ok(['manifest.webmanifest','apple-touch-icon.png','assets.json'].every(f=>fs.existsSync(path.join(out,f))),'manifest, home-screen icon and asset list are included');
const srv=http.createServer((q,r)=>{const f=path.join(out,decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/,'/math-quest.html'));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}const t={html:'text/html',png:'image/png',webp:'image/webp',woff2:'font/woff2',json:'application/json',webmanifest:'application/manifest+json',js:'text/javascript'}[f.split('.').pop()]||'application/octet-stream';r.writeHead(200,{'content-type':t});r.end(d);});}).listen(0);
const port=srv.address().port;
const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[],bad=[];p.on('pageerror',e=>errs.push(e.message));p.on('response',r=>{if(r.status()>=400)bad.push(r.url())});
await p.goto('http://localhost:'+port+'/math-quest.html');await p.evaluate(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(600);
const home=await p.evaluate(()=>({ic:[...document.querySelectorAll('#levels .ic')].map(e=>getComputedStyle(e).backgroundImage.includes('url(')),imgs:[...document.querySelectorAll('#levels img.lvimg')].map(i=>i.complete&&i.naturalWidth>0),bd:getComputedStyle(document.getElementById('backdrop')).backgroundImage}));
ok(home.ic.length===5&&home.ic.every(Boolean),'the five emoji-based game icons have their pictures');
ok(home.imgs.length===3&&home.imgs.every(Boolean),'the three hand-made game icons load');
ok(home.bd.includes('assets/'),'selection-screen backdrop is a linked file');
for(const id of [1,3,6]){await p.evaluate(i=>openGame(i),id);await p.waitForTimeout(300);}
const play=await p.evaluate(async()=>{const u=getComputedStyle(document.getElementById('backdrop')).backgroundImage.match(/url\("?([^")]+)/);const im=new Image();im.src=u[1];await im.decode().catch(()=>{});return {w:im.naturalWidth,mood:await (async()=>{const m=document.getElementById('charImg');return m.complete&&m.naturalWidth>0})()}});
ok(play.w>200,'a game backdrop loads from its file');
ok(play.mood,'the mascot picture loads');
ok(bad.length===0,'no missing files while playing ('+bad.join(',')+')');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();srv.close();process.exit(fails?1:0);})();
