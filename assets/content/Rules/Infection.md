---
aliases:
    - Infection
    - Infection Healing Test
id: Inf3ct9nZp5cQ7wK
type: doc
package: sohl
category: user-guide
name:
    full: Infection
    aliases: []
folder: RqKUTBUBN2Y3MHYB
slug: sohl-infection
---

Some injuries can become **infected**. When such an injury's
[Injury Healing Test](Injury.md#injury-healing-test) comes up a **Critical
Failure**, a new infection takes hold. An infection starts with a **Healing Rate
one step higher than the injury it came from** (originating injury HR + 1).

## Weakness

An infection saps the body, inflicting [weakness fatigue](Fatigue.md) according to
its current Healing Rate:

| Healing Rate | Weakness Fatigue |
| ------------ | ---------------- |
| HR 1–2       | 10               |
| HR 3–4       | 5                |
| HR 5+        | None             |

## Recording an infection

An infection is treated as a physical injury, recorded **separately** from the
wound it came from, with:

- **Aspect** — "Inf".
- **Injury Level** — "X" (not applicable).

**An active infection halts injury healing.** While the patient carries any
active infection, **no** [Injury Healing Tests](Injury.md#injury-healing-test)
are made for them until every infection has been defeated.

## Infection Healing Test

An infection heals through the **Infection Healing Test** — a test of
**`Healing Base × Infection Healing Rate`** (see [Healing Base](Healing_Base.md)).
The result changes the infection's Healing Rate:

| Success Level | Change to Infection HR |
| ------------- | ---------------------- |
| CF (−1)       | −2                     |
| MF (0)        | −1                     |
| MS (1)        | +1                     |
| CS (2)        | +2                     |

When the infection's Healing Rate rises to **6 or greater**, the infection is
**healed**, and normal [injury healing](Injury.md#injury-healing-test) can resume.

## See also

- [Injury](Injury.md), [Healing Base](Healing_Base.md), [Fatigue](Fatigue.md),
  [Afflictions](Afflictions.md).
