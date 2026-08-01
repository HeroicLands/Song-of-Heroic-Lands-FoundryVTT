---
"sohl": patch
---

**Fix the Being Façade appearance editor rendering empty and the source view covering the toolbar (#897)**

The Manuscript-redesign editor cards (`.facade__editor` on the Being Façade tab and `.prose-panel__editor` on every Item Description tab) forced `prose-mirror { display: block }`, which dropped Foundry's `menu-container` and `editor-container` out of flex flow. Both collapsed to zero height, so the WYSIWYG view showed no text and the source (`</>`) view rendered over the toolbar. The cards now keep Foundry's `display: flex; flex-direction: column` and fill the card as a flex child (`flex: 1; min-height: 0`), so the editor content and toolbar lay out correctly.
