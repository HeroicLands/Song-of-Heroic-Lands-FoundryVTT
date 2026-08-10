---
aliases:
    - Starcrawler
tags:
    - spirit
name:
    full: Starcrawler
    aliases: []
id: KwgKiSFDeCgFjebo
slug: starcrawler
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
shortcode: strcrwlr
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 8
        end: 9
        dex: 17
        agl: 19
        per: 9
        aur: 11
        wil: 9
        rea: 8
        cre: 9
    attrRollFormula:
        str: 1d4+5
        end: 1d4+6
        dex: 1d4+14
        agl: 1d4+16
        per: 1d4+6
        aur: 1d4+8
        wil: 1d4+6
        rea: 1d4+5
        cre: 1d4+6
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
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Mandibles
                  shortcode: mandibloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: low
                  amputability: high
                  shockValue: 2
                  probWeight: 3
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: thoraxpart
                  bleedingSusceptibility: low
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Legs
                  shortcode: llegsloc
                  bodyPartCode: llegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Legs
                  shortcode: rlegsloc
                  bodyPartCode: rlegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: abdomenpart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 8
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Sting
                  shortcode: stingloc
                  bodyPartCode: abdomenpart
                  bleedingSusceptibility: low
                  amputability: high
                  shockValue: 2
                  probWeight: 2
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
        weight:
            base: 0
            calc: 0
        reachBase: 0
        bodyScaleBase: 0.81
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
              masteryLevelBase: 45
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 70
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 30
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 36
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 23
        - name: Sharp Mandibles
          type: skill
          system:
              shortcode: mandible
              subType: combattechnique
              masteryLevelBase: 70
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: mandible
                  name: Sharp Mandibles
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -1
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
        - name: Paralyzing Venom
          type: skill
          system:
              shortcode: sting
              subType: combattechnique
              masteryLevelBase: 70
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: sting
                  name: Paralyzing Venom
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -1
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
                      poison: true
---

# Appearance {#appearance}

A constellation walks across the ground. At first you think it must be some trick of the night sky, but the stars move with purpose and direction across surfaces where stars should not be. As it approaches, you realize the lights are coming from something small and delicate—an insectoid shape no larger than a human hand, yet each segment of its body is studded with luminescent points. When it moves, it leaves behind a trail of light that lingers for a moment before fading, and the air around it smells faintly of ozone and distance.

# Dossier {#dossier}

Starcrawlers are celestial beings touched by the distant stars themselves, perhaps fragments of stellar essence given flesh. They are rare and strange, appearing in places where the boundary between earth and sky grows thin. Some are guardians of ancient sites; others seem to wander with no particular purpose. They are not aggressive by nature, but they are utterly alien in their priorities and values. A Starcrawler may protect a human one moment and ignore a human's death the next, following logic that mortals cannot fathom.

## Presentation

A Starcrawler is roughly the size of a cat or small dog, with a segmented, insectoid body. Its exoskeleton is translucent or semi-transparent, and each segment is studded with points of light—some constant, some twinkling, some pulsing in slow patterns. Its limbs are long and spindly, ending in delicate claws that seem capable of moving with precision. Its head is a rounded shape with eyes that are themselves small lights, distinct from the rest of the creature's luminescence. The creature moves with impossible grace and fluidity, and where it passes, its light trail lingers like bioluminescent water. It makes almost no sound—its footsteps are inaudible, and its only vocalizations are faint chiming or bell-like notes.

## Key Behaviors

Starcrawlers are active almost exclusively at night and in deep shadow. In direct sunlight, they become noticeably lethargic and will seek shelter. They are drawn to high places—peaks, towers, tall trees—from which they seem to observe the sky and the landscape below. Some researchers believe they are observing something humans cannot perceive, tracking patterns in the stars or monitoring changes in the world. They seem to care little for normal food and survive on something that humans do not have access to—perhaps pure starlight or magical energy. They are not territorial but do not associate with their own kind; even multiple Starcrawlers in the same location ignore each other completely.

## Combat Strategy

Starcrawlers rarely engage in direct combat. If threatened, they attempt to retreat to high ground or open sky. If cornered, they use their speed and agility to evade until an opening for escape appears. When forced into actual combat, they fight defensively, attempting to wound or disable an aggressor enough to create an escape opportunity rather than aiming to kill. Against multiple opponents or a clearly overwhelming force, they disengage and flee without hesitation.

## Attack Methods

### Sharp Mandibles

The Starcrawler's mouth opens to reveal mandibles that are surprisingly strong and sharp. These strike with speed and precision, but the wounds are relatively minor—the creature is more concerned with escaping than with serious injury.

### Paralyzing Venom

When mandibles pierce flesh, the creature delivers a toxin that causes numbness and temporary weakness in the bitten area. The effect is not severe enough to be immediately incapacitating, but it slows and hampers victims, making them easier to escape from.

## Special Abilities

### Celestial Luminescence

The Starcrawler's body is a source of light, and it can adjust the brightness and intensity of its glow at will. By flashing with intense brightness, it can temporarily blind or disorient observers. By dimming completely, it can become nearly invisible in darkness. The light it produces is not magical in the normal sense—it is more like the bioluminescence of deep-sea creatures.

### Aerial Grace

The Starcrawler can climb walls and ceilings with equal ease, and it moves with such fluidity that it seems barely to touch surfaces as it passes. It can navigate vertical spaces that would be impossible for normal creatures.

### Spirit Affinity

The Starcrawler exists partially in the spirit realm and can become more or less corporeal at will. When fully corporeal, it is vulnerable to normal weapons. When partially incorporeal, physical attacks pass through it with minimal effect.

### Swift Movement

The creature is almost impossibly fast. It can dodge attacks that seem unavoidable and move across ground in apparent defiance of physics.

## Additional Information

Starcrawlers are not natural creatures and do not breed in the normal sense. They appear to be singular entities, each unique and potentially ancient. Some scholars believe them to be fragments of dying stars given form by ancient magic. They are profoundly resistant to normal weapons and much more vulnerable to magic in general. Earth-based magic is most effective against them, possibly because earth magic is the antithesis of their celestial nature. Some sages have reported that Starcrawlers can be communicated with if approached correctly, though the communication is difficult and strange—the creature seems to perceive concepts that human language cannot express. A Starcrawler has never been known to attack humans unprovoked. Those who kill one report that its light extinguishes like a snuffed candle, and the body dissipates into nothing—neither corpse remains nor any evidence of its ever having existed.

## Attributes

- **Strength:** 6-9 (1d4+5)

- **Endurance:** 7-10 (1d4+6)

- **Dexterity:** 15-18 (1d4+14)

- **Agility:** 17-20 (1d4+16)

- **Perception:** 7-10 (1d4+6)

- **Aura:** 9-12 (1d4+8)

- **Will:** 7-10 (1d4+6)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 7-10 (1d4+6)
