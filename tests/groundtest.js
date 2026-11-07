// GROUNDING: reads the actual sprite pixels and checks, in room units, that every floor sprite stands on its footprint.
// bottom = lowest opaque point, left/right = outermost opaque points; they must land on the footprint's front / left / right corners.
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
const WIDE={lego:14,sax:30,easel:24,easel2:24};   // tripod legs / a leaning instrument: the lowest pixel is one leg, not the middle
const FLATTOL={mat:16,track2:34};          // oddly shaped flat art (angled mat, looped track) fits its footprint loosely
const TOL={front:12,side:30,spot:[0,18],spotX:12,tall:60};   // tall = the big bed levels 4-5 have a canopy that overhangs the floor block
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);
const rows=await p.evaluate(async()=>{
  const load=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=s;});
  const items=ROOM_CATALOG.map(c=>({id:c.id,src:c.src,r:c.r,fw:fwOf(c),fd:fdOf(c)}));
  ROOM_ART.bed.forEach((a,i)=>items.push({id:'bed'+(i+1),src:a.src,r:a.r,fw:a.fp[0],fd:a.fp[1]}));
  const out=[];
  for(const it of items){
    const im=await load(it.src),W=im.naturalWidth,H=im.naturalHeight,k=document.createElement('canvas');k.width=W;k.height=H;const x=k.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,W,H).data;
    let top=H,bot=-1,l=W,rr=-1;const al=(px,py)=>d[(py*W+px)*4+3]>128;
    for(let py=0;py<H;py++)for(let px=0;px<W;px++)if(al(px,py)){if(py<top)top=py;if(py>bot)bot=py;if(px<l)l=px;if(px>rr)rr=px;}
    // x of the bottom: mean of opaque pixels in the lowest 3 rows
    let sx=0,n=0;for(let py=bot-2;py<=bot;py++)for(let px=0;px<W;px++)if(al(px,py)){sx+=px;n++;}
    // y of the left and right extremes: mean of opaque pixels in the outer 3 columns
    const colY=cx=>{let s=0,m=0;for(let px=cx;px!==cx+3*(cx<W/2?1:-1);px+=(cx<W/2?1:-1))for(let py=0;py<H;py++)if(al(px,py)){s+=py;m++;}return m?s/m:0;};
    const [ox,oy,w,h]=it.r,sc=[w/W,h/H],M=(px,py)=>[ox+px*sc[0],oy+py*sc[1]];
    const F=[50*(it.fw-it.fd),25*(it.fw+it.fd)],Lf=[-50*it.fd,25*it.fd],Rf=[50*it.fw,25*it.fw];
    out.push({id:it.id,fw:it.fw,fd:it.fd,bottom:M(sx/n,bot+1),left:M(l,colY(l)),right:M(rr+1,colY(rr)),F,Lf,Rf});
  }
  return out;});
for(const r of rows){
  const spot=r.fw*r.fd===1;
  if(spot){
    // small items stand on the middle of their cell: the lowest point is at most 18 below the cell's centre (25) and never above it, and on its centre line
    const dy=r.bottom[1]-25,dx=r.bottom[0];
    ok(dy>=TOL.spot[0]&&dy<=TOL.spot[1]&&Math.abs(dx)<=(WIDE[r.id]||TOL.spotX),`${r.id}: stands on its cell centre, lowest point ${dy.toFixed(1)} below it (${dx.toFixed(1)} sideways)`);
    continue;
  }
  const dyF=r.bottom[1]-r.F[1],dxF=r.bottom[0]-r.F[0],ftol=r.id==='bed5'?45:(FLATTOL[r.id]||TOL.front);   // bed5 is a smaller bed centred in its 3 x 4 block: standing on the floor inside the block, so it may stop short of the front corner but never pass it
  // the sprite must touch the floor: its lowest point sits on the footprint's front corner, never floating above or sinking below it
  ok(dyF<=TOL.front&&dyF>=-ftol,`${r.id}: lowest point is ${dyF.toFixed(1)} from the front corner (${dxF.toFixed(1)} sideways), tolerance ${ftol}`);
  const eL=r.left[0]-r.Lf[0],eR=r.right[0]-r.Rf[0],tol=/^bed[45]$/.test(r.id)?TOL.tall:Math.max(TOL.side,FLATTOL[r.id]||0);
  ok(Math.abs(eL)<=tol&&Math.abs(eR)<=tol,`${r.id}: width spans the footprint, left ${eL.toFixed(1)} right ${eR.toFixed(1)}, tolerance ${tol}`);
}
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
