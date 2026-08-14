---
aliases:
    - Great Stag
    - creature-grtstg
tags:
    - animal
name:
    full: Great Stag
    aliases: []
id: SqaOIArv8es9t6IF
img: icons/game-icons/lorc/stag-head.svg
portrait: images/grtstg.webp
shortcode: grtstg
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 16
        end: 15
        dex: 13
        agl: 14
        per: 15
        aur: 11
        wil: 13
        rea: 8
        cre: 6
    attrRollFormula:
        str: 1d6+12
        end: 1d6+11
        dex: 1d6+9
        agl: 1d6+10
        per: 1d6+11
        aur: 1d6+7
        wil: 1d6+9
        rea: 1d4+5
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 3
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 7
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 4
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
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Flank
                  shortcode: flkloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Quarter
                  shortcode: lqtrloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Quarter
                  shortcode: rqtrloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
        weight:
            base: 800
            calc: "800"
        reachBase: 0
        bodyScaleBase: 1.28
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
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
              masteryLevelBase: 70
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 65
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
              masteryLevelBase: 40
        - name: Antler Charge
          type: skill
          system:
              shortcode: gore
              subType: combattechnique
              masteryLevelBase: 65
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: gore
                  name: Antler Charge
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 3
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 3
                      aspect: piercing
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
        - name: Hoof Strike
          type: skill
          system:
              shortcode: kick
              subType: combattechnique
              masteryLevelBase: 58
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: kick
                  name: Hoof Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 0
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
---

# Appearance {#appearance}

The forest seems to bow before it—a creature standing over six feet at the shoulder, carrying antlers that span nearly ten feet, spreading like the branches of an ancient oak rendered in bone. The coat is rich brown, lightening to a soft tan on the belly, with a distinctive white patch blazing across the chest like a mark of distinction. The stag moves with fluid grace that belies its size, each step careful and deliberate, and the antlers—heavy as they must be—are carried with perfect balance. The eyes are dark and soulful, large enough to reflect your image, and they hold an intelligence that is unmistakable. When the stag raises its head and fixes its gaze on you, you feel not hunted but weighed, evaluated, and found to be of interest.

# Dossier {#dossier}

The Great Stag is a regal megafauna creature that dominates the deeper forests and wild woodlands of temperate climates. These are herd animals, though they are led by a single dominant male whose strength and size set him apart from all others. A Great Stag in his prime is nearly unstoppable—a creature built for dominance through sheer physical power. These animals are generally peaceful grazers, but a stag defending his territory, his does, or his status will fight with absolute determination.

## Presentation

The Great Stag is an animal of clear majesty and power. Standing over six feet at the shoulder, the creature is built with the grace of a dancer and the power of a warrior. The antlers are the defining feature: a matched pair spanning nine to ten feet across, with multiple points and branches, each point capable of penetrating armor. The coat is rich brown with lighter underbelly, and a distinctive white patch marks the chest—a blaze of color that announces the stag's confidence and status. The head is large and noble, with large, intelligent eyes and ears positioned to catch sound from all directions. The body is muscular but refined, not bulky—the stag is built for speed as much as power.

## Key Behaviors

Great Stags are herd animals that roam in established herds, typically composed of does and their young, with the dominant stag maintaining exclusive breeding rights. During the rut (mating season), stags become territorial and aggressive, challenging rivals and defending harems. Outside breeding season, stags may form bachelor groups with other males of similar age or strength. They are primarily nocturnal or crepuscular feeders, spending daylight hours resting and chewing cud. They communicate through vocalizations (bugling and roaring) and through scent marking.

## Combat Strategy

A Great Stag uses its antlers as primary weapons, charging with the full weight of its body and using the antlers as lance points. If forced to fight at close range, the stag uses powerful legs to deliver crushing kicks from both hind legs (when rearing) and front legs (when striking). A stag defending its herd or territory fights with terrible determination and will not retreat until the threat is eliminated or escape is impossible. A stag facing overwhelming odds will attempt to scatter and flee, using forest terrain to break pursuit.

## Attack Methods

### Antler Charge

The stag drives forward with antlers lowered, using the combined force of the charge and the weight of the creature to impale and gore opponents. Each point of the antlers can penetrate armor.

### Hoofed Strike

Both front and hind legs deliver powerful kicks—the hind legs are used when the stag rears, the front legs during a collision. These strikes are capable of breaking bones and driving opponents backward with force.

## Special Abilities

### Herd Coordination

When the stag moves with a herd, the group shares alertness and protective behavior. A threat to one triggers response from all, and the herd can execute coordinated movements—stampedes or coordinated charges—that amplify the danger.

### Dominance Display

The Great Stag can perform displays of intimidation—rearing, bellowing, and thrashing antlers—designed to frighten opponents. A creature witnessing this display must resist fear or risk fleeing.

## Additional Information

A Great Stag's antlers are shed annually and can be collected for weapons, decorations, or trophies. The size and quality of antlers reflects the stag's health and status. A stag's hide is valuable for leather working. Some cultures consider the Great Stag sacred or hunt it as the ultimate test of a warrior's skill.

## Attributes

- **Strength:** 13-18 (1d6+12)

- **Endurance:** 12-17 (1d6+11)

- **Dexterity:** 10-15 (1d6+9)

- **Agility:** 11-16 (1d6+10)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 8-13 (1d6+7)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 4-7 (1d4+3)
