# Sync safety plan

## Why (the incident of 2026-11-11)
A tablet still running a build from before the room existed (Chrome page, anonymous-backup mode, same family code) pulled Gaia's profile, kept only the fields it knew (the room and the tokens were dropped), and wrote the profile back at 17:01 and again at 23:36. The phone and the laptop then pulled that copy. Nothing in the cloud kept the earlier version, and the phone's single `_before_sync` copy was overwritten by a later pull. The room was rebuilt from an older laptop copy.

Causes: (1) any build, however old, could write any profile; (2) a profile is one document, replaced whole; (3) no history in the cloud and only one local safety copy; (4) the conflict rule trusts timestamps alone, and a save with no timestamp counts as "now".

## Phases (each its own branch, stacked; the owner merges)
1. **Server lock (branch `sync-lock-1`).** Documents carry a format number `v` (`CLOUD_DOC_V` in math-quest.html = `minDocVersion()` in firebase/firestore.rules). The rules refuse any write below the minimum and any write that lowers the stored number (hard cut-off: an older build can read but not write). A live profile can no longer be deleted: it is marked deleted (an update), then removed. The admin page shows each profile's format and whether its room data is missing. Rule tests run against the Firestore emulator in CI (`firebase/rules-test`).
2. **Client guards (`sync-guard-2`).** A build that meets a newer format goes read-only for that profile ("update the app") and carries unknown fields through. A pull or push that would lose data (no room data, fewer tokens or placed items) is held back with a safety copy and a message. A save with no timestamp counts as the oldest, not "now"; future times are clamped; on first connecting, a profile that exists on both sides asks (family copy / this device / both). Several dated safety copies instead of one.
3. **Backups (`sync-backup-3`).** The first sync of each day copies each profile's cloud state into `families/{fid}/backups/{date}_{profile}` (create-only; removable after 8 days; the client prunes, so a week is kept). Each device also keeps its last 7 daily copies. Extra copies before any overwrite that loses data.
4. Later, optional: parent-area and admin-page restore (as a new profile by default), a startup watchdog for the tablet logo hang, section-level merge, Firebase point-in-time recovery (needs the Blaze plan).

## Rollout of phase 1 (the order matters)
1. Merge the branch; wait for the deploy (the app version changes to 2026.11.13a).
2. Open the game on every device (phone, tablet app, laptop) so each updates. Clear or retire any device still running an old build.
3. In the admin page press "load everything": each profile should show `v2` (a profile still on v1 is written by the next update; open the game on a device that has it). Profiles written by an old build show "room data missing".
4. Check the `rules` job of the pull request is green, then paste `firebase/firestore.rules` into the Firebase console (Firestore, Rules, Publish). Keep the previous rules text somewhere for a rollback.
5. In the Rules playground, check: a write with `v: 1` is denied; a write with `v: 2` that builds on the stored `u` is allowed.
Until step 4, an old build can still write; after it, nothing below format 2 can.
Rollback: paste the previous rules. Any device that was refused keeps its data and uploads later.
