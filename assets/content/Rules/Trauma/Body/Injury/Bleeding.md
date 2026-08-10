---
aliases:
    - Bleeding
    - Blood Loss
    - Blood Loss Advance Test
    - Blood Stoppage Test
id: edDvJKnODEldyaSh
type: doc
package: sohl
category: rules
name:
    full: Bleeding
    aliases: []
slug: sohl-bleeding
shortcode: bleeding
folder: F4NGyU9QQgWwTcHe
---

A physical [[User_Guide/afflandi|Injury]] marked as **bleeding**
is losing blood in a life-threatening way. Left unchecked, a bleeder will likely
kill the character within **10–15 minutes** unless the bleeding is staunched.

## Blood Loss Advance Test {#blood-loss-advance-test}

Every **5 minutes** after acquiring a bleeder, the injured character makes a
**Blood Loss Advance Test** for _each_ bleeding injury. The test is made against
the character's **Strength Mastery Level**:

| Success Level | Blood Loss Points |
| ------------- | ----------------- |
| CF (−1)       | +3                |
| MF (0)        | +2                |
| MS (1)        | +1                |
| CS (2)        | 0 (no blood loss) |

### Shock State

Blood loss worsens the victim's [[Shock State]]: each Blood Loss Point
(BLP) accrued **advances the shock state one step**, from No Shock up toward
Dead.

| Steps | Shock State   |
| ----- | ------------- |
| 0     | No Shock      |
| 1     | Stunned       |
| 2     | Incapacitated |
| 3     | Unconscious   |
| 4+    | Dead          |

So a character who is **Incapacitated** and accrues 1 BLP becomes
**Unconscious**; accruing 2 BLP instead would kill them. (This is the ordinal
counterpart of the [[Rules/shock#shock-state-index|Shock State Index]] that injuries
drive.)

### Anemia

Each Blood Loss Advance Test also inflicts **5 points of
[[Rules/fatigue|weakness fatigue]] per Blood Loss Point** accrued, representing the
anemia of ongoing blood loss. This fatigue is applied every time the test is
made.

### In play

When a Blood Loss Advance Test comes due, the system first presents a request
for a [[#blood-stoppage-test|Blood Stoppage Test]]: a dialog announcing that the
character is bleeding, with an **Accept** button. The Accept button appears only
for characters with the **Physician** skill. If no one accepts the request by
the end of the round, the Blood Loss Advance Test proceeds as though a Blood
Stoppage Test had been a Critical Failure — the bleeding continues.

## Blood Stoppage Test {#blood-stoppage-test}

A character with the **Physician** skill may attempt to staunch a bleeding
injury once every 5 minutes with a **Blood Stoppage Test** — a Physician
[[skill test]] naming the specific injury to treat:

| Success Level | Effect                                                                      |
| ------------- | --------------------------------------------------------------------------- |
| CF (−1)       | Bleeding continues.                                                         |
| MF (0)        | Bleeding continues; **+10** to the next Blood Stoppage Test on this injury. |
| MS (1)        | Bleeding stops **after** the next Blood Loss Advance Test.                  |
| CS (2)        | Bleeding stops **immediately**.                                             |

### In play

The physician sees a card in the chat log requesting a Blood Stoppage Test.
Clicking **Accept** rolls their Physician test, and the result is conveyed back
to the bleeding character (resolving the pending Blood Loss Advance Test).

## See also

- [[Healing Test]] — periodic recovery of injuries and restoration
  of lost blood once the bleeding has stopped.
- [[Success Tests]] — the CF / MF / MS / CS success levels used
  throughout.
