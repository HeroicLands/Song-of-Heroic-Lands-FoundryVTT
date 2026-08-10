---
aliases:
    - Chimpanzee
tags:
    - animal
name:
    full: Chimpanzee
    aliases: []
id: LifKo43B3FiV9ez0
slug: chimpanzee
img: icons/game-icons/lorc/monkey.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 15
        end: 13
        dex: 15
        agl: 16
        per: 14
        aur: 11
        wil: 15
        rea: 13
        cre: 12
    attrRollFormula:
        str: 1d6+11
        end: 1d6+9
        dex: 1d6+11
        agl: 1d6+12
        per: 1d6+10
        aur: 1d6+7
        wil: 1d6+11
        rea: 1d6+9
        cre: 1d6+8
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Arms
                  shortcode: armszone
                  probWeight: 4
                - name: Torso
                  shortcode: torsozone
                  probWeight: 4
                - name: Legs
                  shortcode: legszone
                  probWeight: 6
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 1
                - name: Right Arm
                  shortcode: rarmpart
                  bodyZoneCode: armszone
                  roles:
                      - manipulator
                  canHoldItem: true
                  probWeight: 2
                - name: Left Arm
                  shortcode: larmpart
                  bodyZoneCode: armszone
                  roles:
                      - manipulator
                  canHoldItem: true
                  probWeight: 2
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 4
                - name: Right Leg
                  shortcode: rlegpart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
                - name: Left Leg
                  shortcode: llegpart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
            locations:
                - name: Skull
                  shortcode: skullloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: low
                  amputability: none
                  shockValue: 5
                  probWeight: 500
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Eye
                  shortcode: leyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Eye
                  shortcode: reyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Nose
                  shortcode: noseloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 30
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Cheek
                  shortcode: lcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Cheek
                  shortcode: rcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Ear
                  shortcode: learloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Ear
                  shortcode: rearloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Mouth
                  shortcode: mouthloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 30
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Jaw
                  shortcode: jawloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
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
                  probWeight: 200
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Shoulder
                  shortcode: rshldloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Upper Arm
                  shortcode: rupaloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Elbow
                  shortcode: relbloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Forearm
                  shortcode: rfraloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Hand
                  shortcode: rhandloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Shoulder
                  shortcode: lshldloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Upper Arm
                  shortcode: lupaloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Elbow
                  shortcode: lelbloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Forearm
                  shortcode: lfraloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Hand
                  shortcode: lhandloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Thorax
                  shortcode: thrxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Abdomen
                  shortcode: abdmnloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Pelvis
                  shortcode: plvisloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 20
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Thigh
                  shortcode: rthghloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Knee
                  shortcode: rkneeloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Calf
                  shortcode: rcalfloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Foot
                  shortcode: rfootloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Thigh
                  shortcode: lthghloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Knee
                  shortcode: lkneeloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Calf
                  shortcode: lcalfloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Foot
                  shortcode: lfootloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
        weight:
            base: 120
            calc: "120"
        reachBase: 0
        bodyScaleBase: 1.22
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 35
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
              masteryLevelBase: 75
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
              masteryLevelBase: 35
        - name: Canine Bite
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
                  name: Canine Bite
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
        - name: Pummeling Strike
          type: skill
          system:
              shortcode: punch
              subType: combattechnique
              masteryLevelBase: 72
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: punch
                  name: Pummeling Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 3
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
                      aspect: blunt
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

The first sign is the sound—a series of rising pant-hoots that chill the blood, echoing through the canopy with primal intensity. Then the figure emerges: a powerful, dark-haired form swinging from branch to branch with acrobatic grace. As it descends closer, you see the musculature, the bare face and hands of startling intelligence, and then the lips peel back in a threat display that reveals massive canines. The creature lets out a full, aggressive screech that echoes through your chest. Its eyes—intelligent, calculating, and utterly devoid of compassion—fix directly on you.

# Dossier {#dossier}

The chimpanzee is a primate of frightening intelligence and savage capability. Standing four to five and a half feet tall and weighing ninety to two hundred pounds depending on sex, these creatures possess intelligence comparable to human children, a memory of faces and grievances that rivals human capacity, and a propensity for calculated violence that exceeds most predators. Unlike bears or big cats, which kill by instinct, chimpanzees plan, coordinate, and pursue revenge with vindictive precision. They live in hierarchical societies where dominance struggles determine access to resources and mating, and these struggles are settled through violence. Adventurers may encounter chimpanzees while exploring tropical forests, investigating lost civilizations in jungle regions, or being pursued by organized groups of these creatures that view humans as territorial rivals or threats to social hierarchy.

## Presentation

A powerful primate with proportionally long arms—the span from hand to hand equals or exceeds the creature’s height. The body is compact and heavily muscled, particularly in the shoulders, chest, and back. The head is large with a pronounced brow ridge, small ears set to the sides, and a face that, while ape-like, conveys an unsettling impression of intelligence. The eyes are dark and expressive, capable of showing emotions and intentions clearly. The mouth is large with substantial canine teeth visible when the creature displays threat or bares teeth. The skin is bare on the face and hands, typically dark brown or black, while the rest of the body is covered in dark hair typically dark brown or black. Mature males develop pronounced muscle tone and sometimes acquire a speckled appearance as darker hairs emerge. The knuckles of the hands are pronounced and heavily callused, adapted for knuckle-walking. Every individual shows scars from past battles—claw marks, bite wounds, torn ears, or damaged eyes. These scars are badges of survival and status within their groups.

## Key Behaviors

Chimpanzees live in societies of fifteen to eighty individuals organized around a complex hierarchy. Dominance is established and maintained through displays of strength, coalition building, and violence. Adult males form the core of social structure, with alliances determining who holds power. Females are typically subordinate but possess their own hierarchies. Remarkably, chimpanzees wage war—distinct groups defend territories and engage in organized raids against neighboring groups, sometimes killing all members of the rival group they encounter. They are intensely territorial, patrolling boundaries and attacking intruders without mercy. Within their group, they show extraordinary social bonds: mothers and offspring remain close, coalitions form and dissolve, and individuals show genuine grief when group members die. They use tools regularly: sharpened sticks for hunting, stones for cracking nuts, moss for carrying water. They hunt, cooperatively bringing down monkeys and other animals through coordinated effort. They have learned to fear humans and fire, and this fear is transmitted through generations.

## Combat Strategy

Chimpanzees rarely engage in solitary combat if alternatives exist. When they do fight, they fight with calculated ferocity. A single chimp may flee from a lone human if uncertain of the outcome, but a group will coordinate attacks: some creating distraction while others attack from behind or above, some throwing objects while others close for combat. They target vulnerable areas: eyes, face, genitals, and extremities. Once they have disabled an opponent’s ability to defend, they will inflict maximum damage through biting and striking. They have learned from experience and will use terrain to advantage, fighting from trees if possible, using elevation to launch attacks. Their intelligence allows them to anticipate human reactions and exploit weaknesses.

## Attack Methods

### Bite with Canine Teeth

The chimpanzee lunges and attempts to bite, targeting the face, shoulder, or limb with terrible force. The massive canine teeth can penetrate muscle, crack bone, and cause catastrophic damage. A bite to the face can blind, disfigure, or tear away tissue. Bites to the neck or extremities can sever arteries and cause death through blood loss. The bite is followed by violent shaking to increase damage.

### Grappling and Throwing

Using its powerful arms, the chimp attempts to seize and control an opponent, then either throw them (causing impact damage) or pin them for additional attacks. A human thrown by a chimpanzee can suffer serious injury from impact. A pinned human is helpless against additional bites and strikes.

### Projectile Throwing

Chimpanzees will hurl rocks, sticks, fruit husks, and other objects with surprising accuracy and force. While individual projectiles cause less damage than close combat, a barrage of objects can demoralize opponents and create opportunities for closer attacks. Multiple chimpanzees throwing simultaneously can cover an opponent effectively.

### Pummeling and Striking

Using fists, the chimp delivers powerful blows, typically to the torso, face, or extremities. These strikes are less devastating than bites but serve to disable and disorient opponents.

## Special Abilities

### Brutal Intelligence and Coordination

Chimpanzees are not merely intelligent animals—they are calculating predators capable of complex planning, deception, and coordination. A group of chimpanzees will execute elaborate ambushes, coordinate attacks, and communicate during combat. They remember individual humans and hold grudges, planning attacks that account for known human capabilities. This intelligence makes them far more dangerous than animals relying on instinct alone.

### Preternatural Strength and Climbing Ability

A chimpanzee’s strength exceeds human capability by a factor of three to five, allowing them to move through forest canopy with effortless grace and inflict damage that seems impossible given their size. They can ascend vertical surfaces, swing from branch to branch with one arm while carrying additional weight, and exert force that humans cannot resist. This advantage in vertical terrain is particularly significant—humans are disadvantaged fighting creatures in trees.

### Fearlessness and Pain Tolerance

Once committed to combat, a chimpanzee fights with suicidal determination. Pain and injury do not cause retreat—injured chimpanzees often become more aggressive. This fearlessness, combined with their physical capability, makes them extraordinarily dangerous opponents that do not break from combat easily.

### Organized Group Tactics

Multiple chimpanzees hunting together employ tactics suggesting military training. They create numerical superiority, attack from multiple angles, use distraction and misdirection, and focus force against the weakest opponent to eliminate threats systematically. A group of five or more chimpanzees can overwhelm significantly larger human forces through superior coordination.

## Attributes

- **Strength:** 12-17 (1d6+11)

- **Endurance:** 10-15 (1d6+9)

- **Dexterity:** 12-17 (1d6+11)

- **Agility:** 13-18 (1d6+12)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 8-13 (1d6+7)

- **Will:** 12-17 (1d6+11)

- **Reasoning:** 10-15 (1d6+9)

- **Creativity:** 9-14 (1d6+8)
