---
"sohl": patch
---

**One `/sohl/` deploy per push, and no more whole-zone cache purges.**
`deploy-sohl.yml` watched the release workflow's _completion_ as its
"a new release exists" signal, but that workflow runs on every push to `main`
and succeeds whether or not it cuts a release — so most pushes published the
site twice, and every publish ended in a `purge_everything` across the whole
`heroiclands.org` zone.

- The `workflow_run` trigger is gone. `release.yml` now dispatches the deploy
  itself, from the one step that knows a release was actually published, so the
  API half still refreshes when the tag it documents moves.
- The push trigger republishes on **every** push to `main`, no longer only on
  changes to a hand-maintained path list. The site is cheap to rebuild against
  how quietly such a list goes stale.
- The post-deploy cache purge is removed. `/sohl/` is served through the routing
  Worker straight from Cloudflare Pages, which sends
  `cache-control: public, max-age=0, must-revalidate` and is never held in the
  zone edge cache — so the purge invalidated nothing under `/sohl/` and evicted
  only the surfaces the deploy never touched (`www`'s own pages, `cdn`).

(Closes #1484.)
