---
aliases:
    - Frostjaw
tags:
    - elemental
name:
    full: Frostjaw
    aliases: []
id: 1qpvK28UB8kSIGR0
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
shortcode: frostjaw
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 20
        end: 15
        dex: 11
        agl: 15
        per: 13
        aur: 11
        wil: 13
        rea: 9
        cre: 11
    attrRollFormula:
        str: 1d6+17
        end: 1d4+12
        dex: 1d4+8
        agl: 1d4+12
        per: 1d4+10
        aur: 1d4+8
        wil: 1d4+10
        rea: 1d4+6
        cre: 1d4+8
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
                  probWeight: 4
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
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
            base: 550
            calc: "550"
        reachBase: 0
        bodyScaleBase: 1.47
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 40
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
              masteryLevelBase: 65
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 70
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 36
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 45
        - name: Frost Bite
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
                  name: Frost Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 5
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
        - name: Freezing Breath
          type: skill
          system:
              shortcode: breath
              subType: combattechnique
              masteryLevelBase: 73
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: breath
                  name: Freezing Breath
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 4
                      modifier: 6
                      aspect: fire
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 25
                  drawBase: 0
                  traits: {}
        - name: Shatter Strike
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
                  name: Shatter Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 4
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

Your breath mists in air that should be warmer. A shape materializes from white snow and whiter fog—four-legged and deadly, composed of living ice and frosted air. Its fur, if it can be called that, is crystalline and brittle, and every step it takes cracks the frozen ground beneath it. Its breath is visible and freezing, and the space around it seems to age and become brittle with unnatural cold. When it opens its mouth, you see teeth of ice and something older, something that existed before fire ever warmed the world.

# Dossier {#dossier}

Frostjaws are predators of ice and cold, manifestations of winter itself given animal form. They hunt in frozen lands and are drawn to the deepest cold. Some are natural creatures of elemental nature; others are summoned or bound by sorcerers. A Frostjaw is driven by hunger and territorial aggression in equal measure, and it will pursue prey across frozen wastes with relentless determination. In the proper environment—deep winter, glacial regions, frozen peaks—a Frostjaw is nearly unstoppable.

## Presentation

A Frostjaw resembles a large, powerful wolf ten to twelve feet in length, but composed of living ice and magical cold rather than flesh and fur. Its body is crystalline and translucent in places, with patterns of frost that shift like clouds within clear ice. Its eyes are pale blue or frosted white, and they burn with intelligence and hunger. Its breath is visible and freezing, and it leaves trails of deepened frost and ice-patterns where it passes. Where it walks, the ground becomes more brittle, and water freezes instantly beneath its paws.

## Key Behaviors

Frostjaws are solitary hunters that claim frozen territories and defend them against all intruders. They are drawn to sources of living heat—warm-blooded animals, settlements with fires, humans. They seem to delight in the contrast between heat and cold, pursuing prey that generates maximum thermal disruption. They are intelligent and patient, willing to stalk prey for days if necessary. In their native cold, they are supremely confident. Away from cold, they become more aggressive and more dangerous, as though fighting against their nature.

## Combat Strategy

A Frostjaw attacks with a combination of speed and control, using its freezing abilities to slow and disable opponents before moving in for the kill. It uses terrain advantage—snow, ice, frozen obstacles—to control the battlefield. It will attempt to separate and isolate opponents, attacking isolated targets with overwhelming force. Against fire and heat-based magic, it becomes more cautious and evasive. In extreme heat, a Frostjaw becomes desperate and dangerous, fighting with furious intensity.

## Attack Methods

### Frost Bite

The Frostjaw's jaws close with crushing force, and the victim is simultaneously crushed and frozen. The bite inflicts terrible physical damage and introduces freezing cold into the victim's body. Victims struck feel their strength and mobility deteriorating from the intense cold.

### Freezing Breath

The Frostjaw exhales a torrent of sub-zero air and crystalline ice that engulfs everything in its path. Victims caught in the breath become partially frozen, their movements slowing dramatically. Prolonged exposure can result in complete crystallization.

### Shatter Strike

The Frostjaw strikes a frozen opponent or frozen ground and uses the brittle nature of ice to cause maximum damage. The strike shatters frozen enemies or creates dangerous shards of ice that spread additional cold.

## Special Abilities

### Glacial Resilience

The Frostjaw's body is composed of living ice, making it naturally resistant to cold damage. Fire and heat damage harm it, but it is nearly immune to cold-based magic. Physical weapons are less effective due to the hardness and regenerative nature of its icy form.

### Frozen Territory

In places of extreme cold, the Frostjaw draws strength from the environment, becoming more powerful and more dangerous. In regions of deep winter or glacial ice, it is nearly unstoppable.

### Freezing Aura

The ambient temperature near a Frostjaw drops dramatically. Exposed skin begins to freeze, and movement becomes sluggish. Prolonged exposure causes frostbite and hypothermia.

### Winter's Curse

The Frostjaw can permanently lower the temperature in a region, causing accelerated freezing. Water freezes solid, vegetation dies, and the land becomes more and more like the creature's native habitat. An Frostjaw that remains in a location long enough can transform the entire region into frozen wasteland.

## Additional Information

Fire and heat are the Frostjaw's primary weaknesses. A large source of heat can harm it significantly, and sustained fire-based magic can reduce its power. A Frostjaw cannot survive in regions of sustained heat and will retreat to colder climates. A Frostjaw destroyed in a warm location may not reform. One destroyed in its native frozen territory will likely return after several seasons. Permanent destruction requires either keeping it away from cold sources until it weakens to death, or collapsing it into warming water or burying it in earth that generates geothermal heat.

## Attributes

- **Strength:** 11-14 (1d4+10)

- **Endurance:** 13-16 (1d4+12)

- **Dexterity:** 9-12 (1d4+8)

- **Agility:** 13-16 (1d4+12)

- **Perception:** 11-14 (1d4+10)

- **Aura:** 9-12 (1d4+8)

- **Will:** 11-14 (1d4+10)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 9-12 (1d4+8)
