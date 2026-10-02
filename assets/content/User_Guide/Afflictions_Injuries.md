---
shortcode: afflinjug
name: {full: "Afflictions and Injuries"}
type: doc
subType: userguide
data: {packFolder: userguide}
---

# Overview {#conditions-overview}

Characters in SoHL can suffer from two types of harm: **injuries** (physical wounds from combat or accidents) and **afflictions** (ongoing conditions like diseases, poisons, and curses). Both have their own lifecycle and can significantly affect a character's capabilities.

See also: [[doc-traumaug|Trauma]], [[doc-afflctnug|Afflictions]], [[doc-cmbtbscsug|Combat Basics]]

# Injuries {#conditions-injuries}

An **injury** represents a specific wound — a sword cut, a broken bone, a burn. Injuries are tied to specific **body locations** on the character's anatomy model.

An injury is one kind of **[[doc-traumaug|Trauma]]** — the item that records every sort of harm a character carries, from wounds and bleeding to fatigue, fear, and shock. See that page for the wound's properties and for the treatment, bleeding, and healing actions described below.

## How Injuries Happen

Injuries result from combat (when an attack successfully strikes) or from other sources of physical harm. The system determines:

- **Where** the injury occurs (which body location)
- **How severe** the injury is (injury level)
- **What effects** the injury has (penalties, bleeding, etc.)

## Injury Effects

Every injury carries an **Injury Level (IL)** from 1 to 5, banded into three
severities: **Minor** (IL 1), **Serious** (IL 2–3), and **Grievous** (IL 4–5).
The wound closes once its Level reaches 0.

**Skill penalties.** An injury impairs the whole **body part** it sits on, not
only the struck location, and the penalty is set by severity: Minor costs −5
(and only while the wound is slow to heal), Serious costs −10, and Grievous
makes the part **unusable** — any test that needs it automatically Critically
Fails. Several wounds on the same part never stack: the part takes only the
single worst penalty among them. Which of a character's tests a part's injury
actually penalizes depends on the **body roles** that part holds, and which
roles the skill or attribute being tested names.

**Shock.** A sufficiently severe blow can threaten shock — a worsening spiral
from Stunned, to Incapacitated, to Unconscious, to Dead. The struck location's
Shock Value plus the Injury Level set a base index, which the character's
**Shock** skill resists in a **Shock Test**; a poor result is offered to the
player and can only worsen the current shock state, never improve it. See
[[doc-shock|Shock]] (rules) for the full index and the Shock Re-Test that can
shake off an ordinary shock state.

**Stumble and fumble.** A location flagged for the mishap can cost a character
their footing or their grip: a Minor wound there risks nothing, a Serious wound
calls for a **keep-control test** (Agility or Acrobatics against a stumble,
Dexterity or Legerdemain against a fumble), and a Grievous wound causes the
mishap automatically. See [[doc-character#mishaps-fumble-and-stumble|Body
Structure]] (rules) for which locations carry which flag.

## Healing

**An untreated wound does not heal.** Treatment is what starts the clock: a
physician makes a **Treatment Test**, rolling their Physician skill against a
difficulty set by the wound's Aspect and severity, and the result sets a
**Healing Rate (HR)** from 0 to 6 — the worse the roll, the lower the rate, and
a Critical Success on a Minor wound heals it outright. Until a Healing Rate is
recorded, every periodic **Healing Test** on the wound is an automatic Critical
Failure: no progress, and an infection if the wound is exposed to one.

Once treated, the wound recovers through periodic **Healing Tests** — one roll
of the character's **Healing Base × Healing Rate** each time the check comes
due:

| Result           | Effect                                                  |
| ---------------- | ------------------------------------------------------- |
| Critical Success | Injury Level drops by 2                                 |
| Marginal Success | Injury Level drops by 1                                 |
| Marginal Failure | No progress                                             |
| Critical Failure | No progress, and an infection if the wound can take one |

A wound that lingers long enough may leave a **permanent impairment**, scaled
to how many days it took to close.

**Cuts and fractures heal the same way** — the difference between wound types
is in what treating them takes, not in how they recover. A wound's **Aspect**
(Blunt, Edged, Piercing, or Fire) decides the required treatment action and its
difficulty: a simple fracture is splinted, a cut is cleaned and dressed, and a
grievous wound of any aspect needs surgery.

The whole sequence — requesting treatment, a physician answering it, and the
recurring Healing Test reminders — is described action by action on
[[doc-traumaug|Trauma]].

# Afflictions {#conditions-afflictions}

An **affliction** is an ongoing condition — a disease, poison, curse, or other persistent effect. Afflictions have a lifecycle that progresses through stages.

## Affliction Lifecycle

An affliction progresses through these stages:

1. **Transmission** — how the affliction spreads (contact, airborne, etc.)
2. **Contraction** — whether the character actually catches it (resistance test)
3. **Course** — the affliction's progression over time
4. **Diagnosis** — identifying what the affliction is
5. **Treatment** — applying remedies to cure or mitigate it
6. **Healing** — recovery from the affliction's effects

Each stage involves skill tests (typically Physician or related skills).

## The Lifecycle in Practice

Each stage uses a specific test, rolled against the affliction's own numbers
rather than a flat difficulty:

- **Contraction** is the Contagion Test below — a resistance roll against
  **Contagion Index × Endurance**.
- **Course** is a **Course Test**: a d100 against **Healing Base × the
  affliction's current Healing Rate**, made on its own recurring schedule. The
  result raises or lowers the Healing Rate — Critical Success +2, Marginal
  Success +1, Marginal Failure −1, Critical Failure −2 — and reaching HR 6
  defeats the affliction. Wherever the rate now sits, the character may take
  fatigue or a worsened shock state as a consequence.
- **Diagnosis** is not a roll the system makes: an affliction's SubType, Level,
  and Healing Rate are visible on the sheet to anyone who can see the item, so
  diagnosing it is a matter of looking, or of the table ruling that a character
  cannot yet tell what ails them.
- **Treatment** is a **Request Treatment** / physician's-Treatment-Success-Value
  exchange, exactly as an injury is treated. The physician's Value Diamonds
  come back as a **Course Bonus** that improves every later Course Test —
  treatment does not cure an affliction outright, only shortens the odds.
- **Healing** is tracked separately, by its own **Healing Test** against the
  same Healing Base × Healing Rate target, reducing the affliction's Level
  rather than its course.

**Concoction gear is not wired into any of these tests.** A potion, antidote,
or salve has no "use" action and no scripted effect on an affliction — applying
one is a table decision, the same as for any other concoction. Record its
effect as a Course Bonus through **Treat Affliction**, or by hand, exactly as
the table agrees it should apply.

The full action-by-action sequence — contraction, onset, the course, and
resolution — is described on [[doc-afflctnug|Affliction]].

## Contracting a Disease {#conditions-contract-disease}

When a character is exposed to a disease, use the **Contagion Check** action on the being (right-click the token or use the character's action menu). Only **diseases** can be contracted this way — poisons and curses are applied by other means.

The action opens a dialog offering:

- **A dropdown of every disease** found in your world and in the installed Item compendium packs. Picking one copies that disease onto the character if it is contracted.
- **A "Custom disease" option**, where you supply a **name** and a **Contagion Index (CI)** from 1 to 5. Choosing this creates a brand-new disease if it is contracted.

### The Contagion Roll

Contraction is decided by a single d100 **contagion roll** against a target of:

> **Contagion Index × Endurance**

The character rolls to resist. **Failing** the roll means the disease is contracted. Two consequences follow from the formula:

- **Higher Endurance protects.** A hardier character has a higher target and is more likely to resist.
- **The lower the CI, the more contagious the disease.** A low CI produces a low target that is easy to roll over (fail), so low-CI diseases spread readily; high-CI diseases are shrugged off more often.

If the roll fails, the disease is added to the character sheet as an affliction — either copied from the chosen source disease, or created fresh from the custom name and CI you entered — and then follows the normal affliction lifecycle (course, diagnosis, treatment, healing).

## Affliction Subtypes

Every affliction is one of four subtypes, fixed when it is created:

| Subtype          | Nature       | Examples                                  |
| ---------------- | ------------ | ----------------------------------------- |
| **Disease**      | Biological   | typhoid, tuberculosis, river blindness    |
| **Poison/Toxin** | Chemical     | venom, mandrake, hemotoxin                |
| **Maladiction**  | Supernatural | a curse, a hex, a divine or spirit blight |
| **Other**        | —            | anything the first three don't cover      |

**The subtype is descriptive, not mechanical.** Every affliction runs the same
Contraction, Course, and Resolution machinery regardless of subtype — the only
thing a subtype changes is which afflictions count as a contagious disease for
the Contagion Test above. Only **Disease** afflictions can be caught that way;
a poison, a curse, or anything in **Other** reaches a character by some other
means the table decides on.

# Managing Conditions on the Sheet {#conditions-managing}

Both Injuries and other Traumas (fatigue, shock, fear, and the rest) live
together on the Being sheet's **Health** tab, which lists everything a
character is currently carrying. Afflictions live in their own list on the
same tab, grouped by subtype.

Right-click a Trauma's or Affliction's row — or open it and use its **Actions**
tab — to reach everything it can do: requesting treatment, running a Treatment
Test, answering a healing or course check when it comes due, or editing and
removing the item outright. Most of what moves a wound or an affliction
forward arrives as a card in chat, with a button to press, rather than as a
menu choice — see [[doc-traumaug|Trauma]] and [[doc-afflctnug|Affliction]] for
the full sequence of actions each one offers, in the order you meet them.

**Nothing advances on its own.** Every roll — a Treatment Test, a Healing
Test, a Course Test — runs because someone pressed a button for it, and every
recurring check is a reminder you chose to schedule, never a clock the system
keeps without being asked.

# See also

- [[doc-traumaug|Trauma]] — the wound item itself: its properties, its severity, and every check it offers.
- [[doc-afflctnug|Affliction]] — the disease or poison item, with its onset, course, and treatment.
- [[doc-beingug|Being]] — the health bar, the body-part grid, and the shock, contagion, and treatment actions on the character.
- [[doc-cmbtbscsug|Combat Basics]] — where most wounds come from, and the injury card that records them.
- [[doc-traumaintro|Trauma]] and [[doc-afflctnrules|Afflictions]] (rules) — the mechanics all of this implements.
- [[doc-shock|Shock]] (rules) — the full Shock State Index and Shock Re-Test.
- [[doc-character#mishaps-fumble-and-stumble|Body Structure]] (rules) — body roles, impairment, and the stumble/fumble mishaps.
- [[doc-userguide|User Guide]] — back to the index.
