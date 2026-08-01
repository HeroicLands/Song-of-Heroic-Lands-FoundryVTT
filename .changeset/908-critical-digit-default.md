---
"sohl": patch
---

**Restore critical successes and failures on standard tests**

Standard success tests (attribute, skill, mystical ability) never showed a
critical outcome — every result rendered as a plain _Success_ or _Failure_, even
when the roll ended in `0` or `5`.

`MasteryLevelModifier` had dropped the canonical multiple-of-5 crit-digit default
in the TypeScript port, initializing both `critFailureDigits` and
`critSuccessDigits` to empty lists. With no crit digits, `critAllowed` was always
`false`, so `SuccessTestResult.evaluate()` could only ever produce marginal
outcomes and the plain _Success_/_Failure_ description. Only timed tests, which set
the digits explicitly, crit correctly.

Both lists now default to `[0, 5]`, matching the HârnMaster rule (a roll ending in
a multiple of 5 is a critical — critical success if it succeeded, critical failure
if it failed, and a roll of `100` is a critical failure). A test that wants no
criticals can still pass an explicit empty list.

Closes #908
