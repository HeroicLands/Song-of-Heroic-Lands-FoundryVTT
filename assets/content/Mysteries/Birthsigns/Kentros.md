---
aliases: []
tags: []
name:
    full: Kentros
    aliases: []
description: "A birthsign of the Astrokýklos: the influence conferred by the celestial sign under which a being was born."
id: pybQNJnDiHWFS0A4
slug: kentros
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: kentros
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
    - name: "Kentros — Nature skills (-10 EML)"
      type: sohleffectdata
      _id: xDVDfGxmldFCRrzc
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!pybQNJnDiHWFS0A4.xDVDfGxmldFCRrzc"
    - name: "Kentros — Script skills (-10 EML)"
      type: sohleffectdata
      _id: XgkaTVDPzRfzlvRB
      system:
          scope: skill
          test: 'itemLogic.data.subType === "script"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!pybQNJnDiHWFS0A4.XgkaTVDPzRfzlvRB"
    - name: "Kentros — Craft skills (-10 EML)"
      type: sohleffectdata
      _id: KUqMwSzfJacBX6xb
      system:
          scope: skill
          test: 'itemLogic.data.subType === "craft"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!pybQNJnDiHWFS0A4.KUqMwSzfJacBX6xb"
    - name: "Kentros — Physical skills (+10 EML)"
      type: sohleffectdata
      _id: wj9CDxsvG3JrxY6G
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!pybQNJnDiHWFS0A4.wj9CDxsvG3JrxY6G"
    - name: "Kentros — Mystical skills (+10 EML)"
      type: sohleffectdata
      _id: mKG8Grok5rbZDtYM
      system:
          scope: skill
          test: 'itemLogic.data.subType === "mystical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!pybQNJnDiHWFS0A4.mKG8Grok5rbZDtYM"
    - name: "Kentros — Lore skills (+10 EML)"
      type: sohleffectdata
      _id: 9rgHqLhuPHDZG9RC
      system:
          scope: skill
          test: 'itemLogic.data.subType === "lore"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!pybQNJnDiHWFS0A4.9rgHqLhuPHDZG9RC"
---

Kentros, the Goad, drives its children inward toward hidden things. Strong of frame and drawn to the mysteries and old learning, they have scant patience for the field, the forge, or the written page.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
