#!/usr/bin/env python3
"""Version visibility checks and safe, post-deployment GitHub releases.

No network writes happen unless invoked with `publish`. The workflow restricts
that command to main, after deployment and both test jobs have succeeded.
"""
import argparse
from datetime import date, timezone, datetime
import json
import os
from pathlib import Path
import re
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
VERSION_RE = r"\d{4}\.\d{2}\.\d{2}[a-z]+"
SHA_RE = r"[0-9a-f]{40}"


def read_version(root=ROOT):
    values = []
    for filename, name in [('math-quest.html', 'APP_VERSION'), ('sw.js', 'VERSION')]:
        text = (root / filename).read_text(encoding='utf-8')
        match = re.search(r"^const " + name + r" = '([^']+)';", text, re.M)
        if not match or not re.fullmatch(VERSION_RE, match[1]):
            raise ValueError(f'{filename}: missing or invalid {name}')
        values.append(match[1])
    if values[0] != values[1]:
        raise ValueError('APP_VERSION and service worker VERSION differ')
    return values[0]


def stale_note(version, today=None):
    """A warning when the proposed version is dated before today (UTC). Never a failure:
    a branch started yesterday may merge today; run tools/bump_version.py to re-date it."""
    match = re.match(r'(\d{4})\.(\d{2})\.(\d{2})[a-z]+$', version)
    if not match:
        return ''
    version_date = date(int(match.group(1)), int(match.group(2)), int(match.group(3)))
    today = today or datetime.now(timezone.utc).date()
    if version_date >= today:
        return ''
    return (f'Proposed version {version} is dated {version_date.isoformat()}, before today '
            f'({today.isoformat()}, UTC). If this branch is about to be released, run '
            'tools/bump_version.py so the release gets today\'s date.')


def check_title(title, version):
    if not title.startswith(f'[{version}] ') or not title[len(version) + 3:].strip():
        raise ValueError(f'PR title must be [{version}] Short description (proposed version, not live)')


def summary(text):
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a', encoding='utf-8') as f:
            f.write(text + '\n')
    print(text)


def fetch_text(url):
    req = urllib.request.Request(url, headers={'Cache-Control': 'no-cache', 'User-Agent': 'Cupcake-release-check'})
    with urllib.request.urlopen(req, timeout=20) as response:
        return response.read().decode('utf-8')


def verify_live(site, version, sha, fetch=fetch_text, sleep=time.sleep, attempts=12):
    parsed = urllib.parse.urlsplit(site)
    if parsed.scheme != 'https' or parsed.netloc != 'matan-gk.github.io' or parsed.query or parsed.fragment:
        raise ValueError('Unexpected Pages URL; refusing to verify another site')
    if not re.fullmatch(SHA_RE, sha):
        raise ValueError('Expected a full deployed commit SHA')
    base = site.rstrip('/') + '/'
    error = 'not checked'
    for attempt in range(attempts):
        try:
            suffix = '?' + urllib.parse.urlencode({'release_check': sha, 'attempt': attempt})
            page = fetch(base + 'math-quest.html' + suffix)
            sw = fetch(base + 'sw.js' + suffix)
            app = re.search(r"^const APP_VERSION = '([^']+)';", page, re.M)
            commit = re.search(r"^const BUILD_COMMIT = '([^']*)';", page, re.M)
            worker = re.search(r"^const VERSION = '([^']+)';", sw, re.M)
            if app and worker and commit and app[1] == worker[1] == version and commit[1] == sha:
                return
            error = 'live version or stamped commit does not match this deployment'
        except (OSError, UnicodeError) as exc:
            error = str(exc)
        if attempt + 1 < attempts:
            sleep(10)
    raise ValueError(f'Live verification failed: {error}. No release created.')


class GitHub:
    def __init__(self, repo, token):
        if repo != 'matan-gk/matan-gk.github.io':
            raise ValueError('Unexpected repository')
        self.base = 'https://api.github.com/repos/' + repo
        self.token = token

    def __call__(self, method, path, data=None, missing_ok=False):
        request = urllib.request.Request(self.base + path,
            data=json.dumps(data).encode() if data is not None else None,
            method=method, headers={'Authorization': 'Bearer ' + self.token,
                'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json', 'User-Agent': 'Cupcake-release'})
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return json.load(response)
        except urllib.error.HTTPError as exc:
            if missing_ok and exc.code == 404:
                return None
            # Do not log request headers or credentials.
            raise ValueError(f'GitHub API {method} {path}: HTTP {exc.code}') from None


def release_plan(api, version, sha):
    """Read-only preflight. A reused version never moves an existing tag."""
    tag = 'v' + version
    ref = api('GET', '/git/ref/tags/' + tag, missing_ok=True)
    if ref:
        obj = ref['object']
        # Support both lightweight and annotated tags; fail closed on cycles.
        for _ in range(5):
            if obj['type'] == 'commit':
                break
            if obj['type'] != 'tag':
                raise ValueError('Version tag does not point to a commit')
            obj = api('GET', '/git/tags/' + obj['sha'])['object']
        if obj['type'] != 'commit' or obj['sha'] != sha:
            raise ValueError(f'{tag} already points to another commit. Bump the version; no tag moved.')
    existing = api('GET', '/releases/tags/' + tag, missing_ok=True)
    if existing and (not ref or existing.get('draft') or existing.get('prerelease')):
        raise ValueError('Existing release is inconsistent, draft or prerelease; review it manually')
    return tag, existing, ref


def publish(api, version, sha, site, verify=verify_live):
    tag, existing, ref = release_plan(api, version, sha)
    # Verify before creating either a tag or a release. Never target mutable main.
    verify(site, version, sha)
    if existing:
        url = existing['html_url']
        summary(f'### Release already exists: {version}\n{url}\n\nLive version and commit verified; no changes made.')
        return existing
    if not ref:
        # Creating a ref is atomic and refuses to overwrite one created by
        # another run. Release creation alone would silently use an existing
        # tag, ignoring target_commitish. A partial failure is safe to rerun.
        api('POST', '/git/refs', {'ref': 'refs/tags/' + tag, 'sha': sha})
    # Recheck the tag immediately before publishing; never move existing tags.
    release_plan(api, version, sha)
    released = api('POST', '/releases', {
        'tag_name': tag, 'target_commitish': sha, 'name': version,
        'generate_release_notes': True, 'draft': False, 'prerelease': False,
        'make_latest': 'true',
        'body': f'Published to {site}\n\nVerified version: `{version}`. Deployed commit: `{sha}`.\n\n'
                'This records a successful deployment, not a guarantee that it is still the active deployment. '
                'Use the repository Deployments view for current status.\n\n',
    })
    summary(f'### Published release: {version}\n{released["html_url"]}\n\n'
            f'Verified site: {site}\n\nCommit: `{sha}`')
    return released


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['check', 'publish'])
    args = parser.parse_args()
    version = read_version()
    event_name = os.environ.get('GITHUB_EVENT_NAME', '')
    if args.command == 'check':
        if event_name == 'pull_request':
            event = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text())
            check_title(event['pull_request']['title'], version)
        summary(f'### Proposed version: {version}\nThis is the version in this checkout, not confirmation it is live.')
        stale = stale_note(version)
        if stale:
            summary('> **Warning:** ' + stale)
        return
    if os.environ.get('GITHUB_REF') != 'refs/heads/main' or event_name not in ('push', 'workflow_dispatch'):
        raise ValueError('Release publication is allowed only on main push/manual runs')
    api = GitHub(os.environ['GITHUB_REPOSITORY'], os.environ['GH_TOKEN'])
    publish(api, version, os.environ['GITHUB_SHA'], os.environ['PAGES_URL'])


if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError, OSError) as exc:
        raise SystemExit(str(exc))
