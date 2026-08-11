---
aliases: []
tags: []
name:
    full: Diplos-Chelyx
    aliases: []
description: "A cusp birthsign of the Astrokýklos: the influence conferred by being born on the threshold between two celestial signs."
id: 1BJtjynJ84exfZTe
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: diploschelyx
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Diplos-Chelyx — Earth skills (+5 EML)"
      type: sohleffectdata
      _id: 7Bw3T3BpTDS3ed1y
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!1BJtjynJ84exfZTe.7Bw3T3BpTDS3ed1y"
    - name: "Diplos-Chelyx — Metal skills (+15 EML)"
      type: sohleffectdata
      _id: 3canN0sOFAwv1Su5
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!1BJtjynJ84exfZTe.3canN0sOFAwv1Su5"
    - name: "Diplos-Chelyx — Fire skills (+10 EML)"
      type: sohleffectdata
      _id: 93HjjIWSu3hzX1vj
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!1BJtjynJ84exfZTe.93HjjIWSu3hzX1vj"
    - name: "Diplos-Chelyx — Spirit skills (-10 EML)"
      type: sohleffectdata
      _id: D2gMoIdHSMeO8WQk
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!1BJtjynJ84exfZTe.D2gMoIdHSMeO8WQk"
    - name: "Diplos-Chelyx — Water skills (-5 EML)"
      type: sohleffectdata
      _id: HbzVpwz1yeg4eOUf
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!1BJtjynJ84exfZTe.HbzVpwz1yeg4eOUf"
---

On the cusp of Diplos, the Twins, and Chelyx, the Tortoise, quickness settles into method. Artisans, scribes, and disciplined fighters flourish beneath it, while easy speech and the numinous both come hard.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
