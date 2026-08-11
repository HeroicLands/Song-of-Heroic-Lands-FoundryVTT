---
aliases: []
tags: []
name:
    full: Diplos
    aliases: []
description: "A birthsign of the Astrokýklos: the influence conferred by the celestial sign under which a being was born."
id: aZEAJ3V0isBBQkHw
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: diplos
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Diplos — Earth skills (+5 EML)"
      type: sohleffectdata
      _id: RZdo6CjAXhiQjAhA
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!aZEAJ3V0isBBQkHw.RZdo6CjAXhiQjAhA"
    - name: "Diplos — Metal skills (+15 EML)"
      type: sohleffectdata
      _id: bVUK9sAcMNE1AE7U
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!aZEAJ3V0isBBQkHw.bVUK9sAcMNE1AE7U"
    - name: "Diplos — Fire skills (+5 EML)"
      type: sohleffectdata
      _id: mpMozOzcohyaccAF
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!aZEAJ3V0isBBQkHw.mpMozOzcohyaccAF"
    - name: "Diplos — Air skills (-5 EML)"
      type: sohleffectdata
      _id: J3RuUuN72DmE5Qay
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!aZEAJ3V0isBBQkHw.J3RuUuN72DmE5Qay"
    - name: "Diplos — Spirit skills (-15 EML)"
      type: sohleffectdata
      _id: Tv946G6uDEFu3SHw
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-15"
            priority: null
      _key: "!items.effects!aZEAJ3V0isBBQkHw.Tv946G6uDEFu3SHw"
    - name: "Diplos — Water skills (-5 EML)"
      type: sohleffectdata
      _id: NHDlBpbySA8en3ie
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!aZEAJ3V0isBBQkHw.NHDlBpbySA8en3ie"
---

Diplos, the Twins, is a sign of quick wit and quicker fingers. Scribes, artisans, and duelists born beneath it prosper, but the arcane and the antiquarian find its natives distracted and ill-suited to long contemplation.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
