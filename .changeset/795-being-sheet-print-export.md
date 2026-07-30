---
"sohl": minor
---

**Being sheet: character-sheet print / export (#795)**

A window-header **print** control (`fa-print`) on the Being sheet renders a
dedicated, document-first character record and opens the browser's print dialog —
from which you choose print-to-printer, save-as-PDF, or (cancel and) save-HTML,
all native browser behavior.

- **One data layer, two presentations.** The print view is built from the same
  Foundry-free view-models the interactive tabs use (`being-sheet-view.ts`), not
  by scraping the live DOM. A new pure module (`being-print-view.ts`) adds the
  letterhead's health / status / injury summary lines and the plain-text
  charge / level formatters, so the record stays print-safe (color-coded pills and
  body lozenges are re-expressed as text for grayscale).
- **Document-first Manuscript record.** All sections at once, static (values as
  text, no inputs / rollable cells / chrome), paginated. True-black ink on white,
  rubrication-red section rules, `@page` margins and repeating table headers,
  centered numeric columns. The top of the record is a magazine layout — a
  three-column band (attribute roster · portrait · description) then movement
  beside affiliations, then the skills laid out as per-subtype columns. The light
  Manuscript palette is forced (`data-theme="light"`) so it never flips to the dark
  token swap on a viewer whose browser prefers dark. The Actions tab is omitted —
  its runtime affordances have no place on a printed sheet.
- **Detached window.** The record opens in a new `window.open` window with the
  system stylesheet linked by absolute URL and the two rich-text fields enriched to
  static HTML; `print()` fires only after the window's `load` and a fonts-ready
  tick. Available to any viewer of the sheet (no GM gating).
