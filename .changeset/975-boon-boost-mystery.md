---
"sohl": minor
---

**Boon and Boost skill-affecting Mystery subtypes; birthsign relocation**

Two new source-agnostic, skill-affecting Mystery subtypes, replacing the dead
`blessing` and the mislabelled `buff`:

- **`boon`** — a flat `±N` modifier to an associated skill's mastery level (EML),
  from any source.
- **`boost`** — one or more temporary mastery boosts to an associated skill via
  the Mastery Boost table.

Both effects are **live-derived**: the Mystery resolves its target skill via
`assocSkillCode` and, while active (a present, non-zero level), contributes a
delta onto the real skill's `MasteryLevelModifier` each prepare cycle. Nothing is
persisted, so the effect applies only while the Mystery is present and **reverts
automatically** when it lapses. The Mystery's `level` carries the magnitude —
`±N` for a Boon, the boost count `N` for a Boost.

The **birthsign** Skill-Base contribution now keys off the `birthsign` subtype
(previously mislabelled `buff`). `MYSTERY_SUBTYPE` **adds** `boon`/`boost` and
**removes** `blessing`/`buff` (pre-Beta — no migration). The Mastery Boost table
(`calcMasteryBoost`) is lifted from `SkillLogic`'s private scope into a shared
Foundry-free `masteryBoost` module and reused by the Boost logic.

The absent-skill Boost path — conferring a skill the character lacks as a
transient, rollable skill — is deferred to a later, spike-gated phase; the boost
arithmetic for it lands here (`computeBoostContribution`) and is unit-tested.

Closes #975
