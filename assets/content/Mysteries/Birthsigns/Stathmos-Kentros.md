---
aliases: []
tags: []
name:
    full: Stathmos-Kentros
    aliases: []
description: "A cusp birthsign of the Astrokýklos: the influence conferred by being born on the threshold between two celestial signs."
id: G6MZNQyN2RIZwVbD
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: stathmoskentros
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Stathmos-Kentros — Earth skills (-10 EML)"
      type: sohleffectdata
      _id: 83BtmKGZUHGjaFMg
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!G6MZNQyN2RIZwVbD.83BtmKGZUHGjaFMg"
    - name: "Stathmos-Kentros — Metal skills (-5 EML)"
      type: sohleffectdata
      _id: 0XYdJtmpf0rk1sht
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!G6MZNQyN2RIZwVbD.0XYdJtmpf0rk1sht"
    - name: "Stathmos-Kentros — Fire skills (+5 EML)"
      type: sohleffectdata
      _id: TT2a97Y1OBN3HOtT
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!G6MZNQyN2RIZwVbD.TT2a97Y1OBN3HOtT"
    - name: "Stathmos-Kentros — Air skills (+15 EML)"
      type: sohleffectdata
      _id: Y2N6JSA5DVYbtx9h
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!G6MZNQyN2RIZwVbD.Y2N6JSA5DVYbtx9h"
    - name: "Stathmos-Kentros — Spirit skills (+10 EML)"
      type: sohleffectdata
      _id: 9VKIkvURIth91zGR
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!G6MZNQyN2RIZwVbD.9VKIkvURIth91zGR"
---

Where Stathmos, the Balance, gives way to Kentros, the Goad, tested flesh turns toward hidden things. Robust and inward-looking, its natives have scant patience for the field, the forge, or the written page.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
