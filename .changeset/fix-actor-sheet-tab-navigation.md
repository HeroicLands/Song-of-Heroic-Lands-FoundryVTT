---
"sohl": patch
---

**Repair actor sheet tab navigation**

The Being actor sheet crashed on render with _"Template part 'tabs' must render
a single HTML element"_ because its `tabs` part still pointed at the empty
`being/tabs.hbs` stub left behind by the earlier Legendary consolidation, while
the other actor sheets had already migrated to Foundry's built-in
`templates/generic/tab-navigation.hbs`. The Being part now uses the same core
navigation template and the dead stub is removed.

Fixing the crash also surfaced a latent issue shared by **all** actor sheets
(Being, Cohort, Structure, Vehicle, Assembly): their tab content sections were
missing the `data-group` attribute and the `active` class that ApplicationV2 tab
switching and the core `.tab[data-tab]:not(.active) { display: none }` rule rely
on, so every tab body rendered hidden.

- `SohlActorSheetBase._preparePartContext` now exposes the prepared tab
  descriptor as `context.tab` for each part (mirroring the working effect
  sheet), so content sections can resolve their `active` state and tab group.
- Every actor tab section (`being/*`, the shared `parts/*`, and `cohort/members`)
  now emits `data-group="{{tab.group}}"` and toggles the `active` class.
