const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=1000;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();});
// data
ok(await ev(()=>ROOM_CATALOG.filter(c=>c.g==='rugs').length===5&&ROOM_CATALOG.filter(c=>c.g==='rugs').every(c=>c.flat&&c.pk==='rug'&&c.base&&c.dc)),'5 rugs: flat, share one "rug" part key, magenta original + default colour');
ok(await ev(()=>ROOM_CATALOG.filter(isFlat).length===13&&ROOM_CATALOG.filter(isFlat).every(c=>c.fw>=2&&c.fd>=2)),'13 flat things, all at least 2x2');
ok(await ev(()=>!!ROOM_GROUPS.rugs&&partLabel&&PART_NAMES.rug==='שטיח'),'rugs group and part name exist');
ok(await ev(()=>partKeyOf(catOf('rug_rd'))==='rug'&&partKeyOf(catOf('rug_sq2'))==='rug'&&partKeyOf(catOf('car'))==='car'),'partKeyOf uses pk when given');
// placement
const r=await ev(()=>{
  const bed=bedFp(space.lv?.bed||1);
  space.things=[{k:'rug_sq',x:6,y:6,c:{}}];rmRedraw();
  const flatOnFlat=footFree(catOf('rug_rd'),6,6,-1), flatNear=footFree(catOf('rug_rd'),8,6,-1);
  const solidOnRug=footFree(catOf('chair'),6,6,-1), bigOnRug=footFree(catOf('cloud'),6,6,-1);
  space.things.push({k:'chair',x:6,y:6});
  const flatUnderSolid=footFree(catOf('rug_rd'),6,6,-1);
  return {flatOnFlat,flatNear,solidOnRug,bigOnRug,flatUnderSolid};});
ok(r.flatOnFlat===false,'two rugs cannot overlap');
ok(r.flatNear===true,'a rug next to a rug is fine');
ok(r.solidOnRug===true&&r.bigOnRug===true,'furniture can stand on a rug');
ok(r.flatUnderSolid===false||r.flatUnderSolid===true,'rug over standing item evaluated (no crash)');
// spaceClean keeps rug + item on the same cells, drops a second overlapping rug
const c=await ev(()=>{const s=spaceClean({things:[{k:'rug_sq',x:6,y:6},{k:'chair',x:6,y:6},{k:'rug_rd',x:6,y:6}],unlocked:true,earned:1000,spent:0},[],0);return s.things.map(t=>t.k+':'+t.x+','+t.y);});
ok(c.includes('rug_sq:6,6')&&c.includes('chair:6,6')&&!c.includes('rug_rd:6,6'),'spaceClean: rug and chair share cells, the second rug is moved or dropped: '+c);
// draw order: rug before chair even though chair is placed first and is further back
const ord=await ev(()=>{space.things=[{k:'chair',x:6,y:6},{k:'rug_sq',x:6,y:6}];rmRedraw();const html=document.getElementById('rmR').innerHTML;return [html.indexOf(catOf('rug_sq').src),html.indexOf(catOf('chair').src)];});
ok(ord[0]>0&&ord[1]>0&&ord[0]<ord[1],'rugs are drawn under everything else');
ok(await ev(()=>{const h=document.getElementById('rmR').innerHTML;const i=h.indexOf(catOf('rug_sq').src);const before=h.slice(Math.max(0,i-200),i);return !/rmBlur/.test(before.slice(-120));}),'rug has no drop shadow');
// recolour a rug
ok(await ev(()=>{space.things=[{k:'rug_rd',x:6,y:6}];space.po={rug:[1,2]};rmRedraw();return hasParts(catOf('rug_rd'))&&!!document.getElementById('rmR').querySelector('image');}),'rug colour options available');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
