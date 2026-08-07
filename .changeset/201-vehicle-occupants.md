---
"sohl": minor
---

**Vehicle Occupants tab**

A vehicle's `occupants` could be written to but never seen: the sheet had no
tab for them, and `VehicleLogic` derived nothing, so who was aboard was
invisible.

- `VehicleLogic` gains `occupantLogics` and `occupantRows`, mirroring the
  cohort's roster: each stored entry joined to whatever its handle resolves to,
  with the actor's name, portrait, role, title, and current health. An entry
  that no longer resolves still produces a row, named by its raw handle and
  flagged **Not Found** — a vehicle must be able to see, and remove, someone it
  can no longer reach.
- **No leader.** Unlike a cohort, a vehicle's complement has roles but no single
  head; a ship's master is expressed as a `title`, not a rank the system tracks.
- The **Occupants** tab lists them, and `addOccupant` / `removeOccupant`
  intrinsic actions manage the list — actions rather than sheet-only handlers,
  so the tab controls and the Actions tab drive one implementation. Adding asks
  for the handle, role, and optional title, and refuses a handle that names no
  visible actor or is already aboard; removing confirms first and never touches
  the occupant's own actor.
- The health-percentage helper the cohort roster used is now the shared
  `healthPercent` in the health module, used by both rosters.
