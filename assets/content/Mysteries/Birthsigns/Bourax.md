---
aliases: []
tags: []
name:
    full: Bourax
    aliases: []
description: "A birthsign of the Astrokýklos: the influence conferred by the celestial sign under which a being was born."
id: vKmINLcD4XwVEtZv
slug: bourax
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: bourax
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
    - name: "Bourax — Nature skills (+10 EML)"
      type: sohleffectdata
      _id: 8uGVW2JW0eT6Cjo8
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!vKmINLcD4XwVEtZv.8uGVW2JW0eT6Cjo8"
    - name: "Bourax — Script skills (+10 EML)"
      type: sohleffectdata
      _id: O3iNkFP3ieV83mlC
      system:
          scope: skill
          test: 'itemLogic.data.subType === "script"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!vKmINLcD4XwVEtZv.O3iNkFP3ieV83mlC"
    - name: "Bourax — Craft skills (+10 EML)"
      type: sohleffectdata
      _id: 1ZYAgQd7x9NYH7Fx
      system:
          scope: skill
          test: 'itemLogic.data.subType === "craft"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!vKmINLcD4XwVEtZv.1ZYAgQd7x9NYH7Fx"
    - name: "Bourax — Physical skills (-10 EML)"
      type: sohleffectdata
      _id: aMDsmtsT0OXRDlIc
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!vKmINLcD4XwVEtZv.aMDsmtsT0OXRDlIc"
    - name: "Bourax — Mystical skills (-10 EML)"
      type: sohleffectdata
      _id: 3AmCESfTrYtzD0By
      system:
          scope: skill
          test: 'itemLogic.data.subType === "mystical"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!vKmINLcD4XwVEtZv.3AmCESfTrYtzD0By"
    - name: "Bourax — Lore skills (-10 EML)"
      type: sohleffectdata
      _id: LRk4cMimt1iQgWNz
      system:
          scope: skill
          test: 'itemLogic.data.subType === "lore"'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!vKmINLcD4XwVEtZv.LRk4cMimt1iQgWNz"
---

Bourax, the Ox, lends steadiness of hand and patience of mind. Its children take naturally to the growing field, the written word, and the maker's bench, though the deeper mysteries and feats of the body come to them only with labour.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
