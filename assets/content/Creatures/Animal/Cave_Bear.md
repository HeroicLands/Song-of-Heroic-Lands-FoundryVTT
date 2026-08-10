---
aliases:
    - Cave Bear
tags:
    - animal
name:
    full: Cave Bear
    aliases: []
id: R0digTz25VXmF4uo
slug: cave-bear
img: icons/game-icons/delapouite/bear-head.svg
portrait: ""
shortcode: cavebear
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 28
        end: 21
        agl: 10
        per: 14
        snt: 7
        aur: 5
        wil: 15
        rea: 5
        cre: 5
    attrRollFormula:
        str: 1d6+25
        end: 1d6+18
        agl: 1d6+7
        per: 1d6+11
        snt: 1d4+5
        aur: 1d4+3
        wil: 1d6+12
        rea: 1d4+3
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 4
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 4
                - name: Torso
                  shortcode: torsozone
                  probWeight: 8
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 4
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
                  roles: &a1
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 1
                - name: Right Foreleg
                  shortcode: rforelegpart
                  bodyZoneCode: forelegszone
                  roles: *a1
                  canHoldItem: false
                  probWeight: 1
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Hind Leg
                  shortcode: lhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 9
                - name: Right Hind Leg
                  shortcode: rhindlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 9
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindqtrzone
                  roles: []
                  canHoldItem: false
                  probWeight: 2
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 10
                      edged: 9
                      piercing: 8
                      fire: 10
        weight:
            base: 1000
            calc: "1000"
        reachBase: 0
        bodyScaleBase: 1.84
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 90
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 70
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 30
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 40
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 84
        - name: Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 60
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
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 9
                      aspect: piercing
                  lengthBase: 3
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
                      armorReduction: 1
        - name: Claw
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 48
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
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 8
                      aspect: edged
                  lengthBase: 4
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
---

# Appearance {#appearance}

The stench hits first: ancient earth and decay, the smell of something that has slept for centuries in airless darkness. Something shifts in the shadows ahead, and your eyes struggle to comprehend the sheer mass rising before you. Its coat, matted and streaked with cave dust and debris, seems to absorb light rather than reflect it. The sound of claws scraping against stone—each talon as long as a dagger—reverberates through the cavern with a grinding finality. When it breathes, the exhalation carries the warmth of a hibernating giant finally stirring, and the cave itself seems to tremble with the weight of its presence.

# Dossier {#dossier}

The Cave Bear is an apex predator of mountains and deep caverns, representing evolution perfected for a life of isolated predation. Standing up to ten feet tall on hind legs and weighing upward of two thousand pounds, the Cave Bear is physically larger than its brown bear cousins and built with even greater muscle mass. These solitary creatures are thought to be remnants of an older age—some believe they are prehistoric beings that evolution has outpaced, clinging to existence in regions humans cannot easily reach. Cave Bears are extraordinarily territorial, defending their lairs and surrounding hunting grounds against all comers with suicidal ferocity. Unlike other bears, they show no inclination to avoid human conflict; instead, they seem to view humans as intruders in their domain, deserving of death. Adventurers exploring deep caves, mountain passes, or ancient ruins may encounter these creatures defending territory that has been theirs for centuries.

## Presentation

A creature of primal power—a massive quadruped that rises to overwhelming height when it rears. Its frame is more heavily muscled than a brown bear, with shoulder muscles particularly pronounced and powerful. The fur is thick and shaggy, typically dark brown to nearly black, matted and streaked with cave dust, mud, and the remnants of past kills. The head is notably large with a pronounced brow ridge, a broad and flat muzzle, and relatively small eyes positioned forward-facing for hunting precision. The jaws are immense and capable of crushing bone, with canine teeth an inch or more long. The paws are enormous, each ending in curved claws that measure four to six inches in length—naturally adapted for tearing meat and rock alike. The claws are typically dark and worn, grooved by use against stone. The general impression is of a creature locked in time, carrying genetics and instincts from an earlier age when such predators were common rather than rare.

## Key Behaviors

Cave Bears are strictly solitary outside of mating season. A territory-holding bear may range across fifteen to twenty-five square miles of caves and adjacent terrain, marking boundaries with claw marks on trees and stone, and depositing scat at territorial markers. They are primarily carnivorous, hunting large prey: elk, deer, aurochs, and occasionally human travelers. They are ambush hunters despite their size, capable of surprising prey through patience and knowledge of terrain. During hibernation season, they select deep, secure cave systems and enter extended torpor, emerging in spring lean and aggressive. A female with cubs is extraordinarily dangerous—even more so than males. They have the longest memory of any bear species, remembering the location of previous kills, favorable hunting territories, and threats across years or decades. A Cave Bear that has successfully killed humans will become progressively bolder, viewing humans not as threats but as prey or territorial rivals.

## Combat Strategy

A Cave Bear’s typical response to human intrusion is immediate and violent attack. The bear does not posture or threaten—it assesses the threat and either charges or withdraws to continue its activity. Its strategy is to use its overwhelming size and strength to close distance rapidly, crash into the threat, and kill through raw force. A charging Cave Bear is virtually impossible to stop; defensive structures can be shattered, shield walls broken, mounted troops unhorsed. The bear will use its weight to pin targets and its claws and jaws to inflict maximum damage. Against multiple opponents, a Cave Bear will still focus its aggression, driving at the nearest threat with focus that ignores peripheral dangers. A wounded Cave Bear becomes more aggressive, not less—pain triggers deeper predatory instinct, and the bear will continue fighting until literally incapable of movement.

## Attack Methods

### Devastating Claw Swipe

The bear rakes with claws each the length of a dagger, attempting to disembowel or sever limbs with a single strike. The force behind these claws can penetrate armor, shatter bone, and open wounds from which blood pours freely. Multiple successive rakes in rapid succession can reduce an armored opponent to a bleeding, crippled state in seconds. The claws frequently break off in wounds, leaving splinters of bone-hard chitin that become embedded in tissue.

### Crushing Bite

The Cave Bear’s jaws close with force sufficient to break steel, crushing skull bones and severing spines. A target caught in these jaws will be violently shaken, multiplying the damage and potentially dislocating joints or breaking limbs. The teeth leave puncture wounds prone to severe infection, and the bear’s bite itself can transmit diseases from its saliva.

### Unstoppable Charge

The bear accelerates toward its target with full body weight behind it, using the force of impact to knock opponents backward, downward, and off-balance. The collision alone can inflict bone-breaking trauma. If the charge connects, the bear will often pin the target and continue attacking with claws and jaws without mercy.

### Crushing Body Slam

Using its weight as a weapon, the bear falls upon or throws itself against opponents, attempting to crush them beneath its mass. This attack is most effective against targets already on the ground or those who have been knocked down.

## Special Abilities

### Overwhelming Strength and Resilience

Cave Bears possess physical power that exceeds even brown bears by a significant margin. They can overturn massive boulders, break through wooden doors and structures, and crush stone with their jaws. Their skeletal density and muscle composition give them extraordinary resistance to both cutting and blunt trauma. Weapons that would cripple humans pass through or bounce off without crippling effect.

### Ancient Predatory Instinct

The Cave Bear hunts with intelligence and patience that exceeds most creatures. It will stalk prey for hours, exploit terrain to maximize advantage, and attack at moments of weakness. It learns from encounters and adapts tactics. This is not a mindless beast but a calculating predator of terrifying effectiveness.

### Territorial Fury

Unlike other bears, Cave Bears do not tolerate intrusion. They view territorial violation as an existential threat and respond with absolute violence. This fury can override pain and self-preservation, making a cornered or defending Cave Bear nearly impossible to disengage from combat.

### Exceptional Endurance

Cave Bears can sustain physical exertion and combat for extended periods, accumulating fatigue slowly. Their reserves of strength seem almost inexhaustible. A Cave Bear may continue fighting long after creatures of similar size would collapse from exhaustion.

## Attributes

- **Strength:** 26-31 (1d6+25)

- **Endurance:** 19-24 (1d6+18)

- **Agility:** 8-13 (1d6+7)

- **Perception:** 12-17 (1d6+11)

- **Scent:** 6-9 (1d4+5)

- **Aura:** 4-7 (1d4+3)

- **Will:** 13-18 (1d6+12)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 4-7 (1d4+3)
