---
aliases:
    - Voidserpent
tags:
    - spirit
name:
    full: Voidserpent
    aliases: []
id: mXr47FnIDlmq2RCz
slug: voidserpent
img: icons/game-icons/lorc/snake.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 17
        end: 17
        dex: 11
        agl: 17
        per: 15
        aur: 19
        wil: 15
        rea: 11
        cre: 13
    attrRollFormula:
        str: 1d4+14
        end: 1d4+14
        dex: 1d4+8
        agl: 1d4+14
        per: 1d4+12
        aur: 1d4+16
        wil: 1d4+12
        rea: 1d4+8
        cre: 1d4+10
    body:
        structure:
            zones: []
            parts: []
            locations: []
        weight:
            base: 150
            calc: 150
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

Where there is nothing, something moves. The Voidserpent is less a creature than an absence given purpose—a gap in reality that winds through space like a living scar. Its hide, if it can be called that, is the color of nothing, studded with points of light like a backwards night sky. When it moves, space seems to warp around it, as if the world is uncertain whether to allow its passage. The very air becomes heavy and slow in its presence.

# Dossier {#dossier}

Voidserpents are beings from the spaces between worlds, creatures older than gods and far more alien than most mortals can comprehend. They may be fragments of something greater, or they may be whole entities in themselves—no one knows. They are extraordinarily rare, and each encounter is a singular event. A Voidserpent does not hunt in the normal sense; it seems to move through the world according to purposes and compulsions that are utterly indifferent to human presence. To encounter one is to touch something cosmically vast and utterly unconcerned with your existence.

## Presentation

A Voidserpent is serpentine in general shape but massive—easily thirty feet or more from head to tail. Its body is composed of something between matter and void, and looking at it directly causes disorientation and conceptual confusion. The creature is colored in deep purples, blacks, and the absence of color entirely, with patterns that seem to shift and rearrange themselves according to principles that human eyes cannot quite follow. Its eyes are perfectly spherical voids of absolute darkness, and where they focus, light seems to waver and diminish. The creature moves with sinuous grace despite its mass, and its passage disturbs reality itself—sound becomes distant, colors seem less vivid, and time feels uncertain.

## Key Behaviors

Voidserpents do not behave like normal creatures. They seem to follow paths and purposes that are invisible to human understanding. A Voidserpent may move through an entire region without attacking anyone, or it may destroy a settlement for no apparent reason. They do not eat in any conventional sense and do not seem to require sleep or rest. They are indifferent to temperature, weather, and most forms of harm. Some scholars believe Voidserpents serve a function in maintaining the integrity of reality itself, acting as repairs or defenders against incursion from truly hostile other realms. Others believe they are simply anomalies, living contradictions that should not exist.

## Combat Strategy

A Voidserpent does not fight tactically; it simply moves according to its own imperatives. If a human blocks its path, it will attempt to remove the obstacle through the most direct means. It seems largely unconcerned whether it is attacked in return. Its natural resistance to harm and its phasing abilities make it nearly invulnerable to conventional weapons. Against radiant light or magic, it becomes more reactive and more attentive. A Voidserpent focused on an opponent is nearly impossible to defeat; one that is ignoring you can usually be escaped from by running in the opposite direction.

## Attack Methods

### Void Constriction

The Voidserpent’s coils wrap around a victim and the experience is profoundly wrong. The victim feels not physical pressure but rather a compression of reality around them, as if existence itself is being squeezed. Bones do not break normally; victims report their entire body feeling as though it is being pulled inward from all directions simultaneously. The damage is both physical and conceptual.

### Energy Drain

The Voidserpent’s bite or touch channels void energy directly into a victim’s essence. The effect is catastrophic drain of vitality, magical power, and willpower. Victims struck feel as though their very soul is being pulled away, leaving them hollow and desperate.

### Void Warp

The Voidserpent can create localized distortions in space and time around itself. Victims caught in these warps find themselves moving in slow motion, their attacks delayed, their thoughts sluggish. The effect lasts as long as the Voidserpent maintains focus.

## Special Abilities

### Phase Mastery

The Voidserpent can move between dimensions and through solid matter at will. It can pass through stone, metal, and blessed barriers equally. It is almost impossible to trap or corner, as it can always phase away.

### Void Aura

Simply being near a Voidserpent is dangerous. Reality becomes unstable, and magic behaves unpredictably. Spells fizzle or misfire, weapons seem to weigh more, and time feels subjective. The effect is proportional to proximity—the closer to the Voidserpent, the worse the distortion.

### Cosmic Resilience

The Voidserpent is nearly immune to harm from conventional sources. Physical weapons pass through it with minimal effect. Only light-based magic, radiant energy, and magic that specifically targets void energy have any real effect. Even then, damage is reduced significantly.

### Reality Warping

The Voidserpent can warp space and time in its immediate vicinity. Distances become uncertain, directions become meaningless, and time moves at irregular rates.

## Additional Information

A Voidserpent should not be fought unless absolutely necessary. The preferred response to encountering one is to move away from it and allow it to pass. Fleeing is not cowardice—it is wisdom. If combat is unavoidable, the only reliable weapon against a Voidserpent is radiant light and light-based magic. Blessed weapons and holy magic can harm it, and light can disrupt its phasing temporarily. However, even with these tools, defeating a Voidserpent is nearly impossible. More realistic goals are to disrupt it enough to create an escape route, or to damage it enough that it chooses to phase away entirely. Some believe that Voidserpents serve a cosmic purpose and that killing one could have catastrophic consequences. Others argue they are abominations that should not exist. Few who have encountered a Voidserpent have lived to share their knowledge, and fewer still trust their own memories of the encounter.

## Attributes

- **Strength:** 15-18 (1d4+14)

- **Endurance:** 15-18 (1d4+14)

- **Dexterity:** 9-12 (1d4+8)

- **Agility:** 15-18 (1d4+14)

- **Perception:** 13-16 (1d4+12)

- **Aura:** 17-20 (1d4+16)

- **Will:** 13-16 (1d4+12)

- **Reasoning:** 9-12 (1d4+8)

- **Creativity:** 11-14 (1d4+10)
