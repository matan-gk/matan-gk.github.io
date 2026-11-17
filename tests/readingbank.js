// The whole reading bank: structure of every passage, every passage playable, and the passage never pops up by itself on the menu
const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts); const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
const E=(fn,...a)=>p.evaluate(fn,...a);
await E(()=>{ pools[9]=[gReading]; });   // passages only: the short questions have their own test
const SK=['rdCause','rdWordRole','rdPhrase','rdPurpose','rdNotInText','rdWordMeaning','rdMotive','rdSynonyms'];
const rep=await E(()=>READING_BANK.map(x=>{ const lines=[].concat(...x.paras); const bad=[];
  if(x.qs.length!==8) bad.push('questions '+x.qs.length);
  if(x.qs.map(q=>q.skill).join()!==['rdCause','rdWordRole','rdPhrase','rdPurpose','rdNotInText','rdWordMeaning','rdMotive','rdSynonyms'].join()) bad.push('skills/order');
  x.qs.forEach(q=>{ if(q.w.length!==3||q.w.includes(q.a)||new Set([q.a,...q.w]).size!==4) bad.push('choices '+q.skill); if(q.lines.some(n=>!Number.isInteger(n)||n<1||n>lines.length)) bad.push('lines '+q.skill);
    // a line number written in the question text must be one of the question's own lines
    const m=(q.q.match(/שׁוּר(?:ָה|וֹת) (\d+)/)||[]); if(m[1]&&!q.lines.includes(+m[1])) bad.push('text line '+q.skill);
    if(/�/.test(JSON.stringify(q))) bad.push('bad char '+q.skill); });
  if(lines.some(l=>/�/.test(l))) bad.push('bad char in text');
  if(lines.length<12||lines.length>18) bad.push('length '+lines.length);
  return {id:x.id,n:lines.length,bad}; }));
ok(rep.length>=4,'the bank has '+rep.length+' passages: '+rep.map(r=>r.id+'('+r.n+')').join(' '));
rep.forEach(r=>ok(r.bad.length===0,r.id+': 8 questions in order, 3 distinct wrong answers, lines in range, no broken characters '+r.bad.join(',')));
ok(await E(()=>new Set(READING_BANK.map(x=>x.id)).size===READING_BANK.length&&READING_BANK.every(x=>/^[a-z]+$/.test(x.id))),'ids are unique');
// every passage can be played to the end, one after another, and none repeats
const seen=[];
for(let k=0;k<rep.length;k++){
  await E(()=>{ openGame(9); });  await p.waitForTimeout(150);
  const id=await E(()=>current.rd&&current.rd.id); seen.push(id);
  for(let i=0;i<8;i++){
    await E(()=>rdClose());
    const got=await E(()=>({id:current.rd.id,i:current.rd.i,btns:document.querySelectorAll('#answerArea .choice, .choices .choice').length}));
    if(got.id!==id||got.i!==i) { ok(false,'sequence '+id+' q'+i+' got '+JSON.stringify(got)); break; }
    await E(()=>{ const q=current; const el=[...document.querySelectorAll('.choice')].find(c=>c.textContent.trim()===String(q.answer).trim())||document.querySelector('.choice'); el.click(); });
    await p.waitForTimeout(80);
    await E(()=>{ rdClose(); nextQuestion(); }); await p.waitForTimeout(60);
  }
  await E(()=>{ rdClose(); });
}
ok(new Set(seen).size===rep.length&&await E(()=>rd.done.length===READING_BANK.length),'all '+rep.length+' passages were offered once each and finished: '+seen.join(','));
// the passage itself must not open on the menu: a passage in progress, level 9 saved, then a reload
await E(()=>{ rd=rdClean({done:[],cur:{id:READING_BANK[1].id,i:2},t:{}}); level=9; gameView='home'; saveState(); });
await p.reload(); await p.waitForTimeout(500); await E(()=>{ pools[9]=[gReading]; });
ok(await E(()=>!document.getElementById('rdOverlay')&&gameView==='home'),'reload with a passage in progress: the menu shows no passage');
await E(()=>{ [...document.querySelectorAll('#levels .levelbtn')].find(x=>x.textContent.includes('ספריית')).click(); }); await p.waitForTimeout(250);
ok(await E(()=>gameView==='play'&&!!document.getElementById('rdOverlay')&&current.rd.i===2),'tapping the section opens the passage, at the question she had reached');
await E(()=>{ rdClose(); showHome(); }); 
ok(await E(()=>!document.getElementById('rdOverlay')),'going home closes the passage');
await E(()=>{ openGame(9); }); await p.waitForTimeout(150); await E(()=>showHome());
ok(await E(()=>!document.getElementById('rdOverlay')&&gameView==='home'),'leaving with the passage open leaves nothing on the menu');
// a profile switch (nextQuestion from outside the game) stays silent
await E(()=>{ rdClose(); level=9; gameView='home'; nextQuestion(); });
ok(await E(()=>!document.getElementById('rdOverlay')),'a question prepared on the menu (profile switch) does not open the passage');
ok(errs.length===0,'no page errors '+errs.join(';'));
await b.close(); process.exit(f?1:0);
})();
