---
aliases:
    - Giant Eagle
tags:
    - animal
name:
    full: Giant Eagle
    aliases: []
id: qXfebwntoioh2qjT
img: icons/game-icons/delapouite/eagle-head.svg
portrait: ""
shortcode: gntegl
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 25
        end: 19
        dex: 16
        agl: 15
        per: 17
        aur: 11
        wil: 14
        rea: 8
        cre: 7
    attrRollFormula:
        str: 1d6+21
        end: 1d6+15
        dex: 1d6+12
        agl: 1d6+11
        per: 1d6+13
        aur: 1d6+7
        wil: 1d6+10
        rea: 1d4+5
        cre: 1d4+4
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
            base: 50
            calc: "50"
        reachBase: 0
        bodyScaleBase: 1.71
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
          feetPerRound: 110
          leaguesPerWatch: 12
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 2
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
              masteryLevelBase: 70
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
              masteryLevelBase: 64
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 55
        - name: Talon Strike
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
                  name: Talon Strike
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
        - name: Beak Tear
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
                  name: Beak Tear
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

The shadow crosses over you first, immense and black—the wing-shadow of something so large you instinctively flinch. Then comes the sound: a cry that echoes off the mountainsides, a voice of conquest and absolute dominion. The eagle itself appears through the thermals, banking hard enough to tear sound from the air—a creature of such enormous power that you struggle to reconcile it with anything you've seen. Twenty feet of wingspan catch the light like gold and bronze, each feather visible from below. As it circles, you see the moment its eye fixes on you: bright and terrible and infinitely knowledgeable. The talons beneath it are each the length of a sword blade. The air itself seems to hold its breath.

# Dossier {#dossier}

The Giant Eagle is a mount-sized raptor that dominates the high mountain passes and cliff faces of the world. With a wingspan exceeding twenty feet and talons that could pierce a knight's armor, a single Giant Eagle is a threat that entire caravans fear. These creatures are not mindless beasts but intelligent, calculating hunters with remarkable spatial reasoning and tactical awareness. They establish vast territories spanning hundreds of square miles, and they defend those territories with terrible efficiency. Adventurers most commonly encounter them when traveling mountain passages, when an eagle takes interest in a caravan, or when an expedition reaches a nesting site.

## Presentation

The Giant Eagle is an absolutely magnificent creature—a predator scaled to legendary proportions. Its body is heavily muscled and dense, built to carry weights that would break lesser birds. The plumage is primarily golden-brown and dark brown, with paler coloring on the head and neck that gives the eagle an expression of stern, old authority. The head is large and powerful, with a hooked beak that can open to angles seemingly impossible and tear flesh with surgical precision. The eyes are bright gold or amber, set to provide excellent forward binocular vision and remarkable peripheral awareness. The legs are thick and powerful, ending in talons that curve wickedly, each talon as long as a human finger and sharp enough to slice through leather like cloth. The wings are the eagle's defining feature—massive, powerful, and perfectly engineered for both precision maneuvering and raw explosive acceleration. Even at rest, the eagle conveys coiled power.

## Key Behaviors

Giant Eagles are apex predators that hunt alone or in established pairs. A mated pair defends a territory together but hunts individually, often coordinating to drive prey toward each other. They are primarily diurnal and most active in mid-morning and late afternoon, hunting from high altitude by watching for movement below. Prey includes large mammals (deer, mountain goats), other large birds, and occasionally humanoid prey if the eagle is sufficiently motivated or if the target is separated from larger groups. A nesting pair with young becomes extraordinarily aggressive and will pursue intruders for miles, making repeated devastating dives. Outside breeding season, eagles are aggressive and territorial but generally uninterested in humanoids—they are more interested in driving competitors out of their space than in deliberately hunting humans.

## Combat Strategy

A Giant Eagle's preferred tactic is the dive—a high-speed attack that builds momentum to devastating effect. A diving eagle attacks with talons extended, attempting to strike and carry off prey if possible, or at minimum to wound and set up additional passes. If the initial attack fails or if prey escapes into cover, the eagle climbs rapidly back to altitude and circles for another approach. In close combat (if the eagle is forced to the ground or if prey is in a confined space), the eagle uses its beak and talons with measured precision. A defensive pair of eagles attacks simultaneously from different vectors, attempting to divide a target's attention and defense. An eagle defending a nest becomes almost suicidal in its determination—it will make repeated passes regardless of wounds or overwhelming odds.

## Attack Methods

### Talon Strike

A devastating raking attack, particularly devastating when delivered during a high-speed dive. The eagle extends its talons with force sufficient to pierce armor and rend flesh, causing deep lacerating wounds. In close combat, the eagle can deliver multiple strikes in rapid succession.

### Beak Tear

A precise, surgical attack aimed at soft targets or weak points in armor—the hooked beak opens wide and tears, capable of opening serious wounds or even severing limbs if the eagle has pinned a target with talons.

## Special Abilities

### Aerial Dominance

The Giant Eagle is nearly unstoppable in open air combat—it can dive at speeds that ground-bound creatures cannot match, can recover from a dive into a steep climb, and can maneuver with a precision that leaves terrestrial pursuits impossible. In the air, the eagle has overwhelming advantage. On the ground, it is more vulnerable.

### Piercing Vision

The eagle's eyesight is supernatural—it can identify movement from impossibly far distances, can track moving targets across open sky, and can spot ambushes or hidden enemies with remarkable reliability. The eagle is nearly impossible to surprise.

### Talon Grapple

If the eagle succeeds in gripping prey with its talons, the target is held fast—a grappled creature cannot move without pulling free, and the eagle's strength advantage makes escape difficult. The eagle can carry lighter prey aloft and does so whenever possible.

## Additional Information

A Giant Eagle aerie is a treasure trove—eagle eyries often contain accumulated gold, jewelry, and weapons from previous kills. However, reaching an aerie and claiming treasure while avoiding protective parents is a deadly proposition. Some characters have attempted to negotiate with eagles through magical means, with rare success. An eagle feather is valuable for fletching, armor, or ceremonial purposes—a single primary feather can be worked into fine items.

## Attributes

- **Strength:** 22-27 (1d6+21)

- **Endurance:** 16-21 (1d6+15)

- **Dexterity:** 13-18 (1d6+12)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 14-19 (1d6+13)

- **Aura:** 8-13 (1d6+7)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 5-8 (1d4+4)
