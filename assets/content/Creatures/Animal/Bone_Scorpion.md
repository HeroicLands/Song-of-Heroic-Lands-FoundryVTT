---
aliases:
    - Bone Scorpion
tags:
    - animal
name:
    full: Bone Scorpion
    aliases: []
id: 6qq2ohVEMdu3Lmwo
slug: bone-scorpion
img: icons/game-icons/lorc/scorpion.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 15
        end: 13
        dex: 14
        agl: 12
        per: 15
        aur: 8
        wil: 11
        rea: 6
        cre: 5
    attrRollFormula:
        str: 1d6+11
        end: 1d6+9
        dex: 1d6+10
        agl: 1d6+8
        per: 1d6+11
        aur: 1d4+5
        wil: 1d6+7
        rea: 1d4+3
        cre: 1d4+2
    body:
        structure:
            zones:
                - name: Cephalothorax
                  shortcode: cephzone
                  probWeight: 1
                - name: Abdomen
                  shortcode: abdomenzone
                  probWeight: 1
                - name: Legs
                  shortcode: legszone
                  probWeight: 1
            parts:
                - name: Cephalothorax
                  shortcode: cephpart
                  bodyZoneCode: cephzone
                  roles:
                      - vital
                      - manipulator
                  canHoldItem: false
                  probWeight: 10
                - name: Abdomen
                  shortcode: abdomenpart
                  bodyZoneCode: abdomenzone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Legs
                  shortcode: llegspart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
                - name: Right Legs
                  shortcode: rlegspart
                  bodyZoneCode: legszone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 5
            locations:
                - name: Cephalothorax
                  shortcode: cephloc
                  bodyPartCode: cephpart
                  bleedingSusceptibility: low
                  amputability: none
                  shockValue: 4
                  probWeight: 7
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Fangs
                  shortcode: fangloc
                  bodyPartCode: cephpart
                  bleedingSusceptibility: low
                  amputability: high
                  shockValue: 2
                  probWeight: 3
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: abdomenpart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Left Legs
                  shortcode: llegsloc
                  bodyPartCode: llegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
                - name: Right Legs
                  shortcode: rlegsloc
                  bodyPartCode: rlegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 7
                      edged: 6
                      piercing: 5
                      fire: 7
        weight:
            base: 2
            calc: "2"
        reachBase: 0
        bodyScaleBase: 1.36
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 1
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
              masteryLevelBase: 55
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
              masteryLevelBase: 52
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 35
        - name: Stinger Strike
          type: skill
          system:
              shortcode: sting
              subType: combattechnique
              masteryLevelBase: 56
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: sting
                  name: Stinger Strike
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
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
                      poison: true
        - name: Pincer Crush
          type: skill
          system:
              shortcode: pincer
              subType: combattechnique
              masteryLevelBase: 53
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: pincer
                  name: Pincer Crush
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 2
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

The air grows cold where it stands motionless among the rocks and sand. Its exoskeleton, pale as old bone and nearly translucent in certain light, seems to drink in heat rather than reflect it. Eight legs move with terrible grace and precision, making no sound as the creature shifts its position. The pair of jagged pincers in front rattle softly against each other with a sound like dice in a cup. But it is the tail that dominates your attention—curved upward in a graceful arch, its segments catching light with a sickly iridescence, and at its tip, the stinger: a thing of nightmare, as long as a dagger and poised to strike with the speed of thought.

# Dossier {#dossier}

The Bone Scorpion is a massive desert arachnid evolved to be the apex predator of its habitat. Measuring seven to nine feet from the tip of its tail to the far reach of its pincers, it is an ambush hunter of supernatural patience and terrifying efficiency. Its pale, chitinous exoskeleton has evolved to blend seamlessly with sand and stone, and its metabolism allows it to go weeks without food by entering a hibernation state between kills. These creatures are so feared by desert peoples that they appear in folklore and legend as harbingers of death. A Bone Scorpion guards a territory of several miles and will attack anything it perceives as prey or threat, with no discrimination between human, animal, or monster. Adventurers may encounter them while traveling desert trade routes, investigating ruins, or searching for rare materials—scorpion venom is valuable to alchemists and poisoners.

## Presentation

A creature of alien geometry: a massive arthropod standing three feet tall on eight long, articulated legs. The body consists of a large cephalothorax and an abdomen composed of articulated segments that curve upward and backward into the iconic tail. The entire creature is chitin, pale cream or sickly yellow-white, appearing almost translucent in places where the carapace is thin. The head bears six to eight simple eyes arranged in clusters, each black and brilliant, constantly moving and assessing. The two pincers are massive, composed of jagged, toothed edges designed to crush and shear. The tail rises gracefully, its segments slightly overlapping, each segment growing progressively smaller toward the tip where the stinger emerges. The stinger itself is a shaft of hardened chitin, tapering to a wicked point and dripping with neurotoxic venom. The entire creature is colored to match sand and stone perfectly, making it almost invisible when motionless among rocks.

## Key Behaviors

Bone Scorpions are solitary, fiercely territorial hunters. They establish hunting ranges of four to six miles and will patrol regularly, sometimes covering the same routes multiple nights in succession. During the day, they bury themselves in deep burrows beneath rocks or sand, remaining dormant to conserve energy and avoid the intense desert heat. At dusk, they emerge to hunt, moving with patient precision through their territory, stopping frequently to sense vibrations in the ground or chemical traces in the air. They prefer living prey, as they have a taste for the flavor of fresh blood, and will pursue wounded animals relentlessly. When prey is captured, they may drag it back to their burrow for storage or consumption over several days. They are essentially immune to pain and continue hunting and defending territory until literally incapable of moving. Mating occurs once yearly, typically in spring, and females are more aggressive than males during this period. Pregnant or egg-bearing females become more territorial and more likely to attack humans on sight.

## Combat Strategy

A Bone Scorpion's ideal strategy is a swift ambush from concealment. If buried in sand with only sensory organs exposed, it can detect vibrations from a walking human from forty feet away. It will wait with supernatural patience until the target approaches within striking range, then explosively burst from the sand and drive its stinger into the target's body, injecting venom. Against multiple targets, it uses superior mobility and the reach of its tail to keep opponents at distance while hunting them one by one. It is an intelligent hunter and will test an opponent's defenses, learning weak points and attack patterns before committing fully. If cornered or significantly outnumbered, it will retreat to its burrow, moving with surprising speed across sand or broken rock. Once underground, it is nearly impossible to pursue—the burrow is typically long and narrow, suited perfectly to the scorpion's body, and the creature will defend its entrance with fury if backed against its own lair.

## Attack Methods

### Stinger Strike

The tail whips upward and forward with cobra speed, driven by the core strength of the creature's abdomen. The stinger punctures armor and pierces flesh with ease, and upon impact, the scorpion injects a potent neurotoxin. The venom is rapid-acting and devastating—targets who fail to resist find themselves increasingly paralyzed, starting with weakness and progressing to total immobility if the dose is sufficient. The stinger leaves behind a wound that continues to weep venom for several minutes, potentially delivering multiple doses to a struggling victim.

### Pincer Crush

When a target is grabbed by the pincers—either during a charge or when the tail strike has failed—the scorpion uses its considerable strength to crush bone and sever limbs. The pincers are articulated, allowing the creature to apply shearing force that can cleave through armor as easily as cloth. A victim caught in both pincers can be physically ripped apart if the scorpion succeeds in pulling the target toward its body.

### Tail Whip

The creature's tail can be used as a secondary whipping weapon, striking multiple targets or fending off attackers approaching from the side or rear. While less devastating than a direct stinger strike, a tail whip can injure and knock down opponents.

## Special Abilities

### Neurotoxic Venom

The Bone Scorpion's venom is a sophisticated neurotoxin that attacks the nervous system and paralyzes skeletal muscles. A single injection typically affects smaller creatures severely; larger creatures may resist but will still suffer debilitating weakness. Repeated injections or sustained exposure can overcome even the strongest resistances. The venom is sufficiently valuable that collectors and apothecaries will pay premium prices for fresh samples.

### Sand Camouflage and Burrowing

The scorpion's exoskeleton is naturally camouflaged to blend with sand and desert stone. When motionless, it is nearly invisible to casual observation. It can burrow with surprising speed, digging through compacted sand using its pincers and legs, creating burrows that slope downward and can extend fifteen to twenty feet underground. These burrows are so well-concealed that a scorpion's lair is almost impossible to locate without deliberately searching.

### Sensory Acuity

Despite having simple eyes, a Bone Scorpion has extraordinarily acute senses. It detects vibrations in the earth from considerable distances, perceives heat signatures through thermal sensing organs, and can follow scent trails with precision. In its native desert environment, it is nearly impossible to approach undetected; in other terrains, its sensory advantage remains significant.

## Attributes

- **Strength:** 12-17 (1d6+11)

- **Endurance:** 10-15 (1d6+9)

- **Dexterity:** 11-16 (1d6+10)

- **Agility:** 9-14 (1d6+8)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 6-9 (1d4+5)

- **Will:** 8-13 (1d6+7)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 3-6 (1d4+2)
