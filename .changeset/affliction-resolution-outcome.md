---
"sohl": minor
---

**Affliction resolution outcome (outcome + outcomeTrauma)**

When an affliction reaches the end of its symptomatic period without being
defeated (Healing Rate below 6), its authored **outcome** is now applied. Two new
fields:

- **`system.outcome`** (`AFFLICTION_OUTCOME.DEATH` | `CURED`, default `cured`) —
  `DEATH` sets the being's shock state to Dead; `CURED` sets Healing Rate to 6.
- **`system.outcomeTrauma`** (optional) — a `SafeExpression` evaluating to a trauma
  shortcode, or an array of shortcodes, the host contracts as part of the outcome.
  Matches are resolved world-items-first, then compendiums, via a new
  `fvttFindItemByShortcode` shim.

The two combine (e.g. `CURED` + `outcomeTrauma: "'weakness20'"` cures the
affliction but adds the `weakness20` trauma). See House Rules Cookbook (Recipe 5)
for authoring. Part of #548. Closes #490
