---
aliases:
    - Being
id: yGlzMjLsBc8dCO6J
type: doc
package: sohl
category: user-guide
name:
    full: "Being"
slug: "actor-being"
folder: sYK1BozT9xFcinXK
---

# What Is a Being?

A Being is a single person or creature in the game world. This includes
player characters, non-player characters (NPCs), monsters, and animals.
Beings are the most detailed actor type in SoHL, with a full anatomy model,
skills, gear, traumas, and combat capabilities.

Most of your interaction with the system will involve Beings.

See also: [[Character_Creation]], [[Combat_Basics]]

# What a Being Contains

A Being can hold many types of items:

- **Attributes** — innate characteristics like Strength, Stamina, and Dexterity
- **Skills** — trained abilities like Sword, Riding, or Stealth
- **Gear** — weapons, armor, containers, miscellaneous equipment
- **Afflictions** — diseases, poisons, curses, and other conditions
- **Injuries** — wounds and trauma from combat or accidents
- **Body Structure** — body zones, body parts, and body locations that define the anatomy
- **Movement Profiles** — walking, running, swimming speeds
- **Mystical Abilities** — spells, prayers, and supernatural powers
- **Actions** — special procedures that can be triggered from the character sheet
  (see [Actions on a Being](#actions-on-a-being))

# The Being Sheet

The Being sheet is organized into several tabs:

- **Facade** — portrait and description
- **Profile** — attributes and affiliations
- **Skills** — all skills grouped by category
- **Gear** — carried and worn equipment, with encumbrance tracking
- **Combat** — equipped weapons, armor, and combat-relevant information
- **Mystical** — mysteries, philosophies, and mystical abilities
- **Actions** — available actions for this character (see
  [Actions on a Being](#actions-on-a-being))
- **Effects** — active effects modifying this character

**Facade**, **Gear**, **Actions**, and **Effects** are the common actor tabs —
the same tabs, working the same way, on a [[Actor_Vehicle|Vehicle]] or a
[[Actor_Structure|Structure]]. They are documented once, in
[[Understanding_Sheets|Understanding Sheets]] under _Common Actor Tabs_; this
page covers what is particular to a Being. The rest of the tabs are Being-only.

# The Being Sheet Header

Above the tabs, the header shows the portrait and name, a row of **status
indicators**, a **health bar**, and a **body-part grid**.

## Status indicators

Six condition pills are click-toggles — **Sleep, Prone, Stun, Incapacitated,
Unconscious, Dead** — that turn a condition on or off. Two more, **Aural-Shock**
and **Fatigue**, are read-only: they light up on their own when the Being has an
active affliction of that kind.

## Health bar

SoHL has **no hit points** — the health bar is a qualitative **assessment**, the
way a doctor says "fair," not a pool of points. It reads:
**Excellent · Good · Fair · Poor · Morbid · Dead**.

Health is driven by **impaired body parts only** — an injury that doesn't impair
a part has no effect on health. Each impaired part imposes a **maximum** on
overall health, based on how badly it's impaired (Minor / Serious / Grievous /
Unusable), whether it's a **critical** part (one holding the head/torso vital or
core roles), and how many parts share that state. The overall health is the
**worst (lowest) maximum** across every impaired part — for example, a single
serious wound to an arm caps health around Fair, while an unusable critical part
is fatal. As wounds heal, the parts recover and the assessment climbs back toward
Excellent. A living Being is never worse than Morbid unless actually slain.

_(Fatigue, fear, and shock will impose their own maximums in a later update; the
overall health will then be the lowest of all of them.)_

## Body-part grid

Each body part appears as a colored chip showing the worst injury among that
part's hit locations:

| Color      | Meaning                                               |
| ---------- | ----------------------------------------------------- |
| **White**  | No impairment                                         |
| **Yellow** | Minor impairment (−5) — a slow-healing minor injury   |
| **Blue**   | Major impairment (−10 or worse) — a serious injury    |
| **Black**  | Unusable — a grievous injury (or a permanent maiming) |

As injuries heal, a part's color climbs back toward white. A part may also carry
a **permanent impairment** — a lasting maiming that keeps it colored even with no
fresh injury.

# Creating a Being

Generally, you should not create a Being from scratch using the Create Actor
dialog. Instead, duplicate an existing Being from the compendium (such as
"Basic Folk") and customize it.

See [[Character_Creation]] for step-by-step instructions.

# Beings on Scenes

Beings can be placed on scenes as tokens. Each token represents the Being's
physical presence in the game world. Tokens can be moved, have vision, and
participate in combat encounters.

<!-- TODO: Expand with token configuration details, linked vs unlinked tokens,
     prototype token setup, and vision/light settings -->

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->

# Actions on a Being

A Being carries a set of built-in **actions** — the procedures the system knows
how to run for a character. You reach them from the **Actions** tab on the Being
sheet, or by right-clicking the Being in the Actors sidebar and choosing from the
**Actions** context menu.

Nothing here ever fires on its own. Every action runs because a person picked it,
or clicked a button on a chat card addressed to their own character. Where an
action would change your character's state, the system asks first. See
[[Actions]] for how actions work in general, and [[Item_Base|Base Item]] for the
standard test dialog that most rolls open.

These are the actions a Being defines:

| Action                                            | Shortcode              | What it does                                                           |
| ------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------- |
| [Shock Test](#shock-test)                         | `shockTest`            | Rolls Shock against a Shock State Index and offers the resulting state |
| [Shock Re-Test](#shock-re-test)                   | `shockReTest`          | An Incapacitated or Unconscious victim tries to shake off shock        |
| [Stumble Test](#stumble-test-and-fumble-test)     | `stumbleTest`          | Keep your footing after a lurch                                        |
| [Fumble Test](#stumble-test-and-fumble-test)      | `fumbleTest`           | Keep hold of what you are carrying                                     |
| [Fear Test](#fear-test)                           | `fearTest`             | Tests Will against something frightening                               |
| [Morale Test](#morale-test)                       | `moraleTest`           | Tests Initiative against a reason to break                             |
| [Reaction Test](#reaction-test)                   | `reactionTest`         | A shaken character tries to pull themselves together                   |
| [Rally Test](#rally-test)                         | `rallyTest`            | A leader offers to steady shaken allies                                |
| [Resist the Pall](#resist-the-pall)               | `pallResist`           | A Spirit test against the Pall's depth                                 |
| [Calculate Impact](#calculate-impact)             | `calcImpact`           | Turns a damage roll into a card that can be aimed at a target          |
| [Resolve Injury](#resolve-injury)                 | `resolveInjury`        | Turns a blow into a wound on this character                            |
| [Contract Disease](#contract-disease)             | `contractDisease`      | Rolls whether this character catches a disease                         |
| [Perform Treatment Test](#perform-treatment-test) | `performTreatmentTest` | A physician proposes a Healing Rate for someone's wound                |
| [Perform Blood Stoppage](#perform-blood-stoppage) | `performBloodStoppage` | A physician tries to staunch someone's bleeding                        |

One further action, [Answer the Rally](#answer-the-rally), is **hidden**: it
never appears on the Actions menu and is reached only from the button on a Rally
card. It is documented with the Rally Test, where that card comes from.

> **Two of these are physician's actions.** _Perform Treatment Test_ and _Perform
> Blood Stoppage_ are run on the **physician's** own sheet, not the patient's.
> They roll the physician's Physician skill and post a card that the patient's
> own player accepts. A character with no Physician skill is told so and nothing
> is rolled.

# Shock Test

|               |                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Shock Test                                                                                                             |
| **Shortcode** | `shockTest`                                                                                                            |
| **Icon**      | `ginf-knockout` (a knocked-out figure)                                                                                 |
| **Invoked**   | The **Actions context menu** on the Being                                                                              |
| **API**       | [`BeingLogic.shockTest`](https://api.heroiclands.org/main/classes/sohl.document.actor.logic.BeingLogic.html#shocktest) |

## What it does and when to use it

Shock is the body's collapse under a sudden systemic load. It is **not** only an
injury matter — blood loss, terror, exhaustion, or a GM-ruled cause can all drive
a shock test. Whatever the cause supplies a **base Shock State Index (SSI)**, and
this action rolls the character's **Shock** skill to see how well they hold up.

Use it when something has just hit the character hard enough that staying
conscious is in question and no other card has already offered the roll. When a
wound is the cause, the injury card's own **Shock Roll** button is the usual
route — it computes the index for you.

## Before you start

- **Know the base Shock State Index.** For a wound it is the struck location's
  Shock Value plus the Injury Level; for any other cause it is whatever value the
  GM or the rules assign.
- **An extreme index needs no roll.** Below 5 the result is always _No Shock_ and
  above 10 it is always _Dead_, so the system skips the roll and goes straight to
  the outcome. Only an index from 5 to 10 is actually decided by the dice.
- **Fatigue counts against you.** The character's fatigue penalty is applied to
  the roll automatically. Injury impairment is _not_ — shock is a whole-body
  response, not a limb's.

## What happens on screen

1. **The Shock Test dialog opens**, titled _{character}: Shock Test_, with one
   field:
    - **Base Shock State Index (Location Shock + Injury Level, or the cause's
      value):** — type the index the cause supplies. It starts at **0**.

    Press **Roll** to continue, or **Cancel** to abandon the test.

2. **The Shock roll posts to chat** as an ordinary test result card.
3. **The result adjusts the index** — Critical Failure **+2**, Marginal Failure
   **+1**, Marginal Success **0**, Critical Success **−1** — and the final index
   becomes a state: **6 or less** No Shock, **7** Stunned, **8** Incapacitated,
   **9** Unconscious, **10 or more** Dead.
4. **The "Set Shock State?" dialog asks before anything changes**, reading _Set
   {name}'s shock state to {state}?_ with two buttons:
    - **Set State** — applies it. The matching condition is turned on and any
      other shock condition is cleared.
    - **Leave Unchanged** — records nothing. The roll still stands in chat; you
      can apply the state by hand from the sheet's status pills.

    Shock only ever **worsens** here: a fresh test never improves a state that is
    already worse. Improving is the [Shock Re-Test](#shock-re-test).

5. **If the character entered ordinary shock**, the _Set a Shock Re-Test
   Reminder?_ offer follows (the shared offer-schedule dialog described on
   [[Item_Base|Base Item]]). Accepting arms a reminder — at the **end of each of
   the character's own turns** while Incapacitated, or **ten minutes later**
   while Unconscious. Declining arms nothing.

For the full rules — the Shock State Index table and what each state means in
play — see the [[rules/sohl-shock|Shock]] rules.

# Shock Re-Test

|               |                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Shock Re-Test                                                                                                                   |
| **Shortcode** | `shockReTest`                                                                                                                   |
| **Icon**      | `far fa-face-dizzy` (a dizzy face)                                                                                              |
| **Invoked**   | **Hidden — not on the Actions context menu.** Reached from the **Perform** button on the scheduled Shock Re-Test reminder card. |
| **API**       | [`BeingLogic.shockReTest`](https://api.heroiclands.org/main/classes/sohl.document.actor.logic.BeingLogic.html#shockretest)      |

## What it does

This is how a character climbs back **out** of ordinary shock. An Incapacitated
or Unconscious victim rolls their **Shock** skill at **−20** (plus their fatigue
penalty) to shake it off. Any other state — already recovered, merely Stunned, or
already in lasting Extended Shock or a Coma — is told _"A Shock Re-Test applies
only to an Incapacitated or Unconscious victim."_ and nothing is rolled.

You will not find this on the Actions menu. It comes to you: when the reminder
armed by a [Shock Test](#shock-test) falls due, the system posts an owner-gated
card in chat with a **Perform** button, and the re-test runs only when the
victim's own player clicks it. Until then nothing happens — the reminder nags,
it never acts.

## What happens on screen

1. **The Shock roll posts to chat** at −20, with no pre-roll dialog.
2. **The result is applied immediately** — the click on **Perform** was the
   consent:

    | Result                               | What happens                                                                  |
    | ------------------------------------ | ----------------------------------------------------------------------------- |
    | **Critical Success**                 | Recovers from all shock                                                       |
    | **Marginal Success**                 | Improves to **Stunned**                                                       |
    | **Marginal Failure**                 | Falls into **Extended Shock** — a lasting trauma at Healing Rate 5            |
    | **Critical Failure** (Incapacitated) | Falls into **Extended Shock** at the worse Healing Rate 4                     |
    | **Critical Failure** (Unconscious)   | Falls into a **Coma** — a lasting trauma, and the character stays Unconscious |

3. **A new Extended Shock or Coma offers a Course Test reminder.** Those lasting
   conditions do not recover through further re-tests; each recovers through its
   own Course Test.
4. **The ordinary Re-Test reminder is cleared** either way. A performed re-test
   ends that cycle — the character is out of ordinary shock, one way or the
   other — so nothing re-arms itself behind your back.

A Coma's Healing Rate is derived from the worst active wound (12 minus its
location's Shock Value minus its Injury Level). See the [[rules/sohl-shock|Shock]]
rules for Extended Shock and Coma recovery, and [[Afflictions_Injuries]] for
living with the resulting trauma.

# Stumble Test and Fumble Test

These two are the same test wearing different clothes: a combat mishap has
knocked something loose, and the character rolls to keep control of it. Both
roll the **better of** an attribute and a matching skill — ties go to the skill,
and either one alone is used when the character lacks the other. A character with
neither is told so and nothing is rolled.

Both are **offered, never imposed**: a mishap on an attack card tells you the
test applies, and it happens only when you pick the action.

## Stumble Test

|               |                                                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Stumble Test                                                                                                               |
| **Shortcode** | `stumbleTest`                                                                                                              |
| **Icon**      | `fa-solid fa-person-falling` (a falling figure)                                                                            |
| **Invoked**   | The **Actions context menu** on the Being                                                                                  |
| **API**       | [`BeingLogic.stumbleTest`](https://api.heroiclands.org/main/classes/sohl.document.actor.logic.BeingLogic.html#stumbletest) |

Rolls the better of **Agility** and **Acrobatics** to stay on your feet. The
standard test dialog opens first (see [below](#the-standard-test-dialog)), then
the result card reads:

| Result               | Outcome           | What it means                                             |
| -------------------- | ----------------- | --------------------------------------------------------- |
| **Critical Success** | **Sure-Footed**   | Rides out the lurch without a wobble                      |
| **Marginal Success** | **Keeps Footing** | Recovers balance and stays upright                        |
| **Marginal Failure** | **Stumbles**      | Loses footing and falls prone                             |
| **Critical Failure** | **Falls Hard**    | Loses footing completely and crashes to the ground, prone |

## Fumble Test

|               |                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Name**      | Fumble Test                                                                                                              |
| **Shortcode** | `fumbleTest`                                                                                                             |
| **Icon**      | `fa-solid fa-arrow-down` (a downward arrow)                                                                              |
| **Invoked**   | The **Actions context menu** on the Being                                                                                |
| **API**       | [`BeingLogic.fumbleTest`](https://api.heroiclands.org/main/classes/sohl.document.actor.logic.BeingLogic.html#fumbletest) |

Rolls the better of **Dexterity** and **Legerdemain** to keep hold of what you
are carrying. Same flow; the result card reads:

| Result               | Outcome         | What it means                                    |
| -------------------- | --------------- | ------------------------------------------------ |
| **Critical Success** | **Sure-Handed** | Never comes close to losing the item             |
| **Marginal Success** | **Keeps Grip**  | Recovers the hold and keeps the item in hand     |
| **Marginal Failure** | **Fumbles**     | Loses grip and drops the item                    |
| **Critical Failure** | **Drops It**    | Loses grip entirely; the item is flung from hand |

Neither test changes anything on the sheet — the card is the record, and what a
stumble or a dropped weapon costs is played out at the table. Falling prone is
described in the [[rules/sohl-prone|Prone]] rules.

## The standard test dialog

Both tests open the ordinary pre-roll dialog — Target, the modifier breakdown,
**Situational Modifier**, **Success Level Modifier**, and **Roll Visibility** —
described once on [[Item_Base|Base Item]]. Cancelling it abandons the test.

# Fear Test

|               |                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Fear Test                                                                                                            |
| **Shortcode** | `fearTest`                                                                                                           |
| **Icon**      | `ginf-screaming` (a screaming face)                                                                                  |
| **Invoked**   | The **Actions context menu** on the Being                                                                            |
| **API**       | [`BeingLogic.fearTest`](https://api.heroiclands.org/main/classes/sohl.document.actor.logic.BeingLogic.html#feartest) |

## What it does and when to use it

A test of **Will** against something frightening — a horror, a sorcery, a sheer
drop. Use it when the GM calls for one; the roll is made on the frightened
character's own sheet.

Fear is tracked **per source**. Each frightening thing the character faces gets
its own record, so being afraid of the wight in the barrow is separate from being
afraid of the fire. The character's overall fear state is the worst of them.

## What happens on screen

There is no pre-roll dialog — the Will roll goes straight to chat, and a
**Fear** result card follows. If the character is currently **Brave** (see
below), **+20** is added to the roll automatically.

| Result                                      | State         | What it means                                                            |
| ------------------------------------------- | ------------- | ------------------------------------------------------------------------ |
| **Critical Success**                        | **Brave**     | Immune to this source; **+20** to Fear and Morale tests for five minutes |
| **Marginal Success**                        | **Steady**    | Immune to this source of fear                                            |
| **Marginal Failure**                        | **Afraid**    | May respond in combat only with Block or Dodge; must flee at full Move   |
| **Critical Failure** (roll not ending in 0) | **Terrified** | As Afraid, and worse — **+1 Psyche Stress**                              |
| **Critical Failure** (roll ending in 0)     | **Catatonic** | Unaware, unable to act, and Helpless — **+2 Psyche Stress**              |

## The Fear card and what changes

The card shows the character's name, the resulting **State** (green on a success,
red on a failure), any **Psyche Stress** gained, and the effect notes for that
state. It carries no buttons — it is a record of what happened.

On the sheet:

- **A frightened result records a trauma** for that source, or worsens the one
  already there, and adds any new Psyche Stress.
- **A success clears that source** entirely; a Critical Success leaves a
  short-lived **Brave** marker good for five minutes.
- **The `fearful` condition is kept in step** with the character's overall fear
  state across all sources, so the token shows it exactly while some source still
  frightens them.

See the [[rules/sohl-fear|Fear]] rules for what each state permits, and
[[rules/sohl-psychological-condition|Psychological Condition]] for Psyche Stress.

# Morale Test

|               |                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Name**      | Morale Test                                                                                                              |
| **Shortcode** | `moraleTest`                                                                                                             |
| **Icon**      | `fa-solid fa-shield-heart` (a heart on a shield)                                                                         |
| **Invoked**   | The **Actions context menu** on the Being                                                                                |
| **API**       | [`BeingLogic.moraleTest`](https://api.heroiclands.org/main/classes/sohl.document.actor.logic.BeingLogic.html#moraletest) |

## What it does and when to use it

A test of **Initiative** against a reason to break — the line collapsing, a
friend cut down, odds that have turned hopeless. Where a Fear Test asks whether
you are frightened, a Morale Test asks whether you are still willing to fight.

Like fear, morale is tracked **per source**, and the character's morale state is
the worst across them.

## What happens on screen

No pre-roll dialog: the Initiative roll posts to chat, and a **Morale** card
follows. A currently **Brave** character rolls at **+20**.

| Result                                      | State           | What it means                                                     |
| ------------------------------------------- | --------------- | ----------------------------------------------------------------- |
| **Critical Success**                        | **Brave**       | May act freely; **+20** to Morale and Fear tests for five minutes |
| **Marginal Success**                        | **Steady**      | May take any action                                               |
| **Marginal Failure**                        | **Withdrawing** | Retreats at half Move or more each turn                           |
| **Critical Failure** (roll not ending in 0) | **Routed**      | Flees the source at full Move, or Passes and surrenders           |
| **Critical Failure** (roll ending in 0)     | **Catatonic**   | Unaware and unable to move, act, or defend                        |

The card shows the resulting **State**, any **Psyche Stress** gained, and the
effect note for that state; it carries no buttons.

On the sheet, a shaken result records or worsens a morale trauma for that source
and adds any Psyche Stress; a success clears the source, and a Critical Success
leaves the five-minute **Brave** marker. **Morale sets no condition on the
token** — the trauma items are the record.

A shaken character can come back two ways: their own
[Reaction Test](#reaction-test), or an ally's [Rally Test](#rally-test). See the
[[rules/sohl-morale|Morale]] rules.

# Reaction Test

|               |                                                                                                                              |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Reaction Test                                                                                                                |
| **Shortcode** | `reactionTest`                                                                                                               |
| **Icon**      | `fa-solid fa-person-walking-arrow-loop-left` (a figure turning back)                                                         |
| **Invoked**   | The **Actions context menu** on the Being                                                                                    |
| **API**       | [`BeingLogic.reactionTest`](https://api.heroiclands.org/main/classes/sohl.document.actor.logic.BeingLogic.html#reactiontest) |

## What it does

A shaken combatant's attempt to pull themselves together — an **Initiative** test
made on their own behalf, or in answer to an ally's rally.

Only a **shaken** character (Withdrawing, Routed, or Catatonic) can make one.
Anyone else is told _"Only a shaken (Withdrawing, Routed, or Catatonic) combatant
makes this test."_ and nothing is rolled.

## What happens on screen

The Initiative roll posts to chat with no pre-roll dialog, followed by a state
card showing the result:

- **Success** — a **Catatonic** character improves to **Routed**; anyone else
  snaps back to **Steady**, and every shaken morale source is cleared from the
  sheet.
- **Failure** — the state persists; nothing changes.

# Rally Test

|               |                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Rally Test                                                                                                             |
| **Shortcode** | `rallyTest`                                                                                                            |
| **Icon**      | `fa-solid fa-flag` (a flag)                                                                                            |
| **Invoked**   | The **Actions context menu** on the Being                                                                              |
| **API**       | [`BeingLogic.rallyTest`](https://api.heroiclands.org/main/classes/sohl.document.actor.logic.BeingLogic.html#rallytest) |

## What it does and when to use it

A leader's attempt to steady shaken allies — once per round, as a free action.
It rolls the leader's **Command** skill, falling back to **Initiative** when the
character has no Command.

A rally is **offered, never imposed**. A successful Rally Test does not reach
into anyone else's character sheet; it posts an open invitation, and each shaken
ally's own player decides whether to take it.

## What happens on screen

The Command (or Initiative) roll posts to chat with no pre-roll dialog. Then:

- **Critical Success** — a **Rally!** card posts offering shaken allies an
  immediate steadying.
- **Marginal Success** — a **Rally!** card posts offering shaken allies a
  Reaction Test instead.
- **Failure** — an informational card posts reading _"Unresponsive — no allies
  rally; no further Rally Test for now."_

## The Rally! card

| Part                        | What it shows                                                                                                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Title                       | **Rally!**                                                                                                                                      |
| Body                        | _{leader}_ rallies shaken allies.                                                                                                               |
| Offer line                  | On a Critical Success, _"A Routed or Withdrawing ally may steady themselves."_; on a Marginal Success, _"…may make a Reaction Test to steady."_ |
| **Answer the Rally** button | Applies the rally to **your own** character — see [Answer the Rally](#answer-the-rally)                                                         |

This card is **open**: anyone may click the button, and it acts on the clicking
player's own character, not on anybody else's. The card stays in the log, so an
ally can answer it late — or ignore it entirely.

## Answer the Rally

|               |                                                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Answer the Rally                                                                                                           |
| **Shortcode** | `acceptRally`                                                                                                              |
| **Icon**      | `fa-solid fa-flag` (a flag)                                                                                                |
| **Invoked**   | **Hidden — not on the Actions context menu.** Reached only from the **Answer the Rally** button on a Rally! card.          |
| **API**       | [`BeingLogic.acceptRally`](https://api.heroiclands.org/main/classes/sohl.document.actor.logic.BeingLogic.html#acceptrally) |

Your character's response to an ally's rally. It **self-gates**: only a shaken
character can answer, and anyone else who clicks is told _"Only a shaken
(Withdrawing, Routed, or Catatonic) combatant makes this test."_

What it does depends on how well the leader rolled:

- **From a Critical Success rally** — your character becomes **Steady** at once,
  and every shaken morale source is cleared.
- **From a Marginal Success rally** — your character makes a
  [Reaction Test](#reaction-test), which may or may not steady them.

# Resist the Pall

|               |                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Name**      | Resist the Pall                                                                                                          |
| **Shortcode** | `pallResist`                                                                                                             |
| **Icon**      | `fa-solid fa-skull` (a skull)                                                                                            |
| **Invoked**   | The **Actions context menu** on the Being                                                                                |
| **API**       | [`BeingLogic.pallResist`](https://api.heroiclands.org/main/classes/sohl.document.actor.logic.BeingLogic.html#pallresist) |

## What it does and when to use it

The Pall is a spiritual miasma that clings to certain places. A character
standing in one tests **Spirit** at the start of their turn to hold it off. The
test uses a **spirit** skill where the character has one, and falls back to the
**Aura** attribute otherwise.

The Pall's depth bites: the roll takes a penalty of **5 × the total Pall
Strength** affecting the character, so a deep Pall is very hard to resist.

## What happens on screen

The Spirit roll posts to chat with no pre-roll dialog, followed by a state card:

| Result                                      | State         | What it means                                                |
| ------------------------------------------- | ------------- | ------------------------------------------------------------ |
| **Critical Success**                        | **Immune**    | Resisted; immune to its sources for now                      |
| **Marginal Success**                        | **Resist**    | Resisted the Pall — immune to its sources for now            |
| **Marginal Failure**                        | **Disturbed** | Must move out of the Pall — **+1 Pall Stress Level**         |
| **Critical Failure** (roll not ending in 0) | **Terrified** | Flees the source at full Move; no Counterstrike — **+2 PSL** |
| **Critical Failure** (roll ending in 0)     | **Catatonic** | Unaware and unable to move, act, or defend — **+3 PSL**      |

A failure accrues **Pall Stress Levels** on the character's single **Pall Cloud**
trauma, creating it on the first failure and adding to it thereafter. A success
changes nothing on the sheet.

See the [[rules/sohl-the-pall|The Pall]] rules for Pall Strength, what the
accumulated Cloud does to a character, and how it clears.

# Calculate Impact

|               |                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Name**      | Calculate Impact                                                                                                         |
| **Shortcode** | `calcImpact`                                                                                                             |
| **Icon**      | `fa-solid fa-bullseye` (a target)                                                                                        |
| **Invoked**   | The **Actions context menu** on the Being — but it is normally reached from a combat card, not picked by hand            |
| **API**       | [`BeingLogic.calcImpact`](https://api.heroiclands.org/main/classes/sohl.document.actor.logic.BeingLogic.html#calcimpact) |

## What it does

The bridge between "the blow landed" and "here is the wound." It rolls (or
re-uses) the damage for a strike and posts a **damage card** whose button hands
the result to the target so their side can resolve the injury.

This is a plumbing step in the combat flow rather than something you would
normally pick off the menu: the attack cards fire it for you with the impact
details already filled in. Picking it by hand with nothing to work from will
report that it needs an impact in its scope and stop.

## The damage card

| Part                                   | What it shows                                                                                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title                                  | The strike mode's name, or **Impact**                                                                                                                         |
| **Formula**                            | The damage formula rolled, with its aspect                                                                                                                    |
| **Roll**                               | The dice result and the total impact                                                                                                                          |
| **Aspect**                             | Blunt, Edged, Piercing, or Fire                                                                                                                               |
| **Calculate _{target}_ Injury** button | Runs [Resolve Injury](#resolve-injury) on the target, carrying the impact, the aspect, and — when the blow was aimed — the aimed zone and the strike's spread |

The button acts on the **target's** character, so the target's own player (or the
GM) settles the wound. See [[Combat_Basics]] for where the damage card fits into
an exchange.

# Resolve Injury

|               |                                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Resolve Injury                                                                                                                    |
| **Shortcode** | `resolveInjury`                                                                                                                   |
| **Icon**      | `fa-solid fa-bandage` (a bandage)                                                                                                 |
| **Invoked**   | The **Actions context menu** on the Being, the **Calculate _{target}_ Injury** button on a damage card, or the sheet's Add Injury |
| **API**       | [`BeingLogic.resolveInjury`](https://api.heroiclands.org/main/classes/sohl.document.actor.logic.BeingLogic.html#resolveinjury)    |

## What it does and when to use it

Turns a blow into an actual wound on this character: where it landed, how much
armor stopped, how bad the injury is, whether it bleeds, and — for the worst
edged wounds — whether the limb comes off. It is the single entry point behind
the combat cards' injury buttons and the sheet's Add Injury, so it behaves the
same however you get there.

Use it by hand when a wound arrives outside combat — a fall, a trap, a GM ruling.

## Before you start

- **The character needs a body.** One with no body structure is told _"…has no
  body; it cannot take an injury."_
- **An incorporeal character cannot be wounded** by a physical blow; the system
  says so and stops.

## The Resolve Injury dialog

Titled _{character}: Resolve Injury_. Every field is pre-filled from whatever
sent you here, so from a combat card you usually just confirm.

- **Target ZN:** — the body Zone Number the blow was aimed at, from 1 up to the
  body's highest zone. Used **only** when the Location is left to derive; it is
  disabled while an explicit Location is chosen.
- **Zone Die:** — the die rolled to scatter the hit away from the Target ZN. A
  bigger die means a wilder spread. Also used only while the Location derives.
- **Location:** — the hit location. Leave it on **(derive from Target ZN + ZD)**
  to let the aim and the scatter die decide, or pick a location outright to
  override the roll. An overridden location is flagged on the result card.
- **Aspect:** — Blunt, Edged, Piercing, or Fire. This drives which injury table
  applies and how armor behaves.
- **Impact:** — the damage value **before** armor.
- **Armor Reduction:** — armor negated by the blow. It is applied **only** for a
  piercing aspect; for any other aspect it is ignored.
- **Bleed Impact Penalty:** — extra impact counted **only** when deciding whether
  the wound bleeds, not when computing the wound itself.
- **Treatment Modifier:** — a modifier recorded on the resulting wound, applied
  later when a physician treats it.
- **Add to Character Sheet** — when ticked, a real wound is recorded as a trauma
  item on the character. Untick it to resolve a blow without writing it down.
  Its starting state follows the world's **record trauma** setting.

Dismissing the dialog abandons the whole thing; nothing is rolled or recorded.

## The Amputation Test dialog

A **grievous edged wound at a severable location** triggers a Strength test
before the result is posted. The dialog explains that the location may be severed
and offers one field:

- **Amputation Test Modifier:** — the modifier for the Strength test, pre-filled
  from how amputable that location is. Adjust it if the GM rules otherwise.

The Strength roll then posts to chat. A failure may sever the location — which
**kills the character outright if the location is vital** — and may leave the
wound bleeding or penalize the following Shock Roll.

## The Resolve Injury card

| Part                  | What it shows                                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Title                 | The body zone struck, with the character's name beneath                                                                                         |
| **Zone**              | The aim trace — Target ZN, the Zone Die and what it rolled, and the zone that was hit — or just the zone name when you set the Location by hand |
| **Location**          | The hit location that took the blow                                                                                                             |
| **Aspect**            | Blunt, Edged, Piercing, or Fire                                                                                                                 |
| **Armor Layers**      | What was worn there and its protection value                                                                                                    |
| **Imp / IL / Shk**    | The impact, the resulting **Injury Level** (or _No Injury_), and the **Shock Index** the wound contributes                                      |
| Notes                 | Glancing blow, bleeder, whether a Stumble or Fumble test applies, the amputation outcome, and the treatment modifier                            |
| **Shock Roll** button | Appears when the wound calls for one — runs the shock test with the wound's index already computed                                              |

If the scatter die sends the blow off the body entirely, a **miss** card posts
instead: it shows the aim trace and reports that nothing was hit. No wound, no
record.

A recorded wound becomes a trauma item on the sheet, shows up in the body-part
grid, and drives the health bar. See [[Afflictions_Injuries]] for living with it,
the [[rules/sohl-injury|Injury]] rules for the tables behind it, and
[[rules/sohl-bleeding|Bleeding]] for what a bleeder costs.

# Contract Disease

|               |                                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Contract Disease                                                                                                                   |
| **Shortcode** | `contractDisease`                                                                                                                  |
| **Icon**      | `fa-solid fa-virus` (a virus)                                                                                                      |
| **Invoked**   | The **Actions context menu** on the Being                                                                                          |
| **API**       | [`BeingLogic.contractDisease`](https://api.heroiclands.org/main/classes/sohl.document.actor.logic.BeingLogic.html#contractdisease) |

## What it does and when to use it

Rolls whether this character catches a disease they have been exposed to — bad
water, a plague ward, a rat bite. The roll is a d100 against the disease's
**Contagion Index × the character's Endurance**, and it is the one test you
_want_ to fail nothing about: **failing** the roll means the character contracts
the disease.

A character with **no Endurance attribute** cannot make the test and is told so.

## The Contract Disease dialog

- **Disease:** — a drop-down of every disease found in your world and in the
  installed compendium packs, plus a final **— Custom disease —** entry for
  something not yet written up. Only afflictions that are actually diseases are
  listed.
- **Custom disease** fieldset — used **only** when _— Custom disease —_ is
  selected above:
    - **Name:** — what to call it.
    - **Contagion Index:** — from 1 to 5. **Lower is more contagious**, because a
      lower index means a lower number to roll under, and the roll is one you are
      trying to make.

Dismissing the dialog stops there. Choosing a disease then opens the **standard
test dialog** (described on [[Item_Base|Base Item]]), titled _{character} –
Contract {disease}_, where you can add a situational modifier for exposure.

## What happens next

The d100 posts to chat as an ordinary test result.

- **Success** — nothing happens; the character shrugged off the exposure.
- **Failure** — the character **contracts the disease**. An affliction item is
  created on their sheet (copied from the chosen disease, or built from the
  custom name and index), and a line in chat reports _"{character} contracted
  {disease}."_

A contracted disease then offers a **Set an Onset Check Reminder?** dialog (the
shared offer-schedule dialog on [[Item_Base|Base Item]]). Accepting arms a
reminder for when the incubation period is up; declining arms nothing, and you
can track it by hand. Nothing about the disease progresses on its own — see
[[Item_Affliction]] and the [[rules/sohl-afflictions|Afflictions]] rules.

# Perform Treatment Test

|               |                                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Perform Treatment Test                                                                                                                       |
| **Shortcode** | `performTreatmentTest`                                                                                                                       |
| **Icon**      | `fa-solid fa-staff-snake` (a physician's staff)                                                                                              |
| **Invoked**   | The **Actions context menu** on the **physician's** Being, or the open button on a wound's _Treatment Requested_ card                        |
| **API**       | [`BeingLogic.performTreatmentTest`](https://api.heroiclands.org/main/classes/sohl.document.actor.logic.BeingLogic.html#performtreatmenttest) |

## What it does and when to use it

The physician's half of treating a wound. **Your** character rolls **their own**
Physician skill against someone's injury and proposes a Healing Rate for it. You
never touch the patient's sheet — the result goes to chat, and the patient's own
player accepts it.

Run it when a wounded character asks for treatment. If a wound has posted a
_Treatment Requested_ card, any qualified physician can answer it by clicking its
button; the wound is filled in for you and no dialog opens.

**You need the Physician skill.** Without it you are told _"Your character has no
Physician skill; the Treatment Test is not available."_ and nothing is rolled —
which leaves an open request card live for someone who does.

## The Perform Treatment Test dialog

Opens only when you run the action by hand. Titled _{physician}: Treatment Test_.

- **Injury UUID (optional)** — paste the wound's UUID here, taken from the
  injury's sheet header with Foundry's **Copy Document UUID**. Filling this in
  targets a real wound, and the result card gets an **Accept** button the patient
  can use. The hint below the field says as much.
- **Severity:** — 1 to 5. Used only when the UUID is left blank, for a
  GM-directed test where the wound is described rather than linked.
- **Aspect:** — Blunt, Edged, Piercing, or Fire. Also for the blank-UUID case.

A pasted UUID that is not an injury is rejected with _"Only injuries can be
treated with a Treatment Test."_, and an already-healed wound with _"This injury
has already healed; no treatment is needed."_

The roll follows, at the modifier the wound's aspect and severity require.

## The Treatment Result card

| Part                        | What it shows                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| Title                       | **Treatment Result**                                                                      |
| Physician line              | Who performed the test                                                                    |
| **Aspect / Severity**       | The wound treated                                                                         |
| **Treatment**               | The treatment the wound required                                                          |
| **Healing Rate**            | The proposed rate as **H*n***, or **Healed** when the treatment closes the wound          |
| Risk notes                  | Infection risk, permanent impairment risk, or a new bleeder, when the result carries them |
| **Accept Treatment** button | Records the proposed Healing Rate on the wound                                            |

**Only the patient's side can press Accept**, and pressing it is what actually
changes the wound — the physician proposes, the patient records. A GM-directed
test with no linked wound posts the same card **without** the button; someone
applies the result by hand.

See [[Afflictions_Injuries]] for treating and healing wounds, and the
[[rules/sohl-healing-base|Healing Base]] and [[rules/sohl-infection|Infection]]
rules for what a Healing Rate does over time.

# Perform Blood Stoppage

|               |                                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Perform Blood Stoppage                                                                                                                       |
| **Shortcode** | `performBloodStoppage`                                                                                                                       |
| **Icon**      | `fa-solid fa-droplet-slash` (a crossed-out drop of blood)                                                                                    |
| **Invoked**   | The **Actions context menu** on the **physician's** Being, or the open button on a _Request Blood Stoppage_ card                             |
| **API**       | [`BeingLogic.performBloodStoppage`](https://api.heroiclands.org/main/classes/sohl.document.actor.logic.BeingLogic.html#performbloodstoppage) |

## What it does and when to use it

The urgent cousin of the Treatment Test: your character tries to **staunch
someone's bleeding** before they lose too much blood. It rolls your own Physician
skill and posts the outcome for the bleeding character to accept.

Use it the moment a bleeder appears. A bleeding wound posts a _Request Blood
Stoppage_ card; any physician can answer it, and the wound is filled in for you.

**You need the Physician skill** here too, with the same message when you do not
have it. A previous attempt that ended in a Marginal Failure carries **+10** into
this one automatically.

There is no dialog — the roll happens straight away.

## The Blood Stoppage Result card

| Part              | What it shows                                                            |
| ----------------- | ------------------------------------------------------------------------ |
| Title             | **Blood Stoppage Result**                                                |
| Body              | _{physician}_ attempted to staunch _{wound}_.                            |
| Outcome           | The result, in green when the bleeding is stopped and red when it is not |
| **Accept** button | Relays the outcome to the bleeding wound                                 |

The four outcomes are:

| Result               | Outcome                                                      |
| -------------------- | ------------------------------------------------------------ |
| **Critical Success** | Bleeding stops immediately.                                  |
| **Marginal Success** | Bleeding will stop after the next Blood Loss Advance.        |
| **Marginal Failure** | Bleeding continues; **+10** to the next Blood Stoppage Test. |
| **Critical Failure** | Bleeding continues.                                          |

As with treatment, **only the patient's side presses Accept**, and that press is
what changes the wound. See the [[rules/sohl-bleeding|Bleeding]] rules for Blood
Loss Advances and what running out of blood means.

# See also

- [[Actions]] — how actions, the Actions tab, and the context menu work.
- [[Item_Base|Base Item]] — the standard test dialog and the offer-schedule
  dialog these actions share.
- [[Afflictions_Injuries]] — wounds, diseases, and conditions on the sheet.
- [[Combat_Basics]] — where the damage and injury cards fit into an exchange.
- [[Combatant]] — the combat tracker row and its own actions.
- [[Skill_Tests]] — the d100 roll-under test underneath all of these.
- [[Character_Creation]] — building the Being in the first place.
