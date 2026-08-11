---
"sohl": minor
---

Give every rules section an introduction, and reorganize the rules documents
([#1286](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1286)).

Each rules section now opens with an `_Introduction`, replacing the hub documents
named after their own section (`README`, `Esoterica`, `Skills`, `Trauma`,
`Arcane`, `Divine`, `Spirit`). Those hubs competed with their section's real
content for both the reader's attention and for wikilink targets — `[[Skills]]`
could reasonably have meant either the overview or the skills rules themselves.

**New sections**

Gear (weapons, armour and clothing, containers, miscellaneous equipment),
Characters, Combat, Attributes and Affiliations, each with a journal folder where
it needed one. The Bestiary becomes a section of its own, holding the descriptive
creature notes; `Creatures/` is left to the statted creature notes alone.

**Affiliations**

Described rather than tabulated, since SoHL ships no affiliations of its own —
religions, schools, convocations, guilds and syndicates are setting material. The
introduction covers what an affiliation records, how it differs from a skill, and
what standing means for guilds, religions, arcane convocations, criminal
syndicates and orders. It also states what the level does mechanically: it is the
system's capability credential, holding religious rank and arcane grade rather
than a skill doing so.

**Divine Intervention**

Documented as the one occasion a deity acts directly rather than through an
agent. Deliberately not a Mystical Ability: nothing is performed and nothing
rolled. Grace is the prerequisite, and the gamemaster decides both whether an
intervention occurs and what it costs in Grace. Its deniability is a requirement
rather than a matter of taste — the event must read as certain proof to the
faithful and as coincidence to everyone else.

**Content categories**

Creature notes carry a `sohl.kbcat` naming their group, so the Bestiary tables
build themselves from frontmatter. Folk is split into `grukar` and `goblin`,
which were being listed together under a heading that described neither.

**Fixes**

Nineteen wikilinks that addressed removed documents, or addressed surviving ones
by the wrong shortcode, now resolve. The gear tables addressed `name` — a mapping
of `full` and `aliases` — where they meant `name.full`, so every table in the four
gear documents failed to build; four weapon tables also searched `miscgear` for
categories that live on `weapongear`.
