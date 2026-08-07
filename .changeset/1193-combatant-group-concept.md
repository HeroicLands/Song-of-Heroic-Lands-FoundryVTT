---
"sohl": minor
---

**Document what a combatant group is for**

Both the Combat Model dev doc and the Combatant user-guide page described how
combatant groups _work_ — seeding, the `Opponents` fallback, the tracker chip,
the Move to Group… dialog — without ever introducing what a group is or what it
buys. The concept was only ever met in passing, as a property of something else.

- **Combat Model** gains a _Combatant groups_ section ahead of the seeding
  mechanics: a group is a named side scoped to one encounter; allegiance is
  per-encounter rather than a property of the actor; the single rule is
  `areCombatantsEnemies` (different group ids ⇒ enemies, missing group ⇒
  defensively enemy); and the capability it enables is the derived
  `isEnemyOf` / `allies` / `threatenedBy` relations, with `threatenedBy` as the
  engagement question the rules keep asking.
- It also states the boundaries: no leader, no group initiative, no turn
  ordering, and no bearing on who may be targeted — automated combat takes its
  target from the attacking player's targeted token and never consults a group.
- **Current gaps and caveats** now records that the relations have no internal
  consumer: `allies`, `threatenedBy`, `isThreatening`, and `reaches` are
  implemented and unit-tested, but nothing in `src/` reads them, and the
  engagement rules that would (outnumbering, engagement zone) are unbuilt.
- **Combatant (user guide)** gains a _Combat groups_ page covering the same
  ground in play terms, including an explicit note that the sides and threat
  list are computed today but not yet consumed by any rule.
- **Scene, Token, and Combatant Systems** — the _Relationship state_ section
  described stored `allyIds` / `initAllyIds` / `threatenedAllyIds` fields and
  `addAlly` / `addThreatened` mutators that no longer exist; it now describes the
  derived relations that replaced them.

The duplicated one-line explanations in the group-chip bullet, the assignment
paragraph, and the Move to Group… write-up are replaced by cross-references.
