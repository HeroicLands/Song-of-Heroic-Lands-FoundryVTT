---
aliases:
    - Giant Ant
tags:
    - animal
name:
    full: Giant Ant
    aliases: []
id: z1mE9iVDLalVjhSc
slug: giant-ant
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 13
        end: 16
        dex: 11
        agl: 13
        per: 12
        aur: 9
        wil: 11
        rea: 7
        cre: 5
    attrRollFormula:
        str: 1d6+9
        end: 1d6+12
        dex: 1d6+7
        agl: 1d6+9
        per: 1d6+8
        aur: 1d4+6
        wil: 1d6+7
        rea: 1d4+4
        cre: 1d4+2
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Thorax
                  shortcode: thoraxzone
                  probWeight: 1
                - name: Abdomen
                  shortcode: abdomenzone
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
                - name: Thorax
                  shortcode: thoraxpart
                  bodyZoneCode: thoraxzone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Legs
                  shortcode: llegspart
                  bodyZoneCode: thoraxzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
                - name: Right Legs
                  shortcode: rlegspart
                  bodyZoneCode: thoraxzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 3
                - name: Abdomen
                  shortcode: abdomenpart
                  bodyZoneCode: abdomenzone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 7
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Mandibles
                  shortcode: mandibloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: low
                  amputability: high
                  shockValue: 2
                  probWeight: 3
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: thoraxpart
                  bleedingSusceptibility: low
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Left Legs
                  shortcode: llegsloc
                  bodyPartCode: llegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Right Legs
                  shortcode: rlegsloc
                  bodyPartCode: rlegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: abdomenpart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
        weight:
            base: 5
            calc: "5"
        reachBase: 0
        bodyScaleBase: 1.18
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 1
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - name: Mandible Bite
          type: skill
          system:
              shortcode: mandible
              subType: combattechnique
              masteryLevelBase: 58
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: mandible
                  name: Mandible Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
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
        - name: Grapple and Drag
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
                  name: Grapple and Drag
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 13
                      aspect: blunt
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

The ground trembles beneath your feet—a rhythmic vibration that grows steadily more pronounced. Then you see it: a chitinous form three feet long at the shoulders, mandibles spread impossibly wide, advancing with mechanical precision. Its segments gleam like burnished bronze, and where its compound eyes face you, you see reflected a multiplicity of movement. The air fills with a pheromonal reek—acrid, caustic, utterly alien. Behind it, you hear the clicking and scratching of more legs on stone, and the sound of mandibles snapping together in unison.

# Dossier {#dossier}

The Giant Ant is a hyper-evolved insect soldier standing three to five feet in body length, possessed of strength and durability far exceeding its smaller cousins. These creatures exist as integral parts of vast colony systems, perfectly adapted for their role as defenders and hunters for the queen. Colonies can range from a dozen to hundreds of individuals, and a disturbed colony responds with terrible coordination. Adventurers most often encounter giant ants when delving into caves or ancient ruins that have become home to a colony, or when they stumble into ant-infested territory on the surface.

## Presentation

A Giant Ant is a marvel of exoskeletal engineering—a segmented body covered in dark brown or bronze chitin that provides armor-like protection. The head bears two large compound eyes that give the creature broad field of vision, and two wicked mandibles that can open to angles that seem physically improbable. The thorax is thick and powerful, supporting six articulated legs that move with perfect, mechanical synchronization—each foot finding purchase with eerie precision. The legs are equipped with hooks and claws that allow the ant to traverse vertical surfaces as easily as flat ground. The abdomen is bulbous and segmented, with a small stinger or pheromone-releasing organ at the tip. The creature's coloration ranges from dark brown to reddish-bronze, and its chitinous shell produces a faint clicking sound as segments shift and flex.

## Key Behaviors

Giant Ants exist as specialized individuals within a colony structure. Soldier ants are aggressive and territorial, defending the colony's perimeter and attacking anything that threatens the nest or interferes with foraging operations. They communicate through touch, pheromones, and chemical signals, allowing the colony to coordinate hunting and defense without vocal communication. Soldiers and workers operate with shared purpose, often hunting cooperatively to bring down larger prey that would be impossible for a single ant to subdue. The colony maintains strict organizational hierarchy, with soldiers answering to the chemical signals of worker ants and queen pheromones. An isolated giant ant without colony backup is still dangerous but noticeably less aggressive and cooperative.

## Combat Strategy

A single giant ant fights with directness and tenacity—advancing and attempting to grapple prey while snapping with mandibles. Its primary goal is immobilization, as the ant wants to carry prey back to the colony for the larvae. A colony of ants uses numbers and coordination: they swarm from multiple angles, focusing fire on individual targets, and attempt to isolate wounded or separated targets from the group. If a soldier is killed, other ants will ignore the body and continue fighting, following the pheromone trails of living threats. A colony only retreats when casualties become catastrophic or when the queen is threatened—ants will fight unto death to defend their nest.

## Attack Methods

### Mandible Bite

A powerful crushing and tearing attack—the mandibles close with force sufficient to bite through leather armor, bone, and soft flesh alike. The ant locks mandibles onto a target and pulls, attempting to drag prey closer or cause additional trauma.

### Grapple and Drag

The ant's six strong legs provide stability and leverage—it grapples with both mandibles and body, attempting to wrap around a target and immobilize it long enough for other ants to strike or for the prey to be carried back to the colony.

## Special Abilities

### Colony Coordination

When multiple ants fight together, they receive strategic bonuses as if they shared a single tactical mind. They never hesitate or second-guess, never fumble coordination, and can execute complex maneuvers that isolate and overwhelm individual targets. A solitary giant ant loses this advantage and becomes noticeably less effective.

### Exoskeletal Armor

The ant's chitinous shell provides natural protection from weapons that rely on penetrating thin armor. Blunt weapons are more effective against the ant than edged weapons, as the shell tends to deflect rather than catch them. The joints between segments are weak points that suffer normal damage.

## Additional Information

Giant ants represent both opportunity and hazard. An active ant colony can be domesticated or negotiated with through various magical means, turning them into useful allies for clearing other pests or defending territory. However, a provoked colony is implacable in pursuit and will pursue enemies to the ends of their territory. Ant eggs are edible and considered a delicacy in some cultures—harvesting them is a profitable but extremely dangerous undertaking. The chitin from a giant ant can be worked into armor or decorations.

## Attributes

- **Strength:** 10-15 (1d6+9)

- **Endurance:** 13-18 (1d6+12)

- **Dexterity:** 8-13 (1d6+7)

- **Agility:** 10-15 (1d6+9)

- **Perception:** 9-14 (1d6+8)

- **Aura:** 7-10 (1d4+6)

- **Will:** 8-13 (1d6+7)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 3-6 (1d4+2)
