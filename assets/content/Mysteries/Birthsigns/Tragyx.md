---
aliases: []
tags: []
name:
    full: Tragyx
    aliases: []
description: "A birthsign of the Astrokýklos: the influence conferred by the celestial sign under which a being was born."
id: jq8GiYBpQYyWBMdA
slug: tragyx
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: tragyx
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Tragyx — Script skills (-10 EML)"
      type: sohleffectdata
      _id: mI3KB5t082ZwL2s4
      system:
          scope: skill
          test: 'itemLogic.data.subType === "script"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!jq8GiYBpQYyWBMdA.mI3KB5t082ZwL2s4"
    - name: "Tragyx — Craft skills (-10 EML)"
      type: sohleffectdata
      _id: 99xENObcwWcvw1rb
      system:
          scope: skill
          test: 'itemLogic.data.subType === "craft"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!jq8GiYBpQYyWBMdA.99xENObcwWcvw1rb"
    - name: "Tragyx — Combat Technique skills (-10 EML)"
      type: sohleffectdata
      _id: 1SRZsJ17BuZE8AWO
      system:
          scope: skill
          test: 'itemLogic.data.subType === "combattechnique"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!jq8GiYBpQYyWBMdA.1SRZsJ17BuZE8AWO"
    - name: "Tragyx — Combat skills (-10 EML)"
      type: sohleffectdata
      _id: xjwJVovjP491ScXo
      system:
          scope: skill
          test: 'itemLogic.data.subType === "combat"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!jq8GiYBpQYyWBMdA.xjwJVovjP491ScXo"
    - name: "Tragyx — Mystical skills (+10 EML)"
      type: sohleffectdata
      _id: 39NpwGX6BIo8AUQe
      system:
          scope: skill
          test: 'itemLogic.data.subType === "mystical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!jq8GiYBpQYyWBMdA.39NpwGX6BIo8AUQe"
    - name: "Tragyx — Lore skills (+10 EML)"
      type: sohleffectdata
      _id: j8G6JVAI5b2BL5ep
      system:
          scope: skill
          test: 'itemLogic.data.subType === "lore"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!jq8GiYBpQYyWBMdA.j8G6JVAI5b2BL5ep"
    - name: "Tragyx — Language skills (+10 EML)"
      type: sohleffectdata
      _id: NqrwjZlo5szC8Nti
      system:
          scope: skill
          test: 'itemLogic.data.subType === "language"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!jq8GiYBpQYyWBMdA.NqrwjZlo5szC8Nti"
    - name: "Tragyx — Social skills (+10 EML)"
      type: sohleffectdata
      _id: XvSuD9ahBqNqmAuG
      system:
          scope: skill
          test: 'itemLogic.data.subType === "social"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!jq8GiYBpQYyWBMdA.XvSuD9ahBqNqmAuG"
---

Tragyx, the Stag, gives an eloquent tongue and a searching mind. Born orators, linguists, and adepts of the mysteries, its children have little inclination for the workshop bench or the practice of arms.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
