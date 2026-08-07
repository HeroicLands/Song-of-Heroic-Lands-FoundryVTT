---
aliases: []
tags: []
name:
    full: Belos
    aliases: []
description: "A birthsign of the Astrokýklos: the influence conferred by the celestial sign under which a being was born."
id: VDbFbTOOigCx0XOp
slug: belos
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
    - name: "Belos — Nature skills (-5 EML)"
      type: sohleffectdata
      _id: 96YoPpo3ZwBYT5zJ
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.96YoPpo3ZwBYT5zJ"
    - name: "Belos — Script skills (-15 EML)"
      type: sohleffectdata
      _id: p5tRyPCLSZ09dMCV
      system:
          scope: skill
          test: 'itemLogic.data.subType === "script"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-15"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.p5tRyPCLSZ09dMCV"
    - name: "Belos — Craft skills (-15 EML)"
      type: sohleffectdata
      _id: QETfIJYOJeKSAHpk
      system:
          scope: skill
          test: 'itemLogic.data.subType === "craft"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-15"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.QETfIJYOJeKSAHpk"
    - name: "Belos — Combat Technique skills (-5 EML)"
      type: sohleffectdata
      _id: 6bkigfPezD1ksdwN
      system:
          scope: skill
          test: 'itemLogic.data.subType === "combattechnique"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.6bkigfPezD1ksdwN"
    - name: "Belos — Combat skills (-5 EML)"
      type: sohleffectdata
      _id: QYKLL8PdZaSbccLF
      system:
          scope: skill
          test: 'itemLogic.data.subType === "combat"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.QYKLL8PdZaSbccLF"
    - name: "Belos — Physical skills (+5 EML)"
      type: sohleffectdata
      _id: 3VFzAadFaXZNHxUv
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.3VFzAadFaXZNHxUv"
    - name: "Belos — Mystical skills (+15 EML)"
      type: sohleffectdata
      _id: 1B2jUjFFhrkQ02nS
      system:
          scope: skill
          test: 'itemLogic.data.subType === "mystical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.1B2jUjFFhrkQ02nS"
    - name: "Belos — Lore skills (+15 EML)"
      type: sohleffectdata
      _id: 1TQbAhiodwhRvspX
      system:
          scope: skill
          test: 'itemLogic.data.subType === "lore"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.1TQbAhiodwhRvspX"
    - name: "Belos — Language skills (+5 EML)"
      type: sohleffectdata
      _id: xjU8Vc1tRFEvjeS9
      system:
          scope: skill
          test: 'itemLogic.data.subType === "language"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.xjU8Vc1tRFEvjeS9"
    - name: "Belos — Social skills (+5 EML)"
      type: sohleffectdata
      _id: xSwY389vTYzAg4dq
      system:
          scope: skill
          test: 'itemLogic.data.subType === "social"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.xSwY389vTYzAg4dq"
---

Belos, the Lamp, is the seer's sign. Its natives incline to the arcane and the antiquarian, keepers of lore and quiet counsel, while the maker's crafts and the disciplines of steel remain foreign to them.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
