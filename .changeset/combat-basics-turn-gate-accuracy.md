---
"sohl": patch
---

**Automated combat is turn-gated: only the current combatant may start an attack**

Resolves #384. Documents SoHL's two combat modes (the user-facing **Combat
Basics** guide and the developer **Combat Model** doc), and corrects a real
divergence surfaced while writing them: automated combat is meant to run off the
initiative order, but nothing enforced that the attacker be the combatant whose
turn it is.

- **Enforcement.** `SohlCombatantLogic.startAutomatedAttack` (the intrinsic
  `automatedCombatStart` executor both entry points converge on) now aborts, with
  a UI notice, when the attacker is not the active combat's current combatant.
  The check is a new pure, unit-tested helper, `outOfTurnAttackReason`. Only the
  current combatant may _start_ an attack; out-of-turn **defenses** — a
  counterstrike, or a Tactical-Advantage follow-up — are unaffected because they
  run through the `automated*Resume` (defense-resume) path, not this one.
- **Dead code removed.** `SohlCombatant.startAutomatedAttack` (a document-level
  wrapper whose docstring wrongly called it "the single entry point") had no
  callers — both the weapon/technique and combat-tracker entry points dispatch
  the intrinsic action to the logic — so it is deleted.
- **Docs.** The user guide, the Combat Model concept doc, and the Combat
  Resolution Pipeline reference now describe the turn gate (and its
  defense-side exception) instead of the earlier, incorrect "no turn gate" note.
