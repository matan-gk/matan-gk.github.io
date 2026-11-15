// Fourth batch of room items (sheets c2-c4): lights, music, learning, pets, plushies; backs; new colour parts have Hebrew names
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:1100,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
const IDS=['cuplamp','starlamp','lavalamp','disco','lightpole','crystal','musicbox','xylo','drum','abacus','register','microscope','magboard','marblerun','robot','fishbowl','fishtank','hamster','elephant','sleepcat','penguin','sloth','pl21','pl22','rug_star'];
ok(await ev(I=>I.every(id=>{const c=catOf(id);return c&&c.n&&c.p>=2&&c.p<=8&&/^assets\//.test(c.src)&&c.r[2]>0&&c.r[3]>0;}),IDS),'25 new items exist with name, price, picture and rectangle');
ok(await ev(()=>catOf('rug_star').flat===1&&catOf('rug_star').g==='rugs'||catOf('rug_star').flat),'the star rug is flat');
ok(await ev(()=>['musicbox','register','microscope','magboard','marblerun','robot','fishtank','elephant','sleepcat','penguin','sloth'].every(id=>catOf(id).back&&catOf(id).back.src)),'11 items have a back picture');
ok(await ev(()=>ROOM_CATALOG.filter(c=>c.pk).every(c=>PART_NAMES[c.pk])),'every colourable part has a Hebrew name');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
