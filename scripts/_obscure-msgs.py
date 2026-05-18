"""
Rewrite specific commit messages to remove the H-word references.
Used as `--msg-filter` for `git filter-branch`. Reads the existing message
from stdin, writes the replacement to stdout. The current commit's SHA is
in $GIT_COMMIT.
"""
import sys
import os

NEW_MESSAGES = {
    "11c0eae": """Initial commit

Next.js 14 + React 18 + SQLite (better-sqlite3) personal anime tracker.

Features:
- Schedule by season with Thai broadcast times, today/aired highlights
- Discover by Season with tag filter + LRU cache (4 entries)
- Extra section with separate DB table and independent prefs
- Collection (Favorites + Interested) with sort + tag filter
- .xlsx import/export for schedule and collection
- Custom-themed Tailwind confirm dialogs (no browser popups)
- Cyberpunk/synthwave color palette

Data persisted to data/anime-tracker.db via /api/storage/[key] route.
AniList GraphQL API for metadata.
""",
    "efee9ad": "Internal naming refactor\n",
    "207a214": "readme: reflect naming refactor\n",
    "e892926": "Obscure internal naming\n",
}

sha = os.environ.get("GIT_COMMIT", "")
for prefix, new_msg in NEW_MESSAGES.items():
    if sha.startswith(prefix):
        sys.stdout.write(new_msg)
        sys.exit(0)

# Pass through unchanged for every other commit.
sys.stdout.write(sys.stdin.read())
