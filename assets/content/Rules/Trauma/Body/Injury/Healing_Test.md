---
aliases:
    - Healing Test
    - Healing Tests
id: O1G83N1o9pJYVDbA
type: doc
package: sohl
category: rules
name:
    full: Healing Test
    aliases: []
shortcode: hlngtst
folder: F4NGyU9QQgWwTcHe
---

Injuries recover through periodic **Injury Healing Tests**, one
per injury on that injury's own healing period. Each is a test of
**`Healing Base × Healing Rate`** (see [[Healing Base]]), read by
[[doc/sccsstst#success-level|success level]]:

| Success Level | Result                                                          |
| ------------- | --------------------------------------------------------------- |
| CF (−1)       | No healing. If infection was possible, an [[Infection]] occurs. |
| MF (0)        | No healing.                                                     |
| MS (1)        | Reduce Injury Level by 1.                                       |
| CS (2)        | Reduce Injury Level by 2.                                       |

As injury levels decrease, severity lessens at certain thresholds—see [[Injury Levels]].

**An untreated wound automatically Critically Fails every healing test.** A wound
that has never been treated has no Healing Rate, and so nothing to test against: no
dice are rolled, and the test resolves as a **Critical Failure** — mechanically, a
rolled **00**, which fails every target and ends in a critical digit. Such a wound
therefore makes no progress however long it is left, and takes the Critical Failure
consequences each period: being an untreated wound exposed to infection, it contracts
an [[infection]].

This governs **healing tests only**. The Physician's
[[doc/trtnginj|Treatment Test]] is _not_ a healing test — it is rolled against
the Physician's own skill, and it is what establishes the Healing Rate that later
healing tests use. (An untreated wound is separately resolved as though _its
treatment roll_ were a Critical Failure, which is the rule that leaves it exposed to
infection.)

**An active infection halts healing.** While the patient carries _any_ active
[[infection]], **no** Injury Healing Tests are made for them until
every infection has been defeated.

## Arcane Recovery

An immediate Healing Test or the single highest test bonus from an arcane healing source may be applied instead of (not in addition to) the normal periodic Healing Test.

## See also

- [[Healing Base]] — Primary metric determining healing.
- [[Healing Rate]] - Describes the Healing Rate.
- [[Afflictions]] — the Course Test.
- [[doc/sccsstst#success-level|Success levels]] — the CF / MF / MS / CS scale.
