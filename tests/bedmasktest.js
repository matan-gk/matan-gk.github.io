// the bed's part masks follow the marks the owner drew (b = blanket, s = sheet, p = pillow): the fold band along the blanket's top edge is blanket, the bit of sheet left of the pillow is sheet
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:1100,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);
const cls=await p.evaluate(async()=>{const out=[];for(const a of ROOM_ART.bed){const im=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=a.mask;});const cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;const cx=cv.getContext('2d');cx.drawImage(im,0,0);const d=cx.getImageData(0,0,cv.width,cv.height).data;
  const at=(x,y)=>{const i=(y*cv.width+x)*4;const r=d[i]>128,g=d[i+1]>128,b=d[i+2]>128;return r&&g?'curtain':r?'blanket':g?'sheet':b?'pillow':'none';};
  // pixels of each part, and the pillow's connected pieces
  const seen=new Uint8Array(cv.width*cv.height);let small=0;
  for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++){if(seen[y*cv.width+x]||at(x,y)!=='pillow')continue;let n=0;const st=[[x,y]];seen[y*cv.width+x]=1;while(st.length){const [a,c]=st.pop();n++;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=a+dx,Y=c+dy;if(X<0||Y<0||X>=cv.width||Y>=cv.height||seen[Y*cv.width+X]||at(X,Y)!=='pillow')continue;seen[Y*cv.width+X]=1;st.push([X,Y]);}}if(n>20&&n<300)small++;}
  out.push({pts:{fold:at(91,74),lobe:at(99,60),pillow:at(128,65),blanket:at(74,105),side:at(161,91)},small});}return out;});
const L1=cls[0].pts;
ok(L1.fold==='blanket','level 1: the fold band is blanket ('+L1.fold+')');
ok(L1.lobe==='sheet','level 1: the bit left of the pillow is sheet ('+L1.lobe+')');
ok(L1.pillow==='pillow'&&L1.blanket==='blanket'&&L1.side==='sheet','level 1: pillow, blanket and the sheet at the side are as before');
ok(cls.every(c=>c.small===0),'no small stray pillow pieces on any level');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
