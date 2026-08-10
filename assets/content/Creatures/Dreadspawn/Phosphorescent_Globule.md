---
aliases:
    - Phosphorescent Globule
tags:
    - dreadspawn
name:
    full: Phosphorescent Globule
    aliases: []
id: WQjWcb6PtRpcRxGe
slug: phosphorescent-globule
img: icons/game-icons/delapouite/slime.svg
portrait: ""
shortcode: phsphrsc
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 10
        end: 18
        dex: 14
        agl: 12
        per: 16
        aur: 18
        wil: 16
        rea: 10
        cre: 14
    attrRollFormula:
        str: 1d6+6
        end: 1d6+14
        dex: 1d6+10
        agl: 1d4+9
        per: 1d4+13
        aur: 1d6+14
        wil: 1d4+13
        rea: 1d6+6
        cre: 1d6+10
    body:
        structure:
            zones:
                - name: Core
                  shortcode: corezone
                  probWeight: 1
                - name: Mass
                  shortcode: masszone
                  probWeight: 2
                - name: Tendrils
                  shortcode: tendrilzone
                  probWeight: 1
            parts:
                - name: Core
                  shortcode: corepart
                  bodyZoneCode: corezone
                  roles:
                      - vital
                  canHoldItem: false
                  probWeight: 10
                - name: Mass
                  shortcode: masspart
                  bodyZoneCode: masszone
                  roles:
                      - core
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Left Tendrils
                  shortcode: ltendrilpart
                  bodyZoneCode: tendrilzone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 5
                - name: Right Tendrils
                  shortcode: rtendrilpart
                  bodyZoneCode: tendrilzone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 5
            locations:
                - name: Core
                  shortcode: coreloc
                  bodyPartCode: corepart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Mass
                  shortcode: massloc
                  bodyPartCode: masspart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Underside
                  shortcode: underbellyloc
                  bodyPartCode: masspart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Tendrils
                  shortcode: ltendrilloc
                  bodyPartCode: ltendrilpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Tendrils
                  shortcode: rtendrilloc
                  bodyPartCode: rtendrilpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
        weight:
            base: 10
            calc: 10
        reachBase: 0
        bodyScaleBase: 0.94
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
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
              masteryLevelBase: 80
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 70
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 51
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 52
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 35
        - name: Acidic Engulfment
          type: skill
          system:
              shortcode: grab
              subType: combattechnique
              masteryLevelBase: 69
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: grab
                  name: Acidic Engulfment
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 10
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

In the deepest darkness, a luminous green glow blooms like a sickly flower. The light pulses and intensifies hypnotically, drawing your eye and making it impossible to look away—beautiful, almost, in its promise of warmth and guidance in the lightless place. Then, as the glow brightens, you realize the light is not coming from ahead but from all around you, and the source is a rolling, gelatinous mass that moves like slow water given form. Its surface writhes and undulates with nauseating grace, and where the acidic slime touches the stone, it hisses and smokes. You can taste the faint burn in the air—caustic, alien, wrong.

# Dossier {#dossier}

The Phosphorescent Globule is a predatory ooze of supreme cunning that hunts through deception rather than direct assault. It manifests as a near-mindless creature in its behavior yet employs tactics that suggest terrible intelligence, using its bioluminescence as both lure and weapon. These creatures are found exclusively in deep, lightless caves and underground lakes where their glow stands out as a beacon in the darkness. A Phosphorescent Globule can slowly consume an entire ecosystem by drawing creatures to it with promises of light before dissolving them in its acidic body. Some scholars theorize that these oozes are not natural creatures at all but rather manifestations of corrupted magic, capable of spontaneous generation wherever enough ambient arcane energy concentrates in darkness.

## Presentation

A Phosphorescent Globule typically manifests as a roughly spherical blob measuring 4 to 8 feet in diameter, though it can elongate, flatten, or reconfigure its shape with unsettling ease. Its form is entirely translucent or semi-transparent, composed of a gelatinous substance that is sickly green or pale blue in color and radiates a pulsing bioluminescence from within. Inside the mass, shapes and colors shift constantly—swirling patterns of light, sometimes resembling eyes or mouths or writhing forms, though these are likely just tricks of refracted luminescence. Where the creature moves, the ground steams and hisses as its acidic body slowly consumes stone and organic matter. The temperature drops noticeably near a Phosphorescent Globule, and the air carries a faint scent of burning acid and ozone.

## Key Behaviors

A Phosphorescent Globule is a patient, nearly sedentary predator that settles in a location and waits for creatures to be drawn to it. It does not seek prey actively but instead emanates its glow constantly, trusting in the irresistible draw of light in darkness to bring food to it. When prey approaches, it may flare its luminescence to confuse and distract, or it may dim it slowly, creating a hypnotic pulsing pattern designed to enthrall weaker minds. The creature seems to understand that some creatures will resist its lure and will attempt to prevent escape, positioning itself between prey and the exit before revealing its true nature. It grows larger as it feeds, and an old Phosphorescent Globule may be two or three times the size of a younger one.

## Combat Strategy

A Phosphorescent Globule opens combat by intensifying its luminescence, attempting to disorient and mesmerize opponents with dazzling light displays. Once prey is disoriented, it moves to engulf and dissolve them in its acidic body. The creature is slow-moving but remarkably difficult to damage—physical attacks pass partially through its gelatinous form without causing lasting harm. If severely damaged, it can voluntarily fragment into multiple smaller globs, each capable of independent action, forcing opponents to deal with multiple threats simultaneously. A Phosphorescent Globule rarely retreats from combat; instead, it simply waits with eerie patience for an opening.

## Attack Methods

### Acidic Engulfment

The creature surges forward and attempts to envelop a target partially or wholly within its corrosive form. Those caught experience rapidly accelerating dissolution as the ooze exerts pressure and dissolves flesh, bone, and equipment alike.

### Blinding Flash

The creature's luminescence flares with brilliant intensity, flooding the area with overwhelming light that blinds and disorients those within range. Affected creatures struggle to track movement or coordinate attacks.

## Special Abilities

### Bioluminescent Lure

The creature's constant glow is hypnotic and compelling to creatures of weak will, drawing them inexorably closer despite conscious misgivings. Those with strong will or high reasoning can resist the pull, but weaker minds find themselves walking toward the light as though compelled by strings.

### Fragmentation

When severely damaged, the Phosphorescent Globule can voluntarily split into multiple smaller globs, each with a fraction of the parent's size and attributes. These fragments can act semi-independently to flank or surround opponents, creating multiple threat vectors.

### Acidic Body

The Globule's very form is corrosive to most materials, slowly dissolving anything it touches. Weapons and armor exposed to the creature for prolonged periods suffer degradation, and flesh exposed directly to the creature experiences burning, caustic damage.

## Additional Information

Fire is the Phosphorescent Globule's primary weakness—flames disrupt its bioluminescence and cause the acidic form to become unstable and painful. Extreme cold also damages it, hardening the gelatinous form and disrupting its movement and cohesion. The creature's luminescent organs, if harvested carefully after death, can be preserved and used as light sources or crafted into magical foci that retain dim bioluminescence for years. The creature's acidic secretions, properly neutralized and preserved, have value in alchemical processes. The greatest risk to removing a Phosphorescent Globule from an area is the certainty that if even a small fragment is left behind, it will regenerate into a full creature given enough time and food.

## Attributes

- **Strength:** 7-12 (1d6+6)

- **Endurance:** 15-20 (1d6+14)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 10-13 (1d4+9)

- **Perception:** 14-17 (1d4+13)

- **Aura:** 15-20 (1d6+14)

- **Will:** 14-17 (1d4+13)

- **Reasoning:** 7-12 (1d6+6)

- **Creativity:** 11-16 (1d6+10)
