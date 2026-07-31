---
"sohl": minor
---

**Output Description to Chat — a shared item action**

Every item now carries an **Output Description to Chat** intrinsic action that
posts its description to the chat log, giving the previously orphaned
`item-desc-card.hbs` a render site.

- `SohlItemBaseLogic.outputDescription` is a human-triggered, informational card
  (no follow-up buttons) — it only _shows_ the item's own text and takes no action
  on any character, per the consent model.
- The card is assembled by the pure, unit-testable `buildItemDescCardData` helper
  from the item's `name`, type-label subtitle, `notes`, optional `textReference`,
  and `charges` where the kind uses them. The description (`docHtml`) is enriched
  through the normal `fvttEnrichHTML` path and the card is rendered/sanitized by
  `buildActionCard`; item data is never interpolated into template source.

Closes #849
