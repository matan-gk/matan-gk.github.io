// STEP 4: colorable parts. Bed (blanket, sheet, pillow, curtains), plant pots, furniture; options = original / 16 colours / patterns; bought per part, free to switch back.
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:1200,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=300;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();});
const click=async sel=>{await ev(s=>document.querySelector(s).click(),sel);};
const idle=async()=>{for(let i=0;i<60&&await ev(()=>paintBusy());i++)await p.waitForTimeout(100);};
const D=()=>ev(()=>document.getElementById('rmDrawer').textContent);
// pixel helper: the colours of a data URL or file inside the mask part
const stats=(src,maskSrc,part)=>ev(async([src,maskSrc,part])=>{const get=s=>new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const x=c.getContext('2d');x.drawImage(i,0,0);r(x.getImageData(0,0,c.width,c.height).data);};i.src=s;});
  const A=await get(src),M=await get(maskSrc);let n=0,r=0,g=0,bl=0,s2=0;const want={blanket:[1,0,0],sheet:[0,1,0],pillow:[0,0,1],curtain:[1,1,0]}[part];
  for(let i=0;i<A.length;i+=4){if(A[i+3]<128)continue;const m=[M[i]>128?1:0,M[i+1]>128?1:0,M[i+2]>128?1:0];if(m[0]!==want[0]||m[1]!==want[1]||m[2]!==want[2])continue;n++;r+=A[i];g+=A[i+1];bl+=A[i+2];s2+=(A[i]+A[i+1]+A[i+2])/3;}
  let v=0;const mean=s2/n;for(let i=0;i<A.length;i+=4){if(A[i+3]<128)continue;const m=[M[i]>128?1:0,M[i+1]>128?1:0,M[i+2]>128?1:0];if(m[0]!==want[0]||m[1]!==want[1]||m[2]!==want[2])continue;v+=Math.pow((A[i]+A[i+1]+A[i+2])/3-mean,2);}
  return {n,r:r/n,g:g/n,b:bl/n,sd:Math.sqrt(v/n)};},[src,maskSrc,part]);

// data: masks exist for every level, parts have enough pixels, mask lies on light linen only
const md=await ev(async()=>{const out=[];for(let l=1;l<=5;l++){const a=ROOM_ART.bed[l-1];const px=src=>new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const x=c.getContext('2d');x.drawImage(i,0,0);r(x.getImageData(0,0,c.width,c.height).data);};i.src=src;});
  const A=await px(a.src),M=await px(a.mask);const cnt={blanket:0,sheet:0,pillow:0,curtain:0};let dark=0;
  for(let i=0;i<A.length;i+=4){const r=M[i]>128,g=M[i+1]>128,bb=M[i+2]>128;if(!(r||g||bb))continue;const p=r&&g?'curtain':r?'blanket':g?'sheet':'pillow';cnt[p]++;if((A[i]+A[i+1]+A[i+2])/3<105)dark++;}
  out.push({l,cnt,dark,parts:bedParts(l)});}return out;});
ok(md.every(m=>m.parts.every(n=>m.cnt[n]>=250)),'every bed level has its parts in the mask: '+md.map(m=>m.l+':'+Object.values(m.cnt).join('/')).join(' '));
ok(md.every(m=>(m.l>=4)===(m.cnt.curtain>0)),'curtains exist only on levels 4 and 5');
ok(md.every(m=>m.dark<m.cnt.blanket*0.02),'the masks cover only light linen, never wood or outlines: '+md.map(m=>m.dark).join(','));
ok(await ev(()=>ROOM_PATTERNS.length===1&&ROOM_PATTERNS[0].parts.join()==='bed.blanket'&&/^assets\//.test(ROOM_PATTERNS[0].src)),'one pattern (rainbow unicorn), offered on the bed blanket only');
ok(await ev(()=>{const k=partKeys();return k.includes('pot')&&k.includes('bed.pillow')&&k.length===25&&ROOM_CATALOG.filter(hasParts).every(c=>c.base)&&ROOM_CATALOG.filter(c=>!c.base).every(c=>!hasParts(c));}),'12 colorable parts: 4 bed parts, the plants\' pot, 7 furniture surfaces; items without a magenta surface have none');
ok(await ev(()=>[1,2,3,4,5].every(l=>{space.lv.bed=l;return bedSrc(l)===ROOM_ART.bed[l-1].src;})&&(space.lv.bed=1,true)),'the default bed draws the original picture');

// the drawer: the bed keeps its level thumbnails and gains one button per part
await ev(()=>{space.top.bed=5;space.lv.bed=5;RM.sel={t:'item',id:'bed'};rmRedraw();renderDrawer();});
ok(await ev(()=>document.querySelectorAll('#rmDrawer .lvthumb').length===5&&document.querySelectorAll('#rmDrawer .partbtn').length===4),'bed level 5: five level thumbnails and four part buttons (blanket, sheet, pillow, curtains)');
await ev(()=>{space.lv.bed=3;RM.sel={t:'item',id:'bed'};renderDrawer();});
ok(await ev(()=>document.querySelectorAll('#rmDrawer .partbtn').length===3),'bed level 3: three part buttons');
await ev(()=>{space.lv.bed=1;space.top.bed=1;});
// a thing keeps move / put away and gains its part button; one without a magenta surface has none
await ev(()=>{space.things=[{k:'pl00',x:6,y:0},{k:'pl03',x:8,y:0},{k:'toybox1',x:5,y:5},{k:'telescope',x:9,y:9}];RM.sel={t:'thing',i:0};rmRedraw();renderDrawer();});
ok(await ev(()=>!!document.querySelector('#rmDrawer [data-move]')&&!!document.querySelector('#rmDrawer [data-away]')&&document.querySelectorAll('#rmDrawer .partbtn').length===1),'a plant keeps move and put away and gains a pot-color button');
await ev(()=>{RM.sel={t:'thing',i:3};renderDrawer();});
ok(await ev(()=>document.querySelectorAll('#rmDrawer .partbtn').length===0&&!!document.querySelector('#rmDrawer [data-move]')),'an item with no colorable surface has no color button');

// the palette: original + 16 colours (+ patterns where offered); prices; patterns only on the blanket
await ev(()=>{space.lv.bed=1;RM.sel={t:'item',id:'bed'};renderDrawer();});await click('#rmDrawer [data-part=blanket]');
ok(await ev(()=>document.querySelectorAll('#rmDrawer [data-popt]').length===17),'blanket palette: original (as the brush closest to it) + the other 15 colours + the unicorn pattern');
ok(await ev(()=>{const q=document.querySelector('#rmDrawer [data-popt="p:unicorn"] .bp');return !!q&&q.textContent.startsWith('2');}),'the pattern costs 2 tokens and shows its price');
await click('#rmDrawer [data-pback]');await click('#rmDrawer [data-part=sheet]');
ok(await ev(()=>document.querySelectorAll('#rmDrawer [data-popt]').length===16&&!document.querySelector('#rmDrawer [data-popt="p:unicorn"]')),'the sheet palette has no pattern (a pattern may be offered in one place and not another)');
await click('#rmDrawer [data-pback]');

// the original colour is shown as a brush (pre-purchased with the item), never a coloured square; the part buttons are readable in dark mode
await ev(()=>{space.lv.bed=1;RM.sel={t:'item',id:'bed'};renderDrawer();});
ok(await ev(()=>document.querySelectorAll('#rmDrawer .partbtn img.pbrush').length===3&&!document.querySelector('#rmDrawer .partbtn .pdot[style*="background:#fff"]')),'part buttons show the default colour as a brush picture');
await ev(()=>{document.documentElement.dataset.theme='dark';});
ok(await ev(()=>{const c=getComputedStyle(document.querySelector('#rmDrawer .partbtn')).color.match(/\d+/g).map(Number);return (c[0]+c[1]+c[2])/3>170;}),'dark mode: the colour buttons\' text is light');
await ev(()=>{delete document.documentElement.dataset.theme;});
await click('#rmDrawer [data-part=blanket]');
ok(await ev(()=>{const b=document.querySelector('#rmDrawer [data-popt="d"] img');return !!b&&/assets\//.test(b.getAttribute('src'));}),'the original-colour option is a brush picture');
// bed level 5: the mattress between the pillow and the blanket belongs to the sheet, not to the curtains (numbers from the mask picture)
const mk=await ev(async()=>{const src=ROOM_ART.bed[4].mask;const im=new Image();im.src=src;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let sheetNearPillow=0;for(let y=190;y<250;y++)for(let X=145;X<172;X++){const i=(y*c.width+X)*4;if(d[i+1]>200&&d[i]<60&&d[i+2]<60)sheetNearPillow++;}return sheetNearPillow;});
ok(mk>150,'level 5 mask: the mattress under the pillow is sheet-coloured ('+mk+' px)');
await click('#rmDrawer [data-pback]');
// buy a blanket colour: preview first (nothing paid), cancel, then buy; the picture is repainted red in the blanket only
await click('#rmDrawer [data-part=blanket]');
await click('#rmDrawer [data-popt="5"]');await idle();
ok(await ev(()=>RM.pv&&RM.pv.t==='part'&&space.spent===0&&(space.bc.blanket||'d')==='d'),'choosing a new colour is a preview: nothing is paid or saved yet');
const pv1=await stats(await ev(()=>bedSrc(1)),await ev(()=>ROOM_ART.bed[0].mask),'blanket');
ok(pv1.r>pv1.b+25&&pv1.r>pv1.g+25,'the preview paints the blanket red: '+JSON.stringify(pv1));
await click('#rmDrawer [data-cancel]');await idle();
ok(await ev(()=>!RM.pv&&bedSrc(1)===ROOM_ART.bed[0].src),'cancel puts the original back');
await click('#rmDrawer [data-popt="5"]');await click('#rmDrawer [data-buy]');await idle();
ok(await ev(()=>space.spent===1&&space.bc.blanket===5&&space.po['bed.blanket'].includes(5)),'buying a colour costs 1 token and saves it');
const sh=await stats(await ev(()=>bedSrc(1)),await ev(()=>ROOM_ART.bed[0].mask),'sheet'),orig=await stats(await ev(()=>ROOM_ART.bed[0].src),await ev(()=>ROOM_ART.bed[0].mask),'sheet');
ok(Math.abs(sh.r-orig.r)<2&&Math.abs(sh.b-orig.b)<2,'the other parts keep their original colours');
// owned: free to switch, no price; the original is always free
await click('#rmDrawer [data-popt="d"]');
ok(await ev(()=>space.spent===1&&(space.bc.blanket||'d')==='d'),'back to the original is free');
await click('#rmDrawer [data-popt="5"]');
ok(await ev(()=>space.spent===1&&space.bc.blanket===5&&!RM.pv),'an owned colour switches back for free');
// the pattern: bought for 2, the blanket picture has the motifs (much more variation than a flat colour)
await click('#rmDrawer [data-popt="p:unicorn"]');await click('#rmDrawer [data-buy]');await idle();
const pat=await stats(await ev(()=>bedSrc(1)),await ev(()=>ROOM_ART.bed[0].mask),'blanket'),flat=pv1;
ok(await ev(()=>space.spent===3&&space.bc.blanket==='p:unicorn'),'the pattern cost 2 tokens');
ok(pat.b>pat.r&&pat.sd>flat.sd+6,'the blanket shows the unicorn pattern (blue background, much more variation than a flat colour): sd '+pat.sd.toFixed(1)+' vs '+flat.sd.toFixed(1));
// rainbow gives several hues
await click('#rmDrawer [data-popt="15"]');await click('#rmDrawer [data-buy]');await idle();
ok(await ev(()=>space.bc.blanket===15&&space.spent===5),'premium colours (rainbow) cost 2');
// a bed level switch keeps the colours (parts are per bed, not per level) and levels without curtains ignore that part
await ev(()=>{space.top.bed=5;space.po['bed.curtain']=[3];space.bc.curtain=3;space.lv.bed=5;rmRedraw();});await idle();
ok(await ev(()=>bedSrc(5)!==ROOM_ART.bed[4].src&&space.bc.blanket===15),'the bed colours carry over to level 5, with curtains');
await ev(()=>{space.lv.bed=1;space.top.bed=1;});

// plants: one pot colour is bought once and works on every plant; each plant has its own color
await ev(()=>{space.spent=0;space.po={};space.bc={};space.things=[{k:'pl00',x:6,y:0},{k:'pl03',x:8,y:0},{k:'toybox1',x:5,y:5}];RM.sel={t:'thing',i:0};RM.pv=null;rmRedraw();renderDrawer();});
await click('#rmDrawer [data-part=pot]');await click('#rmDrawer [data-popt="7"]');await click('#rmDrawer [data-buy]');await idle();
ok(await ev(()=>space.spent===1&&space.things[0].c===7&&space.things[1].c===undefined),'a pot colour is set on that plant only');
const pot=await ev(async()=>{const c=catOf('pl00'),get=s=>new Promise(r=>{const i=new Image();i.onload=()=>{const k=document.createElement('canvas');k.width=i.naturalWidth;k.height=i.naturalHeight;const x=k.getContext('2d');x.drawImage(i,0,0);r(x.getImageData(0,0,k.width,k.height).data);};i.src=s;});
  const A=await get(c.base),B=await get(thingSrc(c,0)),S=await get(c.src);let n=0,bl=0,rr=0;for(let i=0;i<A.length;i+=4){if(A[i+3]>0&&Math.abs(A[i]-S[i])+Math.abs(A[i+1]-S[i+1])+Math.abs(A[i+2]-S[i+2])>24){n++;bl+=B[i+2];rr+=B[i];}}return {n,b:bl/n,r:rr/n};});
ok(pot.n>300&&pot.b>pot.r+30,'the pot is repainted dark blue: '+JSON.stringify(pot));
await ev(()=>{RM.sel={t:'thing',i:1};RM.pv=null;renderDrawer();});await click('#rmDrawer [data-part=pot]');await click('#rmDrawer [data-popt="7"]');
ok(await ev(()=>space.spent===1&&space.things[1].c===7),'the second plant takes the owned pot colour for free');
// furniture: its own surface key
await ev(()=>{RM.sel={t:'thing',i:2};RM.pv=null;renderDrawer();});await click('#rmDrawer [data-part=toybox1]');
ok(await ev(()=>document.querySelectorAll('#rmDrawer [data-popt]').length===16&&partOwned('toybox1','d')&&!partOwned('toybox1',3)&&partOwned('pot',7)),'the toy box has its own palette; the plants\' pot colour is not owned there');

// saving: unowned or unknown options are dropped, owned ones kept; the state survives a reload
const cl=await ev(()=>{const s=spaceClean({earned:50,unlocked:true,po:{'bed.blanket':[5,'p:unicorn',99,'p:nope'],'bad key!':[1],pot:[7]},bc:{blanket:'p:unicorn',sheet:4,pillow:99},things:[{k:'pl00',x:6,y:0,c:7},{k:'pl03',x:8,y:0,c:3},{k:'toybox1',x:5,y:5,c:'d'}]},['🍪'],0);
  return {po:s.po,bc:s.bc,c:s.things.map(t=>t.c)};});
ok(JSON.stringify(cl.po)==='{"bed.blanket":[5,"p:unicorn"],"pot":[7]}'&&JSON.stringify(cl.bc)==='{"blanket":"p:unicorn"}'&&JSON.stringify(cl.c)==='[7,null,null]','saved data keeps only owned, valid options: '+JSON.stringify(cl));
await ev(()=>{space.po={'bed.blanket':[5],pot:[7]};space.bc={blanket:5};space.things=[{k:'pl00',x:6,y:0,c:7}];space.spent=2;saveState();});
await p.reload();await p.waitForTimeout(500);
ok(await ev(()=>space.bc.blanket===5&&space.things[0].c===7&&space.po.pot.includes(7)),'colors and ownership survive a reload');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
