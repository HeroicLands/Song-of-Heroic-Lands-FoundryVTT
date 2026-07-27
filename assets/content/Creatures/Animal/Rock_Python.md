---
aliases:
    - Rock Python
tags:
    - animal
name:
    full: Rock Python
    aliases: []
id: 5GlgTelIHgQGv4A9
slug: rock-python
img: icons/game-icons/lorc/snake.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 17
        end: 15
        dex: 13
        agl: 12
        per: 14
        aur: 8
        wil: 12
        rea: 6
        cre: 5
    attrRollFormula:
        str: 1d6+13
        end: 1d6+11
        dex: 1d6+9
        agl: 1d6+8
        per: 1d6+10
        aur: 1d4+5
        wil: 1d6+8
        rea: 1d4+3
        cre: 1d4+2
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 200
            calc: 200
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 2
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: wetlands
                mode: add
                textValue: "0"
              - scope: hydrology
                key: shallow
                mode: add
                textValue: "0"
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The ground beneath your feet seems to shift as something massive moves, creating ripples in dust and small stones. Before you can react, coils of muscular, patterned flesh rise from the shadows, each coil as thick as a human torso. The scales shimmer with patterns of brown and green that seem to shift and blur, making it difficult to parse the creature's true form. The head rises last, revealing an eye yellow and lidless, staring with the certainty of something that has waited centuries for prey to arrive. The air itself seems to tighten as the creature acknowledges you, and you understand with absolute clarity that escape may no longer be an option.

# Dossier {#dossier}

The Rock Python is a massive constrictor serpent reaching lengths of 30-40 feet with a body girth of 1-2 feet in diameter, found in deep jungles, rocky highlands, and cave systems across isolated regions. These apex predators are slow-moving but nearly unstoppable once prey is located, relying on patience, stealth, and overwhelming strength. Adventurers might encounter rock pythons while exploring ruins, crossing jungle terrain, or descending into caves where these creatures establish territory.

## Presentation

The Rock Python is a creature of overwhelming mass and alien physiology. The body is covered in scales arranged in complex geometric patterns of earthy brown, mottled green, and pale cream that provide extraordinary camouflage against rocks, dirt, and foliage. The head is proportionally smaller than the body, with a jaw capable of unhinging to remarkable proportions and an eye positioned to provide monocular vision along each side. The unblinking yellow eye is vertically pupilled and seems to possess intelligence and calculation beyond what serpents typically display. The mouth, when visible, reveals rows of small backward-pointing teeth designed to grip and guide prey down the gullet rather than to tear. The tongue is constantly active, flickering in and out to taste the air and ground, drawing chemical information through a vomeronasal organ.

## Key Behaviors

Rock Pythons are fundamentally ambush predators that spend the vast majority of their time waiting motionless in locations where prey regularly passes. A single rock python may occupy the same boulder or cave mouth for months, becoming essentially a geological feature. They are patient to a degree that seems inhumane — capable of waiting weeks between meals and remaining absolutely still for days or weeks while waiting for prey. They are solitary and territorial, with large pythons actively killing smaller pythons that encroach on feeding grounds. Pythons are most active during dawn and dusk when temperature conditions favor optimal movement speed. Their metabolism is extraordinarily slow; a large python may consume a creature the size of a deer and then fast for months while digestion occurs.

## Combat Strategy

The python's strategy is simplicity itself: wait motionless until prey approaches within striking range, then attack with explosive speed, wrap coils around the victim's body, and constrict with relentless pressure until the prey loses consciousness. Once wrapped, the python becomes nearly impossible to dislodge and will continue constriction for hours if necessary. If the initial strike fails, the python will retreat and wait for the next opportunity, unwilling to engage in prolonged combat. A python that has secured prey will not release it for any reason.

## Attack Methods

### Lightning Strike

The python uncoils with explosive speed and lashes forward, attempting to seize a target with its mouth and pull it back toward the coils. The strike is devastatingly quick for such a massive creature, and once contact is established, escape becomes nearly impossible.

### Constricting Coils

Once the python has wrapped around a victim, it uses muscular coils of tremendous force to restrict breathing and circulation. Each round, the pressure increases unless the victim manages to escape the grapple entirely. The coils can crush bone and burst blood vessels, causing internal injury even before the victim loses consciousness.

### Tail Whip

If the python uses its tail defensively, it can generate impacts with significant force, suitable for knocking opponents off balance or creating distance.

## Special Abilities

### Immovable Grapple

Once the python has coiled around a victim, the grapple is nearly impossible to escape through conventional means. The strength required to break free from python constriction exceeds the capability of most humanoids. Magical assistance or use of exceptional strength is typically required.

### Natural Camouflage

The python's patterning is so effective that a motionless snake is nearly invisible when positioned in its natural rocky or jungle environment. Spotting a still python requires active searching rather than casual observation.

### Sensory Depth

The python's thermal sensing (heat pits along the jaw) and chemical sensing (through its flickering tongue) allow it to perceive prey with accuracy that approaches echolocation. The python can hunt in total darkness and detect prey buried in leaf litter or hidden in crevices.

### Slow Metabolism

The python requires far less food than a comparably sized mammalian predator, allowing it to survive months between feeding in environments where prey is scarce. This endurance allows pythons to persist in territories where other large predators would starve.

### Unhinging Jaw

The python's jaw can expand to remarkable proportions, allowing it to consume prey nearly as large as itself. This capability means that prey items other creatures would consider too large to hunt are fair game for a rock python.

### Additional Information

Rock pythons are dangerous but predictable — they do not hunt opportunistically and will not pursue prey fleeing into open ground. A rock python can be avoided by carefully watching for its presence and maintaining distance. The creature's size makes it identifiable, and locals in areas with rock pythons develop awareness of where pythons are likely to be positioned. A rock python that has successfully hunted humanoids may develop the behavior of targeting humanoids specifically, making it a direct threat to settlements.

## Attributes

- **Strength:** 14-19 (1d6+13)

- **Endurance:** 12-17 (1d6+11)

- **Dexterity:** 10-15 (1d6+9)

- **Agility:** 9-14 (1d6+8)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 6-9 (1d4+5)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 3-6 (1d4+2)
