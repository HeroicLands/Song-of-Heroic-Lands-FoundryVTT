---
aliases: []
tags: []
name:
    full: Tragyx
    aliases: []
description: "The Stag: favours Spirit and Water (+10), hinders Metal and Fire (−10)."
id: jq8GiYBpQYyWBMdA
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: tragyx
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Tragyx — Metal skills (-10 EML)"
      type: sohleffectdata
      _id: mI3KB5t082ZwL2s4
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!jq8GiYBpQYyWBMdA.mI3KB5t082ZwL2s4"
    - name: "Tragyx — Fire skills (-10 EML)"
      type: sohleffectdata
      _id: 99xENObcwWcvw1rb
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!jq8GiYBpQYyWBMdA.99xENObcwWcvw1rb"
    - name: "Tragyx — Spirit skills (+10 EML)"
      type: sohleffectdata
      _id: 1SRZsJ17BuZE8AWO
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!jq8GiYBpQYyWBMdA.1SRZsJ17BuZE8AWO"
    - name: "Tragyx — Water skills (+10 EML)"
      type: sohleffectdata
      _id: xjwJVovjP491ScXo
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!jq8GiYBpQYyWBMdA.xjwJVovjP491ScXo"
---

Tragyx, the Stag, gives an eloquent tongue and a searching mind. Born orators, linguists, and adepts of the mysteries, its children have little inclination for the workshop bench or the practice of arms.

A birthsign is not something a character does. It is fixed at the hour of birth and carried for life — never invoked, never tested, and never spent — and the whole of its effect is a standing adjustment to the [[doc/mstrylvl#effective-mastery-level|Effective Mastery Level]] of the skills its elements claim. A character bears exactly one sign, and like every Mystery it is unavailable while they carry [[doc/arlshck|Aural Shock]].

| Element | Skills it claims          | EML |
| ------- | ------------------------- | --- |
| Earth   | Nature                    | —   |
| Metal   | Craft, Script             | −10 |
| Fire    | Combat, Combat Techniques | −10 |
| Air     | Physical                  | —   |
| Spirit  | Lore, Mystical            | +10 |
| Water   | Language, Social          | +10 |

Its natives come readiest to **Spirit** (old learning and the mysteries) and **Water** (tongues, courts, and company) at +10, and hardest to **Metal** (the maker's bench and the written page) and **Fire** (the drill-yard and the clash of arms) at −10.

The wheel of signs, and what the six elements of the Astrokýklos each claim, are set out under [[doc/brthsgn|Birthsign]].
