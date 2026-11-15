// pictures on the walls: the clock and the treasure map are flat on a wall, never on the floor; saved as t.wl; overlaps fall back to the inventory
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:1100,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=1000;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();});
ok(await ev(()=>CLOUD_DOC_V>=4),'sync format 4 or later (things carry wl)');
ok(await ev(()=>['wallclock','treasuremap'].every(id=>{const c=catOf(id);return c.wall&&c.g==='wall'&&c.r[2]>0&&ROOM_GROUPS.wall;})),'both are wall items in their own group');
const clean=async(things,fix)=>ev(([th,fx])=>{const sp=spaceSnap();sp.things=th;if(fx)sp.fix=fx;return spaceClean(sp).things;},[things,fix]);
let r=await clean([{k:'wallclock',x:-1,y:-1,u:'wc01',wl:{s:'l',a:250,h:300}},{k:'treasuremap',x:-1,y:-1,u:'tm01',wl:{s:'l',a:250,h:300}},{k:'chair',x:-1,y:-1,u:'ch01',wl:{s:'l',a:200,h:300}},{k:'treasuremap',x:3,y:3,u:'tm02',wl:{s:'l',a:9999,h:-5}}]);
ok(r[0].wl&&r[0].wl.s==='l'&&r[0].x===-1,'a valid picture keeps its wall place and is not on the floor');
ok(!r[1].wl,'a second picture on the same spot loses its place (goes to the inventory)');
ok(!r[2].wl,'only wall items have a wall place');
ok(r[3].wl&&r[3].wl.s==='l'&&r[3].wl.a<=500&&r[3].wl.h>0&&r[3].x===-1,'a wild position is pulled onto the wall; a wall item is never on the floor');
const w=await ev(()=>space.fix.window);
r=await clean([{k:'wallclock',x:-1,y:-1,u:'wc01',wl:{s:w.w,a:w.u,h:295}}]);
ok(!r[0].wl,'a picture on the window is refused');
// placing through the drawer
await ev(()=>{space.things=[];RM.list='cat';RM.filter='wall';renderDrawer();});
ok(await p.locator('.catcard').count()===2,'the wall chip lists the two pictures');
await p.click('.catcard[data-pick=wallclock]');
ok(await ev(()=>!!RM.pl&&!!RM.pl.wl&&RM.pl.i<0),'buying starts a wall placement');
const wl0=await ev(()=>({...RM.pl.wl}));
await p.click('[data-wmv]:nth-child(2)');   // up
ok(await ev(w0=>RM.pl.wl.h===w0.h+WALL_STEP,wl0),'the arrows move it one step');
// tap on the left wall
const tap=await ev(()=>{const svg=document.getElementById('rmSvg'),r=svg.getBoundingClientRect(),s=Math.max(RM.W/r.width,RM.H/r.height);const X=RM.tx+RM.k*150,Y=RM.ty+RM.k*(RM_DY+400+75-250);return [(X-RM.W/2)/s+r.left+r.width/2,(Y-RM.H/2)/s+r.top+r.height/2];});
await p.mouse.click(tap[0],tap[1]);
ok(await ev(()=>RM.pl.wl.s==='l'&&Math.abs(RM.pl.wl.a-350)<=40),'tapping the left wall puts it there');
const bal0=await ev(()=>tokenBalance());
await p.click('[data-place]');
ok(await ev(b0=>space.things.length===1&&space.things[0].wl&&space.things[0].x===-1&&tokenBalance()===b0-3,bal0),'placed: paid 3, saved on the wall');
ok(await ev(()=>stowedCount()===0&&document.querySelectorAll('#rmSvg [data-hit="thing:0"]').length===1),'a wall picture is not counted as stock and is drawn once');
await p.screenshot({path:'/tmp/wall1.png'});
// move, away
await ev(()=>{RM.sel={t:'thing',i:0};renderDrawer();});
await p.click('[data-move="0"]');
ok(await ev(()=>RM.pl&&RM.pl.i===0&&RM.pl.wl.s==='l'),'move starts from its place');
await p.click('[data-cancel]');
await ev(()=>{RM.sel={t:'thing',i:0};renderDrawer();});
ok(await p.locator('[data-turn]').count()===0,'no turn button for a picture');
await p.click('[data-away="0"]');
ok(await ev(()=>!space.things[0].wl&&space.things[0].x===-1&&stowedCount()===1),'put away: back in the inventory');
await ev(()=>{RM.list='cat';RM.filter='wall';renderDrawer();});
await p.click('.catcard[data-choose=wallclock]');await p.click('[data-unstow]');
ok(await ev(()=>RM.pl&&RM.pl.wl&&RM.pl.i===0),'the inventory copy is placed on a wall again, for free');
await p.click('[data-place]');
ok(await ev(()=>space.things[0].wl&&stowedCount()===0),'placed again');
// the window moved over it: it goes back to the inventory
await ev(()=>{const t=space.things[0];t.wl={s:'r',a:300,h:315};space.fix.window={w:'l',u:300};});
await ev(()=>{space.fix.window=winAtFor(space.lv.window,{w:'r',u:300});wallSettle();});
ok(await ev(()=>!space.things[0].wl),'the window put over a picture sends the picture to the inventory');
// persists
await ev(()=>{space.things[0].wl={s:'r',a:100,h:250};space.fix.window=winAtFor(space.lv.window,{w:'l',u:300});saveState();});
await p.reload();
ok(await ev(()=>{const t=space.things.find(q=>q.k==='wallclock');return t&&t.wl&&t.wl.s==='r'&&t.wl.a===100;}),'survives a reload');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
