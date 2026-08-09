---
aliases: []
tags: []
name:
    full: Thyron
    aliases: []
description: "A birthsign of the Astrokýklos: the influence conferred by the celestial sign under which a being was born."
id: aAfvLe0BicQaJg1Y
slug: thyron
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: thyron
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Thyron — Earth skills (-5 EML)"
      type: sohleffectdata
      _id: L9bCGmlqFhTFIGRY
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!aAfvLe0BicQaJg1Y.L9bCGmlqFhTFIGRY"
    - name: "Thyron — Metal skills (+5 EML)"
      type: sohleffectdata
      _id: g3XliuCwKMzDDl1S
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!aAfvLe0BicQaJg1Y.g3XliuCwKMzDDl1S"
    - name: "Thyron — Fire skills (+15 EML)"
      type: sohleffectdata
      _id: SA3hunilNrSPhZI8
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!aAfvLe0BicQaJg1Y.SA3hunilNrSPhZI8"
    - name: "Thyron — Air skills (+5 EML)"
      type: sohleffectdata
      _id: eAwTaxeuCiV2Q1vl
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!aAfvLe0BicQaJg1Y.eAwTaxeuCiV2Q1vl"
    - name: "Thyron — Spirit skills (-5 EML)"
      type: sohleffectdata
      _id: xRcVKHXEclb1D2TS
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!aAfvLe0BicQaJg1Y.xRcVKHXEclb1D2TS"
    - name: "Thyron — Water skills (-15 EML)"
      type: sohleffectdata
      _id: KMx9O59peo2eH4ux
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-15"
            priority: null
      _key: "!items.effects!aAfvLe0BicQaJg1Y.KMx9O59peo2eH4ux"
---

Thyron, the Gate, is the warrior's star. Its natives are born to the blade and the martial disciplines, hardy of body, though the sign grants them little gift for tongues, courts, or the study of wild places.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
