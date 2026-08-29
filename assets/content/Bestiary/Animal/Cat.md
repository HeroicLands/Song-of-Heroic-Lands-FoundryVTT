---
aliases:
  - Cat
  - being-cat
tags:
  - animal
name:
  full: Cat
  aliases: []
description: "A small solitary predator living between wild and tame, hunting vermin with lethal efficiency while tolerating the humans it shares hearths with."
id: HssiDLDnWMtX8Yp4
img: icons/game-icons/lorc/cat.svg
portrait: images/being/cat-portrait.webp
shortcode: cat
type: being
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 3
    end: 8
    agl: 18
    per: 16
    snt: 3
    aur: 4
    wil: 18
    rea: 5
    cre: 5
  attrRollFormula:
    str: 1d4+1
    end: 1d4+6
    agl: 1d6+15
    per: 1d6+13
    snt: 1d4+1
    aur: 1d4+2
    wil: 1d6+15
    rea: 1d4+3
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
            - manipulator
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
          roles: []
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
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Neck
          shortcode: neckloc
          bodyPartCode: headpart
          bleedingSusceptibility: high
          amputability: low
          shockValue: 5
          probWeight: 2
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Left Foreleg
          shortcode: lforelegloc
          bodyPartCode: lforelegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Right Foreleg
          shortcode: rforelegloc
          bodyPartCode: rforelegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Thorax
          shortcode: thoraxloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 5
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Abdomen
          shortcode: abdloc
          bodyPartCode: torsopart
          bleedingSusceptibility: high
          amputability: none
          shockValue: 4
          probWeight: 3
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Pelvis
          shortcode: plvsloc
          bodyPartCode: torsopart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 2
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Left Hind Leg
          shortcode: lhindlegloc
          bodyPartCode: lhindlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Right Hind Leg
          shortcode: rhindlegloc
          bodyPartCode: rhindlegpart
          bleedingSusceptibility: low
          amputability: medium
          shockValue: 2
          probWeight: 10
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
        - name: Tail
          shortcode: tailloc
          bodyPartCode: tailpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: -3
            edged: -4
            piercing: -5
            fire: -3
    weight:
      base: 10
      calc: "10"
    reachBase: 0
    bodyScaleBase: 0.43
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 70
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
        masteryLevelBase: 85
    - shortcode: stlth
      type: skill
      system:
        masteryLevelBase: 85
    - shortcode: sprt
      type: mysticalability
      system:
        masteryLevelBase: 33
    - shortcode: init
      type: skill
      system:
        masteryLevelBase: 36
    - shortcode: dge
      type: skill
      system:
        masteryLevelBase: 68
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 15
    - name: Claw
      type: skill
      system:
        shortcode: claw
        subType: combattechnique
        masteryLevelBase: 72
        combatCategory: melee
        impairedByRoles:
          - manipulator
        strikeMode:
          type: melee
          shortcode: claw
          name: Claw
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 1
            modifier: 0
          impactBase:
            numDice: 1
            die: 8
            modifier: -7
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
    - name: Bite
      type: skill
      system:
        shortcode: bite
        subType: combattechnique
        masteryLevelBase: 54
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
            spread: 1
            modifier: 0
          impactBase:
            numDice: 1
            die: 6
            modifier: -5
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

It watches you from the corner with eyes that catch and reflect light like polished amber or jade. The creature is compact and sinuous, muscles rippling beneath fur as it shifts position with liquid grace. Its whiskers twitch, sensory organs constantly scanning the environment. When it moves, there is almost no sound—just the faint pad of tiny feet on wood or stone, and the occasional whisper of claws extending and retracting. The tail, seemingly possessed of independent intelligence, curves and straightens in an endless conversation with the world around it.

# Dossier {#dossier}

The domestic cat is a small predator that has evolved in close partnership with humans, existing in a state between wild and tame. Weighing five to fifteen pounds and standing eight to ten inches tall at the shoulder, cats are formidable hunters of small prey despite their size. They are primarily solitary creatures, though they tolerate human company and the proximity of other cats if food is plentiful. Unlike dogs, cats maintain independence and will abandon situations they find unfavorable. They are found in virtually all human settlements and in wild areas adjacent to human habitation. While not a significant threat to armed adults, cats can cause injury when provoked or defending territory, and they occasionally trigger terror in those with specific phobias. Adventurers encounter domestic cats primarily in towns and villages, where they serve as mousers, pets, or semi-wild hunters of local rodent populations.

## Presentation

A small, sleek mammal with a compact body built for stealth and climbing. The body is muscular and flexible, capable of contorting in surprising ways. The head is proportionally large with a broad face, pointed ears set to the sides and capable of independent rotation, and large forward-facing eyes that glow faintly in darkness. The eyes are expressive, conveying mood and intention clearly to those who understand cat behavior. The mouth contains sharp canine teeth and rough, rasping tongue. The paws contain retractable claws that are kept razor-sharp through constant grooming and maintenance. The tail is long, typically a third of the cat's total body length, and serves as both balance organ and communication device. Fur varies dramatically by individual: from short sleek coats to long, flowing fur; from solid colors to complex patterns; from snow-white to jet-black to every color in between. The scent gland secretions are pungent, especially in intact males, and territorial cats mark territory extensively.

## Key Behaviors

Domestic cats are ambush hunters that spend much of daylight resting in warm, elevated places. They become active around dusk, hunting small prey: rodents, birds, insects, and small reptiles. A cat's hunting methodology is patient stalking followed by explosive acceleration—they will watch a hunting ground for many minutes before pouncing. They are territorial, particularly males, and will defend home ranges from other cats through displays and physical combat. Cats are surprisingly social animals: they form bonds with humans and with other cats they grew up alongside, communicating through vocalizations, body language, and scent marking. They are fastidious animals, spending significant time grooming themselves and maintaining cleanliness. Cats are also curious animals, investigating new objects and changes to their environment with intensity. A cat that has been ill-treated will remember and avoid that person indefinitely; conversely, a cat that has been fed and treated well will actively seek out that person's company. They are crepuscular, most active during twilight hours, and largely nocturnal in wild populations.

## Combat Strategy

Cats defend territory against other cats through ritualized display and direct fighting, but they avoid confrontation with larger animals. If cornered or if protecting young, a cat will fight with surprising ferocity, using both claws and teeth to inflict wounds. Their strategy is to inflict rapid damage and then retreat to a place of safety—usually elevated terrain or enclosed space. Cats use speed and agility to avoid being struck, dodging attacks and moving in unpredictable patterns. A cornered cat will present a much larger silhouette by raising its fur, arching its back, and turning sideways—this display is meant to intimidate. If the threat does not back off, the cat will attack the face and eyes with claws, attempting to blind or injure the attacker severely enough to allow escape.

## Attack Methods

### Claw Strike

The cat rakes with its claws, using its front paws in rapid succession. The claws are razor-sharp and designed to penetrate skin and cause bleeding. While individual scratches are shallow, multiple rapid strikes can create wounds that become infected or bleed excessively. Cats instinctively target the face and eyes, seeking to disable attackers by compromising vision.

### Bite

The cat's teeth are small and sharp, designed to pierce soft targets and sever small arteries. A bite to the face, neck, or hands can cause significant blood loss and severe pain. Cats often bite and hold, shaking their head to increase damage. The bite itself is less dangerous than the claws but carries high infection risk due to the fine puncture wounds.

### Grappling and Kicking

When a larger opponent attempts to grab a cat, the cat often wraps its front legs around the threat while using its hind legs to kick and rake. The hind legs are particularly powerful, and claws embedded in both front and hind limbs can prevent escape and inflict severe lacerations.

## Special Abilities

### Silent Movement and Stealth

Cats move with minimal sound due to the soft pads of their paws and their naturally graceful, controlled movement. Their lightweight frames and joint flexibility allow them to navigate cluttered terrain without disturbing objects. In dim light or cluttered environments, a cat can approach unseen and achieve surprise without difficulty.

### Superior Agility and Balance

Cats possess extraordinary balance and proprioception, allowing them to land feet-first from falls that would injure humans, to navigate narrow ledges and precarious terrain, and to dodge with remarkable precision. Their flexibility allows them to contort their spine in ways that let them escape grapples and reach targets that seem inaccessible.

### Acute Senses

Cats possess exceptional night vision, seeing clearly in light levels that appear dark to humans. Their hearing is acute enough to detect ultrasonic sounds that humans cannot perceive. Their sense of smell is strong, allowing them to track prey and navigate by scent alone. Combined, these senses make cats exceptionally aware of their surroundings and difficult to surprise.

### Territorial Aggression

When defending territory, young, or personal space, cats fight with disproportionate ferocity. A small cat cornered will attack much larger opponents with suicidal intensity, targeting vulnerable areas and attempting to inflict maximum damage rapidly. This aggression is not rational but instinctive—a cornered cat will not flee merely because the threat is larger.

## Attributes

- **Strength:** 2-5 (1d4+1)

- **Endurance:** 7-10 (1d4+6)

- **Agility:** 16-21 (1d6+15)

- **Perception:** 14-19 (1d6+13)

- **Scent:** 2-5 (1d4+1)

- **Aura:** 3-6 (1d4+2)

- **Will:** 16-21 (1d6+15)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 4-7 (1d4+3)
