---
aliases: []
tags: []
name:
    full: Opsar
    aliases: []
description: "The Fish: favours Earth and Water (+10), hinders Fire and Air (−10)."
id: 7MjeFB12JeEiQEbU
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

A birthsign is not something a character does. It is fixed at the hour of birth and carried for life — never invoked, never tested, and never spent — and the whole of its effect is a standing adjustment to the [[doc/mstrylvl#effective-mastery-level|Effective Mastery Level]] of the skills its elements claim. A character bears exactly one sign, and like every Mystery it is unavailable while they carry [[doc/arlshck|Aural Shock]].

| Element | Skills it claims          | EML |
| ------- | ------------------------- | --- |
| Earth   | Nature                    | +10 |
| Metal   | Craft, Script             | —   |
| Fire    | Combat, Combat Techniques | −10 |
| Air     | Physical                  | −10 |
| Spirit  | Lore, Mystical            | —   |
| Water   | Language, Social          | +10 |

Its natives come readiest to **Earth** (the growing field and the wild places) and **Water** (tongues, courts, and company) at +10, and hardest to **Fire** (the drill-yard and the clash of arms) and **Air** (feats of balance, stealth, and speed) at −10.

The wheel of signs, and what the six elements of the Astrokýklos each claim, are set out under [[doc/brthsgn|Birthsign]].
