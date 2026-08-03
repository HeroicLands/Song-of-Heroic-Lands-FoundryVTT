---
"sohl": minor
---

**Version-keyed world migration runner**

Add a real migration runner keyed to the `systemMigrationVersion` world setting
(previously registered but unused). On `ready` the active GM now compares the
world's stored migration version against the running system version, runs any
applicable migration steps across the in-scope document types — Actors, Items,
their embedded ActiveEffects, and scene-region `trigger` behaviors — and stamps
the version forward. A brand-new world is stamped to the current version without
running anything; a pre-tracking world with existing content plans from `0.0.0`.

The migration registry ships **empty** — this is infrastructure only, with no
data migration required at this time. Future migrations plug in as a single
frozen entry in the Foundry-free registry (`sohl.entity.migration`), whose
version comparison, step planning, and per-document folding are fully
unit-tested. The existing report-only scan for retired `trait` items (#651) is
preserved.
