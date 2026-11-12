// Tests firebase/firestore.rules against the Firestore emulator (see package.json). Each case says what an old or a current build may do.
const fs = require('fs'), path = require('path');
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');

const FID = 'ABCDEFGHJKLMNPQRSTUVWXYZ23';       // a valid family code: 26 characters of A-Z 2-9
const P = `families/${FID}/profiles/p1`;
const doc = (o) => Object.assign({ n: 'x', g: 'f', p: '{}', s: '', u: 100, b: 0, d: false, v: 2 }, o);
let failed = 0;
const t = async (name, fn) => { try { await fn(); console.log('ok   ' + name); } catch (e) { failed++; console.log('FAIL ' + name + ' :: ' + (e && e.message || e)); } };

(async () => {
  const env = await initializeTestEnvironment({ projectId: 'demo-cq', firestore: { rules: fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8'), host: '127.0.0.1', port: 8085 } });
  const seed = async (p, d) => env.withSecurityRulesDisabled(async (c) => { await c.firestore().doc(p).set(d); });
  const user = () => env.authenticatedContext('u1').firestore();
  const reset = () => env.clearFirestore();

  await t('a signed-out visitor can neither read nor write', async () => {
    await reset(); await seed(P, doc());
    const db = env.unauthenticatedContext().firestore();
    await assertFails(db.doc(P).get()); await assertFails(db.doc(P).set(doc({ u: 200, b: 100 })));
  });
  await t('a current build (format 2) can create a profile', async () => { await reset(); await assertSucceeds(user().doc(P).set(doc({ b: 0 }))); });
  await t('an old build (format 1) cannot create a profile', async () => { await reset(); await assertFails(user().doc(P).set(doc({ v: 1 }))); });
  await t('an old build cannot overwrite a profile of format 1 either (hard cut-off)', async () => {
    await reset(); await seed(P, doc({ v: 1 })); await assertFails(user().doc(P).set(doc({ v: 1, u: 200, b: 100 })));
  });
  await t('an old build cannot overwrite a profile of format 2', async () => {
    await reset(); await seed(P, doc({ v: 2 })); await assertFails(user().doc(P).set(doc({ v: 1, u: 200, b: 100 })));
  });
  await t('a current build upgrades a profile stored in format 1', async () => {
    await reset(); await seed(P, doc({ v: 1 })); await assertSucceeds(user().doc(P).set(doc({ v: 2, u: 200, b: 100 })));
  });
  await t('a current build updates a profile of format 2', async () => {
    await reset(); await seed(P, doc()); await assertSucceeds(user().doc(P).set(doc({ u: 200, b: 100 })));
  });
  await t('a current build cannot overwrite a profile of a newer format', async () => {
    await reset(); await seed(P, doc({ v: 3 })); await assertFails(user().doc(P).set(doc({ v: 2, u: 200, b: 100 })));
  });
  await t('a stale device (wrong base version) is refused', async () => {
    await reset(); await seed(P, doc({ u: 300 })); await assertFails(user().doc(P).set(doc({ u: 400, b: 100 })));
  });
  await t('unknown fields are refused', async () => {
    await reset(); await assertFails(user().doc(P).set(Object.assign(doc({ b: 0 }), { extra: 1 })));
  });
  await t('a live profile cannot be deleted', async () => {
    await reset(); await seed(P, doc()); await assertFails(user().doc(P).delete());
  });
  await t('a profile is removed in two steps: marked deleted, then deleted', async () => {
    await reset(); await seed(P, doc());
    await assertSucceeds(user().doc(P).set(doc({ n: '', g: 'n', p: '{}', s: '', u: 200, b: 100, d: true })));
    await assertSucceeds(user().doc(P).delete());
  });
  await t('a profile already marked deleted can be deleted', async () => {
    await reset(); await seed(P, doc({ d: true })); await assertSucceeds(user().doc(P).delete());
  });
  await t('a bad family code is refused', async () => {
    await reset(); await assertFails(user().doc('families/short/profiles/p1').set(doc({ b: 0 })));
  });

  // ---- daily safety copies ----
  const SP = `families/${FID}/snaps/2026-11-13_p1`;
  const snap = (o) => Object.assign({ day: '2026-11-13', pid: 'p1', n: 'x', g: 'f', p: '{}', s: '', u: 100, t: Date.now(), v: 2 }, o);
  await t('a safety copy can be created', async () => { await reset(); await assertSucceeds(user().doc(SP).set(snap())); });
  await t('a safety copy cannot be replaced', async () => { await reset(); await seed(SP, snap()); await assertFails(user().doc(SP).set(snap({ n: 'y' }))); });
  await t('a safety copy stamped in the future is refused', async () => { await reset(); await assertFails(user().doc(SP).set(snap({ t: Date.now() + 86400000 }))); });
  await t('a safety copy with unknown fields is refused', async () => { await reset(); await assertFails(user().doc(SP).set(Object.assign(snap(), { extra: 1 }))); });
  await t('a young safety copy cannot be deleted', async () => { await reset(); await seed(SP, snap({ t: Date.now() - 86400000 })); await assertFails(user().doc(SP).delete()); });
  await t('a safety copy older than 8 days can be deleted', async () => { await reset(); await seed(SP, snap({ t: Date.now() - 9 * 86400000 })); await assertSucceeds(user().doc(SP).delete()); });
  await t('a safety copy can be read by the family, not by a signed-out visitor', async () => {
    await reset(); await seed(SP, snap()); await assertSucceeds(user().doc(SP).get()); await assertFails(env.unauthenticatedContext().firestore().doc(SP).get());
  });

  await env.cleanup();
  console.log(failed ? 'FAILURES ' + failed : 'ALL PASS');
  process.exit(failed ? 1 : 0);
})();
