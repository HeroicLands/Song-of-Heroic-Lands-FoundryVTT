---
aliases:
    - Rockback Bear
tags:
    - animal
name:
    full: Rockback Bear
    aliases: []
id: KRJCfi3ZMuOYTwFd
img: icons/game-icons/delapouite/bear-head.svg
portrait: ""
shortcode: rckbckbr
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 18
        end: 17
        dex: 11
        agl: 10
        per: 13
        aur: 9
        wil: 14
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+14
        end: 1d6+13
        dex: 1d6+7
        agl: 1d4+7
        per: 1d6+9
        aur: 1d4+6
        wil: 1d6+10
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 4
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 2
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
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
        weight:
            base: 300
            calc: "300"
        reachBase: 0
        bodyScaleBase: 1.38
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 60
          leaguesPerWatch: 4
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
              masteryLevelBase: 33
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 45
        - name: Massive Claw Swipe
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 60
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Massive Claw Swipe
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 3
                      aspect: edged
                  lengthBase: 2
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
        - name: Crushing Bite
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
                  name: Crushing Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 4
                      aspect: piercing
                  lengthBase: 1
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

The massive form rises from the underbrush, and suddenly the forest itself seems too small. Shaggy dark fur ripples across a muscular frame as the creature stands, towering above you, its breath forming clouds of mist. But it is the patches of rough, stone-like protrusions along its back and shoulders that capture your attention — as if the bear itself is part-stone, part-flesh, something caught between two states of being. The small, dark eyes burn with an intensity that belies their size, and the sound that emerges is somewhere between a growl and the scraping of stone on stone. Its massive paws flex, and you see the claws — dark, curved, and long as daggers — score deep gouges in the rock beneath its feet.

# Dossier {#dossier}

The Rockback Bear is a apex predator of high mountains and rocky slopes, standing 8-10 feet tall on hind legs and weighing over 1200 pounds, distinguished by the dense, rocky protrusions that cover its back, shoulders, and skull. These solitary, intensely territorial creatures are aggressive in defense of their domain and will actively hunt large prey. Adventurers might encounter rockback bears while traversing mountain passes, exploring alpine meadows, or disturbing a bear’s territory in search of resources.

## Presentation

The Rockback Bear presents a form of overwhelming muscular power covered in dark, shaggy fur that appears matted and weathered from years of rough terrain navigation. The distinctive feature is the rocky armor — rough, stone-like protrusions that grow along the back, shoulders, spine, and skull, creating a natural armoring that appears to be part of the creature itself. These growths are not dead stone but living bone covered in keratin, adapted for the bear’s mountain environment. The head is massive and bear-like, with small, deep-set dark eyes that burn with predatory intelligence, a powerful jaw capable of crushing bone, and ears that swivel to track sounds. The paws are enormous, each with five curved claws suitable for climbing, digging, and tearing. The tail is short and barely visible beneath the bear’s rear haunches.

## Key Behaviors

Rockback Bears are solitary, establishing and maintaining large territorial ranges across mountain terrain. They are omnivorous, consuming berries, roots, fish, and small animals when available, but they actively hunt larger prey including mountain goats, deer, and other predators that encroach on territory. Males are particularly territorial during spring mating season and become far more aggressive and likely to engage intruders. Rockbacks mark territory by clawing trees, overturning boulders, and leaving scat deposits. They are active primarily during daylight but will hunt opportunistically at any time. These bears are intelligent and capable of remembering individuals, learning patterns, and adjusting tactics based on experience.

## Combat Strategy

The rockback bear fights with overwhelming aggression and raw power, relying on its strength, armor, and ferocity to overwhelm opposition. It charges directly at threats, attempting to close distance and deliver devastating claw and bite attacks. Once engaged, it continues attacking with complete commitment, rarely retreating or showing mercy. A rockback injured but not mortally wounded becomes more aggressive, and one defending young or food source fights with suicidal determination. The bear uses terrain to advantage, charging downhill to increase impact force and positioning itself to use claws and jaws together in vicious combinations.

## Attack Methods

### Massive Claw Swipe

The rockback extends a foreleg and rakes claws across a target with overwhelming force. Each claw is capable of tearing through armor and flesh, creating gaping wounds that bleed freely. Multiple swipes in rapid succession create severe injuries.

### Crushing Bite

The bear’s jaw closes with tremendous force, capable of crushing bone, tearing off limbs, or pulping flesh. The bite is used to finish defeated opponents or to seize and shake prey.

### Shoulder Slam

The bear collides with an opponent using its massive body weight and muscular shoulders, capable of knocking even armored opponents backward and off balance with tremendous impact force.

### Grapple and Shake

If the bear manages to grasp a victim, it uses its immense strength to lift and shake them violently, inflicting impacts and trauma damage while attempting to position for a killing bite.

## Special Abilities

### Rocky Armor

The stone-like protrusions along the bear’s back, shoulders, and skull provide genuine armor protection that reduces damage from slashing and piercing weapons. The rocky growths are nearly equivalent to scale or leather armor in protection but are an integral part of the creature’s biology.

### Downhill Charge

When charging downhill, the rockback’s momentum and gravitational assistance increase the impact force of a charge attack, making such attacks significantly more likely to knock opponents off their feet and create openings for follow-up attacks.

### Primal Ferocity

Once the rockback engages in combat, it commits with absolute totality and rarely retreats, even when injured or outnumbered. The bear’s aggression and determination make it a terrifying opponent that cannot be intimidated or demoralized.

### Mountaineer Instinct

The rockback is extraordinarily capable on difficult terrain, moving with confidence and speed across steep slopes, loose rock, and unstable ground where humanoids would struggle. It gains advantage in combat when fighting on mountain terrain.

### Regenerative Nature

The rockback’s body heals with remarkable speed, recovering from wounds over days or weeks that would cripple other creatures. Minor wounds close within hours, and even severe injuries show recovery within days.

### Additional Information

Rockback bears avoid humanoid settlements and travel routes through learned experience — a bear that has never encountered humans is more likely to ignore them. However, bears that have been hunted develop deep enmity toward humanoids and will actively seek revenge. A rockback defending cubs becomes nearly unstoppable and will pursue intruders for extended distances. The bear’s rocky armor can be harvested after death by expert armorers and used to craft protective gear, making rockbacks valuable but dangerous targets for hunters.

## Attributes

- **Strength:** 15-20 (1d6+14)

- **Endurance:** 14-19 (1d6+13)

- **Dexterity:** 8-13 (1d6+7)

- **Agility:** 8-11 (1d4+7)

- **Perception:** 10-15 (1d6+9)

- **Aura:** 7-10 (1d4+6)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
