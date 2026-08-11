---
aliases:
    - Shadowstalker
tags:
    - spirit
name:
    full: Shadowstalker
    aliases: []
id: K30OECnGa5hVR22R
img: icons/game-icons/lorc/spectre.svg
portrait: ""
shortcode: shdwstlk
type: creature
package: sohl
sohl:
    kbcat: spirit
    archetype: 0
    attributes:
        str: 14
        end: 16
        dex: 18
        agl: 18
        per: 16
        aur: 20
        wil: 18
        rea: 14
        cre: 16
    attrRollFormula:
        str: 1d6+10
        end: 1d4+13
        dex: 1d6+14
        agl: 1d6+14
        per: 1d4+13
        aur: 1d6+16
        wil: 1d6+14
        rea: 1d6+10
        cre: 1d4+13
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
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Eye
                  shortcode: leyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Eye
                  shortcode: reyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Nose
                  shortcode: noseloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Cheek
                  shortcode: lcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Cheek
                  shortcode: rcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Ear
                  shortcode: learloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Ear
                  shortcode: rearloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Mouth
                  shortcode: mouthloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Jaw
                  shortcode: jawloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 200
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Shoulder
                  shortcode: rshldloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Upper Arm
                  shortcode: rupaloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Elbow
                  shortcode: relbloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Forearm
                  shortcode: rfraloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Hand
                  shortcode: rhandloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Shoulder
                  shortcode: lshldloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Upper Arm
                  shortcode: lupaloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Elbow
                  shortcode: lelbloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Forearm
                  shortcode: lfraloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Hand
                  shortcode: lhandloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Thorax
                  shortcode: thrxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Abdomen
                  shortcode: abdmnloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Pelvis
                  shortcode: plvisloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 20
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Thigh
                  shortcode: rthghloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Knee
                  shortcode: rkneeloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Calf
                  shortcode: rcalfloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Right Foot
                  shortcode: rfootloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Thigh
                  shortcode: lthghloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Knee
                  shortcode: lkneeloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Calf
                  shortcode: lcalfloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
                - name: Left Foot
                  shortcode: lfootloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 0
                      edged: 0
                      piercing: 0
                      fire: 0
        weight:
            base: 130
            calc: 130
        reachBase: 0
        bodyScaleBase: 1.17
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 70
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: mixed_forest
                mode: add
                textValue: "0"
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 85
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 90
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 57
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 64
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 68
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 38
        - name: Shadow Claws
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 76
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Shadow Claws
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 1
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

You feel it a moment before you see it—a sudden chill down the spine, the prickle of being watched. Then your eyes catch motion in the corner, a shape in shadow that should not move independently of the light that creates it. It is vaguely humanoid but wrong in proportion, with angles too sharp and movements too liquid. Before your mind can quite process what you are seeing, it is no longer there—only the lingering sensation that something predatory measured you and found you wanting.

# Dossier {#dossier}

Shadowstalkers are assassins of the spirit realm—born from murder, shaped by desperation, or occasionally bound into service by dark sorcerers. They are not mindless killers but tactical beings with their own codes and purposes. Some Shadowstalkers hunt specific targets across years; others are bound to a location and strike at any who enter their domain. All share an inhuman talent for moving unseen and striking with lethal precision. Most dangerous is that a Shadowstalker learns—each failed kill attempt teaches it something about its prey.

## Presentation

A Shadowstalker is a being of movement rather than form. When partially visible, it appears vaguely humanoid but proportioned for killing—long, thin limbs; compact torso; predatory spine. Its body is composed of darkness made semi-solid, with edges that blur and shift like smoke. Its eyes are the most distinct feature: deep red or burning amber, positioned with unsettling awareness, and clearly intelligent. Where it passes, shadows seem to deepen and cling to it like fabric. It makes almost no sound—even when moving across loose stone or broken glass, the creature seems to muffle the world around it.

## Key Behaviors

Shadowstalkers are ambush hunters with a preference for isolated victims. They stalk prey for extended periods, learning routines, identifying weaknesses, and timing the optimal moment for attack. Some Shadowstalkers seem to take pleasure in the hunt itself, drawing it out unnecessarily; others strike with brutal efficiency. They are territorial and will defend their hunting grounds against humans and other Shadowstalkers alike. They seem to understand the concept of mercy—occasionally releasing a victim who appeals to them in some way—but mercy is rare and idiosyncratic.

## Combat Strategy

A Shadowstalker never engages in fair combat if avoidable. It attacks from darkness, deals devastating damage in the first strike, and then repositions or flees if the fight doesn't go perfectly. It uses shadows as both concealment and highways, and it targets isolated opponents whenever possible. Against multiple enemies, it attempts to separate and disable them methodically rather than engaging all at once. It is intelligent enough to recognize when an enemy poses too much threat and will withdraw to another day. Radiant light infuriates and panics a Shadowstalker, forcing it to become more aggressive and reckless.

## Attack Methods

### Shadow Claws

The Shadowstalker extends claws that seem to be formed of living shadow, and they strike with supernatural force. The wounds they leave are grievous but also numbing—victims feel the cold touch of the necrotic energy, as if the wound itself is draining warmth and life. A claw strike leaves a victim weakened and struggling to act decisively.

### Necrotic Dagger Strike

The creature manifests a blade of shadows and bone and strikes with perfect precision at vital targets. These strikes are less about physical damage and more about spiritual harm—victims report feeling as though the blade reached into them, pulling at something fundamental. Multiple strikes can leave a person hollow, unmotivated, barely alive.

## Special Abilities

### Shadow Mastery

In any shadow or dim light, the Shadowstalker can move with invisibility-like concealment. It can see clearly in darkness and can move through shadows as though they were open space. Darkness is its natural element and its advantage there is overwhelming.

### Stealth Excellence

The creature is nearly impossible to detect when it is being deliberate. It moves without making sound, and its form blends with shadows so completely that even those watching for it often miss its presence. Only active searching or magical detection has a reasonable chance of exposing a hidden Shadowstalker.

### Precision Strike

When attacking from stealth or from surprise, a Shadowstalker's strike is devastatingly accurate. It aims for vulnerabilities in armor, the gaps between defenses, the places where a strike does the most harm.

### Life Drain

The necrotic energy in the creature's attacks drains not merely health but vitality. Victims struck by a Shadowstalker find their strength diminishing, not just from the wounds but from the unnatural cold the creature leaves behind.

### Necrotic Resistance

The Shadowstalker is resistant to necrotic energy and completely immune to normal disease. Radiant energy and light are the primary things that can harm it beyond normal weapons.

## Additional Information

Radiant light is the key counter to a Shadowstalker. Bright magical light forces the creature into a more material state where normal weapons can harm it effectively. Sacred sites and temples empowered by good-natured faiths are places where Shadowstalkers cannot hide. Some Shadowstalkers can be negotiated with, especially those bound to service rather than driven by hunger. Others are utterly implacable and will pursue a target across the world. The most dangerous Shadowstalkers are those that develop obsessions with particular prey—they become unstoppable until either the prey is dead or the Shadowstalker is destroyed.

## Attributes

- **Strength:** 11-16 (1d6+10)

- **Endurance:** 14-17 (1d4+13)

- **Dexterity:** 15-20 (1d6+14)

- **Agility:** 15-20 (1d6+14)

- **Perception:** 14-17 (1d4+13)

- **Aura:** 17-22 (1d6+16)

- **Will:** 15-20 (1d6+14)

- **Reasoning:** 11-16 (1d6+10)

- **Creativity:** 14-17 (1d4+13)
