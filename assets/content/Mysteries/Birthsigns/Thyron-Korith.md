---
aliases: []
tags: []
name:
    full: Thyron-Korith
    aliases: []
description: "A cusp birthsign of the Astrokýklos: the influence conferred by being born on the threshold between two celestial signs."
id: 9tQtPyruod0egsYz
slug: thyronkorith
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: thyronkorith
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Thyron-Korith — Earth skills (-5 EML)"
      type: sohleffectdata
      _id: Zj4YarR7RMSXpQS3
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!9tQtPyruod0egsYz.Zj4YarR7RMSXpQS3"
    - name: "Thyron-Korith — Metal skills (+5 EML)"
      type: sohleffectdata
      _id: AM0fjlTiw50D7tkg
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!9tQtPyruod0egsYz.AM0fjlTiw50D7tkg"
    - name: "Thyron-Korith — Fire skills (+15 EML)"
      type: sohleffectdata
      _id: O90RtMZJAWiwKZc4
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!9tQtPyruod0egsYz.O90RtMZJAWiwKZc4"
    - name: "Thyron-Korith — Air skills (+10 EML)"
      type: sohleffectdata
      _id: J6k4SKI8BPrugql9
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!9tQtPyruod0egsYz.J6k4SKI8BPrugql9"
    - name: "Thyron-Korith — Water skills (-10 EML)"
      type: sohleffectdata
      _id: W9E3KhQcnYh9R8yr
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!9tQtPyruod0egsYz.W9E3KhQcnYh9R8yr"
---

Passing from Thyron, the Gate, to Korith, the Helm, the warrior's star hardens into endurance. Born to the blade and strong of body, its natives find speech and the lore of wild places slow to answer their call.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
