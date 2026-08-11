---
aliases:
    - Rootwraith
tags:
    - dreadspawn
name:
    full: Rootwraith
    aliases: []
id: 1deqLlOJoWRJ2sPS
img: icons/game-icons/lorc/spectre.svg
portrait: ""
shortcode: rtwrth
type: creature
package: sohl
sohl:
    kbcat: dreadspawn
    archetype: 0
    attributes:
        str: 12
        end: 14
        dex: 12
        agl: 10
        per: 16
        aur: 18
        wil: 16
        rea: 14
        cre: 16
    attrRollFormula:
        str: 1d4+9
        end: 1d6+10
        dex: 1d4+9
        agl: 1d6+6
        per: 1d4+13
        aur: 1d6+14
        wil: 1d4+13
        rea: 1d6+10
        cre: 1d4+13
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Arms
                  shortcode: armszone
                  probWeight: 5
                - name: Torso
                  shortcode: torsozone
                  probWeight: 5
                - name: Legs
                  shortcode: legszone
                  probWeight: 8
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
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Eye
                  shortcode: leyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Eye
                  shortcode: reyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Nose
                  shortcode: noseloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 30
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Cheek
                  shortcode: lcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Cheek
                  shortcode: rcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Ear
                  shortcode: learloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Ear
                  shortcode: rearloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Mouth
                  shortcode: mouthloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 30
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Jaw
                  shortcode: jawloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 200
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Shoulder
                  shortcode: rshldloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Upper Arm
                  shortcode: rupaloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Elbow
                  shortcode: relbloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Forearm
                  shortcode: rfraloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Hand
                  shortcode: rhandloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Shoulder
                  shortcode: lshldloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Upper Arm
                  shortcode: lupaloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Elbow
                  shortcode: lelbloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Forearm
                  shortcode: lfraloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Hand
                  shortcode: lhandloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Thorax
                  shortcode: thrxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Abdomen
                  shortcode: abdmnloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Pelvis
                  shortcode: plvisloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 20
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Thigh
                  shortcode: rthghloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Knee
                  shortcode: rkneeloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Calf
                  shortcode: rcalfloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Foot
                  shortcode: rfootloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Thigh
                  shortcode: lthghloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Knee
                  shortcode: lkneeloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Calf
                  shortcode: lcalfloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Foot
                  shortcode: lfootloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
        weight:
            base: 600
            calc: 600
        reachBase: 0
        bodyScaleBase: 1.06
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 2
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: mixed_forest
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: woodland
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: needleleaf_forest
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: cold_woodland
                mode: add
                textValue: "0"
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
              masteryLevelBase: 65
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 51
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 52
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 33
        - name: Vine Lash
          type: skill
          system:
              shortcode: tentacle
              subType: combattechnique
              masteryLevelBase: 60
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: tentacle
                  name: Vine Lash
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 0
                      aspect: blunt
                  lengthBase: 3
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
        - name: Thorned Appendage
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 60
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Thorned Appendage
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 0
                      aspect: edged
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

The forest stirs around you though there is no wind—leaves rustle, branches creak and bend, and the very ground beneath your feet shifts with disturbing purpose. Then you see it rise from among the trees: a figure wrought from gnarled wood and twisted root, human in shape but horrifyingly plant-like in execution. Its eyes burn with a sickly green luminescence, and where it moves, the vegetation seems to sicken and wither despite—or perhaps because of—its passage. The air smells of rot and grave-earth, and you feel the temperature drop as if the creature carries an unnatural cold. Long, root-like appendages uncoil from its form, and you realize with terrible clarity that the forest itself is moving in concert with this thing, all of it dancing to a single malevolent will.

# Dossier {#dossier}

Rootwraiths are the corrupted remnants of nature’s will made manifest—creatures of twisted vegetation and ancient malice that haunt deep forests and wild places where human civilization has never truly taken root. They seem less born than conjured, emerging from soil and root systems as though the earth itself has grown a thorn to punish intrusion. A Rootwraith is utterly territorial and possesses an intelligence that runs counter to nature—not the simple cunning of an animal but something older and colder, with patience measured in decades or centuries. They communicate through the growth and movement of vegetation around them, leaving messages written in withered trees and strangled vines. Some scholars theorize that Rootwraiths are the echo of forest gods rejected and corrupted, their divinity twisted into something malevolent.

## Presentation

A Rootwraith stands roughly 7 to 9 feet in height, with a humanoid frame composed entirely of densely intertwined vines, gnarled roots, and hardened bark. Its body structure mimics natural anatomy but is deliberately twisted, with joints that bend in unsettling ways and limbs that taper into root-like appendages. Its "face" is a hollow, bark-covered void with two points of sickly bioluminescence where eyes should be—a green-white glow that seems to burn rather than reflect light. Its fingers taper into thorns or root-tips, and it trails wisps of dead vegetation as it moves, leaving behind a path of withered plants. Where the Rootwraith stands, the ground becomes hard and cracked, as though its presence leeches all life from the soil. The air around it smells of decay, loam, and something acrid—the scent of corruption seeping into natural places.

## Key Behaviors

A Rootwraith is an absolute sentinel of its territory, maintaining dominion over a stretch of forest with patient, implacable certainty. It does not hunt for food but seems to hunt for the sake of hunting—perhaps feeding on the life force it drains, or perhaps simply acting out some ancient directive to eliminate the living from its domain. It is most active at dusk and dawn, moving slower during the height of day but never ceasing entirely. A Rootwraith can command the vegetation within sight, directing trees to move, roots to strangle, and vines to entangle. It seems to communicate with plants around it, and standing in a forest ruled by a Rootwraith creates a pervasive sense of being watched and judged.

## Combat Strategy

A Rootwraith opens combat by animate the surrounding environment—roots erupting from the ground, vines lashing out from branches, trees swaying to block escape routes. It manipulates terrain to create hazards and prevent retreat while its physical form moves slowly forward, deliberately, as though confident in its inevitable victory. The creature is patient, willing to let terrain and vegetation do much of the work while it delivers finishing touches. If pressed hard or cornered, it becomes more aggressive, its movements faster and its attacks more direct. It will never flee but may retreat into the forest proper, where its control over vegetation is absolute.

## Attack Methods

### Vine Lash

Long, whip-like vines unfurl from the Rootwraith’s form with terrible speed, capable of cutting, constricting, and dragging. These attacks can be launched from surprising distance and often come from unexpected angles as vines approach from sides and above.

### Thorned Appendage Strike

The creature’s limbs transform or extend into appendages covered in wicked thorns, used for piercing and raking attacks. These strikes are surprisingly precise and often target vulnerable points in armor or exposed flesh.

### Decay Touch

When the Rootwraith makes contact with living flesh, it can drain the life force directly, causing rapid decomposition of tissue. Victims experience a terrible, burning sensation as their own bodies begin to rot while still alive.

## Special Abilities

### Forest Authority

The Rootwraith commands all plant life within line of sight as though it were an extension of its own body. Trees move, roots erupt from soil, vines lash out—all at the creature’s command. Terrain becomes a weapon in the Rootwraith’s arsenal.

### Life Drain

The Rootwraith’s very presence saps vitality from living creatures nearby. Those within its aura feel weakened, sickened, and as though their strength is flowing into the corrupted soil beneath their feet.

### Terrain Melding

The Rootwraith can sink into the earth, merge with a tree, or disappear into dense vegetation, allowing it to reposition, evade attacks, or launch surprise assaults from unexpected angles. In forested terrain, tracking it becomes nearly impossible.

### Regeneration Through Plant Life

So long as the Rootwraith remains in contact with living vegetation, it regenerates from damage. Only by severing it from plant life or destroying all vegetation in its vicinity can sustained damage be achieved.

## Additional Information

Fire is the Rootwraith’s primary vulnerability, as flames destroy its plant-matter composition and sever its connection to surrounding vegetation. Radiant or holy magic is equally effective, as it seems to oppose the corrupted essence that animates the creature. Cutting down trees around a Rootwraith forces it to seek new vegetation, and in barren areas it becomes slowly weaker. The creatures cannot abide in deserts or desolate places, and transporting one to such an environment effectively kills it. Rootwraiths seem to hold particular hatred for those who harm forests deliberately, and they have been known to pursue loggers and settlers with terrible persistence. Some ancient forests are said to be entirely ruled by Rootwraiths, with every clearing held in check and every traveler who enters never emerging again.

## Attributes

- **Strength:** 10-13 (1d4+9)

- **Endurance:** 11-16 (1d6+10)

- **Dexterity:** 10-13 (1d4+9)

- **Agility:** 7-12 (1d6+6)

- **Perception:** 14-17 (1d4+13)

- **Aura:** 15-20 (1d6+14)

- **Will:** 14-17 (1d4+13)

- **Reasoning:** 11-16 (1d6+10)

- **Creativity:** 14-17 (1d4+13)

## Lineage Notes

_The following notes are inherited from the original lineage description._

The forest stirs around you though there is no wind, the very ground beneath your feet shifting with disturbing purpose. From the deeper trees something resolves out of the green dark—seven to nine feet tall, composed of intertwined vines and gnarled roots, trailing dead vegetation as it moves toward you.

## Description

The rootwraith stands seven to nine feet tall, composed of densely intertwined vines and gnarled roots with a humanoid frame deliberately twisted, trailing dead vegetation as it moves. It possesses bioluminescent eyes burning with sickly luminescence and an aura of wrongness that affects the environment around it.

## Key Behaviors

Rootwraiths are absolute sentinels of their territories, maintaining dominion over stretches of forest with patient, implacable certainty. They are most active at dusk and dawn, and they can command vegetation within sight.

## Relations

Rootwraiths hold particular hatred for those who harm forests deliberately and pursue loggers and settlers with terrible persistence. They are universally feared and hunted as abominations.

## Special Abilities

### Plant Command

Rootwraiths command all plant life within sight as an extension of their own body—trees move, roots erupt, vines lash out. Terrain becomes a weapon in the rootwraith's arsenal.

### Vegetative Regeneration

Rootwraiths regenerate from damage only while in contact with living vegetation.

### Life Drain

Rootwraiths drain life force from living things, causing rapid decomposition of tissue and withering of nearby plants that are not part of their domain.
