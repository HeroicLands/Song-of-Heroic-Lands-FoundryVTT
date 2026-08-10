---
aliases:
    - Nüsvōrroth
    - Nusvorroth
tags:
    - animal
name:
    full: Nüsvōrroth
    aliases: []
id: 0ygZo8s6O9Rj2kRt
slug: nusvorroth
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 19
        end: 17
        dex: 12
        agl: 13
        per: 17
        aur: 13
        wil: 17
        rea: 8
        cre: 7
    attrRollFormula:
        str: 1d6+15
        end: 1d6+13
        dex: 1d6+8
        agl: 1d6+9
        per: 1d6+13
        aur: 1d6+9
        wil: 1d6+13
        rea: 1d4+5
        cre: 1d4+4
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Body
                  shortcode: torsozone
                  probWeight: 4
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
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Foreclaw
                  shortcode: lforelegpart
                  bodyZoneCode: torsozone
                  roles: &a1
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 2
                - name: Right Foreclaw
                  shortcode: rforelegpart
                  bodyZoneCode: torsozone
                  roles: *a1
                  canHoldItem: false
                  probWeight: 2
                - name: Left Leg
                  shortcode: lhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 8
                - name: Right Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 8
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
                  probWeight: 6
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
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
                      piercing: 2
                      fire: 4
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
                      piercing: 2
                      fire: 4
                - name: Left Foreclaw
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Right Foreclaw
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Left Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Right Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
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
                      piercing: 2
                      fire: 4
        weight:
            base: 400
            calc: "400"
        reachBase: 0
        bodyScaleBase: 1.73
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
              masteryLevelBase: 85
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 75
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 45
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 52
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 45
        - name: Hooked Beak
          type: skill
          system:
              shortcode: beak
              subType: combattechnique
              masteryLevelBase: 63
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: beak
                  name: Hooked Beak
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 5
                      aspect: piercing
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
        - name: Raking Talons
          type: skill
          system:
              shortcode: talon
              subType: combattechnique
              masteryLevelBase: 66
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: talon
                  name: Raking Talons
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 4
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

The smell reaches you before anything else — the thick, sweet rot of old carrion baking in the sun. Scattered bones litter the rocky ground, cracked and stripped clean. Then movement catches your eye: something enormous unfolds from behind a boulder, dark feathers bristling as it rises to its full seven-foot height. A bare, leathery head swivels toward you, and that hooked beak — massive, stained dark — opens with a low, rattling hiss. The thing spreads its wings wide, not to fly but to make itself bigger, and the stench intensifies as it begins to stalk forward on taloned feet that click against the stone.

# Dossier {#dossier}

The Nüsvōrroth is a giant flightless predatory bird that dominates barren, rocky wastelands. Primarily a carrion-eater, it is savagely territorial and will attack anything that enters its domain without hesitation. Adventurers crossing desolate highlands or following trails through badlands may stumble into its territory, often warned only by the scattered remains of previous intruders.

## Presentation

Standing seven feet tall and stretching up to twelve feet from beak to tail, the Nüsvōrroth is built like a massive, predatory ratite. Its body is covered in sleek, dark plumage — almost black in direct sunlight, with an oily iridescence. The head and upper neck are featherless, covered instead in tough, wrinkled, leathery skin mottled gray and red. Its hooked beak is enormous, easily a foot long, designed for tearing flesh from bone. Bloodshot eyes sit deep in the skull, constantly scanning. Its powerful legs are thick as a man's thigh, ending in three-toed feet armed with curved talons. The wings, though incapable of sustained flight, are muscular and broad, used for balance during leaps and for intimidation displays.

## Key Behaviors

Nüsvōrroths are solitary and fiercely territorial, claiming expansive stretches of desolate, rocky landscape as their own. They are primarily scavengers, using their acute sense of smell to detect carrion from great distances, but they kill without hesitation when their territory is violated. Their domain is easy to identify: scattered bone piles, the reek of decay, and claw-scored boulders mark the borders.

The creature is remarkably patient and cunning for a bird. When it detects intruders, it often observes from a concealed position — crouching behind boulders or blending into rocky terrain with its dark plumage — before launching a sudden, explosive ambush. It commits fully to attacks and rarely retreats, even when injured.

## Combat Strategy

The Nüsvōrroth opens combat with a devastating leap from concealment, using its powerful legs and wing-assisted bounds to close distance in a single explosive movement. The impact of a leaping strike can knock a person off their feet. It then presses the attack relentlessly with beak and claws, attempting to overwhelm its target before they can organize a defense. It uses terrain aggressively, driving prey toward cliffs, loose scree, or narrow passages where escape is difficult. It does not retreat willingly — its territorial instinct overrides self-preservation.

## Attack Methods

### Hooked Beak

A tearing strike with its massive beak, targeting the head, neck, or shoulders. Capable of shearing through leather and cracking bone, this is its primary killing tool.

### Raking Talons

Slashing kicks with its powerful legs, each talon capable of opening deep gashes. Often used in combination with beak strikes to overwhelm a target from multiple angles.

### Leaping Strike

A wing-assisted bound covering up to thirty feet, landing with crushing force on the target. The impact alone can stagger or knock prone, setting up follow-up attacks.

## Special Abilities

### Camouflage Plumage

Its dark feathers blend naturally with rocky, barren terrain. When crouching motionless, the Nüsvōrroth is remarkably difficult to spot, giving it a significant advantage in ambush situations.

### Carrion Sense

An acute sense of smell allows it to detect carrion — or the blood of wounded creatures — from over a mile away. It can track injured prey relentlessly across its territory.

### Terrifying Presence

Its sheer size, ragged plumage, and aggressive display — wings spread wide, beak open, hissing — can freeze lesser creatures in place. Animals and mounts may panic and bolt when confronted by a charging Nüsvōrroth.

### Tactician's Patience

The creature observes intruders from concealment before striking, choosing the moment of maximum advantage. It targets isolated individuals, stragglers, or those weighed down by gear.

## Additional Information

Despite its power, the Nüsvōrroth has notable vulnerabilities. It cannot fly, limiting its ability to pursue prey that reaches high ground or crosses water. Its heavy build makes it clumsy in dense forest or tight enclosed spaces. Its bloodshot eyes are sensitive to sudden bright light — a flash of reflected sunlight or a thrown torch can disorient it momentarily. Most critically, its refusal to retreat from territorial confrontations means it can be lured into traps or disadvantageous positions by adventurers who understand its behavior. The feathers and talons of a Nüsvōrroth are prized by some cultures as trophies, and its beak can be fashioned into a formidable skinning tool.
