---
"sohl": minor
---

Cap `bodyScale` at 3, so the largest creatures are hard to wound rather than
impossible to wound
([#1242](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1242)).

Impact grows with Strength at about `STR ÷ 2`, while an unbounded body scale
grew the injury thresholds at `20 × STR ÷ 11` — roughly `STR × 1.8`, some 3.6
times faster. Past a scale of about 3 the thresholds outran every impact the
system can produce, and a creature stopped being merely tough:

- an Old Dragon at its raw 5.45 needed an effective **109** for a Grievous
  injury and **137** to be killed, where the largest impact in the game is its
  own 33-point bite — so two dragons could not kill each other;
- a Lithogiant could not mark one, and neither could a trebuchet;
- the **printed** elephant, at 5.09, was equally unwoundable.

`bodyScale` is now clamped to `[MIN_BODY_SCALE, MAX_BODY_SCALE]` — 0.01 to 3 —
including any Active-Effect delta, so an enlarge cannot lift a being past the
ceiling. A capped body has thresholds `[3, 15, 30, 45, 60]`, which keeps the top
of the range hard but reachable:

| Shot                       | Before | After |
| -------------------------- | ------ | ----- |
| Poleaxe (best hand weapon) | none   | none  |
| Ballista bolt              | M1     | M1    |
| Onager stone               | M1     | M1–S2 |
| Trebuchet stone            | S2     | S2–S3 |

**Natural armour, not body scale, is what makes a dragon proof against swords.**
A hand weapon maxes at 15 impact and still cannot pass a dragon's 28-point hide
whatever the thresholds say; what changes is that a siege engine or a spell that
does get through now wounds in proportion.
