// What is not placed yet (an item being placed or moved, a preview of a wallpaper, floor, colour or upgrade) looks different from what is placed:
// the same marching dashes everywhere, a pulsing ghost, a dashed bar in the drawer; a confirmed thing settles with a bob / flash and sparkles.
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const ctx=await b.newContext({viewport:{width:1100,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=60;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();RM.sel=null;rmRedraw();renderDrawer();});
await p.waitForTimeout(400);
const anims=sel=>ev(s=>[...document.querySelectorAll(s)].map(e=>getComputedStyle(e).animationName),sel);
// 1. nothing pending: no dashes, no ghost, no bar
ok(await ev(()=>!document.querySelector('#rmSvg .pend, #rmSvg .rmghost, #rmSvg .rmtag')),'a room with nothing pending has no dashes, ghost or tag');
// 2. an item being placed
await ev(()=>{const c=ROOM_CATALOG.find(c=>c.p<=8&&fpOf(c,0)[0]<=3);RM.pl={k:c.id,i:-1,x:12,y:12,o:0};rmRedraw();renderDrawer();});
const a1=await anims('#rmSvg .pend');
ok(a1.length>=2&&a1.every(n=>n==='rmants'),'item being placed: its footprint has the marching dashes ('+a1.length+' lines)');
ok(await ev(()=>{const g=document.querySelector('#rmSvg .rmghost');return !!g&&getComputedStyle(g).animationName==='rmpulse'&&+getComputedStyle(g).opacity<.8;}),'the ghost is see-through and pulses');
ok(await ev(()=>{const e=document.querySelector('#rmSvg .rmtile.pend');const c=getComputedStyle(e);return c.vectorEffect==='non-scaling-stroke'&&c.strokeDasharray.replace(/px/g,'').replace(/,/g,'')==='9 7';}),'the dashes keep their size on screen at any zoom');
ok(await ev(()=>{const bar=document.querySelector('.rmsh-btns:has([data-cancel])');const c=getComputedStyle(bar,'::before');return !!bar&&c.content!=='none'&&c.animationName==='rmantsbar';}),'the buy / cancel bar in the drawer has the dashed line, moving the same way');
ok(await ev(()=>!document.querySelector('#rmSvg [data-hit^="thing:"] .pend')),'placed things are drawn without dashes');
// 3. the window and the bed being moved
await ev(()=>{RM.pl={fx:'window',w:space.fix.window.w,u:space.fix.window.u};rmRedraw();renderDrawer();});
ok((await anims('#rmSvg .pend')).length>=1&&(await anims('#rmSvg .pend')).every(n=>n==='rmants'),'window being moved: same dashes');
await ev(()=>{RM.pl={fx:'bed',x:space.fix.bed.x,y:space.fix.bed.y,o:space.fix.bed.o||0};rmRedraw();renderDrawer();});
ok((await anims('#rmSvg .pend')).length>=1&&(await anims('#rmSvg .pend')).every(n=>n==='rmants')&&await ev(()=>document.querySelectorAll('#rmSvg .rmghost').length>=1),'bed being moved: same dashes and a ghost');
await ev(()=>{RM.pl=null;rmRedraw();renderDrawer();});
// 4. wallpapers and floors
for(const k of ['wl','wr','fl']){
  await ev(k=>{RM.pv=null;onRoomTap('surf:'+k);document.querySelector('#rmDrawer [data-col]:not(.cur):not(:not(.new))').click();},k);
  const r=await ev(k=>{const g=document.querySelector('#rmSvg [data-hit="surf:'+k+'"]');return {pend:[...g.querySelectorAll('.pend')].map(e=>getComputedStyle(e).animationName),tag:!!g.querySelector('.rmtag'),others:['wl','wr','fl'].filter(o=>o!==k).some(o=>document.querySelector('#rmSvg [data-hit="surf:'+o+'"] .pend,#rmSvg [data-hit="surf:'+o+'"] .rmtag'))};},k);
  ok(r.pend.length===1&&r.pend[0]==='rmants'&&r.tag&&!r.others,k+': a previewed colour has the marching outline and the "preview" tag, only on that surface');
  await ev(()=>document.querySelector('[data-cancel]').click());
  ok(await ev(()=>!document.querySelector('#rmSvg .pend, #rmSvg .rmtag')),k+': cancel takes them away');
}
// 5. a previewed pattern too
await ev(()=>{onRoomTap('surf:wl');const q=ROOM_PATTERNS.find(q=>q.parts.includes('wl'));RM.pv={t:'col',k:'wl',idx:'p:'+q.id};rmRedraw();renderDrawer();});
ok(await ev(()=>!!document.querySelector('#rmSvg [data-hit="surf:wl"] .pend')),'a previewed pattern has them as well');
await ev(()=>{RM.pv=null;rmRedraw();renderDrawer();});
// 6. an upgrade of the bed
await ev(()=>{onRoomTap('item:bed');RM.pv={t:'lv',id:'bed',to:topLv('bed')+1};rmRedraw();renderDrawer();});
ok(await ev(()=>!!document.querySelector('#rmSvg [data-hit="item:bed"] .pend')),'a previewed bed upgrade has the outline around the bed');
await ev(()=>{RM.pv=null;rmRedraw();renderDrawer();});
// 7. confirming: a colour flashes with sparkles, an item settles
await ev(()=>{RM.pv=null;onRoomTap('surf:wl');document.querySelector('#rmDrawer [data-col]:not(.cur).new').click();});
await ev(()=>document.querySelector('[data-buy]').click());await p.waitForTimeout(80);
ok(await ev(()=>document.querySelector('#rmSvg [data-hit="surf:wl"]').classList.contains('rmflash')&&!!document.querySelector('.rmspark i')),'a bought colour flashes and sparkles');
await p.waitForTimeout(1100);
ok(await ev(()=>!document.querySelector('.rmspark')&&!document.querySelector('#rmSvg .rmflash')),'and it all goes away by itself');
await ev(()=>{const c=ROOM_CATALOG.find(c=>c.p<=8&&fpOf(c,0)[0]<=3);RM.pl={k:c.id,i:-1,x:14,y:14,o:0};rmRedraw();renderDrawer();document.querySelector('[data-place]').click();});await p.waitForTimeout(80);
ok(await ev(()=>{const i=space.things.length-1;const g=document.querySelector('#rmSvg [data-hit="thing:'+i+'"]');return space.things.length>=1&&g.classList.contains('rmsettle')&&!!document.querySelector('.rmspark i')&&!document.querySelector('#rmSvg .pend');}),'a placed item settles with sparkles, and has no dashes');
await p.waitForTimeout(1100);
// a free switch between owned colours flashes too
await ev(()=>{RM.pv=null;onRoomTap('surf:wr');const o=[...document.querySelectorAll('#rmDrawer [data-col]:not(.cur):not(.new)')][0];o.click();});await p.waitForTimeout(60);
ok(await ev(()=>document.querySelector('#rmSvg [data-hit="surf:wr"]').classList.contains('rmflash')),'switching to an owned colour flashes');
// 8. reduced motion: still dashed, not moving
await p.emulateMedia({reducedMotion:'reduce'});
await ev(()=>{RM.pl={k:ROOM_CATALOG[0].id,i:-1,x:2,y:2,o:0};rmRedraw();renderDrawer();});
ok((await anims('#rmSvg .pend')).every(n=>n==='none')&&await ev(()=>getComputedStyle(document.querySelector('#rmSvg .rmghost')).animationName==='none'),'with reduced motion nothing moves');
ok(errs.length===0,'no page errors'+(errs.length?': '+errs[0]:''));
await b.close();process.exit(f?1:0);})();
