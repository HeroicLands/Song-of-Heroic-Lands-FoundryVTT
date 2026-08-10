---
aliases:
    - Dragonfly Hawk
tags:
    - animal
name:
    full: Dragonfly Hawk
    aliases: []
id: Ld3BjQ7uxeuVYQa7
slug: dragonfly-hawk
img: icons/game-icons/lorc/dragonfly.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 12
        end: 13
        dex: 17
        agl: 18
        per: 15
        aur: 10
        wil: 12
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+8
        end: 1d6+9
        dex: 1d6+13
        agl: 1d6+14
        per: 1d6+11
        aur: 1d4+7
        wil: 1d6+8
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Thorax
                  shortcode: thoraxzone
                  probWeight: 1
                - name: Abdomen
                  shortcode: abdomenzone
                  probWeight: 1
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
                - name: Left Wing
                  shortcode: lwingpart
                  bodyZoneCode: thoraxzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 2
                - name: Right Wing
                  shortcode: rwingpart
                  bodyZoneCode: thoraxzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 2
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
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Mandibles
                  shortcode: mandibloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: low
                  amputability: high
                  shockValue: 2
                  probWeight: 3
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: thoraxpart
                  bleedingSusceptibility: low
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Left Wing
                  shortcode: lwingloc
                  bodyPartCode: lwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Right Wing
                  shortcode: rwingloc
                  bodyPartCode: rwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Left Legs
                  shortcode: llegsloc
                  bodyPartCode: llegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Right Legs
                  shortcode: rlegsloc
                  bodyPartCode: rlegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: abdomenpart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
        weight:
            base: 15
            calc: "15"
        reachBase: 0
        bodyScaleBase: 1.09
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
          feetPerRound: 100
          leaguesPerWatch: 8
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
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
              masteryLevelBase: 75
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
              masteryLevelBase: 64
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 33
        - name: Shearing Mandible
          type: skill
          system:
              shortcode: mandible
              subType: combattechnique
              masteryLevelBase: 68
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: mandible
                  name: Shearing Mandible
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 1
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
        - name: Leg Grasp
          type: skill
          system:
              shortcode: grab
              subType: combattechnique
              masteryLevelBase: 73
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: grab
                  name: Leg Grasp
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 12
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

The sound reaches you first: a high-pitched whine like a distant saw cutting metal, growing closer with terrifying rapidity. Then you see it: a creature of nightmare proportions—a dragonfly magnified to lethal size, a body five feet long composed of gleaming segments of iridescent chitin. The wings beat so rapidly they're nearly invisible, producing the hyperfrequent hum that sounds almost like pain. The mandibles—massive, shearing structures—snap open and shut in patterns suggesting hunger. The eyes—multifaceted, capturing light like a thousand tiny mirrors—fix directly on you with predatory intensity as the creature circles, testing, assessing.

# Dossier {#dossier}

The Dragonfly Hawk is an aerial predator of nightmare proportions: a dragonfly scaled to lethal size. Measuring five to seven feet from head to tail tip, with a wingspan of six to eight feet, these creatures are found in areas with water: rivers, lakes, marshes, and coastal regions. They are solitary hunters except during brief mating periods, when multiple individuals may congregate. A Dragonfly Hawk hunts by sight, pursuing prey from the air with speed and maneuverability that few creatures can match. They are known to hunt creatures as large as humans, though they prefer smaller prey. Their armor-like exoskeleton and speed advantage make them extremely difficult to threaten. Adventurers encounter them while traveling near water, camping on riverbanks, or crossing open terrain where aerial predators have advantage.

## Presentation

An enormous insect with an elongated body composed of articulated segments of iridescent chitin, colored blue, green, or purple depending on light. The head is relatively small with enormous compound eyes and powerful mandibles capable of shearing. The thorax is muscular, supporting four wings of transparent membrane. The wings beat at frequencies that produce an audible hum. The abdomen is elongated and somewhat flattened, used for balance and maneuverability. The entire creature gleams with an almost metallic shine. Multiple sets of legs hang from the thorax, used for grasping prey during dives.

## Key Behaviors

Dragonfly Hawks are strictly aerial predators. They patrol territories, hunting insects and small animals from the air. They are capable of hovering, rapid acceleration, and precise maneuvering. They prefer open water or grassland where their aerial advantage is maximized. They rest on perches above water, returning to the same sites repeatedly. They are most active during daylight and rest at night.

## Combat Strategy

A Dragonfly Hawk attacks from the air using hit-and-run tactics. It dives at prey, attempts to strike with mandibles, then climbs away before the target can respond. Multiple dives allow the hawk to inflict progressive damage. Prey on the ground that cannot reach the sky is at disadvantage.

## Attack Methods

### Shearing Mandible Strike

The Dragonfly Hawk dives and attempts to bite with mandibles capable of shearing through flesh and light armor. The strike is fast enough that defending is difficult.

### Leg Grasping and Lifting

The Dragonfly Hawk can grasp prey with its legs and lift it from the ground, carrying it aloft and potentially dropping it.

## Special Abilities

### Blinding Aerial Speed and Maneuverability

The Dragonfly Hawk moves through air with speed exceeding mounted horses. Its maneuverability allows it to perform aerial tactics impossible for ground-bound creatures. A flying predator has overwhelming advantage over prey on the ground.

### Multifaceted Vision

Compound eyes provide exceptional vision in multiple directions simultaneously, making surprise nearly impossible.

### Chitinous Armor

The exoskeleton provides significant protection against slashing and blunt attacks from ground-based weapons. Piercing attacks are more effective.

## Attributes

- **Strength:** 9-14 (1d6+8)
- **Endurance:** 10-15 (1d6+9)
- **Dexterity:** 14-19 (1d6+13)
- **Agility:** 15-20 (1d6+14)
- **Perception:** 12-17 (1d6+11)
- **Aura:** 8-11 (1d4+7)
- **Will:** 9-14 (1d6+8)
- **Reasoning:** 5-8 (1d4+4)
- **Creativity:** 4-7 (1d4+3)

#### Razor Mandibles

Capable of cutting through light armor and flesh.

## Attributes

- **Strength:** 9-14 (1d6+8)

- **Endurance:** 10-15 (1d6+9)

- **Dexterity:** 14-19 (1d6+13)

- **Agility:** 15-20 (1d6+14)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 8-11 (1d4+7)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
