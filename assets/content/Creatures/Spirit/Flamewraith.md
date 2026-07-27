---
aliases:
    - Flamewraith
tags:
    - spirit
name:
    full: Flamewraith
    aliases: []
id: IkisGKow2uz3lPSw
slug: flamewraith
img: icons/game-icons/lorc/spectre.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 9
        end: 11
        dex: 15
        agl: 17
        per: 11
        aur: 15
        wil: 13
        rea: 9
        cre: 11
    attrRollFormula:
        str: 1d4+6
        end: 1d4+8
        dex: 1d4+12
        agl: 1d4+14
        per: 1d4+8
        aur: 1d4+12
        wil: 1d4+10
        rea: 1d4+6
        cre: 1d4+8
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 0
            calc: 0
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: wetlands
                mode: override
                textValue: "0"
              - scope: surface_cover
                key: dunes
                mode: override
                textValue: "0"
              - scope: surface_cover
                key: mixed_forest
                mode: override
                textValue: "0"
              - scope: surface_cover
                key: barren
                mode: override
                textValue: "0"
              - scope: hydrology
                key: shallow
                mode: override
                textValue: "0"
              - scope: hydrology
                key: deep
                mode: override
                textValue: "0"
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

Before you materializes a dancer of flame—a form that is less body than burning intention. The air itself warps and shimmers, bending light into distorted waves; you feel the heat on your skin from several paces away, like standing too close to a furnace. Where it moves, embers trail and scatter, sizzling against stone and wood. The creature's limbs form and dissolve like water running upward, and where they should be a face, there is only a churning vortex of orange and white fire that seems to regard you with terrible intelligence.

# Dossier {#dossier}

Flamewraiths are the tortured remnants of pyromancers who died consumed by their own infernos—or sometimes spirits summoned into the material world and bound to burning objects by dark rituals. They are volatile by nature, drawn to sources of flame and destruction. A Flamewraith encountered in the wild may have escaped its binding, making it a threat to entire regions; one called forth by a sorcerer will obey until released or its anchor is shattered. They are not mindless—they hunt with cunning and patience, and they learn.

## Presentation

The Flamewraith resembles a humanoid figure roughly six feet tall, composed entirely of roiling fire. Its body is not truly solid; it flickers and shifts constantly, with edges that blur and reform. Its surface ranges in color from deep orange and crimson to white-hot intensity at its core. No two moments show the same silhouette. The creature moves with liquid grace, sometimes gliding across surfaces, sometimes climbing vertical walls as though gravity is merely one option among many. It radiates intense heat sufficient to cause burns from ten feet away, and it leaves no tracks—only scorched earth and melted stone.

## Key Behaviors

Flamewraiths are driven by a hunger for fuel and a compulsive need to consume. Most are found in places of destruction—ruins of burned settlements, volcanic regions, or around fire-touched sites. They do not sleep; they either rage across the landscape or fall into a kind of stupor near their binding object if one anchors them. When undisturbed, a Flamewraith may remain in a single place for weeks, slowly expanding a perimeter of scorched earth. Solitary creatures by nature, they become territorial and violent when encountered by others of their kind. They seem to regard living beings with a mix of hunger and contempt—food, but unworthy food.

## Combat Strategy

Flamewraiths fight without fear of pain or death, knowing they can reform from their binding object if destroyed. They abuse their mobility, circling opponents and striking from multiple vectors. When facing a foe that cannot harm them with physical weapons, they become almost casual, toying with their opponent before the killing blow. If confronted with cold or water, they retreat if possible; these are the only things that seem to cause them true distress. They rarely flee combat entirely, preferring to become more evasive and ranged-focused. In groups, Flamewraiths still fight independently, though they may coordinate to herd prey into killing positions.

## Attack Methods

### Incendiary Touch

The creature makes contact with flesh or fabric and the temperature spikes instantly to agony. This is not merely heat—it is the inverse of freezing, a burning that penetrates through armor and cloth alike, searing muscle beneath. On a successful strike, the victim suffers severe thermal burns and ongoing damage from internal heat.

### Fireball

The Flamewraith coalesces, drawing in its scattered form, and then explodes outward in a violent burst of flame. Nearby creatures are engulfed in a wave of heat and burning debris. Multiple opponents can be targeted by a single Fireball if they cluster; the creature seems to understand geometry and positioning instinctively.

## Special Abilities

### Incorporeal Form

The Flamewraith can pass through solid matter as though it were mist. It can phase slightly out of synchronization with the material world, making it resistant to physical weapon strikes and able to retreat through stone and wood. Cold and water-touched attacks are still dangerous to it, however; even when phased, such elements harm it.

### Binding Anchor

The Flamewraith's true existence is tied to a single object—usually a cursed artifact, enchanted weapon, or focus item. While that object remains intact, the Flamewraith cannot be permanently destroyed; after three days, it reforms fully. Only destruction of the binding object kills it permanently.

### Heat Aura

Simply existing near a Flamewraith is dangerous. The ambient temperature rises markedly within a thirty-foot radius, and exposed skin burns over prolonged exposure. Flammable materials spontaneously ignite if too close. Metal weapons become too hot to hold comfortably.

## Additional Information

Flamewraiths are profoundly weakened by cold and water. A sufficiently large body of water can immobilize one, and sustained cold-based magic may reduce its power significantly. They are drawn instinctively to sources of flame—they will abandon a hunt if they sense a large fire nearby. This can be exploited by clever opponents. Their binding objects vary; some are grotesque (a charred bone), others beautiful (a gemstone that never cools). The object must be destroyed through normal means—typically, it requires great force or the right magical technique. A Flamewraith destroyed permanently leaves behind only ash and the binding object itself, which may be worth salvaging depending on its original nature.

## Attributes

- **Strength:** 7-10 (1d4+6)

- **Endurance:** 9-12 (1d4+8)

- **Dexterity:** 13-16 (1d4+12)

- **Agility:** 15-18 (1d4+14)

- **Perception:** 9-12 (1d4+8)

- **Aura:** 13-16 (1d4+12)

- **Will:** 11-14 (1d4+10)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 9-12 (1d4+8)

## Lineage Notes

_The following notes are inherited from the original lineage description._

Before you materializes a dancer of flame—a form that is less body than burning intention. The air warps and shimmers, bending light into distorted waves where the figure stands. Six feet tall and composed entirely of roiling fire, its edges blur and reform constantly, never quite settling into shape.

## Description

The flamewraith is a humanoid figure roughly six feet tall, composed entirely of roiling fire, with edges that blur and reform constantly. It possesses bioluminescent eyes burning with sickly luminescence and an aura of wrongness that warps the air around it.

## Key Behaviors

Flamewraiths are driven by compulsive hunger for fuel and the need to consume. They do not sleep but either rage across the landscape or fall into stupor near their binding object. When undisturbed, they may remain in single places for weeks, slowly expanding a perimeter of scorched earth.

## Relations

Flamewraiths are universally feared and hunted. A flamewraith escaped from its binding becomes a direct threat to entire regions. Some deeply desperate communities have negotiated with bound flamewraiths, but such arrangements are viewed with moral ambiguity.

## Special Abilities

### Incorporeal Form

Flamewraiths radiate intense heat, move through the air with liquid grace, and are resistant to physical weapon strikes through their incorporeal form.

### Binding Anchor

Flamewraiths are tied to binding objects and cannot be permanently destroyed while those objects remain intact.

### Environmental Alteration

Flamewraiths raise the ambient temperature around them, causing burns from a distance and igniting flammable materials in their presence.
