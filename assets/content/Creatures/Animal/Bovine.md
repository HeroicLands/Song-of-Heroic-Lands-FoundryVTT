---
aliases:
    - Bovine
tags:
    - animal
name:
    full: Bovine
    aliases: []
id: h55JBmYxilMVO7mS
slug: bovine
img: icons/game-icons/delapouite/cow.svg
portrait: ""
shortcode: bovine
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 32
        end: 18
        agl: 8
        per: 14
        snt: 3
        aur: 3
        wil: 10
        rea: 3
        cre: 2
    attrRollFormula:
        str: 1d6+29
        end: 1d6+15
        agl: 1d4+6
        per: 1d6+11
        snt: 1d4+1
        aur: 1d4+1
        wil: 1d6+7
        rea: 1d4+1
        cre: 1d4
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 4
                - name: Forelegs
                  shortcode: forelegszone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 8
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 6
            parts:
                - name: Head
                  shortcode: headpart
                  bodyZoneCode: headzone
                  roles:
                      - vital
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
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
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
                      piercing: 3
                      fire: 5
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
                      piercing: 3
                      fire: 5
                - name: Flank
                  shortcode: flkloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Left Quarter
                  shortcode: lqtrloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Right Quarter
                  shortcode: rqtrloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 3
                  probWeight: 5
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 4
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
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
                      piercing: 3
                      fire: 5
        weight:
            base: 1500
            calc: "1500"
        reachBase: 0
        bodyScaleBase: 2
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 80
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
              masteryLevelBase: 60
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 33
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 18
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 21
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 33
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 51
        - name: Kick
          type: skill
          system:
              shortcode: kick
              subType: combattechnique
              masteryLevelBase: 45
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
                      spread: 8
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 6
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

The creature's massive form dominates the pasture—all solid muscle and weight pressing down on four columnar legs. Its coat gleams in the sunlight, smoothed by endless hours of grooming and weather. The head swings toward you slowly, and you catch the animal's scent on the wind: warm, earthy, tinged with the ammonia of straw bedding. Its breath huffs from flared nostrils as it regards you with eyes large and dark as storm clouds, intelligence and indifference mixing in that eternal bovine stare. When it shifts its weight, the ground seems to settle and adjust.

# Dossier {#dossier}

Domestic cattle represent one of the first domestications in human civilization—animals selected across millennia for docility, strength, and productivity. Yet beneath that domestication lies the frame and muscle of massive herbivores capable of inflicting serious injury. Standing four to six feet tall at the shoulder and weighing eight hundred to two thousand pounds depending on breed, a bull is a creature of significant power. While bovines as a whole are more docile than wild ungulates, they retain the capacity for violence, particularly bulls during rut, mothers defending calves, or any individual provoked into defending itself. Adventurers encounter bovines primarily in pastoral regions, on farms, driving cattle herds, or when attempting to pass through pasture lands where a protective bull stands guard.

## Presentation

A large, heavy-bodied animal with a compact frame resting on four thick, pillar-like legs. The body is composed almost entirely of muscle covered in short fur that varies by breed—black, white, brown, red, or combinations thereof. Bulls are noticeably larger and more heavily muscled than cows, with a thicker neck and more prominent shoulder and chest development. Horns vary dramatically by breed: some cattle bear no horns at all, while others carry substantial horns capable of reaching three feet in length, sweeping outward and forward. The face is broad and carries a distinctive pattern of nose and eyes—the nostrils are large and often lighter in color than the body, and the eyes are large, dark, and placed on the sides of the head to provide panoramic vision. The tail is long and thin, usually ending in a tassel of longer hair. Most distinctive is the aroma—a warm, earthy, slightly acrid smell that becomes stronger in damp conditions.

## Key Behaviors

Domestic cattle are fundamentally herd animals. A single isolated bovine becomes nervous and unpredictable; a herd of cattle moves with collective purpose. They spend most of their time grazing, moving slowly through pasture and ruminating at leisure, sleeping in short bursts. Cows are protective of calves, particularly in the first few weeks of life, and will charge at perceived threats without hesitation. Bulls develop strong territorial behavior, especially during breeding season (autumn), when a single bull may attack other bulls, humans, or animals that approach cows. Some bulls become progressively aggressive as they age, learning that charging and goring work as deterrents and growing bolder each time they succeed. Cattle have long memories and recognize individual humans—a bull that has been struck or cornered by a particular person will often bear a grudge and seek confrontation on subsequent encounters. They are also herd animals in a deep sense: if one member of a group bolts in panic, others will follow, creating the catastrophic stampedes that have devastated communities throughout history.

## Combat Strategy

Most cattle defend themselves by charging and using their horns as primary weapons. A horned bovine will lower its head, accelerate forward, and attempt to gore an opponent on the horns or bash them with the skull behind. If it successfully impacts a target, it will continue forward, attempting to drive the opponent backward and downward. Bulls with experience fighting (from jousting with other bulls during rut) are notably more tactical—they will feint, test an opponent's stance, and exploit openings. In groups, cattle instinctively form a protective circle around calves or wounded members, with adults facing outward. A startled herd will stampede if the path of flight is clear—and a stampeding herd is one of the most destructive forces in nature. A single mounted rider cannot reliably stop a panicked stampede; the momentum and mass is simply too great.

## Attack Methods

### Horned Charge

The bull lowers its head and accelerates toward the target, seeking to gore with its horns or bash with the crown of its skull. The force is sufficient to crack ribs and can drive an opponent backward several feet. A successful impact may lift the target off the ground and hurl them backward. Horned cattle are dramatically more dangerous than hornless ones.

### Trample

Once an opponent is on the ground or flanked, the bovine may deliberately step on them with legs like pillars, each hoof impact delivering the full weight of the animal concentrated into a small area. This attack is particularly devastating against armored opponents, as the impact can crush plates and joints beneath the weight.

### Kick

When attacked from behind or to the side, a bovine will sometimes turn and deliver a powerful rear-leg kick. This is less precise than a charge but can catch unwary opponents and inflict significant trauma.

## Special Abilities

### Herd Instinct and Stampede

A group of cattle amplifies individual aggression through herd behavior. When one panics, others follow. When one charges, others may do the same. A stampeding herd becomes an unstoppable force capable of destroying structures and killing dozens of people. This ability manifests more dramatically with larger herds—a stampede of fifty cattle is dramatically more dangerous than five, which may stop of their own accord if the threat is removed.

### Surprising Strength and Resilience

Despite their herbivorous nature, bovines are remarkably strong and robust. Their muscle and bone density exceed that of predators of comparable size. The thick skin and body structure provide some resistance to both slashing and piercing attacks, and blunt force trauma to the body is less likely to incapacitate them than cutting attacks.

### Keen Senses and Herd Awareness

Cattle have excellent hearing and smell, and they rely on their collective senses to detect threats. A herd will often notice predators or humans long before an individual animal would, communicating through vocalizations and body language. A nervous herd becomes a warning system for others in the area.

## Attributes

- **Strength:** 30-35 (1d6+29)

- **Endurance:** 16-21 (1d6+15)

- **Agility:** 7-10 (1d4+6)

- **Perception:** 12-17 (1d6+11)

- **Scent:** 2-5 (1d4+1)

- **Aura:** 2-5 (1d4+1)

- **Will:** 8-13 (1d6+7)

- **Reasoning:** 2-5 (1d4+1)

- **Creativity:** 1-4 (1d4)
