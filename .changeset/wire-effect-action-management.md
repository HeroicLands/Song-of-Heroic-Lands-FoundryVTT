---
"sohl": minor
---

**Wire Active Effect and Action management on the item and being sheets**

The effect and action controls on the sheets are now functional, backed by real
document methods — previously the handlers were unwired and the controls had been
removed to avoid shipping dead buttons.

- **Active Effects (both sheets):** create, toggle enabled/disabled, and delete an
  embedded effect from the effect list, plus a per-row context menu (edit /
  toggle / delete). Backed by new `createEffect` on `SohlItem` / `SohlActor` and
  `toggleEnabledState` on `SohlActiveEffect`, wired through the ApplicationV2
  `actions` map on the shared sheet mixin. The effect-row toggle now targets the
  `[data-effect-id]` row (it previously looked for a `.effect` element that does
  not exist).
- **Actions (item sheet):** the item Actions tab now offers the same custom-action
  authoring the being sheet already had — create (bind a world Macro or a fresh
  one), edit the bound Macro, delete, and run (shift-click to skip the dialog).
  Intrinsic actions remain run-only.
- The create/edit/delete/run action logic is consolidated into one shared
  `core/foundry/sheet-actions` helper used by both sheets, so they behave
  identically.

Closes #501
