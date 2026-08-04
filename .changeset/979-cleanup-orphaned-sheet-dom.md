---
"sohl": patch
---

**e2e: `cleanupWorld` no longer leaks closed sheet DOM between tests.** Deleting a
document triggers a fire-and-forget sheet close whose asynchronous element
removal can outlive `deleteDocuments`; with Cypress `testIsolation` off, the
orphaned sheet lingered in the DOM and accumulated across tests, so a later
un-scoped global selector (e.g. `switchTab`'s `section.tab[data-tab=…]`) matched
a stale sheet instead of the current one. `cleanupWorld` now awaits closing the
sheets of the documents it deletes and sweeps any already-orphaned sheet
elements, so the third-plus sheet-opening test in a spec is deterministic. This
was the actual cause of the "Being sheet fails to render its Trauma tab with a
Fear-subtype trauma" failure — the sheet renders the Fear trauma correctly; only
the test harness was at fault. (Closes #979.)
