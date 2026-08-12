---
aliases: []
tags: []
name:
    full: Fletching
    aliases: []
description: "Crafting bows, crossbows, arrows; producing reliable or masterwork projectile weapons."
id: MMWQAgkjekFMjaqw
img: icons/game-icons/lorc/broadhead-arrow.svg
shortcode: fltch
type: skill
package: sohl
sohl:
    kbcat: craft
    archetype: 0
    subType: craft
    skillBaseFormula: "sb(attr.dex, attr.per)"
    combatCategory: none
    parentSkillCode: ""
    initSkillMult: 0
    masteryLevelBase: null
    improveFlag: false
    impairedByRoles:
        - core
        - vital
        - manipulator
folder: gqRvjlrWbuCwGy3N
---

Strictly, a fletcher makes arrows and a bowyer makes bows, but the guilds long ago stopped observing the distinction and the first word has swallowed the second. Fletching covers bows, crossbows, arrows and quarrels from stave and billet through to a finished, tillered, nocked weapon.

# Crafting {#crafting}

Bows, crossbows and projectiles are made by the common
[[doc/crafting|crafting routine]] — workshop, expense, test, result, masterwork
rolls, repair. A fletcher works in a fletching workshop. What follows is what is
particular to this bench.

**Expense.** Materials are paid in pence and the work in hours or months.

| Item                 | Cost | Time | Success Value test                   |
| -------------------- | ---- | ---- | ------------------------------------ |
| Composite bow, 2 lb  | 24d  | 10m  | Fletching (Woodworking, Hideworking) |
| Composite bow, 3 lb  | 30d  | 11m  | Fletching (Woodworking, Hideworking) |
| Composite bow, 4 lb  | 36d  | 12m  | Fletching (Woodworking, Hideworking) |
| Longbow, 2 lb        | 20d  | 30h  | Fletching (Woodworking, Timbercraft) |
| Longbow, 3 lb        | 24d  | 50h  | Fletching (Woodworking, Timbercraft) |
| Longbow, 4 lb        | 28d  | 90h  | Fletching (Woodworking, Timbercraft) |
| Crossbow, composite  | 36d  | 280h | Fletching (Woodworking, Timbercraft) |
| Crossbow, steel prod | 54d  | 500h | Fletching (Metalcraft)               |
| Crossbow, wood, 5 lb | 12d  | 90h  | Fletching (Woodworking, Timbercraft) |
| Crossbow, wood, 6 lb | 15d  | 130h | Fletching (Woodworking, Timbercraft) |
| Crossbow, wood, 7 lb | 18d  | 170h | Fletching (Woodworking, Timbercraft) |

**Projectiles** are made a dozen at a time, and the cost and time below are for
that dozen rather than for one shaft. Head type is chosen at the bench and does
not change the reckoning; weight does. Every projectile here is a Fletching
(Woodworking, Metalcraft) test.

| Projectile         | Cost | Time | Projectile        | Cost | Time |
| ------------------ | ---- | ---- | ----------------- | ---- | ---- |
| Heavy Bodkin Arrow | 3d   | 25h  | Heavy Bodkin Bolt | 3d   | 25h  |
| Heavy Broad Arrow  | 3d   | 25h  | Heavy Broad Bolt  | 3d   | 25h  |
| Heavy Blunt Arrow  | 3d   | 25h  | Heavy Blunt Bolt  | 3d   | 25h  |
| Light Bodkin Arrow | 2d   | 20h  | Light Bodkin Bolt | 3d   | 20h  |
| Light Broad Arrow  | 2d   | 20h  | Light Broad Bolt  | 3d   | 20h  |
| Light Blunt Arrow  | 2d   | 20h  | Light Blunt Bolt  | 3d   | 20h  |
| Standard Arrow     | 2d   | 20h  | Standard Bolt     | 3d   | 20h  |

Composite bows are sinew-backed, which is why they call for Hideworking; the months they take to cure are why bowyers outside the dry horse countries rarely attempt them.

**What the modifier does.** On a **projectile**, each point of modifier adds one to impact; a flawed projectile loses the same d2 from both its quality and its impact. On a **weapon**, each point of modifier adds 30 feet of base range; a flawed weapon loses d2 quality and that same d2 × 30 feet of range. An SV of 0 or less doubles what a flaw takes away.

**Applicable successes** are capped at the item's base Weapon Quality minus
eight — a WQ 10 bow takes at most two. Projectiles have no Weapon Quality;
assume two.

**Arrowheads** may be bought in rather than forged. If they are, the Metalcraft Secondary Modifier derives from the smith's Mastery Level rather than the fletcher's — cost doubles, crafting time halves.

**Bullets and slings** fall under the same trade in practice but different skills on the bench: lead bullets are a Metalcraft Success Value test, a sling a Hideworking one, a staff sling Hideworking (Woodworking). **Crossbow spanners** are a Metalcraft Success Value test, and each masterwork modifier on a spanner increases the user's effective draw by 10%.

| Item          | Cost | Time | Pull | Success Value test |
| ------------- | ---- | ---- | ---- | ------------------ |
| Belt and claw | 3d   | 10h  | ×3   | Metalcraft         |
| Lever         | 6d   | 40h  | ×5   | Metalcraft         |
| Windlass      | 15d  | 90h  | ×10  | Metalcraft         |
