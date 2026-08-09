---
aliases:
    - Gazelle
tags:
    - animal
    - image-needed
name:
    full: Gazelle
    aliases: []
id: RwQKjvaCuKSBw2TD
slug: gazelle
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 9
        end: 11
        dex: 15
        agl: 18
        per: 16
        aur: 8
        wil: 10
        rea: 8
        cre: 6
    attrRollFormula:
        str: 1d4+6
        end: 1d6+7
        dex: 1d6+11
        agl: 1d6+14
        per: 1d6+12
        aur: 1d4+5
        wil: 1d4+7
        rea: 1d4+5
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 1
                - name: Torso
                  shortcode: torsozone
                  probWeight: 4
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 3
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
                  probWeight: 4
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Foreleg
                  shortcode: lforelegloc
                  bodyPartCode: lforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Foreleg
                  shortcode: rforelegloc
                  bodyPartCode: rforelegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Flank
                  shortcode: flkloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Quarter
                  shortcode: lqtrloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Quarter
                  shortcode: rqtrloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: 2
                      edged: 1
                      piercing: 0
                      fire: 2
        weight:
            base: 200
            calc: "200"
        reachBase: 0
        bodyScaleBase: 0.82
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 100
          leaguesPerWatch: 7
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - name: Horn Thrust
          type: skill
          system:
              shortcode: gore
              subType: combattechnique
              masteryLevelBase: 73
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: gore
                  name: Horn Thrust
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 0
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
        - name: Kick
          type: skill
          system:
              shortcode: kick
              subType: combattechnique
              masteryLevelBase: 66
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: kick
                  name: Kick
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -3
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
---

# Appearance {#appearance}

The desert shimmers and what you took for heat haze resolves into movement — a dozen slender shapes flowing across the gravel plain with a speed that makes your horse look rooted to the earth. They run not with the heavy drumming of cattle or the labored breathing of horses but in near silence, hooves barely touching the ground between strides, bodies stretched into long arcs of tawny muscle that seem to defy the weight of flesh and bone. The nearest one turns its head without breaking stride and you catch a flash of dark, liquid eyes set in a face of improbable delicacy — long lashes, curving horns like lyres, a muzzle as fine as carved ivory. Then they shift direction as one, a collective pivot executed without signal or hesitation, and within moments they are distant shapes again, dissolving into the heat shimmer from which they came.

# Dossier {#dossier}

The Gazelle is the primary wild ungulate of the Khazryn Desert and surrounding steppe — a small, extraordinarily fast antelope found in herds across the gravel plains, scrubland margins, sand sea edges, and seasonal grasslands that characterize the great desert interior. An adult gazelle stands two to two and a half feet at the shoulder and weighs forty to seventy-five pounds, making it substantially smaller than a stag but compensating with a speed and agility that no other land animal of its size can match. Gazelles are the ecological keystone of the desert food web — they are the primary prey of steppe lions, cheetahs, jackals, and eagles, and their presence or absence determines the viability of predator populations across vast territories. For the Khazryn nomads, gazelles are equally essential: a staple source of meat and hide, a traditional quarry for the mounted hunts that define warrior status, and a cultural symbol of grace, speed, and the freedom of the open steppe. Adventurers encounter gazelles constantly when crossing Khazryn territory — herds drifting across the plains at dawn and dusk, solitary bucks standing sentinel on rocky outcrops, and the tracks and droppings that mark the seasonal migration routes connecting one water source to the next.

## Presentation

A small, lightly built antelope of extraordinary elegance. The body is slim and compact, with proportionally long, fine-boned legs built for sustained high-speed running. The coat is short and smooth, sandy-fawn across the back and flanks with a clean white belly, separated by a distinctive dark lateral stripe that runs from shoulder to hip. The face is narrow and refined, with enormous dark eyes fringed by long black lashes that provide protection from sand and glare. Both sexes carry horns, though the male's are larger — slender, ridged, curving backward and then inward in a lyre shape that is one of the most recognizable silhouettes of the desert landscape. The ears are long and mobile, and the tail is short and dark, flicked constantly when the animal is alert. The hooves are narrow and hard, adapted for running on both hard-packed gravel and loose sand. The overall impression is of a creature pared down to nothing but speed and alertness — there is not an ounce of wasted weight on a gazelle, and every line of its body points toward escape.

## Key Behaviors

Gazelles are gregarious, forming herds of ten to fifty individuals that move together across seasonal ranges following the availability of sparse desert vegetation. Herds are loosely structured around a core of related females and their young, with adult males holding small territories or forming bachelor groups on the periphery. During the breeding season, territorial bucks defend patches of ground through ritualized displays — parallel walking, horn-fencing, and scent-marking — that rarely escalate to serious injury. Gazelles are primarily crepuscular grazers, feeding on the tough grasses, herbs, and scrub that grow in desert margins and seasonal watercourses. They are remarkably adapted to arid conditions, capable of surviving for extended periods without drinking water by extracting moisture from their food and reducing water loss through concentrated urine and dry feces. When water is available, herds gather at oases and seasonal pools, creating the concentrated prey aggregations that attract every predator in the region. Gazelles are perpetually alert, relying on the herd's collective vigilance — dozens of eyes and ears scanning for threats — combined with explosive acceleration to survive in an environment where predators are numerous and cover is nonexistent.

## Combat Strategy

A gazelle's only combat strategy is escape. At the first sign of danger, the nearest animal gives an alarm — a sharp nasal snort combined with a distinctive bouncing gait called stotting, where the gazelle leaps vertically with all four legs stiff, flashing the white rump patch as a visual warning to the herd. The herd explodes into flight, accelerating from standing to full speed in seconds, reaching speeds that outpace all but the fastest sprinting predators. Gazelles are not merely fast in a straight line — they are supreme at evasive running, executing sharp turns, sudden direction changes, and unpredictable zigzags at full speed that make them extraordinarily difficult to intercept. Against a mounted hunter, a gazelle's strategy is to outrun the horse over distance; against a cheetah, it is to outlast the sprint through evasive turns; against a stalking lion, it is to detect the ambush before the lion reaches striking range. A cornered or injured gazelle that cannot flee will kick and thrust with its horns, but this is a last resort of desperation, not a viable defense.

## Attack Methods

### Horn Thrust

A cornered buck will lower its head and drive its lyre-shaped horns at the attacker, aiming for the face, eyes, and throat. The horns are sharp enough to puncture skin and the neck muscles provide reasonable force behind the thrust, but this attack is defensive and desperate — a gazelle that is fighting has already lost its primary survival strategy.

### Kick

Like all ungulates, a gazelle can deliver powerful kicks with its hind legs. The hooves are narrow and hard, and a kick to the face or ribs of a jackal or fox can break bones. However, the gazelle's light build means these kicks lack the devastating force of larger ungulates.

## Special Abilities

### Explosive Acceleration

The gazelle's primary survival trait. From a standing start, a gazelle can reach its top speed within three to four strides, achieving velocities that outpace most mounted pursuit over short distances. This acceleration is powered by proportionally massive hindquarter muscles and long, elastic tendons that store and release energy like springs. The burst of speed is often sufficient to open a survival gap before a predator can close.

### Desert Endurance

Gazelles are superbly adapted to desert survival. They tolerate temperatures that prostrate larger animals, require minimal water, and can sustain a ground-covering trot for hours across terrain that exhausts horses. Their pale coat reflects heat, their nasal passages cool incoming air through a countercurrent system, and their kidneys concentrate waste to minimize water loss. In the Khazryn, gazelles can range across territory that no horse-mounted pursuer can follow without resupply.

### Herd Vigilance

A gazelle herd functions as a collective surveillance system. With dozens of animals scanning in all directions, the probability of a predator approaching undetected drops dramatically. The alarm system is immediate and reliable — a single snort from one animal sends the entire herd into flight within a heartbeat. This collective awareness makes gazelles far harder to hunt than their individual alertness would suggest.

### Stotting Display

The distinctive bouncing gait that gazelles perform when alarmed serves multiple functions: it alerts the herd, it signals to the predator that it has been detected (causing many ambush predators to abandon the hunt), and it may advertise the individual gazelle's fitness and speed, discouraging the predator from pursuing that particular animal. The white rump flash during stotting is visible at great distances across open terrain.

## Attributes

- **Strength:** 7-10 (1d4+6)

- **Endurance:** 8-13 (1d6+7)

- **Dexterity:** 12-17 (1d6+11)

- **Agility:** 15-20 (1d6+14)

- **Perception:** 13-18 (1d6+12)

- **Aura:** 6-9 (1d4+5)

- **Will:** 8-11 (1d4+7)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 4-7 (1d4+3)
