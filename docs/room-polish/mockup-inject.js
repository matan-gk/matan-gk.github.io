// runs inside the page: decorates the already drawn room (#rmR) with the proposed changes. Mockup only: nothing here is part of the game.
window.mockApply = function(o){
  const NS='http://www.w3.org/2000/svg', svg=document.getElementById('rmSvg'), R=document.getElementById('rmR'), defs=svg.querySelector('defs');
  const kids=[...R.children]; const iFl=kids.findIndex(e=>e.dataset.hit==='surf:fl'), iWin=kids.findIndex(e=>e.dataset.hit==='item:window');
  const X=(s)=>{const t=document.createElementNS(NS,'g');t.innerHTML=s;return t;};
  const wl=(a,h)=>[500-a,400+a/2-h], wr=(a,h)=>[500+a,400+a/2-h], fl=(x,y)=>[500+25*(x-y),400+12.5*(x+y)];
  const P=(pts)=>pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  const L='polygon points="0,50 500,-200 500,400 0,650"', Rr='polygon points="500,-200 1000,50 1000,650 500,400"', F='polygon points="500,400 1000,650 500,900 0,650"';
  let defsS=`
   <linearGradient id="mAoL" x1="0" x2="1" y1="0" y2="0"><stop offset=".55" stop-color="#3a1f7a" stop-opacity="0"/><stop offset="1" stop-color="#3a1f7a" stop-opacity=".20"/></linearGradient>
   <linearGradient id="mAoR" x1="1" x2="0" y1="0" y2="0"><stop offset=".55" stop-color="#3a1f7a" stop-opacity="0"/><stop offset="1" stop-color="#3a1f7a" stop-opacity=".20"/></linearGradient>
   <linearGradient id="mSheen" x1="0" x2="1" y1="0" y2="1"><stop offset=".25" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".26"/><stop offset=".75" stop-color="#fff" stop-opacity="0"/></linearGradient>
   <linearGradient id="mBeam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff6d0" stop-opacity=".5"/><stop offset="1" stop-color="#fff6d0" stop-opacity=".0"/></linearGradient>
   <radialGradient id="mPatch" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff4c4" stop-opacity=".62"/><stop offset="1" stop-color="#fff4c4" stop-opacity="0"/></radialGradient>
   <radialGradient id="mGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
   <radialGradient id="mVig" cx="500" cy="420" r="640" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#2b1366" stop-opacity="0"/><stop offset="1" stop-color="#2b1366" stop-opacity=".26"/></radialGradient>
   <linearGradient id="mWallTop" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#3a1f7a" stop-opacity=".10"/></linearGradient>
   <filter id="mGrade" x="-10%" y="-10%" width="120%" height="120%"><feColorMatrix type="matrix" values="0.95 0.03 0.05 0 0.01  0.02 0.93 0.07 0 0  0.05 0.05 1 0 0.04  0 0 0 1 0"/></filter>`;
  defs.insertAdjacentHTML('beforeend',defsS);
  const before=(idx,node)=>{R.insertBefore(node,R.children[idx+1]||null)};
  // ---- stage: softer palette: the rainbow stays, washed toward pastel (a milky layer over the walls and floor only)
  let back='';
  if(o.soft){ back+=`<g pointer-events="none"><${L} fill="#fff" fill-opacity="${o.softA||.40}"/><${Rr} fill="#fff" fill-opacity="${o.softA||.40}"/><${F} fill="#fff" fill-opacity="${(o.softA||.40)-.08}"/>`+
    (o.floorSoft?`<${F} fill="#fff" fill-opacity=".32"/>`:'')+(o.tint?`<${L} fill="${o.tint}" fill-opacity=".16"/><${Rr} fill="${o.tint}" fill-opacity=".16"/><${F} fill="${o.tint}" fill-opacity=".12"/>`:'')+`</g>`; }
  // ---- stage: atmosphere on the shell
  if(o.atmos){
    back+=`<g pointer-events="none">
      <${L} fill="url(#mAoL)"/><${Rr} fill="url(#mAoR)"/><${L} fill="url(#mWallTop)"/><${Rr} fill="url(#mWallTop)"/>
      <!-- baseboards -->
      <polygon points="${P([wl(0,0),wl(500,0),wl(500,26),wl(0,26)])}" fill="#fff" fill-opacity=".85"/><polygon points="${P([wl(0,26),wl(500,26),wl(500,30),wl(0,30)])}" fill="#b9a6e8" fill-opacity=".8"/>
      <polygon points="${P([wr(0,0),wr(500,0),wr(500,26),wr(0,26)])}" fill="#f4eeff" fill-opacity=".85"/><polygon points="${P([wr(0,26),wr(500,26),wr(500,30),wr(0,30)])}" fill="#b9a6e8" fill-opacity=".8"/>
      <!-- crown moulding -->
      <polygon points="${P([wl(0,600),wl(500,600),wl(500,578),wl(0,578)])}" fill="#fff" fill-opacity=".75"/><polygon points="${P([wr(0,600),wr(500,600),wr(500,578),wr(0,578)])}" fill="#f4eeff" fill-opacity=".75"/>
      <!-- corner post -->
      <polygon points="${P([wl(0,0),wl(14,0),wl(14,600),wl(0,600)])}" fill="#fff" fill-opacity=".35"/>
      <!-- floor sheen and bevel -->
      <${F} fill="url(#mSheen)"/>
      <path d="${(()=>{let d='';for(let i=1;i<20;i++){const a=fl(i,0),b=fl(i,20),c=fl(0,i),e=fl(20,i);d+=`M${a} L${b} M${c} L${e} `;}return d;})()}" stroke="#fff" stroke-opacity=".34" stroke-width="1.6" fill="none" transform="translate(0,1.8)"/>
    </g>`;
  }
  const bk=X(back); if(back) R.insertBefore(bk, R.children[iFl+1]);
  // ---- window light (after the window)
  let mid='';
  if(o.atmos){
    const wp=space.fix.window, uc=wp?wp.u:300;      // window centre along the right wall
    const gx=uc/25;   // in floor units x
    const q=[fl(gx-5,0),fl(gx+5,0),fl(gx+9,9),fl(gx-1,9)];
    mid+=`<g pointer-events="none" style="mix-blend-mode:screen">
      <ellipse cx="${500+uc}" cy="${400+uc/2-300}" rx="190" ry="210" fill="url(#mGlow)" transform="rotate(0)" opacity=".5"/>
      <polygon points="${P([wr(uc-90,235),wr(uc+90,235),fl(gx+9,9),fl(gx-1,9)])}" fill="url(#mBeam)" opacity=".5"/>
      <polygon points="${P(q)}" fill="url(#mPatch)"/>
    </g>`;
  }
  // ---- stage: wall content
  if(o.wall){
    const img=(id,a,h,w,side)=>{const c=catOf(id),s=w/c.r[2],xy=(side==='l'?wl:wr)(a,h);const tx=side==='l'?500-a:500+a,ty=400+a/2-h;
      return `<g transform="translate(${tx} ${ty}) matrix(1 ${side==='l'?-.5:.5} 0 1 0 0) scale(${s})"><image href="${c.src}" x="${c.r[0]}" y="${c.r[1]}" width="${c.r[2]}" height="${c.r[3]}"/></g>`;};
    const shelf=(side,a0,a1,h,items)=>{const f=side==='l'?wl:wr;let s=`<polygon points="${P([f(a0,h),f(a1,h),f(a1,h-9),f(a0,h-9)])}" fill="#e8dcff" fill-opacity=".92" stroke="#9b86d8" stroke-width="1.5"/><polygon points="${P([f(a0,h-9),f(a1,h-9),f(a1,h-14),f(a0,h-14)])}" fill="#b8a2f0" fill-opacity=".8"/>`;
      s+=`<polygon points="${P([f(a0+10,h-14),f(a0+22,h-14),f(a0+22,h-36),f(a0+10,h-30)])}" fill="#c9b4f5" stroke="#9b86d8" stroke-width="1"/><polygon points="${P([f(a1-22,h-14),f(a1-10,h-14),f(a1-10,h-30),f(a1-22,h-36)])}" fill="#c9b4f5" stroke="#9b86d8" stroke-width="1"/>`;
      items.forEach(([id,a,sc])=>{const c=catOf(id),p=f(a,h),w=c.r[2]*sc,hh=c.r[3]*sc;
        // upright sprite standing on the shelf: its anchor (the floor point under it) sits on the shelf top
        s+=`<g opacity=".05"></g><image href="${c.src}" x="${(p[0]+c.r[0]*sc).toFixed(1)}" y="${(p[1]-(c.r[1]+c.r[3])*sc-2).toFixed(1)}" width="${w.toFixed(1)}" height="${hh.toFixed(1)}"/>`;});return s;};
    mid+=`<g>`+
      // bunting along the left wall
      (()=>{let s='';const n=9,a0=30,a1=470,hTop=560;const pts=[];for(let i=0;i<=n;i++){const t=i/n,a=a0+(a1-a0)*t,h=hTop-28*Math.sin(Math.PI*t);pts.push(wl(a,h));}
        s+=`<path d="M${pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' L')}" stroke="#c8b4f4" stroke-width="2" fill="none"/>`;
        const cols=['#ffb3d1','#ffe08a','#a8e6cf','#9bd0ff','#d1b3ff'];
        for(let i=0;i<n;i++){const a=pts[i],b=pts[i+1],m=[(a[0]+b[0])/2,(a[1]+b[1])/2+34];s+=`<polygon points="${a} ${b} ${m}" fill="${cols[i%5]}" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/>`;}return s;})()+
      shelf('l',120,400,330,[['pl09',160,.55],['crystal',240,.5],['unicorn',320,.5],['books2',375,.42]])+
      shelf('l',120,400,455,[['musicbox',150,.5],['pl18',230,.5],['fishbowl',310,.5],['hamster',375,.45]])+
      img('wallclock',70,410,86,'r')+img('treasuremap',80,250,104,'r')+`</g>`;
  }
  if(mid){const m=X(mid); R.insertBefore(m, R.children[iWin+2]);}
  // ---- sprites: one grade and a soft violet glow so they sit in the room's light
  if(o.grade){ [...R.children].forEach((e,i)=>{ if(i<=iWin+1) return; if(e.dataset.mock) return; e.style.filter='url(#mGrade) saturate(.94) drop-shadow(0 0 5px rgba(176,150,255,.5))'; }); }
  // ---- overlay: vignette + sparkles
  if(o.atmos){
    let s=`<g pointer-events="none"><polygon points="0,50 500,-200 1000,50 1000,650 500,900 0,650" fill="url(#mVig)"/>`;
    const sp=[[230,200],[330,320],[760,230],[860,360],[160,520],[420,640],[700,700],[820,540],[600,300],[260,420],[930,520],[540,780],[300,720],[640,150]];
    sp.forEach(([x,y],i)=>{const r=5+(i%3)*2.5;s+=`<path d="M${x},${y-r*1.6} L${x+r*.35},${y-r*.35} L${x+r*1.6},${y} L${x+r*.35},${y+r*.35} L${x},${y+r*1.6} L${x-r*.35},${y+r*.35} L${x-r*1.6},${y} L${x-r*.35},${y-r*.35}Z" fill="#fff" fill-opacity="${.55+.1*(i%3)}"/>`;});
    s+='</g>'; R.appendChild(X(s));
  }
};
