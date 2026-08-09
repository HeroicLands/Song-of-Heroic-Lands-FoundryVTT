---
aliases: []
tags: []
name:
    full: Belos-Tragyx
    aliases: []
description: "A cusp birthsign of the Astrokýklos: the influence conferred by being born on the threshold between two celestial signs."
id: jokiHcSovj5CGFUS
slug: belostragyx
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: belostragyx
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Belos-Tragyx — Metal skills (-10 EML)"
      type: sohleffectdata
      _id: OhaKgb5x4ERUtUrn
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!jokiHcSovj5CGFUS.OhaKgb5x4ERUtUrn"
    - name: "Belos-Tragyx — Fire skills (-5 EML)"
      type: sohleffectdata
      _id: 8zZrJ2ZzfLjo1jV1
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!jokiHcSovj5CGFUS.8zZrJ2ZzfLjo1jV1"
    - name: "Belos-Tragyx — Air skills (+5 EML)"
      type: sohleffectdata
      _id: i5HGCEoo6vSkabuo
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!jokiHcSovj5CGFUS.i5HGCEoo6vSkabuo"
    - name: "Belos-Tragyx — Spirit skills (+15 EML)"
      type: sohleffectdata
      _id: BLNyv6cmfwu80PEp
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!jokiHcSovj5CGFUS.BLNyv6cmfwu80PEp"
    - name: "Belos-Tragyx — Water skills (+10 EML)"
      type: sohleffectdata
      _id: Ze3YR7LU1wUozXWG
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!jokiHcSovj5CGFUS.Ze3YR7LU1wUozXWG"
---

Where Belos, the Lamp, passes into Tragyx, the Stag, the seer finds a voice. Keepers of lore who speak well and persuade easily, its natives have little inclination for the workshop bench or the practice of arms.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
