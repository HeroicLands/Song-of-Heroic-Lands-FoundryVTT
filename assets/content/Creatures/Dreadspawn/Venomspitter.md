---
aliases:
    - Venomspitter
tags:
    - dreadspawn
name:
    full: Venomspitter
    aliases: []
id: YmCBrcF6Kw2CrctD
img: icons/game-icons/delapouite/griffin-symbol.svg
portrait: ""
shortcode: vnmspttr
type: creature
package: sohl
sohl:
    kbcat: dreadspawn
    archetype: 0
    attributes:
        str: 8
        end: 9
        dex: 15
        agl: 13
        per: 11
        aur: 11
        wil: 9
        rea: 9
        cre: 11
    attrRollFormula:
        str: 1d4+5
        end: 1d4+6
        dex: 1d4+12
        agl: 1d4+10
        per: 1d4+8
        aur: 1d4+8
        wil: 1d4+6
        rea: 1d4+6
        cre: 1d4+8
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 2
                - name: Forebody
                  shortcode: torsozone
                  probWeight: 5
                - name: Hindbody
                  shortcode: hindbodyzone
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
                - name: Forebody
                  shortcode: forebodypart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
                - name: Hindbody
                  shortcode: hindbodypart
                  bodyZoneCode: hindbodyzone
                  roles:
                      - core
                      - locomotor
                  canHoldItem: false
                  probWeight: 6
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: hindbodyzone
                  roles: []
                  canHoldItem: false
                  probWeight: 4
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 4
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
                  probWeight: 6
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Thorax
                  shortcode: thoraxloc
                  bodyPartCode: forebodypart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 3
                      edged: 2
                      piercing: 1
                      fire: 3
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: hindbodypart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
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
            base: 100
            calc: 100
        reachBase: 0
        bodyScaleBase: 0.81
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 40
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
              masteryLevelBase: 50
        - shortcode: stlth
          type: skill
          system:
              masteryLevelBase: 55
        - shortcode: sprt
          type: mysticalability
          system:
              masteryLevelBase: 30
        - shortcode: init
          type: skill
          system:
              masteryLevelBase: 36
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 48
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 23
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
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
                      modifier: -1
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
        - name: Corrosive Venom Spray
          type: skill
          system:
              shortcode: spray
              subType: combattechnique
              masteryLevelBase: 60
              combatCategory: missile
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: missile
                  shortcode: spray
                  name: Corrosive Venom Spray
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 0
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: -1
                      aspect: fire
                  projectileType: none
                  maxVolleyMult: 1
                  baseRangeBase: 15
                  drawBase: 0
                  traits: {}
---

# Appearance {#appearance}

A shape moves at the corner of your vision—something serpentine and sinuous sliding across stone with impossible grace. Then you see it fully and freeze: a creature like a cobra crossed with something altogether more alien, its scales shimmering with iridescent color—deep purples bleeding into sickly greens, reds burning in places where no color should exist. The patterns on its scales seem to shift as you watch them, creating an optical dissonance that makes your eyes water. It raises its head, and you see the fangs—enormous hollow points from which fluid drips and sizzles, leaving char marks on the stone beneath. The creature’s eyes are dark, intelligent, and utterly fixed on you with predatory certainty. Then the reek hits you: something acrid and burning, the smell of the venom itself, and you realize with dawning horror that the creature is already moving.

# Dossier {#dossier}

Venomspitters are creatures of living acid and predatory grace, serpents or vaguely spider-like beings whose entire biology is built around the production and delivery of corrosive toxins. They are found in warm places—jungle ruins, desert caves, and deep, humid caverns where heat and humidity allow their complex venom to develop properly. A Venomspitter is primarily ambush-oriented, and it demonstrates tactical intelligence in how it positions itself and plans attacks. These creatures are solitary and territorial, establishing specific areas where they lair and hunt, and they are known to actively maintain and improve their hunting grounds over time. A single Venomspitter can make an entire region treacherous, and communities often employ bounty hunters specifically to eliminate such creatures.

## Presentation

A Venomspitter measures roughly 8 to 12 feet in length, with a body that is difficult to classify—it has qualities of both serpent and arachnid, with a segmented structure that allows unusual flexibility. Its scales are covered in patterns of iridescent coloration—purples, greens, reds, and sickly yellows arranged in warning patterns that seem to shift as the creature moves. Its head is vaguely reptilian with a flattened profile, and its mouth is enormous, capable of opening nearly at right angles to its body. Within that mouth sit enormous fangs, hollow and dripping constantly with venom so potent that it hisses and smokes, leaving char marks on stone. Its eyes are dark and intelligent, ringed with patterns of contrasting color. The creature’s entire body glistens with a slick, secreted fluid—partially venom, partially something else—that makes its movements fluid and nearly silent. The temperature drops noticeably near a Venomspitter, and the air is thick with acrid, chemical smells.

## Key Behaviors

A Venomspitter is a patient hunter that establishes a territory and then carefully constructs favorable ambush positions within it. The creature seems to understand that waiting in optimal positions is more reliable than actively hunting, and it will remain motionless for hours or days if necessary. The creatures may or may not be truly web-spinning arachnids—the nature of their webs varies, and some Venomspitters do not appear to spin at all. Those that do create webs use them as territorial markers and as supplementary traps. The creature feeds on whatever prey it can immobilize and dissolve with its venom, from insects to humanoids. A gravid female becomes unusually aggressive and may extend her territory substantially during reproductive cycles.

## Combat Strategy

A Venomspitter fights by maintaining distance and using venom projection as its primary weapon. It moves with exceptional speed and agility, positioning itself at angles where it can strike enemies without exposing itself to counterattack. The creature is intelligent enough to focus on immobile or less dangerous targets first and will deliberately prioritize mages, archers, and other ranged threats. If forced into melee combat, it will attempt to inject venom through bites while using its speed and agility to avoid sustained contact. A Venomspitter will retreat if seriously wounded, moving to areas where it maintains advantage or escaping entirely if the threat is too great.

## Attack Methods

### Corrosive Venom Spray

The Venomspitter projects streams of venom with surprising accuracy and distance, aimed at targets from 20 to 30 feet away. The venom corrodes armor and flesh alike, eating through protection and causing terrible chemical burns.

### Reactive Venom Projectiles

When threatened more directly, the creature can launch projectiles—venom-coated rocks, regurgitated acidic globules, or other objects—at high speed and with precision targeting.

### Venomous Bite

In close combat, the creature’s bite delivers venom directly into the victim’s body, causing paralysis that spreads from the bite point and eventual death if untreated.

## Special Abilities

### Venom Generation

The Venomspitter produces its venom continuously and seems to have near-infinite supply. The creature can spray venom, coat ammunition, or concentrate it for more potent effects as needed.

### Precision Aim

The Venomspitter’s venom projection is remarkably accurate, and it can target specific weak points in armor or aim for faces to blind opponents.

### Corrosive Secretions

Everything the creature touches becomes tainted with acidic secretions, slowly degrading armor and equipment if the acid is not neutralized. Equipment that has been exposed to Venomspitter venom may be permanently damaged.

## Additional Information

Cold is the Venomspitter’s primary weakness—sustained cold slows its metabolism and reduces its venom production dramatically. Extreme cold can even cause the creature to become dormant or lethargic. Fire is also effective, though the creature’s venom can neutralize some heat-based attacks. Isolation from water reduces the creature’s effectiveness, as it requires humidity to maintain its venom production at peak efficiency. The venom itself, if carefully collected and preserved, is extraordinarily valuable to alchemists, poisoners, and dark sorcerers. A single vial of pure Venomspitter venom can command a fortune from the right buyer. The creature’s hide, if preserved, also has alchemical value. Hunting a Venomspitter requires exceptional caution and specialized protective gear, as mere exposure to its venom can cause severe injury.

## Attributes

- **Strength:** 6-9 (1d4+5)

- **Endurance:** 7-10 (1d4+6)

- **Dexterity:** 13-16 (1d4+12)

- **Agility:** 11-14 (1d4+10)

- **Perception:** 9-12 (1d4+8)

- **Aura:** 9-12 (1d4+8)

- **Will:** 7-10 (1d4+6)

- **Reasoning:** 7-10 (1d4+6)

- **Creativity:** 9-12 (1d4+8)
