---
"sohl": minor
---

**GM result-edit: re-evaluate a test card on its frozen roll (#856)**

The **edit pencil** on every standard test result card is now a GM-only
result-edit — the higher-fidelity counterpart to Fate. A GM re-opens the standard
test dialog pre-filled with the result's current **Situational Modifier** and
**Success Level Modifier**, adjusts them, and the test **re-evaluates on the same
frozen roll** — never a re-roll, no Fate cost — then reposts the card.

**Reconstruction, not a fresh test.** The pencil previously dispatched
`successTest`, which started a brand-new d100. It now dispatches a `resultEdit`
action carrying the result serialized under `priorTestResult` (the same
reconstruction seam Fate uses). Changing the situational modifier changes the
effective target, so the base success level re-derives from the frozen roll; the
success-level modifier is a flat offset applied after. Clicking OK without a
change is a no-op.

**GM-gated, defense in depth.** The pencil is render-hidden from non-GMs
(`gateEditActionPencil`, a per-viewer gate in the chat-render hook), and
`resultEdit` refuses again at click time — so a synthesized click from a non-GM
cannot re-evaluate a settled test.

Works for any standard test card — skill, attribute, or combat strike mode —
because the edit operates on the revived result itself rather than a live logic's
modifier. Because a serialized result's `targetValueFunc` reverts to identity
(functions are never serialized), a reposted **graded** success-value test grades
against identity, matching the existing Fate repost behavior.
