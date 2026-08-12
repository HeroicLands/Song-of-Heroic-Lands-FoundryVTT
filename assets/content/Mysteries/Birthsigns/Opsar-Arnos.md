---
aliases: []
tags: []
name:
    full: Opsar-Arnos
    aliases: []
description: "The cusp of the Fish and the Ram: favours Earth (+15), hinders Air (−10)."
id: nyNbxOjZbuHKEds5
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: opsararnos
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Opsar-Arnos — Earth skills (+15 EML)"
      type: sohleffectdata
      _id: 6ObTkXXETRVPSzOE
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!nyNbxOjZbuHKEds5.6ObTkXXETRVPSzOE"
    - name: "Opsar-Arnos — Metal skills (+5 EML)"
      type: sohleffectdata
      _id: ojN19uu030v4YHao
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!nyNbxOjZbuHKEds5.ojN19uu030v4YHao"
    - name: "Opsar-Arnos — Fire skills (-5 EML)"
      type: sohleffectdata
      _id: UdGoTnZur57OD0SU
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!nyNbxOjZbuHKEds5.UdGoTnZur57OD0SU"
    - name: "Opsar-Arnos — Air skills (-10 EML)"
      type: sohleffectdata
      _id: VAOvoZJmuqV5xrOz
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!nyNbxOjZbuHKEds5.VAOvoZJmuqV5xrOz"
    - name: "Opsar-Arnos — Water skills (+10 EML)"
      type: sohleffectdata
      _id: xrn0uyItkGocpkrW
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!nyNbxOjZbuHKEds5.xrn0uyItkGocpkrW"
---

Where Opsar, the Fish, closes the wheel and Arnos, the Ram, begins it anew, the year turns upon itself. Its natives are deeply attuned to living things and gifted in society, though the arts of war and the strength of the body are not this cusp's gift.

A birthsign is not something a character does. It is fixed at the hour of birth and carried for life — never invoked, never tested, and never spent — and the whole of its effect is a standing adjustment to the [[doc/mstrylvl#effective-mastery-level|Effective Mastery Level]] of the skills its elements claim. A character bears exactly one sign, and like every Mystery it is unavailable while they carry [[doc/arlshck|Aural Shock]].

| Element | Skills it claims          | EML |
| ------- | ------------------------- | --- |
| Earth   | Nature                    | +15 |
| Metal   | Craft, Script             | +5  |
| Fire    | Combat, Combat Techniques | −5  |
| Air     | Physical                  | −10 |
| Spirit  | Lore, Mystical            | —   |
| Water   | Language, Social          | +10 |

Its natives come readiest to **Earth** (the growing field and the wild places) at +15, and hardest to **Air** (feats of balance, stealth, and speed) at −10.

The wheel of signs, and what the six elements of the Astrokýklos each claim, are set out under [[doc/brthsgn|Birthsign]].
