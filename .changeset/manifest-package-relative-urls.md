---
"sohl": patch
---

**Link-manifest addresses are recorded relative to their package** (#1465)

A manifest entry gave a site-absolute path, so it asserted not just where a page
sits in its package but where that package is served. Every inbound cross-package
link then depended on the citing site agreeing with that mount point — and the day
a package moved, each of them failed the way the manifest exists to prevent: the
address resolves, an `href` is emitted, and only the reader finds the 404.

- _An entry says `path`, not `url`._ It records the address inside the package
  (`creature/grukar-ahk/`) and nothing about the package's own location.
- _The consumer holds the mount point._ `PACKAGE_BASE` in `utils/kb-manifest.mjs`
  is one line per package, prefixed at resolve time. Repointing a package at
  another path or another origin is that single string, not 1,473 rewritten
  entries — and an absolute-origin base yields working absolute links.
- _The format version is bumped to 2 and the older shape is rejected._ The two are
  indistinguishable to a consumer that just prefixes — a v1 `url` would become
  `/thalorna/thalorna/…` — so a stale vendored manifest has to be an error rather
  than a wrong link.
- _Both repositories emit and consume the new shape_, and the vendored
  `thalorna` manifest is refreshed. Rendered links are unchanged for the current
  single-origin layout.
