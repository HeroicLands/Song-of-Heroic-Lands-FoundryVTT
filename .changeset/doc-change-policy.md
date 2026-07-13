---
"sohl": patch
---

**Docs: user-visible documentation changes are bug/feature, not chore (#398)**

`system-development.md` now states that user-visible documentation — JSDoc (which
publishes to the API site) and other user-facing docs (the `docs/` pages and the
user guide) — is a `bug` (published docs are wrong, broken, or misleading) or a
`feature` (new or expanded coverage), with a tracking issue and a changeset like
any other change. Only non-published housekeeping (internal non-JSDoc comments,
build and tooling config, repo meta) remains `chore/*`.
