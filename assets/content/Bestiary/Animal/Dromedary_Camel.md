---
aliases:
    - Dromedary Camel
    - creature-drmdrycm
tags:
    - animal
name:
    full: Dromedary Camel
    aliases: []
description: "A one-humped desert transport animal engineered for the harshest arid wastes, faster than its two-humped cousin but far more nervous and aggressive."
id: pnpVKwADEnFpUPcL
img: icons/game-icons/delapouite/camel-head.svg
portrait: images/being/drmdrycm-portrait.webp
shortcode: drmdrycm
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 28
        end: 14
        agl: 8
        per: 18
        snt: 5
        aur: 4
        wil: 14
        rea: 5
        cre: 6
    attrRollFormula:
        str: 1d6+25
        end: 1d6+11
        agl: 1d4+6
        per: 1d6+15
        snt: 1d4+3
        aur: 1d4+2
        wil: 1d6+11
        rea: 1d4+3
        cre: 1d4+4
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 4
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 8
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 6
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: forelegszone
                  roles: &a1
                      - locomotor
                  canHoldItem: false
                  probWeight: 1
                - name: Right Foreleg
                  shortcode: rforelegpart
                  bodyZoneCode: forelegszone
                  roles: *a1
                  canHoldItem: false
                  probWeight: 1
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Hind Leg
                  shortcode: lhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 9
                - name: Right Hind Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 9
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindqtrzone
                  roles: []
                  canHoldItem: false
                  probWeight: 2
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Flank
                  shortcode: flkloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Quarter
                  shortcode: lqtrloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Quarter
                  shortcode: rqtrloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
        weight:
            base: 1100
            calc: "1100"
        reachBase: 0
        bodyScaleBase: 1.84
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 120
          leaguesPerWatch: 8
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: dunes
                mode: add
                textValue: "0"
              - scope: hydrology
                key: shallow
                mode: add
                textValue: "0"
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 80
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 52
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 27
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 30
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 39
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 42
        - name: Kick
          type: skill
          system:
              shortcode: kick
              subType: combattechnique
              masteryLevelBase: 55
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: kick
                  name: Kick
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 6
                      aspect: blunt
                  lengthBase: 3
                  defense:
                      block:
                          disabled: true
                          modifier: 0
                          successLevelMod: 0
                      counterstrike:
                          disabled: false
                          modifier: 0
                          successLevelMod: 0
                  traits:
                      noBlock: true
        - name: Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 44
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 4
                      modifier: 4
                      aspect: piercing
                  lengthBase: 2
                  defense:
                      block:
                          disabled: true
                          modifier: 0
                          successLevelMod: 0
                      counterstrike:
                          disabled: false
                          modifier: 0
                          successLevelMod: 0
                  traits:
                      noBlock: true
---

# Appearance {#appearance}

The creature regards you with mild disinterest as you approach, one eye open while the other remains nearly closed. Standing taller than a human's head on relatively slender legs, the dromedary carries its single hump like a monument to survival. The sandy coat, weathered and practical, blends so perfectly with surrounding dunes that distance makes the creature seem to materialize from the sand itself. Long eyelashes frame dark eyes, and the distinctive split upper lip twitches occasionally. When the wind shifts, you catch the smell: acrid, warm, faintly unpleasant—the smell of something that survives in a world where most things perish.

# Dossier {#dossier}

The Dromedary Camel is a one-humped ungulate engineered across millennia to thrive in the harshest, most arid environments. Standing six and a half to seven and a half feet tall at the shoulder and weighing nine hundred to fourteen hundred pounds, these creatures are primary transport animals across deserts. Unlike their two-humped cousins, dromedaries are notably more nervous and more aggressive. They are faster, more agile, and less tolerant of difficult conditions. They are found primarily in hot deserts and arid regions where water is scarce. Dromedaries are known to be temperamental—a camel in poor mood can be dangerous, capable of spitting foul-smelling liquid, kicking with impressive force, and biting. Adventurers riding dromedaries benefit from speed, agility, and the ability to survive extended desert travel. Trading caravans rely on dromedaries as their primary transport across vast desert regions.

## Presentation

A long-legged ungulate with a distinctive single hump rising above the shoulders. The head is proportionally long and narrow, with prominent lips (the upper lip notably split), nostrils that close against sandstorms, and long eyelashes protecting eyes from sand. The body is relatively lean except for the hump, which stores fat reserves. The legs are long and slim but surprisingly strong. The feet are two-toed with leathery pads, well-adapted to sand. The tail is thin and typically held close to the body. The coat is typically sandy brown or tan, well-camouflaged in desert environments. The overall impression is of a creature built for speed and endurance in harsh conditions, not for strength or power.

## Key Behaviors

Dromedaries are social herd animals but are more independent-minded than two-humped camels. They are faster and more agile, capable of speed and maneuvering that Bactrian camels cannot match. They are particularly nervous animals, reacting quickly to stimuli and demonstrating clear preferences about handlers and routes. They have notable temperaments—individuals develop personality and can be stubborn or cantankerous. They are capable of traveling extended periods with minimal food and water, though they cannot match Bactrian endurance. They are most active during cool hours (dawn, dusk, and night) and conserve energy during heat.

## Combat Strategy

A dromedary will kick with hind legs when threatened, delivering impressive blows. It will spit foul-smelling liquid capable of discomforting targets. It prefers flight to fight but becomes aggressive when trapped or protecting offspring.

## Attack Methods

### Hind-leg Kick

The dromedary delivers powerful kicks capable of breaking bones. The kick is often used with less force than Bactrians but with greater frequency due to the camel's higher agility.

### Spitting Attack

The dromedary produces a foul-smelling liquid from its stomach and projects it at threats, capable of reaching fifteen feet. The smell is overwhelming and causes nausea and eye irritation.

### Biting

When cornered or protecting young, the dromedary will bite with force that can tear flesh.

## Special Abilities

### Desert Adaptation and Speed

A dromedary can survive in deserts where other large animals perish. It requires minimal water and food compared to other animals its size. It is faster than Bactrian camels and more agile, capable of sustained running at moderate pace for hours.

### Resilience to Heat and Harsh Conditions

Physiology adapted to extreme heat allows the dromedary to function in temperatures that incapacitate humans and other creatures.

### Keen Senses and Navigation

The dromedary can navigate by scent and sound in featureless desert, finding water sources and locations visited in the past. Its senses are adapted to desert conditions where visibility is often limited by haze and dust.

## Attributes

- **Strength:** 26-31 (1d6+25)

- **Endurance:** 12-17 (1d6+11)

- **Agility:** 7-10 (1d4+6)

- **Perception:** 16-21 (1d6+15)

- **Scent:** 4-7 (1d4+3)

- **Aura:** 3-6 (1d4+2)

- **Will:** 12-17 (1d6+11)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 5-8 (1d4+4)
