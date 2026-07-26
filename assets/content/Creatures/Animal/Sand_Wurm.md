---
aliases:
    - Sand Wurm
tags:
    - animal
name:
    full: Sand Wurm
    aliases: []
id: 7hW9W4pXEtgVMSMD
slug: sand-wurm
img: icons/game-icons/lorc/worm-mouth.svg
portrait: ""
type: creature
package: sohl
sohl:
    attributes:
        str: 37
        end: 31
        dex: 11
        agl: 10
        per: 16
        aur: 9
        wil: 13
        rea: 6
        cre: 5
    attrRollFormula:
        str: 1d6+33
        end: 1d6+27
        dex: 1d6+7
        agl: 1d4+7
        per: 1d6+12
        aur: 1d4+6
        wil: 1d6+9
        rea: 1d4+3
        cre: 1d4+2
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 2000
            calc: 2000
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: dunes
                mode: add
                textValue: "0"
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The ground itself becomes the warning — a deep, subsonic vibration that travels up through your feet and into your bones. The sand and earth around you begins to shift, creating patterns of disturbance that shouldn't exist, as if something impossibly vast moves beneath the surface. Then, with the violence of an eruption, the ground explodes upward, and a maw of such scale and such teeth emerges that your mind struggles to comprehend it. Rough, beige scales gleam in harsh sunlight, each one the size of a shield, arranged in patterns that mimic dunes, and the creature's eyeless head sways with an awareness that seems to transcend normal senses. The smell hits — sulfur and ancient earth, the reek of a creature that has hunted for centuries. The sound is worst of all: not a roar but a hiss from deep in the throat, a sound that resonates with hunger and inevitability.

# Dossier {#dossier}

The Sand Wurm is an impossibly massive subterranean predator reaching lengths of 50-100 feet and diameters of 10-15 feet, found in deep deserts, badlands, and subterranean caverns where vast prey populations exist. These apex predators are virtually unstoppable underground, using tremor sense and ambush tactics to hunt creatures ranging from large animals to humanoid settlements. Adventurers encounter sand wurms rarely — encountering one is often a catastrophe that marks the end of an expedition.

## Presentation

The Sand Wurm is a creature of overwhelming scale and alien physiology. The body is serpentine and segmented, covered entirely in rough, overlapping scales in beige, pale yellow, and tan that mimic desert sand perfectly when the creature is still. The segments are marked by flexible joints that allow undulating motion and burrowing. The head is rounded and blunt, without eyes but with a sensory apparatus for detecting vibrations and chemical traces. The maw is the defining feature — a circular mouth ringed with concentric rows of razor-sharp teeth that extend inward in a pattern designed to prevent escape. The mouth can open to a diameter of 8-10 feet, and the throat extends down into the creature's body, capable of swallowing creatures whole.

## Key Behaviors

Sand Wurms are ambush predators that spend nearly their entire existence burrowing beneath sand and stone, surfacing only to attack prey or relocate to new hunting grounds. They are solitary, territorial creatures that maintain enormous territories and defend them against rivals or intrusion. The creature is active when prey vibrations are detected and may remain still for weeks or months if prey is scarce. Sand Wurms are capable of learning — a wurm that frequently encounters humanoids or fortifications will develop adjusted hunting tactics and avoid those dangers. The creature's presence in a region can be identified by the characteristic winding dune patterns created by movement beneath the sand.

## Combat Strategy

The sand wurm attacks from beneath, erupting through sand or stone to engulf prey in its maw. The creature attempts to swallow smaller prey whole and to crush or compress larger prey through body coiling and constriction. If the initial ambush fails, the wurm may surface again to attack from a new location or retreat beneath the sand to avoid prolonged combat. The creature is nearly invulnerable underground and fights with overwhelming confidence in its domain.

## Attack Methods

### Erupting Bite

The sand wurm burst upward from beneath, attempting to engulf prey in its massive circular maw. If successful, the creature can swallow creatures up to horse-sized whole, drawing them down into its gullet. Even if the target is too large to swallow, the bite causes horrific injury from the concentric rows of teeth.

### Constricting Body

Once emerged, the wurm can use its serpentine body to coil around large prey, crushing through constriction. The creature's weight and muscular power are sufficient to crush armored opponents and reduce them to paste.

### Ground Collapse

As the wurm moves underground, it can deliberately cause ground collapse and destabilization, potentially burying or trapping surface-dwelling prey.

## Special Abilities

### Tremor Sense

The sand wurm can detect vibrations in earth and sand from extraordinary distances, allowing it to locate prey with accuracy impossible for surface-dwelling creatures. The wurm can sense movement, impact, and vibration patterns from hundreds of feet away.

### Burrow Master

The sand wurm can tunnel through sand, loose earth, and even stone at remarkable speed, creating or enlarging passages as needed. The creature can disappear beneath the surface in moments, making it nearly impossible to pursue.

### Underground Dominance

When fighting beneath sand or earth, the wurm gains overwhelming advantage. It is faster, more maneuverable, and can attack from any angle while opponents are constrained to surface movement.

### Massive Strength

A creature of such size possesses strength far beyond any land-based predator. The wurm can crush boulders, overturn buildings, and generate impacts equivalent to earthquakes through movement.

### Regenerative Capacity

The wurm's body heals with remarkable speed, recovering from wounds that would cripple other creatures. Even severe injuries close within days or weeks.

### Swallowing Capacity

The wurm's throat is capable of swallowing creatures whole without damage to the creature itself, allowing it to consume prey at a pace that other predators cannot match.

### Additional Information

Sand Wurms are territorial and will avoid areas where multiple wurms have claimed territory, as intrusion results in lethal combat. The creatures' presence in a region effectively prevents normal settlement or travel — trade routes must be rerouted to avoid known wurm territories. A sand wurm that has successfully hunted a humanoid settlement will return to that location, making the settlement temporarily uninhabitable. The creatures' scales can be harvested after death and used to create extraordinary armor or defensive architecture, making a dead wurm an enormous resource. Some rare humanoid cultures have learned to coexist with sand wurms through careful territory management and avoidance patterns.

## Attributes

- **Strength:** 34-39 (1d6+33)

- **Endurance:** 28-33 (1d6+27)

- **Dexterity:** 8-13 (1d6+7)

- **Agility:** 8-11 (1d4+7)

- **Perception:** 13-18 (1d6+12)

- **Aura:** 7-10 (1d4+6)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 3-6 (1d4+2)
