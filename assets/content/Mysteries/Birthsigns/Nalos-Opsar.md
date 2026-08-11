---
aliases: []
tags: []
name:
    full: Nalos-Opsar
    aliases: []
description: "A cusp birthsign of the Astrokýklos: the influence conferred by being born on the threshold between two celestial signs."
id: fLnSlBP8BrSk9nTS
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: nalosopsar
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Nalos-Opsar — Earth skills (+10 EML)"
      type: sohleffectdata
      _id: DEVUk5LwLRakT3Af
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!fLnSlBP8BrSk9nTS.DEVUk5LwLRakT3Af"
    - name: "Nalos-Opsar — Fire skills (-10 EML)"
      type: sohleffectdata
      _id: g04nRwGmEGGcyNXP
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!fLnSlBP8BrSk9nTS.g04nRwGmEGGcyNXP"
    - name: "Nalos-Opsar — Air skills (-5 EML)"
      type: sohleffectdata
      _id: 7ibBW4nnafNgGiqt
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!fLnSlBP8BrSk9nTS.7ibBW4nnafNgGiqt"
    - name: "Nalos-Opsar — Spirit skills (+5 EML)"
      type: sohleffectdata
      _id: 7At7tYFmgGwbJ0sr
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!fLnSlBP8BrSk9nTS.7At7tYFmgGwbJ0sr"
    - name: "Nalos-Opsar — Water skills (+15 EML)"
      type: sohleffectdata
      _id: 8IAP9kBrPvkMQMYR
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!fLnSlBP8BrSk9nTS.8IAP9kBrPvkMQMYR"
---

Where Nalos, the River, empties into Opsar, the Fish, speech is joined to a feel for living things. Persuasive and worldly, at ease in field and gathering, its natives are not made for the martial disciplines.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
