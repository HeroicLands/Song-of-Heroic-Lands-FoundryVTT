---
aliases: []
tags: []
name:
    full: Bourax-Diplos
    aliases: []
description: "The cusp of the Ox and the Twins: favours Metal (+15), hinders Spirit (−10)."
id: TIybhdPdOzUOwy1U
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: bouraxdiplos
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Bourax-Diplos — Earth skills (+10 EML)"
      type: sohleffectdata
      _id: Fy031SYPxYCigrLQ
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!TIybhdPdOzUOwy1U.Fy031SYPxYCigrLQ"
    - name: "Bourax-Diplos — Metal skills (+15 EML)"
      type: sohleffectdata
      _id: R0vbiCX9hw2NJ2j6
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!TIybhdPdOzUOwy1U.R0vbiCX9hw2NJ2j6"
    - name: "Bourax-Diplos — Fire skills (+5 EML)"
      type: sohleffectdata
      _id: 2aRTbHUUyaBBapQh
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!TIybhdPdOzUOwy1U.2aRTbHUUyaBBapQh"
    - name: "Bourax-Diplos — Air skills (-5 EML)"
      type: sohleffectdata
      _id: rW0otLJalovApu85
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!TIybhdPdOzUOwy1U.rW0otLJalovApu85"
    - name: "Bourax-Diplos — Spirit skills (-10 EML)"
      type: sohleffectdata
      _id: AH3FgHl3YQMUtFTf
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!TIybhdPdOzUOwy1U.AH3FgHl3YQMUtFTf"
---

Where Bourax, the Ox, yields to Diplos, the Twins, patience is quickened by wit. Its natives are makers and scribes above all, deft at the bench and passable with the blade, but slow to the arcane and the antiquarian.

A birthsign is not something a character does. It is fixed at the hour of birth and carried for life — never invoked, never tested, and never spent — and the whole of its effect is a standing adjustment to the [[doc/mstrylvl#effective-mastery-level|Effective Mastery Level]] of the skills its elements claim. A character bears exactly one sign, and like every Mystery it is unavailable while they carry [[doc/arlshck|Aural Shock]].

| Element | Skills it claims          | EML |
| ------- | ------------------------- | --- |
| Earth   | Nature                    | +10 |
| Metal   | Craft, Script             | +15 |
| Fire    | Combat, Combat Techniques | +5  |
| Air     | Physical                  | −5  |
| Spirit  | Lore, Mystical            | −10 |
| Water   | Language, Social          | —   |

Its natives come readiest to **Metal** (the maker's bench and the written page) at +15, and hardest to **Spirit** (old learning and the mysteries) at −10.

The wheel of signs, and what the six elements of the Astrokýklos each claim, are set out under [[doc/brthsgn|Birthsign]].
