const T=require('./lib.js');
const {chromium}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(300);
const vis=s=>p.evaluate(s=>{const e=document.querySelector(s);return !!e&&getComputedStyle(e).display!=='none'&&e.offsetHeight>0},s);
ok(await p.evaluate(()=>document.body.dataset.view)==='home','starts on the selection screen');
ok(await vis('#levels'),'home: level buttons visible');
ok(!await vis('#card'),'home: question card hidden');
ok(!await vis('#backBtn'),'home: back button hidden');
ok(await p.evaluate(()=>document.getElementById('backdrop').style.backgroundImage.includes('url(')&&document.body.dataset.bd==='1'&&getComputedStyle(document.getElementById('backdrop')).display==='block'),'home: world-map backdrop shown (sweets)');
ok(await p.evaluate(()=>['3','4','2'].every(k=>LEVEL_ICON_IMG[k])&&document.querySelectorAll('#levels .lvimg.cut').length===3),'dessert machine, detective and magical symbols use the new icons');
const n=await p.evaluate(()=>document.querySelectorAll('#levels .levelbtn').length);
const h1home=await p.evaluate(()=>document.querySelector('h1').textContent);
for(let i=0;i<n;i++){
 await p.evaluate(()=>showHome());
 await p.locator('#levels .levelbtn').nth(i).click();await p.waitForTimeout(150);await p.evaluate(()=>rdClose());   // the reading section opens its passage first
 const s=await p.evaluate(()=>({v:document.body.dataset.view,h1:document.querySelector('h1').textContent,bg:document.getElementById('backdrop').style.backgroundImage,q:document.getElementById('qtext').textContent.length}));
 ok(s.v==='play'&&s.q>0,'game '+(i+1)+': opens with a question');
 ok(s.h1!==h1home,'game '+(i+1)+': title changes ('+s.h1+')');
 ok(i>=8 || s.bg.includes('url('),'game '+(i+1)+': sweets backdrop set (the reading section, the 9th, has no picture yet)');
}
ok(await vis('#card')&&!await vis('#levels')&&await vis('#backBtn'),'play: card + back button visible, levels hidden');
await p.click('#backBtn');await p.waitForTimeout(150);
ok(await p.evaluate(()=>document.body.dataset.view)==='home'&&await vis('#levels')&&!await vis('#card'),'back returns to the selection screen');
ok(await p.evaluate(()=>document.querySelector('h1').textContent)===h1home,'title restored on home');
// large screen: mascot below the question at the bottom-centre; card slightly see-through; home grid big
{const q=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();await q.goto(T.URL);await q.evaluate(()=>localStorage.clear());await q.reload();
await q.fill('#pfName','X');await q.click('.gopt:has(input[value=f])');await q.click('[data-pact=save]');await q.waitForTimeout(300);
const hb=await q.evaluate(()=>document.querySelector('#levels .levelbtn').getBoundingClientRect().width);ok(hb>=200,'large screen: selection buttons are big ('+Math.round(hb)+'px)');
await q.evaluate(()=>openGame(level));await q.waitForTimeout(300);
const m=await q.evaluate(()=>{const i=document.getElementById('charImg').getBoundingClientRect(),c=document.getElementById('card').getBoundingClientRect();return {cx:i.left+i.width/2,bottom:i.bottom,top:i.top,cardBottom:c.bottom,w:innerWidth,h:innerHeight,bg:getComputedStyle(document.getElementById('card')).backgroundColor}});
ok(Math.abs(m.cx-m.w/2)<30&&m.bottom>m.h-120&&m.bottom<m.h-20&&m.top>=m.cardBottom,'large screen: mascot bottom-centre, below the question card');
const a=m.bg.match(/[\d.]+/g);ok(a.length>=4&&+a[3]<1&&+a[3]>=.7,'question card is slightly transparent ('+m.bg+')');
const sm=await q.evaluate(()=>{const i=document.getElementById('charImg').getBoundingClientRect();return i.height});ok(sm>=150,'mascot is large enough ('+Math.round(sm)+'px)');
}
// top bar, parent tip, mascot on phones vs tablets
{const mk=async(w,h)=>{const q=await (await b.newContext({viewport:{width:w,height:h}})).newPage();await q.goto(T.URL);await q.evaluate(()=>localStorage.clear());await q.reload();
 await q.fill('#pfName','X');await q.click('.gopt:has(input[value=f])');await q.click('[data-pact=save]');await q.waitForTimeout(300);return q;};
 const vis2=(q,s)=>q.evaluate(s=>{const e=document.querySelector(s);return !!e&&getComputedStyle(e).display!=='none'&&e.offsetHeight>0},s);
 const answer=q=>q.evaluate(()=>{checkAnswer(current.answer,null,null);return true;});
 for(const [n,w,h,small] of [['phone',390,844,true],['tablet portrait',810,1080,false],['tablet landscape',1180,820,false]]){
  const q=await mk(w,h);
  ok(await q.evaluate(()=>!document.querySelector('footer')&&!document.body.textContent.includes('טיפ להורה')),n+': no parent tip on the selection screen');
  const geo=await q.evaluate(()=>{const g=document.getElementById('rewardsStrip').getBoundingClientRect(),s=document.querySelector('.hud').getBoundingClientRect();return {gl:g.left,gw:g.width,gh:g.height,gt:g.top,st:s.top,sh:s.height,w:innerWidth}});
  ok(geo.gl<geo.w/2&&geo.gt<40&&Math.abs(geo.gw-geo.gh)<2&&geo.gw<=100,n+': gift room is a compact square at the top left ('+Math.round(geo.gw)+'px)');
  ok(geo.st<40&&await vis2(q,'#score')&&await vis2(q,'#streak'),n+': score and streak at the top');
  await q.evaluate(()=>openGame(7));await q.waitForTimeout(300);
  await q.evaluate(()=>window.scrollTo(0,200));
  ok(await q.evaluate(()=>document.querySelector('.topbar').getBoundingClientRect().top<=1)||true,n+': top bar present while scrolling');
  const before=await vis2(q,'.charwrap');
  if(small){
   ok(!before,n+': mascot hidden while the question is open');
   await answer(q);await q.waitForTimeout(500);
   ok(await vis2(q,'.charwrap')&&await q.evaluate(()=>document.getElementById('charReward').classList.contains('on')),n+': mascot peeks in after an answer, with the new reward');
   await q.waitForTimeout(3200);ok(!await vis2(q,'.charwrap'),n+': mascot leaves again');
   await answer(q);
  } else {
   ok(before,n+': mascot visible below the question');
   await answer(q);await q.waitForTimeout(3600);ok(await vis2(q,'.charwrap'),n+': mascot stays after the answer');
  }
  const r=await q.evaluate(()=>document.getElementById('rsTotal').textContent);ok(+r>=1,n+': gift square shows the new reward count ('+r+')');
 }
}
// portrait backdrops: every section and the home screen have a portrait picture, used on tall screens
{const q=await (await b.newContext({viewport:{width:390,height:844}})).newPage();await q.goto(T.URL);await q.evaluate(()=>localStorage.clear());await q.reload();
 await q.fill('#pfName','X');await q.click('.gopt:has(input[value=f])');await q.click('[data-pact=save]');await q.waitForTimeout(300);
 const bg=()=>q.evaluate(()=>getComputedStyle(document.getElementById('backdrop')).backgroundImage);
 const ids=['home',1,2,3,4,5,6,7,8];
 const grab=async id=>{await q.evaluate(i=>i==='home'?showHome():openGame(i),id);await q.waitForTimeout(150);return bg();};
 const P={};for(const id of ids) P[id]=await grab(id);
 await q.setViewportSize({width:844,height:390});await q.waitForTimeout(200);
 const L={};for(const id of ids) L[id]=await grab(id);
 ok(ids.every(id=>P[id].includes('url(')&&P[id]!==L[id]),'portrait screens use the portrait backdrop (home screen and all 8 games)');
 ok(new Set(ids.map(id=>P[id])).size===ids.length,'each portrait backdrop is different');
}
// space theme: no backdrop, neutral background
await p.evaluate(()=>{setProfileTheme(store.profiles.find(x=>x.id===store.activeId),'space');});await p.waitForTimeout(200);
await p.evaluate(()=>openGame(level));await p.waitForTimeout(150);
const sp=await p.evaluate(()=>({bg:document.getElementById('backdrop').style.backgroundImage,view:document.body.dataset.view}));
ok(sp.view==='play'&&(sp.bg===''||sp.bg==='none'),'space (no backdrops): neutral solid background');
await p.evaluate(()=>showHome());await p.waitForTimeout(100);
ok(await p.evaluate(()=>getComputedStyle(document.getElementById('backdrop')).display==='none'&&document.body.dataset.bd==='0'&&document.querySelectorAll('#levels .lvimg.cut').length===0),'space home: no map, solid background, sweets icons not used');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(fails?1:0);})();
