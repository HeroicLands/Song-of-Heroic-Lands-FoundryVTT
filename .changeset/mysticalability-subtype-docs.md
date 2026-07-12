---
"sohl": patch
---

**Docs: define each `MYSTICALABILITY_SUBTYPE` value, and fix its display labels**

The twelve mystical-ability subtypes (`SHAMANICRITE`, `SPIRITACTION`, `BENEDICTION`, …)
had no definition anywhere: not in TSDoc, not in `lang/en.json`, not in consuming code.
The constant is part of the published API (every `src/**/*.ts` export is bundled into the
TypeDoc entry point), so readers saw twelve bare identifiers with no explanation.

Each value now carries a one-line TSDoc comment naming its realm (Arcane, Divine, Spirit)
and what distinguishes it from its siblings. TypeDoc renders these as a member table on
the `MYSTICALABILITY_SUBTYPE` page.

Two localization defects are fixed at the same time:

- `SOHL.MysticalAbility.SubType.BIRTHSIGN` was **missing entirely**. Because
  `MysticalAbilityDataModel` builds its `subType` dropdown from these keys, a Birthsign
  ability rendered its raw localization key in the sheet.
- The other eleven labels were mechanical title-case of the identifier — `"Shamanicrite"`,
  `"Spiritaction"`, `"Divineincantation"`. They are now properly spaced (`"Shamanic Rite"`,
  `"Spirit Action"`, `"Divine Incantation"`), taken from the long-unused
  `SOHL.MysticalAbility.Category.*` strings.

Localization **keys** are unchanged; only the English display strings and the TSDoc move.
