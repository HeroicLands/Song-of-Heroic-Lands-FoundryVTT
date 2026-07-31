---
"sohl": patch
---

**Fix the success-test chat card rendering blank Target/Roll and a raw i18n key**

Clicking a strike mode's **Atk/Blk/CX** value — or running any success test —
posted a card with an empty **Target**, an empty **Roll** (and failure styling
regardless of outcome), and a footer showing the literal key
`SOHL.SuccessTestResult.Failure` instead of a localized result.

The card renders directly against the result's serialized `toJSON()` payload, but
the template was written against the live-object shape, so several bindings never
resolved:

- **Target / modifier breakdown.** `SuccessTestResult.toChat` now folds the
  modifier into the card data as `mlMod` (its constrained target, per-delta
  `chatHtml` breakdown, `empty`, and `successLevelMod`). The Target now shows the
  modifier's `constrainedEffective` — the value the d100 must roll at or under.
- **Roll total and outcome styling.** The roll's `total` (a getter absent from
  `SimpleRoll.toJSON`) and the `isSuccess` / `isCritical` outcome booleans are now
  folded in, so the Roll shows the d100 total and the card styles a pass as a
  success.
- **Localized footer.** Added the six `SOHL.SuccessTestResult.{Success,Failure,
MarginalSuccess,MarginalFailure,CriticalSuccess,CriticalFailure}` keys (none
  existed) and localized the footer (`{{localize description}}`), so it shows e.g.
  "Marginal Success" rather than the raw key.
- **Live edit / fate buttons.** The card's root element, its edit-pencil, and its
  Fate Test button read `{{actor.uuid}}` / `{{item.uuid}}`, which `toChat` never
  supplied — so all three rendered empty and the buttons could not dispatch. The
  owning item's and actor's uuids are now folded in.

Affected every success-test card (skills, attributes, and combat), since they all
share this render path.

Resolves #840
