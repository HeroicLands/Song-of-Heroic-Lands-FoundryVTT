---
aliases:
    - Gloomsprite
tags:
    - spirit
name:
    full: Gloomsprite
    aliases: []
id: TzpgPd5BTOfbWPIY
slug: gloomsprite
img: icons/game-icons/delapouite/fairy.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        end: 8
        dex: 10
        agl: 15
        per: 11
        aur: 13
        wil: 8
        rea: 11
        cre: 15
        str: 2
    attrRollFormula:
        end: 1d4+5
        dex: 1d6+6
        agl: 1d4+12
        per: 1d4+8
        aur: 1d4+10
        wil: 1d4+5
        rea: 1d4+8
        cre: 1d4+12
        str: 1d4
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
        bodyScaleBase: 0.18
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
              masteryLevelBase: 55
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 30
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 40
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 52
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 13
        - name: Tiny Claws
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 62
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Tiny Claws
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: -5
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

A spark of sickly light flits past your eye—there, then gone. When you follow it, there are suddenly three, no five, all slightly different colors, all mocking your inability to track them. The air around them feels colder, and you realize with creeping unease that you cannot quite remember why you were walking down this path in the first place.

# Dossier {#dossier}

Gloomsprites are fey tricksters native to the shadow-touched borderlands between the spirit world and the material plane. They are neither wholly evil nor entirely benign—their sense of morality exists in a space humans cannot quite inhabit. They delight in puzzles, games, and the elaborate downfall of those who break unspoken bargains. A Gloomsprite might lead travelers astray for days simply to prove a point about the dangers of assumption, or they might defend a child lost in the woods with fierce protection. Encounters with Gloomsprites are unpredictable and often disturbing, less because of physical threat than because of the unsettling nature of their attention.

## Presentation

A Gloomsprite is roughly the size of a man's hand, with an insectoid or fairy-like silhouette. Its body is translucent and composed of something between light and shadow, giving it a shimmering quality that makes it hard to focus on directly. Its wings are gossamer-thin and move faster than the eye can follow, producing a sound like wind through broken glass. Its eyes are the only solid-looking feature—violet or deep blue, perfectly round, and utterly empty of empathy. The creature emits a faint glow that shifts between sickly green and pale purple, and this light leaves afterimages on the observer's vision if stared at too long.

## Key Behaviors

Gloomsprites are solitary creatures that haunt liminal spaces—forest edges, the boundaries between shadow and light, places where people are most likely to become lost. They are drawn to contradiction and paradox; a human following contradictory directions fascinates them for hours. Despite their malevolent reputation, they are rarely murderers—they prefer tormenting travelers with endless loops, leading them in circles, or creating situations where two choices are equally bad. They seem to find genuine amusement in this. A Gloomsprite will sometimes take payment to undo its tricks, or to guide a traveler in a particular direction, but the payment requested is often bizarre and disturbing rather than valuable.

## Combat Strategy

Gloomsprites almost never engage in direct combat; they are far too fragile. Instead, they harry opponents with illusions and misdirection, darting in to make a strike before vanishing into shadow. If a Gloomsprite cannot achieve superiority through trickery, it flees immediately. They are clever enough to create situations where opponents strike each other while pursuing phantom sprites, or where a victim walks into obstacles they cannot see. Against an opponent who is immune to illusion or deception, a Gloomsprite becomes obvious and desperate, and will retreat to find better odds elsewhere.

## Attack Methods

### Mental Disorientation

The sprite uses magic and its shifting form to confuse a target's mind, making directions seem wrong and distances inaccurate. A victim finds themselves walking toward the creature instead of away, or striking at images instead of the real being. This is more confusing than painful.

### Tiny Claws

When forced into direct physical combat, the Gloomsprite rakes with claws that seem to find gaps in armor with impossible precision. The wounds are small but weirdly deep, as though the claws exist partially in another realm.

## Special Abilities

### Shadow Flitting

The Gloomsprite can move through shadows as though they were open spaces, appearing and disappearing at will. In bright light, its movement is restricted to normal space and it becomes much more vulnerable.

### Layered Illusions

The creature creates phantom forms and false images that overlay reality. A victim under the effect of this ability sees multiple versions of the sprite, multiple paths, multiple exits—all false. The actual sprite is somewhere in the confusion, but finding it requires more luck than skill.

### Incorporeal Nature

The Gloomsprite is not fully material; physical weapons pass through it most of the time. However, light-based magic or blessed weapons bypass this protection, striking it as though it were fully corporeal.

### Fey Bargaining

The Gloomsprite seems compelled by something deeper than law to honor explicit bargains. If a traveler somehow manages to negotiate with the creature, the agreement is binding on both sides. The sprite will uphold its end, though perhaps with malicious interpretation of the terms.

## Additional Information

Bright light, especially natural sunlight or magical radiance, forces the Gloomsprite into a more corporeal form where it is vulnerable to normal weapons. Many travelers have found that producing bright light—lanterns, torches, radiant magic—can turn an encounter from overwhelming chaos to a manageable threat. Some experienced sprite-hunters carry mirrors to reflect and amplify light onto these creatures. A Gloomsprite killed in bright light dies like any creature, but one that reaches shadow first may simply dissipate, scattering into harmless wisps of shadow. Whether a dead Gloomsprite actually remains dead or simply withdraws to the spirit realm is unclear; no scholar has definitively answered this question.

## Attributes

- **Endurance:** 6-9 (1d4+5)

- **Dexterity:** 7-12 (1d6+6)

- **Agility:** 13-16 (1d4+12)

- **Perception:** 9-12 (1d4+8)

- **Aura:** 11-14 (1d4+10)

- **Will:** 6-9 (1d4+5)

- **Reasoning:** 9-12 (1d4+8)

- **Creativity:** 13-16 (1d4+12)
