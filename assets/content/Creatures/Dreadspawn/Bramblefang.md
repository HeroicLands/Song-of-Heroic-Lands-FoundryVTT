---
aliases:
    - Bramblefang
tags:
    - dreadspawn
name:
    full: Bramblefang
    aliases: []
id: 6KSkMKbbQE2We7kA
slug: bramblefang
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
shortcode: brmblfng
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 15
        end: 13
        dex: 11
        agl: 13
        per: 9
        aur: 11
        wil: 11
        rea: 8
        cre: 8
    attrRollFormula:
        str: 1d4+12
        end: 1d4+10
        dex: 1d4+8
        agl: 1d4+10
        per: 1d4+6
        aur: 1d4+8
        wil: 1d4+8
        rea: 1d4+5
        cre: 1d4+5
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 1
                - name: Torso
                  shortcode: torsozone
                  probWeight: 3
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
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: forelegszone
                  roles: &a1
                      - locomotor
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
            base: 100
            calc: 100
        reachBase: 0
        bodyScaleBase: 1.22
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 60
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: mixed_forest
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: needleleaf_forest
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: woodland
                mode: add
                textValue: "0"
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
              masteryLevelBase: 33
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 40
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 35
        - name: Tearing Bite
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
                  name: Tearing Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
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
        - name: Thorn Swipe
          type: skill
          system:
              shortcode: quill
              subType: combattechnique
              masteryLevelBase: 63
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: quill
                  name: Thorn Swipe
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
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
---

# Appearance {#appearance}

The undergrowth shivers before anything appears. You smell iron and vegetable rot, then it emerges—a mass of thorns and twisted wood, vaguely beast-shaped but wrong. Its body writhes with barbed vines, each spike dripping something black. Where it walks, the grass dies. You catch the glint of an eye—yellow, intelligent—buried deep within the tangle of spikes, and it has already seen you.

# Dossier {#dossier}

Bramblefangs are perversions of nature, creatures born when dark magic seeps into forest soil and corrupts the very growth that springs from it. They are apex predators of woodlands and wild places, hunting from within thickets they blend indistinguishably with. Adventurers encounter them in deep forests, corrupted groves, and wild lands that have been touched by shadow.

## Presentation

The Bramblefang is a compact, muscular predator roughly the size of a large wolverine or small lion, built low to the ground for charging through underbrush. Its entire body is covered in a living mesh of thorny vines and branches, dark wood and black bark interwoven so tightly that individual vines cannot be separated—they are now one organism. The thorns along its back and sides are thick as daggers and curve backward, designed to snag and tear anything that brushes past. Its head is a tangle of thorns with two burn-bright yellow eyes visible within; its mouth, when opened, reveals teeth of blackened bone interspersed with woody growths. A sickly-sweet stench of rot and iron accompanies it. Movement is accompanied by creaking, snapping sounds and the rustle of dead leaves.

## Key Behaviors

The Bramblefang is a patient, methodical hunter that dwells in dense undergrowth of its own making. It actively cultivates thickets around its territory, entangling vines into impassable barriers and arranging them to channel prey toward its hunting ground. The creature is fiercely territorial, patrolling its boundaries and attacking anything that ventures within. It hunts by sound and movement rather than scent or sight, lying perfectly still until prey passes close enough to strike. It shows signs of cunning—setting ambushes, herding prey, even feigning injury to draw in potential meals.

## Combat Strategy

The Bramblefang attacks only when certain of advantage. It charges from concealment or difficult terrain, attempting to close the distance before prey can retreat. Once engaged, it uses its thorned body as both offense and defense, causing bleeding wounds through simple contact while its tough hide resists counterattacks. If seriously injured or facing overwhelming opposition, it retreats into its thicket, where it uses tangled terrain to prevent pursuit. It never pursues prey beyond its claimed territory.

## Attack Methods

### Thorn Swipe

The creature slashes with a limb covered in backward-curving thorns, attempting to tear open targets. These attacks cause not just trauma but also cause barbed edges to lodge in flesh, causing ongoing bleeding even after the creature disengages.

### Tearing Bite

The Bramblefang bites with force and malice, attempting to deliver crushing trauma to limbs or vital areas. Its bite often pulls away with strips of flesh or armor still caught on its wooden teeth.

### Entangling Brambles

The creature can manipulate thorny vines around itself or nearby terrain, attempting to grapple, entangle, or restrict prey. Once grappled, prey takes ongoing damage from the barbed thorns.

## Special Abilities

### Thorny Body

The Bramblefang’s entire form is a weapon and armor both. Any creature that grapples, is grappled by, or makes close physical contact with it takes immediate damage from thorns. Weapons used in melee combat risk becoming caught on thorns, potentially tearing from the wielder’s grip.

### Camouflage

When stationary in undergrowth or dense forest, the Bramblefang is nearly impossible to distinguish from natural bramble thickets. It gains advantage on concealment checks in its natural environment and can remain motionless for extended periods without tiring.

### Thicket Growth

The creature causes thorny vines and vegetation to grow rapidly in its presence and under its influence. Over hours and days, it can transform a forest clearing or woodland region into a tangle of impassable brambles that benefit its hunting and movement while hindering others.

## Additional Information

Fire is highly effective against Bramblefangs; their wooden and plant-based bodies are vulnerable to burning, and the creature fears flame more than any other threat. Once its territory is discovered, the thickets can be burned to deprive it of camouflage and mobility advantage. Bramblefangs are drawn to places of natural corruption or magical blight—finding one suggests something worse dwells nearby.

## Attributes

- **Strength:** 13-16 (1d4+12)

- **Endurance:** 11-14 (1d4+10)

- **Dexterity:** 9-12 (1d4+8)

- **Agility:** 11-14 (1d4+10)

- **Perception:** 7-10 (1d4+6)

- **Aura:** 9-12 (1d4+8)

- **Will:** 9-12 (1d4+8)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 6-9 (1d4+5)
