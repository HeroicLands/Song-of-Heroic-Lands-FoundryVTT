---
aliases:
    - Thunderbird
tags:
    - animal
name:
    full: Thunderbird
    aliases: []
id: cCvH3RbioiVmP5uA
slug: thunderbird
img: icons/game-icons/delapouite/eagle-head.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 36
        end: 31
        dex: 17
        agl: 15
        per: 17
        aur: 13
        wil: 16
        rea: 9
        cre: 7
    attrRollFormula:
        str: 1d6+32
        end: 1d6+27
        dex: 1d6+13
        agl: 1d6+11
        per: 1d6+13
        aur: 1d6+9
        wil: 1d6+12
        rea: 1d4+6
        cre: 1d4+4
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 5
                - name: Left Wing
                  shortcode: lwingzone
                  probWeight: 5
                - name: Body
                  shortcode: torsozone
                  probWeight: 10
                - name: Right Wing
                  shortcode: rwingzone
                  probWeight: 5
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 5
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
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Left Wing
                  shortcode: lwingloc
                  bodyPartCode: lwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Right Wing
                  shortcode: rwingloc
                  bodyPartCode: rwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Left Leg
                  shortcode: llegloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Right Leg
                  shortcode: rlegloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
        weight:
            base: 3000
            calc: "3000"
        reachBase: 0
        bodyScaleBase: 3.27
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
          feetPerRound: 120
          leaguesPerWatch: 14
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: terrestrial
          feetPerRound: 50
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
              masteryLevelBase: 85
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
              masteryLevelBase: 52
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 64
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 85
        - name: Diving Talon Strike
          type: skill
          system:
              shortcode: talon
              subType: combattechnique
              masteryLevelBase: 55
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: talon
                  name: Diving Talon Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 12
                      aspect: edged
                  lengthBase: 4
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
        - name: Crushing Grip
          type: skill
          system:
              shortcode: grab
              subType: combattechnique
              masteryLevelBase: 60
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: grab
                  name: Crushing Grip
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 12
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 36
                      aspect: blunt
                  lengthBase: 4
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
        - name: Beak Strike
          type: skill
          system:
              shortcode: beak
              subType: combattechnique
              masteryLevelBase: 52
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: beak
                  name: Beak Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 13
                      aspect: piercing
                  lengthBase: 4
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

The sky darkens in a way that has nothing to do with clouds, and the sound hits before sight: a shriek that seems to split reality itself, followed by the deafening crack of thunder that leaves your ears ringing. The shadow that falls across you is impossibly vast, and then you see it clearly: wings spanning scores of feet, dark as midnight with streaks of iridescent blue and silver that shimmer like lightning frozen in feathers. The eyes are burning gold fixed upon you with predatory assessment. The talons visible beneath are the size of a man's hand, curved and terrible. As it banks, the air itself seems to hum with energy, and you understand with immediate and absolute certainty that you are being evaluated as prey by something that exists at the apex of power.

# Dossier {#dossier}

The Thunderbird is an enormous bird of prey standing as an apex aerial predator with a wingspan of 60-80 feet, found in mountain peaks, deep canyons, and high-altitude regions where thermal currents provide lift. These solitary, territorial creatures prefer stormy weather where wind currents enhance their supernatural agility. Adventurers encounter thunderbirds only in the most remote, dangerous locations and only when venturing into the creature's claimed territory.

## Presentation

The Thunderbird is a massive raptor with dark plumage ranging from deep black to charcoal, streaked with iridescent blue and silver that shifts with movement like captured lightning. The feathers are dense and structured, providing both insulation and weather resistance. The wings are proportionally enormous, with powerful flight muscles and extended feather structures designed for achieving high speeds and maneuverability despite the bird's massive size. The head is fearsome, with forward-facing golden eyes that burn with genuine intelligence and a sharp, hooked beak capable of tearing through armor. The talons are massive curved claws designed to seize and crush large prey.

## Key Behaviors

Thunderbirds are solitary, territorial creatures that hunt large prey in high-altitude regions. They are most active during stormy weather when wind currents reach their maximum and the bird's already-exceptional agility receives additional enhancement. They nest on inaccessible peaks and defend their territories aggressively against rival thunderbirds. These creatures are genuinely intelligent and capable of learning and remembering. They are most active during daylight but hunt opportunistically at any time.

## Combat Strategy

The thunderbird's dominance lies entirely in the air, where it uses superior speed, maneuverability, and altitude advantage to deliver devastating diving attacks. It dives from extreme altitude, building tremendous speed, and attempts to seize prey with its talons and lift it airborne. If forced to fight on the ground, the bird's advantage is significantly reduced. The creature will always attempt to return to air when engagement occurs on the ground.

## Attack Methods

### Diving Talon Strike

The thunderbird dives with supernatural speed, using gravity and muscular power to achieve impact that shakes the ground. Talons extended, it attempts to seize and lift prey aloft.

### Crushing Grip

Once prey is seized, the bird's talons crush with enough force to collapse lungs and shatter ribs.

### Beak Strike

Using its powerful hooked beak, the bird strikes with force capable of shattering bone and severing limbs.

## Special Abilities

### Aerial Mastery

The thunderbird is supremely powerful in flight, capable of achieving speeds far exceeding normal flight and maneuvering in three dimensions with grace that defies the bird's massive size.

### Storm Affinity

During storms, the thunderbird's power increases significantly, with wind currents enhancing flight capability and the creature's natural electrical affinity becoming more pronounced.

### Predatory Vision

The bird's eyesight is extraordinary, allowing it to spot movement from miles away and to track prey with supernatural accuracy.

### Lightning Affinity

Some sources suggest thunderbirds possess supernatural electrical affinity, creating visible lightning during flight and potentially using electrical attacks during combat.

### Regenerative Power

The thunderbird heals with remarkable speed, recovering from injuries that would cripple other creatures.

### Additional Information

Thunderbirds are most vulnerable when grounded or in enclosed spaces where they cannot achieve flight. The creatures are rare enough that many scholars question whether they exist or are purely legendary. A thunderbird that has successfully hunted humanoids may develop increasing boldness toward human-occupied lands. The creature's feathers are extraordinarily valuable and can be harvested after death for creation of magical items and powerful armor.

## Attributes

- **Strength:** 33-38 (1d6+32)

- **Endurance:** 28-33 (1d6+27)

- **Dexterity:** 14-19 (1d6+13)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 14-19 (1d6+13)

- **Aura:** 10-15 (1d6+9)

- **Will:** 13-18 (1d6+12)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 5-8 (1d4+4)
