#!/usr/bin/env python3
"""Connects a game version to a commit, from a checkout with its history.

  python3 tools/version_commit.py                 the version in the working copy
  python3 tools/version_commit.py 2026.11.10b     which commits have that version
  python3 tools/version_commit.py 1a2b3c4         which version a commit (id or the short id shown in the parent area) has

The version is the APP_VERSION line in math-quest.html. A version can span several commits (fixes made before the next bump), so the first and the last are shown,
and the pull request that brought the first one into main.
"""
import re, subprocess, sys

def git(*a):
    r = subprocess.run(['git', *a], capture_output=True, text=True)
    if r.returncode: sys.exit('git ' + ' '.join(a) + ': ' + r.stderr.strip())
    return r.stdout

def version_at(rev):
    r = subprocess.run(['git', 'show', rev + ':math-quest.html'], capture_output=True, text=True)
    m = re.search(r"const APP_VERSION = '([^']+)'", r.stdout) if r.returncode == 0 else None
    return m.group(1) if m else None

def line(c):
    return git('log', '-1', '--format=%h  %ad  %s', '--date=short', c).strip()

def by_version(v):
    needle = "const APP_VERSION = '%s'" % v
    cs = git('log', '--reverse', '--format=%H', '-S' + needle, '--', 'math-quest.html').split()
    has = [c for c in cs if version_at(c) == v]   # the commits that set it (a commit that replaced it with the next one is not one of them)
    if not has:
        head = version_at('HEAD')
        if head != v and re.search(r"const APP_VERSION = '%s'" % re.escape(v), open('math-quest.html', encoding='utf-8').read()): sys.exit('version %s is in your working copy but not committed yet' % v)
        sys.exit('no commit has version %s%s' % (v, '' if head else ' (no history here?)'))
    first = has[0]
    later = [c for c in cs if c not in has]   # commits that took the version away again (the next bump)
    last = git('rev-parse', later[0] + '^').strip() if later else (git('rev-parse', 'HEAD').strip() if version_at('HEAD') == v else has[-1])
    print('version %s' % v)
    print('  first commit: ' + line(first))
    print('  last commit : ' + line(last))
    pr = git('log', '--merges', '--ancestry-path', '--reverse', '--format=%h  %ad  %s', '--date=short', first + '..HEAD').splitlines()
    if pr: print('  merged by   : ' + pr[0])

def by_commit(c):
    full = git('rev-parse', '--verify', c + '^{commit}').strip()
    print('commit ' + line(full))
    print('  version: ' + str(version_at(full)))

if __name__ == '__main__':
    a = sys.argv[1] if len(sys.argv) > 1 else re.search(r"const APP_VERSION = '([^']+)'", open('math-quest.html', encoding='utf-8').read()).group(1)
    (by_commit if re.fullmatch(r'[0-9a-f]{7,40}', a) else by_version)(a)
