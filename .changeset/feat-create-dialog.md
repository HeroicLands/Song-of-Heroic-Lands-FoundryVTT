---
"sohl": minor
---

**Feature: custom item creation from the Being sheet via a `createDialog` flow**

Reimplements the prototype's item-create mechanism for the current TS / Foundry
v14 code. Clicking an item-create control now opens a dialog that collects a
name, type, and (when the chosen type has one) subtype, then creates the item
and opens its sheet.

**What's new**

- `SohlItem.createDialog` — a v14-compatible override that computes the allowed
  types (excluding the base type, honoring an optional `types` restriction),
  decides whether to ask for the type and subtype (a valid pre-seeded
  `data.type` / `data.system.subType` locks and hides that field), and renders
  the shared create dialog through the `dialog()` boundary. A `render` hook
  repopulates the subtype `<select>` from the newly-chosen type's DataModel
  `subType` choices whenever the type changes.
- `SohlActor.createDialog` — the same flow for world actors (parent always
  `null`); it shares the implementation, so any future actor subtype is picked
  up automatically.
- `BeingSheet` gains a `createItem` ApplicationV2 action reading `data-type` and
  `data-sub-type` off the clicked control. The gear-tab "Add Gear" anchor is
  wired to it (`data-action="createItem"`) to prove the flow end-to-end; other
  tabs' anchors are wired separately.
- `create-item.hbs` is now progressive-ready: the subtype form-group has a
  stable wrapper the render hook repopulates and is hidden when the type has no
  subtypes; the type group hides when the type is pre-seeded/locked.

Subtype choices are read at the boundary from
`CONFIG.Item.dataModels[type].schema` (the `subType` field's value-keyed
`choices` map) and mapped to localized options by the new pure
`subTypeOptionsFromChoices` helper.
