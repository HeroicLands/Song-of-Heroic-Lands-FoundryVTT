---
aliases:
    - Ram
    - creature-ramanml
tags:
    - animal
name:
    full: Ram
    aliases: []
id: ZwHwXKqpOkh0QMOt
img: icons/game-icons/delapouite/sheep.svg
portrait: images/ramanml.webp
shortcode: ramanml
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 16
        end: 14
        agl: 14
        per: 17
        snt: 4
        aur: 3
        wil: 15
        rea: 3
        cre: 3
    attrRollFormula:
        str: 1d6+13
        end: 1d6+11
        agl: 1d6+11
        per: 1d6+14
        snt: 1d4+2
        aur: 1d4+1
        wil: 1d6+12
        rea: 1d4+1
        cre: 1d4+1
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
            base: 300
            calc: "300"
        reachBase: 0
        bodyScaleBase: 1.28
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 120
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
              masteryLevelBase: 80
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
              masteryLevelBase: 27
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 45
        - name: Gore
          type: skill
          system:
              shortcode: gore
              subType: combattechnique
              masteryLevelBase: 70
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: gore
                  name: Gore
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 5
                      aspect: blunt
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
        - name: Kick
          type: skill
          system:
              shortcode: kick
              subType: combattechnique
              masteryLevelBase: 56
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
                      modifier: 1
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

The animal stands solid and immovable, its head held low in unmistakable threat. The curved horns spiral outward and forward, thick as a man's fist at their base, their surfaces worn and scarred from countless impacts. You feel the ground shudder slightly as the creature's hooves dig in, and you catch the heavy musk of wool and animal aggression. Its breath emerges in forceful snorts, and its eyes lock on you with a singular, murderous intent. There is no negotiation in that gaze — only the promise of violence.

# Dossier {#dossier}

The ram is the dominant male of sheep herds, distinguished by its massive curved horns, muscular build, and aggressive temperament particularly during the autumn rutting season. Standing three to four feet tall and weighing 250-350 pounds, the ram is a formidable opponent despite its herbivorous nature. Adventurers might encounter rams while traveling through pastoral highlands, defending flocks against predators, or protecting territory in mountainous regions.

## Presentation

The ram presents a squat, densely packed form of solid muscle and bone beneath a thick, often wool coat that may be white, brown, gray, or black depending on breed and region. The defining feature is the pair of large, curved horns that spiral outward and backward from the skull, sometimes reaching three feet in length and weighing upward of fifteen pounds each. These horns are dense, hard bone that curves in a characteristic spiral, their surfaces often scarred and chipped from years of combat with rival rams. The head is massive and blocky, with a strong jaw and large teeth adapted for grinding vegetation. The neck is thick and muscular, leading to powerful shoulders. Males often display a throat pouch and emit a distinctive musk during breeding season. The hooves are hard and well-adapted to rocky terrain.

## Key Behaviors

Rams are inherently territorial and hierarchical, establishing dominance over competing males through ritualized headbutting matches that can last hours. During the rutting season (autumn in most regions), rams become intensely aggressive and will charge at anything they perceive as threat or competition. They defend their flocks with genuine ferocity and will actively attack predators that approach ewes or lambs. Outside of breeding season, rams are still aggressive but somewhat less hair-triggered. They are highly intelligent about terrain and can navigate difficult slopes with confidence that seems to defy physics.

## Combat Strategy

The ram's strategy is simplicity itself: charge directly at the opponent, build maximum velocity, and deliver impact using its horns and forehead as a battering ram. It relies on surprise, weight, and impact force rather than finesse. Once engaged, it may attempt to use its horns to hook and throw opponents or follow up a failed charge with repeated headbutts. The ram is not a tactical fighter and will not maneuver or use terrain strategically — it is straightforward violence. If pressed from the side, it will pivot and attack in a new direction.

## Attack Methods

### Charging Horn Strike

The ram builds running momentum and lowers its head, driving forward with its entire body weight concentrated behind its horns. On impact, the curled horns can pierce armor, the massive skull can shatter bones, and the creature's momentum can launch even armored opponents backward. This is the ram's signature attack, typically executed from a distance of 20+ feet for maximum effect.

### Headbutt

In close quarters where charging is impossible, the ram uses its incredibly thick skull as a bludgeoning weapon, driving its forehead and horns upward or forward into target flesh or bone. This is less devastating than the charge but is executed faster and repeats easily in melee range.

### Horn Hook

If the ram's horns connect with an opponent's torso, it may attempt to hook the horns around a limb or the torso and throw the victim, using its horns as leverage to displace the target.

## Special Abilities

### Mountain-Sure Footing

The ram is extraordinarily nimble on steep, rocky, and difficult terrain despite its heavy build. It can traverse slopes and uneven ground that would challenge a human, giving it advantage in highland and mountainous terrain. It is nearly impossible to knock off balance on difficult ground.

### Charging Impact

The ram's bones are dense and incredibly thick, capable of withstanding and delivering impact forces that would shatter human bone. Its charge attack is devastating in effectiveness, converting its weight and momentum into concentrated force through its horns.

### Stubborn Determination

Once the ram commits to a charge or attack, it follows through with complete commitment, almost incapable of stopping or changing direction mid-motion. This makes it predictable but also exceptionally dangerous.

### Thermal Insulation

The thick wool coat insulates the ram against cold temperatures and provides minimal armor benefit — most attacks that penetrate the wool easily wound the creature beneath. However, in cold environments, the ram is unaffected by temperature conditions that might slow other creatures.

### Additional Information

Rams are most aggressive during autumn rutting season and less so during other times of year, though they remain inherently territorial. A castrated ram (a wether) loses much of its aggression and becomes a docile pack animal suitable for carrying loads. Rams can be lured or distracted with the presence of ewes in heat during breeding season, making such animals available as bait for hunters or a distraction tactic in combat. Rams remember previous encounters with humans and treat known aggressors with heightened suspicion and aggression on subsequent meetings.

## Attributes

- **Strength:** 14-19 (1d6+13)

- **Endurance:** 12-17 (1d6+11)

- **Agility:** 12-17 (1d6+11)

- **Perception:** 15-20 (1d6+14)

- **Scent:** 3-6 (1d4+2)

- **Aura:** 2-5 (1d4+1)

- **Will:** 13-18 (1d6+12)

- **Reasoning:** 2-5 (1d4+1)

- **Creativity:** 2-5 (1d4+1)
