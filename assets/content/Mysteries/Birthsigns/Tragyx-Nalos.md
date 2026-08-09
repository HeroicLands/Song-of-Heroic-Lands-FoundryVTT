---
aliases: []
tags: []
name:
    full: Tragyx-Nalos
    aliases: []
description: "A cusp birthsign of the Astrokýklos: the influence conferred by being born on the threshold between two celestial signs."
id: xzAGdmXNTZ4pKN3g
slug: tragyxnalos
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: tragyxnalos
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Tragyx-Nalos — Earth skills (+5 EML)"
      type: sohleffectdata
      _id: UNMDJ9pPUfG3swx4
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!xzAGdmXNTZ4pKN3g.UNMDJ9pPUfG3swx4"
    - name: "Tragyx-Nalos — Metal skills (-5 EML)"
      type: sohleffectdata
      _id: 40mBoJti9yuO2703
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!xzAGdmXNTZ4pKN3g.40mBoJti9yuO2703"
    - name: "Tragyx-Nalos — Fire skills (-10 EML)"
      type: sohleffectdata
      _id: fyYz78RXPuKHxzxI
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!xzAGdmXNTZ4pKN3g.fyYz78RXPuKHxzxI"
    - name: "Tragyx-Nalos — Spirit skills (+10 EML)"
      type: sohleffectdata
      _id: 511ttvj5TgDOSsjo
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!xzAGdmXNTZ4pKN3g.511ttvj5TgDOSsjo"
    - name: "Tragyx-Nalos — Water skills (+15 EML)"
      type: sohleffectdata
      _id: lvOb5GqHND7aLfDa
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!xzAGdmXNTZ4pKN3g.lvOb5GqHND7aLfDa"
---

Between Tragyx, the Stag, and Nalos, the River, eloquence runs toward company. Orators, linguists, and adepts of the mysteries, at home in any gathering, its natives are ill-starred for steel and the forge.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
