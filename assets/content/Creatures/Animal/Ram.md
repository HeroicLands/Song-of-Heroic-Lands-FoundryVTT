---
aliases:
    - Ram
tags:
    - animal
name:
    full: Ram
    aliases: []
id: ZwHwXKqpOkh0QMOt
slug: ram
img: icons/game-icons/delapouite/sheep.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 13
        end: 14
        dex: 11
        agl: 12
        per: 11
        aur: 8
        wil: 13
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+9
        end: 1d6+10
        dex: 1d6+7
        agl: 1d6+8
        per: 1d6+7
        aur: 1d4+5
        wil: 1d6+9
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            parts:
                - name: Head
                  shortcode: headpart
                  zones:
                      - vital
                  canHoldItem: false
                  combatArea: 2
                  locations:
                      - name: Head
                        shortcode: headloc
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
                  shortcode: lforelegpart
                  zones:
                      - locomotor
                  canHoldItem: false
                  combatArea: 1
                  locations:
                      - name: Leg
                        shortcode: lforelegloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 2
                        probWeight: 1
                        protectionBase:
                            blunt: 3
                            edged: 2
                            piercing: 1
                            fire: 3
                - name: Right Foreleg
                  shortcode: rforelegpart
                  zones:
                      - locomotor
                  canHoldItem: false
                  combatArea: 1
                  locations:
                      - name: Leg
                        shortcode: rforelegloc
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 2
                        probWeight: 1
                        protectionBase:
                            blunt: 3
                            edged: 2
                            piercing: 1
                            fire: 3
                - name: Torso
                  shortcode: torsopart
                  zones:
                      - core
                  canHoldItem: false
                  combatArea: 4
                  locations:
                      - name: Flank
                        shortcode: flkloc
                        bleedingSusceptibility: medium
                        amputability: none
                        shockValue: 4
                        probWeight: 4
                        protectionBase:
                            blunt: 3
                            edged: 2
                            piercing: 1
                            fire: 3
                      - name: Abdomen
                        shortcode: abdloc
                        bleedingSusceptibility: high
                        amputability: none
                        shockValue: 4
                        probWeight: 6
                        protectionBase:
                            blunt: 3
                            edged: 2
                            piercing: 1
                            fire: 3
                - name: Left Rear Leg
                  shortcode: lrearlegpart
                  zones:
                      - locomotor
                  canHoldItem: false
                  combatArea: 2
                  locations:
                      - name: Left Quarter
                        shortcode: lqtrloc
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
                        bleedingSusceptibility: low
                        amputability: medium
                        shockValue: 2
                        probWeight: 4
                        protectionBase:
                            blunt: 3
                            edged: 2
                            piercing: 1
                            fire: 3
                - name: Right Rear Leg
                  shortcode: rrearlegpart
                  zones:
                      - locomotor
                  canHoldItem: false
                  combatArea: 2
                  locations:
                      - name: Right Quarter
                        shortcode: rqtrloc
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
                  shortcode: tailpart
                  zones: []
                  canHoldItem: false
                  combatArea: 1
                  locations:
                      - name: Tail
                        shortcode: tailloc
                        bleedingSusceptibility: none
                        amputability: high
                        shockValue: 1
                        probWeight: 1
                        protectionBase:
                            blunt: 3
                            edged: 2
                            piercing: 1
                            fire: 3
            adjacent:
                - - headpart
                  - torsopart
                - - headpart
                  - lforelegpart
                - - headpart
                  - rforelegpart
                - - torsopart
                  - lforelegpart
                - - torsopart
                  - rforelegpart
                - - torsopart
                  - lhindlegpart
                - - torsopart
                  - rhindlegpart
                - - lforelegpart
                  - rforelegpart
                - - lhindlegpart
                  - rhindlegpart
                - - torsopart
                  - tailpart
                - - lhindlegpart
                  - tailpart
                - - rhindlegpart
                  - tailpart
        weight:
            base: 150
            calc: 150
        reachBase: 0
        bodyScaleBase: 1.0
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
    items: []
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

- **Strength:** 10-15 (1d6+9)

- **Endurance:** 11-16 (1d6+10)

- **Dexterity:** 8-13 (1d6+7)

- **Agility:** 9-14 (1d6+8)

- **Perception:** 8-13 (1d6+7)

- **Aura:** 6-9 (1d4+5)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
