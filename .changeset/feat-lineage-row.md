---
"sohl": minor
---

**Combat tab: Lineage row**

The Being Combat tab now shows the actor's **Lineage** (below the strike modes and Held Items, above the body-structure display). Because a being's lineage is a singleton, the row reflects that:

- When a lineage exists: its name is shown with **Edit** (opens the Lineage sheet) and **Delete** (confirmed removal) anchors, and the **+ Add** control is disabled.
- When none exists: **+ Add** is active (creates a lineage), and a hint notes that a lineage usually arrives by drag-and-drop and that a being with no lineage has no body.

Adds generic `editItem` / `deleteItem` sheet actions (open sheet / confirm-delete by `data-item-id`).
