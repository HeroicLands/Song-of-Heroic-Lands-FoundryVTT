---
aliases:
    - Acidtoad
tags:
    - dreadspawn
name:
    full: Acidtoad
    aliases: []
id: ho5hsRAglADOtInP
slug: acidtoad
img: icons/game-icons/lorc/toad-teeth.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 12
        end: 18
        dex: 10
        agl: 8
        per: 16
        aur: 10
        wil: 12
        rea: 8
        cre: 9
    attrRollFormula:
        str: 1d4+9
        end: 1d6+14
        dex: 1d6+6
        agl: 1d6+4
        per: 1d4+13
        aur: 1d6+6
        wil: 1d4+9
        rea: 1d6+4
        cre: 1d6+5
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
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Neck
                  shortcode: neckloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 2
                  protectionBase:
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 5
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 3
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Pelvis
                  shortcode: plvsloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 2
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Left Hind Leg
                  shortcode: lhindlegloc
                  bodyPartCode: lhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
                - name: Right Hind Leg
                  shortcode: rhindlegloc
                  bodyPartCode: rhindlegpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 4
                      edged: 3
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
                      blunt: 4
                      edged: 3
                      piercing: 2
                      fire: 4
        weight:
            base: 80
            calc: 80
        reachBase: 0
        bodyScaleBase: 1.09
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
              masteryLevelBase: 70
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 50
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
              masteryLevelBase: 38
        - name: Venomous Bite
          type: skill
          system:
              shortcode: bite
              subType: combattechnique
              masteryLevelBase: 56
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
                      poison: true
        - name: Corrosive Spit
          type: skill
          system:
              shortcode: spray
              subType: combattechnique
              masteryLevelBase: 56
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: spray
                  name: Corrosive Spit
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 1
                      aspect: fire
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 15
                  drawBase: 0
                  traits: {}
---

# Appearance {#appearance}

The water ahead begins to bubble and steam. A bloated, warty form emerges from beneath the scum—prehistoric, bulbous, its massive body swollen as if overfilled with something vile. Sickly green-yellow skin glistens where it isn't covered in mucus that hisses and pops as it drips onto stone. Its mouth yawns wide, and the stench of old rot mixed with something acrid makes your eyes stream. Where its saliva spatters, stone and wood char.

# Dossier {#dossier}

Acidtoads are shambling amphibian predators of swamps and toxic pools, twisted by corruption into apex hunters of wetlands. These creatures dwelt once as normal toads until something—dark magic, alchemical seepage, or worse—transformed them into sluggish but lethally venomous ambush killers. Adventurers stumble upon Acidtoads in marshes, abandoned alchemical sites, or pools fed by underground rivers running through cursed lands.

## Presentation

The Acidtoad is a massive, toad-like creature roughly six to eight feet in length, covered in warty bumps and weeping sores from which corrosive secretions constantly drain. Its hide is mottled sickly green and jaundiced yellow, allowing it to blend with algae-choked water and marsh vegetation. The interior of its gaping maw is pale and raw-looking, lined with backward-curving teeth; its jaw appears dislocated, capable of opening far wider than any natural toad's. Its eyes are lidless, bulging, a predatory yellowish-green that glow dimly in low light. A constant hissing emanates from it as acidic mucus burns away stone and wood in random sputters.

## Key Behaviors

The Acidtoad is a solitary, patient predator. It stations itself in shallow swamp water, at the margins of toxic pools, or in muddy riverbank hollows where its discolored hide renders it nearly invisible. There it waits—sometimes for days—until movement in the water betrays prey. It does not hunt actively except when starving; it prefers the ambush. When not hunting, it remains nearly comatose, breathing slowly, exuding its corrosive secretions at a reduced rate. Acidtoads show no interest in territories beyond their immediate hunting ground and do not congregate.

## Combat Strategy

The Acidtoad strikes from concealment, attempting to incapacitate or severely injure prey with its initial attack before they can reach safety. If prey proves more resilient than expected, the toad deploys ranged acid attacks while maintaining distance, slowly wearing down armor and health. It does not pursue prey into deep water or up steep banks; if prey reaches defensible ground, the toad retreats to its lair to wait for a better opportunity. Injury causes it to become erratic and dangerous rather than cautious.

## Attack Methods

### Corrosive Spit

The creature projects a stream of caustic fluid from its gaping maw that burns exposed flesh and erodes armor and sohl. This attack can be sustained over multiple rounds if the toad maintains line of sight.

### Venomous Bite

The Acidtoad's bite delivers both crushing trauma and injected venom that weakens muscles and slows reflexes in the bitten limb. Prey bitten in the leg may find movement increasingly difficult; prey bitten in the arm loses grip strength and precision.

### Toxic Slime

The toad's body secretes a mildly corrosive mucus that burns on prolonged contact. Any creature grappled by or in close physical contact with the toad takes cumulative damage from this slime.

## Special Abilities

### Camouflage in Wetlands

The Acidtoad's mottled coloring renders it nearly invisible in shallow water, muddy banks, and algae-choked pools. It gains advantage on concealment checks in these environments and can maintain motionless ambush positions for extended periods without detection.

### Acidic Secretion

The creature's body constantly weeps corrosive slime. Any creature in prolonged contact with the toad takes ongoing acid damage; leather, wood, and organic armor deteriorate rapidly from exposure.

### Venom Potency

The venom injected through the toad's bite and saliva causes progressive debilitation. Victims bitten or struck by acid spit suffer cumulative penalties to movement and fine motor skills, representing muscle weakness and increasing stiffness.

## Additional Information

Cold-based attacks are significantly more effective against Acidtoads, as extreme cold hardens and cracks their moist, soft exoskeletons. Disrupting the creature's ambush position by churning the water or creating vibrations can force it from hiding before it can strike. Once driven from its lair or severely wounded, an Acidtoad will not pursue prey into truly deep water or defensible terrain—it retreats to await a better opportunity.
