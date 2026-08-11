---
aliases: []
tags: []
name:
    full: Stathmos
    aliases: []
description: "A birthsign of the Astrokýklos: the influence conferred by the celestial sign under which a being was born."
id: BdARpfjp4ZpLEz1M
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: stathmos
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Stathmos — Earth skills (-15 EML)"
      type: sohleffectdata
      _id: PMwEa3BCnBCbTTZn
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-15"
            priority: null
      _key: "!items.effects!BdARpfjp4ZpLEz1M.PMwEa3BCnBCbTTZn"
    - name: "Stathmos — Metal skills (-5 EML)"
      type: sohleffectdata
      _id: jni74eKl4reLH5e1
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!BdARpfjp4ZpLEz1M.jni74eKl4reLH5e1"
    - name: "Stathmos — Fire skills (+5 EML)"
      type: sohleffectdata
      _id: fqi4zmIoty7Ghpku
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!BdARpfjp4ZpLEz1M.fqi4zmIoty7Ghpku"
    - name: "Stathmos — Air skills (+15 EML)"
      type: sohleffectdata
      _id: e1pYIi8t8JmbIf0y
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!BdARpfjp4ZpLEz1M.e1pYIi8t8JmbIf0y"
    - name: "Stathmos — Spirit skills (+5 EML)"
      type: sohleffectdata
      _id: YcIzNK1iYrH91ejF
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!BdARpfjp4ZpLEz1M.YcIzNK1iYrH91ejF"
    - name: "Stathmos — Water skills (-5 EML)"
      type: sohleffectdata
      _id: HIvixpqpSOgtwLjn
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!BdARpfjp4ZpLEz1M.HIvixpqpSOgtwLjn"
---

Stathmos, the Balance, is the sign of the tested body. Its natives are robust and enduring, apt for the martial and the mystical middle path, but the wilds, the workshop, and the scriptorium yield to them grudgingly.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
