---
"sohl": patch
---

**Make `npm run changeset:check` actually check for a changeset**

Fixes [#1654](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1654):
the script ran `changeset check`, which is not a Changesets command and never has
been — every invocation exited 1 with `Invalid command check was provided`, while
two developer docs told contributors to run it.

- The script is now `changeset status --since=main`, which exits non-zero when the
  branch changes something but adds no changeset — the behaviour the docs claimed.
- `--since` is what makes it a check: a bare `changeset status` counts the
  changesets already on `main` and passes regardless of what the branch did.
- Documented in _Writing Changesets_ that the repository is a single package, so
  the check cannot distinguish a `chore/*` branch from a `feat/*` one and will ask
  for a changeset on any change.
