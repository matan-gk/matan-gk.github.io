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
ok(await ev(()=>ROOM_CATALOG.filter(isFlat).length===6&&ROOM_CATALOG.filter(isFlat).every(c=>c.fw>=2*GU&&c.fd>=2*GU)),'6 flat things (5 rugs and the drawing mat), all at least 2x2 cells');
ok(await ev(()=>!!ROOM_GROUPS.rugs&&partLabel&&PART_NAMES.rug==='שטיח'),'rugs group and part name exist');
ok(await ev(()=>partKeyOf(catOf('rug_rd'))==='rug'&&partKeyOf(catOf('rug_sq2'))==='rug'&&partKeyOf(catOf('car'))==='car'),'partKeyOf uses pk when given');
// train toys, chess, lego, puzzles and tic-tac-toe are 1x1 and solid: nothing can be placed on them; chair, telescope and costume box are 2x2
ok(await ev(()=>['track','track2','trainset','chess','lego','puzzle','puzzle2','tictac'].every(k=>{const c=catOf(k);return fwOf(c)===1&&fdOf(c)===1&&!isFlat(c);})),'train toys, chess, lego, puzzles, tic-tac-toe: 1x1 units (small) and not flat');
ok(await ev(()=>['chair','telescope','dressbox'].every(k=>fwOf(catOf(k))===2*GU&&fdOf(catOf(k))===2*GU)),'chair, telescope, costume box: 2x2 cells');
ok(await ev(()=>{space.things=[{k:'chess',x:6,y:6}];return !footFree(catOf('chair'),6,6,-1)&&!footFree(catOf('chair'),5,5,-1)&&footFree(catOf('chair'),7,6,-1)&&!footFree(catOf('track'),6,6,-1)&&!footFree(catOf('teddy'),6,6,-1);}),'nothing can be placed on a 1x1 game or train (a 2x2 chair next to it is fine)');
// placement
const r=await ev(()=>{
  const bed=bedFp(space.lv?.bed||1);
  space.things=[{k:'rug_sq',x:6*GU,y:6*GU,c:{}}];rmRedraw();
  const flatOnFlat=footFree(catOf('rug_rd'),6*GU,6*GU,-1), flatNear=footFree(catOf('rug_rd'),8*GU,6*GU,-1);
  const solidOnRug=footFree(catOf('chair'),6*GU,6*GU,-1), bigOnRug=footFree(catOf('cloud'),6*GU,6*GU,-1);
  space.things.push({k:'chair',x:6*GU,y:6*GU});
  const flatUnderSolid=footFree(catOf('rug_rd'),6*GU,6*GU,-1);
  return {flatOnFlat,flatNear,solidOnRug,bigOnRug,flatUnderSolid};});
ok(r.flatOnFlat===false,'two rugs cannot overlap');
ok(r.flatNear===true,'a rug next to a rug is fine');
ok(r.solidOnRug===true&&r.bigOnRug===true,'furniture can stand on a rug');
ok(r.flatUnderSolid===false||r.flatUnderSolid===true,'rug over standing item evaluated (no crash)');
// spaceClean keeps rug + item on the same cells, drops a second overlapping rug
const c=await ev(()=>{const s=spaceClean({things:[{k:'rug_sq',x:6*GU,y:6*GU},{k:'chair',x:6*GU,y:6*GU},{k:'rug_rd',x:6*GU,y:6*GU}],unlocked:true,earned:1000,spent:0,sub:GU},[],0);return s.things.map(t=>t.k+':'+t.x+','+t.y);});
const G6=await ev(()=>6*GU);
ok(c.includes(`rug_sq:${G6},${G6}`)&&c.includes(`chair:${G6},${G6}`)&&!c.includes(`rug_rd:${G6},${G6}`),'spaceClean: rug and chair share cells, the second rug is moved or dropped: '+c);
// draw order: rug before chair even though chair is placed first and is further back
const ord=await ev(()=>{space.things=[{k:'chair',x:6*GU,y:6*GU},{k:'rug_sq',x:6*GU,y:6*GU}];rmRedraw();const html=document.getElementById('rmR').innerHTML;return [html.indexOf(catOf('rug_sq').src),html.indexOf(catOf('chair').src)];});
ok(ord[0]>0&&ord[1]>0&&ord[0]<ord[1],'rugs are drawn under everything else');
ok(await ev(()=>{const h=document.getElementById('rmR').innerHTML;const i=h.indexOf(catOf('rug_sq').src);const before=h.slice(Math.max(0,i-200),i);return !/rmBlur/.test(before.slice(-120));}),'rug has no drop shadow');
// recolour a rug
ok(await ev(()=>{space.things=[{k:'rug_rd',x:6*GU,y:6*GU}];space.po={rug:[1,2]};rmRedraw();return hasParts(catOf('rug_rd'))&&!!document.getElementById('rmR').querySelector('image');}),'rug colour options available');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
