---
aliases: []
id: MoyrkIfKbklVs8Pn
type: doc
subType: user-guide
name:
  full: "Affliction"
shortcode: afflctnug
folder: QtOgPodi8X6gDWL0
---

# What Is an Affliction?

An Affliction is **something working on a character from the outside** — a disease, a poison, a curse. It has a source, a way of reaching a victim, a course it runs, and an end it is heading toward.

What separates it from a [[doc-traumaug|Trauma]] is _where the harm comes from_. A Trauma is a state the character **carries**: a wound, exhaustion, terror. An Affliction is an **agent** at work on them, and it will get better or worse whether or not anything else happens. A poisoned character has an Affliction; the fatigue and the shock that poison inflicts on them are Traumas.

Every affliction runs through three phases:

1. **Incubation** — contracted, present, possibly catching, but showing nothing.
2. **Symptomatic** — from **onset** to the end. The body fights it, and the affliction's **Healing Rate** rises or falls with each Course Test.
3. **Outcome** — the end of the road: death, or a cure, possibly leaving a Trauma behind.

The [[doc-afflctnrules|Afflictions]] rules describe the mechanics behind those phases. This page describes the item, its fields, and the three actions that move it from one phase to the next.

# Where It Appears

Afflictions live on the Being sheet's **Health** tab, in their own **Afflictions** list below the Traumas, grouped by SubType. Each row shows:

| Column             | What it shows                                                         |
| ------------------ | --------------------------------------------------------------------- |
| **Affliction**     | The item's name                                                       |
| **Category**       | The free-text **Category** field, when it has one                     |
| **Level**          | Severity, as authored                                                 |
| **HR**             | The current Healing Rate — an **✕** when the affliction does not heal |
| **Next Heal Test** | When the next Course Test is due, or blank when nothing is scheduled  |
| **⋮**              | The Actions menu for that affliction                                  |

Afflictions arrive in three ways: the Being's **Contagion Test** action (rolled exposure — see [[doc-beingug|Being]]), a drag from a compendium of written-up diseases and poisons, or the **＋** control on the list when the table decides a character has caught something.

**How it arrived decides whether it goes anywhere.** Only **Contagion Test** offers to start the clock. An affliction you drag or add by hand sits inert: it is on the sheet, its fields are real, but nothing is scheduled and it will never onset on its own until someone arms it.

To reach an affliction's actions, **right-click its row** (or use the **⋮**), or open the affliction and use its **Actions** tab. See [[doc-actionsug|Actions]] for how the menu works generally.

# Additional Properties

The **SubType** is chosen when the affliction is created and is not editable afterwards — it is shown read-only in the sheet header's subtitle, as _Disease Affliction_, _Poison/Toxin Affliction_, and so on. It classifies the affliction by the _nature of the agent_:

| SubType          | Nature       | Examples                                  |
| ---------------- | ------------ | ----------------------------------------- |
| **Poison/Toxin** | Chemical     | venom, mandrake, hemotoxin                |
| **Disease**      | Biological   | typhoid, tuberculosis, river blindness    |
| **Maladiction**  | Supernatural | a curse, a hex, a divine or spirit blight |
| **Other**        | —            | anything not covered above                |

The SubType is descriptive: it does **not** change the Course Test or the outcome machinery, which are the same for every affliction. It decides only which afflictions count as **contagious diseases** for exposure — only _Disease_ afflictions can be caught with a **Contagion Test**. Conditions a character _carries_ — fatigue, fear, morale, infection, aural shock — are **[[doc-traumaug|Traumas]]**, not afflictions.

Along with the [[doc-baseitemug|Standard Item Properties]], the **Properties** tab offers:

| Field                | What it is                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category**         | An optional free sub-classification within the SubType. Shown in the Category column on the Health tab                                         |
| **Dormant**          | The affliction is present but inactive. A dormant affliction may still be transmissible, but it runs no course                                 |
| **Level**            | Severity, low to high. **Authored, and it does not move** — see below                                                                          |
| **Healing Rate**     | How the fight is going, 1–6. **This is the number that moves.** Clear the field entirely for an affliction that does not heal naturally at all |
| **Contagion Index**  | How readily it spreads, 1–5. **Lower is more contagious**                                                                                      |
| **Transmission**     | How it reaches a new victim — see the table below                                                                                              |
| **Onset Macro UUID** | Optional. A Macro run once at onset, letting an author attach concrete consequences to a specific affliction. A _reference_ only, never code   |
| **Outcome**          | What running the course to the end does to the character: **Death** or **Cured**. Defaults to the benign _Cured_                               |
| **Outcome Trauma**   | Optional. A Safe Expression yielding the shortcode — or a list of shortcodes — of the Traumas the character contracts at the end               |
| **Contracted**       | World-time the affliction was contracted. Stamped automatically when the item is created                                                       |
| **Treated**          | World-time treatment was applied. Blank means untreated                                                                                        |

Three fieldsets below them carry the timing of each phase. Each pairs an authored **formula** with the **seconds** last rolled from it, plus a view-only projection:

| Fieldset          | Fields                                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| **Onset**         | Onset Interval Formula, Onset Interval (sec), **Est. Onset Date** _(view-only)_, Onset Date                     |
| **Healing Check** | Heal-Check Interval Formula, Heal-Check Interval (sec), **Next Heal Test** _(view-only)_                        |
| **Resolution**    | Resolution Interval Formula, Resolution Interval (sec), **Est. Resolution Date** _(view-only)_, Resolution Date |

The formulas are dice expressions or plain second counts, and they are rolled fresh at the moment each phase needs them — so two characters who catch the same disease do not incubate for the same number of days.

Four of these fields deserve a second look:

- **Level does not fall as the character recovers.** On a wound, Level is what heals. On an affliction it is authored severity and nothing in the lifecycle touches it. **Healing Rate** is the number that tells you how the fight is going: it rises and falls with every Course Test, and reaching 6 is what beats the affliction.
- **A blank Healing Rate means the affliction never heals naturally.** The column on the Health tab shows an **✕**, and no Course Test is ever rolled — the affliction simply runs its clock to the outcome. That is how a lethal poison is written.
- **Est. Onset Date** and **Est. Resolution Date** are projections from the interval and the anchor date, shown so you can see roughly where this is heading. They are never saved. **Onset Date** and **Resolution Date** are the real, crystallized facts, and they are only filled in once the matching check has actually been performed.
- **Next Heal Test** reads the live reminder when one is armed, so an accepted reschedule shows up here. It is blank far more often than you might expect, and that is correct: SoHL never schedules anything on its own.

**Transmission** describes how the affliction reaches a new victim:

| Mode                | How it spreads                                                            |
| ------------------- | ------------------------------------------------------------------------- |
| **Noncommunicable** | Not transmissible                                                         |
| **Airborne**        | Through the air                                                           |
| **Contact**         | By skin contact                                                           |
| **Body Fluid**      | By body fluid through an orifice or a wound                               |
| **Injested**        | By eating or drinking                                                     |
| **Proximity**       | By being near the source — a force such as radiation, rather than the air |
| **Vector**          | By a sting, bite, or other break in the skin                              |
| **Perception**      | By seeing or hearing the source                                           |
| **Arcane**          | By spell or other arcane means                                            |
| **Divine**          | By divine attunement                                                      |
| **Spirit**          | From one aura or soul to another                                          |

# The Affliction Actions

| Action                                    | Shortcode          | Where you meet it              |
| ----------------------------------------- | ------------------ | ------------------------------ |
| [[#request-treatment\|Request Treatment]] | `requestTreatment` | Actions context menu           |
| [[#treat-affliction\|Treat Affliction]]   | `treatAffliction`  | Actions context menu           |
| [[#course-test\|Course Test]]             | `courseTest`       | Actions context menu           |
| [[#course-check\|Course Check]]           | `courseCheck`      | _Hidden_ — scheduled reminder  |
| [[#healing-test\|Healing Test]]           | `healingTest`      | Actions context menu           |
| [[#healing-check\|Healing Check]]         | `healingCheck`     | _Hidden_ — scheduled reminder  |
| [[#set-onset\|Set Onset]]                 | `setOnset`         | Actions menu / Onset card      |
| [[#onset-check\|Onset Check]]             | `onsetCheck`       | _Hidden_ — scheduled reminder  |
| [[#set-resolution\|Set Resolution]]       | `setResolution`    | Actions menu / Resolution card |
| [[#resolution-check\|Resolution Check]]   | `resolutionCheck`  | _Hidden_ — scheduled reminder  |

The four **Check** actions are hidden, and deliberately so: they are never in the Actions context menu. You meet each one as a card in chat when that phase of the affliction comes due. They are not off-limits — they are simply reached from where they make sense.

A **Check** and a **Test** are different things, and the difference is the whole design. A _Check_ **offers**: it posts a card asking whether to make the test, and changes nothing by itself. Anyone can post one. A _Test_ **acts**: it rolls, applies the outcome, and then offers to schedule the next test. Nothing is ever rolled or applied without someone pressing a button first.

## How an affliction moves through the system

1. **It is contracted.** A [[doc-beingug|Contagion Check]] on the exposed character offers a **Contagion Test**; failing that test catches the affliction, and — if the test's _add to character sheet_ box was ticked — it is created with **Contracted** stamped and its incubation already rolled. A critical failure takes hold twice as fast as a marginal one. An affliction added by hand skips all of this and sits inert.
2. **It onsets.** The onset reminder comes due and posts an [[#onset-check|Onset Check]] card; pressing its **Set Onset** button runs [[#set-onset|Set Onset]], which asks once, marks the affliction symptomatic, and then **offers** the course and resolution checks that carry it from here.
3. **The body fights it.** Each [[#course-check|Course Check]] offers a [[#course-test|Course Test]]; the test moves the **Healing Rate** up or down, and the character reacts to wherever that rate now sits — fatigue, shock, or nothing. Reaching **HR 6** defeats the affliction and the recurrence ends.
4. **It resolves.** If the clock runs out first, a [[#resolution-check|Resolution Check]] card offers [[#set-resolution|Set Resolution]], which asks **which** outcome the affliction settles on — death or cure — and applies it, plus any Trauma the affliction leaves behind, stamping the resolution date as now.

At no point does the system take a step for you. Every transition waits on a human: an offer you accept, and a **Perform** you press.

## The reminder loop

All three checks follow one pattern:

> **offer → check → test → offer the next**

When a check would begin, SoHL opens the **offer-schedule dialog**, described once on [[doc-baseitemug|Base Item]], asking whether to set a reminder with the rolled cadence already filled in (_"Set a reminder to perform the Course Test in 5 days?"_). **Schedule It** arms it; **Not Now** declines, and nothing is tracked. When the time comes, a reminder card appears in chat with a **Perform** button. Nothing has happened to the character yet: the check runs when someone presses it.

Declining is always safe. It does not cure the disease — it only means SoHL stops keeping time for you, and the table runs the check by hand when it decides the time has come.

**One check, one test.** However much game time has passed, a check offers exactly one test and performing it rolls exactly once. Nothing is silently caught up in a single click.

That is not the same as losing the time. Because each test schedules the next one from **the last test's date** rather than from the moment you got round to it, a character who is behind simply has a test already due — so its card appears at once, and you work through the backlog one consent at a time, with the illness's original rhythm intact.

# Onset Check {#onset-check}

|               |                                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Arm Onset                                                                                                                        |
| **Shortcode** | `onsetCheck`                                                                                                                     |
| **Icon**      | `fa-hourglass` (an hourglass)                                                                                                    |
| **Invoked**   | **Hidden — not on the Actions context menu.** Posted as a card when the incubation period runs out                               |
| **API**       | [`AfflictionLogic.onsetCheck`](https://www.heroiclands.org/sohl/api/classes/sohl.document.item.logic.AfflictionLogic#onsetcheck) |

## What it does

**Nothing, by design.** The incubation period has run out, so the check posts a card saying so and offering a [[#set-onset|Set Onset]] button. Whether the affliction actually becomes symptomatic is [[#set-onset|Set Onset]]'s job, and it asks first.

## The symptoms are yours

SoHL marks the affliction symptomatic and stops. It does not describe a fever, roll a penalty, or announce anything in chat — an affliction can be almost anything, and what it feels like to have it is played at the table, not modeled.

The one hook for a specific affliction to do something concrete at onset is the **Onset Macro**: an affliction may name a Macro that runs the moment onset is performed, after the affliction has been marked symptomatic. It can apply whatever that particular disease or curse actually does, and it may schedule further events of its own. The affliction stores only the Macro's _reference_, never any code.

# Request Treatment {#request-treatment}

|               |                                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Request Treatment                                                                                                                            |
| **Shortcode** | `requestTreatment`                                                                                                                           |
| **Icon**      | `fa-hand` (an open hand)                                                                                                                     |
| **Invoked**   | Actions context menu                                                                                                                         |
| **API**       | [`AfflictionLogic.requestTreatment`](https://www.heroiclands.org/sohl/api/classes/sohl.document.item.logic.AfflictionLogic#requesttreatment) |

## What it does

Posts a card asking someone to treat this affliction, naming it so a physician knows what they are being asked to look at. The card's button is open to any character with the **Physician** skill, who makes a Treatment Success Value test; the Value Diamonds they earn come back to you as a proposed **Course Bonus**, which you accept — or not — through [[#treat-affliction|Treat Affliction]].

Be clear-eyed about what treatment buys you. Unlike a wound, an affliction is mostly not something a physician can fix: the body either fights it off or it does not. A Course Bonus improves the odds on every later [[#course-test|Course Test]]; it cures nothing by itself.

# Treat Affliction {#treat-affliction}

|               |                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Name**      | Treat Affliction                                                                                                                           |
| **Shortcode** | `treatAffliction`                                                                                                                          |
| **Icon**      | `fa-staff-snake` (the rod of Asclepius)                                                                                                    |
| **Invoked**   | Actions context menu, or the **Accept Treatment** button on a treatment result card                                                        |
| **API**       | [`AfflictionLogic.treatAffliction`](https://www.heroiclands.org/sohl/api/classes/sohl.document.item.logic.AfflictionLogic#treataffliction) |

## What it does

Records that this affliction has been treated. A dialog confirms two things: the **treatment date** (stamped as now) and a **Course Bonus**. Reached from a physician's result card, the bonus arrives pre-filled with the Value Diamonds they earned; run by hand, it starts at zero and is yours to set.

A Course Bonus above zero is written as an **Active Effect** on the affliction rather than folded away as a one-off adjustment — so it is visible on the sheet, can be edited or removed later, and applies to every subsequent Course Test for as long as it stands.

# Set Onset {#set-onset}

|               |                                                                                                                              |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Set Onset                                                                                                                    |
| **Shortcode** | `setOnset`                                                                                                                   |
| **Icon**      | `fa-hourglass-start` (an hourglass beginning to run)                                                                         |
| **Invoked**   | Actions context menu, or the **Set Onset** button on an [[#onset-check\|Onset Check]] card                                   |
| **API**       | [`AfflictionLogic.setOnset`](https://www.heroiclands.org/sohl/api/classes/sohl.document.item.logic.AfflictionLogic#setonset) |

## What it does

Asks whether to mark the affliction symptomatic as of now, and on **Yes** stamps the **Onset** date. The affliction's interval formulas are rolled at the same time, so the sheet's projected resolution and next-check dates read correctly, and any authored onset Macro runs once the onset is recorded.

It then **offers** the two events that carry the affliction from here — the recurring [[#course-check|Course Check]] and the one-shot [[#resolution-check|Resolution Check]] — as two separate offer-schedule dialogs with the rolled cadences already filled in. Each is answered on its own, and **Not Now** on either arms nothing.

They are offered, not armed. Pressing **Set Onset** says the affliction is now symptomatic; it does not say SoHL should start keeping its calendar. Declining is always safe — the affliction is still running, you are simply tracking it by hand.

# Set Resolution {#set-resolution}

|               |                                                                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Set Resolution                                                                                                                         |
| **Shortcode** | `setResolution`                                                                                                                        |
| **Icon**      | `fa-skull` (a skull)                                                                                                                   |
| **Invoked**   | Actions context menu, or the **Set Resolution** button on a [[#resolution-check\|Resolution Check]] card                               |
| **API**       | [`AfflictionLogic.setResolution`](https://www.heroiclands.org/sohl/api/classes/sohl.document.item.logic.AfflictionLogic#setresolution) |

## What it does

Asks **which outcome** the affliction settles on — the authored one is pre-selected, and you can override it — then records that outcome with the **Resolution** date stamped as now. Resolution is terminal, so the affliction's remaining checks are cleared.

The chosen outcome is then applied: _Death_ sets the character's shock state to Dead, _Cured_ takes the Healing Rate to 6. Any authored **Outcome Trauma** is contracted alongside it.

An affliction that has already been **defeated** (Healing Rate 6 or better) beat its course on its own. Its resolution is still recorded, but no outcome is inflicted — the character won.

# Course Check {#course-check}

|               |                                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Arm Course Check                                                                                                                   |
| **Shortcode** | `courseCheck`                                                                                                                      |
| **Icon**      | `ginf-heart-beats` (a beating heart)                                                                                               |
| **Invoked**   | **Hidden — not on the Actions context menu.** Posted as a card when the course interval comes due                                  |
| **API**       | [`AfflictionLogic.courseCheck`](https://www.heroiclands.org/sohl/api/classes/sohl.document.item.logic.AfflictionLogic#coursecheck) |

## What it does

**Nothing, by design** — and that is the point. A Course Check posts a card offering a [[#course-test|Course Test]] and stops there. No roll is made, no Healing Rate moves, and nothing is written to the character. Because it imposes nothing on anyone, **anyone can post one**.

# Course Test {#course-test}

|               |                                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Course Test                                                                                                                      |
| **Shortcode** | `courseTest`                                                                                                                     |
| **Icon**      | `ginf-heart-beats` (a beating heart)                                                                                             |
| **Invoked**   | Actions context menu, or the button on a [[#course-check\|Course Check]] card                                                    |
| **API**       | [`AfflictionLogic.courseTest`](https://www.heroiclands.org/sohl/api/classes/sohl.document.item.logic.AfflictionLogic#coursetest) |

## What it does

This is **the body fighting the affliction** — the roll that actually advances an illness, made once per invocation.

Each Course Test is a d100 rolled against the affliction's **Course** target — **Healing Base × the affliction's current Healing Rate**, plus anything that has modified it. A physician's Course Bonus from [[#treat-affliction|Treat Affliction]] is exactly such a modifier, and so is any Active Effect an author has written against the course. The result moves the Healing Rate:

| Roll             | Change to Healing Rate |
| ---------------- | ---------------------- |
| Critical success | **+2**                 |
| Marginal success | **+1**                 |
| Marginal failure | **−1**                 |
| Critical failure | **−2**                 |

The **standard test dialog** opens first, so the roll is yours to see and modify, and a **result card** reports what happened afterwards.

Between the two, SoHL asks once more before touching the character: a confirmation dialog offers the reaction below, and **declining leaves the sheet alone**. The result card says which way you answered, so the table can see whether a result was applied or set aside.

## The reaction

After each Course Test, the character reacts to wherever the Healing Rate now sits:

| Healing Rate  | What happens to the character                    |
| ------------- | ------------------------------------------------ |
| **6 or more** | The affliction is **defeated**. The course stops |
| **5**         | **5 Fatigue Levels** of weakness                 |
| **4**         | **10 Fatigue Levels** of weakness                |
| **3**         | **Stunned**                                      |
| **2**         | **Incapacitated**                                |
| **1**         | **Unconscious**                                  |
| **Below 1**   | **Dead**                                         |

The fatigue is recorded as its own Fatigue [[doc-traumaug|Trauma]] — the affliction is the agent, the exhaustion it causes is a Trauma the character carries.

The shock states only ever **worsen** the character's condition. A character already unconscious from something else is not woken up by an affliction that merely stuns.

## What stops it

Two things, and only two:

- **Reaching Healing Rate 6.** The affliction is beaten, the recurrence ends, and no further reminders come.
- **Declining the offer**, which stops SoHL keeping time — the affliction is still there and the table can resolve it by hand.

Otherwise, each check re-rolls the interval from the Heal-Check Interval Formula and **offers** the next one. The cadence can differ from period to period, which is intended: a fever does not run to a metronome.

## When no test is worth rolling

The Course Test needs two things, and without either the check still comes due and still offers the next one — but **the Healing Rate has nowhere to go**:

- **A Healing Rate.** An affliction whose rate is blank does not heal naturally, by design. It has no fight to make; it just runs its clock to the outcome.
- **A usable Endurance attribute.** Endurance drives the recovery roll. A character without one — or whose Endurance is disabled — cannot make it.

This is worth knowing before you conclude a check is broken: a poison written to be lethal is _supposed_ to sit at its rate and run out the clock.

# Healing Check {#healing-check}

|               |                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Name**      | Arm Healing Check                                                                                                                    |
| **Shortcode** | `healingCheck`                                                                                                                       |
| **Icon**      | `fa-bed-pulse` (a bed with a pulse line)                                                                                             |
| **Invoked**   | **Hidden — not on the Actions context menu.** Posted as a card when the healing interval comes due                                   |
| **API**       | [`AfflictionLogic.healingCheck`](https://www.heroiclands.org/sohl/api/classes/sohl.document.item.logic.AfflictionLogic#healingcheck) |

## What it does

**Nothing, by design.** Like the [[#course-check|Course Check]], it posts a card offering a [[#healing-test|Healing Test]] and stops there. Anyone can post one.

# Healing Test {#healing-test}

|               |                                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Healing Test                                                                                                                       |
| **Shortcode** | `healingTest`                                                                                                                      |
| **Icon**      | `fa-heart-pulse` (a heart with a pulse line)                                                                                       |
| **Invoked**   | Actions context menu, or the button on a [[#healing-check\|Healing Check]] card                                                    |
| **API**       | [`AfflictionLogic.healingTest`](https://www.heroiclands.org/sohl/api/classes/sohl.document.item.logic.AfflictionLogic#healingtest) |

## What it does

This is **the body throwing the affliction off**, and it works exactly as a wound's Healing Test does. One d100 against the affliction's **Healing** target — Healing Base × Healing Rate, plus anything that has modified it — and the result reduces the affliction's **Level**:

- **Critical success** — Level drops by **2**
- **Marginal success** — Level drops by **1**
- **Either failure** — no progress this period

An affliction reduced to **Level 0** is finished with, and its recurrence ends there. Otherwise the next test is offered.

Where the [[#course-test|Course Test]] asks whether the affliction is winning, this asks whether the body is shaking it off. They are separate tests against separate targets, and an affliction can be losing one while winning the other.

# Resolution Check {#resolution-check}

|               |                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Name**      | Arm Resolution                                                                                                                             |
| **Shortcode** | `resolutionCheck`                                                                                                                          |
| **Icon**      | `fa-skull` (a skull)                                                                                                                       |
| **Invoked**   | **Hidden — not on the Actions context menu.** Posted as a card when the Symptomatic Period runs out                                        |
| **API**       | [`AfflictionLogic.resolutionCheck`](https://www.heroiclands.org/sohl/api/classes/sohl.document.item.logic.AfflictionLogic#resolutioncheck) |

## What it does

**Nothing, by design.** The Symptomatic Period has run out, so the check posts a card saying so and offering a [[#set-resolution|Set Resolution]] button. Settling the affliction — choosing the outcome, stamping the date, applying the consequences — is [[#set-resolution|Set Resolution]]'s job, and it asks first.

## The Outcome

Every affliction declares what it does to a character it beats:

| Outcome   | What it does                                                |
| --------- | ----------------------------------------------------------- |
| **Death** | The character's state becomes **dead**                      |
| **Cured** | The affliction is beaten — its Healing Rate is set to **6** |

**Cured is the default**, and it is the benign one: an affliction nobody authored an ending for lets its victim go.

Alongside it, an affliction may name an **Outcome Trauma** — a [[doc-sfexprssug|Safe Expression]] giving the shortcode, or a list of shortcodes, of Traumas the character contracts at resolution. Each is looked for among the world's items first, then in the compendiums, and the first match found is added to the character's sheet. A shortcode that matches nothing is skipped with a warning rather than inventing something.

The two combine, which is where the interesting endings live: an affliction with **Cured** and an outcome trauma leaves its victim free of the disease but permanently marked by it — the fever breaks and the blindness stays.

[[#set-resolution|Set Resolution]] pre-selects the authored outcome but lets you override it, so the table always has the last word on how an affliction ends. What you see afterwards is the affliction stamped with its Resolution Date, its Healing Rate settled, and any Trauma it left behind now sitting on the Health tab.

# See also

- [[doc-traumaug|Trauma]] — what a character _carries_: wounds, fatigue, fear, and the Traumas an affliction inflicts along the way.
- [[doc-afflinjug|Afflictions and Injuries]] — the overview of how harm works on a character.
- [[doc-beingug|Being]] — **Contagion Check** and **Contagion Test**, the exposure roll that starts most afflictions, and the character's shock state.
- [[doc-baseitemug|Base Item]] — the standard item properties and the offer-schedule dialog these three checks use.
- [[doc-actionsug|Actions]] — how the Actions context menu and chat-card buttons work.
- [[doc-afflctnrules|Afflictions]] and [[doc-hlngtst|Healing Test]] (rules) — the mechanics behind the Course Test, the reaction table, and the outcomes.
- [[doc-ugitems|Items]] — every item type at a glance.
- [[doc-userguide|User Guide]] — back to the index.
