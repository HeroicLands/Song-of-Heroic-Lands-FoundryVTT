---
aliases:
    - Charger
    - creature-charger
tags:
    - animal
name:
    full: Charger
    aliases: []
description: "A powerful warhorse bred and trained for battle, conditioned to endure noise, blood, and violence while carrying an armored rider into the fray."
id: Cxlwa3jzWHmPyVl7
img: icons/game-icons/delapouite/horse-head.svg
portrait: images/being/charger-portrait.webp
shortcode: charger
type: creature
package: sohl
sohl:
    kbcat: animal
    archetype: 0
    attributes:
        str: 28
        end: 11
        agl: 11
        per: 17
        snt: 4
        aur: 4
        wil: 11
        rea: 4
        cre: 4
    attrRollFormula:
        str: 1d6+25
        end: 1d6+8
        agl: 1d6+8
        per: 1d6+14
        snt: 1d4+2
        aur: 1d4+2
        wil: 1d6+8
        rea: 1d4+2
        cre: 1d4+2
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
                      piercing: 2
                      fire: 4
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
                      piercing: 2
                      fire: 4
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
                      piercing: 2
                      fire: 4
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
                      piercing: 2
                      fire: 4
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
                      piercing: 2
                      fire: 4
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
                      piercing: 2
                      fire: 4
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
                      piercing: 2
                      fire: 4
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
                      piercing: 2
                      fire: 4
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
                      piercing: 2
                      fire: 4
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
                      piercing: 2
                      fire: 4
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
                      piercing: 2
                      fire: 4
        weight:
            base: 1200
            calc: "1200"
        reachBase: 0
        bodyScaleBase: 1.84
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 140
          leaguesPerWatch: 9
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: mixed_forest
                mode: add
                textValue: "-3"
              - scope: topography
                key: steep
                mode: add
                textValue: "-3"
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
              masteryLevelBase: 40
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 56
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 65
        - name: Kick
          type: skill
          system:
              shortcode: kick
              subType: combattechnique
              masteryLevelBase: 62
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
              masteryLevelBase: 55
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
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 4
                      modifier: 4
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

The muscle-bound form towers above human height, a living mountain of power and discipline. The warhorse stands seventeen hands at the shoulder, its chest broad as a shield and thick-boned beneath sleek, well-groomed coat. When it shifts its weight, the ground acknowledges the burden—each hoof the size of a large man's palm impacts with a soft but definitive thud. Its breathing is controlled and deep, nostrils flaring only slightly, and its eyes—intelligent, dark, watchful—track movement with the focus of a seasoned warrior. The scent that rises from its warm body carries the metallic tang of sweat and leather, the smell of something bred for violence but held firm through discipline.

# Dossier {#dossier}

The Charger is a warhorse: specifically selected, carefully bred, and extensively trained for military service. Standing sixteen to eighteen hands tall and weighing twelve hundred to eighteen hundred pounds, these horses represent centuries of selective breeding for size, strength, and temperament. A Charger has been conditioned from youth to tolerate noise, violence, the scent of blood, and the presence of armed soldiers. Their courage is legendary; they will charge into circumstances that would panic less disciplined horses. They are most commonly found in service to wealthy nobility, military organizations, or as the mount of experienced knights. Adventurers encounter Chargers primarily on roads when passing convoys, on battlefields, as remnants of destroyed military forces, or as prestigious mounts for powerful individuals.

## Presentation

An impressive equine standing noticeably taller and broader than ordinary horses, with particularly heavy bone structure in the legs. The body is muscular and compact, with a thick neck, pronounced withers, and a compact back well-suited to bearing armor and weight. The head is proportionally smaller than common horses but conveying an impression of intelligence and strength. The coat is typically solid colors: black, dark brown, chestnut, or gray—carefully maintained and groomed. The mane and tail are often braided with leather cords, metal clips, or small bells. The hooves are large and dark, kept in excellent condition. Chargers often bear scars from previous battles: old cuts, burns, or marks where armor edges have abraded hide. Their bearing is distinctive—the posture of a trained war machine, alert and responsive, ears forward and nostrils flared. Many Chargers have visible discipline marks from training: areas where saddle sores, bites, or whip marks have left faint scars beneath the coat.

## Key Behaviors

Chargers are fundamentally herd animals, but their training has modified natural herd instinct. They bond intensely with their handler or rider and will follow commands even in situations where untrained horses would panic. They are more aggressive than civilian horses and show dominance behaviors toward other equines, establishing hierarchy through posturing and occasional fighting. In military service, they work with other Chargers in coordinated formations, moving as units rather than individuals. They are sensitive to the emotional state of their rider—a calm, confident handler produces a calm, confident horse; a fearful handler produces a horse that senses danger and becomes unreliable. Off the battlefield, they can be surprisingly gentle and playful with handlers they trust, though they maintain alertness and respond explosively when threatened. They consume large quantities of food and water, requiring excellent nutrition to maintain their physical condition.

## Combat Strategy

A Charger's training teaches it to charge directly at threats when commanded, to trample or strike with hooves or teeth, and to remain in position even in chaos. In direct combat with an armored rider, a Charger is used primarily as a striking platform—its mobility and impact are advantages. Without a rider, a Charger will still fight, using its hooves to strike and its teeth to bite with surprising force. The horse will charge repeatedly at threats, attempting to knock them down, trample them, or drive them away. Multiple Chargers in coordination are devastatingly effective—they can encircle a single target or break through defensive formations. A Charger will continue fighting even when injured unless so severely damaged that mobility is compromised. A spooked or panicked Charger is capable of causing as much damage to its allies as enemies—an important tactical consideration.

## Attack Methods

### Crushing Hoof Strikes

The Charger raises a foreleg and brings the hoof down with force comparable to a sledgehammer blow. A strike can crush skull bone, break ribs, and shatter limbs. Multiple hoof strikes in rapid succession can reduce an opponent from standing to prostrate in seconds. The second attack of this type often occurs as the horse wheels and strikes again or delivers a rear-leg kick.

### Bite and Tear

A Charger's teeth are large and capable of crushing bone. The horse will grab flesh and tear, pulling away with violent force to create large wounds. A bite is typically accompanied by rearing or shaking, increasing damage significantly. The teeth frequently break off or leave fragments in wounds.

### Rear and Strike

The horse rises on hind legs to maximize the reach of front-leg strikes, becoming momentarily vulnerable to attacks on the flank but gaining significant height advantage. From this position, it can strike multiple times in succession, particularly against smaller humanoid opponents.

### Trample

Once an opponent is on the ground or knocked down, the Charger will deliberately step on them, focusing weight onto the legs, torso, and head. Each hoof impact carries the full weight of the animal. The Charger will continue trampling, moving across the fallen opponent and potentially circling to repeat the attack.

## Special Abilities

### Warhorse Training and Discipline

Generations of selective breeding and rigorous training have created a horse that does not panic in circumstances that would terrify ordinary equines. A Charger trained to war tolerates fire, blood, death screams, and close combat without losing focus or bolting. This training allows them to be effective in combat scenarios and makes them valuable military assets. The bond between a Charger and its experienced rider can be extraordinarily strong, with the horse responding to subtle weight shifts and commands inaudible to others.

### Exceptional Strength and Mass

A Charger's physical power greatly exceeds that of civilian horses. They can carry significantly heavier loads, accelerate to high speeds despite their mass, and deliver impacts with devastating force. Their muscle and bone density allow them to sustain impacts and injuries that would cripple lighter horses. A charging Charger becomes a living battering ram with the impact force of a siege weapon.

### Acute Combat Awareness

A well-trained Charger develops an almost intuitive sense of threat and positioning. It will dodge obvious attacks, attack vulnerable opponents preferentially, and maintain awareness of terrain and other combatants. In coordinated formations, trained Chargers exhibit behavior suggesting communication and coordination beyond simple herd instinct, though the mechanism is not fully understood.

### Extreme Endurance

A Charger can sustain combat effort for extended periods, accumulating fatigue slowly. The extensive conditioning of military service allows these horses to march for days, fight for hours, and recover quickly. This endurance is one of the primary reasons military organizations value them—they simply outlast civilian horses.

## Attributes

- **Strength:** 26-31 (1d6+25)

- **Endurance:** 9-14 (1d6+8)

- **Agility:** 9-14 (1d6+8)

- **Perception:** 15-20 (1d6+14)

- **Scent:** 3-6 (1d4+2)

- **Aura:** 3-6 (1d4+2)

- **Will:** 9-14 (1d6+8)

- **Reasoning:** 3-6 (1d4+2)

- **Creativity:** 3-6 (1d4+2)
