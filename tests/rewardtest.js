// Space theme step 4: collectibles (14 + 14 + bonus pair), their Hebrew names, the "workshop" wording, extra mascot poses
const T=require('./lib.js');
const {chromium}=require('playwright'); let f=0; const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
(async()=>{
const b=await chromium.launch(T.launchOpts); const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(T.URL); await p.evaluate(()=>localStorage.clear()); await p.reload();
await p.fill('#pfName','נועה'); await p.click('.gopt:has(input[value=f])'); await p.click('[data-pact=save]'); await p.waitForTimeout(300);
const E=(fn,...a)=>p.evaluate(fn,...a);
// coverage
ok(await E(()=>{ const c=themeCoverage('space'); const g=id=>c.find(x=>x.id===id); return g('sticker').have===15&&g('upgraded').have===15&&g('currency').have===2&&g('mood').have===8&&g('mood').need===8; }),'coverage: 15 collectibles, 15 upgraded, 2 bonus, 8/8 moods (extra poses not counted)');
ok(await E(()=>STICKERS.every(k=>THEME_ASSETS.space.sticker[k]&&THEME_ASSETS.space.upgraded[k]&&THEME_ITEMS.space[k].s&&THEME_ITEMS.space[k].p&&THEME_ITEMS.space[k].u)&&THEME_ITEMS.space.cotton.s),'every collectible has a picture, an upgraded picture and three names');
ok(await E(()=>new Set(STICKERS.map(k=>THEME_ASSETS.space.sticker[k])).size===STICKERS.length&&new Set(STICKERS.map(k=>THEME_ASSETS.space.upgraded[k])).size===STICKERS.length),'every collectible has its own picture, regular and upgraded');
// sweets unchanged
await E(()=>{ collection=['🦄','🦄','🧁']; renderRewards(); openRoom(); });
let txt=await p.textContent('#roomOverlay');
ok(txt.includes('חדר המתנות של קאפקייק')&&txt.includes('מתנות קסומות')&&await p.locator('#roomBody .remoji img').count()===0&&(await p.textContent('#rsRecent')).includes('🦄'),'sweets: emoji, "חדר המתנות", unchanged');
await E(()=>closeRoom());
// switch to space with items already collected: re-rendered at once, items kept
await E(()=>setProfileTheme(activeProfile(),'space')); await p.waitForTimeout(100);
ok(await E(()=>collection.join()==='🦄,🦄,🧁'),'switching theme keeps the collection');
ok((await p.textContent('.rs-title')).includes('מחסן הציוד')&&await p.locator('#rsRecent img.rg').count()===2&&!(await p.textContent('#rsRecent')).includes('🦄'),'strip: title and pictures instead of emoji');
ok((await p.getAttribute('#rewardsStrip','aria-label')).includes('מחסן הציוד'),'strip accessible name follows the theme');
await E(()=>openRoom()); txt=await p.textContent('#roomOverlay');
ok(txt.includes('מחסן הציוד של ברק')&&txt.includes('רכיבים · 3')&&!txt.includes('קסומות'),'room: Barak\'s equipment store, "רכיבים"');
ok(await p.locator('#roomBody .remoji img.rg').count()===3&&await p.getAttribute('#roomBody .ritem','title')==='שבב מעגלים','room: pictures with names');
await E(()=>closeRoom());
// ten of a kind -> upgrade wording
await E(()=>{ collection=Array(10).fill('🦄'); renderRewards(); showReadyCeleb('🦄'); });
txt=await p.textContent('#celebBody'); const btn=await p.textContent('#celebBtns');
ok(txt.includes('10 סוללות היפר')&&txt.includes('שדרוג')&&btn.includes('שדרגי')&&!btn.includes('מזגי'),'ten of a kind: names the item and offers an upgrade, not a merge: '+txt.trim().slice(0,70));
ok(await p.locator('#celebBody .cbig img').count()===1,'celebration shows the picture');
await p.locator('#celebBtns .btn').first().click(); await p.waitForTimeout(300);
ok((await p.textContent('#celebBody')).includes('מבצעים שדרוג'),'while upgrading: "מבצעים שדרוג..."');
await p.waitForTimeout(1500);
txt=await p.textContent('#celebBody');
ok(txt.includes('שדרוג: מצבר פלזמה מוגבר')&&txt.includes('מחסן הציוד'),'result names the upgraded item: '+txt.trim().slice(0,80));
await p.locator('#celebBtns .btn').last().click(); await p.waitForTimeout(300);
await E(()=>openRoom()); txt=await p.textContent('#roomOverlay');
ok(txt.includes('שדרוגים · 1')&&await p.locator('#roomBody .ritem.gold img').count()===1,'room: "שדרוגים" section with the upgraded picture');
await p.locator('#roomBody .ritem.gold').click(); await p.waitForTimeout(200);
txt=await p.textContent('#celebBody'); ok(txt.includes('10 רכיבים רגילים')&&txt.includes('שמורות כאן לתמיד'),'the vault popup uses the same words and keeps the 10 forever');
await p.locator('#celebBtns .btn').click(); await E(()=>closeRoom());
// bonus questions give two regular rewards; the old special cotton candy became a regular reward
const mg=await E(()=>{ const c=cleanProgress({collection:[],golden:['cotton'],lollipops:[1,1,1],level:1}); return {col:c.collection,g:c.golden,l:c.lollipops}; });
ok(mg.col.length===3&&mg.col.every(x=>x==='☁️:'+'0.0.0')&&mg.g[0]==='☁️'&&mg.l.length===0,'old bonus cotton candies become regular cotton candy rewards');
await E(()=>{ collection=[]; golden=[]; nextQuestion(); bonusActive=true; checkAnswer(current.answer,null,null); bonusActive=false; });
ok(await E(()=>collection.length===2),'a correct bonus answer gives two regular rewards'); await E(()=>{closeCeleb&&closeCeleb();});
// a correct answer: name + picture in the feedback line
await E(()=>{ collection=[]; lollipops=[]; golden=[]; streak=0; });
await E(()=>{ nextQuestion(); checkAnswer(current.answer,null,null); }); await p.waitForTimeout(300);
const fb=await p.textContent('#feedback'); ok(await p.locator('.feedback.good img.rg').count()===1&&THEME_ITEMS_ok(fb),'correct answer: feedback names the item and shows its picture: '+fb.trim().slice(0,70));
function THEME_ITEMS_ok(t){ return /קיבלת|קיבלתם/.test(t); }
// confetti uses pictures
await E(()=>burstConfetti(5)); ok(await p.locator('.confetti img.rg').count()>=5,'confetti are the collectible pictures');
// look wording uses Barak
await E(()=>{ golden=Array(10).fill('🦄'); openRoom(); renderRoom(); });
txt=await p.textContent('#roomBody'); ok(!txt.includes('קאפקייק'),'no mention of Cupcake in the space room'); await E(()=>closeRoom());
// back to sweets
await E(()=>setProfileTheme(activeProfile(),'sweets')); await p.waitForTimeout(100);
await E(()=>{ collection=['🦄']; golden=[]; renderRewards(); openRoom(); });
txt=await p.textContent('#roomOverlay'); ok(txt.includes('חדר המתנות של קאפקייק')&&txt.includes('מתנות קסומות')&&await p.locator('#roomBody img.rg').count()===0,'back to sweets: original texts and emoji'); await E(()=>closeRoom());
await E(()=>{ collection=Array(10).fill('🦄'); showReadyCeleb('🦄'); });
ok((await p.textContent('#celebBtns')).includes('מזגי')&&(await p.textContent('#celebBody')).includes('10 🦄'),'sweets: "מזגי" and the emoji'); await E(()=>closeCeleb());
// extra poses
await E(()=>setProfileTheme(activeProfile(),'space'));
const mood=await E(()=>({extra:moodPool().filter(m=>!MOOD_POOL.includes(m)), keys:Object.keys(THEME_ASSETS.space.mood).length, distinct:new Set(Object.values(THEME_ASSETS.space.mood)).size}));
ok(mood.extra.join()==='strong,armed'&&mood.keys===10&&mood.distinct===10,'space: 4 new poses (delighted, magical, strong, armed); the two extras join the happy pool');
await E(()=>{ setMood('strong'); }); ok(await E(()=>document.getElementById('charImg').src===new URL(THEME_ASSETS.space.mood.strong,document.baseURI).href),'an extra pose displays');
await E(()=>setProfileTheme(activeProfile(),'sweets')); ok(await E(()=>moodPool().slice(0,MOOD_POOL.length).join()===MOOD_POOL.join()&&moodPool().length===MOOD_POOL.length+LOOKS.length),'sweets: the 7 moods plus the 16 former looks');
ok(errs.length===0,'no page errors '+errs.join('|'));
await b.close(); process.exit(f?1:0);
})();
