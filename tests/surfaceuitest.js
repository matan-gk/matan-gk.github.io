// things on furniture, phase 2: drawing, placing, tapping, moving
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:1200,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=1000;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();});
// screen point of a world point (cell units, may be fractional) lifted by z room units
const scr=(x,y,z,ox)=>ev(([x,y,z,ox])=>{const g=document.getElementById('rmR'),m=g.getScreenCTM(),sx=500+(x-y)*50+ox,sy=400+(x+y)*25-z;return [m.a*sx+m.c*sy+m.e,m.b*sx+m.d*sy+m.f];},[x,y,z||0,ox||0]);
const tapW=async(x,y,z,ox)=>{const q=await scr(x+.25,y+.25,z,ox);   // a cell centre is the corner of four units: tap the middle of one of them instead
  await p.mouse.click(q[0],q[1]);};
const set=(things,lv)=>ev(([th,l])=>{const S=GU;th=th.map(q=>{const o={...q};if(o.x>=0){o.x*=S;o.y*=S;}if(o.on)o.on={...o.on,dx:o.on.dx*S,dy:o.on.dy*S};return o;});   // the cases are written in cells
  space.things=th;space.spent=0;space.lv.bed=l||1;settleSurfaces();RM.sel=null;RM.pl=null;RM.list=null;rmRedraw();renderDrawer();},[things,lv]);
const S=await ev(()=>GU);   // grid units per old cell: the cases are written in cells
const zT=await ev(()=>catOf('table').top.z), zBed=await ev(()=>BED_TOP[1].z), oxBed=await ev(()=>BED_TOP[1].ox);
await set([{k:'table',x:6,y:6,u:'tab1'},{k:'teddy',x:6,y:6,u:'ted1',on:{h:'tab1',dx:0,dy:0}}]);

// drawing: the sitter is drawn right after its host, lifted by the top's height
const dom=await ev(()=>{const hits=[...document.querySelectorAll('#rmR [data-hit]')].map(g=>g.getAttribute('data-hit'));const g=document.querySelector('#rmR [data-hit="thing:1"] > g');return {hits,tr:g&&g.getAttribute('transform')};});
ok(dom.hits.indexOf('thing:1')===dom.hits.indexOf('thing:0')+1,'the sitter is drawn right after its host');
ok(dom.tr===`translate(0 ${-zT})`,'the sitter is lifted by the table top height: '+dom.tr);
await set([{k:'table',x:6,y:6,u:'tab1'},{k:'teddy',x:6,y:6,u:'ted1',on:{h:'tab1',dx:0,dy:0}},{k:'chair',x:8,y:8,u:'cha1'},{k:'toybox1',x:2,y:6,u:'box1'},{k:'heart',x:2,y:6,u:'hea1',on:{h:'box1',dx:1,dy:1}},{k:'star',x:1,y:1,u:'sta1',on:{h:'bed',dx:1,dy:1}}]);
const hits=await ev(()=>[...document.querySelectorAll('#rmR [data-hit]')].map(g=>g.getAttribute('data-hit')));
ok(hits.indexOf('thing:5')===hits.indexOf('item:bed')+1,'what lies on the bed is drawn right after the bed: '+hits.join(' '));
ok(hits.indexOf('thing:4')===hits.indexOf('thing:3')+1&&hits.indexOf('thing:1')===hits.indexOf('thing:0')+1&&hits.indexOf('thing:2')>hits.indexOf('thing:1'),'each host and its sitters stay together, the chair in front comes after');

// the lit tops while placing
for(const [k,n] of [['teddy',17*S*S],['pl00',17*S*S],['rug_sq',0],['chair',0],['telescope',0]]){
  await ev(([k])=>{space.things=[{k:'table',x:6,y:6,u:'tab1'},{k:'toybox1',x:2,y:6,u:'box1'}];space.lv.bed=1;RM.pl={k,i:-1,x:8,y:2};rmRedraw();renderDrawer();},[k]);
  const cnt=await ev(()=>document.querySelectorAll('#rmR .rmtop').length);
  ok(cnt===n,`placing a ${k}: ${n} lit top cells (table 4 + toy box 4 + bed 9 cells (each GU x GU units) for small things, none for ${'rugs and big things'}) - got ${cnt}`);
}
await ev(()=>{RM.pl={k:'teddy',i:-1,x:8,y:2};rmRedraw();renderDrawer();});
ok(await ev(()=>/משטח מואר/.test(document.getElementById('rmDrawer').textContent)),'the placing drawer tells you a small thing can also go on a lit top');
await ev(()=>{RM.pl={k:'chair',i:-1,x:8,y:2};renderDrawer();});
ok(await ev(()=>!/משטח מואר/.test(document.getElementById('rmDrawer').textContent)),'...but not for a big thing');

// choosing a top cell by tapping, and buying it there
await set([{k:'table',x:6,y:6,u:'tab1'}]);
await ev(()=>{space.spent=0;RM.pl={k:'teddy',i:-1,x:8,y:2};rmRedraw();renderDrawer();});
const hit=await ev(async()=>{const s=document.getElementById('rmSvg');return !!s;});
await tapW(7.5,6.5,zT);
let pl=await ev(()=>RM.pl&&RM.pl.on);
ok(pl&&pl.h==='tab1'&&pl.dx===S&&pl.dy===0,'tapping the lit table cell (raised) chooses it: '+JSON.stringify(pl));
ok(await ev(()=>!!document.querySelector('#rmR .rmtile')&&document.querySelector('#rmR .rmghost').getAttribute('transform')==='translate(0 '+(-catOf('table').top.z)+')'&&/יעמוד על המשטח/.test(document.getElementById('rmDrawer').textContent)),'the preview is lifted and the drawer says it will stand on the surface');
await tapW(8.5,2.5,0);
ok(await ev(()=>!RM.pl.on&&RM.pl.x===8*GU&&RM.pl.y>=0),'tapping the floor again chooses the floor');
await tapW(6.5,7.5,zT);
await ev(()=>document.querySelector('[data-place]').click());
const th=await ev(()=>space.things[1]);
ok(th&&th.k==='teddy'&&th.on&&th.on.h==='tab1'&&th.on.dx===0&&th.on.dy===S&&th.x===6*S&&th.y===7*S&&th.u&&await ev(()=>space.spent===2),'buying places it on the table (cell 0,1), costs the price');
// a floor tap over a raised top: the top wins; a tap on an occupied cell does not choose it
await ev(()=>{RM.pl={k:'heart',i:-1,x:8,y:2};rmRedraw();});
await tapW(6.5,7.5,zT);
ok(await ev(()=>!RM.pl.on||!(RM.pl.on.dx===0&&RM.pl.on.dy===GU)),'a cell that already holds something is not chosen');
// the front-most top wins where tops overlap on screen
const tc=await ev(()=>{const c=catOf('teddy');const q=(x,y,z,ox)=>{const g=document.getElementById('rmR'),m=g.getScreenCTM(),sx=500+(x-y)*50+(ox||0),sy=400+(x+y)*25-z;return {clientX:m.a*sx+m.c*sy+m.e,clientY:m.b*sx+m.d*sy+m.f};};
  const r=document.getElementById('rmSvg').getBoundingClientRect();return {c1:topCellAt(q(7.5,6.5,catOf('table').top.z),c,-1), floor:topCellAt(q(9.5,2.5,0),c,-1), bed:topCellAt(q(1.5,1.5,BED_TOP[1].z,BED_TOP[1].ox),c,-1), bedMiss:topCellAt(q(1.5,0.5,BED_TOP[1].z,BED_TOP[1].ox),c,-1)};});
ok(tc.c1&&tc.c1.h==='tab1'&&tc.c1.dx===S&&tc.c1.dy===0,'topCellAt: the raised table cell: '+JSON.stringify(tc.c1));
ok(tc.floor===null,'topCellAt: bare floor is not a top');
ok(tc.bed&&tc.bed.h==='bed'&&tc.bed.dx===S&&tc.bed.dy===S,'topCellAt: the bed\'s visible top: '+JSON.stringify(tc.bed));
ok(tc.bedMiss===null,'topCellAt: the pillow end of the bed is not a top');

// tapping a sitter selects it; a button goes to the furniture
await set([{k:'table',x:6,y:6,u:'tab1'},{k:'teddy',x:7,y:6,u:'ted1',on:{h:'tab1',dx:1,dy:0}}]);
await tapW(7.5,6.5,zT+8);
ok(await ev(()=>RM.sel&&RM.sel.t==='thing'&&RM.sel.i===1),'tapping a teddy on the table selects the teddy');
ok(await ev(()=>{const b=document.querySelector('#rmDrawer [data-host]');return !!b&&/שולחן/.test(b.textContent)&&!!document.querySelector('#rmDrawer [data-move]')&&!!document.querySelector('#rmDrawer [data-away]');}),'its drawer has move, delete and a button to select the table');
await ev(()=>document.querySelector('#rmDrawer [data-host]').click());
ok(await ev(()=>RM.sel&&RM.sel.t==='thing'&&RM.sel.i===0&&!document.querySelector('#rmDrawer [data-host]')),'that button selects the table');
await ev(()=>{RM.sel={t:'thing',i:0};renderDrawer();});
ok(await ev(()=>/הפריט שעליו יעבור גם הוא למלאי/.test(document.getElementById('rmDrawer').textContent)),'and the table\'s drawer warns that the teddy goes to the inventory on delete');
await set([{k:'teddy',x:1,y:1,u:'ted1',on:{h:'bed',dx:1,dy:1}}]);
await tapW(1.5,1.5,zBed+8,oxBed);
await ev(()=>{});
ok(await ev(()=>RM.sel&&RM.sel.t==='thing'&&/המיטה/.test(document.querySelector('#rmDrawer [data-host]').textContent)),'a thing on the bed: tap selects it, the button says "the bed"');
await ev(()=>document.querySelector('#rmDrawer [data-host]').click());
ok(await ev(()=>RM.sel&&RM.sel.t==='item'&&RM.sel.id==='bed'),'...and selects the bed');

// moving: surface -> floor -> another surface, and a host with its things
await set([{k:'table',x:6,y:6,u:'tab1'},{k:'teddy',x:7,y:6,u:'ted1',on:{h:'tab1',dx:1,dy:0}}]);
await ev(()=>{RM.sel={t:'thing',i:1};renderDrawer();document.querySelector('[data-move]').click();});
ok(await ev(()=>RM.pl&&RM.pl.on&&RM.pl.on.h==='tab1'&&!document.querySelector('#rmR [data-hit="thing:1"]')),'moving a sitter: it starts on its surface and is hidden while moving');
await tapW(8.5,8.5,0);await ev(()=>document.querySelector('[data-place]').click());
ok(await ev(()=>{const t=space.things[1];return !t.on&&t.x===8*GU&&t.y===8*GU&&space.spent===0;}),'moved to the floor for free');
await ev(()=>{RM.sel={t:'thing',i:1};renderDrawer();document.querySelector('[data-move]').click();});
await tapW(1.5,2.5,zBed,oxBed);await ev(()=>document.querySelector('[data-place]').click());
ok(await ev(()=>{const t=space.things[1];return t.on&&t.on.h==='bed'&&t.on.dx===GU&&t.on.dy===2*GU&&t.x===GU&&t.y===2*GU;}),'moved from the floor onto the bed');
await set([{k:'table',x:6,y:6,u:'tab1'},{k:'teddy',x:7,y:6,u:'ted1',on:{h:'tab1',dx:1,dy:0}}]);
await ev(()=>{RM.sel={t:'thing',i:0};renderDrawer();document.querySelector('[data-move]').click();});
await tapW(5.5,9.5,0);
ok(await ev(()=>!!document.querySelector('#rmR .rmghost')&&document.querySelectorAll('#rmR [data-hit="thing:1"]').length===1&&document.querySelectorAll('#rmR g[opacity=".85"] [data-hit="thing:1"]').length===1),'moving a host: the preview carries its things');
await ev(()=>document.querySelector('[data-place]').click());
ok(await ev(()=>space.things[0].x===9&&space.things[0].y===16&&space.things[1].x===9+GU&&space.things[1].y===16&&space.things[1].on.h==='tab1'),'placed: the things came along');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
