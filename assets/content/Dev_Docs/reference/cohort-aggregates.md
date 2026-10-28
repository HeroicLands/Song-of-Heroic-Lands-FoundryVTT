---
shortcode: cohortaggregates
name: {full: Cohort Aggregates}
type: doc
subType: reference
description: "Resolved membership and health-band counts exposed by Cohort actors."
tags: [dev-reference]
data: {pack: none}
sohl: {kbcat: devdocs}
---

See also: [[doc-runtimecontracts|Runtime Contracts]]

A Cohort exposes two derived fields on `actor.system` (also available through
`actor.logic.data`):

| Field              | Meaning                                                                    |
| ------------------ | -------------------------------------------------------------------------- |
| `memberCount`      | Number of membership entries resolving to an Actor.                        |
| `healthBandCounts` | Counts keyed by `Excellent`, `Good`, `Fair`, `Poor`, `Morbid`, and `Dead`. |

These fields are computed during evaluation and finalization. They are transient
state, not authored fields or persisted updates. Each refresh replaces all six
counts, including zeros, so removed members cannot leave stale contributions.

A member whose reference cannot resolve contributes to neither field. Its row
remains on the Members tab so the owner can repair or remove it. A resolved member
without usable health counts toward `memberCount` but contributes to no health
band. Zero health is a valid contribution to `Dead`, not missing health.

The Members tab displays the resolved count and band counts from this stored
state. The individual rows still display each member's current health. No command
reach, shared-task mastery, or single overall cohort health band is inferred.

`CohortLogic.deriveMembershipState()` refreshes this state without writing any
source document. Dependency observers use it after member changes and after world
initialization, when Being finalization has produced member health.

## Dependency refresh

Client-local observers refresh roster aggregates after an Actor, its embedded
Items or ActiveEffects, or a referenced Token Actor changes. Actor identifiers
are captured before rename or deletion, allowing a reference that no longer
resolves to lose its previous contribution. When a token changes its actor, both
its previous and replacement actor references are refreshed; deletion retains
the previous actor reference even after the token no longer exposes it. Dependent rosters refresh
transitively, with each affected actor visited once even if rosters contain a
cycle. Unrelated actors are not refreshed.

A ready sweep refreshes world and synthetic actors after initial preparation.
Observers call only the public derivation methods: they never prepare an actor
again or persist derived values. Already-open sheets rerender; closed sheets are
not opened. Refresh runs locally on each client and requires no ownership-based
write authority.
