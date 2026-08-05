---
aliases: []
tags: []
name:
    full: Nalos
    aliases: []
description: "A birthsign of the Astrokýklos: the influence conferred by the celestial sign under which a being was born."
id: rqZ2w3pVH8POKZ1F
slug: nalos
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: nalos
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
    charges:
        usesCharges: false
        value: 0
        max: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Nalos — Nature skills (+5 EML)"
      type: sohleffectdata
      _id: wxSkntNDUhgrj7Bf
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!rqZ2w3pVH8POKZ1F.wxSkntNDUhgrj7Bf"
    - name: "Nalos — Script skills (-5 EML)"
      type: sohleffectdata
      _id: AuYPcPDSUTujgRvB
      system:
          scope: skill
          test: 'itemLogic.data.subType === "script"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!rqZ2w3pVH8POKZ1F.AuYPcPDSUTujgRvB"
    - name: "Nalos — Craft skills (-5 EML)"
      type: sohleffectdata
      _id: jxuJpAD8mC6UeR9y
      system:
          scope: skill
          test: 'itemLogic.data.subType === "craft"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!rqZ2w3pVH8POKZ1F.jxuJpAD8mC6UeR9y"
    - name: "Nalos — Combat Technique skills (-15 EML)"
      type: sohleffectdata
      _id: QYqkZDFdXBtfU4FO
      system:
          scope: skill
          test: 'itemLogic.data.subType === "combattechnique"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-15"
            priority: null
      _key: "!items.effects!rqZ2w3pVH8POKZ1F.QYqkZDFdXBtfU4FO"
    - name: "Nalos — Combat skills (-15 EML)"
      type: sohleffectdata
      _id: Pwlxi1f8PMlFSEGz
      system:
          scope: skill
          test: 'itemLogic.data.subType === "combat"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-15"
            priority: null
      _key: "!items.effects!rqZ2w3pVH8POKZ1F.Pwlxi1f8PMlFSEGz"
    - name: "Nalos — Physical skills (-5 EML)"
      type: sohleffectdata
      _id: 7SSWQau5gRNyx3ja
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!rqZ2w3pVH8POKZ1F.7SSWQau5gRNyx3ja"
    - name: "Nalos — Mystical skills (+5 EML)"
      type: sohleffectdata
      _id: bJmYfJatTdm0wsHg
      system:
          scope: skill
          test: 'itemLogic.data.subType === "mystical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!rqZ2w3pVH8POKZ1F.bJmYfJatTdm0wsHg"
    - name: "Nalos — Lore skills (+5 EML)"
      type: sohleffectdata
      _id: h1TZdC3BGEXXsnxj
      system:
          scope: skill
          test: 'itemLogic.data.subType === "lore"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!rqZ2w3pVH8POKZ1F.h1TZdC3BGEXXsnxj"
    - name: "Nalos — Language skills (+15 EML)"
      type: sohleffectdata
      _id: EwgQ4gKr0a4D7iBX
      system:
          scope: skill
          test: 'itemLogic.data.subType === "language"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!rqZ2w3pVH8POKZ1F.EwgQ4gKr0a4D7iBX"
    - name: "Nalos — Social skills (+15 EML)"
      type: sohleffectdata
      _id: c9mCqMvPHvgEBnnK
      system:
          scope: skill
          test: 'itemLogic.data.subType === "social"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!rqZ2w3pVH8POKZ1F.c9mCqMvPHvgEBnnK"
---

Nalos, the River, carries its children toward company and speech. Persuasive and worldly, at home in field and gathering, they are ill-starred for the martial disciplines and the labours of the maker's hand.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
