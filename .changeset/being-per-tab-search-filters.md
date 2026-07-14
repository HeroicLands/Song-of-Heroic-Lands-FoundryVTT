---
"sohl": patch
---

**Being sheet: working per-tab search filters, and fix the search normalizer that hid every row**

Resolves #312. The Being sheet's list tabs now have live search-criteria inputs
that filter their lists as you type.

- **New inputs.** Adds the missing `search-criteria` boxes on the **Profile**
  (traits) and **Mysteries** (mysteries and mystical abilities) tabs. Each list's
  groups are wrapped in a single filter container so the search spans _all_
  subtype groups, not just the first — matching the existing Skills / Combat
  body-locations / Gear inputs.
- **Filtering actually works now.** `SohlLocalize.normalizeText` used a
  non-negated character class (`/[%\x20-\x7E]/`) that matched _printable ASCII_
  and blanked every letter to a space, so the regex comparison never matched and
  every list-search filter hid all rows on any query. Negating the class
  (`/[^\x20-\x7E]/`) folds only non-ASCII characters, as the docstring intends;
  this repairs search across all tabs (Skills, Gear, body-locations, effects,
  and the new Profile/Mysteries inputs).
- **Trauma tab has no search** (injuries and afflictions), by design — the
  previously-scaffolded afflictions search input and its filter registration are
  removed; the affliction create-control is kept.

Covered by a new `normalizeText` unit suite (the ASCII-folding regression) and a
`being-search-filters` e2e spec (traits filter live across groups; the Mysteries
inputs render; the Trauma tab exposes no search).
