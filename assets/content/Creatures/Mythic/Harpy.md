---
aliases:
    - Harpy
tags:
    - mythic
    - image-needed
name:
    full: Harpy
    aliases: []
id: PE8La0dJVHwnZDWg
slug: harpy
img: icons/game-icons/lorc/harpy.svg
portrait: ""
type: creature
package: sohl
sohl:
    attributes:
        str: 9
        end: 10
        dex: 14
        agl: 16
        per: 15
        aur: 7
        wil: 11
        rea: 8
        cre: 6
    attrRollFormula:
        str: 1d4+6
        end: 1d4+7
        dex: 1d6+10
        agl: 1d6+12
        per: 1d6+11
        aur: 1d4+4
        wil: 1d4+8
        rea: 1d4+5
        cre: 1d4+3
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
        - medium: aerial
          feetPerRound: 80
          leaguesPerWatch: 8
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
        - medium: terrestrial
          feetPerRound: 30
          leaguesPerWatch: 2
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The scream reaches you first—not the cry of any bird you have ever heard, but something between a woman's shriek and the hunting call of a raptor, multiplied and echoing off canyon walls until you cannot tell if it comes from one creature or a dozen. Then they emerge from the thermals above, silhouettes against the sky that resolve into nightmare. Each is humanoid from waist to head—a woman's torso, grotesquely thin-limbed and pale, dark hair whipping in wind that has no source—but from the waist down, the transition becomes alien. Where legs should be, massive feathered wings erupt, scallop-shaped and mottled in sickly greens and purples, their surfaces glistening with something that might be slime or might be mucus. The claws on their feet are wickedly long, curved and cruel, clearly evolved for gripping and tearing. Their faces are striking in a way that horrifies rather than attracts: sharp-featured and achingly beautiful, with eyes that burn with an intelligence that is utterly wrong, utterly hostile. As they circle, you hear the sound of their wings—wet, mucilaginous, organic—and beneath that, the scrape of claw on stone. They scream again, that same terrible sound, and you understand with nauseating clarity that they are calling to each other, coordinating, picking which of you will die first. The smell rolls down from them: carrion and decay, copper and something chemical that burns the inside of your nose. One of them speaks in a voice like grinding glass: "Fresh prey. How... delicious."

# Dossier {#dossier}

Harpies are semi-intelligent flying humanoids that inhabit high mountain ranges, isolated peaks, and coastal cliff faces throughout the world. Standing roughly five and a half feet tall (when measured from head to the beginning of the wing joint, though the wing span extends twelve to fourteen feet), harpies are quasi-reptilian creatures that combine predatory intelligence with an animalistic, territorial ferocity. They are hostile to all humanoid races—humans, dwarves, elves—viewing them as prey or territorial threats. Harpies hunt in flocks that vary from solitary individuals to coordinated groups of twenty or more, using tactics refined over centuries to isolate, overwhelm, and consume targets. They are not mindlessly bestial; harpies can set traps, plan ambushes, and understand cause and effect at a level that suggests genuine intelligence—yet they lack any coherent language beyond simple vocalizations, show no interest in tools or culture, and seem incapable of abstract reasoning. They breed in the spring, and during breeding season they become even more aggressive, defending nesting territories with suicidal ferocity. Adventurers who travel through mountain passes or climb to high altitudes risk encountering harpy flocks, particularly during nesting season when the creatures' territorial aggression peaks.

## Presentation

The harpy is a grotesque hybrid: a woman's head and torso—gaunt, pale-skinned, with sharp cheekbones and a cruel mouth full of small, vicious teeth—mounted upon the lower body and wings of some alien creature. The wings extend from where the hips should be, massive affairs of overlapped feathers and thin membranes in sickly colors: mottled greens, purples, browns, blacks. The feathers are perpetually wet-looking, slick with a mucilaginous secretion that smells of decay. The legs are chitinous and skeletal, ending in three-toed feet equipped with curved claws each as long as a finger. The hair is long and dark, usually matted and filthy. The eyes are large, forward-facing, with pupils that can dilate to enormous size in darkness. The hands end in sharp nails, more effective for rending than grasping tools. The overall appearance is of something that should not exist—a violation of natural form that triggers visceral disgust in any observer.

## Key Behaviors

Harpies are pack hunters that maintain loose flocks centered on traditional nesting sites—high cliffs, isolated peaks, abandoned towers. A single flock can number anywhere from three to fifty individuals, with loose hierarchies based on size and age. They hunt during daylight hours, using altitude to scout prey, and attack with coordinated rushes that attempt to separate individuals from groups. They are crepuscular, particularly active at dawn and dusk when poor light hinders return fire from bows and crossbows. They are carnivorous and show no preference among humanoid races—all are equally prey. Harpies cache food in inaccessible locations and can consume enormous quantities at once, feasting for days after a successful hunt. They communicate through a complex system of shrieks, screams, and wing-beats that convey emotional state and tactical information. Solitary harpies are territorial and avoid one another except during breeding season. During spring mating, males engage in elaborate aerial displays and occasionally kill rivals, while females select nesting sites with obsessive care and defend them with suicidal aggression.

## Combat Strategy

A harpy flock's basic strategy is to use altitude and speed to conduct coordinated dives, striking from above and behind where shield defense is weakest. Individual harpies attempt to isolate targets from groups, driving them toward cliff edges or into terrain that favors aerial combat. Once a target is wounded, the flock circles tightly, preventing escape and pressing attacks until the target collapses. Harpies are intelligent enough to recognize weapons that pose threats—arrows, spears—and will focus on eliminating archers first, then shift to isolated targets. A solitary harpy is cautious but not cowardly; if retreat is necessary, it will flee to altitude where ground-based pursuers cannot follow. Harpies show some ability to set traps: they have been observed driving prey into prepared ambush sites, and their understanding of terrain allows them to exploit natural hazards effectively.

## Attack Methods

### Raking Talons

The harpy dives from above, raking with the claws on feet and hands, attempting to open wounds and drive targets prone. The impact of the dive itself can stagger targets.

### Beak Strike

Using the sharp, pointed beak, the harpy pecks at eyes and exposed flesh, aiming to blind or disfigure. This attack is particularly dangerous to targets without helmets.

### Pack Tear

When multiple harpies engage a single target, they coordinate attacks from different angles, each strike designed to create openings for the others. A target surrounded by three or more harpies is in mortal danger.

### Aerial Entanglement

Harpies use their wings to tangle an opponent's arms or trip them, then press attacks while the target is disoriented.

## Special Abilities

### Aerial Superiority

Harpies are creatures of the air, capable of maneuvering in three dimensions that ground-based opponents cannot match. A harpy in open sky against ground-based opponents gains enormous advantage. Enclosed spaces, forests, and low ceilings significantly reduce harpy effectiveness.

### Flock Coordination

Harpies hunting together develop an uncanny synchronization, each member anticipating the actions of others. A flock shows tactical sophistication that individual harpies lack, executing multi-pronged attacks and feints that isolate targets.

### Shriek of Terror

Harpies emit piercing shrieks—pure vocalizations evolved for communication—that cause psychological distress in hearing creatures. The sound is so discordant and unnatural that it triggers primal fear responses, potentially disorienting or panicking targets.

### Cliff Dwelling

Harpies nest on cliff faces and rocky terrain inaccessible to ground-based pursuers. They can cling to vertical surfaces and maintain footing in places where humanoids would fall.

## Attributes

- **Strength:** 7-10 (1d4+6) — Lighter-framed than humanoids; reliant on talons and technique rather than raw power
- **Endurance:** 8-11 (1d4+7) — Capable of sustained flight and lengthy aerial chases
- **Dexterity:** 11-16 (1d6+10) — Precise and controlled; excellent fine manipulation with claws
- **Agility:** 13-18 (1d6+12) — Exceptionally maneuverable; three-dimensional movement superiority
- **Perception:** 12-17 (1d6+11) — Excellent aerial vision; hunts from great heights
- **Aura:** 5-8 (1d4+4) — Unnatural, repellent; creatures of fell magic and alien nature
- **Will:** 9-12 (1d4+8) — Territorial and fierce; commits fully to conflict
- **Reasoning:** 6-9 (1d4+5) — Semi-intelligent; understands cause and effect, capable of planning
- **Creativity:** 4-7 (1d4+3) — Limited variation in behavior; follows established patterns
