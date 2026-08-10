---
aliases:
    - Specterwolf
tags:
    - spirit
name:
    full: Specterwolf
    aliases: []
id: rD3EROAf0ElFfGjr
slug: specterwolf
img: icons/game-icons/lorc/wolf-head.svg
portrait: ""
shortcode: spctrwlf
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 11
        end: 13
        dex: 13
        agl: 17
        per: 15
        aur: 15
        wil: 13
        rea: 9
        cre: 11
    attrRollFormula:
        str: 1d4+8
        end: 1d4+10
        dex: 1d4+10
        agl: 1d4+14
        per: 1d4+12
        aur: 1d4+12
        wil: 1d4+10
        rea: 1d4+6
        cre: 1d4+8
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 1
                - name: Torso
                  shortcode: torsozone
                  probWeight: 3
                - name: Hindquarters
                  shortcode: hindqtrzone
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
                  probWeight: 6
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
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
        bodyScaleBase: 1
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 80
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: wetlands
                mode: override
                textValue: "0"
              - scope: surface_cover
                key: dunes
                mode: override
                textValue: "0"
              - scope: surface_cover
                key: mixed_forest
                mode: override
                textValue: "0"
              - scope: surface_cover
                key: barren
                mode: override
                textValue: "0"
              - scope: surface_cover
                key: ruins
                mode: override
                textValue: "0"
              - scope: hydrology
                key: shallow
                mode: override
                textValue: "0"
              - scope: hydrology
                key: deep
                mode: override
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
              masteryLevelBase: 75
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 42
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 64
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 30
        - name: Ethereal Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 74
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Ethereal Bite
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
---

# Appearance {#appearance}

In the darkness ahead, you hear what should be the sound of paws on stone—but the sound comes wrong, as if from a great distance even as the shape moves toward you. The form is wolflike but not quite solid; it seems to slip between shadows and reality with each step. Its eyes are pale and depthless, regarding you with an intelligence that no natural wolf should possess, and something about its presence makes your skin crawl with primal warning.

# Dossier {#dossier}

Specterwolves are the remnants of ancient beasts that died in places saturated with death and despair. They exist partially in the spirit realm, hunting on both sides of the veil between worlds. Some are wild predators; others are bound by dark magicians or haunted shamans to serve as guardians or hunters. A Specterwolf pack is among the most terrifying threats to isolated travelers—coordinated, relentless, and able to move through obstacles that would stop normal wolves. They are intelligent enough to plan hunts and to learn from failures.

## Presentation

A Specterwolf is roughly the size of a large wolf, with a frame built for endurance hunting. Its body is semi-transparent and composed of mist and shadow, with a shimmer like heat haze that distorts the background. Its fur, when visible, appears matted and unkempt, as if it has been wet and dried many times. Its eyes are the sharpest feature—pale blue or silver, often seeming to glow with faint luminescence. Its mouth, when open, shows translucent fangs that look more substantial than the rest of its form. The creature leaves no footprints and produces little sound, and where it passes, the temperature drops noticeably.

## Key Behaviors

Specterwolves are pack hunters that display eerie coordination even without visible communication. They stalk prey with patience, sometimes following targets for days to exhaust them before attacking. Unlike natural wolves, they do not require sustenance in the normal way; they hunt from compulsion rather than hunger. They are most active at night and in shadow, and they seem to avoid direct sunlight. They show strong territorial behavior and will defend their hunting grounds viciously against both other predators and humans. A pack that has tasted blood in an area will return to that place repeatedly.

## Combat Strategy

Specterwolves use pack tactics to overwhelming advantage, attempting to surround and isolate opponents. They exploit their phasing ability to move through obstacles and attack from unexpected angles. One wolf attacks from the front while others emerge from shadows or stone to flank and attack. They are intelligent enough to recognize which opponents pose the most threat and will focus on disabling those first. Against light or radiant magic, they become more cautious and may choose to hunt elsewhere. A single Specterwolf separated from its pack becomes noticeably less effective and may attempt to flee.

## Attack Methods

### Ethereal Bite

The wolf’s jaws close around a victim and the experience is nightmarish—teeth seem to pass partially through armor and flesh. The bite wounds feel cold and wrong, and the victim experiences a profound draining sensation as if the attack reaches into their vitality itself. Multiple bites can leave a person unable to continue fighting or fleeing.

### Disarming Howl

The Specterwolf releases a cry that is both sound and something more—a keening that seems to vibrate at a fundamental level. Those who hear it directly experience vertigo, disorientation, and a momentary inability to coordinate themselves. Weapons may fall from weakened hands, and footing becomes uncertain.

## Special Abilities

### Phasing

The Specterwolf can move through stone, wood, and other solid obstacles as if they did not exist. It cannot move through barriers of living earth or unworked stone, which seem to impede it significantly. Worked stone, metal, and refined materials offer no resistance.

### Pack Coordination

Individual Specterwolves within a pack seem to share some form of connection that allows them to coordinate without visible communication. They position attacks with supernatural timing and support each other in combat with instinctive precision.

### Spirit Senses

The Specterwolf can see in complete darkness and can detect prey by their living essence rather than by sight or smell. It seems to sense emotional states and can track targets across ground that would be difficult for normal predators.

### Life Drain

The necrotic energy in the Specterwolf’s bite does more than wound—it saps the victim’s strength and vitality. Wounds inflicted by a Specterwolf are slow to heal and leave the victim feeling diminished even after physical recovery.

## Additional Information

Specterwolves are vulnerable to radiant light and to weapons blessed or imbued with holy magic. Bright light drives them to ground and makes them less mobile and dangerous. A well-lit campfire can deter a pack, though determined wolves may simply wait for the light to fade. Some rangers and shamans claim that Specterwolves can be driven off or negotiated with if approached with the proper ritual respect. A Specterwolf pack killed in its territory may reform after several days, particularly if the source of its manifestation is not addressed. Permanent destruction requires either destroying the binding object if one exists, or cleansing the location of the death and despair that created the creatures.

## Attributes

- **Strength:** 9-12 (1d4+8)

- **Endurance:** 11-14 (1d4+10)

- **Dexterity:** 11-14 (1d4+10)

- **Agility:** 15-18 (1d4+14)

- **Perception:** 13-16 (1d4+12)

- **Aura:** 13-16 (1d4+12)

- **Will:** 11-14 (1d4+10)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 9-12 (1d4+8)
