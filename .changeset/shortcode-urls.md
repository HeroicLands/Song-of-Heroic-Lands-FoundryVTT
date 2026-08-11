---
"sohl": minor
---

**Content URLs are derived from the shortcode** (#1278)

`(type, shortcode)` is already the system's logical identity and is unique by rule, so
a content note's URL segment is now derived from its shortcode and the authored `slug`
property has been removed from all 1546 notes. A knowledgebase page is
`/<section>/<shortcode>/`, and an item's `system.docUrl` addresses it the same way.

- _Old URLs keep working._ `kb/data/legacy-slugs.json` records the pre-shortcode URL of
  every page, and the knowledgebase build emits a Hugo `aliases` redirect from each.
- _Collisions fail the build._ Two notes that would publish to the same URL — shortcodes
  differing only in case or punctuation — are reported by file, rather than one silently
  overwriting the other.
- _Accented names are addressable again._ The shortcode is transliterated instead of
  having its non-ASCII characters dropped, which is what previously reduced `Ālverrik` to
  `lverrik` and forced a hand-written override.

Heading anchors, developer-doc URLs, pack filenames, and `slugifyShortcode` are
unchanged — none of them is document identity.
