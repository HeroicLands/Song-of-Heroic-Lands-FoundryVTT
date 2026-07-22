---
"sohl": minor
---

**`sohl.addScriptAction` — programmatic Script Action attach**

Add the last owed API from the generic-scheduler epic (#588, deliverable §7): a
clean, first-class way to bind a Foundry Macro to a host document as a SCRIPT
action, so a module or macro can attach an action and then schedule it — without
hand-rolling the full `system.actionDefs` shape.

- **`sohl.addScriptAction(doc, spec)`** — sibling of `sohl.schedule` /
  `sohl.unschedule` / `sohl.worldHost`. Takes a minimal spec (`{ name, executor }`
  plus optional `title` / `scope` / `iconFAClass` / `group` / `minActorOwnership`
  / `trigger` / `visible`), fills the same sensible defaults as the sheet's
  "create action" control, and persists by writing the whole `actionDefs` array
  (upsert by identity, never by index).
- **`name` is the identity.** It becomes both the action's `shortcode` — what
  `sohl.schedule(doc, name, …)` and the `[Perform]` reminder address — and its
  default `title`. Re-attaching the same `name` **replaces** the entry rather than
  duplicating it, so an init hook is safe to run on every reload.
- **`executor` is a Foundry Macro UUID** — a reference, never inline code.
  Authoring is GM-gated (the same rule `SohlActor` / `SohlItem` enforce at the
  persist boundary) and execution runs through `Macro#execute`; this assembles and
  persists the reference only, compiling nothing.

With this, the charter's "Check For Bandits" worked example runs end to end:
`sohl.worldHost()` → `sohl.addScriptAction(world, { name, executor })` →
`sohl.schedule(world, name, 4*3600, { visibility: "gm" })` yields a recurring,
GM-hidden `[Perform]` reminder that survives reloads and runs the Macro on click —
with no core schema change.

Closes #605.
