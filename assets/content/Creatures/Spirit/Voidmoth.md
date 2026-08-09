---
aliases:
    - Voidmoth
tags:
    - spirit
name:
    full: Voidmoth
    aliases: []
id: 0YaWh1FabKCGtnAs
slug: voidmoth
img: icons/game-icons/lorc/butterfly.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 8
        end: 11
        dex: 13
        agl: 15
        per: 11
        aur: 15
        wil: 9
        rea: 9
        cre: 13
    attrRollFormula:
        str: 1d4+5
        end: 1d4+8
        dex: 1d4+10
        agl: 1d4+12
        per: 1d4+8
        aur: 1d4+12
        wil: 1d4+6
        rea: 1d4+6
        cre: 1d4+10
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 3
                - name: Thorax
                  shortcode: thoraxzone
                  probWeight: 4
                - name: Abdomen
                  shortcode: abdomenzone
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
                - name: Left Wing
                  shortcode: lwingloc
                  bodyPartCode: lwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Wing
                  shortcode: rwingloc
                  bodyPartCode: rwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
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
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
        weight:
            base: 0
            calc: 0
        reachBase: 0
        bodyScaleBase: 0.73
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
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
              masteryLevelBase: 50
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 36
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 36
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 52
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 25
        - name: Wing Buffet
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
                  name: Wing Buffet
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -2
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
        - name: Mandible Strike
          type: skill
          system:
              shortcode: mandible
              subType: combattechnique
              masteryLevelBase: 62
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: mandible
                  name: Mandible Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -1
                      aspect: edged
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

The darkness in front of you begins to move. At first you think it must be a trick of the light—a fluctuation in shadow—but the darkness coheres, solidifies, takes form. Massive wings unfold, each the size of a sail, patterned in colors that seem to exist outside the normal spectrum—ultraviolet depths and infrared fires your eyes can barely process. Where the wings fold, the air shimmers as if space itself is being creased. The creature's presence makes the world feel thin, fragile, as though you are standing very close to something that should remain hidden.

# Dossier {#dossier}

Voidmoths are ancient, rare beings born from or touched by the spaces between worlds. They are not creatures of flesh but are composed of something closer to solidified darkness and void-energy given temporary form. Most are found near places where the barrier between realms grows thin—ancient stones, sites of old magic, locations where reality has been damaged or torn. They are not inherently aggressive but they are possessive of liminal spaces and hostile to those who attempt to exploit or cross them. A Voidmoth is as much guardian as creature, and it will protect its territory with cold intelligence.

## Presentation

A Voidmoth is roughly the size of a horse, with a body composed of chitinous segments that seem to absorb light rather than reflect it. Its wings are vast—when fully spread, they measure twenty feet or more from tip to tip. The wings are patterned with geometric shapes and colors that hurt to look at directly; they seem to show dimensions that human eyes were not meant to perceive. The creature's compound eyes are like clusters of black diamonds, each facet showing a different view of the world or perhaps of other worlds. Where the Voidmoth moves, the air seems to shimmer and waver, as if space bends slightly around the creature's passage.

## Key Behaviors

Voidmoths are solitary and territorial, fiercely defensive of places they have claimed as their domain. They are nocturnal and avoid direct sunlight. They seem to feed on something that is not physical food—possibly magic itself, or energy from the spaces between worlds. They are intelligent and methodical, and they seem to understand humans well enough to anticipate their actions. Most encounters occur when humans accidentally approach a Voidmoth's territory; the creature will warn before attacking, but the warning is often subtle and easily missed. A Voidmoth provoked will not relent until the threat is dead or has fled far from its domain.

## Combat Strategy

Voidmoths use their control over darkness and void-energy to overwhelming advantage. They manifest zones of absolute darkness around themselves, rendering normal vision useless. Within this darkness, they are nearly invisible and can move and attack with impunity. Against opponents with light-based magic or abilities, they become more cautious and will attempt to suppress those abilities first. They rarely engage in straightforward combat, preferring to use their supernatural advantages to confuse and disable opponents. Against clearly overwhelming force, they will retreat into the void itself rather than fight to exhaustion.

## Attack Methods

### Dark Powder Release

The Voidmoth beats its wings and releases a cloud of fine, dark powder that has no source and does not behave like normal dust. Where it falls, light is absorbed rather than reflected. Those who breathe it report difficulty seeing, and their magic becomes sluggish and hard to control.

### Wing Buffets

The Voidmoth's wings strike with surprising force for something so delicate. A wingbeat can knock a person off their feet, and the sensation of being struck by void-touched matter is disorienting and deeply wrong.

### Void Gaze

The Voidmoth focuses its compound eyes on a target and the effect is overwhelming—the victim feels as though they are being viewed from multiple angles and multiple realities simultaneously. Reason fractures briefly, and victims stumble confused.

## Special Abilities

### Darkness Manifestation

The Voidmoth can create zones of absolute, supernatural darkness within thirty feet of itself. This darkness is not natural night but a void of light itself. Normal vision becomes impossible, but the Voidmoth can see perfectly within it. The effect is constant while the creature concentrates on it.

### Void Phasing

The Voidmoth can partially slip out of synchronization with reality, becoming semi-corporeal. In this state, physical weapons pass through it with minimal effect. However, magic and light-based attacks strike it fully, forcing it to become more material.

### Void Aura

The Voidmoth radiates an aura of void-energy that disrupts and suppresses magic in its immediate vicinity. Spells are difficult to cast near the creature, and magical effects become unreliable and unstable. This aura extends roughly thirty feet from the Voidmoth's body.

### Interdimensional Knowledge

The Voidmoth seems to perceive and understand things beyond normal human comprehension. It can sense dimensional boundaries and know when they are being approached or manipulated. Casters attempting to use dimensional magic (teleportation, planar travel, etc.) near a Voidmoth find such magic extremely difficult or impossible to execute.

## Additional Information

Voidmoths are most vulnerable to light-based magic and blessed weapons. Bright light forces them to become more material and exposes them to physical attack. Physical weapons, particularly those blessed or imbued with holy magic, are effective against them. They cannot be permanently destroyed while anchored to a dimensional weak point; they will reform after several days unless the location itself is sealed or purified. Attempting to communicate with a Voidmoth is possible but difficult and dangerous—the creature's mind operates on premises that human language cannot fully express. Some scholars who have studied these creatures believe they serve a purpose in maintaining the barriers between worlds, preventing unwanted crossings and incursions from other realms. From this perspective, destroying a Voidmoth may have consequences beyond the immediate encounter.

## Attributes

- **Strength:** 6-9 (1d4+5)

- **Endurance:** 9-12 (1d4+8)

- **Dexterity:** 11-14 (1d4+10)

- **Agility:** 13-16 (1d4+12)

- **Perception:** 9-12 (1d4+8)

- **Aura:** 13-16 (1d4+12)

- **Will:** 7-10 (1d4+6)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 11-14 (1d4+10)
