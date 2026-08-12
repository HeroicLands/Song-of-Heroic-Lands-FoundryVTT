---
aliases: []
tags: []
name:
    full: Korith-Stathmos
    aliases: []
description: "The cusp of the Helm and the Balance: favours Air (+15), hinders Earth (−10)."
id: MgJQ2lCs1syUg2Mo
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: korithstathmos
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Korith-Stathmos — Earth skills (-10 EML)"
      type: sohleffectdata
      _id: 9nNOV9jTGRjFWyKV
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!MgJQ2lCs1syUg2Mo.9nNOV9jTGRjFWyKV"
    - name: "Korith-Stathmos — Fire skills (+10 EML)"
      type: sohleffectdata
      _id: nalkf4iGr6z6HdYj
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!MgJQ2lCs1syUg2Mo.nalkf4iGr6z6HdYj"
    - name: "Korith-Stathmos — Air skills (+15 EML)"
      type: sohleffectdata
      _id: P3Z8Mh3HMxSABCLm
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!MgJQ2lCs1syUg2Mo.P3Z8Mh3HMxSABCLm"
    - name: "Korith-Stathmos — Spirit skills (+5 EML)"
      type: sohleffectdata
      _id: sq883vhDMeebyJC7
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!MgJQ2lCs1syUg2Mo.sq883vhDMeebyJC7"
    - name: "Korith-Stathmos — Water skills (-5 EML)"
      type: sohleffectdata
      _id: idxHUG3t58D5NmeV
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!MgJQ2lCs1syUg2Mo.idxHUG3t58D5NmeV"
---

Between Korith, the Helm, and Stathmos, the Balance, the body is tempered above all else. Its natives are enduring and apt at arms, drawn a little toward the mystic middle path, but the wilds yield to them grudgingly.

A birthsign is not something a character does. It is fixed at the hour of birth and carried for life — never invoked, never tested, and never spent — and the whole of its effect is a standing adjustment to the [[doc/mstrylvl#effective-mastery-level|Effective Mastery Level]] of the skills its elements claim. A character bears exactly one sign, and like every Mystery it is unavailable while they carry [[doc/arlshck|Aural Shock]].

| Element | Skills it claims          | EML |
| ------- | ------------------------- | --- |
| Earth   | Nature                    | −10 |
| Metal   | Craft, Script             | —   |
| Fire    | Combat, Combat Techniques | +10 |
| Air     | Physical                  | +15 |
| Spirit  | Lore, Mystical            | +5  |
| Water   | Language, Social          | −5  |

Its natives come readiest to **Air** (feats of balance, stealth, and speed) at +15, and hardest to **Earth** (the growing field and the wild places) at −10.

The wheel of signs, and what the six elements of the Astrokýklos each claim, are set out under [[doc/brthsgn|Birthsign]].
