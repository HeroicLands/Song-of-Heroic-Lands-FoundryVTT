---
aliases:
    - Stormseer
tags:
    - elemental
name:
    full: Stormseer
    aliases: []
id: TXoRX749dQrUkWYC
slug: stormseer
img: icons/game-icons/lorc/werewolf.svg
portrait: ""
shortcode: strmsr
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 9
        end: 13
        dex: 13
        agl: 15
        per: 15
        aur: 13
        wil: 11
        rea: 11
        cre: 13
    attrRollFormula:
        str: 1d4+6
        end: 1d4+10
        dex: 1d4+10
        agl: 1d4+12
        per: 1d4+12
        aur: 1d4+10
        wil: 1d4+8
        rea: 1d4+8
        cre: 1d4+10
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 3
                - name: Left Wing
                  shortcode: lwingzone
                  probWeight: 3
                - name: Body
                  shortcode: torsozone
                  probWeight: 6
                - name: Right Wing
                  shortcode: rwingzone
                  probWeight: 3
                - name: Hindquarters
                  shortcode: hindqtrzone
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
                - name: Left Wing
                  shortcode: lwingpart
                  bodyZoneCode: lwingzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Body
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Right Wing
                  shortcode: rwingpart
                  bodyZoneCode: rwingzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Left Leg
                  shortcode: llegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 5
                - name: Right Leg
                  shortcode: rlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                      - manipulator
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
                  probWeight: 4
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
                  probWeight: 6
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
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
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
                  probWeight: 4
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
                - name: Left Leg
                  shortcode: llegloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Leg
                  shortcode: rlegloc
                  bodyPartCode: rlegpart
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
        bodyScaleBase: 0.88
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
          feetPerRound: 110
          leaguesPerWatch: 12
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 65
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 65
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 36
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 28
        - name: Gust of Wind
          type: skill
          system:
              shortcode: ram
              subType: combattechnique
              masteryLevelBase: 45
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: ram
                  name: Gust of Wind
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 8
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
        - name: Lightning Strike
          type: skill
          system:
              shortcode: bolt
              subType: combattechnique
              masteryLevelBase: 55
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: bolt
                  name: Lightning Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
                      aspect: fire
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 120
                  drawBase: 0
                  traits: {}
---

# Appearance {#appearance}

High above, the air itself becomes uncertain. What you see is a shape wreathed in clouds and lightning—vaguely bird-like, massive, composed of storm and electricity. Around it, the air crackles with potential energy, and the smell of ozone grows strong. Thunder rumbles at its approach, not in sequence but seeming to come from the creature itself. Lightning dances between its limbs and wings, and where its gaze falls, hair stands on end and static electricity tingles across skin.

# Dossier {#dossier}

Stormseers are elementals of sky and electricity, born from violent storms and drawing strength from tempestuous weather. They are intelligent and arrogant, regarding ground-dwelling creatures as primitives beneath serious consideration. A Stormseer in a region typically indicates incoming severe weather, and some scholars believe the creature's presence actually causes storms to develop. They are territorial about sky and weather and will attack aircraft or attempts to control weather in their territory. A Stormseer is a genuine threat to settlements, capable of calling down lightning strikes and creating deadly storms.

## Presentation

A Stormseer is roughly eagle-shaped but massively larger—a wingspan of thirty feet or more—and composed of thunderclouds and electrical energy. Its body is visible only because of the lightning that plays through and around it, outlining a distinctly avian shape. Its eyes are bright points of electrical discharge. Where it flies, thunder follows, and the air becomes charged with static. Rain and wind seem to swirl around it without necessarily touching the creature itself.

## Key Behaviors

Stormseers are territorial about open sky and about weather patterns within their domain. They are highly intelligent and seem to understand human activity. They view ground-dwelling creatures with disdain but will attack if provoked or if humans attempt to interfere with weather in their territory. They are most active during storms and seem to draw strength and energy from severe weather. Some evidence suggests that multiple Stormseers can work together to coordinate weather patterns, creating unprecedented storms.

## Combat Strategy

A Stormseer fights from the air, using its speed and distance advantage to unleash lightning attacks while evading counterstrikes. It will use wind to buffet and knock down opponents, and it will create localized storms to increase hazards and restrict visibility. Against opponents with strong electrical resistance or earth-based magic, it becomes more cautious and may disengage. It will rarely descend to ground level to fight directly, preferring to maintain aerial advantage.

## Attack Methods

### Lightning Strike

The Stormseer calls down bolts of electricity that strike with devastating force. A direct hit can kill a human instantly, and even indirect strikes cause severe burns and muscle disruption. Multiple lightning strikes can immolate an area and ignite flammable materials.

### Gust of Wind

The Stormseer generates massive wind gusts that can knock opponents off their feet, blow away unattached objects, or redirect projectiles. The wind is used both as attack and as defense or escape mechanism.

### Thunder Clap

The Stormseer creates a shockwave of sound and force by clapping its wings or releasing built-up electrical energy. The effect is deafening and can cause physical damage from the force of the blast.

### Storm Generation

The Stormseer can cause localized storms to develop, complete with heavy rain, severe wind, lightning, and thunder. The storm is centered on the creature and follows it, creating increasingly difficult fighting conditions.

## Special Abilities

### Aerial Mastery

The Stormseer is supremely at home in the sky and maintains incredible speed and maneuverability in the air. Ground-based creatures cannot effectively pursue it, and it gains tremendous advantages in positioning.

### Lightning Affinity

The Stormseer is immune to electrical damage and heals from lightning-based magic. It can sense electrical currents and navigate in complete darkness by sensing electromagnetic fields.

### Storm Creation

The Stormseer can cause or enhance storms in its vicinity. Over extended time in a region, it can cause a localized area to experience perpetual storm conditions.

### Electrical Sensitivity

The Stormseer can sense atmospheric electricity and seems to predict the locations of living creatures by their bioelectrical fields. It cannot be hidden from by normal concealment.

### Thunder's Echo

When the Stormseer generates thunder, the sound carries magical force and can stun or disorient opponents even if they cannot hear it clearly.

## Additional Information

Earth-based magic and sonic-based magic are most effective against a Stormseer, as they disrupt its electrical form and can scatter its cohesion. Grounding rods and structures designed to conduct electricity safely can reduce the threat of its lightning. A Stormseer destroyed during calm weather may not reform, but one destroyed during a storm will likely return. A Stormseer can be drawn away from a settlement by creating atmospheric conditions that attract it to a different location. Some scholars believe that understanding Stormseers is key to predicting and controlling severe weather, but research into this remains dangerous and incomplete.

## Attributes

- **Strength:** 7-10 (1d4+6)

- **Endurance:** 11-14 (1d4+10)

- **Dexterity:** 11-14 (1d4+10)

- **Agility:** 13-16 (1d4+12)

- **Perception:** 13-16 (1d4+12)

- **Aura:** 11-14 (1d4+10)

- **Will:** 9-12 (1d4+8)

- **Reasoning:** 9-12 (1d4+8)

- **Creativity:** 11-14 (1d4+10)
