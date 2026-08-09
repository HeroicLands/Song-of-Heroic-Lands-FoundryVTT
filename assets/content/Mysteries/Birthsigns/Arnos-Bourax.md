---
aliases: []
tags: []
name:
    full: Arnos-Bourax
    aliases: []
description: "A cusp birthsign of the Astrokýklos: the influence conferred by being born on the threshold between two celestial signs."
id: A9WwbSaWae9Fl3EO
slug: arnosbourax
img: systems/sohl/assets/icons/other/astrology.svg
shortcode: arnosbourax
type: mystery
package: sohl
sohl:
    kbcat: birthsign
    archetype: 0
    subType: other
    levelBase: 0
folder: b1rthS1gnFldr001
effects:
    - name: "Arnos-Bourax — Earth skills (+15 EML)"
      type: sohleffectdata
      _id: Fr6QGlJaI4cg8yKW
      system:
          scope: skill
          test: 'itemLogic.data.subType === "nature" || has(itemLogic.data.shortcode, ["earth", "physera"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "15"
            priority: null
      _key: "!items.effects!A9WwbSaWae9Fl3EO.Fr6QGlJaI4cg8yKW"
    - name: "Arnos-Bourax — Metal skills (+10 EML)"
      type: sohleffectdata
      _id: fI9C8SlHFKlZp4lK
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["script", "craft"]) || has(itemLogic.data.shortcode, ["metal", "sideros"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "10"
            priority: null
      _key: "!items.effects!A9WwbSaWae9Fl3EO.fI9C8SlHFKlZp4lK"
    - name: "Arnos-Bourax — Air skills (-10 EML)"
      type: sohleffectdata
      _id: z5hPhBYeUmVZSElf
      system:
          scope: skill
          test: 'itemLogic.data.subType === "physical" || has(itemLogic.data.shortcode, ["air", "zepharis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-10"
            priority: null
      _key: "!items.effects!A9WwbSaWae9Fl3EO.z5hPhBYeUmVZSElf"
    - name: "Arnos-Bourax — Spirit skills (-5 EML)"
      type: sohleffectdata
      _id: M0dAK1GX9npJugvc
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["mystical", "lore"]) || has(itemLogic.data.shortcode, ["spirit", "pneumenos"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "-5"
            priority: null
      _key: "!items.effects!A9WwbSaWae9Fl3EO.M0dAK1GX9npJugvc"
    - name: "Arnos-Bourax — Water skills (+5 EML)"
      type: sohleffectdata
      _id: 3maIJfWRN2Fu2N4e
      system:
          scope: skill
          test: 'has(itemLogic.data.subType, ["language", "social"]) || has(itemLogic.data.shortcode, ["water", "hydalis"])'
      changes:
          - key: "mod:logic.masteryLevel"
            type: add
            value: "5"
            priority: null
      _key: "!items.effects!A9WwbSaWae9Fl3EO.3maIJfWRN2Fu2N4e"
---

Born on the threshold where Arnos, the Ram, gives way to Bourax, the Ox, these natives keep the Ram's green vigour and gain the Ox's patient hand. Field and bench answer them alike, while the breath of the body and the deeper mysteries remain distant.

A birthsign is not a power the character wields but a standing cast of fortune: attach the sign the character was born under, and its Active Effects adjust the Effective Mastery Level of the affected skills.
