---
"sohl": patch
---

**Constrain the item-sheet header image (#528)**

An item sheet's header image rendered at its natural size and filled the whole
`window-content`, collapsing the tab body below it to zero height (its form was
invisible and could not scroll). The header image is now pinned to a fixed size
with a divider, like the actor portrait, so the tab body keeps the remaining
space.
