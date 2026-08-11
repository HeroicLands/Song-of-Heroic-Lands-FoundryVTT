---
aliases:
    - Giant Spider
tags:
    - animal
name:
    full: Giant Spider
    aliases: []
id: HzxG1auqS4IJfpH1
img: icons/game-icons/carl-olsen/spider-alt.svg
portrait: ""
shortcode: gntspdr
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 15
        end: 13
        dex: 16
        agl: 17
        per: 15
        aur: 10
        wil: 12
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+11
        end: 1d6+9
        dex: 1d6+12
        agl: 1d6+13
        per: 1d6+11
        aur: 1d4+7
        wil: 1d6+8
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Cephalothorax
                  shortcode: cephzone
                  probWeight: 1
                - name: Abdomen
                  shortcode: abdomenzone
                  probWeight: 1
                - name: Legs
                  shortcode: legszone
                  probWeight: 1
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
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Fangs
                  shortcode: fangloc
                  bodyPartCode: cephpart
                  bleedingSusceptibility: low
                  amputability: high
                  shockValue: 2
                  probWeight: 3
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: abdomenpart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Left Legs
                  shortcode: llegsloc
                  bodyPartCode: llegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Right Legs
                  shortcode: rlegsloc
                  bodyPartCode: rlegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
        weight:
            base: 1
            calc: "1"
        reachBase: 0
        bodyScaleBase: 1.22
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
              masteryLevelBase: 70
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 70
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 33
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 40
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 64
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 35
        - name: Venomous Fangs
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
                  name: Venomous Fangs
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 3
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
---

# Appearance {#appearance}

The smell reaches you first: acrid, wrong, the scent of digestive secretions and decaying flesh. You see the web before you see the creator—strands as thick as rope extending across the cavern or dense forest, catching light with an oily sheen. Then movement: something massive moving along a strand with absolute confidence, and your eyes struggle to fully process its size. The body is a bloated orb four feet across, glossy black or dark brown in color, covered in fine bristles that quiver constantly. The legs are impossibly long and articulate, jointed in ways that make your brain hurt to watch. There are eight eyes—arranged across the front of the head, each one catching light and reflecting it back with terrible intelligence. The mouth opens, revealing fangs that glisten with clear venom. The sound it makes—a skittering, clicking, rustling—is the sound of your own death approaching.

# Dossier {#dossier}

The Giant Spider is a masterwork of predatory evolution—a creature that has elevated web-hunting to an art form of terrible sophistication. With a body four feet in diameter and leg spans exceeding twenty feet, a single giant spider dominates a territory through webs and venom. These creatures establish vast web systems within caves, canyons, or dense forests, creating three-dimensional mazes of sticky silk that can trap creatures as large as deer or humanoids. Adventurers most commonly encounter them when entering caves, traversing deep forests, or when a web system forces them to find alternate routes.

## Presentation

The Giant Spider is a creature of nightmarish proportions but distinctive arachnid form. The body (cephalothorax and abdomen) is heavily muscled and bulbous, covered in glossy chitin in colors ranging from jet black to dark brown or rust. Fine hairs cover the exoskeleton, serving sensory functions and creating a rippling effect with movement. Eight long, segmented legs extend from the body, each jointed and tipped with sharp claws designed for climbing and web-walking. The legs have a skeletal, articulate quality that emphasizes the creature's alien nature. The head bears eight large eyes arranged to provide nearly 360-degree vision, with the two largest set forward for binocular focus. The mouth opens to reveal sharp fangs dripping with clear, oily venom. The spinnerets at the rear of the abdomen produce silk of extraordinary strength and stickiness.

## Key Behaviors

Giant Spiders are solitary creatures that establish vast territories defined by their web systems. A spider spends much of its time at rest at the center of its web, feeling for vibrations that indicate prey. The creature is patient—it can wait motionless for days if necessary, entering a state of minimal metabolic activity. When prey touches the web, the spider responds with shocking speed, rushing to wrap and inject venom. The spider consumes only the liquid contents of prey, leaving exoskeletons or bone behind as litter. A spider's territory is recognizable by the accumulated remains of meals.

## Combat Strategy

A Giant Spider prefers to fight in its own web—the spider can move through the sticky strands at full speed while prey becomes progressively more entangled. If forced to fight outside its web, the spider becomes more cautious but retains tactical advantage through speed and agility. The spider uses webs as both offense and defense, creating new barriers during combat or fleeing through pre-positioned escape routes within the web maze. A spider defending its lair becomes absolutely desperate and commits fully to combat, apparently willing to sustain any injury to eliminate threats.

## Attack Methods

### Venomous Fangs

The spider strikes with precise bites, injecting fast-acting venom designed to paralyze prey. The venom is potent enough to incapacitate humanoids, though it acts more slowly on humanoids than on smaller prey.

### Venom Spit

The spider can eject a spray of venom-tinged webbing from its spinnerets—a sticky, paralyzing substance that coats anything in its path and entangles movement. Multiple applications compound the paralysis effect.

## Special Abilities

### Web Mastery

The Giant Spider can create and manipulate vast webs of exceptional strength—the silk is multiple times stronger than steel wire of equivalent thickness. The spider can move through its own web at full speed while intruders become progressively more entangled. The web is invisible in darkness and difficult to spot even in good light.

### Climbing Mastery

The spider can move across any surface (horizontal, vertical, or even inverted) with absolute grip and confidence. It can climb at full movement speed and never risks falling.

## Additional Information

Giant Spider webs have value—the silk can be harvested and used for rope, armor reinforcement, or specialized sohl. However, harvesting silk from an active web almost always alerts the spider. A spider's venom is valuable to alchemists and can be harvested (extremely dangerously) by collectors. Fire is the spider's primary weakness—flames destroy the web and cause the creature to flee. Some characters claim spiders can be negotiated with through magical means, though such claims should be treated with deep skepticism.

## Attributes

- **Strength:** 12-17 (1d6+11)

- **Endurance:** 10-15 (1d6+9)

- **Dexterity:** 13-18 (1d6+12)

- **Agility:** 14-19 (1d6+13)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 8-11 (1d4+7)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
