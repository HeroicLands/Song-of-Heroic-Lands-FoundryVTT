---
"sohl": minor
---

Add the eight unarmed combat techniques, and arm everyone who fights with their
hands
([#1228](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1228)).

No character carried the techniques every person has. A pregen could pick up a
sword, but had no way to punch, kick, grab or trip with one.

Eight new `combattechnique` skills under
`assets/content/Skills/Combat/Unarmed/`, one per row of the unarmed table:

| Technique  | LNG |  ZD | Impact  | Notes                   |
| ---------- | --: | --: | ------- | ----------------------- |
| Bite       |   0 |  d2 | `d4+0P` | Impact TA 3             |
| Grab       |   1 |  d4 | —       | Strength roll           |
| Headbutt   |   0 |  d4 | `d6-2B` |                         |
| Kick       |   2 |  d4 | `d6-2B` | Low aim                 |
| Limb Block |   1 |   — | —       | The one unarmed defence |
| Press      |   1 |   — | —       | Strength roll           |
| Punch      |   1 |  d4 | `d6-3B` | Impact TA 2             |
| Trip       |   2 |   — | —       | Strength roll           |

All are resolved by the **Melee** test, so each strike mode names `melee` as its
governing skill rather than opening a mastery level of its own. Each carries
Limb Block excepted, they counterstrike but cannot block — blocking bare-handed
is Limb Block's whole job, and it never attacks. Each is impaired by the body
role that wields it, so a wounded arm degrades a punch and a wounded leg a kick.

The Grab, Press and Trip manoeuvres resolve by an opposed `d6 + STR` roll after
the Melee test, with their margin tables written into each entry.

They are carried by all four pregenerated characters, both goblins, all four
Grukar and both Helspawn. The Grukar previously had a bespoke Punch whose impact
was baked from their own Strength; that is replaced by the shared one, since the
table gives every person the same fist and expects Strength to reach impact by
its own route.
