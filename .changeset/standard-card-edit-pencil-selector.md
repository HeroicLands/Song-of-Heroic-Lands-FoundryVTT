---
"sohl": patch
---

**Fix stale edit-pencil selector in the standard-card-buttons e2e spec**

`cypress/e2e/standard-card-buttons.cy.js` asserted the always-present edit pencil
via `data-action="successTest"`, but #856 (GM result-edit) gave the pencil its own
action — the standard test card now renders it as `data-action="resultEdit"`. The
assertion could never match, so the spec failed deterministically on `main`.
Updated the selector to `resultEdit`; no production change (the card renders the
GM-only pencil correctly).

Closes #909
Closes #905
Closes #887
