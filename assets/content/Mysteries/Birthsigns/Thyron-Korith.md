---
aliases: []
tags: []
name:
    full: Thyron-Korith
    aliases: []
description: "The cusp of the Gate and the Helm: favours Fire (+15), hinders Water (−10)."
id: 9tQtPyruod0egsYz
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: thyronkorith
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Thyron-Korith — Earth skills (-5 EML)"
      type: sohleffectdata
      _id: Zj4YarR7RMSXpQS3
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!9tQtPyruod0egsYz.Zj4YarR7RMSXpQS3"
    - name: "Thyron-Korith — Metal skills (+5 EML)"
      type: sohleffectdata
      _id: AM0fjlTiw50D7tkg
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!9tQtPyruod0egsYz.AM0fjlTiw50D7tkg"
    - name: "Thyron-Korith — Fire skills (+15 EML)"
      type: sohleffectdata
      _id: O90RtMZJAWiwKZc4
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!9tQtPyruod0egsYz.O90RtMZJAWiwKZc4"
    - name: "Thyron-Korith — Air skills (+10 EML)"
      type: sohleffectdata
      _id: J6k4SKI8BPrugql9
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!9tQtPyruod0egsYz.J6k4SKI8BPrugql9"
    - name: "Thyron-Korith — Water skills (-10 EML)"
      type: sohleffectdata
      _id: W9E3KhQcnYh9R8yr
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!9tQtPyruod0egsYz.W9E3KhQcnYh9R8yr"
---

Passing from Thyron, the Gate, to Korith, the Helm, the warrior's star hardens into endurance. Born to the blade and strong of body, its natives find speech and the lore of wild places slow to answer their call.

A birthsign is not something a character does. It is fixed at the hour of birth and carried for life — never invoked, never tested, and never spent — and the whole of its effect is a standing adjustment to the [[doc/mstrylvl#effective-mastery-level|Effective Mastery Level]] of the skills its elements claim. A character bears exactly one sign, and like every Mystery it is unavailable while they carry [[doc/arlshck|Aural Shock]].

| Element | Skills it claims          | EML |
| ------- | ------------------------- | --- |
| Earth   | Nature                    | −5  |
| Metal   | Craft, Script             | +5  |
| Fire    | Combat, Combat Techniques | +15 |
| Air     | Physical                  | +10 |
| Spirit  | Lore, Mystical            | —   |
| Water   | Language, Social          | −10 |

Its natives come readiest to **Fire** (the drill-yard and the clash of arms) at +15, and hardest to **Water** (tongues, courts, and company) at −10.

The wheel of signs, and what the six elements of the Astrokýklos each claim, are set out under [[doc/brthsgn|Birthsign]].
