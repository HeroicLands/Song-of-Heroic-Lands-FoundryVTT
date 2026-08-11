---
aliases:
    - Blinkfox
tags:
    - dreadspawn
name:
    full: Blinkfox
    aliases: []
id: yWF2AXVSDAjJXF4f
img: icons/game-icons/caro-asercion/fox.svg
portrait: ""
shortcode: blinkfox
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 8
        end: 9
        dex: 15
        agl: 17
        per: 11
        aur: 13
        wil: 9
        rea: 11
        cre: 13
    attrRollFormula:
        str: 1d4+5
        end: 1d4+6
        dex: 1d4+12
        agl: 1d4+14
        per: 1d4+8
        aur: 1d4+10
        wil: 1d4+6
        rea: 1d4+8
        cre: 1d4+10
    body:
        structure:
            zones:
                - name: Forequarters
                  shortcode: fqtrzone
                  probWeight: 1
                - name: Torso
                  shortcode: torsozone
                  probWeight: 1
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 1
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: fqtrzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: fqtrzone
                  roles: &a1
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 5
                - name: Right Foreleg
                  shortcode: rforelegpart
                  bodyZoneCode: fqtrzone
                  roles: *a1
                  canHoldItem: false
                  probWeight: 5
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
                  probWeight: 5
                - name: Right Hind Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindqtrzone
                  roles: []
                  canHoldItem: false
                  probWeight: 10
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 3
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
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
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
            base: 15
            calc: 15
        reachBase: 0
        bodyScaleBase: 0.81
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 80
          leaguesPerWatch: 5
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
              masteryLevelBase: 65
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
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 23
        - name: Blinking Bite
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
                  name: Blinking Bite
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
        - name: Flickering Claws
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 74
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Flickering Claws
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

Movement catches your eye—a flicker, a blur of color that shouldn't be there. One moment it's to your left, the next directly ahead. Its fur ripples through a spectrum of hues, never quite settling on any single color, as if it hasn't fully decided what it should look like. You catch the glint of an eye—sharp, calculating, utterly intelligent—and then it's gone, the space where it stood empty save for a faint shimmer that hangs in the air like heat haze.

# Dossier {#dossier}

Blinkfoxes are creatures of fae origin or magical corruption, predators that exist partially outside normal space. They hunt in deep woods and arcane-touched lands, moving through dimensions in ways that defy natural law. Adventurers encounter them most often in enchanted forests, ancient magical sites, or wild regions where the boundaries between worlds have grown thin.

## Presentation

The Blinkfox resembles a fox roughly the size of a large hound—lean, graceful, and built for speed. Its fur is never quite solid in color, shifting through iridescent hues of blue, green, purple, and silver depending on angle and light. Fine wisps of what appears to be luminescent smoke trail from its movement, dissipating slowly. Its eyes are oversized and intelligent, gleaming with an inner light. Its paws make no sound, and its form sometimes appears slightly translucent, as if not fully present in the material world. When it blinks, it sometimes vanishes entirely for a moment before reappearing elsewhere.

## Key Behaviors

The Blinkfox is a cunning, solitary hunter with intelligence approaching that of sapient creatures. It stalks prey with calculated patience, using its speed and spatial manipulation to corner targets. The creature shows particular preference for intelligent prey—birds, smaller humanoids, clever animals—and will spend considerable time studying a potential quarry before striking. When not hunting, it rests in clearings or atop high stones, its form becoming nearly invisible as its fur matches the surroundings. It exhibits no fear of humans unless badly wounded; it is curious and playful in a way that suggests hunger rather than aggression.

## Combat Strategy

The Blinkfox never commits to a direct fight. Instead, it strikes from unexpected angles, landing one bite or claw rake before teleporting away to assess its target. It uses hit-and-run tactics relentlessly, wearing down prey through accumulated wounds rather than a single devastating attack. When faced with overwhelming opposition, it blinks away into the deeper wilderness. It shows tactical awareness in using terrain—circling prey to drive them toward cliffs or rivers, separating individuals from groups, always maintaining escape routes.

## Attack Methods

### Blinking Bite

The creature materializes in close proximity to its target and delivers a precise bite to exposed flesh or weak points in armor. The bite is accurate and delivers sharp trauma; the Blinkfox immediately blinks away afterward.

### Flickering Claw Strikes

The fox rakes with its fore-claws in rapid succession, each strike occurring from a slightly different position as the creature briefly blinks between strikes. This creates the illusion of multiple simultaneous attacks and makes defending against it exceptionally difficult.

### Disorienting Manifestation

The Blinkfox can teleport directly in front of a target's eyes, causing momentary disorientation and potentially breaking line of sight or initiative focus. Some targets panic when the creature appears and disappears repeatedly in their immediate vicinity.

## Special Abilities

### Short-Range Teleportation

The Blinkfox can teleport up to sixty feet in a single blink action, appearing in any location it can see or has recently occupied. It can execute one of these blinks per round freely; additional blinks require expenditure of magical reserve. It can teleport while carrying light burdens.

### Chromatic Concealment

The creature's fur automatically adopts the dominant colors of its surroundings, rendering it nearly invisible when stationary in natural environments. When moving, the color-shifting becomes apparent, but the creature's speed makes tracking its exact location difficult.

### Fey Heritage

The Blinkfox's partial existence in multiple planes grants it resistance to physical damage and magical effects designed to affect purely material creatures. It is vulnerable to spells and effects that target creatures regardless of planar position and can be harmed by materials imbued with anti-fey properties.

## Additional Information

Blinkfoxes are too small and swift to be practical mounts, but some fey-touched individuals claim to befriend them. The creature's teleportation is limited by exhaustion; if forced to blink repeatedly without rest, its range decreases and its form becomes less stable. Blinkfoxes avoid direct sunlight, preferring dawn and dusk hunting hours or deep forest shade.

## Attributes

- **Strength:** 6-9 (1d4+5)

- **Endurance:** 7-10 (1d4+6)

- **Dexterity:** 13-16 (1d4+12)

- **Agility:** 15-18 (1d4+14)

- **Perception:** 9-12 (1d4+8)

- **Aura:** 11-14 (1d4+10)

- **Will:** 7-10 (1d4+6)

- **Reasoning:** 9-12 (1d4+8)

- **Creativity:** 11-14 (1d4+10)
