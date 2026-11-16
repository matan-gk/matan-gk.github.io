// wall shelves: solid wall items, drawn in the room's own view (not sheared), mirrored on the left wall, with the usual wall rules
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:1100,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=1000;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();});
const ids=['shelf_crystal','shelf_tea','shelf_ice','shelf_plush','stack_tea','stack_ice','stack_crystal','stack_sweets'];
ok(await ev(i=>i.every(id=>{const c=catOf(id);return c&&c.wall&&c.solid&&c.g==='wall'&&c.r[2]===175&&c.im&&c.im[2]>c.r[2]&&/^assets\//.test(c.src);}),ids),'eight solid wall items, all with a 175 wide back edge');
ok(await ev(i=>new Set(i.map(id=>catOf(id).src)).size===8,ids),'eight different pictures');
ok(await ev(()=>{const c=catOf('shelf_tea'),r=wallXf({s:'r',a:300,h:300},c),l=wallXf({s:'l',a:300,h:300},c),fl=wallXf({s:'r',a:300,h:300},catOf('wallclock'));return !/matrix/.test(r)&&/scale\(-1 1\)/.test(l)&&!/scale/.test(r)&&/matrix/.test(fl);}),'a shelf is not sheared and is mirrored on the left wall; a flat picture is still sheared');
// drawn through the room
await ev(()=>{space.things=[{k:'shelf_crystal',x:-1,y:-1,u:'s1',wl:{s:'r',a:125,h:500}},{k:'shelf_tea',x:-1,y:-1,u:'s2',wl:{s:'l',a:125,h:200}},{k:'stack_ice',x:-1,y:-1,u:'s3',wl:{s:'l',a:375,h:400}}];rmRedraw();});
ok(await ev(()=>document.querySelectorAll('#rmSvg g[data-hit^="thing:"] > image').length===3),'all three are drawn once');
const r=await ev(()=>{const th=space.things.map(t=>({...t}));return spaceClean({...spaceSnap(),things:th}).things.map(t=>!!t.wl);});
ok(r.every(Boolean),'they keep their wall places when saved and cleaned');
// overlap rules use the back edge rectangle
await ev(()=>{space.things=[{k:'shelf_crystal',x:-1,y:-1,u:'s1',wl:{s:'r',a:125,h:500}}];});
ok(await ev(()=>!wallFree(catOf('shelf_tea'),{s:'r',a:125,h:500},-1)&&wallFree(catOf('shelf_tea'),{s:'l',a:125,h:500},-1)),'two shelves cannot overlap on a wall, but the other wall is free');
// close together: the back edge is 175 (a multiple of the wall step), so two shelves hang flush
await ev(()=>{space.things=[{k:'shelf_tea',x:-1,y:-1,u:'s1',wl:{s:'l',a:100,h:300}}];});
ok(await ev(()=>wallFree(catOf('shelf_ice'),{s:'l',a:275,h:300},-1)&&!wallFree(catOf('shelf_ice'),{s:'l',a:250,h:300},-1)&&wallFree(catOf('shelf_ice'),{s:'l',a:100,h:375},-1)),'two shelves hang flush side by side (175 apart) and one above the other (75 up)');
// placing from the drawer
await ev(()=>{space.things=[];RM.list='cat';RM.filter='wall';renderDrawer();});
await p.click('.catcard[data-pick=shelf_ice]');
ok(await ev(()=>!!RM.pl&&!!RM.pl.wl&&RM.pl.k==='shelf_ice'),'buying a shelf starts a wall placement');
ok(await ev(()=>document.querySelectorAll('#rmSvg .rmghost image').length===1&&document.querySelectorAll('#rmSvg .rmghost rect.pend').length===1),'the preview shows the shelf and a flat green/red rectangle');
await p.click('[data-place]');
ok(await ev(()=>space.things.length===1&&space.things[0].wl&&space.things[0].k==='shelf_ice'),'placed on the wall');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
