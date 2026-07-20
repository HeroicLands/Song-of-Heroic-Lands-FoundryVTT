---
aliases:
    - Shock
    - Shock State
    - Shock State Index
    - Shock Re-Test
    - Extended Shock
    - Coma
id: Sh0ckSt8Zn5cLwR4
type: doc
package: sohl
category: user-guide
name:
    full: Shock
    aliases: []
folder: RqKUTBUBN2Y3MHYB
slug: sohl-shock
---

Violent injury and heavy blood loss can drive a creature into **shock** — a
worsening spiral from disorientation to death. A creature is always in exactly
one **Shock State**, and while in any shock state it **cannot concentrate** until
it recovers.

Ordinary (normal) shock is a **very temporary** condition: a stunned, incapacitated,
or unconscious victim shakes it off quickly through a [Shock Re-Test](#shock-re-test).
Only a _failed_ Re-Test drops a victim into the lasting condition of
[Extended Shock](#extended-shock) (or a [Coma](#coma)), which has no time limit
on recovery.

## Shock States

| Shock State       | Effect (summary)                                                                                                                                                                                                                                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **None**          | No shock.                                                                                                                                                                                                                                                                                                                                    |
| **Stunned**       | Reeling and disoriented. All movement is Difficult and double Moves are barred; every Impaired test drops one Success Level. At the end of the next turn (and each turn after) the victim may attempt a [Shock Re-Test](#shock-re-test) to shake it off. A second Stunned result while already Stunned worsens immediately to Incapacitated. |
| **Incapacitated** | Awake but knocked prone. Only an assisted Difficult half Move is possible, with no actions of the victim's own, and every melee attack must be Ignored. A Shock Re-Test is made at the end of the next turn. A fresh Incapacitated result while already Incapacitated drops the victim to Unconscious.                                       |
| **Unconscious**   | Blacked out and prone — unaware, unable to act, and Helpless (melee attackers score a Critical Success Ignore). A Shock Re-Test is made ten minutes later.                                                                                                                                                                                   |
| **Dead**          | The victim dies on the spot.                                                                                                                                                                                                                                                                                                                 |

## Shock State Index

Which shock state a creature is in is driven by its **Shock State Index (SSI)** —
a running numeric index that maps to a state:

| Shock State Index | Shock State   |
| ----------------- | ------------- |
| ≤ 6               | None          |
| 7                 | Stunned       |
| 8                 | Incapacitated |
| 9                 | Unconscious   |
| ≥ 10              | Dead          |

When an injury is sustained, its shock contribution is computed as the **body
location's Shock Value + the Injury Level + the result of a Shock Skill test**
(fatigue penalty applies; injury-impairment penalties do not):

| Shock Test | Shock State Index |
| ---------- | ----------------- |
| CF (−1)    | +2                |
| MF (0)     | +1                |
| MS (1)     | 0                 |
| CS (2)     | −1                |

Other effects raise a creature's shock state by their own means — most notably
[blood loss](Bleeding.md#blood-loss-advance-test), which advances the shock state
one step per Blood Loss Point.

### Implementation

The shock state **is** a set of **status effects** (Active Effects on the actor):
there is one status effect for each shock state — **Stunned**, **Incapacitated**,
**Unconscious**, and **Dead**. When none is present the state is **None**.
Normally exactly one is active; if more than one is somehow present, the **most
severe (highest) one is the creature's shock state**. A `BeingLogic` accessor
reports the current shock state as the highest active status, so consumers never
inspect the individual effects.

All changes go through a single **set-shock-state** operation that first **clears
every** shock status effect and then applies only the one for the new state (and
none for _None_). This keeps transitions clean in **both** directions and repairs
any stray multiple-status situation: improving from Unconscious to Stunned, for
example, removes the Unconscious effect, so the accessor does not keep reporting
the higher state. An effect that changes the shock state (blood loss, an injury
shock result, a Shock Re-Test) reads the current state, computes the new one, and
sets it through this operation.

## Shock Re-Test

A victim who is **Incapacitated** or **Unconscious** makes a **Shock Re-Test** to
try to recover: a **Shock** skill test at **−20** (fatigue penalties apply;
injury-impairment penalties do not). It is made at the end of the next turn for
an Incapacitated victim, or ten minutes later for an Unconscious one.

| Success Level | Result                                                                                  |
| ------------- | --------------------------------------------------------------------------------------- |
| CF (−1)       | Incapacitated → [Extended Shock](#extended-shock) at HR 4. Unconscious → [Coma](#coma). |
| MF (0)        | The victim slips into [Extended Shock](#extended-shock) at HR 5.                        |
| MS (1)        | The shock state improves to **Stunned**.                                                |
| CS (2)        | The victim recovers from all shock states.                                              |

## Extended Shock

Unlike ordinary shock — a very temporary state shaken off with a Shock Re-Test —
**Extended Shock** is a lasting condition. When an Incapacitated or Unconscious
victim **fails** a Shock Re-Test, they fall into it — pale, clammy,
cold-sweating, and sapped of strength — and stay **locked in their shock state
with no time limit** on recovery:

- **Incapacitated** in Extended Shock is senseless and cannot communicate
  clearly; with support (and if their wounds allow) they can manage a Difficult
  half Move, but every ten minutes spent moving this way adds Personal Fatigue.
- **Unconscious** in Extended Shock is completely out — unaware, defenseless, and
  unable to act.

Extended Shock is recorded as a **new injury** whose **Healing Rate is 4 or 5**
(per the failed Shock Re-Test), with Injury Level and Aspect marked "X" (not
applicable) and Location set to the body location that caused it.

### Extended Shock Course Test

Once every **four hours** the victim rolls an **Initiative** skill test against
**`Healing Base × HR`** (HR 4 or 5). Fatigue continues to affect this test, and
there is **no recovery from fatigue** while in Extended Shock.

| Success Level | Change to HR |
| ------------- | ------------ |
| CF (−1)       | −2           |
| MF (0)        | −1           |
| MS (1)        | +1           |
| CS (2)        | +2           |

If HR falls to **0 or below** the victim dies. If HR rises to **6 or greater**
the victim comes out of Extended Shock and is no longer Incapacitated or
Unconscious (a victim in a [Coma](#coma) remains in the coma).

## Coma

A **coma** is a state of deep unconsciousness in which the victim is near death —
unaware and wholly unable to act, communicate, or care for themselves.

A coma is recorded as a **new injury** with Injury Level and Aspect marked "X",
and a Healing Rate of **`12 − Location Shock Value − Injury Level`**, using the
Shock Value of the location that induced the coma.

### Coma Course Test

Every **d10 days** the victim may make a Course Roll — a test of
**`Healing Base × Coma Healing Rate`**:

| Success Level | Change to Coma HR |
| ------------- | ----------------- |
| CF (−1)       | −2                |
| MF (0)        | −1                |
| MS (1)        | +1                |
| CS (2)        | +2                |

If HR falls to **0 or below** the victim dies. If HR rises to **6 or greater**
the victim comes out of the coma, but carries **weariness fatigue equal to the
number of days spent in the coma**.

## See also

- [Injury](Injury.md) — how injuries generate shock and impairment.
- [Bleeding](Bleeding.md) — blood loss advancing the shock state.
- [Fatigue](Fatigue.md) — the fatigue that penalizes shock and course tests.
