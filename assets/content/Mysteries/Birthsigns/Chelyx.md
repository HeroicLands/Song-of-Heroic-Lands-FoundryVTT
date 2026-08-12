---
aliases: []
tags: []
name:
    full: Chelyx
    aliases: []
description: "The Tortoise: favours Metal and Fire (+10), hinders Spirit and Water (−10)."
id: bteb60lsodiwjGtL
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: chelyx
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Chelyx — Metal skills (+10 EML)"
      type: sohleffectdata
      _id: FmiVRENaITHwoAxI
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!bteb60lsodiwjGtL.FmiVRENaITHwoAxI"
    - name: "Chelyx — Fire skills (+10 EML)"
      type: sohleffectdata
      _id: dXbf1zw9GhJOjfSh
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!bteb60lsodiwjGtL.dXbf1zw9GhJOjfSh"
    - name: "Chelyx — Spirit skills (-10 EML)"
      type: sohleffectdata
      _id: 5eVUsKFDaFQ4l7rL
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!bteb60lsodiwjGtL.5eVUsKFDaFQ4l7rL"
    - name: "Chelyx — Water skills (-10 EML)"
      type: sohleffectdata
      _id: iaU5GJo2vj3yBCkd
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!bteb60lsodiwjGtL.iaU5GJo2vj3yBCkd"
---

Chelyx, the Tortoise, shields its children with method and craft. They excel in the disciplined arts of the pen, the workshop, and the drill-yard, yet the sign keeps them apart from easy speech and the numinous alike.

A birthsign is not something a character does. It is fixed at the hour of birth and carried for life — never invoked, never tested, and never spent — and the whole of its effect is a standing adjustment to the [[doc/mstrylvl#effective-mastery-level|Effective Mastery Level]] of the skills its elements claim. A character bears exactly one sign, and like every Mystery it is unavailable while they carry [[doc/arlshck|Aural Shock]].

| Element | Skills it claims          | EML |
| ------- | ------------------------- | --- |
| Earth   | Nature                    | —   |
| Metal   | Craft, Script             | +10 |
| Fire    | Combat, Combat Techniques | +10 |
| Air     | Physical                  | —   |
| Spirit  | Lore, Mystical            | −10 |
| Water   | Language, Social          | −10 |

Its natives come readiest to **Metal** (the maker's bench and the written page) and **Fire** (the drill-yard and the clash of arms) at +10, and hardest to **Spirit** (old learning and the mysteries) and **Water** (tongues, courts, and company) at −10.

The wheel of signs, and what the six elements of the Astrokýklos each claim, are set out under [[doc/brthsgn|Birthsign]].
