---
"sohl": patch
---

Fix the broken Add Injury flow.

`BeingLogic.addInjuryViaDialog` / `onCreateInjury` resolved the target body via
`getActorBodyStructure(this)`, but `this` is the `BeingLogic` — which exposes
`logicTypes`, not the Foundry actor's `itemTypes` — so the lookup always returned
`undefined` and the flow aborted before any dialog (whose "no body" warning then
hit the logger recursion). And `BeingSheet._onAddInjury` called
`this.document.addInjuryViaDialog()`, a method the actor does not define (it lives
on `BeingLogic`). `getActorBodyStructure` now reads the lineage body through the
logic's `logicTypes` (matching how the rest of `BeingLogic` reaches it), and the
sheet action routes through `.logic`. (#268)
