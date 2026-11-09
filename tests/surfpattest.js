// patterns on the walls and the floor (and the new bed patterns): offered per surface, bought, saved, drawn in perspective
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:1100,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=500;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();});
ok(await ev(()=>ROOM_PATTERNS.length>=40&&new Set(ROOM_PATTERNS.map(q=>q.id)).size===ROOM_PATTERNS.length&&new Set(ROOM_PATTERNS.map(q=>q.src)).size===ROOM_PATTERNS.length),'the patterns are all different');
ok(await ev(()=>ROOM_PATTERNS.every(q=>q.parts.length&&q.parts.every(k=>['wl','wr','fl','bed.blanket','bed.sheet','bed.curtain'].includes(k)))),'every pattern is offered somewhere known');
ok(await ev(()=>{const on=k=>ROOM_PATTERNS.filter(q=>q.parts.includes(k)).map(q=>q.id);return on('fl').includes('parquet')&&!on('wl').includes('parquet')&&on('wl').includes('skyclouds')&&!on('fl').includes('skyclouds');}),'wood floors only on the floor, wall patterns only on walls');
// the drawer
await ev(()=>{RM.sel={t:'surf',k:'wl'};rmRedraw();renderDrawer();});
const nWall=await ev(()=>document.querySelectorAll('#rmDrawer [data-col]').length);
ok(nWall===await ev(()=>ROOM_COLORS.length+ROOM_PATTERNS.filter(q=>q.parts.includes('wl')).length),'the wall palette has the colours and its patterns');
await ev(()=>document.querySelector('[data-col="p:skyclouds"]').click());
ok(await ev(()=>RM.pv&&RM.pv.idx==='p:skyclouds'&&!!document.querySelector('#rmSvg pattern#rmP_wl')&&document.querySelector('#rmR [data-hit="surf:wl"] polygon').getAttribute('fill')==='url(#rmP_wl)'),'tapping a new pattern previews it on the wall');
ok(await ev(()=>/matrix\(-440 220 0 440 500 400\)/.test(document.querySelector('#rmP_wl').getAttribute('patternTransform'))),'laid in the left wall\'s perspective');
const bal=await ev(()=>tokenBalance());
await ev(()=>document.querySelector('[data-buy]').click());
ok(await ev(()=>space.surf.wl==='p:skyclouds'&&space.own.wl.includes('p:skyclouds')),'bought');
ok(await ev(()=>tokenBalance())===bal-2,'for its price');
await ev(()=>{RM.sel={t:'surf',k:'wr'};rmRedraw();renderDrawer();document.querySelector('[data-col="p:balloons"]').click();document.querySelector('[data-buy]').click();});
ok(await ev(()=>/matrix\(440 220 0 440 500 400\)/.test(document.querySelector('#rmP_wr').getAttribute('patternTransform'))),'the right wall is laid the other way');
await ev(()=>{RM.sel={t:'surf',k:'fl'};rmRedraw();renderDrawer();document.querySelector('[data-col="p:parquet"]').click();document.querySelector('[data-buy]').click();});
ok(await ev(()=>/matrix\(300 150 -300 150 500 400\)/.test(document.querySelector('#rmP_fl').getAttribute('patternTransform'))),'the floor pattern follows the floor\'s axes');
// switching back and forth is free
await ev(()=>{document.querySelector('[data-col="3"]').click();});
const b2=await ev(()=>tokenBalance());
await ev(()=>{document.querySelector('[data-col="p:parquet"]').click();});
ok(await ev(()=>space.surf.fl==='p:parquet')&&await ev(()=>tokenBalance())===b2,'an owned pattern switches for free');
// bed parts
ok(await ev(()=>optsFor('bed.blanket').includes('p:b_dinos')&&!optsFor('bed.blanket').includes('p:dots')&&!optsFor('bed.blanket').includes('p:parquet')),'the bed has its own patterns, not the wall ones');
ok(await ev(()=>ROOM_PATTERNS.filter(q=>q.parts.some(k=>k.startsWith('bed.'))).every(q=>q.parts.every(k=>k.startsWith('bed.')))&&ROOM_PATTERNS.filter(q=>q.id.startsWith('b_')).length===16),'a pattern is for the bed or for the walls and floor, never both; 16 new bed patterns');
// what was bought for one wall or the floor is owned on all three
ok(await ev(()=>['wl','wr','fl'].every(k=>space.own[k].includes('p:skyclouds')&&space.own[k].includes('p:balloons')&&space.own[k].includes('p:parquet'))),'a pattern bought for one surface is owned on all three');
await ev(()=>{RM.sel={t:'surf',k:'wr'};rmRedraw();renderDrawer();});
const b3=await ev(()=>tokenBalance());
await ev(()=>{document.querySelector('[data-col="p:skyclouds"]').click();});
ok(await ev(()=>space.surf.wr==='p:skyclouds')&&await ev(()=>tokenBalance())===b3,'and is free to use on another wall');
await ev(()=>{RM.sel={t:'surf',k:'fl'};rmRedraw();renderDrawer();document.querySelector('[data-col="9"]').click();document.querySelector('[data-buy]').click();});
ok(await ev(()=>space.own.wl.includes(9)&&space.own.wr.includes(9)),'colours are shared the same way');
// save and load
const rt=await ev(()=>{const s=spaceClean(JSON.parse(JSON.stringify(space)),[],0);return [s.surf.wl,s.surf.wr,s.surf.fl,s.own.fl.join()].join('|');});
ok(rt.startsWith('p:skyclouds|p:skyclouds|9|')&&rt.includes('p:parquet'),'patterns survive saving and loading '+rt);
ok(await ev(()=>{const s=spaceClean({earned:1,surf:{wl:'p:parquet',wr:'p:nonsense',fl:'p:skyclouds'}},[],0);return s.surf.wl===ROOM_DEFAULT.wl&&s.surf.wr===ROOM_DEFAULT.wr&&s.surf.fl===ROOM_DEFAULT.fl;}),'a pattern that is not offered on that surface is refused');
ok(await ev(()=>roomMaxCost()>0),'the total price still adds up');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
