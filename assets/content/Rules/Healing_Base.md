---
aliases:
    - Healing Base
id: HealBs3xKp9mQ2vT
type: doc
package: sohl
category: user-guide
name:
    full: Healing Base
    aliases: []
folder: RqKUTBUBN2Y3MHYB
slug: sohl-healing-base
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
nearly every recovery roll in the system — the [Injury Healing Test](Injury.md#injury-healing-test),
the affliction [Course Test](Afflictions.md#course-test-healing), the
[Infection Healing Test](Infection.md), and the Extended Shock and Coma course
tests (see [Shock](Shock.md)). In each case the test is rolled against
**`Healing Base × Healing Rate`**.

## See also

- [Injury](Injury.md) — Healing Rate and the Injury Healing Test.
- [Afflictions](Afflictions.md) — the Course Test.
- [Success Tests](Success_Tests.md) — the CF / MF / MS / CS success levels.
