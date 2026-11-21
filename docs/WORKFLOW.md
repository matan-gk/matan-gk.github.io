# How the repository works (since 2026-11-05)

This repository **is** the site (GitHub Pages) and **is** the source of the game. There is no separate single-file source and no build step before publishing.

## Layout
| Path | What it is |
|---|---|
| `math-quest.html` | the game: code, styles, texts, data. About 550 KB. Every picture and font is a link to `assets/` |
| `assets/<hash>.<ext>` | every picture and font (content-hashed names: the same picture always has the same name) |
| `assets.json` | the list of asset files, written by `tools/externalize.py`; the service worker caches it for offline use |
| `sw.js`, `manifest.webmanifest`, icons | offline support and home-screen install; `VERSION` in `sw.js` must equal `APP_VERSION` in the page (a test checks it) |
| `admin.html`, `firebase/` | the read-only admin page and the Firebase setup notes and rules |
| `tests/` | the Playwright test suite: `cd tests && node run.js` (about 4 minutes), one test with `node <name>.js` |
| `tools/externalize.py` | moves any picture pasted into the page out to `assets/`, deletes unused asset files, rewrites `assets.json` |
| `docs/` | `ENHANCEMENTS.md` (status and plan), privacy statement, categories, icons notes, the personal-space reference images and Gemini prompts |

The art kits (the sheets from Gemini, the cut parts, the `cut.py` / `compose.py` scripts) are NOT in this repository: they are large (about 80 MB) and are not part of the site. They live in the working folder as `reward-parts/<kind>/`. A kit's `compose.py export` produces the data that is pasted into the page; then `tools/externalize.py` turns its pictures into files.

## Making a change
1. Work on a branch (never directly on `main`): `git checkout -b <name>`.
2. Edit `math-quest.html` (and `sw.js` for a new version number).
3. If art was pasted into the page: `python3 tools/externalize.py`.
4. Run the tests: `cd tests && node run.js`.
5. Commit and push the branch; open a pull request; merging to `main` publishes the site.

## One-off checks
- The page must open from the file system too (the tests do exactly that); links to `assets/` are relative.
- The service worker pre-caches everything listed in `assets.json`, so a release that adds many pictures makes the first start after the update download them.

## Versions, PRs and releases

Versions keep the existing date-and-letter format. For this branch the proposed
version is `2026.11.19m`. Update `APP_VERSION` in `math-quest.html` and `VERSION`
in `sw.js` together when starting a new version. A published version tag must
never be reused for a different commit.

When opening a PR, start its title with the exact proposed version, for example:
`[2026.11.19m] Show versions and releases on GitHub`.
The `Proposed version and release checks` job checks both files, checks the PR
title, runs release-safety unit tests, and adds the version to the Actions summary.
Title edits rerun the workflow. The check does not rename PRs, and it does not
mean that the proposed version is live. Configure the new check as required in
branch protection separately if you want GitHub to enforce it as a merge gate;
this change does not modify repository settings.

Release automation is in `.github/workflows/tests.yml`, with the small helper
`tools/release_visibility.py`. When Pages via Actions is enabled, a main-branch
push or manual run follows this sequence:

1. App tests and the version check must pass before the existing Pages deploy.
   The rules job still runs in parallel; its existing deployment behavior is
   otherwise unchanged.
2. The new release job waits for both deployment success and rules success.
3. It checks the served `APP_VERSION`, service worker `VERSION`, and stamped
   `BUILD_COMMIT` against the exact workflow commit. It makes up to 12 checks,
   10 seconds apart, to allow publication to settle. It does not use a cached
   browser or service worker for this check.
4. It creates a `v2026.11.19m` tag on that exact commit and a Release named
   `2026.11.19m`, explicitly marked Latest. GitHub generates release notes from
   merged PRs, contributors and a changelog. A short deployment record is
   prepended. GitHub's default release-note categories are used; no separate
   `.github/release.yml` is needed. The first release has no previous release
   boundary, so its notes may cover older project history, not just this branch.

Only the release job receives `contents: write`, using the built-in workflow
token. No extra secret or PAT is needed for normal main-branch release creation.
A feature branch and a PR cannot run the publication job. Local unit tests fake
all API operations and never create real tags or releases.

A rerun verifies the live site again and leaves an existing release unchanged
when its tag already points to the same commit. If that version tag points to a
different commit, publication fails rather than moving the tag. A verification
or release failure does not undo a successful Pages deployment. Fix the cause
and rerun the failed job; do not assume a missing release means deploy failed.

On GitHub, use the repository's **Releases** link for readable version history
and **Deployments** for current deployment status. A release records a successful
past deployment, not a permanent claim about what is live after a rollback.
PRs, merges, deployment success and release publication remain separate events.

Local safety tests:

```sh
python3 -m unittest discover -s tests -p 'test_release_visibility.py' -v
python3 tools/release_visibility.py check
```

The current workflow only runs automatically for pushes to `main` and PR events.
Pushing a feature branch without a PR does not run GitHub CI. Use local tests
(or a permitted manual run) to test it without opening a PR. Do not publish a
real release as a test.
