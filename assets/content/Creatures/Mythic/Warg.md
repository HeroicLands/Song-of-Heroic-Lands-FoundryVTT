---
aliases:
    - Warg
tags:
    - mythic
    - image-needed
name:
    full: Warg
    aliases: []
id: Fk5LGJPnTZLxzWuG
slug: warg
img: icons/game-icons/lorc/wolf-head.svg
portrait: ""
type: creature
package: sohl
sohl:
    attributes:
        str: 20
        end: 18
        dex: 14
        agl: 16
        per: 17
        aur: 13
        wil: 17
        rea: 12
        cre: 9
    attrRollFormula:
        str: 1d6+16
        end: 1d6+14
        dex: 1d6+10
        agl: 1d6+12
        per: 1d6+13
        aur: 1d6+9
        wil: 1d6+13
        rea: 1d6+8
        cre: 1d4+6
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 150
            calc: 150
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 80
          leaguesPerWatch: 7
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

The darkness seems to breathe. What emerges from the night is not wolf and not ordinary beast, but something touched by old, foul magic. It stands nearly four feet at the shoulder, but where a dire wolf is lean and quick, this creature is vast and heavy—muscles like iron beneath fur black as starless night, each bristle of its mane catching reflected firelight like dark metal. The eyes arrest you first: they burn with an intelligence that is utterly alien, utterly malevolent—not the simple predatory focus of beast but the calculating judgment of something that reasons, understands, and has decided your worth is measured in blood. When it breathes, you see that its breath steams even in mild air, and the sound is less growl than rumble of distant thunder. Around it, you sense movement in the darkness—other shapes, other eyes—and you understand with chilling clarity that this beast does not hunt alone, but commands. The thing fixes you in its gaze and you feel the weight of its attention like a physical force. It speaks—and though the sound that emerges is a subsonic howl, the meaning is clear: _We are here. We will feed._

# Dossier {#dossier}

The Warg is a supernatural predator of the highest order: a giant wolf touched and transformed by fell magic into something far more than mere animal. Standing three and a half to four feet at the shoulder and weighing four hundred to five hundred pounds, the warg combines the predatory efficiency of wolves with an unnatural intelligence that borders on the sapient. Unlike dire wolves—which are merely large and somewhat smarter versions of their natural cousins—the warg is categorically different: a creature twisted by dark powers into a tool of conquest and death. Wargs are possessed of a malevolent cunning, an understanding of tactics and strategy beyond what natural wolves can achieve, and a capacity for genuine cruelty that exceeds mere hunger. They are sometimes ridden by Grukar (goblin-folk), serving as both mounts and leaders of goblin war bands. These partnerships are far from domestication; rather, the warg and its Grukar rider achieve a synergy born of shared cruelty and predatory alliance. Wargs maintain pack structures similar to ordinary wolves, but with hierarchies far more rigid and potentially brutal. A warg pack is not a cooperative family unit but a military organization with strict command and absolute obedience. Adventurers encounter wargs primarily as vanguards of goblin war bands or as independent predators in wilderness regions touched by ancient curses and dark magic.

## Presentation

The warg is fundamentally canid—four-legged, digitigrade, with the body plan of a predatory hunter—but warped into something far more sinister than any natural wolf. The body is massive and heavily muscled, with longer legs than a normal wolf and a deeper chest that speaks of terrible power. The fur is invariably dark: black, dark gray, or burned brown, and it lies sleek and oily against the massive frame, shot through with an unsettling iridescence in certain light, as though the creature itself sheds darkness. The mane is voluminous and bristles constantly, regardless of wind or emotion, as though perpetually raised by unseen forces. The head is large and wedge-shaped, with a longer snout than a dire wolf but a more massive jaw structure. The teeth are enormous, yellow and cruel, visibly capable of crushing bone. The eyes are the most terrible feature: they burn with an intelligence that is utterly unnatural, filled with hunger and malice and something approaching comprehension. The tail is thick and powerful, useful for balance and expression. The claws are non-retractable and wickedly sharp, suited equally to gripping prey and climbing. The overall presence is profoundly wrong—a creature that violates the natural order, that inspires dread beyond merely practical fear.

## Key Behaviors

Wargs organize into packs of five to fifteen individuals, with rigid hierarchies centered on the strongest or most magically potent individuals. Unlike natural wolves, wargs do not hunt cooperatively for survival but perform coordinated military operations with clear tactical objectives. A warg pack under a dominant alpha operates with precision and subordination that natural wolves never achieve. They maintain territories but are far more aggressive in defending or expanding them than natural wolves, conducting deliberate raid operations against rival packs and other predators. They are diurnal or nocturnal as circumstances dictate, fully capable of hunting effectively in either condition. They are omnivorous but strongly carnivorous, and they show particular predatory preference for humanoid prey—elves, humans, dwarves—treating such hunting as a form of sport rather than mere survival. Wargs that are bonded to Grukar riders develop a synergistic relationship that transcends normal animal-rider dynamics; the warg appears to understand tactical concepts, strategy, and the broader context of military operations. Wargs are capable of vocalizing beyond simple howls and growls, producing subsonic rumbles that carry complex meaning to other wargs across vast distances. They live significantly longer than natural wolves, with individuals potentially reaching forty years or more.

## Combat Strategy

A warg pack's combat doctrine is organized and ruthless: flanking maneuvers that isolate targets, coordinated ambushes from multiple vectors, and relentless pressing of attacks until prey collapses. Individual wargs demonstrate clear understanding of formation fighting, maintaining coordinated positions and supporting flanking maneuvers without apparent communication. A warg will shift tactics based on observed enemy behavior, focusing on archers first, then isolating individual targets for elimination. Against heavily armored opponents, wargs coordinate attacks on weak points—joints, exposed legs, faces—rather than attempting to overwhelm through raw force. A warg pack defending territory or protecting young exhibits suicidal determination, attacking far stronger opponents without hesitation. A single warg separated from its pack becomes cautious but not cowardly; it will pursue prey relentlessly even alone, understanding that it outclasses most individual opponents.

## Attack Methods

### Crushing Bite

The warg's bite force exceeds that of natural wolves and dire wolves combined. A single bite can crush bones, sever limbs, and penetrate armor of moderate strength. The warg's technique involves clamping and holding, pinning prey while pack-mates attack.

### Coordinated Pack Strike

Multiple wargs attack simultaneously from different vectors, each strike designed to support the others' attempts to isolate and overwhelm targets. This coordination suggests genuine tactical communication and planning.

### Raking Claw Attack

At close range, the warg tears with claws as readily as teeth, particularly effective against targets that are trying to flee or defend against the bite.

### Driving and Trapping

The warg pack uses terrain and coordinated movement to drive prey toward specific locations—cliff edges, dead-ends, prepared ambush sites—forcing targets into positions of maximum vulnerability.

## Special Abilities

### Supernatural Intelligence

The warg possesses genuine sapient-level reasoning: it understands tactics, hierarchy, cause and effect across time, and even the broader contexts of military campaigns. While not capable of language or abstract philosophy, the warg can plan multi-stage operations, remember specific individuals, and make decisions based on calculated risk versus reward.

### Pack Dominion

A warg pack under a dominant alpha operates with supernatural synchronization. Individual wargs maintain formation without apparent communication, anticipate the actions of pack-mates with perfect accuracy, and adjust tactics mid-combat based on emerging circumstances. This coordination suggests shared consciousness or magical link between pack members.

### Darkvision

The warg hunts as effectively in absolute darkness as in daylight, seeing in the infrared spectrum and through magical darkness with equal competence. This gives warg packs enormous advantage in nocturnal or subterranean environments.

### Aura of Dread

The presence of a warg induces supernatural fear in prey creatures—a primal dread that transcends rational analysis. Creatures in the presence of a warg pack suffer psychological pressure that can lead to panic, flight, or paralysis.

### Terrible Howl

The warg can vocalize in a subsonic howl that carries across distances of miles, conveying complex meaning to other wargs and disrupting the morale of hearing creatures. This howl can coordinate pack actions across great distances and shake the courage of lesser beings.

### Supernatural Endurance

Wargs are less subject to fatigue than natural wolves and can maintain pursuit for days at a time without rest, seemingly driven by will and magic rather than mere physiology.

## Attributes

- **Strength:** 17-22 (1d6+16) — Comparable to dire wolves but with superior bite force and crushing power
- **Endurance:** 15-20 (1d6+14) — Capable of sustained pursuit across vast distances
- **Dexterity:** 11-16 (1d6+10) — Quick and precise in striking; good coordination in pack movement
- **Agility:** 13-18 (1d6+12) — Responsive and maneuverable; capable of sudden directional changes
- **Perception:** 14-19 (1d6+13) — Exceptional senses including darkvision and magical sight
- **Aura:** 10-15 (1d6+9) — Touched by dark magic; presence induces supernatural dread and unease
- **Will:** 14-19 (1d6+13) — Iron-willed and relentless; unshakeable commitment to objectives
- **Reasoning:** 9-14 (1d6+8) — Capable of genuine reasoning and tactical planning; understands strategy and consequence
- **Creativity:** 7-10 (1d4+6) — Demonstrates problem-solving and adaptive behavior; adjusts tactics to situation
