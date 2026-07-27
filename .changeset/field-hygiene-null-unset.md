---
"sohl": minor
---

**DataModel field hygiene: drop redundant required-defaults, null-for-unset StringFields** (#762)

Two schema-authoring corrections across the data models (greenfield — no data migration):

- **No field is both `required` and defaulted.** Fields that declared `required: true` alongside an `initial` now drop the redundant `required` — Foundry auto-fills a required field from its `initial`, so a field with a default is not caller-mandatory. Applies to the calendar era name/abbrev fields, scheduled-action `anchor`/`interval`, active-effect change `type`/`value`/`phase`, attribute `maxValue`, and the enum-defaulted `subType`/`aspect`/`potency`/`displayedMedium`/`transmission`/`projectileType` fields. TypedSchema discriminators and `shortcode` are intentionally excluded.
- **Unset is `null`, not `""`.** Optional "not specified" StringFields that used an empty-string sentinel now represent unset as `null` (`nullable: true, blank: false, initial: null`), matching the existing `parentSkillCode` / `Trauma.category` pattern — a cleared form input round-trips to `null`. Converted: affliction `category`/`onsetMacroUuid`/`outcomeTrauma`, the `*DurationFormula` fields (via the shared helper), `skillBaseFormula`, `initDiceFormula`, the `assocSkillCode`/`assocMysteryCode` reference codes, affiliation `society`/`office`/`title`, cohort `leaderName`, armour `material`, the region-trigger `actionName`, and the calendar era `description`. Declared types and logic interfaces are updated to `string | null`.
