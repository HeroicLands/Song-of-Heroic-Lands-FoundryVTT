---
aliases: []
tags: []
name:
    full: Arnos
    aliases: []
description: "A birthsign of the Astrokýklos: the influence conferred by the celestial sign under which a being was born."
id: 7IP3RJVcyDlNdHeN
slug: arnos
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: arnos
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
    charges:
        usesCharges: false
        value: 0
        max: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Arnos — Nature skills (+15 EML)"
      type: sohleffectdata
      _id: EgDK7uYuEqS23grF
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!7IP3RJVcyDlNdHeN.EgDK7uYuEqS23grF"
    - name: "Arnos — Script skills (+5 EML)"
      type: sohleffectdata
      _id: 1MwvnhprxGvj9Ik8
      system:
          scope: skill
          test: 'itemLogic.data.subType === "script"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!7IP3RJVcyDlNdHeN.1MwvnhprxGvj9Ik8"
    - name: "Arnos — Craft skills (+5 EML)"
      type: sohleffectdata
      _id: jTEJOC5d1UmzB1hk
      system:
          scope: skill
          test: 'itemLogic.data.subType === "craft"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!7IP3RJVcyDlNdHeN.jTEJOC5d1UmzB1hk"
    - name: "Arnos — Combat Technique skills (-5 EML)"
      type: sohleffectdata
      _id: bFfm8l9uCfCqtU38
      system:
          scope: skill
          test: 'itemLogic.data.subType === "combattechnique"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!7IP3RJVcyDlNdHeN.bFfm8l9uCfCqtU38"
    - name: "Arnos — Combat skills (-5 EML)"
      type: sohleffectdata
      _id: 4E7iUNfBnKyG0hTo
      system:
          scope: skill
          test: 'itemLogic.data.subType === "combat"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!7IP3RJVcyDlNdHeN.4E7iUNfBnKyG0hTo"
    - name: "Arnos — Physical skills (-15 EML)"
      type: sohleffectdata
      _id: gEwUDAOMBXjRiBV5
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-15"
            priority: null
      _key: "!items.effects!7IP3RJVcyDlNdHeN.gEwUDAOMBXjRiBV5"
    - name: "Arnos — Mystical skills (-5 EML)"
      type: sohleffectdata
      _id: rHbAOhwDRkfCkbdJ
      system:
          scope: skill
          test: 'itemLogic.data.subType === "mystical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!7IP3RJVcyDlNdHeN.rHbAOhwDRkfCkbdJ"
    - name: "Arnos — Lore skills (-5 EML)"
      type: sohleffectdata
      _id: A2auhg9yEWQk0pid
      system:
          scope: skill
          test: 'itemLogic.data.subType === "lore"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!7IP3RJVcyDlNdHeN.A2auhg9yEWQk0pid"
    - name: "Arnos — Language skills (+5 EML)"
      type: sohleffectdata
      _id: DFczGwZF5xIfN3zV
      system:
          scope: skill
          test: 'itemLogic.data.subType === "language"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!7IP3RJVcyDlNdHeN.DFczGwZF5xIfN3zV"
    - name: "Arnos — Social skills (+5 EML)"
      type: sohleffectdata
      _id: IfMo7k2VfCyx3cHx
      system:
          scope: skill
          test: 'itemLogic.data.subType === "social"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!7IP3RJVcyDlNdHeN.IfMo7k2VfCyx3cHx"
---

Those born under Arnos, the Ram, are said to carry the vigour of green things breaking through frost. Herbalists, hunters, and wardens of the wild claim its favour, while the sign turns its face from those who would master flesh and blade.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
