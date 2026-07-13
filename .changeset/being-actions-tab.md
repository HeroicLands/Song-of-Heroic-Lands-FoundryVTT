---
"sohl": patch
---

**Being Actions tab**

Reimplements the Actions tab of the Being sheet (#313).

- **Grouped display.** Actions from `logic.actions` are split into a **Custom
  Actions** section (GM-authored script actions) and an **Intrinsic Actions**
  section (code-defined, read-only). Hidden-group actions (lifecycle hooks) are
  omitted.
- **Create bound to a Macro.** The create control prompts for an existing world
  Macro to bind — or `<New Macro…>`, which opens Foundry's own Macro-create
  dialog — then appends a SCRIPT action (referenced by the Macro's UUID) to
  `system.actionDefs`.
- **Edit / Remove / Run.** Each custom action row can open its bound Macro's
  sheet (Edit), remove the action from `system.actionDefs` without deleting the
  Macro (Remove, confirmed), or run it. Intrinsic actions can be run.

Macro authoring is deferred entirely to Foundry's Macro UI; this only builds the
action list and the bind/edit/remove/run controls.
