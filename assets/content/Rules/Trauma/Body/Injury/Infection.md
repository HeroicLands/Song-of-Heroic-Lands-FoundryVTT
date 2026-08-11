---
aliases:
    - Infection
    - Infection Healing Test
id: oG7E0HWgfvWL6uUQ
type: doc
package: sohl
category: rules
name:
    full: Infection
    aliases: []
folder: F4NGyU9QQgWwTcHe
shortcode: infctn
---

Some injuries can become **infected**. When such an injury's
[[Rules/hlngtst|Injury Healing Test]] comes up a **Critical
Failure**, a new infection takes hold. An infection starts with a **Healing Rate
one step higher than the injury it came from** (originating injury HR + 1).

## Weakness

An infection saps the body, inflicting [[Rules/fatigue|weakness fatigue]] according to
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
active infection, **no** [[Rules/hlngtst|Injury Healing Tests]]
are made for them until every infection has been defeated.

## Infection Healing Test

An infection heals through the **Infection Healing Test** — a test of
**`Healing Base × Infection Healing Rate`** (see [[Healing Base]]).
The result changes the infection's Healing Rate:

| Success Level | Change to Infection HR |
| ------------- | ---------------------- |
| CF (−1)       | −2                     |
| MF (0)        | −1                     |
| MS (1)        | +1                     |
| CS (2)        | +2                     |

When the infection's Healing Rate rises to **6 or greater**, the infection is
**healed**, and normal [[Rules/hlngtst|injury healing]] can resume.

## See also

- [[Rules/injrylvl|Injury]], [[Healing Base]], [[Fatigue]],
  [[Afflictions]].
