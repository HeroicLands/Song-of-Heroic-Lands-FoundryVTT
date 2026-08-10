---
aliases:
    - Duneclaw
tags:
    - dreadspawn
name:
    full: Duneclaw
    aliases: []
id: 2DpHrcNw4BfmRgld
slug: duneclaw
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 20
        end: 18
        dex: 14
        agl: 14
        per: 16
        aur: 10
        wil: 16
        rea: 12
        cre: 10
    attrRollFormula:
        str: 1d6+16
        end: 1d6+14
        dex: 1d6+10
        agl: 1d6+10
        per: 1d4+13
        aur: 1d6+6
        wil: 1d4+13
        rea: 1d4+9
        cre: 1d6+6
    body:
        structure:
            zones:
                - name: Cephalothorax
                  shortcode: cephzone
                  probWeight: 5
                - name: Abdomen
                  shortcode: abdomenzone
                  probWeight: 5
                - name: Legs
                  shortcode: legszone
                  probWeight: 6
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
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Fangs
                  shortcode: fangloc
                  bodyPartCode: cephpart
                  bleedingSusceptibility: low
                  amputability: high
                  shockValue: 2
                  probWeight: 3
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: abdomenpart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Left Legs
                  shortcode: llegsloc
                  bodyPartCode: llegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
                - name: Right Legs
                  shortcode: rlegsloc
                  bodyPartCode: rlegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 7
                      fire: 9
        weight:
            base: 200
            calc: 200
        reachBase: 0
        bodyScaleBase: 1.47
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 60
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: dunes
                mode: add
                textValue: "0"
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
              masteryLevelBase: 75
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 39
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 48
        - name: Crushing Pincer
          type: skill
          system:
              shortcode: pincer
              subType: combattechnique
              masteryLevelBase: 57
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: pincer
                  name: Crushing Pincer
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 3
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 4
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
        - name: Stinger Strike
          type: skill
          system:
              shortcode: sting
              subType: combattechnique
              masteryLevelBase: 60
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: sting
                  name: Stinger Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 3
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 5
                      aspect: piercing
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
                      poison: true
---

# Appearance {#appearance}

Sand shifts in ways the wind cannot explain. Something immense lurks just beneath the surface—a shadow that moves with purpose. Then it erupts: an armored scorpion-thing, each segment of its carapace the size of a boulder, its pincers as thick as tree limbs. The stinger curves above its back, black and dripping, and its multifaceted eyes—clusters of lenses—swivel to track your movement with inhuman intelligence. Hot wind rises from where it emerged, carrying the stench of venom and baked chitin.

# Dossier {#dossier}

Duneclaws are apex predators of sand and sun-scorched waste, massive arthropods driven by predatory instinct and surprising cunning. These creatures rule their desert territories with crushing force and venomous precision, hunting anything smaller than themselves. Adventurers encounter them in deep deserts, in dune-fields far from civilization, and in places where underground chambers breach the sand below.

## Presentation

The Duneclaw is a creature of immense size—roughly twenty to thirty feet in length—resembling a monstrous scorpion with chitinous armor. Its exoskeleton is dark brown to black, weathered and scarred by sand and time, with a faint iridescence suggesting magic in its construction. Massive pincers—each as large as a man—dominate its front segments. Its abdomen curves upward into a tail tipped with a curved stinger dripping with iridescent venom. The creature has multiple compound eyes arranged in clusters on its head, each eye a lens of perfect geometry. Its legs are jointed and powerful, each foot enormous and capable of supporting immense weight. When it moves, the ground trembles; when it burrows, it leaves passages feet deep and yards wide. The sound of its movement is the scraping of chitin against sand, like entire buildings grinding together.

## Key Behaviors

The Duneclaw is a solitary, apex predator that claims vast desert territories as its exclusive hunting ground. It dwells in deep burrows below the sand, emerging to hunt during cooler hours. The creature exhibits remarkable territorial intelligence—it knows every dune, every hardpan, every place prey habitually passes—and it uses this knowledge with calculated patience. When not hunting, it remains beneath the sand, relatively dormant. When hunting, it becomes active and aggressive. It marks territory through pheromone trails and crushed remains of failed hunters who dared to encroach. It shows no sign of social behavior; multiple Duneclaws in the same region maintain strict separation through violent defense of boundaries.

## Combat Strategy

The Duneclaw attacks with overwhelming force, attempting to grapple and crush prey with its massive pincers while using its stinger to deliver venom. If prey escapes initial grapple, the creature pursues with relentless determination. It uses its burrowing ability to escape combat briefly when severely wounded, retreating beneath sand to allow venom or wounds to take effect. When threatened by forces it judges superior, it retreats deep into its burrow and seals the entrance, becoming essentially unreachable. It does not fight to establish dominance over creatures its own size—it fights to kill and consume.

## Attack Methods

### Crushing Pincer Grasp

The creature attempts to seize prey in its massive pincers. Once grappled, prey takes ongoing crushing damage each round as the pincers contract. Breaking free requires exceptional strength. The creature can lift and tear apart large prey.

### Stinger Strike

The Duneclaw's curved tail whips downward with tremendous force, attempting to pierce through armor and inject venom into the target. The stinger is capable of penetrating even plate armor with sufficient force.

### Trampling Charge

The creature can build momentum in a charge across open ground, using its full weight and armor as a weapon. Targets struck take impact damage and are likely knocked prone.

## Special Abilities

### Venomous Injection

The creature's stinger delivers a paralytic venom that weakens muscles and impairs movement and fine motor control. Victims bitten suffer cumulative penalties to physical actions; multiple injections can render prey completely immobilized.

### Chitinous Armor

The Duneclaw's exoskeleton provides exceptional natural defense against physical damage. Slashing and piercing attacks have reduced effectiveness; blunt-force trauma is more effective but still resisted.

### Sand Tunneling

The creature can burrow through sand and compact earth with ease, moving beneath the surface at substantial speed. It can emerge from sand unexpectedly, surprising prey above ground.

### Vibration Sensing

The Duneclaw perceives its environment through vibrations in sand and stone, detecting anything moving across its territory. It is effectively blind to distant threats but keenly aware of movement, footfalls, and ground disturbances within miles of its lair.

## Additional Information

Cold-based attacks significantly hamper the Duneclaw's mobility and effectiveness. Extreme cold can freeze venom in the stinger, preventing injection. Creatures that can track across sand or sense through earth gain advantage in pursuing or predicting Duneclaw movement. Some desert cultures maintain peace with local Duneclaws through ritualistic offerings, using the creatures as both deterrent and waste disposal.

## Attributes

- **Strength:** 17-22 (1d6+16)

- **Endurance:** 15-20 (1d6+14)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 11-16 (1d6+10)

- **Perception:** 14-17 (1d4+13)

- **Aura:** 7-12 (1d6+6)

- **Will:** 14-17 (1d4+13)

- **Reasoning:** 10-13 (1d4+9)

- **Creativity:** 7-12 (1d6+6)
