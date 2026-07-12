---
"sohl": patch
---

**Fix: Being Profile tab biography editor binds to `system.dossier`**

The Profile tab's biography editor bound to `system.biography`, which is not
defined in the actor schema, so it always rendered empty and edits to it were
silently dropped. Point it at the existing `dossier` field ("rich-text dossier /
background notes"). Adds an e2e spec (`profile-section.cy.js`) asserting the
binding.

Same bug class as the Façade tab fields fixed in #307.

Closes #373
