---
aliases:
    - Summitdrake
tags:
    - dreadspawn
name:
    full: Summitdrake
    aliases: []
id: 62rxlW5qEp6TdPF0
slug: summitdrake
img: images/summitdrake-headshot.webp
portrait: images/summitdrake.webp
type: creature
package: thalorna
sohl:
    attributes:
        str: 22
        end: 22
        dex: 12
        agl: 16
        per: 18
        aur: 12
        wil: 18
        rea: 14
        cre: 12
    attrRollFormula:
        str: 1d6+18
        end: 1d6+18
        dex: 1d4+9
        agl: 1d4+13
        per: 1d6+14
        aur: 1d4+9
        wil: 1d6+14
        rea: 1d6+10
        cre: 1d4+9
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 1500
            calc: 1500
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 60
          leaguesPerWatch: 4
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
        - medium: aerial
          feetPerRound: 110
          leaguesPerWatch: 12
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The mountain itself seems to breathe as the creature rises from the stone—a drake of impossible size, easily forty feet from snout to tail, its scales the color of weathered granite and veined with dark streaks like the geology of the mountain made flesh. Its claws are hooks designed for climbing vertical faces, each one the length of a hand, and its teeth are like daggers of polished bone. The air around it shimmers with the heat of its breath, and you see patches of stone around its mouth melted and fused by whatever fire burns inside it. Its eyes are furnace-bright, intelligent and utterly devoid of mercy, and they fasten on you with the certainty of a predator that knows its prey cannot possibly escape. The sound it makes is a low, rumbling growl that is felt more than heard—a vibration that runs through stone and bone alike.

# Dossier {#dossier}

Summitdrakes are the undisputed tyrants of high mountain peaks and rocky highlands, creatures of terrible power that have claimed their territories and held them against all comers for centuries or longer. A Summitdrake is not merely predatory but actively territorial and aggressive toward anything that might challenge its dominion. These creatures are found exclusively in harsh, high-altitude regions where weather is deadly, terrain is unforgiving, and prey is sparse but nutritious. An adult Summitdrake has no natural predators and will defend its mountain with the ferocity of a creature that has never known defeat or the possibility of retreat.

## Presentation

A Summitdrake measures roughly 15 to 25 feet in length from snout to tail, with a considerable body mass and strength. Its hide is covered in overlapping scales of gray, brown, or rust color, arranged in patterns that echo the geological formations of its mountain home. The scales are tough enough to deflect arrows and blunt most blade strikes, and they are often scarred from territorial combat with other Summitdrakes or from weathering ages of harsh mountain conditions. Its four limbs are thick and powerful, ending in claws of terrible sharpness, and its tail is a weapon in itself—heavy, scaled, and capable of crushing with club-like force. Its head is wedge-shaped and filled with teeth of daggerlike dimensions, and its mouth glows faintly with the heat of whatever furnace burns within. Its eyes are large, intelligent, and burn with predatory calculation. The temperature rises noticeably near a Summitdrake, and the smell is of sulfur, heated stone, and ancient hunger.

## Key Behaviors

A Summitdrake is a solitary, fiercely territorial creature that claims a mountain or a range of peaks and defends it relentlessly. It maintains regular patrol routes around its territory, and anything large enough to be considered competition is attacked on sight. Smaller creatures are generally ignored unless they blunder directly into the creature's presence. A Summitdrake hunts regularly, pursuing mountain goats, wild aurochs, or occasionally large humanoid prey if they venture high enough into its territory. It has a nest or lair in some high, inaccessible place, and a gravid female becomes doubly aggressive, attacking anything that approaches her nesting site. An ancient Summitdrake may have held the same territory for centuries, and mountains with such creatures come to be known throughout the region as places of danger to be carefully avoided.

## Combat Strategy

A Summitdrake initiates combat by using the terrain to its advantage, attacking from high ground and using its superior climbing ability to maintain positional advantage. It uses its massive strength to overcome opponents through sheer force, relying on crushing bites, raking claws, and tail sweeps to devastate anything in its path. The creature is intelligent enough to recognize tactics and adjust accordingly, but it rarely needs to—its raw power is so overwhelming that subtlety is often unnecessary. A wounded Summitdrake becomes more aggressive, not less, its territorial instincts overriding any self-preservation. Only if facing truly overwhelming opposition will a Summitdrake consider retreat, and even then it will fight until it has reached its lair.

## Attack Methods

### Crushing Bite

The Summitdrake's jaws snap closed with bone-breaking force, capable of crushing armor and bone alike. A successful bite can sever limbs or kill in a single strike.

### Raking Claws

The creature's fore limbs strike with devastating power, each claw capable of piercing through armor and creating terrible wounds. Multiple strikes can be delivered in rapid succession.

### Tail Sweep

The creature's massive tail swings in wide arcs, capable of knocking prone multiple opponents or crushing a single target with world-ending force.

## Special Abilities

### Mountain Mastery

The Summitdrake moves through mountainous terrain with perfect ease, climbing vertical faces as readily as a spider moves across a wall. In rocky terrain, its movement speed increases, and it gains advantage on all checks related to traversing difficult ground.

### Thermal Resilience

The Summitdrake is naturally resistant to extreme cold, thriving in high-altitude environments that would kill lesser creatures. It is comfortable in extremes that would freeze humans solid.

### Predatory Intellect

The Summitdrake demonstrates intelligence comparable to that of humanoid races, capable of planning, remembering, and adapting its tactics. It recognizes weapons, armor, and tactical formations and will adjust its behavior accordingly.

### Regeneration in Natural Habitat

While in mountainous terrain where it is most comfortable, the Summitdrake regenerates slowly from wounds. Removal to other environments or sustained magical damage can overcome this regeneration.

## Additional Information

The Summitdrake is vulnerable to cold-based magic, which seems to disrupt its internal heat and slow its movements. Water and ice can also affect it, though it resists ordinary cold. Fire and heat-based attacks are largely ineffective. The creature's scales, if harvested after death, can be crafted into armor of legendary quality and durability. Its teeth can be fashioned into weapons that retain the creature's natural sharpness and durability. The bones are extraordinarily dense and valuable for tool-making or weaponcraft. A Summitdrake's corpse is such valuable resource that expeditions have been mounted specifically to claim one, though most such expeditions end in failure or death. The few communities successful in slaying a Summitdrake often base their entire regional economy on the sale and processing of its remains for decades.

## Attributes

- **Strength:** 19-24 (1d6+18)

- **Endurance:** 19-24 (1d6+18)

- **Dexterity:** 10-13 (1d4+9)

- **Agility:** 14-17 (1d4+13)

- **Perception:** 15-20 (1d6+14)

- **Aura:** 10-13 (1d4+9)

- **Will:** 15-20 (1d6+14)

- **Reasoning:** 11-16 (1d6+10)

- **Creativity:** 10-13 (1d4+9)
