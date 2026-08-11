---
aliases:
    - Attribute
id: tFoBD6DazC0n9cxw
type: doc
package: sohl
category: user-guide
name:
    full: "Attribute"
slug: "item-attribute"
shortcode: attrbt
folder: QtOgPodi8X6gDWL0
---

# What Is an Attribute?

An attribute represents a fundamental intrinsic characteristic of a Being, something about what they are. Attributes cover a wide range: physical like Strength or Dexterity, psyche like Reasoning or Eloquence, and transcendent qualities such as Aura. These serve as the foundation for skill calculations throughout the system.

An attribute is also **rollable in its own right**. Every attribute has a Target
Level — its score × 5 — and can be tested against it exactly the way a skill is
tested against its mastery level. That is what the two actions on this page do.

# Where It Appears

Attributes appear on the Being sheet's **Profile** tab, as a grid of small cards —
one per attribute, sorted the way they are ordered on the sheet.

| Part of the card | What it shows                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| **Name**         | The attribute's name — _Strength_, _Aura_, _Will_                                                 |
| **⋮ menu**       | The Actions context menu — every action on this page                                              |
| **Score**        | The effective score. Hover it to see how it was derived, modifier by modifier                     |
| _Descriptor_     | The word for that score — _Feeble_, _Average_, _Mighty_ — from the attribute's Value Descriptors  |
| **TL**           | The Target Level: the score × 5. This is the number a [[#success-test\|Success Test]] rolls under |

**There is no click-to-roll cell.** Unlike a skill's EML cell on the Skills tab,
neither the Score nor the TL is a button — an attribute is rolled from its **⋮**
menu (or from the attribute's own **Actions** tab), and there is no Shift-click
shortcut past the pre-roll dialog.

Attributes are displayed prominently since they form the basis of skill base
formulas — every skill derives its starting value from one or more attributes,
named in the skill's [[doc/sfexprss|Skill Base formula]] by shortcode.

Attributes are typically added from compendium packs when creating a character,
not created from scratch. **Add Attribute** above the grid creates a blank one.

An attribute turns up in one more place: when someone answers an
[[#opposed-test|opposed test]], the **Respond with** dropdown lists the
character's attributes alongside their skills.

# Additional Properties

Along with the [[doc/baseitem|Standard Item Properties]], the following properties also appear in the **Properties** tab:

- **Score:** The attribute's base value — the number the Profile card shows, and
  the number the Target Level is five times. This is the **first** of the two
  boxes on the tab.
- **Init Dice Formula:** The dice formula a new character's score for this
  attribute is meant to be rolled from, such as `3d6`. It is a record of the
  generation rule, not a control: **nothing rolls it for you today** — you enter
  the score yourself (issue #1108). Leave it blank for an attribute that is not
  randomly generated. This is the **second** box on the tab.
- **Value Descriptors:** A table of names for score bands — the word shown under
  the score on the Profile card. Each row is a **Label** and a **Max Value**, and
  the label used is the first band whose Max Value is at or above the score, so a
  list of _Feeble 4 / Weak 8 / Average 12 / Forceful 16 / Mighty 999_ calls a
  score of 10 _Average_. Use **Add** to add a band and the 🗑 to remove one. An
  attribute with no bands simply shows no descriptor.
- **Impaired By Roles:** A list of body roles whose injury impairs this attribute —
  _vital_, _core_, _manipulator_, or _locomotor_. An unhealed injury at a body part
  carrying one of these roles penalizes this attribute's tests, and an unusable part
  makes them fail automatically. Use **Add Role** to add one and the 🗑 to remove it.
  Physical attributes name the roles they depend on; mental attributes normally
  leave this empty.

> **Known gap.** The **Score** and **Init Dice Formula** boxes currently render
> with **no labels at all** — two bare inputs, in that order (issue #1105). Until
> that is fixed, go by position: the left box is the Score, the right one the
> Init Dice Formula.

# The Attribute Actions

| Action                          | Shortcode          | Where you meet it    |
| ------------------------------- | ------------------ | -------------------- |
| [[#success-test\|Success Test]] | `successTest`      | Actions context menu |
| [[#opposed-test\|Opposed Test]] | `opposedTestStart` | Actions context menu |

Every attribute also carries the shared document actions — **Edit**, **Delete**,
and **Output Description to Chat** — described once on [[Base Item]].
The full menu on an attribute is therefore: _Edit_, _Success Test_, _Delete_,
_Output Description to Chat_, _Opposed Test_.

To reach any of them, click the **⋮** on the attribute's card on the Profile tab,
or open the attribute and use its **Actions** tab.

An attribute defines **no hidden actions of its own** — everything it can do is in
that menu. The one action you will meet elsewhere is the shared GM **result edit**,
reached from the ✎ pencil on a posted test-result card and described on
[[Base Item]].

# Success Test {#success-test}

|               |                                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Success Test                                                                                                                      |
| **Shortcode** | `successTest`                                                                                                                     |
| **Icon**      | `fa-bullseye` (a target)                                                                                                          |
| **Invoked**   | The **Actions** context menu — the **⋮** on the attribute's Profile card, or the attribute's own Actions tab                      |
| **API**       | [`AttributeLogic.successTest`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.AttributeLogic.html#successtest) |

## What it does and when to use it

Rolls the attribute itself — a raw test of what the character _is_ rather than
what they have learned. It rolls a d100 against the attribute's **Target Level**
(its effective score × 5) and reports critical success, marginal success,
marginal failure, or critical failure, exactly as a skill test does.

Reach for it when no skill really covers the attempt and the question is about the
character's own substance: shoving a stuck door with **Strength**, holding your
nerve with **Will**, noticing something is off with **Perception**, sensing the
uncanny with **Aura**. If a skill _does_ cover the attempt, roll the skill — its
mastery level reflects training the bare attribute does not.

**Score × 5 is the whole of the target.** An attribute of 10 tests at 50, one of
16 at 80. That is the same TL shown on the Profile card, so you always know what
you are rolling under before you start.

## What happens on screen

1. **The standard test dialog opens.** Target, the modifier breakdown, Situational
   Modifier, Success Level Modifier, and Roll Visibility — its fields are described
   once on [[Base Item]]. Cancelling it rolls nothing and posts nothing.
2. **The d100 is rolled** against the attribute's Target Level.
3. **A test-result card posts to chat** with the modifier breakdown, the Target,
   the Roll, and the outcome, colored by success or failure.

## The test-result card

| Part                     | What it shows                                                            |
| ------------------------ | ------------------------------------------------------------------------ |
| Title                    | The test's name — see the known gap below                                |
| ✎ pencil _(GM only)_     | Re-opens the dialog to correct the modifiers, without re-rolling the die |
| _The modifier breakdown_ | Every modifier that made up the target                                   |
| **Target**               | The number the roll had to come in at or under                           |
| **Roll**                 | The d100 result, green on a success and red on a failure                 |
| **Result**               | The named outcome, with its description below it                         |

The GM's pencil is described on [[Base Item]], under _Editing a Posted
Test Result_.

## Injury changes the roll for you

If the attribute names **Impaired By Roles** and the character has an unhealed
injury at a body part carrying one of those roles, the test is penalized by −5 or
−10; if the part is unusable altogether, the test **fails critically** without a
roll. A Strength test made on a crushed arm is not a normal Strength test.

> **Known gap. No Fate can be spent on an attribute test.** The card never offers the
> **Fate** button, even when the character holds a general Fate Point, although
> the [[doc/ftdvn|Fate rules]] allow one on any skill _or attribute_ test
> (issue #1106). Until it is fixed, spend Fate at the table by agreement, or
> have the GM adjust the result with the pencil.

# Opposed Test {#opposed-test}

|               |                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Opposed Test                                                                                                                                |
| **Shortcode** | `opposedTestStart`                                                                                                                          |
| **Icon**      | `fa-arrows-to-dot` (arrows converging on a point)                                                                                           |
| **Invoked**   | The **Actions** context menu                                                                                                                |
| **API**       | [`AttributeLogic.opposedTestStart`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.AttributeLogic.html#opposedteststart) |

## What it does and when to use it

Starts a **contest** using this attribute: your character pits it against another
character who gets to resist. Shoving someone out of a doorway (Strength against
Strength), staring down a hostile guard (Will), matching wits, out-charming a
rival — anything where the other side's own quality is what stands in your way.

Both sides roll, the system compares the two results, and reports who won and by
how many degrees, instead of leaving the table to eyeball two separate rolls. The
responder does not have to answer with an attribute: they choose any skill or
attribute of their own that fits.

## Before you start

- **Your character needs a token on the current scene.** Without one the action
  refuses, reporting that the attribute _"cannot start an opposed test: its actor
  has no token on the canvas."_
- **Target exactly one opponent** with Foundry _targeting_ (the crosshair), not
  selection. With nothing targeted you are told "No tokens targeted."; with more
  than one, you are warned and the first is used.
- **You must own the targeted token.** If you do not, the contest refuses to start.
  In practice the GM starts contests against NPCs — see [[Token]] for what this
  means at the table.

## What happens on screen

The attribute hands the contest to your character's token, which runs it from
there. The standard test dialog opens for your roll, your result posts, and an
**Opposed Action Request** card invites the other side to answer with a skill or
attribute of their own.

The whole flow — the targeting rules, both cards, the responder's dialog, and how
Victory Stars are read — is described once on [[Token]], under _Starting an
Opposed Test_. For the rules behind a contest, see the
[[doc/oppsdtst|Opposed Tests]] rules.

**Nobody rolls for anybody.** The request card sits in the chat log until a user
who owns the target answers it, and it can be ignored entirely if the table would
rather rule the outcome by hand.

# See also

- [[Base Item]] — the standard item properties, the shared **Edit** /
  **Delete** / **Output Description** actions, and the standard test dialog both
  rolls on this page open.
- [[doc/skill|Skill]] — the learned counterpart, whose Skill Base formulas are
  built from these attributes.
- [[Skill Tests]] — what the numbers in a test mean, and how success levels are read.
- [[Token]] — the opposed-test flow this page's **Opposed Test** action hands off to.
- [[doc/oppsdtst|Opposed Tests]] (rules) — Victory Stars and ties.
- [[doc/thftsyst|Fate]] — spending a Fate Point on a settled result.
- [[Safe Expressions]] — how an attribute is referenced from a Skill Base formula.
- [[Shortcodes]] — what a Skill Base formula is naming when it says `attr.str`.
- [[Character Creation]] — where a character's attribute scores come from.
