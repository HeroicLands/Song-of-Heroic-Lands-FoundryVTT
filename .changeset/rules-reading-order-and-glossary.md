---
"sohl": patch
---

**The rules open with a reading order, and close with a glossary** (#1295)

The rules root note was an index of ten sections in no particular order: it said what
existed, not what to read first, and nothing stated the scope of the rules or the
boundary between them and the tabletop that runs them. It is now the front matter of a
book.

- _A reading path._ The ten chapters are presented in the order they should be read,
  each with a sentence on what it covers and why it sits where it does — Resolution
  first, because every later chapter is written on the terms it defines, then
  Attributes, Skills, Affiliations, Characters, Gear, Combat, Trauma, Esoterica and the
  Bestiary.
- _Scope, stated._ What the rules cover, and the two things deliberately absent: setting
  material, which belongs to a world and none is assumed, and the finer procedures of a
  long campaign.
- _The rules/VTT boundary, stated._ These pages describe the game as it happens at a
  table. How the Foundry implementation is operated belongs to the User Guide, and
  where the two ever differ, **the rules are what the game is** and the implementation
  is what needs fixing.

**A Glossary** (`Rules/Glossary.md`) indexes every term the rules define — 120 entries,
alphabetical — each pointing at the single passage that settles it. It is an index of
links, not a second set of definitions, so a term can never drift from its definition:
a reader who meets _Index_, _Value Diamonds_ or _Tactical Advantage_ mid-chapter now has
somewhere to look it up.

**Every rules document is reachable from the root.** `Bestiary/Helspawn.md` had no
inbound link — it compiled and published, but could not be arrived at by reading — and
the Bestiary introduction now links it the way it already links Grukar.

**The walk is committed as a lint.** `npm run lint:content-links` (part of
`npm run lint`) resolves links exactly as the two content builds do, with generated
tables expanded first — and fails on either of two defects that both builds pass
silently:

| Defect                                        | Why it survives the build                                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| A `#anchor` link that no heading declares     | The journal compiler derives a page id by hashing `"<noteId>-<anchorSlug>"`; it never checks that a heading declaring it exists |
| A `Rules/` document unreachable from the root | An unlinked note still compiles and still publishes; it is simply unreachable by reading                                        |

The walk stops **at** the glossary rather than through it: an index links to nearly
every page, so following it would make the reachability check vacuous.

The anchor check found exactly the pair already reported — two links in _Item:
Weapongear_ pointing at `doc/skldesc#combat-techniques`, an anchor _Skill Descriptions_
never declared. Both now point at `doc/unrmdcmb#combat-techniques`, where Combat
Techniques are in fact defined.

Closes #1295.
Closes #1297.
