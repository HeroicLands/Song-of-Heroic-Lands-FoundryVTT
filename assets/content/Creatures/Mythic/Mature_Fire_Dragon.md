---
aliases:
    - Mature Fire Dragon
tags:
    - mythic
    - image-needed
name:
    full: Mature Fire Dragon
    aliases: []
id: KnuTXF76FU1MTtAN
slug: mature-fire-dragon
img: icons/game-icons/faithtoken/dragon-head.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 48
        end: 36
        dex: 7
        agl: 9
        per: 15
        snt: 3
        aur: 13
        wil: 19
        rea: 13
        cre: 11
        emp: 10
        elo: 13
    attrRollFormula:
        str: 1d6+45
        end: 1d6+33
        dex: 1d4+5
        agl: 1d4+7
        per: 1d6+12
        snt: 1d4+1
        aur: 1d6+10
        wil: 1d6+16
        rea: 1d6+10
        cre: 1d6+8
        emp: 1d6+7
        elo: 1d6+10
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 8
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 8
                - name: Left Wing
                  shortcode: lwingzone
                  probWeight: 6
                - name: Torso
                  shortcode: torsozone
                  probWeight: 8
                - name: Right Wing
                  shortcode: rwingzone
                  probWeight: 6
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 8
                - name: Tail
                  shortcode: tailzone
                  probWeight: 6
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: forelegszone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 1
                - name: Right Foreleg
                  shortcode: rforelegpart
                  bodyZoneCode: forelegszone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 1
                - name: Left Wing
                  shortcode: lwingpart
                  bodyZoneCode: lwingzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Right Wing
                  shortcode: rwingpart
                  bodyZoneCode: rwingzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Left Hind Leg
                  shortcode: lhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 1
                - name: Right Hind Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 1
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: tailzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 3
                  protectionBase: &a1
                      blunt: 22
                      edged: 24
                      piercing: 23
                      fire: 21
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 7
                  protectionBase: *a1
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 7
                  protectionBase: &a2
                      blunt: 22
                      edged: 24
                      piercing: 23
                      fire: 21
                - name: Left Fore Foot
                  shortcode: lfftloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 3
                  protectionBase: &a3
                      blunt: 20
                      edged: 22
                      piercing: 21
                      fire: 19
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: medium
                  amputability: medium
                  shockValue: 3
                  probWeight: 7
                  protectionBase: *a2
                - name: Right Fore Foot
                  shortcode: rfftloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 3
                  protectionBase: *a3
                - name: Left Wing
                  shortcode: lwingloc
                  bodyPartCode: lwingpart
                  bleedingSusceptibility: none
                  amputability: low
                  shockValue: 1
                  probWeight: 10
                  protectionBase: &a5
                      blunt: 16
                      edged: 18
                      piercing: 17
                      fire: 15
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 7
                  protectionBase: &a4
                      blunt: 22
                      edged: 24
                      piercing: 23
                      fire: 21
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase: *a4
                - name: Right Wing
                  shortcode: rwingloc
                  bodyPartCode: rwingpart
                  bleedingSusceptibility: none
                  amputability: low
                  shockValue: 1
                  probWeight: 10
                  protectionBase: *a5
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: low
                  shockValue: 3
                  probWeight: 7
                  protectionBase: &a6
                      blunt: 22
                      edged: 24
                      piercing: 23
                      fire: 21
                - name: Left Hind Foot
                  shortcode: lhftloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 3
                  protectionBase: &a7
                      blunt: 20
                      edged: 22
                      piercing: 21
                      fire: 19
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: low
                  shockValue: 3
                  probWeight: 7
                  protectionBase: *a6
                - name: Right Hind Foot
                  shortcode: rhftloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 3
                  protectionBase: *a7
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 20
                      edged: 22
                      piercing: 21
                      fire: 19
        weight:
            base: 3000
            calc: "3000"
        reachBase: 0
        bodyScaleBase: 4.36
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 65
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: aerial
          feetPerRound: 190
          leaguesPerWatch: 16
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 85
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 80
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 85
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 84
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 66
        - name: Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 80
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 19
                      aspect: piercing
                  lengthBase: 8
                  defense:
                      block:
                          disabled: true
                          modifier: 0
                          successLevelMod: 0
                      counterstrike:
                          disabled: false
                          modifier: 0
                          successLevelMod: 0
                  traits:
                      noBlock: true
                      armorReduction: 3
        - name: Claw
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 75
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Claw
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 12
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 10
                      modifier: 18
                      aspect: edged
                  lengthBase: 7
                  defense:
                      block:
                          disabled: true
                          modifier: 0
                          successLevelMod: 0
                      counterstrike:
                          disabled: false
                          modifier: 0
                          successLevelMod: 0
                  traits:
                      noBlock: true
        - name: Tail
          type: skill
          system:
              shortcode: tail
              subType: combattechnique
              masteryLevelBase: 70
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: tail
                  name: Tail
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 16
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 17
                      aspect: blunt
                  lengthBase: 9
                  defense:
                      block:
                          disabled: true
                          modifier: 0
                          successLevelMod: 0
                      counterstrike:
                          disabled: false
                          modifier: 0
                          successLevelMod: 0
                  traits:
                      noBlock: true
        - name: Breath
          type: skill
          system:
              shortcode: breath
              subType: combattechnique
              masteryLevelBase: 84
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: breath
                  name: Breath
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 4
                      modifier: 15
                      aspect: fire
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 60
                  drawBase: 0
                  traits:
                      breath: true
                      impactBands: 15 · 11 · 7
---

# Appearance {#appearance}

The mountain itself seems to hold its breath.

You climb through the pass at dawn, unaware that every stone beneath your feet, every ash drift on the wind, belongs to something vast and breathing. The sky ahead is wrong—hazier than it should be, darkened at the edges as if a storm is gathering. But there are no clouds. Instead, the air grows thick with heat and the stench of sulfur, a presence so heavy it presses against your skin like a living thing.

Then you hear it. Not a roar—something deeper. A rumble that travels through the stone beneath your feet, shaking loose gravel from the cliffs above. Your body recognizes the sound before your mind can process it: _mine_. This place belongs to something, and you are trespassing.

The dragon emerges from the thermal haze like a god made manifest. Twenty-four feet of pure dominion, with wings that span thirty-six feet and catch the light like molten copper. Its scales burn in shades of crimson and gold so vivid they seem almost impossible—patterns that shift in the heat distortion, making the creature seem larger than it truly is. A crown of spines runs down its spine, each one wickedly sharp. Its eyes are ancient despite its relative youth, holding the weight of centuries of prey and conquest.

It has not seen you yet. But the moment stretches. The air around it shimmers and writhes with thermal distortion. The heat is intense enough to make breathing painful. This is a dragon that has claimed territory, established itself, and learned the true scope of its power. It does not hunt out of hunger or youthful desperation. It hunts because it chooses to, because the world around it is its domain and everything in it is subject to its will. When it finally notices you—and it will—there will be no escape, no mercy, no negotiation. Only the recognition of your own insignificance.

The dragon shifts, and the entire mountain trembles.

# Dossier {#dossier}

The Mature Fire Dragon stands at the apex of dragonkind's power and knowledge. Between three and four centuries old, it has established and consolidated territory, accumulated a vast and carefully curated hoard, and learned the art of predatory strategy. A mature dragon is calculating, cruel, and absolutely certain of its supremacy.

Unlike young dragons driven by impulse, a mature fire dragon selects its targets with purpose. It understands economics, geography, and the flow of trade routes. A dragon in this stage of life may control a region through strategic intimidation, burning caravans to keep trade away from its territory or allowing merchants through in exchange for tribute. It remembers favors, debts, and insults with perfect clarity across decades.

Mature fire dragons are territorial but not solitary in nature—they are known to take consorts, though such relationships are fraught with danger. They lay eggs in carefully defended lairs and may actively defend nesting chambers. Some maintain informal arrangements with other creatures, using them as servants or sentries in exchange for protection.

These dragons are the basis of regional legends. Kingdoms plan their policies around dragon territory. Military campaigns are rerouted to avoid confirmed sightings. Entire towns have been built with the understanding that they exist at a dragon's sufferance.

## Presentation

A mature fire dragon is powerfully built, with musculature visible beneath the thick, overlapping armor of its scales. The coloration is more vivid than younger dragons: deep crimsons, burnished golds, and oranges so intense they seem to hold actual flame. The scales themselves are thick and beveled, creating a pattern that deflects most blows. A crown of spines runs down the spine from head to tail, each spine wickedly pointed and capable of piercing armor.

The creature is twenty-four feet in length from snout to rump, with a wingspan extending to thirty-six feet. The wings are powerful and graceful, capable of sustained flight even when carrying prey. The tail is thick, muscular, and scarred from centuries of territorial disputes. The dragon's eyes are large and intelligent, burning with molten amber intelligence.

Heat radiates from the dragon in visible waves. The ground where it walks is scorched dark. Its breath steams even in warm weather, and a faint aura of wavering light surrounds it at all times.

## Key Behaviors

**Strategic Dominance:** The dragon controls its territory through deliberate actions and calculated intimidation. It may allow certain activities in exchange for tribute or restrict passage to maintain power.

**Hoard Obsession:** The dragon's hoard is vast and carefully organized. Every piece has been selected and is accounted for. The dragon visits the hoard regularly and attacks with apocalyptic fury if anything is disturbed or missing.

**Excellent Memory:** The dragon remembers every transaction, every insult, every broken agreement. It holds grudges for centuries and actively seeks opportunities for revenge.

**Limited Social Engagement:** A mature dragon may communicate with intelligent creatures, particularly if there is some transactional benefit. It expects obedience and absolute honesty; deception is punished with death.

**Culling of Competitors:** The dragon will hunt down and destroy rival predators that threaten its dominance, particularly other dragons. Territorial conflicts between mature dragons are catastrophic regional events.

**Selective Mercy:** Occasionally, a mature dragon will spare a creature to serve a purpose—as a servant, messenger, or tool. Such mercy is never free; there is always a price.

## Combat Strategy

A mature dragon is a master of predatory tactics. It uses terrain to its advantage, positioning itself where it can rain fire on enemies while remaining difficult to reach. It understands the limitations and capabilities of humanoid foes and exploits them ruthlessly.

The dragon will attempt to eliminate the most dangerous threats first, identifying spellcasters or heavily armed fighters and focusing fire breath and melee attacks on them. It uses flight to maintain favorable positioning, diving to strike and then climbing rapidly to escape retaliation.

When facing a significant force, the dragon may employ area denial tactics, setting fire to terrain features to restrict movement and force enemies into vulnerable positions. It is not above retreating if it takes significant damage, but this retreat is tactical—the dragon will circle around and re-engage from an unexpected angle.

The mature dragon understands psychology and may attempt to break the will of its enemies through displays of overwhelming power, waiting for fear to do half the work before closing in for the kill.

## Attack Methods

### Bite

The mature dragon's bite is a devastating attack capable of severing limbs or even decapitating larger creatures. The force involved is immense, and teeth long as daggers can pierce armor plating. The dragon often uses a bite to grab and pin prey before raking with claws or following up with fire breath.

### Claw Rake

The dragon rakes with both front claws in precise, controlled combinations. A mature dragon has learned to use these attacks to force opponents into defensive postures, creating openings for more devastating follow-ups. The claws can shred plate armor and pierce scale.

### Wing Buffet

The dragon sweeps its wings in powerful arcs, generating enough force to knock creatures prone or off balance. This attack can be used to create distance or to position enemies for fire breath attacks.

### Tail Sweep

The dragon whips its powerful tail in wide arcs, striking multiple targets and using the appendage as a prehensile weapon. The tail is strong enough to topple walls or flip overturned wagons, and a direct hit from a mature dragon's tail can break bones.

### Fire Breath

The dragon exhales a 30-foot cone of roiling flame. The fire is hot enough to melt stone and ignites all combustibles instantly. The breath weapon can be used repeatedly, though the dragon will pace its use to avoid complete exhaustion.

## Special Abilities

### Fire Breath

The mature dragon can exhale a 30-foot cone of intense flame as an action. Creatures caught in the area of effect suffer severe thermal damage. Stone and earth take lasting damage; structures in the path may partially collapse. The dragon can use this ability multiple times before tiring.

### Flight

The dragon is a powerful flier capable of carrying substantial loads and engaging in sophisticated aerial combat. It can remain aloft for extended periods and uses flight to gain tactical advantage in any engagement.

### Armored Scales

The dragon's scales are thick and heavily beveled, providing substantial protection against physical damage. Most conventional weapons inflict minimal damage; magical weapons or sustained siege-weapon fire is required to penetrate deeply.

### Heat Aura

Intense heat radiates from the dragon in a 60-foot radius. Temperatures in this area rise dramatically. Creatures are uncomfortable and fatigue more quickly; prolonged exposure can cause heat exhaustion or burns on exposed skin. Vegetation wilts, water evaporates, and stone begins to crack.

### Draconic Presence

The dragon radiates an aura of predatory dominance. Intelligent creatures within 60 feet of the dragon experience a profound sense of dread and recognize the creature's overwhelming power. This presence can unsettle horses, dogs, and other animals into panic.

### Fire Immunity

The dragon is completely immune to fire and heat. It can swim through lava, sleep on burning coals, and breathe in superheated environments without discomfort. Its immunity extends to its gear and possessions.

## Attributes

- **Strength:** 46-51 (1d6+45)

- **Endurance:** 34-39 (1d6+33)

- **Dexterity:** 6-9 (1d4+5)

- **Agility:** 8-11 (1d4+7)

- **Perception:** 13-18 (1d6+12)

- **Scent:** 2-5 (1d4+1)

- **Aura:** 11-16 (1d6+10)

- **Will:** 17-22 (1d6+16)

- **Reasoning:** 11-16 (1d6+10)

- **Creativity:** 9-14 (1d6+8)

- **Empathy:** 8-13 (1d6+7)

- **Eloquence:** 11-16 (1d6+10)
