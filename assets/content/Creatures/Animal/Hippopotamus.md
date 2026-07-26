---
aliases:
    - Hippopotamus
tags:
    - animal
    - image-needed
name:
    full: Hippopotamus
    aliases: []
id: OB7yGxza3GSVUOFw
slug: hippopotamus
img: icons/game-icons/lorc/paw-print.svg
portrait: ""
type: creature
package: sohl
sohl:
    attributes:
        str: 23
        end: 22
        dex: 8
        agl: 8
        per: 12
        aur: 12
        wil: 17
        rea: 7
        cre: 5
    attrRollFormula:
        str: 1d6+19
        end: 1d6+18
        dex: 1d4+5
        agl: 1d4+5
        per: 1d6+8
        aur: 1d6+8
        wil: 1d6+13
        rea: 1d4+4
        cre: 1d4+2
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 4000
            calc: 4000
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 50
          leaguesPerWatch: 3
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
          feetPerRound: 60
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors: []
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

The water erupts. What you took for a muddy boulder splits open into a mouth that should not exist on any living creature — a pink-and-gray cavern of glistening flesh lined with tusks the length of a man's forearm, each one curved and yellowed and clearly capable of shearing through wood, bone, and flesh without meaningful resistance. The jaw opens to an angle that seems to dislocate the skull, revealing the full horror of the gape: a maw wide enough to engulf a man's torso. The body that follows is a wall of gray-brown flesh, smooth and glistening, impossibly massive for how fast it moves. The eyes are small and set high on a head that seems designed by something that valued function over aesthetics — nostrils, eyes, and ears all positioned to sit above the waterline while the rest of the animal remains hidden. The sound it produces is not a roar but something worse: a bellow that resonates across the water like a war horn, deep enough to feel in your sternum, followed by a series of grunting laughs that carry a clear and unmistakable threat. The creature moves through the shallows with a surging, purposeful gait that belies its bulk. The water does not slow it. Nothing slows it.

# Dossier {#dossier}

The Hippopotamus is the most dangerous large animal along the rivers and marshes of Xerathia — more lethal than the crocodile, more aggressive than the elephant, and utterly without the caution that governs most herbivores. An adult male stands roughly five feet at the shoulder but stretches twelve to fifteen feet in length and weighs three to four thousand pounds — a mass of bone, muscle, and thick hide shaped into a creature that dominates its river territory through sheer violence. Despite being herbivorous (they graze on riverside grasses at night), hippopotami are extraordinarily territorial and will attack anything that enters their water: boats, swimmers, crocodiles, other hippos, and humans with equal enthusiasm. They are responsible for more human deaths along the Tameresh River than any other animal, including the crocodile. Adventurers encounter them while crossing rivers, traveling by boat, camping on riverbanks, or when hippo herds encroach on farming settlements — as is currently happening along the upper Tameresh, where the [[Sekhet.Neru|Sekhet'Neru]] is struggling to control a population surge.

## Presentation

A barrel-shaped body of extraordinary mass, covered in smooth, nearly hairless skin that ranges from gray-brown to dark purple-gray, often mottled with pink around the folds, mouth, and underbelly. The skin secretes a reddish, oily substance that protects against sunburn and infection — from a distance, a hippo can appear to be sweating blood. The head is enormous and blunt, wider than it is long, dominated by a broad muzzle and a jaw that can open to nearly 180 degrees. The canine tusks are the primary weapons: lower canines can reach twenty inches in length and are self-sharpening, honed by constant grinding against the upper tusks. The incisors are shorter but equally dangerous in close quarters. The eyes, ears, and nostrils are positioned on top of the head, allowing the hippo to remain almost completely submerged while still seeing, hearing, and breathing — the perfect design for an ambush predator that happens to eat grass. The legs are short and thick, ending in four-toed feet that provide surprising traction on muddy riverbeds. On land, the hippo moves with a lumbering gait that can accelerate to a terrifying run — faster than a human over short distances, despite weighing two tons.

## Key Behaviors

Hippopotami are semi-aquatic, spending daylight hours submerged in rivers, lakes, and marshes to regulate body temperature and protect their sensitive skin from the sun. They emerge at dusk to graze on riverside grasses, sometimes traveling several miles from the water to find suitable feeding grounds before returning before dawn. Males are fiercely territorial, claiming stretches of river and defending them against all rival males through displays of jaw-gaping, bellowing, and — when displays fail — brutal combat that can leave both participants scarred and bleeding. A dominant bull may control several hundred yards of river and the females within it. Females with calves are dangerously protective and will attack without warning or display. Hippos are gregarious, gathering in groups of ten to thirty individuals called pods or bloats, but the social dynamic is tense — the dominant male enforces hierarchy through constant intimidation, and subordinate males must signal submission or face attack. Hippos are surprisingly vocal, producing a range of bellows, grunts, honks, and wheezing laughs that carry for miles across water. These vocalizations serve as territorial markers, social signals, and warnings. A hippo that has begun its warning bellow is seconds away from a charge.

## Combat Strategy

A hippopotamus does not hunt, but it fights with a lethality that exceeds most dedicated predators. When a hippo perceives a territorial intrusion — a boat entering its stretch of river, a human approaching the water's edge, a crocodile venturing too close to calves — it submerges and approaches underwater with remarkable stealth for an animal of its size. The first warning is often the eruption itself: the hippo surfaces explosively beneath or beside the target, mouth already open to its full gape. Against boats, the hippo bites directly into the hull, capsizing or shattering smaller vessels with jaw pressure sufficient to crack wooden planks. Against humans or animals, the bite is delivered with the full force of the jaw, driving tusks through flesh and bone with devastating effect. On land, the hippo charges with a straight-line sprint that covers ground faster than most humans can run. The charge is not subtle — it is a direct, overwhelming application of mass and momentum. A hippo that has committed to an attack does not bluff and does not stop. It will pursue a fleeing target for a considerable distance before breaking off, and a hippo defending calves may not break off at all.

## Attack Methods

### Jaw Gape and Tusk Strike

The primary attack. The hippo opens its jaw to its full extension — nearly 180 degrees — and drives the lower tusks forward and upward into the target. The tusks are self-sharpening ivory, capable of piercing hide, armor, and the wooden hulls of boats. The bite force is among the highest of any living animal, sufficient to sever a crocodile in half or crush a human torso. The jaw can close with enough force to snap a wooden oar or a human femur.

### Charging Slam

On land or in shallows, the hippo accelerates into a straight-line charge, using its full body mass as a battering ram. The impact can knock a man several yards, shatter wooden structures, and capsize boats. The charge is followed immediately by trampling or a bite.

### Boat Capsize

Against watercraft, the hippo attacks from below, surfacing beneath the hull or biting the gunwale to flip the vessel. Once occupants are in the water, they are in the hippo's element. Smaller reed boats are destroyed outright; larger wooden vessels may survive but will be damaged and destabilized. The Sekhet'Neru considers this the hippo's most dangerous tactic, because it puts hunters in the water where neither their weapons nor their footing can save them.

### Trampling

Once a target is down — knocked from a boat, thrown by a charge, or simply caught in the open — the hippo may trample with its full weight, driving its broad feet into the prone target repeatedly. The weight concentrated through each foot is sufficient to crush bone and rupture organs through armor.

## Special Abilities

### Aquatic Dominance

In water, the hippopotamus is functionally invincible against human-scale opponents. It can hold its breath for five minutes or more, moves through water with a speed and agility that contradicts its land-bound clumsiness, and can surface or submerge with minimal warning. A hippo attacking from underwater has the advantage of complete surprise — the animal's approach is silent and invisible. Fighting a hippo in its own river is suicidal without specialized equipment and tactics.

### Devastating Bite Force

The hippopotamus possesses one of the most powerful bites of any living animal. The jaw muscles generate force sufficient to crush bone, shear through wood, and pierce the armored hide of crocodiles. The self-sharpening tusks maintain their edge through constant grinding, ensuring that the bite remains lethal regardless of the hippo's age. The combination of bite force and tusk length means that a single bite can inflict wounds that are immediately fatal.

### Thick Hide

Hippopotamus skin is approximately two inches thick across the back and flanks, providing natural armor that resists cutting and piercing weapons. Arrows and light spears may fail to penetrate; heavier weapons and harpoons are required to inflict meaningful wounds. The skin's thickness also provides some protection against blunt trauma, though the animal's vital organs remain vulnerable to sufficiently powerful impacts.

### Territorial Fury

A hippopotamus defending its territory or its young fights with a ferocity that borders on the mindless. It does not retreat, does not respond to pain signals that would cause other animals to disengage, and will continue attacking until the threat is destroyed or has fled entirely beyond the hippo's range. This territorial commitment makes hippos extraordinarily dangerous — there is no negotiation, no standoff, no moment of hesitation that a hunter can exploit. The animal commits fully to violence the instant it perceives a threat.

### Unexpected Speed

Despite weighing two tons, a hippopotamus can run at speeds exceeding twenty miles per hour over short distances — faster than most humans. This speed, combined with the animal's mass, makes a charging hippo on land nearly as dangerous as one in water. The acceleration is deceptive; the animal appears slow and ponderous until the moment it commits to a charge, at which point it covers ground with alarming speed.

## Attributes

- **Strength:** 20-25 (1d6+19)

- **Endurance:** 19-24 (1d6+18)

- **Dexterity:** 6-9 (1d4+5)

- **Agility:** 6-9 (1d4+5)

- **Perception:** 9-14 (1d6+8)

- **Aura:** 9-14 (1d6+8)

- **Will:** 14-19 (1d6+13)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 3-6 (1d4+2)
