---
aliases:
    - Orangutan
tags:
    - animal
name:
    full: Orangutan
    aliases: []
id: AwaNWFfRCrFpYZya
slug: orangutan
img: images/orangutan-headshot.webp
portrait: images/orangutan.webp
type: creature
package: thalorna
sohl:
    attributes:
        str: 19
        end: 15
        dex: 15
        agl: 16
        per: 13
        aur: 10
        wil: 13
        rea: 12
        cre: 11
    attrRollFormula:
        str: 1d6+15
        end: 1d6+11
        dex: 1d6+11
        agl: 1d6+12
        per: 1d6+9
        aur: 1d4+7
        wil: 1d6+9
        rea: 1d6+8
        cre: 1d6+7
    body:
        structure:
            parts:
                - name: Head
                  shortcode: headpart
                  zones:
                      - vital
                  canHoldItem: false
                  heldItemId: null
                  locations:
                      - name: Skull
                        shortcode: skullloc
                        bleedingSusceptibility: low
                        amputability: none
                        shockValue: 5
                        probWeight: 500
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Eye
                        shortcode: leyeloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 5
                        probWeight: 15
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Eye
                        shortcode: reyeloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 5
                        probWeight: 15
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Nose
                        shortcode: noseloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 5
                        probWeight: 30
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Cheek
                        shortcode: lcheekloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 60
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Cheek
                        shortcode: rcheekloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 60
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Ear
                        shortcode: learloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 15
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Ear
                        shortcode: rearloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 15
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Mouth
                        shortcode: mouthloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 30
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Jaw
                        shortcode: jawloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 60
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Neck
                        shortcode: neckloc
                        bleedingSusceptibility: high
                        amputability: low
                        shockValue: 5
                        probWeight: 200
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                - name: Right Arm
                  shortcode: rarmpart
                  zones:
                      - manipulator
                  canHoldItem: true
                  heldItemId: null
                  locations:
                      - name: Right Shoulder
                        shortcode: rshldloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 3
                        probWeight: 30
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Upper Arm
                        shortcode: rupaloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 1
                        probWeight: 30
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Elbow
                        shortcode: relbloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 2
                        probWeight: 10
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Forearm
                        shortcode: rfraloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 1
                        probWeight: 20
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Hand
                        shortcode: rhandloc
                        bleedingSusceptibility: none
                        amputability: high
                        shockValue: 2
                        probWeight: 10
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                - name: Left Arm
                  shortcode: larmpart
                  zones:
                      - manipulator
                  canHoldItem: true
                  heldItemId: null
                  locations:
                      - name: Left Shoulder
                        shortcode: lshldloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 3
                        probWeight: 30
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Upper Arm
                        shortcode: lupaloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 1
                        probWeight: 30
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Elbow
                        shortcode: lelbloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 2
                        probWeight: 10
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Forearm
                        shortcode: lfraloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 1
                        probWeight: 20
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Hand
                        shortcode: lhandloc
                        bleedingSusceptibility: none
                        amputability: high
                        shockValue: 2
                        probWeight: 10
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                - name: Torso
                  shortcode: torsopart
                  zones:
                      - core
                  canHoldItem: false
                  heldItemId: null
                  locations:
                      - name: Thorax
                        shortcode: thrxloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 40
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Abdomen
                        shortcode: abdmnloc
                        bleedingSusceptibility: high
                        amputability: none
                        shockValue: 4
                        probWeight: 40
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Pelvis
                        shortcode: plvisloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 20
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                - name: Right Leg
                  shortcode: rlegpart
                  zones:
                      - locomotor
                  canHoldItem: false
                  heldItemId: null
                  locations:
                      - name: Right Thigh
                        shortcode: rthghloc
                        bleedingSusceptibility: medium
                        amputability: low
                        shockValue: 3
                        probWeight: 40
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Knee
                        shortcode: rkneeloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 2
                        probWeight: 10
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Calf
                        shortcode: rcalfloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 1
                        probWeight: 30
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Right Foot
                        shortcode: rfootloc
                        bleedingSusceptibility: none
                        amputability: medium
                        shockValue: 2
                        probWeight: 20
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                - name: Left Leg
                  shortcode: llegpart
                  zones:
                      - locomotor
                  canHoldItem: false
                  heldItemId: null
                  locations:
                      - name: Left Thigh
                        shortcode: lthghloc
                        bleedingSusceptibility: medium
                        amputability: low
                        shockValue: 3
                        probWeight: 40
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Knee
                        shortcode: lkneeloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 2
                        probWeight: 10
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Calf
                        shortcode: lcalfloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 1
                        probWeight: 30
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
                      - name: Left Foot
                        shortcode: lfootloc
                        bleedingSusceptibility: none
                        amputability: medium
                        shockValue: 2
                        probWeight: 20
                        protectionBase:
                            blunt: 0
                            edged: 0
                            piercing: 0
                            fire: 0
            adjacent: []
        weight:
            base: 120
            calc: 120
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 35
          leaguesPerWatch: 3
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The canopy ahead erupts with sound — the creak of straining wood and the rustle of leaves as something massive shifts weight between branches. A shape moves in the dappled shadow above, reddish-brown and impossibly long-armed, studying you with an intelligence that seems almost unsettling in an animal. You catch the rich, earthen smell of the forest mixed with something musky and alive. The creature reaches overhead, arm extending nearly twice the length of its heavy body, and settles onto a thicker branch with a confidence that suggests it has never feared a fall.

# Dossier {#dossier}

The orangutan is a highly intelligent forest ape inhabiting dense rainforest canopies across distant, untamed lands. These solitary, contemplative creatures are peaceful herbivores that will only turn violent when threatened directly or if their young are endangered. Adventurers are likely to encounter them while navigating jungle ruins, gathering rare forest plants, or being misdirected by guides into inhabited territory.

## Presentation

The orangutan stands 5 to 6 feet tall but appears even larger due to its extraordinarily long arms, which can span up to 10 feet from fingertip to fingertip. Its body is covered in coarse, reddish-brown to deep orange fur that becomes thicker and darker with age. The face is distinctive — large, leathery, and expressive, with deep-set intelligent eyes that shift from dark brown to amber. The hands and feet are large and dexterous, with opposable thumbs and powerful gripping strength. Adult males often develop a pronounced shoulder hump and throat pouch that deepens their vocalizations into resonant, haunting calls that echo through the forest canopy.

## Key Behaviors

Orangutans are fundamentally solitary creatures that maintain large territorial ranges, defending trees rich in fruit through solitary dominion rather than aggression. They spend nearly their entire lives in the trees, descending to ground level only to move between forest patches or to drink. These creatures are contemplative and methodical, often spending hours examining and carefully extracting insects from bark crevices or studying a fruit tree to determine the ripest picks. They are highly intelligent, capable of recognizing individual humans and remembering encounters over years. Mothers fiercely protect offspring for six to seven years, teaching them navigation, foraging, and survival skills with patience and care.

## Combat Strategy

An orangutan's first response to threat is retreat — it climbs higher into the canopy where its superior branch-navigation ability provides safety. If escape is impossible, it will attempt to intimidate through vocalizations and displays, standing bipedally on branches, swaying the canopy violently, and emitting deep warning calls. Only when directly attacked or when young are threatened will an orangutan fight. When forced to combat, it uses its overwhelming strength advantage and long reach to grapple and subdue attackers, preferring to restrain rather than injure. It will use the environment tactically — swinging across gaps to create distance, breaking branches to create obstacles, and using height advantage for leverage in wrestling matches.

## Attack Methods

### Powerful Grapple

The orangutan closes distance with rapid brachiation and uses its long arms and tremendous strength to wrap around an opponent's torso or limbs, pinning them with crushing force. The creature's grip is nearly impossible to break without significant strength or leverage.

### Branch Break and Throw

The orangutan breaks dead wood from its current branch and hurls fragments — ranging from fist-sized chunks to substantial pieces — at targets below or at distance. While primarily a distraction tactic, larger projectiles can cause serious injury.

### Bite

If a grapple is successful, the orangutan may bite at exposed flesh, particularly face, shoulder, or limb, inflicting puncture wounds from its powerful jaw and large canine teeth.

## Special Abilities

### Arboreal Mastery

The orangutan moves through the forest canopy with effortless grace and speed that defies gravity. It can brachiate across gaps, swing in complex patterns, and position itself on branches humans cannot reach, giving it unmatched tactical mobility in forest combat. In the trees, it gains advantage on agility and climbing checks.

### Incredible Strength

An orangutan's muscular build is deceptive — an adult male can weigh as much as three humans but possesses strength well beyond that ratio. It can bend saplings, tear open termite mounds, and manipulate objects humans would struggle with.

### Intelligent Problem Solving

The orangutan can assess situations with startling clarity and adjust tactics mid-combat. It remembers previous encounters with humans and can anticipate repeated behaviors, making it unpredictable in prolonged conflicts.

### Intimidating Displays

When threatened, the orangutan performs elaborate threat displays — rocking branches violently, emitting deep resonant calls that seem to shake the forest itself, and creating the visual impression of a far larger, more aggressive creature than it truly is. These displays can unnerve unprepared adventurers.

### Additional Information

Orangutans are generally docile toward humans who do not threaten them, and some forest-dwelling peoples have learned to coexist peacefully. Capturing or injuring an orangutan, however, creates a dangerous and implacable enemy that will stalk and harass the perpetrator for months. The creatures' intelligence means they can be tracked and anticipated — but they also learn and adapt to countermeasures.

## Attributes

- **Strength:** 16-21 (1d6+15)

- **Endurance:** 12-17 (1d6+11)

- **Dexterity:** 12-17 (1d6+11)

- **Agility:** 13-18 (1d6+12)

- **Perception:** 10-15 (1d6+9)

- **Aura:** 8-11 (1d4+7)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 9-14 (1d6+8)

- **Creativity:** 8-13 (1d6+7)
