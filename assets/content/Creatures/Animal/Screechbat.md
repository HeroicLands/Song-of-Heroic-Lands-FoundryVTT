---
aliases:
    - Screechbat
tags:
    - animal
name:
    full: Screechbat
    aliases: []
id: lHuMVOj4m48jiGcS
slug: screechbat
img: icons/game-icons/delapouite/bat.svg
portrait: ""
shortcode: scrchbt
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 10
        end: 12
        dex: 18
        agl: 20
        per: 16
        aur: 10
        wil: 14
        rea: 12
        cre: 10
    attrRollFormula:
        str: 1d6+6
        end: 1d4+9
        dex: 1d6+14
        agl: 1d6+16
        per: 1d4+13
        aur: 1d6+6
        wil: 1d6+10
        rea: 1d4+9
        cre: 1d6+6
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Body
                  shortcode: torsozone
                  probWeight: 1
                - name: Hindquarters
                  shortcode: hindqtrzone
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
                - name: Left Wing
                  shortcode: lwingpart
                  bodyZoneCode: headzone
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
                  bodyZoneCode: hindqtrzone
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
                  probWeight: 3
                - name: Right Leg
                  shortcode: rlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 3
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindqtrzone
                  roles: []
                  canHoldItem: false
                  probWeight: 4
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 3
                  protectionBase:
                      blunt: 0
                      edged: -1
                      piercing: -2
                      fire: 0
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 2
                  protectionBase:
                      blunt: 0
                      edged: -1
                      piercing: -2
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
                      edged: -1
                      piercing: -2
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
                      edged: -1
                      piercing: -2
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
                      edged: -1
                      piercing: -2
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
                      edged: -1
                      piercing: -2
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
                      edged: -1
                      piercing: -2
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
                      edged: -1
                      piercing: -2
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
                      edged: -1
                      piercing: -2
                      fire: 0
        weight:
            base: 8
            calc: "8"
        reachBase: 0
        bodyScaleBase: 0.94
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
          feetPerRound: 80
          leaguesPerWatch: 6
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 75
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 85
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 36
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 52
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 72
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 28
        - name: Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 65
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 0
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
        - name: Claw Rake
          type: skill
          system:
              shortcode: talon
              subType: combattechnique
              masteryLevelBase: 65
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: talon
                  name: Claw Rake
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: -1
                      aspect: edged
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
---

# Appearance {#appearance}

The sound comes first — a shriek that splits the darkness like a blade, piercing through ears and bone and mind with a force that seems physical. As your senses recoil from the auditory assault, shapes emerge in the darkness above — dark, swift silhouettes silhouetted against the lesser black of the night sky. The wings are leathery and wide, catching what little light exists and reflecting it from their membranes in sickly highlights. Below the wings dangle creatures that are more skeleton than flesh, lean and efficient, with fangs that catch the light like split obsidian. As they circle, the screeching continues — an unbearable chorus that seems designed to break resolve and shatter thought itself.

# Dossier {#dossier}

Screechbats are small, highly coordinated aerial predators standing 2-3 feet tall with wingspans reaching 8-10 feet, found in caves, deep forests, and ruins across many regions. These nocturnal hunters are specialized sound-hunters that use echolocation and sonic weaponization to disorient prey before closing for the kill. Adventurers encounter screechbats most commonly when exploring caves, traversing forests at night, or investigating ruins where bat populations have established.

## Presentation

Screechbats resemble heavily adapted bats scaled up to predatory size and complexity. The wings are large, membranous, and supported by elongated finger bones that extend from a relatively compact body. The body itself is skeletal and lightweight, covered in dark leathery skin that provides minimal insulation. The head is proportionally large with a broad mouth capable of opening remarkably wide, filled with numerous small, sharp teeth designed to grip and bite but not to tear. The eyes are small and relatively weak, but the creature compensates with extraordinary aural and echolocation capabilities. The wings, when at rest, fold around the creature's body for warmth and protection. The feet and claws are sharp and designed for hanging rather than walking.

## Key Behaviors

Screechbats are social creatures that live in colonies and hunt cooperatively in packs. They roost during daylight hours in caves or similar dark shelters, emerging at dusk to hunt. These creatures navigate and hunt entirely through sound, using echolocation to build mental maps and locate prey with uncanny accuracy. They communicate with each other through clicks, chirps, and frequency modulations, creating a complex social structure with clear hierarchies. Screechbats hunt small mammals and birds primarily, but coordinated packs can tackle larger prey. They are relatively intelligent and capable of learning and remembering hunting locations and human-based threats. The creatures are most active during night hours and completely helpless in bright daylight.

## Combat Strategy

The screechbat's primary weapon is sound — the creature uses piercing sonic screeches to disorient, deafen, and psychologically damage targets before moving in for physical attack. A coordinated pack of screechbats creates overwhelming noise that can incapacitate unprepared opponents. Individual screechbats are relatively fragile and avoid physical engagement, preferring to remain aloft and attack from the air. The creatures will attempt to isolate prey from the group and swarm individual targets. If the pack is broken up or significant numbers are lost, the remaining screechbats retreat to darkness.

## Attack Methods

### Sonic Scream

The screechbat emits a focused, high-pitched scream capable of causing pain, disorientation, and temporary deafness in targets. The scream travels in a cone forward of the creature and affects multiple targets simultaneously. The frequency can be modulated and directed somewhat, allowing coordination between screechbats in a pack.

### Bite Attack

Once a target is disoriented or subdued by sonic assault, the screechbat dives in to attack with fangs and claws, attempting to tear exposed flesh or eyes. The bite is used to finish already-incapacitated targets rather than to engage alert opponents.

### Claw Rake

The screechbat's feet possess sharp claws that can rake and tear at exposed flesh if the creature lands on a target. These attacks are used when the bat needs to establish better positioning or when targets are already partially restrained.

## Special Abilities

### Sonic Scream

The screechbat can emit powerful, focused sonic screeches that cause auditory damage, disorientation, and psychological distress in targets. The scream is nearly impossible to defend against in an open environment without magical protection or physical sound-dampening. Multiple screechbats screaming together create overwhelming noise that can incapacitate victims.

### Echolocation Mastery

The screechbat navigates and hunts entirely through sound, creating a mental map of the environment through echo analysis. This allows the creature to hunt effectively in absolute darkness and to detect movement, shape, and position of objects and creatures from distances that should be impossible. Creatures that rely on concealment or darkness are vulnerable to screechbat hunting.

### Aerial Agility

The screechbat's lightweight build and adapted wings allow it to maneuver in three-dimensional space with grace and speed that ground-bound creatures cannot match. The creature is nearly impossible to hit with melee weapons and is supremely confident in aerial combat.

### Pack Coordination

Screechbats communicate with high-frequency vocalizations and can coordinate complex pack hunting strategies. Multiple screechbats working together can execute pincer moves, isolate prey, and create overwhelming pressure through coordinated sonic assault.

### Night Adaptation

The screechbat's eyes, though weak, are adapted for maximum light sensitivity in low-light conditions. The creature can navigate and hunt in near-total darkness but is nearly blinded by sudden bright light.

### Additional Information

Screechbats are most dangerous in large groups and in confined spaces where sonic assault has maximum effect. Individual screechbats or small groups can be handled by prepared opponents. The creatures are vulnerable to silence magic or sound-dampening materials that reduce the effectiveness of their echolocation and sonic weapons. Bright light sources can temporarily blind and disorient screechbats, making daytime or well-lit areas safer for travelers. Some humanoid cultures have learned to coexist with screechbat colonies through careful habitat management and food offerings.

## Attributes

- **Strength:** 7-12 (1d6+6)

- **Endurance:** 10-13 (1d4+9)

- **Dexterity:** 15-20 (1d6+14)

- **Agility:** 17-22 (1d6+16)

- **Perception:** 14-17 (1d4+13)

- **Aura:** 7-12 (1d6+6)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 10-13 (1d4+9)

- **Creativity:** 7-12 (1d6+6)
