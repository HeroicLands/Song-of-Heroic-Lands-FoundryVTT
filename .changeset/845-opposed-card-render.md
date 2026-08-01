---
"sohl": patch
---

**Opposed tests render their own card again (#845)**

An opposed test never rendered an opposed card — it posted a plain
`standard-test-card`, dropping the **Respond** button so the flow couldn't be
resumed. Two bugs combined:

- `SuccessTestResult.toChat` re-set `template: standard-test-card` _after_ the
  `...data` spread, clobbering a caller-supplied template. It now defaults to the
  standard card but **honors a caller's `template`**.
- `OpposedTestResult.toChat` ignored its own `data` argument (hard-coding the
  request template), so `opposedTestResume`'s request for the _result_ card was
  dropped. It now honors `data.template` / `data.title` (request vs. result card).

`OpposedTestResult.toChat` now builds **plain, shaped** `sourceTestResult` /
`targetTestResult` data (title, token, item, mastery-level display fields, roll,
outcome flags) plus `sourceWins` / `targetWins` and a `vsText` star string —
required because the delegated `toChat` folds data through `fvttMergeObject`,
which deep-copies and would strip a live result's getters. A public
`SuccessTestResult.item` accessor was added for the shaping.

The opposed-result card's `combatResult` / tactical-advantages section was
**removed**: nothing in the model produces it (opposed tests carry no
`combatResult`), and it held the `soureTestResult` typo. The card shows the two
results, the winner, and the Success Stars, all backed.
