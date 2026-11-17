// The drawer's buy / place / cancel and close buttons (and the title) never scroll away: only the middle part scrolls.
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
async function run(vp,label,touch){
  const ctx=await b.newContext({viewport:vp,hasTouch:!!touch,isMobile:!!touch});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  const ev=(fn,a)=>p.evaluate(fn,a);
  await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
  await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
  await ev(()=>{space.earned=60;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();RM.sel=null;rmRedraw();renderDrawer();});await p.waitForTimeout(400);
  const vis=sel=>ev(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect(),d=document.getElementById('rmDrawer').getBoundingClientRect();return r.height>0&&r.top>=d.top-1&&r.bottom<=d.bottom+1&&r.bottom<=innerHeight+1;},sel);
  const scrolls=()=>ev(()=>{const b=document.querySelector('#rmDrawer .rmd-body');return b?b.scrollHeight>b.clientHeight+2:null;});
  // the shop list: many items, the close button stays
  await ev(()=>{RM.list='cat';RM.filter='all';renderDrawer();});
  ok(await ev(()=>!!document.querySelector('#rmDrawer .rmd-body .catgrid')&&!!document.querySelector('#rmDrawer .rmd-foot [data-close]')),label+': the list is in the scrolling part, close is in the pinned part');
  ok(await scrolls(),label+': the list is longer than the drawer, so it scrolls');
  ok(await vis('#rmDrawer [data-close]'),label+': close is visible without scrolling');
  await ev(()=>{const b=document.querySelector('#rmDrawer .rmd-body');b.scrollTop=b.scrollHeight;});
  ok(await vis('#rmDrawer [data-close]')&&await vis('#rmDrawer .rmsh-h'),label+': and still visible (with the title) when the list is scrolled to the end');
  ok(await ev(()=>document.getElementById('rmDrawer').scrollTop===0),label+': the drawer itself does not scroll');
  // an item being bought: place / cancel
  await ev(()=>{const c=ROOM_CATALOG.find(c=>c.p<=8&&fpOf(c,0)[0]<=3);RM.list=null;RM.pl={k:c.id,i:-1,x:12,y:12,o:0};rmRedraw();renderDrawer();});
  const narrowMini=await ev(()=>document.getElementById('rmDrawer').classList.contains('mini'));
  ok(await vis('#rmDrawer [data-place]')&&await vis('#rmDrawer [data-cancel]'),label+': buy and cancel are visible'+(narrowMini?' (small drawer)':''));
  // a colour list with a preview: buy / cancel pinned while the brushes scroll
  await ev(()=>{RM.pl=null;RM.sel={t:'surf',k:'wl'};const i=space.own.wl.length?ROOM_COLORS.findIndex((c,i)=>!space.own.wl.includes(i)):1;RM.pv={t:'col',k:'wl',idx:i};rmRedraw();renderDrawer();});
  ok(await vis('#rmDrawer [data-buy]')&&await vis('#rmDrawer [data-cancel]'),label+': a colour preview: buy and cancel are visible');
  await ev(()=>{const b=document.querySelector('#rmDrawer .rmd-body');if(b)b.scrollTop=b.scrollHeight;});
  ok(await vis('#rmDrawer [data-buy]')&&await vis('#rmDrawer [data-cancel]'),label+': and when the brushes are scrolled');
  // the item drawer (bed with many parts): close visible
  await ev(()=>{RM.pv=null;RM.sel={t:'item',id:'bed'};renderDrawer();});
  ok(await vis('#rmDrawer [data-close]'),label+': the bed drawer: close is visible');
  // scroll position survives a re-render in the same list
  await ev(()=>{RM.sel=null;RM.list='cat';renderDrawer();const b=document.querySelector('#rmDrawer .rmd-body');b.scrollTop=150;});
  await ev(()=>{renderDrawer();});
  ok(await ev(()=>document.querySelector('#rmDrawer .rmd-body').scrollTop>100),label+': a redraw keeps the scroll position of the list');
  ok(errs.length===0,label+': no page errors'+(errs[0]||''));
  await ctx.close();
}
await run({width:1280,height:700},'large');
await run({width:1280,height:560},'large and short');
await run({width:390,height:760},'phone',true);
await b.close();process.exit(f?1:0);})();
