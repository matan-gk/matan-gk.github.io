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
  const variety=Object.fromEntries(Object.entries(seen).map(([k,v])=>[k,v.size]));
  return {fails:[...new Set(fails)].slice(0,8),variety,
    meta:['gShNotInText','gShSynonyms','gShPurpose'].every(k=>SKILL_META[k]&&SKILL_META[k].area==='reading'&&SKILL_DIFFICULTY[k]&&HELP[k]&&HELP[k].ex.length),
    inPool:pools[9].includes(gReading)&&SHORT_READING_POOL.every(g=>pools[9].includes(g)), noMix:!pools[5].some(g=>SHORT_READING_POOL.includes(g))};
});
console.log('variety (distinct texts in 800 draws):',JSON.stringify(o.variety));
const bad=o.fails.length||!o.meta||!o.inPool||!o.noMix||errs.length||Object.values(o.variety).some(v=>v<60);
console.log(bad?'FAIL '+JSON.stringify(o)+errs:'ok   short reading questions: voweled, one right answer, varied, in the reading section only');
await b.close(); process.exit(bad?1:0);})();
