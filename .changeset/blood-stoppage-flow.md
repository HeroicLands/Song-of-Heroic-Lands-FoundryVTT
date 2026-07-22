---
"sohl": minor
---

**Interactive Blood Stoppage flow (#547)**

Add the physician **Accept**-card flow for bleeders — the cross-client sibling of
the treatment flow, built on the action-card framework.

- **Request Blood Stoppage** (`TraumaLogic.requestBloodStoppage`, on a bleeding
  wound) posts an **open** card any Physician-skilled character's controller may
  answer.
- **Perform Blood Stoppage** (`BeingLogic.performBloodStoppage`) is a
  self-sufficient physician action: it rolls the physician's own Physician skill
  (plus any +10 carried from a prior Marginal Failure) and posts a result with an
  owner-gated **Accept** button.
- **Accept** (`TraumaLogic.acceptBloodStoppage`, on the wound) relays the outcome
  back to the bleeder: **CS** stops the bleeding immediately, **MS** stops it after
  the next Blood Loss Advance (honored by `bloodLossAdvanceCheck`), **MF** continues
  with a +10 bonus to the next stoppage, **CF** continues.

The `#487` auto-resolve fallback (no physician answers by end of round → the advance
proceeds as a Critical Failure) is unchanged. The pure outcome mapping lives in a
Foundry-free `blood-stoppage` module (`bloodStoppageOutcome`).

Part of #548. Closes #547.
