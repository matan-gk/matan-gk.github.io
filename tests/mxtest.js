const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts); const ctx=await b.newContext({viewport:{width:390,height:844}}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
const E=(fn,...a)=>p.evaluate(fn,...a);
// ---- default = exactly today's behaviour ----
ok(await E(()=>[1,2,3,4,5,6,7,8].every(l=>poolFor(l).length===filterByDifficultySet(pools[l],diffOn).length&&poolFor(l)===filterByDifficultySet(pools[l],diffOn)||poolFor(l).every((g,i)=>g===filterByDifficultySet(pools[l],diffOn)[i]))),'default: every pool is what the difficulty switches gave before');
ok(await E(()=>{diffOn=[1];const r=[1,2,3,4,5,6,7,8].every(l=>{const a=poolFor(l),b=filterByDifficultySet(pools[l],[1]);return a.length===b.length&&a.every((g,i)=>g===b[i]);});diffOn=[1,2,3];return r;}),'simple "easy only" unchanged, including sections with no easy type');
ok(await E(()=>mxVisibleLevels([1,2,3],{off:[],hide:[]}).length===8),'all 8 menu entries visible by default');
// ---- pure rules ----
const R=await E(()=>{
  const out={};
  let r=mxToggleCell([1,2,3],{off:[],hide:[]},7,3); out.cellOff=r.mx.off.join(',')+'|'+r.diff.join(',');
  r=mxToggleCell(r.diff,r.mx,7,3); out.cellBack=r.mx.off.length+'|'+r.diff.join(',');
  // switch off every typed cell of a column => the level itself goes off
  let d=[1,2,3], m={off:[],hide:[]}; MX_SECTIONS.filter(s=>mxHasTypes(s,3)).forEach(s=>{ const x=mxToggleCell(d,m,s,3); d=x.diff; m=x.mx; }); out.colOff=d.join(',')+'|'+m.off.length;
  // switching on one cell of an off level shows only that cell
  r=mxToggleCell([1,2],{off:[],hide:[]},4,3); out.oneCell=r.diff.join(',')+'|'+r.mx.off.length+'|'+mxCellOn(r.diff,r.mx,4,3)+'|'+mxCellOn(r.diff,r.mx,7,3);
  // column switch clears that column's cells
  r=mxSetLevel([1,2,3],{off:['7:2','7:3'],hide:[]},2,true); out.colClear=r.mx.off.join(',');
  out.junk=JSON.stringify(mxClean({off:['x','99:1','7:9','7:1','7:1'],hide:['nope','gAddTwoDigit','bLogicMatrix']}));
  out.viable=[mxViable([1,2,3],{off:[],hide:[]}), mxViable([1,2,3],{off:[],hide:Object.keys(SKILL_META).filter(k=>!SKILL_META[k].bonus)})];
  return out; });
ok(R.cellOff==='7:3|1,2,3','toggle a cell off: '+R.cellOff);
ok(R.cellBack==='0|1,2,3','toggle it back on: '+R.cellBack);
ok(R.colOff==='1,2|0','all cells of a level off => level off, no leftovers: '+R.colOff);
ok(R.oneCell==='1,2,3|6|true|false','cell on an off level shows only that cell: '+R.oneCell);
ok(R.colClear==='7:3','column switch clears that column only: '+R.colClear);
ok(R.junk==='{"off":["7:1"],"hide":["gAddTwoDigit"]}','junk, duplicates and bonus types are dropped: '+R.junk);
ok(R.viable[0]===true&&R.viable[1]===false,'a state with nothing to show is refused');
// ---- effects on drawn questions ----
const draw=await E(()=>{ mxState={off:['7:1','7:2'],hide:['gBetween']}; level=7; renderLevels(); const seen=new Set(); for(let i=0;i<400;i++){ nextQuestion(); seen.add(current.skill); }
  const bad=[...seen].filter(s=>skillDifficulty(s)!==3||s==='gBetween'); level=5; const mix=new Set(); for(let i=0;i<600;i++){ nextQuestion(); mix.add(current.skill); }
  const mixNum=[...mix].filter(s=>sectionOfSkill(s)===7&&skillDifficulty(s)!==3); const mixOther=[...mix].filter(s=>sectionOfSkill(s)!==7).length;
  mxState={off:[],hide:[]}; return {n:seen.size,bad,mixNum,mixOther}; });
ok(draw.n>0&&draw.bad.length===0,'numbers section: only hard types appear, hidden type never: '+draw.n+' types seen '+draw.bad);
ok(draw.mixNum.length===0&&draw.mixOther>10,'mix level honours the same cells and still draws from other sections');
// ---- hiding a whole section removes it from the child menu and moves her out of it ----
const hid=await E(()=>{ level=6; const m={off:[],hide:pools[6].map(g=>g.name)}; diffOn=[1,2,3]; mxState=m; renderLevels(); const names=[...document.querySelectorAll('#levels .levelbtn')].map(x=>x.textContent); const lv=level; mxState={off:[],hide:[]}; renderLevels(); return {names:names.length,lv,clock:names.some(n=>n.includes('שעון'))}; });
ok(hid.names===7&&!hid.clock&&hid.lv===5,'all clock types hidden: section leaves the menu and she moves to the mix');
// ---- UI: settings tab ----
await E(()=>openPanel('settings')); await p.waitForTimeout(200);
ok(await p.locator('table.qmx').count()===1&&await p.locator('table.qmx tbody tr').count()===7,'matrix has a row per section');
ok(await p.locator('[data-dlvl]').count()===3,'simple difficulty switches still on top');
ok(!(await p.locator('details.mxd').getAttribute('open')!==null),'fine-tuning is collapsed until needed');
await p.locator('details.mxd > summary').click();
await p.click('[data-pact=mxcell][data-id="7:3"]'); await p.waitForTimeout(150);
ok(await E(()=>mxState.off.join(',')==='7:3'),'cell click is applied at once to the game');
ok(await p.locator('details.mxd').getAttribute('open')!==null&&(await p.textContent('details.mxd > summary')).includes('מותאם אישית'),'panel stays open and is tagged as customised');
const sp=await E(()=>{ for(let i=0;i<200;i++){ nextQuestion(); if(sectionOfSkill(current.skill)===undefined&&false) return 1; } return 0; });
// checkbox for one type
await p.locator('details.mxsec[data-mxk="t7"] > summary').click();
await p.click('input[data-mxtype="gAddTwoDigit"]',{force:true}); await p.waitForTimeout(150);
ok(await E(()=>mxState.hide.includes('gAddTwoDigit')),'unticking a type hides it at once');
// persistence + per-profile
await p.reload(); await p.waitForTimeout(300);
ok(await E(()=>mxState.off.join(',')==='7:3'&&mxState.hide.join(',')==='gAddTwoDigit'),'settings survive reload');
// save-code style roundtrip through captureProgress/cleanProgress
ok(await E(()=>{ const c=cleanProgress(JSON.parse(JSON.stringify(captureProgress()))); return c.mx.off[0]==='7:3'&&c.mx.hide[0]==='gAddTwoDigit'; }),'carried in saved progress (backup codes and cloud use the same data)');
ok(await E(()=>{ const c=cleanProgress({score:3}); return mxIsDefault(c.mx)&&diffIdsClean(c.diff).length===3; }),'old saves without the field load with defaults');
// second profile keeps its own
await E(()=>{ store.profiles.push({id:'zz',name:'דני',gender:'m',progress:cleanProgress({}),stats:statsNew(),u:Date.now()}); persist(); setViewId='zz'; openPanel('settings'); });
ok(await E(()=>profileMx(store.profiles.find(x=>x.id==='zz')).off.length===0)&&await p.locator('details.mxd .mxtag').count()===0,'other profile is not affected');
await p.click('[data-pact=mxcell][data-id="1:3"]').catch(async()=>{ await p.locator('details.mxd > summary').click(); await p.click('[data-pact=mxcell][data-id="1:3"]'); });
await p.waitForTimeout(150);
ok(await E(()=>profileMx(store.profiles.find(x=>x.id==='zz')).off.join(',')==='1:3'&&mxState.off.join(',')==='7:3'),'editing another profile changes only that profile');
// empty game refused
await E(()=>{ setViewId=store.activeId; openPanel('settings'); });
const refused=await E(()=>{ const prof=activeProfile(); const before=JSON.stringify([diffOn,mxState]); mxCommit(prof,[1,2,3],{off:[],hide:Object.keys(SKILL_META).filter(k=>!SKILL_META[k].bonus)}); return {same:before===JSON.stringify([diffOn,mxState]), msg:setMsg}; });
ok(refused.same&&refused.msg.includes('לא יישארו שאלות'),'hiding everything is refused with a message');
// reset
await p.locator('details.mxd > summary').click().catch(()=>{});
await E(()=>profileAction('mxreset')); ok(await E(()=>mxIsDefault(mxState)),'reset clears the fine tuning');
// simple switch still works as before
await p.locator('[data-dlvl="3"]').evaluate(el=>el.click()); await p.waitForTimeout(150);
ok(await E(()=>diffOn.join(',')==='1,2'),'simple level switch still works');
// ---- phone: scroll position survives a change; labels line up ----
await E(()=>{ setViewId=store.activeId; openPanel('settings'); });
await p.locator('details.mxd').evaluate(d=>{ d.open=true; });
await p.waitForTimeout(100);
await p.evaluate(()=>{ const m=document.getElementById('paMain'); m.scrollTop=m.scrollHeight; });
const top0=await p.evaluate(()=>document.getElementById('paMain').scrollTop);
await p.evaluate(()=>document.querySelector('[data-pact=mxcell][data-id="2:2"]').click()); await p.waitForTimeout(200);
const top1=await p.evaluate(()=>document.getElementById('paMain').scrollTop);
ok(top0>200&&Math.abs(top1-top0)<5,'matrix click keeps the scroll position ('+top0+' -> '+top1+')');
await p.evaluate(()=>document.querySelector('input[data-mxtype="gSumDiff"]').click()); await p.waitForTimeout(200);
ok(Math.abs(await p.evaluate(()=>document.getElementById('paMain').scrollTop)-top0)<5,'ticking a type keeps the scroll position');
await p.evaluate(()=>{ document.getElementById('paMain').scrollTop=0; document.querySelector('[data-dlvl="1"]').click(); }); await p.waitForTimeout(200);
await E(()=>profileAction('mxreset')); await p.waitForTimeout(100);
const al=await p.evaluate(()=>{ const r=[...document.querySelectorAll('table.qmx tbody tr')].map(tr=>{ const e=tr.querySelector('.mxe').getBoundingClientRect(), n=tr.querySelector('.mxnm').getBoundingClientRect(); return [Math.round(e.left),Math.round(n.right)]; }); return {emoji:new Set(r.map(x=>x[0])).size, right:new Set(r.map(x=>x[1])).size}; });
ok(al.emoji===1&&al.right===1,'row labels: emoji and names line up in every row '+JSON.stringify(al));
await p.screenshot({path:'mx_settings.png',fullPage:false});
ok(errs.length===0,'no page errors '+errs);
console.log(f?'FAILURES '+f:'ALL PASS'); await b.close(); process.exit(f?1:0);})();
