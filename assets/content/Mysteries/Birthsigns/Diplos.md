---
aliases: []
tags: []
name:
    full: Diplos
    aliases: []
description: "A birthsign of the Astrokýklos: the influence conferred by the celestial sign under which a being was born."
id: aZEAJ3V0isBBQkHw
slug: diplos
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
    - name: "Diplos — Nature skills (+5 EML)"
      type: sohleffectdata
      _id: RZdo6CjAXhiQjAhA
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!aZEAJ3V0isBBQkHw.RZdo6CjAXhiQjAhA"
    - name: "Diplos — Script skills (+15 EML)"
      type: sohleffectdata
      _id: bVUK9sAcMNE1AE7U
      system:
          scope: skill
          test: 'itemLogic.data.subType === "script"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!aZEAJ3V0isBBQkHw.bVUK9sAcMNE1AE7U"
    - name: "Diplos — Craft skills (+15 EML)"
      type: sohleffectdata
      _id: mpMozOzcohyaccAF
      system:
          scope: skill
          test: 'itemLogic.data.subType === "craft"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!aZEAJ3V0isBBQkHw.mpMozOzcohyaccAF"
    - name: "Diplos — Combat Technique skills (+5 EML)"
      type: sohleffectdata
      _id: J3RuUuN72DmE5Qay
      system:
          scope: skill
          test: 'itemLogic.data.subType === "combattechnique"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!aZEAJ3V0isBBQkHw.J3RuUuN72DmE5Qay"
    - name: "Diplos — Combat skills (+5 EML)"
      type: sohleffectdata
      _id: Tv946G6uDEFu3SHw
      system:
          scope: skill
          test: 'itemLogic.data.subType === "combat"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!aZEAJ3V0isBBQkHw.Tv946G6uDEFu3SHw"
    - name: "Diplos — Physical skills (-5 EML)"
      type: sohleffectdata
      _id: NHDlBpbySA8en3ie
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!aZEAJ3V0isBBQkHw.NHDlBpbySA8en3ie"
    - name: "Diplos — Mystical skills (-15 EML)"
      type: sohleffectdata
      _id: 2BuNhWiDEaCbU1nN
      system:
          scope: skill
          test: 'itemLogic.data.subType === "mystical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-15"
            priority: null
      _key: "!items.effects!aZEAJ3V0isBBQkHw.2BuNhWiDEaCbU1nN"
    - name: "Diplos — Lore skills (-15 EML)"
      type: sohleffectdata
      _id: Ei5zUkqzcWqKRxb3
      system:
          scope: skill
          test: 'itemLogic.data.subType === "lore"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-15"
            priority: null
      _key: "!items.effects!aZEAJ3V0isBBQkHw.Ei5zUkqzcWqKRxb3"
    - name: "Diplos — Language skills (-5 EML)"
      type: sohleffectdata
      _id: oxy9JSgBhyXSF9NC
      system:
          scope: skill
          test: 'itemLogic.data.subType === "language"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!aZEAJ3V0isBBQkHw.oxy9JSgBhyXSF9NC"
    - name: "Diplos — Social skills (-5 EML)"
      type: sohleffectdata
      _id: enfF0sCf3RJQfI3S
      system:
          scope: skill
          test: 'itemLogic.data.subType === "social"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!aZEAJ3V0isBBQkHw.enfF0sCf3RJQfI3S"
---

Diplos, the Twins, is a sign of quick wit and quicker fingers. Scribes, artisans, and duelists born beneath it prosper, but the arcane and the antiquarian find its natives distracted and ill-suited to long contemplation.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
