---
"sohl": patch
---

**The API documentation is published only at `www.heroiclands.org/sohl/api/`.**
`api.heroiclands.org` and the machinery behind it are gone: `deploy-docs.yml`
and the `gh-pages` branch it published to are deleted, along with the page
documenting that hosting.

Nothing about the documentation itself changes — the same TypeDoc build, from
the same newest release tag, still ships with every release. It is now one half
of the single `/sohl/` deploy (#1470) rather than a second deployment of the
same pages to a second host, which is what could drift and what made "which
release does this describe?" answerable two ways.

- `.github/workflows/deploy-docs.yml` — deleted. `deploy-sohl.yml` already
  builds the API documentation from the newest release tag on the same trigger,
  so no publish is lost and none is duplicated.
- The `gh-pages` branch — deleted. It held one build and no history worth
  keeping; git tags are the history, and any release's documentation is
  reproducible from its tag with `npm run docs:html`.
- `kb/dev-docs/contributing/api-docs-hosting.md` — deleted, and unlinked from
  the documentation index. It described a branch-based Pages deploy, a `CNAME`
  file and a cache-purge step that no longer exist.

`kb/hugo.toml`, `kb/layouts/`, `kb/data/` and the shared-theme submodule are
untouched and still in use: this repository renders its own pages.

(Closes #1456.)
