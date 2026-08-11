---
aliases: []
tags: []
name:
    full: Chelyx-Thyron
    aliases: []
description: "A cusp birthsign of the Astrokýklos: the influence conferred by being born on the threshold between two celestial signs."
id: M0BHVOQvuLepIQUw
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: chelyxthyron
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Chelyx-Thyron — Metal skills (+10 EML)"
      type: sohleffectdata
      _id: qaNuAyEJtrlOupXE
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!M0BHVOQvuLepIQUw.qaNuAyEJtrlOupXE"
    - name: "Chelyx-Thyron — Fire skills (+15 EML)"
      type: sohleffectdata
      _id: 0GBTD5ineEd0R6hU
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!M0BHVOQvuLepIQUw.0GBTD5ineEd0R6hU"
    - name: "Chelyx-Thyron — Air skills (+5 EML)"
      type: sohleffectdata
      _id: 9Pl0FMomdNprpC2e
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!M0BHVOQvuLepIQUw.9Pl0FMomdNprpC2e"
    - name: "Chelyx-Thyron — Spirit skills (-5 EML)"
      type: sohleffectdata
      _id: Qm6B5MW4Rrflijb8
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!M0BHVOQvuLepIQUw.Qm6B5MW4Rrflijb8"
    - name: "Chelyx-Thyron — Water skills (-10 EML)"
      type: sohleffectdata
      _id: df6QRnS5o99UpPQ6
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!M0BHVOQvuLepIQUw.df6QRnS5o99UpPQ6"
---

Where Chelyx, the Tortoise, opens onto Thyron, the Gate, craft turns to arms. Its natives carry the workshop's discipline into the drill-yard, exact and hardy, though courts and tongues are closed to them.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
