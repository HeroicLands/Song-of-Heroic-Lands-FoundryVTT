---
aliases:
    - Peafowl
    - Peacock
tags:
    - animal
    - image-needed
name:
    full: Peacock
    aliases: []
id: auTdTI38hYwuX3sr
slug: peacock
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
shortcode: peacock
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 5
        end: 7
        dex: 14
        agl: 15
        per: 14
        aur: 14
        wil: 8
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d4+2
        end: 1d4+4
        dex: 1d6+10
        agl: 1d6+11
        per: 1d6+10
        aur: 1d6+10
        wil: 1d4+5
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 1
                - name: Body
                  shortcode: torsozone
                  probWeight: 1
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 1
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Left Wing
                  shortcode: lwingpart
                  bodyZoneCode: headzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Body
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Right Wing
                  shortcode: rwingpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Left Leg
                  shortcode: llegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 3
                - name: Right Leg
                  shortcode: rlegpart
                  bodyZoneCode: hindqtrzone
                  roles:
                      - locomotor
                      - manipulator
                  canHoldItem: false
                  probWeight: 3
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
                  probWeight: 3
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 2
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Left Wing
                  shortcode: lwingloc
                  bodyPartCode: lwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Right Wing
                  shortcode: rwingloc
                  bodyPartCode: rwingpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Left Leg
                  shortcode: llegloc
                  bodyPartCode: llegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Right Leg
                  shortcode: rlegloc
                  bodyPartCode: rlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: none
                  amputability: high
                  shockValue: 1
                  probWeight: 10
                  protectionBase:
                      blunt: -1
                      edged: -2
                      piercing: -3
                      fire: -1
        weight:
            base: 13
            calc: "13"
        reachBase: 0
        bodyScaleBase: 0.6
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 2
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: aerial
          feetPerRound: 50
          leaguesPerWatch: 3
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items:
        - shortcode: awar
          type: skill
          system:
              masteryLevelBase: 55
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 55
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 33
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 32
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 15
        - name: Spur Slash
          type: skill
          system:
              shortcode: talon
              subType: combattechnique
              masteryLevelBase: 55
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: talon
                  name: Spur Slash
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: -3
                      aspect: edged
                  lengthBase: 0
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
        - name: Peck
          type: skill
          system:
              shortcode: beak
              subType: combattechnique
              masteryLevelBase: 52
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: beak
                  name: Peck
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -2
                      aspect: piercing
                  lengthBase: 0
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

The sound comes first — a cry so piercing and so strange that you stop mid-stride, unsure whether you have heard a bird, a woman screaming, or something from between the two. Then you see it, and every other thought leaves your head. The bird stands in a shaft of temple light, and it has opened its tail. The word "tail" is inadequate. What it has opened is a wall of color — a shimmering, iridescent fan six feet across, composed of hundreds of individual feathers, each one terminating in a pattern that your mind insists is an eye. The eyes stare. Blue, green, gold, ringed in bronze and black, they shift and shimmer as the bird trembles the fan, producing a rustling, rattling sound and a visual effect that is less like plumage and more like a living mosaic of precious stones catching the light. The body behind this display is absurdly small — a bird the size of a large chicken, with glossy blue-green plumage on the neck and breast and a small, crested head that wears an expression of complete self-satisfaction. It turns slowly, fanning, trembling, the eyes on the feathers rippling like the surface of disturbed water, and you understand why three religions consider this creature sacred.

# Dossier {#dossier}

The Peacock — more properly, the peafowl, as the name applies to both the spectacular male and the drab female — is the most visually stunning bird in [[Vedyara_Region]] and arguably in the world. The male stands three to four feet tall with a body weight of nine to thirteen pounds, but the train — the fan of elongated upper tail coverts that constitutes the display plumage — extends the bird's total length to seven or eight feet when folded and spreads into a shimmering arc over six feet wide when raised. The peahen is smaller, brownish, and entirely lacking the train, investing her resources in camouflage and reproduction rather than spectacle. The peacock invests everything in the display, and the result is one of the most extraordinary products of natural selection in the animal kingdom.

Peafowl are native to the forests, scrublands, and river margins of Vedyara, but millennia of association with human settlements have made them semi-domestic across much of the subcontinent. They are found wild in forested hills and jungle margins, semi-wild in agricultural areas where they are tolerated and fed, and fully domestic in temple complexes, palace gardens, and wealthy estates where they are kept as sacred ornaments. In Vedyaran religion, the peacock is associated with multiple deities — its iridescent plumage is said to contain all the colors of creation, and the eye patterns on the tail feathers are interpreted as symbols of divine watchfulness. Temples maintain flocks of peafowl, and killing a peacock is forbidden in most Vedyaran jurisdictions, carrying penalties that range from fines to exile.

The peacock is not a creature that adventurers fight. It is a creature that adventurers encounter in every Vedyaran temple, palace, village, and forest, screaming at dawn, pecking through gardens, roosting on walls and rooftops, and generally behaving with the entitled confidence of an animal that knows it is sacred and has been exploiting that status for centuries. It is the ambient wildlife of Vedyara — the sound, the color, and the slightly absurd magnificence that tells you where in the world you are.

## Presentation

The male peacock in full plumage is one of the most visually arresting sights in the natural world. The head and neck are covered in glossy, iridescent feathers that shift between deep blue and vivid green depending on the angle of light — a structural color produced not by pigment but by the microscopic architecture of the feather barbs, which refract light like prisms. A fan-shaped crest of upright feathers, each tipped with a small, iridescent disc, rises from the crown of the head. The eyes are dark and alert, set in a face that manages to look simultaneously regal and slightly stupid.

The body plumage is less spectacular — green and bronze on the back, with dark wing feathers — but the train more than compensates. The train is composed of approximately two hundred elongated upper tail coverts, each one a long, flexible feather with a bare shaft and a terminal vane bearing the famous "eye" — an oval pattern of concentric rings in blue, green, gold, and bronze, surrounded by loose, iridescent barbs. When the train is raised and spread, the eyes form a repeating pattern across the entire fan, creating an overwhelming visual display that is designed to be seen from the front — the peacock positions himself facing the peahen and spreads the train into a shimmering wall of color, trembling the feathers to produce a rustling sound and a rippling visual effect as the iridescent colors shift. The display is genuinely mesmerizing. The bird is aware of this and deploys it with evident calculation.

The peahen is entirely different — a medium-sized brown bird with greenish neck feathers and none of the train, crest, or dramatic coloring. She is camouflaged rather than displayed, and her practical, drab appearance is the counterpoint to the male's extravagance. She selects her mate based on the quality of his display, which means that every generation of peacocks has been shaped by female preference for more spectacular plumage, in an evolutionary arms race that has produced the most elaborate male ornament in the bird world.

## Key Behaviors

Peafowl are ground-dwelling birds that roost in trees at night for safety from predators. They are omnivorous, feeding on seeds, grain, insects, small reptiles, and anything else they can find — including, in temple and palace settings, offerings left for the gods, food intended for other animals, and anything left unattended on a table. They are gregarious, living in small groups of one male and several females during the breeding season, and in larger mixed flocks outside of it.

The male's display is triggered by the breeding season, by the presence of peahens, and occasionally by anything the bird finds aesthetically stimulating, including its own reflection. The full display involves raising the train, spreading it into the fan, trembling the feathers, and turning slowly to present the maximum visual effect to the observing female. The display is accompanied by a low humming vibration — produced by the trembling feathers at a frequency that may be partially infrasonic — and by the peacock's loud, carrying call: a piercing, multi-note scream that sounds like a cross between a cat fight and a woman shouting for help. This call is given at dawn, at dusk, before rain, when alarmed, and apparently whenever the bird feels like it. It is the most recognizable sound in Vedyara and the most reliable alarm clock in any settlement that houses peafowl.

Peafowl are surprisingly good fliers over short distances — they roost in tall trees and can clear walls and low buildings with heavy, labored wingbeats — but they are not sustained fliers and prefer to walk or run. Their running speed is respectable, and they are alert and wary in the wild, relying on collective vigilance and their roosting height to avoid predators. In temple and domestic settings, they become bold to the point of nuisance, strutting through populated areas, stealing food, defecating on clean surfaces, and screaming at inappropriate hours with the serene confidence of creatures that know they cannot be touched.

## Combat Strategy

Peafowl are not combatants and will flee from any genuine threat. A cornered male will face the threat and spread the train in a defensive display — the sudden explosion of color and the array of eye patterns may startle predators and buy the bird time to escape. Males will also fight each other during the breeding season, using their leg spurs — short, sharp keratinous spikes on the back of the lower leg — to slash at rivals in brief, violent confrontations. These fights are rarely fatal but can draw blood and occasionally blind an eye.

Against humans, peafowl are a hazard only in the sense that they will eat your food, defecate on your equipment, and wake you at dawn with screaming. The primary "combat" interaction between adventurers and peafowl is the social combat of trying to eat, sell, or remove a sacred bird in a Vedyaran settlement without being arrested or mobbed by an outraged community.

## Attack Methods

### Spur Slash

A defensive attack used primarily in male-on-male combat. The bird jumps and kicks, driving the sharp leg spurs at the opponent's head and body. The spurs are hard and pointed enough to cut skin and draw blood, and a well-placed strike can blind an eye. Against humans, this attack is more startling than dangerous, but a rooster-sized bird launching itself at your face with sharp implements is not a pleasant experience regardless of the damage potential.

## Special Abilities

### Iridescent Display

The peacock's train display is the most visually spectacular natural phenomenon in the Vedyaran animal kingdom. The structural coloration — produced by light refraction rather than pigment — means the feathers shift color depending on the viewing angle, creating a shimmering, rippling effect that is genuinely difficult to look away from. Whether this display has any supernatural component (as some Vedyaran theologians claim) or is simply the most effective product of sexual selection in nature, it is beautiful enough to stop conversations, halt work, and cause hardened travelers to stand and stare.

### Dawn Alarm

The peacock's screaming call — given reliably at first light — functions as an alarm that is impossible to sleep through and audible at considerable distance. Vedyaran settlements treat peafowl as a natural alarm system, and the birds' alarm calls at unusual hours (triggered by the approach of predators, strangers, or snakes) provide a warning that the community has learned to take seriously. A temple or village with resident peafowl has a perimeter alert system that no human sentry can match for reliability.

### Snake Detector

Peafowl are aggressive hunters of snakes, including venomous species. They detect snakes through keen eyesight and respond with focused pecking attacks that target the snake's head. Their quick reflexes and hard beak allow them to kill cobras and vipers with relative impunity, and settlements that maintain peafowl populations report significantly lower rates of snakebite. This practical function — combined with their sacred status — makes peafowl genuinely useful residents despite their considerable nuisance value.

### Sacred Immunity

In most Vedyaran jurisdictions, peafowl are legally and religiously protected. Harming, killing, or removing a peacock from a temple complex is a punishable offense, and communities near wild peafowl populations enforce informal protections with equal vigor. This sacred status means that peafowl exist in a state of total confidence around humans, which makes them simultaneously endearing and infuriating. For adventurers, the practical consequence is that any violent interaction with a peacock — even an accidental one — risks serious social and legal consequences.

## Attributes

- **Strength:** 3-6 (1d4+2)

- **Endurance:** 5-8 (1d4+4)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 11-16 (1d6+10)

- **Aura:** 11-16 (1d6+10)

- **Will:** 6-9 (1d4+5)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
