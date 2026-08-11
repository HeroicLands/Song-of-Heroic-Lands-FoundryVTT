---
aliases:
    - Forest Goblin
tags:
    - folk
name:
    full: Forest Goblin
    aliases: []
id: B24v0x403YmclrJb
img: icons/game-icons/caro-asercion/goblin.svg
portrait: ""
shortcode: frstgbln
type: creature
package: sohl
sohl:
    kbcat: goblin
    archetype: 0
    attributes:
        str: 8
        end: 9
        dex: 15
        agl: 15
        per: 13
        aur: 8
        wil: 9
        rea: 9
        cre: 13
    attrRollFormula:
        str: 1d4+5
        end: 1d4+6
        dex: 1d4+12
        agl: 1d4+12
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
        - shortcode: limbblock
          type: skill
        - shortcode: press
          type: skill
        - shortcode: bflkpunch
          type: skill
        - shortcode: trip
          type: skill
---

# Appearance {#appearance}

A shape in the green flickers at the edge of perception. Forest goblins are small, wiry things, three to four feet tall, with skin that shifts between deep green and earthy brown depending on the season. They wear the forest as clothing—leaves woven into garments, feathers braided into wild hair, bark strips forming armor. Their eyes are bright and alert, constantly tracking movement and sound. When they move, they do so with flowing grace, as though the forest itself is merely an extension of their bodies. They seem less like creatures of civilization and more like the forest made aware.

# Dossier {#dossier}

Forest goblins are sapient beings that dwell in deep woodlands, existing as solitary hunters and loose aggregations of opportunity rather than communities. Each forest goblin is focused on personal advancement, personal hunger, and personal amusement. They are bound together by cultural traditions and by occasional alliances of convenience, but these bonds are fragile and subject to disruption by personal greed. A forest goblin encountered alone is pursuing individual goals; a group is either a hunting party with shared prey or an assembly that may turn on each other at any moment. They view forest dwellers as resources or competition. They view surface dwellers as ignorant and amusing. They understand the forest on a level that other species can barely conceive.

## Presentation

Forest goblins stand three to four feet tall, with wiry builds that suggest evolution for climbing and traversing dense undergrowth. Their skin is dark green to earthy brown, often mottled or striped with patterns that provide natural camouflage. Their features are sharp-angled—pointed ears that are mobile and highly attuned to sound, large bright eyes that seem to reflect light, wide mouths that display sharp teeth. Their hair is long and wild, usually matted and decorated with feathers, leaves, small bones, and trinkets. Their clothing is woven from natural materials—bark cloth, leather, vine-woven garments, adorned with shells, teeth, claws, and other trophies from their exploits.

## Key Behaviors

Forest goblins are opportunistic and individualistic. They hunt the forest continually and seem to take pleasure in the hunt as much as in the acquisition of food. Each goblin is focused on personal status within the social hierarchy of their kind, and they accumulate trophies, kills, and stories to enhance their standing. Multiple goblins in an area may hunt cooperatively if prey is large, but they quickly dissolve back into solitary pursuits. They are highly territorial about specific hunting grounds and will drive out competitors. They seem to view most other species as either prey, competition, or entertainment. Their treatment of captured humanoids varies based on whim—some are killed immediately, some are tortured for amusement, some are released to spread tales of goblin prowess.

## Combat Strategy

Forest goblins are ambush specialists. They attack from above from trees, from concealment in undergrowth, from positions of advantage where their superior agility and local knowledge dominate. They rarely engage in open combat; instead, they use the forest to create kill zones. A forest goblin alone will often flee if the fight turns against them. Multiple goblins coordinate simple tactics—some creating distraction while others position for devastating strikes. They favor ranged weapons—shortbows, blowguns, sling weapons—and follow up with spear or knife if an enemy gets close. Most weapons are treated with natural toxins derived from forest plants and insects.

## Attack Methods

### Shortbow Attack

The goblin fires arrows from a bow with impressive accuracy, often from range and concealment. The arrows are frequently coated with toxins that cause pain, numbness, or sickness.

### Blowgun Dart

A small, precise dart fired from a blowgun, often coated with paralytic toxins. The goblin remains hidden while firing and is difficult to locate in dense foliage.

### Spear or Knife Strike

Once prey is wounded or distracted, the goblin moves in for close-range attacks with spear or bone knife. These attacks are quick and designed for killing blows against already-weakened targets.

### Trap Exploitation

Forest goblins are experts at creating deadfall traps, snares, and pit traps. They regularly exploit pre-existing traps when leading prey through their territory.

## Special Abilities

### Forest Mastery

In forest environments, forest goblins move with silence and grace that other species cannot match. They climb trees, traverse dense undergrowth, and navigate three-dimensional forest space with ease and speed.

### Camouflage

The goblin's natural coloring and clothing allow them to blend seamlessly with forest foliage. In dense vegetation, they become nearly invisible, especially to outsiders unfamiliar with tracking small creatures.

### Toxin Knowledge

Forest goblins understand how to identify, extract, and apply toxins from forest plants and insects. Their weapons frequently carry coatings with paralytic, pain-inducing, or sickness-causing agents.

### Tracking

The forest goblin is an expert tracker, able to follow prey through the forest with ease. They can identify tracks, scents, and disturbances in vegetation that other species miss entirely.

### Trickster's Wit

Forest goblins are natural deceivers and liars, skilled at creating confusion through misdirection and false claims. They understand psychology and can manipulate outsiders into making poor decisions.

## Additional Information

Forest goblins are territorial but not as fiercely so as cave goblins. An individual goblin can sometimes be negotiated with if approached correctly and offered something they value—certain foods, weapons, shiny objects, or entertainment. They are far more likely to be amused than offended by human intrusion into their territory if the humans demonstrate respect for forest traditions. A group of forest goblins is much less predictable and negotiation becomes difficult. Those venturing into deep forests should realize that forest goblins have already seen them, have assessed their value, and are deciding what to do about them.

## Attributes

- **Strength:** 6-9 (1d4+5)

- **Endurance:** 7-10 (1d4+6)

- **Dexterity:** 13-16 (1d4+12)

- **Agility:** 13-16 (1d4+12)

- **Perception:** 11-14 (1d4+10)

- **Aura:** 6-9 (1d4+5)

- **Will:** 7-10 (1d4+6)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 11-14 (1d4+10)
