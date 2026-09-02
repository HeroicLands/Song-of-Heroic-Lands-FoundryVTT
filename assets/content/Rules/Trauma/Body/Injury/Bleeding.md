---
aliases:
  - Bleeding
  - Blood Loss
  - Blood Loss Advance Test
  - Blood Stoppage Test
id: edDvJKnODEldyaSh
type: doc
subType: rules
name:
  full: Bleeding
  aliases: []
shortcode: bleeding
folder: F4NGyU9QQgWwTcHe
---

A physical [[doc-injrylvl|Injury]] marked as **bleeding** is losing blood in a life-threatening way. Left unchecked, a bleeder will likely kill the character within **10–15 minutes** unless the bleeding is staunched.

## Blood Loss Advance Test {#blood-loss-advance-test}

Every **5 minutes** after acquiring a bleeder, the injured character makes a **Blood Loss Advance Test** for _each_ bleeding injury. The test is made against the character's **Strength Mastery Level**:

| Success Level | Blood Loss Points |
| ------------- | ----------------- |
| CF (−1)       | +3                |
| MF (0)        | +2                |
| MS (1)        | +1                |
| CS (2)        | 0 (no blood loss) |

### Shock State

Blood loss worsens the victim's [[doc-shock|Shock]]: each Blood Loss Point (BLP) accrued **advances the shock state one step**, from No Shock up toward Dead.

| Steps | Shock State   |
| ----- | ------------- |
| 0     | No Shock      |
| 1     | Stunned       |
| 2     | Incapacitated |
| 3     | Unconscious   |
| 4+    | Dead          |

So a character who is **Incapacitated** and accrues 1 BLP becomes **Unconscious**; accruing 2 BLP instead would kill them. (This is the ordinal counterpart of the [[doc-shock#shock-state-index|Shock State Index]] that injuries drive.)

### Anemia

Each Blood Loss Advance Test also inflicts **5 points of [[doc-fatigue|weakness fatigue]] per Blood Loss Point** accrued, representing the anemia of ongoing blood loss. This fatigue is applied every time the test is made.

### Stoppage comes first

The chance to staunch comes first. Before each Blood Loss Advance Test, a physician at the bleeding character's side may attempt a [[#blood-stoppage-test|Blood Stoppage Test]]. If none is attempted by the end of the round, the Blood Loss Advance Test proceeds as though a Blood Stoppage Test had been a Critical Failure — the bleeding continues.

## Blood Stoppage Test {#blood-stoppage-test}

A character with the **Physician** skill may attempt to staunch a bleeding injury once every 5 minutes with a **Blood Stoppage Test** — a Physician [[doc-sccsstst|Success Tests]] naming the specific injury to treat:

| Success Level | Effect                                                                      |
| ------------- | --------------------------------------------------------------------------- |
| CF (−1)       | Bleeding continues.                                                         |
| MF (0)        | Bleeding continues; **+10** to the next Blood Stoppage Test on this injury. |
| MS (1)        | Bleeding stops **after** the next Blood Loss Advance Test.                  |
| CS (2)        | Bleeding stops **immediately**.                                             |

A Blood Stoppage Test names the one injury it treats, and its result applies to that injury alone. A character bleeding from more than one wound must have each bleeder staunched separately.

## See also

- [[doc-hlngtst|Healing Test]] — periodic recovery of injuries and restoration of lost blood once the bleeding has stopped.
- [[doc-sccsstst#success-level|Success levels]] — the CF / MF / MS / CS scale used throughout.
