---
aliases:
    - Mystical Ability
id: k2BO5PGE97a6YEZe
type: doc
package: sohl
category: user-guide
name:
    full: "Mystical Ability"
slug: "item-mysticalability"
folder: QtOgPodi8X6gDWL0
---

# What Is a Mystical Ability?

A Mystical Ability is a specific supernatural power — a spell, prayer, ritual, or other manifestation of mystical power that a character can invoke. Unlike a mystery, it is always something that is performed resulting in a specific effect. Each Mystical Ability defines exactly what happens when it is used: its effects, costs, range, duration, and any requirements for successful use.

Mystical Abilities fall into one of three broad supernatural categories: **Arcane**, **Divine**, or **Spirit**.

Invoking one is a **roll**, and that roll is the ability's single action — see
[Success Test](#success-test) below. SoHL rolls it and reports how well it went;
what the ability then _does_ is read off the rulebook and applied by the people
at the table.

# Where It Appears

Mystical Abilities appear on the Being sheet's **Mysteries** tab, in their own
half below the Mysteries themselves, grouped into one **ledger per sub-type** — a
Spirit Rite section, an Arcane Incantation section, and so on. Only sub-types the character actually has
are shown, and each section's **＋ Add** button creates another of that sub-type.

Each sub-type shows only the columns that mean something for it, so the ledgers
are not all the same width:

| Column           | What it shows                                                                                               | Shown for                         |
| ---------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **Ability**      | The ability's name. Click it to open the ability                                                            | Every sub-type                    |
| **Skill**        | The **Associated Skill** that governs the roll, or a ✕ when none is set                                     | The skill-governed sub-types      |
| **Spirit Power** | The **Spirit Power** that governs the roll, or a ✕ when none is set                                         | Spirit Rite and Spirit Action     |
| **Affiliation**  | The Affiliation whose standing the ability draws on, or a ✕                                                 | The affiliation-bearing sub-types |
| **Lvl**          | The ability's **Level**, or a ✕ when it has none                                                            | The sub-types with a power level  |
| **EML**          | The Effective Mastery Level. **This cell is the roll** — click it to run a [Success Test](#success-test)    | Every sub-type                    |
| **Chgs/Max**     | Charges remaining over the maximum. ✕ when the ability does not use charges, ∞ for unlimited                | Every sub-type                    |
| **Notes**        | The ability's one-line note                                                                                 | Every sub-type                    |
| **☆ star**       | Flags the ability for improvement — see the known gap under [Additional Properties](#additional-properties) | Every sub-type                    |
| **⋮ menu**       | The Actions context menu — every action on this page                                                        | Every sub-type                    |

**A greyed-out row cannot be invoked.** An ability is greyed and its EML cell
stops being a button when it is **out of charges**, or when it is a Spirit Rite
or Spirit Action with **no valid Spirit Power** associated. The EML is still
shown, so you can see what the roll _would_ be; see
[Before you start](#before-you-start).

# Additional Properties

Along with the [[Item_Base|Standard Item Properties]], the following properties also appear in the **Properties** tab:

- **Mastery Level:** The ability's _own_ internal mastery level. It is used
  **only** when no Associated Skill (or Spirit Power) is set — see
  [_How the Effective Mastery Level Is Determined_](#how-the-effective-mastery-level-is-determined)
  below. On an ability that does draw on a skill, this box is ignored, and
  editing it changes nothing.
- **Improvement Flag:** Marks the ability as one the character is trying to
  improve. The same flag is the **☆ star** on the ability's row on the Mysteries
  tab.
- **Associated Skill:** Which Skill governs this ability's roll (optional),
  chosen from the character's own skills. On a **Spirit Rite** or **Spirit
  Action** this same selector names a **Spirit Power** instead — one of the
  character's own Spirit Power abilities — and the sheet column is labelled
  accordingly.
- **Associated Affiliation:** Which [[Item_Affiliation|Affiliation]] this ability draws its standing from (optional) — the church, arcane or alchemical school, or ancestor/totem/spirit whose membership the ability belongs to. Recording it lets the ability's behaviour take the character's **rank** in that body into account (its **Level**): a full priest and a layperson of the same faith can differ in what they can invoke. This only _informs_ the ability — the player still deliberately triggers every invocation.
- **Level:** The difficulty or power tier of the ability. Leave it blank for an
  ability that has no level, and the sheet shows a ✕. Higher-level incantations
  are also harder to invoke — see
  [_The Incantation Casting Penalty_](#the-incantation-casting-penalty) below.
- **Charges:** How many times the ability can still be used, in a **Charges** box
  of its own:
    - **Current Charges:** Charges remaining. Leave it blank for an ability whose
      uses are unlimited (the sheet shows ∞).
    - **Maximum Charges:** The cap, and the control that decides whether the
      ability uses charges at all. Leave it blank for one that does not (the
      sheet shows ✕); enter `0` for one that is counted but uncapped.
    - Each completed [Success Test](#success-test) spends one charge.

An ability's **sub-type is fixed when it is created** — you choose it with the
＋ Add button of the section you want, and there is no control to change it
afterwards. The sub-type is shown under the ability's name at the top of its
sheet, and the sub-types are:

- **Spirit Rite:** A prepared ceremony by which a practitioner petitions the spirit world.
- **Spirit Action:** A discrete supernatural act performed through an allied or bound spirit.
- **Spirit Power:** A standing power conferred on its bearer by a spirit.
- **Ritual Action:** A prescribed ritual act performed to earn the favour of a deity.
- **Divine Incantation:** A spoken invocation channelling the power of a deity.
- **Arcane Incantation:** A formally learned spell, invoked by word and gesture.
- **Arcane Talent:** An innate arcane knack, possessed without formal training.
- **Spirit Talent:** An innate affinity for the spirit world, possessed without training.
- **Alchemy:** The preparation of substances imbued with mystical potency.
- **Divination:** The practice of obtaining hidden knowledge or foreknowledge by mystical means.

> **Known gaps.** Two defects affect this tab today:
>
> - **The ☆ star and the Improvement Flag do nothing yet.** A Mystical Ability
>   can be flagged for improvement from either place, but there is no
>   **Improve with SDR** action to act on the flag the way a
>   [[Item_Skill|Skill]] has (issue #1130). Improve the ability's Associated
>   Skill instead, and the ability improves with it.
> - **The Chgs/Max and Notes column headers run together** on the Mysteries tab
>   (issue #1131). The columns themselves are correct.

# How the Effective Mastery Level Is Determined

Invoking a Mystical Ability is resolved as a mastery level test. The **Effective Mastery Level (EML)** used for that test is determined by whether the ability has an **Associated Skill**:

- **If an Associated Skill is set,** the ability draws its mastery level from that skill. This is the usual case: many abilities share a single governing skill, so they improve together and inherit any modifiers applied to that skill — including Active Effects (for example, an effect representing a caster's resistance to a particular tradition applies to every ability that skill governs).
- **If no Associated Skill is set,** the ability uses its own internal mastery level instead.

Either way, the ability's own modifiers still stack on top of the mastery level it draws upon.

Two sub-types read that rule differently:

- A **Spirit Rite** or **Spirit Action** draws its mastery level from the
  associated **Spirit Power** rather than from a skill, and cannot be invoked at
  all without a valid one.
- A **Ritual Action** takes its ritual skill's mastery level only when that skill
  actually has one. An unlearned ritual contributes nothing, and the ability
  falls back on its own Mastery Level.

## The Incantation Casting Penalty

**Arcane Incantations** and **Divine Incantations** become harder to invoke the more powerful they are. When one of these abilities is invoked, a penalty equal to **Level × 2** is applied to its EML — so a Level 3 incantation is invoked at EML − 6, a Level 4 at EML − 8, and so on.

Abilities with no level (and abilities at Level 0) take no penalty, and other subtypes — talents, rites, ritual actions, and the like — are not affected.

The penalty is itemized wherever the roll is broken down: hovering the EML cell
shows it as **LvlPen −6**, and it gets its own row in the test dialog's and the
test card's Adjustment table.

> **Known gap.** In the Adjustment table the penalty's row is currently labelled
> with a raw text key, `SOHL.MysticalAbility.LevelPenalty`, instead of _Level
> Penalty_ (issue #1127). The value beside it is correct, and so is the **LvlPen**
> summary in the tooltip. The same fault affects every modifier row on every test
> card and dialog, not just this one.

# The Mystical Ability Actions

| Action                        | Shortcode     | Where you meet it                               |
| ----------------------------- | ------------- | ----------------------------------------------- |
| [Success Test](#success-test) | `successTest` | Actions context menu, or the row's **EML** cell |

Every Mystical Ability also carries the shared document actions — **Edit**,
**Delete**, and **Output Description to Chat** — described once on
[[Item_Base|Base Item]]. The full menu on an ability is therefore: _Edit_,
_Success Test_, _Delete_, _Output Description to Chat_.

To reach any of them, click the **⋮** on the ability's row on the Mysteries tab,
or open the ability and use its **Actions** tab.

A Mystical Ability defines **no hidden actions of its own**. The one action you
will meet elsewhere is the shared GM **result edit**, reached from the ✎ pencil
on a posted test-result card and described on [[Item_Base|Base Item]].

**What the ability _does_ is not automated.** SoHL rolls the invocation and
reports the outcome; it does not apply the spell's effect, spend its material
components, or resolve what it does to a target. That deliberately stays with the
people at the table — where an ability's effect should be automated, attach a
Script Action to it (see [[Actions]]).

# Success Test

|               |                                                                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Success Test                                                                                                                                  |
| **Shortcode** | `successTest`                                                                                                                                 |
| **Icon**      | `fa-bullseye` (a target)                                                                                                                      |
| **Invoked**   | The **Actions** context menu, or by clicking the ability's **EML** cell on the Mysteries tab                                                  |
| **API**       | [`MysticalAbilityLogic.successTest`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.MysticalAbilityLogic.html#successtest) |

## What it does and when to use it

**This is the invocation.** Casting the spell, performing the rite, calling on
the ancestor — whenever a character uses a Mystical Ability and the table wants
to know whether it worked, this is the roll. It rolls a d100 against the
ability's **Effective Mastery Level** and reports critical success, marginal
success, marginal failure, or critical failure, exactly as a
[[Item_Skill|Skill]] test does.

Use it at the moment of invocation, not before: the EML shown on the row already
includes everything the system knows about, including the
[casting penalty](#the-incantation-casting-penalty) for a high-level incantation,
so the number on the sheet is the number you are rolling under.

What happens on a success — what the spell does, to whom, for how long — comes
from the ability's own description and the rules of its tradition. SoHL settles
the roll and stops there.

## Before you start

- **A charge is spent by rolling.** If the ability has a **Maximum Charges**, a
  completed roll takes one off **Current Charges**. Cancelling the dialog spends
  nothing. Spending the charge needs no separate confirmation — it is the direct
  consequence of your own roll.
- **An exhausted ability refuses.** With no charges left, the row is greyed, the
  EML cell is no longer a button, and running the action any other way is refused
  with _"{name}" has no charges remaining._ — nothing is rolled and nothing is
  posted. Raise **Current Charges** on the ability's sheet to recharge it.
- **A Spirit Rite or Spirit Action needs its Spirit Power.** Without a valid one
  associated, the ability is likewise greyed and refuses with _"{name}" has no
  valid Spirit Power and cannot be invoked._ Set the **Spirit Power** selector on
  its Properties tab to one of the character's own Spirit Power abilities.

## What happens on screen

1. **The standard test dialog opens.** Target, the modifier breakdown, Situational
   Modifier, Success Level Modifier, and Roll Visibility — its fields are described
   once on [[Item_Base|Base Item]]. Cancelling it rolls nothing, posts nothing, and
   spends no charge. Clicking the EML cell with **Shift** held skips the dialog and
   rolls at once.
2. **The d100 is rolled** against the effective mastery level.
3. **A charge is spent**, if the ability uses them.
4. **A test-result card posts to chat** with the modifier breakdown, the Target,
   the Roll, and the outcome, colored by success or failure.

## The test-result card

| Part                     | What it shows                                                            |
| ------------------------ | ------------------------------------------------------------------------ |
| Title                    | The test's name — see the known gap below                                |
| ✎ pencil _(GM only)_     | Re-opens the dialog to correct the modifiers, without re-rolling the die |
| _The modifier breakdown_ | Every modifier that made up the target — the casting penalty among them  |
| **Target**               | The number the roll had to come in at or under                           |
| **Roll**                 | The d100 result, green on a success and red on a failure                 |
| _The footer_             | The named outcome — _Marginal Success_, _Critical Failure_, and so on    |

The GM's pencil is described on [[Item_Base|Base Item]], under _Editing a Posted
Test Result_.

> **Known gaps.** Two defects affect this card today:
>
> - **No Fate can be spent on an invocation.** The card never offers the **Fate**
>   button, even when the character holds a Fate Point (issue #1106). This bites
>   here because an ability normally borrows its mastery level from its Associated
>   Skill — so the same number, rolled from the Skills tab, _does_ offer Fate.
>   Until it is fixed, spend Fate at the table by agreement, or have the GM adjust
>   the result with the pencil.
> - **The card's title shows a raw text key**
>   (`SOHL.MasteryLevelModifier.successTest`) instead of the test's name, such as
>   _Fire Dart Test_ (issue #1107). Everything below the title is correct. The same
>   title appears on skill and attribute tests, for the same reason.

# See also

- [[Item_Base|Base Item]] — the standard item properties, the shared **Edit** /
  **Delete** / **Output Description** actions, and the standard test dialog this
  page's roll opens.
- [[Item_Mystery|Mysteries]] — the passive counterpart: what a character _is_
  rather than something they invoke.
- [[Item_Skill|Skill]] — the governing skill an ability usually draws its mastery
  level from.
- [[Item_Affiliation|Affiliation]] — the body whose standing an ability can draw on.
- [[Skill_Tests]] — what the numbers in a test mean, and how success levels are read.
- [[Actions]] — how actions work, and how to attach a Script Action that automates
  what an ability actually does.
- [[rules/sohl-esoterica|Esoterica]] — the rules behind the mystical traditions.
- [[Shortcodes]] — what the Associated Skill and Affiliation selectors are naming.
