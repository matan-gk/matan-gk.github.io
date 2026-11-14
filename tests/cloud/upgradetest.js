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
// --- plan
const plan=await A.evaluate(()=>{ const L=[{id:'a',u:5,sy:5},{id:'b',u:5,sy:5},{id:'c',u:5,sy:5}]; const D=[{id:'a',u:5,v:1,d:false},{id:'b',u:5,v:CLOUD_DOC_V,d:false},{id:'c',u:9,v:1,d:false}];
  return cloudPlan(L,[],D,4).map(a=>a.id+':'+a.op).join(','); });
ok(plan==='a:upgrade,c:pull','an in-sync profile in an old format is upgraded; a current one is left; a changed one is pulled: '+plan);
// --- end to end
await A.evaluate(()=>{CLOUD_LIMITS.pushDelayMs=300;});
await A.fill('#pfName','גאיה'); await A.click('.gopt:has(input[value=f])'); await A.click('[data-pact=save]'); await A.waitForTimeout(300); await A.evaluate(()=>openGame(level));
await A.evaluate(()=>{ space.earned=6; space.unlocked=true; saveState(); persist(); });
await A.evaluate(()=>openProfiles(false)); await A.evaluate(()=>openPanel('backup')); await A.click('[data-pact=bksub][data-id=account]'); await A.click('[data-pact=cloudin]'); await A.waitForTimeout(900);
const fid=(srv.users.u1||{}).fid; const id=Object.keys(srv.fams[fid])[0]; const V=await A.evaluate(()=>CLOUD_DOC_V);
ok(srv.fams[fid][id].v===V,'a fresh upload is in the current format ('+V+')');
// the document is in an old format but its content is current (an unchanged profile on an updated device)
const orig=JSON.parse(JSON.stringify(srv.fams[fid][id])); srv.fams[fid][id].v=V-1;
const w0=srv.writes; await A.evaluate(()=>cloudSync('manual')); await A.waitForTimeout(700);
const after=srv.fams[fid][id];
ok(after.v===V,'after one sync with nothing changed, the stored document is in the current format');
ok(after.u===orig.u&&after.p===orig.p&&after.n===orig.n&&after.s===orig.s,'same content, same change time');
ok(srv.writes===w0+1,'exactly one write');
await A.evaluate(()=>cloudSync('manual')); await A.waitForTimeout(500);
ok(srv.writes===w0+1,'and nothing more on the next sync');
ok(await A.evaluate(()=>activeProfile().u===activeProfile().sy),'the device sees no change');
ok(A.errs.length===0,'no page errors '+A.errs.join('|'));
await b.close(); process.exit(f?1:0);
})();
