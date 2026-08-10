---
aliases:
    - Gloomfang
tags:
    - dreadspawn
name:
    full: Gloomfang
    aliases: []
id: PdsQX4rPIfQgbxtn
slug: gloomfang
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 12
        end: 16
        dex: 16
        agl: 20
        per: 18
        aur: 8
        wil: 14
        rea: 10
        cre: 8
    attrRollFormula:
        str: 1d4+9
        end: 1d4+13
        dex: 1d4+13
        agl: 1d6+16
        per: 1d6+14
        aur: 1d6+4
        wil: 1d6+10
        rea: 1d6+6
        cre: 1d6+4
    body:
        structure:
            zones:
                - name: Forequarters
                  shortcode: fqtrzone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 2
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 2
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: fqtrzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: fqtrzone
                  roles: &a1
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 5
                - name: Right Foreleg
                  shortcode: rforelegpart
                  bodyZoneCode: fqtrzone
                  roles: *a1
                  canHoldItem: false
                  probWeight: 5
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
                  probWeight: 5
                - name: Right Hind Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindqtrzone
                  roles: []
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
                  probWeight: 2
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
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
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
                  probWeight: 3
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
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
                  probWeight: 10
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
                  probWeight: 10
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
            base: 100
            calc: 100
        reachBase: 0
        bodyScaleBase: 1.09
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 70
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
              masteryLevelBase: 80
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 85
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 33
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 76
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 35
        - name: Coordinated Bite
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
                  name: Coordinated Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 1
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
        - name: Claw Slashing
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 80
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Claw Slashing
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 0
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

Eyes catch your torchlight first—dozens of them, rings of luminescent violet that hover at shoulder height in the darkness. Then you see the creatures themselves: hunched, rat-like things the size of large dogs, covered in matted fur that might once have been brown. Teeth fill their mouths in irregular rows, and they move with skittering, jerky energy that suggests neither quite natural nor entirely corrupted. They surround you in a loose circle, no sound but the rustle of movement and the constant, hungry breathing. They are waiting for something.

# Dossier {#dossier}

Gloomfangs are pack predators of deep caverns, creatures of collective hunger and coordinated viciousness. These corrupted rodent-things hunt in organized packs under a hive-like intelligence, attempting to overwhelm prey through numbers and coordinated tactics. Adventurers encounter them in cave systems, in abandoned mines, in deep passages where they have claimed territories as their own.

## Presentation

A Gloomfang is a twisted rodent roughly the size of a large dog, standing five to six feet at the shoulder when reared upright. Its fur is matted and dirty brown, streaked with darker patches of old blood or ichor. Its body is lean and muscular, built for rapid movement rather than power. Its head is disproportionately large, filled with yellow-brown fangs that never quite fit behind its jaws. Its eyes are the most distinctive feature: bioluminescent rings of violet or sickly green that glow in darkness. Its tail is long, naked, and prehensile, capable of independent movement and used for balance and communication. Its claws are curved and sharp, adapted for climbing and slashing. Gloomfangs produce a constant, unsettling chittering sound when at rest and move with rapid, jerking motions.

## Key Behaviors

Gloomfangs are pack animals that operate under a distributed, hive-like intelligence. Each individual pack seems to answer to a larger alpha or queen, and packs in close proximity may coordinate across distance. They are active hunters that spend most daylight hours in deep caverns away from light, but they will hunt at surface level in darkness. They establish territories and aggressively defend them from both other packs and large predators. They are primarily scavengers that eat nearly anything, but they will hunt living prey when opportunity provides. When hunting, they use coordinated tactics—separating individuals, driving prey into traps, using their numbers to overwhelm defenses. Pack size ranges from three or four individuals to dozens in large colonies.

## Combat Strategy

Gloomfangs attack in coordinated waves, using the pack's first wave to wound and distract while subsequent waves move to flank and surround prey. They are not mindlessly aggressive; they withdraw individuals if a wave proves ineffective and try different angles of attack. They are particularly dangerous in confined spaces where their coordination is an advantage and flight is impossible. If a pack member is killed, the others redouble their attacks with apparent fury. Packs will continue pursuing prey only as long as the prey remains within claimed territory; pursuit ceases at territorial boundaries.

## Attack Methods

### Coordinated Bite Strikes

Multiple Gloomfangs snap forward in rapid succession, attempting to bite and tear at exposed flesh. The effectiveness of these attacks increases dramatically when the victim is surrounded or grappled.

### Claw Slashing

The creatures rake with their curved claws, attempting to open wounds and cause bleeding. Claws are capable of tearing through leather armor and soft flesh with ease.

### Pack Tackle

The Gloomfangs attempt to drag targets to the ground through coordinated assault, using numbers to overcome resistance. Once a target is prone, the pack focuses attacks on vulnerable areas.

## Special Abilities

### Darkvision Dominance

Gloomfangs navigate and hunt effectively in absolute darkness. Their bioluminescent eyes allow them to see perfectly in darkness while also allowing them to see in normal light. They are not significantly hampered by any light condition.

### Pack Coordination

Individual Gloomfangs are not particularly intelligent, but the pack operates under a form of distributed intelligence. Packs gain advantage on all tactical decisions and coordinated actions. The loss of a pack leader causes temporary coordination loss; the pack regains focus once a new hierarchy establishes.

### Endurance and Resilience

Gloomfangs can sustain intense activity for extended periods without tiring. They show remarkable resistance to poison and disease due to their hardy constitution. They can pursue prey relentlessly, matching or exceeding human endurance.

### Climbing and Vertical Movement

Gloomfangs' claws and physical form allow them to climb vertical surfaces and navigate three-dimensional terrain as easily as ground movement. This gives them advantage in pursuing or escaping across varied terrain.

## Additional Information

Bright light and fire-based attacks disrupt pack coordination and cause apparent distress to the creatures. Light sources can be used to drive packs away or force them to regroup. Gloomfang colonies are centered around a single queen or alpha, and destroying the leader can scatter packs that would normally maintain organization. Some colonies have been observed harvesting specific prey species rather than hunting randomly, suggesting learned behavior and possibly long-term planning.

## Attributes

- **Strength:** 10-13 (1d4+9)

- **Endurance:** 14-17 (1d4+13)

- **Dexterity:** 14-17 (1d4+13)

- **Agility:** 17-22 (1d6+16)

- **Perception:** 15-20 (1d6+14)

- **Aura:** 5-10 (1d6+4)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 7-12 (1d6+6)

- **Creativity:** 5-10 (1d6+4)
