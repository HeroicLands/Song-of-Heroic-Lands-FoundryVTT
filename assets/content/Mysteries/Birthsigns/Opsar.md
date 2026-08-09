---
aliases: []
tags: []
name:
    full: Opsar
    aliases: []
description: "A birthsign of the Astrokýklos: the influence conferred by the celestial sign under which a being was born."
id: 7MjeFB12JeEiQEbU
slug: opsar
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: opsar
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Opsar — Earth skills (+10 EML)"
      type: sohleffectdata
      _id: YINrwCF3FpALzduC
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!7MjeFB12JeEiQEbU.YINrwCF3FpALzduC"
    - name: "Opsar — Fire skills (-10 EML)"
      type: sohleffectdata
      _id: 09vqGUn99gnfxwyb
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!7MjeFB12JeEiQEbU.09vqGUn99gnfxwyb"
    - name: "Opsar — Air skills (-10 EML)"
      type: sohleffectdata
      _id: whRsRUPF9k6sUa1R
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!7MjeFB12JeEiQEbU.whRsRUPF9k6sUa1R"
    - name: "Opsar — Water skills (+10 EML)"
      type: sohleffectdata
      _id: t32amYLzB5uIwYOy
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!7MjeFB12JeEiQEbU.t32amYLzB5uIwYOy"
---

Opsar, the Fish, closes the wheel of the year. Its natives are attuned to living things and gifted in speech and society, yet the arts of war and the strength of the body are not the gifts this sign bestows.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
