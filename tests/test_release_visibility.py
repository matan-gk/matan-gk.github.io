"""Release automation regression tests. All network operations are fakes."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

MODULE = Path(__file__).resolve().parents[1] / 'tools/release_visibility.py'
spec = importlib.util.spec_from_file_location('release_visibility', MODULE)
r = importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)
VERSION = '2026.11.19m'
SHA = 'a' * 40
SITE = 'https://matan-gk.github.io/'


class FakeAPI:
    def __init__(self, ref=None, release=None, annotated=None):
        self.ref = ref
        self.release = release
        self.annotated = annotated
        self.calls = []

    def __call__(self, method, path, data=None, missing_ok=False):
        self.calls.append((method, path, data))
        if method == 'POST':
            if path == '/git/refs':
                self.ref = ref(data['sha'])
                return self.ref
            return {'html_url': 'https://example.invalid/release-test'}
        if path.startswith('/git/ref/'):
            return self.ref
        if path.startswith('/git/tags/'):
            return self.annotated
        return self.release

    @property
    def writes(self):
        return [c for c in self.calls if c[0] != 'GET']


def ref(sha=SHA, kind='commit'):
    return {'object': {'type': kind, 'sha': sha}}


class ReleaseTests(unittest.TestCase):
    def test_versions_match(self):
        with tempfile.TemporaryDirectory() as d:
            p = Path(d)
            (p / 'math-quest.html').write_text(f"const APP_VERSION = '{VERSION}';\n")
            (p / 'sw.js').write_text(f"const VERSION = '{VERSION}';\n")
            self.assertEqual(r.read_version(p), VERSION)
            (p / 'sw.js').write_text("const VERSION = '2026.11.19l';\n")
            with self.assertRaisesRegex(ValueError, 'differ'):
                r.read_version(p)

    def test_invalid_version(self):
        with tempfile.TemporaryDirectory() as d:
            p = Path(d)
            (p / 'math-quest.html').write_text("const APP_VERSION = 'bad-version';\n")
            with self.assertRaises(ValueError):
                r.read_version(p)

    def test_pr_title(self):
        r.check_title(f'[{VERSION}] Release visibility', VERSION)
        for title in ['Release visibility', '[2026.11.19l] Wrong version', f'[{VERSION}] ', f'[{VERSION}]']:
            with self.subTest(title=title), self.assertRaises(ValueError):
                r.check_title(title, VERSION)

    def test_live_matches_all_three_fields(self):
        urls = []
        def fetch(url):
            urls.append(url)
            if '/sw.js?' in url:
                return f"const VERSION = '{VERSION}';\n"
            return f"const APP_VERSION = '{VERSION}';\nconst BUILD_COMMIT = '{SHA}';\n"
        r.verify_live(SITE, VERSION, SHA, fetch=fetch, attempts=1)
        self.assertEqual(len(urls), 2)
        self.assertTrue(all('release_check=' + SHA in u for u in urls))

    def test_live_mismatch_never_passes(self):
        for kind in ['page', 'worker', 'commit']:
            def fetch(url):
                if '/sw.js?' in url:
                    return "const VERSION = '" + ('2026.11.19l' if kind == 'worker' else VERSION) + "';\n"
                return ("const APP_VERSION = '" + ('2026.11.19l' if kind == 'page' else VERSION)
                        + "';\nconst BUILD_COMMIT = '" + ('b' * 40 if kind == 'commit' else SHA) + "';\n")
            with self.subTest(kind=kind), self.assertRaisesRegex(ValueError, 'No release'):
                r.verify_live(SITE, VERSION, SHA, fetch=fetch, attempts=1)

    def test_live_retry(self):
        calls = []
        sleeps = []
        def fetch(url):
            calls.append(url)
            if len(calls) == 1:
                raise OSError('temporary unavailable')
            return (f"const VERSION = '{VERSION}';\n" if '/sw.js?' in url else
                    f"const APP_VERSION = '{VERSION}';\nconst BUILD_COMMIT = '{SHA}';\n")
        r.verify_live(SITE, VERSION, SHA, fetch=fetch, sleep=sleeps.append, attempts=2)
        self.assertEqual(sleeps, [10])

    def test_live_network_failure_is_closed(self):
        def fetch(url):
            raise OSError('offline')
        with self.assertRaises(ValueError):
            r.verify_live(SITE, VERSION, SHA, fetch=fetch, attempts=1)

    def test_bad_site_and_sha(self):
        for site, sha in [('http://matan-gk.github.io/', SHA), ('https://other.invalid/', SHA), (SITE, 'main')]:
            with self.subTest(site=site, sha=sha), self.assertRaises(ValueError):
                r.verify_live(site, VERSION, sha, fetch=lambda u: self.fail('must not fetch'))

    def test_new_release_exact_sha_generated_notes_latest(self):
        api = FakeAPI()
        verified = []
        def verify(*args):
            self.assertFalse(api.writes)
            verified.append(args)
        with patch.object(r, 'summary'):
            r.publish(api, VERSION, SHA, SITE, verify=verify)
        self.assertEqual(verified, [(SITE, VERSION, SHA)])
        self.assertEqual(len(api.writes), 2)
        self.assertEqual(api.writes[0], ('POST', '/git/refs', {'ref': 'refs/tags/v' + VERSION, 'sha': SHA}))
        method, path, body = api.writes[1]
        self.assertEqual((method, path), ('POST', '/releases'))
        self.assertEqual(body['target_commitish'], SHA)
        self.assertEqual(body['tag_name'], 'v' + VERSION)
        self.assertTrue(body['generate_release_notes'])
        self.assertEqual(body['make_latest'], 'true')
        self.assertFalse(body['draft'])

    def test_verification_failure_blocks_write(self):
        api = FakeAPI()
        def verify(*args):
            raise ValueError('wrong live commit')
        with self.assertRaises(ValueError):
            r.publish(api, VERSION, SHA, SITE, verify=verify)
        self.assertFalse(api.writes)

    def test_existing_release_rerun_is_read_only(self):
        api = FakeAPI(ref=ref(), release={'html_url': 'https://example.invalid/release-test'})
        with patch.object(r, 'summary'):
            r.publish(api, VERSION, SHA, SITE, verify=lambda *args: None)
        self.assertFalse(api.writes)

    def test_reused_version_conflict_never_writes(self):
        api = FakeAPI(ref=ref('b' * 40))
        with self.assertRaisesRegex(ValueError, 'Bump the version'):
            r.publish(api, VERSION, SHA, SITE, verify=lambda *args: self.fail('must fail preflight'))
        self.assertFalse(api.writes)

    def test_annotated_tag_supported(self):
        api = FakeAPI(ref=ref('c' * 40, 'tag'), annotated=ref())
        self.assertEqual(r.release_plan(api, VERSION, SHA), ('v' + VERSION, None, api.ref))

    def test_existing_draft_or_prerelease_is_not_published(self):
        for field in ['draft', 'prerelease']:
            api = FakeAPI(ref=ref(), release={field: True})
            with self.subTest(field=field), self.assertRaises(ValueError):
                r.release_plan(api, VERSION, SHA)
            self.assertFalse(api.writes)

    def test_publish_cli_rejects_feature_branch_or_pr(self):
        for event, branch in [('push', 'refs/heads/feature'), ('pull_request', 'refs/heads/main')]:
            with self.subTest(event=event), patch.dict(r.os.environ, {
                'GITHUB_EVENT_NAME': event, 'GITHUB_REF': branch,
            }), patch.object(r, 'read_version', return_value=VERSION), patch('sys.argv', ['script', 'publish']):
                with self.assertRaisesRegex(ValueError, 'only on main'):
                    r.main()

    def test_repository_bound(self):
        with self.assertRaises(ValueError):
            r.GitHub('another/repo', 'not-a-real-token')


if __name__ == '__main__':
    unittest.main()
