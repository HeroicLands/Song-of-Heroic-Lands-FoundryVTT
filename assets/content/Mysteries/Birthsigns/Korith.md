---
aliases: []
tags: []
name:
    full: Korith
    aliases: []
description: "The Helm: favours Fire and Air (+10), hinders Earth and Water (−10)."
id: R6kUskyAmO8AmYuz
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: korith
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Korith — Earth skills (-10 EML)"
      type: sohleffectdata
      _id: NFIDMOs9O1Cb8DrG
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!R6kUskyAmO8AmYuz.NFIDMOs9O1Cb8DrG"
    - name: "Korith — Fire skills (+10 EML)"
      type: sohleffectdata
      _id: VzAxfm9MhDrQVdvN
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["combattechnique", "combat"]) || has(itemLogic.data.shortcode, ["fire", "pyrethos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!R6kUskyAmO8AmYuz.VzAxfm9MhDrQVdvN"
    - name: "Korith — Air skills (+10 EML)"
      type: sohleffectdata
      _id: TDTDnF1gzzEGTwry
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!R6kUskyAmO8AmYuz.TDTDnF1gzzEGTwry"
    - name: "Korith — Water skills (-10 EML)"
      type: sohleffectdata
      _id: UnziEQnkHBWCBYFF
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!R6kUskyAmO8AmYuz.UnziEQnkHBWCBYFF"
---

Korith, the Helm, tempers its children for endurance and the clash of arms. Strong in body and steady under the strike, they nonetheless find the lore of nature and the graces of speech slow to answer their call.

A birthsign is not something a character does. It is fixed at the hour of birth and carried for life — never invoked, never tested, and never spent — and the whole of its effect is a standing adjustment to the [[doc/mstrylvl#effective-mastery-level|Effective Mastery Level]] of the skills its elements claim. A character bears exactly one sign, and like every Mystery it is unavailable while they carry [[doc/arlshck|Aural Shock]].

| Element | Skills it claims          | EML |
| ------- | ------------------------- | --- |
| Earth   | Nature                    | −10 |
| Metal   | Craft, Script             | —   |
| Fire    | Combat, Combat Techniques | +10 |
| Air     | Physical                  | +10 |
| Spirit  | Lore, Mystical            | —   |
| Water   | Language, Social          | −10 |

Its natives come readiest to **Fire** (the drill-yard and the clash of arms) and **Air** (feats of balance, stealth, and speed) at +10, and hardest to **Earth** (the growing field and the wild places) and **Water** (tongues, courts, and company) at −10.

The wheel of signs, and what the six elements of the Astrokýklos each claim, are set out under [[doc/brthsgn|Birthsign]].
