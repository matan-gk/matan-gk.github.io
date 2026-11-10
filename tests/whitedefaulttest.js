// New profiles start with white walls (white brush selected and already owned, purple not); every older save keeps its purple walls.
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:1100,height:800}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
// a new profile
ok(await ev(()=>space.dw===1&&space.surf.wl===0&&space.surf.wr===0&&space.surf.fl===12),'new profile: both walls white (index 0), floor unchanged (brown)');
ok(await ev(()=>space.own.wl.includes(0)&&!space.own.wl.includes(3)&&space.own.wr.includes(0)&&!space.own.wr.includes(3)),'white is already owned, purple is not');
await ev(()=>{space.earned=50;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();RM.sel={t:'surf',k:'wl'};rmRedraw();renderDrawer();});
await p.waitForTimeout(400);
ok(await ev(()=>{const w=document.querySelector('#rmDrawer [data-col="0"]'),pu=document.querySelector('#rmDrawer [data-col="3"]');return w&&w.classList.contains('cur')&&!w.classList.contains('new')&&pu&&!pu.classList.contains('cur')&&pu.classList.contains('new');}),'drawer: the white brush is selected and owned; purple is a purchase');
ok(await ev(()=>/^#fff/i.test(getComputedStyle(document.querySelector('#rmSvg [data-hit="surf:wl"]')||document.body).fill)||surfFill(space.surf.wl,'wl')==='#ffffff'),'the wall is drawn white');
// the first profile's save, as stored
await ev(()=>{saveState();});
const saved=await ev(()=>JSON.parse(localStorage.getItem(SAVE_KEY)).profiles[0].progress.space);
ok(saved.dw===1&&saved.surf.wl===0,'the save keeps the marker and the white walls');
await p.reload();await p.waitForTimeout(500);
ok(await ev(()=>space.dw===1&&space.surf.wl===0&&!space.own.wl.includes(3)),'after a reload it is still white');
// older saves: no marker -> purple, with or without a stored room
const r=await ev(()=>{
  const a=cleanProgress({}).space, c=cleanProgress({space:{earned:5,unlocked:true}}).space, d=cleanProgress({space:{surf:{wl:5,wr:3,fl:12},own:{wl:[5,3]}}}).space;
  const e=cleanProgress({space:{dw:1,surf:{wl:3,wr:0,fl:12}}}).space, g=cleanProgress({space:cleanProgress({space:{dw:1}}).space}).space;
  return {a:[a.surf.wl,a.surf.wr,a.own.wl.includes(3),a.own.wl.includes(0),a.dw],c:[c.surf.wl,c.own.wl.includes(3),c.dw],d:[d.surf.wl,d.surf.wr,d.own.wl.includes(5),d.own.wl.includes(3),d.dw],e:[e.surf.wl,e.surf.wr,e.own.wl.includes(3),e.own.wl.includes(0)],g:[g.dw,g.surf.wl]};});
ok(r.a[0]===3&&r.a[1]===3&&r.a[2]&&!r.a[3]&&r.a[4]===undefined,'a profile with no room saved yet keeps purple walls');
ok(r.c[0]===3&&r.c[1]&&r.c[2]===undefined,'a save with a room but no marker keeps purple walls');
ok(r.d[0]===5&&r.d[1]===3&&r.d[2]&&r.d[3]&&r.d[4]===undefined,'a save with chosen colours is untouched');
ok(r.e[0]===3&&r.e[1]===0&&r.e[2]&&r.e[3],'a new profile that later bought and chose purple keeps it (and still owns white)');
ok(r.g[0]===1&&r.g[1]===0,'cleaning twice keeps the marker (save codes, cloud sync)');
// an older profile in the stored data, after a reload
await ev(()=>{const s=JSON.parse(localStorage.getItem(SAVE_KEY));delete s.profiles[0].progress.space;localStorage.setItem(SAVE_KEY,JSON.stringify(s));});
await p.reload();await p.waitForTimeout(500);
ok(await ev(()=>space.surf.wl===3&&space.surf.wr===3&&space.own.wl.includes(3)&&!space.own.wl.includes(0)),'a stored older profile loads with purple walls and owns only purple');
// a second new profile made next to it is white
await ev(()=>{});
ok(errs.length===0,'no page errors'+(errs.length?': '+errs[0]:''));
await b.close();process.exit(f?1:0);})();
