---
"sohl": minor
---

**Being Profile — Affiliations section**

The Profile tab's Affiliations section now renders as a full sectioned list — **Rank / Society / Office / Title / Notes** columns — with a per-row context-menu kebab and a **+ Add** control that creates a new affiliation via the create dialog. The section is always shown (even with no affiliations) so the first one can be added directly from the sheet, and rich-text notes are reduced to a plain-text snippet so they read cleanly in the table. Row shaping lives in a pure, Foundry-free `buildAffiliationRows` helper.
