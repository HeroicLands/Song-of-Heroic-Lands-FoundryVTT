---
tags:
  - animal
name:
  full: Komodo Dragon
  aliases: []
description: "The largest living lizard, a heavily muscled nine-to-ten-foot reptile whose broad-jawed, coarse-scaled body makes it a formidable ambush hunter."
id: getyv8Y5C6ktjC6B
img: icons/game-icons/lorc/gecko.svg
portrait: images/being/kmddrgn-portrait.webp
shortcode: kmddrgn
type: being
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 15
    end: 13
    dex: 11
    agl: 10
    per: 13
    aur: 11
    wil: 12
    rea: 7
    cre: 6
  attrRollFormula:
    str: 1d6+11
    end: 1d6+9
    dex: 1d6+7
    agl: 1d4+7
    per: 1d6+9
    aur: 1d6+7
    wil: 1d6+8
    rea: 1d4+4
    cre: 1d4+3
  body:
    structure:
      zones:
        - name: Forequarters
          shortcode: fqtrzone
          probWeight: 1
        - name: Torso
          shortcode: torsozone
          probWeight: 1
        - name: Hindquarters
          shortcode: hindqtrzone
          probWeight: 1
      parts:
        - name: Head
          shortcode: headpart
          bodyZoneCode: fqtrzone
          roles:
            - vital
            - manipulator
          canHoldItem: false
          probWeight: 10
        - name: Left Foreleg
          shortcode: lforelegpart
          bodyZoneCode: fqtrzone
          roles: &a1
            - locomotor
          canHoldItem: false
          probWeight: 5
        - name: Right Foreleg
          shortcode: rforelegpart
          bodyZoneCode: fqtrzone
          roles: *a1
          canHoldItem: false
          probWeight: 5
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
          probWeight: 5
        - name: Right Hind Leg
          shortcode: rhindlegpart
          bodyZoneCode: hindqtrzone
          roles:
            - locomotor
          canHoldItem: false
          probWeight: 5
        - name: Tail
          shortcode: tailpart
          bodyZoneCode: hindqtrzone
          roles:
            - manipulator
          canHoldItem: false
          probWeight: 10
      locations:
        - name: Head
          shortcode: headloc
          bodyPartCode: headpart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 5
          probWeight: 3
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
          probWeight: 2
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
        - name: Thorax
          shortcode: thoraxloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 5
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
          probWeight: 3
          protectionBase:
            blunt: 5
            edged: 4
            piercing: 3
            fire: 5
        - name: Pelvis
          shortcode: plvsloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 2
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
          probWeight: 10
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
          probWeight: 10
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
      base: 20
      calc: "20"
    reachBase: 0
    bodyScaleBase: 1.22
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
        masteryLevelBase: 33
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 40
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 44
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 35
    - name: Venomous Bite
      type: skill
      system:
        shortcode: bite
        subType: combattechnique
        masteryLevelBase: 60
        combatCategory: melee
        impairedByRoles:
          - manipulator
        strikeMode:
          type: melee
          shortcode: bite
          name: Venomous Bite
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
            poison: true
    - name: Tail Strike
      type: skill
      system:
        shortcode: tail
        subType: combattechnique
        masteryLevelBase: 50
        combatCategory: melee
        impairedByRoles:
          - locomotor
        strikeMode:
          type: melee
          shortcode: tail
          name: Tail Strike
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

You notice the disturbance in the scrub first—a barely perceptible parting of the underbrush, accompanied by the smell of aged decay and something distinctly reptilian. Then the creature emerges, moving with deceptive slowness that masks coiled power: a massive lizard whose scales catch and scatter the light in dull bronze and gray. Its forked tongue flicks repeatedly, tasting your scent on the wind. When it turns toward you, its eyes are ancient and flat, and the malevolent intelligence behind them is unmistakable. Each claw-strike against stone rings like a death knell.

# Dossier {#dossier}

The Komodo dragon is the largest living lizard, measuring 9 to 10 feet in length and weighing 200-300 pounds. Its body is heavily built and muscular, with coarse scales in shades of gray-brown or bronze-black that darken with age. The body thickens along the back and sides, creating a powerful, tapering silhouette. Its head is proportionally broad, with a wide jaw and small eyes positioned somewhat forward of center, granting good forward vision for ambush hunting.

## Presentation

Komodo dragons display rough, knobbed scales across their entire body, with prominent ridges along the spine and tail. Their coloration provides excellent camouflage in rocky, scrubby environments, and individuals often bear darker mottling or paler patches depending on local soil coloration. The head is broad and flattened, with powerful musculature visible beneath the scales. The mouth is slightly underslung and can open to an impressive width. Claws are sharp and constantly maintained through use. The tail is nearly as long as the body, muscular and whip-like. A musky, acrid odor surrounds them at all times.

## Key Behaviors

Komodo dragons are primarily solitary predators, though they will congregate at carcasses or in regions of high prey abundance. They are ambush hunters par excellence, spending much of their day resting in burrows, beneath rocks, or in dense vegetation, waiting for prey. They hunt during the day and rest at night. A dragon can sense carrion from a considerable distance and will congregate with other dragons to feed on a fresh kill, their social hierarchy determining feeding order. Their venomous saliva, combined with pathogenic bacteria, makes a bite persistently dangerous; prey bitten by a dragon gradually weakens as venom and infection ravage the body, even if the dragon loses the initial encounter.

## Combat Strategy

Komodo dragons employ ambush and patience above all else. A dragon will position itself along known prey trails or near water sources and remain motionless until prey comes within striking range, then execute a devastating bite attack before retreating to let venom and infection do their work. If forced into direct combat with an alert opponent, the dragon will use its tail to create distance and its venom to progressively weaken the enemy. A dragon will abandon a prey animal if it escapes without injury; the dragon reserves energy for more promising hunts.

## Attack Methods

### Venomous Bite

The dragon lunges to clamp its powerful jaws on the target, delivering a bite laden with venom and pathogenic saliva; the bite causes immediate damage and ongoing poison damage that increases in severity as the venom spreads.

### Tail Strike

The dragon lashes its whip-like tail to keep opponents at distance, knock them off balance, or inflict slashing damage; the tail is precise enough to target specific limbs or weapons.

## Special Abilities

### Venomous Saliva

The Komodo dragon's bite injects a complex venom mixed with pathogenic bacteria; victims experience immediate puncture damage and progressive poison damage that persists and worsens without treatment, potentially causing paralysis or death.

### Ambush Master

The Komodo dragon gains substantial bonuses to stealth and to attack rolls when striking from surprise; in terrain of its choice, the dragon is nearly undetectable until it chooses to strike.

## Attributes

- **Strength:** 12-17 (1d6+11)

- **Endurance:** 10-15 (1d6+9)

- **Dexterity:** 8-13 (1d6+7)

- **Agility:** 8-11 (1d4+7)

- **Perception:** 10-15 (1d6+9)

- **Aura:** 8-13 (1d6+7)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
