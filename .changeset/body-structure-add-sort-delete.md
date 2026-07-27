---
"sohl": minor
---

**Add, sort, and delete body structure from the Being sheet's Combat tab**

Completes the Combat-tab Body Structure editor, building on the Edit editors
(#721 / #722):

- **Add** — the section header carries a **+ Add** control that creates a body
  part; each body-part header carries a **+ Add** that creates a hit location
  under it. Both prompt for a name and a unique shortcode.
- **Delete** — each part header and location row's **⋮** menu gains **Delete**
  (alongside the existing **Edit**). Deleting a part is **refused** while it
  still owns hit locations — remove those first.
- **Reorder** — body parts and hit locations can be reordered, and locations
  moved between parts, by **drag-and-drop**.

Every mutation rebuilds the complete `system.body.structure.parts` array (never
a by-index write, which would corrupt the array — #247). All controls are
owner-gated; a non-owner still sees the read-only tree.

Closes #720
