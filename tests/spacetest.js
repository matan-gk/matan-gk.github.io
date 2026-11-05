const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
// locked: a button with progress, a teaser instead of the room
await p.evaluate(()=>{space.earned=6;saveState();renderLevels();});
ok(await p.evaluate(()=>{const b=document.getElementById('spaceBtn');return !!b&&b.classList.contains('locked')&&!!b.querySelector('.rbring')&&b.textContent.includes('6/10');}),'locked: button shows the progress ring and 6/10');
ok(await p.evaluate(()=>document.querySelectorAll('#levels .levelbtn').length)===8,'the room button is not counted among the 8 game buttons');
await p.click('#spaceBtn');await p.waitForTimeout(200);
ok(await p.evaluate(()=>document.getElementById('spaceOverlay').hidden&&!document.getElementById('celebOverlay').hidden&&/עוד\s*4/.test(document.getElementById('celebBody').textContent)),'locked: tapping explains 4 more tokens, room stays closed');
await p.evaluate(()=>closeCeleb());
// the ceremony plays once at 10 tokens, spends nothing
await p.evaluate(()=>{space.earned=10;saveState();flushCelebs();});await p.waitForTimeout(300);
ok(await p.evaluate(()=>space.unlocked===true&&space.spent===0&&tokenBalance()===10&&document.getElementById('uStage')!==null),'ceremony starts, unlocked saved at once, nothing spent');
await p.waitForTimeout(7600);
const frames=await p.evaluate(()=>document.querySelector('#uStage img.ufr').getAttribute('src'));
ok(await p.evaluate(()=>document.querySelectorAll('#celebBtns .btn').length)===2&&/ל־?|החדר/.test(await p.evaluate(()=>document.getElementById('uTitle').textContent)),'ceremony ends on the open door with Enter / Later');
await p.click('#celebBtns .btn >> nth=1');await p.waitForTimeout(300);
ok(await p.evaluate(()=>document.getElementById('celebOverlay').hidden&&!!document.querySelector('#spaceBtn.poof .cl.c3')&&!document.getElementById('spaceBtn').classList.contains('locked')),'later: the button appears with the cloud poof');
await p.evaluate(()=>{flushCelebs();});await p.waitForTimeout(300);
ok(await p.evaluate(()=>document.getElementById('celebOverlay').hidden),'the ceremony does not play twice');
await p.waitForTimeout(2400);
ok(await p.evaluate(()=>!document.getElementById('spaceBtn').classList.contains('poof')),'poof class is removed after the animation');
// skip also unlocks for good
const sk=await p.evaluate(()=>{ const c=cleanProgress({space:{earned:30,spent:0,trued:true}}); return c.space.unlocked; });
ok(sk===false,'a profile with 30 tokens but no flag is not unlocked until the ceremony ran');
// the room
await p.click('#spaceBtn');await p.waitForTimeout(400);
ok(await p.evaluate(()=>!document.getElementById('spaceOverlay').hidden&&!!document.querySelector('#rmView svg [data-hit="item:bed"]')&&!!document.querySelector('#rmView svg [data-hit="item:window"]')&&document.querySelectorAll('#rmView svg [data-hit^="surf:"]').length===3),'room opens with bed, window and three surfaces');
ok(await p.evaluate(()=>document.getElementById('rmTokN').textContent==='10'),'room shows the balance');
await p.screenshot({path:'space_room.png'});
// zoom and pan stay inside the room
await p.evaluate(()=>{rmZoomAt(5,500,450);});
ok(await p.evaluate(()=>RM.k===3),'zoom is limited to 3x');
await p.evaluate(()=>{rmPan(9999,9999);});
ok(await p.evaluate(()=>RM.tx<=0&&RM.ty<=0),'pan cannot leave the room');
await p.evaluate(()=>{rmZoomAt(0.2,500,450);});
ok(await p.evaluate(()=>RM.k===1&&RM.tx===0&&RM.ty===0),'zoom out returns to the full room');
// item upgrade: bed 1 -> 2 costs 3
await p.evaluate(()=>onRoomTap('item:bed'));
ok(await p.evaluate(()=>/רמה 1/.test(document.getElementById('rmSheet').textContent)&&!!document.querySelector('[data-up="bed"]')),'tap the bed: sheet with upgrade');
await p.click('[data-up="bed"]');await p.waitForTimeout(200);
ok(await p.evaluate(()=>!document.getElementById('celebOverlay').hidden&&/יישארו 7/.test(document.getElementById('celebBody').textContent)&&/אי אפשר להחזיר/.test(document.getElementById('celebBody').textContent)),'confirm sheet: price, balance after, no refunds');
await p.click('#celebBtns .btn >> nth=1');await p.waitForTimeout(150);
ok(await p.evaluate(()=>space.lv.bed===1&&space.spent===0),'cancel changes nothing');
await p.evaluate(()=>onRoomTap('item:bed'));await p.click('[data-up="bed"]');await p.click('#celebBtns .btn >> nth=0');await p.waitForTimeout(300);
ok(await p.evaluate(()=>space.lv.bed===2&&space.spent===3&&tokenBalance()===7&&document.getElementById('rmTokN').textContent==='7'),'buy: bed level 2, 3 tokens spent');
// max level and too poor
await p.evaluate(()=>{space.lv.bed=3;onRoomTap('item:bed');});
ok(await p.evaluate(()=>/רמה מקסימלית/.test(document.getElementById('rmSheet').textContent)),'max level has no buy button');
await p.evaluate(()=>{space.spent=space.earned-1;onRoomTap('item:window');});
ok(await p.evaluate(()=>!!document.querySelector('[data-up="window"][data-poor]')&&/חסרים עוד 1 מטבע/.test(document.getElementById('rmSheet').textContent)),'not enough tokens: says how many are missing');
await p.click('[data-up="window"]');await p.waitForTimeout(150);
ok(await p.evaluate(()=>document.getElementById('celebOverlay').hidden&&space.lv.window===1),'too poor: nothing is bought');
// colors: 1 token, bought ones are free to switch back
await p.evaluate(()=>{space.spent=0;onRoomTap('surf:wl');});
const c0=await p.evaluate(()=>({cur:space.surf.wl,n:document.querySelectorAll('#rmSheet .swatch').length}));
ok(c0.n===8&&c0.cur===2,'surface sheet: 8 brushes, starts purple');
await p.click('#rmSheet [data-col="wl:4"]');await p.waitForTimeout(150);await p.click('#celebBtns .btn >> nth=0');await p.waitForTimeout(250);
ok(await p.evaluate(()=>space.surf.wl===4&&space.spent===1&&space.own.wl.includes(4)),'new color: 1 token, applied');
await p.evaluate(()=>onRoomTap('surf:wl'));await p.click('#rmSheet [data-col="wl:2"]');await p.waitForTimeout(150);
ok(await p.evaluate(()=>space.surf.wl===2&&space.spent===1&&document.getElementById('celebOverlay').hidden),'switching back to an owned color is free');
await p.click('#rmSheet [data-col="wl:4"]');await p.waitForTimeout(150);
ok(await p.evaluate(()=>space.surf.wl===4&&space.spent===1),'and forward again, still free');
ok(await p.evaluate(()=>document.querySelector('#rmView svg g[data-hit="surf:wl"] polygon').getAttribute('fill')===ROOM_COLORS[4].h),'the wall is drawn in the chosen color');
// saved and restored
await p.reload();await p.waitForTimeout(500);
ok(await p.evaluate(()=>space.unlocked&&space.lv.bed===3&&space.surf.wl===4&&space.spent===1),'room state survives a reload');
// sanitizing
const cl=await p.evaluate(()=>{const c=cleanProgress({space:{earned:50,spent:2,trued:true,unlocked:true,surf:{wl:99,wr:'x',fl:3},own:{fl:[3,3,77,1]},lv:{bed:9,window:2,ghost:3}}}).space;return {c};});
ok(cl.c.surf.wl===2&&cl.c.surf.wr===2&&cl.c.surf.fl===3&&cl.c.lv.bed===1&&cl.c.lv.window===2&&!('ghost' in cl.c.lv)&&JSON.stringify(cl.c.own.fl)==='[1,3,7]','bad colors and levels fall back, the current color is always owned: '+JSON.stringify(cl.c));
// the whole room's price is known and sane
const mc=await p.evaluate(()=>roomMaxCost());ok(mc===(3+6)+(2+4)+3*7,'room v0 max-out cost = items 15 + colors 21 = 36, got '+mc);
// a profile that already has tokens gets the ceremony when entering the game
await p.evaluate(()=>{ activeProfile().progress = Object.assign(captureProgress(),{space:{earned:25,spent:0,trued:true,unlocked:false}}); persist(); });
await p.reload();await p.waitForTimeout(1800);
ok(await p.evaluate(()=>document.getElementById('uStage')!==null&&!document.getElementById('celebOverlay').hidden),'existing player above 10 tokens: ceremony on first start');
// the vault has a door to the room once unlocked
ok(errs.length===0,'no page errors '+errs);console.log(f?'FAILURES '+f:'ALL PASS');await b.close();})();
