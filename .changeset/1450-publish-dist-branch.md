---
"sohl": patch
---

**The knowledgebase and the API documentation are now published as build output
to a `dist` branch.** `heroiclands-site` consumes that branch with an ordinary
shallow checkout — no credentials beyond repository read — and mounts it under
`www.heroiclands.org/sohl/` (#1444). Nothing is deployed by this: `deploy-kb.yml`
and `deploy-docs.yml` still own the live sites, and the change is additive.

- `deploy-dist.yml` publishes two halves on their own cadences: `kb-content/`
  (knowledgebase Markdown, from `main`, on a push that touches the content or
  the builders) and `api/` (TypeDoc HTML, from the newest release tag, on
  completion of the release workflow). A publish rewrites only the half it built
  and carries the other forward from the branch's current tip.
- `kb-content/` is **Markdown, not rendered HTML** — the consuming site owns the
  layouts and runs Hugo, so publishing needs neither Hugo nor the theme
  submodule here.
- Each publish force-pushes a single orphan commit, so `dist` never accretes a
  copy of the API documentation per release; `metadata.json` at its root records
  the source commit behind each half.
- The API half rebuilds only when the release tag changes. The release workflow
  completes on every push to `main`, and the documentation is a pure function of
  the tag it is built from, so the workflow compares the newest tag against
  `metadata.json` and skips the TypeDoc build when it already matches. A manual
  dispatch bypasses that check.
- `build:kb-content` is a new script for the content-only knowledgebase build
  (`build:kb` is now that plus the Hugo render).
- On a successful publish the workflow sends a `repository_dispatch` to
  `heroiclands-site`. It needs a `SITE_DISPATCH_TOKEN` secret; unset, the step
  skips and the site picks the change up on its next build.

(Closes #1450.)
