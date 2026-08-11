---
aliases:
    - Mature Ice Dragon
tags:
    - mythic
    - image-needed
name:
    full: Mature Ice Dragon
    aliases: []
id: 2tsk1oPbOk4V5jJf
img: icons/game-icons/faithtoken/dragon-head.svg
portrait: ""
shortcode: mtricdrg
type: creature
package: sohl
sohl:
    kbcat: mythic
    archetype: 0
    attributes:
        str: 48
        end: 36
        dex: 7
        agl: 9
        per: 15
        snt: 3
        aur: 13
        wil: 19
        rea: 13
        cre: 11
        emp: 10
        elo: 13
    attrRollFormula:
        str: 1d6+45
        end: 1d6+33
        dex: 1d4+5
        agl: 1d4+7
        per: 1d6+12
        snt: 1d4+1
        aur: 1d6+10
        wil: 1d6+16
        rea: 1d6+10
        cre: 1d6+8
        emp: 1d6+7
        elo: 1d6+10
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 8
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 8
                - name: Left Wing
                  shortcode: lwingzone
                  probWeight: 6
                - name: Torso
                  shortcode: torsozone
                  probWeight: 8
                - name: Right Wing
                  shortcode: rwingzone
                  probWeight: 6
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 8
                - name: Tail
                  shortcode: tailzone
                  probWeight: 6
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
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 1
                - name: Right Foreleg
                  shortcode: rforelegpart
                  bodyZoneCode: forelegszone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 1
                - name: Left Wing
                  shortcode: lwingpart
                  bodyZoneCode: lwingzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Right Wing
                  shortcode: rwingpart
                  bodyZoneCode: rwingzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Left Hind Leg
                  shortcode: lhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 1
                - name: Right Hind Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 1
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: tailzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 3
                  protectionBase: &a1
                      blunt: 22
                      edged: 24
                      piercing: 23
                      fire: 21
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 7
                  protectionBase: *a1
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 7
                  protectionBase: &a2
                      blunt: 22
                      edged: 24
                      piercing: 23
                      fire: 21
                - name: Left Fore Foot
                  shortcode: lfftloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 3
                  protectionBase: &a3
                      blunt: 20
                      edged: 22
                      piercing: 21
                      fire: 19
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 7
                  protectionBase: *a2
                - name: Right Fore Foot
                  shortcode: rfftloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 3
                  protectionBase: *a3
                - name: Left Wing
                  shortcode: lwingloc
                  bodyPartCode: lwingpart
                  bleedingSusceptibility: none
                  amputability: low
                  shockValue: 1
                  probWeight: 10
                  protectionBase: &a5
                      blunt: 16
                      edged: 18
                      piercing: 17
                      fire: 15
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 7
                  protectionBase: &a4
                      blunt: 22
                      edged: 24
                      piercing: 23
                      fire: 21
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase: *a4
                - name: Right Wing
                  shortcode: rwingloc
                  bodyPartCode: rwingpart
                  bleedingSusceptibility: none
                  amputability: low
                  shockValue: 1
                  probWeight: 10
                  protectionBase: *a5
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: low
                  shockValue: 3
                  probWeight: 7
                  protectionBase: &a6
                      blunt: 22
                      edged: 24
                      piercing: 23
                      fire: 21
                - name: Left Hind Foot
                  shortcode: lhftloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 3
                  protectionBase: &a7
                      blunt: 20
                      edged: 22
                      piercing: 21
                      fire: 19
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: low
                  shockValue: 3
                  probWeight: 7
                  protectionBase: *a6
                - name: Right Hind Foot
                  shortcode: rhftloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 3
                  protectionBase: *a7
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 20
                      edged: 22
                      piercing: 21
                      fire: 19
        weight:
            base: 3000
            calc: "3000"
        reachBase: 0
        bodyScaleBase: 2.61
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 65
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: aerial
          feetPerRound: 190
          leaguesPerWatch: 16
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 85
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 80
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 85
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 84
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 66
        - name: Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 80
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 19
                      aspect: piercing
                  lengthBase: 8
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
                      armorReduction: 3
        - name: Claw
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 75
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Claw
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 12
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 10
                      modifier: 18
                      aspect: edged
                  lengthBase: 7
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
        - name: Tail
          type: skill
          system:
              shortcode: tail
              subType: combattechnique
              masteryLevelBase: 70
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: tail
                  name: Tail
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 16
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 17
                      aspect: blunt
                  lengthBase: 9
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
        - name: Breath
          type: skill
          system:
              shortcode: breath
              subType: combattechnique
              masteryLevelBase: 84
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: breath
                  name: Breath
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 4
                      modifier: 15
                      aspect: fire
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 60
                  drawBase: 0
                  traits:
                      breath: true
                      impactBands: 15 · 11 · 7
---

# Appearance {#appearance}

You feel it before the world goes silent—a pressure in your bones, a wrongness that makes your body want to curl inward. The temperature plummets so rapidly that ice crystals form on your eyelashes and in your hair. Your breath becomes painful, each inhalation a blade in your lungs. Then the clouds part, and you see her—a dragon the size of a merchant ship, twenty-four feet of pale silver-blue muscle suspended above the glacier, wings spread in a span of thirty-six feet. She doesn't move with fire or fury. She simply hangs there, and in the time it takes you to comprehend her presence, your fingers have begun to blacken, your thoughts have scattered like migrating birds, and you know—with the absolute clarity of the condemned—that you are already dead. The mature ice dragon is not a creature that hungers. It is hunger incarnate, patient and eternal, wearing scales and wings. Every second you draw breath is a second stolen from winter itself, and winter always collects its debts.

# Dossier {#dossier}

The mature ice dragon represents the apex of formidable predatory intelligence coupled with supernatural patience. Spanning twenty-four to thirty-six feet in length with wingspans exceeding fifty feet, and weighing between two thousand and four thousand pounds, these creatures have transcended mere animal fury. They are the architects of their own legend.

A mature ice dragon has likely spent two to three centuries in existence, giving it ample time to develop territorial sophistication and hunting strategies of devastating elegance. These dragons maintain multiple lairs across their ranges—a primary glacier palace for brooding, secondary ice caves for backup hunting reserves, and isolated peaks used as waypoints during seasonal migration. Some maintain mountain fortresses where they collect tribute from fearful kingdoms. Others prefer solitude, claiming entire mountain ranges as exclusively theirs.

The cold aura around a mature ice dragon is not merely lethal—it is selective. Prey animals approaching the dragon freeze and die within minutes. Prey-sized humans suffer frostbite within the hour. Only the dragon itself moves freely in temperatures that would destroy flesh in moments. The dragon's breath weapon, over centuries of use, has perfected to a thirty-foot cone of cold so pure and intense that it flash-freezes moisture in the air and turns blood to slush within living bodies.

## Presentation

A mature ice dragon's scales are predominantly glacial blue, deepening toward midnight blue along the spine and extending down the tail. The creature's size makes its translucent scale edges visible from a distance, creating a haunting prismatic shimmer even in poor light. Its eyes are pale silver, nearly white at the center, and possess an unsettling depth—intelligence and calculation visible in every glance.

Frost perpetually weeps from the dragon's nostrils, and ice forms spontaneously around its claws and along its spinal ridge. During flight, the dragon trails a visible aura of supercooled mist. Its scales produce a faint harmonic humming at certain pitches—a sound that triggers primal dread in creatures that hear it. The dragon's voice, when it speaks, carries overtones of wind across glaciers and the groaning of pack ice.

Scars mark the mature dragon's frame—some inflicted centuries ago by adventurers long dust, others from territorial disputes with creatures equally large. Rather than diminishing the dragon's aspect, these marks add gravitas: this is a creature that has survived ages and wars and catastrophes.

## Key Behaviors

A mature ice dragon's territory typically spans fifty to a hundred square miles of mountainous terrain. The dragon patrols these boundaries regularly, sometimes for the sheer pleasure of surveillance, sometimes to hunt. It maintains feeding routes that take advantage of seasonal migration patterns, and it remembers every path, every valley, every mountain pass. If a human settlement encroaches, the dragon will observe for months before deciding whether to tolerate the presence or eradicate it.

The mature dragon's patience is almost supernatural. It will wait years for revenge against those who anger it. It will shadow kingdoms for decades, learning their defenses, waiting for the moment when destruction will yield maximum effect. Some mature ice dragons have negotiated treaties with human rulers, accepting tribute and slaves in exchange for agrarian protection. Others maintain an aloof isolation, neither attacking nor tolerating observers.

## Combat Strategy

A mature ice dragon engages enemies with devastating tactical awareness. It uses its superior flight to maintain altitude advantage, overwhelming targets with breath weapon and ranged attacks before descending. The dragon recognizes that few ground-based enemies can harm it seriously, so it focuses on psychological dominance and environmental control—turning a battlefield into a frozen hell where only the dragon thrives.

The dragon's combat pattern is methodical. It circles, assesses, calculates. It singles out the most dangerous target first, not through rage but through cold analysis. It will break off from combat if the tide turns, knowing that winter itself is its ally—prey cannot chase a flying dragon into a blizzard. The dragon will simply wait in the storm until exhaustion and cold finish the work.

## Attack Methods

### Bite

The dragon's jaws close with crushing force, inflicting damage equivalent to its strength modifier plus substantial weapon dice. Victims bitten by a mature ice dragon may suffer additional cold damage as the dragon's supercooled saliva freezes tissue.

### Claw Rake

The dragon's claws are weapons in themselves, inflicting deep slashing wounds. A claw rake can target multiple enemies, and the wounds freeze rapidly, cauterizing with cold that prevents excessive bleeding but creates brittleness in surrounding tissue.

### Wing Buffet

The dragon's wings, folded and snapped outward with tremendous force, batter everything within a twenty-foot radius. Targets must resist a strength check or be knocked prone and potentially blown backward ten feet or more.

### Tail Sweep

The tail, nearly as long as the dragon's body, whips in a devastating arc. Multiple targets in the tail's path suffer damage and must resist or fall prone. A tail sweep can potentially topple small structures or create avalanches on mountainsides.

### Frost Breath

The dragon exhales in a thirty-foot cone of supercooled crystalline mist. Targets in the cone take cold damage and immediately suffer frostbite conditions. Unprotected flesh exposed to this breath weapon can crystallize and shatter with subsequent impact.

## Special Abilities

### Frost Breath

The mature dragon's breath weapon is a culmination of centuries of refinement. The supercooled mist is dense enough to obscure vision entirely and cold enough to kill in moments. A mature ice dragon can use this ability multiple times in succession.

### Flight

The dragon is an expert flier, capable of acrobatic combat maneuvers. It can hover indefinitely, dive with tremendous speed, and pull out of dives with impossible agility for something its size.

### Armored Scales

The mature dragon's scales are virtually impervious to conventional damage. Only magical weapons or extreme heat can penetrate the hide. Many of the dragon's scales are centuries old, having never been shed.

### Cold Aura

The dragon's cold aura is lethal within a hundred feet. Unprotected humans in this radius take cold damage every round of exposure. The aura warps light itself, creating visual distortion and mirages. Ice forms constantly on the ground around the dragon.

### Draconic Presence

The mature dragon radiates a crushing psychic pressure that induces despair and hopelessness in all who perceive it. Creatures must resist or suffer profound disadvantage on attack rolls and ability checks. Heroes of exceptional will may resist this effect.

### Cold Immunity

The dragon is immune to all cold damage, regardless of source. Ice, blizzard, and magical cold cannot harm it. In fact, cold effects strengthen the dragon slightly.

## Attributes

- **Strength:** 46-51 (1d6+45)

- **Endurance:** 34-39 (1d6+33)

- **Dexterity:** 6-9 (1d4+5)

- **Agility:** 8-11 (1d4+7)

- **Perception:** 13-18 (1d6+12)

- **Scent:** 2-5 (1d4+1)

- **Aura:** 11-16 (1d6+10)

- **Will:** 17-22 (1d6+16)

- **Reasoning:** 11-16 (1d6+10)

- **Creativity:** 9-14 (1d6+8)

- **Empathy:** 8-13 (1d6+7)

- **Eloquence:** 11-16 (1d6+10)
