---
"sohl": minor
---

**Follow-up action buttons on the standard test result card**

The standard success-test card (`standard-test-card.hbs` /
`SuccessTestResult.toChat`) can now carry arbitrary follow-up **consent
buttons**, the same way the action-card framework does. `toChat` accepts an
optional `buttons` entry (one button or an array) in its data and folds it
through the shared `toRenderableButtons` normalizer — scope pre-serialized,
`skipDialog` defaulted — so each button renders with the well-known
`action-card-button` handles (`data-action` / `data-handler-uuid` /
`data-scope` / `data-skip-dialog`) and dispatches through the existing
chat-card chokepoint. Buttons are offered, not fired: the target's controlling
player accepts.

Combined with `scope.successStarTable` (which already lets the single generic
`successTest()` produce any bespoke result _mapping_ as data), a graded success
test is now `successStarTable` (result mapping) **+** `buttons` (follow-up
actions) — removing the last reason several bespoke result cards had to exist.
The existing edit-pencil and _Perform Fate Test_ buttons are unchanged.

`toRenderableButtons` (and its `RenderableButton` type) are now exported from
`action-card.ts` so the card and the framework share one normalizer.

Closes #853
