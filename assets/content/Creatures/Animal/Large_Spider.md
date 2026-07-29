---
aliases:
    - Large Spider
tags:
    - animal
name:
    full: Large Spider
    aliases: []
id: 7z21KuX3vzQ2XC2E
slug: large-spider
img: icons/game-icons/carl-olsen/spider-alt.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 8
        end: 9
        dex: 17
        agl: 15
        per: 11
        aur: 9
        wil: 11
        rea: 9
        cre: 15
    attrRollFormula:
        str: 1d4+5
        end: 1d4+6
        dex: 1d4+14
        agl: 1d4+12
        per: 1d4+8
        aur: 1d4+6
        wil: 1d4+8
        rea: 1d4+6
        cre: 1d4+12
    body:
        structure:
            zones: []
            parts: []
            locations: []
        weight:
            base: 15
            calc: 15
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 3
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

Something skitters at the edge of your vision—wrong, alien, wrong. Eight jointed legs move in hypnotic synchronization, each one ending in a sharp point that clicks against stone. The body is a dark, glossy bulb covered in fine bristles, and the cephalothorax is dominated by eight eyes that catch the light and throw it back at you with unblinking intelligence. The smell is unfamiliar—acrid, sharp, vaguely chemical. When it moves, it moves with unsettling speed and precision, as though bound by different physical laws than you are. The pair of pedipalps frame twin fangs that glisten with venom.

# Dossier {#dossier}

Large spiders are arachnids of considerable size, typically weighing 2-5 pounds with leg spans of 18-30 inches. Their bodies are covered in smooth, dark chitin ranging in color from deep brown through glossy black to mottled combinations of both. Fine bristles cover the abdomen and cephalothorax, some of which are sensory and some of which serve other purposes. The cephalothorax—the fused head and thorax region—is smaller and more angular than the bulbous abdomen.

## Presentation

Large spiders typically bear eight dark eyes clustered toward the front of the cephalothorax, with two additional simple eyes sometimes present. These eyes provide extraordinary visual acuity and allow the spider to perceive movement in nearly all directions. The chelicerae—fangs—are prominent and venom-dripping, and the pedipalps flank the mouth. All eight legs are long, jointed, and covered in sensory hairs; the tarsi—the tips—are clawed or padded depending on the species, allowing them to climb nearly vertical surfaces and even walk on ceilings. The abdomen, which can be nearly as large as the cephalothorax, contains the silk-producing spinnerets that the spider uses to weave webs. Coloration varies by species and individual, ranging from earthy browns to near-black with lighter banding or mottling.

## Key Behaviors

Large spiders are ambush and hunting predators, employing two primary strategies: constructing elaborate webs to trap prey, or actively hunting by prowling through vegetation, across surfaces, or through the air. Web-building spiders remain near their webs, vibrating the silk to sense trapped prey. Active hunters stalk prey through their territory, using eight eyes and thousands of sensory hairs to track movement. All spiders are solitary outside of mating season and actively avoid other spiders. They primarily hunt insects and other arthropods but large species readily consume small vertebrates including mice, lizards, and birds. They have extremely fast metabolisms and must feed frequently.

## Combat Strategy

Spiders prefer to strike from positions of advantage—from above, behind, or from within a web. They aim for the head and neck with their bite, attempting to immobilize prey with venom before feeding. Against more formidable opponents, spiders rely on hit-and-run tactics, biting and retreating to let venom work. A cornered spider will become aggressive, leaping at attackers and biting repeatedly. Web-building spiders will remain in or near their webs, using them to slow and entangle opponents.

## Attack Methods

### Venomous Bite

The spider lunges with fangs extended, aiming for the head, neck, or exposed skin, and injects paralyzing venom; the bite causes piercing damage and progressive paralysis depending on the victim's constitution and the spider's venom potency.

### Web Entanglement

If within its web, a spider can engulf portions of an opponent in sticky webbing to slow or immobilize; an ensnared opponent must make a strength check to break free or becomes completely immobilized.

## Special Abilities

### Wall Crawler

The spider can traverse vertical and inverted surfaces with ease, moving at full speed across ceilings, walls, and even overhanging structures; this allows the spider to attack from unexpected angles and escape combat by retreating to surfaces opponents cannot easily reach.

### Venomous Bite

The spider's fangs deliver a neurotoxin designed to paralyze prey; victims of the bite suffer immediate damage and must make a resistance check or begin to suffer progressive paralysis that can render them completely immobilized if sufficiently strong.

### Web Weaver

The spider can create sticky webbing to entangle prey, repair webs, or construct barriers; these webs are difficult for opponents to break and can impede movement or prevent escape from a designated area.

## Attributes

- **Strength:** 6-9 (1d4+5)

- **Endurance:** 7-10 (1d4+6)

- **Dexterity:** 15-18 (1d4+14)

- **Agility:** 13-16 (1d4+12)

- **Perception:** 9-12 (1d4+8)

- **Aura:** 7-10 (1d4+6)

- **Will:** 9-12 (1d4+8)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 13-16 (1d4+12)
