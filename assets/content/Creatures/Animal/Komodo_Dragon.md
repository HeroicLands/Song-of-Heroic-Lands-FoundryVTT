---
aliases:
    - Komodo Dragon
tags:
    - animal
name:
    full: Komodo Dragon
    aliases: []
id: 0TnltkVa8UfgoZ20
slug: komodo-dragon
img: images/komodo-dragon-headshot.webp
portrait: images/komodo-dragon.webp
type: creature
package: thalorna
sohl:
    attributes:
        str: 15
        end: 13
        dex: 11
        agl: 10
        per: 13
        aur: 11
        wil: 12
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+11
        end: 1d6+9
        dex: 1d6+7
        agl: 1d4+7
        per: 1d6+9
        aur: 1d6+7
        wil: 1d6+8
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 20
            calc: 20
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
          factors: []
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

You notice the disturbance in the scrub first—a barely perceptible parting of the underbrush, accompanied by the smell of aged decay and something distinctly reptilian. Then the creature emerges, moving with deceptive slowness that masks coiled power: a massive lizard whose scales catch and scatter the light in dull bronze and gray. Its forked tongue flicks repeatedly, tasting your scent on the wind. When it turns toward you, its eyes are ancient and flat, and the malevolent intelligence behind them is unmistakable. Each claw-strike against stone rings like a death knell.

# Dossier {#dossier}

The Komodo dragon is the largest living lizard, measuring 9 to 10 feet in length and weighing 200-300 pounds. Its body is heavily built and muscular, with coarse scales in shades of gray-brown or bronze-black that darken with age. The body thickens along the back and sides, creating a powerful, tapering silhouette. Its head is proportionally broad, with a wide jaw and small eyes positioned somewhat forward of center, granting good forward vision for ambush hunting.

## Presentation

Komodo dragons display rough, knobbed scales across their entire body, with prominent ridges along the spine and tail. Their coloration provides excellent camouflage in rocky, scrubby environments, and individuals often bear darker mottling or paler patches depending on local soil coloration. The head is broad and flattened, with powerful musculature visible beneath the scales. The mouth is slightly underslung and can open to an impressive width. Claws are sharp and constantly maintained through use. The tail is nearly as long as the body, muscular and whip-like. A musky, acrid odor surrounds them at all times.

## Key Behaviors

Komodo dragons are primarily solitary predators, though they will congregate at carcasses or in regions of high prey abundance. They are ambush hunters par excellence, spending much of their day resting in burrows, beneath rocks, or in dense vegetation, waiting for prey. They hunt during the day and rest at night. A dragon can sense carrion from a considerable distance and will congregate with other dragons to feed on a fresh kill, their social hierarchy determining feeding order. Their venomous saliva, combined with pathogenic bacteria, makes a bite persistently dangerous; prey bitten by a dragon gradually weakens as venom and infection ravage the body, even if the dragon loses the initial encounter.

## Combat Strategy

Komodo dragons employ ambush and patience above all else. A dragon will position itself along known prey trails or near water sources and remain motionless until prey comes within striking range, then execute a devastating bite attack before retreating to let venom and infection do their work. If forced into direct combat with an alert opponent, the dragon will use its tail to create distance and its venom to progressively weaken the enemy. A dragon will abandon a prey animal if it escapes without injury; the dragon reserves energy for more promising hunts.

## Attack Methods

### Venomous Bite

The dragon lunges to clamp its powerful jaws on the target, delivering a bite laden with venom and pathogenic saliva; the bite causes immediate damage and ongoing poison damage that increases in severity as the venom spreads.

### Tail Strike

The dragon lashes its whip-like tail to keep opponents at distance, knock them off balance, or inflict slashing damage; the tail is precise enough to target specific limbs or weapons.

## Special Abilities

### Venomous Saliva

The Komodo dragon's bite injects a complex venom mixed with pathogenic bacteria; victims experience immediate puncture damage and progressive poison damage that persists and worsens without treatment, potentially causing paralysis or death.

### Ambush Master

The Komodo dragon gains substantial bonuses to stealth and to attack rolls when striking from surprise; in terrain of its choice, the dragon is nearly undetectable until it chooses to strike.

## Attributes

- **Strength:** 12-17 (1d6+11)

- **Endurance:** 10-15 (1d6+9)

- **Dexterity:** 8-13 (1d6+7)

- **Agility:** 8-11 (1d4+7)

- **Perception:** 10-15 (1d6+9)

- **Aura:** 8-13 (1d6+7)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
