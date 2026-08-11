---
aliases:
    - Healing Base
id: Sb8dCIBSChIPJpKr
type: doc
package: sohl
category: rules
name:
    full: Healing Base
    aliases: []
folder: F4NGyU9QQgWwTcHe
shortcode: hlngbs
---

Every creature has a **Healing Base (HB)** — the factor that governs how readily
it recovers. The higher the Healing Base, the more likely recovery succeeds.

Healing Base is the **average of the creature's Endurance (END) and Will (WIL)
attributes**, with the fraction **rounded up when END > WIL** and rounded down
otherwise.

| END | WIL | Average | Healing Base          |
| --- | --- | ------- | --------------------- |
| 12  | 12  | 12      | 12                    |
| 13  | 12  | 12.5    | 13 (END > WIL → up)   |
| 12  | 13  | 12.5    | 12 (END ≤ WIL → down) |

Healing Base is the mastery level used, together with a **Healing Rate**, in
nearly every recovery roll — the [[doc/hlngtst|Injury Healing Test]],
the affliction [[doc/afflctns#course-test|Course Test]], the
[[Infection Healing Test]], and the Extended Shock and Coma course
tests (see [[Shock]]). In each case the test is rolled against
**`Healing Base × Healing Rate`**.

## See also

- [[doc/injrylvl|Injury]] — Healing Rate and the Injury Healing Test.
- [[Afflictions]] — the Course Test.
- [[doc/sccsstst#success-level|Success levels]] — the CF / MF / MS / CS scale.
