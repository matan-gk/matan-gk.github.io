const T=require('./lib.js');
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({...T.launchOpts});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);
const o=await p.evaluate(()=>{
  const fails=[], N=400, names=['gShapeSides','gWhichShape','gCountSquares','gSymmetryLine','gLPerimeter','gMissingSide','bShapes_JoinedRects'];
  const txt=h=>h.replace(/<br>/g,' ').replace(/<[^>]+>/g,'').replace(/\s+/g,' ');
  const svgs=h=>[...h.matchAll(/<svg[\s\S]*?<\/svg>/g)].map(m=>m[0]);
  const allSvg=q=>svgs(q.text).concat(...q.choices.map(c=>c&&c.html?svgs(c.html):[]));
  const poly=sv=>(sv.match(/<polygon points="([^"]+)"/)||[])[1];
  const pts=ps=>ps.trim().split(' ').map(x=>x.split(',').map(Number));
  const refl=(P,[x1,y1,x2,y2])=>{ const dx=x2-x1,dy=y2-y1,L=dx*dx+dy*dy; return P.map(([x,y])=>{ const t=((x-x1)*dx+(y-y1)*dy)/L, fx=x1+t*dx, fy=y1+t*dy; return [2*fx-x,2*fy-y]; }); };
  const sameSet=(A,B)=>A.every(a=>B.some(c=>Math.hypot(a[0]-c[0],a[1]-c[1])<1.2))&&B.every(a=>A.some(c=>Math.hypot(a[0]-c[0],a[1]-c[1])<1.2));
  const res={};
  names.forEach(n=>{ const seen=new Set(); for(let i=0;i<N;i++){ const q=window[n](); const t=txt(q.text);
    const keys=q.choices.map(c=>c&&c.key!==undefined?c.key:c);
    if(new Set(keys.map(String)).size!==4) fails.push(n+' choices not 4 distinct '+t);
    if(!keys.map(String).includes(String(q.answer))) fails.push(n+' answer missing '+t);
    // dark/light: every text drawn uses currentColor; no hard-coded dark ink
    allSvg(q).forEach(sv=>{ [...sv.matchAll(/<text[^>]*>/g)].forEach(m=>{ if(!/fill="currentColor"/.test(m[0])) fails.push(n+' text without currentColor'); if(!/text-anchor="middle"/.test(m[0])) fails.push(n+' text not centred'); }); if(/#3b2a63|#000|#222/i.test(sv)) fails.push(n+' hard-coded dark colour'); });
    seen.add(JSON.stringify(q.choices.map(c=>c&&c.html||c))+t);
    // semantics
    if(n==='gShapeSides'){ const m=t.match(/איזו צורה יש לה (\d+)/); if(m){ const c=q.choices.find(c=>c.key===q.answer); const n1=pts(poly(c.html)).length; if(n1!==+m[1]) fails.push('sides pick wrong'); const ns=q.choices.map(c=>pts(poly(c.html)).length); if(new Set(ns).size!==4) fails.push('sides dup counts'); } else { const sv=svgs(q.text)[0]; if(pts(poly(sv)).length!==q.answer) fails.push('sides count wrong'); } }
    if(n==='gWhichShape'){ const kind=q.answer.slice(1); const c=q.choices.find(c=>c.key===q.answer); const P=pts(poly(c.html)); const nm=t.match(/היא (\S+)/)[1].replace('?',''); const sides=P.length, d=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
      if(nm==='משולש'&&sides!==3) fails.push('tri'); if(nm==='מלבן'){ if(sides!==4) fails.push('rect sides'); const ang=Math.abs((P[1][0]-P[0][0])*(P[2][0]-P[1][0])+(P[1][1]-P[0][1])*(P[2][1]-P[1][1])); if(ang>1) fails.push('rect not right angle'); if(Math.abs(d(P[0],P[1])-d(P[1],P[2]))<12) fails.push('rect looks square'); }
      if(nm==='ריבוע'){ if(Math.abs(d(P[0],P[1])-d(P[1],P[2]))>1) fails.push('square sides'); }
      // no other option may also be a correct shape of the asked kind
      q.choices.forEach(o=>{ if(o.key===q.answer) return; const Q=pts(poly(o.html)); if(nm==='משולש'&&Q.length===3) fails.push('two triangles'); if(nm!=='משולש'&&Q.length===4){ const ang=Math.abs((Q[1][0]-Q[0][0])*(Q[2][0]-Q[1][0])+(Q[1][1]-Q[0][1])*(Q[2][1]-Q[1][1])); const sq=Math.abs(d(Q[0],Q[1])-d(Q[1],Q[2]))<1; if(ang<1 && (nm==='מלבן'? true : sq)) fails.push('second '+nm); } }); }
    if(n==='gCountSquares'){ const sv=svgs(q.text)[0]; const cnt=(sv.match(/<rect /g)||[]).length; if(cnt!==q.answer) fails.push('squares count '+cnt+' vs '+q.answer); }
    if(n==='gSymmetryLine'){ q.choices.forEach(c=>{ const P=pts(poly(c.html)); const L=(c.html.match(/<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"/)||[]).slice(1).map(Number); const sym=sameSet(P,refl(P,L)); if((c.key==='ok')!==sym) fails.push('symmetry '+c.key+' sym='+sym); }); }
    if(n==='gLPerimeter'||n==='gMissingSide'||n==='bShapes_JoinedRects'){ const labs=[...q.text.matchAll(/>(\d+) ס״מ</g)].map(m=>+m[1]); const hlN=(q.text.match(/class="hl">(\d+)</)||[])[1];
      if(n==='gLPerimeter'){ const [W,h1,w1,H]=labs; if(q.answer!==2*(W+H)) fails.push('L per'); if(W<=w1||H<=h1) fails.push('L geometry'); }
      if(n==='gMissingSide'){ const l=labs[0]; if(q.answer!==(+hlN)/2-l) fails.push('missing side'); if(+hlN!==2*(l+q.answer)) fails.push('missing side per'); }
      if(n==='bShapes_JoinedRects'){ const [a,c,b,d]=labs; if(q.answer!==2*(a+b+c)) fails.push('joined'); if(!(d<b)) fails.push('joined d'); } }
  } res[n]=seen.size; });
  const lv=pools[8]; const cov={}; [1,2,3].forEach(d=>cov[d]=new Set(lv.filter(g=>skillDifficulty(g.name)===d).map(g=>g.name)).size);
  const meta=names.every(n=>SKILL_META[n]&&SKILL_META[n].area==='shapes'&&HELP[n]&&HELP[n].ex&&HELP[n].think);
  // help examples render
  const helpOK=names.concat(['gCompleteShape']).every(n=>HELP[n].ex.every(e=>{ try{ const h=typeof e.q==='function'?e.q():e.q; return typeof h==='string'&&h.length>10; }catch(x){ return false; } }));
  return {fails:[...new Set(fails)].slice(0,12), variety:res, cov, meta, helpOK, bonus8:BONUS_POOLS[8].map(g=>g.name), compl:skillDifficulty('gCompleteShape')};
});
console.log(JSON.stringify(o,null,1));
const bad=[]; if(o.fails.length) bad.push('wrong answers: '+o.fails.join(' | ')); if(!o.meta) bad.push('missing label/area/help'); if(!o.helpOK) bad.push('a help example does not render');
if(Object.values(o.cov).some(v=>v<2)) bad.push('fewer than 2 types at some difficulty'); if(o.compl!==1) bad.push('shape completion no longer rated easy'); if(Object.values(o.variety).some(v=>v<20)) bad.push('low variety'); if(errs.length) bad.push('PAGE ERRORS '+errs);
console.log(bad.length?'FAIL '+bad.join('; '):'ALL PASS'); if(bad.length) process.exitCode=1; await b.close()})()
