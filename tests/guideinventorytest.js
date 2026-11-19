// docs/guided-help/INVENTORY.md lists exactly the question types of the game (so it cannot rot when a type is added), each with a known board and trace
const fs=require('fs'),T=require('./lib.js');const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});const p=await (await b.newContext()).newPage();await p.goto(T.URL);
const ids=await p.evaluate(()=>Object.keys(SKILL_META));const dif=await p.evaluate(()=>SKILL_DIFFICULTY);
const md=fs.readFileSync(__dirname+'/../docs/guided-help/INVENTORY.md','utf8');
const rows=[...md.matchAll(/^\| `(\w+)` \| [^|]+ \| (\d) \| (\w+) \| (easy|medium|hard|none) \|/gm)].map(m=>({id:m[1],d:+m[2],b:m[3],t:m[4]}));
const boards=new Set(['TL','BAR','GRP','PROC','PV','SYM','ORD','SEQ','RULE','CLUE','SCAN','CLOCK','GEO','TEXT','VERB']);
ok(rows.length===ids.length&&ids.every(i=>rows.some(r=>r.id===i)),'every question type has exactly one row ('+rows.length+' of '+ids.length+')');
ok(new Set(rows.map(r=>r.id)).size===rows.length,'no type is listed twice');
ok(rows.every(r=>boards.has(r.b)),'every row has a known board');
ok(rows.every(r=>dif[r.id]===r.d),'the difficulty column matches SKILL_DIFFICULTY');
ok(rows.every(r=>r.b!=='VERB'||r.t==='none'),'types without a board have no trace');
const sum=[...md.matchAll(/^\| (\w+) \| [^|]+ \| (\d+) \| (\d+) \|$/gm)].map(m=>({b:m[1],n:+m[2]}));
ok(sum.every(s=>rows.filter(r=>r.b===s.b).length===s.n),'the summary counts match the rows');
await b.close();console.log(f?'FAILURES '+f:'ALL PASS');process.exit(f?1:0);})();
