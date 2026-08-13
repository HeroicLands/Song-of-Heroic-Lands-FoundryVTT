---
"sohl": patch
---

**626 localization keys that nothing consumes are removed** — `lang/en.json` goes from
2430 to 1804 keys. A translator localizing SoHL today would have translated hundreds of
strings that render nowhere.

Largest blocks: `SOHL.BodyLocation.*` (128) and `SOHL.BodyPart.*` (41), a
per-shortcode name mechanism with zero call sites — parts and locations are named by the
literal `name` field baked into the compendium; the `defineType` byproducts
`SOHL.Affliction.CODE.*` (65), `SOHL.Skill.CODE.*` (64) and `SOHL.Attribute.CODE.*` (14),
whose bundles are consumed as `kind`/`values` only; `SOHL.SuccessTestResult.tests.*` (24)
and `SOHL.CombatResult.tests.*` (8), superseded by the per-namespace `*.Action.*` keys;
and the terrain enums `SOHL.Biome` (28), `SurfaceCover` (17), `Topography` (6),
`Hydrology`, `MovementFactorScope` (8), none of which has a consumer.

**Method.** Deadness was established three ways, because no single one is sufficient:
concrete literals and _whole-shape_ dynamic references (`` `SOHL.Calendar.Vylarian.Month.${i}.label` ``
matches only `SOHL.Calendar.Vylarian.Month.<seg>.label`, not all of `SOHL.*`);
`utils/check-lang-coverage.mjs` as an oracle, deleting candidates and restoring
everything it proved a consumed `defineType` bundle or a concrete reference still needs;
and the test suite, which caught four families no static analysis could see.

**Deliberately retained**, because they are reachable only through a _variable_ prefix
or by Foundry itself: `TYPES.Item.*` / `TYPES.Actor.*` (core reads these directly for the
sidebar and create dialog), every `SOHL.<Namespace>.Action.*` title (built as
`` `${titlePrefix}.${shortcode}` `` by `defineImproveSdrActions` and friends),
`SOHL.ContextMenu.SortGroup.*`, `SOHL.Being.StumbleTest.*` / `FumbleTest.*`, and
`SOHL.Reminder.effect.*`.

`kb/dev-docs/reference/body-structure.md` is corrected: it described the removed keys as
a live "parallel mechanism" and told authors to add one per new part or location. It now
says the literal `name` is the only name the system reads, and distinguishes the
`*.FIELDS.*` keys that remain — those label the config apps' form fields, not the parts.

(Closes #1349.)
