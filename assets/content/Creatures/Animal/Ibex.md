---
aliases:
    - Ibex
tags:
    - animal
    - image-needed
name:
    full: Ibex
    aliases: []
id: Mbqn2UmueYKKnynf
img: icons/game-icons/skoll/goat.svg
portrait: ""
shortcode: ibex
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 12
        end: 13
        dex: 14
        agl: 17
        per: 15
        aur: 8
        wil: 13
        rea: 8
        cre: 6
    attrRollFormula:
        str: 1d6+8
        end: 1d6+9
        dex: 1d6+10
        agl: 1d6+13
        per: 1d6+11
        aur: 1d4+5
        wil: 1d6+9
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
                  probWeight: 6
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Foreleg
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
                - name: Right Foreleg
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
                - name: Flank
                  shortcode: flkloc
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
                - name: Left Quarter
                  shortcode: lqtrloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Quarter
                  shortcode: rqtrloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
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
            base: 150
            calc: "150"
        reachBase: 0
        bodyScaleBase: 1.06
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 3
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: topography
                key: steep
                mode: add
                textValue: "0"
              - scope: topography
                key: extreme
                mode: add
                textValue: "-1"
              - scope: surface_cover
                key: alpine
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: barren
                mode: add
                textValue: "0"
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
              masteryLevelBase: 75
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 30
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 64
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 33
        - name: Horn Ram
          type: skill
          system:
              shortcode: gore
              subType: combattechnique
              masteryLevelBase: 71
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: gore
                  name: Horn Ram
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 1
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
              masteryLevelBase: 64
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
                      modifier: -2
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

You see it on the cliff face and your first thought is that it cannot possibly be standing where it is standing. The ledge — if it can be called a ledge — is no wider than your hand, angled at thirty degrees above a drop that would kill anything that fell from it. The ibex stands there as comfortably as you would stand on a road, one foreleg casually folded, chewing a mouthful of scrub torn from a crack in the rock. The horns are enormous — great sweeping curves of ridged bone that arc backward over the shoulders, seeming far too heavy for the narrow, agile body that carries them. It regards you from its impossible perch with the calm superiority of something that lives in a world with an extra dimension you cannot access. Then it turns and walks up the cliff face — up, on a surface that looks vertical from where you stand — hooves finding purchase on holds you cannot even see, and within moments it has disappeared over the rim into a landscape of rock and sky where you will never be able to follow.

# Dossier {#dossier}

The Ibex is the wild goat of the Dunharan mesas, wadis, and mountain escarpments — a medium-sized, powerfully built caprid found on the cliff faces, rocky plateaus, and canyon systems that punctuate the desert landscape. An adult male stands two and a half to three feet at the shoulder and weighs a hundred to two hundred and seventy pounds, with females somewhat smaller. The ibex is the supreme specialist of vertical terrain — capable of ascending and descending rock faces that would challenge experienced human climbers, traversing ledges narrower than its own hooves, and leaping between surfaces with a precision and confidence that borders on the supernatural. This mastery of the vertical makes the ibex effectively immune to predation in its preferred habitat; no lion, cheetah, or wolf can follow where an ibex goes, and the few predators that can climb — leopards, eagles — find the ibex's alertness and agility make it a poor investment of effort.

In Dunharan culture, the ibex is a symbol of the wild places — the mesas and canyons that the nomads travel past but do not inhabit. Ibex horns are prized trophies, displayed in the tents of successful hunters, and ibex hunting is considered one of the great tests of desert skill — not because the animal is particularly dangerous, but because reaching it in its cliff-face habitat requires climbing ability and mountain knowledge that few lowland nomads possess. The rocky escarpments where ibex live are also frequently sites of spiritual significance — sacred caves, ancient rock paintings, and pilgrimage destinations — and the ibex's presence at these sites reinforces its association with the liminal spaces between the human world and the divine.

Adventurers encounter ibex on cliff faces, mesa tops, in rocky canyon systems, and at the few water sources that emerge from the base of desert escarpments. They are also occasionally found in ruined structures built into cliff faces — the ibex's indifference to height and its attraction to the mineral-rich mortar of old stonework make it a common inhabitant of exactly the kinds of ancient, elevated ruins that adventurers tend to explore.

## Presentation

A compact, muscular goat with a body built for climbing — deep-chested, short-backed, and carried on relatively short, powerful legs. The coat is short and coarse, varying from sandy brown to gray-brown in summer and thickening to a darker, denser winter coat in cold months. Males carry a short, dark beard and a ridge of longer hair along the spine. The hooves are the ibex's defining anatomical feature — broad, with a hard outer rim that grips rock edges and a soft, flexible inner pad that conforms to irregular surfaces, providing traction on terrain where any other hoof would slip. Each hoof functions like a specialized climbing shoe, distributing the animal's weight precisely and finding purchase on holds measured in fractions of an inch.

The horns of the male are spectacular — thick, heavily ridged crescents that sweep back from the forehead in a long, curving arc, sometimes reaching three to four feet along the outer curve. The ridges are pronounced, each one representing a year of growth, giving the horns the appearance of segmented, sculpted bone. Female horns are much shorter and thinner but still present. The head is relatively narrow with a straight profile, large dark eyes set wide for excellent peripheral vision (essential for spotting predators while climbing), and short, mobile ears. The overall impression is of an animal that appears top-heavy — those massive horns on a body built for agility — yet moves through vertical terrain with an ease that makes the weight seem irrelevant.

## Key Behaviors

Ibex are social animals, forming sex-segregated groups for most of the year — female herds with kids occupying the best cliff-face habitat, bachelor male groups living on adjacent terrain — that come together during the winter rut. Males establish dominance through spectacular horn-clashing contests: two bucks rear on their hind legs and crash together headfirst, the impact of horn on horn producing a crack that echoes across canyons. These contests can continue for hours, the bucks rearing and colliding repeatedly until one concedes, and the sound draws spectators — both ibex and human — from considerable distance.

Ibex are primarily crepuscular, feeding during the cooler hours on the sparse vegetation that grows in rock crevices, cliff-face ledges, and the thin soil of mesa tops: tough grasses, herbs, lichens, and the leaves of scrubby trees and bushes. They descend to lower elevations and water sources during the night, when predator activity is harder to detect, and retreat to the safety of the cliff faces during the day. They are surprisingly water-efficient for a non-desert-specialist, but do need to drink more frequently than oryx or gazelles, which ties them to terrain near permanent or semi-permanent water sources.

Their anti-predator strategy is simple and nearly foolproof: go somewhere the predator cannot follow. At the first sign of danger, ibex move upward and onto steeper terrain, quickly reaching positions where nothing without their specialized hooves can maintain footing. Kids are capable of navigating challenging cliff terrain within days of birth, an urgency driven by the predation pressure that targets the brief vulnerable period before they develop full climbing competence.

## Combat Strategy

An ibex almost never fights anything other than another ibex. Its response to predators and threats is to climb beyond reach, and in its preferred habitat this strategy is essentially foolproof. However, an ibex that is cornered — in an enclosed space, on flat ground far from cliffs, or defending a kid that cannot yet climb — will fight with more force than its modest size suggests. Males use the heavy, ridged horns as battering weapons, driving forward with lowered head to deliver impacts that carry the momentum of their body weight behind the thick, bony horn mass. The horns are not sharp like an oryx's — they are designed for collision rather than penetration — but the force of impact can break ribs, shatter limbs, and knock a human-sized target off their feet. Females and juveniles kick with their hard-edged hooves and bite when cornered, though neither attack is particularly dangerous.

The most likely combat scenario involving ibex is not a direct fight but rather the danger of pursuit. An adventurer who chases an ibex onto steep terrain — motivated by hunting, curiosity, or the ibex's annoying tendency to occupy the exact ledge you need to reach — faces the very real possibility of a fall that the ibex will survive and the human will not.

## Attack Methods

### Horn Ram

The male ibex lowers its head and charges, driving the heavy, ridged horns into the target with the full force of its body behind the collision. Unlike the piercing lance of an oryx, the ibex's attack is blunt impact — a battering ram of dense bone hitting with enough force to crack ribs and knock grown men off their feet. The thick base and ridged surface of the horns spread the impact across a wider area, reducing penetration but increasing the sheer concussive force.

### Cliff-Edge Knockback

In its preferred terrain, the ibex does not need to injure an attacker — merely displacing them is lethal. A charging horn-butt or a shouldering shove from an ibex on a narrow cliff ledge can knock a human-sized target off the edge. The ibex's superior footing and balance give it an enormous advantage in these encounters, and it seems to understand this intuitively.

## Special Abilities

### Vertical Mastery

The ibex can ascend, descend, traverse, and leap on rock surfaces that are functionally impossible for any other large animal. Cliff faces that appear vertical, ledges narrower than a human hand, and surfaces with no visible holds are all navigable terrain for an ibex. This ability derives from the specialized hooves, an extraordinary sense of balance, and a spatial awareness that allows the animal to plan routes up a cliff face with the same casual competence that a human applies to walking down a road. In its cliff-face habitat, the ibex is simply unreachable by anything that cannot climb or fly.

### Sure-Footed Leaping

Ibex leap between surfaces — rock face to rock face, ledge to ledge, across gaps — with a precision that appears calculated rather than instinctive. A leaping ibex lands with all four hooves in a space barely larger than its own body, absorbs the impact, and continues moving without pause. These leaps can span horizontal gaps of ten to fifteen feet and vertical drops of twenty feet or more, all executed on surfaces where a missed landing means death.

### Cliff-Face Sentry

Ibex habitually position themselves on elevated vantage points where they can observe the surrounding terrain while remaining on or near vertical escape routes. This combination of height advantage and immediate access to unreachable terrain makes them extraordinarily difficult to approach. A herd of ibex scattered across a cliff face is a collective surveillance system, with every animal watching a different angle and all of them within seconds of terrain that no ground predator can access.

### Mesa Pathfinder

Ibex know their home terrain with an intimacy that no visitor can match. They remember every ledge, every hold, every route up and down every cliff face in their range. This knowledge is learned — kids follow their mothers' routes and gradually build their own mental maps — and it represents a navigational advantage that makes ibex effectively uncatchable in their home territory. Adventurers who follow ibex trails, however, sometimes discover routes through otherwise impassable terrain — narrow ledge paths, hidden traverses, and cliff-face passages that connect mesa tops to the valleys below.

## Attributes

- **Strength:** 9-14 (1d6+8)

- **Endurance:** 10-15 (1d6+9)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 14-19 (1d6+13)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 6-9 (1d4+5)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 4-7 (1d4+3)
