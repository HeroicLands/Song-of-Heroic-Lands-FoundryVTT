---
aliases:
    - Walrus
tags:
    - animal
    - image-needed
name:
    full: Walrus
    aliases: []
id: Ydk8zqgDTmqzr3uV
slug: walrus
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 21
        end: 20
        dex: 6
        agl: 6
        per: 13
        aur: 8
        wil: 15
        rea: 7
        cre: 5
    attrRollFormula:
        str: 1d6+17
        end: 1d6+16
        dex: 1d4+3
        agl: 1d4+3
        per: 1d6+9
        aur: 1d4+5
        wil: 1d6+11
        rea: 1d4+4
        cre: 1d4+2
    body:
        structure:
            zones:
                - name: Head
                  shortcode: headzone
                  probWeight: 3
                - name: Body
                  shortcode: torsozone
                  probWeight: 5
                - name: Tail
                  shortcode: tailzone
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
                - name: Body
                  shortcode: torsopart
                  bodyZoneCode: torsozone
                  roles:
                      - core
                  canHoldItem: false
                  probWeight: 10
                - name: Left Fin
                  shortcode: lfinpart
                  bodyZoneCode: torsozone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 2
                - name: Right Fin
                  shortcode: rfinpart
                  bodyZoneCode: torsozone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 2
                - name: Tail
                  shortcode: tailpart
                  bodyZoneCode: tailzone
                  roles:
                      - locomotor
                  canHoldItem: false
                  probWeight: 10
            locations:
                - name: Head
                  shortcode: headloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 5
                  probWeight: 6
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Gills
                  shortcode: gillloc
                  bodyPartCode: headpart
                  bleedingSusceptibility: high
                  amputability: low
                  shockValue: 5
                  probWeight: 4
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Body
                  shortcode: bodyloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: medium
                  amputability: none
                  shockValue: 4
                  probWeight: 6
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Underbelly
                  shortcode: underbellyloc
                  bodyPartCode: torsopart
                  bleedingSusceptibility: high
                  amputability: none
                  shockValue: 4
                  probWeight: 4
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Left Fin
                  shortcode: lfinloc
                  bodyPartCode: lfinpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Right Fin
                  shortcode: rfinloc
                  bodyPartCode: rfinpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
                - name: Tail
                  shortcode: tailloc
                  bodyPartCode: tailpart
                  bleedingSusceptibility: low
                  amputability: medium
                  shockValue: 2
                  probWeight: 10
                  protectionBase:
                      blunt: 6
                      edged: 5
                      piercing: 3
                      fire: 5
        weight:
            base: 400
            calc: "400"
        reachBase: 0
        bodyScaleBase: 1.91
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 1
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: hydrology
                key: shallow
                mode: add
                textValue: "0"
          disabled: false
        - medium: aquatic
          feetPerRound: 80
          leaguesPerWatch: 8
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
              masteryLevelBase: 44
        - shortcode: dge
          type: skill
          system:
              masteryLevelBase: 36
        - shortcode: shok
          type: skill
          system:
              masteryLevelBase: 53
        - name: Tusk Gore
          type: skill
          system:
              shortcode: gore
              subType: combattechnique
              masteryLevelBase: 44
              combatCategory: melee
              impairedByRoles:
                  - manipulator
              strikeMode:
                  type: melee
                  shortcode: gore
                  name: Tusk Gore
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 2
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 6
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
        - name: Crushing Weight
          type: skill
          system:
              shortcode: ram
              subType: combattechnique
              masteryLevelBase: 37
              combatCategory: melee
              impairedByRoles:
                  - core
              strikeMode:
                  type: melee
                  shortcode: ram
                  name: Crushing Weight
                  minParts: 1
                  assocSkillCode: null
                  attack:
                      disabled: false
                      spread: 4
                      modifier: 0
                  impactBase:
                      numDice: 1
                      die: 6
                      modifier: 5
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

The smell arrives first — a wall of fish and musk and rancid blubber that makes your eyes stream. Then you see them: a dozen mountains of wrinkled, pinkish-brown flesh hauled out on the rocks, so densely packed that individual bodies blur into a single undulating mass of hide and tusk. The nearest bull raises its head and you understand immediately why the Normen call them sea-kings. The face is a grotesque masterpiece — small, bloodshot eyes buried in folds of bristled skin, a mustache of coarse whiskers as thick as quills, and two ivory tusks descending from the upper jaw like curved swords, each one as long as your forearm and stained yellow with age. The animal weighs more than a horse. It should be helpless on land. It is not. When it surges toward you, hauling its impossible bulk across the rocks with a lurching, explosive motion, the tusks sweep in an arc that would disembowel anything they caught, and the sound it makes — a deep, bellowing roar that echoes off the cliff face — carries the unmistakable authority of something that has never once been prey.

# Dossier {#dossier}

The Walrus is one of the largest and most formidable animals in northern [[Kingdom_of_Nordheim]]'s coastal waters — a semi-aquatic pinniped weighing between fifteen hundred and three thousand pounds, armed with tusks that can reach three feet in length, and insulated by blubber several inches thick. Walruses haul out in enormous colonies on rocky shorelines and ice floes, where their combined mass and aggression make them effectively unassailable. They are critical to Normen coastal economy: walrus ivory is a primary trade good, walrus hide is used for ship cordage and shield facings, and the blubber provides lamp oil and waterproofing. Hunting walrus is one of the most dangerous activities in Nordheim — the animals are aggressive, unpredictable, and capable of destroying small boats. Adventurers encounter walruses on coastal missions, during sea voyages through northern waters, or when ivory trade is involved. A walrus in water is a genuine threat to any vessel smaller than a longship.

## Presentation

The walrus is a creature of staggering bulk — a barrel-shaped body covered in thick, wrinkled skin that ranges from cinnamon-brown in younger animals to pinkish-gray in old bulls whose hide has been scarred and weathered by decades of fighting and hauling across rock. The skin is extraordinarily tough, up to two inches thick on the neck and shoulders where bulls ram each other during mating disputes. Beneath the skin lies a layer of blubber four to six inches deep that provides both insulation and energy reserves. The head is broad and blunt, dominated by the tusks — elongated upper canines that grow continuously throughout life, curving slightly downward and outward. Old bulls' tusks can exceed three feet and bear deep grooves and chips from a lifetime of use as ice-picks, fighting weapons, and hauling anchors. The face is covered in a dense mat of stiff, sensitive whiskers called vibrissae, each one individually mobile and capable of detecting shellfish on the ocean floor by touch alone. The flippers are broad and powerful, with the rear flippers capable of rotating forward for surprisingly effective locomotion on land.

## Key Behaviors

Walruses are social animals that congregate in colonies of dozens to hundreds on favored haul-out sites — rocky beaches, ice floes, and sheltered coves. The colonies are hierarchical, with the largest-tusked bulls claiming the best positions and access to females. Bulls compete through threat displays — raising themselves upright, bellowing, and clashing tusks — and through direct combat that can inflict serious puncture wounds. Despite their aggression toward each other, walruses are cooperative in the water, and adults will defend calves communally against predators including polar bears and sharks. They feed primarily on benthic invertebrates — clams, mussels, snails — which they locate with their whiskers and excavate with powerful suction from their lips. A feeding walrus can consume several thousand clams in a single dive session. They are capable of diving to considerable depths and can hold their breath for extended periods, though they prefer shallow feeding grounds.

## Combat Strategy

On land, the walrus relies on sheer mass and its tusks. It cannot pursue agile opponents but it does not need to — a walrus holding ground is nearly impossible to dislodge, and anything that comes within tusk range is in mortal danger. The tusks sweep in lateral arcs or stab downward with the full weight of the head and neck behind them. A charging walrus on land is slow but unstoppable — the mass simply bowls over obstacles. In water, the walrus is transformed: fast, agile, and capable of attacking from below. A walrus can capsize a small boat by surfacing beneath it, can puncture hulls with its tusks, and can drag swimmers under. Walruses defending calves or haul-out sites become collectively aggressive, with multiple animals surging toward a threat simultaneously. The most dangerous scenario is a boat that has approached a haul-out colony too closely — panicked walruses plunging into the water can swamp vessels, and an aggressive bull may attack the boat directly.

## Attack Methods

### Tusk Gore

The walrus drives its tusks forward or sweeps them laterally, using the full mass of its head and neck to power the strike. The tusks can puncture wood, leather, and light armor, and the wounds they inflict are deep, ragged punctures that bleed heavily. Against opponents on the ground, the walrus stabs downward with devastating effect.

### Crushing Weight

The walrus simply rolls or surges its body onto an opponent, using its enormous mass to pin and crush. On ice or wet rock, this can happen with startling speed. A pinned opponent beneath a walrus has virtually no chance of freeing themselves without outside assistance.

### Hull Breach

In water, a walrus can attack vessels directly — surfacing beneath small boats to capsize them, or driving tusks through hull planking. A determined bull can reduce a skin-hulled boat to wreckage in minutes.

## Special Abilities

### Blubber Armor

The walrus's hide and blubber combine to form natural armor several inches thick. Cutting weapons lose much of their effectiveness against this layer — blades that would be lethal against thinner-skinned animals merely score shallow wounds in blubber. The neck and shoulders of mature bulls are especially thick, having been reinforced by years of tusk-fighting. Piercing weapons are more effective, but even these must penetrate several inches of insulation before reaching vital organs.

### Aquatic Supremacy

In water, the walrus's apparent clumsiness vanishes entirely. It becomes fast, maneuverable, and capable of diving and surfacing with precision. It can hold its breath for extended periods and can swim distances that would exhaust most land animals. Any encounter with a walrus in its aquatic element is exponentially more dangerous than one on land.

### Vibrissae Sensitivity

The walrus's whiskers are extraordinarily sensitive tactile organs, capable of detecting vibrations and pressure changes in the water. In darkness or murky conditions, the walrus can locate prey and threats by touch alone, making it effectively impossible to sneak up on in the water.

## Attributes

- **Strength:** 18-23 (1d6+17) — Enormous physical power; tusks can pierce hull planking
- **Endurance:** 17-22 (1d6+16) — Blubber insulation and cardiovascular reserves for extreme cold and deep diving
- **Dexterity:** 4-7 (1d4+3) — Nearly helpless for fine manipulation; built for brute force
- **Agility:** 4-7 (1d4+3) — Slow and ungainly on land; transformed in water
- **Perception:** 10-15 (1d6+9) — Excellent tactile and auditory senses; vision adequate
- **Aura:** 6-9 (1d4+5) — Respected and feared, but not sacred
- **Will:** 12-17 (1d6+11) — Aggressive and tenacious; will not yield ground
- **Reasoning:** 5-8 (1d4+4) — Social intelligence within colony hierarchy
- **Creativity:** 3-6 (1d4+2) — Minimal
