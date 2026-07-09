---
"sohl": minor
---

**Being Profile tab: Attributes section**

The Being sheet's Profile tab now renders the character's attributes as a grid of
score boxes. Each box shows the attribute's effective **score**, its descriptor
band label, and its **TL** (target mastery level), plus a per-item context-menu
kebab. The section header carries a **+ Add** control that creates a new
attribute on the being.

The descriptor is resolved from the attribute's `valueDesc` bands: the label of
the first band (in ascending `maxValue` order) whose `maxValue` is at least the
score, falling back to the highest band when the score exceeds all bands, or an
empty string when no bands are defined. This shaping lives in a Foundry-free
helper (`attributeDescriptor`) and is unit-tested.
