---
aliases:
    - Mammoth Centipede
tags:
    - animal
name:
    full: Mammoth Centipede
    aliases: []
id: DQLxBAAPzYaUa5K2
slug: mammoth-centipede
img: icons/game-icons/lorc/centipede.svg
portrait: ""
shortcode: mmmthcnt
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 11
        end: 12
        dex: 14
        agl: 16
        per: 14
        aur: 9
        wil: 12
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d4+8
        end: 1d6+8
        dex: 1d6+10
        agl: 1d6+12
        per: 1d6+10
        aur: 1d4+6
        wil: 1d6+8
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Forebody
                  shortcode: torsozone
                  probWeight: 5
                - name: Hindbody
                  shortcode: hindbodyzone
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
                - name: Forebody
                  shortcode: forebodypart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Hindbody
                  shortcode: hindbodypart
                  bodyZoneCode: hindbodyzone
                  roles:
                      - core
                      - locomotor
                  canHoldItem: false
                  probWeight: 6
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindbodyzone
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
                  probWeight: 4
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: forebodypart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: hindbodypart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
        weight:
            base: 100
            calc: "100"
        reachBase: 0
        bodyScaleBase: 1
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 40
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
              masteryLevelBase: 60
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 30
        - name: Venomous Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 66
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Venomous Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
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
                      poison: true
        - name: Constricting Coil
          type: skill
          system:
              shortcode: grab
              subType: combattechnique
              masteryLevelBase: 71
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: grab
                  name: Constricting Coil
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 11
                      aspect: blunt
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
                      constrict: true
---

# Appearance {#appearance}

The vibration through the stone reaches you first—a rhythmic, undulating pulse like a second heartbeat in the earth itself. Then you see it: segment after segment of dark, chitinous plating emerging from the shadows, each plate slightly overlapping the next, rippling with an alien, fluid motion. The creature's antennae wave at the air, blindly seeking, and the sound of hundreds of tiny clawed feet pattering against stone fills the darkness. The mandibles—large, serrated, dripping something that glimmers faintly—open and close with a horrifying clacking sound. The smell is acrid, almost chemical, accompanied by the distinctive musk of something purely predatory and utterly inhuman.

# Dossier {#dossier}

The Mammoth Centipede is a large arthropod measuring 5-8 feet in length and weighing 10-20 pounds, composed of numerous overlapping body segments each bearing a pair of legs. The body is covered in dark, glossy chitinous plates ranging in color from deep brown to near-black, with paler stripes sometimes visible between segments. The head is proportionally small, dominated by large mandibles and a pair of long, thin antennae. The final pair of legs, called cerci, are extended backward to sense threats from behind.

## Presentation

Each segment of the centipede's body is protected by overlapping plates that provide armor and flexibility. The body tapers slightly from front to rear, allowing it to navigate tight spaces. The antennae are extraordinarily long—sometimes nearly as long as the body itself—and are covered in sensory hairs that detect vibration, temperature, and chemical signals. The mandibles are serrated and curved, designed to pierce and crush chitinous exoskeletons but equally effective against fleshy prey. The legs number in the dozens, each tipped with a small claw for purchase on any surface. Between the segments, glimpses of the softer, pale internal tissue are visible. A distinctive musky odor surrounds the creature.

## Key Behaviors

Mammoth Centipedes are solitary, predatory arthropods that prefer dark, damp environments: caves, deep forest ruins, abandoned structures, and underground waterways. They are primarily nocturnal, retreating during the day into crevices or burrows. They navigate using their antennae to detect vibration and pheromone trails, relying on this sensory input more than vision. They are voracious hunters, stalking prey methodically through darkness and striking with explosive speed. They will consume nearly any creature they can subdue, from insects to small mammals and reptiles.

## Combat Strategy

Centipedes employ ambush and speed to advantage, positioning themselves along known prey trails in darkness and striking when prey comes within reach. The opening attack is always the venomous bite, aimed at the head or closest vital area to inject paralytic venom. Once venom has done its work and prey has stopped moving, the centipede uses its body to coil around the victim, compressing to crush bone or exoskeleton before feeding. If threatened directly, a centipede will either flee upward (if on a vertical surface) or coil defensively with fangs forward.

## Attack Methods

### Venomous Bite

The centipede lunges with mandibles extended, striking at the closest vital area and immediately injecting venom; the bite deals piercing damage and progressive paralytic toxin that renders the victim increasingly immobilized, potentially causing complete paralysis.

### Constricting Coil

For prey smaller than itself — small mammals, reptiles, and the like — the centipede uses its body length to wrap around the victim, compressing with surprising force; constricted prey takes crushing damage each round and must make a strength check to break free. The coil is rarely effective against a humanoid-sized opponent, but it can pin a limb or trap an arm against the body, leaving the victim open to repeated bites.

## Special Abilities

### Wall Climber

The Mammoth Centipede can traverse vertical and inverted surfaces at full speed, using its many legs for perfect grip; this allows the centipede to attack from unexpected angles and escape to areas opponents cannot easily reach.

### Vibration Sense

The centipede's antennae allow it to detect vibrations through solid matter, stone, and water, giving it a nearly perfect awareness of prey movements even in absolute darkness; it gains bonuses to detecting hidden or invisible creatures.

### Paralytic Venom

The venom injected through the centipede's bite is a powerful neurotoxin designed to incapacitate prey; victims experience immediate damage and progressive paralysis that can render them completely immobilized if the venom is potent enough.

## Attributes

- **Strength:** 9-12 (1d4+8)

- **Endurance:** 9-14 (1d6+8)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 13-18 (1d6+12)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 7-10 (1d4+6)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
