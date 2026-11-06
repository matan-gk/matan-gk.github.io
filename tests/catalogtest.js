const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=100;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();});
const D=()=>ev(()=>document.getElementById('rmDrawer').textContent);
const click=async sel=>{await ev(s=>document.querySelector(s).click(),sel);};
// click a floor cell with the real pointer
const tapCell=async(x,y)=>{const pt=await ev(([x,y])=>{const g=document.getElementById('rmG'),m=g.getScreenCTM(),sx=500+(x+.5-(y+.5))*50,sy=400+(x+.5+y+.5)*25;return [m.a*sx+m.c*sy+m.e,m.b*sx+m.d*sy+m.f];},[x,y]);await p.mouse.click(pt[0],pt[1]);};

// catalog data
ok(await ev(()=>ROOM_CATALOG.length===21&&ROOM_CATALOG.every(c=>c.n&&c.p>=1&&c.p<=6&&/^assets\//.test(c.src)&&/^assets\//.test(c.base)&&c.src!==c.base&&c.w>0&&c.ay>0&&c.ref>0)&&new Set(ROOM_CATALOG.map(c=>c.id)).size===21),'catalog: 21 plants, each with a name, a price of 1-6 tokens, a brown-pot picture and a magenta-pot original');
ok(await ev(()=>/^pl/.test(ROOM_CATALOG[0].id)&&Object.keys(ROOM_GROUPS).includes('plants')),'plants are the first group');
// default pot is brown, original magenta
const px=await ev(async()=>{const get=src=>new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const x=c.getContext('2d');x.drawImage(i,0,0);r(x.getImageData(0,0,c.width,c.height).data);};i.src=src;});
  const c=ROOM_CATALOG[2],A=await get(c.base),B=await get(c.src);let mag=0,brown=0,diff=0;for(let i=0;i<A.length;i+=4){if(A[i+3]<200)continue;if(A[i]>200&&A[i+2]>180&&A[i+1]<90)mag++;if(Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2])>24){diff++;if(B[i]>B[i+2]+40&&B[i]>B[i+1])brown++;}}return {mag,brown,diff};});
ok(px.mag>500&&px.diff>500&&px.brown/px.diff>0.9,'the original pot is magenta and the shown one is brown: '+JSON.stringify(px));
// the magenta trick: recoloring with the default brown reproduces the baked picture; another color changes only the pot
const rc=await ev(async()=>{const c=ROOM_CATALOG[2];const load=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=s;});
  const data=i=>{const k=document.createElement('canvas');k.width=i.naturalWidth;k.height=i.naturalHeight;const x=k.getContext('2d');x.drawImage(i,0,0);return x.getImageData(0,0,k.width,k.height).data;};
  const [B,A]=[data(await load(c.src)),data(await load(c.base))];
  const br=data(await load(await recolorSprite(c,'#965c34'))),bl=data(await load(await recolorSprite(c,'#4a78d0')));
  let n=0,d=0,blue=0,leaf=0,leafSame=0;for(let i=0;i<B.length;i+=4){if(A[i+3]<200)continue;const pot=Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2])>24;
    if(pot){n++;d+=Math.abs(br[i]-B[i])+Math.abs(br[i+1]-B[i+1])+Math.abs(br[i+2]-B[i+2]);if(bl[i+2]>bl[i]+20)blue++;}else{leaf++;if(Math.abs(bl[i]-A[i])+Math.abs(bl[i+1]-A[i+1])+Math.abs(bl[i+2]-A[i+2])<6)leafSame++;}}
  return {n,mean:d/n/3,blue:blue/n,leaf:leafSame/leaf};});
ok(rc.n>500&&rc.mean<14,'recolor with the default brown matches the baked brown pot: mean error '+rc.mean.toFixed(1));
ok(rc.blue>0.9&&rc.leaf>0.97,'recolor to blue turns the pot blue and leaves the plant alone: '+JSON.stringify(rc));

// drawer: idle buttons; catalog opens with filter chips and cards
ok(await ev(()=>!!document.querySelector('#rmDrawer [data-list="cat"]')&&!document.querySelector('#rmDrawer [data-list="stock"]')),'idle drawer: a catalog button, no stock button while nothing is put away');
await click('[data-list="cat"]');
ok(await ev(()=>document.querySelectorAll('#rmDrawer .catcard').length===21&&document.querySelectorAll('#rmDrawer .catchips .chip').length>=2&&/קטלוג/.test(document.getElementById('rmDrawer').textContent)),'catalog: 21 cards and filter chips');
ok(await ev(()=>{const c=document.querySelector('#rmDrawer .catcard');return /1 🪙/.test(c.textContent)&&c.querySelector('img').getAttribute('src')===ROOM_CATALOG[0].src;}),'a card shows the plant picture, its name and its price');
await click('[data-filter="plants"]');
ok(await ev(()=>document.querySelectorAll('#rmDrawer .catcard').length===21&&document.querySelector('.chip.on').dataset.filter==='plants'),'the plants filter works');
// pick -> preview with a ghost, nothing bought yet
await ev(()=>{space.spent=space.earned-3;});await click('[data-list="cat"],[data-filter="all"]').catch(()=>{});
await ev(()=>{RM.list='cat';renderDrawer();});
await click('[data-pick="pl07"]');   // 4 tokens, we have 3
ok(await ev(()=>RM.pl&&RM.pl.k==='pl07'&&RM.pl.i===-1&&space.things.length===0&&!!document.querySelector('.rmghost')&&!!document.querySelector('.rmtile')),'picking an item previews it as a ghost on a highlighted tile; nothing bought yet');
ok(await ev(()=>/צריך 4 מטבעות\. יש לך 3/.test(document.getElementById('rmDrawer').textContent)&&document.querySelector('[data-place]').disabled),'too poor: "צריך 4 מטבעות. יש לך 3", buy disabled');
await click('[data-cancel]');
ok(await ev(()=>!RM.pl&&!document.querySelector('.rmghost')&&space.things.length===0&&space.spent===space.earned-3),'cancel: nothing bought, nothing placed');
// buy a 1-token plant and choose its cell
await ev(()=>{space.spent=0;RM.list='cat';renderDrawer();});await click('[data-pick="pl00"]');
ok(await ev(()=>/צריך מטבע אחד\. יש לך 100/.test(document.getElementById('rmDrawer').textContent)||/יש לך 100/.test(document.getElementById('rmDrawer').textContent)),'price line shows the balance');
await tapCell(6,5);
ok(await ev(()=>RM.pl.x===6&&RM.pl.y===5),'tapping a floor cell moves the ghost there');
await tapCell(1,1);
ok(await ev(()=>RM.pl.x===6&&RM.pl.y===5),'a cell under the bed is refused');
await click('[data-place]');
ok(await ev(()=>space.things.length===1&&space.things[0].x===6&&space.things[0].y===5&&space.spent===1&&!RM.pl),'bought and placed: 1 token spent, one thing on cell 6,5');
ok(await ev(()=>!!document.querySelector('[data-hit="thing:0"] image')&&document.querySelector('[data-hit="thing:0"] image').getAttribute('href')===ROOM_CATALOG[0].src),'the plant is drawn with its brown-pot picture');
// a second copy of the same plant; occupied cell refused
await ev(()=>{RM.list='cat';renderDrawer();});await click('[data-pick="pl00"]');await tapCell(6,5);
ok(await ev(()=>!(RM.pl.x===6&&RM.pl.y===5)),'an occupied cell is refused');
await tapCell(7,5);await click('[data-place]');
ok(await ev(()=>space.things.length===2&&space.spent===2&&thingCount('pl00')===2),'a second copy is bought separately (2 spent in all)');
await ev(()=>{RM.list='cat';renderDrawer();});
ok(await ev(()=>/×2/.test(document.querySelector('[data-pick="pl00"]').textContent)),'the catalog card shows how many copies you own');
await click('[data-close]');
// depth order: nearer things are drawn later
await ev(()=>{space.things.push({k:'pl01',x:4,y:4});rmRedraw();});
ok(await ev(()=>{const h=[...document.querySelectorAll('[data-hit^="thing:"]')].map(g=>+g.dataset.hit.split(':')[1]);const s=h.map(i=>space.things[i].x+space.things[i].y);return s.every((v,i)=>!i||s[i-1]<=v);}),'things are drawn back to front');
// select, move
await ev(()=>onRoomTap('thing:0'));
ok(await ev(()=>RM.sel&&RM.sel.t==='thing'&&!!document.querySelector('#rmDrawer [data-move]')&&!!document.querySelector('#rmDrawer [data-away]')),'tapping a placed plant offers move and put away');
await click('[data-move]');await tapCell(8,8);
ok(await ev(()=>RM.pl.i===0&&RM.pl.x===8&&!/קנו/.test(document.getElementById('rmDrawer').textContent)),'moving is free (no buy button)');
await click('[data-place]');
ok(await ev(()=>space.things[0].x===8&&space.things[0].y===8&&space.spent===2),'moved: new cell, no tokens spent');
// put away -> stock -> place again
await ev(()=>onRoomTap('thing:0'));await click('[data-away]');
ok(await ev(()=>space.things[0].x===-1&&space.things.length===3&&!document.querySelector('[data-hit="thing:0"]')&&space.spent===2),'put away: leaves the room, stays owned, nothing refunded');
ok(await ev(()=>!!document.querySelector('#rmDrawer [data-list="stock"]')&&/מלאי · 1/.test(document.getElementById('rmDrawer').textContent)),'the stock button counts what is put away');
await click('[data-list="stock"]');
ok(await ev(()=>document.querySelectorAll('#rmDrawer [data-unstow]').length===1),'the stock lists it');
await click('[data-unstow]');await tapCell(3,6);await click('[data-place]');
ok(await ev(()=>space.things[0].x===3&&space.things[0].y===6&&space.spent===2),'placed from the stock for free');
// persistence and sanitizing
await p.reload();await p.waitForTimeout(500);
ok(await ev(()=>space.things.length===3&&space.things[0].x===3&&space.things[0].y===6),'things survive a reload');
const cl=await ev(()=>cleanProgress({space:{earned:50,spent:0,trued:true,unlocked:true,things:[{k:'pl00',x:5,y:5},{k:'pl00',x:5,y:5},{k:'nope',x:1,y:9},{k:'pl01',x:1,y:1},{k:'pl02',x:12,y:3},{k:'pl03',x:-1,y:-1},'x',null]}}).space.things);
ok(cl.length===5&&cl[0].x===5&&cl[1].x===-1&&cl[2].x===-1&&cl[3].x===-1&&cl[4].x===-1&&!cl.some(t=>t.k==='nope'),'bad things are dropped; double, blocked and off-floor cells go to the stock: '+JSON.stringify(cl));
const mc=await ev(()=>roomMaxCost());
ok(mc===34+23+54+3*18,'max-out cost includes one of each plant (54): '+mc);
ok(errs.length===0,'no page errors '+errs);console.log(f?'FAILURES '+f:'ALL PASS');await b.close();})();
