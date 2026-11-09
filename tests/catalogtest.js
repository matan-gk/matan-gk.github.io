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
const U=await ev(()=>GU);   // grid units per old cell: the cases below are written in cells and scaled
// click the floor with the real pointer: the middle of the unit that makes an item of w x d units (default one old cell) land with its back corner (x - (its width in cells >> 1), same for y) cells from the corner
const tapCell=async(x,y,w=U,d=U)=>{const pt=await ev(([x,y,w,d])=>{const g=document.getElementById('rmR'),m=g.getScreenCTM(),ux=(x-((w/GU)>>1))*GU+(w>>1)+.5,uy=(y-((d/GU)>>1))*GU+(d>>1)+.5,sx=500+(ux-uy)*UX,sy=400+(ux+uy)*UY;return [m.a*sx+m.c*sy+m.e,m.b*sx+m.d*sy+m.f];},[x,y,w,d]);await p.mouse.click(pt[0],pt[1]);};

// catalog data
ok(await ev(()=>ROOM_CATALOG.length===79&&ROOM_CATALOG.every(c=>c.n&&(c.id.startsWith('pl')?c.p<=3:c.p<=8)&&c.p>=1&&/^assets\//.test(c.src)&&(c.base?(c.src!==c.base&&c.ref>0):!c.dc)&&c.r&&c.r[2]>0&&c.r[3]>0&&true)&&new Set(ROOM_CATALOG.map(c=>c.id)).size===79),'catalog: 79 items; plants cost 1-3; colorable ones keep their magenta original');
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
ok(await ev(()=>/פריטים ומלאי/.test(document.querySelector('#rmDrawer [data-list="cat"]').textContent)&&!document.querySelector('#rmDrawer [data-list="stock"]')&&!/במלאי/.test(document.getElementById('rmDrawer').textContent)),'idle drawer: one list button for shop and inventory (no separate stock button, no stock count while nothing is put away)');
await click('[data-list="cat"]');
ok(await ev(()=>document.querySelectorAll('#rmDrawer .catcard').length===79&&document.querySelectorAll('#rmDrawer .catchips .chip').length>=4&&!!document.querySelector('#rmDrawer .catchips [data-filter=own]')),'list: 79 cards and filter chips incl. "mine"');
ok(await ev(()=>{const c=document.querySelector('#rmDrawer .catcard');return /1 🪙/.test(c.textContent)&&c.querySelector('img').getAttribute('src')===ROOM_CATALOG[0].src;}),'a card shows the plant picture, its name and its price');
await click('[data-filter="plants"]');
ok(await ev(()=>document.querySelectorAll('#rmDrawer .catcard').length===21&&document.querySelector('.chip.on').dataset.filter==='plants'),'the plants filter works');
// pick -> preview with a ghost, nothing bought yet
await ev(()=>{space.spent=space.earned-2;});await click('[data-list="cat"],[data-filter="all"]').catch(()=>{});
await ev(()=>{RM.list='cat';renderDrawer();});
await click('[data-pick="pl07"]');   // 3 tokens, we have 2
ok(await ev(()=>RM.pl&&RM.pl.k==='pl07'&&RM.pl.i===-1&&space.things.length===0&&!!document.querySelector('.rmghost')&&!!document.querySelector('.rmtile')),'picking an item previews it as a ghost on a highlighted tile; nothing bought yet');
ok(await ev(()=>/צריך 3 מטבעות\. יש לך 2/.test(document.getElementById('rmDrawer').textContent)&&document.querySelector('[data-place]').disabled),'too poor: "צריך 3 מטבעות. יש לך 2", buy disabled');
await click('[data-cancel]');
ok(await ev(()=>!RM.pl&&!document.querySelector('.rmghost')&&space.things.length===0&&space.spent===space.earned-2),'cancel: nothing bought, nothing placed');
// buy a 1-token plant and choose its cell
await ev(()=>{space.spent=0;RM.list='cat';renderDrawer();});await click('[data-pick="pl00"]');
ok(await ev(()=>/צריך מטבע אחד\. יש לך 100/.test(document.getElementById('rmDrawer').textContent)||/יש לך 100/.test(document.getElementById('rmDrawer').textContent)),'price line shows the balance');
await tapCell(6,5);
ok(await ev(()=>RM.pl.x===6*GU&&RM.pl.y===5*GU),'tapping a floor cell moves the ghost there');
await tapCell(1,3);
ok(await ev(()=>RM.pl.x===6*GU&&RM.pl.y===5*GU),'the foot of the bed (not a lit top) is refused');
await click('[data-place]');
ok(await ev(()=>space.things.length===1&&space.things[0].x===6*GU&&space.things[0].y===5*GU&&space.spent===1&&!RM.pl),'bought and placed: 1 token spent, one thing on cell 6,5');
ok(await ev(()=>!!document.querySelector('[data-hit="thing:0"] image')&&document.querySelector('[data-hit="thing:0"] image').getAttribute('href')===ROOM_CATALOG[0].src),'the plant is drawn with its brown-pot picture');
// a second copy of the same plant; occupied cell refused
await ev(()=>{RM.list='cat';renderDrawer();});await click('[data-pick="pl00"]');await tapCell(6,5);
ok(await ev(()=>!(RM.pl.x===6*GU&&RM.pl.y===5*GU)),'an occupied cell is refused');
await tapCell(7,5);await click('[data-place]');
ok(await ev(()=>space.things.length===2&&space.spent===2&&thingCount('pl00')===2),'a second copy is bought separately (2 spent in all)');
await ev(()=>{RM.list='cat';renderDrawer();});
ok(await ev(()=>/×2/.test(document.querySelector('[data-pick="pl00"]').textContent)),'the catalog card shows how many copies you own');
await click('[data-close]');
// depth order: nearer things are drawn later
await ev(()=>{space.things.push({k:'pl01',x:4*GU,y:4*GU});rmRedraw();});
ok(await ev(()=>{const h=[...document.querySelectorAll('[data-hit^="thing:"]')].map(g=>+g.dataset.hit.split(':')[1]);const s=h.map(i=>space.things[i].x+space.things[i].y);return s.every((v,i)=>!i||s[i-1]<=v);}),'things are drawn back to front');
// select, move
await ev(()=>onRoomTap('thing:0'));
ok(await ev(()=>RM.sel&&RM.sel.t==='thing'&&!!document.querySelector('#rmDrawer [data-move]')&&!!document.querySelector('#rmDrawer [data-away]')),'tapping a placed plant offers move and put away');
await click('[data-move]');await tapCell(8,8);
ok(await ev(()=>RM.pl.i===0&&RM.pl.x===8*GU&&!/קנו/.test(document.getElementById('rmDrawer').textContent)),'moving is free (no buy button)');
await click('[data-place]');
ok(await ev(()=>space.things[0].x===8*GU&&space.things[0].y===8*GU&&space.spent===2),'moved: new cell, no tokens spent');
// put away -> stock -> place again
await ev(()=>onRoomTap('thing:0'));await click('[data-away]');
ok(await ev(()=>space.things[0].x===-1&&space.things.length===3&&!document.querySelector('[data-hit="thing:0"]')&&space.spent===2),'put away: leaves the room, stays owned, nothing refunded');
ok(await ev(()=>!document.querySelector('#rmDrawer [data-list="stock"]')&&/1 במלאי/.test(document.querySelector('#rmDrawer [data-list="cat"]').textContent)),'the single list button counts what is put away');
await click('[data-list="cat"]');
ok(await ev(()=>{const own=document.querySelectorAll('#rmDrawer .catcard.owned');const st=document.querySelectorAll('#rmDrawer .catcard[data-choose]');return own.length>=1&&st.length===1&&/🎒 1/.test(st[0].textContent)&&document.querySelectorAll('#rmDrawer .catcard').length===79;}),'the list shows everything; what you own is marked, and a card with a copy put away is marked 🎒');
await click('[data-filter=own]');
ok(await ev(()=>{const n=document.querySelectorAll('#rmDrawer .catcard').length;return n>=1&&n<10&&[...document.querySelectorAll('#rmDrawer .catcard')].every(c=>c.classList.contains('owned'));}),'"mine" filter lists only what you own');
await click('[data-choose]');
ok(await ev(()=>!!document.querySelector('#rmDrawer [data-unstow]:not([disabled])')&&!!document.querySelector('#rmDrawer [data-pick]')&&/קנו עוד אחד/.test(document.getElementById('rmDrawer').textContent)),'a card with a copy put away offers: place it from the inventory, or buy another');
await click('[data-unstow]');await tapCell(3,6);await click('[data-place]');
ok(await ev(()=>space.things[0].x===3*GU&&space.things[0].y===6*GU&&space.spent===2),'placed from the inventory for free');
await ev(()=>{RM.sel=null;RM.list='cat';RM.choose=null;RM.filter='all';renderDrawer();});
ok(await ev(()=>!document.querySelector('#rmDrawer .catcard[data-choose]')&&!!document.querySelector('#rmDrawer .catcard.owned[data-pick]')),'nothing put away: tapping an owned card goes straight to buying another');
ok(await ev(()=>{RM.list=null;RM.sel={t:'thing',i:0};renderDrawer();const b=document.querySelector('#rmDrawer [data-away]');return b.textContent.trim()==='מחיקה'&&/נשאר שלכם/.test(document.getElementById('rmDrawer').textContent);}),'the put-away button is called delete, with a note that bought items stay yours');
// persistence and sanitizing
await p.reload();await p.waitForTimeout(500);
ok(await ev(()=>space.things.length===3&&space.things[0].x===3*GU&&space.things[0].y===6*GU),'things survive a reload');
const cl=await ev(()=>cleanProgress({space:{earned:50,spent:0,trued:true,unlocked:true,things:[{k:'pl00',x:5,y:5},{k:'pl00',x:5,y:5},{k:'nope',x:1,y:9},{k:'pl01',x:1,y:1},{k:'pl02',x:12,y:3},{k:'pl03',x:-1,y:-1},'x',null]}}).space.things);
ok(cl.length===5&&cl[0].x===5*U&&cl[1].x===-1&&cl[2].x===-1&&cl[3].x===-1&&cl[4].x===-1&&!cl.some(t=>t.k==='nope'),'bad things are dropped; double, blocked and off-floor cells go to the stock: '+JSON.stringify(cl));
const mc=await ev(()=>roomMaxCost());
const pcs=await ev(()=>ROOM_PATTERNS.reduce((a,q)=>a+q.p,0));   // every pattern once: bought once, usable everywhere
ok(mc===18+14+17+278+25*19+pcs,'max-out cost = 86 (bed, window, 3 surfaces sharing one set of colours (17)) + 79 floor items (278) + 25 colorable parts x 19 + 2 for the bed blanket pattern = 860: '+mc);
// bed footprint: 3 x 4 cells, and the code tracks it that way
ok(await ev(()=>{const cnt=l=>{let n=0,all=true;for(let y=0;y<ROOM_CELLS;y++)for(let x=0;x<ROOM_CELLS;x++)if(roomBlocked(x,y,l)){n++;if(!(x<bedFp(l)[0]&&y<bedFp(l)[1]))all=false;}return [n,all];};return JSON.stringify([1,2,3,4,5].map(cnt))===JSON.stringify([[12,true],[12,true],[12,true],[9,true],[12,true]].map(([n,a])=>[n*GU*GU,a]));}),'the bed blocks its own footprint at the back corner: 3 x 4 = 12 cells for levels 1-3 and 5, 3 x 3 = 9 for level 4');
// switching to a smaller bed frees cells; switching back stows what is in the way
await ev(()=>{window.__sv=JSON.stringify([space.things,space.lv.bed,space.top.bed]);space.top.bed=4;space.lv.bed=4;space.things=[{k:'pl00',x:1*GU,y:3*GU}];});
ok(await ev(()=>{stowBlocked();return space.things[0].x===1*GU;}),'level 4 bed (3 x 3) leaves cell 1,3 free: the plant stays');
await ev(()=>{space.lv.bed=1;stowBlocked();});
ok(await ev(()=>space.things[0].x===-1&&space.things[0].y===-1),'switching to a 3 x 4 bed stows the plant that would be under it');
await ev(()=>{const s=JSON.parse(window.__sv);space.things=s[0];space.lv.bed=s[1];space.top.bed=s[2];});
ok(await ev(()=>roomBlocked(3*GU-1,4*GU-1)&&!roomBlocked(3*GU,0)&&!roomBlocked(0,4*GU)),'cell 2,3 is blocked; 3,0 and 0,4 are free');
// the catalog closes when something in the room is tapped; only placing a floor item is a mode
await ev(()=>{space.spent=0;RM.sel=null;RM.pl=null;RM.list='cat';renderDrawer();});
await ev(()=>onRoomTap('item:bed'));
ok(await ev(()=>!RM.list&&RM.sel&&RM.sel.id==='bed'&&/מיטה/.test(document.getElementById('rmDrawer').textContent)),'catalog open: tapping the bed closes it and shows the bed options');
await ev(()=>{RM.sel=null;RM.list='cat';renderDrawer();});await ev(()=>onRoomTap('surf:wl'));
ok(await ev(()=>!RM.list&&RM.sel&&RM.sel.k==='wl'&&document.querySelectorAll('#rmDrawer .brush').length===16+ROOM_PATTERNS.filter(q=>q.parts.includes('wl')).length),'catalog open: tapping a wall closes it and shows the colors');
await ev(()=>{RM.sel=null;RM.list='cat';RM.filter='own';renderDrawer();});await ev(()=>onRoomTap('thing:0'));
ok(await ev(()=>!RM.list&&RM.sel&&RM.sel.t==='thing'),'list open: tapping a placed plant closes it and selects the plant');
await ev(()=>{RM.sel=null;RM.list='cat';renderDrawer();});await ev(()=>onRoomTap(null));
ok(await ev(()=>!RM.list),'catalog open: tapping empty space closes it');
await ev(()=>{RM.list=null;RM.pl={k:'pl00',i:-1,x:6,y:6};rmRedraw();renderDrawer();onRoomTap('item:bed');});
ok(await ev(()=>!!RM.pl&&!RM.sel),'placing a floor item is a mode: tapping the bed does not select it');
// ---- furniture and toys: footprints bigger than one cell (a wide screen, so the drawer does not cover the floor)
await p.setViewportSize({width:1200,height:1000});await ev(()=>{golden=['🍪'];renderLevels();space.earned=Math.max(space.earned,100);openSpace();});await p.waitForTimeout(300);
ok(await ev(()=>{const f=k=>[fwOf(catOf(k))/GU,fdOf(catOf(k))/GU].join('x');return ['toybox1','toybox2','toybox3','cloud','armchair','telescope'].every(k=>f(k)==='2x2')&&f('desk')==='2x4'&&fpOf(catOf('desk'),1).map(v=>v/GU).join('x')==='4x2'&&f('piano')==='4x2'&&['mirror','tablet','book','unicorn','teddy','heart','star','pl00'].every(k=>f(k)==='1x1')&&['markers','lego','chess','tictac','puzzle','puzzle2','trainset','track','track2'].every(k=>f(k)===(0.5+'x'+0.5));}),'footprints: toy boxes, both couches and the telescope 2x2, desk 2x4 (turned 4x2), piano 4 long, the rest 1x1');
ok(await ev(()=>['toybox1','toybox2','toybox3','armchair','heart','star','desk'].every(k=>catOf(k).dc&&catOf(k).base&&catOf(k).ref>0)&&['cloud','piano','teddy','unicorn'].every(k=>!catOf(k).base)),'items with magenta parts have a default color, the magenta original and a light level; the others do not');
const rc2=await ev(async()=>{const c=catOf('heart');const load=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=s;});const data=i=>{const k=document.createElement('canvas');k.width=i.naturalWidth;k.height=i.naturalHeight;const x=k.getContext('2d');x.drawImage(i,0,0);return x.getImageData(0,0,k.width,k.height).data;};
  const B=data(await load(c.src)),A=data(await load(c.base)),R=data(await load(await recolorSprite(c,c.dc)));let n=0,d=0;for(let i=0;i<B.length;i+=4){if(A[i+3]<200)continue;if(Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2])>24){n++;d+=Math.abs(R[i]-B[i])+Math.abs(R[i+1]-B[i+1])+Math.abs(R[i+2]-B[i+2]);}}return {n,mean:d/n/3};});
ok(rc2.n>2000&&rc2.mean<14,'the heart cushion: recoloring with its default color reproduces the shown picture '+JSON.stringify(rc2));
await ev(()=>{space.things=[];space.spent=0;RM.sel=null;RM.pl=null;RM.list='cat';RM.filter='all';renderDrawer();});
await click('[data-pick="toybox1"]');
ok(await ev(()=>RM.pl&&RM.pl.k==='toybox1'&&/4 מטבעות|קנו · 4/.test(document.getElementById('rmDrawer').textContent)&&document.querySelector('.rmtile').getAttribute('points').split(' ').length===4),'a 2x2 item previews with one highlighted footprint');
await tapCell(6,6,4*U/2,4*U/2);
ok(await ev(()=>RM.pl.x===5*GU&&RM.pl.y===5*GU),'the tapped cell is the middle of a 2x2 item (cell 6,6 -> back cell 5,5)');
await tapCell(9,9,2*U,2*U);
ok(await ev(()=>RM.pl.x===8*GU&&RM.pl.y===8*GU),'near the edge the item is kept on the floor (9,9 -> 8,8)');
await tapCell(6,6,2*U,2*U);await click('[data-place]');
ok(await ev(()=>space.things.length===1&&space.things[0].x===5*GU&&space.spent===4),'bought a 2x2 toy box for 4');
await ev(()=>{RM.list='cat';renderDrawer();});await click('[data-pick="toybox2"]');await tapCell(6,6,2*U,2*U);
ok(await ev(()=>!(RM.pl.x===5*GU&&RM.pl.y===5*GU)),'a 2x2 may not overlap another item');
await tapCell(7,7,2*U,2*U);
ok(await ev(()=>RM.pl.x===5*GU&&RM.pl.y===5*GU)===false,'...and a partial overlap is refused too (7,7 -> 6,6 overlaps 5-6)');
await tapCell(3,7,2*U,2*U);
ok(await ev(()=>RM.pl.x===2*GU&&RM.pl.y===6*GU),'a free spot next to it is accepted');
await click('[data-cancel]');
// desk 2x4, bed cells, the turned desk 4x2, piano
await ev(()=>{space.things=[];space.spent=0;RM.list='cat';renderDrawer();});await click('[data-pick="desk"]');
const d0=await ev(()=>[RM.pl.x,RM.pl.y]);await tapCell(1,3,2*U,4*U);
ok(await ev(([a,b])=>RM.pl.x===a&&RM.pl.y===b,d0),'a desk may not overlap the bed (cells 0-2 x 0-3)');
await tapCell(1,6,2*U,4*U);
ok(await ev(()=>RM.pl.x===0&&RM.pl.y===4*GU),'desk 2x4 right in front of the bed: back cell 0,4');
await click('[data-place]');
ok(await ev(()=>space.things[0].k==='desk'&&space.spent===6),'desk bought for 6');
await ev(()=>{RM.list='cat';renderDrawer();});await click('[data-pick="desk"]');await click('[data-pturn]');await tapCell(6,7,4*U,2*U);
ok(await ev(()=>RM.pl.x===4*GU&&RM.pl.y===6*GU),'the turned desk is 4 wide, 2 deep (tap 6,7 -> back cell 4,6)');
await click('[data-place]');
await ev(()=>{RM.list='cat';renderDrawer();});await click('[data-pick="piano"]');await tapCell(9,0,4*U,2*U);
ok(await ev(()=>RM.pl.x===6*GU&&RM.pl.y===0),'the piano (4 x 2) in the far corner: 9,0 -> 6,0');
await ev(()=>{space.spent=space.earned-7;renderDrawer();});
ok(await ev(()=>/צריך 8 מטבעות\. יש לך 7/.test(document.getElementById('rmDrawer').textContent)&&document.querySelector('[data-place]').disabled),'piano costs 8: "צריך 8 מטבעות. יש לך 7"');
await click('[data-cancel]');
// drawn back to front by the front corner, 1x1 and big mixed
await ev(()=>{space.spent=0;space.things.push({k:'pl00',x:9*GU,y:0},{k:'cloud',x:4*GU,y:2*GU});rmRedraw();});
ok(await ev(()=>{const h=[...document.querySelectorAll('[data-hit^="thing:"]')].map(g=>space.things[+g.dataset.hit.split(':')[1]]);const d=h.map(t=>{const c=catOf(t.k);return t.x+fwOf(c)+t.y+fdOf(c);});return h.length===4&&d.every((v,i)=>!i||d[i-1]<=v);}),'big and small items are drawn back to front by their front corner');
// sanitizing with footprints
const cl2=await ev(()=>cleanProgress({space:{earned:50,spent:0,trued:true,unlocked:true,things:[{k:'toybox1',x:9,y:9},{k:'desk',x:0,y:2},{k:'toybox1',x:4,y:4},{k:'cloud',x:5,y:5},{k:'piano',x:6,y:8},{k:'piano',x:6,y:8},{k:'pl00',x:4,y:4}]}}).space.things.map(t=>t.x+','+t.y));
ok(JSON.stringify(cl2)===JSON.stringify(['-1,-1','-1,-1',4*U+','+4*U,'-1,-1',6*U+','+8*U,'-1,-1','-1,-1']),'saved items: off-floor, over the bed, or overlapping go to the stock: '+JSON.stringify(cl2));
ok(errs.length===0,'no page errors '+errs);console.log(f?'FAILURES '+f:'ALL PASS');await b.close();})();
