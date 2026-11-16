// Exercises added from the school sample worksheet: digit-in-symbol, even share, days-more
const T=require('./lib.js');
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({...T.launchOpts});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);
const o=await p.evaluate(()=>{
  const fails=[], strip=t=>t.replace(/<br>/g,' ').replace(/<[^>]+>/g,'').replace(/\s+/g,' ');
  for(let i=0;i<600;i++){
    let q=gDigitSymbol(); const t=strip(q.text);
    const m=t.match(/(\S+?)(\d) \+ \S+?(\d) = (\d+)|(\d)(\S+?) \+ (\d)\S+? = (\d+)|(\S+?)(\d) − (\d) = (\d+)/u);
    if(!m){fails.push('digit parse '+t);continue;}
    const d=q.answer; let calc;
    if(m[1]!==undefined) calc=(10*d+ +m[2])+(10*d+ +m[3]); else if(m[5]!==undefined) calc=(10*(+m[5])+d)+(10*(+m[7])+d); else calc=10*d+ +m[10]-m[11];
    const target=m[4]!==undefined?+m[4]:m[8]!==undefined?+m[8]:+m[12];
    if(calc!==target) fails.push('digit wrong '+t+' ans '+d);
    if(new Set(q.choices).size!==4||!q.choices.includes(d)) fails.push('digit choices');
    q=gEvenShare(); const n=+strip(q.text).match(/\d+/)[0];
    if(n%q.answer!==0) fails.push('share: '+n+' / '+q.answer);
    if(q.choices.filter(c=>n%c===0).length!==1) fails.push('share not unique '+n+' '+q.choices);
    q=gDaysMore(); const nums=strip(q.text).match(/\d+/g).map(Number); const [a,dd]=nums; const days=/ארבעת/.test(q.text)?4:3;
    let tot=0; for(let k=0;k<days;k++) tot+=a+dd*k; if(tot!==q.answer) fails.push('days '+strip(q.text)+' '+q.answer);
    if(new Set(q.choices).size!==4||!q.choices.includes(q.answer)) fails.push('days choices');
  }
  return {fails:[...new Set(fails)].slice(0,8), meta:['gDigitSymbol','gEvenShare','gDaysMore'].every(k=>SKILL_META[k]&&SKILL_DIFFICULTY[k]&&HELP[k]&&HELP[k].ex.length)};
});
console.log(o.fails.length||!o.meta||errs.length?'FAIL '+JSON.stringify(o)+errs:'ok   new exercise types are correct, with meta, difficulty and help');
await b.close(); process.exit(o.fails.length||!o.meta||errs.length?1:0);})();
