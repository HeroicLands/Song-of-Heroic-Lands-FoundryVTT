---
aliases:
    - Dune Strider
tags:
    - animal
name:
    full: Dune Strider
    aliases: []
id: Zcy2f4j1wqiR6G6Q
slug: dune-strider
img: images/dune-strider-headshot.webp
portrait: images/dune-strider.webp
type: creature
package: thalorna
sohl:
    attributes:
        str: 13
        end: 14
        dex: 13
        agl: 17
        per: 15
        aur: 9
        wil: 11
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+9
        end: 1d6+10
        dex: 1d6+9
        agl: 1d6+13
        per: 1d6+11
        aur: 1d4+6
        wil: 1d6+7
        rea: 1d4+4
        cre: 1d4+3
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
          feetPerRound: 70
          leaguesPerWatch: 6
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

The creature is impossibly tall, standing a full head and shoulders above human height on legs like living stilts. Tan and cream plumage ripples in the desert wind, providing camouflage so perfect that distance makes the creature seem to materialize from sand itself. The head is proportionally tiny, crowned with a wicked curve of beak, but the eyes are alert, intelligent, and constantly scanning. When it moves, the motion is economical and graceful: each step covers ground with remarkable efficiency, the powerful legs driving the body forward in bursts of speed. When it runs, dust rises in billowing clouds that obscure all vision, a golden veil between predator and prey.

# Dossier {#dossier}

The Dune Strider is an enormous, flightless bird found in hot deserts. Standing eight to ten feet tall and weighing one hundred fifty to three hundred pounds, these creatures are remarkably adapted to desert life. They are herbivorous/omnivorous foragers, eating desert plants, insects, and seeds. They are social animals, typically moving in small herds of four to six individuals. While not aggressive by nature, they are capable of defending themselves with powerful kicks capable of breaking bones and killing predators. They are famous for their speed—capable of sustained running across open desert at speeds approaching thirty miles per hour. A mounted rider on a trained Dune Strider can cross desert terrain faster than nearly any other land mount. Adventurers encounter these creatures while traveling desert regions, sometimes attempting to capture young birds for mount training.

## Presentation

An enormous flightless bird with extremely long, powerful legs and a small head disproportionate to body size. The plumage is tan and cream, providing excellent desert camouflage. The beak is relatively small but sharp and capable. The feet are wide and clawed, adapted for sandy terrain. The body is streamlined, suggesting speed. The tail is long and used for balance during rapid running.

## Key Behaviors

Dune Striders are social and herbivorous, foraging in small herds. They are wary and quick to flee from perceived threats. They are capable of sustained running and can travel vast desert distances. They breed seasonally, with males displaying elaborate dances.

## Combat Strategy

Dune Striders flee from threats but will kick defensively when cornered. A herd may stampede if threatened.

## Attack Methods

### Powerful Leg Kick

The Dune Strider delivers powerful kicks with legs like living clubs, capable of breaking bones and knocking targets backward.

### Beak Peck

The beak can inflict minor injuries on small threats.

## Special Abilities

### Desert Speed and Endurance

Dune Striders can run at high speeds across desert terrain for extended periods. Their endurance at running speeds is legendary.

### Dust-raising Camouflage

When running at speed, the Dune Strider kicks up clouds of dust that obscure vision and create a defensive screen.

## Attributes

- **Strength:** 10-15 (1d6+9)
- **Endurance:** 11-16 (1d6+10)
- **Dexterity:** 10-15 (1d6+9)
- **Agility:** 14-19 (1d6+13)
- **Perception:** 12-17 (1d6+11)
- **Aura:** 7-10 (1d4+6)
- **Will:** 8-13 (1d6+7)
- **Reasoning:** 5-8 (1d4+4)
- **Creativity:** 4-7 (1d4+3)

#### Unmatched Speed

Can outrun most predators in short bursts.

## Attributes

- **Strength:** 10-15 (1d6+9)

- **Endurance:** 11-16 (1d6+10)

- **Dexterity:** 10-15 (1d6+9)

- **Agility:** 14-19 (1d6+13)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 7-10 (1d4+6)

- **Will:** 8-13 (1d6+7)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
