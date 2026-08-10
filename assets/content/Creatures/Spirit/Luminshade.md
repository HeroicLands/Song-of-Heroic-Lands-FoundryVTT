---
aliases:
    - Luminshade
tags:
    - spirit
name:
    full: Luminshade
    aliases: []
id: V51NYCYdbU2A7tse
slug: luminshade
img: icons/game-icons/lorc/spectre.svg
portrait: ""
shortcode: lmnshd
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 11
        end: 13
        dex: 15
        agl: 17
        per: 15
        aur: 15
        wil: 11
        rea: 11
        cre: 15
    attrRollFormula:
        str: 1d4+8
        end: 1d4+10
        dex: 1d4+12
        agl: 1d4+14
        per: 1d4+12
        aur: 1d4+12
        wil: 1d4+8
        rea: 1d4+8
        cre: 1d4+12
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
            base: 0
            calc: 0
        reachBase: 0
        bodyScaleBase: 1
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
          feetPerRound: 50
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
              masteryLevelBase: 65
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 70
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 39
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 64
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 30
        - name: Shadow Strike
          type: skill
          system:
              shortcode: punch
              subType: combattechnique
              masteryLevelBase: 74
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: punch
                  name: Shadow Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 3
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 0
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
        - name: Light Blast
          type: skill
          system:
              shortcode: bolt
              subType: combattechnique
              masteryLevelBase: 74
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: bolt
                  name: Light Blast
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 3
                      aspect: fire
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 45
                  drawBase: 0
                  traits: {}
---

# Appearance {#appearance}

Where there is light, a shadow moves against it. Where there is darkness, a pale luminescence blooms. The figure is beautiful in the way that the edge of a knife is beautiful—precise, dangerous, and utterly indifferent to your perception of it. Its form shifts between solid and translucent, and the longer you look at it, the harder it is to determine what you're actually seeing.

# Dossier {#dossier}

Luminshades are paradox creatures born where light and shadow meet in unusual proportion. They exist in the liminal spaces between day and night, in reflective surfaces and the gaps between stars. Unlike most spirits, they are not inherently malevolent, but their nature makes them incomprehensible to humans. A Luminshade may observe humans for months with no hostile intent, studying them as a scholar might study insects. Alternatively, it may decide on a whim that a particular person must be removed. They sometimes serve as agents or messengers for more powerful entities, though their loyalty is questionable and their terms often incomprehensible.

## Presentation

A Luminshade is roughly human-shaped but clearly not human. Its body is composed of light and shadow in perfect balance—neither predominates, and both seem to shift independently. It stands about six feet tall, with limbs that are too long and graceful, and movements that seem to flow rather than step. Its face is smooth and featureless except for two points of luminescence where eyes should be—sometimes bright, sometimes dark, sometimes shifting between colors. The creature is semi-transparent, and through its body, the background becomes visible yet distorted, as if you are seeing the world through warped glass. It leaves no shadow when standing in light, and casts no glow when standing in darkness.

## Key Behaviors

Luminshades are curiosity-driven beings. They are drawn to places of change—battlefields, cities growing or shrinking, the boundaries between realms. They often appear at twilight or in places where light interacts strangely with architecture (mirrors, glass, water). Some scholars believe Luminshades are collectors of memories or moments, gathering impressions of events they find aesthetically interesting. A Luminshade may protect a location it finds beautiful, or destroy one it finds ugly, with no regard for the humans inhabiting it. They do not hunt for food and do not require sleep. Their motivations, if they exist, are utterly alien.

## Combat Strategy

Luminshades fight with creative, almost playful violence if forced into combat. They use their control over light and shadow to create confusion, with the goal of making combat more interesting rather than more efficient. They may refuse to fight a boring opponent, or press harder against a worthy one. They are not cowardly but they are vain; disabling their light-form can frustrate them enough to make them careless. They often disengage combat not from injury but from boredom, deciding the encounter is no longer aesthetically interesting.

## Attack Methods

### Light Blast

The creature focuses its luminous form into a concentrated beam or burst of painful brightness. Victims struck by this attack feel as though they've stared into the sun; their eyes water and their vision becomes temporarily unclear. Multiple strikes can cause lasting eye damage.

### Shadow Strike

The creature draws the surrounding shadows toward itself and lashes out with tendrils of darkness. Unlike physical strikes, this attack leaves the victim feeling cold and diminished, as though some inner light has been drained away.

## Special Abilities

### Light Manipulation

The Luminshade can bend, redirect, and concentrate light in its vicinity with precision. It can create blindingly bright flashes, cause reflections to become mirrors that show false images, or redirect a beam of light to strike a specific target multiple times.

### Shadow Weaving

With equal finesse, the creature can manipulate darkness—deepening shadows to invisibility, creating zones of absolute darkness where light cannot penetrate, or forming solid-seeming shadows that slow or tangle those who attempt to move through them.

### Translocation Through Light

The Luminshade can move through reflective surfaces and directly between areas of light. It can step into a mirror and emerge from another, or move from one torch's glow to another torch's glow instantly, crossing the intervening darkness in zero time. This ability only works between light sources that the creature can see.

### Paradox Nature

Being composed of equal parts light and shadow makes the Luminshade resistant to both darkness and light magic. However, it becomes more vulnerable when forced into a state of extreme shadow or extreme light—if surrounded only by darkness, or only by blinding brightness, it loses mobility and becomes vulnerable to attack.

## Additional Information

Luminshades are not evil and not good; they are aesthetic beings that care about beauty, symmetry, and interesting patterns. A Luminshade can sometimes be bargained with or negotiated with, but only on grounds that appeal to its sense of aesthetics. Offering to preserve something beautiful, or promising an interesting experience, may sway it. Threatening or harming something beautiful in its presence will enrage it far more effectively than direct challenge. A Luminshade defeated in combat often simply withdraws to wherever it came from, bearing no lasting grudge. Some communities have learned to coexist with local Luminshades by maintaining beautiful places and offering interesting events that keep the creatures engaged elsewhere.

## Attributes

- **Strength:** 9-12 (1d4+8)

- **Endurance:** 11-14 (1d4+10)

- **Dexterity:** 13-16 (1d4+12)

- **Agility:** 15-18 (1d4+14)

- **Perception:** 13-16 (1d4+12)

- **Aura:** 13-16 (1d4+12)

- **Will:** 9-12 (1d4+8)

- **Reasoning:** 9-12 (1d4+8)

- **Creativity:** 13-16 (1d4+12)
