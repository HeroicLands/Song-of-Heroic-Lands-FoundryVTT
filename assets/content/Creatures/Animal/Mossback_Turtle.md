---
aliases:
    - Mossback Turtle
tags:
    - animal
name:
    full: Mossback Turtle
    aliases: []
id: 8e0pLwFIiIUuHOsb
slug: mossback-turtle
img: icons/game-icons/lorc/turtle.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 15
        end: 18
        dex: 9
        agl: 7
        per: 11
        aur: 9
        wil: 13
        rea: 7
        cre: 5
    attrRollFormula:
        str: 1d6+11
        end: 1d6+14
        dex: 1d4+6
        agl: 1d4+4
        per: 1d6+7
        aur: 1d4+6
        wil: 1d6+9
        rea: 1d4+4
        cre: 1d4+2
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 3
                - name: Shell
                  shortcode: shellzone
                  probWeight: 9
                - name: Limbs
                  shortcode: limbzone
                  probWeight: 4
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Shell
                  shortcode: shellpart
                  bodyZoneCode: shellzone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: limbzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Right Foreleg
                  shortcode: rforelegpart
                  bodyZoneCode: limbzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Left Hind Leg
                  shortcode: lhindlegpart
                  bodyZoneCode: limbzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Right Hind Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: limbzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: limbzone
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
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Shell
                  shortcode: shellloc
                  bodyPartCode: shellpart
                  bleedingSusceptibility: low
                  amputability: none
                  shockValue: 4
                  probWeight: 7
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Underbelly
                  shortcode: underbellyloc
                  bodyPartCode: shellpart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
        weight:
            base: 500
            calc: "500"
        reachBase: 0
        bodyScaleBase: 1.36
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 15
          leaguesPerWatch: 1
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: aquatic
          feetPerRound: 40
          leaguesPerWatch: 3
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - name: Powerful Beak Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 44
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Powerful Beak Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 3
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 3
                      aspect: piercing
                  lengthBase: 2
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
              masteryLevelBase: 34
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
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
                      aspect: blunt
                  lengthBase: 2
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

At first, you think you are looking at an ancient, moss-covered boulder half-buried in leaf litter. The edges are too regular, too symmetrical, and when your eye focuses, you realize with a start that the entire surface is moving—slowly, deliberately, inexorably forward. The moss and lichen covering the enormous domed shell is so thick it looks like actual earth and growing things, not the protective carapace of a living creature. From beneath that stone-like dome, a weathered, wrinkled neck extends, and at its end, a small, intelligent eye opens and regards you with the patience of something that has existed for centuries and will continue to exist long after you are dust.

# Dossier {#dossier}

The Mossback Turtle is a colossal, slow-moving reptile measuring 8-10 feet in length from nose to tail and weighing well over a ton. Its most distinctive feature is the enormous domed shell covering its back and sides, which is so heavily covered in moss, lichen, fungi, and living plants that it appears to be an actual rocky outcropping. The shell itself is dark brown or gray beneath the living growth. The creature’s limbs are thick and heavily scaled, protruding from beneath the shell only far enough to allow movement. The neck is long and wrinkled, and the head is small and somewhat flattened, with small, intelligent eyes and a parrot-like, hooked beak.

## Presentation

The Mossback Turtle’s shell is its most prominent feature—a dome of armor so large and so heavily covered in living growth that it provides near-perfect camouflage in forest environments. The shell is ridged and ancient-looking, with visible cracks and chips from centuries of use. Beneath the moss and lichen, the shell surface is rough and heavily textured. The limbs are columnar and powerfully muscled beneath loose, wrinkled skin colored in mottled browns and grays. The tail is relatively short and thick. The head has a small brain case but a powerful jaw lined with a hard, sharp-edged beak rather than teeth. The eyes are small but bright and intelligent, positioned to allow good forward and lateral vision.

## Key Behaviors

Mossback Turtles are herbivorous grazers that spend much of their time slowly moving through forests, consuming vegetation, fungi, and plant matter. They are solitary, with only minimal interaction with other turtles during mating season. They prefer forest environments near water—streams, ponds, and wetlands—where they can bathe and find aquatic vegetation. They are primarily diurnal, resting at night in burrows or beneath overhanging rocks. They live for many decades, if not centuries, and their shells show the accumulated damage of a long life. They are generally reclusive and non-aggressive, preferring to withdraw when threatened.

## Combat Strategy

The Mossback Turtle’s first response to threat is always withdrawal—pulling its head, limbs, and tail fully within its protective shell and waiting for danger to pass. If a threat persists or if the turtle cannot fully withdraw (due to restraint or assault), it will defend itself with its powerful jaws, delivered from within its shell, or attempt to lumber to the nearest water or dense vegetation. Only if actively attacked while unable to withdraw will a turtle employ its body weight as a weapon, using its immense mass to crush or pin an opponent.

## Attack Methods

### Powerful Beak Bite

While withdrawn partially into its shell or when forced to defend, the Mossback Turtle uses its powerful hooked beak to bite with considerable force, capable of crushing bone and tearing flesh; a bite can sever fingers or cause serious bleeding.

### Body Slam

The Mossback Turtle can use its immense weight to crush opponents, toppling them to the ground or pinning them beneath its mass; this attack is typically only employed as a last resort when the turtle cannot retreat.

## Special Abilities

### Impenetrable Shell

The Mossback Turtle’s shell provides extraordinary protection, reducing physical damage from most sources; attacks from above or the sides are largely ineffective, though strikes to exposed limbs or the head bypass the protection.

### Natural Camouflage

When still, the Mossback Turtle is nearly invisible in forest environments, appearing indistinguishable from a moss-covered rock; enemies gain disadvantages to perception checks to notice a stationary turtle.

### Slow but Steadfast

While slow, the Mossback Turtle is difficult to move once it has taken position; it gains bonuses to opposed strength checks to resist being moved or knocked prone.

## Attributes

- **Strength:** 12-17 (1d6+11)

- **Endurance:** 15-20 (1d6+14)

- **Dexterity:** 7-10 (1d4+6)

- **Agility:** 5-8 (1d4+4)

- **Perception:** 8-13 (1d6+7)

- **Aura:** 7-10 (1d4+6)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 3-6 (1d4+2)
