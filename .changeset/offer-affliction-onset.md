---
"sohl": minor
---

**Offer the affliction onset check at contraction, instead of auto-arming**

Closes out the "nothing auto-schedules" migration (issue #579): the **last**
creation-time auto-schedule — an affliction seeding its own `onsetCheck` when
created — is now an **offer**, matching healing / blood-loss / course.

- `AfflictionDataModel._preCreate` seeds only the cadence config (`contractDate`,
  `onsetDurationBase` from `onsetDurationFormula`) — no `onsetCheck` schedule.
- `BeingLogic.contractDisease` (the designed contraction path: contagion test →
  on failure, create the affliction) then **offers** the onset check via the
  shared `offerSchedule`. Accept schedules it, decline clears it; a scripted
  caller pre-answers via `scope.schedule` or suppresses with `skipDialog`. The
  offer's per-effect title is "Set an Affliction Onset Reminder?".
- **Unchanged:** the onset _phase transition_ (`AfflictionLogic.onsetCheck`) still
  auto-schedules the resolution + recurring healing checks — that is the disease
  progressing as the direct consequence of a human-performed step (consent-gated
  by #587), not a creation-time auto-schedule. The recurring healing check already
  offers its reschedule.

_Behavior note:_ a disease created by a raw drag (bypassing `contractDisease`,
like a direct `createEmbeddedDocuments`) no longer auto-onsets — consistent with
how direct trauma creation bypasses its offer. The GM triggers onset via the
action.

With this, **every** recurring timed effect — healing, blood-loss, course, onset
— is armed only at a human's behest, at creation and on every re-schedule.

**Tests.** Unit tests cover the offer (accept → `sohl.schedule`; decline →
`sohl.unschedule`). A dedicated `contractDisease` e2e is deferred: it rides the
pre-existing affliction-spec breakage (#570), and the onset offer is the same
`offerSchedule` seam proven end-to-end (forced dice → offer → button) by the
recovery-course e2e in #595.

Closes #602. Refs #579, #595, #598, #570.
