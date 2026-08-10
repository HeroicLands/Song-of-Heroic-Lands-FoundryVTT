---
aliases:
    - Sickleclaw Troodon
tags:
    - animal
name:
    full: Sickleclaw Troodon
    aliases: []
id: Nhye3QyqJk7qjPvr
slug: sickleclaw-troodon
img: icons/game-icons/lorc/dinosaur-rex.svg
portrait: ""
shortcode: scklclwt
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 11
        end: 12
        dex: 17
        agl: 16
        per: 15
        aur: 10
        wil: 13
        rea: 9
        cre: 8
    attrRollFormula:
        str: 1d6+7
        end: 1d6+8
        dex: 1d6+13
        agl: 1d6+12
        per: 1d6+11
        aur: 1d4+7
        wil: 1d6+9
        rea: 1d4+6
        cre: 1d4+5
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Body
                  shortcode: torsozone
                  probWeight: 2
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
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Foreclaw
                  shortcode: lforelegpart
                  bodyZoneCode: torsozone
                  roles: &a1
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 2
                - name: Right Foreclaw
                  shortcode: rforelegpart
                  bodyZoneCode: torsozone
                  roles: *a1
                  canHoldItem: false
                  probWeight: 2
                - name: Left Leg
                  shortcode: lhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 8
                - name: Right Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 8
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindqtrzone
                  roles: []
                  canHoldItem: false
                  probWeight: 4
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 6
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
                  probWeight: 4
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
                - name: Left Foreclaw
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
                - name: Right Foreclaw
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
                - name: Left Leg
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
                - name: Right Leg
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
            calc: "100"
        reachBase: 0
        bodyScaleBase: 1
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 80
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
              masteryLevelBase: 70
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 70
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 33
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 30
        - name: Precision Slash
          type: skill
          system:
              shortcode: talon
              subType: combattechnique
              masteryLevelBase: 72
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: talon
                  name: Precision Slash
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
                      aspect: edged
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
        - name: Bite
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
                  name: Bite
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
---

# Appearance {#appearance}

The creature stands motionless, and your eyes nearly pass over it — a feathered shape small enough to dismiss before the reflective eyes snap toward you with predatory awareness. It's impossibly slender for a predator, standing barely taller than a human waist, yet there is nothing harmless in its bearing. The head tilts, and you see the mouth open, revealing a line of needle-sharp teeth designed for precision cuts rather than crushing. Then it moves, and the horror becomes clear — the slow, deliberate tap-tap-tap of a curved claw against stone echoing through the space, and you realize something terrible: the sound is meant for you. This creature does not hunt with speed or surprise, but with patience and psychological dissolution.

# Dossier {#dossier}

The Sickleclaw Troodon is a small bipedal predator standing 3-4 feet tall, found in forests, badlands, and ruins across temperate to warm regions. These sophisticated hunters use stealth, patience, and psychological warfare to overcome prey, relying on terror and disorientation rather than direct physical superiority. Adventurers encounter troodons primarily while camping, exploring ruins, or traversing forests where the creatures establish territory.

## Presentation

The Sickleclaw Troodon is a lean, feathered predator with a body built for balance and precision. The head is relatively small with large, reflective eyes positioned for forward-facing vision and maximal light gathering in dim conditions. The mouth is filled with needle-like teeth designed for precision cutting rather than crushing. The body is covered in fine, downy feathers that may be dark brown, gray, or mottled for camouflage. The most distinctive feature is the sickle-shaped claw on each hind foot — a curved talon approximately 2-3 inches in length, clearly adapted for slashing rather than gripping. The feet are three-toed and adapted for delicate, quiet movement. The tail is long and feathered, used for balance and directional control.

## Key Behaviors

Troodons are intelligent pack predators that hunt with sophisticated coordination and psychological tactics. They stalk prey relentlessly, maintaining pursuit across days or weeks while remaining just out of view, allowing their eerie claw-tapping to create a sense of inescapable hunting. They emit vocalizations combining low growls and sudden sharp shrieks designed to create panic and disorientation in prey. Young troodons are trained in coordinated pack hunting and develop sophisticated understanding of prey behavior. The creatures are most active during twilight and night hours but hunt opportunistically. After a kill, troodons exhibit behavior suggesting intentional arrangement of prey remains in disturbing patterns, possibly serving territorial warning or social communication functions.

## Combat Strategy

Troodons rarely engage in direct sustained combat, preferring psychological warfare and coordinated ambush. A pack will stalk, harass, and create opportunities for individual troodons to make precision strikes at vital areas. The creatures attack weak points — eyes, throat, unarmored joints — with blinding speed, withdraw, and allow the prey to suffer while the pack continues pursuit. This strategy is designed to demoralize and weaken prey across extended engagement rather than to achieve immediate victory. A cornered troodon becomes more aggressive, and a pack defending young shows suicidal determination.

## Attack Methods

### Precision Slash

The troodon executes a high-speed slash with its sickle claw, targeting eyes, throat, or the vulnerable underside of the arm or leg. The attack is designed for precision rather than raw damage and is extremely difficult to defend against due to speed.

### Bite Attack

The troodon's bite, while not delivering crushing force, is designed to create precision wounds and lacerations. Multiple bites can create severe blood loss and debilitation.

### Coordinated Attack

Pack members attack simultaneously from different directions, making it nearly impossible for a target to defend against all threats. The pack uses vocalizations to coordinate timing and target assignment.

## Special Abilities

### Surgical Precision

The troodon's attacks are calculated to target vital areas and vulnerable points. The creature gains advantage on attack rolls against unarmored targets and against specific vital areas (throat, eyes, joints).

### Psychological Warfare

The troodon's tapping claws, eerie vocalizations, and relentless stalking create cumulative psychological pressure on prey. Prolonged exposure to troodon hunting can cause terror, paranoia, and disorientation in victims.

### Pack Coordination

Troodons communicate through sophisticated vocalizations and body language, allowing coordinated attacks that are nearly impossible for individuals to defend against. Pack members instinctively support each other in combat.

### Reflective Eyes

The troodon's eyes are adapted for maximum light gathering and low-light vision. The creature can navigate and hunt in near-total darkness and is particularly vulnerable to sudden bright light.

### Stealth and Speed

The troodon is exceptionally quick and quiet, capable of approaching prey without detection. The creature gains advantage on stealth checks and can move at speed while remaining relatively silent.

### Additional Information

Troodons are much less dangerous when isolated from pack support or in well-lit areas. The creatures are vulnerable to sustained, organized defense but are superlative at breaking down demoralized or already-wounded prey. Some humanoid cultures view troodons as omens of death and have elaborate rituals for handling or avoiding encounters. A troodon that has successfully hunted humanoids becomes more likely to target humans in future encounters.

## Attributes

- **Strength:** 8-13 (1d6+7)

- **Endurance:** 9-14 (1d6+8)

- **Dexterity:** 14-19 (1d6+13)

- **Agility:** 13-18 (1d6+12)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 8-11 (1d4+7)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 6-9 (1d4+5)
