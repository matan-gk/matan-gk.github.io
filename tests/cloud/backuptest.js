const T=require('../lib.js');
const {chromium}=require('playwright');const fs=require('fs');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
const srv={fams:{},users:{},legacy:{},reports:[],reads:0,writes:0,snaps:{}};
const F=id=>srv.fams[id]||(srv.fams[id]={});
const clone=o=>JSON.parse(JSON.stringify(o));
async function handle(op,a){
  if(op==='getFamily') return (srv.users[a.uid]||{}).fid||'';
  if(op==='setFamily'){ srv.users[a.uid]={fid:a.fid}; return; }
  if(op==='clearFamily'){ delete srv.users[a.uid]; return; }
  if(op==='list'){ return clone(Object.entries(F(a.fid)).map(([id,v])=>Object.assign({id},v))); }
  if(op==='put'){ const cur=F(a.fid)[a.id]; if(cur&&cur.u!==a.doc.b) return {conflict:true}; if(!(a.doc.v>=2)||(cur&&a.doc.v<cur.v)) return {conflict:true}; F(a.fid)[a.id]=clone(a.doc); srv.writes++; return {ok:true}; }
  if(op==='snapList'){ return clone(Object.entries(srv.snaps[a.fid]||{}).map(([id,d])=>({id,day:d.day,t:d.t,pid:d.pid}))); }
  if(op==='snapPut'){ const S=srv.snaps[a.fid]||(srv.snaps[a.fid]={}); if(S[a.id]) return {exists:true}; S[a.id]=clone(a.doc); return {ok:true}; }
  if(op==='snapDelete'){ delete (srv.snaps[a.fid]||{})[a.id]; return; }
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
// --- pure
const pure=await A.evaluate(()=>{ const now=Date.UTC(2026,10,20); const D=n=>dayKey(now-n*86400000);
  const list=[]; for(let i=0;i<10;i++) list.push({id:D(i)+'_p',day:D(i),t:now-i*86400000});
  list.push({id:D(3)+'_p_x1',day:D(3),t:now-3*86400000});
  const del=snapPrune(list,now);
  return {del:del.sort(), d8:D(8), d9:D(9), key:dayKey(new Date(2026,0,5).getTime())}; });
ok(pure.key==='2026-01-05','dayKey pads month and day');
ok(JSON.stringify(pure.del)===JSON.stringify([pure.d9+'_p']),'prune: keeps 7 days (+ extras of kept days), deletes only copies older than 8 days (day 8 is kept, day 9 goes): '+pure.del.join(','));
// --- sign in with a profile
await A.evaluate(()=>{CLOUD_LIMITS.pushDelayMs=300;});
await A.fill('#pfName','גאיה'); await A.click('.gopt:has(input[value=f])'); await A.click('[data-pact=save]'); await A.waitForTimeout(300); await A.evaluate(()=>openGame(level));
await A.evaluate(()=>{ space.earned=6; space.unlocked=true; saveState(); persist(); });
await A.evaluate(()=>openProfiles(false)); await A.evaluate(()=>openPanel('backup')); await A.click('[data-pact=bksub][data-id=account]'); await A.click('[data-pact=cloudin]'); await A.waitForTimeout(900);
const fid=(srv.users.u1||{}).fid; const S=()=>srv.snaps[fid]||{};
const today=await A.evaluate(()=>dayKey(Date.now()));
ok(Object.keys(S()).length===1&&Object.keys(S())[0].startsWith(today+'_'),'first sync of the day made one cloud copy: '+Object.keys(S()).join(','));
const sd=Object.values(S())[0]; ok(JSON.parse(sd.p).space.earned===6&&sd.n==='גאיה'&&sd.v>=2,'the copy holds the room');
ok(await A.evaluate(()=>{ const o=JSON.parse(localStorage.getItem(SAVE_KEY+'_daily')||'{}'); return Object.keys(o).length===1; }),'and a local daily copy exists');
// a second sync the same day makes no more
await A.evaluate(()=>cloudSync('manual')); await A.waitForTimeout(500);
ok(Object.keys(S()).length===1,'no second copy on the same day');
// old copies are pruned, a copy is never replaced
const now=Date.now(); for(let i=2;i<12;i++){ const d=await A.evaluate(n=>dayKey(Date.now()-n*86400000),i); srv.snaps[fid][d+'_x']={day:d,t:now-i*86400000,pid:'x'}; }
await A.evaluate(()=>{ localStorage.removeItem(SAVE_KEY+'_snapday'); cloudSync('manual'); }); await A.waitForTimeout(900);
const days=new Set(Object.values(S()).map(d=>d.day)); ok(days.size===7,'7 days kept after pruning: '+days.size);
ok(Object.keys(S()).includes(Object.keys(S()).find(k=>k.startsWith(today+'_'))),'today kept');
// a held decision keeps the cloud copy first
function wipe(){ const id=Object.keys(srv.fams[fid])[0]; const d=srv.fams[fid][id]; const p=JSON.parse(d.p); delete p.space; srv.fams[fid][id]=Object.assign({},d,{p:JSON.stringify(p),u:d.u+5000,b:d.u}); }
wipe(); await A.evaluate(()=>cloudSync('manual')); await A.waitForTimeout(600);
const n0=Object.keys(S()).length;
await A.evaluate(()=>cloudHeldAct('heldtake',cloud.held[0].id)); await A.waitForTimeout(800);
ok(Object.keys(S()).some(k=>k.includes('_x1')||/_x\d{6,}$/.test(k)),'taking the cloud copy first saved it as an extra copy');
ok(A.errs.length===0,'no page errors '+A.errs.join('|'));
await b.close(); process.exit(f?1:0);
})();
