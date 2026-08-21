---
"sohl": patch
---

Fail the build when a vendored link manifest cannot be addressed (#1664)

A cross-package `[[type-shortcode]]` is resolved through a key this build
derives, and the manifest is written with a key the _publishing_ build derives.
When those shapes drift apart the lookup cannot match on any input — and because
an unresolved wikilink falls through to its own display text, every page still
reads correctly and nothing reports a thing.

**What changed**

- `unaddressableForeignPackages` reports any foreign package that contributes
  manifest entries of which _none_ yields a readable canonical key, and both
  `build-kb-content` and `check-content-links` now fail on it. Partial drift is
  deliberately not reported: it resolves something, and the rest surfaces as an
  ordinary dead address pointed at the note that cites it.
- The finding is reported through `lint-diagnostics` as
  `file:line:column: error: message`, locating the offending key in the manifest
  itself, so the diagnostic names the file at fault rather than the notes that
  cite it. The position is dropped rather than guessed when the key cannot be
  located.
- Removed the dead slash-splitting type seeding left behind in
  `check-content-links` when keys became canonical; foreign types are seeded
  from the manifest entries themselves.

A manifest that publishes no entries is not a finding — a pack-only package
publishes no addressable pages by design, and one being brought up publishes
nothing yet.
