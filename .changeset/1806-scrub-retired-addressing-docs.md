---
"sohl": patch
---

**Developer docs describe the addressing the build actually performs** (#1806)

`kb/dev-docs/` still described page URLs as derived from `name.full` through a
`contentSlug`, guarded by a `findSlugCollisions` uniqueness check, with a
`kb/data/legacy-slugs.json` redirect table behind them — and wikilinks as resolving
against an alias namespace each note fed from a top-level `aliases:` field. None of
that machinery exists.

- _A URL is stable._ The pages said the opposite: _"A URL is presentation, and it is
  not kept stable. A rename changes the page's address."_ A page's URL **is** its
  address, `/<package>/<type>-<shortcode>/`, built from identity — so it survives
  every rename, and there is nothing to redirect from.
- _`slugify` is re-pointed, not deleted._ Its transliteration rules still hold — `þ`→`th`,
  `æ`→`ae`, apostrophes elided rather than made separators, a fraction keeping its digits
  together — for **heading anchors** and **pack filenames**, which is what it now serves.
- _Every wikilink is qualified._ The bare `[[Text]]` form and the alias index are gone,
  and a note authors no top-level `aliases:` — the build refuses one. The nested
  `name.aliases` is documented as reserved and unread. `lint:addresses` is described by
  the three rules it actually enforces.
- _Content is edited here._ Passages phrased around an Obsidian vault and an export into
  `assets/content/` are stated as the direct authoring they now are.
- _Build tooling._ Seven `utils/` scripts listed in the build reference no longer exist.
