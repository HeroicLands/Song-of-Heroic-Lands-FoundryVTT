---
"sohl": patch
---

**Fix: Being Façade tab binds to real datamodel fields (`portrait` / `appearance`)**

The Façade tab (the Being sheet's initial/summary tab) bound its bio image to
`system.bioImage` and its description editor to `system.description` — neither of
which exists in the actor schema. The image rendered blank and the editor was
always empty, with edits silently dropped.

Point the tab at the existing fields the schema already defines: the bio image
uses `system.portrait` and the physical-appearance description editor uses
`system.appearance`. Adds an e2e spec (`facade-section.cy.js`) asserting both
bindings.

Closes #303, #307
