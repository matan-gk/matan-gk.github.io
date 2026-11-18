// logicGrid: the question text is unchanged (seeded, against output captured from the code before the refactor), and the model it returns agrees with the text
const fs=require('fs'),T=require('./lib.js');const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});const p=await (await b.newContext()).newPage();await p.goto(T.URL);
const gold=JSON.parse(fs.readFileSync(__dirname+'/golden/logicgrid.json','utf8'));
const r=await p.evaluate(()=>{let s=12345;const rnd=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};const real=Math.random;Math.random=rnd;
 const out={one:[],two:[]};for(let i=0;i<120;i++){const a=logicGrid(false),c=logicGrid(true);out.one.push(a);out.two.push(c);}Math.random=real;return out;});
for(const k of ['one','two']){
  const same=r[k].every((x,i)=>x&&x.text===gold[k][i].text&&x.answer===gold[k][i].answer&&JSON.stringify(x.choices)===JSON.stringify(gold[k][i].choices));
  ok(same,k==='one'?'regular clue question: 120 seeded questions identical to before':'bonus clue question: 120 seeded questions identical to before');
}
const bad=await p.evaluate(()=>{const bad=[];for(let i=0;i<300;i++){for(const two of [false,true]){const q=logicGrid(two);const m=q.model;
  const inText=[...m.kids,...m.pets,...(m.fruits||[])].every(w=>q.text.includes(w));
  const cl=q.text.split('<br>').slice(1,-1);const same=cl.length===m.clues.length&&m.clues.every((c,j)=>clueText(c,{kids:m.kids.map(n=>({n,g:'f'})),pets:m.pets,fruits:m.fruits})!==undefined);
  const shape=m.two===two&&m.kids.length===3&&m.pets.length===3&&(two?m.fruits.length===3:m.fruits===null)&&m.clues.length===(two?4:3)&&m.clues.every(c=>['pet','fruit','rel'].includes(c.k)&&typeof c.yes==='boolean')&&(two||m.clues.every(c=>c.k==='pet'));
  if(!(inText&&same&&shape))bad.push({two,inText,same,shape});}}return bad.length;});
ok(bad===0,'the model lists the same kids, animals, fruits and the right number of clues, and is plain data (600 questions)');
const gl=await p.evaluate(()=>{const a=gLogicGrid(),b=bLogicGrid2();return {a:a.tool&&a.tool.kind,b:b.tool&&b.tool.kind,j:JSON.stringify(b.tool.model).length>10};});
ok(gl.a==='clueGrid'&&gl.b==='clueGrid'&&gl.j,'both clue questions declare the clueGrid tool with a serialisable model');
await b.close();process.exit(f?1:0);})();
