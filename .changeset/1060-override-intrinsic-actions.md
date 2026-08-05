---
"sohl": minor
---

**A Script Action overrides the intrinsic action with the same shortcode**

A GM can now replace a built-in (intrinsic) action with their own house rule by
adding a Script Action whose `shortcode` matches it. The script _wholly overrides_
the intrinsic — the context menu, the default action, and `executeAction` all
resolve only the script; the system never runs both.

- **Deterministic merge, script wins.** `SohlLogic` now deduplicates intrinsic and
  script action definitions by `shortcode` before building `actions`, so a shadowed
  intrinsic is never constructed into the live set nor exposed to default-action
  selection — replacing the previous incidental, Map-ordering-dependent behavior.
- **One context for every executor.** Every executor — an intrinsic method or a
  Script Action's macro — now receives the same single argument, the
  `SohlActionContext`, exposed to the macro as `ctx`. The context carries a new
  `thisLogic` field: the Logic the action runs on, the exact target an intrinsic
  method is bound to (so inside an intrinsic, `this === ctx.thisLogic`).
- **Building on the intrinsic.** The intrinsic's capability is the executor method
  on the Logic (e.g. `toggleCarried`), untouched by the override. An overriding
  macro that wants to extend rather than replace it calls that method through the
  context handle — `ctx.thisLogic.<executor>(ctx)`.

Closes #1060
