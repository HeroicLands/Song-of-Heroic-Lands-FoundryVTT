---
aliases:
    - Stoneclimber
tags:
    - dreadspawn
name:
    full: Stoneclimber
    aliases: []
id: K2ltSub3JftqQzbn
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
shortcode: stnclmbr
type: creature
package: sohl
sohl:
    kbcat: dreadspawn
    archetype: 0
    attributes:
        str: 18
        end: 18
        dex: 16
        agl: 16
        per: 18
        aur: 10
        wil: 16
        rea: 12
        cre: 12
    attrRollFormula:
        str: 1d6+14
        end: 1d6+14
        dex: 1d4+13
        agl: 1d4+13
        per: 1d6+14
        aur: 1d6+6
        wil: 1d4+13
        rea: 1d4+9
        cre: 1d4+9
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
                  probWeight: 2
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
        weight:
            base: 200
            calc: 200
        reachBase: 0
        bodyScaleBase: 1.38
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 40
          leaguesPerWatch: 3
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
              masteryLevelBase: 85
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 80
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 39
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 68
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 45
        - name: Rending Claw
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 72
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Rending Claw
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 3
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
        - name: Snapping Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 72
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Snapping Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 4
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
---

# Appearance {#appearance}

The rock face moves before you see it—a ripple in the stone that shouldn't exist. Then the creature simply peels away from the mountainside as though it was never part of it, and you see it fully: a predator wrought from saurian muscle and armor, its scales the exact color and texture of granite, studded with quartz and feldspar. Its claws are hooks designed for stone, and it moves up a near-vertical cliff face as effortlessly as a spider crawling across a wall. Its eyes burn with predatory intelligence and shine like rubies caught in candlelight. You hear nothing as it moves—no scuff of claw, no dislodged stone—just the whisper of scale against rock and the dry clicking of its breath. Then it is gone, vanished back into the stone, and you cannot tell if it is above you, behind you, or waiting in an overhang to strike when you pass.

# Dossier {#dossier}

Stoneclimbers are apex predators of rocky highlands and mountain ranges, creatures evolved to hunt in three-dimensional terrain where most prey is clumsy and slow. A Stoneclimber is patient, cunning, and perfectly adapted to its environment—it reads stone like a fish reads water, understanding every surface, every crack, every angle of approach. These creatures are territorial and will defend their climbing grounds fiercely from other predators, but they show a peculiar indifference to humanoid settlements, attacking humans only when directly threatened or when humans blunder into a kill-zone. An ancient Stoneclimber may have claimed a range of a hundred miles or more of mountainous terrain, and it knows every approach, every hiding place, and every escape route.

## Presentation

A Stoneclimber measures roughly 12 to 16 feet in length, with a low, powerful, saurian frame perfectly suited for traversing difficult terrain. Its body is covered in overlapping scales of gray, brown, or rust-colored hue, each one textured like natural stone and often studded with quartz crystals, mica, or feldspar that makes the creature shimmer when light catches it properly. Its four limbs are stocky and muscular, tipped with claws that are less like weapons and more like specialized climbing equipment—curved, rough, and designed to grip stone with supernatural adhesion. Its head is broad and flattened, with eyes that glow a deep amber or ruby red, and a mouth filled with teeth of surprising sharpness. Its hide is thick enough that scales are clearly visible, and it often bears the scars of territorial conflicts with its own kind. When it moves, it makes almost no sound; its passages can only be tracked by disturbed dust, displaced gravel, or occasionally a claw-mark in stone too hard for normal climbing tools.

## Key Behaviors

A Stoneclimber is a territorial creature that claims a stretch of mountainous terrain and patrols it regularly, marking routes with subtle scratches and glandular secretions. It is primarily solitary, though occasionally two Stoneclimbers will establish neighboring territories and tolerate each other's presence if neither encroaches on the other's prime hunting grounds. The creature is active both day and night but seems to hunt more aggressively during twilight hours when prey is transitioning between activity levels. A Stoneclimber is an opportunistic hunter but also a tactical thinker—it will set ambushes at narrow passes or climbing routes where prey has limited options for escape or evasion.

## Combat Strategy

A Stoneclimber initiates combat by attacking from a position of advantage—usually from above, from behind, or from an angle where its prey cannot effectively respond. It uses its superior climbing ability and three-dimensional awareness to stay above, beyond, or beside opponents rather than engaging in direct melee. The creature is fast, precisely striking and then repositioning to a new vantage point. Against multiple opponents or heavily armored foes, it will attempt to isolate targets by driving them into hazardous terrain or separating them from the group. If pressed hard or injured, a Stoneclimber will retreat up terrain where it maintains clear advantage, using climbing ability to escape pursuit.

## Attack Methods

### Rending Claw Strike

The Stoneclimber drives its hook-like claws into flesh, attempting to tear and slash. These attacks are often performed while the creature is clinging to a cliff face or ceiling, using gravity and leverage to add terrible force.

### Snapping Bite

The creature's jaws are capable of terrible damage, particularly against necks and limbs. A successful bite can sever or cripple, and the creature often uses its weight and leverage to wrestle prey off balance.

### Diving Strike

From a high vantage point, the Stoneclimber launches itself at a target, using gravity and momentum to deliver a devastating impact combined with claw and bite attacks.

## Special Abilities

### Cliffhanger Supremacy

The Stoneclimber traverses all terrain as though it were level ground. Vertical cliff faces, ceilings, overhangs, and unstable surfaces all provide equivalent mobility. In rocky terrain, the creature's movement speed increases, and it can assume positions that would be impossible for other creatures.

### Environmental Camouflage

In rocky terrain, the Stoneclimber's scales blend so perfectly with stone that spotting it requires exceptional perception. In its preferred environment, the creature is essentially invisible until it chooses to reveal itself.

### Predatory Awareness

The Stoneclimber is perfectly attuned to its environment, reading stone and terrain with uncanny precision. In rocky environments, it knows the location and nature of every potential escape route, hiding spot, and vantage point within a considerable radius.

### Resilient Frame

The Stoneclimber's body is as tough as the stone it climbs, resistant to environmental hazards that would kill lesser creatures. It survives falls that would be fatal to humans, endures extremes of temperature, and regenerates slowly from wounds.

## Additional Information

Fire is the Stoneclimber's primary weakness—flames damage its scales, disrupt its climbing grip, and seem to cause it genuine discomfort and pain. Sustained heat will drive a Stoneclimber away from an area. Magic is also effective, particularly spells that would prevent climbing or dull its environmental perception. In flat, open terrain without stone or complex geometry, a Stoneclimber loses much of its advantage and becomes a comparatively normal predator. The creature's scales, if harvested carefully, can be fashioned into armor of exceptional quality that retains the creature's natural stone-gray coloration and grants modest resistance to physical damage. Its claws are prized by climbers and trappers as grappling tools. The creature's bones, being partially mineralized, make excellent tool hafts or construction materials.

## Attributes

- **Strength:** 15-20 (1d6+14)

- **Endurance:** 15-20 (1d6+14)

- **Dexterity:** 14-17 (1d4+13)

- **Agility:** 14-17 (1d4+13)

- **Perception:** 15-20 (1d6+14)

- **Aura:** 7-12 (1d6+6)

- **Will:** 14-17 (1d4+13)

- **Reasoning:** 10-13 (1d4+9)

- **Creativity:** 10-13 (1d4+9)
