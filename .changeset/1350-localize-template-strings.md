---
"sohl": patch
---

**The system is now actually translatable: every user-visible string in every
template is a localization key.** A translator who translated all of `lang/en.json`
would previously still have seen English across the Being sheet's combat, profile,
trauma and print tabs, the body-structure and strike-mode config apps, the gear and
effects ledgers, and a dozen chat cards — because those strings had never become keys
at all. A scan of `templates/**` found **516 hardcoded English literals across 61
templates**; all of them are keys now.

**The unreachable `FIELDS` groups.** `SOHL.StrikeMode.FIELDS.*`,
`SOHL.MeleeWeaponStrikeMode.FIELDS.*` and `SOHL.MissileWeaponStrikeMode.FIELDS.*` were
written in Foundry's auto-localization convention but sat under a namespace no
`LOCALIZATION_PREFIXES` declares, so nothing ever read them while
`strike-mode-config.hbs` hardcoded the same words. The config app now reads those keys.
`SOHL.Encounter.*` (35 keys — the feature does not exist in `src/`) and
`SOHL.Action.FIELDS.*` (35 keys — `SohlAction` is a `SohlEntity`, never a DataModel, so
Foundry could not auto-localize them and no surface reads them) are deleted; the live
`SOHL.Action.*` vocabulary is unaffected. `SOHL.Scene.FIELDS.*` needed no change — the
scene tab reads it with an explicit `localize`.

**Reuse over restatement.** Where a label already existed it is reused rather than
duplicated: gear columns resolve through `SOHL.Gear.FIELDS.*`, skill headings through
`SOHL.Skill.Heading.*`, aspects through `SOHL.ImpactModifier.ASPECT.*`, trauma columns
through `SOHL.Trauma.COLUMN/COLTIP.*`. Genuinely generic words (`None`, `Menu`,
`Expand`, `Drag to reorder`) now have one home in a new `SOHL.Common.*` namespace.
Displayed English is unchanged except where the print sheet and the combat tab used
different tooltip wording for the same column, which is now unified.

New keys follow the standard published in #1351: singular PascalCase concept
namespaces, PascalCase group segments, camelCase leaves, single-braced `{camelCase}`
placeholders.

A guard (`tests/guards/template-localization.test.ts`) walks the direction
`lint:lang-coverage` cannot — **UI text → key** — and fails on any user-visible literal
left in a template, with a short justified allowlist. It also compiles every template,
because the easy way to break one while localizing it is to nest `{{localize …}}`
inside another mustache (legal in an HTML attribute; a parse error inside a helper's
hash, where a `(localize …)` subexpression is required).

(Closes #1350.)
