const T=require('./lib.js');
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch(T.launchOpts);const pg=await b.newPage();await pg.goto(T.URL);
const r=await pg.evaluate(()=>{let bad=0,short=0;for(let i=0;i<3000;i++){for(const f of [gSkipFill,gSkipPair]){const q=f();const ks=q.choices.map(c=>(String(c).match(/\d+/g)||[]).map(Number).sort((a,b)=>a-b).join('_'));if(new Set(ks).size!==ks.length)bad++;if(q.choices.length!==4)short++;}}return {bad,short}});
console.log(r); console.log(r.bad||r.short?'FAIL two options with the same numbers, or fewer than 4 choices':'ALL PASS'); if(r.bad||r.short) process.exitCode=1;await b.close();})();
