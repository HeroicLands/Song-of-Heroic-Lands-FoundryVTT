---
"sohl": patch
---

**Authorize chat-card clicks by the handler document's ownership**

Fixes [#167](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/167):
the chat-card click dispatcher resolved the handler document by UUID and ran its
`onChatCardButton` with no ownership check, so intrinsic combat/opposed flows
(`opposedTestResume`, the automated defense resumes, `startAutomatedAttack`, …)
could be driven for a document the acting client does not own — the render-time
`gateAutomatedDefenseButtons` is UX only and is bypassed by a synthesized click
or a direct handler call.

A chat card addresses each button to the actor that should _handle_ it, and
running the action mutates that actor's own state, so authorization is document
ownership. The dispatch now honors a click only if the resolved handler is owned
by the current client (a GM owns all):

- New `resolveAuthorizedChatCardHandler(dataset, resolveDoc)` resolves the handler
  and returns it only when `doc.isOwner`, gating both the button and edit-action
  click paths in `sohl.ts` before any dialog, `buildActionScope` revival, or
  intrinsic logic runs. Foundry lookup is injected, so it is Foundry-free and
  unit-tested (mirroring `gateAutomatedDefenseButtons`).
- Each `onChatCardButton` handler (`SohlCombatant` / `SohlTokenDocument` /
  `SohlItem`) also re-checks `this.isOwner` on entry, so a direct call is refused
  too (defense-in-depth), matching the existing `onChatCardEditAction` guard.

The correctly-addressed owner's flows are unchanged. The two-sided model
(render-gate + click-authorize on the handler's ownership) is documented in the
Chat-card dispatch contract (`docs/reference/runtime-contracts.md`) and the
cross-client authorization guardrail (`docs/concepts/security-model.md`).
