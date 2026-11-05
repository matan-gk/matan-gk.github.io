const T=require('./lib.js');
const C=T.extract('// ===== SAVE CODE CODEC =====','// ===== /SAVE CODE CODEC =====',['saveCodeEncode','saveCodeDecode','scCrc']); let f=0; const ok=(c,m)=>{if(!c){f++;console.log('FAIL',m);}else console.log('ok  ',m);};
(async()=>{
const obj={app:'cupcake-quest',v:1,profiles:[{id:'a',name:'נועה 🦄',progress:{score:5}}]};
const code=await C.saveCodeEncode(obj); ok(/^CQ1\.z\.[A-Za-z0-9_-]+\.[0-9a-f]{8}$/.test(code),'format '+code.slice(0,40)+'... ('+code.length+' chars)');
let r=await C.saveCodeDecode(code); ok(r.ok&&r.data.profiles[0].name==='נועה 🦄','round trip incl. Hebrew + emoji');
r=await C.saveCodeDecode('  '+code.slice(0,20)+'\n'+code.slice(20)+'  \n'); ok(r.ok,'whitespace/newlines (copy-paste wrapping) tolerated');
const t=code.split('.'); const mid=t[2]; const typo=t[0]+'.'+t[1]+'.'+mid.slice(0,5)+(mid[5]==='A'?'B':'A')+mid.slice(6)+'.'+t[3];
r=await C.saveCodeDecode(typo); ok(!r.ok&&r.error==='checksum','one-character typo detected');
r=await C.saveCodeDecode(code.slice(0,code.length-15)); ok(!r.ok&&['format','checksum'].includes(r.error),'cut-off code rejected: '+r.error);
for(const bad of ['','hello','CQ1.z.abc','CQ2.z.abc.12345678','CQ1.x.abc.12345678', JSON.stringify(obj)]){ r=await C.saveCodeDecode(bad); ok(!r.ok,'rejects '+JSON.stringify(bad).slice(0,30)+' -> '+r.error); }
// valid codec but foreign payload
const foreign=await C.saveCodeEncode({hello:1}); r=await C.saveCodeDecode(foreign); ok(!r.ok&&r.error==='foreign','valid code from another app rejected');
// realistic big payload
const big={app:'cupcake-quest',v:1,profiles:[{id:'p1',name:'x',progress:{collection:Array(300).fill('🍩')},stats:{v:1,log:Array.from({length:2000},(_,i)=>({t:1.79e12+i*60000,s:'gSharing',l:2,b:0,c:i%3?1:0,d:7.3,...(i%3?{}:{x:'12',a:'2'})})),daily:{}}}]};
const bc=await C.saveCodeEncode(big); console.log('   2000-answer profile code:',bc.length,'chars'); r=await C.saveCodeDecode(bc); ok(r.ok&&r.data.profiles[0].stats.log.length===2000,'large code round trip');
// zip bomb: tiny compressed, huge raw
const raw=new Uint8Array(60_000_000); const cs=new CompressionStream('deflate-raw'); const w=cs.writable.getWriter(); w.write(raw); w.close(); const comp=new Uint8Array(await new Response(cs.readable).arrayBuffer());
const bomb='CQ1.z.'+Buffer.from(comp).toString('base64url')+'.'+C.scCrc(comp); const t0=Date.now(); r=await C.saveCodeDecode(bomb); ok(!r.ok&&r.error==='broken','decompression bomb refused ('+(Date.now()-t0)+' ms)');
console.log(f?'FAILURES '+f:'ALL PASS');})();
