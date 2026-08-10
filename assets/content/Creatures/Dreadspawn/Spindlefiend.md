---
aliases:
    - Spindlefiend
tags:
    - dreadspawn
name:
    full: Spindlefiend
    aliases: []
id: uiCv7LNZzmeo0C5F
slug: spindlefiend
img: icons/game-icons/lorc/werewolf.svg
portrait: ""
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
        aur: 14
        wil: 12
        rea: 14
        cre: 16
    attrRollFormula:
        str: 1d6+6
        end: 1d4+9
        dex: 1d6+14
        agl: 1d6+16
        per: 1d4+13
        aur: 1d6+10
        wil: 1d4+9
        rea: 1d6+10
        cre: 1d4+13
    body:
        structure:
            zones:
                - name: Cephalothorax
                  shortcode: cephzone
                  probWeight: 2
                - name: Abdomen
                  shortcode: abdomenzone
                  probWeight: 2
                - name: Legs
                  shortcode: legszone
                  probWeight: 2
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
            base: 80
            calc: 80
        reachBase: 0
        bodyScaleBase: 0.91
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 60
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
              masteryLevelBase: 70
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 80
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 39
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
        - name: Paralyzing Bite
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
                  name: Paralyzing Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
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
                      poison: true
        - name: Razor Limb Slash
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 72
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Razor Limb Slash
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: -1
                      aspect: edged
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

You notice it too late—a shadow that moves wrong, at an angle that contradicts the light. Then you see the limb, impossibly long and spider-thin, as it withdraws from where it has been resting against the stone. The creature itself is almost invisible, its body a gossamer outline wreathed in thread-like filaments that catch no light and leave no shadow. Eight eyes snap into focus—each one a glowing coal of malevolent intelligence—and you see the mouth open, revealing fangs dripping with venom that glows faintly in the darkness. The air around it seems to vibrate with the tension of invisible webs, and you realize with creeping horror that you cannot move your foot—you have stepped directly into the creature’s domain, and it was waiting.

# Dossier {#dossier}

Spindlefiends are creatures of intelligent malice born from the corruption of oversized arachnids by forces of shadow and cunning. They are ambush predators of supernatural ability, creating webs so fine and nearly invisible that entire chambers can be made into deathtraps without visible evidence of their presence. Unlike Shadowspinners, which dominate through sheer web-building mastery, Spindlefiends hunt through deception and tactical brilliance—they are far more intelligent, far more creative, and far more cruel. A Spindlefiend views its hunting ground as a canvas and its prey as pieces in an elaborate game designed to cause maximum suffering before the kill. They are found in dark urban ruins, deep caves, and abandoned structures where human architecture provides the complexity they prefer.

## Presentation

A Spindlefiend stands roughly 5 to 7 feet in height, but its most distinctive feature is the incredible length of its limbs—each leg extends 8 to 12 feet when fully articulated, allowing the creature to span vast distances with single movements. Its body is remarkably narrow and lightweight, covered in a chitinous exoskeleton of deep gray or midnight black, often wreathed in strands of nearly invisible silk that cling to and trail from its form. Its head bears eight eyes arranged in a nearly human configuration, each one a glowing coal of amber or sickly green. Its mouth is a nightmare of biology—mandibles that can open nearly at right angles, and fangs that secrete a luminescent venom that glows faintly even in complete darkness. Its limbs terminate in what could charitably be called claws, but are in reality pointed, articulated hooks designed solely for gripping, piercing, and tearing. The creature makes almost no sound when it moves—if anything, silence follows in its wake.

## Key Behaviors

Spindlefiends are solitary, brilliantly strategic hunters that establish territories in complex three-dimensional spaces—places with multiple levels, alcoves, and corners where web-spinning can create intricate mazes. A single Spindlefiend may spend months or years perfecting a hunting ground, creating layers of webs that would require a team of dedicated workers weeks to fully map. The creature is primarily nocturnal but will hunt during the day if prey is available. It demonstrates remarkable patience, often simply hanging motionless in one location for days at a time, waiting for a potential victim to blunder into its territory. An ancient Spindlefiend may have refined its hunting ground into something approaching an art form, with redundant traps, multiple kill-zones, and escape routes designed to herd prey deeper into the maze rather than allowing escape.

## Combat Strategy

A Spindlefiend’s primary goal is to force or trick opponents into its webbed territory, where it maintains absolute advantage. It will use its incredible agility to stay out of reach, clinging to walls and ceilings to attack from unexpected angles. It relies on speed and precision strikes rather than direct confrontation, and if a victim proves too dangerous to subdue through web and quick strikes, the creature will simply retreat deeper into its territory, content to wait until the victim becomes tired, injured, or confused. Only if directly threatened in its inner sanctum or protecting young will a Spindlefiend engage in direct combat for an extended duration.

## Attack Methods

### Paralyzing Bite

The creature strikes with terrifying speed, its fangs driving deep into exposed flesh and injecting venom that begins its work almost immediately. Victims experience progressive paralysis beginning at the bite wound and spreading outward, eventually immobilizing the entire body.

### Razor Limb Slash

The Spindlefiend’s elongated limbs are drawn into close proximity and used like swords, their pointed ends and articulated joints capable of slashing and piercing with precision. The creature can attack from seemingly impossible angles, striking around shields and armor.

### Web Entanglement

Rather than merely trapping prey with web, the Spindlefiend actively manipulates web strands, tightening them around limbs, constricting the throat, or creating hazardous terrain on the fly.

## Special Abilities

### Nearly Invisible Silk

The Spindlefiend’s webs are composed of strands so fine and dark that they are nearly impossible to perceive without exceptional light or magical sight. Areas filled with these webs appear empty to the untrained eye, making navigation a nightmare.

### Impossible Agility

The Spindlefiend’s body is so perfectly adapted for three-dimensional movement that it moves on walls, ceilings, and across the span of wide gaps with the same ease a human walks on flat ground. Its movement speed increases dramatically in areas with complex geometry.

### Predatory Genius

The creature’s creative and reasoning abilities exceed those of nearly all living creatures. It designs its territory, anticipates prey behavior, and sets traps with malicious cleverness. It learns from encounters and adjusts its tactics accordingly.

### Venom Mastery

The Spindlefiend’s venom is potent, fast-acting, and complex in its effects. Different toxins seem designed for different purposes—some paralyze quickly, others cause extraordinary pain, still others drain life force directly.

## Additional Information

Fire remains the Spindlefiend’s primary weakness, destroying its webs and damaging its body. Acid is equally effective. The creature’s nearly invisible webs can be revealed through powder, smoke, or magical light. In completely open, featureless terrain, a Spindlefiend loses much of its advantage and becomes a comparatively normal opponent. The creature’s web, if harvested carefully, is extraordinarily valuable—its ability to remain invisible makes it priceless to assassins, thieves, and warriors alike. The venom itself can be extracted, though doing so is extraordinarily dangerous. Some desperate communities have managed to contain Spindlefiends by destroying the geometry of their territory—collapsing structures, opening ceilings to the sky, or otherwise simplifying the environment until the creature’s advantage is negated.

## Attributes

- **Strength:** 7-12 (1d6+6)

- **Endurance:** 10-13 (1d4+9)

- **Dexterity:** 15-20 (1d6+14)

- **Agility:** 17-22 (1d6+16)

- **Perception:** 14-17 (1d4+13)

- **Aura:** 11-16 (1d6+10)

- **Will:** 10-13 (1d4+9)

- **Reasoning:** 11-16 (1d6+10)

- **Creativity:** 14-17 (1d4+13)
