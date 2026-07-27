---
aliases:
    - Poisonous Snake
tags:
    - animal
name:
    full: Poisonous Snake
    aliases: []
id: VjtudyT7ZWs0T4bO
slug: poisonous-snake
img: icons/game-icons/lorc/snake.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 5
        end: 7
        dex: 16
        agl: 15
        per: 13
        aur: 9
        wil: 11
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d4+2
        end: 1d4+4
        dex: 1d6+12
        agl: 1d6+11
        per: 1d6+9
        aur: 1d4+6
        wil: 1d6+7
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 30
            calc: 30
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
          factors:
              - scope: surface_cover
                key: wetlands
                mode: add
                textValue: "-2"
              - scope: hydrology
                key: shallow
                mode: add
                textValue: "0"
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

Movement catches your eye — the subtle shift of coiled muscle beneath patterned scales, a ripple across sun-warmed stone. The snake lifts its head, and suddenly a forked tongue tastes the air, searching for your scent. Its unblinking eyes, vertical-pupiled and ancient-seeming, track your position with predatory focus. A faint hiss emerges, and you notice the slight widening of the neck — a warning display. The smell of musk and something sharp hangs in the air, and the temperature of the ground beneath the creature seems wrong somehow, as if its presence drains warmth.

# Dossier {#dossier}

Poisonous snakes are efficient ambush predators equipped with specialized venom delivery systems, ranging in size from three to six feet in length and varying dramatically in coloration depending on species and regional origin. These creatures are found in diverse habitats from dense forests to rocky badlands, always occupying niches where patient hunting and quick strikes provide advantage. An adventuring party might encounter them while moving through underbrush, entering caves or ruins, or traversing warm climates where the creatures hunt most actively.

## Presentation

A poisonous snake's appearance reflects its environment and species — some display brilliant warning colors of red, yellow, and black in bold banding patterns, while others wear subtle earth tones, stripes, or mottling that render them nearly invisible against stone or dry vegetation. The head is typically triangular or spade-shaped, with the positioning of the eyes giving it monocular vision and a flat, predatory gaze. Scales vary from smooth and shining to keeled and dull, depending on species. The body tapers gradually to a tail, which in some species ends in a rattle or vibrates when threatened. The mouth is capable of unhinging to swallow prey whole or deliver venom through specialized fangs (either grooved or hollow).

## Key Behaviors

Poisonous snakes are ambush specialists that spend hours or days in a single location, waiting for suitable prey to pass within striking distance. They are most active during warm daylight or early evening hours and slow considerably when temperatures drop. These creatures are fundamentally solitary and territorial, with most species tolerating one another only during mating seasons. They hunt primarily through vibration sensing and scent — the flickering forked tongue draws chemical particles from the air and ground, processed through a vomeronasal organ that provides a "taste" of the creature's surroundings. Snakes are patient to a degree that defies human understanding; they may fast for weeks between meals and spend the intervening time in near-total stillness.

## Combat Strategy

The snake's strategy is simplicity itself: strike with deadly precision and retreat to a defensible location while venom does its work. It will rattle or hiss loudly if given warning space, communicating danger through sound and display to avoid wasting venom on creatures that will leave it alone. If cornered or defending eggs, it becomes aggressive, striking repeatedly and relentlessly. Antivenin or magical healing renders the snake's primary advantage irrelevant, after which it will attempt to flee by moving through vegetation, into crevices, or under cover. The snake cannot engage in prolonged physical combat and will not pursue once prey escapes to open ground where the creature cannot move quickly.

## Attack Methods

### Venomous Bite

The snake strikes with explosive speed, unhinges its jaw, and drives hollow or grooved fangs into target flesh, injecting a specialized venom that may cause paralysis, necrosis, or hemorrhage depending on species. The venom takes seconds to minutes to affect the victim, during which the snake has already withdrawn to a safe distance to wait for the prey to succumb.

### Constriction Attempt

If the snake is large enough or the target small enough, it coils around the victim in an attempt to immobilize and suffocate, though this is a secondary strategy used only if a bite proves ineffective or if prey is very small.

### Tail Lash

Smaller poisonous snakes without potent venom may use their tails to strike faces or eyes, creating distraction and disorientation while the snake positions for a bite.

## Special Abilities

### Venom Delivery

The snake's venom is produced in specialized glands and delivered through precisely evolved fang structures, allowing accurate injection of a potent neurotoxin or hemotoxin that incapacitates or kills prey far larger than the snake itself. The venom's effectiveness varies with species and the individual creature's age and health.

### Thermal Sensing

Some poisonous snakes (particularly pit vipers) possess specialized heat-sensing pits along their jaws that allow them to detect warm-blooded creatures in complete darkness, giving them a significant hunting advantage in caves, thick vegetation, or at night.

### Rapid Strike Reflexes

The snake's entire body is built for explosive acceleration. It can strike from coil to full extension in a fraction of a second, making it exceptionally difficult to dodge or prevent the bite once the creature has positioned itself for attack.

### Camouflage

Many poisonous snakes possess coloration and patterning that blends seamlessly with their chosen environment — rocks, leaf litter, sandy ground, or vegetation. A motionless snake may be nearly impossible to detect until it moves or strikes.

### Additional Information

Most poisonous snakes will not attack unless threatened or defending eggs or a recent kill. Adventurers who move carefully and pay attention to their surroundings can often avoid encounters entirely. Antivenin made from the snake's own venom or from magical sources can neutralize the effects of a bite, making knowledge of local snake species valuable. Snakes are ectothermic and move slowly in cold weather, making them predictable and easy to avoid during winter months or high mountain travel.

## Attributes

- **Strength:** 3-6 (1d4+2)

- **Endurance:** 5-8 (1d4+4)

- **Dexterity:** 13-18 (1d6+12)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 10-15 (1d6+9)

- **Aura:** 7-10 (1d4+6)

- **Will:** 8-13 (1d6+7)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
