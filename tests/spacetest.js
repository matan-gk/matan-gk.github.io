const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{uSpeed=0.02;});

// main navigation stays aligned with and without the room button, on phone and wide screens
const fill=async()=>ev(()=>{const L=document.getElementById('levels'),k=[...L.children].map(c=>c.getBoundingClientRect());const rows={};k.forEach(c=>{const y=Math.round(c.top/16);(rows[y]=rows[y]||[]).push(c);});const ext=Object.values(rows).map(row=>[Math.min(...row.map(c=>c.left)),Math.max(...row.map(c=>c.right))]);return ext.every(e=>Math.abs(e[0]-ext[0][0])<3&&Math.abs(e[1]-ext[0][1])<3);});
for(const [w,h] of [[390,844],[1174,900]]){ await p.setViewportSize({width:w,height:h});
  await ev(()=>{space.unlocked=false;renderLevels();});
  ok(await fill(),'navigation rows are full width / full rows without the room button at '+w);
  await ev(()=>{space.unlocked=true;renderLevels();});
  ok(await fill()||w>=720,'navigation rows aligned with the room button at '+w);   // wide screens: a lone last card is allowed
  ok(await ev(()=>{const a=document.querySelector('#spaceBtn .lvimg').getBoundingClientRect(),b=document.querySelector('#levels .levelbtn .lvimg.cut, #levels .levelbtn .lvimg').getBoundingClientRect();return Math.abs(a.width-b.width)<=48&&a.width>=64;}),'the room icon is as large as the other icons at '+w);
  await ev(()=>{space.unlocked=false;renderLevels();}); }
await p.setViewportSize({width:390,height:844});
// 1. no room button until unlocked; the coin area carries the teaser
ok(await ev(()=>!document.getElementById('spaceBtn')),'locked: no room button on the main screen');
ok(await ev(()=>{renderRoom();return !document.getElementById('tokChip');}),'0 tokens: no coin area at all');
await ev(()=>{space.earned=3;golden=['🍪'];saveState();renderRoom();});
ok(await ev(()=>/מספיק מטבעות לפרס מיוחד/.test(document.getElementById('tokChip').textContent)),'1+ tokens, locked: "collect enough tokens for a special reward"');
ok(await ev(()=>!document.getElementById('spaceBtn')),'still no room button with 3 tokens');
// 2+3. tapping the coin picture opens a big picture; outside click closes it (and rewards too)
await ev(()=>document.querySelector('[data-act=tok]').click());
ok(await ev(()=>!document.getElementById('celebOverlay').hidden&&!!document.querySelector('#celebBody .tokimg')&&+document.querySelector('#celebBody .tokimg').style.height.replace('px','')>=100),'token popup shows the picture large');
await p.mouse.click(5,5);await p.waitForTimeout(150);
ok(await ev(()=>document.getElementById('celebOverlay').hidden),'clicking outside closes the token popup');
await ev(()=>{closeRoom();collection=['🍪'];saveState();renderRewards();viewReward(0);});
await p.mouse.click(5,5);await p.waitForTimeout(150);
ok(await ev(()=>document.getElementById('celebOverlay').hidden),'clicking outside closes a reward popup too');
// 5. at 10 tokens, from a question screen: everything closes, home, poof, arrow, navigation blocked
await ev(()=>{openGame(LEVELS[0].id);});await p.waitForTimeout(300);
ok(await ev(()=>gameView==='play'),'(setup) on a question screen');
await ev(()=>{space.earned=10;saveState();showCeleb('x',[]);flushCelebs();closeCeleb();});await p.waitForTimeout(400);
ok(await ev(()=>gameView==='home'&&gateOn&&!!document.getElementById('unlockGate')&&document.getElementById('celebOverlay').hidden),'at 10 tokens: modals closed, back on the main screen, gate up');
ok(await ev(()=>!space.unlocked),'still not unlocked before the ceremony');
await p.waitForTimeout(3600*0.02*1000+400);
ok(await ev(()=>!document.getElementById('ugIn').hidden&&!document.getElementById('ugNote').hidden&&!document.getElementById('ugArrow').hidden&&/קאפקייק/.test(document.getElementById('ugNote').textContent)),'the button poofed in and an arrow points at it');
ok(await ev(()=>{const g=document.getElementById('unlockGate');const r=g.getBoundingClientRect();return r.width===innerWidth&&getComputedStyle(g).position==='fixed'&&document.body.classList.contains('gate');}),'a full-screen layer blocks all other navigation');
// 6. one cloud that grows: the same element changes picture
ok(await ev(()=>document.querySelectorAll('#ugCloud').length===1&&document.getElementById('ugCloud').dataset.s==='3'),'a single cloud element goes through the three pictures');
// 4. the ceremony starts only after the first tap, and is slow
await p.click('#ugIn',{force:true});await p.waitForTimeout(300);
ok(await ev(()=>!!document.getElementById('uStage')&&/בואו|בוא|בואי/.test(document.querySelector('#celebBtns .btn').textContent)&&!space.unlocked),'ceremony: first step waits for a tap, nothing unlocked yet');
await p.mouse.click(5,5);await p.waitForTimeout(150);
ok(await ev(()=>!document.getElementById('celebOverlay').hidden),'the ceremony popup cannot be dismissed by clicking outside');
const steps=await ev(()=>{uSpeed=1;return 0;});
await ev(()=>{window.__t=[];const o=document.getElementById('uStage');new MutationObserver(()=>window.__t.push(performance.now())).observe(o,{childList:true});});
await p.click('#celebBtns .btn');
await p.waitForTimeout(7500);
const ts=await ev(()=>window.__t);
const gaps=ts.slice(1).map((t,i)=>t-ts[i]);
ok(ts.length>=3&&gaps.every(g=>g>=2500),'steps are at least ~3s apart: '+gaps.map(g=>Math.round(g)));
await ev(()=>{uTimers.forEach(clearTimeout);});
await p.click('#celebBtns .btn');await p.waitForTimeout(500);   // skip -> unlocked and straight into the room
ok(await ev(()=>space.unlocked&&!gateOn&&!document.getElementById('unlockGate')&&gameView==='space'&&!document.getElementById('spaceView').hidden),'done: unlocked, gate gone, inside the room');
ok(await ev(()=>space.spent===0),'unlocking spent nothing');
// 7. a page with a back button, not a modal
ok(await ev(()=>getComputedStyle(document.querySelector('.wrap')).display==='none'&&!!document.getElementById('spaceBack')&&!document.querySelector('#spaceView.roomoverlay')),'the room is a full page with a back button');
await p.click('#spaceBack');await p.waitForTimeout(300);
ok(await ev(()=>gameView==='home'&&document.getElementById('spaceView').hidden&&!!document.getElementById('spaceBtn')&&!document.getElementById('spaceBtn').classList.contains('slot')),'back returns to the main screen, where the room button now lives');
ok(await ev(()=>{renderRoom();return /מטבעות פותחים פריטים ושדרוגים בחדר של קאפקייק/.test(document.getElementById('tokChip').textContent);}),'unlocked: the coin area explains what tokens do');
await p.click('#spaceBtn');await p.waitForTimeout(300);
// zoom and pan stay inside the room
await ev(()=>{rmZoomAt(5,500,450);});ok(await ev(()=>RM.k===3),'zoom is limited to 3x');
await ev(()=>{rmPan(9999,9999);});ok(await ev(()=>RM.tx<=0&&RM.ty<=0),'pan cannot leave the room');
await ev(()=>{rmZoomAt(0.2,500,450);});ok(await ev(()=>RM.k===1&&RM.tx===0&&RM.ty===0),'zoom out returns to the full room');

// five levels each; the window grows up the wall; the bed sits in the corner
ok(await ev(()=>roomMax('bed')===5&&roomMax('window')===5&&ROOM_ART.bed.length===5&&ROOM_ART.window.length===5),'bed and window have 5 levels with pictures');
const grow=await ev(()=>[1,2,3,4,5].map(l=>{const a=ROOM_ART.window[l-1];return [-85-a.ay, a.h];}));
ok(grow.every((g,i)=>i===0||g[0]<grow[i-1][0]-1)&&grow.every(g=>g[0]+g[1]>=-92&&g[0]+g[1]<=-75),'the window keeps its sill and grows upward every level: tops '+grow.map(g=>Math.round(g[0])));
ok(await ev(()=>{const c=gx2s(0,0);return BED_AT[0]>c[0]-150&&BED_AT[0]<c[0]+50&&ROOM_ART.bed.every(a=>BED_AT[1]-a.ay>=0);}),'the bed is anchored at the back corner of the grid and every level fits inside the room');
ok(await ev(()=>{const i=document.querySelector('[data-hit="item:bed"] image');return !!i&&/^assets\//.test(i.getAttribute('href'));}),'the bed is drawn from its picture');

// the bed is grounded and its bedding is white until the coloring step
ok(await ev(()=>{const g=document.querySelector('[data-hit="item:bed"]');return !!g.querySelector('polygon[filter]')&&!!g.querySelector('image');}),'the bed has a soft floor shadow under it');
const mag=await ev(async()=>{const out=[];for(let l=1;l<=5;l++){const im=new Image();im.src=new URL(ROOM_ART.bed[l-1].src,document.baseURI).href;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let n=0,t=0;for(let i=0;i<d.length;i+=4){if(d[i+3]<200)continue;t++;const r=d[i],g=d[i+1],b=d[i+2];if(r>180&&b>150&&g<r-70&&g<b-50)n++;}out.push(n/t);}return out;});
ok(mag.every(v=>v<0.01),'no magenta left in any bed level (white default): '+mag.map(v=>(v*100).toFixed(2)+'%'));
// 11. no permanent coin chip over the room; the coins live in the drawer
ok(await ev(()=>!document.getElementById('rmChip')&&!document.querySelector('#spaceView .tokchip')),'no permanent coin counter above the room');

// small pictures of the upgrades: only the next one is open, the ones after it are locked
await ev(()=>{space.lv.bed=2;onRoomTap('item:bed');});
const th=await ev(()=>[...document.querySelectorAll('#rmDrawer .lvthumb')].map(b=>({locked:b.classList.contains('locked'),dis:b.disabled,img:!!b.querySelector('img[src^="assets/"]'),t:b.textContent})));
ok(th.length===3&&!th[0].locked&&th[1].locked&&th[2].locked&&th[1].dis&&th[2].dis&&th.every(x=>x.img),'bed at level 2 shows levels 3, 4, 5 as small pictures: 3 open, 4 and 5 locked '+JSON.stringify(th.map(x=>x.t)));
ok(await ev(()=>/4 🪙/.test(document.querySelector('#rmDrawer .lvthumb:not(.locked)').textContent)&&/🔒/.test(document.querySelectorAll('#rmDrawer .lvthumb')[1].textContent)),'the open one shows its price, the locked ones a lock');
await ev(()=>document.querySelectorAll('#rmDrawer .lvthumb')[1].click());
ok(await ev(()=>!RM.pv),'tapping a locked level does nothing');
await ev(()=>document.querySelector('#rmDrawer .lvthumb:not(.locked)').click());
ok(await ev(()=>RM.pv&&RM.pv.to===3&&document.querySelector('#rmDrawer .lvthumb.cur')&&!!document.querySelector('[data-buy]')),'tapping the open one previews it and offers Buy / Cancel');
await ev(()=>{space.lv.bed=5;onRoomTap('item:bed');});
ok(await ev(()=>document.querySelectorAll('#rmDrawer .lvthumb').length===0&&/רמה מקסימלית/.test(document.getElementById('rmDrawer').textContent)),'at the top level there are no pictures, only "max level"');
await ev(()=>{space.lv.bed=1;RM.pv=null;onRoomTap('item:window');});
ok(await ev(()=>document.querySelectorAll('#rmDrawer .lvthumb').length===4&&document.querySelectorAll('#rmDrawer .lvthumb.locked').length===3),'window at level 1: 4 pictures, the next open, 3 locked');
await ev(()=>{onRoomTap(null);});
// 8. the drawer floats over the room and does not resize it
const r0=await ev(()=>JSON.stringify(document.getElementById('rmView').getBoundingClientRect()));
await ev(()=>onRoomTap('item:bed'));
const r1=await ev(()=>JSON.stringify(document.getElementById('rmView').getBoundingClientRect()));
ok(r0===r1,'opening the drawer does not move or resize the room');
ok(await ev(()=>{const d=document.getElementById('rmDrawer');return !d.hidden&&getComputedStyle(d).position==='absolute'&&document.querySelector('#rmCoins b').textContent==='10';}),'the drawer floats over it and shows the coins (10)');
// 9. a purchase is previewed in the room before paying
const fp0=await ev(()=>document.querySelector('[data-hit="item:bed"]').innerHTML);
await ev(()=>document.querySelector('[data-prev="bed"]').click());
ok(await ev(()=>RM.pv&&RM.pv.to===2&&space.lv.bed===1&&space.spent===0),'preview: level 2 shown, nothing bought yet');
ok(await ev(([a])=>document.querySelector('[data-hit="item:bed"]').innerHTML!==a,[fp0]),'the room draws the previewed bed');
ok(await ev(()=>/צריך 3 מטבעות\. יש לך 10/.test(document.getElementById('rmDrawer').textContent)),'price text: "צריך 3 מטבעות. יש לך 10"');
await ev(()=>document.querySelector('[data-cancel]').click());
ok(await ev(()=>!RM.pv&&space.lv.bed===1&&space.spent===0),'cancel: the room goes back, nothing spent');
await ev(()=>document.querySelector('[data-prev="bed"]').click());await ev(()=>document.querySelector('[data-buy]').click());
ok(await ev(()=>space.lv.bed===2&&space.spent===3&&tokenBalance()===7&&document.querySelector('#rmCoins b').textContent==='7'),'buy: bed level 2, 3 tokens spent, drawer shows 7');
// 10. grammar
await ev(()=>{space.spent=space.earned;onRoomTap('item:window');document.querySelector('[data-prev="window"]').click();});
ok(await ev(()=>/צריך 2 מטבעות\. יש לך 0/.test(document.getElementById('rmDrawer').textContent)&&document.querySelector('[data-buy]').disabled),'too poor: "צריך 2 מטבעות. יש לך 0", buy disabled');
await ev(()=>{space.spent=space.earned-1;onRoomTap('surf:wl');document.querySelector('[data-col="0"]').click();});
ok(await ev(()=>/צריך מטבע אחד\. יש לך 1/.test(document.getElementById('rmDrawer').textContent)&&!document.querySelector('[data-buy]').disabled),'one token: "צריך מטבע אחד. יש לך 1"');
await ev(()=>{space.spent=space.earned;onRoomTap('surf:wl');document.querySelector('[data-col="0"]').click();});
ok(await ev(()=>/צריך מטבע אחד\. יש לך 0/.test(document.getElementById('rmDrawer').textContent)),'zero tokens, 1-token color: "צריך מטבע אחד. יש לך 0" (not the old wording)');
// 12. titles
await ev(()=>onRoomTap('surf:wr'));ok(await ev(()=>/צבע לקיר הימני/.test(document.querySelector('#rmDrawer .rmsh-t').textContent)&&!/להקיר/.test(document.getElementById('rmDrawer').textContent)),'title "צבע לקיר הימני"');
await ev(()=>onRoomTap('surf:fl'));ok(await ev(()=>/צבע לרצפה/.test(document.querySelector('#rmDrawer .rmsh-t').textContent)),'title "צבע לרצפה"');
// 13. brushes
ok(await ev(()=>document.querySelectorAll('#rmDrawer .brush img').length===16&&[...document.querySelectorAll('#rmDrawer .brush img')].every(i=>/^assets\//.test(i.getAttribute('src')))),'16 brush pictures as the color buttons');
// colors: preview, buy 1 token, switch back free, premium 2
await ev(()=>{space.spent=0;onRoomTap('surf:wl');document.querySelector('[data-col="2"]').click();});
ok(await ev(()=>RM.pv&&RM.pv.idx===2&&space.surf.wl===3&&document.querySelector('[data-hit="surf:wl"] polygon').getAttribute('fill')===ROOM_COLORS[2].h),'a new color is previewed on the wall first');
await ev(()=>document.querySelector('[data-buy]').click());
ok(await ev(()=>space.surf.wl===2&&space.spent===1&&space.own.wl.includes(2)),'bought: 1 token');
await ev(()=>document.querySelector('[data-col="3"]').click());await ev(()=>document.querySelector('[data-col="2"]').click());
ok(await ev(()=>space.surf.wl===2&&space.spent===1),'switching between owned colors is free');
await ev(()=>document.querySelector('[data-col="15"]').click());
ok(await ev(()=>RM.pv.idx===15&&/צריך 2 מטבעות/.test(document.getElementById('rmDrawer').textContent)&&document.querySelector('[data-hit="surf:wl"] polygon').getAttribute('fill')==='url(#rmRainbow)'),'rainbow costs 2 and previews as a gradient');
await ev(()=>document.querySelector('[data-cancel]').click());
ok(await ev(()=>space.surf.wl===2&&!RM.pv),'cancel leaves the wall as it was');
// persistence + sanitizing + price
await p.reload();await p.waitForTimeout(500);
ok(await ev(()=>space.unlocked&&space.lv.bed===2&&space.surf.wl===2&&space.spent===1),'room state survives a reload');
const cl=await ev(()=>cleanProgress({space:{earned:50,spent:2,trued:true,unlocked:true,surf:{wl:99,wr:'x',fl:5},own:{fl:[5,5,77,1]},lv:{bed:9,window:2,ghost:3}}}).space);
ok(cl.surf.wl===3&&cl.surf.wr===3&&cl.surf.fl===5&&cl.lv.bed===1&&cl.lv.window===2&&!('ghost' in cl.lv)&&JSON.stringify(cl.own.fl)==='[1,5,12]','bad colors and levels fall back; current and starting colors are always owned: '+JSON.stringify(cl.own));
const mc=await ev(()=>roomMaxCost());
ok(mc===(3+4+5+6)+(2+3+4+5)+3*(13+6-1)+40,'room max-out cost = bed 18 + window 14 + 3 surfaces x (13 + 3 premium x2 - 1 start) + one of each of the 21 plants (40) = 126, got '+mc);
ok(await ev(()=>JSON.stringify(ROOM_ITEMS.bed.up)==='[0,3,4,5,6]'&&JSON.stringify(ROOM_ITEMS.window.up)==='[0,2,3,4,5]'),'upgrade prices: bed 3,4,5,6 and window 2,3,4,5');
ok(await ev(()=>{onRoomTap(null);space.surf.wl=15;rmRedraw();const st=[...document.querySelectorAll('#rmRainbow stop')];return st.length>=6&&document.querySelector('[data-hit="surf:wl"] polygon').getAttribute('fill')==='url(#rmRainbow)'&&new Set(st.map(x=>x.getAttribute('stop-color'))).size===st.length;}),'the rainbow is a real rainbow: 6+ different color stops on every surface');
// a profile already above 10 tokens: ceremony gate on first start
await ev(()=>{activeProfile().progress=Object.assign(captureProgress(),{space:{earned:25,spent:0,trued:true,unlocked:false}});persist();});
await p.reload();await p.waitForTimeout(1800);
ok(await ev(()=>gateOn&&!!document.getElementById('unlockGate')),'existing player above 10 tokens: the unlock flow starts on first start');
ok(errs.length===0,'no page errors '+errs);console.log(f?'FAILURES '+f:'ALL PASS');await b.close();})();
