---
"sohl": patch
---

**Compiled pack documents stamp the version that built them (#1548)**

Every compiled compendium document carried `_stats.systemVersion: "0.6.0"`, a
hand-maintained literal the system had shipped past many releases ago. A
document that under-reports its version is eligible for world migrations it does
not need — the same defect a stale `_stats.coreVersion` had before it began
following the manifest's `compatibility.minimum` (#1533).

`content-build.config.mjs` now reads the version from `package.json`, the file
Changesets bumps and `build:system` stamps into the shipped manifest, so the
stamp follows the release instead of being transcribed. It stays a
per-repository value rather than moving onto the shared toolchain: a module
repository shipping SoHL content stamps the version of the _system_ its content
targets, not its own package version.

This rewrites the `_stats` block of every document in every pack.
