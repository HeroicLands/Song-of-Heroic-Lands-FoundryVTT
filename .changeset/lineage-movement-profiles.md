---
"sohl": minor
---

**Lineage: expression-driven movement-profile paradigm**

The Lineage item replaces its flat `encumbranceRate` / `bodyWeightBase` scalars
with a data-driven, per-medium model:

- **`movementProfiles`** — one entry per movement medium, each carrying
  `feetPerRound`, `leaguesPerWatch`, and `SafeExpression`s for `encumbrance`
  (of carried weight `wt`) and `strMod` (of `str`).
- **`personalFatigue`** — a `SafeExpression` of encumbrance (`enc`).
- **`bodyWeight`** — either a fixed `base` (pounds) or, when `base` is null, a
  `SafeExpression` `calc` of the being's strength (`str`).

`LineageLogic` gains a **`baseWeight`** getter that returns `bodyWeight.base`
when set, otherwise evaluates `bodyWeight.calc` against the owning being's `str`.
The per-medium `moveBase` scalar (which Active Effects target and the movement
system reads) is mirrored from each profile's `feetPerRound` during export, so
compendium lineages no longer ship an empty `moveBase`.

The pack exporter and the Human Folk compendium source are updated to the new
format. Supersedes the interim `encMod` carry-capacity field.

Closes #365
