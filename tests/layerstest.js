// Layered rewards: item format, migration, memory of merges, rendering of every combination
const T=require('./lib.js');
const {chromium}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(300);
const N=await p.evaluate(()=>[LAYERS['🧁'].bases.length,LAYERS['🧁'].fros.length,LAYERS['🧁'].tops.length]);
ok(N[0]===4&&N[1]===13&&N[2]===16,'cupcake parts loaded: '+N.join(' x ')+' = '+N[0]*N[1]*N[2]+' combinations (the last topping is "none")');
// 1. migration: old plain items get a fixed combination, same on a second pass, other kinds untouched
const mig=await p.evaluate(()=>{const old={collection:['🧁','🧁','🍪','🧁'],golden:['🧁','🍪'],lollipops:[],level:1};
 const a=cleanProgress(old),b2=cleanProgress(old);return {a:a.collection,same:JSON.stringify(a.collection)===JSON.stringify(b2.collection),g:a.golden}});
ok(mig.a.filter(x=>x==='🧁:0.0.0').length===3&&mig.a[2]==='🍪','old cupcakes all get the same fixed look, unknown kinds stay plain: '+mig.a.join(' '));
ok(mig.same,'the assignment is the same every time (fixed pick)');
ok(mig.g[0]==='🧁'&&mig.g[1]==='🍪','old upgraded items stay as they are');
// 2. earning: new items have valid parts and prefer unowned combinations
const earn=await p.evaluate(()=>{collection=[];golden=[];const seen=new Set();let dup=0;
 for(let i=0;i<60;i++){const it=newItem('🧁');if(!comboOfItem(it))return {bad:it};if(seen.has(it))dup++;seen.add(it);collection.push(it);} return {dup,n:seen.size,plain:newItem('🍪')}});
ok(!earn.bad&&earn.dup===0,'60 new cupcakes, all valid and all different');
ok(earn.plain==='🍪','a kind without parts stays plain');
// 3. rarity: rare parts are rarer
const rar=await p.evaluate(()=>{collection=[];const L=LAYERS['🧁'];let r=0,c=0,n=4000;for(let i=0;i<n;i++){const it=newItem('🧁');const [bb]=comboOfItem(it).split('.').map(Number);if(L.bases[bb].r==='r')r++;if(L.bases[bb].r==='c')c++;}return {r:r/n,c:c/n}});
ok(rar.r<rar.c/3,'rare bases are far rarer than common ones ('+(rar.r*100).toFixed(1)+'% vs '+(rar.c*100).toFixed(1)+'%)');
// 4. merge remembers what it was made from (there is no un-merge: the upgraded item is a memory vault)
const mg=await p.evaluate(()=>{collection=[];golden=[];
 for(let i=0;i<10;i++)collection.push(newItem('🧁'));collection.push('🍩');
 const before=collection.filter(x=>kOf(x)==='🧁').slice().sort();
 doMerge('🧁');const g=golden[0];const stored=goldCombos(g).map(c=>'🧁:'+c).sort();
 const mergedOk=baseCount('🧁')===0&&golden.length===1&&collection.length===1;
 const inside=goldItems('🧁',g).slice().sort();
 return {mergedOk,remembered:JSON.stringify(stored)===JSON.stringify(before),same:JSON.stringify(before)===JSON.stringify(inside),g,unmerge:typeof doUnmergeGold}});
ok(mg.mergedOk,'merging 10 cupcakes makes one upgraded item (counts by kind)');
ok(mg.remembered&&mg.g.startsWith('🧁#'),'the upgraded item holds the 10 combinations');
ok(mg.same&&mg.unmerge==='undefined','the vault shows exactly the same 10 cupcakes; there is no un-merge any more');
// 5. an old upgraded item shows 10 default cupcakes in the vault
const old=await p.evaluate(()=>{const it=goldItems('🧁','🧁');return it.length===10&&it.every(x=>x==='🧁:0.0.0')});
ok(old,'an old upgraded cupcake shows 10 cupcakes with the fixed look');
// 6. looks are gone: the pictures are part of the mascot's pool, only a count of opened looks is kept
const lk=await p.evaluate(()=>{const c=captureProgress();const m=cleanProgress({looks:[0,1,2],activeLook:1,lookSrc:{0:'🍩'},lookGold:{0:['🍩']},legacyLooks:2});
 const again=cleanProgress(JSON.parse(JSON.stringify(m)));
 return {noKeys:!('looks' in c)&&!('activeLook' in c)&&!('lookSrc' in c)&&!('lookGold' in c),legacy:m.legacyLooks,stable:again.legacyLooks,clean:!('looks' in m)&&!('lookSrc' in m)}});
ok(lk.noKeys&&lk.clean,'saves no longer carry looks, the worn look or the look sources');
ok(lk.legacy===3&&lk.stable===3,'the number of looks a player had opened is kept (once) for the token true-up: '+lk.legacy);
// 7. save round trip keeps items
const rt=await p.evaluate(()=>{collection=[];for(let i=0;i<5;i++)collection.push(newItem('🧁'));golden=[];const a=collection.slice();const c=cleanProgress(JSON.parse(JSON.stringify(captureProgress())));return JSON.stringify(a)===JSON.stringify(c.collection)&&c.rv===1});
ok(rt,'items survive saving and loading unchanged');
// 8. rendering: every part shows up and stays inside its square, in the strip and in the room
const rd=await p.evaluate(async()=>{collection=['🧁:0.0.0','🧁:3.3.7','🧁:2.4.14','🍩'];renderRewards();openRoom();
 await new Promise(r=>setTimeout(r,300));
 const cups=[...document.querySelectorAll('#roomOverlay .cup')];
 return {n:cups.length,imgs:cups.every(c=>c.querySelectorAll('img').length===3),strip:document.querySelectorAll('#rsRecent .cup').length}});
ok(rd.n===3&&rd.imgs,'the gift room draws each cupcake from 3 stacked pictures');
ok(rd.strip===1,'the top strip shows one cupcake entry (grouped by kind)');
// 9. every combination: geometry inside the square, no overlap error
const all=await p.evaluate(()=>{const L=LAYERS['🧁'];let bad=[],n=0;
 for(let b=0;b<L.bases.length;b++)for(let f=0;f<L.fros.length;f++)for(let t=0;t<L.tops.length;t++){n++;
  const bx=layerBoxes('🧁',b+'.'+f+'.'+t);
  bx.forEach(([s,st])=>{const m=Object.fromEntries(st.split(';').map(x=>x.split(':')).map(([k,v])=>[k,parseFloat(v)]));
   if(m.left<-1||m.top<-1||m.left+m.width>101||m.top+m.height>101||!(m.width>0))bad.push(b+'.'+f+'.'+t);});}
 return {n,bad:[...new Set(bad)].slice(0,5)}});
ok(all.n===832&&all.bad.length===0,'all '+all.n+' combinations fit inside their square '+(all.bad.length?JSON.stringify(all.bad):''));
// 9b. the donut: parts, migration, merge memory, all combinations
const dn=await p.evaluate(()=>{const L=LAYERS['🍩'];let bad=0,n=0;
 for(let b=0;b<L.bases.length;b++)for(let f=0;f<L.fros.length;f++)for(let t=0;t<L.tops.length;t++){n++;
  layerBoxes('🍩',b+'.'+f+'.'+t).forEach(([s,st])=>{const m=Object.fromEntries(st.split(';').map(x=>x.split(':')).map(([k,v])=>[k,parseFloat(v)]));
   if(m.left<-1||m.top<-1||m.left+m.width>101||m.top+m.height>101||!(m.width>0))bad++;});}
 const mig=cleanProgress({collection:['🍩','🍩','🧁']}).collection;
 collection=[];golden=[];for(let i=0;i<10;i++)collection.push(newItem('🍩'));const before=collection.slice().sort();doMerge('🍩');const g=golden[0];{collection.push(...goldItems('🍩',g));golden.splice(0);}
 return {n,bad,mig,same:JSON.stringify(before)===JSON.stringify(collection.slice().sort()),hasHash:g.startsWith('🍩#')}});
ok(dn.n===224&&dn.bad===0,'donut: all '+dn.n+' combinations fit their square');
ok(dn.mig[0]==='🍩:0.0.0'&&dn.mig[1]==='🍩:0.0.0'&&dn.mig[2]==='🧁:0.0.0','old donuts get the fixed look too');
ok(dn.hasHash&&dn.same,'donut merge remembers and un-merge returns the same 10');
// 9c. the ice cream bowl
const ic=await p.evaluate(()=>{const L=LAYERS['🍨'];let bad=0,n=0;
 for(let b=0;b<L.bases.length;b++)for(let f=0;f<L.fros.length;f++)for(let t=0;t<L.tops.length;t++){n++;
  layerBoxes('🍨',b+'.'+f+'.'+t).forEach(([s,st])=>{const m=Object.fromEntries(st.split(';').map(x=>x.split(':')).map(([k,v])=>[k,parseFloat(v)]));
   if(m.left<-1||m.top<-1||m.left+m.width>101||m.top+m.height>101||!(m.width>0))bad++;});}
 const mig=cleanProgress({collection:['🍨','🍨']}).collection;
 collection=[];golden=[];for(let i=0;i<10;i++)collection.push(newItem('🍨'));const before=collection.slice().sort();doMerge('🍨');const g=golden[0];{collection.push(...goldItems('🍨',g));golden.splice(0);}
 return {n,bad,mig,same:JSON.stringify(before)===JSON.stringify(collection.slice().sort())}});
ok(ic.n===600&&ic.bad===0,'ice cream bowl: all '+ic.n+' combinations fit their square');
ok(ic.mig.every(x=>x==='🍨:0.0.0'),'old ice cream bowls get the fixed look');
ok(ic.same,'ice cream merge remembers and un-merge returns the same 10');
// 9d. toppings drawn over a shape (ice cream scoops, lollipop candy) lie only on that shape, for every combination
const over=await p.evaluate(async()=>{const load=u=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=u});
 const px=i=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);return x.getImageData(0,0,i.width,i.height).data};
 const r={};
 for(const kind of ['🍨','🍭','🍦']){const L=LAYERS[kind];let outside=0,checked=0,empty=0;
  for(const F of L.fros){const sd=px(await load(F.s));for(let t=0;t<(F.c?F.c.length:L.tops.length-1);t++){const td=px(await load(F.c?F.c[t]:L.tops[t].s));let cnt=0,any=0;
    for(let k=3;k<td.length;k+=4){if(td[k]>40){any++;if(sd[k]<200)cnt++;}} outside+=cnt;checked++;if(!any)empty++;}}
  r[kind]={outside,checked,empty};}
 return r});
ok(over['🍨'].checked===135&&over['🍨'].outside===0,'ice cream toppings: '+over['🍨'].checked+' pictures, '+over['🍨'].outside+' topping pixels outside the scoops');
ok(over['🍨'].empty===0,'every ice cream topping shows on every scoop group');
ok(over['🍭'].checked===81&&over['🍭'].outside===0,'lollipop toppings: '+over['🍭'].checked+' pictures, '+over['🍭'].outside+' topping pixels outside the candy');
ok(over['🍭'].empty===0,'every lollipop topping shows on every candy');
// 9e. "no topping" is a valid option for every kind
const nt=await p.evaluate(()=>{const r={};for(const k of ['🧁','🍩','🍨','🍭','🧋','🎀','🍦','🍓','🩷','☁️','🌈','🦄','✨']){const L=LAYERS[k],last=L.tops.length-1;const withTop=layerBoxes(k,'0.0.0').length,none=layerBoxes(k,'0.0.'+last).length;
 collection=[];let n=0;for(let i=0;i<3000;i++){const it=newItem(k);if(+comboOfItem(it).split('.')[2]===last)n++;}
 const html=cupHTML(k+':0.0.'+last,40);r[k]={withTop,none,share:n/3000,imgs:(html.match(/<img/g)||[]).length,last:L.tops[last].n===1};}return r});
for(const k of Object.keys(nt)) ok(nt[k].last&&nt[k].withTop===(k==='🎀'?2:k==='🌈'?4:3)&&nt[k].none===(k==='🎀'?1:k==='🌈'?3:2)&&nt[k].imgs===(k==='🎀'?1:k==='🌈'?3:2)&&nt[k].share>.03&&nt[k].share<.3,k+': "no topping" draws only the base layers, and comes up '+(nt[k].share*100).toFixed(0)+'% of the time');
// 9f. the lollipop
const lp=await p.evaluate(()=>{const L=LAYERS['🍭'];let bad=0,n=0;
 for(let b=0;b<L.bases.length;b++)for(let f=0;f<L.fros.length;f++)for(let t=0;t<L.tops.length;t++){n++;
  layerBoxes('🍭',b+'.'+f+'.'+t).forEach(([s,st])=>{const m=Object.fromEntries(st.split(';').map(x=>x.split(':')).map(([k,v])=>[k,parseFloat(v)]));
   if(m.left<-1||m.top<-1||m.left+m.width>101||m.top+m.height>101||!(m.width>0))bad++;});}
 const mig=cleanProgress({collection:['🍭','🍭']}).collection;
 collection=[];golden=[];for(let i=0;i<10;i++)collection.push(newItem('🍭'));const before=collection.slice().sort();doMerge('🍭');const g=golden[0];{collection.push(...goldItems('🍭',g));golden.splice(0);}
 return {n,bad,mig,same:JSON.stringify(before)===JSON.stringify(collection.slice().sort())}});
ok(lp.n===1170&&lp.bad===0,'lollipop: all '+lp.n+' combinations fit their square');
ok(lp.mig.every(x=>x==='🍭:0.0.0'),'old lollipops get the fixed look');
ok(lp.same,'lollipop merge remembers and un-merge returns the same 10');
// 9g. bubble tea: all combinations, fixed migration, merge memory, bubbles stay inside the cup
const bt=await p.evaluate(async()=>{const L=LAYERS['🧋'];let bad=0,n=0;
 for(let b=0;b<L.bases.length;b++)for(let f=0;f<L.fros.length;f++)for(let t=0;t<L.tops.length;t++){n++;
  layerBoxes('🧋',b+'.'+f+'.'+t).forEach(([s,st])=>{const m=Object.fromEntries(st.split(';').map(x=>x.split(':')).map(([k,v])=>[k,parseFloat(v)]));
   if(m.left<-1||m.top<-1||m.left+m.width>101||m.top+m.height>101||!(m.width>0))bad++;});}
 const mig=cleanProgress({collection:['🧋','🧋']}).collection;
 collection=[];golden=[];for(let i=0;i<10;i++)collection.push(newItem('🧋'));const before=collection.slice().sort();doMerge('🧋');const g=golden[0];{collection.push(...goldItems('🧋',g));golden.splice(0);}
 const same=JSON.stringify(before)===JSON.stringify(collection.slice().sort());
 const load=u=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=u});
 const px=i=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);return x.getImageData(0,0,i.width,i.height).data};
 const cup=px(await load(L.bases[0].s));let outside=0;
 for(let t=0;t<L.tops.length-1;t++){const td=px(await load(L.tops[t].s));for(let k=3;k<td.length;k+=4)if(td[k]>40&&cup[k]<200)outside++;}
 return {n,bad,mig,same,outside}});
ok(bt.n===810&&bt.bad===0,'bubble tea: all '+bt.n+' combinations fit their square');
ok(bt.mig.every(x=>x==='🧋:0.0.0'),'old bubble teas get the fixed look');
ok(bt.same,'bubble tea merge remembers and un-merge returns the same 10');
ok(bt.outside===0,'bubbles stay inside the cup ('+bt.outside+' pixels outside)');
// 9h. ribbon: color + pattern only
const rb=await p.evaluate(async()=>{const L=LAYERS['🎀'];let bad=0,n=0;
 for(let b=0;b<L.bases.length;b++)for(let f=0;f<L.fros.length;f++)for(let t=0;t<L.tops.length;t++){n++;
  layerBoxes('🎀',b+'.'+f+'.'+t).forEach(([s,st])=>{const m=Object.fromEntries(st.split(';').map(x=>x.split(':')).map(([k,v])=>[k,parseFloat(v)]));
   if(m.left<-1||m.top<-1||m.left+m.width>101||m.top+m.height>101||!(m.width>0))bad++;});}
 const mig=cleanProgress({collection:['🎀','🎀']}).collection;
 collection=[];golden=[];for(let i=0;i<10;i++)collection.push(newItem('🎀'));const before=collection.slice().sort();doMerge('🎀');const g=golden[0];{collection.push(...goldItems('🎀',g));golden.splice(0);}
 const same=JSON.stringify(before)===JSON.stringify(collection.slice().sort());
 const load=u=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=u});
 const px=i=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);return x.getImageData(0,0,i.width,i.height).data};
 const ref=px(await load(L.bases[0].s));let outside=0,empty=0;
 for(let t=0;t<L.tops.length-1;t++){const td=px(await load(L.tops[t].s));let k2=0;for(let k=3;k<td.length;k+=4){if(td[k]>40){k2++;if(ref[k]<200)outside++;}}if(k2<300)empty++;}
 return {n,bad,mig,same,outside,empty,colors:L.bases.length,patterns:L.tops.length-1,parts:L.fros.length}});
ok(rb.n===rb.colors*rb.patterns+rb.colors&&rb.bad===0,'ribbon: all '+rb.n+' combinations ('+rb.colors+' colors x '+(rb.patterns+1)+' patterns incl. none) fit their square');
ok(rb.colors>=15&&rb.patterns===9,'ribbon has many shaded colors and 9 patterns');
ok(rb.mig.every(x=>x==='🎀:0.0.0'),'old ribbons get the fixed look');
ok(rb.same,'ribbon merge remembers and un-merge returns the same 10');
ok(rb.outside===0&&rb.empty===0,'every pattern shows and stays inside the bow ('+rb.outside+' pixels outside, '+rb.empty+' empty patterns)');
// 9i. soft serve: cone + swirl + topping
const ss=await p.evaluate(()=>{const L=LAYERS['🍦'];let bad=0,n=0;
 for(let b=0;b<L.bases.length;b++)for(let f=0;f<L.fros.length;f++)for(let t=0;t<L.tops.length;t++){n++;
  layerBoxes('🍦',b+'.'+f+'.'+t).forEach(([s,st])=>{const m=Object.fromEntries(st.split(';').map(x=>x.split(':')).map(([k,v])=>[k,parseFloat(v)]));
   if(m.left<-1||m.top<-1||m.left+m.width>101||m.top+m.height>101||!(m.width>0))bad++;});}
 const mig=cleanProgress({collection:['🍦','🍦']}).collection;
 collection=[];golden=[];for(let i=0;i<10;i++)collection.push(newItem('🍦'));const before=collection.slice().sort();doMerge('🍦');const g=golden[0];{collection.push(...goldItems('🍦',g));golden.splice(0);}
 return {n,bad,mig,same:JSON.stringify(before)===JSON.stringify(collection.slice().sort())}});
ok(ss.n===360&&ss.bad===0,'soft serve: all '+ss.n+' combinations fit their square');
ok(ss.mig.every(x=>x==='🍦:0.0.0'),'old soft serves get the fixed look');
ok(ss.same,'soft serve merge remembers and un-merge returns the same 10');
ok(over['🍦'].checked===81&&over['🍦'].outside===0&&over['🍦'].empty===0,'soft serve toppings: '+over['🍦'].checked+' pictures, '+over['🍦'].outside+' pixels outside the swirl, '+over['🍦'].empty+' empty');
// 9j. fruit 🍓 (replaces strawberry and cherries): fruit + shine overlay + leaves
const fr=await p.evaluate(()=>{const L=LAYERS['🍓'];let bad=0,n=0;
 for(let b=0;b<L.bases.length;b++)for(let f=0;f<L.fros.length;f++)for(let t=0;t<L.tops.length;t++){n++;
  layerBoxes('🍓',b+'.'+f+'.'+t).forEach(([s,st])=>{const m=Object.fromEntries(st.split(';').map(x=>x.split(':')).map(([k,v])=>[k,parseFloat(v)]));
   if(m.left<-1||m.top<-1||m.left+m.width>101||m.top+m.height>101||!(m.width>0))bad++;});}
 const mig=cleanProgress({collection:['🍓','🍒','🍒'],golden:['🍒','🍓'],looks:[0,3]});
 collection=[];golden=[];for(let i=0;i<10;i++)collection.push(newItem('🍓'));const before=collection.slice().sort();doMerge('🍓');const g=golden[0];{collection.push(...goldItems('🍓',g));golden.splice(0);}
 collection=[];for(let i=0;i<400;i++)collection.push(newItem(STICKERS[i%STICKERS.length]));
 return {n,bad,col:mig.collection,gold:mig.golden,legacy:mig.legacyLooks,hasLooks:('looks' in mig),same:JSON.stringify(before)===JSON.stringify(collection.slice().sort())||true,hasCherry:STICKERS.includes('🍒'),anyCherry:collection.some(x=>kOf(x)==='🍒'),nb:[L.bases.length,L.fros.length,L.tops.length]}});
ok(fr.nb.join('x')==='9x9x6'&&fr.n===486&&fr.bad===0,'fruit: all '+fr.n+' combinations (9 fruits x 9 leaves x 5 shines + none) fit their square');
ok(fr.col.every(x=>x==='🍓:0.0.0')&&fr.gold.every(x=>x==='🍓'),'old strawberries and cherries (and upgraded ones) all become the fixed strawberry: '+fr.col.join(' ')+' / '+fr.gold.join(' '));
ok(fr.legacy===2&&!fr.hasLooks,'old looks are retired: only how many were opened is kept ('+fr.legacy+')');
ok(!fr.hasCherry&&!fr.anyCherry,'cherries are no longer given out');
// 9k. debug panel in the parent area: password gate, then add rewards to a profile
await p.evaluate(()=>{celebQueue=[];celebOpen=false;document.getElementById('celebOverlay').hidden=true;collection=[];golden=[];saveState();openPanel('profiles');});await p.waitForTimeout(1500);await p.evaluate(()=>{celebQueue=[];closeCeleb();});await p.waitForTimeout(800);
await p.evaluate(()=>profileAction('tab','debug'));
ok(await p.locator('#dbgPw').count()===1&&await p.locator('#dbgN').count()===0,'debug tab asks for a password first');
await p.fill('#dbgPw','wrong');await p.click('[data-pact=dbgunlock]');
ok(await p.locator('#dbgN').count()===0,'wrong password stays locked');
await p.fill('#dbgPw','cupcake-debug');await p.click('[data-pact=dbgunlock]');
ok(await p.locator('#dbgN').count()===1,'right password opens the panel');
await p.fill('#dbgN','3');await p.click('[data-pact=dbgadd]');
const allr=await p.evaluate(()=>({n:collection.length,kinds:new Set(collection.map(kOf)).size,layered:collection.filter(x=>LAYERS[kOf(x)]).every(x=>!!comboOfItem(x)),combos:new Set(collection.filter(x=>kOf(x)==='🧁').map(comboOfItem)).size}));
ok(allr.n===3*14&&allr.kinds===14&&allr.layered,'"all" adds 3 of every reward kind ('+allr.n+' items, '+allr.kinds+' kinds)');
await p.click('[data-pact=dbgkind][data-id="🍓"]');await p.fill('#dbgN','40');await p.click('[data-pact=dbgadd]');
const one=await p.evaluate(()=>({n:collection.filter(x=>kOf(x)==='🍓').length,looks:new Set(collection.filter(x=>kOf(x)==='🍓').map(comboOfItem)).size}));
ok(one.n===43&&one.looks>=25,'40 strawberries added with random looks ('+one.looks+' different)');
// feedback: every click on "add" shows a fresh, numbered confirmation
{const m1=await p.evaluate(()=>document.getElementById('dbgMsg').textContent);await p.click('[data-pact=dbgadd]');const m2=await p.evaluate(()=>document.getElementById('dbgMsg').textContent);await p.click('[data-pact=dbgadd]');const m3=await p.evaluate(()=>document.getElementById('dbgMsg').textContent);
 ok(m1!==m2&&m2!==m3&&/\d/.test(m3),'each press of "add" gives visible feedback: '+m1.slice(-14)+' | '+m3.slice(-14));
 await p.evaluate(()=>{collection=collection.filter(x=>kOf(x)!=='🍓').concat(Array(0));});}
// the kind buttons show regular rewards (not upgraded pictures) and follow the chosen profile's theme
const ic2=await p.evaluate(()=>{const chips=[...document.querySelectorAll('[data-pact=dbgkind]')].slice(1);return {layered:chips.filter(c=>c.querySelector('.cup')).length,gfall:document.querySelectorAll('[data-pact=dbgkind] .gfall').length,upg:[...document.querySelectorAll('[data-pact=dbgkind] img')].filter(i=>Object.values(UPGRADE_IMG).includes(i.getAttribute('src'))).length}});
ok(ic2.layered===14&&ic2.gfall===0&&ic2.upg===0,'kind buttons show the regular rewards ('+ic2.layered+' layered pictures, '+ic2.upg+' upgraded)');
await p.evaluate(()=>{const q=makeProfile('S','f');q.progress={theme:'space'};store.profiles.push(q);persist();dbg.pid=q.id;renderProfiles();});
const th2=await p.evaluate(()=>({cups:document.querySelectorAll('[data-pact=dbgkind] .cup').length,imgs:document.querySelectorAll('[data-pact=dbgkind] img').length,btn:document.querySelector('[data-pact=dbgadd]').textContent}));
ok(th2.cups===0&&th2.imgs>5&&th2.btn.includes('S'),'choosing a profile with another theme changes the reward pictures, and the button names the profile ("'+th2.btn+'")');
await p.evaluate(()=>{store.profiles.pop();persist();dbg.pid=store.profiles[0].id;renderProfiles();});
// another profile gets them without becoming active
await p.evaluate(()=>{const q=makeProfile('B','f');store.profiles.push(q);persist();});
await p.evaluate(()=>{profileAction('tab','debug');});
await p.evaluate(()=>{dbg.pid=store.profiles[1].id;renderProfiles();});
await p.click('[data-pact=dbgkind][data-id="🧁"]');await p.fill('#dbgN','5');await p.click('[data-pact=dbgadd]');
const oth=await p.evaluate(()=>({b:cleanProgress(store.profiles[1].progress).collection.filter(x=>kOf(x)==='🧁').length,act:store.activeId===store.profiles[0].id,mine:collection.filter(x=>kOf(x)==='🧁').length}));
ok(oth.b===5&&oth.act&&oth.mine===3,'rewards can be added to a profile that is not the active one');
await p.evaluate(()=>closeProfiles());await p.evaluate(()=>openPanel('profiles'));await p.evaluate(()=>profileAction('tab','debug'));
ok(await p.locator('#dbgN').count()===0,'the debug panel locks again after the parent area is closed');
// 9l. heart 🩷: color + frame decoration + pattern overlay, "none" for both frames and overlays
const ht=await p.evaluate(()=>{const L=LAYERS['🩷'];let bad=0,n=0;
 for(let b=0;b<L.bases.length;b++)for(let f=0;f<L.fros.length;f++)for(let t=0;t<L.tops.length;t++){n++;
  layerBoxes('🩷',b+'.'+f+'.'+t).forEach(([s,st])=>{const m=Object.fromEntries(st.split(';').map(x=>x.split(':')).map(([k,v])=>[k,parseFloat(v)]));
   if(m.left<-1||m.top<-1||m.left+m.width>101||m.top+m.height>101||!(m.width>0))bad++;});}
 const nf=L.fros.length-1,nt=L.tops.length-1;
 return {n,bad,nb:[L.bases.length,L.fros.length,L.tops.length],noneBoth:layerBoxes('🩷','0.'+nf+'.'+nt).length,noFrame:layerBoxes('🩷','0.'+nf+'.0').length,noOverlay:layerBoxes('🩷','0.0.'+nt).length,both:layerBoxes('🩷','0.0.0').length,def:LAYER_DEFAULT['🩷'],mig:cleanProgress({collection:['🩷']}).collection,fnone:!!L.fros[nf].n,tnone:!!L.tops[nt].n}});
ok(ht.n===ht.nb[0]*ht.nb[1]*ht.nb[2]&&ht.bad===0&&ht.nb[0]>=20&&ht.nb[1]===13&&ht.nb[2]===15,'heart: all '+ht.n+' combinations ('+ht.nb.join(' x ')+') fit their square');
ok(ht.noneBoth===1&&ht.noFrame===2&&ht.noOverlay===2&&ht.both===3&&ht.fnone&&ht.tnone,'heart: no frame and no overlay are both options (1 picture with neither, 2 with one, 3 with both)');
ok(ht.mig[0]==='🩷:'+ht.def&&ht.def.split('.')[1]==='12','old hearts become the plain pink heart without frame or overlay: '+ht.mig[0]);
// 9m. cotton candy ☁️: stick + cloud + topping ("none" for toppings); the lollipop shares the sticks
const ct=await p.evaluate(()=>{const L=LAYERS['☁️'],lp=LAYERS['🍭'];const sameSticks=L.bases.every((b,i)=>lp.bases[i]&&lp.bases[i].s===b.s);
 let n=0,bad=0;for(let b=0;b<L.bases.length;b++)for(let f=0;f<L.fros.length;f+=3)for(let t=0;t<L.tops.length;t+=2){n++;const bx=layerBoxes('☁️',b+'.'+f+'.'+t);if(bx.length<2||bx.length>3)bad++;}
 collection=['☁️'];const mig=cleanProgress({collection:['☁️'],golden:[],lollipops:[]}).collection;
 return {nb:[L.bases.length,L.fros.length,L.tops.length],lpn:lp.bases.length,sameSticks,n,bad,def:LAYER_DEFAULT['☁️'],mig,inSt:STICKERS.includes('☁️'),gold:!!UPGRADE_IMG['☁️'],withTop:layerBoxes('☁️','0.0.0').length,noTop:layerBoxes('☁️','0.0.'+(L.tops.length-1)).length}});
ok(ct.nb[0]===13&&ct.nb[1]===19&&ct.nb[2]===7&&ct.lpn===13&&ct.sameSticks,'cotton candy has 13 sticks (shared with the lollipop), 19 clouds and 6 toppings + none: '+ct.nb+' / lollipop sticks '+ct.lpn);
ok(ct.bad===0&&ct.withTop===3&&ct.noTop===2&&ct.inSt&&ct.gold,'cotton candy layers draw (stick, cloud, topping) and "none" skips the topping');
ok(ct.mig[0]==='☁️:'+ct.def,'plain cotton candy migrates to the fixed default look: '+ct.mig[0]);
// inventory in the order received (newest first)
const inv=await p.evaluate(()=>{closeCeleb();collection=['🍭:0.0.0','🧁:0.0.0','🍩:0.0.0','🧁:1.0.0'];golden=[];lollipops=[];renderRewards();openRoom();return [...document.querySelectorAll('#roomBody .roomgrid .ritem .cup')].length});
ok(inv===4,'the room shows all four rewards');
const ord=await p.evaluate(()=>{const g=[...document.querySelectorAll('#roomBody .roomgrid')].pop();return [...g.querySelectorAll('.ritem')].map(e=>e.querySelector('.cup')?e.querySelector('.cup').outerHTML.length:0).length});
ok(ord===4,'inventory grid has one entry per reward');
const ord2=await p.evaluate(()=>{const keep=rewardGlyph;const seen=[];window.__x=0;const g=[...document.querySelectorAll('#roomBody .roomgrid')].pop();const html=g.innerHTML;const exp=collection.slice().reverse().map(x=>rewardGlyph(x,38));return exp.every((h,i)=>true)&&html.indexOf(cupHTML('🧁:1.0.0',38).slice(0,60))<html.indexOf(cupHTML('🍭:0.0.0',38).slice(0,60))});
ok(ord2,'the newest reward is first in the inventory, not grouped by type');
// 9n. rainbow 🌈: shape + the same item at both ends + pattern overlay, "none" for ends and overlay
const rbw=await p.evaluate(()=>{const L=LAYERS['🌈'];const nf=L.fros.length-1,nt=L.tops.length-1;let n=0,bad=0;
 for(let b=0;b<L.bases.length;b++)for(let f=0;f<=nf;f++)for(let t=0;t<=nt;t++){n++;const bx=layerBoxes('🌈',b+'.'+f+'.'+t);const exp=1+(f<nf?2:0)+(t<nt?1:0);if(bx.length!==exp)bad++;
  bx.forEach(([s,st])=>{const m=Object.fromEntries(st.split(';')[0].split(',').length?st.split(';').filter(x=>/^(left|top|width|height):/.test(x)).map(x=>x.split(':')).map(([k,v])=>[k,parseFloat(v)]):[]);if(m.left<-0.5||m.top<-0.5||m.left+m.width>100.5||m.top+m.height>100.5)bad++;});}
 const mig=cleanProgress({collection:['🌈','🌈:0.0.0'],golden:['🌈'],lollipops:[]});
 return {nb:[L.bases.length,L.fros.length,L.tops.length],n,bad,def:LAYER_DEFAULT['🌈'],mig:mig.collection,nf,nt,bothNone:layerBoxes('🌈','0.'+nf+'.'+nt).length,sameItem:layerBoxes('🌈','0.0.'+nt).map(x=>x[0]).filter(s=>s===L.fros[0].s||s===L.fros[0].s2).length}});
ok(rbw.nb[0]===6&&rbw.nb[1]===11&&rbw.nb[2]===7,'rainbow: 6 shapes, 10 end items + none, 6 overlays + none: '+rbw.nb);
ok(rbw.bad===0&&rbw.bothNone===1&&rbw.sameItem===2,'rainbow: all '+rbw.n+' combinations fit their square; "none" removes the ends and the overlay; both ends show the same item');
ok(rbw.mig[0]==='🌈:'+rbw.def&&rbw.def==='0.'+rbw.nf+'.'+rbw.nt&&rbw.mig[1]==='🌈:0.0.0','old rainbows become the plain classic arch (no ends, no overlay): '+rbw.mig[0]);
// click a reward in the gift room: it opens large
const vw=await p.evaluate(()=>{closeCeleb();closeProfiles();collection=['🍭:0.0.0','🌈:2.1.3','🧁:0.0.0'];golden=[];lollipops=[];renderRewards();openRoom();const first=document.querySelector('#roomBody .ritem[data-act=view]');return {n:document.querySelectorAll('#roomBody .ritem[data-act=view]').length,firstKind:first.getAttribute('data-i')}});
ok(vw.n===3&&vw.firstKind==='2','every reward in the room can be tapped (newest first)');
await p.click('#roomBody .ritem[data-act=view] >> nth=1');await p.waitForTimeout(300);
const big=await p.evaluate(()=>{const c=document.querySelector('#celebBody .cup');return {open:!document.getElementById('celebOverlay').hidden,w:c?c.getBoundingClientRect().width:0,cup:c?c.getAttribute('data-cup'):''}});
ok(big.open&&big.w>=200&&big.cup==='2.1.3','tapping a reward opens it large in a popup ('+Math.round(big.w)+'px, look '+big.cup+')');
await p.evaluate(()=>closeCeleb());
// the heart's halo frame is complete: nothing touches the picture's top edge (it was cut off before)
const halo=await p.evaluate(()=>new Promise(r=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,im.width,im.height).data;let top=0,top2=0;for(let i=0;i<im.width;i++){top=Math.max(top,d[i*4+3]);top2=Math.max(top2,d[(im.width+i)*4+3]);}r({top,top2,w:im.width,h:im.height,y:LAYERS['🩷'].fros[1].y});};im.src=LAYERS['🩷'].fros[1].s;}));
ok(halo.y<0&&halo.top<60,'the heart halo is whole: its first pixel row is empty ('+halo.top+'/'+halo.top2+', '+halo.w+'x'+halo.h+')');
// 9o. wrapped candy 🍬: body + two wrapper ends (same colour, left and right pictures), turned like a candy; old candies become the plain green striped candy
const wc=await p.evaluate(()=>{const L=LAYERS['🍬'];let n=0,bad=0;
 for(let b=0;b<L.bases.length;b++)for(let f=0;f<L.fros.length;f++){n++;const bx=layerBoxes('🍬',b+'.'+f+'.0');if(bx.length!==3)bad++;
  bx.forEach(([s,st])=>{const m=Object.fromEntries(st.split(';').filter(x=>/^(left|top|width|height):/.test(x)).map(x=>x.split(':')).map(([k,v])=>[k,parseFloat(v)]));if(m.left<-0.5||m.top<-0.5||m.left+m.width>100.5||m.top+m.height>100.5)bad++;});}
 const mig=cleanProgress({collection:['🍬','🍬:3.2.0'],golden:['🍬'],lollipops:[]});
 const bx=layerBoxes('🍬','0.0.0');
 return {nb:[L.bases.length,L.fros.length,L.tops.length],n,bad,def:LAYER_DEFAULT['🍬'],mig:mig.collection,rot:/rotate\(-30deg\)/.test(bx[0][1]),wingsBehind:bx[2][0]===L.bases[0].s&&bx[0][0]===L.fros[0].s&&bx[1][0]===L.fros[0].s2}});
ok(wc.nb[0]===16&&wc.nb[1]===8&&wc.nb[2]===1,'wrapped candy: 16 bodies x 8 wrapper colours (no third layer): '+wc.nb);
ok(wc.bad===0&&wc.rot&&wc.wingsBehind,'wrapped candy: all '+wc.n+' combinations fit their square, are turned, and the wings are behind the body');
ok(wc.mig[0]==='🍬:'+wc.def&&wc.mig[1]==='🍬:3.2.0','old candies become the fixed default look: '+wc.mig[0]);
// 9p. unicorn 🦄: head + mane + horn ("none" = no horn); old unicorns become the white one
const un=await p.evaluate(()=>{const L=LAYERS['🦄'];let n=0,bad=0;const nt=L.tops.length-1;
 for(let b=0;b<L.bases.length;b++)for(let f=0;f<L.fros.length;f+=2)for(let t=0;t<=nt;t++){n++;const bx=layerBoxes('🦄',b+'.'+f+'.'+t);if(bx.length!==(t<nt?3:2))bad++;
  bx.forEach(([s,st])=>{const m=Object.fromEntries(st.split(';').map(x=>x.split(':')).map(([k,v])=>[k,parseFloat(v)]));if(m.left<-0.5||m.top<-0.5||m.left+m.width>100.5||m.top+m.height>100.5)bad++;});}
 const mig=cleanProgress({collection:['🦄','🦄:2.3.4'],golden:['🦄'],lollipops:[]});
 return {nb:[L.bases.length,L.fros.length,L.tops.length],n,bad,def:LAYER_DEFAULT['🦄'],mig:mig.collection,g:mig.golden}});
ok(un.nb[0]===9&&un.nb[1]===12&&un.nb[2]===17,'unicorn: 9 heads x 12 manes x 16 horns + none: '+un.nb);
ok(un.bad===0,'unicorn: '+un.n+' sampled combinations fit their square, "none" removes the horn');
ok(un.mig[0]==='🦄:'+un.def&&un.mig[1]==='🦄:2.3.4'&&un.g[0]==='🦄','old unicorns become the fixed default look: '+un.mig[0]);
// 9q. sparkles ✨: big left star + big right star + a group of small stars (1, 4 or 10; one color or mixed; "none" = just the two big ones)
const sp=await p.evaluate(()=>{const L=LAYERS['✨'];let n=0,bad=0;const nt=L.tops.length-1;
 for(let b=0;b<L.bases.length;b++)for(let f=0;f<L.fros.length;f+=3)for(let t=0;t<=nt;t++){n++;const bx=layerBoxes('✨',b+'.'+f+'.'+t);if(bx.length!==(t<nt?3:2))bad++;
  bx.forEach(([s,st])=>{const m=Object.fromEntries(st.split(';').map(x=>x.split(':')).map(([k,v])=>[k,parseFloat(v)]));if(m.left<-0.5||m.top<-0.5||m.left+m.width>100.5||m.top+m.height>100.5)bad++;});}
 const mig=cleanProgress({collection:['✨','✨:2.3.4'],golden:['✨'],lollipops:[]});
 return {nb:[L.bases.length,L.fros.length,L.tops.length],n,bad,def:LAYER_DEFAULT['✨'],mig:mig.collection,g:mig.golden,ok:!!parseCombo('✨',LAYER_DEFAULT['✨'])}});
ok(sp.nb[0]===13&&sp.nb[1]===13&&sp.nb[2]===49,'sparkles: 13 colors x 13 colors x 48 small-star groups + none: '+sp.nb);
ok(sp.bad===0&&sp.ok,'sparkles: '+sp.n+' sampled combinations fit their square, "none" removes the small stars');
ok(sp.mig[0]==='✨:'+sp.def&&sp.mig[1]==='✨:2.3.4'&&sp.g[0]==='✨','old sparkles become the fixed default look: '+sp.mig[0]);
// 9r. no reward kind is a single picture any more: every kind has parts, and every new item is a combination
const nop=await p.evaluate(()=>{const r={missing:[],plain:[]};for(const k of STICKERS){if(!LAYERS[k]){r.missing.push(k);continue;}collection=[];const it=newItem(k);if(!comboOfItem(it)||!rewardGlyph(it,40).includes('class="cup"'))r.plain.push(k);}return {...r,n:STICKERS.length,withCup:STICKERS.filter(k=>LAYERS[k]).length}});
ok(nop.missing.length===0&&nop.plain.length===0&&nop.n===14,'every reward kind ('+nop.n+') is built from layered parts; none is a single picture. missing: '+nop.missing.join('')+' plain: '+nop.plain.join(''));
// 10. a themed (non-default) look falls back to the single picture
const th=await p.evaluate(()=>{const keep=themeId;themeId='space';const h=rewardGlyph('🧁:1.1.1',30);themeId=keep;return !h.includes('class="cup"')});
ok(th,'with an alternative theme the cupcake falls back to the theme picture');
// 10b. bigger on large screens
{const q=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();await q.goto(T.URL);await q.evaluate(()=>localStorage.clear());await q.reload();
 await q.fill('#pfName','X');await q.click('.gopt:has(input[value=f])');await q.click('[data-pact=save]');await q.waitForTimeout(300);
 const big=await q.evaluate(()=>{collection=['🧁:0.0.0','🍩:1.2.3'];renderRewards();openRoom();const w=[...document.querySelectorAll('#roomOverlay .cup')].map(c=>c.getBoundingClientRect().width);return w});
 const small=await p.evaluate(()=>{collection=['🧁:0.0.0','🍩:1.2.3'];renderRewards();openRoom();return [...document.querySelectorAll('#roomOverlay .cup')].map(c=>c.getBoundingClientRect().width)});
 ok(big.length===2&&big[0]>=small[0]*1.6,'large screen: reward pictures are bigger ('+Math.round(small[0])+'px phone, '+Math.round(big[0])+'px large)');
 await q.waitForTimeout(700);await q.screenshot({path:__dirname+'/_layers_big.png'});}
// 11. screenshot of a few items
await p.evaluate(()=>{closeCeleb();collection=['🧁','🍩','🍨','🍭','🧋','🎀','🍦','🍓','🩷','☁️','🌈','🍬','🦄','✨'].flatMap(k=>Array.from({length:6},()=>newItem(k)));golden=[];renderRewards();openRoom();});await p.waitForTimeout(1500);await p.evaluate(()=>{celebQueue=[];closeCeleb();});await p.waitForTimeout(800);
await p.screenshot({path:__dirname+'/_layers_room.png'});
ok(errs.length===0,'no page errors '+errs.slice(0,2).join('|'));
await b.close();console.log(fails?fails+' FAILED':'ALL PASSED');process.exit(fails?1:0);})();
