---
"sohl": patch
---

Compile the packs of the **configured** content package, and fail a build that compiles nothing (#1502).

Every pack compiler decided whether a note belonged to this build by comparing
its `package:` frontmatter against the string literal `"sohl"` rather than
`CONTENT_PACKAGE`. A repository that vendors `utils/packs/` and sets its own
content package therefore rejected every note, compiled zero documents, and
exited 0 — the very thing `content-package.mjs` exists to prevent, and what made
the shared tree undiffable between packages.

**Every pass now reads the configured package.** `items`, `actors`, `journals`
and `macros` import `CONTENT_PACKAGE` and filter on it; `scenes` already did.

**Empty output fails the build.** The existing guard caught an empty content
_tree_; it could not see a full tree that compiled to nothing. Each compiler now
reports a `compiledCount`, and a pass that writes zero entries from a non-empty
tree fails the pack build instead of shipping a blank compendium. A pack that
legitimately ships nothing in some consuming package declares `mayBeEmpty: true`
in `PACK_CONFIGS`, so the guard stays meaningful everywhere else.
