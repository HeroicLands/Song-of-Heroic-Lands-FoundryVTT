---
"sohl": patch
---

**An Affiliation now records what kind of organization it is.**
Affiliation was the only item type without a `subType`, so nothing could ask
whether a body was a church, a school of magic, a spirit tradition or a secular
guild — and the associated-affiliation picker on a Mystical Ability or Mystery
had to offer all of them, presenting a thieves' guild to a divine incantation.

- **New `subType`**, chosen from **arcane** (schools of magic, including
  alchemical schools), **divine** (religions and churches), **spirit** (shamanic
  and totemic traditions, ancestor and spirit cults) and **social** (everything
  secular: guilds, banks, syndicates, noble houses, military units). It is
  `required` with no default, matching every other subtype-bearing item type,
  and is edited on the affiliation's Properties tab. `divine` and `spirit` stay
  distinct because the mystical-ability subtypes already tell those families
  apart, and a filter is only as good as the partition beneath it.
- **Existing worlds migrate automatically.** The first entry in the migration
  registry stamps `social` on affiliations that predate the field (and on any
  value outside the permitted set, which Foundry would otherwise drop silently).
  No manual intervention is needed, and no shipped content is affected — the
  system ships no affiliations of its own.
- **`actorItemRefOptions` takes an optional predicate**, so a picker can narrow
  what it offers to the affiliations of a relevant kind. Existing call sites pass
  nothing and are unchanged. The specific mystical-ability-subtype → affiliation-
  subtype mapping is a rules decision and is left to follow-up work.

The subtype records what a body _is_; it narrows what a user is offered and
never chooses for them.

(Closes #1405.)
