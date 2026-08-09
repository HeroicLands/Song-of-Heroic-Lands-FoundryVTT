---
aliases:
    - Giant Tortoise
tags:
    - animal
name:
    full: Giant Tortoise
    aliases: []
id: ydAbGU9VRn1tdWQ5
slug: giant-tortoise
img: icons/game-icons/delapouite/tortoise.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 17
        end: 21
        dex: 6
        agl: 5
        per: 10
        aur: 9
        wil: 14
        rea: 7
        cre: 5
    attrRollFormula:
        str: 1d6+13
        end: 1d6+17
        dex: 1d4+3
        agl: 1d4+2
        per: 1d4+7
        aur: 1d4+6
        wil: 1d6+10
        rea: 1d4+4
        cre: 1d4+2
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 3
                - name: Shell
                  shortcode: shellzone
                  probWeight: 9
                - name: Limbs
                  shortcode: limbzone
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
                - name: Shell
                  shortcode: shellpart
                  bodyZoneCode: shellzone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: limbzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Right Foreleg
                  shortcode: rforelegpart
                  bodyZoneCode: limbzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Left Hind Leg
                  shortcode: lhindlegpart
                  bodyZoneCode: limbzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Right Hind Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: limbzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: limbzone
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
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Shell
                  shortcode: shellloc
                  bodyPartCode: shellpart
                  bleedingSusceptibility: low
                  amputability: none
                  shockValue: 4
                  probWeight: 7
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Underbelly
                  shortcode: underbellyloc
                  bodyPartCode: shellpart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
        weight:
            base: 800
            calc: "800"
        reachBase: 0
        bodyScaleBase: 1.55
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 15
          leaguesPerWatch: 1
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - name: Powerful Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 40
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Powerful Bite
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
        - name: Crushing Advance
          type: skill
          system:
              shortcode: ram
              subType: combattechnique
              masteryLevelBase: 30
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: ram
                  name: Crushing Advance
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 3
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

The ground trembles with each step of the creature—a slow, rhythmic vibration that speaks to immense mass. The creature itself is almost unbelievable in size: a tortoise as large as a house, moving with ponderous inevitability across the landscape. The shell dominates the creature—domed and ancient-looking, its surface carved and scarred by centuries of existence, colored in weathered browns and grays with patterns that suggest deep age. The creature's head extends periodically from within, each emergence slow and deliberate, allowing small dark eyes to survey the world with calm patience. The legs are thick as tree trunks, and the sound they make is the sound of the earth itself moving.

# Dossier {#dossier}

The Giant Tortoise is a walking fortress of overwhelming durability, a creature that has evolved over centuries to be nearly indestructible. These herbivorous creatures can live for hundreds of years, and a truly ancient tortoise represents a mobile historical archive. They are generally peaceful and indifferent to smaller creatures, focusing entirely on the slow business of consuming vegetation. Adventurers most commonly encounter them while traveling through warm lands, deserts, or temperate forests where tortoises establish feeding routes.

## Presentation

The Giant Tortoise is an absolutely massive creature, capable of exceeding twenty feet in length and weighing many tons. The body is entirely dominated by the shell—a domed, scaly carapace in earth tones of brown, gray, and weathered tan. The shell is heavily scarred and patterned with accumulated age, each scar and wear mark representing a century or more of existence. The plastron (underside) is flat and equally well-armored, providing protection from below as well as above. The head is relatively small compared to the body, with ancient-looking skin that is deeply wrinkled and scaled. The eyes are small and dark, expressing remarkable calm and wisdom. The legs are thick and powerful, capable of supporting the creature's enormous weight.

## Key Behaviors

Giant Tortoises are herbivorous and spend much of their time methodically consuming vegetation—grass, shrubs, leaves, and occasionally fruits. They are slow-moving and methodical, showing no apparent concern for predators or other threats. Their lifespan is measured in centuries, and some individuals are believed to be over a thousand years old. A tortoise establishes feeding routes and follows them with minimal variation, appearing at the same places during the same seasons. They are solitary creatures but are not territorial—multiple tortoises may share the same general area without conflict.

## Combat Strategy

A Giant Tortoise is not an aggressive creature and rarely initiates combat. When threatened, its first response is to simply ignore the threat and continue about its business. If forced to engage, the tortoise relies entirely on its overwhelming armor and mass. It will attempt to shove or crush attackers using its body, or it may bite if something interferes with its movement. If seriously threatened, the tortoise withdraws completely into its shell and enters a state of minimal responsiveness, becoming essentially immobile and nearly indestructible. A tortoise will remain withdrawn until it determines the threat has passed.

## Attack Methods

### Crushing Advance

The tortoise uses its massive bulk as a weapon, simply moving forward and crushing anything in its path beneath its weight or shell. This attack is slow but tremendously powerful.

### Powerful Bite

The tortoise can bite with surprising force—the bite is slow and deliberate but capable of causing serious injury to anything caught within the jaws.

## Special Abilities

### Impenetrable Shell

The tortoise's shell is nearly indestructible—normal weapons have difficulty penetrating or damaging it. The shell distributes force across its surface, protecting the creature from virtually all conventional damage. The plastron (belly) is slightly less heavily armored but still exceptionally tough.

### Withdrawal Defense

When the tortoise fully withdraws into its shell, it becomes an immobile fortress. In this state, it is nearly impossible to harm—most weapons cannot penetrate the shell, and the creature simply ceases to exist as an active participant in the world, waiting for threats to pass.

## Additional Information

A Giant Tortoise's shell, when shed (which occurs naturally over centuries), can be worked into extraordinary armor or decorative pieces. The creature's age can be determined by counting the rings on the shell, and truly ancient tortoises are honored as living monuments. Some characters have attempted to ride tortoises, though the creatures are indifferent to riders and will not modify their behavior for them. A tortoise that has lived for centuries has witnessed the rise and fall of kingdoms.

## Attributes

- **Strength:** 14-19 (1d6+13)

- **Endurance:** 18-23 (1d6+17)

- **Dexterity:** 4-7 (1d4+3)

- **Agility:** 3-6 (1d4+2)

- **Perception:** 8-11 (1d4+7)

- **Aura:** 7-10 (1d4+6)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 3-6 (1d4+2)
