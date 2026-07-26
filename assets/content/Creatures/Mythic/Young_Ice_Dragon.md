---
aliases:
    - Young Ice Dragon
tags:
    - mythic
    - image-needed
name:
    full: Young Ice Dragon
    aliases: []
id: 7ifxZxScmlMHr44B
slug: young-ice-dragon
img: icons/game-icons/faithtoken/dragon-head.svg
portrait: ""
type: creature
package: sohl
sohl:
    attributes:
        str: 21
        end: 19
        dex: 13
        agl: 14
        per: 16
        aur: 15
        wil: 15
        rea: 11
        cre: 10
    attrRollFormula:
        str: 1d6+17
        end: 1d6+15
        dex: 1d6+9
        agl: 1d6+10
        per: 1d6+12
        aur: 1d6+11
        wil: 1d6+11
        rea: 1d6+7
        cre: 1d6+6
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 5000
            calc: 5000
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 60
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: aerial
          feetPerRound: 130
          leaguesPerWatch: 14
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The air crystallizes before you see it. Your breath freezes mid-exhale, turning to glittering needles that catch light that isn't there. The temperature drops so gradually, so deliberately, that by the time you realize something is wrong, your extremities have already begun to numb. Then you see it—pale silver scales catching the glacial light, almost translucent at the wing edges, a creature of perhaps twenty-four feet from snout to tail. It watches you with eyes like winter itself, patient and knowing. Where a fire dragon would announce itself with roaring fury and a cascade of flame, this one simply exists, and the world freezes around it. Your heartbeat slows. Your thoughts grow sluggish. It doesn't need to hunt you—the cold will do the work. The young ice dragon has already learned what takes its elder centuries to perfect: that patience is sharper than any blade, and the silence before the avalanche is more terrifying than the avalanche itself.

# Dossier {#dossier}

Young ice dragons are apex predators of high mountains and glacial regions, possessing formidable strength and aerial mastery despite their comparative youth. They range from sixteen to twenty-four feet in length with wingspans of up to thirty-six feet, weighing between eight hundred and two thousand five hundred pounds. Unlike their fire-breathing kin, ice dragons are notably less aggressive and more methodical—a difference that makes them no less lethal, only deadlier in ways that require patience to recognize. A young ice dragon will observe a settlement for weeks before hunting, learning routes and schedules. It does not strike in rage; it strikes with precision.

The cold aura that surrounds a young ice dragon is genuinely lethal within prolonged proximity. Unprotected travelers within fifty feet will find their core body temperature dropping noticeably within minutes. Frostbite begins within an hour of exposure. The dragon's lair, invariably located in a glacier or mountain ice cave, becomes an environment where only the dragon thrives—stone becomes brittle, metal becomes treacherous, and flesh hardens and fails.

## Presentation

A young ice dragon's scales are predominantly pale silver-blue, with deeper glacial blue striations along the spine and wings. The edges of its scales are translucent, almost crystalline, causing light to refract in disorienting patterns. Unlike the heat-darkened scales of fire dragons, these scales remain bright and reflective, making the creature shimmer even in dim light. Its eyes are pale silver-gray, devoid of warmth, and seem to calculate rather than merely observe.

The dragon's hide is supernaturally cold to the touch, radiating frost in visible waves during calm weather. Breath mists perpetually from its nostrils. Ice forms spontaneously around its claws where they touch stone. Its wings, when folded, create a faint musical chiming as the scales settle against one another. The dragon's voice, when it chooses to speak, is low and measured—never urgent, never panicked. It speaks with the confidence of something that knows it will outlast you.

## Key Behaviors

Young ice dragons are territorial and solitary, establishing lairs that may span an entire glacier system. They return to the same feeding grounds seasonally, hunting the region's livestock and the occasional hunting party that ventures into their domain. Unlike fire dragons, which may hoard gold and gems, ice dragons collect victims—maintaining a frozen necropolis of perfectly preserved prey, some decades old, stored in chambers maintained at perpetual deep freeze.

The young ice dragon is patient to the point of unsettling. It will circle prey for days, studying behavior patterns. It will wait in storms that would kill other creatures. It will follow a merchant caravan for a hundred miles before striking at the most isolated point. The dragon does not need to hurry. Time itself is its ally.

## Combat Strategy

A young ice dragon prefers to engage enemies at a distance, using its flight advantage and frost breath to separate prey from aid and create environmental hazards. It circles at altitude, making ranged attacks difficult while it pummels targets with its breath weapon. Only when prey is sufficiently weakened—frozen, disoriented, or isolated—does the dragon descend for melee combat.

The dragon uses terrain ruthlessly. A single sweep of its tail near a glacier's edge can trigger avalanches. Its presence itself creates hazards; ice sheets become slick and treacherous, stone becomes brittle, and the very air becomes weaponized. The dragon is patient enough to force enemies into mistakes born of cold, fear, and desperation.

## Attack Methods

### Bite

The dragon's bite targets a single enemy within reach. The creature inflicts damage equal to its strength modifier plus weapon dice, and victims must resist cold exposure in addition to physical trauma.

### Claw Rake

The dragon's claws extend and rake across one or more targets within reach, inflicting slashing damage and leaving wounds that frostbite rapidly. A claw rake can target multiple enemies in a small area.

### Tail Sweep

The dragon's muscular tail whips in a broad arc, attempting to knock enemies prone or hurl them backward. Targets in the tail's path must resist a strength check or fall prone and take bludgeoning damage.

### Frost Breath

The dragon exhales in a fifteen-foot cone of supercooled mist and crystalline shards. Targets in the cone take cold damage and must resist or suffer reduced movement and vulnerability to additional cold damage on the next round. Unprotected targets can suffer frostbite.

## Special Abilities

### Frost Breath

The dragon's breath weapon manifests as a cone of supercooled air laced with razor-sharp ice crystals. The cold is so intense it burns, and the mist obscures vision. A young ice dragon can use this ability multiple times but must rest between uses.

### Flight

The dragon is a masterful flier, capable of hovering and performing acrobatic maneuvers despite its size. Its wings generate no sound despite their span.

### Armored Scales

The dragon's scales are supernaturally hard, shedding conventional weapons and providing natural armor superior to plate mail. Magical weapons and intense heat are required to penetrate the hide.

### Cold Aura

The dragon's natural body temperature is so far below freezing that it radiates killing cold. Creatures within fifty feet of the dragon take incremental cold damage based on proximity and exposure duration. This aura cannot be dispelled without affecting the dragon itself.

## Attributes

- **Strength:** 18-23 (1d6+17)
- **Endurance:** 15-20 (1d6+15)
- **Dexterity:** 9-14 (1d6+9)
- **Agility:** 10-15 (1d6+10)
- **Perception:** 12-17 (1d6+12)
- **Aura:** 11-16 (1d6+11)
- **Will:** 11-16 (1d6+11)
- **Reasoning:** 7-12 (1d6+7)
- **Creativity:** 6-11 (1d6+6)
