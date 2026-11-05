const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
const r=await p.evaluate(()=>{
  const o={};
  const names=['gDigitOf','gBuildNumber','gWordsToNum','gNumToWords','gDigitCompare','gFindByDigit','gBiggestOfFour','gOrderNumbers','gMissingDigit','gBetween','gNumberRiddle','gPredSucc','gSkipPair','gSkipFill','gSkipMember','gAddTwoDigit','gAddCarry','gSubTwoDigit','gSubBorrow','gBiggerExpr','gDigitsMinMaxDiff','gHowManyBuild','gCountInSeries','bNum_Clues','bNum_FirstOver','gPartWhole','gTookAway','gGotMore','gTwoGroups','gMadeAndLeft','gPolygonName','gPerimeter','gRectPerimeter','gCompleteShape'];
  o.names=names.length;
  o.gen={};
  for(const n of names){ const fn=eval(n); const bad=[];
    for(let i=0;i<600;i++){ let q; try{ q=fn(); }catch(e){ bad.push('throw '+e.message); break; }
      const ch=q.choices.map(c=>typeof c==='object'?c.key:String(c)), a=typeof q.answer==='object'?q.answer.key:String(q.answer);
      const nc=(n==='gDigitCompare'||n==='gSkipMember'||n==='gBiggerExpr')?2:4;
      if(new Set(ch).size!==nc) bad.push('count '+ch);
      if(!ch.includes(a)) bad.push('noans '+a+' in '+ch);
      if(/undefined|NaN|null|Infinity/.test(q.text+ch.join())) bad.push('undef '+q.text.slice(0,80));
      if(ch.some(c=>/^-|^\d+ ו--/.test(c))) bad.push('neg '+ch);
    }
    o.gen[n]=[...new Set(bad)].slice(0,3);}
  // semantic checks
  const strip=t=>t.replace(/<svg[\s\S]*?<\/svg>/g,' ').replace(/<[^>]+>/g,' ');
  const sem=[];
  for(let i=0;i<400;i++){
    let q=gDigitOf(); let t=strip(q.text); let n=+t.match(/\d+/)[0]; if(+q.answer!==(/העשרות/.test(t)?Math.floor(n/10):n%10)) sem.push('digitOf '+t);
    q=gBuildNumber(); t=strip(q.text); let m=t.match(/\d+/g).map(Number); let ex = m.length===1? m[0]*11 : m[0]*10+m[1]; if(+q.answer!==ex) sem.push('build '+t);
    q=gWordsToNum(); t=strip(q.text); if(numWords(+q.answer)!==t.match(/: (.*)\?/)[1].trim()) sem.push('w2n '+t);
    q=gNumToWords(); t=strip(q.text); n=+t.match(/\d+/)[0]; if(q.answer!==numWords(n)) sem.push('n2w '+t);
    q=gFindByDigit(); t=strip(q.text); m=+t.match(/היא\s+(\d)/)[1]; const tens=/העשרות/.test(t); const dig=x=>tens?Math.floor(x/10):x%10; if(q.choices.filter(c=>dig(c)===m).length!==1||dig(q.answer)!==m) sem.push('find '+t+q.choices);
    q=gMissingDigit(); t=strip(q.text); {const html=q.text; const mm=html.split('<br>')[1].replace(/^<span class="eq">/,'').replace(/<\/span>$/,''); const op=/&gt;/.test(mm)?'>':'<'; const parts=mm.replace(/&gt;|&lt;/,'|').split('|'); const lhs=parts[0].trim(), ref=+parts[1]; const val=+lhs.replace(/<span class="bx"><\/span>/,String(q.answer)); if(!(op==='>'?val>ref:val<ref)) sem.push('missd '+mm+q.answer); const bad=q.choices.filter(c=>c!==q.answer).some(c=>{const v=+lhs.replace(/<span class="bx"><\/span>/,String(c)); return op==='>'?v>ref:v<ref;}); if(bad) sem.push('missd-multi '+mm+q.choices);}
    q=gBetween(); t=strip(q.text); m=t.match(/\d+/g).map(Number); if(!(q.answer>m[0]&&q.answer<m[1])||q.choices.filter(c=>c>m[0]&&c<m[1]).length!==1) sem.push('between '+t+q.choices);
    q=gPredSucc(); if(q.d!==undefined) sem.push('predsucc has d override'); t=strip(q.text); n=+t.match(/\d+/)[0]; if(+q.answer!==(/עוקב/.test(t)?n+1:n-1)) sem.push('ps '+t);
    q=gSkipMember(); t=strip(q.text); m=t.match(/\d+/g).map(Number); if((q.answer==='כן')!==((m[2]-m[1])%m[0]===0)) sem.push('member '+t);
    q=gAddTwoDigit(); t=strip(q.text).replace(/\s+/g,' '); m=t.match(/\d+/g).map(Number); if(+q.answer!==m[0]+m[1]||(m[0]%10)+(m[1]%10)>9) sem.push('add '+t);
    q=gAddCarry(); t=strip(q.text).replace(/\s+/g,' '); m=t.match(/\d+/g).map(Number); if(+q.answer!==m[0]+m[1]||(m[0]%10)+(m[1]%10)<10) sem.push('addc '+t);
    q=gSubTwoDigit(); t=strip(q.text).replace(/\s+/g,' '); m=t.match(/\d+/g).map(Number); if(+q.answer!==m[0]-m[1]||(m[1]%10)>(m[0]%10)) sem.push('sub '+t);
    q=gSubBorrow(); t=strip(q.text).replace(/\s+/g,' '); m=t.match(/\d+/g).map(Number); if(+q.answer!==m[0]-m[1]||(m[1]%10)<=(m[0]%10)) sem.push('subb '+t);
    q=gBiggerExpr(); {const ev=s=>{const mm=s.match(/(\d+) ([+−]) (\d+)/); return mm[2]==='+'?+mm[1]+ +mm[3]:+mm[1]-mm[3];}; const [a,c]=q.choices; const big=ev(a)>ev(c)?a:c; if(ev(a)===ev(c)||q.answer!==big) sem.push('bigger '+q.choices);}
    q=gDigitsMinMaxDiff(); t=strip(q.text); m=t.match(/\d/g).slice(0,3).map(Number).sort((a,b)=>a-b); if(+q.answer!==(m[2]*10+m[1])-(m[0]*10+m[1])) sem.push('mm '+t);
    q=gHowManyBuild(); t=strip(q.text); {const ds=t.match(/הספרות\s+([\d, ]+)\./)[1].split(',').map(x=>+x.trim()); const rep=/כשמותר/.test(t); let c=0; ds.forEach(a=>ds.forEach(bb=>{if(a>0&&(rep||a!==bb))c++;})); if(+q.answer!==c) sem.push('howmany '+t);}
    q=gCountInSeries(); t=strip(q.text); m=t.match(/\d+/g).map(Number); if(/כמה מספרים/.test(t)){ if(+q.answer!==(m[2]-m[1])/m[0]+1) sem.push('cis '+t); } else { const k={החמישי:5,השישי:6,השביעי:7,השמיני:8}[t.match(/(החמישי|השישי|השביעי|השמיני)/)[1]]; if(+q.answer!==m[0]+m[1]*(k-1)) sem.push('cis2 '+t); }
    q=gSkipPair(); t=strip(q.text); m=t.match(/-?\d+/g).map(Number); {const sp=m[1]-m[0]; if(m[2]-m[1]!==sp) sem.push('skp shown '+t); const A=q.answer.match(/\d+/g).map(Number); if(A[0]!==m[2]+sp||A[1]!==m[2]+2*sp) sem.push('skp '+t+q.answer);}
    q=gSkipFill(); t=strip(q.text); m=t.match(/\d+/g).map(Number); {const first=m[m.length-2], last=m[m.length-1]; const sp=(last-first)/3; const A=q.answer.match(/\d+/g).map(Number); if(!Number.isInteger(sp)||A[0]!==first+sp||A[1]!==first+2*sp) sem.push('skf '+t+q.answer);}
    q=gOrderNumbers(); t=strip(q.text); m=t.match(/\d+/g).map(Number).filter(x=>x>=10); {const nums=m.slice(-4); const k=/שני/.test(t)?2:3; if(+q.answer!==nums.slice().sort((a,c)=>a-c)[k-1]) sem.push('order '+t);}
    q=gBiggestOfFour(); t=strip(q.text); m=t.match(/\d+/g).map(Number).filter(x=>x>=10); {const big=/הגדול/.test(t); if(+q.answer!==(big?Math.max(...m):Math.min(...m))) sem.push('b4 '+t);}
    q=gPartWhole(); t=strip(q.text); m=t.match(/\d+/g).map(Number); if(+q.answer!==m[0]-m[1]) sem.push('pw '+t);
    q=gTookAway(); t=strip(q.text); m=t.match(/\d+/g).map(Number); if(+q.answer!==m[0]-m[1]) sem.push('ta '+t);
    q=gGotMore(); t=strip(q.text); m=t.match(/\d+/g).map(Number); if(+q.answer!==m[0]+m[1]) sem.push('gm '+t);
    q=gTwoGroups(); t=strip(q.text); m=t.match(/\d+/g).map(Number); if(/יותר מ/.test(t)){ if(+q.answer!==m[0]+m[0]+m[1]) sem.push('tg2 '+t);} else if(+q.answer!==m[0]+m[1]) sem.push('tg '+t);
    q=gMadeAndLeft(); t=strip(q.text); m=t.match(/\d+/g).map(Number); if(+q.answer!==m[0]+m[1]-m[2]) sem.push('ml '+t);
    q=bNum_Clues(); t=strip(q.text); {const sols=[]; for(let x=10;x<=99;x++){ let okc=true; (q.text.split('<br>').slice(1)).forEach(line=>{ const L=line.replace('• ',''); let mm;
        if((mm=L.match(/סכום הספרות שלי הוא (\d+)/))){ okc=okc&&(Math.floor(x/10)+x%10===+mm[1]); }
        else if((mm=L.match(/ספרת העשרות שלי גדולה מספרת היחידות ב-(\d+)/))){ okc=okc&&(Math.floor(x/10)-x%10===+mm[1]); }
        else if((mm=L.match(/ספרת היחידות שלי גדולה מספרת העשרות ב-(\d+)/))){ okc=okc&&(Math.floor(x/10)-x%10===-mm[1]); }
        else if(/שתי הספרות שלי זהות/.test(L)){ okc=okc&&(Math.floor(x/10)===x%10); }
        else if(/אי-זוגי/.test(L)) okc=okc&&x%2===1; else if(/זוגי/.test(L)) okc=okc&&x%2===0;
        else if((mm=L.match(/גדול מ-(\d+)/))) okc=okc&&x>+mm[1]; else if((mm=L.match(/קטן מ-(\d+)/))) okc=okc&&x<+mm[1]; });
        if(okc) sols.push(x);} if(sols.length!==1||sols[0]!==+q.answer) sem.push('clues '+t+' sols='+sols+' ans='+q.answer); }
    q=bNum_FirstOver(); t=strip(q.text); m=t.match(/\d+/g).map(Number); {const [s0,k,thr]=m; let x=s0; while(x<=thr) x+=k; if(+q.answer!==x) sem.push('fo '+t);}
    q=gNumberRiddle(); // exactly one choice satisfies is not required; the answer must satisfy
    q=gPerimeter(); {const labs=[...q.text.matchAll(/>(\d+) ס״מ</g)].map(x=>+x[1]); if(+q.answer!==labs.reduce((a,c)=>a+c,0)) sem.push('perim '+labs+q.answer);}
    q=gRectPerimeter(); {const labs=[...q.text.matchAll(/>(\d+) ס״מ</g)].map(x=>+x[1]); const exp=2*(labs[0]+labs[1]); if(labs.length!==2||+q.answer!==exp) sem.push('rect '+labs+q.answer); if(q.d!==undefined) sem.push('rect has d override');}
    q=gPolygonName(); {const pts=q.text.match(/<polygon points="([^"]+)"/)[1].trim().split(' ').length; const nm={3:'משולש',4:'מרובע',5:'מחומש',6:'משושה',8:'מתומן'}[pts]; if(q.answer!==nm) sem.push('poly '+pts+q.answer);}
  }
  o.sem=[...new Set(sem.map(x=>x.slice(0,140)))].slice(0,8);
  // numWords sanity
  o.words=[0,10,11,12,13,16,20,21,22,40,41,52,64,74,80,85,87,99].map(numWords).join(' | ');
  // skill meta / difficulty / help
  o.noMeta=names.filter(n=>!SKILL_META[n]||!(n in SKILL_DIFFICULTY)); o.noHelp=names.filter(n=>!HELP[n]||!HELP[n].ex||!HELP[n].ex.length);
  o.cov={}; o.covBad=[];
  for(const [lv,pool] of Object.entries(pools)){ if(lv==='5') continue; for(const d of [1,2,3]){ const k=new Set(pool.filter(g=>skillDifficulty(g.name)===d).map(g=>g.name)).size; o.cov[lv+'/'+d]=k; if(k<2) o.covBad.push(lv+'/'+d);} }
  o.bonus7=BONUS_POOLS[7].map(g=>g.name).join();
  o.lv=LEVELS.map(l=>l.id).join();
  o.mix=names.filter(n=>!n.startsWith('b')).every(n=>pools[5].some(g=>g.name===n));
  o.areaOk=Object.values(SKILL_META).every(m=>STATS_CONFIG.areas[m.area]);
  return o;});
console.log(JSON.stringify(r,null,1));
ok(r.names===34,'34 generators tested');
for(const [n,bd] of Object.entries(r.gen)) if(bd.length) ok(false,'generator '+n+' '+JSON.stringify(bd)); else ok(true,'gen '+n);
ok(r.sem.length===0,'semantics '+JSON.stringify(r.sem));
ok(r.noMeta.length===0,'meta+difficulty '+r.noMeta);ok(r.noHelp.length===0,'help '+r.noHelp);
ok(r.covBad.length===0,'coverage >=2 per section x level: '+r.covBad);ok(r.mix,'all regular new types in mix');ok(r.areaOk,'areas all known');
ok(r.lv==='7,1,2,6,3,4,8,5','level order '+r.lv);
ok(errs.length===0,'no page errors '+errs);
await b.close();process.exit(f?1:0);})();
