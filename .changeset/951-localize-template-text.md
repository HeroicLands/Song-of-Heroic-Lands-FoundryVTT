---
"sohl": patch
---

**Localize displayed values and labels in chat cards, dialogs, and action ledgers**

Several templates displayed enum **values** and static **labels** as raw English
or raw i18n keys, so a non-English `lang` saw untranslated text (and one dialog
showed the localization key itself). All English text in the affected templates now
routes through `lang/en.json`.

- **Damage aspect** — the six combat/treatment chat cards (attack, injury, damage,
  missile damage, treatment request, treatment result) now render the localized
  aspect label (e.g. _Edged_) instead of the bare enum value; the two item-sheet
  aspect `formGroup`s gained `localize=true`; and the Perform-Treatment-Test dialog
  now shows localized aspect options rather than the raw `SOHL.ImpactModifier.Aspect.*`
  key strings.
- **Action sort-group** — the Item and Actor _Actions_ ledgers localize the Group
  column value (via the `SOHL.ContextMenu.SortGroup.*` enum) and the column headers.
- **Remaining hardcoded text** — field labels, section legends, buttons, tooltips,
  and note sentences in those templates plus the macro-config dialog are now
  localized. Interpolated strings (subtitles, "Calculate {target} Injury", the
  amputation/shock notes) use `game.i18n.format` placeholders.

New keys are added under `SOHL.Chat.*`, `SOHL.Dialog.*`, and the existing
`SOHL.Actions.*` namespace; no existing keys were renamed. The Node render harness's
`localize` helper now performs the same `{placeholder}` substitution Foundry does,
so interpolated card/dialog text can be asserted in unit tests.

Closes #951
