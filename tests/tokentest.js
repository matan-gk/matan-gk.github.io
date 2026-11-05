const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
await p.evaluate(()=>{delete LAYERS['✨'];});
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=n])');await p.click('[data-pact=save]');await p.waitForTimeout(300);
// tiers: 0 none, 1 coin, 10 stack, 50 pile, 100 bag, 300+ chest
const tiers=await p.evaluate(()=>[0,1,9,10,49,50,99,100,299,300,5000].map(n=>tokenTier(n)));
ok(JSON.stringify(tiers)==='[null,"coin","coin","stack","stack","pile","pile","bag","bag","chest","chest"]','tier by balance: '+JSON.stringify(tiers));
ok(await p.evaluate(()=>['coin','stack','pile','bag','chest'].every(k=>/^assets\//.test(TOKEN_IMG[k]))),'five token pictures, all as files');
// a new player starts at zero
ok(await p.evaluate(()=>tokenBalance()===0&&space.trued===true),'new player: 0 tokens');
// one token per merge, shown in the result and in the room
await p.evaluate(()=>{collection=Array(23).fill('✨');saveState();renderRewards();doMerge('✨');});await p.waitForTimeout(1300);
ok(await p.evaluate(()=>tokenBalance()===1&&!!document.getElementById('tokNew')&&document.querySelector('#tokNew .tokimg').dataset.tier==='coin'),'a merge gives +1 token, shown with the coin picture');
await p.evaluate(()=>{closeCeleb();doMerge('✨');});await p.waitForTimeout(1300);await p.evaluate(()=>closeCeleb());
ok(await p.evaluate(()=>tokenBalance()===2&&golden.length===2),'second merge: 2 tokens');
await p.evaluate(()=>openRoom());
ok(await p.evaluate(()=>document.getElementById('tokN').textContent==='2'&&!!document.querySelector('#tokChip .tokimg')),'gift room shows the balance');
await p.screenshot({path:'tok_room.png'});
// persists and counts are never derived from the upgraded list
await p.reload();await p.evaluate(()=>{delete LAYERS['✨'];});
ok(await p.evaluate(()=>space.earned===2&&space.spent===0),'tokens survive a reload');
await p.evaluate(()=>{golden=golden.slice(0,1);saveState();});
ok(await p.evaluate(()=>tokenBalance()===2),'earned is a stored counter: not derived from the upgraded list');
// one-time true-up for existing players
const tu=await p.evaluate(()=>{
  const old=cleanProgress({golden:['🍦','🍦','🍩'],legacyLooks:2});
  const again=cleanProgress(old);
  const had=cleanProgress({golden:['🍦'],space:{earned:50,trued:true}});
  const bad=cleanProgress({space:{earned:-4,spent:'x',trued:true}});
  const over=cleanProgress({space:{earned:3,spent:9,trued:true}});
  return {a:old.space,b:again.space,c:had.space,d:bad.space,e:over.space};});
ok(tu.a.earned===23&&tu.a.trued,'true-up: 3 upgraded + 2 looks x 10 = 23 '+JSON.stringify(tu.a));
ok(tu.b.earned===23,'true-up happens once (no double counting)');
ok(tu.c.earned===50,'already trued: kept as stored');
ok(tu.d.earned===0&&tu.d.spent===0,'bad values become 0');
ok(tu.e.spent===3,'spent never exceeds earned');
ok(await p.evaluate(()=>'space' in captureProgress()),'tokens are part of the saved progress');
// save code round trip keeps tokens
const rt=await p.evaluate(()=>{const c=cleanProgress({golden:[],space:{earned:77,spent:5,trued:true}});applyProgress(c);return tokenBalance();});
ok(rt===72,'applyProgress restores the balance');
ok(errs.length===0,'no page errors '+errs);console.log(f?'FAILURES '+f:'ALL PASS');await b.close();})();
