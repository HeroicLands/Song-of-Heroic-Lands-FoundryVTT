---
"sohl": patch
---

**Automated attack dialog: offer the strike mode it always meant to**

The automated-combat attack dialog was documented as the place the attacker picks
their strike mode, but the template rendered only **Aim** and **Additional
Modifier**. Its result callback then read a `modeIdx` form field that never
existed, so the mode lookup yielded `undefined` and confirming the dialog threw.

- **The dialog now renders a Strike Mode select**, listing every mode able to
  reach the target, pre-selected to the mode this combatant last attacked with
  (or the mode the invoking action supplied), falling back to the best effective
  Attack Mastery Level.
- **The two sides now agree on keying.** `modeChoices` and `defaultModeIdx` are
  both the mode's **index** in the offered list — the same convention the block
  dialog uses — because a strike-mode shortcode is unique only within its own
  weapon, so two weapons can each offer a `swing`. An out-of-range or missing
  selection resolves to the pre-selected mode instead of throwing.
- **`scope.mode` is honoured.** Starting an automated attack from a weapon's own
  action (`StrikeModeBase.automatedCombatStart`) sets `scope.mode`; it is now the
  first preference for the dialog's pre-selection, and the mode used outright when
  the dialog is skipped. Preference order: `scope.mode`, the prior attack result's
  mode, the last-used mode, then best chance.
- Dropped the unused `spread` field from the dialog result — the second form field
  the callback read but the template never rendered; both callers compute spread
  from the chosen strike mode themselves.

Automated Combat remains fenced for the Being-centric beta.

Closes #1080
