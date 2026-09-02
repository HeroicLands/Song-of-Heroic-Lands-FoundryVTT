---
aliases:
  - Mystical Ability
id: k2BO5PGE97a6YEZe
type: doc
subType: user-guide
name:
  full: "Mystical Ability"
shortcode: mystclab
folder: QtOgPodi8X6gDWL0
---

# What Is a Mystical Ability?

A Mystical Ability is a specific supernatural power — a spell, prayer, ritual, or other manifestation of mystical power that a character can invoke. Unlike a mystery, it is always something that is performed resulting in a specific effect. Each Mystical Ability defines exactly what happens when it is used: its effects, costs, range, duration, and any requirements for successful use.

Mystical Abilities fall into one of three broad supernatural categories: **Arcane**, **Divine**, or **Spirit**.

Invoking one is a **roll** — see [[#success-test|Success Test]] below. SoHL rolls it and reports how well it went; what the ability then _does_ is read off the rulebook and applied by the people at the table. An ability that carries a mastery level of its own can also be **developed**, exactly the way a [[doc-skill|Skill]] is — see [[#toggle-improve-flag|Toggle Improve Flag]] and [[#improve-with-sdr|Improve with SDR]].

# Where It Appears

Mystical Abilities appear on the Being sheet's **Mysteries** tab, in their own half below the Mysteries themselves, grouped into one **ledger per sub-type** — a Spirit Rite section, an Arcane Incantation section, and so on. Only sub-types the character actually has are shown, and each section's **＋ Add** button creates another of that sub-type.

Each sub-type shows only the columns that mean something for it, so the ledgers are not all the same width:

| Column           | What it shows                                                                                              | Shown for                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **Ability**      | The ability's name. Click it to open the ability                                                           | Every sub-type                    |
| **Skill**        | The **Associated Skill** that governs the roll, or a ✕ when none is set                                    | The skill-governed sub-types      |
| **Spirit Power** | The **Spirit Power** that governs the roll, or a ✕ when none is set                                        | Spirit Rite and Spirit Action     |
| **Affiliation**  | The Affiliation whose standing the ability draws on, or a ✕                                                | The affiliation-bearing sub-types |
| **Lvl**          | The ability's **Level**, or a ✕ when it has none                                                           | The sub-types with a power level  |
| **EML**          | The Effective Mastery Level. **This cell is the roll** — click it to run a [[#success-test\|Success Test]] | Every sub-type                    |
| **Chgs/Max**     | Charges remaining over the maximum. ✕ when the ability does not use charges, ∞ for unlimited               | Every sub-type                    |
| **Notes**        | The ability's one-line note                                                                                | Every sub-type                    |
| **☆ star**       | Flags the ability for improvement — see [[#toggle-improve-flag\|Toggle Improve Flag]]                      | Abilities with no association     |
| **⋮ menu**       | The Actions context menu — every action on this page                                                       | Every sub-type                    |

**A greyed-out row cannot be invoked.** An ability is greyed and its EML cell stops being a button when it is **out of charges**, or when it is a Spirit Rite or Spirit Action with **no valid Spirit Power** associated. The EML is still shown, so you can see what the roll _would_ be; see [[#before-you-start|Before you start]].

# Additional Properties

Along with the [[doc-baseitem|Standard Item Properties]], the following properties also appear in the **Properties** tab:

- **Mastery Level:** The ability's _own_ internal mastery level. It is used **only** when no Associated Skill (or Spirit Power) is set — see [[#how-the-effective-mastery-level-is-determined|_How the Effective Mastery Level Is Determined_]] below. On an ability that does draw on a skill, this box is ignored, and editing it changes nothing.
- **Improvement Flag:** Marks the ability as one the character is trying to improve. The same flag is the **☆ star** on the ability's row on the Mysteries tab, and what [[#improve-with-sdr|Improve with SDR]] spends. It only means something on an ability with **no Associated Skill** — one that draws its mastery level from a skill improves when that _skill_ does, so it shows no star and offers no improvement actions.
- **Associated Skill:** Which Skill governs this ability's roll (optional), chosen from the character's own skills. On a **Spirit Rite** or **Spirit Action** this same selector names a **Spirit Power** instead — one of the character's own Spirit Power abilities — and the sheet column is labelled accordingly.
- **Associated Affiliation:** Which [[doc-affltn|Affiliation]] this ability draws its standing from (optional) — the church, arcane or alchemical school, or ancestor/totem/spirit whose membership the ability belongs to. Recording it lets the ability's behaviour take the character's **rank** in that body into account (its **Level**): a full priest and a layperson of the same faith can differ in what they can invoke. This only _informs_ the ability — the player still deliberately triggers every invocation.
- **Level:** The difficulty or power tier of the ability. Leave it blank for an ability that has no level, and the sheet shows a ✕. Higher-level incantations are also harder to invoke — see [[#the-incantation-casting-penalty|_The Incantation Casting Penalty_]] below.
- **Charges:** How many times the ability can still be used, in a **Charges** box of its own:
  - **Current Charges:** Charges remaining. Leave it blank for an ability whose uses are unlimited (the sheet shows ∞).
  - **Maximum Charges:** The cap, and the control that decides whether the ability uses charges at all. Leave it blank for one that does not (the sheet shows ✕); enter `0` for one that is counted but uncapped.
  - Each completed [[#success-test|Success Test]] spends one charge.

An ability's **sub-type is fixed when it is created** — you choose it with the ＋ Add button of the section you want, and there is no control to change it afterwards. The sub-type is shown under the ability's name at the top of its sheet, and the sub-types are:

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

> **Known gap.** One defect affects this tab today:
>
> - **The Chgs/Max and Notes column headers run together** on the Mysteries tab
>   (issue #1131). The columns themselves are correct.

# How the Effective Mastery Level Is Determined {#how-the-effective-mastery-level-is-determined}

Invoking a Mystical Ability is resolved as a mastery level test. The **Effective Mastery Level (EML)** used for that test is determined by whether the ability has an **Associated Skill**:

- **If an Associated Skill is set,** the ability draws its mastery level from that skill. This is the usual case: many abilities share a single governing skill, so they improve together and inherit any modifiers applied to that skill — including Active Effects (for example, an effect representing a caster's resistance to a particular tradition applies to every ability that skill governs).
- **If no Associated Skill is set,** the ability uses its own internal mastery level instead.

Either way, the ability's own modifiers still stack on top of the mastery level it draws upon.

Two sub-types read that rule differently:

- A **Spirit Rite** or **Spirit Action** draws its mastery level from the associated **Spirit Power** rather than from a skill, and cannot be invoked at all without a valid one.
- A **Ritual Action** takes its ritual skill's mastery level only when that skill actually has one. An unlearned ritual contributes nothing, and the ability falls back on its own Mastery Level.

## The Incantation Casting Penalty {#the-incantation-casting-penalty}

**Arcane Incantations** and **Divine Incantations** become harder to invoke the more powerful they are. When one of these abilities is invoked, a penalty equal to **Level × 2** is applied to its EML — so a Level 3 incantation is invoked at EML − 6, a Level 4 at EML − 8, and so on.

Abilities with no level (and abilities at Level 0) take no penalty, and other subtypes — talents, rites, ritual actions, and the like — are not affected.

The penalty is itemized wherever the roll is broken down: hovering the EML cell shows it as **LvlPen −6**, and it gets its own row — labelled _Level Penalty_ — in the test dialog's and the test card's Adjustment table.

# The Mystical Ability Actions

| Action                                        | Shortcode           | Where you meet it                               |
| --------------------------------------------- | ------------------- | ----------------------------------------------- |
| [[#success-test\|Success Test]]               | `successTest`       | Actions context menu, or the row's **EML** cell |
| [[#toggle-improve-flag\|Toggle Improve Flag]] | `toggleImproveFlag` | Actions context menu, or the row's **☆ star**   |
| [[#improve-with-sdr\|Improve with SDR]]       | `improveWithSDR`    | Actions context menu, once flagged              |

Every Mystical Ability also carries the shared document actions — **Edit**, **Delete**, and **Output Description to Chat** — described once on [[doc-baseitem|Base Item]].

To reach any of them, click the **⋮** on the ability's row on the Mysteries tab, or open the ability and use its **Actions** tab.

**The two improvement actions appear only on an ability that has a mastery level of its own** — one with no Associated Skill (and, for a Spirit Rite or Spirit Action, no Spirit Power). On any other ability they are absent, because there is nothing of the ability's own to raise.

Besides the two hidden half-toggles described under [[#toggle-improve-flag|Toggle Improve Flag]], a Mystical Ability defines **no hidden actions of its own**. The one action you will meet elsewhere is the shared GM **result edit**, reached from the ✎ pencil on a posted test-result card and described on [[doc-baseitem|Base Item]].

**What the ability _does_ is not automated.** SoHL rolls the invocation and reports the outcome; it does not apply the spell's effect, spend its material components, or resolve what it does to a target. That deliberately stays with the people at the table — where an ability's effect should be automated, attach a Script Action to it (see [[doc-actions|Actions]]).

# Success Test {#success-test}

|               |                                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Success Test                                                                                                                                 |
| **Shortcode** | `successTest`                                                                                                                                |
| **Icon**      | `fa-bullseye` (a target)                                                                                                                     |
| **Invoked**   | The **Actions** context menu, or by clicking the ability's **EML** cell on the Mysteries tab                                                 |
| **API**       | [`MysticalAbilityLogic.successTest`](https://www.heroiclands.org/sohl/api/classes/sohl.document.item.logic.MysticalAbilityLogic#successtest) |

## What it does and when to use it

**This is the invocation.** Casting the spell, performing the rite, calling on the ancestor — whenever a character uses a Mystical Ability and the table wants to know whether it worked, this is the roll. It rolls a d100 against the ability's **Effective Mastery Level** and reports critical success, marginal success, marginal failure, or critical failure, exactly as a [[doc-skill|Skill]] test does.

Use it at the moment of invocation, not before: the EML shown on the row already includes everything the system knows about, including the [[#the-incantation-casting-penalty|casting penalty]] for a high-level incantation, so the number on the sheet is the number you are rolling under.

What happens on a success — what the spell does, to whom, for how long — comes from the ability's own description and the rules of its tradition. SoHL settles the roll and stops there.

## Before you start {#before-you-start}

- **A charge is spent by rolling.** If the ability has a **Maximum Charges**, a completed roll takes one off **Current Charges**. Cancelling the dialog spends nothing. Spending the charge needs no separate confirmation — it is the direct consequence of your own roll.
- **An exhausted ability refuses.** With no charges left, the row is greyed, the EML cell is no longer a button, and running the action any other way is refused with _"{name}" has no charges remaining._ — nothing is rolled and nothing is posted. Raise **Current Charges** on the ability's sheet to recharge it.
- **A Spirit Rite or Spirit Action needs its Spirit Power.** Without a valid one associated, the ability is likewise greyed and refuses with _"{name}" has no valid Spirit Power and cannot be invoked._ Set the **Spirit Power** selector on its Properties tab to one of the character's own Spirit Power abilities.

## What happens on screen

1. **The standard test dialog opens.** Target, the modifier breakdown, Situational Modifier, Success Level Modifier, and Roll Visibility — its fields are described once on [[doc-baseitem|Base Item]]. Cancelling it rolls nothing, posts nothing, and spends no charge. Clicking the EML cell with **Shift** held skips the dialog and rolls at once.
2. **The d100 is rolled** against the effective mastery level.
3. **A charge is spent**, if the ability uses them.
4. **A test-result card posts to chat** with the modifier breakdown, the Target, the Roll, and the outcome, colored by success or failure.

## The test-result card

| Part                     | What it shows                                                            |
| ------------------------ | ------------------------------------------------------------------------ |
| Title                    | The test's name — see the known gap below                                |
| ✎ pencil _(GM only)_     | Re-opens the dialog to correct the modifiers, without re-rolling the die |
| _The modifier breakdown_ | Every modifier that made up the target — the casting penalty among them  |
| **Target**               | The number the roll had to come in at or under                           |
| **Roll**                 | The d100 result, green on a success and red on a failure                 |
| _The footer_             | The named outcome — _Marginal Success_, _Critical Failure_, and so on    |

The GM's pencil is described on [[doc-baseitem|Base Item]], under _Editing a Posted Test Result_.

> **Known gap. No Fate can be spent on an invocation.** The card never offers the **Fate** button, even when the character holds a Fate Point (issue #1106). This bites here because an ability normally borrows its mastery level from its Associated Skill — so the same number, rolled from the Skills tab, _does_ offer Fate. Until it is fixed, spend Fate at the table by agreement, or have the GM adjust the result with the pencil.

# Toggle Improve Flag {#toggle-improve-flag}

|               |                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Toggle Improve Flag                                                                                                                                      |
| **Shortcode** | `toggleImproveFlag`                                                                                                                                      |
| **Icon**      | `fa-star-half-stroke` (a half-filled star)                                                                                                               |
| **Invoked**   | The **Actions** context menu, or the **☆ star** on the ability's Mysteries-tab row                                                                       |
| **API**       | [`MysticalAbilityLogic.toggleImproveFlag`](https://www.heroiclands.org/sohl/api/classes/sohl.document.item.logic.MysticalAbilityLogic#toggleimproveflag) |

## What it does and when to use it

Flips the ability's **Improvement Flag** — the mark that says _this ability was used meaningfully, and is a candidate for a development roll_. Flag it in the moment it matters, during play, and the flag is still there when the table gets round to improvement.

There is **no dialog, no roll, and no chat card**: the flag flips and the star on the Mysteries tab fills in (★) or empties (☆) to match. Run it again to put it back.

The star on the row is a shortcut for the identical change. It is shown only on an ability you may improve — you own the character (or you are the GM), the ability's mastery level is live, and the ability has **no Associated Skill or Spirit Power**. An ability that borrows its mastery level has nothing of its own to raise, so it shows no star and offers neither improvement action.

This is the same action, with the same behaviour, that a [[doc-skill|Skill]] carries — including the **two hidden half-toggles**, _Flag for Improvement_ (`setImproveFlag`) and _Clear Improvement Flag_ (`unsetImproveFlag`), which set and clear the flag outright rather than flipping it. Neither appears in the context menu; they are kept for scripts and macros that want a known state.

# Improve with SDR {#improve-with-sdr}

|               |                                                                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Improve with SDR                                                                                                                                   |
| **Shortcode** | `improveWithSDR`                                                                                                                                   |
| **Icon**      | `fa-arrow-trend-up` (a rising arrow)                                                                                                               |
| **Invoked**   | The **Actions** context menu                                                                                                                       |
| **API**       | [`MysticalAbilityLogic.improveWithSDR`](https://www.heroiclands.org/sohl/api/classes/sohl.document.item.logic.MysticalAbilityLogic#improvewithsdr) |

## What it does and when to use it

Makes the **development roll** — the attempt to turn practice into a higher mastery level — on an ability that carries a mastery level of its own. Run it when the table settles up: at the end of a session, after a period of study, or whenever your GM calls for development.

The roll is **1d100**, and it must come out **above** the ability's current base mastery level, so an ability already trained high is harder to push further. A Mystical Ability has no Skill Base of its own to add — the only abilities that can be improved this way are exactly those with no skill to borrow one from.

## What happens on screen

There is **no dialog** — the action rolls straight away.

1. **The roll is made** and compared to the current base mastery level.
2. **On a success, the mastery level rises by 1**, and the new value is written to the ability.
3. **The Improvement Flag is cleared**, on success or failure alike. A development attempt spends the flag either way; flag the ability again the next time it earns it.
4. **A card posts to chat** naming the ability, showing the roll and the mastery level it had to beat, and saying whether it improved.

The write lands on the ability alone. Improving one Mystical Ability never touches an Associated Skill, another ability, or anything else on the sheet.

## Before you start

- **The ability must be flagged for improvement.** The action appears in the menu only for a flagged ability — flagging is what marks it as having earned a development attempt, and the roll spends the flag. If you do not see the action, flag the ability first with [[#toggle-improve-flag|Toggle Improve Flag]] or the ☆ star on its row.
- **The ability must have a mastery level of its own** — no Associated Skill, and (on a Spirit Rite or Spirit Action) no Spirit Power. Otherwise the action is not offered: improve the governing skill or spirit power instead, and the ability improves with it.
- **You must be able to improve it** — you own the character (or are the GM) and its mastery level is not disabled.

# See also

- [[doc-baseitem|Base Item]] — the standard item properties, the shared **Edit** / **Delete** / **Output Description** actions, and the standard test dialog this page's roll opens.
- [[doc-mystery|Mysteries]] — the passive counterpart: what a character _is_ rather than something they invoke.
- [[doc-skill|Skill]] — the governing skill an ability usually draws its mastery level from, and the source of the identical improvement actions.
- [[doc-affltn|Affiliation]] — the body whose standing an ability can draw on.
- [[doc-sklltsts|Skill Tests]] — what the numbers in a test mean, and how success levels are read.
- [[doc-actions|Actions]] — how actions work, and how to attach a Script Action that automates what an ability actually does.
- [[doc-estrcint|Esoterica]] — the rules behind the mystical traditions.
- [[doc-shrtcds|Shortcodes]] — what the Associated Skill and Affiliation selectors are naming.
- [[doc-ugitems|Items]] — every item type at a glance.
- [[doc-userguide|User Guide]] — back to the index.
