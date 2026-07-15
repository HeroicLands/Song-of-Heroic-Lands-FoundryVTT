---
"sohl": minor
---

**Character-sheet release readiness (#491)**

Gear drag-and-drop and sorting on the Being sheet, editable array fields on item sheets, and removal of dead UI and an orphaned document type — the gaps between "sheets render" and "open every sheet and set every property."

- **Gear drag-and-drop and sorting (#492, #493, #494).** Gear rows on the Being sheet's Gear tab are draggable again (the drag selector matched no markup). Dropping gear onto a container — its header or its contents — moves the item into that container; dropping it outside any container returns it to On Body; dropping it onto another item reorders the list. Containment is by `system.containerId` reference, since items are never embedded in items.
- **Array-field editors (#497).** Array-valued item properties can be added, edited, and removed from the sheet again — armor coverage locations (flexible / rigid), mystery skills, and trait and attribute value descriptors and impaired-by roles. The whole array is written back on each change (never an element by index).
- **Removed the orphaned `combattechnique` item type (#498)** from the manifest; it had no data model, logic, or sheet and produced a broken item from the Create dialog. Combat techniques exist only as a `skill` subtype.
- **Removed dead item-sheet controls (#499).** Effect and action management controls with no working handlers are no longer rendered; effects and actions still display read-only. Wiring that management is tracked in #501.
- **Removed dead item-sheet drop code (#495)** that embedded items inside items — the wrong containment model.
- **Tests (#496, #500).** New end-to-end coverage drives real gear drop-to-container and drop-to-reorder events on the Being sheet; the shared item-sheet suite now also sweeps select and checkbox fields and guards that every rendered `system.*` input maps to a schema field.
