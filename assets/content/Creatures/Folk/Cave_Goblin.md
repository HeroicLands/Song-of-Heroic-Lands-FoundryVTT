---
aliases:
    - Cave Goblin
tags:
    - folk
name:
    full: Cave Goblin
    aliases: []
id: pDiXk1iBL5unp4Q3
slug: cave-goblin
img: icons/game-icons/caro-asercion/goblin.svg
portrait: ""
shortcode: cvgbln
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 8
        end: 9
        dex: 15
        agl: 13
        per: 13
        aur: 8
        wil: 9
        rea: 9
        cre: 13
    attrRollFormula:
        str: 1d4+5
        end: 1d4+6
        dex: 1d4+12
        agl: 1d4+10
        per: 1d4+10
        aur: 1d4+5
        wil: 1d4+6
        rea: 1d4+6
        cre: 1d4+10
    body:
        structure:
            zones:
                - name: Head and Arms
                  shortcode: headzone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 2
                - name: Legs
                  shortcode: legszone
                  probWeight: 2
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                  canHoldItem: false
                  probWeight: 6
                - name: Right Arm
                  shortcode: rarmpart
                  bodyZoneCode: headzone
                  roles:
                      - manipulator
                  canHoldItem: true
                  probWeight: 7
                - name: Left Arm
                  shortcode: larmpart
                  bodyZoneCode: headzone
                  roles:
                      - manipulator
                  canHoldItem: true
                  probWeight: 7
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Right Leg
                  shortcode: rlegpart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Left Leg
                  shortcode: llegpart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 3
                      piercing: 1
                      fire: 3
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 1
                  protectionBase:
                      blunt: 2
                      edged: 2
                      piercing: 1
                      fire: 2
                - name: Right Upper Arm
                  shortcode: rupaloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 4
                  protectionBase:
                      blunt: 2
                      edged: 3
                      piercing: 1
                      fire: 3
                - name: Right Lower Arm
                  shortcode: rfraloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 2
                      piercing: 1
                      fire: 2
                - name: Right Hand
                  shortcode: rhandloc
                  bodyPartCode: rarmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 1
                  protectionBase:
                      blunt: 2
                      edged: 2
                      piercing: 1
                      fire: 2
                - name: Left Upper Arm
                  shortcode: lupaloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 4
                  protectionBase:
                      blunt: 2
                      edged: 3
                      piercing: 1
                      fire: 3
                - name: Left Lower Arm
                  shortcode: lfraloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 2
                      piercing: 1
                      fire: 2
                - name: Left Hand
                  shortcode: lhandloc
                  bodyPartCode: larmpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 1
                  protectionBase:
                      blunt: 2
                      edged: 2
                      piercing: 1
                      fire: 2
                - name: Thorax
                  shortcode: thrxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 2
                      edged: 4
                      piercing: 1
                      fire: 4
                - name: Abdomen
                  shortcode: abdmnloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 2
                      edged: 4
                      piercing: 1
                      fire: 4
                - name: Pelvis
                  shortcode: plvisloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 2
                      edged: 4
                      piercing: 1
                      fire: 4
                - name: Right Upper Leg
                  shortcode: rthghloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: medium
                  amputability: low
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 2
                      edged: 3
                      piercing: 1
                      fire: 3
                - name: Right Lower Leg
                  shortcode: rcalfloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 3
                  protectionBase:
                      blunt: 2
                      edged: 4
                      piercing: 1
                      fire: 4
                - name: Right Foot
                  shortcode: rfootloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 3
                      piercing: 1
                      fire: 3
                - name: Left Upper Leg
                  shortcode: lthghloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: medium
                  amputability: low
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 2
                      edged: 3
                      piercing: 1
                      fire: 3
                - name: Left Lower Leg
                  shortcode: lcalfloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 3
                  protectionBase:
                      blunt: 2
                      edged: 4
                      piercing: 1
                      fire: 4
                - name: Left Foot
                  shortcode: lfootloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 2
                  probWeight: 2
                  protectionBase:
                      blunt: 2
                      edged: 3
                      piercing: 1
                      fire: 3
        weight:
            base: 172
            calc: (9 * str) + 50
        reachBase: 0
        bodyScaleBase: 0.81
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: bflkbite
          type: skill
        - shortcode: bflkgrab
          type: skill
        - shortcode: bflkheadbutt
          type: skill
        - shortcode: bflkkick
          type: skill
        - shortcode: bflklmbblk
          type: skill
        - shortcode: bflkpress
          type: skill
        - shortcode: bflkpunch
          type: skill
        - shortcode: bflktrip
          type: skill
---

# Appearance {#appearance}

Small shapes move through the darkness, barely visible in the torchlight. Cave goblins are thin, hunched creatures with elongated features and bulging eyes that see far too well in the dark. Their gray or greenish skin clings to sharp-angled frames, and when they move, it is with liquid silence that seems unnatural in its completeness. When they watch you, there is no warmth in their regard—only hunger, cunning, and the assessment of whether you represent opportunity or threat.

# Dossier {#dossier}

Cave goblins are a sapient species that dwells in subterranean regions, existing as both solitary hunters and loose communities depending on the abundance of food and territory. They are highly intelligent despite stereotypes, and they are neither evil nor good but rather amoral—they follow their own self-interest and the customs of their kind with utter consistency. A cave goblin encountered alone is following its own agenda; a group of cave goblins is either a family unit or an opportunistic assembly, never a structured military formation. They view other species with either indifference or as resources, and their treatment of captives varies based on whether those captives have utility or novelty.

## Presentation

Cave goblins stand three to four feet tall on average, with elongated, hunched postures that suggest evolution for underground travel. Their skin ranges from sickly gray to mottled dark green or brown, often with fungal growth or cave slime darkening patches. Their eyes are large and luminous, adapted perfectly to see in near-total darkness. Their ears are pointed and mobile, positioned to catch sounds humans miss. Their hands are long-fingered with sharp, dark nails, and their feet are splayed and callused from climbing. They typically wear cobbled-together clothing made from cave fungus leather, hide, and bone, often in tatters but surprisingly functional for their environment.

## Key Behaviors

Cave goblins are fundamentally individualistic and self-interested. They are driven by hunger, curiosity, and the desire for status within goblin hierarchies. Each cave goblin is focused on personal advancement and personal survival. When multiple goblins are present, they maintain a complex social dynamic—they may cooperate when the benefit is clear, but they are equally likely to turn on each other or sacrifice each other for personal gain. They are found throughout cave systems in the region, sometimes in established communities and sometimes as solitary hunters. They are intelligent enough to teach their young, to plan ahead, and to understand the value of tools and weapons. They view other sapient species with contempt or indifference, and they see humanoid creatures primarily as either threats or resources.

## Combat Strategy

Cave goblins prefer ambush tactics and guerrilla approaches. They use their superior understanding of terrain, their ability to see in darkness, and their numbers to attack from positions of advantage. A cave goblin will not stand and fight if they can avoid it; instead, they will attack from darkness, from above, from unexpected angles. They are quick to flee if the fight turns against them. In groups, they coordinate basic tactics—some creating distraction while others attack from hidden positions. They favor weapons that suit their build—spears, hand-axes, bone daggers, slings, and crude bows. Many cave goblins use poison or paralytic toxins on their weapons, particularly substances derived from cave fungi.

## Attack Methods

### Spear Strike

The goblin strikes with a crude but sharp spear, often treated with toxin. The attack is quick and designed to pierce soft spots in armor and get away before retaliation.

### Sling Attack

A projectile attack using stones or bone missiles. The goblin can attack from distance and is difficult to target in return due to their small size and superior cover awareness.

### Poisoned Dart

Some cave goblins use small, accurate darts coated in paralytic toxins derived from fungal growths. A successful hit inflicts the poison effect, causing numbness and reduced movement.

### Ambush Attack

From hiding in darkness or from superior terrain position, the goblin strikes with all their power focused on a single target. These attacks are devastating when they land but rarely occur in open combat.

## Special Abilities

### Darkvision

Cave goblins can see in near-complete darkness as if it were twilight. This gives them overwhelming advantage in their native cave environment and significant advantage in dim lighting.

### Tunnel Mastery

In cave environments, cave goblins move with perfect silence and understand three-dimensional positioning in ways that surface dwellers cannot match. They climb, traverse, and navigate caves with ease.

### Toxin Knowledge

Cave goblins instinctively understand how to identify, process, and apply toxins derived from cave fungi. Many of their weapons carry coating with paralytic or mild poison agents.

### Cunning Misdirection

Cave goblins are natural liars and deceivers. They are skilled at creating confusion, misdirecting attention, and exploiting the assumptions others make about them. A cave goblin encountered in dialogue is likely to be dishonest unless obvious incentive exists to be truthful.

## Additional Information

Cave goblins are territorial but do not defend territory as a group unless immediate community survival is threatened. An individual goblin can usually be negotiated with if the terms are interesting to them. They value shiny objects, food that is scarce in caves, and weapons or tools. Some communities have maintained trade relationships with nearby cave goblin populations, though these are always delicate and subject to disruption based on individual goblin whim. Cave goblins have their own complex social hierarchies and reputations, and a goblin that is well-regarded can secure better treatment than one that is known as unreliable. Those venturing into deep caves should be aware that cave goblins likely know the territory far better and will exploit that advantage ruthlessly.

## Attributes

- **Strength:** 6-9 (1d4+5)

- **Endurance:** 7-10 (1d4+6)

- **Dexterity:** 13-16 (1d4+12)

- **Agility:** 11-14 (1d4+10)

- **Perception:** 11-14 (1d4+10)

- **Aura:** 6-9 (1d4+5)

- **Will:** 7-10 (1d4+6)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 11-14 (1d4+10)
