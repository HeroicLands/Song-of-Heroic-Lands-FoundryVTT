---
aliases:
    - Wild Boar
    - creature-wildboar
tags:
    - animal
name:
    full: Wild Boar
    aliases: []
description: "A heavily muscled, stocky ungulate of temperate forests, ferociously territorial and dangerous when cornered or defending its ground."
id: 8SaQoBO7t7QGurHE
img: icons/game-icons/caro-asercion/boar.svg
portrait: images/being/wildboar-portrait.webp
shortcode: wildboar
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 20
        end: 20
        dex: 8
        agl: 11
        per: 11
        aur: 6
        wil: 15
        rea: 8
        cre: 8
    attrRollFormula:
        str: 1d6+16
        end: 1d6+16
        dex: 1d4+5
        agl: 1d4+8
        per: 1d4+8
        aur: 1d4+3
        wil: 1d4+12
        rea: 1d4+5
        cre: 1d4+5
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 1
                - name: Torso
                  shortcode: torsozone
                  probWeight: 4
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
        weight:
            base: 200
            calc: "200"
        reachBase: 0
        bodyScaleBase: 1.47
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 60
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 65
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 65
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 30
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 50
        - name: Tusk Gore
          type: skill
          system:
              shortcode: gore
              subType: combattechnique
              masteryLevelBase: 59
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: gore
                  name: Tusk Gore
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 5
                      aspect: piercing
                  lengthBase: 1
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
        - name: Trample
          type: skill
          system:
              shortcode: ram
              subType: combattechnique
              masteryLevelBase: 52
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: ram
                  name: Trample
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 4
                      aspect: blunt
                  lengthBase: 1
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

The dense, matted bristles catch the light as the creature stamps forward, revealing a musculature beneath the coat that belies the stocky frame. The tusks curve upward wickedly from the lower jaw, aged and stained, clearly weapons used repeatedly to gore earth and enemies alike. The elongated snout roots at the ground methodically, evidence of both foraging behavior and destructive power. The small eyes are bright with intelligence and aggression, and the growl that emerges speaks of relentless territoriality and absolute willingness to fight.

# Dossier {#dossier}

The Wild Boar is a heavily muscled, stocky ungulate standing 2-3 feet at the shoulder and weighing 200-400 pounds, found in forests, scrublands, and rough terrain throughout temperate regions. These aggressive, territorial creatures are dangerous primarily during defensive moments, though mature males are aggressive year-round. Adventurers encounter them while traveling forests, hunting game, or inadvertently entering territory claimed by boars.

## Presentation

The wild boar is stocky and barrel-shaped with a dark bristly coat ranging from brown to black. Short, sturdy legs support the weight, and powerful tusks curve upward from the lower jaw. The snout is elongated and powerful, clearly adapted for rooting through soil. The body is heavily muscled beneath the bristly coat, and the hide is thick and tough.

## Key Behaviors

Wild boars are omnivorous and spend much time rooting through soil for roots, tubers, and grubs. They are solitary except during mating season, when males become intensely aggressive. They are active primarily during dawn, dusk, and night. They can move with surprising speed despite their build. Mothers defending young become nearly unstoppable in aggression.

## Combat Strategy

The wild boar charges directly at threats with unexpected speed, using tusks to gore and attempting to knock opponents off balance. It continues attacking with commitment despite injury. Boars defending young fight suicidally.

## Attack Methods

### Charging Goring Attack

The boar charges with full force, attempting to gore with tusks and knock opponents backward.

### Trampling

Once an opponent is knocked down, the boar may attempt to trample under its weight.

### Tusking and Slashing

If close combat is engaged, the boar uses upward tusking motions to create distance and inflict injury.

## Special Abilities

### Charging Momentum

The boar's charge is devastating in force and nearly unstoppable once committed.

### Tough Hide

The thick coat and tough skin provide protection against light slashing attacks.

### Relentless Will

Once engaged, boars fight with commitment despite damage, driven by territorial aggression.

### Additional Information

Wild boars are most dangerous during rutting season when males are aggressive year-round. Mothers defending young are nearly unbeatable and should be avoided. The creatures' tusks can be harvested after death for crafting or decoration. Boar hunting is traditional in many cultures and carries significant danger.

## Attributes

- **Strength:** 17-22 (1d6+16)

- **Endurance:** 17-22 (1d6+16)

- **Dexterity:** 6-9 (1d4+5)

- **Agility:** 9-12 (1d4+8)

- **Perception:** 9-12 (1d4+8)

- **Aura:** 4-7 (1d4+3)

- **Will:** 13-16 (1d4+12)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 6-9 (1d4+5)
