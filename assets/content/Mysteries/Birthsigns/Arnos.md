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
folder: b1rthS1gnFldr001
effects:
    - name: "Arnos — Earth skills (+15 EML)"
      type: sohleffectdata
      _id: EgDK7uYuEqS23grF
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!7IP3RJVcyDlNdHeN.EgDK7uYuEqS23grF"
    - name: "Arnos — Metal skills (+5 EML)"
      type: sohleffectdata
      _id: 1MwvnhprxGvj9Ik8
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!7IP3RJVcyDlNdHeN.1MwvnhprxGvj9Ik8"
    - name: "Arnos — Fire skills (-5 EML)"
      type: sohleffectdata
      _id: 4E7iUNfBnKyG0hTo
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!7IP3RJVcyDlNdHeN.4E7iUNfBnKyG0hTo"
    - name: "Arnos — Air skills (-15 EML)"
      type: sohleffectdata
      _id: gEwUDAOMBXjRiBV5
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-15"
            priority: null
      _key: "!items.effects!7IP3RJVcyDlNdHeN.gEwUDAOMBXjRiBV5"
    - name: "Arnos — Spirit skills (-5 EML)"
      type: sohleffectdata
      _id: rHbAOhwDRkfCkbdJ
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!7IP3RJVcyDlNdHeN.rHbAOhwDRkfCkbdJ"
    - name: "Arnos — Water skills (+5 EML)"
      type: sohleffectdata
      _id: DFczGwZF5xIfN3zV
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!7IP3RJVcyDlNdHeN.DFczGwZF5xIfN3zV"
---

Those born under Arnos, the Ram, are said to carry the vigour of green things breaking through frost. Herbalists, hunters, and wardens of the wild claim its favour, while the sign turns its face from those who would master flesh and blade.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
