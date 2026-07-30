---
"sohl": patch
---

**Automated combat turn gate + Combat Model doc reconciliation (#384)**

Document SoHL's two combat modes (the user-facing **Combat Basics** guide and the
developer **Combat Model** doc), and correct the divergences surfaced while writing
them.

- **Turn gate enforced.** Automated combat is meant to run off the initiative
  order, but nothing enforced that the attacker be the combatant whose turn it is.
  `SohlCombatantLogic.startAutomatedAttack` (the intrinsic `automatedCombatStart`
  executor both entry points converge on) now aborts, with a UI notice, when the
  attacker is not the active combat's current combatant — via a new pure,
  unit-tested `outOfTurnAttackReason`. Only the current combatant may _start_ an
  attack; out-of-turn **defenses** (a counterstrike, a Tactical-Advantage follow-up)
  run through the defense-resume path and are unaffected.
- **Dead code removed.** `SohlCombatant.startAutomatedAttack` (a document-level
  wrapper whose docstring wrongly called it "the single entry point") had no callers
  and is deleted.
- **Combat Model doc reconciled with the code.** Dropped the "turn-start location
  field-name mismatch" caveat (`startLocation` now recorded, #390) and the
  "`moveFactor` is unapplied" caveat (`computedMove()` now scales `feetPerRound`,
  #393; combatant properties table updated); removed the stale
  `allyIds` / `threatenedAllyIds` relationship-state row (those fields don't exist —
  combat relationships are computed); corrected the assisted-impact description
  (`_onRollStrikeModeImpact` dispatches the actor's `calcImpact`); and fixed the
  `injuryButton` and `SohlCombat` group-seeding JSDoc to match the code. The user
  guide, Combat Model concept doc, and Combat Resolution Pipeline reference now
  describe the turn gate and its defense-side exception.

Closes #384
