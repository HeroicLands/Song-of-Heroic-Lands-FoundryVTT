---
"sohl": patch
---

**Cross-package links resolve through a published manifest** (#1446)

A note addressing another package — `Rules/Bestiary.md` links six Thalorna
creatures — had no way to resolve, because nothing in `[[type-shortcode]]`
separates a legitimate cross-package reference from a typo. Both degraded to
plain text, and the dead-address guard had to stay off or correct content would
have failed the build.

- _Each package publishes a manifest._ The knowledgebase build emits
  `build/manifests/<package>.json`, mapping every addressable note's
  `type/shortcode` to the `{ url, name }` a link needs. Another package vendors
  it into `assets/manifests/` and resolves into it — including types this build
  has never seen, which are seeded so the address is recognised at all.
- _The guard returns when it becomes correct._ While any package in
  `LINK_PACKAGES` is neither built here nor vendored, an unresolved address is
  still tolerated and the build says so. When the last manifest lands the check
  turns itself on: an address resolving in no package fails. Derived from the
  data, not a flag, so it cannot be forgotten.
- _`FOREIGN_ADDRESS_ALLOWLIST` is superseded._ `check-content-links` consults
  manifests first and stops honouring the list once they are complete, reporting
  every entry as stale to remove.
- _`kethira` is excluded by design._ It publishes no pages and must stay
  withdrawable, so it neither emits a manifest nor is a citable target.
