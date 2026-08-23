---
"sohl": patch
---

Moves to `@heroiclands/package-build` 0.5.0, which deleted its `text.mjs` —
a second implementation of the line-and-column arithmetic
`@heroiclands/content-build` already owns. Nothing here imported it after the
diagnostics barrel went, so this is the version bump alone.
