---
aliases:
    - Xerathian Forest Elephant
tags:
    - animal
name:
    full: Xerathian Forest Elephant
    aliases: []
id: pGoe1xHOveNk8ycM
img: icons/game-icons/delapouite/elephant.svg
portrait: ""
shortcode: xrthnfrs
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
        bodyScaleBase: 2.88
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

The forest seems to move as a single unit before separating into distinct creature: massive, dark-skinned, and emerging with surprising grace from dense vegetation. The rounded ears fan humid air, and the straighter tusks point downward, carving through foliage with practiced ease. The trunk curls and unfolds with obvious intelligence, sampling scents and reaching for vegetation. The eyes are remarkable in their awareness and wariness.

# Dossier {#dossier}

The Xerathian Forest Elephant is smaller and more elusive than its savanna cousin, standing 8-9 feet at the shoulder and weighing 4-5 tons, found exclusively in dense tropical forests. These intelligent, reclusive creatures are rarely encountered by humans due to their avoidance of human areas and their camouflage in forest environments.

## Presentation

The forest elephant has darker gray or brownish skin compared to savanna elephants, straighter downward-pointing tusks, and relatively rounded ears. The build is adapted for forest navigation rather than open grasslands.

## Key Behaviors

Forest elephants are shy and avoid human contact when possible. They feed on wide variety of forest vegetation and play crucial role in seed dispersal. They are highly intelligent and social within family groups.

## Combat Strategy

When threatened, the forest elephant charges using tusks and trunk. It is less aggressive than savanna cousins but equally dangerous when defending young or territory.

## Attack Methods

### Tusk Gore

The elephant uses its downward-pointing tusks to gore and create wounds.

### Trunk Blow

The trunk delivers powerful strikes capable of knocking opponents backward.

## Special Abilities

### Forest Navigation

The elephant can move through dense terrain with remarkable grace and speed.

### Intelligent Problem-Solving

The elephant understands and responds to threats tactically.

### Additional Information

Forest elephants avoid confrontation and will flee if escape is possible. The creatures are most dangerous when defending young or territory. The tusks can be harvested after death.

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
