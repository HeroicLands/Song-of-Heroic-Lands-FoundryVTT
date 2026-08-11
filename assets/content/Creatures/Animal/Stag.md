---
aliases:
    - Stag
tags:
    - animal
name:
    full: Stag
    aliases: []
id: N9K2ohKoe0Iv7iJ7
img: icons/game-icons/lorc/stag-head.svg
portrait: ""
shortcode: stag
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 18
        end: 13
        agl: 10
        per: 18
        snt: 3
        aur: 5
        wil: 12
        rea: 5
        cre: 5
    attrRollFormula:
        str: 1d6+15
        end: 1d6+10
        agl: 1d6+7
        per: 1d6+15
        snt: 1d4+1
        aur: 1d4+3
        wil: 1d6+9
        rea: 1d4+3
        cre: 1d4+3
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
            base: 400
            calc: "400"
        reachBase: 0
        bodyScaleBase: 1.38
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 140
          leaguesPerWatch: 6
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 75
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 24
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 27
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 48
        - name: Gore
          type: skill
          system:
              shortcode: gore
              subType: combattechnique
              masteryLevelBase: 60
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: gore
                  name: Gore
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 4
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
                      armorReduction: 1
---

# Appearance {#appearance}

The forest parts to reveal a magnificent creature standing motionless, its form so perfectly balanced between grace and power that it seems more ideal than real. Antlers spread from its skull like the branches of a dark, winter-bare tree, each point worn smooth from years of combat and territorial marking. The coat is a rich reddish-brown that dissolves into forest shadow at the edges, making it seem less a separate creature than an extension of the woodland itself. The eyes are large and alert, and as it turns its head slightly, you see the absolute confidence of something that knows itself apex predator in this environment.

# Dossier {#dossier}

The Stag is a mature male cervid standing 4-5 feet at the shoulder and reaching 6-7 feet in length, distinguished by its large, branching antlers and powerful build. These forest-dwelling herbivores are found throughout temperate and cool regions where forests provide shelter and forage. Adventurers encounter stags while traveling through forests, hunting game, or inadvertently approaching during the rutting season when the creatures become aggressive and territorial.

## Presentation

The Stag presents a vision of controlled power combined with elegant grace. The body is muscular and compact, covered in reddish-brown to dark brown coat with lighter areas on the underside and posterior. The most distinctive feature is the antlers — branching structures that spread and point upward, often showing substantial grooves and wear from years of combat with rival stags. The antlers are shed annually and regrow, varying in size and complexity with the animal's age and health. The head is proportionally large with prominent eyes, acute hearing, and a powerful neck. The legs are slender but muscular, adapted for traversing forest terrain and achieving surprising speeds. The hooves are specialized for soft ground and forest floor purchase.

## Key Behaviors

Stags are fundamentally peaceful herbivores that spend most of their time foraging for vegetation, leaves, bark, and roots. They are social with other deer but establish exclusive ranges. During the autumn rutting season, males become intensely territorial and aggressive, using their antlers to establish dominance over rivals and to guard access to females. The testosterone surge during this period makes stags dangerous and unpredictable. Outside of rutting season, stags are relatively shy and avoid confrontation, fleeing from threats unless defending young or territory. Stags are intelligent and capable of learning to avoid human hunters, remembering dangerous locations and adjusting movement patterns accordingly.

## Combat Strategy

A stag's primary response to threat is flight — the animal is fast and agile, capable of navigating forest terrain at speed that allows escape from most predators. During rutting season, however, stags become aggressive and may charge at perceived rivals or threats. A charging stag uses its antlers to strike and gore, followed by attempts to gore opponents repeatedly or to use brute force to knock them off balance. Outside of mating season, stags will charge only if cornered or defending young, and they will prioritize escape when possible.

## Attack Methods

### Antler Strike

The stag lowers its head and charges forward, using its antlers to strike, gore, or attempt to impale opponents. The attack combines momentum with the multiple points of the antlers, capable of perforating leather and wounding unarmored flesh. Repeated strikes can cause serious injury.

### Hoofstrike

When rearing, the stag uses its powerful hind legs to deliver upward kicks with its sharp hooves, capable of inflicting serious wounds and creating distance from attackers. These kicks are used defensively during close quarters.

### Trample

If an opponent is knocked off balance or off its feet, the stag may attempt to trample the victim with its full body weight, causing impacts and hoof injuries.

## Special Abilities

### Forest Agility

The stag is supremely adapted to forest terrain, capable of running at speed through dense undergrowth where humanoids would struggle. The creature gains advantage when moving through forests and can escape most ground-bound predators.

### Swift Retreat

The stag is fast and capable of sustaining speed across long distances. Once fleeing, the creature is extremely difficult to catch without magical assistance or overwhelming numbers.

### Rutting Season Aggression

During autumn mating season, stags become significantly more aggressive and dangerous. Their testosterone surge makes them territorial and inclined to challenge threats instead of fleeing.

### Acute Hearing and Smell

The stag's senses of hearing and smell are extraordinarily acute, allowing it to detect threats from significant distances. The creature typically flees before visual contact is established.

### Additional Information

Stags are most dangerous during the rutting season in autumn, when testosterone drives territorial aggression. Outside of mating season, encounters can usually be avoided through careful movement and respect of the creature's space. Stags defending does or young become more aggressive but still prioritize escape when possible. The creature's antlers are valuable and can be harvested after death for decoration, crafting, or magical use. Stag hunting is a significant part of many cultures' survival and traditions.

## Attributes

- **Strength:** 16-21 (1d6+15)

- **Endurance:** 11-16 (1d6+10)

- **Agility:** 8-13 (1d6+7)

- **Perception:** 16-21 (1d6+15)

- **Scent:** 2-5 (1d4+1)

- **Aura:** 4-7 (1d4+3)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 4-7 (1d4+3)
