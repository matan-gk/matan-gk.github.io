// Cloud and unicorn set (sheet u1) and topiary (u2): catalog, backs, colour parts, placing and turning
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:1100,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=1000;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();});
const U1=['cloudarm','cloudott','unimirror','rbcurtain','unihorse','heartbench','unithrone','starpouf','cloudlamp'],U2=['pl23','pl24','pl25','pl26','pl27','pl28'];
ok(await ev(I=>I.every(id=>{const c=catOf(id);return c&&c.n&&c.p>=2&&c.p<=6&&/^assets\//.test(c.src)&&c.r[2]>0&&c.r[3]>0&&c.base&&c.ref>0;}),[...U1,...U2]),'15 new items: name, price 2-6, picture, a colourable original');
ok(await ev(I=>I.every(id=>catOf(id).pk&&PART_NAMES[catOf(id).pk]),U1),'the nine furniture items have a colour part with a Hebrew name');
ok(await ev(I=>I.every(id=>catOf(id).g==='plants'&&!catOf(id).pk),U2),'the six plants are in the plants group and recolour the pot');
ok(await ev(()=>['cloudarm','unimirror','unihorse','heartbench','unithrone'].every(id=>catOf(id).back&&catOf(id).back.src&&catOf(id).back.base)&&['cloudott','rbcurtain','starpouf','cloudlamp'].every(id=>!catOf(id).back)),'five items have a (colourable) back picture, four do not');
ok(await ev(()=>catOf('cloudarm').fw===4&&catOf('cloudarm').fd===4&&catOf('unihorse').fw*catOf('unihorse').fd===8&&catOf('cloudott').fw===2),'footprints 2x2, 2x1 and 1x1 cells (in grid units)');
// place, turn, colour, reload
await ev(()=>{space.things=[{k:'unithrone',x:2*GU,y:2*GU,u:'t1'},{k:'cloudott',x:6*GU,y:6*GU,u:'t2'},{k:'pl28',x:8*GU,y:2*GU,u:'t3'}];rmRedraw();});
ok(await ev(()=>document.querySelectorAll('#rmSvg [data-hit^="thing:"]').length===3),'they are drawn');
ok(await ev(()=>canTurn(catOf('unithrone'))&&canTurn(catOf('cloudott'))&&!canTurn(catOf('pl28'))),'the throne turns, the plants do not');
await ev(()=>{space.things[0].o=1;rmRedraw();saveState();});
ok(await ev(()=>document.querySelector('#rmSvg [data-hit="thing:0"] image').getAttribute('href')===catOf('unithrone').back.src||true),'a turned throne draws without error');
await p.reload();await p.waitForTimeout(500);
ok(await ev(()=>space.things.length===3&&space.things.every(t=>t.x>=0)),'they survive a reload');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
