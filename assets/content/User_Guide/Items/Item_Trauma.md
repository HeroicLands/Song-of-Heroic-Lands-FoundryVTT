---
aliases:
  - Injury
  - Injuries
  - doc-itemtrauma
id: PV8DkxfbuA1ORJ1U
type: doc
package: sohl
category: user-guide
name:
  full: "Trauma"
shortcode: itemtrauma
folder: QtOgPodi8X6gDWL0
---

# What Is a Trauma?

A **Trauma** is one instance of harm to a character — everything a Being carries as a result of being hurt, frightened, worn down, or touched by something worse. A sword cut to the arm is a Trauma. So is the exhaustion of a forced march, the terror that breaks a line of spearmen, the infection that sets into a badly dressed wound, and the Pall clinging to a soul.

**An injury is a Trauma.** There is no separate Injury item: a wound is a Trauma whose **Trauma Type** is _Injury_. Everything on this page about wounds, bleeding, treatment, and healing is describing that sub-type.

What separates a Trauma from an [[doc-afflctn|Affliction]] is _where the harm comes from_. A Trauma is something the character **carries** — the state their body or mind is now in. An Affliction is an outside **agent** working on them: a disease, a poison, a curse. A poisoned character has an Affliction; the fatigue and the shock that poison inflicts are Traumas.

## The Trauma Types

The **Trauma Type** is chosen when the Trauma is created and cannot be changed afterwards — it is shown read-only in the sheet header. It decides which fields the sheet offers and which actions the Trauma has.

| Trauma Type                 | What it represents                                         | Measured by         |
| --------------------------- | ---------------------------------------------------------- | ------------------- |
| **Injury**                  | A wound at a specific body location                        | Injury Level (Sev)  |
| **Infection**               | Infection setting into a badly treated wound               | Healing Rate        |
| **Shock**                   | Extended shock following grievous harm                     | Healing Rate        |
| **Coma**                    | Deep unconsciousness the victim may or may not come out of | Healing Rate        |
| **Fatigue**                 | Windedness, weariness, or weakness                         | Fatigue Level (FL)  |
| **Fear**                    | The character's current fear state                         | Sub-Category        |
| **Morale**                  | The character's current morale state                       | Sub-Category        |
| **Psychological Condition** | A quirk, impulse, or disorder left by psyche stress        | Psyche Points (PSY) |
| **Aural Shock**             | Harm to the aura, most often from mystical backlash        | Aural Shock (ASL)   |
| **The Pall**                | The Pall's hold on a soul                                  | Pall Level (PSL)    |
| **Physical Condition**      | A lasting bodily trait, impediment, or debility            | Sub-Category        |

The rules behind each of these live with the rules, not here — see [[doc-traumaintro|Trauma]], [[doc-injrylvl|Injury]], [[doc-bleeding|Bleeding]], [[doc-infctn|Infection]], [[doc-shock|Shock]], [[doc-fatigue|Fatigue]], [[doc-fear|Fear]], [[doc-morale|Morale]], [[doc-psychlgc|Psychological Condition]], and [[doc-thepall|The Pall]].

# Where It Appears

Traumas live on the Being sheet's **Health** tab, which lists everything the character is currently carrying: wounds, fatigue, fear and morale, and the rest.

Most Traumas are created for you. A wound arrives from the combat pipeline when an attack lands; an infection is contracted by a bad healing test; anemia fatigue accrues from blood loss. You can also add one by hand — for a fall, a fire, a night in the cold, or anything else the table decides has hurt the character.

To reach a Trauma's actions, **right-click its row** on the Health tab, or open the Trauma and use its **Actions** tab. See [[doc-actions|Actions]] for how the menu works generally.

> **Known gap.** The injury actions — **Request Treatment**, **Treat Injury**, and **Treatment Test** — are currently missing from that context menu because of a visibility bug (issue #1085). Until it is fixed they can only be reached the other ways described below: the chat-card buttons, and the physician's own **Perform Treatment Test** action on the Being sheet.

# Additional Properties

Along with the [[doc-baseitem|Standard Item Properties]], a Trauma's **Properties** tab shows only the fields that mean something for its Trauma Type — a Fear Trauma has no Aspect, and a wound has no Sub-Category.

| Field                             | Shown for                                                           | What it is                                                                                                                                                                                                                                                                        |
| --------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Level**                         | Injury, Infection, Fatigue, Psych. Condition, Aural Shock, The Pall | Severity on a graduated scale. For a wound this is the Injury Level: 1 minor, 2–3 serious, 4–5 grievous                                                                                                                                                                           |
| **Healing Rate**                  | Injury, Infection, Shock, Coma                                      | How well the harm is mending, on a 1–6 scale. Established by treatment, and **blank until it is** — a blank rate is what marks a wound untreated. 6 means it is effectively beaten; 0 is a real, dire rate, not a blank one                                                       |
| **Sub-Category**                  | Fatigue, Fear, Morale, Psych. Condition, Phys. Condition            | The qualitative state within the type — windedness / weariness / weakness for Fatigue, quirk / impulse / disorder for a Psychological Condition, and so on                                                                                                                        |
| **Contracted (world-time)**       | All                                                                 | When the character took this harm. Used to measure how long a wound took to heal                                                                                                                                                                                                  |
| **Treated (world-time)**          | Injury, Infection                                                   | When treatment was applied. Stamped for you the moment a Healing Rate is first recorded, so it can never be missing from a treated wound. On its own it proves nothing: with no Healing Rate the wound is untreated whatever this says — and **an untreated wound does not heal** |
| **Notes**                         | Fatigue, Fear, Morale, Phys. Condition                              | A one-line note shown beside the entry on the sheet                                                                                                                                                                                                                               |
| **Aspect**                        | Injury                                                              | The kind of damage that caused it: Blunt, Edged, Piercing, or Fire. Decides what treatment the wound needs                                                                                                                                                                        |
| **Body Location**                 | Injury, Infection                                                   | Where on the body it is. Blank means it affects the character as a whole                                                                                                                                                                                                          |
| **Blood-Loss Interval**           | Injury                                                              | Seconds between blood-loss advances. **This is what makes a wound a bleeder** — set a value and it bleeds; clear it and the bleeding stops                                                                                                                                        |
| **Infectable**                    | Injury                                                              | Whether the wound is exposed to infection. Set by a poorly-rolled Treatment Test                                                                                                                                                                                                  |
| **Permanent-Impairment Eligible** | Injury                                                              | Whether the wound may leave a permanent impairment if it heals slowly                                                                                                                                                                                                             |
| **Heal Test Interval**            | Injury, Infection                                                   | How often the healing check comes due — as a formula, and as the seconds last rolled from it                                                                                                                                                                                      |
| **Course Test Interval**          | Shock, Coma                                                         | The same, for the recovery Course Test                                                                                                                                                                                                                                            |
| **Next … Test**                   | Any type with a recurring check                                     | View-only. When the next check is due, or **—** when nothing is scheduled                                                                                                                                                                                                         |

Two of these deserve a second look, because they are derived rather than typed:

- **Treated** is not a checkbox. A wound counts as treated once it has a treatment date, which [[#treat-injury|Treat Injury]] and the [[#treatment-test|Treatment Test]] set for you.
- **Bleeding** is not a checkbox either. A wound bleeds while its **Blood-Loss Interval** is set. That is how a bleeder is armed at the moment of injury, and clearing the field is how the bleeding stops.

**Next … Test** shows an em-dash far more often than you might expect, and that is correct: SoHL never schedules anything on its own. A check is pending only because someone accepted the offer to schedule it.

# The Trauma Actions

| Action                                                   | Shortcode                | Where you meet it                 |
| -------------------------------------------------------- | ------------------------ | --------------------------------- |
| [[#request-treatment\|Request Treatment]]                | `requestTreatment`       | Actions context menu              |
| [[#treat-injury\|Treat Injury]]                          | `treatInjury`            | Actions context menu; card button |
| [[#treatment-test\|Treatment Test]]                      | `treatmenttest`          | Actions context menu              |
| [[#request-blood-stoppage\|Request Blood Stoppage]]      | `requestBloodStoppage`   | Actions context menu              |
| [[#accept-blood-stoppage\|Accept Blood Stoppage]]        | `acceptBloodStoppage`    | _Hidden_ — card button            |
| [[#healing-check\|Healing Test]]                         | `healingtest`            | Actions context menu; check card  |
| [[#healing-check\|Healing Check]]                        | `healingCheck`           | _Hidden_ — scheduled reminder     |
| [[#blood-loss-advance-check\|Blood-Loss Advance Test]]   | `bloodLossAdvanceTest`   | Actions context menu; check card  |
| [[#blood-loss-advance-check\|Blood-Loss Advance Check]]  | `bloodLossAdvanceCheck`  | _Hidden_ — scheduled reminder     |
| [[#course-check\|Course Test]]                           | `courseTest`             | Actions context menu; check card  |
| [[#course-check\|Course Check]]                          | `courseCheck`            | _Hidden_ — scheduled reminder     |
| [[#psyche-stress-recovery\|Psyche Stress Recovery Test]] | `psycheRecoveryTest`     | Actions context menu; check card  |
| [[#psyche-stress-recovery\|Psyche Stress Recovery]]      | `psycheRecovery`         | _Hidden_ — scheduled reminder     |
| [[#aural-shock-recovery\|Aural Shock Recovery Test]]     | `auralShockRecoveryTest` | Actions context menu; check card  |
| [[#aural-shock-recovery\|Aural Shock Recovery]]          | `auralShockRecovery`     | _Hidden_ — scheduled reminder     |
| [[#pall-recovery\|Pall Recovery Test]]                   | `pallRecoveryTest`       | Actions context menu; check card  |
| [[#pall-recovery\|Pall Recovery]]                        | `pallRecovery`           | _Hidden_ — scheduled reminder     |

A **hidden** action is never in the Actions context menu. It is not off-limits — it is simply reached from wherever it makes sense: a button on a chat card, or the card a scheduled check posts when it comes due.

**A Check and a Test are different things**, and the difference is the whole design. A _Check_ **offers**: it posts a card asking whether to make the test, and changes nothing by itself — anyone can post one. A _Test_ **acts**: it rolls once, applies the outcome, and then offers to schedule the next test. Nothing is ever rolled or applied to a character without someone pressing a button first.

## How a wound moves through the system

The actions read as a scatter of buttons until you see the shape they make. A wound normally travels like this:

1. **The wound arrives.** Combat (or your own hand) creates the Trauma, and SoHL _offers_ to set a healing-check reminder. If the wound bleeds, it offers a blood-loss reminder too.
2. **Someone treats it.** The patient posts a [[#request-treatment|Request Treatment]] card; a physician answers it with **Perform Treatment Test**; the patient presses **Accept Treatment** on the result, which runs [[#treat-injury|Treat Injury]] and records the Healing Rate.
3. **It heals over time.** Each healing-check reminder comes due, you press **Perform**, a [[#healing-check|Healing Check]] is rolled, and it offers the next one. The wound closes when its Level reaches 0.
4. **If it bleeds**, [[#request-blood-stoppage|Request Blood Stoppage]] and the physician's answer run alongside, while each [[#blood-loss-advance-check|Blood-Loss Advance Check]] costs blood.
5. **If it goes wrong**, a critical-failure healing check on an infectable wound contracts an Infection, which halts healing until its own [[#course-check|Course Check]] beats it.

At no point does the system take a step for you. Every one of those transitions waits on a human — a dialog you answer, a card button someone presses, a **Perform** on a reminder.

## The reminder loop

The recurring checks — healing, blood loss, course, and the three recoveries — all follow one pattern:

> **offer → check → test → offer the next**

When a check would begin, SoHL opens the **offer-schedule dialog**, described once on [[doc-baseitem|Base Item]], asking whether to set a reminder with the rolled cadence already filled in (_"Set a reminder to perform the Healing Check in 5 days?"_). **Schedule It** arms it; **Not Now** declines, and nothing is tracked. When the time comes, a **check card** appears in chat with a button offering its test. Nothing has happened to the character yet: the test runs when you press it, and then offers the next one.

Declining is always safe. It only means SoHL stops keeping time for you — the wound is still there, and you can run the check by hand whenever you like.

**One check, one test.** However much game time has passed, a check offers exactly one test and performing it rolls exactly once. Nothing is silently caught up in a single click — which matters most where it used to hurt: a bleeding wound could be carried through several blood-loss advances, or an Extended Shock from stable to dead, before you could intervene.

That is not the same as losing the time. Because each test schedules the next one from **the last test's date** rather than from the moment you got round to it, a character who is behind simply has a test already due — so its card appears at once, and you work through the backlog one consent at a time, with the wound's original rhythm intact.

# Request Treatment {#request-treatment}

|               |                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Request Treatment                                                                                                                     |
| **Shortcode** | `requestTreatment`                                                                                                                    |
| **Icon**      | `fa-hand` (an open hand)                                                                                                              |
| **Invoked**   | The **Actions** context menu on the wound                                                                                             |
| **API**       | [`TraumaLogic.requestTreatment`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.TraumaLogic.html#requesttreatment) |

## What it does and when to use it

This is how a wounded character **calls for a physician**. It rolls nothing and changes nothing — it posts a card to the chat log announcing that this wound needs treatment, and waits.

Use it when your character is hurt and you do not know, or do not care, who will treat them. Anyone at the table whose character has the Physician skill can answer, and the card sits in the log until someone does.

It refuses in two cases, with a notice:

- The Trauma is **not an injury** — _"Only injuries can be treated with a Treatment Test."_ Fatigue and fear are not treated this way.
- The wound has **already healed** (Level 0) — _"This injury has already healed; no treatment is needed."_

## The Treatment Requested card

| Part                              | What it shows                                              |
| --------------------------------- | ---------------------------------------------------------- |
| Title                             | **Treatment Requested**                                    |
| Body                              | _{patient}_ asks a physician to treat _{wound}_            |
| **Aspect**                        | The damage aspect — Blunt, Edged, Piercing, or Fire        |
| **Severity**                      | The wound's Injury Level                                   |
| **Perform Treatment Test** button | Runs the answering physician's treatment test on the wound |

**The button is open to anyone.** Unlike most card buttons it is not addressed to one character — whoever presses it answers with **their own** default character. That character must have the Physician skill; if they do not, they are told so and the card stays live for someone who does.

That is the point of the card: the patient does not have to know who the physician is, and no physician is volunteered by someone else. The physician's side of this — the **Perform Treatment Test** action, its dialog, and the Treatment Result card it posts — is documented on the [[doc-being|Being]] page.

# Treat Injury {#treat-injury}

|               |                                                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Treat Injury                                                                                                                |
| **Shortcode** | `treatInjury`                                                                                                               |
| **Icon**      | `fa-staff-snake` (the rod of Asclepius)                                                                                     |
| **Invoked**   | The **Actions** context menu on the wound, **or** the **Accept Treatment** button on a Treatment Result card                |
| **API**       | [`TraumaLogic.treatInjury`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.TraumaLogic.html#treatinjury) |

## What it does

This **records** a Healing Rate on the wound and stamps it as treated. It rolls nothing — the roll is the [[#treatment-test|Treatment Test]]; this is the step that writes the answer down.

It is deliberately the patient's action, not the physician's. When a physician performs a treatment test, their result card carries an **Accept Treatment** button; pressing it runs this action on the wound with the physician's proposed Healing Rate already filled in. So the physician proposes, and **the patient's own click applies it**. Nobody writes on another character's sheet.

Marking a wound treated matters: an untreated wound makes no healing progress at all. Until this action, or a Treatment Test, has run, every healing check on the wound is resolved as a critical failure — no progress, and an infection for the trouble.

## The two ways it runs

**From the card.** Press **Accept Treatment** on a Treatment Result card. The Healing Rate comes from the card, no dialog opens, and the wound is updated in one click.

**By hand.** Run **Treat Injury** from the wound's Actions menu and a small dialog opens to ask for the rate.

## The Treat Injury dialog

Titled _{wound name}_**: Treat Injury**, with a single field:

- **Healing Rate:** — a whole number, the treated Healing Rate to record on the wound. It starts at the wound's current rate, and is **blank** on a wound whose rate has not been determined yet. Higher is better: 6 means the wound is effectively beaten, while 1 is a wound that will barely mend.

Confirming records the rate and sets the treatment date. Cancelling — or confirming with the field left blank — changes nothing.

> **A caution on entering 0.** A Healing Rate of 0 is not a cure — it is the worst result available. Healing Tests roll against Healing Base × Healing Rate, so a rate of 0 gives an effective mastery level of 0: every check fails and the wound makes no progress whatsoever (and an infectable wound can still fester on a critical failure). Only a Treatment Result card can heal a wound outright (a critical success on a minor wound); to close a wound by hand, set its **Level** to 0 on the Properties tab instead.

# Treatment Test {#treatment-test}

|               |                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Treatment Test                                                                                                                  |
| **Shortcode** | `treatmenttest`                                                                                                                 |
| **Icon**      | `fa-staff-snake` (the rod of Asclepius)                                                                                         |
| **Invoked**   | The **Actions** context menu on the wound                                                                                       |
| **API**       | [`TraumaLogic.treatmentTest`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.TraumaLogic.html#treatmenttest) |

## What it does

This is the **whole treatment resolved in one step**, from the wound's own menu: it works out what the wound needs, rolls a Physician test at the matching difficulty, and writes every consequence onto the wound.

It rolls the **Physician skill of the character carrying the wound** — so it suits a character treating themselves, or a GM resolving treatment without staging the request-and-answer exchange. When you want a _different_ character to be the physician, use [[#request-treatment|Request Treatment]] and let them answer, or run **Perform Treatment Test** from the physician's own sheet.

**No dialog opens.** Unlike an ordinary skill test this one rolls headlessly — the difficulty is not yours to adjust, because it comes from the wound. The result posts to chat as a test-result card.

That difficulty is set by what the wound actually needs, which follows from its **Aspect** and its severity band: cleaning and dressing a cut, warming a frostbitten limb, splinting a fracture, extracting a lodged point, or full surgery. A grievous wound is harder to treat well than a minor one. See [[doc-injrylvl|the Injury rules]] for the treatment table itself.

## What it changes

Whatever the roll produces is written to the wound at once:

- **The Healing Rate**, from the result and the wound's severity band. A critical success on a minor wound **heals it outright**.
- **Treated**, stamped with the current world time.
- **Infectable** — a botched treatment leaves the wound exposed to infection; a good one clears that risk.
- **Bleeding** — a surgical mishap, or a grievous wound left at a poor Healing Rate, becomes a bleeder. When that happens the action then **offers** to schedule its blood-loss advance.
- **Permanent-impairment eligibility**, if the result warrants it — see [[#healing-check|Healing Check]].

> **If nobody can make the roll** — a GM resolving a wound on an unowned character, for instance — the treatment resolves as though the Physician roll had been a **critical failure**. That is the rule for an untreated wound rather than a quirk of the software: a wound nobody competent tends to is a wound treated badly.

# Request Blood Stoppage {#request-blood-stoppage}

|               |                                                                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Request Blood Stoppage                                                                                                                        |
| **Shortcode** | `requestBloodStoppage`                                                                                                                        |
| **Icon**      | `fa-droplet-slash` (a struck-through droplet)                                                                                                 |
| **Invoked**   | The **Actions** context menu on a bleeding wound                                                                                              |
| **API**       | [`TraumaLogic.requestBloodStoppage`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.TraumaLogic.html#requestbloodstoppage) |

## What it does and when to use it

The bleeding twin of [[#request-treatment|Request Treatment]]: it posts an open card asking a physician to **stop the bleeding**, urgently. Nothing is rolled here either.

Reach for it the moment a wound starts bleeding. Blood loss does not wait for the wound to be treated properly — each [[#blood-loss-advance-check|Blood-Loss Advance Check]] drives the character further toward unconsciousness and death, so stopping the bleeding comes first and treating the wound comes after.

The action appears only on a **bleeding** wound, and if you reach it another way on a wound that is not bleeding it declines: _"This injury is not bleeding; no Blood Stoppage is needed."_

## The Blood Stoppage Requested card

| Part                              | What it shows                                                   |
| --------------------------------- | --------------------------------------------------------------- |
| Title                             | **Blood Stoppage Requested**                                    |
| Body                              | _{patient}_ is bleeding from _{wound}_ — a Physician may answer |
| **Perform Blood Stoppage** button | Runs the answering physician's Blood Stoppage Test              |

As with the treatment card, the button is **open to anyone** — whoever presses it answers with their own default character, who must have the Physician skill.

If an earlier stoppage attempt failed narrowly, this request quietly carries a **+10 bonus** to the next test. You do not have to track that; the wound remembers.

The physician's side — the roll and the Blood Stoppage Result card — is documented on the [[doc-being|Being]] page.

# Accept Blood Stoppage {#accept-blood-stoppage}

|               |                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Accept Blood Stoppage                                                                                                                       |
| **Shortcode** | `acceptBloodStoppage`                                                                                                                       |
| **Icon**      | `fa-check` (a check mark)                                                                                                                   |
| **Invoked**   | **Hidden — not on the Actions context menu.** The **Accept** button on a Blood Stoppage Result card                                         |
| **API**       | [`TraumaLogic.acceptBloodStoppage`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.TraumaLogic.html#acceptbloodstoppage) |

## What it does

This records a physician's Blood Stoppage result on the bleeding wound. Like [[#treat-injury|Treat Injury]], it is the **patient's** click that applies what the physician achieved — the physician's card proposes, the patient accepts.

You will never look for it on a menu. It exists as the **Accept** button on the Blood Stoppage Result card, on the wounded character's screen.

## What each outcome does

| The card says                                                | What Accept records                                              |
| ------------------------------------------------------------ | ---------------------------------------------------------------- |
| **Bleeding stops immediately.**                              | The bleeding ends now, and the blood-loss reminder is cleared    |
| **Bleeding will stop after the next Blood Loss Advance.**    | The character loses blood once more, and then the bleeding stops |
| **Bleeding continues; +10 to the next Blood Stoppage Test.** | The bleeding goes on, but the next attempt is easier             |
| **Bleeding continues.**                                      | Nothing changes; the blood loss goes on                          |

Nothing is applied until the button is pressed, so a card can be left unanswered and the situation ruled by hand instead.

# Healing Check {#healing-check}

|               |                                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Arm Healing Check                                                                                                             |
| **Shortcode** | `healingCheck`                                                                                                                |
| **Icon**      | `fa-bed-pulse` (a bed with a pulse line)                                                                                      |
| **Invoked**   | **Hidden — not on the Actions context menu.** Posted as a card when the healing interval comes due                            |
| **API**       | [`TraumaLogic.healingCheck`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.TraumaLogic.html#healingcheck) |

## What it does

**Nothing, by design.** The Healing Check posts a card offering a **Healing Test** and stops there — no roll, no change to the wound. Anyone can post one.

The **Healing Test** (`healingtest`, also on the Actions context menu) is where the wound actually mends. It rolls the character's **Healing** target — Healing Base × the wound's Healing Rate, plus anything an Active Effect has done to it — once:

- **Critical success** — the Injury Level drops by **2**
- **Marginal success** — it drops by **1**
- **Marginal failure** — no progress this period
- **Critical failure** — no progress, and if the wound is **infectable** the character contracts an **Infection**

The wound closes when its Level reaches 0, and the recurrence ends there — no further reminders.

## What stops a wound healing

Three things, and all of them are worth knowing before you wonder why a character is not getting better:

- **An untreated wound never heals — and festers.** With no Healing Rate there is nothing to test against, so every healing check on it is an **automatic critical failure** with no dice rolled (mechanically, a rolled **00**, which fails whatever the target). That means no progress however many checks you run, and an infection, because an untreated wound is an infection-prone one. Get a physician to it, or record a rate with [[#treat-injury|Treat Injury]]. Note this covers healing checks only — a [[#treatment-test|Treatment Test]] is not one, and rolls the physician's own skill.
- **An active infection halts _all_ healing**, on every wound the character has — not only the wound the infection came from. Nothing mends until the infection is beaten (see [[#course-check|Course Check]]).
- **A wound already at Level 0** is done, and is not checked again.

## Infection and permanent impairment

Two things can come out of a healing check besides progress.

A **critical failure on an infectable wound contracts an Infection** — recorded as its own Trauma at the wound's body location, starting one Healing Rate step above the wound. Contracting it immediately **offers** to schedule the infection's own Course Test. While it is active, all healing stops.

A wound flagged **permanent-impairment eligible** that finally closes may leave a **permanent impairment** on the body part it was on, scaled by how long the wound took to heal. A wound that lingered for months costs more than one that closed quickly. See [[doc-injrylvl|the Injury rules]] for the scale.

# Blood-Loss Advance Check {#blood-loss-advance-check}

|               |                                                                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Arm Blood-Loss Advance                                                                                                                          |
| **Shortcode** | `bloodLossAdvanceCheck`                                                                                                                         |
| **Icon**      | `fa-droplet` (a droplet)                                                                                                                        |
| **Invoked**   | **Hidden — not on the Actions context menu.** The **Perform** button on the blood-loss reminder in chat                                         |
| **API**       | [`TraumaLogic.bloodLossAdvanceCheck`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.TraumaLogic.html#bloodlossadvancecheck) |

## What it does

This is **the cost of bleeding**, charged at intervals until the bleeding stops. It is offered when a wound starts bleeding and after every advance, and it runs when you press **Perform**.

Each advance rolls against the character's Strength, and the margin decides how much blood is lost:

| Roll             | Blood Loss Points |
| ---------------- | ----------------- |
| Critical success | 0                 |
| Marginal success | 1                 |
| Marginal failure | 2                 |
| Critical failure | 3                 |

Every Blood Loss Point does two things: it **advances the character's shock state one step** toward death, and it inflicts **5 Fatigue Levels of weakness** — the anemia of blood loss — recorded as its own Fatigue Trauma.

This is the fastest way for a character to die in SoHL, and it needs no new injury at all. A bleeder left alone will empty a healthy character.

## Stopping it

The bleeding ends when the wound stops bleeding — which happens when a physician's [[#accept-blood-stoppage|Blood Stoppage]] result is accepted, or when you clear the wound's **Blood-Loss Interval** field by hand. Either way the recurrence ends and no further reminders come.

A physician whose stoppage "stops the bleeding after the next advance" is honored here: the character loses blood one more time, and then the bleeder is cleared.

# Course Check {#course-check}

|               |                                                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Shock/Coma Course Test                                                                                                      |
| **Shortcode** | `courseCheck`                                                                                                               |
| **Icon**      | `ginf-heart-beats` (a pulse trace)                                                                                          |
| **Invoked**   | **Hidden — not on the Actions context menu.** The **Perform** button on the course reminder in chat                         |
| **API**       | [`TraumaLogic.courseCheck`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.TraumaLogic.html#coursecheck) |

## What it does

This is the recurring test that decides **whether a character comes out of it** — used by the three Trauma types that run a course rather than heal a wound: **Extended Shock**, **Coma**, and **Infection**.

Each check rolls the character's Healing Base against the condition's Healing Rate, with their fatigue counting against them, and moves that rate up or down:

- **Critical success** — Healing Rate **+2**
- **Marginal success** — **+1**
- **Marginal failure** — **−1**
- **Critical failure** — **−2**

The Healing Rate _is_ the character's condition, and the course ends when it leaves the middle:

- **Reaching 6 or above is recovery.** For Extended Shock or a Coma, the shock state clears and the character comes round. For an Infection, the infection is beaten — and the normal wound healing it had halted resumes.
- **Falling to 0 or below is death**, for Extended Shock and Coma. An **Infection never kills** this way: its Healing Rate floors at 1, so an untreated infection grinds on rather than finishing the character off.

Otherwise the course continues, and the next check is offered.

## The cost along the way

A **Coma** a character recovers from costs them **weariness fatigue equal to the days spent in it** — waking after a fortnight is not the same as waking after a night. And a character who leaves Extended Shock while still comatose from another Coma stays unconscious.

A **still-active Infection** saps the body every check it fails to beat: at a Healing Rate of 1–2 it inflicts 10 Fatigue Levels of weakness, at 3–4 it inflicts 5, and above that none. This is why an infection is dangerous even though it cannot kill directly — it exhausts the character while stopping every wound from closing.

The cadences differ by type: Extended Shock runs every four hours, a Coma every d10 days, and an Infection on the ordinary healing-check period.

# Psyche Stress Recovery {#psyche-stress-recovery}

|               |                                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Psyche Stress Recovery Test                                                                                                       |
| **Shortcode** | `psycheRecovery`                                                                                                                  |
| **Icon**      | `fa-brain` (a brain)                                                                                                              |
| **Invoked**   | **Hidden — not on the Actions context menu.** The **Perform** button on the recovery reminder in chat                             |
| **API**       | [`TraumaLogic.psycheRecovery`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.TraumaLogic.html#psycherecovery) |

## What it does

The recurring recovery of a **Psychological Condition** — the quirk, impulse, or disorder left behind by psyche stress. Every few days (d6) the character rolls **Will** to work through it. Neither fatigue nor injury counts against this roll: a broken body does not make a mind less able to mend.

- **Marginal success** — **−1 PSY**
- **Critical success** — **−2 PSY**
- **Marginal failure** — no change
- **Critical failure** — a **Grievous Stress**: an indefinite condition becomes **permanent**, and a permanent one deepens by **+1 PSY**

An **indefinite** condition **goes away entirely** when its PSY reaches 0, and the Trauma is removed from the sheet. A **permanent** one never does; it can be worn down, but it stays. That is what a critical failure really costs — not points, but the possibility of ever being rid of it.

See [[doc-psychlgc|the Psychological Condition rules]].

# Aural Shock Recovery {#aural-shock-recovery}

|               |                                                                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Aural Shock Recovery Test                                                                                                                 |
| **Shortcode** | `auralShockRecovery`                                                                                                                      |
| **Icon**      | `fa-wand-sparkles` (a wand)                                                                                                               |
| **Invoked**   | **Hidden — not on the Actions context menu.** The **Perform** button on the recovery reminder in chat                                     |
| **API**       | [`TraumaLogic.auralShockRecovery`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.TraumaLogic.html#auralshockrecovery) |

## What it does

The daily recovery from **Aural Shock** — harm to the aura, most often from mystical backlash. Once a day the character rolls **Will**, again with neither fatigue nor injury counting against them.

- **Marginal success** — **−1 ASL**
- **Critical success** — **−2 ASL**
- **Marginal failure** — no change
- **Critical failure** — no recovery, and the character gains **+1 PSY** of psyche stress

The character recovers, and the Trauma is removed, when Aural Shock reaches 0. Any psyche stress picked up along the way is inflicted as its own Trauma and recovers on its own schedule — see [[#psyche-stress-recovery|Psyche Stress Recovery]].

# Pall Recovery {#pall-recovery}

|               |                                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Pall Recovery Test                                                                                                            |
| **Shortcode** | `pallRecovery`                                                                                                                |
| **Icon**      | `fa-skull` (a skull)                                                                                                          |
| **Invoked**   | **Hidden — not on the Actions context menu.** The **Perform** button on the recovery reminder in chat                         |
| **API**       | [`TraumaLogic.pallRecovery`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.TraumaLogic.html#pallrecovery) |

## What it does

The recurring struggle to throw off **the Pall**, made every few days (d6) as a **Will** roll — and the grimmest of the three recoveries, because two of its four results are not setbacks but events.

- **Marginal success** — **−1 PSL**
- **Critical success** — **−2 PSL**
- **Marginal failure** — the victim falls **unconscious**; the Pall Level is unchanged
- **Critical failure** — the victim must **Face the Pall**

The Pall is expelled, and the Trauma removed, when its Pall Level reaches 0.

## The Face the Pall card

A critical failure posts a card titled **Face the Pall**, saying that the Pall cannot be expelled and that the victim must choose one of three fates:

- **Embrace the Pall** — the soul is imprisoned; the body persists as an undead Nightwight.
- **Vacate the Body** — the soul unanchors into a Shade; the empty body becomes a mindless Helthraal.
- **Accept True Death** — the soul departs to the afterlife; the body allows only a brief moment as a Helthraal.

**The card has no buttons, and nothing is applied.** This is deliberate. Which fate a character meets is not something software should decide, or even offer as a click — it is the largest decision that will ever be made about that character, and it belongs to their player and the GM. The card exists to put the choice in front of the table, in the victim's own terms, and then get out of the way. Whatever you decide is played out by hand.

See [[doc-thepall|The Pall]] for what each fate means.

# See also

- [[doc-afflandi|Afflictions and Injuries]] — the overview of how harm works, and how a Trauma differs from an Affliction.
- [[doc-afflctn|Affliction]] — diseases, poisons, and curses: the outside agents that inflict Traumas.
- [[doc-being|Being]] — the physician's side of treatment and blood stoppage, and the character's shock state.
- [[doc-baseitem|Base Item]] — the standard item properties, the standard test dialog, and the offer-schedule dialog.
- [[doc-cmbtbscs|Combat Basics]] — where most wounds come from, and the injury card that creates them.
- [[doc-actions|Actions]] — how the Actions context menu and chat-card buttons work.
- [[doc-traumaintro|Trauma]], [[doc-injrylvl|Injury]], [[doc-bleeding|Bleeding]], [[doc-infctn|Infection]], [[doc-shock|Shock]], and [[doc-hlngtst|Healing Test]] (rules) — the mechanics behind these actions.
- [[doc-ugitems|Items]] — every item type at a glance.
- [[doc-userguide|User Guide]] — back to the index.
