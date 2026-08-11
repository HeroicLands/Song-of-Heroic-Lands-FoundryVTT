---
aliases:
    - Giant Owl
tags:
    - animal
name:
    full: Giant Owl
    aliases: []
id: QQBrXJej14IhQbcW
img: icons/game-icons/lorc/owl.svg
portrait: ""
shortcode: giantowl
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 25
        end: 21
        dex: 16
        agl: 15
        per: 18
        aur: 11
        wil: 15
        rea: 8
        cre: 6
    attrRollFormula:
        str: 1d6+21
        end: 1d6+17
        dex: 1d6+12
        agl: 1d6+11
        per: 1d6+14
        aur: 1d6+7
        wil: 1d6+11
        rea: 1d4+5
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Left Wing
                  shortcode: lwingzone
                  probWeight: 1
                - name: Body
                  shortcode: torsozone
                  probWeight: 2
                - name: Right Wing
                  shortcode: rwingzone
                  probWeight: 1
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 1
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Left Wing
                  shortcode: lwingpart
                  bodyZoneCode: lwingzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Body
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Right Wing
                  shortcode: rwingpart
                  bodyZoneCode: rwingzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Left Leg
                  shortcode: llegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 5
                - name: Right Leg
                  shortcode: rlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                      - manipulator
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
                  probWeight: 4
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 1
                      fire: 3
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 1
                      fire: 3
                - name: Left Wing
                  shortcode: lwingloc
                  bodyPartCode: lwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
                      piercing: 1
                      fire: 3
                - name: Right Wing
                  shortcode: rwingloc
                  bodyPartCode: rwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 1
                      fire: 3
                - name: Left Leg
                  shortcode: llegloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 1
                      fire: 3
                - name: Right Leg
                  shortcode: rlegloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
                      piercing: 1
                      fire: 3
        weight:
            base: 40
            calc: "40"
        reachBase: 0
        bodyScaleBase: 1.71
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
          feetPerRound: 90
          leaguesPerWatch: 8
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: terrestrial
          feetPerRound: 25
          leaguesPerWatch: 1
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
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
              masteryLevelBase: 75
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 39
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 64
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 58
        - name: Talon Rend
          type: skill
          system:
              shortcode: talon
              subType: combattechnique
              masteryLevelBase: 55
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: talon
                  name: Talon Rend
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 7
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
        - name: Piercing Beak
          type: skill
          system:
              shortcode: beak
              subType: combattechnique
              masteryLevelBase: 52
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: beak
                  name: Piercing Beak
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 8
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

There is no warning. Only the sudden conviction that something is wrong—a shift in air pressure, a shadow that moves where no shadow should—and then the impact. The creature is already above you before you fully register its presence, wings folding with terrible grace. The wingspan is enormous, each feather the length of a sword blade, and the plumage is mottled brown-and-gray, seemingly woven from the darkness itself. The eyes are terrible: great golden orbs ringed with facial discs that give an expression of dreadful intelligence. The talons are the size of scythes. The worst part is the silence—a creature this enormous should make sound, should announce itself through wind and motion, but instead it glides through the night with absolute quiet, a predator so perfectly adapted that the darkness itself seems to carry it.

# Dossier {#dossier}

The Giant Owl is a nocturnal apex predator of phenomenal power and terrifying silence. With a wingspan exceeding twenty-five feet and talons capable of piercing armor, a single Giant Owl can devastate a settlement or hunting party. These are supremely intelligent creatures that hunt alone, establishing vast territories across multiple valleys or regions. They are territorial and aggressive in defense of their domain, particularly during nesting season. Adventurers most often encounter them when traveling at night through owl territory or when they camp within a territory the owl claims.

## Presentation

The Giant Owl is a masterpiece of predatory design—a creature built entirely for silent, deadly hunting. The body is large and heavily muscled, with the characteristic upright posture of owls. The wings are enormous and perfectly engineered for silent flight, with specialization in the feather structure that allows movement without sound. The plumage is mottled brown and gray with subtle patterns that provide perfect camouflage in shadow. The head is large and rotates with unsettling mobility. The eyes are the defining feature—enormous golden orbs set in facial discs of feathers that can rotate with the head, providing both binocular vision and nearly complete rotational awareness. The hooked beak is powerful and capable of piercing armor. The talons are among the most formidable weapons in nature—long, curved, wickedly sharp, and capable of piercing through thick leather, light armor, and bone.

## Key Behaviors

Giant Owls are solitary predators that establish and defend vast hunting territories spanning hundreds of square miles. They are strictly nocturnal and most active during the deepest darkness, though they will hunt in twilight or under moonlight if prey is available. A hunting owl spends much of the night in silent flight, covering enormous distances while listening and watching for prey movement. They hunt primarily large mammals, birds, and reptiles, but a hungry owl will attack humanoids if the opportunity seems favorable. An owl pair during breeding season is exponentially more aggressive and will pursue and harass intruders relentlessly.

## Combat Strategy

A Giant Owl's preferred tactic is the silent approach and devastating strike—a target is completely unaware of the owl's presence until talons rake across them. An owl in combat with a aware opponent will circle and make repeated diving attacks, using altitude as advantage. If wounded or if a strike fails to incapacitate, the owl climbs high and circles for another pass. An owl defending a nest or young becomes nearly suicidal in its commitment—it will pursue attackers for miles, making repeated assaults regardless of risk. An owl that has fed recently is less aggressive and more likely to retreat.

## Attack Methods

### Talon Rend

The owl's primary attack—powerful talons delivered from above or in close combat, raking with force sufficient to cripple or kill. The initial diving strike is particularly devastating due to velocity and momentum.

### Piercing Beak

Once prey is grasped, the owl uses its hooked beak to deliver precise, lethal strikes at vulnerable points (eyes, throat, etc.). The beak can pierce armor and bone.

## Special Abilities

### Silent Wings

The Giant Owl moves through air with absolute silence—its wings and feathers are specialized to eliminate the sound of flight. An owl can close to melee range without any auditory warning whatsoever.

### Supreme Night Vision

The owl's large eyes are optimized for low-light vision. In darkness, the owl hunts with perfect clarity and accuracy while opponents are effectively blinded. Moonlight is bright daylight to the owl.

### Rotational Head

The owl can rotate its head through angles seemingly impossible for other creatures, providing nearly 360-degree visual awareness and allowing it to see behind itself without turning its body.

## Additional Information

A Giant Owl territory is marked by the remains of its kills—scattered bones and feathers that serve as grim reminders of the owl's dominion. An owl that has learned humanoid prey are available will begin to deliberately hunt settlements, making travel after dark supremely dangerous. A dead owl's feathers are incredibly valuable for fletching and decoration. Some magical practitioners claim to have negotiated with owls, though the wisdom of trusting such an arrangement is questionable.

## Attributes

- **Strength:** 22-27 (1d6+21)

- **Endurance:** 18-23 (1d6+17)

- **Dexterity:** 13-18 (1d6+12)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 15-20 (1d6+14)

- **Aura:** 8-13 (1d6+7)

- **Will:** 12-17 (1d6+11)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 4-7 (1d4+3)
