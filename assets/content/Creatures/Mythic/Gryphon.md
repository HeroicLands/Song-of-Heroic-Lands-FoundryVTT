---
aliases:
    - Gryphon
tags:
    - mythic
    - image-needed
name:
    full: Gryphon
    aliases: []
id: 3cvUtYLpqMrX5jpp
slug: gryphon
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 17
        end: 13
        agl: 14
        per: 19
        snt: 3
        aur: 7
        wil: 13
        rea: 8
        cre: 7
    attrRollFormula:
        str: 1d6+14
        end: 1d6+10
        agl: 1d6+11
        per: 1d6+16
        snt: 1d4+1
        aur: 1d4+5
        wil: 1d6+10
        rea: 1d4+6
        cre: 1d4+5
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 1
                - name: Left Wing
                  shortcode: lwingzone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 3
                - name: Right Wing
                  shortcode: rwingzone
                  probWeight: 2
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
                  probWeight: 4
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 2
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 3
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase: &a1
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 1
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase: *a1
                - name: Left Wing
                  shortcode: lwingloc
                  bodyPartCode: lwingpart
                  bleedingSusceptibility: none
                  amputability: low
                  shockValue: 1
                  probWeight: 10
                  protectionBase: &a2
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 1
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 3
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 3
                - name: Right Wing
                  shortcode: rwingloc
                  bodyPartCode: rwingpart
                  bleedingSusceptibility: none
                  amputability: low
                  shockValue: 1
                  probWeight: 10
                  protectionBase: *a2
                - name: Left Quarter
                  shortcode: lqtrloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 3
                  protectionBase: &a3
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 3
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 6
                  protectionBase: &a4
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 2
                - name: Right Quarter
                  shortcode: rqtrloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 3
                  protectionBase: *a3
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 6
                  protectionBase: *a4
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 1
        weight:
            base: 300
            calc: "300"
        reachBase: 0
        bodyScaleBase: 1.33
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 70
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: aerial
          feetPerRound: 200
          leaguesPerWatch: 12
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 80
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 62
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 66
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 40
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 80
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 70
        - name: Beak
          type: skill
          system:
              shortcode: beak
              subType: combattechnique
              masteryLevelBase: 75
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: beak
                  name: Beak
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 3
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
        - name: Talon
          type: skill
          system:
              shortcode: talon
              subType: combattechnique
              masteryLevelBase: 63
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: talon
                  name: Talon
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 10
                      modifier: 2
                      aspect: edged
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
        - name: Claw
          type: skill
          system:
              shortcode: claw
              subType: combattechnique
              masteryLevelBase: 63
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: claw
                  name: Claw
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: 2
                      aspect: edged
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

The first warning is the cry—a sound somewhere between a raptor's shriek and a lion's roar, echoing across the mountainside and setting your teeth on edge. Then you see it. The creature launches from its eyrie perch with terrible grace, its massive feathered wings catching the wind and climbing higher than any natural eagle should be able to reach. Yet this is no eagle. Where a bird's body should taper into a tail, the form of a great cat takes over—a lion's muscular frame, powerful haunches, and a tail that lashes the air with leonine authority. The contrast is startling: the fierce, intellectual precision of an avian predator merged with the raw carnivorous power of an apex terrestrial hunter.

As it descends toward you—if it has chosen you as quarry—you see the gryphon's full majesty. Its eagle head turns with unnatural rotational freedom, those golden eyes fixing upon you with intelligence and cruel amusement. The talons, each the size of a scimitar's blade, flex in anticipation. Its forelegs bear the weight of those tremendous wings, corded with muscle, while its hindquarters ripple with the predatory coiled readiness of a lion about to spring. The creature's plumage flows in shades of burnished bronze and deep gold, and where feathers meet fur, the transition is seamless—a masterwork of mythic design. Its breath comes in powerful huffs, each exhalation carrying the heat of a furnace and the musky scent of high peaks and untamed hunting grounds. Every moment you stand in its presence is a negotiation with death.

# Dossier {#dossier}

The gryphon is a creature of legend, combining the majesty of the king of birds with the ferocity of the king of beasts. Standing three to four feet high at the shoulder and measuring five to six feet from the grip of its forelegs to the tip of its tail, a mature gryphon weighs approximately three hundred pounds—lean and muscled rather than bulky, with the proportions of a supreme predator. The transition from eagle to lion is clean and natural, suggesting these creatures are not merely fused by some sorcerer's whim, but rather emerged from the foundational tapestry of creation itself as unified beings.

Gryphons are fiercely territorial, claiming vast mountainous ranges as their own. They live fifty to eighty years, forming long-term bonding pairs for breeding, though most spend much of the year in solitude. A gryphon's nest is built in the highest, most inaccessible peaks—places where the eagle's need for an eyrie and the lion's need for a defensible den merge. These aeries are meticulously maintained and decorated with treasures the creature finds beautiful: polished stones, metals it has stolen from humans, and bones of worthy prey arranged in patterns only the gryphon understands.

The creature's intelligence is significant—estimates place it at the level of a very bright human child, with emotional complexity approaching that of an adult. Gryphons hold grudges, feel pride, recognize individuals, and some have been known to mourn their dead. They are immune to casual intimidation but respond to respect, and throughout history, rare individuals have managed to bond with gryphons, creating partnerships that define epochs. Such bonded pairs are typically used as elite mounts and aerial scouts, their combination of strength and perception making them invaluable in warfare and exploration.

## Presentation

A gryphon's eagle half is massive—a head as large as a shield, with eyes that capture and reflect light like polished amber. Its beak, sharp enough to pierce armor, curves with lethal precision. The neck is thick and heavily feathered, capable of supporting the weight of its predatory head. From this, a body of pure muscle emerges, feathered in brown and gold until—at about where a lion's ribs would be—the transformation occurs. Feathers give way to tawny fur, and the structure becomes quadrupedal and feline. The lion's body is lithe but powerful, showing the muscles of a creature built for explosive power and sustained pursuit. The tail is a lion's tail—thick and muscular, often held high, used for balance and communication.

The gryphon's wings, when fully spread, can reach a span of twenty feet or more. They are powerful enough to lift the entire creature's weight with ease, and the flight is marked by supreme control—the gryphon does not flap continuously but rather glides on thermals, using quick, precise movements to adjust its course. The claws of its forelegs are talons rather than true cat's claws—massive, curved, and capable of tearing through a warrior's armor or rending stone. The hindlegs retain full lion functionality, with retractable claws that are slightly less impressive than the talons but still lethal.

## Key Behaviors

Gryphons are apex predators with complex social lives. In their mountainous territories, they hunt large game—elk, ibex, and wild horses—with a mixture of aerial ambush and terrestrial pursuit that combines the best tactics of both their natures. A gryphon will dive from the sky to harry prey toward cliff edges, or circle high and strike with coordinated precision. They do not hunt every day; a fresh kill can sustain them for several days, and they spend considerable time in their aeries, grooming their plumage, watching the skies, and seemingly contemplating their domains.

Gryphon pairs are devoted partners, and both male and female take active roles in raising their single offspring per breeding season. The parent gryphons are fiercely protective of their young and will engage in coordinated combat against any perceived threat, making a nesting pair more dangerous than any solitary gryphon. Unattached gryphons are more likely to be encountered as they wander, seeking territory or mates.

Territorially, gryphons will not tolerate other gryphons in their realm—battles between rivals are rare but devastating, often fought at high altitude over the course of hours. They do, however, recognize certain non-gryphon creatures as neutral or even allies: eagles and great hawks are tolerated, as are deer and mountain goats (the latter being preferred prey but not hunted if other food is available in their presence).

Interestingly, gryphons appear to have aesthetic preferences. Some are known to take particular routes through their territory that offer the most beautiful vistas, to collect shiny objects, and to show interest in unusual phenomena in their domain—lightning storms, rare birds, or unusual human activity. A gryphon that bonds with a human often does so because it recognizes something in that individual worthy of its respect: bravery, honor, or a kind of wildness that mirrors its own nature.

## Combat Strategy

A gryphon does not fight like a lion or like an eagle—it fights like both in concert. It will begin engagement from the air, using its superior altitude to assess threat and choose its point of attack. Against a single opponent, a gryphon will dive with talons extended, attempting to rake and claw as it passes, relying on the momentum of its fall and wing power to execute a strike and execute a safe retreat upward. If the opponent proves resilient or worthy, the gryphon may land and engage in close combat, using its wings to balance itself on its hindlegs—a posture that frees its forelegs for striking with both claws and talons.

A gryphon in sustained ground combat is a cyclone of violence. It will circle an opponent, striking from angles, using its wings as both weapons and shields, and transitioning fluidly between rearing up on hindlegs and dropping back to full quadrupedal stance. Its intelligence means it will exploit terrain—using hills and rocks for vantage, driving opponents toward cliff edges, or using elevation changes to gain diving advantage.

Against multiple opponents, a gryphon's strategy becomes more conservative. It will maintain altitude, strike weak-looking targets, and retreat if it appears it might be overwhelmed or trapped. Gryphons are not suicidal; they value their own lives and will break off a battle if the odds turn decisively against them. However, if defending territory or offspring, a gryphon will fight with utter ferocity, ignoring wounds that should prove debilitating.

## Attack Methods

### Diving Strike

The gryphon climbs high and accelerates downward in a controlled plunge, striking with both sets of talons extended. This attack combines the momentum of its aerial descent with the power of a creature weighing three hundred pounds, and it is capable of piercing armor, breaking bones, and opening grievous wounds. Targets struck by a successful diving strike are often knocked prone or staggered.

### Rending Claw

In close combat, the gryphon slashes with its forelegs, talons extended to their full terrible length. These attacks are quick, capable of being executed in succession, and if they connect with a target's face or head, can cause deep lacerations. The combination of strength and sharpness means even glancing blows draw blood.

### Bite

The gryphon's beak is an underutilized but formidable weapon. Unlike a lion's bite which is designed to crush, the gryphon's bite is designed to pierce and tear. It is typically used after a strike that has compromised an opponent's guard, or in circumstances where the gryphon is fully committed to a kill. The bite can sever limbs and is capable of cracking bone.

### Wing Buffer

The gryphon uses its massive wings not just for flight but as striking weapons. A full-power wing stroke can knock a standing opponent off their feet or interrupt an attack. The gryphon will sometimes use these movements defensively, creating distance or disrupting incoming attacks.

## Special Abilities

### Mythic Perception

The gryphon's sensory acuity combines the legendary sight of an eagle with the acute smell and hearing of a lion. It can spot movement from miles away, detect the presence of prey through dense forests, and hear the approach of riders from great distances. In combat, this translates to exceptional awareness of its surroundings and the activities of multiple opponents.

### Aerial Mastery

The gryphon's control of the air is supreme. It can execute impossible maneuvers—vertical climbs, instant course changes, and stable hovering—that defy physical intuition. It can land on cliff faces, rotate its entire body mid-flight, and judge distances from altitude with perfect accuracy. This ability allows it to fight in three dimensions in ways that grounded creatures cannot match.

### Roar of Command

The gryphon can issue a cry of such volume and harmonic intensity that it vibrates through bones and air alike. This roar can warn allies from incredible distances, disorient opponents (leaving them momentarily stunned or confused), or serve as a territorial declaration that carries for miles. The roar seems to resonate with power and intelligence, rather than being a mere animalistic sound.

### Bonding

Under rare and specific circumstances, a gryphon can form a permanent empathic bond with a humanoid. This is never forced and must be chosen by the gryphon itself, typically after months or years of contact and respect-building. Once bonded, the gryphon will serve as mount, companion, and guardian to the chosen human, granting them access to the gryphon's perception, physical abilities (through riding), and tactical intelligence. A bonded gryphon will die defending its chosen human. The bond persists even after the human's death, often driving the grieving gryphon to extreme territorial aggression or, in rare cases, a form of melancholy that persists for years.

## Attributes

- **Strength:** 15-20 (1d6+14)

- **Endurance:** 11-16 (1d6+10)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 17-22 (1d6+16)

- **Scent:** 2-5 (1d4+1)

- **Aura:** 6-9 (1d4+5)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 6-9 (1d4+5)
