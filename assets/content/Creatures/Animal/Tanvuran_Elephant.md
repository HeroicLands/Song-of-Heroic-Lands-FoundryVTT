---
aliases:
    - Tānvüran Elephant
    - Tanvuran Elephant
tags:
    - animal
name:
    full: Tānvüran Elephant
    aliases: []
id: hKF5XSPgvAUIQtLc
slug: tanvuran-elephant
img: icons/game-icons/delapouite/elephant.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 56
        end: 48
        agl: 7
        per: 18
        snt: 7
        aur: 6
        wil: 16
        rea: 8
        cre: 8
    attrRollFormula:
        str: 1d6+53
        end: 1d6+45
        agl: 1d4+5
        per: 1d6+15
        snt: 1d4+5
        aur: 1d4+4
        wil: 1d6+13
        rea: 1d4+6
        cre: 1d4+6
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 7
                - name: Trunk
                  shortcode: trunkzone
                  probWeight: 3
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 6
                - name: Torso
                  shortcode: torsozone
                  probWeight: 18
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
                - name: Trunk
                  shortcode: trunkpart
                  bodyZoneCode: trunkzone
                  roles:
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: forelegszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 1
                - name: Right Foreleg
                  shortcode: rforelegpart
                  bodyZoneCode: forelegszone
                  roles:
                      - locomotor
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
                  probWeight: 6
                  protectionBase:
                      blunt: 18
                      edged: 17
                      piercing: 15
                      fire: 17
                - name: Left Ear
                  shortcode: learloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 1
                  protectionBase:
                      blunt: 18
                      edged: 17
                      piercing: 15
                      fire: 17
                - name: Right Ear
                  shortcode: rearloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 1
                  protectionBase:
                      blunt: 18
                      edged: 17
                      piercing: 15
                      fire: 17
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 2
                  protectionBase:
                      blunt: 18
                      edged: 17
                      piercing: 15
                      fire: 17
                - name: Trunk
                  shortcode: trunkloc
                  bodyPartCode: trunkpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 18
                      edged: 17
                      piercing: 15
                      fire: 17
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 18
                      edged: 17
                      piercing: 15
                      fire: 17
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 18
                      edged: 17
                      piercing: 15
                      fire: 17
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 18
                      edged: 17
                      piercing: 15
                      fire: 17
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 18
                      edged: 17
                      piercing: 15
                      fire: 17
                - name: Left Quarter
                  shortcode: lqtrloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 18
                      edged: 17
                      piercing: 15
                      fire: 17
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 18
                      edged: 17
                      piercing: 15
                      fire: 17
                - name: Right Quarter
                  shortcode: rqtrloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 18
                      edged: 17
                      piercing: 15
                      fire: 17
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 18
                      edged: 17
                      piercing: 15
                      fire: 17
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 18
                      edged: 17
                      piercing: 15
                      fire: 17
        weight:
            base: 10000
            calc: "10000"
        reachBase: 0
        bodyScaleBase: 5.09
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 90
          leaguesPerWatch: 6
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 85
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 33
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 36
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 90
        - name: Tusk
          type: skill
          system:
              shortcode: tusk
              subType: combattechnique
              masteryLevelBase: 55
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: tusk
                  name: Tusk
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 12
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 23
                      aspect: piercing
                  lengthBase: 6
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
                      armorReduction: 2
        - name: Kick
          type: skill
          system:
              shortcode: kick
              subType: combattechnique
              masteryLevelBase: 44
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
                      spread: 24
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 20
                      aspect: blunt
                  lengthBase: 5
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

An impossible vastness approaches, and you understand that you're looking at sheer physical power given form. The elephant moves with surprising grace for its size, its massive gray form calmed and purposeful. The domed head gives it a regal appearance, and the trunk curves and flexes with obvious intelligence and control. The tusks, if present on males, are less prominent than you might expect, but the trunk itself is clearly sufficient weapon for any task. The eyes are surprisingly intelligent and aware, suggesting genuine cognition behind the size.

# Dossier {#dossier}

The Tānvüran Elephant is a massive megafauna creature standing 8-10 feet at the shoulder and weighing up to 6-7 tons, found in grasslands, forests, and savanna regions across the Tānvür empire and surrounding lands. These highly intelligent creatures are frequently domesticated for labor, transportation, and ceremonial use, but wild populations remain formidable. Adventurers encounter them primarily as companions to civilized peoples or while traveling through wild elephant territory.

## Presentation

The tānvüran elephant is smaller and more refined than its Xerathian cousin, with a distinctly domed forehead and proportionally smaller ears. The skin is thick and gray, with wrinkled texture. Males may possess tusks but they are less prominent than Xerathian specimens. The trunk is extraordinarily dexterous and powerful. The legs are thick and columnar, adapted for supporting massive weight. The eyes are proportionally large and expressive, indicating genuine intelligence.

## Key Behaviors

Tānvüran elephants are highly social and intelligent, forming close bonds within herds and demonstrating genuine mourning when members die. They are frequently domesticated and capable of learning complex tasks and commands. Wild herds are protective of young and will defend aggressively against threats.

## Combat Strategy

An elephant charges directly at threats using its massive body and tusks to gore and batter. The trunk can grapple and throw opponents. Elephants defending young or herds become nearly unstoppable.

## Attack Methods

### Charging Impact

The elephant charges with all its weight behind it, attempting to gore with tusks or simply trample opponents.

### Trunk Grab and Throw

The trunk seizes opponents and can lift and throw them with tremendous force.

### Crushing Stomp

The elephant's feet can crush targets, inflicting devastating injury.

## Special Abilities

### Incredible Strength

The elephant possesses strength far exceeding most land creatures.

### Intelligent Manipulation

The trunk can be used to manipulate environment and objects with surprising precision.

### Herd Coordination

Elephants coordinate defensive actions through vocalizations and body language.

### Additional Information

Tānvüran elephants are domesticated and reliable when properly trained and treated well. Wild elephants defending young are nearly unstoppable. The creature's tusks (when present) can be harvested and are valuable for crafting and decoration.

## Attributes

- **Strength:** 54-59 (1d6+53)

- **Endurance:** 46-51 (1d6+45)

- **Agility:** 6-9 (1d4+5)

- **Perception:** 16-21 (1d6+15)

- **Scent:** 6-9 (1d4+5)

- **Aura:** 5-8 (1d4+4)

- **Will:** 14-19 (1d6+13)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 7-10 (1d4+6)
