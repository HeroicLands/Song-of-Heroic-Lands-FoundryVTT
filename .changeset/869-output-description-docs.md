---
"sohl": patch
---

**Docs: document the universal "Output Description to Chat" item action**

The shared `outputDescription` intrinsic action every item carries (added with
#849) was undocumented.

- **`concepts/macros-and-actions.md`** — a note in the intrinsic-actions section
  that `defineIntrinsicActions` composes up the class hierarchy, so the base Logic
  classes contribute actions shared by **every** document: the `SohlLogic`
  edit/delete pair, plus `SohlItemBaseLogic`'s `SELF`-scoped **Output Description
  to Chat**, built by the pure `buildItemDescCardData` and purely informational
  (no follow-up buttons — the "assist, never act" model at its simplest).
- **`concepts/sohl-api.md`** — a concrete example on the `document.logic` surface:
  every item's logic carries `outputDescription`, cross-linked to the actions
  section.

Closes #869
