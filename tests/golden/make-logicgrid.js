// writes tests/golden/logicgrid.json: seeded logicGrid() output of the CURRENT code (run on main before changing the generator; the test compares later versions with it)
const T=require('../lib.js');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({...T.launchOpts});const p=await (await b.newContext()).newPage();await p.goto(T.URL);
const r=await p.evaluate(()=>{let s=12345;const rnd=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};const real=Math.random;Math.random=rnd;
 const out={one:[],two:[]};for(let i=0;i<120;i++){const a=logicGrid(false),c=logicGrid(true);out.one.push(a&&{text:a.text,answer:a.answer,choices:a.choices});out.two.push(c&&{text:c.text,answer:c.answer,choices:c.choices});}Math.random=real;return out;});
require('fs').writeFileSync(__dirname+'/logicgrid.json',JSON.stringify(r));console.log(r.one.length,r.two.length,r.one.filter(x=>!x).length);await b.close();})();
