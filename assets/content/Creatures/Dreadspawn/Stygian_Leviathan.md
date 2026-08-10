---
aliases:
    - Stygian Leviathan
tags:
    - dreadspawn
name:
    full: Stygian Leviathan
    aliases: []
id: NTZQh3DsxPrIxvtI
slug: stygian-leviathan
img: icons/game-icons/lorc/sea-serpent.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 20
        end: 22
        dex: 14
        agl: 14
        per: 18
        aur: 8
        wil: 14
        rea: 10
        cre: 10
    attrRollFormula:
        str: 1d6+16
        end: 1d6+18
        dex: 1d6+10
        agl: 1d6+10
        per: 1d6+14
        aur: 1d6+4
        wil: 1d6+10
        rea: 1d6+6
        cre: 1d6+6
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 8
                - name: Body
                  shortcode: torsozone
                  probWeight: 24
                - name: Tail
                  shortcode: tailzone
                  probWeight: 8
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Body
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Fin
                  shortcode: lfinpart
                  bodyZoneCode: torsozone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 2
                - name: Right Fin
                  shortcode: rfinpart
                  bodyZoneCode: torsozone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 2
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: tailzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Gills
                  shortcode: gillloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Body
                  shortcode: bodyloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Underbelly
                  shortcode: underbellyloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Left Fin
                  shortcode: lfinloc
                  bodyPartCode: lfinpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Right Fin
                  shortcode: rfinloc
                  bodyPartCode: rfinpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 8
                      edged: 7
                      piercing: 6
                      fire: 8
        weight:
            base: 20000
            calc: 20000
        reachBase: 0
        bodyScaleBase: 1.47
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aquatic
          feetPerRound: 100
          leaguesPerWatch: 12
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
              masteryLevelBase: 33
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
              masteryLevelBase: 53
        - name: Tearing Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 63
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Tearing Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 5
                      aspect: piercing
                  lengthBase: 4
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
        - name: Tentacle Grasp
          type: skill
          system:
              shortcode: tentacle
              subType: combattechnique
              masteryLevelBase: 63
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: tentacle
                  name: Tentacle Grasp
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 16
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 4
                      aspect: blunt
                  lengthBase: 6
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

The water ahead grows darker, as though shadow itself is taking form, rising from the depths. You see something vast and terrible break the surface—scaled hide the color of a bruise, gray-black and ancient, crusted with what might be barnacles or might be something worse. Eyes like twin moons break the surface, studying you with an intelligence that is cold and utterly indifferent to your existence. The creature's breath is an exhalation like the wind from a tomb, and the water around it seems to grow colder, more viscous, weighted with age and predatory hunger. Then, impossibly, something wraps around your leg—a tentacle as thick as a man's arm, bristling with suckers and barbs, pulling downward with inexorable strength toward depths from which no scream can escape.

# Dossier {#dossier}

Stygian Leviathans are elder predators of the deepest underground waters, creatures that have roamed cold subterranean seas and lightless lakes for millennia. They are the undisputed apex of their domain, and their presence is enough to render entire underground ecosystems dormant and fearful. A Stygian Leviathan is not evil in any moral sense, but it is indifferent to suffering—it hunts as it must, and those who blunder into its territory are simply prey. These creatures are found exclusively in deep, cold waters miles below the earth's surface—places where no natural light ever penetrates and the pressure would crush unprotected humans. The deepest places in the world hold Stygian Leviathans, and they are known only from legends and the scarred survivors of expeditions into the depths.

## Presentation

A Stygian Leviathan measures 40 to 60 feet in length from nose to tail, with a body mass comparable to a whale but somehow more compact, more muscled. Its scaled hide is a sickly gray-black like subterranean waters, studded with barnacle-like growths, crystalline formations, and scarred patches from countless battles. Its four limbs are stub-like, more for anchoring than locomotion; instead, it propels itself through water with a massive, undulating tail that can be recognized from miles away by the disturbance it creates. Its head is enormous and roughly wedge-shaped, filled with teeth of terrifying length and sharpness. Most horrifying are the tentacles: four to six immense appendages, each as thick as a tree trunk and capable of extending far beyond the creature's body, lined with suckers of surprising dexterity and set with barbs and spines. Its eyes are enormous, lidless, and glowing faintly with a sickly bioluminescence. The temperature around it drops perceptibly, and the water seems to thicken and darken in its presence.

## Key Behaviors

A Stygian Leviathan claims a territory spanning miles of underground water and defends it with lethal certainty from other large predators, though such encounters are rare—few creatures of comparable power exist in the deep places. The creature spends much of its time in dormancy, lying on the bottom of deep lakes, barely moving, barely breathing, waiting with preternatural patience for vibrations indicating prey. It hunts by sensing disturbances in water and sound waves traveling through liquid, and these senses are so acute that a creature moving in the water miles away can be detected and pinpointed. An ancient Stygian Leviathan may have developed a preferred hunting route that it follows regularly, and local populations of prey learn to avoid those routes or face certain death.

## Combat Strategy

A Stygian Leviathan initiates combat by attacking with tentacles from a distance, attempting to grasp and drag prey into water or toward the creature's body. Once prey is within range, it uses multiple appendages in coordinated strikes while reserving its bite for finishing moves. The creature is intelligent enough to recognize overwhelming force and will retreat into deep water where pursuit becomes impossible for most enemies. A cornered or injured Leviathan becomes dramatically more aggressive, its tactics becoming less patient and more brutally direct. The creature will fight to the death if cornered, and its death throes can be as deadly as its attacks.

## Attack Methods

### Tentacle Grasp and Drag

One or more tentacles snake out toward a target, attempting to wrap around and drag the victim toward the creature's body or into water. The grip is nearly impossible to escape from without magical aid, and struggling prey simply tires faster.

### Tearing Bite

The Leviathan's jaws snap shut with bone-crushing force, capable of severing limbs or crushing armor-clad warriors. A successful bite is typically the final act of a combat that the Leviathan wins.

### Drowning Embrace

If a victim is successfully dragged into water, the creature uses tentacles and body to prevent surfacing, combining constriction with drowning in a terrible combination.

## Special Abilities

### Deep-Water Supremacy

The Stygian Leviathan is perfectly adapted to extreme pressure and cold that would kill lesser creatures instantly. In deep water, its movement speed increases, and its attacks gain advantage. In shallow water or on land, it becomes slow and sluggish.

### Vibration Sense

The creature detects vibrations in water with perfect accuracy, knowing the location of anything moving in its domain. It can sense prey miles away if sufficient ripples or disturbances are created.

### Tentacle Mastery

The Leviathan commands its tentacles with incredible precision and coordination, allowing multiple simultaneous attacks and the manipulation of prey with dexterity that seems impossible for appendages of such size.

### Regeneration in Deep Water

So long as the Leviathan remains in deep, cold water, it regenerates from damage. Removing it from its native environment or into warm, shallow water weakens it dramatically.

## Additional Information

Light is the Leviathan's primary weakness—bright magical light, sunlight, or even sustained illumination in its dark domain causes it genuine pain and disrupts its sensory awareness. Heat is equally effective; exposure to warmth weakens it, and being removed from cold water causes it to weaken slowly. The creature cannot survive indefinitely out of water, and in dry conditions it becomes increasingly sluggish. The teeth and bones of a slain Leviathan are extraordinarily valuable, capable of being crafted into legendary weapons or tools. Some civilizations have based entire economies on the occasional discovery of a Leviathan corpse, spending generations harvesting and processing its remains. The creature's hide can be rendered into leather of exceptional quality and resilience. Hunting a living Leviathan is considered a suicidal undertaking, and those rare expeditions that attempt it do so only with armies of support and sohl. The few survivors of such expeditions are forever changed by the experience.

## Attributes

- **Strength:** 17-22 (1d6+16)

- **Endurance:** 19-24 (1d6+18)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 11-16 (1d6+10)

- **Perception:** 15-20 (1d6+14)

- **Aura:** 5-10 (1d6+4)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 7-12 (1d6+6)

- **Creativity:** 7-12 (1d6+6)
