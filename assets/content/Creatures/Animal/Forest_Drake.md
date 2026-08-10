---
aliases:
    - Forest Drake
tags:
    - animal
name:
    full: Forest Drake
    aliases: []
id: TD1mrTArS6vzQzxW
slug: forest-drake
img: icons/game-icons/faithtoken/dragon-head.svg
portrait: ""
shortcode: frstdrk
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 14
        end: 13
        dex: 14
        agl: 15
        per: 15
        aur: 10
        wil: 12
        rea: 9
        cre: 7
    attrRollFormula:
        str: 1d6+10
        end: 1d6+9
        dex: 1d6+10
        agl: 1d6+11
        per: 1d6+11
        aur: 1d4+7
        wil: 1d6+8
        rea: 1d4+6
        cre: 1d4+4
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 4
                - name: Wings
                  shortcode: wingszone
                  probWeight: 4
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 6
                - name: Hindquarters
                  shortcode: hindqtrzone
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
                - name: Left Wing
                  shortcode: lwingpart
                  bodyZoneCode: wingszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Right Wing
                  shortcode: rwingpart
                  bodyZoneCode: wingszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: forelegszone
                  roles: &a1
                      - locomotor
                      - manipulator
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
                  probWeight: 8
                - name: Right Hind Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 8
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - manipulator
                  canHoldItem: false
                  probWeight: 4
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 6
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
                  probWeight: 4
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Wing
                  shortcode: lwingloc
                  bodyPartCode: lwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Wing
                  shortcode: rwingloc
                  bodyPartCode: rwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
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
                  probWeight: 6
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
                  probWeight: 4
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
            base: 1000
            calc: "1000"
        reachBase: 0
        bodyScaleBase: 1.17
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 60
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: aerial
          feetPerRound: 120
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
              masteryLevelBase: 70
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
              masteryLevelBase: 44
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 35
        - name: Fanged Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 70
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Fanged Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
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
        - name: Talon Rend
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 70
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Talon Rend
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 1
                      aspect: edged
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
        - name: Tail Strike
          type: skill
          system:
              shortcode: tail
              subType: combattechnique
              masteryLevelBase: 60
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: tail
                  name: Tail Strike
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
---

# Appearance {#appearance}

The forest seems to shift as your eyes pass across the canopy, a ripple in the green that makes you stop and stare. For a moment you see nothing—then the pattern resolves into scales. Emerald bright yet dappled with lighter shades that mirror the play of leaves in sunlight, the creature becomes visible only once you know it is there. A sinuous form eight feet long coils around a branch, and when it turns its angular head toward you, two luminous yellow eyes open like twin flames. The air grows warm on your face as the creature's nostrils flare, and you hear the sound of scales sliding across bark—a sound like whispered warnings.

# Dossier {#dossier}

The Forest Drake is a semi-arboreal reptilian predator that dominates the canopy and understory of deep woodlands. Though draconic in appearance with scaled hide and vestigial wings, it is a relatively small creature compared to true dragons, rarely exceeding eight feet in total length. These intelligent hunters are solitary and territorial, establishing home ranges within their preferred forest and aggressively defending them from rivals. Adventurers most commonly encounter forest drakes when traveling deep woodlands or when they make the mistake of camping in a drake's territory.

## Presentation

The Forest Drake is a sleek, muscular predator built for arboreal life. Its body is covered in fine, overlapping scales in shades of emerald green, broken by lighter flecks and patterns that create the illusion of foliage and shadow. A row of sharp-tipped spines runs along its spine from neck to the base of its tail, and smaller ridges bracket its eyes, giving it an expression of perpetual alertness. Its forelimbs end in three sharp-curved talons designed for gripping bark and flesh alike. The tail is long and prehensile, muscular enough to support the drake's weight in climbing and ending in a wickedly sharp spine. The head is angular and reptilian with a powerful jaw, and the eyes are large and bright yellow, set to provide excellent forward and lateral vision. The vestigial wings are leathery and colorfully patterned—used for display and thermoregulation rather than flight.

## Key Behaviors

Forest Drakes are solitary and fiercely territorial, with each individual controlling a hunting range of several square miles of old-growth forest. They are primarily nocturnal hunters, though they will hunt in dappled daylight when prey presents itself. The drake spends much of the day coiled on high branches, remaining motionless for hours as it watches the forest floor below. They are omnivorous but primarily carnivorous, hunting birds, small mammals, reptiles, and occasionally larger prey that ventures into their territory. A forest drake is intelligent and will set simple ambushes, recognizing returning prey animals and learning the habits of creatures in their range.

## Combat Strategy

A forest drake's primary tactic is the ambush from above or from dense cover. It will wait in the canopy, then drop onto prey with sudden violence or strike from concealment as prey passes beneath. If the target is small enough to carry, the drake will flee upward toward the canopy; if not, it will press quick, vicious attacks while keeping escape routes open. A forest drake uses the terrain ruthlessly, climbing higher than any land-bound pursuer can follow and using the broken sight lines of the forest to lose trackers. If cornered, a drake fights with total commitment, but it strongly prefers not to—a wounded drake will flee rather than continue a fight it cannot easily win.

## Attack Methods

### Fanged Bite

The drake's bite is powerful and its teeth are sharp backward-curving fangs designed to catch and hold struggling prey. A bite is typically preceded by an attempt to grapple the target with talons and body coils, though a diving drake may bite as its initial attack.

### Talon Rend

A quick, hooking strike with the sharp talons on the drake's forelimbs, raking across the target's body or limbs. These attacks are used to create distance and maintain advantage during a fight.

### Tail Strike

The drake's muscular tail can be brought to bear with significant force, striking like a whip and ending in a sharp spike. This attack is typically used to knock an opponent off balance or to drive them away from the drake's body.

## Special Abilities

### Arboreal Mastery

The Forest Drake moves through the canopy with perfect grace and security—it climbs at full speed without pause or effort, and trees that would be impassable to other creatures are highways for the drake. On the ground, the drake is competent but not exceptional; in its native forest canopy, it has overwhelming tactical advantage.

### Camouflage Scales

The drake's coloration is perfectly adapted to the green and shadow of the forest canopy. When stationary among foliage, the drake requires a careful observation check to spot; when moving, it is easier to detect but still blends remarkably with its surroundings. In full sunlight away from trees, this camouflage advantage is negated.

## Additional Information

Forest Drakes are territorial enough that a character established in their range will face constant low-level predation—missing livestock, disturbing encounters at the margins of civilization, psychological warfare through presence and threat display. Some hunters will take contracts to remove troublesome drakes, though the work is dangerous and the payment poor. A drake's scales are valuable for armor and decoration. Some practitioners of the arcane arts have attempted to communicate with drakes due to their obvious intelligence, with mixed results—drakes seem to understand language but rarely care for bargains.

## Attributes

- **Strength:** 11-16 (1d6+10)

- **Endurance:** 10-15 (1d6+9)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 8-11 (1d4+7)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 5-8 (1d4+4)
