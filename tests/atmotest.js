// the room's light and trim: drawn over walls/floor, never takes a touch, follows the colours, toggle per device
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:1100,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=1000;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();});
ok(await ev(()=>atmoOn()),'on by default');
ok(await ev(()=>document.querySelectorAll('#rmSvg g.atmo').length===3&&!!document.getElementById('atEnts')),'shell, light and overlay groups exist; things sit in the graded group');
ok(await ev(()=>[...document.querySelectorAll('#rmSvg g.atmo')].every(g=>g.getAttribute('pointer-events')==='none')),'all layers ignore touches');
ok(await ev(()=>{const r=document.getElementById('rmSvg').getBoundingClientRect(),e=document.elementFromPoint(r.left+r.width*.5,r.top+r.height*.75);return !e.closest('.atmo');}),'a touch on the floor reaches the floor, not the layer');
// colours
const cols=await ev(()=>{const o=[];for(let i=0;i<ROOM_COLORS.length;i++){const s=atmoShell(i,i,i);o.push(!/NaN|undefined/.test(s));}o.push(!/NaN|undefined/.test(atmoShell('p:'+ROOM_PATTERNS[0].id,0,0)));return o;});
ok(cols.every(Boolean),'every colour, rainbow and a pattern give valid output');
ok(await ev(()=>atmoMilk(ROOM_COLORS.length-1)>atmoMilk(0)),'rainbow gets the strongest milky layer');
// window light
ok(await ev(()=>atmoLight(null,1)===''),'no window, no light');
ok(await ev(()=>atmoLight(winAtFor(1,space.fix.window),1).includes('atBeam')),'window gives a beam');
// toggle
await p.click('#rmAtmo');
ok(await ev(()=>!atmoOn()&&!document.querySelector('#rmSvg .atmo')&&!document.getElementById('atEnts')),'toggle off removes everything');
ok(await ev(()=>localStorage.getItem('cq_atmo')==='0'&&!!document.querySelector('#rmSvg [data-hit="item:bed"]')),'saved per device; room still drawn');
await p.click('#rmAtmo');
ok(await ev(()=>atmoOn()&&document.querySelectorAll('#rmSvg g.atmo').length===3),'toggle on again');
// speed
ok(await ev(()=>{const t=performance.now();for(let i=0;i<10;i++)rmRedraw();return (performance.now()-t)/10<20;}),'redraw stays fast');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
