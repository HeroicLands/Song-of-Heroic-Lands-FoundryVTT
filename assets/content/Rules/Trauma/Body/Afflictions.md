---
aliases:
    - Afflictions
    - Affliction
    - Course Test
    - Incubation Period
    - Symptomatic Period
id: Tt1JjQ3kmqtUDIm9
type: doc
package: sohl
category: rules
name:
    full: Afflictions
    aliases: []
shortcode: afflctns
folder: edGOkxiCotuMzc1O
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
often the body's [[#course-test|Course Test]] is made.

## Affliction vs. Trauma {#affliction-vs-trauma}

An affliction and a [[doc/traumaintro|trauma]] are the two kinds of lasting harm a
character can carry, and they are easy to confuse. The distinction is **process vs.
state**:

- An **affliction** is an ongoing, hostile _agent_ acting on the Being over
  time. It has a source, a means of transmission, a course it runs (incubation →
  onset → symptomatic → outcome), a **Healing Rate** that its
  [[#course-test|Course Test]] drives up or down, and a terminal
  [[#outcome|outcome]] of death or cure. Diseases, poisons, and maladictions are
  afflictions: _something is attacking the Being_, and it will get better or
  worse.
- A **[[doc/traumaintro|trauma]]** is a _condition the Being is in_ — usually the
  result of harm or stress that it then carries and recovers from. Injuries,
  fatigue, fear, morale, shock, infection, aural shock, and the Pall are traumas.

The same event can produce both: a snakebite inflicts a **poison/toxin
affliction** (the venom running its course) and, where it breaks the skin, an
**[[doc/injrylvl|injury]] trauma** (the wound). When in doubt, ask _"is this an
agent running a course, or a condition being carried?"_ — the former is an
affliction, the latter a trauma.

## Subtypes {#subtypes}

An affliction's **subtype** classifies it by the _nature of the afflicting
agent_:

| Subtype          | Nature       | Examples                                  |
| ---------------- | ------------ | ----------------------------------------- |
| **Poison/Toxin** | Chemical     | venom, mandrake, hemotoxin                |
| **Disease**      | Biological   | typhoid, tuberculosis, river blindness    |
| **Maladiction**  | Supernatural | a curse, a hex, a divine or spirit blight |
| **Other**        | —            | anything not covered above                |

The subtype is descriptive: it does **not** change the
[[#course-test|Course Test]] or [[#outcome|outcome]] machinery, which is the
same for every affliction. It classifies the affliction thematically and governs
which afflictions spread as **contagious diseases** — only **Disease**-subtype
afflictions do. A **maladiction** is never contagious in that sense; it reaches a
victim only by the arcane, divine, or spirit means its author specifies.

## Transmission and contagion

How an affliction reaches a new victim is set by its **transmission** mode:

- **Physical** — airborne, contact, body-fluid, ingested, proximity, or by a
  **vector** (an insect or animal bite).
- **Supernatural** — by **perception** (sight or sound), or by **arcane**,
  **divine**, or **spirit** means.
- **None** — not transmissible at all.

A contagious disease also carries a **Contagion Index (CI)**, from 1 to 5,
describing how readily it spreads: **the lower the index, the more contagious**.
When a character is exposed, whether they contract it is a success test against a
target of **CI × the character's Endurance** — a lower index yields a lower target
and so a greater chance of contraction. Only **[[#subtypes|Disease]]**-subtype
afflictions spread by exposure this way; poisons and maladictions reach a victim
by their own specific means, not by casual exposure.

Exposure and contraction are two different things. Being exposed is something the
world does to a character; whether they catch it is their own roll, and it is
always made on the exposed character's side.

## Dormancy

An affliction may lie **dormant**, having no onset or other effect on its host.
While dormant it can still be transmitted (depending on the specific affliction),
but it does not proceed to onset or any further state — it is simply marked
**Dormant**, and the host may never realize they carry it.

## Onset

When the Incubation Period ends, the affliction reaches **onset** and becomes
**symptomatic**. Because an affliction can be almost anything, its symptoms are a
matter of play — described and role-played by the GM and players rather than
prescribed here. What onset settles is the mechanical clock: from that moment the
affliction is **symptomatic**, and its [[#course-test|Course Test]] and
[[#outcome|resolution]] cycle begin.

A particular affliction may also carry consequences of its own that fall due at
onset — a specific weakness, a lost sense, a compulsion. These belong to that
affliction, not to the general rule.

## Course Test {#course-test}

Once onset has occurred, the body fights the affliction. Each course period the
character makes a **Course Test** — a d100 rolled against the affliction's
**Course target** — and its [[doc/sccsstst#success-level|success level]] changes
the **affliction's Healing Rate**:

| Success Level | Change to affliction's Healing Rate |
| ------------- | ----------------------------------- |
| CF (−1)       | −2                                  |
| MF (0)        | −1                                  |
| MS (1)        | +1                                  |
| CS (2)        | +2                                  |

The Course target is **Healing Base × the affliction's current Healing Rate** (see
[[Healing Test]] for both), modified by anything acting on the
affliction's course — a physician's [[#diagnosis-and-treatment|treatment bonus]]
foremost among them. A worsening affliction is therefore self-reinforcing: as its
Healing Rate falls the target falls with it, and each test is harder to pass than
the last.

One check yields exactly one test. However much time has passed, a Course Test is
rolled once, and whether another follows is the table's decision.

### Reaction {#reaction}

Starting after the first Course Test, the affliction's current Healing Rate (HR)
determines the host's reaction:

| Healing Rate | Reaction                                        |
| ------------ | ----------------------------------------------- |
| HR 6+        | Affliction defeated — it resolves as **cured**. |
| HR 5         | 5 weakness fatigue.                             |
| HR 4         | 10 weakness fatigue.                            |
| HR 3         | Stunned, and 10 weakness fatigue.               |
| HR 2         | Incapacitated, and 10 weakness fatigue.         |
| HR 1         | Unconscious, and 10 weakness fatigue.           |
| HR &lt; 1    | Dead.                                           |

The weakness fatigue an affliction inflicts is **its own**: repeating a reaction
adjusts that fatigue rather than stacking a second lot of it, and defeating the
affliction clears it. A shock state only ever worsens — a reaction never improves
a character who is already in a worse state than it would impose.

## Healing Test

Where the Course Test asks whether the affliction is winning, the **Healing Test**
asks whether the body is throwing it off. It works exactly as the
[[doc/hlngtst|Injury Healing Test]] does: a d100 against the
affliction's **Healing target** — again **Healing Base × Healing Rate** — reducing
the affliction's **Level**:

| Success Level | Change to affliction's Level |
| ------------- | ---------------------------- |
| CF (−1)       | No progress.                 |
| MF (0)        | No progress.                 |
| MS (1)        | −1                           |
| CS (2)        | −2                           |

An affliction reduced to **Level 0** has run its course and is finished with.

The Course target and the Healing target start from the same arithmetic but are
separate values, and either can be modified independently — a treatment that
improves the odds of fighting an affliction off need not make its course any
kinder.

## Diagnosis and treatment {#diagnosis-and-treatment}

Treatment for an affliction is **mostly ineffectual**, and that is deliberate: the
body either fights the affliction off or it does not. A physician can improve the
odds; they cannot cure by treating.

A patient may **request treatment**, which any physician can answer. The physician
makes a **Treatment Success Value test** against their own Physician skill, and the
[[doc/sccssvlt#value-diamonds|Value Diamonds]] it earns become the proposed
**Course Bonus**:

| Treatment result   | Course Bonus |
| ------------------ | ------------ |
| No Value Diamonds  | 0            |
| _n_ Value Diamonds | +_n_         |

The patient then accepts the treatment, which records the **treatment date** and
applies the Course Bonus. A bonus above zero is a **standing modifier on the
affliction's Course target**, not a one-off adjustment — it applies to every
subsequent [[#course-test|Course Test]] for as long as the treatment stands, and it
can be inspected, adjusted, or removed later. A bonus of zero records the
treatment date and nothing else: the physician tried, and it did not help.

Nothing about this is imposed. The physician's roll proposes; the patient's side
accepts.

## Outcome {#outcome}

When the Symptomatic Period ends, if the affliction has **not** been defeated
(has not reached HR 6), its **outcome** is applied. Every affliction names an
outcome, and it is one of two:

- **Death** — the character dies.
- **Cured** — the affliction is defeated: its Healing Rate becomes 6 and it
  troubles the character no further.

An affliction may _also_ name one or more **outcome traumas** — the
[[doc/traumaintro|traumas]] the host is left with when it runs its course. These
combine with the outcome above: an affliction that ends **Cured** but leaves a
lasting weakness frees its victim of the disease and marks them permanently. The
fever breaks; the blindness stays.

An outcome applies **only** if the affliction reaches the end of the Symptomatic
Period without being healed. An affliction the body throws off first has no
outcome at all.

## Infection

An **infection** is a specific form of affliction, contracted when an injury's
[[doc/hlngtst|Injury Healing Test]] critically fails. Its
Healing Rate starts one step higher than the infected injury's — the injury's
Healing Rate + 1.

Instead of the normal affliction [[#reaction|reaction]], an infection uses this
table:

| Healing Rate | Reaction            |
| ------------ | ------------------- |
| HR 1–2       | 10 weakness fatigue |
| HR 3–4       | 5 weakness fatigue  |
| HR 5+        | None                |

While a character carries **any** active infection, all of their
[[doc/hlngtst|Injury Healing Tests]] are suspended until every
infection has been defeated.

## See also

- [[Healing Test]] — Healing Base and Healing Rate, and the
  recovery of ordinary injuries.
- [[doc/traumaintro|Trauma]] — the conditions an affliction can leave behind.
