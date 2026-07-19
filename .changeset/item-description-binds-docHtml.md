---
"sohl": patch
---

**Fix the item Description tab persisting to a non-existent field**

The item-sheet Description tab's ProseMirror editor bound `system.description`,
which is not a schema field (the item schema defines the long-form description as
`docHtml` and the short row `notes`). Edits in the Description tab were silently
dropped. The editor now binds `system.docHtml`, so the item's long description
persists.

Closes #536
