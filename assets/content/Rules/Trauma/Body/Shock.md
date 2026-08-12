---
aliases:
    - Shock
    - Shock State
    - Shock State Index
    - Shock Re-Test
    - Extended Shock
id: im1oSbKUZQFCBBI8
type: doc
package: sohl
category: rules
name:
    full: Shock
    aliases: []
folder: edGOkxiCotuMzc1O
shortcode: shock
---

A sudden, overwhelming strain can drive a creature into **shock** — a worsening
spiral from disorientation to death. Violent injury and heavy blood loss are the
most common causes, but fear and other systemic or psychological forces can bring
it on just the same. A creature is always in exactly one **Shock State**, and
while in any shock state it **cannot concentrate** until it recovers.

Ordinary (normal) shock is a **very temporary** condition: a stunned, incapacitated,
or unconscious victim shakes it off quickly through a [[#shock-re-test|Shock Re-Test]].
Only a _failed_ Re-Test drops a victim into the lasting condition of
[[#extended-shock|Extended Shock]] (or a [[doc/coma|Coma]]), which has no time limit
on recovery.

## Shock States

| Shock State       | Effect (summary)                                                                                                                                                                                                                                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **None**          | No shock.                                                                                                                                                                                                                                                                                                                                                                      |
| **Stunned**       | Reeling and disoriented. All movement is Difficult and double Moves are barred; every Impaired test drops one [[doc/sccsstst#success-level\|Success Level]]. At the end of the next turn (and each turn after) the victim may attempt a [[#shock-re-test\|Shock Re-Test]] to shake it off. A second Stunned result while already Stunned worsens immediately to Incapacitated. |
| **Incapacitated** | Awake but knocked prone. Only an assisted Difficult half Move is possible, with no actions of the victim's own, and every melee attack must be Ignored. A Shock Re-Test is made at the end of the next turn. A fresh Incapacitated result while already Incapacitated drops the victim to Unconscious.                                                                         |
| **Unconscious**   | Blacked out and prone — unaware, unable to act, and Helpless (melee attackers score a Critical Success Ignore). A Shock Re-Test is made ten minutes later.                                                                                                                                                                                                                     |
| **Dead**          | The victim dies on the spot.                                                                                                                                                                                                                                                                                                                                                   |

## Shock State Index {#shock-state-index}

Which shock state a creature is in is driven by its **Shock State Index (SSI)** —
a running numeric index that maps to a state:

| Shock State Index | Shock State   |
| ----------------- | ------------- |
| ≤ 6               | None          |
| 7                 | Stunned       |
| 8                 | Incapacitated |
| 9                 | Unconscious   |
| ≥ 10              | Dead          |

### The Shock Test

Whenever a force threatens a creature with shock, it makes a **Shock Test**. The
force supplies a **base SSI**, and the creature rolls its **Shock** skill to resist;
the result adjusts the base index up or down (the creature's fatigue penalty
applies, but body-part impairment penalties do not):

| Shock Test | Adjustment to base SSI |
| ---------- | ---------------------- |
| CF (−1)    | +2                     |
| MF (0)     | +1                     |
| MS (1)     | 0                      |
| CS (2)     | −1                     |

The adjusted index maps to a shock state on the table above. That state is then
**offered** to the creature's controlling player, never imposed — and only ever to
_worsen_ the current state (a lesser result never lifts a worse one; recovery is
the [[#shock-re-test|Shock Re-Test]]). Two shortcuts skip the roll entirely: a base
SSI **below 5** is too slight to threaten shock at all, and a base SSI **above 10**
is immediately **Dead**.

**Sources of a base SSI.** Shock is not specific to injury — the base index can
come from any cause:

- **Injury** — the struck body **location's Shock Value + the Injury Level**, plus
  **1** more if the blow was a [[doc/character#from-blow-to-injury|glancing one]].
  Every body location carries its own Shock Value: on a human the skull, eyes,
  nose, and neck are the worst at 5, the forearm and calf the mildest at 1. Other
  body structures carry their own values. See
  [[doc/character#shock|Body Structure → Shock]].
- **Fear and other systemic or psychological forces** — each by its own measure.

**Modifiers to the roll.** Two circumstances adjust the Shock Test itself rather
than the index: a **glancing blow** grants **+10**, and an amputation check that
ended in a **marginal success** imposes **−20**.

**Worked example.** A blow to a human's skull (Shock Value 5) inflicts an S3 wound
(Injury Level 3), so the base SSI is 8 — within the 5–10 band, so a Shock Test is
made. A Marginal Success leaves it at 8: **Incapacitated**. A Critical Success pulls
it to 7: **Stunned**. A Marginal Failure pushes it to 9: **Unconscious**. The same
wound to the forearm (Shock Value 1) would open at 4 — below 5, so no roll is made
and no shock results at all.

Some effects instead raise the shock state directly, by their own means — most
notably [[doc/bleeding#blood-loss-advance-test|blood loss]], which advances the shock
state one step per Blood Loss Point.

### One state at a time

A creature is in exactly **one** shock state — **None**, **Stunned**,
**Incapacitated**, **Unconscious**, or **Dead** — never two at once. Whatever
changes it (blood loss, an injury's shock result, a Shock Re-Test) **replaces**
the state rather than adding to it, and the change runs in both directions: a
victim who improves from Unconscious to Stunned is Stunned, and no longer
unconscious in any degree.

Where two things would set the state at once, the **more severe** one holds.

## Shock Re-Test {#shock-re-test}

A victim who is **Incapacitated** or **Unconscious** makes a **Shock Re-Test** to
try to recover: a **Shock** skill test at **−20** (fatigue penalties apply;
injury-impairment penalties do not). It is made at the end of the next turn for
an Incapacitated victim, or ten minutes later for an Unconscious one.

| Success Level | Result                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------- |
| CF (−1)       | Incapacitated → [[#extended-shock\|Extended Shock]] at HR 4. Unconscious → [[doc/coma\|Coma]]. |
| MF (0)        | The victim slips into [[#extended-shock\|Extended Shock]] at HR 5.                             |
| MS (1)        | The shock state improves to **Stunned**.                                                       |
| CS (2)        | The victim recovers from all shock states.                                                     |

## Extended Shock {#extended-shock}

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

Once every **four hours** the victim makes a Course Roll — a test of
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
Unconscious (a victim in a [[doc/coma|Coma]] remains in the coma).

## See also {#see-also}

- [[doc/coma|Coma]] — the deep unconsciousness a Critically Failed Re-Test ends in.
- [[doc/injrylvl|Injury]] — how injuries generate shock and impairment.
- [[doc/character#body-structure|Body Structure]] — the Shock Value each body location carries.
- [[Bleeding]] — blood loss advancing the shock state.
- [[Fatigue]] — the fatigue that penalizes shock and course tests.
