---
"sohl": patch
---

**Wikilinks address a note by `type/shortcode`** (#1281)

A qualified wikilink named the target's top-level content **directory**
(`[[Rules/shock]]`); it now names its **type** (`[[doc/shock]]`) — the same
`(type, shortcode)` identity the rest of the system uses, and one already guaranteed
unique tree-wide by `npm run lint:packs`. All 240 authored links were rewritten.

- _A note can be refiled without breaking its inbound links._ Shortcodes are unique per
  type, not per directory, so the directory never contributed to the address.
- _Routing is derived, not enumerated._ A target's pack comes from its type (`doc` →
  journals, `macro` → macros, `character`/`creature` → actors, everything else →
  items) instead of a hand-maintained directory table. A directory missing from that
  table is what made all 43 container-gear notes unlinkable (#1276); that class of bug
  cannot recur.
- _Unqualified links were rewritten._ 47 links that named a target by prose rather
  than by address are now written in full as `[[type/shortcode|Text]]`.
- A qualifier that names no content type is now reported as `unknown-type` (was
  `unmapped-tld`).

Every resolved link was verified unchanged: 843 `@UUID` references across the compiled
packs, byte-identical before and after — apart from four deliberate corrections.

Auditing the tree turned up five notes squatting on names they do not own, silently
capturing every link meant for the real page. Those names are removed and the
affected links now reach their proper targets:

| Note                              | Names removed                                                  |
| --------------------------------- | -------------------------------------------------------------- |
| _Item: Skill_ (user guide)        | `Combat Technique`, `Combat Techniques`                        |
| _Gear_ (rules)                    | `Weapons`, `Armor`, `Projectiles`, `Containers`, `Concoctions` |
| _Shock_ (rules)                   | `Coma`                                                         |
| _Psychological Condition_ (rules) | `Aural Shock`                                                  |
| _Infected_ (trauma)               | `Infection`                                                    |

A name variant a note genuinely owns is untouched — _Skills_ → `Skill`,
_Afflictions_ → `Affliction`, _The Pall_ → `Pall`.

Closes #1276.
