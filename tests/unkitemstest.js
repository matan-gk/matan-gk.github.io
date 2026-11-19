// things of an item this build does not know are kept (not drawn, not counted), so an older build cannot delete what a newer build bought
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:1100,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
ok(await ev(()=>CLOUD_DOC_V>=5),'sync format 5 or later (space.unk)');
const r=await ev(()=>{const known={k:'teddy',x:2,y:2,u:'k1'};
  const raw={earned:50,spent:10,unlocked:true,things:[known,{k:'zzfuture1',x:6,y:6,u:'u1',c:4},{k:'zzwall',x:-1,y:-1,u:'u2',wl:{s:'r',a:200,h:300}},{k:'star',x:-1,y:-1,u:'s1',on:{h:'u1',dx:0,dy:0}},{k:'x'.repeat(60),u:'long'},{k:'zzbig',u:'big',pad:'y'.repeat(600)},5,null]};
  const o=spaceClean(raw,['🍪'],0), again=spaceClean(JSON.parse(JSON.stringify(o)),['🍪'],0);
  return {things:o.things.map(t=>t.k),unk:(o.unk||[]).map(t=>t.k),unk2:(again.unk||[]).map(t=>t.k),same:JSON.stringify(o.unk)===JSON.stringify(again.unk),spent:o.spent,
    c1:(o.unk||[]).find(t=>t.k==='zzfuture1'),w:(o.unk||[]).find(t=>t.k==='zzwall')};});
ok(r.things.length===1&&r.things[0]==='teddy','only the known item is a thing of this room ('+r.things+')');
ok(r.unk.includes('zzfuture1')&&r.unk.includes('zzwall'),'unknown items are kept ('+r.unk+')');
ok(r.unk.includes('star'),'a thing standing on an unknown item stays with it');
ok(!r.unk.includes('zzbig')&&!r.unk.some(k=>k.length>40),'oversized or malformed entries are not kept');
ok(r.c1&&r.c1.x===12&&r.c1.c===4&&r.w&&r.w.wl&&r.w.wl.a===200,'kept as they were, field by field');
ok(r.same&&r.unk2.length===r.unk.length,'a second load and save changes nothing');
ok(r.spent===10,'the money spent on them is not touched');
// the item becomes known (a newer build): it comes back as a real thing, with its place
const back=await ev(()=>{ROOM_CATALOG.push({id:'zzfuture1',n:'x',p:3,g:'play',fw:2,fd:2,src:catOf('teddy').src,r:catOf('teddy').r});
  const o=spaceClean({earned:50,spent:10,unlocked:true,things:[],unk:[{k:'zzfuture1',x:6,y:6,u:'u1',c:0},{k:'star',x:-1,y:-1,u:'s1',on:{h:'u1',dx:0,dy:0}}]},['🍪'],0);
  return {things:o.things.map(t=>t.k+':'+t.x+','+t.y),unk:o.unk||[]};});
ok(back.things.includes('zzfuture1:12,12')&&back.unk.length===0,'once the item is known it is a normal thing again at its place ('+back.things+')');
// through the real save and load
await ev(()=>{space=spaceClean({earned:50,spent:0,unlocked:true,things:[{k:'zzfuture9',x:4,y:4,u:'q9'}]},['🍪'],0);saveState();});
await p.reload();
ok(await ev(()=>Array.isArray(space.unk)&&space.unk.some(t=>t.k==='zzfuture9')),'survives a save and a reload');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
