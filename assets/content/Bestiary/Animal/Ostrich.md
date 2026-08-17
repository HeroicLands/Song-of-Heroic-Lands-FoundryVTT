---
aliases:
  - Ostrich
  - creature-ostrich
tags:
  - animal
  - image-needed
name:
  full: Ostrich
  aliases: []
description: "The largest living bird of Dunhara, a flightless seven-to-nine-foot desert runner carried on a pair of devastatingly powerful legs."
id: a2TPhQDzEJLjlYMv
img: icons/game-icons/delapouite/cassowary-head.svg
portrait: images/being/ostrich-portrait.webp
shortcode: ostrich
type: creature
package: sohl
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 14
    end: 13
    dex: 14
    agl: 15
    per: 16
    aur: 8
    wil: 10
    rea: 7
    cre: 6
  attrRollFormula:
    str: 1d6+10
    end: 1d6+9
    dex: 1d6+10
    agl: 1d6+11
    per: 1d6+12
    aur: 1d4+5
    wil: 1d4+7
    rea: 1d4+4
    cre: 1d4+3
  body:
    structure:
      zones:
        - name: Head
          shortcode: headzone
          probWeight: 2
        - name: Body
          shortcode: torsozone
          probWeight: 4
        - name: Hindquarters
          shortcode: hindqtrzone
          probWeight: 4
      parts:
        - name: Head
          shortcode: headpart
          bodyZoneCode: headzone
          roles:
            - vital
          canHoldItem: false
          probWeight: 10
        - name: Torso
          shortcode: torsopart
          bodyZoneCode: torsozone
          roles:
            - core
          canHoldItem: false
          probWeight: 10
        - name: Left Foreclaw
          shortcode: lforelegpart
          bodyZoneCode: torsozone
          roles: &a1
            - locomotor
          canHoldItem: false
          probWeight: 2
        - name: Right Foreclaw
          shortcode: rforelegpart
          bodyZoneCode: torsozone
          roles: *a1
          canHoldItem: false
          probWeight: 2
        - name: Left Leg
          shortcode: lhindlegpart
          bodyZoneCode: hindqtrzone
          roles:
            - locomotor
          canHoldItem: false
          probWeight: 8
        - name: Right Leg
          shortcode: rhindlegpart
          bodyZoneCode: hindqtrzone
          roles:
            - locomotor
          canHoldItem: false
          probWeight: 8
        - name: Tail
          shortcode: tailpart
          bodyZoneCode: hindqtrzone
          roles: []
          canHoldItem: false
          probWeight: 4
      locations:
        - name: Head
          shortcode: headloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 5
          probWeight: 6
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Neck
          shortcode: neckloc
          bodyPartCode: headpart
          bleedingSusceptibility: high
          amputability: low
          shockValue: 5
          probWeight: 4
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Thorax
          shortcode: thoraxloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 6
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Abdomen
          shortcode: abdloc
          bodyPartCode: torsopart
          bleedingSusceptibility: high
          amputability: none
          shockValue: 4
          probWeight: 4
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Foreclaw
          shortcode: lforelegloc
          bodyPartCode: lforelegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Foreclaw
          shortcode: rforelegloc
          bodyPartCode: rforelegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Left Leg
          shortcode: lhindlegloc
          bodyPartCode: lhindlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Right Leg
          shortcode: rhindlegloc
          bodyPartCode: rhindlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Tail
          shortcode: tailloc
          bodyPartCode: tailpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
    weight:
      base: 250
      calc: "250"
    reachBase: 0
    bodyScaleBase: 1.17
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 100
      leaguesPerWatch: 8
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors: []
      disabled: false
  defaultCombatGroup: null
  items:
    - shortcode: awar
      type: skill
      system:
        masteryLevelBase: 65
    - shortcode: stlth
      type: skill
      system:
        masteryLevelBase: 60
    - shortcode: sprt
      type: mysticalability
      system:
        masteryLevelBase: 27
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 36
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 60
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 35
    - name: Power Kick
      type: skill
      system:
        shortcode: kick
        subType: combattechnique
        masteryLevelBase: 60
        combatCategory: melee
        impairedByRoles:
          - locomotor
        strikeMode:
          type: melee
          shortcode: kick
          name: Power Kick
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 4
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: -1
            aspect: blunt
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
    - name: Wing Buffet
      type: skill
      system:
        shortcode: ram
        subType: combattechnique
        masteryLevelBase: 60
        combatCategory: melee
        impairedByRoles:
          - core
        strikeMode:
          type: melee
          shortcode: ram
          name: Wing Buffet
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 4
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: 1
            aspect: blunt
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

Your first thought is that someone has left a feathered tent in the middle of the plain. Then the tent stands up and you revise every assumption you have ever made about the size of birds. It is enormous — seven, eight feet tall, a towering column of body and neck topped by a small, flat head with eyes like polished stones. The body is a dark mass of plumage, black in the males, dusty brown in the females, but the tail and wing plumes are white, almost luminous against the desert landscape. The legs are what make you reconsider the situation — they are not bird legs as you understand the concept. They are pillars. Thick, scaled, muscular, ending in feet that carry two toes each, the inner one armed with a claw that looks less like a bird's talon and more like a short, heavy knife. It regards you with an expression of total vacancy — the small head, the blank eyes, the beak slightly open — and you almost laugh. Then it takes a step toward you and the ground shakes, and you remember that intelligence and lethality are not the same thing.

# Dossier {#dossier}

The Ostrich is the largest living bird in [[doc-dunharargn|Dunhara Region]] — a massive, flightless desert runner found on the open plains, gravel wastes, and scrubland margins of the southern deserts. An adult male stands seven to nine feet tall and weighs two hundred and twenty to three hundred and fifty pounds, carried on a pair of legs that are among the most powerful in the animal kingdom. The ostrich cannot fly — its wings are vestigial, useful only for balance and display — but it can run at sustained speeds that outpace horses and deliver kicks that can kill a lion. It is simultaneously one of the most impressive and one of the most ridiculous creatures in the desert: majestic from a distance, comical up close, and lethal if you misjudge which one it is at any given moment.

Ostriches are economically important across Dunhara. Their feathers — particularly the white plume feathers of the male's wings and tail — are prized trade goods, used for decoration, heraldry, and fan-making in the courts of [[doc-sultntmrdd|Amradad]] and beyond. Their eggs, the largest of any land animal, are used as water vessels in the deep desert, the thick shells carved and decorated as prestige objects, and the contents eaten as a meal that can feed a family. Their leather is tough and supple, valued by leatherworkers. Semi-domesticated ostriches are kept by some Dunharan settlements for egg production, and there are persistent attempts to use them as riding animals that have produced more injuries than successes.

Adventurers encounter ostriches on open desert plains — small flocks picking their way across the scrub, territorial males displaying with spread wings and booming calls, and nesting females sitting on enormous ground nests that they defend with startling aggression.

## Presentation

An unmistakable silhouette. The body is massive and roughly oval, carried horizontally on two thick, powerful legs. The plumage is dense and soft — males are predominantly black with striking white plume feathers on the wings and tail, while females and juveniles are dusty gray-brown, providing better camouflage in the desert landscape. The wings are large relative to other flightless birds but far too small for flight, used instead for balance during high-speed running, for shade over eggs and chicks, and for dramatic courtship displays in which the male spreads and waves his wings while swaying his neck.

The neck is long, flexible, and proportionally thin, covered in fine down or nearly bare skin depending on the subspecies, giving it a slightly absurd quality — like a snake attached to a barrel. The head is small and flat, with a broad, blunt beak, large eyes, and an expression that manages to look simultaneously alert and vacant. The eyes are the largest of any land animal, providing exceptional distance vision across the open terrain the bird inhabits.

The legs are the ostrich's most important feature. They are thick, heavily muscled, and scaled, ending in feet that carry only two toes — unique among birds. The outer toe is smaller and provides balance; the inner toe is large, with a heavy, straight claw three to four inches long that functions as a weapon. The legs are designed for both speed and power — the same musculature that drives the bird at running speeds delivers kicks of bone-breaking force. When an ostrich runs, the stride is enormous — fourteen to sixteen feet per step at full sprint — and the bird moves with a bobbing, rolling gait that covers ground with deceptive speed.

## Key Behaviors

Ostriches are social, living in loose flocks of five to fifty individuals that may associate with herds of gazelles or oryx, benefiting from the mammals' alertness while providing their own superior height-advantage surveillance. They are omnivorous, feeding on seeds, shoots, grasses, flowers, insects, and small reptiles, and they deliberately swallow stones and grit to aid digestion in their muscular gizzard. They drink when water is available but can survive for extended periods without it, extracting moisture from food.

During breeding season, males establish territories through dramatic displays — the neck swaying, the wings spread and waved in alternating motion, and a deep, booming call produced by inflating the throat. The display is striking enough to be visible and audible at great distance. Males are polygamous, mating with multiple females who all lay their eggs in a single communal ground nest — a shallow scrape in the sand that may contain thirty to sixty eggs, each one weighing three to five pounds. The dominant female and the male share incubation duties, the female sitting during the day (her brown plumage providing camouflage) and the male sitting at night (his black plumage making him invisible in darkness).

Nesting birds are aggressive and dangerous. An ostrich defending a nest will charge threats that it would normally flee from, and the combination of the bird's size, speed, and kicking power makes approaching a defended nest genuinely risky. Chicks are precocial — able to walk and follow the parents within hours of hatching — and the male is the primary guardian of the young, herding and defending the chick flock with fierce dedication.

The ostrich's reputation for stupidity is only partly deserved. They are not intelligent in the way that corvids or primates are intelligent, but they are alert, responsive to threats, and capable of recognizing individual predators and adjusting their behavior accordingly. The mythical behavior of "burying the head in sand" is nonsense — what observers actually see is a nesting bird lying flat with its neck extended along the ground, minimizing its profile, which at distance makes the head appear to have vanished.

## Combat Strategy

An ostrich's first response to a threat is to run, and this response is extremely effective — at sustained running speeds, an ostrich outpaces any horse and most other land animals. The bird can maintain this speed for extended periods, covering miles without apparent fatigue. However, an ostrich that is cornered, defending a nest, or simply feeling aggressive (males in breeding condition are unpredictable) will stand and fight, and the fight is startlingly violent for an animal most people associate with eggs and feathers.

The attack is the kick — a single, devastating forward strike with one leg that delivers the bird's full body weight behind the heavy inner claw. The kick is aimed forward and downward, driven by the same massive thigh muscles that power the sprint. An ostrich kick to the torso of a human can break ribs and rupture organs; a kick to the head can be immediately fatal. The bird may also run at a target and deliver the kick at the end of a charging sprint, combining the momentum of a two-hundred-plus-pound body at full run with the focused force of the claw strike.

Against mounted attackers, an ostrich can be surprisingly tactical — it changes direction sharply, using its superior maneuverability at speed to evade the horse while looking for an opportunity to kick at the rider's exposed legs. A horse struck by an ostrich kick can be lamed or panicked, unseating the rider and creating an opportunity for a follow-up attack.

## Attack Methods

### Power Kick

The ostrich's primary and essentially only weapon. One leg drives forward in a snapping kick that delivers the full force of the bird's body weight behind the heavy inner claw. The kick targets whatever is closest — the torso, thighs, and head of a standing human, the legs and flanks of a horse. The claw can tear through leather and light armor, opening long, deep gashes, and the blunt force behind the kick is sufficient to break bones even if the claw doesn't connect cleanly. A single well-placed kick can incapacitate or kill a human.

### Charging Trample

A running ostrich that collides with a human-sized target delivers an impact equivalent to being struck by a large, fast-moving animal — because that is exactly what is happening. The bird's weight, combined with its running speed, generates enough force to knock a target flat, and the trampling that follows — broad feet with hard claws stamping down — compounds the initial damage.

### Wing Buffet

A minor attack used primarily in threat displays and close-quarters confrontations. The ostrich swings its vestigial wings in heavy, sweeping blows that lack the force of the kick but can stagger a target, obstruct vision, and create the space the bird needs to deliver the kick. The wing bones are surprisingly hard and the impact is comparable to being struck by a heavy, feathered club.

## Special Abilities

### Desert Runner

The ostrich is the fastest creature on two legs and one of the fastest sustained runners on land. At full sprint it achieves speeds that exceed a galloping horse, and it can maintain a fast running pace for far longer than any horse can sustain a gallop. The stride length — fourteen to sixteen feet — and the elastic tendon system in the legs allow the bird to cover ground with remarkable energy efficiency. In the open desert, where terrain is flat and sight lines are long, an ostrich that has decided to leave simply cannot be caught by anything on hooves.

### Sentinel Height

At seven to nine feet tall, an ostrich's eyes are the highest natural vantage point on the open desert plain — higher than a mounted rider's. Combined with the largest eyes of any land animal, this height advantage gives the ostrich a detection range across flat terrain that exceeds anything else in the ecosystem. Herds of gazelles and oryx that associate with ostrich flocks benefit from this elevated surveillance, and experienced desert travelers read ostrich alarm behavior — the sudden raising of the head, the alert fixation in one direction — as an early warning of approaching danger.

### Egg and Feather Economy

The ostrich is one of the few wild animals that supports an active trade economy without being domesticated. Feather hunters, egg collectors, and leather traders all pursue ostriches, and the plume trade in particular connects Dunharan desert hunters to luxury markets in [[doc-sultntmrdd|Amradad]], [[doc-byzariargn|Byzaría Region]], and beyond. A single male ostrich's white plume feathers can be worth more than the animal's meat, making feather collection a specialized and sometimes dangerous profession — approaching a live ostrich closely enough to assess its plumage is an activity with a meaningful injury rate.

### Gizzard Stones

Ostriches deliberately swallow stones, which accumulate in their powerful gizzard and grind food mechanically. This adaptation allows them to digest tough, fibrous desert vegetation that other animals cannot process, extending their foraging range into areas where the available food is too coarse for mammals. Occasionally, an ostrich will swallow something more interesting than a stone — small metal objects, jewelry, coins, and other shiny items lost in the desert have been recovered from ostrich gizzards, making the birds the subject of both superstition (some nomads consider them lucky) and practical treasure-hunting.

## Attributes

- **Strength:** 11-16 (1d6+10)

- **Endurance:** 10-15 (1d6+9)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 13-18 (1d6+12)

- **Aura:** 6-9 (1d4+5)

- **Will:** 8-11 (1d4+7)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
