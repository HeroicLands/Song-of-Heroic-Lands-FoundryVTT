---
"sohl": minor
---

**Skill Value Test (#848)**

Adds a human-triggered **Success Value Test** to skills — a success test whose
roll is graded into a **Success Value** (Index + Modifier) and **Success Stars**,
for resolving sustained work (crafting, sailing, research) in one roll rather than
many.

**Special results are data, not code.** The new `successValueTest` intrinsic
action drives the single, well-tested `MasteryLevelModifier.successTest` path with
the skill's `svTable` and a grading `targetValueFunc` supplied in scope — no
bespoke test method. `successValueTest` now posts its card (it previously computed
silently with `noChat`) and marks the result as a Success Value test.

**Standard test card, one presentation.** The result renders on the standard test
card, which now shows the **Success Value** and **Success Stars** rows (its
previously-dormant Success Value block, wired via a serialized `isSuccessValue`
flag on the result) alongside the graded meaning text and the underlying
roll/target/success level. The orphaned `skillvalue-result-card.hbs` (which had no
render site) is removed.

**Wording.** The standard Success Value table's result text — in
`Success_Value_Tests.md` and the `SOHL.MasteryLevel.SvTable.*` strings — was
rephrased in original wording; the mechanic (SV ≤ 0 no value, 1–2 little, 3–4
base, 5–9 = one-to-five Success Stars) is unchanged.
