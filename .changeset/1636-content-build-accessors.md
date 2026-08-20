---
"sohl": patch
---

**The build scripts read `@heroiclands/content-build`'s configuration through its
accessors.** The package used to resolve its configuration at module scope, which
is why no module could be imported — and the CLI could not report its own version
— without a consumer config present. Fixing that turned five constant exports
into functions, because an ES module's `export const` is snapshotted when the
module evaluates and four of the five are strings or Sets.

This repository still imported the old names, so moving the pin past that release
failed at the first import with `does not provide an export named
'CONTENT_PACKAGE'` — before the build did anything at all.

`build-system-json`, `build-link-manifest` and `build-kb-content` now call
`contentPackage()`, `foundryPackageId()` and `packRouter()`, each resolved once
at the top of the script: these are build entry points, which always have a
config, so there is nothing to defer. The three developer-doc pages that named
the old symbols name the accessors instead.

(Closes #1636.)
