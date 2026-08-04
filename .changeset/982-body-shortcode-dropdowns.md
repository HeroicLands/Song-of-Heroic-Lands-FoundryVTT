---
"sohl": minor
---

**Shortcode dropdowns for body-structure entity references**

Completes #974's coverage (Phase 2): the body-structure parent references —
a body part's zone and a hit location's part — are now **picked from a dropdown**
of the body's own entities in the Body Part / Body Location config editors, rather
than being the drag-only re-parenting they were before.

- **Body Part editor:** a new **Zone** dropdown lists the body's zones, so a part
  picks its parent zone by display name; changing it re-parents the part.
- **Body Location editor:** the former static owning-part label becomes a **Body
  Part** dropdown of the body's parts; changing it re-parents the location.

Both reuse Phase 1's `buildRefOptions` and the `shortcodeRefField` partial. A
stored code that matches no current zone/part is preserved as a flagged
`"<code> (unresolved)"` option rather than being blanked, and a re-parent is
accepted only when the picked code names an existing entity. Two new
`BodyStructure` accessors — `getAllZones()` / `getAllParts()` — source the option
lists, mirroring `getAllLocations()`. No data-model change or migration (the
fields stay shortcode-storing `StringField`s).

Closes #982
