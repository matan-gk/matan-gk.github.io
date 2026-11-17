// The version is shown in the parent area on every tab; on the deployed site the commit it was built from is a link; tools/version_commit.py connects versions and commits.
const T=require('./lib.js');
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),cp=require('child_process');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
const ROOT=path.join(__dirname,'..');
(async()=>{
const html=fs.readFileSync(path.join(ROOT,'math-quest.html'),'utf8'), sw=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8'), yml=fs.readFileSync(path.join(ROOT,'.github/workflows/tests.yml'),'utf8');
const ver=(html.match(/const APP_VERSION = '([^']+)'/)||[])[1];
ok(ver&&sw.includes("const VERSION = '"+ver+"'"),'APP_VERSION and the service worker VERSION are the same ('+ver+')');
ok(/^const BUILD_COMMIT = '';/m.test(html),'the page has an empty BUILD_COMMIT line, at the start of a line, for the deploy workflow to fill in');
// the real stamp step from the workflow, run on a copy
const m=yml.match(/- name: Stamp the commit[^\n]*\n\s+run: \|\n((?:\s{10}[^\n]*\n)+)/); ok(!!m,'the deploy workflow has the stamp step');
const dir=path.join(__dirname,'_build','stamp'); fs.mkdirSync(dir,{recursive:true});
const SHA='0123456789abcdef0123456789abcdef01234567';
fs.writeFileSync(path.join(dir,'math-quest.html'),html);
const r=cp.spawnSync('bash',['-e','-c',m[1].replace(/^ {10}/gm,'')],{cwd:dir,env:{...process.env,GITHUB_SHA:SHA},encoding:'utf8'});
ok(r.status===0,'the stamp step succeeds on the page'+(r.status?' ('+r.stderr+')':''));
const stamped=fs.readFileSync(path.join(dir,'math-quest.html'),'utf8');
ok(stamped.includes("const BUILD_COMMIT = '"+SHA+"';"),'and writes the commit id into it');
fs.writeFileSync(path.join(dir,'page.html'),stamped.replace('<head>','<head><base href="file://'+ROOT+'/">'));
const bad=cp.spawnSync('bash',['-e','-c',m[1].replace(/^ {10}/gm,'')],{cwd:dir,env:{...process.env,GITHUB_SHA:'abc'},encoding:'utf8'});
const b=await chromium.launch({...T.launchOpts});
async function parentArea(url){
  const p=await (await b.newContext({viewport:{width:1100,height:800}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(url);await p.evaluate(()=>localStorage.clear());await p.reload();
  await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
  await p.evaluate(()=>{adult.ok=true;openProfiles&&openProfiles();});await p.waitForTimeout(400);
  const out={errs};
  out.tabs=await p.evaluate(()=>[...document.querySelectorAll('.pa-tab')].map(t=>t.dataset.id));
  out.per=[];
  for(const id of out.tabs){ await p.evaluate(id=>{profTab=id;renderProfiles();},id); out.per.push(await p.evaluate(()=>{const e=document.getElementById('paVer');return e?{t:e.textContent.trim(),a:[...e.querySelectorAll('a')].map(a=>a.href),vis:e.getBoundingClientRect().height>0}:null;})); }
  await p.context().close(); return out;
}
const plain=await parentArea(T.URL);
ok(plain.tabs.length>=3&&plain.per.every(x=>x&&x.vis&&x.t.includes(ver)),'the parent area shows the version on every tab ('+plain.tabs.length+' tabs)');
ok(plain.per.every(x=>x.a.length===0),'a plain checkout has no commit link');
const st=await parentArea('file://'+path.join(dir,'page.html'));
ok(st.per.every(x=>x.a.length===1&&x.a[0]==='https://github.com/matan-gk/matan-gk.github.io/commit/'+SHA&&x.t.includes(SHA.slice(0,7))),'a stamped page shows the short commit id as a link to that commit, on every tab');
ok(plain.errs.length===0&&st.errs.length===0,'no page errors'+(plain.errs[0]||st.errs[0]||''));
await b.close();
ok(bad.status!==0,'the stamp step fails (instead of deploying unstamped) when the id does not get in');
// the tool
const shallow=cp.spawnSync('git',['rev-parse','--is-shallow-repository'],{cwd:ROOT,encoding:'utf8'}).stdout.trim()!=='false';
if(shallow) console.log('ok   (tool checks skipped: this checkout has no history)');
else{
  const run=(...a)=>cp.spawnSync('python3',['tools/version_commit.py',...a],{cwd:ROOT,encoding:'utf8'});
  const cur=run();ok((cur.status===0&&cur.stdout.includes('version '+ver))||/not committed yet/.test(cur.stderr),'the tool answers for the current version without arguments (or says it is not committed yet)');
  const head=cp.spawnSync('git',['log','-1','--format=%H','--','math-quest.html'],{cwd:ROOT,encoding:'utf8'}).stdout.trim();
  const c=run(head.slice(0,7));ok(c.status===0&&/version: \d{4}\.\d\d\.\d\d[a-z]/.test(c.stdout),'a short commit id gives its version');
  const old=run('2026.11.09b');ok(old.status===0&&/first commit: [0-9a-f]{7}/.test(old.stdout)&&/last commit : [0-9a-f]{7}/.test(old.stdout),'an older version gives its first and last commit');
  ok(run('1999.01.01a').status!==0,'an unknown version is an error');
}
process.exit(f?1:0);})();
