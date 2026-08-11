---
aliases:
    - Giant Octopus
tags:
    - animal
name:
    full: Giant Octopus
    aliases: []
id: ZlKGP4V2B881MIoc
img: icons/game-icons/lorc/octopus.svg
portrait: ""
shortcode: gntoctps
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 19
        end: 15
        dex: 13
        agl: 14
        per: 15
        aur: 10
        wil: 13
        rea: 14
        cre: 13
    attrRollFormula:
        str: 1d6+15
        end: 1d6+11
        dex: 1d6+9
        agl: 1d6+10
        per: 1d6+11
        aur: 1d4+7
        wil: 1d6+9
        rea: 1d6+10
        cre: 1d6+9
    body:
        structure:
            zones:
                - name: Mantle
                  shortcode: mantlezone
                  probWeight: 4
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Arms
                  shortcode: armszone
                  probWeight: 4
            parts:
                - name: Mantle
                  shortcode: mantlepart
                  bodyZoneCode: mantlezone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Left Arms
                  shortcode: larmspart
                  bodyZoneCode: armszone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 5
                - name: Right Arms
                  shortcode: rarmspart
                  bodyZoneCode: armszone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 5
            locations:
                - name: Mantle
                  shortcode: mantleloc
                  bodyPartCode: mantlepart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 7
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Beak
                  shortcode: beakloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: low
                  amputability: high
                  shockValue: 2
                  probWeight: 3
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Arms
                  shortcode: larmsloc
                  bodyPartCode: larmspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Arms
                  shortcode: rarmsloc
                  bodyPartCode: rarmspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
        weight:
            base: 300
            calc: "300"
        reachBase: 0
        bodyScaleBase: 1.43
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aquatic
          feetPerRound: 60
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
              masteryLevelBase: 70
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 65
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 33
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 43
        - name: Tentacle Grapple
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
                  name: Tentacle Grapple
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
        - name: Beak Bite
          type: skill
          system:
              shortcode: beak
              subType: combattechnique
              masteryLevelBase: 60
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: beak
                  name: Beak Bite
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
---

# Appearance {#appearance}

The water darkens before you see the creature itself. A massive bulbous form rises from the depths, slick and rubbery, its coloration shifting from moment to moment—now browns and grays to match the rock, now a flushed crimson that radiates intent. Eight tentacles unfurl around the central body, each as thick as a man's torso, lined with powerful suction cups that ripple as they move. The creature's large, luminous eyes fix on you, and they hold something that makes your blood chill: unmistakable intelligence, alien and absolute. Then comes a sound that travels through the water and into your chest—a beak clicking, tasting the current, preparing.

# Dossier {#dossier}

The Giant Octopus is an underwater apex predator standing as one of the most intelligent non-humanoid creatures known to exist. With a body that can exceed twenty feet in total length and tentacles capable of crushing the hull of a small boat, a single giant octopus can devastate a ship or fishing fleet. These creatures are solitary and fiercely territorial, claiming deep-water hunting grounds and defending them with cunning and overwhelming force. Encounters typically occur when ships or divers venture into octopus territory or when an octopus pursues prey into shallow water.

## Presentation

The Giant Octopus is a marvel of malleability and power—its body is essentially boneless, allowing it to compress through impossibly small spaces while remaining capable of exerting crushing force. The central body (mantle) is bulbous and muscular, with two large, prominent eyes set to provide excellent forward and lateral vision. The skin is covered in chromatophores that allow rapid color and pattern changes for camouflage and communication. Eight tentacles radiate from the central body, each lined with powerful suction cups and capable of independent movement and sensation. Each tentacle is functionally an arm with its own sensory organs and decision-making capability. The mouth is a hard, sharp beak capable of piercing bone, and it is surrounded by a funnel used for jet propulsion.

## Key Behaviors

Giant Octopuses are supremely intelligent creatures that demonstrate problem-solving ability, learning, and apparent communication through color display and gesture. They are solitary and claim vast territories in deep water where they establish dens and hunting grounds. An octopus spends much of its time at rest in a protected lair, emerging to hunt when prey is abundant or when hunger demands it. They hunt primarily large fish, crustaceans, and mollusks, but a hungry octopus will attack anything that looks edible, including humanoids. An octopus that has learned humanoid weakness becomes particularly dangerous as it begins to hunt ships and divers with apparent deliberation.

## Combat Strategy

A Giant Octopus uses its intelligence to its absolute advantage. It approaches prey stealthily, using camouflage to remain undetected until the moment of attack. When it strikes, tentacles lash out to grapple and draw prey toward the central body where the beak can deliver lethal damage. If a tentacle is damaged or severed, the octopus shows no hesitation in using the remaining limbs with even greater focus. An octopus in serious trouble releases a cloud of ink to obscure pursuit and retreats into deep water. An octopus defending a lair becomes an absolute terror—it protects its home with cunning and desperation, potentially hunting a threat across considerable distances.

## Attack Methods

### Tentacle Grapple

The powerful tentacles wrap around prey and squeeze with force sufficient to crush bones—the suction cups create a grip that is nearly impossible to break without cutting the tentacle. Multiple tentacles can grapple multiple targets or work together to crush a single victim.

### Beak Bite

Once prey is held by tentacles, the octopus brings it toward the central body where the hard, sharp beak can bite and pierce. The bite can crack armor, splinter bone, and cause massive trauma.

## Special Abilities

### Chromatic Camouflage

The octopus can change its color and pattern in seconds to match its surroundings—rocky bottom, sandy floor, or kelp forest. An octopus using this ability requires careful observation to spot even when in open water.

### Ink Defensive Barrage

When threatened or when escaping, the octopus releases a cloud of jet-black ink from its siphon—this cloud obscures vision, tastes foul to predators, and provides concealment for escape. The ink is thick and clouds water effectively.

### Remarkable Intelligence

The octopus demonstrates problem-solving ability unusual in animals—it can learn routes, remember locations, and appear to set traps for prey. It can open containers, manipulate objects, and understand cause-and-effect relationships.

## Additional Information

A giant octopus territory should be avoided by reasonable people—the potential for profit does not offset the danger. Some fishermen claim that old octopuses develop personalities and preferences, hunting specific ships or harbors with apparent vendetta. An octopus's beak is sometimes harvested for armor reinforcement or carved into jewelry. Some magical practitioners claim the ability to negotiate with octopuses through telepathic means, with mixed results.

## Attributes

- **Strength:** 16-21 (1d6+15)

- **Endurance:** 12-17 (1d6+11)

- **Dexterity:** 10-15 (1d6+9)

- **Agility:** 11-16 (1d6+10)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 8-11 (1d4+7)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 11-16 (1d6+10)

- **Creativity:** 10-15 (1d6+9)
