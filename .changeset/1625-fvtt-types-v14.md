---
"sohl": patch
---

**Type definitions now describe the Foundry version the system actually
targets.** `fvtt-types` was pinned to a December 2025 commit resolving to
13.346.0 — Foundry **v13** types — while the system declares v14 as its minimum
and runs its suite against v14 builds. Types that describe a different major are
worse than none: code type-checks cleanly and can still be wrong against the
runtime it ships on, with the compiler reporting success.

The pin moves to 14.366.0. Nothing about the shipped bundle changes —
`fvtt-types` ships only declarations, and the bundler strips types without
checking them — so the effect is confined to what the compiler can catch.

**Scheduling gained a real guard.** v14 types `Document#uuid` as `string | null`,
because an unpersisted document has no address yet, and the schedule mutators
required a non-null `uuid`. That is the right requirement — a schedule _is_
addressed by uuid: the event queue arms, finds, and unschedules entries by it —
so rather than widening the contract or casting at the call sites, the entry
points now accept the document as Foundry hands it over and narrow once, failing
loudly when the uuid is absent. An unaddressable schedule can no longer be
written: previously nothing checked the invariant, it was merely assumed by a
type.

(Progresses #1625.)
