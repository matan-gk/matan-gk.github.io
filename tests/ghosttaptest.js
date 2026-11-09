// small screens: the drawer that appears when a room item is tapped must not receive that same touch as a second tap (it deleted the bed / painted the floor)
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const ctx=await b.newContext({viewport:{width:390,height:780},hasTouch:true,isMobile:true,deviceScaleFactor:2});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=500;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();RM.sel=null;rmRedraw();renderDrawer();});
await p.waitForTimeout(500);
const screen=(sx,sy)=>ev(([sx,sy])=>{const g=document.getElementById('rmR'),m=g.getScreenCTM();return [m.a*sx+m.c*sy+m.e,m.b*sx+m.d*sy+m.f];},[sx,sy]);
// find where the bed is on screen: its group's box centre
const bedPt=await ev(()=>{const r=document.querySelector('[data-hit="item:bed"]').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2];});
// the ghost click: right after the touch on the room, a click arrives on the drawer's button under the finger (a real phone does this on its own; here it is sent by hand)
await p.touchscreen.tap(bedPt[0],bedPt[1]);
await ev(()=>{const b=document.querySelector('[data-fxaway="bed"]');if(b)b.click();});
await p.waitForTimeout(100);
ok(await ev(()=>!!space.fix.bed&&RM.sel&&RM.sel.id==='bed'),'a click on the drawer right after a touch on the bed is ignored: the bed is selected, not deleted');
await p.waitForTimeout(800);
await ev(()=>{RM.sel={t:'surf',k:'fl'};renderDrawer();});
await p.touchscreen.tap(bedPt[0],bedPt[1]);
await ev(()=>{const b=document.querySelector('[data-fxaway="bed"]');if(b)b.click();});
await p.waitForTimeout(100);
await p.waitForTimeout(800);
ok(await ev(()=>!!space.fix.bed),'(again) the bed is still there');
await ev(()=>{RM.sel={t:'surf',k:'fl'};renderDrawer();});
await ev(()=>{RM.sel=null;renderDrawer();});await p.waitForTimeout(300);
const flPt=await ev(()=>{const g=document.getElementById('rmR'),m=g.getScreenCTM();const s=gx2s(14,14);return [m.a*s[0]+m.c*s[1]+m.e,m.b*s[0]+m.d*s[1]+m.f];});
console.log('floor tap at',flPt,'hit',await ev(([x,y])=>{const e=document.elementFromPoint(x,y);return (e.closest('[data-hit]')||{dataset:{}}).dataset.hit;},flPt));
await p.touchscreen.tap(flPt[0],flPt[1]);
console.log('sel',JSON.stringify(await ev(()=>RM.sel)));
await ev(()=>{const b=document.querySelector('#rmDrawer [data-col]:not(.cur)');if(b)b.click();});
await p.waitForTimeout(100);
ok(await ev(()=>!RM.pv&&space.surf.fl===ROOM_DEFAULT.fl),'a click on a colour right after a touch on the floor does not choose it');
await p.waitForTimeout(800);
// a deliberate tap afterwards works
await ev(()=>document.querySelector('#rmDrawer [data-col]:not(.cur)').click());
ok(await ev(()=>!!RM.pv||space.surf.fl!==ROOM_DEFAULT.fl),'a deliberate click on a colour a moment later works');
// a mouse is not affected (no delay): the other tests rely on it
await ev(()=>{RM.tapTouch=false;});
await ev(()=>{RM.pv=null;RM.sel={t:'item',id:'bed'};rmRedraw();renderDrawer();console.log('fxaway',!!document.querySelector('[data-fxaway]'));document.querySelector('[data-fxaway="bed"]').click();});
ok(await ev(()=>space.fix.bed===null),'with a mouse a drawer click is never delayed');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
