---
aliases: []
tags: []
name:
    full: Stathmos
    aliases: []
description: "A birthsign of the Astrokýklos: the influence conferred by the celestial sign under which a being was born."
id: BdARpfjp4ZpLEz1M
slug: stathmos
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
    - name: "Stathmos — Nature skills (-15 EML)"
      type: sohleffectdata
      _id: PMwEa3BCnBCbTTZn
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-15"
            priority: null
      _key: "!items.effects!BdARpfjp4ZpLEz1M.PMwEa3BCnBCbTTZn"
    - name: "Stathmos — Script skills (-5 EML)"
      type: sohleffectdata
      _id: jni74eKl4reLH5e1
      system:
          scope: skill
          test: 'itemLogic.data.subType === "script"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!BdARpfjp4ZpLEz1M.jni74eKl4reLH5e1"
    - name: "Stathmos — Craft skills (-5 EML)"
      type: sohleffectdata
      _id: fqi4zmIoty7Ghpku
      system:
          scope: skill
          test: 'itemLogic.data.subType === "craft"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!BdARpfjp4ZpLEz1M.fqi4zmIoty7Ghpku"
    - name: "Stathmos — Combat Technique skills (+5 EML)"
      type: sohleffectdata
      _id: e1pYIi8t8JmbIf0y
      system:
          scope: skill
          test: 'itemLogic.data.subType === "combattechnique"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!BdARpfjp4ZpLEz1M.e1pYIi8t8JmbIf0y"
    - name: "Stathmos — Combat skills (+5 EML)"
      type: sohleffectdata
      _id: YcIzNK1iYrH91ejF
      system:
          scope: skill
          test: 'itemLogic.data.subType === "combat"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!BdARpfjp4ZpLEz1M.YcIzNK1iYrH91ejF"
    - name: "Stathmos — Physical skills (+15 EML)"
      type: sohleffectdata
      _id: HIvixpqpSOgtwLjn
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!BdARpfjp4ZpLEz1M.HIvixpqpSOgtwLjn"
    - name: "Stathmos — Mystical skills (+5 EML)"
      type: sohleffectdata
      _id: NzA2Hj78kWpOeEYJ
      system:
          scope: skill
          test: 'itemLogic.data.subType === "mystical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!BdARpfjp4ZpLEz1M.NzA2Hj78kWpOeEYJ"
    - name: "Stathmos — Lore skills (+5 EML)"
      type: sohleffectdata
      _id: Dy8oNkQ98nEd3Mne
      system:
          scope: skill
          test: 'itemLogic.data.subType === "lore"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!BdARpfjp4ZpLEz1M.Dy8oNkQ98nEd3Mne"
    - name: "Stathmos — Language skills (-5 EML)"
      type: sohleffectdata
      _id: 1sPg0dWMDKPbNH9W
      system:
          scope: skill
          test: 'itemLogic.data.subType === "language"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!BdARpfjp4ZpLEz1M.1sPg0dWMDKPbNH9W"
    - name: "Stathmos — Social skills (-5 EML)"
      type: sohleffectdata
      _id: FCtTVPOKF0X6GrEd
      system:
          scope: skill
          test: 'itemLogic.data.subType === "social"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!BdARpfjp4ZpLEz1M.FCtTVPOKF0X6GrEd"
---

Stathmos, the Balance, is the sign of the tested body. Its natives are robust and enduring, apt for the martial and the mystical middle path, but the wilds, the workshop, and the scriptorium yield to them grudgingly.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
