---
aliases:
    - Skill
    - Combat Technique
    - Combat Techniques
id: rbl6nD2s5gxsx9gR
type: doc
package: sohl
category: user-guide
name:
    full: "Skill"
slug: "item-skill"
folder: QtOgPodi8X6gDWL0
---

# What Is a Skill?

A Skill represents a learned or practiced ability that a Being possesses. Skills cover everything from combat proficiency (Sword, Shield, Bow) to everyday talents (Riding, Climbing, Awareness) to specialized knowledge (Herblore, Law, Physician). Every meaningful action a character attempts in the game is typically resolved through a skill test.

**A combat technique is a Skill.** There is no separate Combat Technique item: a
bite, a claw rake, a grapple, or a bare-handed strike is a Skill whose **Category**
is _Combat Technique_, carrying its own single strike mode. Everything on this page
about attacking, blocking, and counterstriking is describing that category — see
[Combat Techniques](#combat-techniques).

# Where It Appears

Skills appear on the Being sheet's **Skills** tab, organized by Category (such as Combat, Physical, Communication, and so on). Skills are typically added from compendium packs during character creation.

Each skill is based on one or more attributes via a **skill base formula** — for example, a physical skill might derive its base from the average of Strength and Dexterity. This means a character's innate attributes directly influence their starting skill levels.

A **Combat Technique** skill appears in a second place as well: on the **Combat**
tab, in the Melee or Missile Strike Modes ledger, alongside any weapon the
character is holding. That is where its Atk / Blk / CX numbers are rolled from.

Each row on the Skills tab is itself a set of controls:

| Column / control | What it does                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------- |
| **SB**           | The Skill Base. A ✗ here means the skill's formula is invalid — hover it for the reason      |
| **ML**           | The mastery level                                                                            |
| **SI**           | The Skill Index — the mastery level's tens digit, used by the Success Value Test             |
| **EML**          | **Click to run a [Success Test](#success-test).** Hold **Shift** to skip the pre-roll dialog |
| **Fate**         | Click to spend a Fate Point on this skill. Hold **Shift** to skip the dialog                 |
| **☆ star**       | [Flags the skill for improvement](#toggle-improve-flag). Shown only when you may improve it  |
| **⋮ menu**       | The Actions context menu — every action on this page                                         |

Spending Fate is described on [[Fate_System|Fate]].

# Additional Properties

Along with the [[Item_Base|Standard Item Properties]], the following properties also appear in the **Properties** tab:

- **Category:** Type of this skill. One of:
    - **Social**
    - **Nature**
    - **Craft**
    - **Lore**
    - **Language**
    - **Script**
    - **Mystical**
    - **Physical**
    - **Combat**
    - **Combat Technique** — a natural or unarmed fighting maneuver; adds a
      **Strike Modes** tab (see [Combat Techniques](#combat-techniques))
- **Skill Base Formula:** Formula for calculating the skill base from referenced attributes. Written as a [[Safe_Expressions|Safe Expression]] over attribute values, such as `sb(attr.str, attr.dex)`; the **✎** button beside it opens the formula editor. A blank formula is allowed and yields a Skill Base of 0; a malformed one is flagged on the sheet and shows a ✗ in the Skills tab's SB column.
- **Mastery Level:** Base mastery level representing training and experience. Leave it **blank** to have a skill on a character open automatically at _Skill Base × Init Multiplier_; enter a number to set the level explicitly.
- **Init Multiplier:** Multiplier applied to the skill base to open the skill's mastery level for a new character. When _Mastery Level_ is blank and the skill is on a character, the opening mastery level is _Skill Base × Init Multiplier_.
- **Parent Skill:** Shortcode of the base skill if this is a specialization. Leave it as _None_ when the skill stands on its own.
- **Adopt Parent Mastery:** Shown only once a **Parent Skill** is set. When ticked, the specialization tracks its parent skill's mastery level instead of its own base, with this skill's own bonuses applied on top.
- **Improvement Flag:** Whether this item is flagged for mastery improvement via _Skill Development Roll_ (SDR). This is the same flag the ☆ star on the Skills tab toggles, and the same one [Toggle Improve Flag](#toggle-improve-flag) flips.
- **Combat Category:** Shown only when the **Category** is _Combat_. The class of attack this weapon skill governs — **None**, **All Weapon Types**, **Melee**, **Missile**, **Melee & Missile**, **Maneuver**, or **Melee & Combat Maneuver**.
- **Impaired By Roles:** A list of body roles whose injury impairs this skill —
  _vital_, _core_, _manipulator_, or _locomotor_. An unhealed injury at a body part
  carrying one of these roles penalizes this skill's tests, and an unusable part
  makes them fail automatically. Use **Add Role** to add one and the 🗑 to remove it.

<!-- TODO: Document each field on the Properties tab of this type's sheet:
     what it means, what values to enter, and how it interacts with other
     fields and items. Include annotated screenshots. -->

# Combat Techniques

A **Combat Technique** is a weaponless combat maneuver or mode — a special fighting
technique, an unarmed attack, a grappling move, or any other combat action a
character can perform without a weapon.

For creatures these are the norm rather than the exception: biting, raking with
claws, piercing with a stinger, grappling, and in some cases flinging spikes or
quills (a missile technique). Creatures almost exclusively rely on Combat
Techniques and almost never use weapons.

**A Combat Technique is a Skill, not a separate item.** Set a skill's **Category**
to _Combat Technique_ and it becomes one: it gains a **Strike Modes** tab, its
Atk / Blk / CX derive from its own mastery level, and it gains the
[Attack, Block, and Counterstrike](#attack-block-and-counterstrike) actions. This
is what keeps a character able to fight when disarmed, and it is why an unarmed
strike is trained and improved exactly like any other skill.

## The Strike Modes tab

The tab appears only for the _Combat Technique_ category, and a technique carries
**exactly one** strike mode. A newly created technique is given a melee strike
mode named after the skill, so it is usable at once; refine it from there.

The tab lists the mode with its **Shortcode**, **Type**, and **Impact** formula.
Open the **⋮** menu on the row to edit or delete it, or use **Add Strike Mode**
when the technique has none.

## The strike-mode editor

Editing the strike mode opens a small configuration window. Its **Type** (Melee or
Missile) is fixed once created — to change it, delete the mode and add a new one.

| Section     | Field                                | What it is                                                                                    |
| ----------- | ------------------------------------ | --------------------------------------------------------------------------------------------- |
| _Header_    | **Name**                             | What the mode is called — _Bite_, _Claw_, _Grapple_                                           |
| _Header_    | **Shortcode**                        | The mode's short identifier                                                                   |
| **General** | **Min Parts**                        | How many body parts the technique needs in order to be used                                   |
| **General** | **Associated Skill**                 | Optional. Leave blank to use this skill's own mastery level; set it to borrow another skill's |
| **General** | **Length** _(melee)_                 | The reach of the technique, in feet, before body reach is added                               |
| **General** | **Projectile Type** _(missile)_      | The ammunition consumed, or _none_ when the technique throws itself                           |
| **General** | **Base Range** _(missile)_           | Maximum range, in feet, for direct fire                                                       |
| **General** | **Draw** _(missile)_                 | The draw / ready time before it can be loosed                                                 |
| **General** | **Max Volley ×** _(missile)_         | The largest volley multiplier permitted when loosing rapidly                                  |
| **Attack**  | **Zone Die**                         | The die used to spread the strike across hit zones                                            |
| **Attack**  | **Modifier**                         | A flat adjustment to the technique's attack mastery level                                     |
| **Impact**  | **Num Dice**                         | How many dice of impact the technique does                                                    |
| **Impact**  | **Die**                              | The size of those dice                                                                        |
| **Impact**  | **Modifier**                         | A flat addition to the impact roll                                                            |
| **Impact**  | **Aspect**                           | The kind of harm done — _Blunt_, _Edged_, _Piercing_, _Fire_, and so on                       |
| **Defense** | **Block Modifier** _(melee)_         | A flat adjustment to the technique's block mastery level                                      |
| **Defense** | **Counterstrike Modifier** _(melee)_ | A flat adjustment to its counterstrike mastery level                                          |

A **missile** technique has no Defense section: you cannot block or counterstrike
with a thrown quill.

# The Skill Actions

| Action                                                 | Shortcode           | Where you meet it                   |
| ------------------------------------------------------ | ------------------- | ----------------------------------- |
| [Success Test](#success-test)                          | `successTest`       | Actions context menu; the EML cell  |
| [Success Value Test](#success-value-test)              | `successValueTest`  | Actions context menu                |
| [Toggle Improve Flag](#toggle-improve-flag)            | `toggleImproveFlag` | Actions context menu; the ☆ star    |
| [Improve with SDR](#improve-with-sdr)                  | `improveWithSDR`    | Actions context menu                |
| [Opposed Test](#opposed-test)                          | `opposedTestStart`  | Actions context menu                |
| [Attack](#attack-block-and-counterstrike)              | `attackTest`        | Actions context menu; the Atk cell  |
| [Block](#attack-block-and-counterstrike)               | `blockTest`         | Actions context menu; the Blk cell  |
| [Counterstrike](#attack-block-and-counterstrike)       | `counterstrikeTest` | Actions context menu; the CX cell   |
| [Flag for Improvement](#the-two-hidden-half-toggles)   | `setImproveFlag`    | _Hidden_ — superseded by the toggle |
| [Clear Improvement Flag](#the-two-hidden-half-toggles) | `unsetImproveFlag`  | _Hidden_ — superseded by the toggle |

**Attack**, **Block**, and **Counterstrike** appear **only on a Combat Technique**
skill; every other category has the rest. Every skill also carries the shared
document actions — **Edit**, **Delete**, and **Output Description to Chat** —
described once on [[Item_Base|Base Item]].

A **hidden** action is never in the Actions context menu. It is not off-limits: it
is simply reached another way — here, by a script or macro that wants to set the
flag rather than flip it.

To reach any of them, right-click the skill's row on the Skills tab, click its **⋮**
control, or open the skill and use its **Actions** tab.

# Success Test

|               |                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Success Test                                                                                                              |
| **Shortcode** | `successTest`                                                                                                             |
| **Icon**      | `fa-bullseye` (a target)                                                                                                  |
| **Invoked**   | The **Actions** context menu, or by clicking the skill's **EML** cell on the Skills tab                                   |
| **API**       | [`SkillLogic.successTest`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.SkillLogic.html#successtest) |

## What it does and when to use it

This is **the** skill roll — the one you reach for whenever a character tries
something and the table wants to know whether it worked. It rolls a d100 against
the skill's effective mastery level and reports how well it went: critical success,
marginal success, marginal failure, or critical failure.

Use it for any single attempt with a clear pass/fail shape: picking a lock, spotting
an ambush, recalling a piece of lore, keeping your feet on a wet deck. For work that
is graded rather than passed — a week at a forge, a season's research — use
[Success Value Test](#success-value-test) instead.

## What happens on screen

1. **The standard test dialog opens.** Target, the modifier breakdown, Situational
   Modifier, Success Level Modifier, and Roll Visibility — its fields are described
   once on [[Item_Base|Base Item]]. Cancelling it rolls nothing and posts nothing.
   Clicking the EML cell with **Shift** held skips the dialog and rolls at once.
2. **The d100 is rolled** against the effective mastery level.
3. **A test-result card posts to chat** showing the modifier breakdown, the Target,
   the Roll, and the outcome, colored by success or failure.

## The test-result card

| Part                     | What it shows                                                            |
| ------------------------ | ------------------------------------------------------------------------ |
| Title                    | The test's name                                                          |
| ✎ pencil _(GM only)_     | Re-opens the dialog to correct the modifiers, without re-rolling the die |
| _The modifier breakdown_ | Every modifier that made up the target                                   |
| **Target**               | The number the roll had to come in at or under                           |
| **Roll**                 | The d100 result, green on a success and red on a failure                 |
| **Result**               | The named outcome, with its description below it                         |
| **Fate** button          | Offered when the character has a Fate Point to spend                     |

The GM's pencil is described on [[Item_Base|Base Item]], under _Editing a Posted
Test Result_; spending Fate is described on [[Fate_System|Fate]].

## Two things that change the roll for you

- **Injury.** If the skill names **Impaired By Roles** and the character has an
  unhealed injury at a body part with one of those roles, the test is penalized by
  −5 or −10; if the part is unusable altogether, the test **fails critically**
  without a roll.
- **A disabled mastery level.** A skill whose mastery level has been disabled shows
  a ✗ in the Skills tab and cannot produce a meaningful result.

# Success Value Test

|               |                                                                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Success Value Test                                                                                                                  |
| **Shortcode** | `successValueTest`                                                                                                                  |
| **Icon**      | `fa-ranking-star` (a star above a podium)                                                                                           |
| **Invoked**   | The **Actions** context menu                                                                                                        |
| **API**       | [`SkillLogic.successValueTest`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.SkillLogic.html#successvaluetest) |

## What it does and when to use it

A Success Value Test answers **"how good was the work?"** rather than "did it
work?". It is the one-roll way to resolve **sustained effort** — a week of
smithing, a voyage's navigation, a season of research — instead of making the same
skill test over and over.

It rolls exactly like a [Success Test](#success-test), through the same dialog, but
grades the outcome against the skill's **Skill Index** (the SI column — the mastery
level's tens digit) instead of reporting a plain pass or fail. The better the
skill and the better the roll, the higher the value of the work produced.

## What happens on screen

The pre-roll dialog and the d100 are identical to the Success Test. The card that
posts is the same card with two extra rows:

| Row               | What it shows                                                                 |
| ----------------- | ----------------------------------------------------------------------------- |
| **Success Value** | The graded value of the work — the Skill Index shifted by how well you rolled |
| **Success Stars** | 0 to 5 stars, the quick read on quality                                       |

The **Result** row names the grade reached:

| Grade            | What it means                                       | Stars |
| ---------------- | --------------------------------------------------- | ----- |
| **No Value**     | The effort comes to nothing the character can use   | —     |
| **Little Value** | The effort yields only a poor or partial outcome    | 0     |
| **Base Value**   | A sound, workmanlike outcome                        | 0     |
| **Bonus Value**  | A superior outcome, worth one to five Success Stars | 1–5   |

What a Success Value _buys_ is a matter for the rules of the work being done — how
many arrows the fletcher finished, how much ground the tracker covered, how good the
blade turned out.

# Toggle Improve Flag

|               |                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Toggle Improve Flag                                                                                                                   |
| **Shortcode** | `toggleImproveFlag`                                                                                                                   |
| **Icon**      | `fa-star-half-stroke` (a half-filled star)                                                                                            |
| **Invoked**   | The **Actions** context menu, or the **☆ star** on the skill's Skills-tab row                                                         |
| **API**       | [`SkillLogic.toggleImproveFlag`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.SkillLogic.html#toggleimproveflag) |

## What it does and when to use it

Flips the skill's **Improvement Flag** — the mark that says _this skill was used
meaningfully, and is a candidate for a Skill Development Roll_. Flag a skill in the
moment it matters, during play, and the flag is still there when the table gets
round to improvement.

There is **no dialog, no roll, and no chat card**: the flag flips and the star on the
Skills tab fills in (★) or empties (☆) to match. Run it again to put it back.

The star on the row is a shortcut for the identical change — it is shown only on
skills you may improve, which means you own the character (or you are the GM) and
the skill's mastery level is not disabled. Reached from the context menu on a skill
you cannot improve, the action quietly does nothing.

## The two hidden half-toggles

Two further actions exist — **Flag for Improvement** (`setImproveFlag`) and **Clear
Improvement Flag** (`unsetImproveFlag`) — which set and clear the flag outright
rather than flipping it.

**They are hidden: neither appears in the Actions context menu.** They are the two
halves the toggle is built from, kept for scripts and macros that want to set the
flag to a known state rather than invert whatever it currently is. Anything you can
do with them, you can do with the toggle.

# Improve with SDR

|               |                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Improve with SDR                                                                                                                |
| **Shortcode** | `improveWithSDR`                                                                                                                |
| **Icon**      | `fa-star` (a filled star)                                                                                                       |
| **Invoked**   | The **Actions** context menu                                                                                                    |
| **API**       | [`SkillLogic.improveWithSDR`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.SkillLogic.html#improvewithsdr) |

## What it does and when to use it

Makes the **Skill Development Roll** — the attempt to turn practice into a higher
mastery level. Run it when the table settles up: at the end of a session, after a
period of training, or whenever your GM calls for development.

The roll is **1d100 + the skill's Skill Base**, and it must come out **above** the
skill's current base mastery level. So a character with good natural aptitude (a
high Skill Base) improves more easily, and a skill already trained high is harder to
push further — improvement slows as mastery grows.

## What happens on screen

There is **no dialog** — the action rolls straight away.

1. **The roll is made** and compared to the current base mastery level.
2. **On a success, the mastery level rises by 1**, and the new value is written to
   the skill.
3. **The Improvement Flag is cleared**, on success or failure alike. A development
   attempt spends the flag either way; flag the skill again the next time it earns it.
4. **A card posts to chat** naming the skill and saying whether it improved.

## Before you start

- **You must be able to improve the skill** — you own the character (or are the GM)
  and its mastery level is not disabled.

> **Known gaps.** Two defects affect this action today:
>
> - **It is offered only while the skill is _not_ flagged** for improvement, and
>   disappears from the menu once you flag it — the reverse of the intended
>   workflow (issue #1102). Until that is fixed, clear the flag if you need to reach
>   the action, or run the roll by hand.
> - **The card's Target and Roll rows come out blank** (issue #1103). The result
>   text is correct — the skill really did improve or fail to — but the numbers
>   behind it are not shown.

# Opposed Test

|               |                                                                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Opposed Test                                                                                                                        |
| **Shortcode** | `opposedTestStart`                                                                                                                  |
| **Icon**      | `fa-arrows-to-dot` (two arrows converging)                                                                                          |
| **Invoked**   | The **Actions** context menu                                                                                                        |
| **API**       | [`SkillLogic.opposedTestStart`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.SkillLogic.html#opposedteststart) |

## What it does and when to use it

Starts a **contest** with this skill: your character acts against another character
who gets to resist. Sneaking past a guard, talking a merchant down, arm-wrestling,
tracking someone who covered their trail — anything where the other side's ability
is what stands in your way.

Both sides roll, the system compares the two results, and reports who won and by how
many degrees, rather than leaving the table to eyeball two separate rolls.

## Before you start

- **Your character needs a token on the current scene.** Without one the action
  refuses, reporting that the skill "cannot start an opposed test: its actor has no
  token on the canvas."
- **Target exactly one opponent** with Foundry _targeting_ (the crosshair), not
  selection. With nothing targeted you are told "No tokens targeted."; with more
  than one, you are warned and the first is used.
- **You must own the targeted token.** If you do not, the contest refuses to start.
  In practice the GM starts contests against NPCs — see [[Token]] for what this
  means at the table.

## What happens on screen

The skill hands the contest to your character's token, which runs it from there.
The standard test dialog opens for your roll, your result posts, and an **Opposed
Action Request** card invites the other side to answer with a skill or attribute of
their own.

The whole flow — the targeting rules, both cards, the responder's dialog, and how
Victory Stars are read — is described once on [[Token]], under _Starting an
Opposed Test_. For the rules behind a contest, see the
[[rules/sohl-opposed-tests|Opposed Tests]] rules.

**Nobody rolls for anybody.** The request card sits in the chat log until a user who
owns the target answers it, and it can be ignored entirely if the table would rather
rule the outcome by hand.

# Attack, Block, and Counterstrike

These three actions belong to a **Combat Technique** skill only. On any other skill
category they are not present at all.

|               | Attack                                                                                                                  | Block                                                                                                                 | Counterstrike                                                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Shortcode** | `attackTest`                                                                                                            | `blockTest`                                                                                                           | `counterstrikeTest`                                                                                                                   |
| **Icon**      | `ginf-broadsword` (a broadsword)                                                                                        | `fa-shield` (a shield)                                                                                                | `fa-circle-half-stroke` (a half-filled circle)                                                                                        |
| **Invoked**   | Actions menu; the **Atk** cell                                                                                          | Actions menu; the **Blk** cell                                                                                        | Actions menu; the **CX** cell                                                                                                         |
| **API**       | [`SkillLogic.attackTest`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.SkillLogic.html#attacktest) | [`SkillLogic.blockTest`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.SkillLogic.html#blocktest) | [`SkillLogic.counterstrikeTest`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.SkillLogic.html#counterstriketest) |

## What they do

Each rolls a d100 against the technique's mastery level for that use of it:

- **Attack** — striking with the technique. Bite, claw, punch, grapple, or loose a
  quill.
- **Block** — turning an incoming blow aside with it.
- **Counterstrike** — defending and hitting back in the same motion.

They are the same three tests a weapon offers, on the same rows of the Combat tab —
a combat technique is simply a weapon the character cannot drop.

## How they run

A technique carries exactly one strike mode, so **you are never asked which mode you
meant**: the strike-mode picker that a multi-mode weapon shows never appears here.
The technique's mode is used, the standard test dialog opens, and a test-result card
posts — the same card described under [Success Test](#success-test). Both dialogs are
described once on [[Item_Base|Base Item]].

Clicking the **Atk**, **Blk**, or **CX** cell on the Combat tab is the direct route,
and holding **Shift** while you click skips the pre-roll dialog.

## Where they are unavailable

- **Block and Counterstrike need a melee mode.** A missile technique — a flung
  quill, a spat venom — has no defense to roll, so those two actions are not
  offered on it. The Combat tab's Missile ledger has no Blk or CX columns at all.
- **A mode can be switched off individually.** A melee technique whose attack,
  block, or counterstrike has been disabled shows a ✗ in that column instead of a
  rollable value.

**Assisted, not automated.** These actions roll the test and report it; they do not
move a combatant, spend an initiative, or apply an injury to anyone. For the
full combat sequence — declaring an exchange, resolving a strike against a defender,
and turning impact into a wound — see [[Combat_Basics]] and [[Combatant]].

# See also

- [[Item_Base|Base Item]] — the standard item properties, the shared **Edit** /
  **Delete** / **Output Description** actions, and the standard test dialog every
  roll on this page opens.
- [[Skill_Tests]] — what the numbers in a skill test mean, and how success levels
  are read.
- [[Fate_System|Fate]] — spending a Fate Point to improve a settled result.
- [[Safe_Expressions]] — how to write a Skill Base formula.
- [[Token]] — the opposed-test flow this page's **Opposed Test** action hands off to.
- [[Combat_Basics]] and [[Combatant]] — where a combat technique's attack, block,
  and counterstrike sit in a fight.
- [[Item_Weapongear|Weapon Gear]] — the weapon counterpart, with the same three
  combat actions across several strike modes.
- [[Shortcodes]] — what **Parent Skill** and **Associated Skill** are naming.
