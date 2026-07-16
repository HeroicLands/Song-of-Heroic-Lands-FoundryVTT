---
"sohl": minor
---

**Fix the Being sheet's cross-cutting layout & wiring defects (#513)**

Four defects that affected every Being content tab, each fixed once at the shared sheet layer:

- **Context menus now work (#517).** `_contextMenu()` was never called, so right-clicking an item row and clicking its ⋮ control did nothing — there was no way to edit or delete anything created on the sheet. It is now bound in `BeingSheet._onRender`, so both open the item's context menu.
- **Content tabs scroll (#514).** The content tabs were `overflow-y: hidden`, so anything past the sheet height was unreachable. The Being tabs now scroll (`overflow-y: auto`), and each content part is marked `scrollable` so the scroll position survives the submit-on-change re-render.
- **Search fields render light (#516).** The search inputs are `type="search"`, which the light-field CSS didn't cover, so they rendered as a dark bar. `input[type="search"]` is now styled like the other inputs.
- **List rows are compact (#515).** The Being lists use the shared `.list__*` markup but not the `.list-section .list` wrapper the item lists use, so row names rendered as oversized headings. Compact-row styling is now applied to the Being lists' BEM classes.
