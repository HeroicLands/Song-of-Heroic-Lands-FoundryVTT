---
aliases:
    - Viper
tags:
    - animal
name:
    full: Viper
    aliases: []
id: TscKeVS3HigBRoWZ
slug: viper
img: icons/game-icons/lorc/snake.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 6
        end: 8
        dex: 14
        agl: 16
        per: 18
        aur: 4
        wil: 9
        rea: 4
        cre: 4
    attrRollFormula:
        str: 1d4+3
        end: 1d4+5
        dex: 1d6+10
        agl: 1d4+13
        per: 1d6+14
        aur: 1d4+1
        wil: 1d4+6
        rea: 1d4+1
        cre: 1d4+1
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Forebody
                  shortcode: torsozone
                  probWeight: 5
                - name: Hindbody
                  shortcode: hindbodyzone
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
                - name: Forebody
                  shortcode: forebodypart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Hindbody
                  shortcode: hindbodypart
                  bodyZoneCode: hindbodyzone
                  roles:
                      - core
                      - locomotor
                  canHoldItem: false
                  probWeight: 6
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindbodyzone
                  roles: []
                  canHoldItem: false
                  probWeight: 4
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: forebodypart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: hindbodypart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
        weight:
            base: 30
            calc: "30"
        reachBase: 0
        bodyScaleBase: 0.55
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 2
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: wetlands
                mode: add
                textValue: "-2"
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
              masteryLevelBase: 70
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 18
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 28
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 68
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 18
        - name: Venomous Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 66
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Venomous Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: -2
                      aspect: piercing
                  lengthBase: 0
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
                      poison: true
---

# Appearance {#appearance}

The pattern seems to shift before your eyes, colors that match stone or leaf rippling with the creature's slow coiling motion. The head is distinctly triangular and flattened, and the eyes that fix upon you are cold and calculating. You feel rather than see the creature's awareness sweeping across you, searching for weaknesses, measuring threat levels with the cold logic of a predator that has learned the mathematics of killing. The coil tightens, and you understand that you're looking at patient death — something willing to wait eternally for the moment of its strike.

# Dossier {#dossier}

The Viper is a venomous serpent ranging from 3-8 feet in length depending on species, found in warm and temperate regions across grasslands, forests, and rocky terrain. These ambush specialists are among the deadliest creatures gram-for-gram, relying entirely on venom and precision to overcome prey larger than themselves. Adventurers encounter vipers while camping in wild lands, traveling through grasslands, or disturbing rocky areas where the creatures rest.

## Presentation

The viper is a sinuous serpent covered in patterns that provide extraordinary camouflage, with colors and markings specific to each regional subspecies. The head is distinctly triangular and flattened, with forward-facing eyes and heat-sensing pits between the eyes and nostrils. The body is relatively slender but muscular. The mouth is capable of unhinging to deliver specialized venom through hinged fangs that fold back into the roof of the mouth.

## Key Behaviors

Vipers are ambush specialists that spend extended periods motionless waiting for prey. They are primarily nocturnal or crepuscular, most active during cool parts of the day. They hunt through combination of vision, heat-sensing, and scent. They are fundamentally solitary except during mating season.

## Combat Strategy

The viper strikes with explosive speed when prey is within range, injects venom, and retreats to wait for the venom to do its work. If engaged with something that fights back, the viper attempts to retreat.

## Attack Methods

### Venomous Bite

The viper delivers a rapid bite using specialized hinged fangs to inject potent neurotoxic or hemotoxic venom designed to incapacitate prey.

### Constriction

For larger prey that don't succumb immediately to venom, the viper may attempt light coiling to hold the victim in place while venom works.

## Special Abilities

### Camouflage

Perfect color matching to environment makes the viper nearly invisible when still.

### Heat Sensing

Specialized pits detect warm-blooded prey in total darkness.

### Venom Delivery

Highly specialized fangs deliver precise venom doses that incapacitate prey efficiently.

### Rapid Strike

The viper's strike speed is exceptional, difficult to avoid once prey is within range.

### Additional Information

Vipers are most dangerous to unprepared targets. The creatures avoid conflict with anything that demonstrates active defense. Antivenin neutralizes venom effects if applied quickly. In cold weather or after long fasts, vipers move slowly and are less dangerous.

## Attributes

- **Strength:** 4-7 (1d4+3)

- **Endurance:** 6-9 (1d4+5)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 14-17 (1d4+13)

- **Perception:** 15-20 (1d6+14)

- **Aura:** 2-5 (1d4+1)

- **Will:** 7-10 (1d4+6)

- **Reasoning:** 2-5 (1d4+1)

- **Creativity:** 2-5 (1d4+1)
