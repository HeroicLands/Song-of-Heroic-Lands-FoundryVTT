---
"sohl": minor
---

**Being Trauma tab — Traumas (injuries) section**

The Trauma tab's injuries list now shows each trauma with its severity band
(M1 / S2 / S3 / G4 / G5), healing rate (an `NT` prefix when untreated), localized
impact aspect, resolved body location (Area), bleeding state, and notes — with a
custom-create control (a blank trauma, `data-type=trauma`) alongside the existing
Add-Injury roll, and a per-row context menu.

The `Created` and `Next Healing` timer columns from the design are deferred to a
follow-up (#356): they depend on new world-time fields and the trauma
healing-test mechanic (#73).

Closes #308
