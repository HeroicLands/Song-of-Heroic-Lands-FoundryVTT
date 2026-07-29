---
aliases:
    - Rockscale Anklyte
tags:
    - animal
name:
    full: Rockscale Anklyte
    aliases: []
id: UWITLnj5XOBDX43o
slug: rockscale-anklyte
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 17
        end: 16
        dex: 11
        agl: 10
        per: 13
        aur: 9
        wil: 14
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+13
        end: 1d6+12
        dex: 1d6+7
        agl: 1d4+7
        per: 1d6+9
        aur: 1d4+6
        wil: 1d6+10
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            zones: []
            parts: []
            locations: []
        weight:
            base: 800
            calc: 800
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

The ground beneath your feet sends a warning first — a deep, subsonic vibration that you feel more than hear, resonating in your chest and bones. The creature rises slowly from the terrain it was indistinguishable from moments before, its rough, stone-like scales shedding dust and gravel as it shifts its massive weight. The eyes open — a dim, faintly luminescent red that seems to glow from within the skull — and fix upon you with an unsettling awareness. The air itself seems to thicken as the creature's presence expands, and you catch the acrid smell of something sulfurous and mineral, ancient and wrong. A low growl emerges, and the ground trembles in response.

# Dossier {#dossier}

The Rockscale Anklyte is a massive quadrupedal herbivore reaching 10-12 feet in length and weighing over 800 pounds, found in rocky badlands, high plateaus, and mountain foothills where sparse vegetation provides sustenance. Despite their herbivorous nature, anklytes are dangerous territorial defenders that will attack threats with overwhelming force. Adventurers might encounter them while traveling through badlands, claiming resources from anklyte territory, or navigating plateau regions where the creatures establish grazing grounds.

## Presentation

The Rockscale Anklyte presents a squat, powerful form covered entirely in rough, stone-like scales that blend so effectively with rocky terrain that the creature becomes nearly invisible when still. The scales are various shades of gray and brown with occasional lighter striations that mimic natural rock patterning. The head is small relative to body size, with a narrow snout suitable for browsing vegetation and small, forward-facing eyes that glow with a faint red luminescence. The eyes appear almost intelligent despite their beady appearance, suggesting an awareness that belies the creature's herbivorous nature. The body is barrel-shaped and massive, supported by four sturdy legs that allow surprisingly quick movement despite the weight. The tail is the most distinctive feature — thick at the base and tapering to a heavy, clubbed end that appears capable of serious impact. The body is marked by faint ridges and protrusions that run along the spine and flanks, enhancing both the armored appearance and actual protective capability.

## Key Behaviors

Anklytes are herbivorous but intensely territorial, maintaining exclusive grazing grounds against all intruders including other anklytes. They are highly social within established herds but those herds are small (typically 3-8 individuals) and each herd maintains fierce territorial boundaries. The creatures produce low-frequency vocalizations that travel through the ground and across substantial distances, creating communication networks between herd members and warning calls to approach anklytes. When threatened, anklytes escalate through warning displays before actual combat, giving intruders opportunity to retreat. However, once the decision to defend is made, anklytes commit completely to the defense and will continue until the threat is gone or the anklyte is dead. They are most active during dawn and dusk, resting during the heat of day.

## Combat Strategy

The anklyte's combat strategy is direct and effective — the creature charges at threats with surprising speed for its mass, attempting to ram and knock opponents off their feet. Once an opponent is down or vulnerable, the anklyte uses its tail as a primary weapon, swinging the heavy club in wide arcs designed to crush and incapacitate. The creature uses terrain to advantage, charging downhill to increase impact and positioning itself to prevent escape. An enraged anklyte becomes almost uncontrollable, attacking with relentless force until the threat is neutralized or the anklyte itself is critically injured.

## Attack Methods

### Tail Club Strike

The anklyte swings its massive clubbed tail in a wide arc, generating tremendous striking force capable of crushing bone and armor. A successful hit launches opponents backward and can knock even armored combatants off their feet.

### Charging Ram

The anklyte lowers its head slightly and charges forward, using its barrel-shaped body as a battering ram. The impact has sufficient force to knock opponents off balance or directly off their feet, creating openings for follow-up attacks.

### Rear Leg Kick

Using its hind legs, the anklyte delivers backward kicks that carry surprising force and precision. These kicks are effective against opponents approaching from behind or attempting to grapple.

### Crushing Stomp

If an opponent is on the ground, the anklyte may attempt to simply step on them, using the creature's considerable weight to crush and injure.

## Special Abilities

### Stone Armor

The rough, dense scales that cover the anklyte's body provide genuine protection equivalent to scale armor, reducing damage from slashing and piercing attacks. The armor is part of the creature's living tissue and regenerates if damaged.

### Ground Tremor

When the anklyte strikes the ground with its tail or charges with full force, it creates small but detectable tremors in the earth. These tremors are disorienting and can knock loose objects over or disturb balance in standing creatures.

### Territorial Aggression

The anklyte becomes significantly more dangerous when defending its established territory, gaining bonuses to all attack rolls and damage within its grazing grounds. Outside of territory, the anklyte is less aggressive and more likely to avoid conflict.

### Low-Frequency Communication

The anklyte can produce low-frequency vocalizations that travel through ground and air over substantial distances, allowing communication with other anklytes and coordination of herd responses to threats. These vocalizations can create discomfort and disorientation in humanoid listeners.

### Sulfurous Exhalation

When threatened, the anklyte exhales a foul-smelling, sulfurous breath that causes discomfort and nausea in nearby creatures. While not toxic, the smell is intensely unpleasant and can cause distraction and disorientation.

### Additional Information

Anklytes are herbivorous and can be deterred from conflict by abandoning disputed territory or moving away from established grazing grounds. A herd of anklytes presents a significantly greater threat than a solitary individual, as they coordinate defense and support each other. Anklyte herds can be avoided by careful route planning around their established territories. The creatures' stone-like scales can be harvested after death by expert craftspeople and used to create armor or defensive architecture, making anklyte remains valuable.

## Attributes

- **Strength:** 14-19 (1d6+13)

- **Endurance:** 13-18 (1d6+12)

- **Dexterity:** 8-13 (1d6+7)

- **Agility:** 8-11 (1d4+7)

- **Perception:** 10-15 (1d6+9)

- **Aura:** 7-10 (1d4+6)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
