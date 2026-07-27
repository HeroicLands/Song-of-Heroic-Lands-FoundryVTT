---
aliases:
    - Hyena
tags:
    - animal
name:
    full: Hyena
    aliases: []
id: qWLJoGsN56qVG65C
slug: hyena
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 15
        end: 16
        dex: 13
        agl: 14
        per: 15
        aur: 11
        wil: 14
        rea: 9
        cre: 7
    attrRollFormula:
        str: 1d6+11
        end: 1d6+12
        dex: 1d6+9
        agl: 1d6+10
        per: 1d6+11
        aur: 1d6+7
        wil: 1d6+10
        rea: 1d4+6
        cre: 1d4+4
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 80
            calc: 80
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
                key: mixed_forest
                mode: add
                textValue: "-1"
              - scope: surface_cover
                key: needleleaf_forest
                mode: add
                textValue: "0"
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

Movement catches your eye on the savanna—a wiry, muscular shape with a distinctive sloping back, built higher at the shoulders than the rear. The creature's mottled coat of brown and black makes it almost invisible against the grassland, and its proportions seem somehow wrong, disturbingly asymmetrical. Then it laughs—a cackling, whooping sound that rises and falls like the wail of something unhinged. The laugh chills your blood. Its eyes are old and cruel, glinting with an intelligence born from hunger and cunning.

# Dossier {#dossier}

Hyenas are medium-sized carnivores, muscular and built for endurance rather than speed. They stand 30 inches tall at the shoulder and weigh 90-160 pounds depending on subspecies. The spotted hyena, most common and largest of the types, has a mottled coat of brown, tan, and black patches, though no two individuals bear identical markings. The distinctive sloped back—higher at shoulders, lower at hips—is characteristic and immediately recognizable. Their powerful build is concentrated in the neck, shoulders, and forelimbs.

## Presentation

Hyenas have massive heads with powerful jaws and prominent teeth that often protrude slightly even when the mouth is closed. Their ears are rounded and alert, positioned on top of the head. Their eyes are small and dark but miss nothing. The fur is coarse and bristling, longer along the neck and spine. Their tail is relatively short and held low. Their musk is distinctive and pungent—the smell of carrion and predation. When they vocalize, they produce a remarkable range of sounds: whooping laughs, growls, cackles, and high-pitched squeals that carry for miles.

## Key Behaviors

Hyenas are intensely social, living in clan groups dominated by a matriarch with strict hierarchical ranking among all members, even between males. Clan members mark and defend a territory that may encompass 10 or more square miles. They are scavengers and active hunters in equal measure, following large predators to steal kills or hunting cooperatively to bring down prey themselves. Their digestive systems are powerful enough to break down and process bone, fur, and hide—material that no other large predator can stomach. They are not the mindless scavengers of popular myth; they are intelligent, strategic hunters that plan and communicate complex tactics.

## Combat Strategy

Hyenas prefer to hunt and fight in packs, using numerical advantage and coordinated tactics to overwhelm prey. They harass opponents relentlessly, striking from multiple angles and withdrawing to strike again. A lone hyena separated from its clan will attempt to flee unless defending a kill or territory. In clan groups, a lone opponent faces a coordinated assault from multiple angles simultaneously, with each hyena working to distract or injure while others attempt to move into devastating positions.

## Attack Methods

### Bone-Crushing Bite

The hyena's jaws are among the most powerful in the animal world; a bite can crush bone, shatter shields, dent armor, and inflict catastrophic wound damage. The bite is typically delivered to the legs or arms to immobilize before moving in for a killing strike to the throat or belly.

### Pack Harassment

Multiple hyenas attack simultaneously from different angles, forcing opponents to split attention; one hyena may feign an attack to distract while others circle to flank or target from behind.

## Special Abilities

### Bone-Crushing Bite

The hyena's bite force is legendary, capable of breaking bone, shattering weapons, and penetrating most armor; a target bitten by a hyena suffers ongoing damage from the deep puncture wounds and potential infection.

### Pack Tactics

Hyenas gain substantial combat bonuses when fighting alongside clan members, and they can execute complex coordinated attacks based on the hierarchy and experience of the pack.

## Attributes

- **Strength:** 12-17 (1d6+11)

- **Endurance:** 13-18 (1d6+12)

- **Dexterity:** 10-15 (1d6+9)

- **Agility:** 11-16 (1d6+10)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 8-13 (1d6+7)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 5-8 (1d4+4)
