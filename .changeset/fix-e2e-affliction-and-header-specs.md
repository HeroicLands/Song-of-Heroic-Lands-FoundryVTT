---
"sohl": patch
---

**Fix two e2e specs (#502, #503)**

- **#502** — the affliction action-gating spec modelled a "treated" affliction with the retired `isTreated` flag, but `isTreated` is derived from `treatmentDate` (#484), so the flag was ignored and `canTreat` stayed true. The spec now sets `treatmentDate`.
- **#503** — with Cypress `testIsolation` off, a permanent error notification raised by one spec (e.g. Foundry's `Hooks.onError` on a caught data-prep failure) persisted and overlaid the Being-header status pill in a later spec, failing an unrelated click. Each test now starts from a clean notification UI, so a bled notification can no longer cover another spec's controls. (The underlying prep error is tracked separately, e.g. #512.)
