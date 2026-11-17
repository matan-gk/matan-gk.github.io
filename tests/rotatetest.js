// turning items (phase 1: the mirrored look): footprints, drawing, turning in place and while placing, what lies on it, the bed, saves
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:1100,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=2000;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();});
const set=things=>ev(th=>{space.things=th;space.spent=0;space.fix={bed:{x:0,y:0},window:{w:'r',u:WIN_U}};space.lv.bed=1;space.top.bed=1;settleSurfaces();RM.sel=null;RM.pl=null;RM.list=null;RM.note=null;rmRedraw();renderDrawer();},things);
const click=sel=>ev(s=>document.querySelector(s).click(),sel);
// the model
ok(await ev(()=>fpOf(catOf('desk'),0).join('x')==='4x8'&&fpOf(catOf('desk'),1).join('x')==='8x4'&&fpOf(catOf('desk'),2).join('x')==='4x8'),'an odd turn swaps the footprint');
ok(await ev(()=>!canTurn(catOf('pl00'))&&!canTurn(catOf('rug_rd'))&&!canTurn(catOf('table'))&&!canTurn(catOf('soccer'))&&canTurn(catOf('desk'))&&canTurn(catOf('chair'))&&canTurn(catOf('piano'))&&canTurn(catOf('slide'))),'symmetric things have no turn button, the others do');
ok(await ev(()=>!['desk_turn','chair2','slide2','soccer2'].some(k=>catOf(k))&&!ROOM_CATALOG.some(c=>/turn|מסובב/.test(c.id+c.n))),'the old turned duplicates are gone from the catalog');
// old saves: the turned items are the item, turned (the saved x,y was already the back corner of the turned footprint)
ok(await ev(()=>{const s=spaceClean({earned:1,sub:2,things:[{k:'desk_turn',x:10,y:4,u:'dsk1'},{k:'chair2',x:12,y:12,u:'chr1'},{k:'slide2',x:0,y:14,u:'sld1'},{k:'soccer2',x:16,y:0,u:'soc1'}]},[],0);return JSON.stringify(s.things.map(t=>[t.k,t.o,t.x,t.y]));})==='[["desk",1,10,4],["chair",1,12,12],["slide",1,0,14],["soccer",1,16,0]]','a save with a turned desk, chair, slide and ball loads as those, turned '+await ev(()=>JSON.stringify(spaceClean({earned:1,sub:2,things:[{k:'desk_turn',x:10,y:4,u:'dsk1'},{k:'chair2',x:12,y:12,u:'chr1'},{k:'slide2',x:0,y:14,u:'sld1'},{k:'soccer2',x:16,y:0,u:'soc1'}]},[],0).things.map(t=>[t.k,t.o,t.x,t.y]))));
// mirrored drawing lands on the swapped footprint: the margins to the diamond's left and right corners swap
const geo=await ev(()=>{const c=catOf('desk');const rect=(x,y,o)=>{const sv=thingSVG(c,x,y,undefined,o),m=/<image[^>]*x="([-\d.]+)"[^>]*width="([-\d.]+)"[^>]*?(?:transform="translate\(([-\d.]+) 0\) scale\(-1 1\)")?\/>/.exec(sv),x0=+m[1],w=+m[2];let a=x0,b=x0+w;if(m[3]){a=+m[3]-x0-w;b=+m[3]-x0;}const [fw,fd]=fpOf(c,o);return {l:a-gx2s(x,y+fd)[0],r:gx2s(x+fw,y)[0]-b};};
  const A=rect(6,6,0), B=rect(6+(4-8)/2,6+(8-4)/2,1);return [A,B];});
ok(Math.abs(geo[0].l-geo[1].r)<.6&&Math.abs(geo[0].r-geo[1].l)<.6,'the mirrored picture sits on the turned footprint: left and right margins swap '+JSON.stringify(geo));
// turning in place, with something on it
await set([{k:'desk',x:10,y:4,u:'dsk1'},{k:'lego',x:0,y:0,u:'leg1',on:{h:'dsk1',dx:1,dy:5}},{k:'teddy',x:0,y:0,u:'ted1',on:{h:'dsk1',dx:2,dy:0}}]);
await ev(()=>{RM.sel={t:'thing',i:0};rmRedraw();renderDrawer();});
ok(await ev(()=>!!document.querySelector('[data-turn="0"]')),'the drawer of a desk has a turn button');
await click('[data-turn="0"]');
const after=await ev(()=>space.things.map(t=>({k:t.k,x:t.x,y:t.y,o:t.o,on:t.on})));
ok(after[0].o===1&&after[0].x===8&&after[0].y===6,'the desk turned on the middle of its footprint: 4x8 at 10,4 became 8x4 at 8,6 '+JSON.stringify(after[0]));
ok(after[1].on.dx===5&&after[1].on.dy===1&&after[2].on.dx===0&&after[2].on.dy===2,'what lies on it swapped x and y on the top');
ok(after[1].x===8+5&&after[1].y===6+1,'and stands at the new place');
ok(after[2].o===1&&after[1].o===undefined,'the teddy turned with it (the lego is symmetric)');
ok(await ev(()=>{const tp=topOf(space.things[0]);return tp.c[2]===tp.c[2]&&topOf(space.things[0]).c.join()!==(catOf('desk').top.c.map(v=>v*GU)).join()&&topOf(space.things[0]).c[2]===catOf('desk').top.c[3]*GU;}),'its top is the mirrored box');
await click('[data-turn="0"]');
ok(await ev(()=>space.things[0].o===undefined&&space.things[0].x===10&&space.things[0].y===4&&space.things[1].on.dx===1&&space.things[1].on.dy===5),'turning again puts everything back');
// no room
const blockers=[];for(let y=0;y<20;y++)for(let x=0;x<20;x++){if(x>=10&&x<14&&y>=8&&y<16)continue;if(x>=6&&x<18&&y>=10&&y<14||x>=8&&x<16&&y>=4&&y<20)blockers.push({k:'markers',x,y,u:'m'+x+'_'+y});}
await set([{k:'desk',x:10,y:8,u:'dsk1'},...blockers.slice(0,250)]);
ok(await ev(()=>space.things.slice(1).every(t=>t.x>=0)&&space.things[0].x===10),'(setup: blockers around the desk)');
await ev(()=>{RM.sel={t:'thing',i:0};rmRedraw();renderDrawer();});await click('[data-turn="0"]');
ok(await ev(()=>space.things[0].o===undefined&&space.things[0].x===10&&space.things[0].y===8&&!!document.querySelector('.rmnote')),'no room to turn: nothing changes and a note says so');
// slides to a free spot nearby
await set([{k:'desk',x:0,y:0,u:'dsk1'}]);await ev(()=>{space.fix.bed=null;});
await ev(()=>{RM.sel={t:'thing',i:0};rmRedraw();renderDrawer();});await click('[data-turn="0"]');
ok(await ev(()=>space.things[0].o===1&&space.things[0].x>=0&&space.things[0].y>=0&&space.things[0].x+8<=20&&space.things[0].y+4<=20),'in a corner the turned desk slides to the nearest spot that fits '+await ev(()=>JSON.stringify(space.things[0])));
// while placing
await set([]);
await ev(()=>{RM.list='cat';renderDrawer();});await click('[data-pick="desk"]');
ok(await ev(()=>RM.pl.o===0&&!!document.querySelector('[data-pturn]')),'placing a desk offers a turn button');
await click('[data-pturn]');
ok(await ev(()=>RM.pl.o===1&&fpOf(catOf('desk'),RM.pl.o).join()==='8,4'&&footFree(catOf('desk'),RM.pl.x,RM.pl.y,-1,RM.pl.o)),'placing: turned, and it still stands on free ground');
await click('[data-place]');
ok(await ev(()=>space.things[0].k==='desk'&&space.things[0].o===1),'bought and placed turned');
await ev(()=>{RM.list=null;});
ok(await ev(()=>{RM.sel={t:'thing',i:0};renderDrawer();return !!document.querySelector('[data-turn="0"]');}),'a placed desk can be turned again');
// no turn button for plants
await set([{k:'pl00',x:2,y:2,u:'pla1'}]);await ev(()=>{RM.sel={t:'thing',i:0};rmRedraw();renderDrawer();});
ok(await ev(()=>!document.querySelector('[data-turn]')),'no turn button on a plant');
// save round trip
await set([{k:'desk',x:10,y:4,u:'dsk1'},{k:'teddy',x:0,y:0,u:'ted1',on:{h:'dsk1',dx:2,dy:0}}]);
await ev(()=>{turnThing(0);});
const rt=await ev(()=>{const s=spaceClean(JSON.parse(JSON.stringify(space)),[],0);return JSON.stringify(s.things.map(t=>[t.k,t.o,t.x,t.y,t.on&&t.on.dx,t.on&&t.on.dy]));});
ok(rt===await ev(()=>JSON.stringify(space.things.map(t=>[t.k,t.o,t.x,t.y,t.on&&t.on.dx,t.on&&t.on.dy]))),'turned things and what lies on them survive saving and loading '+rt);
ok(await ev(()=>spaceClean({earned:1,things:[{k:'desk',x:0,y:0,u:'dsk1',o:7},{k:'desk',x:8,y:8,u:'dsk2',o:'x'}]},[],0).things.every(t=>t.o===undefined||t.o===1)),'a nonsense turn is cleaned up');
ok(await ev(()=>spaceClean({earned:1,things:[{k:'desk',x:14,y:0,u:'dsk1',o:1}]},[],0).things[0].x===-1),'a turned desk that does not fit the room goes to the inventory');
// the bed
await set([{k:'lego',x:0,y:0,u:'leg1',on:{h:'bed',dx:2,dy:3}}]);
await ev(()=>{space.fix.bed={x:8,y:6};settleSurfaces();RM.sel={t:'item',id:'bed'};rmRedraw();renderDrawer();});
ok(await ev(()=>!!document.querySelector('[data-fxturn="bed"]')),'the bed drawer has a turn button');
await click('[data-fxturn="bed"]');
ok(await ev(()=>{const b=space.fix.bed;return b.o===1&&b.x===7&&b.y===7&&bedFp(1,1).join()==='8,6'&&space.things[0].on.dx===3&&space.things[0].on.dy===2&&space.things[0].x===7+3&&space.things[0].y===7+2;}),'the bed turned about its middle (6x8 at 8,6 became 8x6 at 7,7) and its lego came along '+await ev(()=>JSON.stringify([space.fix.bed,space.things[0]])));
ok(await ev(()=>roomBlocked(14,12)&&!roomBlocked(7,13)&&roomBlocked(7,7)&&!roomBlocked(15,7)&&!roomBlocked(14,13)),'the turned bed blocks its new footprint (the room checks agree)');
ok(await ev(()=>{const tp=topOf('bed');return tp.c[2]===4*GU&&tp.c[3]===3*GU&&tp.cells.every(q=>BED_TOP[1].cells.some(r=>r[0]===q[1]&&r[1]===q[0]));}),'the bed top is the mirrored one');
ok(await ev(()=>/scale\(-1 1\)/.test(document.getElementById('rmR').innerHTML)),'the bed picture is drawn mirrored');
await click('[data-fxturn="bed"]');
ok(await ev(()=>space.fix.bed.o===undefined&&space.fix.bed.x===8&&space.fix.bed.y===6&&space.things[0].on.dx===2&&space.things[0].on.dy===3),'turned back');
// moving a turned bed keeps its turn; bed at the edge: a bigger level is pushed in, turned too
await ev(()=>{turnBed();});await click('[data-fxmove="bed"]');
ok(await ev(()=>RM.pl.o===1),'moving the turned bed keeps it turned');
await click('[data-place]');
ok(await ev(()=>space.fix.bed.o===1),'and placing it too');
ok(await ev(()=>{const s=spaceClean(JSON.parse(JSON.stringify(space)),[],0);return JSON.stringify(s.fix.bed)===JSON.stringify(space.fix.bed);}),'a turned bed survives saving and loading');
ok(await ev(()=>{const s=spaceClean({earned:1,fix:{bed:{x:2,y:3,o:1},window:null}},[],0);return JSON.stringify(s.fix.bed)==='{"x":4,"y":6,"o":1}';}),'an old-unit save with a turned bed is scaled');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
