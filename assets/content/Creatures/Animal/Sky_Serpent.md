---
aliases:
    - Sky Serpent
tags:
    - animal
name:
    full: Sky Serpent
    aliases: []
id: IufOc6e3iYJZ46GV
slug: sky-serpent
img: icons/game-icons/lorc/harpy.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 21
        end: 16
        dex: 15
        agl: 17
        per: 16
        aur: 10
        wil: 13
        rea: 7
        cre: 6
    attrRollFormula:
        str: 1d6+17
        end: 1d6+12
        dex: 1d6+11
        agl: 1d6+13
        per: 1d6+12
        aur: 1d4+7
        wil: 1d6+9
        rea: 1d4+4
        cre: 1d4+3
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 150
            calc: 150
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 40
          leaguesPerWatch: 3
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
    items: []
---

# Appearance {#appearance}

The air above ripples with heat and motion, and you catch only glimpses of the creature — a serpentine form that seems to be made more of sky and light than flesh. The iridescent scales shimmer with hues that match the sky so perfectly that tracking the creature is nearly impossible, as if you're watching a living piece of atmosphere move with malicious intent. The undulating motion is hypnotic, almost aquatic despite the lack of water, and you notice the thin frills along the body unfurling and contracting with each shift of position. Then the creature's head swings toward you, and the slit-pupilled eyes lock on your position with predatory certainty. In that moment, you understand that you're being assessed as food, and the creature has significant advantages in this space.

# Dossier {#dossier}

The Sky Serpent is a serpentine aerial predator reaching lengths of 20-30 feet, found in high-altitude mountain regions, deep canyons, and dense forest canopies where elevation provides hunting advantage. These ambush specialists use gliding and constriction to overcome prey, occupying ecological niches where ground-based predators cannot compete. Adventurers encounter sky serpents primarily while traveling through mountains, exploring high-altitude ruins, or crossing valleys where the creatures hunt.

## Presentation

The Sky Serpent is a sleek, serpentine creature with a body length that exceeds twenty feet but a width of only 2-4 feet, creating a streamlined form optimized for gliding and flight manipulation. The scales are iridescent, shifting through greens, blues, and silvers depending on angle and light, providing camouflage against sky and cloud formations. Thin, wing-like frills run along the creature's body, extending from above the spine and folding when not in use. These frills are not capable of powered flight but are superbly adapted for gliding, allowing the creature to extend falls and change trajectory. The head is relatively small and proportional to the body, with forward-facing slit-pupilled eyes adapted for aerial vision and motion detection. The mouth is filled with sharp fangs designed for gripping slippery prey. The tail is long and muscular, used for balance and directional control during gliding and flight manipulation.

## Key Behaviors

Sky Serpents are solitary creatures that establish territories across high-altitude regions and glide between peaks or through forest canopies in search of prey. They are ambush specialists that hunt by soaring at altitude, detecting movement on ground or in lower canopy, then diving or gliding down for surprise attacks. They are active primarily during daylight hours when thermal currents provide lift for gliding. They prefer prey in the small-to-medium size range but will attack larger creatures if hunger or territorial threat motivates them. Sky Serpents are capable of remaining in flight for extended periods, covering enormous distances in search of productive hunting grounds. They are solitary and non-social except during mating season.

## Combat Strategy

The sky serpent's primary tactic is aerial ambush — using altitude and speed advantage to dive or glide toward targets with overwhelming momentum. The creature attempts to wrap coils around prey, using the weight of constriction to immobilize while venom does its work. If the initial ambush fails or the target proves more dangerous than anticipated, the sky serpent retreats to altitude where pursuit becomes nearly impossible. The creature will not engage in sustained ground combat and will always attempt to return to its aerial advantage.

## Attack Methods

### Diving Strike

The sky serpent dives from altitude with tremendous speed, using gravity and muscular propulsion to achieve impact that can knock opponents off balance. The strike is followed immediately by an attempt to establish a grapple and wrap coils around the victim.

### Constricting Coils

Once the sky serpent has wrapped around a victim, it uses muscular constriction to restrict breathing and movement. The constriction is relentless and the creature will continue until the victim loses consciousness or the grapple is broken through extraordinary strength.

### Venomous Bite

While wrapped around prey or during initial contact, the sky serpent bites with needle-sharp fangs that inject a neurotoxic venom causing weakness, disorientation, and progressive paralysis. The venom is not immediately lethal but significantly weakens victims over time.

## Special Abilities

### Gliding Mastery

The sky serpent can glide silently from altitude, extending falls to tremendous distances while remaining nearly silent. The creature can change direction mid-glide and adjust speed through subtle body movements. In aerial combat, the creature gains overwhelming advantage.

### Venomous Strike

The sky serpent's venom is specialized to work on prey much larger than the creature itself, causing progressive weakness and paralysis that eventually immobilizes victims. The venom takes time to work but is extraordinarily effective against unarmored targets.

### Aerial Agility

The sky serpent can maneuver in three-dimensional space with grace and speed that ground-bound creatures cannot match. The creature can hover briefly using frills, dive vertically, and change direction with minimal warning.

### Predatory Vision

The sky serpent's forward-facing eyes provide excellent motion detection and ability to track prey across ground and through forest canopy. The creature can identify suitable prey from extraordinary altitudes.

### Heat Sensing

Some sky serpents (particularly mature individuals) possess heat-sensing capabilities that allow them to detect warm-blooded prey even in conditions where visual hunting is impossible.

### Additional Information

Sky serpents are most dangerous in open terrain where they maintain aerial advantage. In dense forest or enclosed spaces, their advantage diminishes significantly. The creatures are vulnerable when grounded or in situations where they cannot quickly regain altitude. A sky serpent that has successfully hunted humanoids will return to human-occupied areas, making it a direct threat to settlements in its territory. The creature's venom can be harvested after death and used for poison creation or antidote manufacturing, making dead sky serpents valuable resources.

## Attributes

- **Strength:** 18-23 (1d6+17)

- **Endurance:** 13-18 (1d6+12)

- **Dexterity:** 12-17 (1d6+11)

- **Agility:** 14-19 (1d6+13)

- **Perception:** 13-18 (1d6+12)

- **Aura:** 8-11 (1d4+7)

- **Will:** 10-15 (1d6+9)

- **Reasoning:** 5-8 (1d4+4)

- **Creativity:** 4-7 (1d4+3)
