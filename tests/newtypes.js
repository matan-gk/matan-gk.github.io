const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
const r=await p.evaluate(()=>{
  const o={};
  // coverage: section x difficulty
  o.cov={};o.covBad=[];
  for(const [lv,pool] of Object.entries(pools)){ if(lv==='5'||lv==='9') continue;
    for(const d of [1,2,3]){ const n=new Set(pool.filter(g=>skillDifficulty(g.name)===d).map(g=>g.name)).size; o.cov[lv+'/'+d]=n; if(n<2) o.covBad.push(lv+'/'+d); } }
  o.bonusAll3=Object.values(BONUS_POOLS).flat().every(g=>skillDifficulty(g.name)===3);
  o.bonusNames=Object.values(BONUS_POOLS).flat().map(g=>g.name);
  o.noBonusFlag=['gComboRule','gCountCircles','gFourLinkChain'].every(i=>!SKILL_META[i].bonus && skillDifficulty(i)===2);
  o.p4all=LOGIC_POOL.every(g=>pools[4].includes(g))&&pools[4].length===LOGIC_POOL.length;
  o.noSwitch=typeof LOGIC_DIFFICULTY==='undefined';
  o.p5has=['gCompareChain','gWorkBackwards','gSymbolsMul','gSchedule','gInterleavedSeq','gBudget','gFourLinkChain','gComboRule'].every(n=>pools[5].some(g=>g.name===n)||pools[4].some(g=>g.name===n)&&pools[5].some(g=>g.name==='gShapeAnalogy'));
  // alias
  const st=statsSanitize({log:[{t:1,s:'bLogic_HardCount',l:4,b:1,c:1,d:3}],daily:{'2026-01-01':{bL2_FourLinkChain:{n:2,c:1,t:4},gFourLinkChain:{n:3,c:3,t:5}}}});
  o.alias=st.log[0].s+','+JSON.stringify(st.daily['2026-01-01']);
  // generators
  const names=['gCompareChain','gWorkBackwards','gSymbolsMul','gSchedule','gInterleavedSeq','gBudget','gComboRule','gCountCircles','gFourLinkChain'];
  o.gen={};
  for(const n of names){ const fn=window[n]||eval(n); let bad=[];
    for(let i=0;i<500;i++){ const q=fn(); const ch=q.choices.map(c=>typeof c==='object'?c.key:String(c)); const a=typeof q.answer==='object'?q.answer.key:String(q.answer);
      if(new Set(ch).size!==4) bad.push('dup '+ch);
      if(!ch.includes(a)) bad.push('noans');
      if(/undefined|NaN|null/.test(q.text+ch.join())) bad.push('undef');
      if(ch.some(c=>/^-|-\d/.test(c))) bad.push('neg '+ch);
    }
    o.gen[n]=[...new Set(bad)].slice(0,3);}
  // semantic checks
  const sem=[];
  const strip=t=>t.replace(/<[^>]+>/g,' ');
  for(let i=0;i<300;i++){
    let q=gCompareChain(); let n=strip(q.text).match(/\d+/g).map(Number); const [A,d1,d2]=n; if(+q.answer!==(A+d1)+(A+d1-d2)) sem.push('chain '+q.text);
    q=gWorkBackwards(); n=strip(q.text).match(/\d+/g).map(Number); const txt=strip(q.text); const E=n[n.length-1];
    const so=+txt.match(/נמכרו\s+(\d+)/)[1], de=+txt.match(/עוד\s+(\d+)/)[1]; if(+q.answer!==E+so-de) sem.push('back '+txt);
    q=gSymbolsMul(); n=strip(q.text.split('<br>')[0]+' '+q.text.split('<br>')[1]).match(/\d+/g).map(Number);
    const [k,X,m2,Y]=[n[0],n[1],n[2],n[3]]; const A0=X/k; if(A0+q.answer*m2!==Y) sem.push('sym '+q.text);
    q=gBudget(); n=strip(q.text).match(/\d+/g).map(Number); const M=Math.max(n[0],n[1]),pr=Math.min(n[0],n[1]); const ans=/כמה כסף/.test(q.text)?M%pr:Math.floor(M/pr); if(+q.answer!==ans) sem.push('bud '+q.text);
    q=gInterleavedSeq(); const seq=strip(q.text).split('מה המספר החסר בסדרה?')[1].match(/\d+/g).map(Number);
    const odd=seq.filter((_,j)=>j%2===0), ev=seq.filter((_,j)=>j%2===1); const next=seq.length%2===0?odd[odd.length-1]+(odd[1]-odd[0]):ev[ev.length-1]+(ev[1]-ev[0]);
    if(+q.answer!==next) sem.push('seq '+seq+' '+q.answer);
  }
  o.sem=sem.slice(0,5);
  // schedule: parse clock + numbers
  const ss=[];const acts=new Set();
  for(let i=0;i<400;i++){ const q=gSchedule(); const dm=q.text.match(/data-time="(\d+):(\d+)"/); const t=cT(+dm[1],+dm[2]);
    const txt=strip(q.text.replace(/<svg[\s\S]*?<\/svg>/,''));
    acts.add((txt.match(/ל(חוג ריקוד|מסיבת יום הולדת|סרט בקולנוע|אימון כדורגל|שיעור פסנתר|הצגה בתיאטרון|חוג ציור|שיעור שחייה)/)||[])[1]);
    const dur=s=>{ s=s.trim(); let m; if(s==='רבע שעה')return 15; if(s==='חצי שעה')return 30; if((m=s.match(/^(\d+) דקות/)))return +m[1]; if(s==='שעה')return 60; if((m=s.match(/^שעה ו-(\d+) דקות/)))return 60+ +m[1]; if((m=s.match(/^שעתיים ו-(\d+) דקות/)))return 120+ +m[1]; if(s==='שעתיים')return 120; if((m=s.match(/^שעה ורבע/)))return 75; if(s.startsWith('שעה וחצי'))return 90; if((m=s.match(/^(\d+) שעות/)))return m[1]*60; return NaN; };
    const mT=txt.match(/הדרך[^.]*? לוקחת ([^,.]+?)[,.]/); const T=dur(mT[1]);
    let exp;
    if(/מסתיים|מסתיימת/.test(txt)){ const mD=txt.match(/(?:נמשך|נמשכת) ([^.]+?)\./); exp=t+T+dur(mD[1]); }
    else { const mE=txt.match(/להגיע ([^.]+?) לפני/); exp=t-T-dur(mE[1]); }
    if(cStr(exp)!==q.answer) ss.push(txt+' => '+q.answer+' exp '+cStr(exp));
    if(/\b(מתחילה|נמשכת|מסתיימת)/.test(txt)&&/(חוג|סרט|אימון|שיעור)/.test(txt.split('?')[0].replace(/ל(חוג|שיעור)/,'')) ){ /* fem verbs only for fem activities */ if(/(החוג|הסרט|האימון|השיעור) (מתחילה|נמשכת|מסתיימת)/.test(txt)) ss.push('actgender '+txt); }
    if(/(המסיבה|ההצגה) (מתחיל|נמשך|מסתיים)\b/.test(txt)) ss.push('actgender2 '+txt);
    if(/(דני|תום|איתי|יובל|עומר|גיא|ארי|נדב) יוצאת/.test(txt)||/(דנה|נועה|ליה|מאיה|רוני|שירה|יעל|אלה) יוצא /.test(txt)) ss.push('pgender '+txt);
  }
  o.sched=ss.slice(0,4); o.acts=[...acts].length;
  // help pages + labels
  o.help=names.concat(['gComboRule']).filter(n=>!HELP[n]||!HELP[n].ex||!HELP[n].ex.length);
  o.helpBonus=Object.keys(HELP).filter(k=>/בונוס/.test(HELP[k].what)&&!(k in SKILL_META&&SKILL_META[k].bonus));
  return o;});
console.log(JSON.stringify(r,null,1));
ok(r.covBad.length===0,'every section x difficulty has >=2 regular types: '+r.covBad);
ok(r.bonusAll3,'all bonus rated hard');ok(r.noBonusFlag,'3 re-classified types are regular & medium');
ok(!r.bonusNames.some(n=>['gComboRule','gCountCircles','gFourLinkChain'].includes(n)),'not in bonus pools');
ok(r.p4all,'section 4 pool = all logic types');ok(r.noSwitch,'LOGIC_DIFFICULTY gone');ok(r.p5has,'mix has new types');
ok(r.alias.startsWith('gCountCircles,')&&r.alias.includes('"n":5,"c":4'),'alias remap+merge: '+r.alias);
for(const [n,b] of Object.entries(r.gen)) ok(b.length===0,'generator '+n+' '+b);
ok(r.sem.length===0,'semantics '+JSON.stringify(r.sem));ok(r.sched.length===0,'schedule '+JSON.stringify(r.sched));ok(r.acts===8,'8 activities seen: '+r.acts);
ok(r.help.length===0,'help pages: '+r.help);ok(r.helpBonus.length===0,'no stale "bonus" wording: '+r.helpBonus);
ok(errs.length===0,'no page errors '+errs);
await b.close();process.exit(f?1:0);})();
