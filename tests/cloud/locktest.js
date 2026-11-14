// The version lock: the game's document format number, the security rules and the admin page must agree, and live data must not be deletable.
const fs=require('fs'),path=require('path');
let f=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)f++;};
const R=p=>fs.readFileSync(path.join(__dirname,'..','..',p),'utf8');
const html=R('math-quest.html'),rules=R('firebase/firestore.rules'),admin=R('admin.html');

const V=+(/const CLOUD_DOC_V\s*=\s*(\d+)/.exec(html)||[])[1];
const minV=+(/function minDocVersion\(\)\s*\{\s*return\s+(\d+);/.exec(rules)||[])[1];
ok(V>=2,'the game declares a document format number (CLOUD_DOC_V = '+V+')');
ok(V===minV,'the rules refuse anything below the game\'s format (minDocVersion '+minV+' = CLOUD_DOC_V '+V+')');
ok(/request\.resource\.data\.v >= resource\.data\.v/.test(rules),'the rules never let the stored format go down');
ok(!/request\.resource\.data\.v == 1/.test(rules),'the rules no longer accept format 1');
ok(/allow delete: if request\.auth != null && validFam\(fid\) && resource\.data\.d == true;/.test(rules),'a live profile cannot be deleted, only one already marked deleted');
ok(!/allow read, delete: if request\.auth != null && validFam/.test(rules),'no combined read+delete rule is left on the family profiles');

// every place that builds a cloud document uses the constant, never a literal
const lits=(html.match(/\bd:(?:true|false),\s*v:\s*\d/g)||[]);
ok(lits.length===0,'no cloud document is written with a literal format number ('+lits.join(' | ')+')');
ok((html.match(/v:CLOUD_DOC_V/g)||[]).length>=3,'documents are written with CLOUD_DOC_V (profile, tombstone, wipe)');

// the real function, run on its own
const src=/function cloudDocFromProfile[\s\S]*?\n\}\n/.exec(html)[0];
const doc=new Function('CLOUD_DOC_V',src+';return cloudDocFromProfile({name:"x",gender:"f",progress:{a:1},stats:{log:[]},u:5},1000,3);')(V);
ok(doc.v===V&&doc.b===3&&doc.d===false&&Object.keys(doc).sort().join()==='b,d,g,n,p,s,u,v','cloudDocFromProfile writes the allowed fields with the current format number');

// wipe: marks deleted first, deletes second
const wipe=/async wipe\(fid\)\{[\s\S]*?\n    \},/.exec(html);
ok(wipe&&/d:true, v:CLOUD_DOC_V/.test(wipe[0])&&/b2\.delete/.test(wipe[0])&&wipe[0].indexOf('b1.commit')<wipe[0].indexOf('b2.delete'),'"delete my cloud data" blanks profiles as deleted, then deletes them');

ok(/ver:Number\(d\.v\)\|\|1/.test(admin)&&/גרסת מסמך/.test(admin),'the admin page shows each profile\'s document format');
// daily copies: create-only, deletable after 8 days; the client's prune window must match the rules
ok(/match \/families\/\{fid\}\/snaps\/\{sid\}/.test(rules)&&/allow update: if false;/.test(rules.slice(rules.indexOf('match /families/{fid}/snaps/'))),'rules: safety copies cannot be updated');
ok(/691200000/.test(rules)&&/SNAP_KEEP_MS = 8\*86400000/.test(html),'rules and game agree: a copy is deletable after 8 days (691200000 ms)');
ok(/t >= request\.time\.toMillis\(\) - 600000/.test(rules)&&/t <= request\.time\.toMillis\(\) \+ 600000/.test(rules),'rules: a copy\'s stamp must be near the server clock');
// a reminder: the keys of the saved progress. Adding or removing one means a build that does not know it would drop it when it writes back,
// so CLOUD_DOC_V and minDocVersion() must be raised together with the change (and this list updated).
const cap=/function captureProgress\(\)\{ return \{([^}]*(?:\([^)]*\)[^}]*)*)\}; \}/.exec(html);
const got=cap?cap[1].replace(/\([^)]*\)/g,'').split(',').map(x=>x.split(':')[0].trim()).filter(Boolean).sort().join(','):'?';
const known='collection,diff,focus,golden,legacyLooks,level,lollipops,mx,rd,rv,score,space,streak,theme,warm';
ok(got===known,'progress keys unchanged ('+got+'): if this fails, raise CLOUD_DOC_V and minDocVersion() together and update this list');
console.log(f?'FAILURES '+f:'ALL PASS');process.exit(f?1:0);
