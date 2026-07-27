---
aliases:
    - Crocodile
tags:
    - animal
name:
    full: Crocodile
    aliases: []
id: YzoFPpU5UVHmM52o
slug: crocodile
img: icons/game-icons/lorc/croc-jaws.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 21
        end: 19
        dex: 11
        agl: 10
        per: 13
        aur: 12
        wil: 15
        rea: 8
        cre: 6
    attrRollFormula:
        str: 1d6+17
        end: 1d6+15
        dex: 1d6+7
        agl: 1d4+7
        per: 1d6+9
        aur: 1d6+8
        wil: 1d6+11
        rea: 1d4+5
        cre: 1d4+3
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 700
            calc: 700
        reachBase: 0
        bodyScaleBase: 1.0
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
                textValue: "0"
              - scope: hydrology
                key: shallow
                mode: add
                textValue: "0"
          disabled: false
        - medium: aquatic
          feetPerRound: 50
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The water moves wrong. What you thought was a floating log shifts, and suddenly features resolve into a reptilian head the size of a human torso. The jaw opens in a gape that should be impossible—the hinge working in a way that reveals interior more cavernous than any predator should possess. Rows of teeth, worn and dark with age, gleam as water drains back across them. The eye, a vertical slit in the side of the head, fixes directly on you with an intelligence that seems almost human—cold, assessing, ancient. The body beneath the water is colossal, a wedge of muscle and armored scale that displaces water with each movement. When it moves, the entire river seems to rearrange itself.

# Dossier {#dossier}

The Crocodile is a semi-aquatic apex predator representing evolution's perfection of the ambush strategy. Measuring fourteen to twenty feet in length and weighing five hundred to over two thousand pounds, these reptiles are found in warm rivers, lakes, swamps, and coastal waters worldwide. A crocodile is a creature of extraordinary patience and explosive violence—it can remain motionless for hours, days even, waiting for suitable prey to approach. When the moment arrives, it attacks with a speed and ferocity that contrasts dramatically with its earlier immobility. Crocodiles are intelligence enough to recognize individual threats, remember previous encounters, and plan complex hunting strategies. They are known to hunt cooperatively in some cases and to hold grudges against humans who have harmed them. Adventurers encounter crocodiles while crossing rivers, camping on banks, exploring swamps, or sailing on waters where the creatures live. A crocodile that has fed on human flesh may actively hunt humans thereafter, viewing them as prey.

## Presentation

A massively built reptile with a body shaped like a terrestrial ship's hull: broad and deep in the middle, tapering toward the snout and the tail. The skin is covered entirely in rough scales arranged in rows, providing natural armor. The color is typically dark brown, gray, or olive-green, allowing the creature to blend with muddy water and vegetation. The underside is lighter, typically yellowish or pale green. The head is triangular when viewed from above, tapering to a snout that contains the nostrils positioned to allow breathing while mostly submerged. The mouth is enormous and can open to an angle that seems to dislocate the jaw—the hinge mechanism is engineered to allow this extreme gape. The teeth are numerous, pointing backward and designed to grip prey rather than cut it. The eyes are positioned high on the head, allowing the crocodile to see while mostly submerged. The tail is powerfully muscled and laterally flattened, serving as the primary swimming organ and as a devastating weapon. The legs are short and positioned laterally, allowing the crocodile to move on land but not efficiently. The entire creature reeks of musk and water-stained scales, the smell of a creature that lives in the boundary between water and land.

## Key Behaviors

Crocodiles are territorial predators that establish lairs along rivers or in swamps. A single crocodile may control several miles of river, defending territory against other crocodiles through displays and occasional combat. They are primarily ambush predators, spending most of daylight hours motionless in water, observing potential prey. They hunt primarily during dawn, dusk, and night when visibility is reduced and prey is most active. They hunt any animal that approaches the water: fish, birds, small mammals, and large ungulates coming to drink. They have been documented hunting humans, and a crocodile that has successfully killed humans will hunt humans preferentially. They are capable of going extended periods without food—a large crocodile may eat only once per month or less frequently, digesting prey slowly. They are long-lived animals, sometimes exceeding sixty years. Females are notably more aggressive during nesting season, defending eggs and hatchlings ferociously. They are sensitive to temperature and prefer warm waters; in cold regions, they become less active or enter dormant states.

## Combat Strategy

A crocodile's preferred hunting strategy is to identify prey approaching the water, submerge itself nearly completely, wait for the prey to enter the water, then accelerate and attack. The initial attack is a bite to the head, throat, or limb—the goal is to seize and pull the prey into the water. Once water-bound, the crocodile gains tremendous advantage: it is a stronger swimmer than most prey, can hold its breath indefinitely, and uses the medium to apply force that would be impossible on land. A seized prey is typically subjected to the famous death roll—the crocodile rotates its body rapidly around the long axis of its snout, attempting to dismember the prey through torque and shearing force. Multiple crocodiles feeding on a carcass will sometimes coordinate, with one individual holding the prey while others tear chunks away. If a crocodile is forced onto land or forced into combat, it is less effective but still dangerous—the bite force is extraordinary, and the tail is a devastating bludgeon.

## Attack Methods

### Lunging Bite

The crocodile accelerates explosively and attempts to seize the target in its enormous jaws. The jaw can open wide enough to engulf prey the size of humans. The bite force is extraordinary—sufficient to crush bone and sever arteries. The teeth, while not cutting-sharp, provide grip that makes escape nearly impossible. Once seized, the target is pulled toward the water or down beneath the surface.

### Death Roll

Once the crocodile has seized prey in its jaws, it may perform the death roll: rotating its body around the long axis of its snout to create torque forces that tear prey apart. Multiple rotations can dismember prey, separate heads from bodies, or rupture internal organs. A human caught in a death roll has minutes before the injuries become fatal.

### Tail Strike

Using the powerful caudal fin, the crocodile can strike opponents with tremendous force, capable of breaking bones, dislocating joints, or simply knocking targets prone. The tail is used both in water and on land, and its reach exceeds the crocodile's bite range.

### Crushing Jaw Pressure

Once a prey is seized, the crocodile may simply maintain bite pressure, crushing bone and wearing down prey through sheer force. This technique is used against particularly large or resistant prey where the death roll may be inefficient.

## Special Abilities

### Ambush Predator and Patience

A crocodile can remain completely motionless for days without significant metabolic cost. This patience allows it to position itself perfectly and attack from close range. The camouflage is extraordinarily effective—a submerged crocodile is virtually impossible to detect until it moves. Once an attack is initiated, the speed is shocking: acceleration from motionless to full speed in the space of heartbeats.

### Aquatic Dominance and Breath-holding

In water, the crocodile is apex predator with no equal. It can outswim most creatures, hold its breath indefinitely, see clearly in darkness, and apply force multiplied by leverage that would be impossible on land. A human in water with a crocodile is at catastrophic disadvantage unless they exit the water immediately.

### Crushing Bite Force and Jaw Engineering

The crocodile's bite force exceeds that of any land mammal by a significant margin. The jaw design allows it to bite with force comparable to the impact force of a falling boulder. The jaw cannot be forced open once closed by external force, making escape from a crocodile bite exceptionally difficult.

### Regenerating Teeth and Scalp Armor

If a crocodile loses teeth, replacement teeth move forward to take their place—the replacement cycle is continuous, allowing unlimited hunting despite dental damage. The scaly armor provides substantial resistance to cutting and piercing attacks, though the softer areas around the eyes and mouth are vulnerable.

## Attributes

- **Strength:** 18-23 (1d6+17)

- **Endurance:** 16-21 (1d6+15)

- **Dexterity:** 8-13 (1d6+7)

- **Agility:** 8-11 (1d4+7)

- **Perception:** 10-15 (1d6+9)

- **Aura:** 9-14 (1d6+8)

- **Will:** 12-17 (1d6+11)

- **Reasoning:** 6-9 (1d4+5)

- **Creativity:** 4-7 (1d4+3)
