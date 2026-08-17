---
aliases:
  - Falcon
  - creature-falcon
tags:
  - animal
name:
  full: Falcon
  aliases: []
description: "A sleek, compact raptor of the middle air, striking prey in devastating high-speed vertical dives no larger bird can match."
id: Gs2wXshABfQ16Lc0
img: icons/game-icons/delapouite/falcon-moon.svg
portrait: images/being/falcon-portrait.webp
shortcode: falcon
type: creature
package: sohl
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 2
    end: 8
    agl: 13
    per: 24
    snt: 3
    aur: 4
    wil: 8
    rea: 7
    cre: 7
  attrRollFormula:
    str: 1d4
    end: 1d4+6
    agl: 1d6+10
    per: 1d6+21
    snt: 1d4+1
    aur: 1d4+2
    wil: 1d4+6
    rea: 1d4+5
    cre: 1d4+5
  body:
    structure:
      zones:
        - name: Head
          shortcode: headzone
          probWeight: 1
        - name: Body
          shortcode: torsozone
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
          bodyZoneCode: headzone
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
          bodyZoneCode: hindqtrzone
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
          probWeight: 3
        - name: Right Leg
          shortcode: rlegpart
          bodyZoneCode: hindqtrzone
          roles:
            - locomotor
            - manipulator
          canHoldItem: false
          probWeight: 3
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
          probWeight: 3
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
        - name: Neck
          shortcode: neckloc
          bodyPartCode: headpart
          bleedingSusceptibility: high
          amputability: low
          shockValue: 5
          probWeight: 2
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
        - name: Left Wing
          shortcode: lwingloc
          bodyPartCode: lwingpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
        - name: Thorax
          shortcode: thoraxloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 6
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
        - name: Abdomen
          shortcode: abdloc
          bodyPartCode: torsopart
          bleedingSusceptibility: high
          amputability: none
          shockValue: 4
          probWeight: 4
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
        - name: Right Wing
          shortcode: rwingloc
          bodyPartCode: rwingpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
        - name: Left Leg
          shortcode: llegloc
          bodyPartCode: llegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
        - name: Right Leg
          shortcode: rlegloc
          bodyPartCode: rlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
        - name: Tail
          shortcode: tailloc
          bodyPartCode: tailpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: -6
            edged: -7
            piercing: -8
            fire: -6
    weight:
      base: 2
      calc: "2"
    reachBase: 0
    bodyScaleBase: 0.33
    personalFatigue: enc + 5
  currentMoveMedium: aerial
  movementProfiles:
    - medium: aerial
      feetPerRound: 400
      leaguesPerWatch: 10
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors: []
      disabled: false
    - medium: terrestrial
      feetPerRound: 20
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
        masteryLevelBase: 80
    - shortcode: stlth
      type: skill
      system:
        masteryLevelBase: 72
    - shortcode: sprt
      type: mysticalability
      system:
        masteryLevelBase: 18
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 32
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 72
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 20
    - name: Talon
      type: skill
      system:
        shortcode: talon
        subType: combattechnique
        masteryLevelBase: 55
        combatCategory: melee
        impairedByRoles:
          - locomotor
        strikeMode:
          type: melee
          shortcode: talon
          name: Talon
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 1
            modifier: 0
          impactBase:
            numDice: 1
            die: 10
            modifier: -9
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
    - name: Beak
      type: skill
      system:
        shortcode: beak
        subType: combattechnique
        masteryLevelBase: 44
        combatCategory: melee
        impairedByRoles:
          - manipulator
        strikeMode:
          type: melee
          shortcode: beak
          name: Beak
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 1
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: -8
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

Something streaks across the sky—so fast you almost miss it. A second glance catches only a compact silhouette, wings tucked close to a lean body that seems to bend the very air around its passage. Then comes the cry: a chittering shriek of terrible intensity that echoes off the stone around you. The falcon banks hard, and for an instant its eye locks with yours—golden, knowing, and filled with hunger. Your skin prickles with the terrible clarity that you have been seen and assessed by something far more lethal than it has any right to be.

# Dossier {#dossier}

The falcon is a sleek, compact predator of the middle air—smaller and more specialized than the eagle, but possessed of a speed and precision that no larger raptor can match. These birds are solitary hunters that favor high-altitude stalking and devastating vertical attacks. Adventurers encounter them most often in mountain passes, open plains, and along coastal cliffs where the thermal winds favor high-altitude hunting.

## Presentation

A falcon stands barely a foot and a half tall, with a powerful build that is all muscle beneath deceptively fine plumage. Its feathers are dark steel-blue on the back, with a buff or russet breast, and its head bears distinctive dark malar stripes—markings that give it an almost predatory expression of intensity. The eyes are large and forward-facing, providing binocular vision that allows pinpoint targeting in a dive. Talons are moderate in size but wickedly sharp, and the hooked beak is built for swift, lethal strikes. The falcon's posture is always alert, and even perched it gives the impression of coiled spring energy.

## Key Behaviors

Falcons are solitary and fiercely territorial, with each bird commanding vast hunting grounds. They hunt primarily on the wing, soaring at altitude and diving at tremendous speed to strike small birds mid-flight, or stooping to snatch small mammals from the ground. A hunting falcon may spend hours aloft, climbing to thin air where few other creatures can follow, then plummeting in a stoop that reaches breathtaking velocity. They are less prone to returning to the same kill site than eagles, and they leave less evidence of their hunts—prey is consumed rapidly or cached in high places beyond easy discovery.

## Combat Strategy

A falcon's only true tactic is the stoop—climbing high, then diving at target at speed no ground-bound creature can match or escape. The falcon uses this initial pass to wound, then circles for follow-up attacks if the target survives the first strike. If prey proves difficult or dangerous, a falcon will make several high-speed passes before retreating to altitude to reassess. A cornered falcon fights with its talons and beak in confined space, but it strongly prefers to fight only when it has aerial advantage. Unlike the eagle, a falcon is more likely to abandon a nest than to defend it with suicidal desperation.

## Attack Methods

### Talon Rake

Delivered during the blur of a high-speed dive or in close combat—the falcon extends its legs with terrible force to rake with curved talons, causing deep puncture wounds and lacerations. The sheer velocity of a diving strike makes this potentially catastrophic; in close quarters, the falcon executes rapid successive strikes.

### Piercing Beak

The falcon's beak is built for swift, precise damage—it is neither as hooked as an eagle's nor designed for tearing, but rather shaped for driving deep into flesh with surgical precision. A falcon will strike at the eyes, throat, or any exposed soft target.

## Special Abilities

### Blinding Dive

A falcon can reach speeds in a vertical dive that make its approach nearly imperceptible until the moment of impact. An opponent targeted by a dividing falcon is at disadvantage on defensive rolls unless they have advance warning. The falcon's speed in the stoop also allows it to target opponents that believe they are safely out of range.

### Aerial Mastery

The falcon is supremely graceful in the air—it can recover from a dive into a near-vertical climb, pivot instantly, or execute turns that leave terrestrial predators behind. A falcon in open air combat has overwhelming tactical advantage. On the ground, a falcon is clumsy and awkward, moving with visible discomfort.

## Additional Information

Falcons have been trained since ancient times as hunting companions to nobility and elite warriors. A character might recruit a young falcon for hawking, though the bird will always be wild at heart and liable to abandon its handler if presented with an easier hunting opportunity elsewhere. Falcon feathers are prized for fletching and ceremonial dress. The bird's territory is its most valuable asset—a falcon that has established a rich hunting ground will defend it unto death.

## Attributes

- **Strength:** 1-4 (1d4)

- **Endurance:** 7-10 (1d4+6)

- **Agility:** 11-16 (1d6+10)

- **Perception:** 22-27 (1d6+21)

- **Scent:** 2-5 (1d4+1)

- **Aura:** 3-6 (1d4+2)

- **Will:** 7-10 (1d4+6)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 6-9 (1d4+5)
