---
aliases:
    - Earthreaver
tags:
    - dreadspawn
name:
    full: Earthreaver
    aliases: []
id: sSoExpz4Qk9l3k5m
slug: earthreaver
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 20
        end: 18
        dex: 14
        agl: 16
        per: 16
        aur: 8
        wil: 16
        rea: 10
        cre: 10
    attrRollFormula:
        str: 1d6+16
        end: 1d6+14
        dex: 1d6+10
        agl: 1d4+13
        per: 1d4+13
        aur: 1d6+4
        wil: 1d4+13
        rea: 1d6+6
        cre: 1d6+6
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
          feetPerRound: 70
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The ground writhes. Soil ripples like water, and then the thing erupts—segmented, armored, impossibly long. Its body is a chain of chitinous plates that glisten with slime and crushed earth. Too many legs move in synchronized horror, carrying it forward at speeds that shouldn't be possible for something so massive. Its mandibles open, dripping venom that hisses where it touches stone. The stench of turned soil and something acidic fills your nostrils.

# Dossier {#dossier}

Earthreavers are apex predators of underground ecosystems, venomous hunters that rule through speed and toxin rather than raw strength. These creatures reshape terrain through their burrowing, creating vast networks of passages that form their hunting grounds. Adventurers encounter them in deep cavern systems, in mountain passages, and in places where mining operations have disturbed soil the creatures claim as home.

## Presentation

The Earthreaver is a massive worm-like arthropod, roughly thirty feet in length, its body composed of overlapping segments of dark brown and black chitin. Each segment is independently armored and supported by multiple jointed legs—six pairs, allowing coordinated, wave-like movement that provides both horizontal and vertical mobility. The creature's head is dominated by powerful mandibles capable of slicing through stone; these mandibles drip with iridescent venom. Its anterior segments bear sensory tentacles used for detecting prey. The creature's skin is constantly moist with secretions that aid in burrowing; this slime is itself acidic and caustic. Movement is accompanied by the wet sounds of burrow creation and the scrape of chitin sliding through stone.

## Key Behaviors

The Earthreaver is an active, aggressive hunter that creates vast burrow networks beneath its claimed territory. Unlike many burrowing creatures, it hunts actively and frequently, emerging randomly throughout its territory to attack anything moving within its domain. It demonstrates sophisticated hunting intelligence—understanding prey behavior, setting ambushes in frequented passages, even herding prey toward specific kill zones. It does not share territory peacefully; if another Earthreaver enters its domain, violence is inevitable. When satisfied with feeding, it becomes less active but still vigilant. It exhibits no social behavior and shows no evidence of mating rituals or family groups.

## Combat Strategy

The Earthreaver favors ambush from below or within burrow passages where its mobility advantage is greatest. It erupts from beneath soil with tremendous speed, attempting to wound severely with mandible strikes before withdrawing. If prey is wounded and weakened by venom, it stalks patiently. If prey proves resilient, it employs repeated hit-and-run tactics from burrow passages, never remaining exposed for long. It uses terrain knowledge to break contact and regenerate between engagements. Against prey that prevents burrowing access, it fights more directly but still maintains mobility.

## Attack Methods

### Venomous Bite

The Earthreaver's mandibles snap forward with tremendous speed, attempting to seize and crush prey. More critically, the attack injects potent venom that causes progressive paralysis and muscle weakness. Multiple bites from the same creature stack venom effects.

### Burrow Eruption

The creature emerges explosively from beneath soil or debris, using the sudden movement as a weapon as much as an attack pose. Targets struck by this eruption are knocked prone; the creature gains advantage on its first attack when emerging this way.

### Acid Slime

The caustic secretions covering the creature damage exposed flesh and corrode armor. Prolonged contact causes deterioration of equipment; the creature can deliberately coat targets or burrow passages with this slime to create hostile terrain.

## Special Abilities

### Burrowing Mastery

The Earthreaver moves through earth, sand, and stone as easily as other creatures move through air. It burrows at substantial speed and can create passages large enough for its body to pass through. These passages can be used by the creature for ambush, escape, or territory expansion.

### Venom Potency

The creature's venom is progressive and cumulative. Each injection causes increasing paralysis; targets affected by multiple injections suffer severe movement impairment and potential complete immobilization.

### Segmented Resilience

The creature's multi-segmented body allows it to function even when partially damaged. Damage to individual segments does not significantly hamper overall function; the creature requires total systemic damage to be truly incapacitated.

### Vibration Sensing

The Earthreaver perceives its environment through vibrations in earth and stone, detecting anything moving across or through its territory. It can sense prey at considerable distances through the ground.

## Additional Information

Fire-based attacks are particularly effective against the Earthreaver, as heat damages its moist exoskeleton and can cause severe pain. Extreme cold similarly cracks and weakens its chitinous armor. Water in burrow passages can flood its tunnels and drive it to surface, though the creature is capable of traveling through water for limited periods. Earthreavers have been observed farming territories—maintaining specific burrow systems and allowing certain prey species to populate them before systematic hunting.

## Attributes

- **Strength:** 17-22 (1d6+16)

- **Endurance:** 15-20 (1d6+14)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 14-17 (1d4+13)

- **Perception:** 14-17 (1d4+13)

- **Aura:** 5-10 (1d6+4)

- **Will:** 14-17 (1d4+13)

- **Reasoning:** 7-12 (1d6+6)

- **Creativity:** 7-12 (1d6+6)
