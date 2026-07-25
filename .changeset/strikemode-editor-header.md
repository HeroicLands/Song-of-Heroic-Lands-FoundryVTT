---
"sohl": patch
---

**Fix: Strike Mode editor header + store weapon strike modes as an array (#683)**

The Strike Mode editor (`StrikeModeConfig`) now leads with an identity header
showing the strike mode's **Name**, **Shortcode**, and **Type**, its fields no
longer overlap, and a weapon's strike modes are persisted as an array keyed by an
editable shortcode.

- **Strike modes are an array.** A weapon's `system.strikeModes` is now an
  `ArrayField` whose elements each carry their own `shortcode` (previously the
  strike modes were a keyed object and the shortcode was only the map key). The
  shortcode must be unique among that weapon's modes. The compendium builder keeps
  the authored array shape (shortcode retained) rather than folding it into an
  object. _No world migration is required (no released worlds store the old
  shape)._
- **Identity header.** Name, Shortcode, and Type are surfaced together at the top
  of the editor instead of being mixed into the mechanical fields. The shortcode is
  editable for a weapon's strike modes (kept unique; the array element is updated
  in place) and read-only for a combat technique's single strike mode.
- **Readable layout.** The form's `.form-group.stacked` fields had no backing CSS,
  so every label rendered on top of the input above it. A scoped
  `strike-mode-config` stylesheet now stacks each label above its control and lays
  the fieldsets out in a clean two-column grid.
