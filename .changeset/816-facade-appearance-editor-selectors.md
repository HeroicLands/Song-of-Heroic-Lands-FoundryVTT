---
"sohl": patch
---

**Facade tab e2e: target the renamed appearance editor**

The Being Facade tab spec's _"renders the enriched appearance in the description
editor"_ test queried the pre-redesign `.facade__description` class, which the
Facade Manuscript redesign renamed to `.facade__appearance` / `.facade__editor`.
The stale selectors are updated to assert the enriched appearance text and the
`system.appearance` prose-mirror binding under `.facade__editor`, matching how
the Profile tab spec verifies its editor.

Closes #816
