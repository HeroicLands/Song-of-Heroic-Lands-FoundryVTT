---
aliases:
    - Cave Troll
tags:
    - dreadspawn
name:
    full: Cave Troll
    aliases: []
id: LLdlPmp4JmXGcj1o
slug: cave-troll
img: icons/game-icons/skoll/troll.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 33
        end: 31
        dex: 8
        agl: 8
        per: 11
        aur: 12
        wil: 16
        rea: 8
        cre: 8
    attrRollFormula:
        str: 1d6+29
        end: 1d6+27
        dex: 1d4+5
        agl: 1d4+5
        per: 1d4+8
        aur: 1d4+9
        wil: 1d4+13
        rea: 1d4+5
        cre: 1d4+5
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Arms
                  shortcode: armszone
                  probWeight: 8
                - name: Torso
                  shortcode: torsozone
                  probWeight: 8
                - name: Legs
                  shortcode: legszone
                  probWeight: 12
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
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Left Eye
                  shortcode: leyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Right Eye
                  shortcode: reyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Nose
                  shortcode: noseloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 30
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Left Cheek
                  shortcode: lcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Right Cheek
                  shortcode: rcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Left Ear
                  shortcode: learloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Right Ear
                  shortcode: rearloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Mouth
                  shortcode: mouthloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 30
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Jaw
                  shortcode: jawloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 200
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Right Shoulder
                  shortcode: rshldloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Right Upper Arm
                  shortcode: rupaloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Right Elbow
                  shortcode: relbloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Right Forearm
                  shortcode: rfraloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Right Hand
                  shortcode: rhandloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Left Shoulder
                  shortcode: lshldloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Left Upper Arm
                  shortcode: lupaloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Left Elbow
                  shortcode: lelbloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Left Forearm
                  shortcode: lfraloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Left Hand
                  shortcode: lhandloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Thorax
                  shortcode: thrxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Abdomen
                  shortcode: abdmnloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Pelvis
                  shortcode: plvisloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 20
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Right Thigh
                  shortcode: rthghloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Right Knee
                  shortcode: rkneeloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Right Calf
                  shortcode: rcalfloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Right Foot
                  shortcode: rfootloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Left Thigh
                  shortcode: lthghloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Left Knee
                  shortcode: lkneeloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Left Calf
                  shortcode: lcalfloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
                - name: Left Foot
                  shortcode: lfootloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 5
                      fire: 7
        weight:
            base: 500
            calc: 500
        reachBase: 0
        bodyScaleBase: 3
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 55
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
              masteryLevelBase: 60
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 42
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 36
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 80
        - name: Raking Claws
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 56
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Raking Claws
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 12
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 11
                      aspect: edged
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
        - name: Terrible Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 56
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Terrible Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 12
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
---

# Appearance {#appearance}

The darkness moves. A shape detaches itself from the shadows of the cave wall—pale, skeletal, impossibly tall. You smell something wild and foul, something ancient and wrong. Then you hear it: a wet, rhythmic breathing that echoes off stone, and the scrape of something sharp—claws, many of them—dragging across rock. Its eyes catch the faint light like mirrors, tiny and bright with hunger, and it smiles. The mouth is too wide.

# Dossier {#dossier}

Cave trolls are monstrous apex predators of deep cavern systems and underground kingdoms, powerful hunters that have never seen daylight. These creatures are slow of thought but devastating in combat, relying on senses far keener than any humanoid's to hunt in absolute darkness. Adventurers encounter them in extensive cave networks, at the boundaries between civilized cavern settlements and wild underground territories, and in mountain ranges riddled with deep passages.

## Presentation

The Cave Troll stands between ten and twelve feet tall, its body an exaggeration of predatory form. Its skin is pale, almost translucent in places, with a faintly luminescent sheen—blue-white and veined with darkly discolored areas suggesting corruption. The creature's limbs are long and disproportionately thin relative to its torso, ending in hands with four elongated fingers tipped in curved, razor-sharp claws. Its head is elongated and angular, with a jaw that extends unnaturally far and teeth—rows of them, serrated and wickedly pointed—that never fully close. Its eyes are small, bright, and pupilless, glowing faintly with bioluminescence. The creature produces a constant wet, rattling breathing and the sound of claws dragging against stone as it moves.

## Key Behaviors

The Cave Troll is a solitary stalker of cavern passages, claiming vast underground territories as hunting grounds. It dwells in the deepest parts of cave systems where light never penetrates, resting in concealed caverns and hunting along established routes where prey gathers. The creature has an almost supernatural ability to track prey by scent and sound alone; it hunts methodically, following prey through passages and waiting for opportunity. It exhibits territorial behavior, attacking any large creature that enters its domain. When successful in a hunt, it drags prey back to its lair to feed. It shows no interest in hoarding or collecting—only hunting and feeding.

## Combat Strategy

The Cave Troll attacks from darkness and concealment, using its sensory advantage to identify and target prey before they can react. It charges when close enough to strike, relying on overwhelming strength and viciousness. When struck by weapon or spell, it responds with blind fury, attacking wildly without tactical consideration. It does not flee from combat except when severely injured or facing apparent death; it will pursue fleeing prey through cavern passages where its movement advantage is greatest, but ceases pursuit if prey reaches open ground or sunlight. It sometimes uses its horrifying roar as a weapon, attempting to panic or disorient groups of foes.

## Attack Methods

### Raking Claws

The troll slashes viciously with its fore-claws, attempting to tear through armor and flesh alike. Multiple claw strikes in rapid succession is the creature's preferred attack pattern.

### Terrible Bite

The troll lunges with its oversized jaw, attempting to seize and crush prey or tear away entire limbs. This bite delivers devastating trauma and—if the creature successfully grapples with prey—can be maintained across multiple rounds while the troll shakes and worries the victim.

### Shocking Roar

The creature emits a deafening, inarticulate howl that reverberates through cavern passages. This roar causes disorientation and panic in those who hear it and can temporarily deafen sensitive creatures.

## Special Abilities

### Darkvision and Sensory Dominance

The Cave Troll perceives its subterranean environment through a combination of acute hearing, exceptional smell, and subtle bioluminescent sight. It functions perfectly in absolute darkness and gains significant advantage in any underground environment. Light sources disorient and weaken it, imposing penalties on its perception and attack rolls when exposed to bright light.

### Regeneration

The troll's body heals with supernatural speed. Minor wounds close within minutes; more serious injuries regenerate within hours if undisturbed. Sustained damage from fire or magical effects halts regeneration temporarily. True death requires either total destruction (severing the body into pieces that cannot reattach) or exposure to sustained sunlight.

### Tunnel Supremacy

The Cave Troll's thin frame allows it to navigate tight cavern passages that would be impassable to wider creatures. It moves through vertical shafts, narrow chimneys, and complex tunnel networks with ease, giving it pursuit and escape advantages in underground terrain.

## Additional Information

Cave trolls fear sunlight more than any other force—extended exposure to bright daylight can weaken and eventually kill them. They also show unusual vulnerability to fire, which prevents regeneration entirely as long as it's sustained. Most cave troll lairs are marked by the bones and torn armor of previous meals, creating a distinctive and disturbing archaeological marker. Some very old lairs have become cavern ossaries of immense depth.

## Attributes

- **Strength:** 30-35 (1d6+29)

- **Endurance:** 28-33 (1d6+27)

- **Dexterity:** 6-9 (1d4+5)

- **Agility:** 6-9 (1d4+5)

- **Perception:** 9-12 (1d4+8)

- **Aura:** 10-13 (1d4+9)

- **Will:** 14-17 (1d4+13)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 6-9 (1d4+5)
