---
aliases: []
tags: []
name:
    full: Opsar-Arnos
    aliases: []
description: "A cusp birthsign of the Astrokýklos: the influence conferred by being born on the threshold between two celestial signs."
id: nyNbxOjZbuHKEds5
slug: opsararnos
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: opsararnos
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Opsar-Arnos — Earth skills (+15 EML)"
      type: sohleffectdata
      _id: 6ObTkXXETRVPSzOE
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!nyNbxOjZbuHKEds5.6ObTkXXETRVPSzOE"
    - name: "Opsar-Arnos — Metal skills (+5 EML)"
      type: sohleffectdata
      _id: ojN19uu030v4YHao
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!nyNbxOjZbuHKEds5.ojN19uu030v4YHao"
    - name: "Opsar-Arnos — Fire skills (-5 EML)"
      type: sohleffectdata
      _id: UdGoTnZur57OD0SU
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!nyNbxOjZbuHKEds5.UdGoTnZur57OD0SU"
    - name: "Opsar-Arnos — Air skills (-10 EML)"
      type: sohleffectdata
      _id: VAOvoZJmuqV5xrOz
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!nyNbxOjZbuHKEds5.VAOvoZJmuqV5xrOz"
    - name: "Opsar-Arnos — Water skills (+10 EML)"
      type: sohleffectdata
      _id: xrn0uyItkGocpkrW
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!nyNbxOjZbuHKEds5.xrn0uyItkGocpkrW"
---

Where Opsar, the Fish, closes the wheel and Arnos, the Ram, begins it anew, the year turns upon itself. Its natives are deeply attuned to living things and gifted in society, though the arts of war and the strength of the body are not this cusp's gift.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
