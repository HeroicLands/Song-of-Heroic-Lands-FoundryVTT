---
"sohl": minor
---

**Type the weapon strike-mode schema and guard strike-mode construction (#512)**

Weapon strike modes were stored in an untyped `ObjectField`, so a strike mode could be persisted with a partial `defense` object. `MeleeStrikeMode`'s constructor then read `data.defense.block.modifier` without a guard, threw during `WeaponGearLogic.initialize`, and aborted the actor's whole data preparation — which Foundry's `_safePrepareData` swallowed, so the weapon's strike modes silently never built and the Combat tab appeared to have none.

- **Root fix:** `WeaponGearDataModel.strikeModes` is now a `TypedObjectField` of the discriminated melee / missile `TypedSchemaField` — the same schemas the combat-technique skill already uses — so every strike mode's sub-fields, including `defense.block` and `defense.counterstrike`, are validated and default to complete values. Partial strike-mode data can no longer be stored.
- **Defense-in-depth:** `MeleeStrikeMode`'s constructor now reads `defense` defensively, so a malformed strike mode degrades instead of crashing the actor's data preparation.
