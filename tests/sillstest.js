// the window sill is a surface for small things (host 'win'); the window and twelve art pieces are solid wall pictures
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=1000;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();});
const set=async(things,fix,lv)=>ev(([th,fx,l])=>{space.things=th;if(fx)space.fix.window=fx;space.lv.window=l||1;settleSurfaces();return 1;},[things,fix,lv]);
const sit=(k,u,dx,dy)=>({k,x:-1,y:-1,u,on:{h:'win',dx,dy}});
// the strip
const A=await ev(()=>({sill:ROOM_ART.window[0].sill,z:WIN_SILL+SILL_TOP}));
let tp=await ev(()=>{space.fix.window=winAtFor(1,{w:'r',u:300});space.lv.window=1;return topOf('win');});
ok(tp&&tp.y===0&&tp.x===(300-100)/25&&tp.c[2]===A.sill&&tp.c[3]===2&&tp.z===A.z,'right wall: a strip along x at the wall, the sill long, 2 deep, at the sill height: '+JSON.stringify(tp));
tp=await ev(()=>{space.fix.window=winAtFor(1,{w:'l',u:300});return topOf('win');});
ok(tp&&tp.x===0&&tp.y===(300-100)/25&&tp.c[2]===2,'left wall: the same strip along y');
ok(await ev(()=>{space.fix.window=null;return topOf('win')===null;}),'no strip while the window is put away');
// a thing on the sill
await set([sit('pl00','pl01',0,0),sit('pl00','pl02',2,0),sit('pl00','pl03',0,0),sit('chair','ch01',4,0),sit('teddy','te01',0,1)],{w:'r',u:300});
let r=await ev(()=>space.things.map(t=>[t.x,t.y,!!t.on]));
ok(r[0][2]&&r[0][0]===8&&r[0][1]===0,'a plant stands on the sill at its place in the room: '+JSON.stringify(r[0]));
ok(r[1][2]&&r[1][0]===10,'a second plant next to it');
ok(!r[2][2]&&r[2][0]===-1,'a third on the same spot goes to the inventory');
ok(!r[3][2],'a chair is too big for a sill');
ok(!r[4][2],'there is only one row on the sill (2 units deep)');
// the window moves: the things come along; to the other wall the offsets swap
await ev(()=>{space.fix.window={w:'r',u:350};settleSurfaces();});
r=await ev(()=>space.things.slice(0,2).map(t=>[t.x,t.y,!!t.on]));
ok(r[0][2]&&r[0][0]===10&&r[1][0]===12,'they follow the window along the wall');
await ev(()=>{const was=space.fix.window;space.fix.window=winAtFor(1,{w:'l',u:300});space.things.forEach(k=>{if(k.on&&k.on.h==='win'){const d=k.on.dx;k.on.dx=k.on.dy;k.on.dy=d;}});settleSurfaces();});
r=await ev(()=>space.things.slice(0,2).map(t=>[t.x,t.y,!!t.on]));
ok(r[0][2]&&r[0][0]===0&&r[0][1]===8&&r[1][1]===10,'on the left wall they stand along y: '+JSON.stringify(r));
// put away: everything goes to the inventory
await ev(()=>{space.fix.window=null;settleSurfaces();});
ok(await ev(()=>space.things.slice(0,2).every(t=>!t.on&&t.x===-1)),'putting the window away sends the things on the sill to the inventory');
// a level that is shorter than the old strip releases what no longer fits
await ev(()=>{space.fix.window=winAtFor(5,{w:'r',u:300});space.lv.window=5;});
await set([sit('pl00','pl01',8,0)],{w:'r',u:300},5);
ok(await ev(()=>!!space.things[0].on),'level 5 has a longer sill (10 units): the 9th unit is on it');
await ev(()=>{space.lv.window=1;stowBlocked();});
ok(await ev(()=>!space.things[0].on&&space.things[0].x===-1),'back to level 1 (8 units): it no longer fits and goes to the inventory');
// save cleaning keeps a good link and drops a bad one
const cl=await ev(()=>{const sp=spaceSnap();sp.lv.window=1;sp.fix.window={w:'r',u:300};sp.things=[{k:'pl00',x:8,y:0,u:'pa01',on:{h:'win',dx:0,dy:0}},{k:'pl00',x:-1,y:-1,u:'pa02',on:{h:'win',dx:30,dy:0}}];return spaceClean(sp).things.map(t=>[t.x,t.y,!!t.on]);});
ok(cl[0][2]&&cl[0][0]===8,'a saved link to the sill loads');
ok(!cl[1][2]&&cl[1][0]===-1,'a link outside the sill is dropped');
// drawing: solid, mirrored on the left, sitters after the window
await set([sit('pl00','pl01',0,0)],{w:'r',u:300},1);
await ev(()=>{rmRedraw();});
let dom=await ev(()=>{const h=[...document.querySelectorAll('#rmR [data-hit]')].map(g=>g.getAttribute('data-hit'));const w=document.querySelector('#rmR [data-hit="item:window"] > g');return {h,tr:w&&w.getAttribute('transform')};});
ok(dom.h.indexOf('thing:0')===dom.h.indexOf('item:window')+1,'the plant is drawn right after the window');
ok(dom.tr&&!/matrix/.test(dom.tr),'the window is not sheared: '+dom.tr);
// lit spots while placing
await ev(()=>{space.things=[];RM.pl={k:'pl00',i:-1,x:8,y:2};rmRedraw();renderDrawer();});
ok(await ev(()=>document.querySelectorAll('#rmR .rmtop').length)>=16*1,'the sill lights up when a small thing is being placed');
// the art
const ids=['art_rainbow','art_unicorn','art_canvas','art_scroll123','art_bunting','art_photos','art_oval','art_banner','art_porthole','art_heart','art_castle','art_rainbowarch'];
ok(await ev(ids=>ids.every(id=>{const c=catOf(id);return c&&c.wall&&c.solid&&c.g==='wall'&&c.p===3&&c.im&&c.r[2]%25===0&&c.r[3]%25===0&&/^assets\//.test(c.src);}),ids),'twelve art pieces: solid wall items, price 3, sizes in wall steps');
ok(await ev(()=>[1,2,3,4,5].every(l=>{const a=ROOM_ART.window[l-1];return a.im&&a.sill*25===a.w&&a.sill%2===0&&a.ax*2===a.w;})),'every window level: a wall rectangle, a picture and an even sill');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
