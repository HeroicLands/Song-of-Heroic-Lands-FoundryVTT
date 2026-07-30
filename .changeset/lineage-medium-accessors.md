---
"sohl": minor
---

**Per-movement-medium data accessors + ground-up carried weight**

Adds medium-aware read accessors to the being's movement logic, each taking an
optional `medium` that defaults to `defaultMoveMedium`:

- `getMoveBase(medium?)` — the persisted per-medium `moveBase` scalar.
- `getFeetPerRound(medium?)` / `getLeaguesPerWatch(medium?)` — the matching
  movement profile's tactical / travel speed.
- `getEncumbrance(medium?)` — the profile's `encumbrance` `SafeExpression`
  evaluated against the being's carried weight (`wt`).
- `getStrMod(medium?)` — the profile's `strMod` `SafeExpression` evaluated
  against the being's strength (`str`).

The expression accessors read context from the owning being; with no owning
being (or no strength attribute), `str`/`wt` default to `0`, and a missing
profile yields `0` — the accessors never throw.

Introduces a ground-up **carried-weight** mechanism: each carried gear item adds
its `weight × quantity` to the owning being during its own `evaluate()` phase,
exposed via a new **`BeingLogic.carriedWeight`** getter (reset each prepare
cycle). The `getEncumbrance` accessor reads it for `wt`.

Closes #367
