---
aliases:
    - Thornback Boar
tags:
    - animal
name:
    full: Thornback Boar
    aliases: []
id: eQYklk8rdEDE0Dzb
slug: thornback-boar
img: icons/game-icons/caro-asercion/boar.svg
portrait: ""
shortcode: thrnbckb
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 17
        end: 16
        dex: 11
        agl: 11
        per: 12
        aur: 9
        wil: 14
        rea: 7
        cre: 5
    attrRollFormula:
        str: 1d6+13
        end: 1d6+12
        dex: 1d6+7
        agl: 1d6+7
        per: 1d6+8
        aur: 1d4+6
        wil: 1d6+10
        rea: 1d4+4
        cre: 1d4+2
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
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
                      blunt: 5
                      edged: 4
                      piercing: 3
                      fire: 5
        weight:
            base: 200
            calc: "200"
        reachBase: 0
        bodyScaleBase: 1.33
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 60
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
              masteryLevelBase: 65
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 60
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 33
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 44
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 43
        - name: Goring Charge
          type: skill
          system:
              shortcode: gore
              subType: combattechnique
              masteryLevelBase: 59
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: gore
                  name: Goring Charge
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 4
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
        - name: Trampling Stomp
          type: skill
          system:
              shortcode: kick
              subType: combattechnique
              masteryLevelBase: 52
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: kick
                  name: Trampling Stomp
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

The sound comes first: a furious snort that seems to explode from the undergrowth, followed by the savage crashing of something massive pushing through brush. The creature that emerges is pure, concentrated malevolence — a stocky form covered in coarse bristles, with jagged, bony spines protruding from its back like a warrior’s armor made of bone and fury. The tusks curve upward and forward, aged and stained dark, clearly used repeatedly to gore enemies into submission. The eyes are small, deep-set, and burning with an intensity that seems personal, as if this creature has decided you are a direct affront to its existence.

# Dossier {#dossier}

The Thornback Boar is a wild, heavily built predator standing 4-5 feet at the shoulder and weighing 300-400 pounds, found in forests, scrublands, and rough terrain throughout temperate regions. These ferociously territorial creatures are dangerous to anything that ventures into claimed space, with solitary males being exceptionally aggressive. Adventurers encounter thornback boars while traveling forests, hunting game, or inadvertently entering territory claimed by the creatures.

## Presentation

The Thornback Boar is a compact, muscular creature built for charging and goring rather than running or climbing. The body is covered in coarse, bristly hair ranging from dark brown to black, often matted and stained with mud, blood, and vegetation. The most distinctive feature is the row of jagged, bony spines running down the back from neck to tail — each spike 4-8 inches in length, sharp at the point, and clearly evolved for defense against attacking predators. The head is massive and blocky, with small, deep-set eyes that burn with primal intensity, and a snout adapted for rooting in earth. The tusks are curved, thick, and often darkened with age and use, capable of perforating armor and inflicting terrible wounds. The legs are powerful and short, built for driving forward with all the creature’s weight.

## Key Behaviors

Thornback Boars are territorial and aggressively defensive of claimed ranges, which include sources of water, good rooting ground, and shelter. They are primarily solitary except during mating season, when males’ aggression peaks. They spend much of their time rooting through soil and undergrowth for food, leaving trails of disturbed earth and churned vegetation. Mothers defending young become nearly uncontrollable in aggression. The creatures are most active during dawn, dusk, and night, resting during midday heat. They are highly intelligent in terms of territorial defense and learning, and a boar that has successfully driven off predators learns to recognize threats and reuse successful tactics.

## Combat Strategy

The thornback boar charges directly at threats with single-minded determination, attempting to gore with tusks and trample with all its weight. Once engaged, it continues attacking with complete commitment, ignoring injuries and pain. The boar uses the spines on its back as natural defense against attacks from behind or from above. A cornered boar fights to the death rather than retreating. Boars defending young or territory become absolutely unstoppable, fighting with suicidal determination.

## Attack Methods

### Goring Charge

The thornback boar charges forward with all its weight concentrated behind its tusks, attempting to gore and disembowel opponents. The attack is devastatingly powerful and capable of launching even armored opponents backward.

### Trampling Stomp

Once a target is knocked off balance, the boar may attempt to simply trample the victim under its weight, causing crushing injuries and hoof wounds.

### Spine Damage

Anyone attacking from behind or attempting to grapple the boar’s rear risks injury from the jagged spines, which can inflict lacerations and puncture wounds.

## Special Abilities

### Armor Spines

The jagged spines along the boar’s back provide genuine protection that reduces damage from slashing attacks and create hazard for anything attempting to grapple or attack from behind.

### Relentless Charge

Once the boar commits to a charge, it is nearly unstoppable, continuing forward through most obstacles and continuing to attack even when severely injured.

### Territorial Aggression

Within claimed territory, the boar fights with enhanced aggression and bonuses to all attack rolls, drawing confidence from dominance in familiar ground.

### Rage Frenzy

As the boar becomes injured, it becomes progressively more aggressive and dangerous, not backing down or retreating regardless of the damage sustained.

### Additional Information

Thornback boars are most dangerous in forests and rough terrain where their charging capability is less restricted. In open ground, the boar’s advantage is somewhat reduced. Mothers defending young are nearly unbeatable and should be avoided entirely. A boar that has successfully fought off predators learns to recognize and be more aggressive toward future threats. The creature’s tusks and spines can be harvested after death for weapon-making or crafting. Boar hunting is a traditional activity in many cultures and carries significant cultural weight and danger.

## Attributes

- **Strength:** 14-19 (1d6+13)

- **Endurance:** 13-18 (1d6+12)

- **Dexterity:** 8-13 (1d6+7)

- **Agility:** 8-13 (1d6+7)

- **Perception:** 9-14 (1d6+8)

- **Aura:** 7-10 (1d4+6)

- **Will:** 11-16 (1d6+10)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 3-6 (1d4+2)
