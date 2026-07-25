---
aliases:
  - Gray Wolf
tags:
  - animal
name:
  full: Gray Wolf
  aliases: []
id: ESJN7G29Z8nBBD7n
slug: gray-wolf
img: images/gray-wolf-headshot.webp
portrait: images/gray-wolf.webp
type: creature
package: thalorna
sohl:
  attributes:
    str: 11
    end: 15
    dex: 11
    agl: 15
    per: 16
    aur: 8
    wil: 15
    rea: 9
    cre: 9
  attrRollFormula:
    str: 1d4+8
    end: 1d4+12
    dex: 1d4+8
    agl: 1d4+12
    per: 1d4+13
    aur: 1d4+5
    wil: 1d4+12
    rea: 1d4+6
    cre: 1d4+6
  body:
    structure:
      parts: []
      adjacent: []
    weight:
      base: 80
      calc: 80
    reachBase: 0
    bodyScaleBase: 1.0
    personalFatigue: enc + 5
  currentMoveMedium: terrestrial
  movementProfiles:
    - medium: terrestrial
      feetPerRound: 70
      leaguesPerWatch: 6
      encumbrance: floor(wt/4)
      strMod: -5 * floor((str - 10) / 2)
      factors:
        - scope: surface_cover
          key: mixed_forest
          mode: add
          textValue: '-1'
        - scope: surface_cover
          key: needleleaf_forest
          mode: add
          textValue: '0'
      disabled: false
  defaultCombatGroup: null
  items: []
---
# Appearance {#appearance}

The howl reaches you long before the wolf itself—a long, echoing call that speaks to something primal in your bones. When the creature emerges from the darkness, it moves like smoke given form, muscle and sinew rippling beneath a thick coat of gray and brown. The eyes catch firelight and reflect it back: amber and gold, burning with intelligence that is utterly unlike the predators you know. The nose works the air constantly, cataloging scents beyond your ability to perceive. When it growls, the sound vibrates in your chest, and the teeth—sharp and white—promise things your mind rejects even as your instincts scream warnings. But the worst part is the realization that you are seeing only one, and somewhere in the darkness around you, others are moving, flanking, waiting for the moment to strike together.

# Dossier {#dossier}
The Gray Wolf is a highly social predator that hunts in coordinated packs rather than as individuals. These creatures are masters of tactical hunting, using numbers and intelligence to bring down prey far larger than any single wolf. Gray wolves are found in wild lands across temperate and cold regions, establishing territories that they defend fiercely. Adventurers most commonly encounter them when traveling through wilderness areas or when a pack's territory overlaps human settlements.

## Presentation
A mature gray wolf stands roughly thirty inches at the shoulder and weighs between eighty and one hundred twenty pounds, making it larger than most dogs. The build is lean and muscular, optimized for endurance and speed rather than raw power. The coat is thick and multi-layered, in shades of gray, brown, black, and white, with darker colors along the spine and lighter colors on the belly and chest. The head is broad but tapered, with a long snout and forward-facing eyes that provide good binocular vision. The ears are triangular and positioned high, rotating independently for directional hearing. The mouth is filled with sharp teeth, with the canines particularly prominent. The tail is long and bushy, used for balance and communication. The overall appearance is that of a creature built perfectly for hunting.

## Key Behaviors
Gray wolves are pack animals that live in hierarchical social groups of four to ten individuals, centered on an alpha pair. The pack hunts cooperatively, using coordinated strategies that allow them to take prey far larger than themselves. They are territorial and patrol established ranges, marking boundaries with scent and howl. They hunt primarily ungulates (deer, elk) and smaller mammals, though they will take larger prey and will scavenge. Packs are most active at dawn and dusk but will hunt at any time if prey is available. They communicate through howls, barks, growls, and body language.

## Combat Strategy
A wolf pack's hunting strategy is designed for efficiency and safety—multiple wolves attack from different angles simultaneously, flanking prey and focusing on vulnerable points. If prey escapes, the pack pursues relentlessly, using endurance to tire prey faster than it can run. A single wolf is cautious and will retreat if outnumbered or outmatched; a pack shows far more aggression and commitment. A pack defending its territory or young becomes almost suicidal in its determination.

## Attack Methods

### Powerful Bite
The wolf's bite is designed to puncture and tear—the sharp teeth are meant to lacerate blood vessels and cause shock through blood loss. A wolf will bite and hold, attempting to drag prey down or create space for packmates.

### Pack Coordination
Multiple wolves attack simultaneously from different angles, using confusion and overwhelming numbers to isolate individual targets. The pack works with apparent telepathy, each member anticipating the actions of others.

## Special Abilities

### Pack Tactics
When hunting with other wolves, the pack gains supernatural coordination—they never hesitate or stumble over each other, they read each other's movements perfectly, and they execute tactics that isolate and overwhelm targets. A solitary wolf loses this advantage and becomes noticeably less effective.

### Legendary Endurance
The wolf can pursue prey across vast distances without tiring, running at a steady pace for days if necessary. This endurance allows wolves to wear down prey that cannot sustain such effort.

## Additional Information
A wolf pack's territory can be traversed safely if one understands their behavior and respects their boundaries. Packs generally avoid humans unless desperate or defending territory. A wolf pack that has learned humanoid prey are available will become increasingly bold, potentially attacking settlements. Some cultures venerate wolves as symbols of wildness, loyalty, or hunting prowess.
