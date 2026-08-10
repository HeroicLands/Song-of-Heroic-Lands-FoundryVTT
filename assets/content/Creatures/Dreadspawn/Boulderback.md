---
aliases:
    - Boulderback
tags:
    - dreadspawn
name:
    full: Boulderback
    aliases: []
id: yBv7xJJafJv5vXrt
slug: boulderback
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        per: 10
        aur: 8
        wil: 18
        rea: 8
        str: 42
        end: 26
        agl: 6
        cre: 4
    attrRollFormula:
        per: 1d6+6
        aur: 1d6+4
        wil: 1d6+14
        rea: 1d6+4
        str: 1d6+39
        end: 1d6+23
        agl: 1d4+4
        cre: 1d4+2
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Arms
                  shortcode: armszone
                  probWeight: 8
                - name: Torso
                  shortcode: torsozone
                  probWeight: 8
                - name: Legs
                  shortcode: legszone
                  probWeight: 12
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                  canHoldItem: false
                  probWeight: 1
                - name: Right Arm
                  shortcode: rarmpart
                  bodyZoneCode: armszone
                  roles:
                      - manipulator
                  canHoldItem: true
                  probWeight: 2
                - name: Left Arm
                  shortcode: larmpart
                  bodyZoneCode: armszone
                  roles:
                      - manipulator
                  canHoldItem: true
                  probWeight: 2
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 4
                - name: Right Leg
                  shortcode: rlegpart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
                - name: Left Leg
                  shortcode: llegpart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
            locations:
                - name: Skull
                  shortcode: skullloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: low
                  amputability: none
                  shockValue: 5
                  probWeight: 500
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Left Eye
                  shortcode: leyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Right Eye
                  shortcode: reyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Nose
                  shortcode: noseloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 30
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Left Cheek
                  shortcode: lcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Right Cheek
                  shortcode: rcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Left Ear
                  shortcode: learloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Right Ear
                  shortcode: rearloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Mouth
                  shortcode: mouthloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 30
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Jaw
                  shortcode: jawloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 200
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Right Shoulder
                  shortcode: rshldloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Right Upper Arm
                  shortcode: rupaloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Right Elbow
                  shortcode: relbloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Right Forearm
                  shortcode: rfraloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Right Hand
                  shortcode: rhandloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Left Shoulder
                  shortcode: lshldloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Left Upper Arm
                  shortcode: lupaloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Left Elbow
                  shortcode: lelbloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Left Forearm
                  shortcode: lfraloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Left Hand
                  shortcode: lhandloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Thorax
                  shortcode: thrxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Abdomen
                  shortcode: abdmnloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Pelvis
                  shortcode: plvisloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 20
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Right Thigh
                  shortcode: rthghloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Right Knee
                  shortcode: rkneeloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Right Calf
                  shortcode: rcalfloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Right Foot
                  shortcode: rfootloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Left Thigh
                  shortcode: lthghloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Left Knee
                  shortcode: lkneeloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Left Calf
                  shortcode: lcalfloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
                - name: Left Foot
                  shortcode: lfootloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 14
                      edged: 13
                      piercing: 11
                      fire: 13
        weight:
            base: 7000
            calc: "7000"
        reachBase: 0
        bodyScaleBase: 2.39
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 40
          leaguesPerWatch: 3
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
              masteryLevelBase: 60
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 39
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 52
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 32
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 85
        - name: Crushing Blow
          type: skill
          system:
              shortcode: punch
              subType: combattechnique
              masteryLevelBase: 52
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: punch
                  name: Crushing Blow
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 15
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
        - name: Powerful Charge
          type: skill
          system:
              shortcode: ram
              subType: combattechnique
              masteryLevelBase: 42
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: ram
                  name: Powerful Charge
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 12
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 15
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
        - name: Stone Throw
          type: skill
          system:
              shortcode: hurl
              subType: combattechnique
              masteryLevelBase: 42
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: hurl
                  name: Stone Throw
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 17
                      aspect: blunt
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 80
                  drawBase: 0
                  traits: {}
---

# Appearance {#appearance}

The earth shakes. At first you think it's an avalanche descending the mountainside, but then you see it: a mass of boulders, each the size of a man's torso, fitted together in the mockery of a body. It stands fifteen feet tall, its movements grinding and ponderous. Where it places its massive feet, stone cracks. Its head is a single, misshapen boulder with two openings like eye sockets—and from within those voids, something watches you with absolute patience.

# Dossier {#dossier}

Boulderbacks are earth-elementals bound in physical form, creatures of stone and will animated by something that dwells in deep places. They are neither malicious nor gentle—they simply exist as obstacles in stone passages and buried valleys. Adventurers encounter them in mountains, ancient quarries, cave systems, and places where earth-magic concentrations run high.

## Presentation

A Boulderback stands roughly fifteen feet tall, constructed of layered boulders and stone slabs fitted together into a vaguely humanoid frame. Its head is a single massive boulder with two deep-set eye sockets and a horizontal crevasse serving as a mouth. Its torso is built from stacked stone roughly six feet across; its limbs are thick columns of granite and flint. Enormous hands are formed from clusters of smaller stones bound together. Its back forms a jagged ridge of protruding stone blocks—hence the name. Each movement produces grinding, cracking sounds as stone shifts against stone; each step causes the ground to tremble and small rocks to cascade. It moves with deliberate slowness but inexorable determination.

## Key Behaviors

The Boulderback is driven by a singular imperative: protect its territory. It dwells in caves, mountain gorges, or quarries it has claimed, and it patrols these lands with methodical patience. The creature does not hunt; it does not eat. It simply walks, examines, and waits. When threatened, it responds with violence. When left alone, it is content to remain. It shows no sign of emotion, fear, or aggression—merely duty. Some Boulderbacks remain in the same territory for centuries, their watch never flagging.

## Combat Strategy

The Boulderback does not employ tactics. It moves toward threats and crushes them. When attacked, it retaliates with simple, devastating force. It will pursue fleeing prey only as far as its immediate territory; if a foe retreats beyond certain boundaries, the Boulderback ceases pursuit and returns to its patrol. It cannot be intimidated, bribed, or reasoned with—only destroyed or outmaneuvered.

## Attack Methods

### Crushing Blow

The creature swings one enormous stone fist at its target, attempting to deliver devastating blunt-force trauma. The impact is capable of shattering bone and armor alike.

### Powerful Charge

Moving with surprising speed despite its size, the Boulderback can build momentum and crash into opponents, attempting to pin them or drive them backward with its massive weight.

### Stone Throw

The creature can dislodge individual boulders from its body or surrounding terrain and hurl them at distant targets. These projectiles deliver impact damage and can pinning or crushing effects.

## Special Abilities

### Stone-Bound Durability

The Boulderback's construct nature makes it immensely difficult to harm through conventional means. Its body is distributed across many separate stone blocks; destroying one section does not kill the creature, though it may limit its mobility. The creature is resistant to all physical damage.

### Tremor Sense

The Boulderback perceives its surroundings through ground vibrations and stone resonance. It senses anything moving or disturbing the earth within its immediate territory, even through solid walls or in complete darkness. It is effectively blind and deaf to sound, but this limitation is rarely meaningful.

### Slow Regeneration

Exposed to stone and earth, the Boulderback repairs damage over time. Cracks seal, separated blocks drift back together, and wounds close. This regeneration is slow—hours or days—but relentless.

## Additional Information

Boulderbacks are vulnerable to spells and magic that target their binding properties or animate core. Water seeping into cracks and freezing can cause internal stress and damage. Most creatures cannot outrun a Boulderback at range, but vertical climbing and narrow passages where its size is a liability can be used to escape. Some legends speak of Boulderbacks becoming waypoints or holy sites, watched over by primitive peoples who learn to live alongside them.

## Attributes

- **Perception:** 7-12 (1d6+6)

- **Aura:** 5-10 (1d6+4)

- **Will:** 15-20 (1d6+14)

- **Reasoning:** 5-10 (1d6+4)
