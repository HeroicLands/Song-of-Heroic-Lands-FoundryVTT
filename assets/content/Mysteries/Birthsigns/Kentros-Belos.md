---
aliases: []
tags: []
name:
    full: Kentros-Belos
    aliases: []
description: "The cusp of the Goad and the Lamp: favours Spirit (+15), hinders Metal (−10)."
id: m4heSsik8iKuIreP
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: kentrosbelos
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Kentros-Belos — Earth skills (-5 EML)"
      type: sohleffectdata
      _id: zbmVvfrKDJDCDtpZ
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!m4heSsik8iKuIreP.zbmVvfrKDJDCDtpZ"
    - name: "Kentros-Belos — Metal skills (-10 EML)"
      type: sohleffectdata
      _id: NslJrtCVw635C0aD
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!m4heSsik8iKuIreP.NslJrtCVw635C0aD"
    - name: "Kentros-Belos — Air skills (+10 EML)"
      type: sohleffectdata
      _id: U15zhVrt1Rq3KQZH
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!m4heSsik8iKuIreP.U15zhVrt1Rq3KQZH"
    - name: "Kentros-Belos — Spirit skills (+15 EML)"
      type: sohleffectdata
      _id: Sb0zJiM3gge4d7Qe
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!m4heSsik8iKuIreP.Sb0zJiM3gge4d7Qe"
    - name: "Kentros-Belos — Water skills (+5 EML)"
      type: sohleffectdata
      _id: t17MxQiYkoL9yYkE
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!m4heSsik8iKuIreP.t17MxQiYkoL9yYkE"
---

On the cusp of Kentros, the Goad, and Belos, the Lamp, the drive inward becomes sight. Strong of frame and steeped in lore and quiet counsel, its natives leave the maker's crafts to other hands.

A birthsign is not something a character does. It is fixed at the hour of birth and carried for life — never invoked, never tested, and never spent — and the whole of its effect is a standing adjustment to the [[doc/mstrylvl#effective-mastery-level|Effective Mastery Level]] of the skills its elements claim. A character bears exactly one sign, and like every Mystery it is unavailable while they carry [[doc/arlshck|Aural Shock]].

| Element | Skills it claims          | EML |
| ------- | ------------------------- | --- |
| Earth   | Nature                    | −5  |
| Metal   | Craft, Script             | −10 |
| Fire    | Combat, Combat Techniques | —   |
| Air     | Physical                  | +10 |
| Spirit  | Lore, Mystical            | +15 |
| Water   | Language, Social          | +5  |

Its natives come readiest to **Spirit** (old learning and the mysteries) at +15, and hardest to **Metal** (the maker's bench and the written page) at −10.

The wheel of signs, and what the six elements of the Astrokýklos each claim, are set out under [[doc/brthsgn|Birthsign]].
