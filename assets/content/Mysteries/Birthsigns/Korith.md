---
aliases: []
tags: []
name:
    full: Korith
    aliases: []
description: "A birthsign of the Astrokýklos: the influence conferred by the celestial sign under which a being was born."
id: R6kUskyAmO8AmYuz
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: korith
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Korith — Earth skills (-10 EML)"
      type: sohleffectdata
      _id: NFIDMOs9O1Cb8DrG
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!R6kUskyAmO8AmYuz.NFIDMOs9O1Cb8DrG"
    - name: "Korith — Fire skills (+10 EML)"
      type: sohleffectdata
      _id: VzAxfm9MhDrQVdvN
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!R6kUskyAmO8AmYuz.VzAxfm9MhDrQVdvN"
    - name: "Korith — Air skills (+10 EML)"
      type: sohleffectdata
      _id: TDTDnF1gzzEGTwry
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!R6kUskyAmO8AmYuz.TDTDnF1gzzEGTwry"
    - name: "Korith — Water skills (-10 EML)"
      type: sohleffectdata
      _id: UnziEQnkHBWCBYFF
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!R6kUskyAmO8AmYuz.UnziEQnkHBWCBYFF"
---

Korith, the Helm, tempers its children for endurance and the clash of arms. Strong in body and steady under the strike, they nonetheless find the lore of nature and the graces of speech slow to answer their call.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
