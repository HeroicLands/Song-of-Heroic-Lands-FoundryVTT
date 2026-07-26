---
aliases:
    - Pyroclasm
tags:
    - elemental
name:
    full: Pyroclasm
    aliases: []
id: 2ubjJNt3rPAcOeTj
slug: pyroclasm
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
type: creature
package: sohl
sohl:
    attributes:
        str: 15
        end: 15
        dex: 9
        agl: 11
        per: 9
        aur: 13
        wil: 13
        rea: 9
        cre: 11
    attrRollFormula:
        str: 1d4+12
        end: 1d4+12
        dex: 1d4+6
        agl: 1d4+8
        per: 1d4+6
        aur: 1d4+10
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
          feetPerRound: 30
          leaguesPerWatch: 2
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
              - scope: surface_cover
                key: ruins
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

Before you stands contained catastrophe—a roughly humanoid shape twelve feet tall, composed of roiling lava and burning rock held in violent cohesion. Its movements are aggressive and jerky, as if barely contained by the effort of maintaining form. Where it stands, the ground melts and the air shimmers. Magma drips from its limbs like sweat, and its breath is literally fire. The noise it makes is the hiss of lava striking water, the roar of volcanic eruption, the crackle of a world burning. When it looks at you, you are certain you are looking at something that simply wants to incinerate everything.

# Dossier {#dossier}

A Pyroclasm is volcanic devastation made animate—a fire elemental of tremendous power but less intelligent and more chaotic than larger fire creatures. It is born from active volcanoes and is drawn to places of heat and burning. A Pyroclasm encountered away from volcanic regions is likely an escaped binding, and it will consume and destroy everything in its path toward cooler water. In volcanic regions, Pyroclasms are natural phenomena, as inevitable as earthquakes and as destructive.

## Presentation

A Pyroclasm is roughly humanoid in shape, standing about twelve feet tall, and composed entirely of incandescent lava and burning rock. Its body is a writhing mass of molten matter that drips and flows but somehow maintains cohesion. Its core is white-hot and glows with extreme intensity. Where it moves, the ground melts or cracks from heat. Its hands and feet are defined by the flowing nature of lava, and it leaves trails of burning material in its wake.

## Key Behaviors

Pyroclasms are aggressive and destructive by nature. They are driven by hunger for fuel and by the compulsion to burn and incinerate. They show minimal intelligence and seem to lack any real sense of self-preservation. They will continue attacking even when clearly losing, driven by rage and instinct. They are most active in volcanic regions and near sources of flame, and they become more aggressive and more powerful in such environments.

## Combat Strategy

Pyroclasms fight with destructive directness, charging and striking with overwhelming force. They use fire-based attacks indiscriminately, affecting everything around them including their own allies if present. They are too enraged to employ tactics and simply attack the nearest threat until it is defeated or flees. They are nearly fearless and will pursue enemies into dangerous terrain. Against water and cold, they become more cautious and evasive but rarely flee entirely.

## Attack Methods

### Lava Punch

The Pyroclasm strikes with a fist of molten matter, and the impact combines physical force with catastrophic heat. The strike can melt armor and burn flesh to ash. Victims struck are often incapacitated by the combined trauma of impact and thermal damage.

### Fire Burst

The Pyroclasm explodes with flame in a cone or sphere, engulfing everything nearby in searing heat. The attack spreads to flammable materials and can ignite an entire area. Multiple uses of this ability in sequence can transform a location into a full conflagration.

### Lava Spray

The Pyroclasm vomits or sprays magma and burning material in a wide arc, coating everything it touches in dripping lava that continues to burn.

### Seismic Explosion

The Pyroclasm can cause localized eruptions of flame and lava that burst from the ground beneath opponents, creating hazardous terrain and dealing area damage.

## Special Abilities

### Volcanic Resilience

The Pyroclasm is immune to fire damage and heals from fire-based magic. It is harmed primarily by cold and water, which cause it to solidify and become slower and weaker.

### Thermal Destruction

The Pyroclasm's presence is inherently destructive. Everything nearby is subject to extreme heat. Metals melt, stone cracks, and wood ignites spontaneously.

### Lava Immersion

The Pyroclasm can immerse itself in lava or sources of extreme heat to heal and restore itself fully.

### Thermal Sense

The Pyroclasm can sense heat sources and can pursue victims by tracking their body heat. It can see in complete darkness and navigate invisible to normal sight.

## Additional Information

Water is the Pyroclasm's primary weakness. Large bodies of water can immobilize or harm it, and cold-based magic is highly effective. A Pyroclasm cannot remain in frozen terrain or in intense cold. A Pyroclasm destroyed far from lava sources may not reform. One destroyed in volcanic regions will likely return after several seasons. Permanent destruction requires either collapsing it into a large body of cold water, or taking it to regions of such intense cold that its heat cannot sustain its form. A settlement threatened by a Pyroclasm can sometimes force it toward water or cold regions to eliminate the threat without direct combat.

## Attributes

- **Strength:** 13-16 (1d4+12)

- **Endurance:** 13-16 (1d4+12)

- **Dexterity:** 7-10 (1d4+6)

- **Agility:** 9-12 (1d4+8)

- **Perception:** 7-10 (1d4+6)

- **Aura:** 11-14 (1d4+10)

- **Will:** 11-14 (1d4+10)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 9-12 (1d4+8)
