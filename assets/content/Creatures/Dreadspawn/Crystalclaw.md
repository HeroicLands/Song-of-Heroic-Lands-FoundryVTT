---
aliases:
    - Crystalclaw
tags:
    - dreadspawn
name:
    full: Crystalclaw
    aliases: []
id: aR2QPYkOiyPmVC4k
slug: crystalclaw
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 24
        end: 14
        dex: 16
        agl: 18
        per: 14
        aur: 10
        wil: 12
        rea: 10
        cre: 8
    attrRollFormula:
        str: 1d6+21
        end: 1d6+10
        dex: 1d4+13
        agl: 1d6+14
        per: 1d6+10
        aur: 1d6+6
        wil: 1d4+9
        rea: 1d6+6
        cre: 1d6+4
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 4
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 2
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
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
                  probWeight: 9
                - name: Right Hind Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 9
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindqtrzone
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
                  probWeight: 4
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
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
                  probWeight: 5
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
                  probWeight: 3
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
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
            base: 1050
            calc: "1050"
        reachBase: 0
        bodyScaleBase: 1.66
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 4
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
              masteryLevelBase: 75
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
              masteryLevelBase: 64
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 48
        - name: Razor Claws
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 76
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Razor Claws
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 6
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
        - name: Crystal Shard Projection
          type: skill
          system:
              shortcode: spray
              subType: combattechnique
              masteryLevelBase: 76
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: spray
                  name: Crystal Shard Projection
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 7
                      aspect: edged
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 25
                  drawBase: 0
                  traits: {}
---

# Appearance {#appearance}

Light fractures and scatters as something moves through the shadows—a shape of impossible geometry, faceted and radiant. Every color of the spectrum glints from its surfaces as it turns, and the air shimmers with refracted light that makes your eyes water. You hear it before you fully see it: a crystalline chiming, like bells or wind-chimes, with each movement. Then those eyes—bright, burning sapphire—find you, and you understand it has always been watching.

# Dossier {#dossier}

Crystalclaws are born where raw magic concentrates in the earth, creatures of pure mineral and living light. These apex predators of crystalline caverns are living weapons of razor edges and blinding radiance. Adventurers encounter them in gem-rich underground environments, mineral-saturated cave systems, and places where magical energies have crystallized into physical form.

## Presentation

The Crystalclaw resembles a large feline predator—roughly six to eight feet in length—but composed entirely of faceted crystal rather than flesh. Its body refracts light into overlapping spectra of color; its actual hue shifts depending on angle and ambient light, ranging from clear crystal to amethyst to aquamarine. Every surface is geometrically angular, with sharp edges and points. Its claws are elongated, razor-sharp crystal edges capable of cutting through stone and steel. Its eyes glow with inner light—sapphire-bright and intelligent. Movement produces a soft, melodic chiming as crystalline surfaces scrape past one another. A faint luminescence surrounds it in darkness.

## Key Behaviors

The Crystalclaw is a solitary, territorial hunter that claims vast underground cavern systems as its domain. It patrols boundaries methodically and attacks any intrusion. Unlike beasts driven by hunger, the Crystalclaw seems to hunt for the joy of the hunt itself—for the movement, the refraction of light through violence, the song of crystal striking stone. It demonstrates remarkable intelligence in understanding prey behavior and adapting tactics. It hunts most actively in daylight when its light-based abilities are most effective, becoming partially dormant in prolonged darkness.

## Combat Strategy

The Crystalclaw attacks with fluid grace and devastating speed. Its preferred tactic is to use blinding flashes to disorient prey, then close the distance rapidly with razor claws. If the initial strike does not wound severely, it withdraws briefly to emit another disorienting flash before attacking again. It uses terrain to drive prey toward dangerous edges or into positions where visibility is compromised. It does not flee; it fights until victorious or destroyed.

## Attack Methods

### Razor Claw Strikes

The creature slashes with its four-clawed limbs in rapid, precise succession. These attacks deliver both physical trauma and can open severe lacerations due to the razor sharpness of crystalline edges.

### Crystal Shard Projection

The Crystalclaw can detach and propel razor-edged shards of its own body at prey. These shards travel at high speed and can penetrate armor; the creature can produce multiple shards in succession.

### Blinding Flash

The creature channels light through its crystalline body and releases it as a blinding burst of radiance. Targets struck by this flash suffer disorientation and impaired vision lasting several rounds. The ability is most effective in daylight or when light sources are available.

## Special Abilities

### Refractive Concealment

The Crystalclaw can bend light through its faceted body, rendering itself difficult to target. This ability functions as both defense and camouflage; in environments with complex light patterns or shadows, the creature becomes nearly invisible despite its obvious crystal form.

### Crystal Durability

The creature’s body is composed of material harder than most stone and harder than steel. It is extremely resistant to slashing and piercing damage. However, this same rigid structure makes it vulnerable to vibration, shock, and sonic attacks—anything that can cause the crystal lattice to resonate and fracture.

### Luminous Emission

The Crystalclaw produces its own light, allowing it to navigate and hunt in complete darkness. It can also dim this luminescence for concealment or intensify it for dramatic effect—a predator that enjoys the performance of the hunt.

## Additional Information

Sonic attacks, high-pitched sounds, and vibration-based effects are the Crystalclaw’s primary weakness. Coordinated blunt-force trauma, specifically hammer strikes or impact spells designed to generate internal resonance, can shatter the creature’s body. Creatures wearing sound-dampening or protective eyewear gain advantage against its blinding flashes. Crystalclaws seem drawn to light-based magic and sources of magical radiation; they sometimes remain in areas of high magical concentration regardless of prey availability.

## Attributes

- **Strength:** 15-20 (1d6+14)

- **Endurance:** 11-16 (1d6+10)

- **Dexterity:** 14-17 (1d4+13)

- **Agility:** 15-20 (1d6+14)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 7-12 (1d6+6)

- **Will:** 10-13 (1d4+9)

- **Reasoning:** 7-12 (1d6+6)

- **Creativity:** 5-10 (1d6+4)
