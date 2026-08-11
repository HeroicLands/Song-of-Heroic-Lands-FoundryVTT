---
aliases: []
tags: []
name:
    full: Belos
    aliases: []
description: "A birthsign of the Astrokýklos: the influence conferred by the celestial sign under which a being was born."
id: VDbFbTOOigCx0XOp
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: belos
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Belos — Earth skills (-5 EML)"
      type: sohleffectdata
      _id: 96YoPpo3ZwBYT5zJ
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.96YoPpo3ZwBYT5zJ"
    - name: "Belos — Metal skills (-15 EML)"
      type: sohleffectdata
      _id: p5tRyPCLSZ09dMCV
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-15"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.p5tRyPCLSZ09dMCV"
    - name: "Belos — Fire skills (-5 EML)"
      type: sohleffectdata
      _id: QETfIJYOJeKSAHpk
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.QETfIJYOJeKSAHpk"
    - name: "Belos — Air skills (+5 EML)"
      type: sohleffectdata
      _id: 6bkigfPezD1ksdwN
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.6bkigfPezD1ksdwN"
    - name: "Belos — Spirit skills (+15 EML)"
      type: sohleffectdata
      _id: QYKLL8PdZaSbccLF
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.QYKLL8PdZaSbccLF"
    - name: "Belos — Water skills (+5 EML)"
      type: sohleffectdata
      _id: 3VFzAadFaXZNHxUv
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.3VFzAadFaXZNHxUv"
---

Belos, the Lamp, is the seer's sign. Its natives incline to the arcane and the antiquarian, keepers of lore and quiet counsel, while the maker's crafts and the disciplines of steel remain foreign to them.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
