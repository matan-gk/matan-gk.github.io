const T=require('../lib.js');
const {chromium}=require('playwright');const fs=require('fs');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
const srv={fams:{},users:{},legacy:{},reports:[],reads:0,writes:0};
const F=id=>srv.fams[id]||(srv.fams[id]={});
const clone=o=>JSON.parse(JSON.stringify(o));
async function handle(op,a){
  if(op==='getFamily') return (srv.users[a.uid]||{}).fid||'';
  if(op==='setFamily'){ srv.users[a.uid]={fid:a.fid}; return; }
  if(op==='clearFamily'){ delete srv.users[a.uid]; return; }
  if(op==='list'){ return clone(Object.entries(F(a.fid)).map(([id,v])=>Object.assign({id},v))); }
  if(op==='put'){ const cur=F(a.fid)[a.id]; if(cur&&cur.u!==a.doc.b) return {conflict:true}; if(!(a.doc.v>=2)||(cur&&a.doc.v<cur.v)) return {conflict:true}; F(a.fid)[a.id]=clone(a.doc); srv.writes++; return {ok:true}; }
  if(op==='wipe'){ srv.fams[a.fid]={}; return; }
  if(op==='legacyList'){ return []; }
  if(op==='legacyDelete'){ return; }
  if(op==='report'){ return; }
}
(async()=>{
const b=await chromium.launch({...T.launchOpts});
const init=fs.readFileSync(T.p('cloud/mock_init.js'),'utf8');
const ctx=await b.newContext({viewport:{width:390,height:844}}); const A=await ctx.newPage(); A.errs=[]; A.on('pageerror',e=>A.errs.push(e.message));
await A.exposeFunction('__srv',handle); await A.addInitScript(init);
await A.goto('file://'+T.cloudBuild()); await A.evaluate(()=>localStorage.clear()); await A.reload();
// --- pure functions
const pure=await A.evaluate(()=>({
  a:cloudLoss({space:{earned:3,things:[]}},{score:1}),
  b:cloudLoss({space:{earned:3}},{space:{earned:1}}),
  c:cloudLoss({space:{earned:3}},{space:{earned:3}}),
  d:cloudLoss({space:{earned:0}},{}),
  e:cloudLoss({golden:[1,2]},{golden:[1],space:{}}),
  s:(()=>{ let l=[]; const ps=[{id:'x',name:'n',gender:'n',u:1,progress:{a:1},stats:null}]; for(let i=0;i<12;i++){ ps[0].progress={a:i}; ps[0].u=i; l=snapAdd(l,['x'],'t',ps,i); } const n=l.length; const same=snapAdd(l,['x'],'t',ps,99).length; return [n,same]; })(),
}));
ok(pure.a==='room','room data lost -> room'); ok(pure.b==='tokens','fewer tokens -> tokens'); ok(pure.c==='','same tokens -> fine'); ok(pure.d==='','empty local room never blocks'); ok(pure.e==='golden','fewer rewards -> golden');
ok(pure.s[0]===8&&pure.s[1]===8,'snapshot ring keeps 8 and ignores a repeat');
// --- profile with a room, signed in
await A.evaluate(()=>{CLOUD_LIMITS.pushDelayMs=300;});
await A.fill('#pfName','גאיה'); await A.click('.gopt:has(input[value=f])'); await A.click('[data-pact=save]'); await A.waitForTimeout(300); await A.evaluate(()=>openGame(level));
await A.evaluate(()=>{ space.earned=6; space.unlocked=true; saveState(); persist(); });
await A.evaluate(()=>openProfiles(false)); await A.evaluate(()=>openPanel('backup')); await A.click('[data-pact=bksub][data-id=account]'); await A.click('[data-pact=cloudin]'); await A.waitForTimeout(600);
const fid=(srv.users.u1||{}).fid; const id=Object.keys(srv.fams[fid])[0];
ok(JSON.parse(srv.fams[fid][id].p).space.earned===6,'room reached the cloud');
// --- an old client strips the room and writes back with a newer time
function wipe(){ const d=srv.fams[fid][id]; const p=JSON.parse(d.p); delete p.space; srv.fams[fid][id]=Object.assign({},d,{p:JSON.stringify(p),u:d.u+5000,b:d.u}); }
wipe();
await A.evaluate(()=>cloudSync('manual')); await A.waitForTimeout(600);
ok(await A.evaluate(()=>activeProfile().progress.space.earned)===6,'pull that would drop the room is held: local room kept');
ok(await A.evaluate(()=>cloud.held.length)===1&&await A.locator('[data-pact=heldkeep]').count()>=0,'held list has the profile');
ok(!JSON.parse(srv.fams[fid][id].p).space,'cloud untouched while held');
ok(await A.evaluate(()=>!!localStorage.getItem(SAVE_KEY+'_snaps')),'safety copy exists');
// keep local -> uploads local
await A.evaluate(()=>cloudHeldAct('heldkeep',cloud.held[0].id)); await A.waitForTimeout(800);
ok(JSON.parse(srv.fams[fid][id].p).space&&JSON.parse(srv.fams[fid][id].p).space.earned===6,'"keep this device" restored the room in the cloud');
ok(await A.evaluate(()=>cloud.held.length)===0,'held list cleared');
// take cloud
wipe(); await A.evaluate(()=>cloudSync('manual')); await A.waitForTimeout(500);
ok(await A.evaluate(()=>cloud.held.length)===1,'held again');
await A.evaluate(()=>cloudHeldAct('heldtake',cloud.held[0].id)); await A.waitForTimeout(700);
ok(await A.evaluate(()=>activeProfile().progress.space.earned)===0,'"take cloud" applied the cloud copy on purpose');
// newer format is left alone
srv.fams[fid][id]=Object.assign({},srv.fams[fid][id],{v:3,u:srv.fams[fid][id].u+10});
const before=JSON.stringify(srv.fams[fid][id]); const nm=await A.evaluate(()=>activeProfile().name);
await A.evaluate(()=>{ score+=5; persist(); cloudSync('manual'); }); await A.waitForTimeout(600);
ok(JSON.stringify(srv.fams[fid][id])===before,'newer-format doc is never written');
ok(await A.evaluate(()=>activeProfile().name)===nm&&await A.evaluate(()=>cloud.newer),'and local data is not replaced');
// future time is clamped
await A.evaluate(()=>{ activeProfile().u=Date.now()+86400000*30; cloudSync('manual'); }); await A.waitForTimeout(500);
ok(await A.evaluate(()=>activeProfile().u<Date.now()+60000),'a change time in the far future is pulled back');
ok(A.errs.length===0,'no page errors '+A.errs.join('|'));
await b.close(); process.exit(f?1:0);
})();
