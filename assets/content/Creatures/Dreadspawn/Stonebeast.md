---
aliases:
    - Stonebeast
tags:
    - dreadspawn
name:
    full: Stonebeast
    aliases: []
id: vkJVD3VzKCKvgPCx
slug: stonebeast
img: icons/game-icons/delapouite/rock-golem.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        end: 19
        dex: 6
        per: 12
        aur: 8
        wil: 16
        rea: 10
        cre: 8
    attrRollFormula:
        end: 1d4+16
        dex: 1d4+3
        per: 1d4+9
        aur: 1d4+5
        wil: 1d4+13
        rea: 1d6+6
        cre: 1d4+5
    body:
        structure:
            zones: []
            parts: []
            locations: []
        weight:
            base: 2000
            calc: 2000
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 40
          leaguesPerWatch: 3
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: topography
                key: steep
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: alpine
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: barren
                mode: add
                textValue: "0"
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The mountainside moves. You know this is impossible, and yet the stone itself shifts and rises—plates of it sliding across each other with a sound like avalanche, like the world breaking. Then you see it whole: a creature of mountain-sized density and utterly alien geometry, wrought from cracked stone and obsidian, its bulk barely contained by its rough, irregular shape. Obsidian eyes glow from deep recesses, burning with a light like subterranean fire, and you feel the tremor of each movement in your bones and teeth. Where it steps, the ground cracks, and you realize this thing is not simply massive—it is heavy beyond measure, as though it carries the weight of the earth itself within its petrified body.

# Dossier {#dossier}

Stonebeasts are ancient guardians that predate humanoid civilization, creatures of pure earth-and-stone embodiment that seem to have emerged from the deep places where mountains form and the world settles. They are ordinarily dormant—passive, stationary residents of caverns and stone labyrinths—but once disturbed or provoked, they become implacable forces of destruction. A Stonebeast's intelligence is minimal but not absent; it understands territory, intruders, and the concept of threat. Most of these creatures are found in deep places: the hearts of mountains, the hearts of ancient stone structures, and in the lightless depths where caves descend beyond the reach of normal exploration. An old Stonebeast may have rested in the same location for millennia, waiting in perfect stillness until something dares to disturb its domain.

## Presentation

A Stonebeast stands 20 to 30 feet in height, its body an irregular mass of blocky stone and crystalline formations, shaped vaguely like a quadrupedal creature but with anatomy that seems to prioritize weight and stability over naturalistic form. Its "head" is a roughly cubic protrusion, with eyes of polished black obsidian set deep within, burning with a slow, deep amber light that seems to come from the creature's interior rather than reflected from outside sources. Its limbs are pillars of stone, thick and unadorned, ending in roughly articulated digits that look less like claws than like chunks of stone that have barely achieved independent movement. Its surface is weathered and cracked, with seams showing layers of different stone types—granite, basalt, obsidian, veins of crystalline minerals. Where it moves, stone dust billows, and the smell is of deep caverns and minerals, a scent that makes the back of your throat burn. When it speaks—if what it does can be called speaking—the sound is of grinding stone, a low frequency that you feel more than hear.

## Key Behaviors

A Stonebeast is ordinarily dormant, content to rest in its chosen location indefinitely. It seems to require no food, no water, and no rest beyond stillness. It becomes active when disturbed—intruders in its territory, the removal of stone from its domain, or significant vibrations all serve as waking calls. Once awake, a Stonebeast will remain active until it has either eliminated the threat or is confident the threat will not return. It is intelligent enough to understand concepts like treasure, but it shows no interest in acquisition or hoarding. An ancient Stonebeast may have developed territorial behaviors spanning miles, and it will know every stone in its domain intimately.

## Combat Strategy

A Stonebeast moves with methodical inevitability, advancing toward threats at its own deliberate pace. Its attacks are straightforward and devastating—it seeks to crush opponents through sheer weight and power rather than through tactical sophistication. The creature will adapt minimally to combat—if a tactic works, it will repeat it; if an opponent proves too quick to hit directly, it may shift to area-of-effect attacks rather than changing fundamental approach. A Stonebeast has never truly retreated from a confrontation; instead, it may simply become dormant again if it determines a threat cannot be eliminated. Only water, in sufficient quantity, can make it retreat—its stone body dissolves slowly in flowing water, and the creature instinctively avoids such fates.

## Attack Methods

### Crushing Stomp

The creature raises one of its massive limbs and brings it down with apocalyptic force, intending to pulverize whatever lies beneath. The impact radiates outward as a shock wave, and the ground itself becomes hazardous terrain from the blow.

### Shattering Punch

The Stonebeast's fists are simple but devastatingly effective, capable of striking opponents from surprising distance and delivering blow that shatters bone and armor alike. A successful hit can permanently disable or cripple a target.

### Rock Throw

The creature can tear loose pieces of stone from its surroundings or from its own body and hurl them as projectiles with tremendous force and accuracy, using environmental debris as weapons.

## Special Abilities

### Stone Resilience

The Stonebeast's body is extraordinarily resistant to physical damage. Swords, arrows, and most conventional weapons are nearly useless against it, glancing off its hardened hide. Only sustained magical damage, acid, or particularly heavy impacts can cause lasting harm.

### Earthen Authority

The Stonebeast can command stone within its domain, causing walls to shift, floors to become treacherous, and ceiling to rain down on opponents. This is not rapid—the manipulation takes time and concentration—but the effect is inexorable.

### Regeneration Through Stone

So long as the Stonebeast remains in contact with stone, it slowly regenerates from damage. Only by removing it from its stone environment or by sustained magical damage can it truly be defeated.

## Additional Information

Water is the Stonebeast's primary vulnerability—flowing water erodes its stone body, and prolonged immersion will eventually dissolve it entirely. Acid functions similarly but more slowly. The creature abhors water-based attacks and will retreat from them if possible. Strong magical attacks, particularly those dealing thunder or force damage, can crack its crystalline structure. Fire is only marginally effective. The remains of a slain Stonebeast are essentially building materials—valuable for construction but requiring weeks or months to move and cut into workable pieces. Some fortress-builders have deliberately slain Stonebeasts to harvest their remains for use in construction, though doing so requires bringing enormous quantities of water to the creature's domain and patience measured in months.

## Attributes

- **Endurance:** 17-20 (1d4+16)

- **Dexterity:** 4-7 (1d4+3)

- **Perception:** 10-13 (1d4+9)

- **Aura:** 6-9 (1d4+5)

- **Will:** 14-17 (1d4+13)

- **Reasoning:** 7-12 (1d6+6)

- **Creativity:** 6-9 (1d4+5)
