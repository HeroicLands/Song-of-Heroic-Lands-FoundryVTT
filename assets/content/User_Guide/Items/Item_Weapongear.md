---
aliases:
    - Weapon
    - doc-weapon
id: kSuLAvR1c8R8tIW6
type: doc
package: sohl
category: user-guide
name:
    full: "Weapon"
shortcode: weapon
folder: QtOgPodi8X6gDWL0
---

# What Is a Weapon?

Weapon represents an offensive device carried by a Being — a sword, axe, bow, dagger, staff, or any other instrument of combat. These are separated from natural weapons such as claws and teeth, which are [[doc-unrmdcmb#combat-techniques|Combat Techniques]].

The weapon item is the physical object: its weight, value, quality, durability, and how awkward it is to carry. **What the weapon can actually _do_ lives in its strike modes** — the distinct ways it can be used in a fight. A staff might have a _swing_ and a _thrust_; a spear might thrust in the hand and be thrown; a bow has a single missile mode. A strike mode is not a separate item: the modes belong to the weapon and are edited on its own [[#the-strike-modes-tab|Strike Modes tab]].

# Where It Appears

Every weapon appears on the Being sheet's **Gear** tab, like any other piece of gear.

A weapon appears on the **Combat** tab only while the character is **holding** it — gripping it with a limb (see [[#holding-a-weapon|Holding a Weapon]]). Held weapons are listed there by name, with a row per strike mode, alongside any combat technique the character has. That is where a weapon's attacks and defenses are rolled from.

Weapon items are typically added from compendium packs.

# Additional Properties

Along with the [[doc-itemgear|Standard Gear Properties]] (Quantity, Weight, Value, Quality, Durability, and Is Carried), a weapon's **Properties** tab adds:

- **Encumbrance:** If specified, this overrides the encumbrance based on weight while the weapon is carried — a weapon that is more awkward than its raw weight suggests.
- **Heft:** How unwieldy the weapon is in the hand. It is shown as the **HFT** column on the Combat tab's melee ledger.

The weapon's strike modes are not on this tab; they have their own, described next.

# The Strike Modes Tab {#the-strike-modes-tab}

A weapon's **Strike Modes** tab lists every way the weapon can be used. Unlike a combat technique — which has exactly one mode — **a weapon may have as many as it needs**, melee and missile together.

Each row shows:

| Column          | What it shows                                                           |
| --------------- | ----------------------------------------------------------------------- |
| **Strike Mode** | The mode's name — _Swing_, _Thrust_, _Throw_                            |
| **Shortcode**   | Its short identifier, unique within the weapon                          |
| **Type**        | _Melee_ or _Missile_                                                    |
| **Impact**      | The damage formula, such as `d6+2e` (the trailing letter is the aspect) |
| **⋮ menu**      | Edit or delete the mode                                                 |

**Add Strike Mode** (the **+** control above the list) appends a new mode and opens its editor. A weapon with no modes says so, and cannot attack with anything.

## The strike-mode editor

Editing a mode opens the same configuration window a combat technique uses; its fields are described once on [[doc-skill|Skill]], under _The strike-mode editor_. A mode's **Type** (Melee or Missile) is fixed once created — to change it, delete the mode and add a new one.

Three of those fields matter differently on a weapon than on a technique:

- **Associated Skill** — on a weapon this is what supplies the mastery level. A weapon has **no mastery level of its own**, so unlike a combat technique there is no fall-back: if this does not name a skill the character actually has, the mode contributes only its own flat Attack / Block / Counterstrike modifiers and the character swings at little more than nothing. Set it to the weapon skill that governs the mode (see [[doc-shrtcds|Shortcodes]]).
- **Min Parts** — how many limbs must grip the weapon for this mode to be usable. A hand-and-a-half sword's two-handed mode, or a longbow that needs both hands to draw, sets this to 2, and the mode is simply absent from the Combat tab until enough limbs hold the weapon.
- **Length** _(melee)_ — the weapon's reach in feet before the wielder's own body reach is added; the sum is the **RCH** column on the Combat tab.

# Holding a Weapon {#holding-a-weapon}

**A weapon does nothing until the character is holding it.** Carrying a sword in a pack is not the same as having it in hand, and SoHL tracks the difference: the weapon's combat actions appear only while a limb grips it.

To pick a weapon up, open the Being sheet's **Combat** tab and find the **Held Items** list, below the strike-mode ledgers. It has one row per limb that can hold something, with a dropdown listing the character's holdable gear. Choose the weapon in a limb's dropdown and it is now held; choose the blank entry to let go.

- **A two-handed grip is two selections.** Select the same weapon in _both_ limbs' dropdowns. That is also how a mode with **Min Parts** 2 becomes usable.
- **Holding is not carrying.** Both must be true for a weapon to be usable: the gear must be **carried** (see _Carried Gear Only_ on [[doc-itemgear|Gear]]) and it must be **held**. Setting a weapon down with **Toggle Carried** takes its actions away even if a limb still names it.
- **An injured hand costs you.** If a limb holding the weapon is impaired by an unhealed injury, the mode's attack and defense tests are penalized; if a holding limb is unusable altogether, the test **fails critically** without a roll.

# The Weapon Actions

| Action                                             | Shortcode           | Where you meet it                                     |
| -------------------------------------------------- | ------------------- | ----------------------------------------------------- |
| [[#attack-block-and-counterstrike\|Attack]]        | `attackTest`        | The Combat tab's **Atk** cell; the item's Actions tab |
| [[#attack-block-and-counterstrike\|Block]]         | `blockTest`         | The Combat tab's **Blk** cell; the item's Actions tab |
| [[#attack-block-and-counterstrike\|Counterstrike]] | `counterstrikeTest` | The Combat tab's **CX** cell; the item's Actions tab  |
| Toggle Carried                                     | `toggleCarried`     | The Actions context menu; the row's sack button       |

**Toggle Carried** belongs to every piece of gear and is described once on [[doc-itemgear|Gear]] — it behaves no differently on a weapon. **Edit**, **Delete**, and **Output Description to Chat** belong to every item and are described once on [[doc-baseitem|Base Item]].

A weapon has **no hidden actions**: everything it can do is on the list above.

## Where the three combat actions are offered

All three are gated on the weapon being **held** (and carried), so an unheld weapon offers none of them. When it is held, they are reachable:

- **From the Combat tab** — click the strike mode's **Atk**, **Blk**, or **CX** cell. This is the direct route, and the only one that already knows which strike mode you meant. Hold **Shift** while clicking to skip the pre-roll dialog.
- **From the weapon's own Actions tab** — open the weapon and use the **▶** button beside _Attack_, _Block_, or _Counterstrike_.

> **Known gap.** The three actions are **missing from the Gear tab's ⋮ context menu**, even on a weapon that is held and carried (issue #1132). That menu currently offers only _Edit_, _Toggle Carried_, _Delete_, and _Output Description to Chat_. Use the Combat tab or the weapon's Actions tab until it is fixed; both run the identical action.

# Attack, Block, and Counterstrike {#attack-block-and-counterstrike}

|               | Attack                                                                                                                              | Block                                                                                                                             | Counterstrike                                                                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Shortcode** | `attackTest`                                                                                                                        | `blockTest`                                                                                                                       | `counterstrikeTest`                                                                                                                               |
| **Icon**      | `ginf-broadsword` (a broadsword)                                                                                                    | `fa-shield` (a shield)                                                                                                            | `fa-circle-half-stroke` (a half-filled circle)                                                                                                    |
| **Invoked**   | The **Atk** cell; the Actions tab                                                                                                   | The **Blk** cell; the Actions tab                                                                                                 | The **CX** cell; the Actions tab                                                                                                                  |
| **API**       | [`WeaponGearLogic.attackTest`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.WeaponGearLogic-1.html#attacktest) | [`WeaponGearLogic.blockTest`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.WeaponGearLogic-1.html#blocktest) | [`WeaponGearLogic.counterstrikeTest`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.WeaponGearLogic-1.html#counterstriketest) |

## What they do and when to use them

Each rolls a d100 against the strike mode's mastery level for that use of the weapon:

- **Attack** — striking with the weapon. Swing the axe, thrust the spear, loose the arrow.
- **Block** — turning an incoming blow aside with it.
- **Counterstrike** — defending and hitting back in the same motion.

Reach for them whenever the table needs to know whether a blow landed or was turned. They are the same three tests a [[doc-unrmdcmb#combat-techniques|Combat Technique]] offers, on the same rows of the Combat tab — a weapon is simply a technique the character can drop.

## What the roll is made against

The number in the **Atk**, **Blk**, or **CX** cell is the target, built from:

1. **The Associated Skill's mastery level** — the base. A character with Melee 50 swings every melee weapon at 50 before anything else applies.
2. **The strike mode's own modifier** — the flat Attack, Block, or Counterstrike adjustment set in the strike-mode editor. A mode with an Attack Modifier of +5 makes the target 55, and the pre-roll dialog itemizes it as _Attack Modifier +5_.
3. **Anything else in play** — impairment from an injured holding limb, effects, and the modifiers the dialog lets you add.

Hover any of those cells to see the breakdown without rolling.

## What happens on screen

1. **The strike-mode picker opens** — but only when SoHL cannot tell which mode you meant: two or more modes on the weapon, and the action reached from the Actions tab rather than a Combat-tab cell. A single-mode weapon never asks, and clicking a Combat-tab cell has already said which mode you meant. The dialog is described once on [[doc-baseitem|Base Item]], under _The Strike-Mode Picker_.
2. **The standard test dialog opens** — Target, the modifier breakdown, Situational Modifier, Success Level Modifier, and Roll Visibility, described once on [[doc-baseitem|Base Item]]. Cancelling it rolls nothing and posts nothing. Shift-clicking the cell skips this step.
3. **The d100 is rolled** against the target.
4. **A test-result card posts to chat.**

## The test-result card

| Part                 | What it shows                                                            |
| -------------------- | ------------------------------------------------------------------------ |
| Title                | The test's name                                                          |
| ✎ pencil _(GM only)_ | Re-opens the dialog to correct the modifiers, without re-rolling the die |
| **Target**           | The number the roll had to come in at or under                           |
| **Roll**             | The d100 result, green on a success and red on a failure                 |
| _Footer_             | The named outcome — Critical Success, Marginal Success, and so on        |

The GM's pencil is described on [[doc-baseitem|Base Item]], under _Editing a Posted Test Result_.

> **Known gap. Fate cannot be spent on a weapon's combat tests** — the card never offers the **Fate** button, even to a character holding a charged Fate Point, and even though the very skill the weapon rolls through _does_ offer it on its own tests (issue #1106). Spending Fate is described on [[doc-thftsyst|Fate]].

## Where they are unavailable

- **The weapon must be held and carried.** Neither the Combat-tab row nor the actions exist otherwise — see [[#holding-a-weapon|Holding a Weapon]].
- **A mode needs enough hands.** A mode whose **Min Parts** exceeds the number of limbs gripping the weapon is not listed on the Combat tab at all.
- **Block and Counterstrike need a melee mode.** You cannot parry with a loosed arrow, so the Combat tab's Missile ledger has no Blk or CX columns, and a weapon whose _only_ strike mode is a missile mode — a plain bow or sling — does not offer the two actions at all. A weapon with both a melee and a missile mode keeps them and blocks with its melee mode. If a block or counterstrike still reaches a missile mode some other way (a macro, say), SoHL says so on screen rather than doing nothing.

**Assisted, not automated.** These actions roll the test and report it. They do not move a combatant, spend an initiative, choose a target, or apply an injury to anyone. For the full combat sequence — declaring an exchange, resolving a strike against a defender, and turning impact into a wound — see [[doc-cmbtbscs|Combat Basics]] and [[doc-cmbtnt|Combatant]].

# See also

- [[doc-itemgear|Gear]] — the standard gear properties, **Toggle Carried**, and the rule that uncarried gear can do nothing.
- [[doc-baseitem|Base Item]] — the standard item properties, the shared **Edit** / **Delete** / **Output Description** actions, the standard test dialog, and the strike-mode picker.
- [[doc-skill|Skill]] — weapon skills (what a strike mode's **Associated Skill** names), combat techniques, and the strike-mode editor's field-by-field reference.
- [[doc-sklltsts|Skill Tests]] — what the numbers in a test mean, and how success levels are read.
- [[doc-cmbtbscs|Combat Basics]] and [[doc-cmbtnt|Combatant]] — where a weapon's attack, block, and counterstrike sit in a fight.
- [[doc-shrtcds|Shortcodes]] — what the **Associated Skill** field is naming.
- [[doc-ugitems|Items]] — every item type at a glance.
- [[doc-userguide|User Guide]] — back to the index.
