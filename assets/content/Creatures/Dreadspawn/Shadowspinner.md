---
aliases:
    - Shadowspinner
tags:
    - dreadspawn
name:
    full: Shadowspinner
    aliases: []
id: 0zzYLJWzwisk1CDQ
img: icons/game-icons/carl-olsen/spider-alt.svg
portrait: ""
shortcode: shdwspnn
type: creature
package: sohl
sohl:
    kbcat: dreadspawn
    archetype: 0
    attributes:
        str: 16
        end: 18
        dex: 20
        agl: 16
        per: 16
        aur: 12
        wil: 16
        rea: 14
        cre: 14
    attrRollFormula:
        str: 1d4+13
        end: 1d6+14
        dex: 1d6+16
        agl: 1d4+13
        per: 1d4+13
        aur: 1d4+9
        wil: 1d4+13
        rea: 1d6+10
        cre: 1d6+10
    body:
        structure:
            zones:
                - name: Cephalothorax
                  shortcode: cephzone
                  probWeight: 3
                - name: Abdomen
                  shortcode: abdomenzone
                  probWeight: 3
                - name: Legs
                  shortcode: legszone
                  probWeight: 4
            parts:
                - name: Cephalothorax
                  shortcode: cephpart
                  bodyZoneCode: cephzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Abdomen
                  shortcode: abdomenpart
                  bodyZoneCode: abdomenzone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Legs
                  shortcode: llegspart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Right Legs
                  shortcode: rlegspart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
            locations:
                - name: Cephalothorax
                  shortcode: cephloc
                  bodyPartCode: cephpart
                  bleedingSusceptibility: low
                  amputability: none
                  shockValue: 4
                  probWeight: 7
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Fangs
                  shortcode: fangloc
                  bodyPartCode: cephpart
                  bleedingSusceptibility: low
                  amputability: high
                  shockValue: 2
                  probWeight: 3
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: abdomenpart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Legs
                  shortcode: llegsloc
                  bodyPartCode: llegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Legs
                  shortcode: rlegsloc
                  bodyPartCode: rlegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
        weight:
            base: 1
            calc: 1
        reachBase: 0
        bodyScaleBase: 1.28
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
              masteryLevelBase: 80
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 80
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 42
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 64
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 43
        - name: Venomous Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 64
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
                      modifier: 3
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
        - name: Raking Limbs
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 64
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Raking Limbs
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 2
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
---

# Appearance {#appearance}

You feel it before you see it—a sudden, terrible weight pressing against your chest as though the very shadows have turned solid and begun to strangle. Then you see them, or rather you see the absence—walls of something too dark to be spider silk, hung from corner to corner of the chamber, blocking light and obscuring sight. And within those walls of woven shadow, a shape moves with predatory grace—a spider the size of a horse, its body armored in gleaming black chitin, its eight eyes burning like poisonous topazes. The sound of its mandibles is the sound of bone breaking, and the silk it trails behind it seems to drink in light itself, leaving darker shadows than the surrounding darkness.

# Dossier {#dossier}

Shadowspinners are apex arachnids corrupted by some infernal magic into creatures of terrible intelligence and supernatural predation. These creatures do not merely hunt—they engineer elaborate traps that serve not only to capture prey but to break the spirit of those who see them. A Shadowspinner weaves webs that are not simply sticky but seem to actively drink light and hope, webs that can hold a grown warrior immobilized for weeks. They haunt deep caves, sunken ruins, and places so dark that normal light seems to turn sick and dim. A Shadowspinner's presence is said to drive other creatures away; few things will venture into a chamber ruled by one of these monsters.

## Presentation

A Shadowspinner measures roughly 10 to 14 feet in length with a legspan of 20 to 30 feet or more. Its body is covered in plates of glossy black chitin that seem to absorb light, and its legs are jointed and furred with what appears to be metallic, almost fur-like hair that catches light like obsidian filaments. Its head bears eight eyes arranged in two groups of four, each eye glowing with a faint, sickly luminescence—some amber, some violet, some a sickly phosphorescent white. Its mandibles are tremendous, capable of grinding through bone, and they glisten with venom that seems to smoke faintly in warm air. Most distinctive are its spinnerets, which produce webs of impossible strength and darkness—thread so black it seems to be liquid shadow made solid. The creature moves with eerie grace on its jointed legs, and the sound is of chitinous plates scraping together, or sometimes of something more like wind whispering through a graveyard.

## Key Behaviors

A Shadowspinner claims a territory and then systematically transforms it into a web-fortress of staggering complexity. It spends much of its time constructing and maintaining the web, building in geometric patterns that seem almost mathematical in their precision. The creature is solitary, fiercely territorial, and will attack other Shadowspinners on sight. It hunts by detecting vibrations in its web—minute tremors from struggling prey are like music to it. An ancient Shadowspinner may spend decades in a single location, its web growing ever larger and more complex until the entire chamber or cavern is a three-dimensional labyrinth of predatory silk.

## Combat Strategy

A Shadowspinner initiates combat by assuming a position in its web where it has maximum mobility and advantage. It moves with speed that seems wrong for an insect of its size, using its limbs to hang, swing, and position itself with three-dimensional combat awareness. It uses the web itself as a weapon, tightening strands around prey, creating barriers, and manipulating the environment to its advantage. The creature is intelligent enough to recognize overwhelming force and will attempt to retreat deeper into its web or sever key threads to collapse sections and slow pursuit. When cornered or protecting its nest, it attacks with venomous bites and slashing limbs in a coordinated dance of predation.

## Attack Methods

### Venomous Bite

The Shadowspinner's mandibles snap forward with terrible force, driving long chelicerae deep into flesh and injecting a potent neurotoxin that begins working immediately. Bitten targets experience spreading numbness and progressive paralysis.

### Raking Limbs

The creature's legs are weaponized, tipped with natural points that can pierce armor and rip through flesh. Multiple limbs can strike simultaneously, and the Shadowspinner uses them in coordinated patterns difficult to defend against.

### Web Entanglement

The creature uses its web not as a passive trap but as an active weapon, tightening strands around prey, constricting, and creating hazardous terrain that impedes movement and prevents escape.

## Special Abilities

### Web Mastery

The Shadowspinner commands its web with complete perfection, capable of manipulating tension, creating new connections, or severing old ones instantly. The web can bear enormous weight, stretch to surprising distances, and move in response to the creature's will.

### Vibration Sense

The Shadowspinner perceives the world primarily through vibrations in its web, detecting even microscopic movements with precision. In its web, it essentially has perfect awareness of everything touching it, and attempting to hide from it is futile.

### Predatory Intellect

The Shadowspinner demonstrates genuine intelligence and planning ability. It remembers prey that escape, learns patterns, and designs increasingly sophisticated traps. It has been known to alter its behavior based on the weapons or tactics of repeating opponents.

### Venom Resistance

The Shadowspinner is immune to most poisons and venoms, allowing it to feed on creatures that would be lethal to other animals.

## Additional Information

Fire is the Shadowspinner's primary weakness—flame damages its web immediately, destroys its exoskeleton, and seems to cause genuine panic in the creature. A sufficiently large fire can drive a Shadowspinner to abandon its territory entirely. The silk itself, if harvested carefully before the creature dies, is extraordinarily valuable—capable of holding tremendous weight and naturally resistant to most damage. Dark scholars and assassins prize Shadowspinner silk for creating nets, bindings, and armor. The creature's fangs can be crafted into weapons that retain venom for years. Entire careers have been built by hunters who specialize in raiding Shadowspinner territories, removing the creature, and harvesting its web and body parts—though the casualty rate for such work is terrifyingly high.

## Attributes

- **Strength:** 14-17 (1d4+13)

- **Endurance:** 15-20 (1d6+14)

- **Dexterity:** 17-22 (1d6+16)

- **Agility:** 14-17 (1d4+13)

- **Perception:** 14-17 (1d4+13)

- **Aura:** 10-13 (1d4+9)

- **Will:** 14-17 (1d4+13)

- **Reasoning:** 11-16 (1d6+10)

- **Creativity:** 11-16 (1d6+10)
