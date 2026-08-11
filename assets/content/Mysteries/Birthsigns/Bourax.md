---
aliases: []
tags: []
name:
    full: Bourax
    aliases: []
description: "A birthsign of the Astrokýklos: the influence conferred by the celestial sign under which a being was born."
id: vKmINLcD4XwVEtZv
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: bourax
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Bourax — Earth skills (+10 EML)"
      type: sohleffectdata
      _id: 8uGVW2JW0eT6Cjo8
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!vKmINLcD4XwVEtZv.8uGVW2JW0eT6Cjo8"
    - name: "Bourax — Metal skills (+10 EML)"
      type: sohleffectdata
      _id: O3iNkFP3ieV83mlC
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!vKmINLcD4XwVEtZv.O3iNkFP3ieV83mlC"
    - name: "Bourax — Air skills (-10 EML)"
      type: sohleffectdata
      _id: 1ZYAgQd7x9NYH7Fx
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!vKmINLcD4XwVEtZv.1ZYAgQd7x9NYH7Fx"
    - name: "Bourax — Spirit skills (-10 EML)"
      type: sohleffectdata
      _id: aMDsmtsT0OXRDlIc
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!vKmINLcD4XwVEtZv.aMDsmtsT0OXRDlIc"
---

Bourax, the Ox, lends steadiness of hand and patience of mind. Its children take naturally to the growing field, the written word, and the maker's bench, though the deeper mysteries and feats of the body come to them only with labour.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
