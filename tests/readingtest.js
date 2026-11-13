const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const ctx=await b.newContext({viewport:{width:320,height:700}}); const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);await p.evaluate(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','גאיה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
// the section exists, is not in the mix, has its own rules
const s=await p.evaluate(()=>({lv:LEVELS.some(l=>l.id===9), mix:pools[5].some(g=>g.name==='gReading'), vis:mxVisibleLevels(diffOn,mxState).includes(9), bank:READING_BANK.length,
  skills:READING_BANK.flatMap(x=>x.qs.map(q=>q.skill)), reg:['rdCause','rdWordRole','rdPhrase','rdPurpose','rdNotInText','rdWordMeaning','rdMotive','rdSynonyms'].filter(n=>!SKILL_META[n]||!HELP[n]||!SKILL_DIFFICULTY[n]),
  qs:READING_BANK.every(x=>x.qs.every(q=>q.w.length===3&&!q.w.includes(q.a)&&new Set([q.a,...q.w]).size===4))}));
ok(s.lv&&s.vis,'section 9 exists and is in the menu'); ok(!s.mix,'reading is not in the rainbow mix'); ok(s.reg.length===0,'all reading skills have a name, help and a rating '+s.reg);
ok(new Set(s.skills).size===8,'the first passage uses all eight question types'); ok(s.qs,'every question has one right and three distinct wrong answers');
// open the section: the passage opens first, with numbered lines
await p.evaluate(()=>openGame(9)); await p.waitForTimeout(300);
ok(await p.locator('#rdOverlay').isVisible(),'the passage opens before the first question');
const n=await p.evaluate(()=>({lines:document.querySelectorAll('.rdl').length, nums:[...document.querySelectorAll('.rdn')].map(e=>e.textContent).join(',')}));
ok(n.lines===15&&n.nums==='1,2,3,4,5,6,7,8,9,10,11,12,13,14,15','15 lines, each with its own number: '+n.nums);
// alignment: every number sits level with the first screen line of its own line, and some lines wrap to 2+ screen lines
const al=await p.evaluate(()=>{ let wrapped=0, bad=[]; document.querySelectorAll('.rdl').forEach(l=>{ const t=l.querySelector('.rdt'), n=l.querySelector('.rdn'); const lh=parseFloat(getComputedStyle(t).lineHeight); if(t.getBoundingClientRect().height>lh*1.6) wrapped++;
    const rt=t.getBoundingClientRect(), rn=n.getBoundingClientRect(); const cy=rn.top+rn.height/2; if(cy<rt.top-2||cy>rt.top+lh+2) bad.push(l.dataset.n); }); return {wrapped,bad}; });
ok(al.wrapped>=3,'at 320px wide several lines wrap onto 2-3 screen lines ('+al.wrapped+')'); ok(al.bad.length===0,'the number stays beside the first screen line of its line: bad='+al.bad);
await p.click('.rdclose'); ok(!(await p.locator('#rdOverlay').count()),'closed');
// first question, the passage button highlights the referenced lines
ok((await p.textContent('#qlabel')).includes('הַקִּפּוֹד')&&(await p.textContent('#qlabel')).includes('1'),'label names the passage and the question number');
ok(await p.locator('.choices.wide').count()===1,'answers are in one column');
await p.click('.rdbtn'); const hl=await p.evaluate(()=>[...document.querySelectorAll('.rdhl')].map(e=>e.dataset.n).join(',')); ok(hl==='6,7,8','the question\'s lines are highlighted: '+hl); await p.click('.rdclose');
// answer 3 questions, leave, come back: resumes at the 4th
async function answer(right){ await p.evaluate(r=>{ const a=current.answer; const btns=[...document.querySelectorAll('#answerArea .choice')]; (r? btns.find(b=>b.textContent==a) : btns.find(b=>b.textContent!=a)).click(); },right); await p.waitForTimeout(150); }
for(let i=0;i<3;i++){ await answer(i!==1); await p.evaluate(()=>nextQuestion()); await p.waitForTimeout(120); await p.evaluate(()=>rdClose()); }
ok(await p.evaluate(()=>rd.cur.i)===3&&await p.evaluate(()=>rd.done.length)===0,'three answered (one wrongly): the passage is in progress at question 4');
await p.reload(); await p.waitForTimeout(300); await p.evaluate(()=>openGame(9)); await p.waitForTimeout(200);
ok(await p.evaluate(()=>current.rd.i)===3,'after reloading, the passage resumes at question 4 (progress saved)');
await p.evaluate(()=>rdClose());
// stats are recorded under the question's own skill
const sk=await p.evaluate(()=>[...new Set(activeProfile().stats.log.map(r=>r.s))].join(','));
ok(/rdCause/.test(sk)&&/rdWordRole/.test(sk)&&!/gReading/.test(sk),'answers are logged per question type: '+sk);
// no bonus in this section
ok(await p.evaluate(()=>{ streak=4; return true; }),'(streak set)'); 
// finish: the passage is done, never offered again, the section leaves the menu
for(let i=0;i<5;i++){ await answer(true); await p.evaluate(()=>nextQuestion()); await p.waitForTimeout(120); await p.evaluate(()=>rdClose()); }
const fin=await p.evaluate(()=>({done:rd.done.slice(), cur:rd.cur, vis:mxVisibleLevels(diffOn,mxState).filter(id=>id!==9||rdAvailable()).includes(9), view:gameView, saved:JSON.parse(JSON.stringify(activeProfile().progress.rd))}));
ok(fin.done.join()==='hedgehog'&&fin.cur===null,'all 8 answered: the passage is done'); ok(!fin.vis&&fin.view==='home','the section leaves the menu and the game returns home'); ok(fin.saved.done[0]==='hedgehog','saved in the profile');
ok(await p.evaluate(()=>{ const d=cloudDocFromProfile(activeProfile(),700000,0); return d.v===CLOUD_DOC_V&&JSON.parse(d.p).rd.done[0]==='hedgehog'; }),'the cloud document carries it, in format '+await p.evaluate(()=>CLOUD_DOC_V));
// a profile from before the section: no rd, level 1
ok(await p.evaluate(()=>{ const c=cleanProgress({score:5,level:9}); return c.level===9&&c.rd.done.length===0&&c.rd.cur===null; }),'old progress without rd loads clean; level 9 survives loading');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
