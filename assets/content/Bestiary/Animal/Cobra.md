---
tags:
  - animal
  - image-needed
name:
  full: Cobra
  aliases: []
description: "A large, fast venomous serpent of the Kheperi lowlands, haunting river margins, granaries, and ruins where its bite delivers swift death."
id: NQZVX98HeA9QlGWY
img: icons/game-icons/lorc/snake.svg
portrait: images/being/cobra-portrait.webp
shortcode: cobra
type: being
sohl:
  kbcat: animal
  archetype: 0
  attributes:
    str: 6
    end: 8
    dex: 15
    agl: 15
    per: 18
    aur: 12
    wil: 10
    rea: 7
    cre: 5
  attrRollFormula:
    str: 1d4+3
    end: 1d4+5
    dex: 1d6+11
    agl: 1d4+12
    per: 1d6+14
    aur: 1d6+8
    wil: 1d4+7
    rea: 1d4+4
    cre: 1d4+2
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
            blunt: 2
            edged: 1
            piercing: 0
            fire: 2
        - name: Neck
          shortcode: neckloc
          bodyPartCode: headpart
          bleedingSusceptibility: high
          amputability: low
          shockValue: 5
          probWeight: 6
          protectionBase:
            blunt: 2
            edged: 1
            piercing: 0
            fire: 2
        - name: Thorax
          shortcode: thoraxloc
          bodyPartCode: forebodypart
          bleedingSusceptibility: medium
          amputability: none
          shockValue: 4
          probWeight: 10
          protectionBase:
            blunt: 2
            edged: 1
            piercing: 0
            fire: 2
        - name: Abdomen
          shortcode: abdloc
          bodyPartCode: hindbodypart
          bleedingSusceptibility: high
          amputability: none
          shockValue: 4
          probWeight: 10
          protectionBase:
            blunt: 2
            edged: 1
            piercing: 0
            fire: 2
        - name: Tail
          shortcode: tailloc
          bodyPartCode: tailpart
          bleedingSusceptibility: none
          amputability: high
          shockValue: 1
          probWeight: 10
          protectionBase:
            blunt: 2
            edged: 1
            piercing: 0
            fire: 2
    weight:
      base: 30
      calc: "30"
    reachBase: 0
    bodyScaleBase: 0.67
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 30
      leaguesPerWatch: 2
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors:
        - scope: surface_cover
          key: wetlands
          mode: add
          textValue: "-2"
        - scope: hydrology
          key: shallow
          mode: add
          textValue: "0"
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
        masteryLevelBase: 60
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
        masteryLevelBase: 64
    - shortcode: shok
      type: skill
      system:
        masteryLevelBase: 18
    - name: Hooded Strike
      type: skill
      system:
        shortcode: bite
        subType: combattechnique
        masteryLevelBase: 64
        combatCategory: melee
        impairedByRoles:
          - manipulator
        strikeMode:
          type: melee
          shortcode: bite
          name: Hooded Strike
          minParts: 1
          assocSkillCode: null
          attack:
            disabled: false
            spread: 2
            modifier: 0
          impactBase:
            numDice: 1
            die: 8
            modifier: -2
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
---

# Appearance {#appearance}

The basket lid rises and you see it before the handler speaks — a column of living muscle rising vertically from the coils below, spreading its hood into a broad, flattened disc of scaled flesh that frames the head like a dark halo. The scales are smooth and gleaming, deep black shading to gray-brown along the flanks, and the hood displays a pattern that your mind insists is a face — two dark eyespots staring from the distended skin with the fixed regard of something that has decided whether you are prey or threat and is merely waiting for you to act first. The head is small and elegant, almost delicate, tapering to a blunt snout with dark, unblinking eyes that track movement with mechanical precision. The forked tongue flickers — once, twice — tasting the air with a deliberation that suggests it is gathering more information about you than you would prefer. When it draws back into the striking coil, the movement is unhurried, a slow retraction of the raised body into a tighter S-curve that puts several feet of muscle behind the head like a drawn bowstring. The hiss, when it comes, is not loud but carries an unmistakable finality.

# Dossier {#dossier}

The Cobra is the most feared snake of the Kheperi lowlands — a large, venomous serpent found in river margins, irrigation channels, granaries, abandoned buildings, and the rocky outcrops of the desert edge. An adult cobra reaches six to eight feet in length, with exceptional specimens exceeding nine feet, and while its body is relatively slender compared to constrictors, it is deceptively powerful and fast. The cobra's most distinctive feature is its hood — an expansion of the neck ribs that spreads the skin into a broad, flattened disc when the snake is threatened or preparing to strike. The hood serves as both warning display and species identification, and in Kheperi culture, the cobra's hooded silhouette — the uraeus — is the most sacred symbol of pharaonic authority, representing divine sovereignty and the power of life and death. Living cobras are sacred, associated with the protection of royalty and the wrath of the gods, and killing one is forbidden except in direct self-defense. This creates a complicated relationship in agricultural communities, where cobras are simultaneously revered and feared — they control rats and other vermin in granaries, but their venom can kill a grown man in hours. Adventurers encounter cobras in irrigation works, in the ruins of ancient temples, in granary complexes, and coiled in the shade of riverside vegetation during the heat of the day.

## Presentation

A large, smooth-scaled serpent with a slender, muscular body that appears deceptively fragile until the hood spreads. The dorsal coloring ranges from jet black to dark brown to gray-olive depending on the local population, while the ventral scales are typically paler, often cream or yellowish. The hood, when extended, reveals its full width — sometimes eight to ten inches across — displaying species-specific markings that include dark eyespots, pale bands, or chevron patterns. The head is relatively small and oval, with round pupils and a calm, almost contemplative expression that belies the animal's lethal capability. The fangs are fixed (not folding like a viper's) and relatively short — half an inch to an inch in length — but positioned at the front of the mouth for efficient venom delivery. The body moves with a fluid, lateral undulation on the ground but adopts a distinctive raised posture when alarmed — the anterior third of the body lifts vertically while the hood spreads, creating the iconic silhouette that is recognized and feared throughout Kheperi lands. The overall impression is of a creature that carries itself with a quiet, almost regal authority — unhurried, deliberate, and confident in its own lethality.

## Key Behaviors

Cobras are primarily diurnal or crepuscular, active during morning and evening hours and resting during the hottest parts of the day in shade, burrows, or beneath debris. They are solitary hunters, feeding primarily on rodents, frogs, lizards, other snakes, and birds. Their preference for rodent prey draws them inevitably toward human grain storage, creating the paradoxical situation where the most dangerous snake in the region is also one of the most economically useful. Cobras are not naturally aggressive toward humans — they prefer to avoid confrontation and will retreat if given the opportunity. However, when cornered, surprised, or defending a nest, they become extremely dangerous. The hood display is the primary warning — a cobra that has raised its body and spread its hood is communicating a clear and unambiguous threat. If the warning is not heeded, the strike follows. Female cobras guarding eggs are the most dangerous, as they will strike without the preliminary hood display, attacking anything that approaches the nest with immediate and lethal aggression. Cobras are excellent swimmers and frequently hunt along irrigation channels and riverbanks, and they are capable climbers, ascending trees and walls to reach bird nests or to escape floods.

## Combat Strategy

A cobra's defensive strategy begins with avoidance. If it detects a threat at distance, it will attempt to retreat into cover. If cornered or surprised, it raises into the striking posture — the anterior body lifts, the hood spreads, and the snake tracks the threat's movement with precise lateral adjustments. The striking range is roughly one-third of the snake's total body length — a six-foot cobra can strike from approximately two feet away. The strike itself is extraordinarily fast, faster than the human eye can track, driving the fangs into exposed flesh and delivering a measured dose of venom. Unlike vipers, which strike and release, cobras often hold the bite, chewing briefly to ensure venom injection through their shorter, fixed fangs. After striking, a cobra may retreat or maintain its defensive posture, prepared to strike again. A cobra has sufficient venom for multiple strikes and will not hesitate to bite repeatedly if the threat persists.

## Attack Methods

### Hooded Strike

The cobra's signature attack. From the raised defensive posture, the snake lunges forward and downward, driving its fixed fangs into the target. The strike is aimed at whatever is closest — typically the lower legs and feet of a standing human, or the hands and arms of someone reaching into the snake's refuge. The bite delivers neurotoxic venom through a brief chewing motion that works the short fangs into the wound. The initial pain is sharp but not overwhelming — the true danger develops over the following minutes and hours as the venom takes effect.

### Ground Strike

When not in the raised posture — when surprised while moving or hunting — the cobra strikes laterally from ground level, a whipping motion of the head that can reach targets within the snake's strike radius. This attack is less precise than the hooded strike but equally venomous.

## Special Abilities

### Neurotoxic Venom

The cobra's venom is a potent neurotoxin that attacks the nervous system, causing progressive paralysis that begins at the bite site and spreads throughout the body. Early symptoms include pain and swelling at the wound, followed by drooping eyelids, difficulty swallowing, and slurred speech. Without treatment, the paralysis eventually reaches the respiratory muscles, causing death by suffocation within six to twelve hours depending on the dose and the victim's size and health. Treatment requires immediate application of herbal antivenoms known to Kheperi physicians, or magical healing that specifically addresses poison. The venom is medically distinct from viper venom — viper antivenom does not work against cobra envenomation, and vice versa.

### Hood Display

The spread hood serves as both warning and defense. The expanded neck presents a larger, more intimidating silhouette that causes many predators to reconsider their approach. The eyespot markings on some cobra populations create the illusion of a much larger face staring at the threat, exploiting the instinctive fear response of predators that recognize facial patterns. The display is genuinely effective — most animals, including humans, instinctively recoil from a hooded cobra, buying the snake time to escape or prepare a strike.

### Exceptional Awareness

Cobras perceive the world primarily through vibration, scent, and thermal sensitivity. They detect the footsteps of approaching creatures through ground vibration, identify prey and predators through the Jacobson's organ in the roof of the mouth (served by the constantly flickering tongue), and sense the body heat of warm-blooded creatures at close range. This combination of senses makes cobras extremely difficult to surprise and allows them to hunt effectively in total darkness.

### Sacred Serpent

The cobra holds a position of profound religious significance in Kheperi culture. The uraeus — the rearing cobra — adorns the crowns of Per-Aás and the headdresses of high priests, symbolizing divine authority and the power to deal death to enemies of the realm. Living cobras found in temples are considered manifestations of divine protection and are fed milk and offerings. This sacred status means that cobras in settled Kheperi areas face virtually no predation pressure from humans, allowing populations to thrive in close proximity to human habitation.

## Attributes

- **Strength:** 4-7 (1d4+3)

- **Endurance:** 6-9 (1d4+5)

- **Dexterity:** 12-17 (1d6+11)

- **Agility:** 13-16 (1d4+12)

- **Perception:** 15-20 (1d6+14)

- **Aura:** 9-14 (1d6+8)

- **Will:** 8-11 (1d4+7)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 3-6 (1d4+2)
