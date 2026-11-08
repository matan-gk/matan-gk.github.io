// the denser grid: units are half an old cell; small items are 1x1 units, placement by unit, nudge arrows
const T=require('./lib.js');
const {chromium}=require('playwright');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{const b=await chromium.launch({...T.launchOpts});
const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ev=(fn,a)=>p.evaluate(fn,a);
await p.goto(T.URL);await ev(()=>localStorage.clear());await p.reload();
await p.fill('#pfName','X');await p.click('.gopt:has(input[value=f])');await p.click('[data-pact=save]');await p.waitForTimeout(500);
await ev(()=>{space.earned=1000;space.spent=0;space.unlocked=true;golden=['🍪'];renderLevels();openSpace();});
const set=things=>ev(th=>{space.things=th;space.spent=0;settleSurfaces();RM.sel=null;RM.pl=null;RM.list=null;rmRedraw();renderDrawer();},things);
const unitTap=async(ux,uy,z,ox)=>{const q=await ev(([ux,uy,z,ox])=>{const g=document.getElementById('rmR'),m=g.getScreenCTM(),sx=500+(ux+.5-(uy+.5))*UX+ox,sy=400+(ux+.5+uy+.5)*UY-z;return [m.a*sx+m.c*sy+m.e,m.b*sx+m.d*sy+m.f];},[ux,uy,z||0,ox||0]);await p.mouse.click(q[0],q[1]);};
// the grid and the sizes
ok(await ev(()=>GU===2&&ROOM_CELLS===20&&UX===25&&UY===12.5),'the room is 20 x 20 units, a unit is half an old cell');
ok(await ev(()=>{const f=k=>fwOf(catOf(k))+'x'+fdOf(catOf(k));return ['lego','chess','tictac','puzzle','puzzle2','trainset','track','track2','markers'].every(k=>f(k)==='1x1')&&['teddy','pl00','chair','telescope'].every(k=>f(k)===({teddy:'2x2',pl00:'2x2',chair:'4x4',telescope:'4x4'})[k])&&f('desk')==='4x8'&&f('piano')==='8x4';}),'small things are 1x1 units, old one-cell things 2x2, old 2x2 things 4x4, the desk 4x8, the piano 8x4');
ok(await ev(()=>ROOM_CATALOG.every(c=>Number.isInteger(c.fw)&&Number.isInteger(c.fd)&&c.fw>=1&&c.fd>=1)),'every item has a whole size in units');
ok(await ev(()=>['lego','chess','teddy','pl00','markers'].every(k=>canSit(catOf(k)))&&['chair','telescope','rug_sq','desk'].every(k=>!canSit(catOf(k)))),'what may stand on furniture: everything up to one old cell (small ones too)');
// small things are drawn half size, exactly on their footprint corner (r scaled with the footprint)
ok(await ev(()=>{const c=catOf('lego');return c.r[2]<=60&&c.r[3]<=40;}),'a small thing\'s picture is half the old size');
// placing a small thing by unit on the floor
await set([]);
await ev(()=>{RM.list='cat';renderDrawer();});await ev(()=>document.querySelector('[data-pick="lego"]').click());
await unitTap(7,9);
ok(await ev(()=>RM.pl.x===7&&RM.pl.y===9&&!RM.pl.on),'a tap lands the small thing on exactly the tapped unit (7,9)');
await unitTap(8,9);
ok(await ev(()=>RM.pl.x===8&&RM.pl.y===9),'the next unit is a different spot (half a cell away)');
// nudge arrows: one unit at a time, along the screen directions
const nud=async v=>{await ev(v=>document.querySelector(`[data-nudge="${v}"]`).click(),v);return ev(()=>[RM.pl.x,RM.pl.y]);};
ok((await nud('1,0')).join()==='9,9'&&(await nud('0,1')).join()==='9,10'&&(await nud('-1,0')).join()==='8,10'&&(await nud('0,-1')).join()==='8,9','the arrows move it one unit down-right, down-left, up-left, up-right');
await ev(()=>{RM.pl.x=0;RM.pl.y=10;});
ok((await nud('-1,0')).join()==='0,10','the wall stops the nudge');
await ev(()=>{RM.pl.x=5;RM.pl.y=8;});   // the bed covers x 0-5, y 0-7
ok((await nud('0,-1')).join()==='5,8'&&(await nud('1,0')).join()==='6,8'&&(await nud('0,-1')).join()==='6,7'&&(await nud('-1,0')).join()==='6,7','the bed stops the nudge');
// two small things beside each other, a chess set where a teddy cannot go
await set([{k:'chess',x:10,y:10,u:'che1'}]);
await ev(()=>{RM.pl={k:'lego',i:-1,x:11,y:10};});
ok(await ev(()=>footFree(catOf('lego'),11,10,-1)&&!footFree(catOf('lego'),10,10,-1)&&!footFree(catOf('teddy'),10,10,-1)&&!footFree(catOf('teddy'),9,9,-1)&&footFree(catOf('teddy'),11,10,-1)),'a small thing fits right beside another; a teddy (2x2) needs two free units');
// on furniture: the same grid
await set([{k:'table',x:12,y:12,u:'tab1'},{k:'lego',x:0,y:0,u:'leg1',on:{h:'tab1',dx:0,dy:0}},{k:'markers',x:0,y:0,u:'mar1',on:{h:'tab1',dx:1,dy:0}},{k:'teddy',x:0,y:0,u:'ted1',on:{h:'tab1',dx:2,dy:2}},{k:'chess',x:0,y:0,u:'che1',on:{h:'tab1',dx:2,dy:2}}]);
ok(await ev(()=>space.things.map(t=>t.x+','+t.y).join('|')==='12,12|12,12|13,12|14,14|-1,-1'),'on a table: small things side by side, a teddy beside them, a chess set onto the teddy is refused: '+await ev(()=>space.things.map(t=>t.x+','+t.y).join('|')));
// the lit units while placing a small thing: every free unit of the top
await ev(()=>{RM.pl={k:'lego',i:-1,x:2,y:2};rmRedraw();renderDrawer();});
ok(await ev(()=>document.querySelectorAll('#rmR .rmtop').length)===await ev(()=>{let n=0;for(const s of surfaces(-1))for(let dx=s.tp.c[0];dx<s.tp.c[0]+s.tp.c[2];dx++)for(let dy=s.tp.c[1];dy<s.tp.c[1]+s.tp.c[3];dy++)if(surfFree(catOf('lego'),s.h,dx,dy,-1))n++;return n;}),'lit units = the free units of every top (one per unit for a small thing)');
// nudging on a surface
await ev(()=>{RM.pl={k:'lego',i:-1,x:15,y:13,on:{h:'tab1',dx:3,dy:1}};rmRedraw();renderDrawer();});
ok((await nud('0,-1')).join()==='15,12'&&await ev(()=>RM.pl.on.dy)===0&&(await nud('0,-1')).join()==='15,12'&&(await nud('0,1')).join()==='15,13'&&(await nud('0,1')).join()==='15,13','on a table the nudge moves within the top and stops at its edge and at the teddy: '+await ev(()=>JSON.stringify(RM.pl.on)));
// older saves (whole cells) are converted
const old=await ev(()=>{const s=spaceClean({earned:50,spent:0,trued:true,unlocked:true,sub:1,things:[{k:'pl00',x:5,y:5},{k:'table',x:7,y:7,u:'tabl'},{k:'teddy',x:0,y:0,u:'tedd',on:{h:'tabl',dx:1,dy:0}}]},[],0);return s.things.map(t=>t.x+','+t.y+(t.on?'@'+t.on.dx+','+t.on.dy:'')).join('|');});
ok(old==='10,10|14,14|16,14@2,0','a save made when the grid was whole cells: positions doubled, the teddy keeps its place on the table: '+old);
// the arrows stay in the phone's small bar while previewing
await ev(()=>{RM.pl={k:'lego',i:-1,x:11,y:10};rmRedraw();renderDrawer();});
ok(await ev(()=>{const d=document.getElementById('rmDrawer');return d.classList.contains('mini')&&d.querySelectorAll('[data-nudge]').length===4&&!!d.querySelector('[data-place]');}),'the small bar keeps the four arrows with buy / cancel');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close();process.exit(f?1:0);})();
