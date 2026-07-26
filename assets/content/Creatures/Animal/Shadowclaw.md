---
aliases:
    - Shadowclaw
tags:
    - animal
name:
    full: Shadowclaw
    aliases: []
id: jjuIModhoOI5xUyv
slug: shadowclaw
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
type: creature
package: sohl
sohl:
    attributes:
        str: 16
        end: 14
        dex: 17
        agl: 18
        per: 18
        aur: 10
        wil: 13
        rea: 12
        cre: 8
    attrRollFormula:
        str: 1d6+12
        end: 1d6+10
        dex: 1d6+13
        agl: 1d6+14
        per: 1d6+14
        aur: 1d4+7
        wil: 1d6+9
        rea: 1d6+8
        cre: 1d4+5
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 250
            calc: 250
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 80
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: mixed_forest
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: needleleaf_forest
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: woodland
                mode: add
                textValue: "0"
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The color of the terrain seems to ripple, and reality shifts as the creature's form comes into focus. Iridescent scales shimmer with hues that match the surroundings so perfectly that you question whether you're seeing the actual creature or merely the forest's reflection. The emerald eyes open like gems in shadow, revealing an intelligence that seems almost predatory in its awareness. The movement is fluid and wrong — too many joints, too much flexibility — as the long feathered tail twitches with serpentine grace. Then you notice the claws, and the truth becomes terrible: three wickedly sharp talons on each foot, and on the second claw of each hind leg, a hooked talon the length of a dagger points upward in permanent threat.

# Dossier {#dossier}

The Shadowclaw is a sophisticated predatory reptile reaching 10-12 feet in length and standing 5-6 feet tall, found in dense forests, jungles, and rocky valleys where complex terrain provides hunting advantage. These highly intelligent pack hunters are apex predators that coordinate sophisticated ambush strategies and maintain complex social hierarchies. Adventurers encounter shadowclaws while exploring jungle ruins, traversing dense forests, or inadvertently entering established pack territories.

## Presentation

The Shadowclaw is a bipedal reptilian predator with a body covered in iridescent scales that shift hue to match surrounding environments, making the creature difficult to see even when looking directly at it. The creature stands on powerful hind legs with a long feathered tail that provides balance and communicative function. The front limbs end in three wicked talons each, suitable for climbing and grasping. The most distinctive feature is the secondary hooked claw on each hind foot — a talon that points upward and curves wickedly, clearly adapted for devastating kicking attacks. The head is proportionally large with an elongated snout filled with serrated teeth, and eyes positioned forward-facing in an emerald hue that seems to glow with intelligence. The spine is marked by bony ridges that can be raised for intimidation displays. The overall build suggests a creature designed for stealth, speed, and precision killing.

## Presentation: Behavior and Ecology

Shadowclaws are highly intelligent and genuinely cooperative hunters that live and hunt in family packs of 3-8 individuals led by an alpha pair. They communicate through a sophisticated language of clicks, whistles, and growls that allows complex tactical coordination even over distances. The creatures adapt quickly to low-light conditions and can see nearly as well in darkness as in daylight, though sudden bright light can temporarily blind them. While the creatures possess olfaction and hearing, their primary sense is vision — they are motion-sensitive and their eyes track movement with predatory focus.

## Key Behaviors

Shadowclaws are pack hunters that coordinate complex ambush strategies targeting prey much larger than individual creatures. Each pack maintains exclusive territory marked by pheromone deposits and claw marks, defending these areas aggressively against rival packs. The alpha pair leads hunts, orchestrates attacks, and maintains social order through displays of strength. Young shadowclaws (hatchlings) are protected by the entire pack and undergo training that integrates them into hunting coordination by the time they reach hunting age. The bonds between pack members are strong, with individuals displaying self-sacrifice to protect kin. Shadowclaws are active primarily at night but are equally effective during daylight, and they hunt opportunistically whenever prey appears.

## Combat Strategy

The shadowclaw's primary tactic is stealth and coordinated pack assault. Individual creatures stalk prey using their extraordinary camouflage, positioning themselves for a simultaneous multi-directional ambush. Once the signal is given by the alpha, the pack attacks with explosive violence, using coordinated movement to isolate and overwhelm prey. The primary weapons are the talons and teeth, with the upward-pointing hooked talons used in devastating kicks that disembowel or sever limbs. If a target manages to escape isolation, the pack pursues relentlessly through terrain that provides advantage to their agility.

## Attack Methods

### Coordinated Ambush

Multiple shadowclaws attack simultaneously from different directions, making it impossible for a target to defend against all threats. The creatures use their camouflage to approach undetected before the coordinated strike.

### Slashing Claw Attack

The shadowclaw rakes with its front claws in rapid succession, using three-talon strikes to tear through flesh and light armor. These attacks are fast and precise, capable of creating severe bleeding wounds.

### Hooked Talon Kick

Using its hind legs, the shadowclaw delivers upward kicks using the distinctive hooked talon, capable of disemboweling or severing limbs. This attack is devastating in close quarters and is used by packs to disable larger prey.

### Bite Attack

The shadowclaw's bite is powerful and delivers serious puncture wounds, particularly when multiple creatures attack simultaneously, preventing a victim from engaging effective defense.

## Special Abilities

### Chameleon Scales

The shadowclaw's iridescent scales are extraordinarily effective at matching surrounding terrain and lighting. The creature becomes nearly invisible when still and difficult to track even when moving. The shadowclaw gains significant advantage on stealth checks, particularly in complex terrain.

### Enhanced Vision

The shadowclaw's eyes are adapted for motion detection and low-light hunting. The creature can see in near-total darkness and is particularly effective at detecting movement. The creature is vulnerable to sudden bright light, which can temporarily blind it.

### Pack Coordination

Shadowclaws communicate through sophisticated vocalizations and body language, allowing coordinated pack attacks that are nearly impossible for individuals to defend against. Pack members instinctively support each other and can execute pincer movements and complex tactical maneuvers.

### Acrobatic Mastery

The shadowclaw's flexible spine and powerful limbs allow it to climb nearly vertical surfaces, leap extraordinary distances, and move across complex terrain with grace and speed that ground-bound opponents cannot match.

### Predatory Intelligence

The shadowclaw is genuinely intelligent, capable of learning, planning, and adjusting tactics based on experience. The creatures remember individual humanoid faces and adjust tactics based on previous encounters.

## Additional Information

**Weaknesses**: While agile and fast, shadowclaws have relatively lightweight bones that can break under heavy impact. The creatures are vulnerable to sudden bright light and are much less effective when separated from their pack. Individual shadowclaws isolated from pack support are significantly less dangerous and more likely to retreat.

**Territorial**: Shadowclaws defend their territories with lethal aggression. Encounters between rival packs are often brutal, though displays of aggression frequently resolve without direct combat due to the injury risk.

**Training and Captivity**: Young shadowclaws are highly trainable and capable of bonding with skilled handlers. Some rare civilizations have successfully integrated shadowclaws into societies as both hunters and companions, though the creatures' predatory nature means they remain inherently dangerous.

**Harvesting**: A shadowclaw's scales can be harvested after death and used to create camouflage armor or protective gear. The claws and teeth are valued for weapon-crafting.
