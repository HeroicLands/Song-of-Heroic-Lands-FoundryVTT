---
aliases:
    - Nemespite
tags:
    - dreadspawn
name:
    full: Nemespite
    aliases: []
id: ZSoywGNHpw4z64RZ
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
shortcode: nmspt
type: creature
package: sohl
sohl:
    kbcat: dreadspawn
    archetype: 0
    attributes:
        end: 8
        dex: 13
        agl: 15
        per: 11
        aur: 8
        wil: 9
        rea: 8
        cre: 8
        str: 2
    attrRollFormula:
        end: 1d4+5
        dex: 1d4+10
        agl: 1d4+12
        per: 1d4+8
        aur: 1d4+5
        wil: 1d4+6
        rea: 1d4+5
        cre: 1d4+5
        str: 1d4
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Thorax
                  shortcode: thoraxzone
                  probWeight: 1
                - name: Abdomen
                  shortcode: abdomenzone
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
                - name: Thorax
                  shortcode: thoraxpart
                  bodyZoneCode: thoraxzone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Wing
                  shortcode: lwingpart
                  bodyZoneCode: thoraxzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 2
                - name: Right Wing
                  shortcode: rwingpart
                  bodyZoneCode: thoraxzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 2
                - name: Left Legs
                  shortcode: llegspart
                  bodyZoneCode: thoraxzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
                - name: Right Legs
                  shortcode: rlegspart
                  bodyZoneCode: thoraxzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
                - name: Abdomen
                  shortcode: abdomenpart
                  bodyZoneCode: abdomenzone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 7
                  protectionBase:
                      blunt: -4
                      edged: -5
                      piercing: -6
                      fire: -4
                - name: Mandibles
                  shortcode: mandibloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: low
                  amputability: high
                  shockValue: 2
                  probWeight: 3
                  protectionBase:
                      blunt: -4
                      edged: -5
                      piercing: -6
                      fire: -4
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: thoraxpart
                  bleedingSusceptibility: low
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: -4
                      edged: -5
                      piercing: -6
                      fire: -4
                - name: Left Wing
                  shortcode: lwingloc
                  bodyPartCode: lwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: -4
                      edged: -5
                      piercing: -6
                      fire: -4
                - name: Right Wing
                  shortcode: rwingloc
                  bodyPartCode: rwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: -4
                      edged: -5
                      piercing: -6
                      fire: -4
                - name: Left Legs
                  shortcode: llegsloc
                  bodyPartCode: llegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: -4
                      edged: -5
                      piercing: -6
                      fire: -4
                - name: Right Legs
                  shortcode: rlegsloc
                  bodyPartCode: rlegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: -4
                      edged: -5
                      piercing: -6
                      fire: -4
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: abdomenpart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 8
                  protectionBase:
                      blunt: -4
                      edged: -5
                      piercing: -6
                      fire: -4
                - name: Sting
                  shortcode: stingloc
                  bodyPartCode: abdomenpart
                  bleedingSusceptibility: low
                  amputability: high
                  shockValue: 2
                  probWeight: 2
                  protectionBase:
                      blunt: -4
                      edged: -5
                      piercing: -6
                      fire: -4
        weight:
            base: 80
            calc: 80
        reachBase: 0
        bodyScaleBase: 0.33
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
          feetPerRound: 80
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 50
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 24
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 36
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 52
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 13
        - name: Venomous Sting
          type: skill
          system:
              shortcode: sting
              subType: combattechnique
              masteryLevelBase: 62
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: sting
                  name: Venomous Sting
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -4
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
                      poison: true
---

# Appearance {#appearance}

Something moves at the edge of your vision—impossibly fast, a blur of iridescent color that makes your eyes water. Then you catch the scent, acrid and chemical, that raises every hair on your body. A creature no larger than your fist lands on nearby stone with an audible click, and in the harsh sunlight you see it fully: a nightmare of chitinous segments and articulate limbs, its entire body shimmering with bands of virulent color—warning, threat, death. A stinger curves upward, glistening with viscous liquid that fumes slightly in the air, and you hear a sound like tearing silk as more of them emerge from cracks in the rock around you.

# Dossier {#dossier}

Nemespites are apex insectoid predators that hunt in coordinated packs, their intelligence and venom making them far more dangerous than ordinary insects. Legend holds they were born from some mad sorcerer’s attempt to create a living poison—a creature that is itself the weapon. They are found in warm climates, particularly rocky highlands, deep caves, and regions of magical corruption. A single Nemespite is a serious threat; a swarm is a catastrophe that can strip a humanoid to bones in minutes. The creatures seem to communicate through ultrasonic clicks and chemical pheromones, and they exhibit a hive intelligence that allows coordinated attacks of supernatural precision.

## Presentation

A Nemespite measures roughly 4 to 6 inches from head to tail, resembling a scorpion crossed with a wasp and wrapped in iridescent chitin. Its entire body is segmented, covered in bands of vibrant warning colors—electric blues, acid greens, blood reds, and sickly yellows—arranged in patterns that seem to shift slightly even at rest. Its tail terminates in a downward-curving stinger of terrible sharpness, constantly weeping a translucent venom that fumes faintly in warm air. Six limbs of terrible articulation allow it to move with inhumanly precise speed, and its head bears compound eyes that glow faintly with an unsettling intelligence. When agitated, it emits a low, chirring sound that seems to vibrate in one’s teeth.

## Key Behaviors

Nemespites are primarily diurnal, hunting in the heat of the day when their metabolism is fastest. They establish territories in rocky, complex terrain where they can nest in crevices and hunt among the stones. A healthy hive can number anywhere from a dozen to several hundred individuals, though they also hunt in smaller packs. They exhibit a chilling level of coordination, seeming to track prey communicatively and position themselves for simultaneous attacks. Unlike most insects, Nemespites can survive for weeks without food if necessary, entering a state of dormancy where they require almost no oxygen or sustenance. They are drawn to blood and the smell of wounded creatures, and they will pursue prey with relentless determination.

## Combat Strategy

A single Nemespite is a hit-and-run killer, striking with explosive speed, injecting venom, and withdrawing to let toxins do their work. A pair coordinates their attacks to bracket prey and prevent escape. A swarm employs tactical sophistication that borders on magical—they will herd prey into terrain disadvantages, concentrate their attacks on the weakest target, and shift position to protect wounded individuals or pregnant females. They prefer not to take damage at all, instead relying on speed and venom to kill from a distance. Against overwhelming force, they will retreat to their warren where the complex tunnels and nesting grounds provide defensive advantage.

## Attack Methods

### Venomous Sting

The creature’s curved stinger lashes out with vicious speed, driving deep into exposed flesh and injecting a potent neurotoxin. The venom begins working almost immediately, numbing limbs and clouding thought.

### Pheromone Cloud

When threatened, Nemespites can release a cloud of chemical pheromones that confuses sensory perceptions and attracts more of their kind from considerable distances away. Those breathed in the cloud experience disorientation and burning in the eyes and lungs.

## Special Abilities

### Hive Coordination

Nemespites in proximity to each other function as a single distributed intelligence, coordinating attacks with supernatural precision. A swarm of three or more acts as though guided by a single predatory mind.

### Rapid Regeneration

The Nemespite’s wound rate is exceptionally fast for its size; minor punctures and scratches seal within heartbeats. Only significant trauma or cauterization can prevent it from healing.

### Paralytic Venom

The Nemespite’s venom is a complex cocktail of neurotoxins that do not kill quickly but instead progressively paralyze the victim, rendering them immobile while the creatures feed. Victims remain conscious and aware throughout the process.

## Additional Information

Nemespites are highly vulnerable to cold, becoming sluggish and torpid when temperatures drop. Extreme heat actually seems to energize them, making swarms more active and aggressive. They are susceptible to psychic and mental magic, which seems to disrupt their hive coordination and cause them to attack each other or retreat in panic. The venom itself, while deadly, can be carefully harvested and preserved for alchemical purposes, though doing so requires exceptional care and protective gear. A single vial of purified Nemespite venom is extraordinarily valuable on the black market and lethal in even tiny quantities—a single drop can kill a human in minutes. Some sources suggest that Nemespites have a queen somewhere in their warren, and that killing the queen will cause the hive to collapse into mindless chaos; however, the location of these queens is unknown, and they are defended with fanatical intensity.

## Attributes

- **Endurance:** 6-9 (1d4+5)

- **Dexterity:** 11-14 (1d4+10)

- **Agility:** 13-16 (1d4+12)

- **Perception:** 9-12 (1d4+8)

- **Aura:** 6-9 (1d4+5)

- **Will:** 7-10 (1d4+6)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 6-9 (1d4+5)
