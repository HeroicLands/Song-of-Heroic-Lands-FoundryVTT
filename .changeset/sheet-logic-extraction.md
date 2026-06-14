---
"sohl": patch
---

**Move pure view-model logic out of sheet classes into Foundry-free modules**

Fixes [#117](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/117).

Pure data-shaping that had been written inline inside Foundry sheet classes — where
it was excluded from test coverage and sat outside the Foundry-free boundary guards
(the ESLint logic-zone rule and the purity test) — moves into co-located `*-view`
helper modules under each document's `logic/` directory, each with unit tests. The
sheets keep only their Foundry-facing orchestration. No user-facing behavior change.

_BeingSheet_ → new `being-sheet-view.ts`: `groupBySubType` (replacing five inline
copies across skills, traits, afflictions, mysteries, and abilities),
`buildContainerTree` (the gear hierarchy and virtual "On Body" list),
`buildStatusPills`, `buildBodyPartLozenges`, `clampHealthPct`, and
`splitWeaponsByRange`. The in-sheet `fvttEnrichHTML` proxy is replaced with a direct
`TextEditor` call (the proxy exists for the logic layer, not for sheets).

_SohlItemSheetBase_ → new `item-sheet-view.ts`: `localizeSubType` (subtype-label
localization with raw fallback), `keyTransferredEffects` (enabled transferred
effects keyed by id), and `findSimilarItem` (the name/type/subtype match behind
overwrite-on-drop). The sheet keeps the Foundry-facing drop dialog and mutation.

_SohlActiveEffectSheet_ → new `effect-sheet-view.ts`: `buildChangeTypesMap` (the
localized change-`mode` label map), `resolveEffectMetadataType` (scope → effect-key
namespace), and `resolveEffectKeyChoices` (its `ITEM_METADATA` key-choices lookup).

_Settings apps_ → new `src/apps/logic/domain-manager-view.ts` (`buildDomainGroups` —
group by family, sort, and compute delete/override flags) and
`src/apps/logic/calendar-settings-view.ts` (`buildCalendarViewModel` — the calendar
dropdown rows and imported-calendar list, taking a `localize` callback). The new
`src/apps/logic/**` directory is added to the Foundry-free zones (the ESLint
boundary rule and the purity smoke test).
