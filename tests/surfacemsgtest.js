// things on furniture, phase 4: bed level preview, "moved to the inventory" notices, saving
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=100000;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();});
const set=async(things,lv)=>ev(([th,l])=>{space.things=th;space.lv.bed=l||1;space.top.bed=l||1;settleSurfaces();return 1;},[things,lv]);
await set([{k:'teddy',x:2,y:2,u:'ted1',on:{h:'bed',dx:2,dy:2}},{k:'teddy',x:0,y:3,u:'ted2',on:{h:'bed',dx:0,dy:3}}],1);
ok(await ev(()=>wouldStow(1)===0&&wouldStow(5)===1),'wouldStow counts what a level would send to the inventory (bed 1 -> 5: one of two)');
ok(await ev(()=>stowNote(0)===''&&/אחד/.test(stowNote(1))&&/^2 /.test(stowNote(2))),'notice text: none, one, many');
// preview
await ev(()=>{RM.sel={t:'item',id:'bed'};RM.pv={t:'lv',id:'bed',to:5};rmRedraw();renderDrawer();});
const shown=await ev(()=>document.querySelectorAll('#rmRoom [data-hit^="thing:"], .rmroom [data-hit^="thing:"]').length);
const hits=await ev(()=>[...document.querySelectorAll('[data-hit^="thing:"]')].map(e=>e.dataset.hit));
ok(hits.length===1,'previewing bed 5 hides the sitter that would not fit: '+hits.join());
ok(await ev(()=>/למלאי/.test(document.getElementById('rmDrawer').textContent)),'the preview drawer warns that something goes to the inventory');
await ev(()=>{RM.pv=null;rmRedraw();renderDrawer();});
ok(await ev(()=>document.querySelectorAll('[data-hit^="thing:"]').length)===2,'without the preview both sit on the bed');
// narrow screens: the drawer shrinks to buy / cancel while previewing
await ev(()=>{RM.sel={t:'item',id:'bed'};RM.pv={t:'lv',id:'bed',to:5};renderDrawer();});
const mini=()=>ev(()=>{const d=document.getElementById('rmDrawer');return {mini:d.classList.contains('mini'),buy:!!d.querySelector('[data-buy]'),cancel:!!d.querySelector('[data-cancel]'),max:!!d.querySelector('[data-max]'),min:!!d.querySelector('[data-min]'),thumbs:!!d.querySelector('.lvthumbs'),warn:!!d.querySelector('.lost'),h:d.getBoundingClientRect().height};});
let m=await mini();
ok(m.mini&&m.buy&&m.cancel&&m.max&&!m.thumbs&&m.warn,'phone: previewing shrinks the drawer to buy / cancel / the warning and a maximize button');
ok(m.h<130,'the minimized drawer is small: '+Math.round(m.h)+'px');
await ev(()=>document.querySelector('#rmDrawer [data-max]').click());m=await mini();
ok(!m.mini&&m.thumbs&&m.min&&m.buy,'maximize: the full drawer with a minimize button');
await ev(()=>document.querySelector('#rmDrawer [data-min]').click());m=await mini();
ok(m.mini,'minimize again');
await ev(()=>document.querySelector('#rmDrawer [data-cancel]').click());m=await mini();
ok(!m.mini&&!m.max,'cancel: back to the normal drawer');
await ev(()=>{RM.pl={k:'teddy',i:-1,x:5,y:5};RM.sel=null;rmRedraw();renderDrawer();});m=await mini();
ok(m.mini&&await ev(()=>!!document.querySelector('#rmDrawer [data-place]')),'placing a new item is minimized too, with its place / cancel buttons');
await ev(()=>{RM.pl=null;RM.pv=null;RM.sel=null;renderDrawer();});
// a wide screen keeps the full drawer
{const q=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();await q.goto(T.URL);await q.evaluate(()=>localStorage.clear());await q.reload();
 await q.fill('#pfName','X');await q.click('.gopt:has(input[value=f])');await q.click('[data-pact=save]');await q.waitForTimeout(300);
 await q.evaluate(()=>{space.earned=100000;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();RM.sel={t:'item',id:'bed'};RM.pv={t:'lv',id:'bed',to:5};renderDrawer();});
 ok(await q.evaluate(()=>{const d=document.getElementById('rmDrawer');return !d.classList.contains('mini')&&!!d.querySelector('.lvthumbs')&&!d.querySelector('[data-max]');}),'wide screen: the drawer stays whole while previewing');}
// buy the upgrade
await ev(()=>{RM.sel={t:'item',id:'bed'};RM.pv={t:'lv',id:'bed',to:5};renderDrawer();});
await ev(()=>{const b=document.querySelector('#rmDrawer [data-buy]');b&&b.click();});
await p.waitForTimeout(200);
ok(await ev(()=>space.lv.bed===5&&space.things[1].x===-1&&space.things[0].on),'bought: the other thing is in the inventory, the first stays');
ok(await ev(()=>!!document.querySelector('#rmDrawer .rmnote')&&/אחד/.test(document.querySelector('#rmDrawer .rmnote').textContent)),'a notice says one thing went to the inventory');
await ev(()=>renderDrawer());
ok(await ev(()=>!document.querySelector('#rmDrawer .rmnote')),'the notice shows once');
// save and reload
await ev(()=>saveState());await p.reload();await ev(()=>openSpace());
ok(await ev(()=>{const t=space.things.find(x=>x.u==='ted1');return t&&t.on&&t.on.h==='bed'&&t.x===2&&t.y===2;}),'saved and reloaded: the thing is still on the bed');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
