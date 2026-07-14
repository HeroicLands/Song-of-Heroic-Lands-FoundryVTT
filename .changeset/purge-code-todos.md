---
"sohl": patch
---

**Purge all TODO/FIXME markers; track deferred work in issues only (#440)**

Deferred work is now tracked exclusively in GitHub issues, not flagged in the code.
All 26 `TODO`/`FIXME` markers under `src/` are removed; each was already linked to
an issue (#65, #67, #68, #70, #71, #72, #73, #74, #76), so the work stays tracked,
and any code-site context was first migrated into the relevant issue.

This also fixes the **API docs** (api.heroiclands.org): two markers lived inside
published JSDoc, so the site rendered TODO text as documentation —

- `CohortLogic`'s entire class description was its `TODO(#76)` block (a second
  `/** */` between the real description and `export class` won). The class now
  publishes its real description; an orphaned duplicate description block stranded
  above the imports was removed, and a latent unresolved
  `{@link COHORT_MEMBER_ROLE}` in that description (previously masked) was fixed to
  the qualified `{@link sohl.utils.COHORT_MEMBER_ROLE}`.
- `GearLogic.sharedWithCohorts`'s doc no longer trails the TODO paragraph.

The `lint:todos` guard (`utils/check-todos.mjs`, run in CI and `build:noci`) is
flipped from "TODO/FIXME must be linked" to "**no** TODO/FIXME markers", enforcing
the policy going forward. Contributor docs are updated to match. No runtime
behavior changes.
