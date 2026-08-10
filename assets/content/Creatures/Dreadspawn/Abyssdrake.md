---
aliases:
    - Abyssdrake
tags:
    - dreadspawn
name:
    full: Abyssdrake
    aliases: []
id: MoaH3MMvKwCfPZpw
slug: abyssdrake
img: icons/game-icons/faithtoken/dragon-head.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 17
        end: 17
        dex: 13
        agl: 15
        per: 15
        aur: 19
        wil: 17
        rea: 11
        cre: 13
    attrRollFormula:
        str: 1d4+14
        end: 1d4+14
        dex: 1d4+10
        agl: 1d4+12
        per: 1d4+12
        aur: 1d4+16
        wil: 1d4+14
        rea: 1d4+8
        cre: 1d4+10
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 4
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 4
                - name: Torso
                  shortcode: torsozone
                  probWeight: 8
                - name: Hindquarters
                  shortcode: hindqtrzone
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
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: forelegszone
                  roles: &a1
                      - locomotor
                      - manipulator
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
                  roles:
                      - manipulator
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
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
        weight:
            base: 1500
            calc: 1500
        reachBase: 0
        bodyScaleBase: 1.55
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 60
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: aerial
          feetPerRound: 100
          leaguesPerWatch: 10
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
              masteryLevelBase: 80
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 54
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
              masteryLevelBase: 43
        - name: Serpent Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 70
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Serpent Bite
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
        - name: Shadow Claws
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 70
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
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 3
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
        - name: Corrosive Breath
          type: skill
          system:
              shortcode: breath
              subType: combattechnique
              masteryLevelBase: 73
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: breath
                  name: Corrosive Breath
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 4
                      modifier: 5
                      aspect: fire
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 60
                  drawBase: 0
                  traits: {}
---

# Appearance {#appearance}

The temperature drops as a sinuous shape moves through the water—a body serpentine and scaled in deepest obsidian, barely visible even in daylight. When it turns, your breath catches: its eyes burn with cold, actinic blue light, and along its spine, jagged fins trail a luminescence of sickly green and purple. The stench reaches you first—brine mixed with something sulfurous, decaying, wrong. Its scales catch the light in ways that hurt to watch, as if they exist slightly out of phase with reality.

# Dossier {#dossier}

Abyssdrakes are draconic hunters born in crushing oceanic depths or caverns so dark that light becomes a weapon against them. These creatures are ambush predators of rare intelligence, dwelling in sunken ruins, abyssal trenches, and underwater passages between worlds. Adventurers may encounter an Abyssdrake guarding forbidden places—ruined temples, portals, or grotesquely corrupted sanctuaries—where the creature has made its lair.

## Presentation

The creature resembles a slender, wingless drake roughly twenty to thirty feet in length, its body covered in obsidian-black scales that seem to absorb light rather than reflect it. Its head tapers to a pointed snout lined with backward-curving teeth; above each eye, a ridge of jagged, backward-pointing fins protrudes. A mane of similar spikes runs the length of its spine, each one rimmed in phosphorescent violet or sickly green. Its claws are elongated and wickedly sharp, resembling black iron. It moves with predatory grace, equally at home in water and on land, and produces a low, thrumming hiss that vibrates in bone and chest.

## Key Behaviors

The Abyssdrake hunts in isolation, claiming vast territories as its own. It lurks in the deepest parts of its domain—lightless caverns, sunken ruins, narrow passages where its sinuous form gives it advantage. The creature is a patient hunter, willing to remain motionless for days to ambush prey. It exhibits tool-like reasoning in selecting and defending its hunting ground; it may even attempt to drive competitors from its territory without eating them, establishing dominance. When wounded or threatened with starvation, it becomes erratic and aggressive.

## Combat Strategy

The Abyssdrake favors ambush from darkness or murky water, striking from concealment to wound prey with teeth and claws before withdrawing to assess. In prolonged combat, it uses terrain to break line of sight, regenerating its wounds from the shadows. It does not fight to the death—if an encounter turns unfavorably, it flees into deepest water, knowing pursuers cannot follow. It shows particular cunning in using confined spaces against larger or multiple foes.

## Attack Methods

### Serpent Bite

The creature lunges with its full body behind a devastating bite attack, attempting to seize and crush prey in its jaws. The bite inflicts massive trauma; if it succeeds in grappling, it can hold prey in its mouth for multiple rounds, dragging them toward deeper water.

### Shadow Claws

Raking attacks with its fore-claws rake and tear armor, cloth, and flesh alike. The creature uses these in combination with its bite, attempting to immobilize prey long enough to drag them to deeper, darker ground.

### Corrosive Breath

The drake exhales a stream of caustic vapor and fluid that dissolves flesh and corrodes armor. This breath weapon leaves chemical burns that continue damaging exposed skin for rounds after the initial exhalation.

## Special Abilities

### Shadow Adaptation

The Abyssdrake is nearly invisible in darkness or murky water. In dim light or shadow, it gains advantage on concealment checks; in complete darkness, it has advantage on all attack rolls made against creatures that cannot see in darkness.

### Regeneration

Drawn from deep places where natural law frays, the creature regenerates slowly from wounds. So long as it remains in darkness or water, it heals at an accelerated rate; sunlight and prolonged exposure to bright light halts regeneration entirely.

### Aquatic Propulsion

The drake's sinuous body and powerful tail give it exceptional speed in water, allowing it to move faster than most swimmers and to maneuver in ways land-bound creatures cannot match.

## Additional Information

Abyssdrakes are vulnerable to sustained light exposure; creatures wielding light-generating items (enchanted torches, magical spells) can drive one from its lair or prevent it from regenerating. Some scholars believe Abyssdrakes are partially extraplanar in nature, explaining their resistance to conventional weapons and their seeming indifference to depth pressure.

## Attributes

- **Strength:** 15-18 (1d4+14)

- **Endurance:** 15-18 (1d4+14)

- **Dexterity:** 11-14 (1d4+10)

- **Agility:** 13-16 (1d4+12)

- **Perception:** 13-16 (1d4+12)

- **Aura:** 17-20 (1d4+16)

- **Will:** 15-18 (1d4+14)

- **Reasoning:** 9-12 (1d4+8)

- **Creativity:** 11-14 (1d4+10)
