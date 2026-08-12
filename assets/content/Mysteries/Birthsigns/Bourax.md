---
aliases: []
tags: []
name:
    full: Bourax
    aliases: []
description: "The Ox: favours Earth and Metal (+10), hinders Air and Spirit (−10)."
id: vKmINLcD4XwVEtZv
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: bourax
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Bourax — Earth skills (+10 EML)"
      type: sohleffectdata
      _id: 8uGVW2JW0eT6Cjo8
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!vKmINLcD4XwVEtZv.8uGVW2JW0eT6Cjo8"
    - name: "Bourax — Metal skills (+10 EML)"
      type: sohleffectdata
      _id: O3iNkFP3ieV83mlC
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!vKmINLcD4XwVEtZv.O3iNkFP3ieV83mlC"
    - name: "Bourax — Air skills (-10 EML)"
      type: sohleffectdata
      _id: 1ZYAgQd7x9NYH7Fx
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!vKmINLcD4XwVEtZv.1ZYAgQd7x9NYH7Fx"
    - name: "Bourax — Spirit skills (-10 EML)"
      type: sohleffectdata
      _id: aMDsmtsT0OXRDlIc
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!vKmINLcD4XwVEtZv.aMDsmtsT0OXRDlIc"
---

Bourax, the Ox, lends steadiness of hand and patience of mind. Its children take naturally to the growing field, the written word, and the maker's bench, though the deeper mysteries and feats of the body come to them only with labour.

A birthsign is not something a character does. It is fixed at the hour of birth and carried for life — never invoked, never tested, and never spent — and the whole of its effect is a standing adjustment to the [[doc/mstrylvl#effective-mastery-level|Effective Mastery Level]] of the skills its elements claim. A character bears exactly one sign, and like every Mystery it is unavailable while they carry [[doc/arlshck|Aural Shock]].

| Element | Skills it claims          | EML |
| ------- | ------------------------- | --- |
| Earth   | Nature                    | +10 |
| Metal   | Craft, Script             | +10 |
| Fire    | Combat, Combat Techniques | —   |
| Air     | Physical                  | −10 |
| Spirit  | Lore, Mystical            | −10 |
| Water   | Language, Social          | —   |

Its natives come readiest to **Earth** (the growing field and the wild places) and **Metal** (the maker's bench and the written page) at +10, and hardest to **Air** (feats of balance, stealth, and speed) and **Spirit** (old learning and the mysteries) at −10.

The wheel of signs, and what the six elements of the Astrokýklos each claim, are set out under [[doc/brthsgn|Birthsign]].
