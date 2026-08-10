---
aliases:
    - Titan Beetle
tags:
    - animal
name:
    full: Titan Beetle
    aliases: []
id: uIJSscPVcBwVMyGp
slug: titan-beetle
img: icons/game-icons/lorc/scarab-beetle.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 21
        end: 19
        dex: 9
        agl: 8
        per: 11
        aur: 8
        wil: 14
        rea: 5
        cre: 5
    attrRollFormula:
        str: 1d6+17
        end: 1d6+15
        dex: 1d4+6
        agl: 1d4+5
        per: 1d6+7
        aur: 1d4+5
        wil: 1d6+10
        rea: 1d4+2
        cre: 1d4+2
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Thorax
                  shortcode: thoraxzone
                  probWeight: 2
                - name: Abdomen
                  shortcode: abdomenzone
                  probWeight: 2
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Thorax
                  shortcode: thoraxpart
                  bodyZoneCode: thoraxzone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Legs
                  shortcode: llegspart
                  bodyZoneCode: thoraxzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
                - name: Right Legs
                  shortcode: rlegspart
                  bodyZoneCode: thoraxzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
                - name: Abdomen
                  shortcode: abdomenpart
                  bodyZoneCode: abdomenzone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 7
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 7
                      fire: 9
                - name: Mandibles
                  shortcode: mandibloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: low
                  amputability: high
                  shockValue: 2
                  probWeight: 3
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 7
                      fire: 9
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: thoraxpart
                  bleedingSusceptibility: low
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 7
                      fire: 9
                - name: Left Legs
                  shortcode: llegsloc
                  bodyPartCode: llegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 7
                      fire: 9
                - name: Right Legs
                  shortcode: rlegsloc
                  bodyPartCode: rlegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 7
                      fire: 9
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: abdomenpart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 7
                      fire: 9
        weight:
            base: 50
            calc: "50"
        reachBase: 0
        bodyScaleBase: 1.91
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 2
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
              masteryLevelBase: 36
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 50
        - name: Mandible Crush
          type: skill
          system:
              shortcode: mandible
              subType: combattechnique
              masteryLevelBase: 48
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: mandible
                  name: Mandible Crush
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 6
                      aspect: edged
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
        - name: Body Slam
          type: skill
          system:
              shortcode: ram
              subType: combattechnique
              masteryLevelBase: 38
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: ram
                  name: Body Slam
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
                      aspect: blunt
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
---

# Appearance {#appearance}

The ground itself seems to tremble with deliberate, rhythmic footsteps. A dark, gleaming shape emerges from vegetation, and you realize you're looking at something between insect and small fortress. The chitinous shell is polished like dark metal, segmented and proportioned with alien grace. The six legs are thick and powerful, each step producing a crunching sound that carries an implicit promise of weight and strength. The head is broad and flat, dominated by massive mandibles that open and close in a slow, testing motion that suggests absolute confidence in their power to crush and cleave.

# Dossier {#dossier}

The Titan Beetle is a massive armored insect reaching 6-8 feet in body length and weighing several hundred pounds, found in dense forests, rocky badlands, and caves across tropical and temperate regions. Despite their herbivorous diet, these creatures are formidable defensive combatants that will aggressively protect territory or themselves when threatened. Adventurers encounter titan beetles primarily in dense vegetation or while mining/quarrying in beetle territory.

## Presentation

The titan beetle is an armor-plated insect with a body covered entirely in dark, polished chitin that resembles burnished metal. The exoskeleton is segmented into plates that allow flexibility while providing protection. The head is broad with powerful mandibles that curve downward and are capable of tremendous crushing force. The eyes are relatively small and positioned on the sides of the head. Six thick, muscular legs support the creature's weight, each leg ending in curved claws suitable for gripping and climbing. The back is marked with ridges and darker striations.

## Key Behaviors

Titan beetles are herbivorous, spending much of their time feeding on vegetation, leaves, and bark. They are fundamentally peaceful creatures that will tolerate humanoid presence until threatened. When endangered, they immediately shift to defensive stance and will aggressively defend territory. Females defending eggs become nearly uncontrollable in aggression. Beetles are solitary except during mating season. They can survive for extended periods without food.

## Combat Strategy

The titan beetle defends itself through sheer durability and crushing power. It charges opponents with all its weight, using mandibles to deliver devastating bites. The creature is slow but relentless, simply overwhelming opposition through durability and repeated attacks. If escape is possible, the beetle will flee rather than continue losing battle.

## Attack Methods

### Mandible Crush

The beetle delivers a crushing bite using its powerful mandibles, capable of breaking bone and tearing through armor.

### Body Slam

The creature uses its weight as a weapon, colliding with opponents and attempting to crush them under its mass.

## Special Abilities

### Natural Armor

The chitin shell provides genuine protection equivalent to heavy armor against slashing and piercing attacks.

### Immovable Mass

The beetle's weight and low center of gravity make it nearly impossible to knock off balance or move against its will.

### Relentless Strength

The beetle continues fighting despite damage, driven by territorial instinct rather than fear or pain.

### Additional Information

Titan beetles are most dangerous when defending territory or eggs. Outside of protective instinct, they are relatively passive. The creature's chitin can be harvested after death and used for armor or crafting. Females defending eggs are nearly unbeatable and should be avoided entirely.

## Attributes

- **Strength:** 18-23 (1d6+17)

- **Endurance:** 16-21 (1d6+15)

- **Dexterity:** 7-10 (1d4+6)

- **Agility:** 6-9 (1d4+5)

- **Perception:** 8-13 (1d6+7)

- **Aura:** 6-9 (1d4+5)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 3-6 (1d4+2)

- **Creativity:** 3-6 (1d4+2)
