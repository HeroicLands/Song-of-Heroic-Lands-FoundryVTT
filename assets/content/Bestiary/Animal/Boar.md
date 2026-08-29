---
aliases:
  - Boar
  - being-boar
tags:
  - animal
name:
  full: Boar
  aliases: []
description: "A compact, aggressive tusked ungulate of forests and scrublands, quick to charge with muscle and violence when its territory is crossed."
id: uyxMgEZ2vyfT2W7A
img: icons/game-icons/caro-asercion/boar.svg
portrait: images/being/boar-portrait.webp
shortcode: boar
type: being
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 14
    end: 16
    agl: 9
    per: 10
    snt: 4
    aur: 4
    wil: 15
    rea: 6
    cre: 7
  attrRollFormula:
    str: 1d6+11
    end: 1d6+13
    agl: 1d4+7
    per: 1d6+7
    snt: 1d4+2
    aur: 1d4+2
    wil: 1d6+12
    rea: 1d4+4
    cre: 1d4+5
  body:
    structure:
      zones:
        - name: Head
          shortcode: headzone
          probWeight: 2
        - name: Forelegs
          shortcode: forelegszone
          probWeight: 2
        - name: Torso
          shortcode: torsozone
          probWeight: 4
        - name: Hindquarters
          shortcode: hindqtrzone
          probWeight: 2
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
          probWeight: 6
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
          probWeight: 4
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
        - name: Thorax
          shortcode: thoraxloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 5
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
          probWeight: 3
          protectionBase:
            blunt: 3
            edged: 2
            piercing: 1
            fire: 3
        - name: Pelvis
          shortcode: plvsloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 2
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
          probWeight: 10
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
          probWeight: 10
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
      base: 200
      calc: "200"
    reachBase: 0
    bodyScaleBase: 1.17
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 110
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
        masteryLevelBase: 45
    - shortcode: sprt
      type: mysticalability
      system:
        masteryLevelBase: 27
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 55
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 36
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 75
    - name: Tusk
      type: skill
      system:
        shortcode: tusk
        subType: combattechnique
        masteryLevelBase: 60
        combatCategory: melee
        impairedByRoles:
          - manipulator
        strikeMode:
          type: melee
          shortcode: tusk
          name: Tusk
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 4
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: 2
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
            armorReduction: 1
    - name: Kick
      type: skill
      system:
        shortcode: kick
        subType: combattechnique
        masteryLevelBase: 48
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
            modifier: -1
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

The bristling shape erupts from the underbrush with a savage shriek that freezes your blood. Coarse, dark hair stands on end across its muscular shoulders and back, making it appear larger than it already is. Two curved tusks, yellowed and wickedly sharp, frame a snout that plows through the dirt in its rage. The reek of musk and churned earth fills the air, and you can see froth flecking the beast's jaws as it lowers its head and charges.

# Dossier {#dossier}

The wild boar is a creature born of territories and violence, a compact engine of aggression and muscle covered in dense, bristling hair. Standing three to four feet tall at the shoulder and weighing two hundred to four hundred pounds, these tusked ungulates are found in forests, grasslands, and scrublands across most inhabited continents. They are neither apex predators nor entirely harmless grazers—they are opportunistic survivors that will eat roots, grubs, small animals, and carrion with equal enthusiasm. A boar's true danger lies in its temperament: it is quick to anger, slow to retreat, and fights with suicidal determination. Males are noticeably more aggressive than females, particularly during autumn rut. Adventurers may encounter them at wallows during summer, defending territorial ground, protecting litters of piglets, or simply rooting for food in areas humans have claimed as their own.

## Presentation

A sturdily built ungulate with a stocky body sitting low on short, powerful legs. The head is large and tapers to a reinforced muzzle designed for rooting and digging. Its tusks—typically curved outward and upward—can measure four to six inches in length, and older males display prominent tusks that are yellowed, chipped, and darkened by use and blood. The coat is thick and coarse, ranging from dark brown to nearly black, with hair standing upright on the neck, shoulders, and spine when the animal is agitated. The eyes are small and set relatively high on the head, dark and possessed of surprising intelligence and malice. The tail is thin and usually upright when the animal is alert. Most distinctive is the reek—a powerful musk that becomes more pronounced when the boar is stressed or agitated.

## Key Behaviors

Wild boars are highly territorial animals. Mature males establish and defend home ranges, marking trees with tusks and scent glands, confronting rivals, and mating with available females during autumn rut. Females form small matriarchal groups of related individuals and sows with piglets—these maternal groups are even more aggressive than solitary males when protecting offspring. Boars are prolific foragers, turning over soil with their snouts to reach grubs, roots, and tubers, and they will ravage cultivated fields with single-minded efficiency. They are surprisingly intelligent animals with long memories. A boar that has been hunted will become exceptionally wary, will adjust its activity patterns to avoid humans, and will remember the hunting grounds as dangerous. Conversely, boars that find no opposition will become bolder, approaching human settlements and livestock with increasing confidence. They are creatures of routine—a boar typically follows similar paths to water, feeding grounds, and wallows, returning to the same mud holes during hot weather.

## Combat Strategy

A boar's primary tactic is a devastating charge from which it will not deviate unless severely wounded or genuinely overcome with fear. It will lower its head, steel itself into a narrow profile to minimize exposure, and accelerate directly at the threat with tusks angled upward to impale and disembowel. If the charge connects and the target is knocked down, the boar will continue to attack, slashing with its tusks and attempting to gore any vulnerable area. Boars rarely flee once engaged—they will continue attacking until the threat is neutralized, they themselves are mortally wounded, or they have achieved sufficient distance to charge again. A wounded boar becomes progressively more dangerous; pain and blood-scent trigger deeper aggression. When forced to retreat, a boar will back away slowly, maintaining eye contact and readiness to charge if the threat advances.

## Attack Methods

### Charging Gore

The boar accelerates toward its target and drives upward with its tusks, seeking to impale the abdomen, thigh, or chest. The sheer force of a charging boar can knock even armored opponents from their feet. Once an opponent is on the ground, the boar typically wheels to attack again rather than pursuing a downed target.

### Tusk Slash

With the target at close quarters, the boar swings its head violently side to side, its tusks describing arcs capable of opening deep wounds and severing tendons. This attack is often used to follow up a charge when an opponent is still mobile, or when multiple attackers surround the boar.

### Trample and Stomp

A boar will sometimes attempt to knock an opponent down and then trample them with all four hooves, focusing on the legs and torso. This tactic is less common than charging, but more aggressive individuals will use it to disable opponents quickly.

## Special Abilities

### Relentless Aggression

Once a boar is engaged, it pursues combat with suicidal determination. It does not tire easily, will not break combat to pursue other threats, and will continue attacking even when clearly outmatched. This trait makes boars more dangerous than animals of equal strength—they simply will not stop. Magical terror or overwhelming pain can break this aggression, but ordinary threats do not.

### Tough Hide and Resilience

A boar's skin is thick and leathery, and the bristling coat provides some protection against cutting and slashing attacks. The animal's bone density is greater than it first appears, making it more resistant to blunt force trauma than expected. Arrows penetrate well; slashing weapons often glance off.

### Keen Sense of Smell

Boars rely heavily on scent and can track wounded prey for considerable distances. They can detect the presence of humans and other large animals at impressive ranges and will investigate food scents obsessively. This sensory advantage makes them difficult to ambush if the wind carries human scent toward them.

## Attributes

- **Strength:** 12-17 (1d6+11)

- **Endurance:** 14-19 (1d6+13)

- **Agility:** 8-11 (1d4+7)

- **Perception:** 8-13 (1d6+7)

- **Scent:** 3-6 (1d4+2)

- **Aura:** 3-6 (1d4+2)

- **Will:** 13-18 (1d6+12)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 6-9 (1d4+5)
