---
"sohl": patch
---

**Knowledgebase breadcrumbs and the `package` table column render again.**
`@heroiclands/package-build` moves from 3.3.0 to 3.4.0 (#1751).

Stripping the authored `package:` frontmatter (#1745) left the site build with
nothing to emit: 3.3.0 _derives_ a note's package but does not write it into the
page it emits, so all 1,606 generated pages went out without one. The theme
resolves both the breadcrumb's middle crumb and the content tables' `Package`
column through that value, so both fell back to nothing — the crumb degraded to a
bare, unlinked type slug and the column rendered empty. HeroicLands/package-build#65
writes the derived package into each emitted page.

Rendered, for `kb/mysticalability/spirit/`:

|        | Middle crumb                                                          |
| ------ | --------------------------------------------------------------------- |
| Before | `<li>mysticalability</li>`                                            |
| After  | `<li><a href=/sohl/kb/mysticalability/>SoHL Mysticalability</a></li>` |

and the `Package` cell of the `containergear` table goes from `<td></td>` to
`<td>sohl</td>`.

**Compiled mystical abilities lose `assocMysteryCode`.** The builder stopped
emitting the field (HeroicLands/package-build#63) — this is the pack-side half of
#1746, which removed it from the nine notes that authored it and recorded that the
builder's own default was still being emitted. `MysticalAbilityDataModel` has not
declared it since #973, so Foundry was discarding the key on construction and no
behaviour changes; the compiled JSON now simply stops carrying it. 104 occurrences
across 9 mystical-ability items and 94 actors are the _only_ change to
`build/packs-json` — the other 3,022 documents are byte-identical, and document
counts are unchanged (1,379 items, 1,511 journals, 95 actors, 1 macro, 3 scenes,
1 adventure).

`content-creator/item-frontmatter.md` is regenerated accordingly, dropping the
`assocMysteryCode` row from the mystical-ability field table.
