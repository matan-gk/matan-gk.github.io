// Accessibility: keyboard and screen-reader use of the whole game, dialogs, announcements, tap targets, contrast, reduced motion, landmarks (and axe-core when it is installed: `npm i axe-core` in tests/)
const T=require('./lib.js'); const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
let AX=null; try{ AX=require('fs').readFileSync(require.resolve('axe-core/axe.min.js'),'utf8'); }catch(e){}
(async()=>{
const b=await chromium.launch(T.launchOpts);
async function open(opts){ const ctx=await b.newContext({viewport:{width:390,height:844},...(opts||{})}); const p=await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(e.message));
  await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(500);
  await p.evaluate(()=>{ for(let i=0;i<9;i++) collection.push('🧁:0.0.'+(i%3)); renderRewards(); adult.ok=true; }); return p; }
let p=await open();
// 1. nothing clickable is out of keyboard reach
const unreach=()=>p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{ const s=getComputedStyle(e); return s.cursor==='pointer'&&(e.offsetParent||s.position==='fixed')&&!e.matches('button,a,input,select,textarea,label,summary,[tabindex],[role=button],[role=tab]')&&!e.closest('button,a,label,summary,[tabindex],[role=button],[role=tab]')&&!(e.children.length===0&&e.parentElement&&getComputedStyle(e.parentElement).cursor==='pointer'); }).map(e=>e.tagName+'.'+String(e.className).split(' ')[0]));
let u=await unreach(); ok(u.length===0,'home: everything clickable can be reached with the keyboard '+u.join(','));
await p.evaluate(()=>openRoom()); await p.waitForTimeout(300); u=await unreach(); ok(u.length===0,'gift room: same '+u.join(','));
ok(await p.evaluate(()=>[...document.querySelectorAll('#roomOverlay .ritem[role=button]')].every(e=>e.getAttribute('aria-label')&&e.tabIndex===0)),'gift room: every gift has a name and can be focused');
// 2. dialogs: focus goes in, stays in, comes back; Esc closes; announced as modal
await p.evaluate(()=>{ document.getElementById('roomOverlay').hidden=true; });
await p.focus('#menuBtn'); await p.evaluate(()=>openRoom()); await p.waitForTimeout(300);
let d=await p.evaluate(()=>({modal:document.querySelector('#roomOverlay [role=dialog]').getAttribute('aria-modal'), inside:document.getElementById('roomOverlay').contains(document.activeElement)}));
ok(d.modal==='true'&&d.inside,'dialog: marked modal and focus moved into it');
let stays=true; for(let i=0;i<25;i++){ await p.keyboard.press('Tab'); if(!await p.evaluate(()=>document.getElementById('roomOverlay').contains(document.activeElement))) stays=false; }
ok(stays,'dialog: Tab never leaves it (25 presses)');
let back=true; for(let i=0;i<25;i++){ await p.keyboard.press('Shift+Tab'); if(!await p.evaluate(()=>document.getElementById('roomOverlay').contains(document.activeElement))) back=false; }
ok(back,'dialog: Shift+Tab never leaves it');
await p.keyboard.press('Escape'); await p.waitForTimeout(250);
ok(await p.evaluate(()=>document.getElementById('roomOverlay').hidden&&document.activeElement.id==='menuBtn'||document.activeElement.closest('.menuwrap,.topbar')!==null),'dialog: Escape closes it and the focus goes back to where it was');
for(const t of ['settings','backup','guide']){ await p.evaluate(t=>openPanel(t),t); await p.waitForTimeout(300); ok(await p.evaluate(()=>document.getElementById('profOverlay').contains(document.activeElement)),'parent area ('+t+'): focus inside'); await p.keyboard.press('Escape'); await p.waitForTimeout(200); }
// 3. landmarks and headings
const lm=await p.evaluate(()=>({mains:document.querySelectorAll('main,[role=main]').length, mainHasGame:!!document.querySelector('main #card, main .card'), h1:document.querySelectorAll('h1').length, inDialog:document.querySelectorAll('[role=dialog] main').length}));
ok(lm.mains===1&&lm.h1===1&&lm.inDialog===0,'one main landmark, one h1, no main inside a dialog '+JSON.stringify(lm));
await p.evaluate(()=>openPanel('guide')); await p.waitForTimeout(300);
const lv=await p.evaluate(()=>[...document.querySelectorAll('#profOverlay h1,#profOverlay h2,#profOverlay h3,#profOverlay h4')].map(h=>+h.tagName[1])); let skip=false; for(let i=1;i<lv.length;i++) if(lv[i]-lv[i-1]>1) skip=true;
ok(lv.length>3&&!skip,'parent guide: heading levels never skip ('+lv.join('')+')'); await p.evaluate(()=>{ document.getElementById('profOverlay').hidden=true; });
// 4. the game by keyboard: level button, answer, announcement
await p.evaluate(()=>{ document.querySelectorAll('.milestone').forEach(e=>e.remove()); });
const lvl=p.locator('#levels .levelbtn').first(); ok(await lvl.getAttribute('role')==='button'&&await lvl.getAttribute('tabindex')==='0','level buttons are buttons for the keyboard');
await lvl.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(500);
ok(await p.evaluate(()=>gameView==='play'||document.body.dataset.view==='play'),'Enter on a level button starts the game');
ok(await p.evaluate(()=>{ const f=document.getElementById('feedback'); return f.getAttribute('role')==='status'&&f.getAttribute('aria-live')==='polite'; }),'the answer feedback is announced (status, polite)');
ok(await p.evaluate(()=>[...document.querySelectorAll('#answerArea .choice')].every(c=>c.getAttribute('role')==='button'&&c.tabIndex===0)),'answer choices are focusable buttons');
const key=await p.evaluate(()=>{ const q=current; const i=[...document.querySelectorAll('#answerArea .choice')].findIndex(c=>String(c.dataset.key!==undefined?c.dataset.key:c.textContent.trim())===String(q.answer)); return i; });
const before=await p.evaluate(()=>score); await p.locator('#answerArea .choice').nth(key).focus(); await p.keyboard.press(key%2?'Enter':' '); await p.waitForTimeout(600);
ok(await p.evaluate(b=>score>b,before),'a right answer chosen with the keyboard (Enter or Space) counts');
// 5. size of tap targets
const small=await p.evaluate(()=>['menuBtn','backBtn','reportBtn','helpBtn'].map(id=>{ const e=document.getElementById(id); const r=e.getBoundingClientRect(); return e.offsetParent?[id,Math.round(r.width),Math.round(r.height)]:null; }).filter(x=>x&&(x[1]<44||x[2]<44)));
ok(small.length===0,'top buttons are at least 44px '+JSON.stringify(small));
// 6. contrast of the small texts that used to fail (light and dark)
async function contrast(pg, sels){ return pg.evaluate(sels=>{ const lum=c=>{ const [r,g,b]=c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{ v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4); }); return .2126*r+.7152*g+.0722*b; };
  const bg=e=>{ for(let n=e;n;n=n.parentElement){ const c=getComputedStyle(n).backgroundColor; const m=c.match(/[\d.]+/g); if(m&&(m.length<4||+m[3]>.9)) return c; } return 'rgb(255,255,255)'; };
  return sels.map(s=>{ const e=document.querySelector(s); if(!e||!e.offsetParent) return [s,null]; const a=lum(getComputedStyle(e).color), c=lum(bg(e)); const r=(Math.max(a,c)+.05)/(Math.min(a,c)+.05); return [s,+r.toFixed(2)]; }); }, sels); }
const sels=['.sub','.sn-t small','.sn-btn','.rs-count','#rsTotal'];
for(const [mode,opts] of [['light',{colorScheme:'light'}],['dark',{colorScheme:'dark'}]]){ const q=await open(opts); await q.evaluate(()=>{ PWA.supported=true; renderSaveNote(); }); const r=await contrast(q,sels); const bad=r.filter(x=>x[1]!==null&&x[1]<4.5); ok(bad.length===0,'contrast >= 4.5 ('+mode+'): '+JSON.stringify(r)); await q.context().close(); }
// 7. reduced motion: animations are cut to nothing
{ const q=await open({reducedMotion:'reduce'}); const ms=await q.evaluate(()=>{ const out=[]; for(const e of document.querySelectorAll('body *')){ const s=getComputedStyle(e); if(s.animationName!=='none') out.push(parseFloat(s.animationDuration)*(/ms/.test(s.animationDuration)?1:1000)); } return out; }); ok(ms.length===0||Math.max(...ms)<=1,'prefers-reduced-motion: every animation is cut to ~0 ('+ms.length+' running)'); await q.context().close(); }
// 8. axe (when installed)
if(AX){ const pgs=[['home',async q=>{}],['game',async q=>{ await q.evaluate(()=>{ document.querySelectorAll('.milestone').forEach(e=>e.remove()); openGame(1); }); await q.waitForTimeout(400); }],['gifts',async q=>{ await q.evaluate(()=>openRoom()); await q.waitForTimeout(300); }],['parent guide',async q=>{ await q.evaluate(()=>openPanel('guide')); await q.waitForTimeout(300); }]];
  for(const [n,go] of pgs){ const q=await open(); await go(q); await q.addScriptTag({content:AX}); const v=await q.evaluate(async()=>{ const x=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}}); return x.violations.map(v=>v.id+'('+v.nodes.length+')'); }); ok(v.length===0,'axe: '+n+' has no violations '+v.join(',')); await q.context().close(); } }
else console.log('     (axe-core is not installed: skipped. npm i axe-core to include it)');
ok(p.errs.length===0,'no page errors '+p.errs.join('|'));
await b.close(); process.exit(f?1:0);
})();
