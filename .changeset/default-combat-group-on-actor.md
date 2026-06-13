---
"sohl": minor
---

**Default Combat Group moves from a token flag to the actor**

The combatant group an actor auto-joins when it enters combat is now a typed
`defaultCombatGroup` field on the actor data model, set on the actor sheet's
**Combat** tab (GM-only), instead of a `flags.sohl.defaultCombatGroup` token
flag.

- `SohlCombat`'s combatant-group seeding reads `actor.system.defaultCombatGroup`;
  blank still falls back to the default group (`Opponents`).
- The Token / Prototype-Token config field is removed; the value is edited on
  the actor. TokenDocument has no typed system data, so the actor (which exists
  before the combatant) is the better-integrated, pre-configurable home.

_Note:_ any value previously set via the old token field is not migrated — set
the actor's Default Combat Group instead.
