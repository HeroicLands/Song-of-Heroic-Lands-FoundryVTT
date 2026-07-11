---
"sohl": minor
---

**Being Trauma tab — Afflictions section**

The Trauma tab's afflictions list now groups afflictions by subtype and shows
each with its level, healing rate, source, and notes — with a search box, a
custom-create control (`data-type=affliction`), and a per-row context menu. This
completes the Trauma-tab epic (#304) alongside the Traumas section (#308).

The `Created` / `Course Test` / `Recovery Test` timer columns are deferred to a
follow-up (#359): they depend on world-time fields and the affliction
course/recovery mechanics (#65 / #67 / #68).

Closes #309
