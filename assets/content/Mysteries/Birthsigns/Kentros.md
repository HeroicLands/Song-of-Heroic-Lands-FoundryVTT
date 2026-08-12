---
aliases: []
tags: []
name:
    full: Kentros
    aliases: []
description: "The Goad: favours Air and Spirit (+10), hinders Earth and Metal (−10)."
id: pybQNJnDiHWFS0A4
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: kentros
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Kentros — Earth skills (-10 EML)"
      type: sohleffectdata
      _id: xDVDfGxmldFCRrzc
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!pybQNJnDiHWFS0A4.xDVDfGxmldFCRrzc"
    - name: "Kentros — Metal skills (-10 EML)"
      type: sohleffectdata
      _id: XgkaTVDPzRfzlvRB
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!pybQNJnDiHWFS0A4.XgkaTVDPzRfzlvRB"
    - name: "Kentros — Air skills (+10 EML)"
      type: sohleffectdata
      _id: KUqMwSzfJacBX6xb
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!pybQNJnDiHWFS0A4.KUqMwSzfJacBX6xb"
    - name: "Kentros — Spirit skills (+10 EML)"
      type: sohleffectdata
      _id: wj9CDxsvG3JrxY6G
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!pybQNJnDiHWFS0A4.wj9CDxsvG3JrxY6G"
---

Kentros, the Goad, drives its children inward toward hidden things. Strong of frame and drawn to the mysteries and old learning, they have scant patience for the field, the forge, or the written page.

A birthsign is not something a character does. It is fixed at the hour of birth and carried for life — never invoked, never tested, and never spent — and the whole of its effect is a standing adjustment to the [[doc/mstrylvl#effective-mastery-level|Effective Mastery Level]] of the skills its elements claim. A character bears exactly one sign, and like every Mystery it is unavailable while they carry [[doc/arlshck|Aural Shock]].

| Element | Skills it claims          | EML |
| ------- | ------------------------- | --- |
| Earth   | Nature                    | −10 |
| Metal   | Craft, Script             | −10 |
| Fire    | Combat, Combat Techniques | —   |
| Air     | Physical                  | +10 |
| Spirit  | Lore, Mystical            | +10 |
| Water   | Language, Social          | —   |

Its natives come readiest to **Air** (feats of balance, stealth, and speed) and **Spirit** (old learning and the mysteries) at +10, and hardest to **Earth** (the growing field and the wild places) and **Metal** (the maker's bench and the written page) at −10.

The wheel of signs, and what the six elements of the Astrokýklos each claim, are set out under [[doc/brthsgn|Birthsign]].
