---
aliases: []
tags: []
name:
    full: Chelyx
    aliases: []
description: "A birthsign of the Astrokýklos: the influence conferred by the celestial sign under which a being was born."
id: bteb60lsodiwjGtL
slug: chelyx
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: chelyx
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
    - name: "Chelyx — Script skills (+10 EML)"
      type: sohleffectdata
      _id: FmiVRENaITHwoAxI
      system:
          scope: skill
          test: 'itemLogic.data.subType === "script"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!bteb60lsodiwjGtL.FmiVRENaITHwoAxI"
    - name: "Chelyx — Craft skills (+10 EML)"
      type: sohleffectdata
      _id: dXbf1zw9GhJOjfSh
      system:
          scope: skill
          test: 'itemLogic.data.subType === "craft"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!bteb60lsodiwjGtL.dXbf1zw9GhJOjfSh"
    - name: "Chelyx — Combat Technique skills (+10 EML)"
      type: sohleffectdata
      _id: 5eVUsKFDaFQ4l7rL
      system:
          scope: skill
          test: 'itemLogic.data.subType === "combattechnique"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!bteb60lsodiwjGtL.5eVUsKFDaFQ4l7rL"
    - name: "Chelyx — Combat skills (+10 EML)"
      type: sohleffectdata
      _id: iaU5GJo2vj3yBCkd
      system:
          scope: skill
          test: 'itemLogic.data.subType === "combat"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!bteb60lsodiwjGtL.iaU5GJo2vj3yBCkd"
    - name: "Chelyx — Mystical skills (-10 EML)"
      type: sohleffectdata
      _id: 2vb9OAIveHq76WK3
      system:
          scope: skill
          test: 'itemLogic.data.subType === "mystical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!bteb60lsodiwjGtL.2vb9OAIveHq76WK3"
    - name: "Chelyx — Lore skills (-10 EML)"
      type: sohleffectdata
      _id: OensThOLjJvKwIps
      system:
          scope: skill
          test: 'itemLogic.data.subType === "lore"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!bteb60lsodiwjGtL.OensThOLjJvKwIps"
    - name: "Chelyx — Language skills (-10 EML)"
      type: sohleffectdata
      _id: JwOsAfa9AE0TWZ3e
      system:
          scope: skill
          test: 'itemLogic.data.subType === "language"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!bteb60lsodiwjGtL.JwOsAfa9AE0TWZ3e"
    - name: "Chelyx — Social skills (-10 EML)"
      type: sohleffectdata
      _id: ldHxBEd4a4HcT9bc
      system:
          scope: skill
          test: 'itemLogic.data.subType === "social"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!bteb60lsodiwjGtL.ldHxBEd4a4HcT9bc"
---

Chelyx, the Tortoise, shields its children with method and craft. They excel in the disciplined arts of the pen, the workshop, and the drill-yard, yet the sign keeps them apart from easy speech and the numinous alike.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
