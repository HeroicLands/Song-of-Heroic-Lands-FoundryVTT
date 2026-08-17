---
"sohl": patch
---

**The cross-package address allowlist is gone** (#1446)

`FOREIGN_ADDRESS_ALLOWLIST` named six addresses that resolved to real notes in a
package this repository did not publish. It existed because nothing in the
syntax separated such a reference from a typo, so the deliberate ones had to be
listed by hand and everything else failed.

The link manifest answers that question with the target package's own build
output, and with `assets/manifests/thalorna.json` vendored every one of the six
now resolves through it — `check-content-links` reported all six as unused on
every run. The constant, the code that consulted it, and the stale-entry warning
are removed, and the content-links reference documents the manifest instead.
