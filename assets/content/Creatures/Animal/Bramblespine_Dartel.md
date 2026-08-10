---
aliases:
    - Bramblespine Dartel
tags:
    - animal
name:
    full: Bramblespine Dartel
    aliases: []
id: eDyiMoyAhdyDQpvk
slug: bramblespine-dartel
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
shortcode: brmblspn
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 13
        end: 15
        dex: 12
        agl: 11
        per: 13
        aur: 10
        wil: 13
        rea: 6
        cre: 6
    attrRollFormula:
        str: 1d6+9
        end: 1d6+11
        dex: 1d6+8
        agl: 1d6+7
        per: 1d6+9
        aur: 1d4+7
        wil: 1d6+9
        rea: 1d4+3
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Forequarters
                  shortcode: fqtrzone
                  probWeight: 2
                - name: Torso
                  shortcode: torsozone
                  probWeight: 2
                - name: Hindquarters
                  shortcode: hindqtrzone
                  probWeight: 2
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
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 2
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
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
                      piercing: 4
                      fire: 6
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
                      piercing: 4
                      fire: 6
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
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
                      piercing: 4
                      fire: 6
        weight:
            base: 80
            calc: "80"
        reachBase: 0
        bodyScaleBase: 1.11
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 70
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
              masteryLevelBase: 40
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 35
        - name: Tail Lash
          type: skill
          system:
              shortcode: tail
              subType: combattechnique
              masteryLevelBase: 52
              combatCategory: melee
              impairedByRoles:
                  - locomotor
              strikeMode:
                  type: melee
                  shortcode: tail
                  name: Tail Lash
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
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
        - name: Spine Charge
          type: skill
          system:
              shortcode: quill
              subType: combattechnique
              masteryLevelBase: 59
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: quill
                  name: Spine Charge
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 1
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 1
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
        - name: Snap
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 62
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: bite
                  name: Snap
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

You hear it before you see it—a rustling like wind through dead branches, accompanied by a faint metallic clicking. The creature lies half-buried in rocky soil, so covered in jagged spines that distinguishing body from ground is difficult at first glance. Its eyes, cold and luminous yellow-green, lock onto yours. The spines begin to twitch faster, a mechanical sound like coins in a drum, and then comes the screech: a high, resonant cry that vibrates in your skull and sets your teeth on edge, reverberating off stone and seeming to come from everywhere at once.

# Dossier {#dossier}

The Bramblespine Dartel is a small, heavily armored reptilian creature that has evolved to thrive in rocky, arid regions where camouflage and defense are paramount survival strategies. Standing two to four feet tall at the shoulder and weighing forty to eighty pounds, these creatures are far less dangerous than larger predators but possess several adaptations that make them disproportionately hazardous to adventurers. They are primarily nocturnal and solitary, defending territories with obsessive aggression. The metallic screech they produce serves both as a warning to rivals and as a disorienting weapon against threats. Adventurers may encounter Bramblespine Dartels while exploring ruins, crossing rocky wastelands, or camping in arid regions where the creatures have claimed territory.

## Presentation

A compact, low-slung quadruped with a roughly barrel-shaped body covered entirely in sharp spines and ridged scales. The spines vary in length from quarter-inch points to three-inch daggers, densest along the back and flanks, sparser on the belly. The tail is muscular and heavily barbed, with particularly wicked spine clusters near the tip. The head is blunt and wedge-shaped with a strong jaw, small rounded ears set high on the skull, and eyes that glow faintly yellow-green, particularly noticeable in dim light. The coloring is mottled gray and brown with patches of darker pigmentation that allow the creature to blend remarkably well with rocky terrain. The scales themselves are ridged and overlapping, providing a natural armor. When calm, the spines remain relaxed; when agitated, they stand upright, creating a silhouette that appears twenty percent larger than the creature's actual dimensions.

## Key Behaviors

Bramblespine Dartels are fiercely territorial carnivores, hunting small mammals, insects, and occasionally birds. They are most active at dusk and dawn, resting in partially concealed burrows or beneath rock overhangs during peak daylight. A territorial individual will defend its range against other Dartels with ritualized combat involving aggressive posturing and brief, vicious encounters. They are surprisingly intelligent and will remember locations of reliable food sources, returning to them seasonally. When threatened by a larger predator, a Dartel relies on its defensive posture and vocalization—most predators learn quickly that Dartels are not worth the injury. The metallic screech they produce is involuntary, triggered by stress or threat, but its disorienting properties make it as much weapon as alarm. Interestingly, Bramblespine Dartels are more likely to avoid humans than attack them, unless the human approaches the creature's burrow or an egg cache.

## Combat Strategy

A Bramblespine Dartel's primary strategy is avoidance—these creatures will flee from larger threats when possible. If cornered or if their territory is threatened, they adopt a defensive posture, flattening themselves and raising spines while producing the characteristic metallic screech. The creature's tail is its primary offensive weapon, capable of rapid lashing attacks against anything within reach. If a threat persists, the Dartel may attempt to drive the intruder away by rolling into a tight ball and launching itself at the threat—spines extended, contact surface maximized. In groups (rare), multiple Dartels will coordinate simultaneous strikes from different angles, making it difficult for a single target to defend against all threats simultaneously. The Dartel has poor depth perception and reliance on hearing and smell, making it vulnerable to fast, quiet attackers.

## Attack Methods

### Tail Lash

The creature swings its heavily barbed tail in rapid lateral arcs, each spine capable of piercing leather and penetrating skin. The attack has surprising reach—the tail extends nearly as long as the creature's body—and multiple rapid strikes in succession can open severe wounds. The spines on the tail are angled backward, making withdrawal painful and sometimes causing spines to break off in wounds.

### Spine-studded Charge

When directly threatened, the Dartel rolls into a compact ball and launches itself at the threat like a living ball of spikes. This attack combines momentum, mass, and the exposed spines covering the creature's entire body, inflicting damage on contact and potentially embedding spines in the attacker's armor or flesh.

### Snap and Puncture

If an attacker comes too close or allows a limb within reach, the Dartel will attempt to bite and hold, using its strong jaw to crush or shred the target. This attack is less common than tail lashing but devastating when successful.

## Special Abilities

### Keening Wail

The Bramblespine Dartel produces a metallic, harmonic screech triggered by stress or threat. This sound reverberates unnaturally, seeming to come from multiple directions at once. The wail has a disorienting effect on most creatures, inducing anxiety and making concentration difficult. Creatures exposed to the screech at close range find themselves unnerved and potentially panicked. The screech is involuntary and the creature cannot suppress it when truly threatened, making it both an advantage and a disadvantage in combat.

### Spined Armor

The creature's body is effectively armored in thousands of sharp spines and ridged scales. Slashing and piercing attacks are less effective than expected against this defense, and creatures that grapple or make unarmed attacks against the Dartel typically receive puncture wounds. The spines are not poisonous, but wounds inflicted by them tend to become infected if not properly treated.

### Camouflage and Concealment

In rocky or arid terrain, a stationary Bramblespine Dartel is nearly invisible. When partially buried or nestled among boulders, the creature's coloration and spike profile match the surrounding stone so precisely that detecting it requires deliberate searching. Even moving, the Dartel's low profile and mottled coloration provide significant concealment advantage in appropriate terrain.

## Attributes

- **Strength:** 10-15 (1d6+9)

- **Endurance:** 12-17 (1d6+11)

- **Dexterity:** 9-14 (1d6+8)

- **Agility:** 8-13 (1d6+7)

- **Perception:** 10-15 (1d6+9)

- **Aura:** 8-11 (1d4+7)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 4-7 (1d4+3)

- **Creativity:** 4-7 (1d4+3)
