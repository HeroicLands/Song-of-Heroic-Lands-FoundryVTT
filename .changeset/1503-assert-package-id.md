---
"sohl": patch
---

**Build: the Foundry package id is now checked against the shipped manifest.**
`FOUNDRY_PACKAGE_ID` in `utils/packs/content-package.mjs` documented a guard
named `assertPackageIdMatchesManifest` that had never been written — the
identifier appeared nowhere else in the repository. Every compendium UUID the
pack compilers emit takes its first segment from that constant, so it could drift
from the `id` the manifest declares and quietly ship a whole pack of documents
addressing a package this repository does not ship: links that look resolvable
and fail at runtime.

- New `utils/packs/package-manifest.mjs` holds the guard, split so the rule
  itself is testable: `assertPackageIdMatchesManifest(configuredId, manifestId)`
  is a pure string comparison, and `readManifestPackageId()` is the thin caller
  that feeds it from disk. The module has no import-time side effects.
- It resolves whichever manifest template the repository ships —
  `system.template.json` here, `module.template.json` in a module repository —
  and treats the absence of both as an error, since a pack build with no package
  manifest has nothing to verify its UUIDs against.
- `generatePacksJson()` calls it before generating any entry, so the check runs
  wherever the pack library is driven from, and the pack CLI now reports a build
  guard's message and exits non-zero instead of raising an unhandled rejection.
- The comment in `content-package.mjs` now describes the code that exists.

(Closes #1503.)
