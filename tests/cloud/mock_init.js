// injected before the page scripts: an in-memory stand-in for Firebase, backed by a shared "server" in the test runner
window.__mockAd = function(){
  let cb = null, user = null;
  const call = (op,a)=>window.__srv(op, a);
  const save = ()=>{ if(user) localStorage.setItem('mock_user', JSON.stringify(user)); else localStorage.removeItem('mock_user'); };
  const net = ()=>{ if(window.__offline){ const e=new Error('offline'); e.code='unavailable'; throw e; } };
  return {
    async init(){ const u = localStorage.getItem('mock_user'); if(u) user = JSON.parse(u); },
    onAuth(f){ cb = f; setTimeout(()=>f(user),0); },
    async signIn(){ if(window.__failNext){ window.__failNext=false; const e=new Error('x'); e.code='auth/popup-blocked'; throw e; } user = {uid:window.__uid||'u1', email:'parent@example.com', name:'Parent', anon:false}; save(); cb(user); },
    async signOut(){ user = null; save(); cb(null); },
    async anon(){ if(window.__noAnon){ const e=new Error('anon off'); e.code='auth/operation-not-allowed'; throw e; } net(); if(user && user.anon) return user; user = {uid:'anon-'+Math.random().toString(36).slice(2,8), email:'', name:'', anon:true}; save(); cb(user); return user; },
    async deleteAuth(){ user = null; save(); },
    async getFamily(uid){ net(); return call('getFamily',{uid}); },
    async setFamily(uid,fid){ net(); return call('setFamily',{uid,fid}); },
    async clearFamily(uid){ return call('clearFamily',{uid}); },
    async list(fid){ net(); return call('list',{fid}); },
    async put(fid,id,doc){ net(); return call('put',{fid,id,doc}); },
    async wipe(fid){ return call('wipe',{fid}); },
    async legacyList(uid){ net(); return call('legacyList',{uid}); },
    async legacyDelete(uid){ return call('legacyDelete',{uid}); },
    async report(o){ net(); return call('report',{o, uid:user.uid}); }
  };
};
