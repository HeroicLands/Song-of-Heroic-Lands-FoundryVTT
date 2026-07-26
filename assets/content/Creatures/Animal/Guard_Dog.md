---
aliases:
    - Guard Dog
tags:
    - animal
name:
    full: Guard Dog
    aliases: []
id: kZduD82aEHFmdLke
slug: guard-dog
img: images/guard-dog-headshot.webp
portrait: images/guard-dog.webp
type: creature
package: thalorna
sohl:
    attributes:
        str: 11
        end: 10
        agl: 13
        per: 17
        snt: 5
        aur: 4
        wil: 14
        rea: 6
        cre: 7
    attrRollFormula:
        str: 1d6+8
        end: 1d6+7
        agl: 1d4+10
        per: 1d6+14
        snt: 1d4+3
        aur: 1d4+2
        wil: 1d6+11
        rea: 1d4+4
        cre: 1d4+5
    body:
        structure:
            parts:
                - name: Head
                  shortcode: headpart
                  zones:
                      - vital
                      - locomotion
                  canHoldItem: false
                  combatArea: 2
                  locations:
                      - name: Head
                        shortcode: headloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 5
                        probWeight: 4
                        protectionBase:
                            blunt: 3
                            edged: 2
                            piercing: 1
                            fire: 3
                      - name: Neck
                        shortcode: neckloc
                        bleedingSusceptibility: high
                        amputability: high
                        shockValue: 5
                        probWeight: 2
                        protectionBase:
                            blunt: 3
                            edged: 2
                            piercing: 1
                            fire: 3
                      - name: Left Foreleg
                        shortcode: lforelegloc
                        bleedingSusceptibility: low
                        amputability: low
                        shockValue: 2
                        probWeight: 2
                        protectionBase:
                            blunt: 6
                            edged: 5
                            piercing: 3
                            fire: 5
                      - name: Right Foreleg
                        shortcode: rforelegloc
                        bleedingSusceptibility: low
                        amputability: low
                        shockValue: 2
                        probWeight: 2
                        protectionBase:
                            blunt: 3
                            edged: 2
                            piercing: 1
                            fire: 3
                - name: Torso
                  shortcode: torsopart
                  zones:
                      - core
                  canHoldItem: false
                  combatArea: 3
                  locations:
                      - name: Thorax
                        shortcode: thoraxloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 5
                        protectionBase:
                            blunt: 3
                            edged: 2
                            piercing: 1
                            fire: 3
                      - name: Abdomen
                        shortcode: abdloc
                        bleedingSusceptibility: high
                        amputability: none
                        shockValue: 4
                        probWeight: 3
                        protectionBase:
                            blunt: 3
                            edged: 2
                            piercing: 1
                            fire: 3
                      - name: Pelvis
                        shortcode: plvsloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 2
                        protectionBase:
                            blunt: 3
                            edged: 2
                            piercing: 1
                            fire: 3
                - name: Left Rear Leg
                  shortcode: lrearlegpart
                  zones:
                      - locomotor
                  canHoldItem: false
                  combatArea: 1
                  locations:
                      - name: Left Hind Leg
                        shortcode: lhindlegloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 2
                        probWeight: 1
                        protectionBase:
                            blunt: 3
                            edged: 2
                            piercing: 1
                            fire: 3
                - name: Right Rear Leg
                  shortcode: rrearlegpart
                  zones:
                      - locomotor
                  canHoldItem: false
                  combatArea: 1
                  locations:
                      - name: Right Hind Leg
                        shortcode: rhindlegloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 2
                        probWeight: 1
                        protectionBase:
                            blunt: 3
                            edged: 2
                            piercing: 1
                            fire: 3
                - name: Tail
                  shortcode: tailpart
                  zones: []
                  canHoldItem: false
                  combatArea: 1
                  locations:
                      - name: Tail
                        shortcode: tailloc
                        bleedingSusceptibility: none
                        amputability: high
                        shockValue: 1
                        probWeight: 1
                        protectionBase:
                            blunt: 3
                            edged: 2
                            piercing: 1
                            fire: 3
            adjacent:
                - - headpart
                  - torsopart
                - - torsopart
                  - rrearlegpart
                - - torsopart
                  - lrearlegpart
                - - rrearlegpart
                  - lrearlegpart
                - - torsopart
                  - tailpart
                - - rrearlegpart
                  - tailpart
                - - lrearlegpart
                  - tailpart
        weight:
            base: 80
            calc: 80
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 120
          leaguesPerWatch: 6
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: mixed_forest
                mode: add
                textValue: "-1"
              - scope: surface_cover
                key: needleleaf_forest
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
              masteryLevelBase: 60
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 27
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 50
---

# Appearance {#appearance}

The dog rises before you fully register its presence, muscles rippling beneath short, dense fur. It is large—easily comparable in weight to a full-grown man—with the build of a creature bred for power and endurance. The eyes are intelligent and focused, fixing on you with absolute certainty of purpose. The growl is not threatening display but simple fact: this creature knows exactly what you are, has assessed you as potential threat, and has decided how it will respond. When the teeth show, they are functional and sharp. The ears are forward, tracking your slightest movement, and the entire body is coiled tension—ready to move in any direction at the instant the command arrives.

# Dossier {#dossier}

Guard Dogs are large canines bred and trained for protection work, combining the loyalty of domestic dogs with the aggression of predators. These are disciplined, intelligent creatures that follow commands from handlers and protect designated charges with unwavering dedication. A guard dog is worth several armed humanoids in defensive capability. Adventurers most commonly encounter them protecting settlements, guarding important persons, or defending valuable locations.

## Presentation

A mature guard dog stands roughly two feet at the shoulder and weighs between one hundred twenty and one hundred eighty pounds. The build is powerfully muscular, with broad shoulders and deep chest. The coat is typically short and dense, in colors ranging from black to brown to mottled. The head is large and powerful, with a broad muzzle and strong jaw. The eyes are intelligent, capable of reading human emotion with uncanny accuracy. The overall impression is of a creature simultaneously noble and dangerous.

## Key Behaviors

Guard dogs are intensely loyal to their handlers and obey commands absolutely, even unto death. They are territorial and aggressive toward perceived threats to their territory or charges. Unlike wild dogs, they are disciplined and do not attack without provocation or command. A well-trained guard dog responds to subtle hand signals and voice commands, moving with precision. They are most active during daylight hours but can work at night if trained.

## Combat Strategy

A guard dog fights with discipline and strategy, not wild aggression. If commanded to attack, the dog lunges with focused purpose, attempting to grapple and immobilize. If defending a charge, the dog positions itself between threat and protected individual. A guard dog fighting for its handler commits fully and shows remarkable reluctance to retreat.

## Attack Methods

### Powerful Bite

The dog's bite is designed to grip and hold—the dog bites a limb or torso and attempts to drag the target down or away from protected charge. The bite is painful and causes serious injury.

### Tackling Charge

The dog uses its weight to knock opponents down—running directly at threats and impacting at waist height or lower, driving targets backward or to the ground.

## Special Abilities

### Protective Loyalty

When defending its handler or designated charge, the guard dog gains significant bonuses to all combat actions. The dog will not retreat if its charge is threatened.

### Command Obedience

The dog responds instantly to voice commands and hand signals from its handler, executing complex maneuvers with precision. This coordination makes the dog-handler pair far more effective than individual components.

## Attributes

- **Strength:** 12-17 (1d6+11)

- **Endurance:** 13-18 (1d6+12)

- **Dexterity:** 10-15 (1d6+9)

- **Agility:** 9-14 (1d6+8)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 8-13 (1d6+7)

- **Will:** 12-17 (1d6+11)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 5-8 (1d4+4)
