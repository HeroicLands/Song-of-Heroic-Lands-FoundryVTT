---
aliases:
    - Pony
tags:
    - animal
name:
    full: Pony
    aliases: []
id: dAk8STANJlO4S4YW
slug: pony
img: icons/game-icons/delapouite/horse-head.svg
portrait: ""
shortcode: pony
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 24
        end: 10
        agl: 12
        per: 17
        snt: 3
        aur: 4
        wil: 11
        rea: 4
        cre: 4
    attrRollFormula:
        str: 1d6+21
        end: 1d6+7
        agl: 1d6+9
        per: 1d6+14
        snt: 1d4+1
        aur: 1d4+2
        wil: 1d6+8
        rea: 1d4+2
        cre: 1d4+2
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 3
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 7
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
                      piercing: 1
                      fire: 3
        weight:
            base: 700
            calc: "700"
        reachBase: 0
        bodyScaleBase: 1.66
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 130
          leaguesPerWatch: 7
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: topography
                key: steep
                mode: add
                textValue: "-1"
              - scope: surface_cover
                key: barren
                mode: add
                textValue: "-1"
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
              masteryLevelBase: 24
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 36
        - name: Kick
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
                  name: Kick
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 6
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 4
                      aspect: blunt
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
        - name: Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 48
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
                      spread: 3
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 4
                      modifier: 3
                      aspect: piercing
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

A compact, muscular frame stands before you, no taller than a man's chest, yet projecting an unmistakable solidity. The pony's coat is thick and weathered, its mane shaggy and seemingly never fully combed, and its stocky legs appear barely adequate to support the creature's substance. Yet there is a quality of independence to it — intelligence showing in dark eyes that assess you with a practicality you wouldn't expect from a mere working animal. The smell of hay and honest sweat clings to it, mixed with the scent of earth and thistles.

# Dossier {#dossier}

Ponies are stocky, strong equines standing under fourteen hands (approximately 56 inches) at the shoulder, built for endurance and labor rather than speed or elegance. These adaptable creatures are found throughout farmland, hills, and rough terrain across settled lands, serving as draft animals, farm workers, and reliable mounts for smaller riders or dwarves. Adventurers might encounter a pony as a working animal left unattended, integrated into a traveling caravan, or encountered on roads and hill paths where they work their owners' land.

## Presentation

The pony presents a concentrated muscular form with thick neck, broad chest, and powerful legs disproportionately thick for its body size. Its coat is characteristically dense and coarse, often shades of gray, brown, chestnut, or black, sometimes marked with lighter dun coloring or primitive striping. The mane is thick and often full and unruly, while the tail is characteristically heavy and full. The head is broader than a horse's, with smaller ears and a sturdier jaw. Adult ponies typically weigh 500-800 pounds and can carry significant weight for their size. The eyes are intelligent and alert, marked with a personality and stubbornness that distinguishes them from horses.

## Key Behaviors

Ponies are intelligent, opinionated animals that respond best to consistent handling and develop strong personalities around their regular handlers. They are capable of extraordinary endurance and will work steadily through difficult conditions without complaint, though they will actively resist bad treatment or unreasonable demands. Ponies are herd animals but thrive equally well in isolation, becoming attached to individual handlers or other animals they live alongside. They are curious, methodical in their approach to problems, and possess excellent memory — a pony that encounters a situation remembers it years later. Compared to horses, ponies are considerably less inclined to panic and are practical in their assessment of danger.

## Combat Strategy

A pony will not initiate combat and prefers to flee or simply remove itself from danger. If cornered, separated from its herd, or defending a foal, it becomes a formidable opponent despite its size. Rather than rearing dramatically, the pony uses low, powerful kicks and determined bites to drive away threats. It fights with dogged pragmatism, neither theatrical nor flashy, pressing the attack until the threat withdraws. A pony separated from its handler becomes confused and less effective in combat, though fear may still drive it to violence if trapped.

## Attack Methods

### Powerful Kick

The pony swings a muscular hind leg in a low, powerful arc, using its compact build to generate surprising force in a short arc. This attack is effective at disabling approaching threats and has enough power to crack ribs or shatter bone in arms or legs.

### Bite

If a threat comes within reach, the pony may bite with considerable force, using its broad jaw to crush fingers, tear through leather, or inflict puncture wounds on unarmored flesh.

### Shoulder Check

In rare instances, the pony may lower its head and drive forward with its whole body, using its concentrated weight to knock opponents off balance or drive them backward.

## Special Abilities

### Hardy Endurance

The pony is built for long-distance work in difficult conditions. It can travel for extended periods at steady pace without tiring, subsisting on forage that would barely sustain horses. The pony is naturally resistant to cold, heat, and deprivation, making it reliable in harsh terrain.

### Powerful Legs

Beneath the stocky frame lies extraordinary muscular development in the legs. The pony can jump higher than its size suggests, climb steep slopes, and generate power in its kicks far exceeding what a human could manage.

### Practical Determination

The pony possesses an uncanny ability to find its way across difficult terrain, assess the safest route, and move with confidence even on uncertain ground. This contributes to its effectiveness as a pack animal and working animal in wild lands.

### Honest Stubbornness

The pony will not be driven beyond what it judges reasonable — a pony that refuses to proceed does so because it has identified a genuine hazard (thin ice, unstable slope, dangerous animal) that its instinct rejects. Wise handlers listen to this obstinacy rather than forcing compliance.

### Additional Information

Ponies can be trained by younger or smaller humanoids without requiring the strength needed to handle full horses. They develop fierce attachment to their handlers and will actively mourn separation or death. A well-treated pony becomes a steady, reliable companion worth its weight in practical assistance. Conversely, a pony subjected to cruelty becomes vindictive and dangerous, finding creative ways to injure or escape abusive handlers.

## Attributes

- **Strength:** 22-27 (1d6+21)

- **Endurance:** 8-13 (1d6+7)

- **Agility:** 10-15 (1d6+9)

- **Perception:** 15-20 (1d6+14)

- **Scent:** 2-5 (1d4+1)

- **Aura:** 3-6 (1d4+2)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 3-6 (1d4+2)

- **Creativity:** 3-6 (1d4+2)
