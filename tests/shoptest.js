const T=require('./lib.js');
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({...T.launchOpts});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);
const o=await p.evaluate(()=>{
  const fails=[], strip=t=>t.replace(/<br>/g,' ').replace(/<[^>]+>/g,'').replace(/\s+/g,' ');
  const nums=t=>(strip(t).match(/\d+/g)||[]).map(Number);
  const N=500;
  const bad=/מגנטים|פרחי נייר|פחיות|למחזור|פיצה|דונאטס|כיתה|קערת|ציורי|פרפרים|צדפות|עפרונות|תפוחים|אגסים|שקדים|ילדים|חברים לשרשרת|חרוזים לשרשרת|בלוני|קלפים מצוירים/;
  const chk=(name,fn)=>{ const seen=new Set(); for(let i=0;i<N;i++){ let q; try{ q=window[name](); }catch(e){ fails.push(name+' threw '+e.message); return; }
    const t=strip(q.text);
    // generic
    if(!q.choices||new Set(q.choices.map(String)).size!==q.choices.length) fails.push(name+' dup choices '+t);
    if(!q.choices.map(String).includes(String(q.answer))) fails.push(name+' answer missing '+t);
    if(bad.test(t)) fails.push(name+' old theme: '+t);
    if(/(^|\\s)1 [^\\s]*(ים|ות)\\b/.test(t)) fails.push(name+' 1+plural: '+t);
    if(/undefined|NaN|\\$\\{/.test(t)) fails.push(name+' bad text '+t);
    // gender agreement of items
    if(/(גולות|מדבקות|בובות|מתנות|סוכריות)[^.?]*\\bאותם\\b/.test(t)||/(יו-יו|סרטי|חרוזי|קלפי|בקבוקוני|מחזיקי)[^.?]*\\bאותן\\b/.test(t)) fails.push(name+' item gender '+t);
    if(/(גולות|מדבקות|בובות)[^.?]* מהם\\b/.test(t)&&!/(מפתחות|יו-יו|סרטי|חרוזי|קלפי|בקבוקוני|כדורי|כובעי)/.test(t)) fails.push(name+' מהם with f '+t);
    try{ fn(q,t,nums(t)); }catch(e){ fails.push(name+' check threw '+e.message+' '+t); }
    seen.add(t);
  } return seen.size; };
  const eq=(name,q,exp,t)=>{ if(+q.answer!==exp) fails.push(name+' wrong: '+t+' ans '+q.answer+' exp '+exp); };
  const variety={};
  variety.gSharing=chk('gSharing',(q,t,n)=>{ eq('gSharing',q,(n[0]+n[1])/2,t); });
  variety.gMultiplyChain=chk('gMultiplyChain',(q,t,n)=>eq('gMultiplyChain',q,n[0]*n[1]*n[2],t));
  variety.gLeftover=chk('gLeftover',(q,t,n)=>eq('gLeftover',q,n[0]-n[1]-n[2],t));
  variety.gDifferenceMore=chk('gDifferenceMore',(q,t,n)=>eq('gDifferenceMore',q,n[0]+n[1],t));
  variety.gGroups=chk('gGroups',(q,t,n)=>eq('gGroups',q,n[0]*n[1],t));
  variety.gRemainder=chk('gRemainder',(q,t,n)=>eq('gRemainder',q,n[0]%n[1],t));
  variety.gCompareChain=chk('gCompareChain',(q,t,n)=>eq('gCompareChain',q,(n[0]+n[1])+(n[0]+n[1]-n[2]),t));
  variety.gWorkBackwards=chk('gWorkBackwards',(q,t,n)=>{ const E=n[n.length-1],so=+t.match(/נמכרו (\d+)/)[1],de=+t.match(/עוד (\d+)/)[1]; eq('gWorkBackwards',q,E+so-de,t); });
  variety.gPartWhole=chk('gPartWhole',(q,t,n)=>eq('gPartWhole',q,n[0]-n[1],t));
  variety.gTookAway=chk('gTookAway',(q,t,n)=>eq('gTookAway',q,n[0]-n[1],t));
  variety.gGotMore=chk('gGotMore',(q,t,n)=>eq('gGotMore',q,n[0]+n[1],t));
  variety.gTwoGroups=chk('gTwoGroups',(q,t,n)=>{ if(/יותר מ/.test(t)) eq('gTwoGroups',q,n[0]+n[0]+n[1],t); else eq('gTwoGroups',q,n[0]+n[1],t); });
  variety.gMadeAndLeft=chk('gMadeAndLeft',(q,t,n)=>eq('gMadeAndLeft',q,n[0]+n[1]-n[2],t));
  variety.gMoneyCoins=chk('gMoneyCoins',(q,t,n)=>eq('gMoneyCoins',q,(n[n.length-2]+n[n.length-1])*2 - 0,t));
  variety.gCheaperBundle=chk('gCheaperBundle',(q,t,n)=>{ });
  variety.gCheaperPerItem=chk('gCheaperPerItem',(q,t,n)=>{ });
  variety.gChange=chk('gChange',(q,t,n)=>eq('gChange',q,Math.max(...n)-Math.min(...n),t));
  variety.gSplitCost=chk('gSplitCost',(q,t,n)=>{ const F=+t.match(/[מ] ?-?(\d) החברים|בין (\d) חברים/).slice(1).find(Boolean); const tot=+t.match(/ב-(\d+) ש/)[1]; eq('gSplitCost',q,tot/F,t); });
  variety.gBudget=chk('gBudget',(q,t,n)=>{ const M=Math.max(n[0],n[1]),pr=Math.min(n[0],n[1]); eq('gBudget',q,/כמה כסף/.test(t)?M%pr:Math.floor(M/pr),t); });
  variety.bL1_CombineThenDivide=chk('bL1_CombineThenDivide',(q,t,n)=>eq('bL1_CombineThenDivide',q,(n[0]+n[1])/n[2],t));
  variety.bL1_ChainMinusLoss=chk('bL1_ChainMinusLoss',(q,t,n)=>eq('bL1_ChainMinusLoss',q,n[0]*n[1]-n[2],t));
  variety.bL3_ComboMoneyChange=chk('bL3_ComboMoneyChange',(q,t,n)=>{ const F=+t.match(/בין (\d) חברים/)[1]; const g=+t.match(/ב-(\d+) ש"ח ועטיפת/)[1], w=+t.match(/עטיפת מתנה ב-(\d+)/)[1], bill=+t.match(/שטר של (\d+)/)[1]; eq('bL3_ComboMoneyChange',q,bill-(g+w)/F,t); });
  // the two price questions: exact semantics
  for(let i=0;i<N;i++){
    let q=gCheaperBundle(), t=strip(q.text), m=t.match(/לקנות (\d+) .*? במחיר (\d+) ש"ח ליחידה.*?של (\d+) .*? ב-(\d+) ש"ח/);
    if(!m) fails.push('bundle parse '+t); else { const c1=m[1]*m[2], c2=+m[4]; if(c1===c2) fails.push('tie'); const exp=c1<c2?'הראשונה':'השנייה'; if(q.answer!==exp) fails.push('bundle wrong '+t); if(/ליחידה\?/.test(t)) fails.push('bundle asks per item'); if(!/בסך הכל/.test(t)) fails.push('bundle not total'); }
    q=gCheaperPerItem(); t=strip(q.text); m=t.match(/ב-(\d+) ש"ח ליחידה.*?של (\d+) .*? ב-(\d+) ש"ח/);
    if(!m) fails.push('peritem parse '+t); else { const a=+m[1], u=m[3]/m[2]; if(!Number.isInteger(u)||u===a) fails.push('peritem tie/frac '+t); const exp=a<u?'הראשונה':'השנייה'; if(q.answer!==exp) fails.push('peritem wrong '+t); }
  }
  const meta=['gCheaperBundle','gCheaperPerItem'].map(k=>[SKILL_META[k]&&SKILL_META[k].he,SKILL_DIFFICULTY[k],!!HELP[k]]);
  return {fails:[...new Set(fails)].slice(0,15), variety, meta, inPool:STORIES_POOL.includes(gCheaperPerItem)&&STORIES_POOL.includes(gCheaperBundle), poolN:STORIES_POOL.length};
});
console.log(JSON.stringify(o,null,1));
const bad=[]; if(o.fails.length) bad.push('wrong answers or wording: '+o.fails.join(' | ')); if(!o.inPool) bad.push('price types missing from the stories pool');
if(o.meta.some(m=>!m[0]||!m[1]||!m[2])) bad.push('missing label, difficulty or help page'); if(Object.values(o.variety).some(v=>v<20)) bad.push('low story variety'); if(errs.length) bad.push('PAGE ERRORS '+errs);
console.log(bad.length?'FAIL '+bad.join('; '):'ALL PASS'); if(bad.length) process.exitCode=1; await b.close()})()
