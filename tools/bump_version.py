#!/usr/bin/env python3
"""Stamp the next version into math-quest.html and sw.js, together.

  python3 tools/bump_version.py                    today + the next free letter
  python3 tools/bump_version.py --date 2026-11-22  an explicit version date

A version is a date and a letter: 2026.11.21a, then b, c and so on. The next
letter follows both the version in the working copy and the v<date><letter>
tags already in the repository, so a branch prepared earlier cannot reuse a
letter that was released while it waited.
"""
import argparse
from datetime import date
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
VERSION_RE = r"(\d{4}\.\d{2}\.\d{2})([a-z]+)"
STAMPS = [('math-quest.html', 'APP_VERSION'), ('sw.js', 'VERSION')]


def current_version(root=ROOT):
    text = (root / 'math-quest.html').read_text(encoding='utf-8')
    match = re.search(r"^const APP_VERSION = '([^']+)';", text, re.M)
    if not match or not re.fullmatch(VERSION_RE, match.group(1)):
        raise ValueError('math-quest.html: missing or invalid APP_VERSION')
    return match.group(1)


def released_letters(day, git_run=None, root=ROOT):
    """Letters used by v<day><letter> tags; empty when git cannot answer."""
    git_run = git_run or (lambda *a: subprocess.run(
        ['git', *a], cwd=root, capture_output=True, text=True))
    try:
        result = git_run('tag', '-l', 'v' + day + '*')
    except OSError:
        return []
    if result.returncode:
        return []
    return [tag[len('v' + day):] for tag in result.stdout.split()
            if re.fullmatch(r'v' + re.escape(day) + r'[a-z]+', tag)]


def next_version(current, day, taken=()):
    match = re.fullmatch(VERSION_RE, current)
    if not match:
        raise ValueError(f'cannot read the current version {current!r}')
    letters = {suffix for suffix in taken if len(suffix) == 1}
    if match.group(1) == day:
        if len(match.group(2)) != 1:
            raise ValueError(f'cannot bump the multi-letter suffix in {current}; pick the version by hand')
        letters.add(match.group(2))
    if not letters:
        return day + 'a'
    last = max(letters)
    if last == 'z':
        raise ValueError(f'{day}z is taken; pick the version by hand')
    return day + chr(ord(last) + 1)


def stamp(version, root=ROOT):
    for filename, name in STAMPS:
        path = root / filename
        text = path.read_text(encoding='utf-8')
        text, count = re.subn(r"^(const " + name + r" = ')[^']+(';)",
                              r'\g<1>' + version + r'\g<2>', text, count=1, flags=re.M)
        if count != 1:
            raise ValueError(f'{filename}: could not stamp {name}')
        path.write_text(text, encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--date', metavar='YYYY-MM-DD', help='version date (default: today, local time)')
    args = parser.parse_args()
    if args.date:
        try:
            day = date.fromisoformat(args.date).strftime('%Y.%m.%d')
        except ValueError:
            raise SystemExit('--date must be YYYY-MM-DD')
    else:
        day = date.today().strftime('%Y.%m.%d')
    current = current_version()
    new = next_version(current, day, released_letters(day))
    if new == current:
        print(f'already at {current}')
        return
    stamp(new)
    print(f'{current} -> {new}')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError) as exc:
        raise SystemExit(str(exc))
