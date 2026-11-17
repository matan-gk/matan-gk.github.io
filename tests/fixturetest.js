// the bed and the window can be moved, put away in the inventory, upgraded there and placed again
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:1100,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=2000;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();});
const set=things=>ev(th=>{space.things=th;space.spent=0;space.fix={bed:{x:0,y:0},window:{w:'r',u:WIN_U}};space.lv.bed=1;space.top.bed=1;settleSurfaces();RM.sel=null;RM.pl=null;RM.list=null;rmRedraw();renderDrawer();},things);
const UX=25,UY=12.5;
const tap=async(sx,sy)=>{const q=await ev(([sx,sy])=>{const g=document.getElementById('rmR'),m=g.getScreenCTM();return [m.a*sx+m.c*sy+m.e,m.b*sx+m.d*sy+m.f];},[sx,sy]);await p.mouse.click(q[0],q[1]);};
const unitTap=(ux,uy)=>tap(500+(ux+.5-(uy+.5))*UX,400+(ux+.5+uy+.5)*UY);
const click=sel=>ev(s=>document.querySelector(s).click(),sel);
const fx=()=>ev(()=>JSON.stringify(space.fix));
// defaults
ok(await fx()==='{"bed":{"x":0,"y":0},"window":{"w":"r","u":300}}','the default room has the bed in its corner and the window on the right wall');
ok(await ev(()=>{const s=spaceClean({earned:5,spent:0,trued:true,things:[{k:'pl00',x:1,y:1}]},[],0);return JSON.stringify(s.fix);})==='{"bed":{"x":0,"y":0},"window":{"w":"r","u":300}}','a save without fixtures loads with both in their default places');
ok(await ev(()=>roomBlocked(0,0)&&roomBlocked(5,7)&&!roomBlocked(6,0)),'the default bed blocks its corner');
// a thing on the bed, one on the floor
await set([{k:'lego',x:0,y:0,u:'leg1',on:{h:'bed',dx:2,dy:3}},{k:'chair',x:12,y:12,u:'cha1'}]);
await ev(()=>{RM.sel={t:'item',id:'bed'};rmRedraw();renderDrawer();});
ok(await ev(()=>!!document.querySelector('[data-fxmove="bed"]')&&!!document.querySelector('[data-fxaway="bed"]')),'the bed drawer has move and delete');
await click('[data-fxmove="bed"]');
ok(await ev(()=>RM.pl&&RM.pl.fx==='bed'&&RM.pl.x===0&&RM.pl.y===0),'moving starts from where the bed is');
// tap far spot: the tapped unit is the middle of the bed (bed 6x8 units)
await unitTap(10,3);
const pos=await ev(()=>[RM.pl.x,RM.pl.y]);
ok(pos[0]===7&&pos[1]===0,'a tap puts the middle of the bed on the tapped unit '+pos);
// onto the chair: refused
await ev(()=>{RM.pl.x=0;RM.pl.y=0;});
await ev(()=>{RM.pl.x=10;RM.pl.y=10;});
ok(await ev(()=>!bedFits({x:10,y:10},1)),'the bed cannot stand on a chair');
ok(await ev(()=>bedFits({x:8,y:4},1)&&!bedFits({x:15,y:0},1)&&!bedFits({x:0,y:13},1)),'it stays inside the room');
await ev(()=>{RM.pl.x=8;RM.pl.y=4;rmRedraw();renderDrawer();});
await click('[data-nudge="1,0"]');
ok(await ev(()=>RM.pl.x===9&&RM.pl.y===4),'the arrows move the bed one unit');
await click('[data-place]');
ok(await ev(()=>space.fix.bed.x===9&&space.fix.bed.y===4&&RM.pl===null),'placed');
ok(await ev(()=>!roomBlocked(0,0)&&roomBlocked(9,4)&&roomBlocked(14,11)&&!roomBlocked(15,4)),'the bed now blocks its new place and frees the corner');
ok(await ev(()=>{const t=space.things[0];return t.on&&t.on.h==='bed'&&t.x===9+2&&t.y===4+3;}),'what lay on the bed came along');
ok(await ev(()=>footFree(catOf('chair'),0,0,-1)&&!footFree(catOf('chair'),9,4,-1)),'the corner is free for other things, the new place is not');
ok(await ev(()=>{const s=document.getElementById('rmR').innerHTML;return s.indexOf('item:bed')>0;}),'the bed is drawn');
// draw order: a thing in front of the bed (greater depth) is after it, a thing behind it before
await set([{k:'chair',x:2,y:2,u:'chb1'},{k:'chair',x:16,y:16,u:'chf1'}]);
await ev(()=>{space.fix.bed={x:8,y:8};rmRedraw();});
ok(await ev(()=>{const h=[...document.querySelectorAll('#rmR [data-hit]')].map(e=>e.dataset.hit).filter(h=>/^(item:bed|thing)/.test(h));return h.join()==='thing:0,item:bed,thing:1';}),'the bed is sorted among the things: behind ones first, in front ones after');
// delete the bed: the things on it go to the inventory
await set([{k:'lego',x:0,y:0,u:'leg1',on:{h:'bed',dx:2,dy:3}},{k:'markers',x:0,y:0,u:'mar1',on:{h:'bed',dx:0,dy:2}}]);
await ev(()=>{RM.sel={t:'item',id:'bed'};rmRedraw();renderDrawer();});
await click('[data-fxaway="bed"]');
ok(await ev(()=>space.fix.bed===null&&space.things.every(t=>t.x===-1&&!t.on)&&!roomBlocked(0,0)),'deleting the bed sends its things to the inventory and frees the corner');
ok(await ev(()=>!!document.querySelector('.rmnote')),'a notice says what moved');
ok(await ev(()=>!document.querySelector('#rmR [data-hit="item:bed"]')),'it is no longer drawn');
// the inventory has it, with its level
await ev(()=>{RM.list='cat';RM.filter='all';renderDrawer();});
ok(await ev(()=>!!document.querySelector('[data-fxopen="bed"]')),'the bed is in the inventory list');
await click('[data-fxopen="bed"]');
ok(await ev(()=>RM.sel&&RM.sel.id==='bed'&&!!document.querySelector('[data-fxmove="bed"]')&&!document.querySelector('[data-fxaway="bed"]')&&!document.querySelector('.partsrow,[data-part]')),'its drawer offers placing, not deleting');
// upgrade while away
const bal0=await ev(()=>tokenBalance());
await click('[data-prev="bed"]');
await click('[data-buy]');
ok(await ev(()=>space.lv.bed===2&&space.top.bed===2&&space.fix.bed===null),'upgraded while in the inventory');
ok(await ev(()=>tokenBalance())===bal0-await ev(()=>ROOM_ITEMS.bed.up[1]),'it cost the usual price');
await click('[data-fxmove="bed"]');
ok(await ev(()=>RM.pl.fx==='bed'&&bedFits({x:RM.pl.x,y:RM.pl.y},2)),'placing from the inventory starts at a free spot');
// things on the floor take the first spot away
await ev(()=>{RM.pl=null;space.things.push({k:'chair',x:0,y:0,u:'chx1'});space.things[2].x=0;rmRedraw();});
await ev(()=>{RM.list='cat';renderDrawer();});await click('[data-fxopen="bed"]');await click('[data-fxmove="bed"]');
ok(await ev(()=>RM.pl.x>0||RM.pl.y>0),'the first free spot skips the chair');
await click('[data-place]');
ok(await ev(()=>!!space.fix.bed&&space.lv.bed===2),'placed again at level 2');
// a bigger level pushes the bed back into the room
await ev(()=>{space.fix.bed={x:ROOM_CELLS-bedFp(2)[0],y:ROOM_CELLS-bedFp(2)[1]};space.top.bed=3;});
await ev(()=>{space.lv.bed=3;stowBlocked();});
ok(await ev(()=>{const f=bedFp(3),p=space.fix.bed;return p.x+f[0]<=ROOM_CELLS&&p.y+f[1]<=ROOM_CELLS;}),'a bigger level at the room\'s edge is pushed back inside');
// the window
await set([]);
await ev(()=>{RM.sel={t:'item',id:'window'};rmRedraw();renderDrawer();});
await click('[data-fxmove="window"]');
ok(await ev(()=>RM.pl.fx==='window'&&RM.pl.w==='r'&&RM.pl.u===300),'moving the window starts where it is');
await tap(250,150);   // left wall
ok(await ev(()=>RM.pl.w==='l'&&Math.abs(RM.pl.u-250)<=WIN_STEP),'a tap on the left wall moves it there '+await ev(()=>JSON.stringify(RM.pl)));
await click('[data-wnudge="1"]');
ok(await ev(()=>RM.pl.u===(Math.round(250/WIN_STEP)*WIN_STEP-WIN_STEP)),'the right arrow moves it right on the screen (less along the left wall)');
await tap(900,300);
ok(await ev(()=>RM.pl.w==='r'&&RM.pl.u>350),'back to the right wall');
await ev(()=>{RM.pl.w='l';RM.pl.u=1000;});
await ev(()=>{const q=winAtFor(1,{w:'l',u:1000});RM.pl.u=q.u;});
ok(await ev(()=>RM.pl.u<=500-(ROOM_ART.window[0].w-ROOM_ART.window[0].ax)),'it stays on the wall');
await ev(()=>{RM.pl.w='l';RM.pl.u=200;rmRedraw();renderDrawer();});
await click('[data-place]');
ok(await ev(()=>space.fix.window.w==='l'&&space.fix.window.u===200),'placed on the left wall');
ok(await ev(()=>/matrix\(-1 \.5 0 1 500 400\)/.test(document.getElementById('rmR').innerHTML)),'drawn mirrored on the left wall');
// saved and loaded
const rt=await ev(()=>JSON.stringify(spaceClean(JSON.parse(JSON.stringify(space)),[],0).fix));
ok(rt===await fx(),'the places survive saving and loading '+rt);
ok(await ev(()=>JSON.stringify(spaceClean({...JSON.parse(JSON.stringify(space)),fix:{bed:null,window:null}},[],0).fix))==='{"bed":null,"window":null}','so does being in the inventory');
ok(await ev(()=>JSON.stringify(spaceClean({earned:1,sub:1,fix:{bed:{x:2,y:3},window:{w:'l',u:200}}},[],0).fix))==='{"bed":{"x":4,"y":6},"window":{"w":"l","u":200}}','a save in whole cells gets the bed position doubled');
ok(await ev(()=>JSON.stringify(spaceClean({earned:1,fix:{bed:{x:'a'},window:{w:'q',u:1}}},[],0).fix))==='{"bed":{"x":0,"y":0},"window":{"w":"r","u":300}}','garbage falls back to the defaults');
// a thing saved under where the bed now stands goes to the inventory
ok(await ev(()=>{const s=spaceClean({earned:1,sub:2,fix:{bed:{x:10,y:10},window:null},things:[{k:'chair',x:11,y:11,u:'chr1'},{k:'chair',x:0,y:0,u:'chr2'}]},[],0);return s.things.map(t=>t.x).join();})==='-1,0','a thing under the bed\'s saved place goes to the inventory, the old corner is free');
// delete the window, upgrade it away, place it
await ev(()=>{RM.sel={t:'item',id:'window'};rmRedraw();renderDrawer();});
await click('[data-fxaway="window"]');
ok(await ev(()=>space.fix.window===null&&!document.querySelector('#rmR [data-hit="item:window"]')),'deleted window is gone from the wall');
await ev(()=>{RM.list='cat';renderDrawer();});await click('[data-fxopen="window"]');
await click('[data-prev="window"]');await click('[data-buy]');
ok(await ev(()=>space.lv.window===space.top.window&&space.lv.window>=2&&space.fix.window===null),'the window upgrades in the inventory');
await click('[data-fxmove="window"]');await click('[data-place]');
ok(await ev(()=>!!space.fix.window&&!!document.querySelector('#rmR [data-hit="item:window"]')),'and goes back on a wall');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
