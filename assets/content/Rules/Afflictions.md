---
aliases:
    - Afflictions
    - Affliction
    - Course Test
    - Incubation Period
    - Symptomatic Period
id: Afl1ct8mZp5cH3jY
type: doc
package: sohl
category: user-guide
name:
    full: Afflictions
    aliases: []
slug: sohl-afflictions
folder: RqKUTBUBN2Y3MHYB
---

An **affliction** represents an unhealthy state, often caused by chemical,
biological, arcane, or divine means — a disease, a poison, a curse. Every
affliction runs through three phases: an **Incubation Period**, a **Symptomatic
Period**, and an **Outcome**.

- **Incubation Period** — the time between contracting the affliction and its
  **Onset**. The affliction is present in the body (and possibly transmissible)
  but causes no apparent effect.
- **Symptomatic Period** — the time after onset but before the final outcome,
  when symptoms occur. Their level and impact may vary widely during this time.
- **Outcome** — the affliction's ultimate conclusion. Depending on the
  affliction, this may be death, a lasting disability, a physical or
  psychological disorder, or complete recovery.

Accordingly, every affliction has an **onset duration** (the Incubation Period,
from contract date to onset date) and an **outcome duration** (the Symptomatic
Period, from onset date to outcome date), plus a **healing-check period** — how
often the body's [Course Test](#course-test-healing) is made.

## Dormancy

An affliction may lie **dormant**, having no onset or other effect on its host.
While dormant it can still be transmitted (depending on the specific affliction),
but it does not proceed to onset or any further state — it is simply marked
**Dormant**, and the host may never realize they carry it.

## Onset

When the Incubation Period ends, the affliction reaches **onset** and becomes
**symptomatic**. Because an affliction can be almost anything, its symptoms are
usually a matter of play — described and role-played by the GM and players rather
than modeled by the system — so at onset the system simply marks the affliction
**Symptomatic** and begins its [Course Test](#course-test-healing) and
[resolution](#outcome) cycle.

An affliction may also name an **optional onset macro** — a Macro (referenced by
UUID) that runs at onset. This lets an author attach concrete mechanical
consequences to a specific affliction, and the macro may itself schedule further
events. (As always, the affliction carries only a _reference_ to the macro, never
executable code.)

## Course Test (healing)

Once onset has occurred, the body fights the affliction. Each healing-check
period the character makes a **Course Test** against **Healing Base × the
affliction's Healing Rate** (see [Healing Roll](Healing_Roll.md) for Healing
Base and Healing Rate). The result changes the **affliction's Healing Rate**:

| Success Level | Change to affliction's Healing Rate |
| ------------- | ----------------------------------- |
| CF (−1)       | −2                                  |
| MF (0)        | −1                                  |
| MS (1)        | +1                                  |
| CS (2)        | +2                                  |

## Reaction

Starting after the first Course Test, the affliction's current Healing Rate (HR)
determines the host's reaction:

| Healing Rate | Reaction                                        |
| ------------ | ----------------------------------------------- |
| HR 6+        | Affliction defeated (removed or left inactive). |
| HR 5         | 5 weakness fatigue.                             |
| HR 4         | 10 weakness fatigue.                            |
| HR 3         | Stunned.                                        |
| HR 2         | Incapacitated.                                  |
| HR 1         | Unconscious.                                    |
| HR &lt; 1    | Dead.                                           |

## Outcome

When the Symptomatic Period ends, if the affliction has **not** been defeated
(has not reached HR 6), its **outcome** is applied. Every affliction declares its
outcome in two authored fields:

- **`outcome`** — the affliction's standard result, one of:
    - **`AFFLICTION_OUTCOME.DEATH`** — the character's state becomes _dead_.
    - **`AFFLICTION_OUTCOME.CURED`** — the affliction is defeated (its Healing
      Rate becomes 6).
- **`outcomeTrauma`** _(optional)_ — a
  [Safe Expression](../User_Guide/Safe_Expressions.md) that evaluates to a single
  shortcode, or an array of shortcodes, of the [traumas](Trauma.md) the host
  contracts as part of the outcome. Matching traumas are searched first among the
  world's items, then in the compendiums, and the first match found is used.

The two fields combine. For example, an affliction with `outcome` set to
**Cured** and `outcomeTrauma` set to `"weakness20"` leaves the host cured of the
affliction but saddled with a **new trauma** — the one whose shortcode is
`weakness20`.

These outcomes apply **only** if the affliction reaches the end of the
Symptomatic Period without being healed.

## Infection

An **infection** is a specific form of affliction, contracted when an injury's
[Injury Healing Test](Trauma.md#injury-healing-test) critically fails. Its
Healing Rate starts one step higher than the infected injury's — the injury's
Healing Rate + 1.

Instead of the normal affliction [reaction](#reaction), an infection uses this
table:

| Healing Rate | Reaction            |
| ------------ | ------------------- |
| HR 1–2       | 10 weakness fatigue |
| HR 3–4       | 5 weakness fatigue  |
| HR 5+        | None                |

While a character carries **any** active infection, all of their
[Injury Healing Tests](Trauma.md#injury-healing-test) are suspended until every
infection has been defeated.

## See also

- [Healing Roll](Healing_Roll.md) — Healing Base and Healing Rate, and the
  recovery of ordinary injuries.
- [Safe Expressions](../User_Guide/Safe_Expressions.md) — the language used by the
  `outcomeTraits` / `outcomeTraumas` fields.
