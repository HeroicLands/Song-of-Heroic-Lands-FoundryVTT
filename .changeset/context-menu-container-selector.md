---
"sohl": patch
---

**Fix item and effect context menus throwing "Container not found" (#517)**

Right-clicking an item/effect row or clicking its ⋮ control threw
`Error: Container not found` and never opened the menu, so there was no way to
edit or delete rows from a sheet. `SohlContextMenu._setPosition` located its
container with `target.closest("div.app")` — a pre-v13 selector. Under Foundry
v14 the ApplicationV2 frame carries the `.application` class, and for a
DocumentSheetV2 the frame element is a `<form>`, not a `<div>` — so both
`div.app` and `div.application` matched nothing.

The lookup now matches on the class alone (`.application`), so the menu finds the
frame, positions, and opens.
