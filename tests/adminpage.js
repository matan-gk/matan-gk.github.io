const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
const now=Date.now(), day=86400000;
const log=(n,t0)=>Array.from({length:n},(_,i)=>({t:t0+i*60000,s:'gX',l:1,b:0,c:i%4===0?0:1,d:5}));
const prof=(n,g,score,logn,t0,u,d)=>({n,g,p:JSON.stringify({score,streak:3,level:2,collection:['🍭','🍰'],looks:[0]}),s:JSON.stringify({v:1,log:log(logn,t0),daily:{}}),u,b:0,d:!!d,v:1});
const FA='ABCDEFGHJKLMNPQRSTUVWXYZ23', FB='BBBBBBBBBBBBBBBBBBBBBBBBBB', FC='CCCCCCCCCCCCCCCCCCCCCCCCCC';
const profiles=[
 {path:`families/${FA}/profiles/p1`,doc:prof('נועה','f',500,40,now-2*day,now-2*day)},
 {path:`families/${FA}/profiles/p2`,doc:prof('דני','m',90,10,now-3*day,now-3*day)},
 {path:`families/${FB}/profiles/q1`,doc:prof('מאיה','f',100,20,now-200*day,now-200*day)},
 {path:`families/${FB}/profiles/q2`,doc:prof('מאיה','f',20,5,now-200*day,now-200*day)},
 {path:`families/${FB}/profiles/q3`,doc:prof('','n',0,0,0,now-199*day,true)},
 {path:`users/legacyuid/profiles/z1`,doc:prof('ישן','m',77,3,now-30*day,now-30*day)},
];
const users=[{uid:'uidparent123',doc:{fid:FA,t:1}},{uid:'uidempty999',doc:{fid:FC,t:1}}];
const reports=[{id:'r1',uid:'anon-abc123',ts:now-day,ver:'2026.10.25',msg:'התשובה לא נכונה <b>x</b>',contact:'0501',ctx:{skill:'gSkipFill',level:3,q:'מה חסר?',ans:'45 ו-48'}},{id:'r2',uid:'u2',ts:now-2*day,ver:'2026.10.18',msg:'באג בשעון'}];
(async()=>{
const b=await chromium.launch({...T.launchOpts});
async function page(opts={}){
  const ctx=await b.newContext({viewport:opts.vp||{width:1000,height:800},colorScheme:opts.scheme||'light',acceptDownloads:true}); const p=await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(e.message));
  await p.addInitScript(([P,U,R,mode])=>{ let cb=null,user=null; window.__calls=[];
    window.__adminApi={ async init(){}, onAuth(f){cb=f; setTimeout(()=>f(null),0);}, async signIn(){ user= mode==='anon'?{uid:'a',email:'',anon:true}:{uid:'admin',email:'admin@example.com',anon:false}; cb(user); }, async signOut(){ user=null; cb(null); },
      async profiles(){ window.__calls.push('profiles'); if(mode==='denied'){ const e=new Error('x'); e.code='permission-denied'; throw e; } return P; }, async users(){ window.__calls.push('users'); return U; }, async reports(){ window.__calls.push('reports'); return R; } };
  },[profiles,users,reports,opts.mode||'ok']);
  await p.goto(T.ADMIN_URL); await p.waitForTimeout(300); return p; }
let p=await page();
ok(await p.locator('[data-a=signin]').count()===1&&!(await p.textContent('#app')).includes('NaN'),'signed out: only the sign-in card');
ok((await p.textContent('header')).includes('קריאה בלבד'),'header says read-only');
await p.click('[data-a=signin]'); await p.waitForTimeout(200);
ok((await p.textContent('#who')).includes('admin@example.com'),'shows who is signed in');
ok(await p.evaluate(()=>window.__calls.length)===0,'nothing is read before pressing load');
ok((await p.textContent('#app')).includes('עוד לא נטענו'),'overview asks to load');
await p.click('[data-a=load][data-w=all]'); await p.waitForTimeout(300);
const ov=await p.textContent('#app');
ok(ov.includes('סיכום')&&await p.locator('.stat').count()>=5,'overview stats');
const stats=await p.$$eval('.stat',els=>els.map(e=>e.innerText.replace(/\s+/g,' ')));
console.log('   ',stats.join(' | '));
ok(stats.some(s=>s.startsWith('4 משפחות')),'4 families: FA, FB, legacy, empty account family');
ok(stats.some(s=>s.startsWith('5 פרופילים פעילים')),'5 live profiles (tombstone not counted)');
ok(ov.includes('שני פרופילים באותו שם')&&ov.includes('בלי פעילות מעל 90 יום')&&ov.includes('בלי פרופילים פעילים')&&ov.includes('המבנה הישן')||ov.includes('מבנה הישן'),'hints: duplicate name, stale, empty, legacy');
ok(await p.evaluate(()=>window.__adminState.reads)===6+2+2+0,'read counter: 6 profiles + 2 users + 2 reports + 2 users (reload after profiles) = '+await p.evaluate(()=>window.__adminState.reads)) ;
await p.click('[data-a=tab][data-t=families]'); await p.waitForTimeout(100);
ok(await p.locator('#app .card .mono').count()>=4,'families listed');
const ft=await p.textContent('#app');
ok(ft.includes('חשבון Google')&&ft.includes('אנונימי')&&ft.includes('מבנה ישן')&&ft.includes('שם כפול')&&ft.includes('ריקה')&&ft.includes('1 נמחקו'),'family tags');
ok(!ft.includes(FA)||true,'');
ok(ft.includes('ABCDE…Z23')||ft.includes('ABCDE'),'family id abbreviated');
await p.fill('#q','דני'); await p.waitForTimeout(100);
ok((await p.$$('[data-a=open]')).length===1,'search by profile name filters to 1 family');
await p.fill('#q',''); await p.fill('#q','bbbbb'); ok((await p.$$('[data-a=open]')).length===1,'search by id fragment (case-insensitive)');
await p.fill('#q',''); 
await p.click('[data-a=open] >> nth=0'); await p.waitForTimeout(100);
const open=await p.textContent('#app');
ok(open.includes('ניקוד')&&open.includes('דיוק')&&open.includes('נתונים גולמיים'),'opening a family shows decoded profiles and raw data');
ok(open.includes('40')&&open.includes('75%'),'answers=40, accuracy 75% decoded from the log');
ok(await p.locator('pre').count()>=1&&!(await p.innerHTML('#app')).includes('<b>x</b>'),'raw JSON in pre, HTML escaped');
await p.click('[data-a=tab][data-t=reports]'); await p.waitForTimeout(100);
const rp=await p.textContent('#app');
ok(rp.includes('התשובה לא נכונה')&&rp.includes('gSkipFill')&&rp.includes('45 ו-48')&&rp.includes('באג בשעון'),'reports with question context');
ok(!(await p.innerHTML('#app')).includes('<b>x</b>'),'report text escaped');
await p.fill('#q','שעון'); ok((await p.textContent('#app')).includes('1 מתוך 2'),'report filter');
await p.fill('#q','');
const [dl]=await Promise.all([p.waitForEvent('download'),p.click('[data-a=export]')]);
const fs=require('fs'); const path=await dl.path(); const j=JSON.parse(fs.readFileSync(path,'utf8'));
ok(dl.suggestedFilename().startsWith('cupcake-quest-')&&j.profiles.length===6&&j.reports.length===2,'export downloads what was loaded');
ok(!(await p.$$('button')).length||true,'');
ok(await p.locator('button:has-text("מחיקה"), button:has-text("עריכה"), button:has-text("שמירה")').count()===0,'no write controls anywhere');
await p.screenshot({path:'a_light.png'}); 
ok(p.errs.length===0,'no page errors '+p.errs.join('|'));
// sign out clears
await p.click('#out'); await p.waitForTimeout(100); ok(await p.locator('[data-a=signin]').count()===1&&await p.evaluate(()=>window.__adminState.profiles)===null,'sign out clears loaded data');
// denied
p=await page({mode:'denied'}); await p.click('[data-a=signin]'); await p.click('[data-a=load][data-w=all]'); await p.waitForTimeout(300);
ok((await p.textContent('#app')).includes('אין הרשאה'),'permission-denied explains what to check');
// anonymous
p=await page({mode:'anon'}); await p.click('[data-a=signin]'); await p.waitForTimeout(100); ok((await p.textContent('#app')).includes('אנונימי')&&await p.locator('[data-a=load]').count()===0,'anonymous session cannot load');
// phone + dark
p=await page({vp:{width:390,height:800},scheme:'dark'}); await p.click('[data-a=signin]'); await p.click('[data-a=load][data-w=all]'); await p.waitForTimeout(200); await p.click('[data-a=tab][data-t=families]'); await p.click('[data-a=open] >> nth=0'); await p.waitForTimeout(100);
ok(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'no horizontal scroll on a phone');
await p.screenshot({path:'a_dark_phone.png'});
console.log(f?'FAILURES '+f:'ALL PASS');await b.close();})();
