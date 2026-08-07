---
"sohl": patch
---

**Test cards and the standard test dialog no longer show raw localization keys**

Two display strings on every standard success test reached the screen as their
untranslated `SOHL.*` key.

- **Card title (#1107).** `MasteryLevelModifier` built its default title by
  formatting `SOHL.MasteryLevelModifier.successTest` — a _namespace_ holding
  `.title` / `.dialogTitle` / `.dialogLabel`, not a string — so `format()`
  returned the key verbatim and the card header read
  `SOHL.MasteryLevelModifier.successTest`. It now formats
  `…successTest.title`, and the header reads the test's name (_Strength Test_,
  _Fire Dart Test_). No key was renamed.
- **Modifier breakdown (#1127).** `ValueModifier.chatHtml` emitted each delta's
  stored `name`, which is a localization key by convention across the system
  (`SOHL.MOD.*`, `SOHL.MysticalAbility.*`, …), so every Adjustment row on a test
  card **and** in the standard test dialog showed the key instead of its label —
  e.g. `SOHL.MysticalAbility.LevelPenalty` rather than _Level Penalty_. The new
  `ValueDelta.label` getter localizes the name at render time (the treatment
  `disabledReason` got in #948) and the breakdown uses it. Escaping still runs
  **after** the lookup, so a delta named with crafted markup — which localizes to
  itself — stays inert. The stored `name` and its serialized form are unchanged.

Regression coverage asserts the real rendered card HTML: the header is prose and
not a `SOHL.` key, and the Adjustment block carries no key at all.

Closes #1107
Closes #1127
