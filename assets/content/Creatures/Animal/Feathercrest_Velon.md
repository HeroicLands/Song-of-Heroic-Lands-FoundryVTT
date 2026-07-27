---
aliases:
    - Feathercrest Velon
tags:
    - animal
name:
    full: Feathercrest Velon
    aliases: []
id: Or8DbTmkrdKMEqDi
slug: feathercrest-velon
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 11
        end: 13
        dex: 16
        agl: 17
        per: 15
        aur: 10
        wil: 12
        rea: 8
        cre: 7
    attrRollFormula:
        str: 1d6+7
        end: 1d6+9
        dex: 1d6+12
        agl: 1d6+13
        per: 1d6+11
        aur: 1d4+7
        wil: 1d6+8
        rea: 1d4+5
        cre: 1d4+4
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 50
            calc: 50
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
          feetPerRound: 80
          leaguesPerWatch: 8
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

A sound cuts through the air—a layered chirping that makes your teeth ache and sets your nerves jangling. Something bright moves at the edge of vision, moving in stuttering, wrong-footed patterns that your eyes cannot quite track. As it turns toward you, a crown of feathers explodes outward from its head in a fan of colors so vivid they seem to burn—iridescent greens and violets that shimmer with an unnatural quality. The creature freezes, head tilted at an angle no neck should allow, watching you with eyes that hold far too much knowing. Then it shrieks again, and the sound echoes strangely—from everywhere and nowhere at once.

# Dossier {#dossier}

The Feathercrest Velon is a predatory creature roughly four feet tall, resembling a cross between a bird and something far stranger. It is covered in sleek, iridescent plumage that shifts from blue to green to violet depending on the angle of light. These creatures are dangerous pack hunters found in dense forests and rocky highlands, and they are known for territorial aggression and a hunting strategy that relies on coordinated ambush and psychological disruption. Adventurers most often encounter velons when they penetrate the creature's territory or stumble upon a pack's hunting ground.

## Presentation

A velon stands upright on powerful hind legs, with a lean, muscular build that speaks to explosive speed and agility. Its forelimbs are shorter but end in vicious talons as long as a human finger. The plumage is dense and fine, creating a sleek profile that emphasizes the bird-like silhouette. The most distinctive feature is the crest—a fan of elongated feathers that normally lie flat against the skull but can flare outward in a display that doubles the creature's apparent width. The eyes are large and forward-facing, colored in deep amber or crimson, with an unsettling quality of intelligence behind them. The beak is hard and wicked, and the entire creature exudes an air of predatory competence.

## Key Behaviors

Velons are social hunters that operate in small groups or larger packs, with clear hierarchical relationships within each group. They are diurnal and most active in the dappled light of forest edges and rocky terrain where their coloration provides camouflage. A hunting pack communicates through a series of high-pitched vocalizations that are often described as beautiful and menacing in equal measure. Velons are territorial and will vigorously defend a hunting ground, often marking boundaries with the plucked feathers and fur of their kills—a warning that drives most sensible travelers away. They hunt smaller animals primarily, but a hungry pack will pursue humanoid prey with cold determination.

## Combat Strategy

A velon pack hunts with coordinated tactics—one or more creatures make spectacular, noisy attacks from the front while others circle to flank or attack from above if terrain permits. They are masters of the feint, charging and withdrawing to cause confusion and exhaustion. A solitary velon is far more cautious and will attack only if cornered or if prey is clearly manageable. In groups, velons press attacks relentlessly, aiming for weak points (eyes, throat, groin, legs) and attempting to separate a target from allies. They will abandon an attack only if suffering grievous casualties or if the primary target makes escape impossible—velons are pragmatic predators that have no interest in dying for a meal.

## Attack Methods

### Talon Slash

The velon executes rapid, hooking strikes with the talons on its forelimbs, moving with explosive speed to rake multiple times in a short span. These attacks are aimed at disabling—severing tendons, opening blood vessels, or causing shock through sheer trauma. A velon in a feeding frenzy will slash without pause until prey stops moving.

### Beak Stab

A precise, driving attack targeted at soft tissue—the beak is used to pierce eyes, puncture throats, or drive into any exposed skin. Unlike the talon strikes, the beak attacks are methodical and deliberate, delivered with the full bodyweight of the creature behind them.

## Special Abilities

### Hypnotic Chirps

A velon's vocalizations are produced through a specialized throat structure and carry a strange harmonic quality that is deeply disorienting to humanoids and most other creatures. A creature hearing the chirps must maintain concentration or become confused—unable to determine direction of sound, losing track of allies, or failing to notice obvious threats. Creatures that cannot hear are immune to this ability.

### Dazzling Display

When the velon flares its crest and combines this with rapid body movements and flashing color changes, it creates a visual disturbance that temporarily blinds or disorients observers. A creature caught in direct line of sight of this display must shield its eyes or suffer impaired vision and poor depth perception for several rounds.

## Additional Information

Velon packs are territorial and unlikely to abandon hunting grounds unless driven out by far superior force. Characters in velon territory should expect continued predation and harassment until they leave. A dead velon's magnificent crest is prized for ceremonial headdresses or trophies, though removing it requires careful work. Some experienced hunters have successfully captured young velons and trained them as hunting companions, though they retain a wild nature and unpredictable temperament.

## Attributes

- **Strength:** 8-13 (1d6+7)

- **Endurance:** 10-15 (1d6+9)

- **Dexterity:** 13-18 (1d6+12)

- **Agility:** 14-19 (1d6+13)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 8-11 (1d4+7)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 5-8 (1d4+4)
