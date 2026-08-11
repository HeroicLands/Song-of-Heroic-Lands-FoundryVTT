---
aliases: []
tags: []
name:
    full: Tragyx
    aliases: []
description: "A birthsign of the Astrokýklos: the influence conferred by the celestial sign under which a being was born."
id: jq8GiYBpQYyWBMdA
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
    - name: "Tragyx — Metal skills (-10 EML)"
      type: sohleffectdata
      _id: mI3KB5t082ZwL2s4
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!jq8GiYBpQYyWBMdA.mI3KB5t082ZwL2s4"
    - name: "Tragyx — Fire skills (-10 EML)"
      type: sohleffectdata
      _id: 99xENObcwWcvw1rb
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!jq8GiYBpQYyWBMdA.99xENObcwWcvw1rb"
    - name: "Tragyx — Spirit skills (+10 EML)"
      type: sohleffectdata
      _id: 1SRZsJ17BuZE8AWO
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!jq8GiYBpQYyWBMdA.1SRZsJ17BuZE8AWO"
    - name: "Tragyx — Water skills (+10 EML)"
      type: sohleffectdata
      _id: xjwJVovjP491ScXo
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!jq8GiYBpQYyWBMdA.xjwJVovjP491ScXo"
---

Tragyx, the Stag, gives an eloquent tongue and a searching mind. Born orators, linguists, and adepts of the mysteries, its children have little inclination for the workshop bench or the practice of arms.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
