---
aliases: []
tags: []
name:
    full: Tragyx-Nalos
    aliases: []
description: "The cusp of the Stag and the River: favours Water (+15), hinders Fire (−10)."
id: xzAGdmXNTZ4pKN3g
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

A birthsign is not something a character does. It is fixed at the hour of birth and carried for life — never invoked, never tested, and never spent — and the whole of its effect is a standing adjustment to the [[doc/mstrylvl#effective-mastery-level|Effective Mastery Level]] of the skills its elements claim. A character bears exactly one sign, and like every Mystery it is unavailable while they carry [[doc/arlshck|Aural Shock]].

| Element | Skills it claims          | EML |
| ------- | ------------------------- | --- |
| Earth   | Nature                    | +5  |
| Metal   | Craft, Script             | −5  |
| Fire    | Combat, Combat Techniques | −10 |
| Air     | Physical                  | —   |
| Spirit  | Lore, Mystical            | +10 |
| Water   | Language, Social          | +15 |

Its natives come readiest to **Water** (tongues, courts, and company) at +15, and hardest to **Fire** (the drill-yard and the clash of arms) at −10.

The wheel of signs, and what the six elements of the Astrokýklos each claim, are set out under [[doc/brthsgn|Birthsign]].
