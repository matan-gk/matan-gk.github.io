const fs=require('fs');const {open,shot}=require('./base.js');
exports.build=async(p,variant)=>{
 await p.evaluate((variant)=>{const R=ROOM_COLORS.findIndex(c=>c.h==='rainbow'), LAV=3;
  let wallc=R,floorc=R;if(typeof variant==='object'){wallc=variant.w;floorc=variant.f;} else if(variant==='lav'){wallc=LAV;floorc=LAV;}
  space.surf.wl=wallc;space.surf.wr=wallc;space.surf.fl=floorc;for(const k in ROOM_DEFAULT) for(const v of [wallc,floorc]) if(!space.own[k].includes(v)) space.own[k].push(v);
  space.po.desk=[R];space.po.chair=[R];space.po.rug=[R];
  space.things=[
  {k:'desk',x:0,y:6,u:'desk1',c:R},{k:'chair',x:4,y:11,u:'chair1',c:R},
  {k:'laptop',x:-1,y:-1,u:'lap1',on:{h:'desk1',dx:1,dy:5}},{k:'markers',x:-1,y:-1,u:'mk1',on:{h:'desk1',dx:1,dy:1}},
  {k:'mirror',x:12,y:0,u:'mir1'},{k:'rug_rd',x:10,y:8,u:'rug1',c:R},{k:'bookshelf',x:16,y:0,u:'bs1'},{k:'table',x:14,y:5,u:'tb1'},
  {k:'star',x:-1,y:-1,u:'st1',on:{h:'bed',dx:1,dy:1}}];
  space.fix.bed={x:5,y:2};settleSurfaces();rmRedraw();},variant);
};
exports.dense=async(p)=>{await p.evaluate(()=>{const add=(k,x,y,x2)=>space.things.push({k,x,y,u:'d'+space.things.length+k});
  const items=[['cloud',8,13],['pl09',0,0],['pl19',13,16],['starlamp',9,0],['telescope',1,16],['toybox1',15,12],['pl20',6,0],['rug_sq2',2,13],['lavalamp',17,0],['abacus',-1,-1]];
  for(const [k,x,y] of items){ if(x<0) continue; add(k,x,y); }
  settleSurfaces();rmRedraw();});};
