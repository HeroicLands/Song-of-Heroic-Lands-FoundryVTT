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

**Workshop.** The crafter works in a fletching workshop, rated from one to five stars, which sets the Target Number for masterwork rolls.

**Expense.** Materials are paid in pence and the work in hours or months; a crafter puts in up to ten hours a day.

| Item                 | Cost | Time | Success Value test                   |
| -------------------- | ---- | ---- | ------------------------------------ |
| Arrows, heavy (12)   | 3d   | 25h  | Fletching (Woodworking, Metalcraft)  |
| Arrows, light (12)   | 2d   | 20h  | Fletching (Woodworking, Metalcraft)  |
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
| Quarrels, heavy (12) | 3d   | 25h  | Fletching (Woodworking, Metalcraft)  |
| Quarrels, light (12) | 3d   | 20h  | Fletching (Woodworking, Metalcraft)  |

Composite bows are sinew-backed, which is why they call for Hideworking; the months they take to cure are why bowyers outside the dry horse countries rarely attempt them.

**Test and result.**

| SV  | Outcome                                                                                                                                |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- |
| ≤ 2 | Flawed. The item's performance is reduced as below; an SV of 0 or less doubles the reduction.                                          |
| 3–4 | The base item, exactly as catalogued.                                                                                                  |
| 5+  | Masterwork. Each Value Diamond buys either one d10 masterwork roll or a 10% reduction in the time expense, to a maximum 30% reduction. |

A Critical Failure is a setback: crafting time increases by half.

**Masterwork rolls.** Each diamond so committed rolls one d10 against a Target Number equal to the workshop's star quality — one to five dice against a TN of 1 to 5, rolled separately. Successes are Masterwork Successes.

| Workshop  | TN  | MWS | Result                  | Value |
| --------- | --- | --- | ----------------------- | ----- |
| Makeshift | 1   | 0   | Base article            | ×1    |
| Sparse    | 2   | 1   | Quality +1              | ×2    |
| Standard  | 3   | 2   | Quality +1, modifier +1 | ×3    |
| Plentiful | 4   | 3   | Quality +2, modifier +1 | ×4    |
| Ideal     | 5   | 4   | Quality +2, modifier +2 | ×5    |
|           |     | 5   | Quality +3, modifier +2 | ×6    |

**Applicable successes** are capped at the item's base Weapon Quality minus eight — a WQ 10 bow takes at most two. Projectiles have no Weapon Quality; assume two.

**What the modifier does.** On a **projectile**, each point of modifier adds one to impact; a flawed projectile loses the same d2 from both its quality and its impact. On a **weapon**, each point of modifier adds 30 feet of base range; a flawed weapon loses d2 quality and that same d2 × 30 feet of range.

**Arrowheads** may be bought in rather than forged. If they are, the Metalcraft Secondary Modifier derives from the smith's Mastery Level rather than the fletcher's — cost doubles, crafting time halves.

**Bullets and slings** fall under the same trade in practice but different skills on the bench: lead bullets are a Metalcraft Success Value test, a sling a Hideworking one, a staff sling Hideworking (Woodworking). **Crossbow spanners** are a Metalcraft Success Value test, and each masterwork modifier on a spanner increases the user's effective draw by 10%.

| Item          | Cost | Time | Pull | Success Value test |
| ------------- | ---- | ---- | ---- | ------------------ |
| Belt and claw | 3d   | 10h  | ×3   | Metalcraft         |
| Lever         | 6d   | 40h  | ×5   | Metalcraft         |
| Windlass      | 15d  | 90h  | ×10  | Metalcraft         |
