---
aliases:
    - Cragclimber
tags:
    - dreadspawn
name:
    full: Cragclimber
    aliases: []
id: lehcDkx0YgAsYjaw
slug: cragclimber
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
shortcode: crgclmbr
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 13
        end: 15
        dex: 15
        agl: 17
        per: 11
        aur: 9
        wil: 11
        rea: 8
        cre: 8
    attrRollFormula:
        str: 1d4+10
        end: 1d4+12
        dex: 1d4+12
        agl: 1d4+14
        per: 1d4+8
        aur: 1d4+6
        wil: 1d4+8
        rea: 1d4+5
        cre: 1d4+5
    body:
        structure:
            zones:
                - name: Forequarters
                  shortcode: fqtrzone
                  probWeight: 3
                - name: Torso
                  shortcode: torsozone
                  probWeight: 3
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 3
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: fqtrzone
                  roles:
                      - vital
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
                  roles:
                      - manipulator
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
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 2
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
        weight:
            base: 200
            calc: 200
        reachBase: 0
        bodyScaleBase: 1.11
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: topography
                key: steep
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: alpine
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: barren
                mode: add
                textValue: "0"
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 55
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
              masteryLevelBase: 40
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 35
        - name: Raking Claws
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
                  name: Raking Claws
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 1
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
        - name: Tail Whip
          type: skill
          system:
              shortcode: tail
              subType: combattechnique
              masteryLevelBase: 64
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: tail
                  name: Tail Whip
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -1
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

The rock face ahead seems to shift. What you thought was a ledge has eyes—polished, reflective, utterly aware—and the "cliff face" is moving toward you with terrible, impossible speed. Stone-colored scales rasp against stone as the creature propels itself downward with four limbs that move like liquid metal. Its tail lashes behind it, a whip of crystalline hardness. You realize with horror that it has been waiting, yards away and invisible, the entire time.

# Dossier {#dossier}

Cragclimbers are draconic ambush predators born in high mountain ranges and cliff kingdoms, creatures perfectly adapted to vertical hunting. These agile hunters lurk on rockfaces and cliffsides, invisible until the moment of strike. Adventurers encounter them in mountain passes, on sheer cliff faces, in high-altitude valleys, and anywhere rocky terrain dominates the landscape.

## Presentation

The Cragclimber is a reptilian predator roughly six feet in length, lean and muscular with a sinewy build that emphasizes flexibility over bulk. Its entire body is covered in overlapping scales that range in color from gray-brown to slate to dusty tan, matching the exact shade and texture of surrounding stone. Its head is wedge-shaped with eyes that gleam like polished granite, and its mouth is filled with backward-curving teeth suited to gripping prey. Four powerful limbs end in curved claws designed for climbing and tearing; its hind legs are particularly muscular. A long, articulated tail makes up nearly half its body length, capable of independent movement and coiling around objects. The creature's movements are fluid and precise, and it can cling to vertical rock faces with absolute certainty.

## Key Behaviors

The Cragclimber is an apex predator of mountainous terrain, claiming hunting territories that extend across miles of cliff face. It spends most of its time absolutely motionless, perfectly camouflaged against stone, waiting with infinite patience for prey to pass within striking distance. Its hunting grounds are marked by the skeletal remains of previous meals, sometimes pushed from great heights. It hunts primarily in dawn and dusk hours when light is diffuse and shadows aid concealment. It exhibits no sign of territoriality toward other Cragclimbers—they simply ignore one another. When well-fed, it remains dormant for days; when hungry, it becomes more active, following movement along cliff paths.

## Combat Strategy

The Cragclimber attacks from absolute concealment, launching from a stationary position with explosive speed and ferocity. It aims to wound severely or disable prey in the initial strike, preferring to wound prey and watch it flee or fall rather than prolonged combat. Once a strike lands, it uses the cliff terrain against its opponent—attempting to force prey toward edges, loose rock, or fall hazards. If its prey proves more resilient than expected, it will disengage and return to camouflage, waiting for weakness to set in. It cannot be pursued effectively through vertical terrain it knows well.

## Attack Methods

### Raking Claw Strikes

The Cragclimber slashes with its fore-claws in rapid succession, attempting to open severe wounds. These attacks are designed to cause bleeding and mobility penalties.

### Tail Whip

The creature's whip-like tail is made of flexible but hardened bone and scale. A tail strike can hook around limbs, topple standing targets, or knock targets backward toward dangerous terrain.

### Diving Strike

When attacking from height or a significant positional advantage, the Cragclimber launches itself at prey with claws extended, attempting to deliver maximum trauma through combined impact and tearing.

## Special Abilities

### Stone Camouflage

The Cragclimber's scales perfectly match surrounding rocky terrain, rendering it nearly invisible when stationary. It gains advantage on concealment checks on mountainsides and cliff faces and can hold position for extended periods without detection.

### Vertical Supremacy

The creature's claws and muscular frame allow it to cling to vertical rock faces and navigate vertical terrain that ground-based creatures cannot traverse. It can move freely in three dimensions across cliff faces, giving it enormous advantage in escape and pursuit.

### Stone Hardening

The creature can deliberately harden its scales to stone-like rigidity, increasing its resistance to damage and allowing it to withstand impacts that would shatter normal bone. This ability is active in combat; ranged attacks against the Cragclimber have reduced effectiveness.

## Additional Information

Water and prolonged moisture erode the Cragclimber's protective hardening and can eventually weaken its structural integrity. Creatures that can track by scent can track the Cragclimber, unlike those relying on sight alone. Once a Cragclimber's hunting territory is identified, avoiding the high terrain it dominates is the safest approach; they do not follow prey into open ground or settlements.

## Attributes

- **Strength:** 11-14 (1d4+10)

- **Endurance:** 13-16 (1d4+12)

- **Dexterity:** 13-16 (1d4+12)

- **Agility:** 15-18 (1d4+14)

- **Perception:** 9-12 (1d4+8)

- **Aura:** 7-10 (1d4+6)

- **Will:** 9-12 (1d4+8)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 6-9 (1d4+5)
