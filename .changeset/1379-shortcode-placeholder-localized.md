---
"sohl": patch
---

**e2e: `shortcode-header.cy.js` no longer expects an unlocalized placeholder.**
The item-sheet header's shortcode input renders
`placeholder="{{localize "SOHL.Common.shortcode"}}"` since the template strings
were localized, so the spec's literal `"shortcode"` expectation failed against a
rendered `"Shortcode"`. It now reads the localized value off `game.i18n` and
asserts against that — pinning the binding rather than the wording, so the next
copy change cannot break it — and additionally asserts the placeholder is not a
raw `SOHL.*` key.

(Closes #1379.)
