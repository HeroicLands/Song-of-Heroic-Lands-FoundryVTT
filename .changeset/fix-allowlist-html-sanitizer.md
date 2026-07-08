---
"sohl": minor
---

**Sanitize chat/dialog HTML with Foundry's allowlist sanitizer**

Fixes [#161](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/161):
`toSanitizedHTML` — the single sanitizer for all chat-card and dialog content —
was a tag/attribute **denylist**, which is bypassable via whitespace/entity-obfuscated
`javascript:` URLs, `<base>`, SVG `xlink:href`, and mutation-XSS on the
sanitize→serialize→reparse round-trip. It now delegates to Foundry's built-in
**allowlist** sanitizer `foundry.utils.cleanHTML` (the same one Foundry applies to
dialog and journal HTML), which keeps only allowlisted tags/attributes and validates
URL schemes via `URL.parse`.

- New `fvttCleanHTML` shim in `FoundryHelpers` wraps `foundry.utils.cleanHTML`
  (a real v14 client API that is currently absent from `fvtt-types`).
- `toSanitizedHTML` moves from `helpers.ts` into the Foundry-coupled
  `FoundryHelpers` (where its only callers already live), since sanitization is a
  DOM/browser operation. **It is therefore no longer exposed on `sohl.utils.*`** —
  it was never intended as public API.
- Chat-card dispatch is unaffected: `data-*` attributes are on Foundry's global
  attribute allowlist, so button routing (`data-action`/`data-scope`/`data-handler-uuid`)
  is preserved.
- `data:` URLs and inline `style` remain permitted, matching Foundry's system-wide
  stance rather than being additionally blocked.
- Neutralization is verified by a Cypress e2e spec against the live browser
  sanitizer (`cypress/e2e/html-sanitization.cy.js`).
