const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
const r=await p.evaluate(()=>{
  const o={}; const strip=h=>{ const d=document.createElement('div'); d.innerHTML=h.replace(/<br>/g,'\n'); return d.textContent; };
  const names=['gMulFact','gCompareTotals','gRoundsTransfer','gInequality','gThreeSymbols','gFillNumber'];
  o.gen={}; o.sem={};
  for(const n of names){ const fn=eval(n); const bad=[], sem=[];
    for(let i=0;i<800;i++){ let q; try{ q=fn(); }catch(e){ bad.push('throw '+e.message); break; }
      const t=strip(q.text); const ans=String(q.answer);
      if(q.type==='mcq'){ const ch=q.choices.map(String); if(new Set(ch).size!==4) bad.push('count '+ch); if(!ch.includes(ans)) bad.push('noans '+ans+' in '+ch); if(ch.some(c=>/^-|NaN|undefined/.test(c))) bad.push('neg '+ch); }
      if(/undefined|NaN|null|Infinity/.test(t)) bad.push('undef '+t.slice(0,60));
      const nums=(t.match(/\d+/g)||[]).map(Number);
      if(n==='gMulFact'){ if(+q.answer!==nums[0]*nums[1]) sem.push(t); }
      if(n==='gCompareTotals'){ if(+q.answer!==4*nums[3]-2*nums[2]) sem.push(t+' '+q.answer); }
      if(n==='gRoundsTransfer'){
        const mixed=/וניצח/.test(t); const start=nums[0], R=nums[1], tt=nums[2]; // names have no digits
        let lost,won; if(mixed){ lost=nums[3]; won=nums[4]; } else { lost=R; won=0; }
        if(lost+won!==R) sem.push('rounds '+t);
        const m=ans.match(/^(\d+) \S+ ל\S+, (\d+) \S+ ל\S+$/); const net=tt*(lost-won);
        if(!m||+m[1]!==start-net||+m[2]!==start+net||+m[1]+ +m[2]!==2*start) sem.push(ans+' vs '+start+' '+net);
      }
      if(n==='gInequality'){ const ex=t.split(':').pop().trim().replace(/−/g,'-').replace(/×/g,'*');
        const valid=q.choices.filter(c=>{ try{ const e=ex.replace(/__/g,'('+c+')'); const m=e.match(/^(.*?)\s*([<>])\s*(.*)$/); return eval(m[2]==='<'? '('+m[1]+')<('+m[3]+')' : '('+m[1]+')>('+m[3]+')'); }catch(e){ return false; } });
        if(valid.length!==1||String(valid[0])!==ans) sem.push(ex+' valid='+valid+' ans='+ans); }
      if(n==='gThreeSymbols'){ const L=t.trim().split('\n').map(s=>s.trim()).filter(Boolean); const l1=L[0].split('=')[0].split(' + ').map(s=>s.trim()), s1=+L[0].split('=')[1];
        const parts=L[1].split('=')[0].split(' + ').map(s=>s.trim()), tot=+L[1].split('=')[1]; const ask=L[2].match(/ל-(\S+)\?/)[1];
        const c=parts.filter(x=>l1.includes(x)).length/2, k=parts.filter(x=>x===ask).length;
        if(!Number.isInteger(c)||k<1||(tot-c*s1)/k!==+q.answer) sem.push(L.join('|')+' '+q.answer); }
      if(n==='gFillNumber'){ const e=t.trim().replace(/−/g,'-').replace(/×/g,'*').replace(/÷/g,'/').replace('__','('+q.answer+')').replace('=','==');
        if(!eval(e)) sem.push(t+' '+q.answer); }
    }
    o.gen[n]=[...new Set(bad)].slice(0,3); o.sem[n]=[...new Set(sem)].slice(0,3); }
  o.fill=new Set(Array.from({length:400},()=>strip(gFillNumber().text).trim().replace(/\d+/g,'N')));
  o.ine=new Set(Array.from({length:400},()=>strip(gInequality().text).split(':').pop().trim().replace(/\d+/g,'N')));
  o.help=['gMulFact','gCompareTotals','gRoundsTransfer','gInequality','gThreeSymbols','gFillNumber'].filter(n=>!HELP[n]||!HELP[n].ex||!HELP[n].ex.length);
  o.reg=['gMulFact','gCompareTotals','gRoundsTransfer'].filter(n=>!SKILL_META[n]||!SKILL_DIFFICULTY[n]);
  o.pool={num:NUMBERS_POOL.includes(gMulFact), sto:STORIES_POOL.includes(gCompareTotals)&&STORIES_POOL.includes(gRoundsTransfer)};
  return {gen:o.gen,sem:o.sem,fill:[...o.fill],ine:[...o.ine],help:o.help,reg:o.reg,pool:o.pool};});
console.log(JSON.stringify(r,null,1));
for(const n of Object.keys(r.gen)){ ok(r.gen[n].length===0,n+': 800 draws, 4 distinct choices, answer present '+r.gen[n]); ok(r.sem[n].length===0,n+': answers are mathematically right '+r.sem[n]); }
ok(r.fill.some(x=>/^N − __ = N$/.test(x))&&r.fill.some(x=>/^__ \+ N = N$/.test(x)),'fill-in has the missing-subtrahend and missing-first-addend forms');
ok(r.ine.some(x=>/\+ __/.test(x))&&r.ine.some(x=>/− __ [<>] N − N/.test(x))&&r.ine.some(x=>/×/.test(x)),'inequality has the factor, addend and subtrahend forms');
ok(r.help.length===0,'help pages exist: '+r.help); ok(r.reg.length===0,'registered with a name and a difficulty: '+r.reg); ok(r.pool.num&&r.pool.sto,'in the numbers and stories pools');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
