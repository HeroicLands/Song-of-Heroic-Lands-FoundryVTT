---
aliases:
    - Glass Lizard
    - creature-glsslzrd
tags:
    - animal
name:
    full: Glass Lizard
    aliases: []
description: "A sleek, semi-arboreal reptilian predator over ten feet long, blending into rocky scrubland where it basks by day and hunts by night."
id: UvyV0EEhmSwlCuSW
img: icons/game-icons/lorc/gecko.svg
portrait: images/being/glsslzrd-portrait.webp
shortcode: glsslzrd
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 11
        end: 12
        dex: 15
        agl: 16
        per: 14
        aur: 9
        wil: 11
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+7
        end: 1d6+8
        dex: 1d6+11
        agl: 1d6+12
        per: 1d6+10
        aur: 1d4+6
        wil: 1d6+7
        rea: 1d4+4
        cre: 1d4+3
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
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 2
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
        weight:
            base: 20
            calc: "20"
        reachBase: 0
        bodyScaleBase: 1
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 2
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
              masteryLevelBase: 30
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 36
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 30
        - name: Quick Strike Bite
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
                  name: Quick Strike Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 1
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
        - name: Tail Lash
          type: skill
          system:
              shortcode: tail
              subType: combattechnique
              masteryLevelBase: 62
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: tail
                  name: Tail Lash
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -2
                      aspect: blunt
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

At first you think you're seeing a shimmer in the heat—a distortion in the air that makes you squint. Then it moves, and your eyes struggle to track it. The creature is impossibly long and slender, snake-like but distinctly scaled in a way that catches and fractures light into dazzling patterns. The coloration is metallic—golds, silvers, and subtle iridescence that changes based on the angle of the light. The head is sharp and triangular, and when it opens its mouth to hiss, you see rows of small, needle-like teeth. The forked tongue flicks out repeatedly, tasting the air, and there's an intelligence in the creature's eyes that you would not expect from something so alien. When it moves, it moves with shocking speed, almost faster than you can follow.

# Dossier {#dossier}

The Glass Lizard is a semi-arboreal reptilian predator that has evolved remarkable adaptations to blend into its environment. Growing to ten feet or more in length, these creatures are sleek hunters that prefer rocky terrain, scrublands, and sparse forest. They are primarily nocturnal but bask extensively during daylight hours on warm rocks and cliff faces. These are solitary creatures that establish small hunting territories and defend them with territorial aggression.

## Presentation

The Glass Lizard is an elegant creature built entirely for speed and predation. The body is long, slender, and entirely legless, more snake-like than typical lizards. The scales are highly polished and refractive, creating a shimmering appearance that varies from gold to silver to copper depending on light angle and the creature's emotional state. The scales are hard and smooth, refracting light in ways that make the lizard difficult to visually track in sunlight. The head is triangular and tapered to a sharp point, with forward-facing eyes that provide excellent binocular vision. The mouth is filled with sharp, backward-curving teeth designed to catch and hold prey. The tail is long and comprises much of the creature's total length, and it can be shed in segments if the creature is threatened.

## Key Behaviors

Glass Lizards are diurnal baskers that spend much of the day thermoregulating on warm rocks and exposed surfaces. They hunt primarily at dawn and dusk, when prey is abundant and they are not visible against the sun. A hunting glass lizard is an efficient predator that can cover considerable distances while searching for small mammals, birds, and other reptiles. They are primarily predatory but will consume carrion if it's available. They are solitary and establish small territories that they patrol regularly. During mating season, males become notably more aggressive and territorial.

## Combat Strategy

A Glass Lizard prefers to strike quickly and retreat if the target is dangerous—it bites, attempts to swallow if the prey is small, and retreats to await the prey's weakening if the target is larger. If forced to defend itself against a threat, the lizard lashes with its tail and attempts to flee, dropping portions of its tail as distraction. A glass lizard has no real capacity for sustained combat and relies entirely on speed and agility to avoid conflict. A captured glass lizard will bite desperately and shed its tail, leaving the tail writhing as a distraction while the lizard escapes.

## Attack Methods

### Quick Strike Bite

A rapid, precise bite targeting small prey or soft tissue on larger prey. The backward-curving teeth are designed to catch and hold, and the lizard attempts to swallow whole if the prey is small.

### Tail Lash

The long tail is brought to bear as a striking weapon, creating sharp impacts that are more painful than dangerous. The tail is also used as a balance and climbing tool.

## Special Abilities

### Light Refraction Camouflage

The Glass Lizard's polished, refractive scales scatter and bend light in ways that make the creature difficult to visually track, especially in bright sunlight. A stationary glass lizard is nearly invisible in certain lighting conditions.

### Tail Autotomy

When threatened or cornered, the Glass Lizard can shed portions of its tail—the severed tail continues to wriggle and thrash, distracting predators while the lizard escapes. The tail regrows slowly over weeks or months.

## Additional Information

Glass Lizards are sometimes captured for collections, as their unique appearance makes them valuable as exotic pets. The creatures are not particularly long-lived compared to other reptiles. In some regions, glass lizards are considered harbingers of drought or heat—their appearance signals the driest times of year.

## Attributes

- **Strength:** 8-13 (1d6+7)

- **Endurance:** 9-14 (1d6+8)

- **Dexterity:** 12-17 (1d6+11)

- **Agility:** 13-18 (1d6+12)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 7-10 (1d4+6)

- **Will:** 8-13 (1d6+7)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
