// full turning (phase 2): items with a back picture cycle through four looks: as drawn, mirrored, back, back mirrored.
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:1100,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=2000;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();});
const set=things=>ev(th=>{space.things=th;space.spent=0;space.fix={bed:{x:0,y:0},window:{w:'r',u:WIN_U}};space.lv.bed=1;space.top.bed=1;settleSurfaces();RM.sel=null;RM.pl=null;RM.list=null;RM.note=null;rmRedraw();renderDrawer();},things);
const click=sel=>ev(s=>document.querySelector(s).click(),sel);
const BACK=['toybox1','toybox2','toybox3','cloud','wardrobe','wardrobe2','bookshelf','piano','dollhouse','mirror'];
// the catalog
ok(await ev(B=>B.every(id=>catOf(id).back&&oStates(catOf(id))===4)&&['chair','desk','table','armchair'].every(id=>!catOf(id).back&&oStates(catOf(id))===2),BACK),'the '+BACK.length+' items with a back picture have four looks; the others two');
ok(await ev(async B=>{const load=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i.naturalWidth);i.onerror=()=>r(0);i.src=s;});for(const id of B){const k=catOf(id).back;if(!(await load(k.src)) || (k.base&&!(await load(k.base))) || !(k.r.length===4&&k.r[2]>0&&k.r[3]>0)) return false;}return true;},BACK),'every back picture loads and has a placement');
ok(await ev(()=>ROOM_CATALOG.every(c=>!c.back||!c.top||c.back.top)),'a host with a back picture has its top measured on it');
ok(await ev(()=>fpOf(catOf('wardrobe'),0).join('x')==='4x2'&&fpOf(catOf('wardrobe'),1).join('x')==='2x4'&&fpOf(catOf('wardrobe'),2).join('x')==='4x2'&&fpOf(catOf('wardrobe'),3).join('x')==='2x4'),'the back look has the same footprint, the mirrored back the swapped one');
// drawing: which picture, mirrored or not, where
const draw=()=>ev(()=>{const g=document.querySelector('#rmSvg [data-hit="thing:0"]'),im=g.querySelector('image');return {href:im.getAttribute('href'),ix:+im.getAttribute('x'),w:+im.getAttribute('width'),mir:/scale\(-1 1\)/.test(im.getAttribute('transform')||'')};});
await set([{k:'wardrobe',x:10,y:8,u:'w1'}]);
await ev(()=>{RM.sel={t:'thing',i:0};rmRedraw();renderDrawer();});
const looks=[];
for(let n=0;n<5;n++){ looks.push(await ev(()=>({o:space.things[0].o||0,x:space.things[0].x,y:space.things[0].y,fp:footOf(space.things[0]).join('x')})).then(async s=>({...s,...(await draw())}))); if(n<4) await click('[data-turn="0"]'); }
const W=await ev(()=>({f:catOf('wardrobe').src,k:catOf('wardrobe').back.src}));
ok(looks.map(l=>l.o).join()==='0,1,2,3,0','a turn cycles the looks 0,1,2,3 and back to 0: '+looks.map(l=>l.o).join());
ok(looks[0].href===W.f&&!looks[0].mir&&looks[1].href===W.f&&looks[1].mir,'looks 0 and 1 draw the front picture, the second mirrored');
ok(looks[2].href===W.k&&!looks[2].mir&&looks[3].href===W.k&&looks[3].mir&&looks[4].href===W.f&&!looks[4].mir,'looks 2 and 3 draw the back picture, the second mirrored; then the front again');
ok(looks.map(l=>l.fp).join()==='4x2,2x4,4x2,2x4,4x2','footprints follow: '+looks.map(l=>l.fp).join());
ok(Math.abs((looks[4].x-looks[0].x))<=0&&Math.abs(looks[4].y-looks[0].y)<=0,'after four turns it is back on its place ('+looks[0].x+','+looks[0].y+')');
// the back picture lands on the footprint like the front one: same left / right margins (wardrobe is a plain box)
const m=await ev(()=>{const c=catOf('wardrobe'),out={};for(const o of [0,2]){const [fw,fd]=fpOf(c,o),r=lookOf(c,o).r;out[o]=[r[0]+UX*fd,UX*fw-(r[0]+r[2])];}return out;});
ok(Math.abs(m[0][0]-m[2][0])<8&&Math.abs(m[0][1]-m[2][1])<8,'the back picture spans the same width of the footprint as the front: margins '+JSON.stringify(m));
// painting: a colourable back picture is repainted from its own base
await set([{k:'dollhouse',x:10,y:8,u:'d1',c:5}]);
await ev(()=>{space.po[partKeyOf(catOf('dollhouse'))]=[...(space.po[partKeyOf(catOf('dollhouse'))]||[]),5];rmRedraw();});
await p.waitForFunction(()=>window.paintBusy()===0,null,{timeout:8000});await p.waitForTimeout(200);
const fr=(await draw()).href;
await ev(()=>{space.things[0].o=2;rmRedraw();});await p.waitForFunction(()=>window.paintBusy()===0,null,{timeout:8000});await p.waitForTimeout(200);
const bk=(await draw()).href;
ok(/^data:/.test(fr)&&/^data:/.test(bk)&&fr!==bk,'a coloured dollhouse is repainted in both looks, each from its own picture');
ok(await ev(()=>thingSrc(catOf('wardrobe'),null,2)===catOf('wardrobe').back.src),'a back picture without a colourable part is used as it is');
// turning while placing
await set([]);
await ev(()=>{RM.pl={k:'piano',i:-1,x:6,y:6,o:0};rmRedraw();renderDrawer();});
for(let n=0;n<3;n++) await click('[data-pturn]');
ok(await ev(()=>RM.pl.o===3&&fpOf(catOf('piano'),RM.pl.o).join('x')==='4x8'),'while placing, three turns show the mirrored back and the swapped footprint');
await ev(()=>{const g=document.querySelector('#rmSvg .rmghost image');window.__g=[g.getAttribute('href'),/scale\(-1 1\)/.test(g.getAttribute('transform')||'')];});
ok(await ev(()=>window.__g[0]===catOf('piano').back.src&&window.__g[1]),'and the ghost is the mirrored back picture');
await click('[data-place]');
ok(await ev(()=>space.things.length===1&&space.things[0].o===3),'it is placed in that look');
// what lies on a host through the four looks (a desk given a back picture of its own for this test: the maths is the same for any host)
await ev(()=>{const d=catOf('desk');d.back={src:d.src,r:d.r,top:d.top};});
await set([{k:'desk',x:6,y:4,u:'dk1'},{k:'teddy',x:0,y:0,u:'t1',on:{h:'dk1',dx:2,dy:1}},{k:'mirror',x:0,y:0,u:'m1',on:{h:'dk1',dx:0,dy:6}}]);
const W0=4,D0=8,sz=[2,2],sm=[2,2];
const abs=(k,dx,dy,w,d)=>k===0?[dx,dy]:k===1?[dy,dx]:k===2?[W0-dx-w,D0-dy-d]:[D0-dy-d,W0-dx-w];
await ev(()=>{RM.sel={t:'thing',i:0};rmRedraw();renderDrawer();});
let good=true,why='';
for(let k=0;k<=4;k++){ const st=await ev(()=>({o:space.things[0].o||0,s:space.things.slice(1).map(t=>({dx:t.on.dx,dy:t.on.dy,o:t.o||0})),fit:space.things.slice(1).every((t,i)=>surfFree(catOf(t.k),'dk1',t.on.dx,t.on.dy,i+1,undefined,t.o))}));
  const kk=k%4,e1=abs(kk,2,1,2,2),e2=abs(kk,0,6,2,2);
  if(st.o!==kk||st.s[0].dx!==e1[0]||st.s[0].dy!==e1[1]||st.s[1].dx!==e2[0]||st.s[1].dy!==e2[1]||!st.fit){good=false;why+=' look '+kk+': '+JSON.stringify(st)+' want '+JSON.stringify([e1,e2]);}
  if(k<4) await click('[data-turn="0"]'); }
ok(good,'things on a host move like the host through all four looks and come back'+why);
const own=await ev(()=>space.things.slice(1).map(t=>t.o||0));
ok(own.join()==='0,0','after the full cycle they are as they started ('+own+')');
await click('[data-turn="0"]');
ok(await ev(()=>space.things[1].o===1&&space.things[2].o===1),'a thing turns with its host: one turn mirrors it');
await click('[data-turn="0"]');
ok(await ev(()=>(space.things[1].o||0)===0&&space.things[2].o===2),'two turns: the teddy (no back picture) looks as drawn again, the mirror shows its back');
await ev(()=>{delete catOf('desk').back;});
// saves
const sv=await ev(()=>{const s=spaceClean({earned:5,things:[{k:'wardrobe',x:2,y:2,u:'a',o:2},{k:'piano',x:8,y:8,u:'b',o:3},{k:'chair',x:12,y:2,u:'c',o:2},{k:'desk',x:2,y:12,u:'d',o:3}]},[],0);return s.things.map(t=>[t.k,t.o||0]);});
ok(JSON.stringify(sv)==='[["wardrobe",2],["piano",3],["chair",0],["desk",1]]','saves keep the four looks of an item with a back picture; for the others a half turn is the same look ('+JSON.stringify(sv)+')');
ok(errs.length===0,'no page errors'+(errs[0]||''));
await b.close();process.exit(f?1:0);})();
