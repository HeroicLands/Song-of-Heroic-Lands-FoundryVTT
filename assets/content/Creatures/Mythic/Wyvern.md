---
aliases:
    - Wyvern
tags:
    - mythic
    - image-needed
name:
    full: Wyvern
    aliases: []
id: f7qow0t2vLn2UWpk
slug: wyvern
img: icons/game-icons/lorc/wyvern.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 19
        end: 17
        dex: 13
        agl: 14
        per: 15
        aur: 12
        wil: 14
        rea: 8
        cre: 7
    attrRollFormula:
        str: 1d6+15
        end: 1d6+13
        dex: 1d6+9
        agl: 1d6+10
        per: 1d6+11
        aur: 1d6+8
        wil: 1d6+10
        rea: 1d4+5
        cre: 1d4+4
    body:
        structure:
            zones: []
            parts: []
            locations: []
        weight:
            base: 1500
            calc: 1500
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: aerial
          feetPerRound: 130
          leaguesPerWatch: 12
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The cliff face erupts. What you took for stone or shadow suddenly transforms as wings unfold—massive, bat-like membranes stretched between foreleg and hind leg—and the creature launches into open air with impossible grace for something so heavy. The body is obscene: a serpent's trunk scaled in sickly yellows and browns, perhaps seven feet long, ending in a barbed tail that curves like a scorpion's sting. The wings, when fully extended, span twenty feet or more, thin-membraned but clearly powerful enough to support the bulk of several hundred pounds. The head is purely reptilian, a predator's wedge of bone and muscle with teeth that seem designed for tearing, eyes like molten gold burning with the intelligence of a hunting animal. Smoke—actual smoke—seeps from the nostrils. The creature circles with no apparent haste, regarding you with the casual interest a hunter shows prey already marked for death. Then the tail twitches, and you see the barb at its tip glistening with some viscous substance that catches the light. The air itself smells of sulfur and copper and something organic-wrong. The wyvern makes a sound—not a roar, but a steady rumbling hiss that vibrates through your bones and carries a promise of fire and fang and venom. It begins to dive.

# Dossier {#dossier}

The wyvern is a true monster of the upper air—a two-legged dragon-like creature of considerable size and lethality. Weighing five hundred to eight hundred pounds, with a wingspan of eighteen to twenty-four feet, the wyvern is encountered in mountainous regions, high plateaus, and isolated peaks where thermals allow sustained flight. Unlike true dragons—creatures of mythic intelligence and breath weapons—the wyvern is fundamentally a beast: intelligent enough to be dangerous and strategic in its hunting, but driven primarily by predatory instinct rather than complex motivation. Wyverns are territorial, solitary hunters that defend vast vertical territories spanning multiple peaks and valleys. They are not intelligent enough to establish hoards, but they will gather valuables for nest building and decoration. They are long-lived, sometimes exceeding a century, and they breed rarely—perhaps once per decade—making their young exceptionally precious and jealously guarded. Adventurers encounter wyverns most commonly when crossing mountain passes, climbing to high altitude, or approaching ancient cliff-top ruins where wyverns often nest. A wyvern in its territory is one of the most dangerous encounters possible.

## Presentation

The wyvern is a compact, efficient killing machine: a serpentine body six to eight feet in length, covered entirely in scales of yellowed amber, sickly green, or muddy brown, often with darker bands or spots. The scales are thick and overlapping, providing natural armor. The head is purely reptilian and disproportionately large, with a wedge-shaped skull, powerful jaw muscles, and forward-facing eyes that speak of binocular hunting vision. The teeth are conical, sharp, and designed for piercing and tearing flesh. Two stout hind legs support the forward portion of the body, ending in claws each as long as a finger. The creature's wings extend from modified forelimbs—what might be arms on a true dragon have become skeletal structures supporting vast membranes of leathery skin in dusky colors shot through with blood vessels that glow faintly when extended. The tail is the creature's third weapon: long, muscular, and terminating in a venomous barb as long as a dagger, dripping constantly with neurotoxin so potent that small animals exposed to its miasma collapse within moments. The overall impression is of something evolved purely for predatory efficiency: every element serves the hunt.

## Key Behaviors

Wyverns are solitary territorial hunters that defend aerial space spanning dozens of miles. They establish roosts on cliff faces, in high caves, or within ancient structures, preferring locations with good thermal updrafts that minimize flight expenditure. They are diurnal, hunting primarily during daylight when thermals are strongest and visibility maximum. They hunt by ascending to great altitude using thermals, then diving at speeds exceeding eighty miles per hour to strike prey that has no warning. They prefer large flying prey—eagles, griffins, other wyverns from rival territories—but will take ground-based prey if opportunity presents. They are known to hunt in a pattern: driving prey to preferred killing grounds, then striking. They consume enormous quantities of meat in single meals, then may not hunt again for weeks. They are long-lived, with individuals living past one hundred years, and they show clear evidence of learning: a wyvern remembers hunters who have previously attacked it, remembers locations of prey concentrations, and develops personal variations in hunting technique.

## Combat Strategy

A wyvern's hunting methodology is based on exploiting three-dimensional superiority: it maintains altitude advantage, strikes from above and behind where defenses are weakest, and retreats to the sky if pressed. Against ground-based opponents, the wyvern conducts multiple diving passes, each strike designed to wound without fully committing. Against airborne opponents of comparable size, the wyvern uses superior maneuverability and the lethal barb to maintain distance while dealing damage. A wyvern will attempt to force prey into terrain that minimizes escape options—toward cliff edges, into narrow valleys, toward obstacles that limit movement. Once an opponent is wounded by the venomous barb, the wyvern becomes more aggressive, following the prey relentlessly as toxins degrade its ability to resist. A truly desperate wyvern—one defending nest with young, or one that is desperate from starvation—will sacrifice its flight advantage to close to melee distance, using teeth and claws and tail with reckless abandon.

## Attack Methods

### Venomous Tail Strike

The wyvern whips its tail with blinding speed, attempting to drive the barb home and inject its deadly venom. The neurotoxin causes paralysis, weakness, and eventually death in exposed creatures. Even survival of the injection leaves lingering weakness and vulnerability.

### Diving Claw Rake

The wyvern dives from above, extending its hind claws to rake across targets as it passes. The speed of the pass adds tremendous force, and the strike is designed to open major wounds.

### Snapping Bite

At close range, the wyvern uses its powerful jaws to bite, aiming for exposed flesh, breaking bones, and potentially severing limbs in single strikes.

### Aerial Grapple

Against airborne opponents of comparable size, the wyvern uses its hind claws and body to grapple, attempting to force opponents into positions where the tail can strike home.

## Special Abilities

### Aerial Mastery

The wyvern is a creature evolved purely for flight. It can hover, bank, dive, and perform aerial maneuvers that ground-based opponents cannot replicate. In open sky, the wyvern possesses absolute superiority over grounded foes.

### Venomous Barb

The wyvern's tail bears a barb that drips constantly with neurotoxin—a venom potent enough to kill large animals in minutes. Creatures struck by the barb suffer progressive paralysis, loss of coordination, and eventually death if the venom is not countered.

### Thermal Soaring

The wyvern is evolved to exploit thermal updrafts, climbing to extreme altitudes with minimal energy expenditure. This allows the creature to maintain flight for hours, remain at crushing altitudes where lesser creatures cannot breathe, and position itself anywhere within its territory with ease.

### Predatory Intelligence

While not intelligent enough for language or abstract reasoning, the wyvern demonstrates clear learning capacity, problem-solving ability, and the capacity to plan multi-stage hunts. A wyvern remembers individuals who have threatened it and adjusts behavior accordingly.

## Attributes

- **Strength:** 16-21 (1d6+15) — Powerful enough to bear several hundred pounds aloft and tear apart armored prey
- **Endurance:** 14-19 (1d6+13) — Capable of sustained flight and lengthy hunts across vast territories
- **Dexterity:** 10-15 (1d6+9) — Precise in striking and tail placement; lacks the finesse of true dragons
- **Agility:** 11-16 (1d6+10) — Highly maneuverable in three dimensions; responds instantly to air currents
- **Perception:** 12-17 (1d6+11) — Exceptional vision across great distances; hunts prey at extreme altitudes
- **Aura:** 9-14 (1d6+8) — Draconic and terrible; the presence of a wyvern causes mortal dread in prey creatures
- **Will:** 11-16 (1d6+10) — Territorial and fierce; maintains commitment to hunt despite wounds
- **Reasoning:** 6-9 (1d4+5) — Intelligent predator capable of learning and planning; lacks true comprehension
- **Creativity:** 5-8 (1d4+4) — Behavioral variation based on environment and experience; limited true innovation
