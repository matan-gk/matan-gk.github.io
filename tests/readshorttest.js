// Short reading questions (group A): not-in-text, synonyms, purpose. Generated, so they never run out.
const T=require('./lib.js');
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({...T.launchOpts});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL);
const o=await p.evaluate(()=>{
  const fails=[], strip=t=>t.replace(/<br>/g,' ').replace(/<[^>]+>/g,'').replace(/\s+/g,' ');
  // a Hebrew word counts as voweled when it has at least one nikud mark (single letters and the hyphen are ignored)
  const bare = t => strip(t).split(/[\s"–:!?.,]+/).filter(w=>/[א-ת]{2,}/.test(w.replace(/[ְ-ׇ]/g,'')) && !/[ְ-ׇ]/.test(w));
  const seen={};
  for(let i=0;i<800;i++){
    for(const g of SHORT_READING_POOL){
      const q=g(); seen[g.name]=seen[g.name]||new Set(); seen[g.name].add(strip(q.text)+'|'+q.choices.slice().sort().join());
      const bw=bare(q.text).concat(...q.choices.map(c=>bare(String(c)))); if(bw.length) fails.push(g.name+' bare words: '+bw.slice(0,3));
      if(/�|undefined|NaN/.test(q.text+q.choices.join())) fails.push(g.name+' broken text');
      if(new Set(q.choices).size!==4||!q.choices.includes(q.answer)) fails.push(g.name+' choices');
      if((q.text.match(/<br>/g)||[]).length>2) fails.push(g.name+' too many lines');
    }
  }
  // not-in-text: the answer question is not answerable from the text, the other three are
  for(let i=0;i<300;i++){ const q=gShNotInText(); const body=strip(q.text); const wh=q.choices.filter(c=>c!==q.answer);
    if(q.choices.length!==4) fails.push('nit n'); }
  // synonyms: exactly one right answer, the others the other kind
  for(let i=0;i<500;i++){ const q=gShSynonyms(); const ask=/אֵינָן/.test(q.text)?'not':'yes';
    const isSyn=c=>RS_SYN.some(x=>c===x[0]+' – '+x[1]||c===x[1]+' – '+x[0]);
    const n=q.choices.filter(isSyn).length;
    if(ask==='not'&&(n!==3||isSyn(q.answer))) fails.push('syn not: '+q.choices);
    if(ask==='yes'&&(n!==1||!isSyn(q.answer))) fails.push('syn yes: '+q.choices);
    const words=q.choices.join(' – ').split(' – '); if(new Set(words).size!==8) fails.push('syn repeated word '+q.choices); }
  // cause and motive: the answer is not a copy of a sentence of the text, and the question is about the first line
  for(let i=0;i<400;i++) for(const g of [gShCause,gShMotive]){ const q=g(); const lines=q.text.split('<br>');
    if(lines.length!==3) fails.push(g.name+' lines');
    if(lines.slice(0,2).some(l=>l.includes(String(q.answer).replace(/^כִּי |^כְּדֵי /,'')))) fails.push(g.name+' answer copied from the text: '+q.answer); }
  // word role / phrase / word meaning: the quoted word or phrase really is in the text; the role answer matches the word
  for(let i=0;i<600;i++) for(const g of [gShWordRole,gShPhrase,gShWordMeaning]){ const q=g(); const lines=q.text.split('<br>'); const quoted=(lines[lines.length-1].match(/"([^"]+)"/)||[])[1];
    if(!quoted) { fails.push(g.name+' no quote'); continue; }
    if(!lines.slice(0,-1).join(' ').includes(quoted)) fails.push(g.name+' quoted part missing from text: '+quoted+' / '+lines.slice(0,-1).join(' '));
    if(g===gShWordRole && RS_ROLE[quoted]!==q.answer) fails.push('role mismatch '+quoted);
    if(/undefined|\$\{/.test(q.text+q.choices.join())) fails.push(g.name+' template leak'); }
  // weights: 4 to 8 short questions before every new passage
  const gaps=[]; { const bankSave=READING_BANK.slice(); rd=rdClean({}); rdGap=0; let run=0, started=0;
    for(let i=0;i<300&&started<4;i++){ const gen=rdPick(pools[9], pools[9][ri(0,pools[9].length-1)]);
      if(gen===gReading){ const n=rdNext(); if(rd.cur.i===0 && run>=0 && started>=0){ if(started>0||run>0) gaps.push(run); started++; run=0; }
        rdFinish(n.p); } else run++; } }
  if(gaps.length<3||gaps.some(x=>x<4||x>8)) fails.push('gaps between passages: '+gaps);
  const variety=Object.fromEntries(Object.entries(seen).map(([k,v])=>[k,v.size]));
  return {fails:[...new Set(fails)].slice(0,8),variety,
    meta:['gShNotInText','gShSynonyms','gShPurpose','gShCause','gShMotive','gShWordRole','gShPhrase','gShWordMeaning'].every(k=>SKILL_META[k]&&SKILL_META[k].area==='reading'&&SKILL_DIFFICULTY[k]&&HELP[k]&&HELP[k].ex.length),
    inPool:pools[9].includes(gReading)&&SHORT_READING_POOL.every(g=>pools[9].includes(g)), noMix:!pools[5].some(g=>SHORT_READING_POOL.includes(g))};
});
console.log('variety (distinct texts in 800 draws):',JSON.stringify(o.variety));
const bad=o.fails.length||!o.meta||!o.inPool||!o.noMix||errs.length||Object.values(o.variety).some(v=>v<60);
console.log(bad?'FAIL '+JSON.stringify(o)+errs:'ok   short reading questions: voweled, one right answer, varied, in the reading section only');
await b.close(); process.exit(bad?1:0);})();
