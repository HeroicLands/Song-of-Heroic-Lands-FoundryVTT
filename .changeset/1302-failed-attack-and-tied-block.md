---
"sohl": patch
---

**A failed attack no longer lands, and a tied block now wards the blow.**
`CombatResult.attackerLandsBlow` decided the outcome purely from the victory
score, so an attack that missed still arrived whenever the defence blundered
worse — and a block that tied was treated as beaten rather than as the ward it
is.

Both conditions of the written rule are now enforced, in this order:

- **The attack test must have succeeded.** Previously only _Ignore_ checked it;
  Block, Counterstrike and Dodge all landed a failed attack on a favourable
  margin. A marginal-failure attack against a critical-failure defence is a
  miss, not a hit.
- **The attack must out-level a Block** (`VS > 0`). A tie is the blocker's, and
  is precisely what its weapon-break check exists for — so that check now fires
  only when there was a blow to absorb, not on a tie between two failures.

Counterstrike (`VS >= 0`, since a counterstrike wards nothing) and Dodge (win
outright, or take the tiebreak on the higher roll) keep their margins.

(Closes #1302.)
