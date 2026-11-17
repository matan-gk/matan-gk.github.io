// things on furniture, phase 3: the page's tops (height z, sideways shift, visible bed cells) must match the pictures (numbers, not screenshots)
const {spawnSync}=require('child_process');
const r=spawnSync('python3',['tools/surfaces.py','--check'],{cwd:require('path').join(__dirname,'..'),encoding:'utf8'});
console.log(r.stdout);if(r.stderr)console.log(r.stderr);
const ok=r.status===0&&/^OK$/m.test(r.stdout);
console.log((ok?'ok   ':'FAIL ')+'every host top (z by width and by depth agree, every top cell centre lies on the picture\'s top face) and every bed level (measured z, shift and visible cells) matches tools/surfaces.py');
process.exit(ok?0:1);
