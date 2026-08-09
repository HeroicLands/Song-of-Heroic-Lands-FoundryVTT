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
folder: b1rthS1gnFldr001
effects:
    - name: "Chelyx — Metal skills (+10 EML)"
      type: sohleffectdata
      _id: FmiVRENaITHwoAxI
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!bteb60lsodiwjGtL.FmiVRENaITHwoAxI"
    - name: "Chelyx — Fire skills (+10 EML)"
      type: sohleffectdata
      _id: dXbf1zw9GhJOjfSh
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!bteb60lsodiwjGtL.dXbf1zw9GhJOjfSh"
    - name: "Chelyx — Spirit skills (-10 EML)"
      type: sohleffectdata
      _id: 5eVUsKFDaFQ4l7rL
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!bteb60lsodiwjGtL.5eVUsKFDaFQ4l7rL"
    - name: "Chelyx — Water skills (-10 EML)"
      type: sohleffectdata
      _id: iaU5GJo2vj3yBCkd
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!bteb60lsodiwjGtL.iaU5GJo2vj3yBCkd"
---

Chelyx, the Tortoise, shields its children with method and craft. They excel in the disciplined arts of the pen, the workshop, and the drill-yard, yet the sign keeps them apart from easy speech and the numinous alike.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
