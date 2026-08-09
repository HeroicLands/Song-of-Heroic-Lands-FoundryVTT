---
aliases:
    - Mountain Troll
tags:
    - dreadspawn
name:
    full: Mountain Troll
    aliases: []
id: CkpnCdKnSiNWnnjO
slug: mountain-troll
img: icons/game-icons/skoll/troll.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 42
        end: 28
        dex: 8
        agl: 9
        per: 11
        aur: 12
        wil: 14
        rea: 8
        cre: 8
    attrRollFormula:
        str: 1d6+39
        end: 1d6+24
        dex: 1d4+5
        agl: 1d4+6
        per: 1d4+8
        aur: 1d4+9
        wil: 1d6+10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
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
                      piercing: 8
                      fire: 10
        weight:
            base: 7000
            calc: "7000"
        reachBase: 0
        bodyScaleBase: 3.82
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
              masteryLevelBase: 65
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 55
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
              masteryLevelBase: 40
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 88
        - name: Fist Strike
          type: skill
          system:
              shortcode: punch
              subType: combattechnique
              masteryLevelBase: 58
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: punch
                  name: Fist Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 15
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
        - name: Earthshaker Stomp
          type: skill
          system:
              shortcode: kick
              subType: combattechnique
              masteryLevelBase: 48
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: kick
                  name: Earthshaker Stomp
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 12
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 13
                      aspect: blunt
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
        - name: Boulder Crush
          type: skill
          system:
              shortcode: ram
              subType: combattechnique
              masteryLevelBase: 48
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: ram
                  name: Boulder Crush
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 12
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 15
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

The stone beneath your feet trembles before you see it—a tremor that runs through your bones and teeth. Then shadow falls across the mountainside as a mass of gray, weathered stone and twisted flesh rises against the gray sky. The creature towers fifteen feet or more, its hide the color of storm-worn granite, scarred and cracked like ancient bedrock. You hear the grinding of stone on stone as it moves, a terrible sound that echoes off cliff faces, and beneath that sound, the wet, heavy breathing of something massive and old. The air grows cold and smells of cave-depths and mineral dust.

# Dossier {#dossier}

Mountain trolls are the eldest guardians of the high peaks, creatures of such primordial weight and power that they seem carved from the mountains themselves rather than born of flesh. They roam the alpine heights, deep caverns, and windswept ridges in solitary dominion, claiming vast territories and tolerating no other large predators within their realms. A Mountain Troll's diet is omnivorous and prodigious—it consumes whatever it can catch or kill, from mountain goats to unwary travelers, and its bulk requires constant feeding. These creatures are long-lived, possessing lifespans measured in centuries; old Mountain Trolls bear the scars of innumerable battles etched into their hides like a record of their dominion. Their strength is matched only by their stubborn, almost invulnerable endurance, making them nearly impossible to kill through conventional means.

## Presentation

A Mountain Troll stands 16 to 20 feet in height, with a frame so massive and dense that it weighs as much as a small cottage. Its skin is a sickly gray-brown, resembling weathered stone or ancient, cracked leather, with veins of darker, harder material running through it like ore seams. Cracks in its hide leak a slow trickle of dark fluid, and boulders and mineral deposits seem to grow from its shoulders and limbs, as though the mountain itself claims pieces of the creature. Its limbs are as thick as tree trunks, corded with muscle and ending in fists of tremendous size and hardness. Its face is all heavy ridges and deep-set, glacial blue eyes that glow faintly with a dim intelligence; its mouth is a wide rictus filled with teeth of black stone. When it moves, the ground quakes, and the sound is of grinding stone and avalanche. Its breath comes in deep, rattling exhalations that echo across valleys.

## Key Behaviors

Mountain Trolls are territorial to obsession, claiming a range of territory that can span twenty miles or more across a mountain range. They establish primary lairs in deep caverns where they sleep for weeks at a time, emerging to hunt when hunger drives them. They follow routes through their territory habitually, and travelers who learn these patterns can sometimes avoid encounter by staying away from the creature's regular paths. A Mountain Troll is a creature of hunger and simple needs—it eats, it sleeps, it defends its territory with overwhelming violence. Social bonds are foreign to it; even other Mountain Trolls are treated as intruders to be driven away. An aging Mountain Troll may become territorial about a particular location, venturing less and less far, until it eventually settles into a final lair and rarely leaves again.

## Combat Strategy

A Mountain Troll opens combat by attempting to maximize the psychological impact of its presence—it advances slowly, deliberately, allowing opponents to feel the weight of what they face. It uses its immense size and strength to dominate terrain, often maneuvering enemies toward cliff edges or unstable ground where a single blow will be devastating. When it strikes, it commits fully to the attack, using the full weight of its body; efficiency is irrelevant when one swing can kill a lesser creature. If injured, a Mountain Troll becomes more aggressive and relentless, not fleeing but pressing harder. Only serious, sustained damage—particularly fire or acid—will make one consider retreat, and even then it may simply return to its lair to rest and heal rather than abandoning the territory.

## Attack Methods

### Boulder Crush

The creature raises a massive stone or sometimes tears a boulder from the mountainside itself, hurling it or bringing it down in a crushing blow. The impact is catastrophic, capable of shattering shields and armor alike and leaving deep cracks in stone beneath it.

### Earthshaker Stomp

The Mountain Troll raises one of its massive feet and brings it down with world-shaking force, creating a tremor that spreads across the area. The ground convulses, fissures open, and standing enemies find their footing uncertain and their balance compromised.

### Fist Strike

Two massive fists swing in coordinated or successive attacks, each driven by the full strength of the creature's shoulders and body. A direct hit can crush a human form or shatter heavy armor.

## Special Abilities

### Stone-Touched Resilience

The Mountain Troll's body is partially calcified, its hide and internal organs reinforced with mineral deposits that make it extraordinarily resistant to physical damage. Cutting, piercing, and bludgeoning attacks are all significantly mitigated by its toughened frame.

### Regeneration

The Mountain Troll heals with preternatural speed, regrowing damaged tissue and bone over minutes or hours depending on the severity of the wound. Only sustained damage of exceptional severity—or damage from fire, acid, or magical sources—can prevent this regeneration.

### Undaunted Fortitude

The Mountain Troll's endurance is nearly limitless. It can march across alpine terrain for days without rest, survive extremes of cold that would kill lesser creatures, and fight without pause despite grievous wounds.

## Additional Information

Fire poses the greatest threat to a Mountain Troll—flames damage its regenerative capacity and cause it genuine pain. Acid is equally effective. The creature has a notable weakness to prolonged exposure to extreme heat or drought, which dries its skin and cracks its mineral deposits. Some legends suggest that a Mountain Troll can be killed by destroying the stone heart at the center of its chest, though doing so would require cleaving through feet of hardened hide and bone. The corpse of a slain Mountain Troll is extraordinarily valuable; its hide can be fashioned into armor of exceptional quality, its stone-like bones into tools or weapons that never dull, and its teeth into talismans of protection. However, moving or harvesting the remains of a Mountain Troll is itself a dangerous undertaking that may take weeks and the resources of an entire company.

## Attributes

- **Strength:** 30-35 (1d6+29)

- **Endurance:** 25-30 (1d6+24)

- **Dexterity:** 6-9 (1d4+5)

- **Agility:** 7-10 (1d4+6)

- **Perception:** 9-12 (1d4+8)

- **Aura:** 10-13 (1d4+9)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 6-9 (1d4+5)
