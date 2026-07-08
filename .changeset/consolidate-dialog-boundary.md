---
"sohl": patch
---

Fix logic-level dialogs on Foundry v14 and consolidate the dialog helpers into one primitive.

On Foundry v14, `DialogV2.input` only invokes a callback supplied under
`ok.callback`, so the callback the old `inputDialog` passed at the top level was
silently ignored — every form dialog (Add Injury, attack/defense, success test,
the DataModel array/key-value editors) resolved to raw, untransformed field data
instead of the caller's result.

The four near-duplicate helpers (`inputDialog`, `okDialog`, `yesNoDialog`,
`awaitDialog`) are replaced by a single logic-level `dialog()` primitive. It owns
all Foundry/DOM work — template rendering, `FormDataExtended`, and `DialogV2` — at
the boundary and hands callers a pure `callback(formData, action)` that receives a
plain object, plus an optional `render(element)` hook for dynamic form behaviour
(e.g. dependent dropdowns). Logic-layer callers no longer reference
`FormDataExtended`, `querySelector`, or `DialogV2` at all. (#282)
