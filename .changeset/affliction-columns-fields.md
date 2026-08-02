---
"sohl": minor
---

**Afflictions: richer Being-sheet list and a complete Affliction sheet (#943)**

The Being sheet's afflictions list now shows **Name, Category, Level, HR, Next
Heal Test** — the former free-text "Source" column is now an explicit **Category**
column, and a calendar-formatted **Next Heal Test** replaces the Notes column.

The Affliction item sheet now surfaces every field, including the previously
unexposed **Onset Macro UUID** and **Outcome Trauma**, with the world-time dates
(Contract, Treatment, Onset, Resolution) shown through the calendar-aware date
picker. Three **view-only** projected dates are added: **Next Heal Test**,
**Est. Onset Date**, and **Est. Resolution Date**.

The projections are queue-first with an arithmetic fallback: Next Heal Test uses
the live `scheduledActions` next-fire time for the armed healing check (so an
accepted reschedule is reflected), else `(onsetDate ?? contractDate) +
healingCheckDurationBase`; Est. Onset Date is `contractDate + onsetDurationBase`;
Est. Resolution Date is `(onsetDate ?? contractDate) + resolutionDurationBase`.
These are display-only and never persisted.
