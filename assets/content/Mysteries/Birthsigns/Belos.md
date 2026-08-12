---
aliases: []
tags: []
name:
    full: Belos
    aliases: []
description: "The Lamp: favours Spirit (+15), hinders Metal (−15)."
id: VDbFbTOOigCx0XOp
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: belos
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Belos — Earth skills (-5 EML)"
      type: sohleffectdata
      _id: 96YoPpo3ZwBYT5zJ
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.96YoPpo3ZwBYT5zJ"
    - name: "Belos — Metal skills (-15 EML)"
      type: sohleffectdata
      _id: p5tRyPCLSZ09dMCV
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-15"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.p5tRyPCLSZ09dMCV"
    - name: "Belos — Fire skills (-5 EML)"
      type: sohleffectdata
      _id: QETfIJYOJeKSAHpk
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.QETfIJYOJeKSAHpk"
    - name: "Belos — Air skills (+5 EML)"
      type: sohleffectdata
      _id: 6bkigfPezD1ksdwN
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.6bkigfPezD1ksdwN"
    - name: "Belos — Spirit skills (+15 EML)"
      type: sohleffectdata
      _id: QYKLL8PdZaSbccLF
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.QYKLL8PdZaSbccLF"
    - name: "Belos — Water skills (+5 EML)"
      type: sohleffectdata
      _id: 3VFzAadFaXZNHxUv
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!VDbFbTOOigCx0XOp.3VFzAadFaXZNHxUv"
---

Belos, the Lamp, is the seer's sign. Its natives incline to the arcane and the antiquarian, keepers of lore and quiet counsel, while the maker's crafts and the disciplines of steel remain foreign to them.

A birthsign is not something a character does. It is fixed at the hour of birth and carried for life — never invoked, never tested, and never spent — and the whole of its effect is a standing adjustment to the [[doc/mstrylvl#effective-mastery-level|Effective Mastery Level]] of the skills its elements claim. A character bears exactly one sign, and like every Mystery it is unavailable while they carry [[doc/arlshck|Aural Shock]].

| Element | Skills it claims          | EML |
| ------- | ------------------------- | --- |
| Earth   | Nature                    | −5  |
| Metal   | Craft, Script             | −15 |
| Fire    | Combat, Combat Techniques | −5  |
| Air     | Physical                  | +5  |
| Spirit  | Lore, Mystical            | +15 |
| Water   | Language, Social          | +5  |

Its natives come readiest to **Spirit** (old learning and the mysteries) at +15, and hardest to **Metal** (the maker's bench and the written page) at −15.

The wheel of signs, and what the six elements of the Astrokýklos each claim, are set out under [[doc/brthsgn|Birthsign]].
