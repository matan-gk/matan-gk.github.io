// things on furniture, phase 1: the rules and the data (no drawing yet)
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=1000;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();});
const set=async(things,lv)=>ev(([th,l])=>{space.things=th;space.lv.bed=l||1;settleSurfaces();return 1;},[things,lv]);

// who can stand on a surface
ok(await ev(()=>['teddy','laptop','chess','globe','pl00','pl18','mirror','guitar','heart'].every(k=>canSit(catOf(k)))),'small one-cell things and plants can sit on furniture');
ok(await ev(()=>['rug_sq','mat','chair','telescope','dressbox','piano','desk','slide','easel','easel2','toybox1'].every(k=>!canSit(catOf(k)))),'rugs, 2x2 and bigger things, and tall easels cannot');
ok(await ev(()=>{const c={id:'x',fw:1,fd:1,r:[0,0,10,10],sm:0};const d={id:'y',fw:2,fd:2,r:[0,0,10,10],sm:1};return !canSit(c)&&canSit(d);}),'c.sm forces no / yes');
// hosts
ok(await ev(()=>['table','desk','desk_turn','toybox1','toybox2','toybox3'].every(k=>{const c=catOf(k),tp=c.top;return tp&&tp.c[0]>=0&&tp.c[1]>=0&&tp.c[0]+tp.c[2]<=fwOf(c)&&tp.c[1]+tp.c[3]<=fdOf(c)&&tp.z>0;})&&ROOM_CATALOG.filter(c=>c.top).length===6),'6 hosts (low table, desk and its turn, 3 toy boxes) with a top inside their footprint');
ok(await ev(()=>[1,2,3,4,5].every(l=>{const b=BED_TOP[l],fp=bedFp(l);return b.c[0]+b.c[2]<=fp[0]&&b.c[1]+b.c[3]<=fp[1]&&b.z>0&&b.cells.length>=3&&b.cells.every(q=>q[0]>=b.c[0]&&q[0]<b.c[0]+b.c[2]&&q[1]>=b.c[1]&&q[1]<b.c[1]+b.c[3]);})),'the bed has a list of visible top cells inside its footprint on every level');
ok(await ev(()=>surfSize(catOf('teddy')).join()===fwOf(catOf('teddy'))+','+fdOf(catOf('teddy'))&&canSit(catOf('teddy'))),'what an item takes up on a top is its own footprint');

// rules
await set([{k:'table',x:4,y:4,u:'tab1'},{k:'teddy',x:-1,y:-1,u:'ted1'},{k:'pl00',x:-1,y:-1,u:'pla1'},{k:'rug_sq',x:-1,y:-1,u:'rug1'},{k:'chair',x:-1,y:-1,u:'cha1'}]);
const r=await ev(()=>{const c=k=>catOf(k);return {
  a:surfFree(c('teddy'),'tab1',0,0), b:surfFree(c('teddy'),'tab1',1,1), c:surfFree(c('teddy'),'tab1',2,0), d:surfFree(c('teddy'),'tab1',0,2), e:surfFree(c('teddy'),'tab1',-1,0),
  f:surfFree(c('rug_sq'),'tab1',0,0), g:surfFree(c('chair'),'tab1',0,0), h:surfFree(c('teddy'),'nope',0,0), i:surfFree(c('teddy'),'tab1',0.5,0), j:surfFree(c('pl00'),'tab1',1,0)};});
ok(r.a&&r.b&&r.j,'on the table: every cell of its top, plants too');
ok(!r.c&&!r.d&&!r.e&&!r.i,'not outside the top, not off a fraction of a unit');
ok(!r.f&&!r.g&&!r.h,'not a rug, not a big thing, not onto a host that does not exist');
await ev(()=>{space.things[1].on={h:'tab1',dx:0,dy:0};settleSurfaces();});
const r2=await ev(()=>({same:surfFree(catOf('pl00'),'tab1',0,0), other:surfFree(catOf('pl00'),'tab1',1,0), self:surfFree(catOf('teddy'),'tab1',0,0,1), cell:[space.things[1].x,space.things[1].y]}));
ok(!r2.same&&r2.other&&r2.self,'one thing per cell of a top (the sitter itself does not block its own cell)');
ok(r2.cell[0]===4&&r2.cell[1]===4,'a sitting thing keeps its world cell in step with its host');
ok(await ev(()=>!footFree(catOf('chair'),4,4,-1)&&footFree(catOf('chair'),6,6,-1)),'the host blocks the floor under it, a sitter does not count as a floor thing');

// carry, put away, upgrade
await ev(()=>{space.things[0].x=7;space.things[0].y=2;settleSurfaces();});
ok(await ev(()=>space.things[1].x===7&&space.things[1].y===2&&space.things[1].on.h==='tab1'),'moving the host carries what stands on it');
await ev(()=>{const th=space.things[0];th.x=-1;th.y=-1;settleSurfaces();});
ok(await ev(()=>space.things[1].x===-1&&!space.things[1].on&&space.things[0].x===-1),'host put away: everything on it goes to the inventory too');
await set([{k:'teddy',x:0,y:0,u:'ted1',on:{h:'bed',dx:2,dy:2}},{k:'teddy',x:0,y:0,u:'ted2',on:{h:'bed',dx:0,dy:3}}],1);
ok(await ev(()=>space.things.every(t=>t.on&&t.x>=0)&&space.things[0].x===2&&space.things[0].y===2),'the bed takes things on its visible top (world cell = back corner + offset)');
await ev(()=>{space.lv.bed=5;stowBlocked();});
ok(await ev(()=>space.things[0].on&&space.things[0].x===2&&!space.things[1].on&&space.things[1].x===-1),'bed upgraded to a level whose visible top is smaller: what is no longer on it goes to the inventory, the rest stays');
ok(await ev(()=>{space.lv.bed=1;const c=catOf('teddy');return !surfFree(c,'bed',0,0)&&!surfFree(c,'bed',1,0)&&!surfFree(c,'bed',3,1)&&surfFree(c,'bed',1,1)&&surfFree(c,'bed',2,3);}),'bed 1: the pillow end is not on its visible top, the rest of the blanket is');

// spaceClean (loading a save)
const cl=await ev(()=>{const g=(raw)=>spaceClean(raw,['🍪'],0).things.map(t=>[t.k,t.x,t.y,t.on?t.on.h+':'+t.on.dx+','+t.on.dy:'-'].join('|'));
  const base=(things)=>({earned:500,spent:0,unlocked:true,things});
  return {
   ok:g(base([{k:'table',x:3,y:3,u:'tabl'},{k:'teddy',x:0,y:0,u:'tedd',on:{h:'tabl',dx:1,dy:1}}])),
   order:g(base([{k:'teddy',x:0,y:0,u:'tedd',on:{h:'tabl',dx:1,dy:0}},{k:'table',x:3,y:3,u:'tabl'}])),
   nohost:g(base([{k:'teddy',x:0,y:0,u:'tedd',on:{h:'zzzz',dx:0,dy:0}}])),
   outside:g(base([{k:'table',x:3,y:3,u:'tabl'},{k:'teddy',x:0,y:0,u:'tedd',on:{h:'tabl',dx:2,dy:0}}])),
   dup:g(base([{k:'table',x:3,y:3,u:'tabl'},{k:'teddy',x:0,y:0,u:'tdd1',on:{h:'tabl',dx:0,dy:0}},{k:'pl00',x:0,y:0,u:'plnt',on:{h:'tabl',dx:0,dy:0}}])),
   rug:g(base([{k:'table',x:3,y:3,u:'tabl'},{k:'rug_sq',x:0,y:0,u:'rugg',on:{h:'tabl',dx:0,dy:0}}])),
   nested:g(base([{k:'table',x:3,y:3,u:'tabl'},{k:'teddy',x:0,y:0,u:'tedd',on:{h:'tabl',dx:0,dy:0}},{k:'heart',x:0,y:0,u:'hear',on:{h:'tedd',dx:0,dy:0}}])),
   hoststowed:g(base([{k:'table',x:-1,y:-1,u:'tabl'},{k:'teddy',x:0,y:0,u:'tedd',on:{h:'tabl',dx:0,dy:0}}])),
   self:g(base([{k:'table',x:3,y:3,u:'tabl',on:{h:'tabl',dx:0,dy:0}}])),
   junk:g(base([{k:'table',x:3,y:3,u:'tabl'},{k:'teddy',x:0,y:0,u:'tedd',on:{h:'tabl',dx:'1',dy:null}},{k:'heart',x:5,y:5,u:'hear',on:'x'}])),
   bedok:g(base([{k:'teddy',x:0,y:0,u:'tedd',on:{h:'bed',dx:1,dy:1}}])),
   bedhead:g(base([{k:'teddy',x:0,y:0,u:'tedd',on:{h:'bed',dx:1,dy:0}}])),
   floorOnBed:g(base([{k:'teddy',x:1,y:1,u:'tedd'}])),
   uid:spaceClean(base([{k:'teddy',x:5,y:5},{k:'teddy',x:6,y:6,u:'same'},{k:'teddy',x:7,y:7,u:'same'},{k:'teddy',x:8,y:8,u:'BAD ID'}]),['🍪'],0).things.map(t=>t.u),
   sub:g({earned:500,spent:0,unlocked:true,sub:1,things:[{k:'table',x:3,y:3,u:'tabl'},{k:'teddy',x:0,y:0,u:'tedd',on:{h:'tabl',dx:1,dy:1}}]}),
   saved:spaceClean(base([]),['🍪'],0).sub};});
ok(cl.ok.join()==='table|3|3|-,teddy|4|4|tabl:1,1','a good save keeps the sitter and sets its world cell: '+cl.ok);
ok(cl.order.join()==='teddy|4|3|tabl:1,0,table|3|3|-','the sitter may come before its host in the list: '+cl.order);
ok(cl.nohost.join()==='teddy|-1|-1|-','sitter whose host is missing goes to the inventory: '+cl.nohost);
ok(cl.outside.join()==='table|3|3|-,teddy|-1|-1|-','sitter outside the top goes to the inventory: '+cl.outside);
ok(cl.dup.join()==='table|3|3|-,teddy|3|3|tabl:0,0,pl00|-1|-1|-'.replace('teddy|3|3|tabl:0,0,pl00','teddy|3|3|tabl:0,0,pl00'),'two things on one cell: the first stays, the second goes to the inventory: '+cl.dup);
ok(cl.rug.join()==='table|3|3|-,rug_sq|-1|-1|-','a rug cannot sit on a table: '+cl.rug);
ok(cl.nested.join()==='table|3|3|-,teddy|3|3|tabl:0,0,heart|-1|-1|-','nothing sits on a sitter: '+cl.nested);
ok(cl.hoststowed.join()==='table|-1|-1|-,teddy|-1|-1|-','host in the inventory: the sitter goes there too: '+cl.hoststowed);
ok(cl.self.join()==='table|-1|-1|-','a thing cannot sit on itself (it goes to the inventory): '+cl.self);
ok(cl.junk.join()==='table|3|3|-,teddy|-1|-1|-,heart|5|5|-','a malformed `on` is ignored (the floor spot, if any, is kept; a teddy at 0,0 is under the bed): '+cl.junk);
ok(cl.bedok.join()==='teddy|1|1|bed:1,1','a sitter on the bed: '+cl.bedok);
ok(cl.bedhead.join()==='teddy|-1|-1|-','not on the pillow end of the bed: '+cl.bedhead);
ok(cl.floorOnBed.join()==='teddy|-1|-1|-','a floor thing under the bed still goes to the inventory: '+cl.floorOnBed);
ok(cl.uid[0]&&cl.uid[1]==='same'&&cl.uid[2]!=='same'&&cl.uid[3]!=='BAD ID'&&new Set(cl.uid).size===4&&cl.uid.every(u=>/^[a-z0-9]{4,12}$/.test(u)),'every thing gets a unique, valid id (old saves have none): '+cl.uid);
ok(cl.sub.join()===cl.ok.join()&&cl.saved===1,'a save made with the same surface unit loads as is, and space.sub records the unit');
// a finer grid later: saved offsets are rescaled
ok(await ev(()=>GU>=1&&ROOM_CELLS===10*GU&&spaceClean({},[],0).sub===GU),'the grid unit is saved with the room (space.sub), so older saves can be converted');
// new things get an id; the delete note
await ev(()=>{space.things=[];space.spent=0;RM.pl={k:'teddy',i:-1,x:6,y:6};rmRedraw();renderDrawer();});
await ev(()=>document.querySelector('[data-place]').click());
ok(await ev(()=>space.things.length===1&&/^[a-z0-9]{4,12}$/.test(space.things[0].u)),'a bought thing is given an id');
await set([{k:'table',x:4,y:4,u:'tab1'},{k:'teddy',x:4,y:4,u:'ted1',on:{h:'tab1',dx:0,dy:0}},{k:'pl00',x:5,y:4,u:'pla1',on:{h:'tab1',dx:1,dy:0}},{k:'teddy',x:8,y:8,u:'ted2'}]);
await ev(()=>{RM.list=null;RM.sel={t:'thing',i:0};renderDrawer();});
ok(await ev(()=>/2 הפריטים שעליו יעברו גם הם למלאי/.test(document.getElementById('rmDrawer').textContent)),'deleting a host with two things on it: the drawer says they go to the inventory too');
await ev(()=>{space.things[1].x=-1;delete space.things[1].on;settleSurfaces();RM.sel={t:'thing',i:0};renderDrawer();});
ok(await ev(()=>/הפריט שעליו יעבור גם הוא למלאי/.test(document.getElementById('rmDrawer').textContent)),'one thing on it: singular wording');
await ev(()=>{RM.sel={t:'thing',i:3};renderDrawer();});
ok(await ev(()=>!/שעליו/.test(document.getElementById('rmDrawer').textContent)),'a thing with nothing on it: no extra note');
await ev(()=>{RM.sel={t:'thing',i:0};renderDrawer();document.querySelector('[data-away]').click();});
ok(await ev(()=>space.things.every(t=>t.x<0||t.k==='teddy'&&t.u==='ted2')&&space.things.filter(t=>t.x<0).length===3&&!space.things.some(t=>t.on)),'delete on the host: it and its sitters are all in the inventory');
// saving keeps the link
await set([{k:'table',x:4,y:4,u:'tab1'},{k:'teddy',x:4,y:4,u:'ted1',on:{h:'tab1',dx:1,dy:0}}]);
ok(await ev(()=>{const s=spaceClean(JSON.parse(JSON.stringify(space)),golden,0);return s.things[1].on&&s.things[1].on.h==='tab1'&&s.things[1].x===5&&s.things[0].u==='tab1';}),'a save round trip keeps the link');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
