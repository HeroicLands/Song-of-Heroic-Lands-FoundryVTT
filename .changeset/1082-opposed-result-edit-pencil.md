---
"sohl": patch
---

**GM edit pencil on the Opposed Action Result card now works**

The pencil in the opposed result card's header did nothing when clicked. It
rendered `data-action="{{targetTestResult.testType.action}}"`, but
`OpposedTestResult.toChat` shapes each side with `testType` as a plain string, so
`.action` was `undefined` and the attribute came out empty — the chat-card
dispatcher had no action to run, and no `data-scope` to run it against.

- **The opposed cards post again at all.** Reaching the pencil in a live client
  turned out to be impossible for a second reason: `OpposedTestResult.toChat`
  attached a `rolls` array of SoHL `SimpleRoll`s, which `SohlSpeaker._prepareChat`
  spreads straight into the `ChatMessage.create` payload. Foundry validates that
  field against its own `Roll` class, so it **silently dropped the message** —
  neither the request nor the result card ever appeared. Only `options.rolls` is
  converted by that seam; the card renders both die totals from its own shaped
  data, so no roll is attached.
- **The pencil dispatches a real GM re-edit.** It now emits
  `data-action="opposedResultEdit"`, addresses the **source actor** (the uuid
  that survives a repost of an already-edited card, unlike the item uuid, which
  scope revival re-parents), and carries the whole contest in `data-scope`.
- **New `SohlActorBaseLogic.opposedResultEdit`** — the two-sided counterpart to
  the standard card's `resultEdit`. It re-opens each side's modifiers in turn
  (the dialog heading names the side), re-scores the contest on **both frozen
  dice** — never a re-roll, no Fate cost — and posts a corrected result card
  below the original. Dismissing either dialog cancels the whole edit;
  confirming both unchanged is a no-op. GM-only, refused again at click time so
  a synthesized click cannot bypass the render-time gate.
- **Extracted `SuccessTestResult.editModifiers`** — the "re-open the pre-filled
  editor and fold the new situational / success-level modifiers in, without
  rolling" core that `resultEdit` already implemented, now shared by both
  pencils. `resultEdit`'s behavior is unchanged.
- The result card's `<h3>` no longer carries a stray, inert `edit-action` class,
  which would have taken the card title with it had the GM-only gate ever
  broadened beyond anchors.

Documented in the Token user-guide page, which previously omitted the GM re-edit
because the path did not work.

Closes #1082
