---
"sohl": minor
---

**Content URLs are derived, not authored** (#1278)

The hand-maintained `slug` property is gone from all 1546 content notes; a page's URL
segment is derived from its name instead. A knowledgebase page is
`/<section>/<name-slug>/`, and an item's `system.docUrl` addresses it the same way.

- _Old URLs keep working._ `kb/data/legacy-slugs.json` records the previous URL of every
  page whose derivation differs from what was authored (120 of 1546), and the
  knowledgebase build emits a Hugo `aliases` redirect from each.
- _Accented names are addressable again._ The name is transliterated instead of having
  its non-ASCII characters dropped — `Nüsvōrroth` yields `nusvorroth` where the old
  slugifier produced `n-sv-rroth`, which is why such pages needed a hand-written slug.
  Ligatures expand as a reader would spell them (`þ`→`th`, `æ`→`ae`, `œ`→`oe`, `ß`→`ss`),
  apostrophes are removed rather than made separators, and a fraction keeps its digits
  together (`Kûrbúl ¾-Helm` → `kurbul-34-helm`).
- _Collisions fail the build._ Two notes in one section deriving the same URL are
  reported by file, rather than one silently overwriting the other.

Shortcodes remain identity — referenced from saved world data — and are deliberately not
the URL. Heading anchors, developer-doc URLs, pack filenames, and `slugifyShortcode` are
unchanged.
