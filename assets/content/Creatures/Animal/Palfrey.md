---
aliases:
    - Palfrey
tags:
    - animal
name:
    full: Palfrey
    aliases: []
id: tj9o2Ujavc9DuSxb
slug: palfrey
img: icons/game-icons/delapouite/horse-head.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 26
        end: 10
        agl: 11
        per: 17
        snt: 4
        aur: 4
        wil: 10
        rea: 4
        cre: 4
    attrRollFormula:
        str: 1d6+23
        end: 1d6+7
        agl: 1d4+9
        per: 1d6+14
        snt: 1d4+2
        aur: 1d4+2
        wil: 1d6+7
        rea: 1d4+2
        cre: 1d4+2
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
                  probWeight: 7
                - name: Hind Legs
                  shortcode: hindlegszone
                  probWeight: 6
                - name: Tail
                  shortcode: tailzone
                  probWeight: 1
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  canHoldItem: false
                  combatArea: 4
                - name: Left Foreleg
                  shortcode: lforelegpart
                  bodyZoneCode: forelegszone
                  canHoldItem: false
                  combatArea: 2
                - name: Right Foreleg
                  shortcode: rforelegpart
                  bodyZoneCode: forelegszone
                  canHoldItem: false
                  combatArea: 2
                - name: Torso
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  canHoldItem: false
                  combatArea: 7
                - name: Left Rear Leg
                  shortcode: lrearlegpart
                  bodyZoneCode: hindlegszone
                  canHoldItem: false
                  combatArea: 3
                - name: Right Rear Leg
                  shortcode: rrearlegpart
                  bodyZoneCode: hindlegszone
                  canHoldItem: false
                  combatArea: 3
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: tailzone
                  canHoldItem: false
                  combatArea: 1
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Leg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 1
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Leg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 1
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Flank
                  shortcode: flkloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Quarter
                  shortcode: lqtrloc
                  bodyPartCode: lrearlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lrearlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Quarter
                  shortcode: rqtrloc
                  bodyPartCode: rrearlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rrearlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 1
                  protectionBase:
                      blunt: 5
                      edged: 4
                      piercing: 2
                      fire: 4
        weight:
            base: 1000
            calc: 1000
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 130
          leaguesPerWatch: 10
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
              masteryLevelBase: 56
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 21
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 21
---

# Appearance {#appearance}

The horse approaches with a measured, almost gliding stride, its motion so smooth it seems the rider barely rocks in the saddle. Dappled sunlight plays across its well-groomed coat, rich chestnut or gray depending on bloodline, rippling with each effortless step. Its head carries high, ears alert but relaxed, dark eyes showing intelligence and calm acceptance. There is nothing hurried or aggressive in its bearing — only a quiet competence that speaks of miles and hours of reliable travel.

# Dossier {#dossier}

The palfrey is a refined riding horse selectively bred by nobility for comfort and endurance across long distances, typically standing 14-15 hands tall and weighing 800-1000 pounds. These mounts are not creatures of war or speed racing but rather the preferred conveyance of ladies, couriers, and wealthy merchants who value steady progress over dramatic performance. A traveling party might own a palfrey or hire one along established trade routes, making it a commonplace sight in civilized lands.

## Presentation

Palfreys display refined proportions with long, graceful necks, sloping shoulders, and legs built for stamina rather than explosive power. Their coats typically display clear solid colors — chestnut, gray, bay, or black — usually well-maintained and often marked with heraldic trappings, fancy saddles, and decorative tack. The face is alert but kind-natured, with large, intelligent eyes and ears that respond to subtle commands. Compared to warhorses, palfreys appear lighter and more elegant, lacking the massive musculature and commanding presence of military mounts.

## Key Behaviors

Palfreys are temperamentally calm and responsive to their riders, having been selected for generations for obedience and steady nerves. They focus entirely on the task of traveling, maintaining a consistent, distance-eating gait through varied terrain. These horses are social creatures that travel well in groups but form strong bonds with individual riders and handlers. They are primarily diurnal, preferring to travel during daylight hours and settle during dusk. Their diet consists of grass, grain, and hay, and they require regular water and rest. Without an experienced handler, palfreys become anxious and may refuse to travel.

## Combat Strategy

A palfrey has no combat training and will attempt to flee from violence whenever possible. If startled or cornered, it becomes unpredictable, rearing and bucking in panic rather than engaging with calculated strategy. Without a skilled rider providing direction and confidence, the palfrey's instinct is to run. If trapped or blocked from escape and directly attacked, it will use its hooves defensively, striking at immediate threats, but combat is antithetical to its nature. Wise riders recognizing danger will dismount and lead the palfrey away rather than attempting to fight mounted.

## Attack Methods

### Hoof Strike

Cornered or panicked, the palfrey rears slightly and lashes out with a foreleg strike, using its weight and muscle to injure something nearby. These strikes are desperate defensive reactions rather than tactical combat moves.

### Rear and Buck

A palfrey surprised by violence often rears up on hind legs and then kicks backward with both hind legs in a panic response. This can unseat an unprepared rider and cause injury to threats approaching from behind, though the horse is purely reacting to fear rather than fighting with intent.

## Special Abilities

### Endurance Gait

The palfrey moves with a distinctive, smooth four-beat gait that minimizes rider fatigue and allows steady progress across long distances. It can maintain a controlled pace for hours without tiring, making it the mount of choice for journeys spanning days or weeks. The horse's natural rhythm and comfortable motion make travel less exhausting for the rider.

### Steady Temperament

Palfreys are bred for emotional stability and will not spook at common sights, sounds, or situations. They remain calm in crowded markets, on uncertain footing, and during weather changes. This reliability makes them trustworthy on difficult terrain where panic would be dangerous.

### Additional Information

Palfreys have little resale value after injury or significant training loss — nobles will abandon an injured palfrey rather than attempt recovery. Their calm nature makes them unsuitable for theft; they will not move willingly with an unfamiliar handler. A palfrey's shoes must be regularly reset and its hooves maintained, making them expensive to own and care for. In wilderness areas without established stables or farrier services, palfrey owners face serious logistical challenges.

## Attributes

- **Strength:** 8-13 (1d6+7)

- **Endurance:** 12-17 (1d6+11)

- **Dexterity:** 10-15 (1d6+9)

- **Agility:** 9-14 (1d6+8)

- **Perception:** 10-15 (1d6+9)

- **Aura:** 7-10 (1d4+6)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 5-8 (1d4+4)
