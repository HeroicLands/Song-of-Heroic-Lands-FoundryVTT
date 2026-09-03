---
aliases: []
tags: []
name:
  full: Masonry
  aliases: []
description: "Quarrying, cutting, and laying stone for walls, buildings, and fortifications."
id: F5DfpQA2G8l0BBLo
img: icons/game-icons/delapouite/brick-wall.svg
shortcode: masn
type: skill
subType: craft
sohl:
  kbcat: craft
  archetype: 0
  skillBaseFormula: "sb(attr.dex, attr.str)"
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

Masonry is quarrying, dressing and laying stone — from a field wall or a carved plaque up to a keep, a bridge or a gatehouse, and the quarry and the scaffold that any of them needs.

# Crafting {#crafting}

Stonework is made by the common [[doc-crafting|crafting routine]] — workshop, expense, test, result, masterwork rolls, repair. A field wall or a carved plaque is a single Masonry Success Value test and no more. What follows is what is particular to a building.

**Design.** Anything large or structurally ambitious — a keep, a bridge, a gatehouse — must first be designed: an Engineering Design Roll is made before the first stone is cut, and its Success Value then modifies the Construction Roll below.

Most stone buildings also want a master woodworker for centring, scaffolding, floors and roof, and their Woodworking Mastery Level serves as a Secondary Modifier.

| Structure                   | Worker-months | Cost  | Test                  |
| --------------------------- | ------------- | ----- | --------------------- |
| Castle, large               | 15,700        | £9400 | Masonry (Woodworking) |
| Castle, medium              | 4,700         | £2800 | Masonry (Woodworking) |
| Castle, small               | 1,600         | £1000 | Masonry (Woodworking) |
| Keep, large                 | 3,500         | £2100 | Masonry (Woodworking) |
| Keep, medium                | 700           | £410  | Masonry (Woodworking) |
| Keep, small                 | 300           | £175  | Masonry (Woodworking) |
| Manor house, large          | 147           | £88   | Masonry (Woodworking) |
| Manor house, small          | 83            | £50   | Masonry (Woodworking) |
| Mill, large                 | 14            | £8    | Masonry (Woodworking) |
| Mill, small                 | 7             | £4    | Masonry (Woodworking) |
| Townhouse, exclusive        | 83            | £50   | Masonry (Woodworking) |
| Wall, stone, 10′ × 11′ × 5′ | 8             | £5    | Masonry               |

The months given assume a single worker; divide by however many are actually employed. A work-month is 24 days and a work-year nine months — which is how a hundred masons still spend better than seventeen years on a large castle.

**The Construction Roll** is made halfway through the work: a Success Value test of the workers' averaged Masonry, adjusted by the Secondary Modifier of the master woodworker where one is required, and then by the Success Value of the preceding Design Roll. The result multiplies the final time and cost.

| SV  | Time | Cost |
| --- | ---- | ---- |
| ≤ 2 | ×1.4 | ×1.3 |
| 3–4 | ×1.3 | ×1.2 |
| 5   | ×1.2 | ×1.1 |
| 6   | ×1.1 | ×1.0 |
| 7   | ×1.0 | ×1.0 |
| 8   | ×0.9 | ×1.0 |
| 9+  | ×0.8 | ×0.9 |

A badly run site does not merely cost more; it costs more _and_ takes longer, and there is no Success Value at which the work comes in free.
