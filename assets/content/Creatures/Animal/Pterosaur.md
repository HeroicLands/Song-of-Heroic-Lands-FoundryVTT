---
aliases:
    - Pterosaur
tags:
    - animal
name:
    full: Pterosaur
    aliases: []
id: zueyvDAb2JF9wc8p
slug: pterosaur
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 19
        end: 17
        dex: 15
        agl: 16
        per: 15
        aur: 10
        wil: 13
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+15
        end: 1d6+13
        dex: 1d6+11
        agl: 1d6+12
        per: 1d6+11
        aur: 1d4+7
        wil: 1d6+9
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            zones: []
            parts: []
            locations: []
        weight:
            base: 250
            calc: 250
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
          feetPerRound: 100
          leaguesPerWatch: 10
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 2
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The shadow passes overhead before you hear the sound — a high-pitched shriek that seems to come from nowhere and everywhere at once. Leathery wings block out the sun, impossibly vast, their silhouette revealing the strange, elongated frame of the creature. The wind of its passage buffets you, and you catch the reek of old fish and something more primal. Banking with predatory grace, it circles higher, and you see the sharp, tooth-filled snout turned downward, searching. Its cry comes again as it climbs, the sound of something utterly alien to warm-blooded lands.

# Dossier {#dossier}

Pterosaurs are ancient flying reptiles that dominate sky and coastline in isolated regions, boasting wingspans up to thirty feet and bodies deceptively thin despite their mass. These creatures are rarely encountered in heavily settled lands, existing primarily in untamed coastlines, deep valleys, and prehistoric regions where they hunt fish, small mammals, and unwary humanoids. An adventuring party might encounter a pterosaur while navigating coastal cliffs, exploring remote islands, or traversing sky passages between distant lands.

## Presentation

The pterosaur's most striking feature is its vast leathery wings, translucent and veined like parchment stretched over an impossibly complex framework of bone and muscle. The wings are supported by an enormously elongated fourth finger bone, which bears much of the creature's weight. The body beneath is surprisingly lean and compact, covered in scales that range from pale gray to reddish-brown, often patterned to blend with rocky outcrops or water. The head is dominated by a long, pointed snout that extends forward from the skull, filled with sharp, backward-pointing teeth designed to grip struggling fish. Some species display elaborate crests or frills along the skull that may serve both display and rudder functions in flight. The tail, if present, is used for steering and balance in aerial maneuvers.

## Key Behaviors

Pterosaurs are opportunistic predators and scavengers that hunt primarily from the air, rarely descending to ground level unless attracted by carrion or nesting. They are most active during daylight hours and are typically social creatures, establishing loose colonies on high cliffs where thermals provide reliable lift for gliding. These creatures possess prodigious appetites and must consume large quantities of fish, small mammals, or anything else they can capture. Pterosaurs are migratory in cooler regions, following fish runs and hunting seasons. They are intelligent enough to recognize patterns and remember productive hunting grounds.

## Combat Strategy

The pterosaur's dominance lies entirely in the air, where it uses superior maneuverability and speed to dictate combat. It dives at targets with terrifying velocity, attempting to snatch them with claws and lift them skyward, removing them from solid ground and advantage. If a pterosaur is forced to land or combat occurs on the ground, it becomes clumsy and vulnerable, awkwardly attempting to launch itself back into flight or using its snout and claws as clumsy melee weapons. A grounded pterosaur is desperate and dangerous but greatly diminished in fighting power. The creature will always attempt to return to flight when threatened on the ground.

## Attack Methods

### Diving Claw Grab

The pterosaur folds its wings and plummets from height, building tremendous speed, and extends its powerful taloned feet to seize prey. If the grab succeeds, the creature attempts to ascend with the prey clutched in its claws, lifting it away from solid ground. These claws can inflict severe lacerations and impale even armored targets.

### Beak Strike

Using its elongated snout like a spear, the pterosaur jabs with surprising speed and precision at faces, eyes, and exposed flesh. The backward-pointing teeth are designed to grip prey and inflict puncture wounds, though the beak's relative weakness limits damage compared to the claw attack.

### Wing Buffet

In desperation or when grounded, the pterosaur sweeps its massive wings in a wide arc to create distance from threats. This attack can knock opponents off balance and cause impacts from the tough leading edges of the wings themselves.

## Special Abilities

### Aerial Mastery

The pterosaur is superlative in flight, capable of hovering with minimal effort, achieving tremendous velocities in dives, and executing aerial maneuvers that defy gravity. It gains significant advantage in all actions taken while airborne.

### Thermal Gliding

The pterosaur can rise with warm air currents, sustaining flight for extended periods with minimal muscular effort. This allows it to hunt across vast territories and migrate over impossible distances.

### Predatory Vision

The pterosaur's eyes are positioned laterally and forward-facing, providing monocular vision along each side while allowing binocular focus forward — essential for diving predators. It can spot movement from extraordinary distances and tracks small creatures with uncanny accuracy.

### Bone Hollow

The pterosaur's skeleton is hollow and remarkably light, allowing a creature with an enormous wingspan to remain surprisingly maneuverable and light. This contributes to its grace in flight but makes it fragile to heavy impacts when grounded.

### Additional Information

Pterosaurs are most vulnerable when landing, taking off, or grounded by injury or magical effect. If immobilized on the ground for extended periods, they can die of stress or starvation, as they are incapable of efficient terrestrial hunting. Their flying technique becomes labored in high altitudes with thin air, and they are surprisingly slow swimmers despite their aquatic hunting specialization. Young pterosaurs are vulnerable to ground predators and rarely venture far from nesting cliffs until fully fledged.

## Attributes

- **Strength:** 16-21 (1d6+15)

- **Endurance:** 14-19 (1d6+13)

- **Dexterity:** 12-17 (1d6+11)

- **Agility:** 13-18 (1d6+12)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 8-11 (1d4+7)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
