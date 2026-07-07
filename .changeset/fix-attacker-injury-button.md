---
"sohl": patch
---

**Fix #186:** Attacker-side injury button now emitted when a counterstrike
lands.

`buildCombatCardData` hard-coded `hasAttackInjury: false` with empty
`attackInjuryHandlerUuid`/`attackInjuryScope` on both the main attack card
and the counterstrike (CX) card, so the attacker could never receive an
injury button even when the defender's counterstrike landed a blow.

The fix mirrors the existing defender-side `injuryButton(...)` logic:

- **Main attack card:** `atkInjury = injuryButton(cxImpact, atkResult.token.uuid)` — the original attacker takes an injury when the CX blow lands.
- **CX card:** `atkInjury = injuryButton(cxImpact, attackResult.token.uuid)` — same CX impact, targeting the original attacker's token (now the "defender" on the CX card).

`atkInjury` is `null` when no CX exists or the CX missed, so `hasAttackInjury` stays false in the normal (non-counterstrike) case.
