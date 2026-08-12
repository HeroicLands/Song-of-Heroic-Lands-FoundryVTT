---
aliases: []
tags: []
name:
    full: Nalos
    aliases: []
description: "The River: favours Water (+15), hinders Fire (−15)."
id: rqZ2w3pVH8POKZ1F
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: nalos
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Nalos — Earth skills (+5 EML)"
      type: sohleffectdata
      _id: wxSkntNDUhgrj7Bf
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!rqZ2w3pVH8POKZ1F.wxSkntNDUhgrj7Bf"
    - name: "Nalos — Metal skills (-5 EML)"
      type: sohleffectdata
      _id: AuYPcPDSUTujgRvB
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!rqZ2w3pVH8POKZ1F.AuYPcPDSUTujgRvB"
    - name: "Nalos — Fire skills (-15 EML)"
      type: sohleffectdata
      _id: jxuJpAD8mC6UeR9y
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-15"
            priority: null
      _key: "!items.effects!rqZ2w3pVH8POKZ1F.jxuJpAD8mC6UeR9y"
    - name: "Nalos — Air skills (-5 EML)"
      type: sohleffectdata
      _id: QYqkZDFdXBtfU4FO
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!rqZ2w3pVH8POKZ1F.QYqkZDFdXBtfU4FO"
    - name: "Nalos — Spirit skills (+5 EML)"
      type: sohleffectdata
      _id: Pwlxi1f8PMlFSEGz
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!rqZ2w3pVH8POKZ1F.Pwlxi1f8PMlFSEGz"
    - name: "Nalos — Water skills (+15 EML)"
      type: sohleffectdata
      _id: 7SSWQau5gRNyx3ja
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!rqZ2w3pVH8POKZ1F.7SSWQau5gRNyx3ja"
---

Nalos, the River, carries its children toward company and speech. Persuasive and worldly, at home in field and gathering, they are ill-starred for the martial disciplines and the labours of the maker's hand.

A birthsign is not something a character does. It is fixed at the hour of birth and carried for life — never invoked, never tested, and never spent — and the whole of its effect is a standing adjustment to the [[doc/mstrylvl#effective-mastery-level|Effective Mastery Level]] of the skills its elements claim. A character bears exactly one sign, and like every Mystery it is unavailable while they carry [[doc/arlshck|Aural Shock]].

| Element | Skills it claims          | EML |
| ------- | ------------------------- | --- |
| Earth   | Nature                    | +5  |
| Metal   | Craft, Script             | −5  |
| Fire    | Combat, Combat Techniques | −15 |
| Air     | Physical                  | −5  |
| Spirit  | Lore, Mystical            | +5  |
| Water   | Language, Social          | +15 |

Its natives come readiest to **Water** (tongues, courts, and company) at +15, and hardest to **Fire** (the drill-yard and the clash of arms) at −15.

The wheel of signs, and what the six elements of the Astrokýklos each claim, are set out under [[doc/brthsgn|Birthsign]].
