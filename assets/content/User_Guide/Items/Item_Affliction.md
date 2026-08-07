---
aliases:
    - Affliction
id: MoyrkIfKbklVs8Pn
type: doc
package: sohl
category: user-guide
name:
    full: "Affliction"
slug: "item-affliction"
folder: QtOgPodi8X6gDWL0
---

# What Is an Affliction?

An Affliction is **something working on a character from the outside** — a
disease, a poison, a curse. It has a source, a way of reaching a victim, a course
it runs, and an end it is heading toward.

What separates it from a [[Item_Trauma|Trauma]] is _where the harm comes from_.
A Trauma is a state the character **carries**: a wound, exhaustion, terror. An
Affliction is an **agent** at work on them, and it will get better or worse
whether or not anything else happens. A poisoned character has an Affliction; the
fatigue and the shock that poison inflicts on them are Traumas.

Every affliction runs through three phases:

1. **Incubation** — contracted, present, possibly catching, but showing nothing.
2. **Symptomatic** — from **onset** to the end. The body fights it, and the
   affliction's **Healing Rate** rises or falls with each Course Test.
3. **Outcome** — the end of the road: death, or a cure, possibly leaving a Trauma
   behind.

The [[rules/sohl-afflictions|Afflictions]] rules describe the mechanics behind
those phases. This page describes the item, its fields, and the three actions
that move it from one phase to the next.

# Where It Appears

Afflictions live on the Being sheet's **Health** tab, in their own **Afflictions**
list below the Traumas, grouped by SubType. Each row shows:

| Column             | What it shows                                                         |
| ------------------ | --------------------------------------------------------------------- |
| **Affliction**     | The item's name                                                       |
| **Category**       | The free-text **Category** field, when it has one                     |
| **Level**          | Severity, as authored                                                 |
| **HR**             | The current Healing Rate — an **✕** when the affliction does not heal |
| **Next Heal Test** | When the next Course Test is due, or blank when nothing is scheduled  |
| **⋮**              | The Actions menu for that affliction                                  |

Afflictions arrive in three ways: the Being's **Contagion Test** action (rolled
exposure — see [[Actor_Being|Being]]), a drag from a compendium of written-up
diseases and poisons, or the **＋** control on the list when the table decides a
character has caught something.

**How it arrived decides whether it goes anywhere.** Only **Contagion Test**
offers to start the clock. An affliction you drag or add by hand sits inert: it is
on the sheet, its fields are real, but nothing is scheduled and it will never
onset on its own until someone arms it.

To reach an affliction's actions, **right-click its row** (or use the **⋮**), or
open the affliction and use its **Actions** tab. See [[Actions|Actions]] for how
the menu works generally.

# Additional Properties

The **SubType** is chosen when the affliction is created and is not editable
afterwards — it is shown read-only in the sheet header's subtitle, as _Disease
Affliction_, _Poison/Toxin Affliction_, and so on. It classifies the affliction by
the _nature of the agent_:

| SubType          | Nature       | Examples                                  |
| ---------------- | ------------ | ----------------------------------------- |
| **Poison/Toxin** | Chemical     | venom, mandrake, hemotoxin                |
| **Disease**      | Biological   | typhoid, tuberculosis, river blindness    |
| **Maladiction**  | Supernatural | a curse, a hex, a divine or spirit blight |
| **Other**        | —            | anything not covered above                |

The SubType is descriptive: it does **not** change the Course Test or the outcome
machinery, which are the same for every affliction. It decides only which
afflictions count as **contagious diseases** for exposure — only _Disease_
afflictions can be caught with a **Contagion Test**. Conditions a character
_carries_ — fatigue, fear, morale, infection, aural shock — are
**[[Item_Trauma|Traumas]]**, not afflictions.

Along with the [[Item_Base|Standard Item Properties]], the **Properties** tab
offers:

| Field                | What it is                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category**         | An optional free sub-classification within the SubType. Shown in the Category column on the Health tab                                         |
| **Dormant**          | The affliction is present but inactive. A dormant affliction may still be transmissible, but it runs no course                                 |
| **Level**            | Severity, low to high. **Authored, and it does not move** — see below                                                                          |
| **Healing Rate**     | How the fight is going, 1–6. **This is the number that moves.** Clear the field entirely for an affliction that does not heal naturally at all |
| **Contagion Index**  | How readily it spreads, 1–5. **Lower is more contagious**                                                                                      |
| **Transmission**     | How it reaches a new victim — see the table below                                                                                              |
| **Diagnosis Bonus**  | A modifier a successful diagnosis grants toward treatment. Recorded, not yet applied by any roll                                               |
| **Onset Macro UUID** | Optional. A Macro run once at onset, letting an author attach concrete consequences to a specific affliction. A _reference_ only, never code   |
| **Outcome Trauma**   | Optional. A Safe Expression yielding the shortcode — or a list of shortcodes — of the Traumas the character contracts at the end               |
| **Contracted**       | World-time the affliction was contracted. Stamped automatically when the item is created                                                       |
| **Treated**          | World-time treatment was applied. Blank means untreated                                                                                        |

Three fieldsets below them carry the timing of each phase. Each pairs an authored
**formula** with the **seconds** last rolled from it, plus a view-only projection:

| Fieldset          | Fields                                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| **Onset**         | Onset Interval Formula, Onset Interval (sec), **Est. Onset Date** _(view-only)_, Onset Date                     |
| **Healing Check** | Heal-Check Interval Formula, Heal-Check Interval (sec), **Next Heal Test** _(view-only)_                        |
| **Resolution**    | Resolution Interval Formula, Resolution Interval (sec), **Est. Resolution Date** _(view-only)_, Resolution Date |

The formulas are dice expressions or plain second counts, and they are rolled
fresh at the moment each phase needs them — so two characters who catch the same
disease do not incubate for the same number of days.

Four of these fields deserve a second look:

- **Level does not fall as the character recovers.** On a wound, Level is what
  heals. On an affliction it is authored severity and nothing in the lifecycle
  touches it. **Healing Rate** is the number that tells you how the fight is
  going: it rises and falls with every Course Test, and reaching 6 is what beats
  the affliction.
- **A blank Healing Rate means the affliction never heals naturally.** The column
  on the Health tab shows an **✕**, and no Course Test is ever rolled — the
  affliction simply runs its clock to the outcome. That is how a lethal poison is
  written.
- **Est. Onset Date** and **Est. Resolution Date** are projections from the
  interval and the anchor date, shown so you can see roughly where this is
  heading. They are never saved. **Onset Date** and **Resolution Date** are the
  real, crystallized facts, and they are only filled in once the matching check
  has actually been performed.
- **Next Heal Test** reads the live reminder when one is armed, so an accepted
  reschedule shows up here. It is blank far more often than you might expect, and
  that is correct: SoHL never schedules anything on its own.

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

> **Known gap.** The **Outcome** field — the choice between _Death_ and _Cured_
> at the end of the Symptomatic Period, and the single most consequential thing
> about an affliction — is **not shown on the sheet** (issue #1128). It exists in
> the data and the [Resolution Check](#resolution-check) applies it, but it can
> only be set in a compendium's source or through the API. An affliction authored
> in the UI carries the default, **Cured**.

# The Affliction Actions

| Action                                  | Shortcode          | Where you meet it             |
| --------------------------------------- | ------------------ | ----------------------------- |
| [Request Treatment](#request-treatment) | `requestTreatment` | Actions context menu          |
| [Treat Affliction](#treat-affliction)   | `treatAffliction`  | Actions context menu          |
| [Course Test](#course-test)             | `courseTest`       | Actions context menu          |
| [Course Check](#course-check)           | `courseCheck`      | _Hidden_ — scheduled reminder |
| [Onset Check](#onset-check)             | `onsetCheck`       | _Hidden_ — scheduled reminder |
| [Resolution Check](#resolution-check)   | `resolutionCheck`  | _Hidden_ — scheduled reminder |

The three **Check** actions are hidden, and deliberately so: they are never in the
Actions context menu. You meet each one as a card in chat when that phase of the
affliction comes due. They are not off-limits — they are simply reached from where
they make sense.

A **Check** and a **Test** are different things, and the difference is the whole
design. A _Check_ **offers**: it posts a card asking whether to make the test, and
changes nothing by itself. Anyone can post one. A _Test_ **acts**: it rolls,
applies the outcome, and then offers to schedule the next test. Nothing is ever
rolled or applied without someone pressing a button first.

## How an affliction moves through the system

1. **It is contracted.** A [[Actor_Being|Contagion Check]] on the exposed
   character offers a **Contagion Test**; failing that test catches the
   affliction, and — if the test's _add to character sheet_ box was ticked — it is
   created with **Contracted** stamped and its incubation already rolled. A
   critical failure takes hold twice as fast as a marginal one. An affliction
   added by hand skips all of this and sits inert.
2. **It onsets.** The onset reminder comes due, someone presses **Perform**, and
   [Onset Check](#onset-check) marks the affliction symptomatic — then arms the
   two checks that carry it the rest of the way.
3. **The body fights it.** Each [Course Check](#course-check) offers a
   [Course Test](#course-test); the test moves the **Healing Rate** up or down,
   and the character reacts to wherever that rate now sits — fatigue, shock, or
   nothing. Reaching **HR 6** defeats the affliction and the recurrence ends.
4. **It resolves.** If the clock runs out first, [Resolution Check](#resolution-check)
   applies the authored **Outcome** — death or cure — plus any Trauma the
   affliction leaves behind.

At no point does the system take a step for you. Every transition waits on a
human: an offer you accept, and a **Perform** you press.

## The reminder loop

All three checks follow one pattern:

> **offer → check → test → offer the next**

When a check would begin, SoHL opens the **offer-schedule dialog**, described once
on [[Item_Base|Base Item]], asking whether to set a reminder with the rolled
cadence already filled in (_"Set a reminder to perform the Course Test in 5
days?"_). **Schedule It** arms it; **Not Now** declines, and nothing is tracked.
When the time comes, a reminder card appears in chat with a **Perform** button.
Nothing has happened to the character yet: the check runs when someone presses it.

Declining is always safe. It does not cure the disease — it only means SoHL stops
keeping time for you, and the table runs the check by hand when it decides the
time has come.

**One check, one test.** However much game time has passed, a check offers exactly
one test and performing it rolls exactly once. Nothing is silently caught up in a
single click.

That is not the same as losing the time. Because each test schedules the next one
from **the last test's date** rather than from the moment you got round to it, a
character who is behind simply has a test already due — so its card appears at
once, and you work through the backlog one consent at a time, with the illness's
original rhythm intact.

# Onset Check

|               |                                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Arm Onset                                                                                                                         |
| **Shortcode** | `onsetCheck`                                                                                                                      |
| **Icon**      | `fa-hourglass` (an hourglass)                                                                                                     |
| **Invoked**   | **Hidden — not on the Actions context menu.** The **Perform** button on the _Affliction Onset_ reminder in chat                   |
| **API**       | [`AfflictionLogic.onsetCheck`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.AfflictionLogic.html#onsetcheck) |

## What it does

This is **incubation ending** — the moment the affliction stops hiding and becomes
symptomatic. It is the transition from the first phase to the second, and it is
what starts everything else.

Pressing **Perform** does four things at once:

- **Stamps the Onset Date** with the current world time. The affliction is now
  symptomatic, and the estimated onset date is replaced by the real one.
- **Rolls the Resolution Interval** from its formula — how long the Symptomatic
  Period will last.
- **Rolls the Heal-Check Interval** from its formula — how often the body gets to
  fight back.
- **Arms both follow-on checks**: the one-shot
  [Resolution Check](#resolution-check) and the recurring
  [Course Check](#course-check), both anchored at onset. The spent onset
  reminder clears itself.

**No dialog opens, nothing is rolled to chat.** The two interval rolls happen
quietly; what you see afterwards is the sheet's dates and intervals filled in, and
a **Next Heal Test** where there was none.

## Why this one arms its follow-ups without asking

Every other schedule in SoHL is offered. These two are armed outright — and that
is not an exception to the consent model but a consequence of it. **You already
consented**, by pressing **Perform** on the onset reminder. Onset _means_ "this
disease is now running its course," and its course is a resolution and a series of
recovery checks. The recurring Course Check goes back to offering from its very
next occurrence.

Nothing has been done _to_ the character here either. Both follow-ups are
reminders, and each waits for its own **Perform**.

## The symptoms are yours

SoHL marks the affliction symptomatic and stops. It does not describe a fever, roll
a penalty, or announce anything in chat — an affliction can be almost anything, and
what it feels like to have it is played at the table, not modeled.

The one hook for a specific affliction to do something concrete at onset is the
**Onset Macro**: an affliction may name a Macro that runs the moment onset is
performed, after the affliction has been marked symptomatic. It can apply whatever
that particular disease or curse actually does, and it may schedule further events
of its own. The affliction stores only the Macro's _reference_, never any code.

# Request Treatment

|               |                                                                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Request Treatment                                                                                                                             |
| **Shortcode** | `requestTreatment`                                                                                                                            |
| **Icon**      | `fa-hand` (an open hand)                                                                                                                      |
| **Invoked**   | Actions context menu                                                                                                                          |
| **API**       | [`AfflictionLogic.requestTreatment`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.AfflictionLogic.html#requesttreatment) |

## What it does

Posts a card asking someone to treat this affliction, naming it so a physician
knows what they are being asked to look at. The card's button is open to any
character with the **Physician** skill, who makes a Treatment Success Value test;
the Success Stars they earn come back to you as a proposed **Course Bonus**, which
you accept — or not — through [Treat Affliction](#treat-affliction).

Be clear-eyed about what treatment buys you. Unlike a wound, an affliction is
mostly not something a physician can fix: the body either fights it off or it does
not. A Course Bonus improves the odds on every later
[Course Test](#course-test); it cures nothing by itself.

# Treat Affliction

|               |                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Treat Affliction                                                                                                                            |
| **Shortcode** | `treatAffliction`                                                                                                                           |
| **Icon**      | `fa-staff-snake` (the rod of Asclepius)                                                                                                     |
| **Invoked**   | Actions context menu, or the **Accept Treatment** button on a treatment result card                                                         |
| **API**       | [`AfflictionLogic.treatAffliction`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.AfflictionLogic.html#treataffliction) |

## What it does

Records that this affliction has been treated. A dialog confirms two things: the
**treatment date** (stamped as now) and a **Course Bonus**. Reached from a
physician's result card, the bonus arrives pre-filled with the Success Stars they
earned; run by hand, it starts at zero and is yours to set.

A Course Bonus above zero is written as an **Active Effect** on the affliction
rather than folded away as a one-off adjustment — so it is visible on the sheet,
can be edited or removed later, and applies to every subsequent Course Test for as
long as it stands.

# Course Check

|               |                                                                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Arm Course Check                                                                                                                    |
| **Shortcode** | `courseCheck`                                                                                                                       |
| **Icon**      | `ginf-heart-beats` (a beating heart)                                                                                                |
| **Invoked**   | **Hidden — not on the Actions context menu.** Posted as a card when the course interval comes due                                   |
| **API**       | [`AfflictionLogic.courseCheck`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.AfflictionLogic.html#coursecheck) |

## What it does

**Nothing, by design** — and that is the point. A Course Check posts a card
offering a [Course Test](#course-test) and stops there. No roll is made, no
Healing Rate moves, and nothing is written to the character. Because it imposes
nothing on anyone, **anyone can post one**.

# Course Test

|               |                                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Course Test                                                                                                                       |
| **Shortcode** | `courseTest`                                                                                                                      |
| **Icon**      | `ginf-heart-beats` (a beating heart)                                                                                              |
| **Invoked**   | Actions context menu, or the button on a [Course Check](#course-check) card                                                       |
| **API**       | [`AfflictionLogic.courseTest`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.AfflictionLogic.html#coursetest) |

## What it does

This is **the body fighting the affliction** — the roll that actually advances an
illness, made once per invocation.

Each Course Test is a d100 rolled against the affliction's **Course** target —
**Healing Base × the affliction's current Healing Rate**, plus anything that has
modified it. A physician's Course Bonus from [Treat Affliction](#treat-affliction)
is exactly such a modifier, and so is any Active Effect an author has written
against the course. The result moves the Healing Rate:

| Roll             | Change to Healing Rate |
| ---------------- | ---------------------- |
| Critical success | **+2**                 |
| Marginal success | **+1**                 |
| Marginal failure | **−1**                 |
| Critical failure | **−2**                 |

The **standard test dialog** opens first, so the roll is yours to see and modify,
and a **result card** reports what happened afterwards.

Between the two, SoHL asks once more before touching the character: a confirmation
dialog offers the reaction below, and **declining leaves the sheet alone**. The
result card says which way you answered, so the table can see whether a result was
applied or set aside.

## The reaction

After each Course Test, the character reacts to wherever the Healing Rate now
sits:

| Healing Rate  | What happens to the character                    |
| ------------- | ------------------------------------------------ |
| **6 or more** | The affliction is **defeated**. The course stops |
| **5**         | **5 Fatigue Levels** of weakness                 |
| **4**         | **10 Fatigue Levels** of weakness                |
| **3**         | **Stunned**                                      |
| **2**         | **Incapacitated**                                |
| **1**         | **Unconscious**                                  |
| **Below 1**   | **Dead**                                         |

The fatigue is recorded as its own Fatigue [[Item_Trauma|Trauma]] — the affliction
is the agent, the exhaustion it causes is a Trauma the character carries.

The shock states only ever **worsen** the character's condition. A character
already unconscious from something else is not woken up by an affliction that
merely stuns.

## What stops it

Two things, and only two:

- **Reaching Healing Rate 6.** The affliction is beaten, the recurrence ends, and
  no further reminders come.
- **Declining the offer**, which stops SoHL keeping time — the affliction is
  still there and the table can resolve it by hand.

Otherwise, each check re-rolls the interval from the Heal-Check Interval Formula
and **offers** the next one. The cadence can differ from period to period, which is
intended: a fever does not run to a metronome.

## When no test is worth rolling

The Course Test needs two things, and without either the check still comes due and
still offers the next one — but **the Healing Rate has nowhere to go**:

- **A Healing Rate.** An affliction whose rate is blank does not heal naturally,
  by design. It has no fight to make; it just runs its clock to the outcome.
- **A usable Endurance attribute.** Endurance drives the recovery roll. A
  character without one — or whose Endurance is disabled — cannot make it.

This is worth knowing before you conclude a check is broken: a poison written to
be lethal is _supposed_ to sit at its rate and run out the clock.

# Resolution Check

|               |                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Arm Resolution                                                                                                                              |
| **Shortcode** | `resolutionCheck`                                                                                                                           |
| **Icon**      | `fa-skull` (a skull)                                                                                                                        |
| **Invoked**   | **Hidden — not on the Actions context menu.** The **Perform** button on the _Affliction Resolution_ reminder in chat                        |
| **API**       | [`AfflictionLogic.resolutionCheck`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.AfflictionLogic.html#resolutioncheck) |

## What it does

This is **the end of the road** — the Symptomatic Period running out. It is a
one-shot check, armed at onset, and it is terminal: it stamps the **Resolution
Date** and clears every remaining reminder the affliction had, the recurring
Course Check included.

What it applies depends on how the fight went:

- **If the affliction was defeated** — its Healing Rate had already reached 6 —
  **nothing further happens**. The body won before the clock ran out, and the
  outcome is not applied.
- **Otherwise the authored Outcome is applied**, because the affliction reached
  the end of its course undefeated.

## The Outcome

Every affliction declares what it does to a character it beats:

| Outcome   | What it does                                                |
| --------- | ----------------------------------------------------------- |
| **Death** | The character's state becomes **dead**                      |
| **Cured** | The affliction is beaten — its Healing Rate is set to **6** |

**Cured is the default**, and it is the benign one: an affliction nobody authored
an ending for lets its victim go.

Alongside it, an affliction may name an **Outcome Trauma** — a
[[Safe_Expressions|Safe Expression]] giving the shortcode, or a list of
shortcodes, of Traumas the character contracts at resolution. Each is looked for
among the world's items first, then in the
compendiums, and the first match found is added to the character's sheet. A
shortcode that matches nothing is skipped with a warning rather than inventing
something.

The two combine, which is where the interesting endings live: an affliction with
**Cured** and an outcome trauma leaves its victim free of the disease but
permanently marked by it — the fever breaks and the blindness stays.

**No dialog opens and no card is posted.** What you see is the affliction stamped
with its Resolution Date, its Healing Rate settled, and any Trauma it left behind
now sitting on the Health tab.

# See also

- [[Item_Trauma|Trauma]] — what a character _carries_: wounds, fatigue, fear, and
  the Traumas an affliction inflicts along the way.
- [[Afflictions_Injuries|Afflictions and Injuries]] — the overview of how harm
  works on a character.
- [[Actor_Being|Being]] — **Contagion Check** and **Contagion Test**, the exposure roll that starts most
  afflictions, and the character's shock state.
- [[Item_Base|Base Item]] — the standard item properties and the offer-schedule
  dialog these three checks use.
- [[Actions|Actions]] — how the Actions context menu and chat-card buttons work.
- [[rules/sohl-afflictions|Afflictions]] and
  [[rules/sohl-healing-roll|Healing Roll]] (rules) — the mechanics behind the
  Course Test, the reaction table, and the outcomes.
