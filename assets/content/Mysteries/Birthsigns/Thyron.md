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
    - name: "Thyron — Nature skills (-5 EML)"
      type: sohleffectdata
      _id: L9bCGmlqFhTFIGRY
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!aAfvLe0BicQaJg1Y.L9bCGmlqFhTFIGRY"
    - name: "Thyron — Script skills (+5 EML)"
      type: sohleffectdata
      _id: g3XliuCwKMzDDl1S
      system:
          scope: skill
          test: 'itemLogic.data.subType === "script"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!aAfvLe0BicQaJg1Y.g3XliuCwKMzDDl1S"
    - name: "Thyron — Craft skills (+5 EML)"
      type: sohleffectdata
      _id: SA3hunilNrSPhZI8
      system:
          scope: skill
          test: 'itemLogic.data.subType === "craft"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!aAfvLe0BicQaJg1Y.SA3hunilNrSPhZI8"
    - name: "Thyron — Combat Technique skills (+15 EML)"
      type: sohleffectdata
      _id: eAwTaxeuCiV2Q1vl
      system:
          scope: skill
          test: 'itemLogic.data.subType === "combattechnique"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!aAfvLe0BicQaJg1Y.eAwTaxeuCiV2Q1vl"
    - name: "Thyron — Combat skills (+15 EML)"
      type: sohleffectdata
      _id: xRcVKHXEclb1D2TS
      system:
          scope: skill
          test: 'itemLogic.data.subType === "combat"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!aAfvLe0BicQaJg1Y.xRcVKHXEclb1D2TS"
    - name: "Thyron — Physical skills (+5 EML)"
      type: sohleffectdata
      _id: KMx9O59peo2eH4ux
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!aAfvLe0BicQaJg1Y.KMx9O59peo2eH4ux"
    - name: "Thyron — Mystical skills (-5 EML)"
      type: sohleffectdata
      _id: Gik9HDxUbPM4zU6H
      system:
          scope: skill
          test: 'itemLogic.data.subType === "mystical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!aAfvLe0BicQaJg1Y.Gik9HDxUbPM4zU6H"
    - name: "Thyron — Lore skills (-5 EML)"
      type: sohleffectdata
      _id: EAAzBQyDZPJkdoDU
      system:
          scope: skill
          test: 'itemLogic.data.subType === "lore"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!aAfvLe0BicQaJg1Y.EAAzBQyDZPJkdoDU"
    - name: "Thyron — Language skills (-15 EML)"
      type: sohleffectdata
      _id: 5n6H20FnRrJr9kUs
      system:
          scope: skill
          test: 'itemLogic.data.subType === "language"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-15"
            priority: null
      _key: "!items.effects!aAfvLe0BicQaJg1Y.5n6H20FnRrJr9kUs"
    - name: "Thyron — Social skills (-15 EML)"
      type: sohleffectdata
      _id: fMRwNItDCiG6hupZ
      system:
          scope: skill
          test: 'itemLogic.data.subType === "social"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-15"
            priority: null
      _key: "!items.effects!aAfvLe0BicQaJg1Y.fMRwNItDCiG6hupZ"
---

Thyron, the Gate, is the warrior's star. Its natives are born to the blade and the martial disciplines, hardy of body, though the sign grants them little gift for tongues, courts, or the study of wild places.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
