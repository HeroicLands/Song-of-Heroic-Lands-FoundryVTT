---
shortcode: hsclk
name: {full: Homespun Cloak, aliases: []}
type: armorgear
description: "Practical homemade cloak providing basic weather protection."
tags: []
data: {icon: cloak, templatePriority: 0, packFolder: clothing}
sohl:
  craft: {skill: txtl, secondary: []}
  kbcat: cloth
  armorType: Cloak
  detailMaterial: Homespun
  system:
    weightBase: 0.4
    valueBase: 11
    durabilityBase: 5
    material: Cloth
    locations:
      flexible:
        - lshldloc
        - rshldloc
        - thrxloc
        - abdmnloc
        - plvisloc
        - lthghloc
        - rthghloc
        - lkneeloc
        - rkneeloc
        - lcalfloc
        - rcalfloc
      rigid: []
      facing:
        - {location: thrxloc, side: back}
        - {location: abdmnloc, side: back}
        - {location: plvisloc, side: back}
        - {location: lthghloc, side: back}
        - {location: rthghloc, side: back}
        - {location: lkneeloc, side: back}
        - {location: rkneeloc, side: back}
        - {location: lcalfloc, side: back}
        - {location: rcalfloc, side: back}
    protectionBase: {blunt: 4, edged: 8, piercing: 5, fire: 5}
    encumbrance: 0
    perceptionPenaltyBase: 0
---

The Homespun Cloak is a practical and simple garment woven from homemade fabric. It provides basic protection against the elements, making it suitable for peasants and everyday wearers who need a reliable, no-frills outer layer.
