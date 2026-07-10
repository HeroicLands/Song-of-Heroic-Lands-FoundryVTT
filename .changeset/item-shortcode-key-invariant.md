---
"sohl": minor
---

**Enforce `(type, shortcode)` as a unique item and actor key**

Every SoHL item and actor now carries a non-blank `shortcode`, and
`(type, shortcode)` is a **unique key** — per owning actor for embedded items, and
per world for world actors and world items. This gives each document a stable,
unambiguous handle for lookup and cross-references (weapon `assocSkillCode`,
cohort members, birthsign terms) instead of relying on ambiguous names.

**Enforcement (in `_preCreate`).** The key is resolved against its scope,
honoring what the caller supplied and how the create was initiated:

- _No shortcode supplied_ (system-generated or ad-hoc creates — a trauma from an
  injury, an API create) — one is **derived from the name and uniquified**, so
  programmatic creation can never fail on the key. This is the same fill +
  uniquify the create dialog offers a human, applied to every path.
- _Explicit shortcode, Foundry duplicate_ ("copy this document"; Foundry stamps
  `_stats.duplicateSource`) — **auto-uniquified** (`arrow` → `arrow2`) so
  Duplicate keeps working. The prior prototype clone mechanism (`cloneActorUuid` /
  items-present heuristic) is dropped in favor of Foundry's native duplicate.
- _Explicit shortcode, general create_ (dialog, drag, API) — the caller asked for
  that specific code; a collision is **rejected** (intent is unknown — they may
  be unaware it is taken).

**Create dialog.** The shared create dialog pre-fills a unique shortcode from the
name and keeps it in sync as you type (until you edit it), mirroring the existing
name-uniquify — so the human flow always yields a valid, unique key.

**Data.** The packaged _Basic Folk_ actor is backfilled with a `basicfolk`
shortcode (its `system.shortcode` was blank).

Closes #347
