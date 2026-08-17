---
"sohl": patch
---

**API documentation is published for the current release only, unversioned.**
`api.heroiclands.org` now serves one build — the newest release tag — at its
root. The accretive archive is retired: no `/latest`, no `/main`, no `/<tag>`,
and no per-branch directories. Git tags are the history, and the documentation
for any release is reproducible from its tag with `npm run docs:html`.

- `deploy-docs.yml` resolves the newest release from the GitHub API and builds
  that tag, so the ref that triggered the run no longer decides what is
  published. It runs on completion of the release workflow and on manual
  dispatch, replacing the `workflow_call` indirection that existed because a
  Release created with `GITHUB_TOKEN` cannot trigger a `release:` event.
- Removed with the archive: `/latest` mirroring, branch-slug directories, the
  root redirect page, and the cleanup job that fired on branch deletion.
- `CNAME` is preserved rather than rewritten — GitHub Pages maintains it from
  the custom-domain setting.
- `docs:version` (`utils/sync-doc-version.mjs`) is gone. It pinned generated
  `…/latest` links to `…/v<version>`, an address that no longer exists.

(Closes #1452.)
