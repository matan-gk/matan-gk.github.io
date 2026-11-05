const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2];};
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
(async()=>{
const b=await chromium.launch(T.launchOpts);
async function fresh(cs){ const ctx=await b.newContext({viewport:{width:390,height:844},colorScheme:cs||'light'}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(250); p.errs=errs; return p; }
const p=await fresh('light'); const E=(fn,...a)=>p.evaluate(fn,...a);
// ---- default ----
ok(await E(()=>themeId==='sweets'&&document.documentElement.dataset.skin==='sweets'),'default theme is the sweets one');
const base=await E(()=>({h1:document.querySelector('h1').textContent,title:document.title,alt:document.getElementById('charImg').alt,bg:getComputedStyle(document.documentElement).getPropertyValue('--bg1').trim()}));
ok(base.h1.includes('קאפקייק')&&base.title.includes('קאפקייק')&&base.alt==='קאפקייק'&&base.bg==='#fff0f7','default look unchanged: '+JSON.stringify(base));
// ---- switch ----
const before=await E(()=>({score,coll:collection.length,stats:activeProfile().stats.log.length,g:curGender,sub:document.querySelector('.wrap > .sub').textContent}));
await E(()=>setProfileTheme(activeProfile(),'space'));
const sp=await E(()=>({h1:document.querySelector('h1').textContent,title:document.title,alt:document.getElementById('charImg').alt,skin:document.documentElement.dataset.skin,tc:document.querySelector('meta[name=theme-color]').content,bg:getComputedStyle(document.documentElement).getPropertyValue('--bg1').trim(),score,coll:collection.length,g:curGender}));
ok(sp.h1.includes('הרפתקה בחלל')&&sp.title==='הרפתקה בחלל'&&sp.alt==='ברק'&&sp.skin==='space'&&sp.tc==='#0b0e14','space: title, tab text, mascot name, skin attribute');
ok(sp.bg==='#f0f4f8','space, light: palette applied ('+sp.bg+')');
ok(sp.score===before.score&&sp.coll===before.coll&&sp.g===before.g,'switching changes no score, collection or gender wording');
ok(await E(()=>document.querySelector('.wrap > .sub').textContent)!==before.sub,'subtitle themed');
await E(()=>setProfileTheme(activeProfile(),'sweets'));
ok(await E(()=>document.querySelector('h1').textContent)===base.h1&&await E(()=>document.title)===base.title,'switching back restores everything');
// ---- palettes: dark, and contrast ----
const pd=await fresh('dark'); await pd.evaluate(()=>setProfileTheme(activeProfile(),'space'));
const dk=await pd.evaluate(()=>{const g=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return {bg:g('--bg1'),card:g('--card'),text:g('--text'),muted:g('--muted'),pink:g('--pink'),purple:g('--purple'),teal:g('--teal')};});
ok(dk.bg==='#0b0e14'&&dk.card==='#161c2c','space, dark: Deep Space palette applied ('+dk.bg+')');
const lt=await E(()=>{ setProfileTheme(activeProfile(),'space'); const g=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return {card:g('--card'),card2:g('--card2'),text:g('--text'),muted:g('--muted'),pink:g('--pink'),purple:g('--purple'),good:g('--good'),bad:g('--bad')};});
const chk=(n,a,b,min)=>ok(contrast(a,b)>=min,n+': '+contrast(a,b).toFixed(1)+':1 (min '+min+')');
chk('light: text on card',lt.text,lt.card,7); chk('light: muted on card',lt.muted,lt.card,4.5); chk('light: purple (titles) on card',lt.purple,lt.card,4.5); chk('light: orange numbers on card',lt.pink,lt.card,4.0);
chk('light: white on button end (orange)',lt.pink,'#ffffff',4.0); chk('light: white on button end (cyan)',lt.purple,'#ffffff',4.5);
const oa=await pd.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--on-accent').trim()); chk('dark: button text on gold end',oa,dk.pink,7); chk('dark: button text on purple end',oa,dk.purple,4.5);
chk('dark: text on card',dk.text,dk.card,7); chk('dark: muted on card',dk.muted,dk.card,4.5); chk('dark: purple on card',dk.purple,dk.card,4.5); chk('dark: gold on card',dk.pink,dk.card,7);
// ---- parent area stays neutral under the space theme ----
for(const [pg,name,expect] of [[p,'light','#ffffff'],[pd,'dark','#352646']]){
  await pg.evaluate(()=>{ setProfileTheme(activeProfile(),'space'); setViewId=store.activeId; openPanel('settings'); });
  const pa=await pg.evaluate(()=>{ const c=document.querySelector('#profBody .pa-card'); return {bg:getComputedStyle(c).backgroundColor, purple:getComputedStyle(c).getPropertyValue('--purple').trim()}; });
  const hex=pa.bg.match(/\d+/g).slice(0,3).map(n=>(+n).toString(16).padStart(2,'0')).join('');
  ok('#'+hex===expect&&pa.purple==='#9b6bff','parent area keeps the default palette under space ('+name+')');
  await pg.evaluate(()=>closeProfiles());
}
// ---- per profile, saved, junk, backup ----
await E(()=>{ store.profiles.push(makeProfile('דני','m',{score:5})); persist(); setProfileTheme(activeProfile(),'space'); });
ok(await E(()=>profileTheme(store.profiles[1])==='sweets'&&profileTheme(store.profiles[0])==='space'),'each profile has its own theme');
await E(()=>setProfileTheme(store.profiles[1],'space'));
ok(await E(()=>profileTheme(store.profiles[1])==='space'&&themeId==='space'),'setting another profile (not active) works');
await E(()=>{ setProfileTheme(store.profiles[1],'sweets'); });
ok(await E(()=>themeId==='space'),'...and leaves the active one alone');
await p.reload(); await p.waitForTimeout(300);
ok(await E(()=>themeId==='space'&&document.documentElement.dataset.skin==='space'&&document.title==='הרפתקה בחלל'),'saved: applied again after reload');
ok(await E(()=>{ const c=cleanProgress(JSON.parse(JSON.stringify(captureProgress()))); return c.theme==='space'&&cleanProgress({}).theme==='sweets'&&cleanProgress({theme:'nope'}).theme==='sweets'&&cleanProgress({theme:'__proto__'}).theme==='sweets'&&cleanProgress({theme:5}).theme==='sweets'; }),'carried in saved progress; old saves and junk give sweets');
// ---- picture lookup with fallback ----
const L=await E(()=>{ const out={}; const was=themeId; const orig=THEME_ASSETS.space.mood.happy; themeId='space';
  out.fallback=skinImg('level','999','BASE'); out.themed=skinImg('mood','happy','BASE')===orig;
  THEME_ASSETS.space.mood.happy='data:image/png;base64,AAAA'; setMood('happy'); out.src=document.getElementById('charImg').src;
  themeId='sweets'; out.sweets=skinImg('mood','happy','BASE'); setMood('happy'); out.src2=document.getElementById('charImg').src;
  THEME_ASSETS.space.mood.happy=orig; themeId=was; return out; });
ok(L.fallback==='BASE'&&L.themed&&L.sweets==='BASE','pictures: theme picture when it exists, the default one when it does not');
ok(L.src.startsWith('data:image/png;base64,AAAA')&&/^data:image|\/assets\//.test(L.src2),'the mascot uses the lookup (and the default picture when the theme has none)');
// ---- settings card ----
await E(()=>{ setViewId=store.activeId; openPanel('settings'); });
const card=await p.textContent('#profBody');
ok(card.includes('ערכת נושא (בניסוי)')&&card.includes('ברק בחלל')&&card.includes('ממתקים וקסם'),'settings card with both themes');
ok(card.includes('0 מתוך 8')&&card.includes('✓ מוכן'),'coverage report shows what is ready and what is still missing');
await p.locator('.thchips [data-id=sweets]').click(); await p.waitForTimeout(100);
ok(await E(()=>themeId==='sweets')&&!(await p.textContent('#profBody')).includes('מתוך 16'),'chip switches at once; no coverage table for the default theme');
await p.locator('.thchips [data-id=space]').click(); await p.waitForTimeout(100);
ok(await E(()=>themeId==='space'),'chip switches back to space');
ok(p.errs.length===0&&pd.errs.length===0,'no page errors '+p.errs+pd.errs);
console.log(f?'FAILURES '+f:'ALL PASS'); await b.close(); process.exit(f?1:0);})();
