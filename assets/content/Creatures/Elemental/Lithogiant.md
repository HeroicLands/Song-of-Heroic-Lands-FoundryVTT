---
aliases:
    - Lithogiant
tags:
    - elemental
name:
    full: Lithogiant
    aliases: []
id: OBrElkIzfPrZaQbM
slug: lithogiant
img: icons/game-icons/delapouite/rock-golem.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 55
        end: 19
        dex: 6
        agl: 6
        per: 8
        aur: 8
        wil: 11
        cre: 6
        rea: 5
    attrRollFormula:
        str: 1d6+52
        end: 1d4+16
        dex: 1d4+3
        agl: 1d4+3
        per: 1d4+5
        aur: 1d4+5
        wil: 1d4+8
        cre: 1d4+3
        rea: 1d4+3
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 3
                - name: Arms
                  shortcode: armszone
                  probWeight: 12
                - name: Torso
                  shortcode: torsozone
                  probWeight: 12
                - name: Legs
                  shortcode: legszone
                  probWeight: 18
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
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
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Left Eye
                  shortcode: leyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Right Eye
                  shortcode: reyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Nose
                  shortcode: noseloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 30
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Left Cheek
                  shortcode: lcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Right Cheek
                  shortcode: rcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Left Ear
                  shortcode: learloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Right Ear
                  shortcode: rearloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Mouth
                  shortcode: mouthloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 30
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Jaw
                  shortcode: jawloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
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
                  probWeight: 200
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Right Shoulder
                  shortcode: rshldloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Right Upper Arm
                  shortcode: rupaloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Right Elbow
                  shortcode: relbloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Right Forearm
                  shortcode: rfraloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Right Hand
                  shortcode: rhandloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Left Shoulder
                  shortcode: lshldloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Left Upper Arm
                  shortcode: lupaloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Left Elbow
                  shortcode: lelbloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Left Forearm
                  shortcode: lfraloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Left Hand
                  shortcode: lhandloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Thorax
                  shortcode: thrxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Abdomen
                  shortcode: abdmnloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Pelvis
                  shortcode: plvisloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 20
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Right Thigh
                  shortcode: rthghloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Right Knee
                  shortcode: rkneeloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Right Calf
                  shortcode: rcalfloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Right Foot
                  shortcode: rfootloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Left Thigh
                  shortcode: lthghloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Left Knee
                  shortcode: lkneeloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Left Calf
                  shortcode: lcalfloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
                - name: Left Foot
                  shortcode: lfootloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 11
                      edged: 10
                      piercing: 9
                      fire: 11
        weight:
            base: 49000
            calc: "49000"
        reachBase: 0
        bodyScaleBase: 2.85
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
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
              masteryLevelBase: 50
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 40
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 27
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 32
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 28
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 93
        - name: Crushing Blow
          type: skill
          system:
              shortcode: punch
              subType: combattechnique
              masteryLevelBase: 52
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: punch
                  name: Crushing Blow
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 9
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 22
                      aspect: blunt
                  lengthBase: 4
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
        - name: Seismic Stomp
          type: skill
          system:
              shortcode: kick
              subType: combattechnique
              masteryLevelBase: 42
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: kick
                  name: Seismic Stomp
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 18
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 20
                      aspect: blunt
                  lengthBase: 5
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
        - name: Rock Throw
          type: skill
          system:
              shortcode: hurl
              subType: combattechnique
              masteryLevelBase: 42
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: hurl
                  name: Rock Throw
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 24
                      aspect: blunt
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 160
                  drawBase: 0
                  traits: {}
---

# Appearance {#appearance}

The ground trembles. What rises before you is the size of a house, then larger—a humanoid figure of solid stone and living earth, perhaps twenty-five to thirty feet in height. Its body is composed of massive interlocked stone blocks and carved rock, with a silhouette of geological strata made animate. Where it moves, the earth shakes, and small stones rattle and bounce from the vibration. Its eyes are burning points deep within a stone head, and when it shifts its weight, entire hillsides seem to shift with it. It regards you with the alien patience of something that measures time in geological epochs.

# Dossier {#dossier}

A Lithogiant is raw elemental power—an earth elemental of titanic proportions. It is not bound to a specific location but wanders across mountain ranges and high plateaus, following paths that only it understands. Most Lithogiants are solitary and avoid human settlements, but an agitated or territorial one can be an apocalyptic threat to entire regions. A Lithogiant does not hunt; it simply moves according to its own imperatives. Anything in its path is an obstacle to be removed.

## Presentation

A Lithogiant stands twenty-five to thirty feet tall and is composed entirely of stone and earth held together by magic. Its body has a roughly humanoid shape—two legs, a torso, two arms, and a head—but the proportions are strange, shifted toward strength and endurance rather than human aesthetics. Its surface is jagged and rough, with exposed stone faces and geological patterns visible across its body. Its eyes are deep within its head, burning with a dull orange or red glow. Its hands are massive and stone, and its stride can crack the earth.

## Key Behaviors

Lithogiants are slow-moving but inexorable. They seem to follow invisible paths across mountain ranges, and they seem drawn to places of geological interest—ancient stones, sites of past earthquakes, places where the earth's power is evident. They are not territorial in the normal sense, but they will not tolerate being blocked or redirected. They seem to have no need for food, sleep, or rest. They simply move, endure, and exist. Most encounters involve a Lithogiant passing through a region—the threat being not active aggression but simple unstoppable motion.

## Combat Strategy

A Lithogiant does not fight tactically or with cunning. It moves toward its destination regardless of obstacles. If attacked, it defends itself with straightforward, overwhelming force. It will not pursue fleeing opponents but will systematically crush any obstacle that remains in its path. It is too slow to catch fast-moving enemies and does not attempt to do so. It is nearly impossible to injure seriously and continues moving even when partially damaged.

## Attack Methods

### Crushing Blows

The Lithogiant swings an arm or strikes with a hand, and the impact is apocalyptic. The blow carries the weight and momentum of a moving mountain. Victims struck are instantly killed or catastrophically injured. Objects struck are reduced to rubble.

### Seismic Stomp

The Lithogiant raises a foot and brings it down with world-shaking force. The impact creates localized earthquakes that ripple outward, causing buildings to collapse, ground to crack, and mounted enemies to be thrown. The effect can extend for hundreds of feet.

### Rock Throw

The Lithogiant picks up boulders or tears chunks from the landscape and hurls them at targets. These projectiles are massive enough to crush buildings and can strike with lethal force against even well-protected targets.

### Ground Manipulation

The Lithogiant can cause the ground beneath it to shift and buckle, creating obstacles, chasms, or unstable terrain that makes movement difficult for smaller creatures.

## Special Abilities

### Titanic Strength

The Lithogiant's physical strength is beyond the scale of normal creatures. It can move boulders that weigh hundreds of tons, reshape landscapes, and destroy buildings with casual effort.

### Seismic Presence

Simply existing, the Lithogiant causes the earth to tremble. Structures nearby experience constant minor earthquakes, and the ground becomes increasingly unstable in areas where it spends time.

### Earth Elemental Resilience

The Lithogiant is composed of stone and is nearly indestructible. It regenerates from earth-based magic and is only truly harmed by water-based magic, which can erode and crack it, or by air-based magic, which can scatter its components.

### Geological Awareness

The Lithogiant seems to perceive the earth on a level that humans cannot. It knows the structure of mountains and can sense geological anomalies. It may move according to knowledge of earthquakes or tectonic shifts about to occur.

## Additional Information

Water is the Lithogiant's primary vulnerability. Large bodies of flowing water can erode it, and sustained water-based magic can crack and damage its form. Settling it into a deep river or causing a flood can harm it significantly. Air-based magic that can scatter its stone components is also effective. A Lithogiant destroyed by dispersal or sinking cannot easily reform. One destroyed on solid earth may regenerate given enough time. Most encounters with Lithogiants cannot be won through combat; the goal is instead to get out of the creature's path or to redirect it toward a hazard (a chasm, a river, a flood). Some philosophers argue that Lithogiants serve a purpose in reshaping the world according to deeper geological principles beyond human understanding, and that killing one may have consequences beyond the obvious.

## Attributes

- **Strength:** 17-20 (1d4+16)

- **Endurance:** 17-20 (1d4+16)

- **Dexterity:** 4-7 (1d4+3)

- **Agility:** 4-7 (1d4+3)

- **Perception:** 6-9 (1d4+5)

- **Aura:** 6-9 (1d4+5)

- **Will:** 9-12 (1d4+8)

- **Creativity:** 4-7 (1d4+3)
