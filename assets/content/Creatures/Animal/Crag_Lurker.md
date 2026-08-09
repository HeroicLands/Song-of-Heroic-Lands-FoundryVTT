---
aliases:
    - Crag Lurker
tags:
    - animal
name:
    full: Crag Lurker
    aliases: []
id: bnKZuFaJKbkhFJxn
slug: crag-lurker
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 15
        end: 14
        dex: 13
        agl: 12
        per: 15
        aur: 8
        wil: 11
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+11
        end: 1d6+10
        dex: 1d6+9
        agl: 1d6+8
        per: 1d6+11
        aur: 1d4+5
        wil: 1d6+7
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            zones:
                - name: Cephalothorax
                  shortcode: cephzone
                  probWeight: 3
                - name: Abdomen
                  shortcode: abdomenzone
                  probWeight: 3
                - name: Legs
                  shortcode: legszone
                  probWeight: 4
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
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Fangs
                  shortcode: fangloc
                  bodyPartCode: cephpart
                  bleedingSusceptibility: low
                  amputability: high
                  shockValue: 2
                  probWeight: 3
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Abdomen
                  shortcode: abdloc
                  bodyPartCode: abdomenpart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Left Legs
                  shortcode: llegsloc
                  bodyPartCode: llegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
                - name: Right Legs
                  shortcode: rlegsloc
                  bodyPartCode: rlegspart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 4
                      fire: 6
        weight:
            base: 250
            calc: "250"
        reachBase: 0
        bodyScaleBase: 1.36
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 4
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: topography
                key: steep
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: alpine
                mode: add
                textValue: "0"
              - scope: surface_cover
                key: barren
                mode: add
                textValue: "0"
          disabled: false
    defaultCombatGroup: null
    items:
        - name: Envenoming Bite
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
                  name: Envenoming Bite
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 8
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
        - name: Leg Grapple
          type: skill
          system:
              shortcode: grab
              subType: combattechnique
              masteryLevelBase: 61
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: grab
                  name: Leg Grapple
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 15
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

Your eye passes over the rocky crevice without registering anything unusual—until movement betrays the illusion. What you thought was stone shifts, reveals itself to be carapace the color of weathered rock, textured like the living cliff face. The arachnid is enormous: the body as large as a horse, with eight legs extending ten feet or more. The movement is precise and economical, each limb placed with disturbing grace on sheer stone that should be impossible to traverse. Eight black eyes arrange in two rows gleam faintly when light catches them, and the mandibles—each as long as a human hand—click together softly, producing a sound like flint on stone.

# Dossier {#dossier}

The Crag Lurker is an arachnid of impressive size and terrifying adaptation: a creature engineered by evolution to be a perfect ambush predator in rocky, vertical terrain. Weighing three hundred to five hundred pounds with a body the size of a horse and legs extending eight to ten feet in length, these creatures are larger than most predators yet capable of moving up vertical cliff faces with ghostly silence. They are found primarily in mountainous and hilly regions where suitable crevices and overhangs provide shelter. A Crag Lurker establishes a hunting territory spanning several square miles of rocky terrain, using vibration-sensing hairs and web-based sensory networks to detect prey movement. Adventurers encounter these creatures while mountain climbing, camping in alpine regions, exploring rocky canyons, or investigating cliff-dwellings and abandoned mountain strongholds where Lurkers have established lairs.

## Presentation

A massive arachnid with a body built for strength rather than speed. The cephalothorax is compact and heavily armored with hardened chitin. The abdomen is roughly spherical and somewhat pendulous, producing and storing the silk used for webs. The legs are long, jointed, and remarkably dexterous, each ending in multiple hooked claws for gripping stone. The entire carapace is gray or dull brown, with a texture that mimics weathered rock grain—not merely in color but in three-dimensional surface variations. The coloration provides camouflage so effective that stationary Lurkers are nearly indistinguishable from their rocky surroundings. The head carries eight eyes arranged in two rows: four anterior eyes providing forward vision and four lateral eyes providing side vision. The eyes are initially unremarkable but gleam with reflection in dim light—this glow is sometimes the only way to distinguish a Lurker from surrounding stone. The mandibles are large, wickedly sharp, and slightly curved downward. The entire creature reeks of musk and pheromones that alert some species to its presence but which humans often fail to detect.

## Key Behaviors

Crag Lurkers are solitary and territorial, with each individual claiming a hunting range of five to twenty square miles of suitable terrain. They establish lairs in deep crevices or caves where they are protected from elements and where potential prey congregates. A Lurker maintains an extensive web network throughout its territory: anchor lines from cliff faces to natural features, funnel webs at known prey approach routes, and retreat webs near lairs. The Lurker's senses are primarily vibration-based and chemical—it can detect the slightest vibration traveling through stone or web, allowing it to know exactly where prey is located even in complete darkness. They are patient predators, remaining motionless in their lairs for days or weeks, responding to vibrations that indicate prey proximity. Once prey is detected, they attack decisively. They are known to consume prey items whole, storing them in their abdomens for slow digestion. They molt periodically—a vulnerable time when the new carapace is still soft. They rarely leave their territorial rocks, showing strong site fidelity.

## Combat Strategy

A Crag Lurker's primary tactic is to establish web networks around known prey approach routes, then wait for prey to become entangled. Once prey is in the web, the Lurker moves rapidly from its lair and delivers multiple envenoming bites to immobilize the prey before it can cut free or escape. Against mobile prey that actively avoids webs, the Lurker will pursue using its superior climbing ability and knowledge of terrain. The Lurker attempts to drive prey onto terrain where web coverage is dense or toward dead ends where escape is impossible. A Lurker defending its lair or actively hunting is remarkably aggressive, willing to pursue prey considerable distances from its web network. However, if the Lurker is injured or the prey proves extraordinarily dangerous, the Lurker will retreat to its lair, relying on camouflage and inaccessibility to prevent pursuit.

## Attack Methods

### Envenoming Bite

The Lurker lunges forward with its mandibles open, attempting to bite and inject venom. The venom is neurotoxic and acts within minutes to immobilize smaller creatures or weaken larger ones significantly. Multiple bites in rapid succession can deliver doses of venom sufficient to kill even large humanoids. The mandibles are strong enough to penetrate leather and light armor.

### Web Entanglement

Using specialized spinnerets, the Lurker produces silk webbing—either as already-constructed webs that prey blunders into, or as fresh webs sprayed directly onto prey. The webbing is tremendously strong and sticky, capable of immobilizing targets through sheer tensile strength. A target caught in web attempting to move often becomes more entangled. Cutting free requires sharp implements or exceptional strength.

### Leg-based Grappling and Pinning

Using multiple legs simultaneously, the Lurker can pin an opponent, controlling limbs or preventing movement. The legs are strong and dexterous, allowing the creature to apply pressure and control a struggling victim. Multiple legs working in concert can immobilize even a large humanoid.

## Special Abilities

### Web-based Sensory Network

The Lurker's entire territory is laced with web lines that serve as sensory organs. Vibrations traveling through these lines are felt by the Lurker with exquisite sensitivity—the creature can determine the location, size, and approximate speed of anything moving through its territory. This makes stalking and hunting extraordinarily efficient; the Lurker rarely encounters prey by accident.

### Neurotoxic Venom and Multiple Doses

The venom is a sophisticated neurotoxin that paralyzes the nervous system and skeletal muscles. Multiple bites or sustained exposure can deliver doses sufficient to kill large creatures through respiratory paralysis. The venom is not instantly lethal but acts within minutes, giving the Lurker time to secure the prey before it dies.

### Perfect Camouflage and Vertical Terrain Dominance

The Lurker's coloration and surface texture allow it to become virtually invisible when motionless on rocky terrain. Combined with the Lurker's ability to move on nearly vertical rock faces as easily as horizontal ground, this gives it tremendous tactical advantage. Prey cannot easily see or reach the Lurker even if pursued into rocky terrain.

### Spinning and Repairing Webs

A Lurker can construct or repair web networks with remarkable speed, creating new traps and replacing damaged sections within hours. This ability to maintain and expand web coverage allows the Lurker to modify its hunting strategy as needed.

## Attributes

- **Strength:** 12-17 (1d6+11)

- **Endurance:** 11-16 (1d6+10)

- **Dexterity:** 10-15 (1d6+9)

- **Agility:** 9-14 (1d6+8)

- **Perception:** 12-17 (1d6+11)

- **Aura:** 6-9 (1d4+5)

- **Will:** 8-13 (1d6+7)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
