---
aliases:
    - Woolly Rhino
    - creature-wllyrhn
tags:
    - animal
name:
    full: Woolly Rhino
    aliases: []
description: "A massive shaggy grazer of frozen tundra and cold steppe, peaceful yet fiercely territorial and devastating when defending its range."
id: vxgCrkIE0FSMA3Ty
img: icons/game-icons/delapouite/rhinoceros-horn.svg
portrait: images/being/wllyrhn-portrait.webp
shortcode: wllyrhn
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 17
        end: 16
        dex: 10
        agl: 9
        per: 11
        aur: 9
        wil: 13
        rea: 6
        cre: 5
    attrRollFormula:
        str: 1d6+13
        end: 1d6+12
        dex: 1d4+7
        agl: 1d4+6
        per: 1d6+7
        aur: 1d4+6
        wil: 1d6+9
        rea: 1d4+3
        cre: 1d4+2
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 8
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 4
                - name: Torso
                  shortcode: torsozone
                  probWeight: 16
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 12
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
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Flank
                  shortcode: flkloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Left Quarter
                  shortcode: lqtrloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Right Quarter
                  shortcode: rqtrloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
        weight:
            base: 4000
            calc: "4000"
        reachBase: 0
        bodyScaleBase: 1.33
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 70
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 55
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 33
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 40
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 40
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 43
        - name: Horn Charge
          type: skill
          system:
              shortcode: gore
              subType: combattechnique
              masteryLevelBase: 55
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: gore
                  name: Horn Charge
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 4
                      aspect: piercing
                  lengthBase: 4
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
        - name: Trampling Stomp
          type: skill
          system:
              shortcode: kick
              subType: combattechnique
              masteryLevelBase: 48
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: kick
                  name: Trampling Stomp
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 16
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 1
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

Shaggy fur hangs in matted clumps, shifting as the massive creature moves with deceptive grace across difficult terrain. The horn is dark and rough, curving forward slightly, clearly scarred and aged from countless uses. Each exhalation produces mist in the cold air. The broad shoulders and sturdy build speak to a creature built for surviving frozen wastelands, a behemoth of patience and territorial resolve.

# Dossier {#dossier}

The Woolly Rhino is a massive grazer standing 6-7 feet at the shoulder and reaching up to 13-14 feet in body length, found exclusively in tundra and cold steppe regions. These solitary herbivores are fundamentally peaceful but fiercely territorial and dangerous when defending range or young. Adventurers encounter them primarily while traveling through arctic regions or when mistaken for threatening the creature.

## Presentation

The woolly rhino is massive and heavily built with a thick brownish-gray coat that hangs in clumps for insulation. The signature feature is the large forward-curving horn of dense keratin reaching 4-5 feet in length, often scarred and darkened with age. Broad shoulders and sturdy legs support the creature’s weight across difficult terrain.

## Key Behaviors

Woolly rhinos are solitary grazers that spend much of their time foraging in harsh tundra environments. They are fiercely territorial and will defend feeding grounds aggressively, particularly during mating season. They are intelligent about remembering dangerous locations and adjusting movement patterns.

## Combat Strategy

The woolly rhino charges at threats with all its weight and power behind its horn. If cornered or defending young, it becomes relentless and will continue attacking until the threat is eliminated or departs.

## Attack Methods

### Horn Charge

The rhino charges with all its weight concentrated behind the horn, capable of impaling and throwing opponents.

### Trampling Stomp

The creature’s hooves deliver crushing blows to targets on the ground.

## Special Abilities

### Charge Momentum

The rhino’s charge over distance gains additional force and impact.

### Cold Adaptation

The thick fur provides genuine protection against extreme cold and minor insulation against slashing attacks.

### Relentless Territorial Defense

Within claimed territory, the rhino fights with enhanced determination and refuses to retreat.

### Additional Information

Woolly rhinos are most dangerous when defending territory or young. In open terrain, their charging advantage is maximized. The creature’s horn can be harvested after death and is valuable for crafting and decoration.

## Attributes

- **Strength:** 14-19 (1d6+13)

- **Endurance:** 13-18 (1d6+12)

- **Dexterity:** 8-11 (1d4+7)

- **Agility:** 7-10 (1d4+6)

- **Perception:** 8-13 (1d6+7)

- **Aura:** 7-10 (1d4+6)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 3-6 (1d4+2)
