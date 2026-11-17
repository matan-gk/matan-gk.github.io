// Third batch of room items (sheet c1): kids' furniture and play structures, with back pictures; hosts; recolouring; no white left in the gaps of frames
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:1100,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=3000;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();});
const IDS=['beanbag','tent','hammock','ktable','nstand','toyshelf','rhorse','swingset','shopcounter'];
const FP={beanbag:[2,2],tent:[3,3],hammock:[2,2],ktable:[3,3],nstand:[1,1],toyshelf:[2,1],rhorse:[2,1],swingset:[3,2],shopcounter:[3,1]};
const PRICE={beanbag:4,tent:8,hammock:6,ktable:6,nstand:3,toyshelf:5,rhorse:5,swingset:8,shopcounter:7};
ok(await ev(([I,FP,PR])=>I.every(id=>{const c=catOf(id);return c&&c.fw===FP[id][0]*GU&&c.fd===FP[id][1]*GU&&c.p===PR[id]&&c.n&&c.dc&&c.base&&c.ref>0&&c.pk&&PART_NAMES[c.pk]&&c.r[2]>0&&c.r[3]>0;}),[IDS,FP,PRICE]),'the 9 items: footprint (cells x GU), price, Hebrew name, a colourable part with its name');
ok(await ev(I=>new Set(I.map(id=>catOf(id).pk)).size===9&&I.every(id=>!ROOM_CATALOG.filter(c=>c.id!==id).some(c=>c.pk===catOf(id).pk)),IDS),'every item has its own colourable part (nine new keys)');
ok(await ev(()=>['beanbag','tent','hammock','nstand','toyshelf','swingset','shopcounter'].every(id=>catOf(id).back&&catOf(id).back.src&&catOf(id).back.r[2]>0)&&!catOf('ktable').back&&catOf('rhorse').back&&catOf('rhorse').back.src),'8 have a back picture (the kids table is the same from every side)');
ok(await ev(()=>['beanbag','tent','hammock','swingset','shopcounter'].every(id=>catOf(id).back.base&&catOf(id).back.ref>0)&&['nstand','toyshelf'].every(id=>!catOf(id).back.base)),'the back pictures keep the magenta part where it is visible (the drawer and the bins are on the front only)');
ok(await ev(()=>['ktable','nstand','toyshelf'].every(id=>catOf(id).top&&catOf(id).top.z>0)&&['nstand','toyshelf'].every(id=>catOf(id).back.top&&catOf(id).back.top.z>0)&&!catOf('beanbag').top),'the kids table, nightstand and toy shelf are hosts (tops measured, back tops too)');
ok(await ev(()=>ROOM_CATALOG.filter(c=>c.g==='furniture').length>=17&&['rhorse','swingset'].every(id=>catOf(id).g==='play')),'groups: furniture and play');
// no white left behind in the gaps of frames
const white=await ev(async I=>{const out={};for(const id of I){const im=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=catOf(id).src;});const cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;const x=cv.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,cv.width,cv.height).data;let op=0,w=0;for(let i=0;i<d.length;i+=4){if(d[i+3]>200){op++;if(d[i]>245&&d[i+1]>245&&d[i+2]>245)w++;}}out[id]=w/op;}return out;},['hammock','rhorse','swingset']);
ok(Object.values(white).every(v=>v<0.015),'the gaps in the swing frame, hammock stand and rocking horse are transparent, not white: '+JSON.stringify(white,(k,v)=>typeof v==='number'?Math.round(v*1000)/10+'%':v));
// recolouring: a part key bought once recolours the picture
const diff=await ev(async()=>{const c=catOf('beanbag');const u=await paintItem(c,ROOM_COLORS.findIndex(q=>/^#/.test(q.h)&&parseInt(q.h.slice(5,7),16)>180&&parseInt(q.h.slice(1,3),16)<120));const a=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=u;});const b2=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=c.src;});const g=im=>{const cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;const x=cv.getContext('2d');x.drawImage(im,0,0);return x.getImageData(0,0,cv.width,cv.height).data;};const A=g(a),B=g(b2);let n=0;for(let i=0;i<A.length;i+=4)if(A[i+3]>0&&Math.abs(A[i]-B[i])+Math.abs(A[i+2]-B[i+2])>60)n++;return n;});
ok(diff>4000,'the bean bag repaints blue ('+diff+' pixels changed)');
// placing and standing things on the hosts, and turning the host with the thing on it
const set=th=>ev(th=>{space.things=th;space.spent=0;space.fix={bed:{x:0,y:0},window:{w:'r',u:WIN_U}};space.lv.bed=1;space.top.bed=1;settleSurfaces();RM.sel=null;RM.pl=null;rmRedraw();},th);
const S=await ev(()=>GU);
for(const [host,dx,dy,x,y] of [['nstand',0,0,6,6],['toyshelf',1,0,6,6],['ktable',S,S,4,4]]){
  await set([{k:host,x:x*S/2*0+x,y,u:'hh'},{k:'teddy',x:0,y:0,u:'tt',on:{h:'hh',dx,dy}}]);
  ok(await ev(()=>{const t=space.things[1];return !!t.on&&t.on.h==='hh';}),host+': a teddy stays on its top');
  const looks=[];
  for(let n=0;n<4;n++){ looks.push(await ev(()=>({o:space.things[0].o||0,on:!!space.things[1].on}))); if(n<3){ await ev(()=>{RM.sel={t:'thing',i:0};rmRedraw();renderDrawer();}); const h=await ev(()=>!!document.querySelector('#rmDrawer [data-turn]')); if(!h) break; await ev(()=>document.querySelector('#rmDrawer [data-turn]').click()); } }
  ok(looks.every(l=>l.on),host+': the teddy stays on while the host turns ('+looks.map(l=>l.o).join(',')+')');
}
ok(errs.length===0,'no page errors '+errs.join(';'));
await b.close();process.exit(f?1:0);})();
