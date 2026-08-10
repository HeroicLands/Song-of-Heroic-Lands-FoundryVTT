---
aliases:
    - Forest Troll
tags:
    - dreadspawn
name:
    full: Forest Troll
    aliases: []
id: l4GBcRoNaHSO3RRn
slug: forest-troll
img: icons/game-icons/skoll/troll.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 32
        end: 27
        dex: 9
        agl: 9
        per: 11
        aur: 12
        wil: 13
        rea: 8
        cre: 8
    attrRollFormula:
        str: 1d6+29
        end: 1d6+23
        dex: 1d4+6
        agl: 1d4+6
        per: 1d4+8
        aur: 1d4+9
        wil: 1d4+10
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
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Left Eye
                  shortcode: leyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Right Eye
                  shortcode: reyeloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 15
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Nose
                  shortcode: noseloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 30
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Left Cheek
                  shortcode: lcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Right Cheek
                  shortcode: rcheekloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Left Ear
                  shortcode: learloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Right Ear
                  shortcode: rearloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 15
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Mouth
                  shortcode: mouthloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 30
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Jaw
                  shortcode: jawloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 60
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 200
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Right Shoulder
                  shortcode: rshldloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Right Upper Arm
                  shortcode: rupaloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Right Elbow
                  shortcode: relbloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Right Forearm
                  shortcode: rfraloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Right Hand
                  shortcode: rhandloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Left Shoulder
                  shortcode: lshldloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 30
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Left Upper Arm
                  shortcode: lupaloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Left Elbow
                  shortcode: lelbloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Left Forearm
                  shortcode: lfraloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 20
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Left Hand
                  shortcode: lhandloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Thorax
                  shortcode: thrxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Abdomen
                  shortcode: abdmnloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 40
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Pelvis
                  shortcode: plvisloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 20
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Right Thigh
                  shortcode: rthghloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Right Knee
                  shortcode: rkneeloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Right Calf
                  shortcode: rcalfloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Right Foot
                  shortcode: rfootloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Left Thigh
                  shortcode: lthghloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 40
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Left Knee
                  shortcode: lkneeloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Left Calf
                  shortcode: lcalfloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 30
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
                - name: Left Foot
                  shortcode: lfootloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 15
                  protectionBase:
                      blunt: 9
                      edged: 8
                      piercing: 6
                      fire: 8
        weight:
            base: 2300
            calc: "2300"
        reachBase: 0
        bodyScaleBase: 2
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
              masteryLevelBase: 60
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 55
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 36
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
              masteryLevelBase: 75
        - name: Mighty Blow
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
                  name: Mighty Blow
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 10
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
        - name: Grapple and Tear
          type: skill
          system:
              shortcode: grab
              subType: combattechnique
              masteryLevelBase: 63
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: grab
                  name: Grapple and Tear
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 12
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 32
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

The ancient oak in front of you shifts. Bark cracks like skin, and what you thought was gnarled wood straightens into limbs and a torso. Moss and vines slide away like falling robes, revealing skin as green as rotting wood beneath. The thing is twelve feet tall and built of nothing but raw power—limbs thick as tree trunks, hands like woven roots and bone. Its breath carries the smell of wet earth and decay. Leaves are matted in hair that might be vegetable or might be vermin. It does not make sound as it moves toward you, despite its size. It simply appears closer than it was.

# Dossier {#dossier}

Forest trolls are apex predators and territorial overlords of deep woodlands and ancient forests, creatures born from primal earth-magic and predatory hunger. These massive beings are supremely adapted to their woodland domains, moving through dense growth as easily as humanoids walk on open ground. Adventurers encounter them in old-growth forests, in wilderness regions reclaimed by nature, and in places where civilization has not penetrated deeply.

## Presentation

The Forest Troll stands twelve to fourteen feet tall, its body composed of dense muscle covered in skin that ranges from sickly green to brackish brown, textured like bark. Vines and roots seem partially integrated into its body rather than merely attached—they twine through its skin, sometimes moving with independent purpose. Its hair is a tangle of branches, leaves, and living growth; insects and small creatures nest within it. Its hands are enormous, more paw-like than humanoid, with fingers that taper to sharp points like thorns. Its feet are broad and splayed, resembling gnarled roots. Its eyes are deep-set and intelligent, colored an unsettling greenish-brown. Teeth fill its mouth in irregular rows, some resembling stone, some bone, some wood. The creature moves with unnatural silence despite its bulk, materializing in clearings rather than appearing to walk toward them. A faint stench of turned earth and advanced rot accompanies it.

## Key Behaviors

The Forest Troll claims enormous territories—sometimes entire forests—which it patrols with methodical determination. It knows every tree, every path, every clearing within its domain. The creature is absolutely territorial and will attack anything that enters its lands. It hunts actively, using its knowledge of the forest to corner prey and drive them into disadvantageous terrain. It shows signs of intelligence in understanding behavior patterns, timing attacks, and even manipulating prey through psychological pressure. It does not hunt for sport—only for feeding—but it will defend territory against any perceived threat regardless of hunger. When dormant between hunts, it remains in deep wilderness where it can rest undisturbed. It exhibits no social behavior toward other trolls; territorial conflicts between Forest Trolls are violent and total.

## Combat Strategy

The Forest Troll uses terrain as much as raw strength. It attacks prey at disadvantage, using the forest to separate individuals, force groups into narrow passages, and drive enemies toward hazards like cliffs or water. Its initial attack is usually a charge or grab attempt leveraging surprise and positioning. Once engaged, it relies on sheer strength and regeneration to outlast opponents. It will pursue fleeing prey through forest where its knowledge is absolute, but will not pursue beyond territory boundaries. When faced with clearly superior opposition, it retreats to its lair, relying on regeneration and territory knowledge to eventually overcome intruders.

## Attack Methods

### Crushing Grip

The troll grasps prey with one massive hand, attempting to crush or compress the target. Once grappled, the troll can maintain pressure across multiple rounds, causing ongoing crushing damage.

### Mighty Blow

The troll swings its fist or arms in devastating arcs, attempting to deliver impact trauma capable of breaking bone and armor alike. The troll's reach advantage allows it to strike from distance other melee combatants cannot match.

### Grapple and Tear

When grappling prey, the troll can deliberately tear or rend, inflicting grievous trauma. The troll sometimes picks up grappled prey and throws them against trees, walls, or other fixed objects.

### Root Entanglement

The vines and roots integrated into the troll's body can extend outward, attempting to grapple and entangle prey. Multiple targets can be entangled simultaneously; the entanglement persists as long as the roots maintain contact.

## Special Abilities

### Woodland Camouflage

The Forest Troll's appearance allows it to blend into forest surroundings with remarkable effectiveness. In dense woodland, it is nearly impossible to distinguish from the environment until it moves. It gains advantage on concealment checks in its native forest and can surprise prey even when they are looking directly at it.

### Regeneration

The troll's body heals with supernatural speed in response to injury. Within its forest domain, regeneration is rapid; outside its territory, regeneration slows significantly. Sustained fire damage prevents regeneration entirely as long as the fire is maintained. Severing the troll into pieces that cannot reattach requires total destruction of all pieces.

### Limb Regrowth

Lost limbs, even vital ones, regenerate over time. A severed arm may regrow within hours; a destroyed torso requires days or weeks. The troll's body has no obvious vital organs—damage is distributed and diffuse.

### Forest Manipulation

The Forest Troll can command plant growth to entangle, obscure, or attack enemies. Vines ensnare, branches block, roots erupt from soil to attack. This is less a spell and more a natural extension of the troll's will—the forest obeys its oldest predator.

## Additional Information

Fire is the Forest Troll's primary weakness, burning living wood and preventing regeneration. Water-based magic has limited effect. The creature is most vulnerable outside its claimed forest territory, where regeneration slows and it cannot use environmental advantage. Some Forest Trolls have been observed tolerating specific smaller creatures or even humanoid populations within their territory, so long as they do not threaten the troll or its forest. Such arrangements are uneasy truces that can shatter if the balance is disturbed.

## Attributes

- **Strength:** 28-33 (1d6+27)

- **Endurance:** 24-29 (1d6+23)

- **Dexterity:** 7-10 (1d4+6)

- **Agility:** 7-10 (1d4+6)

- **Perception:** 9-12 (1d4+8)

- **Aura:** 10-13 (1d4+9)

- **Will:** 11-14 (1d4+10)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 6-9 (1d4+5)
