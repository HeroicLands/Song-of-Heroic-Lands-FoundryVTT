---
aliases:
    - Stone Ram
tags:
    - animal
name:
    full: Stone Ram
    aliases: []
id: ev0hqSRmPJlFtV7E
slug: stone-ram
img: icons/game-icons/delapouite/sheep.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 16
        end: 15
        dex: 13
        agl: 15
        per: 13
        aur: 10
        wil: 14
        rea: 7
        cre: 5
    attrRollFormula:
        str: 1d6+12
        end: 1d6+11
        dex: 1d6+9
        agl: 1d6+11
        per: 1d6+9
        aur: 1d4+7
        wil: 1d6+10
        rea: 1d4+4
        cre: 1d4+2
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 1
                - name: Torso
                  shortcode: torsozone
                  probWeight: 4
                - name: Hindquarters
                  shortcode: hindqtrzone
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
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Flank
                  shortcode: flkloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Left Quarter
                  shortcode: lqtrloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Right Quarter
                  shortcode: rqtrloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
        weight:
            base: 350
            calc: "350"
        reachBase: 0
        bodyScaleBase: 1.45
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 60
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: topography
                key: steep
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: alpine
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: barren
                mode: add
                textValue: "0"
          disabled: false
    defaultCombatGroup: null
    items:
        - name: Horn Charge
          type: skill
          system:
              shortcode: gore
              subType: combattechnique
              masteryLevelBase: 67
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: gore
                  name: Horn Charge
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
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
        - name: Kick
          type: skill
          system:
              shortcode: kick
              subType: combattechnique
              masteryLevelBase: 60
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: kick
                  name: Kick
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 0
                      aspect: blunt
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

The creature stands upon stone as if born from it, its massive frame balanced with impossible confidence on a ledge that would offer most creatures only terror. The horns spiral upward from the skull, vast and dark as slate, each curve marked by deep grooves that speak of countless collisions with rivals and stone. The shaggy coat of gray and white wool ripples in wind, and the small hooves, improbably dainty for a creature of such bulk, click with perfect surety against stone. The eyes are watchful and intelligent, scanning not for immediate threat but assessing the terrain and nearby creatures with the confidence of something that cannot be caught on ground of its choosing.

# Dossier {#dossier}

The Stone Ram is a powerful, heavily built mountain herbivore standing 4-5 feet at the shoulder and weighing 300-400 pounds, found on high-altitude cliffs, rocky plateaus, and mountainous regions across temperate and cool climates. These herd animals are exceptional climbers that maintain exclusive territories in terrain where ground-bound predators cannot follow. Adventurers encounter stone rams while traveling mountain passes, camping near cliffs, or hunting in areas where the rams establish grazing grounds.

## Presentation

The Stone Ram presents a compact, muscular form built for power and climbing capability. The body is stocky and heavily muscled, covered in thick, shaggy fur ranging from gray to gray-white with darker markings. The most distinctive feature is the spiraling horns that extend upward from the skull — enormous, dark, and deeply grooved from years of combat with rival rams and weathering against stone. The horns can exceed 3 feet in length and weigh 20+ pounds each. The head is broad and blocky, with a strong jaw adapted for grinding vegetation and a pair of forward-facing eyes. The legs are proportionally short but extraordinarily muscular and powerful. The hooves are small and highly specialized for gripping stone and rock, capable of finding purchase on surfaces that appear smooth to human observation.

## Key Behaviors

Stone Rams live in herds ranging from 5 to 30 individuals, establishing exclusive territories on rocky high-altitude terrain. They are highly social within herds, with clear hierarchies established through headbutting contests. During the autumn rutting season, males become intensely aggressive and territorial. Stone Rams are active during dawn and dusk, spending hot midday periods resting in shade. They are primarily herbivorous, grazing on sparse alpine vegetation and browsing on bark and lichen. They are intelligent and capable of learning, remembering dangerous locations, hunters, and productive feeding grounds. The creatures are almost fearless within their mountain territory, where their climbing ability and rocky terrain provide complete dominance.

## Combat Strategy

A stone ram's primary response to threat is to use terrain advantage — the creature charges in directions that make pursuit difficult for less-capable climbers. If cornered, the ram becomes aggressive, using its horns and body weight to drive threats away. During rutting season, rams become much more aggressive and may charge at perceived rivals or threats without attempting escape. A charging ram uses its mass and momentum to knock opponents off balance or directly off cliff edges when possible.

## Attack Methods

### Horn Charge

The stone ram charges with all its weight and strength, using its spiraling horns to strike and gore opponents. The impact is sufficient to break bones in unarmored targets and to knock even armored opponents off balance. On cliff terrain, the ram aims to drive opponents toward edges.

### Rear and Kick

When rearing up, the stone ram uses its powerful hind legs to deliver upward kicks with small but hard hooves capable of inflicting serious wounds. This attack is used when the ram is cornered or defending young.

### Head Butt

The stone ram uses its thick skull as a battering weapon, delivering impacts that can daze and disorient opponents. This attack is less devastating than the horned charge but can be repeated rapidly.

## Special Abilities

### Mountain Agility

The stone ram is supremely adapted to vertical and near-vertical terrain, capable of scaling near-vertical cliff faces and traversing ledges that would be impassable for humanoids. The creature gains overwhelming advantage when fighting on rocky, steep, or uneven terrain.

### Unyielding Charge

When charging downhill or across known terrain, the stone ram builds momentum that increases the impact force and likelihood of knocking opponents off balance. The creature's confidence in mountain terrain makes it nearly impossible to evade a downhill charge.

### Herd Coordination

Stone rams within herds coordinate defensive actions, using their numbers to present overwhelming threat or to execute pincer attacks against predators or threats.

### Exceptional Climbing

The stone ram's hooves are specialized for finding purchase on stone and rock. The creature can climb surfaces at angles that would be impossible for humanoids to attempt.

### Stubborn Determination

Once a stone ram commits to a charge or defense, it follows through with complete commitment and rarely retreats from a committed direction.

### Additional Information

Stone rams are most dangerous in their native mountain terrain where climbing ability and rocky environment provide complete advantage. In open ground or level terrain, the creatures' advantage is significantly diminished. Herds of stone rams are more dangerous than individuals, as coordination and numbers create overwhelming threat. Rams defending young become more aggressive but still prioritize use of terrain for defense. The creature's horns can be harvested after death and used for decoration, crafting, or magical use. Stone rams are traditionally hunted by mountain cultures, and hunting them is a significant rite of passage or religious practice.

## Attributes

- **Strength:** 13-18 (1d6+12)

- **Endurance:** 12-17 (1d6+11)

- **Dexterity:** 10-15 (1d6+9)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 10-15 (1d6+9)

- **Aura:** 8-11 (1d4+7)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 3-6 (1d4+2)
