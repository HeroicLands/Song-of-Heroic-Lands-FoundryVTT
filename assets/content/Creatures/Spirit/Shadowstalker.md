---
aliases:
    - Shadowstalker
tags:
    - spirit
name:
    full: Shadowstalker
    aliases: []
id: K30OECnGa5hVR22R
slug: shadowstalker
img: icons/game-icons/lorc/spectre.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 14
        end: 16
        dex: 18
        agl: 18
        per: 16
        aur: 20
        wil: 18
        rea: 14
        cre: 16
    attrRollFormula:
        str: 1d6+10
        end: 1d4+13
        dex: 1d6+14
        agl: 1d6+14
        per: 1d4+13
        aur: 1d6+16
        wil: 1d6+14
        rea: 1d6+10
        cre: 1d4+13
    body:
        structure:
            parts: []
            adjacent: []
        weight:
            base: 130
            calc: 130
        reachBase: 0
        bodyScaleBase: 1.0
        personalFatigue: enc + 5
    currentMoveMedium: terrestrial
    movementProfiles:
        - medium: terrestrial
          feetPerRound: 70
          leaguesPerWatch: 5
          encumbrance: floor(wt/4)
          strMod: -5 * floor((str - 10) / 2)
          factors:
              - scope: surface_cover
                key: mixed_forest
                mode: add
                textValue: "0"
          disabled: false
    defaultCombatGroup: null
    items: []
---

# Appearance {#appearance}

You feel it a moment before you see it—a sudden chill down the spine, the prickle of being watched. Then your eyes catch motion in the corner, a shape in shadow that should not move independently of the light that creates it. It is vaguely humanoid but wrong in proportion, with angles too sharp and movements too liquid. Before your mind can quite process what you are seeing, it is no longer there—only the lingering sensation that something predatory measured you and found you wanting.

# Dossier {#dossier}

Shadowstalkers are assassins of the spirit realm—born from murder, shaped by desperation, or occasionally bound into service by dark sorcerers. They are not mindless killers but tactical beings with their own codes and purposes. Some Shadowstalkers hunt specific targets across years; others are bound to a location and strike at any who enter their domain. All share an inhuman talent for moving unseen and striking with lethal precision. Most dangerous is that a Shadowstalker learns—each failed kill attempt teaches it something about its prey.

## Presentation

A Shadowstalker is a being of movement rather than form. When partially visible, it appears vaguely humanoid but proportioned for killing—long, thin limbs; compact torso; predatory spine. Its body is composed of darkness made semi-solid, with edges that blur and shift like smoke. Its eyes are the most distinct feature: deep red or burning amber, positioned with unsettling awareness, and clearly intelligent. Where it passes, shadows seem to deepen and cling to it like fabric. It makes almost no sound—even when moving across loose stone or broken glass, the creature seems to muffle the world around it.

## Key Behaviors

Shadowstalkers are ambush hunters with a preference for isolated victims. They stalk prey for extended periods, learning routines, identifying weaknesses, and timing the optimal moment for attack. Some Shadowstalkers seem to take pleasure in the hunt itself, drawing it out unnecessarily; others strike with brutal efficiency. They are territorial and will defend their hunting grounds against humans and other Shadowstalkers alike. They seem to understand the concept of mercy—occasionally releasing a victim who appeals to them in some way—but mercy is rare and idiosyncratic.

## Combat Strategy

A Shadowstalker never engages in fair combat if avoidable. It attacks from darkness, deals devastating damage in the first strike, and then repositions or flees if the fight doesn't go perfectly. It uses shadows as both concealment and highways, and it targets isolated opponents whenever possible. Against multiple enemies, it attempts to separate and disable them methodically rather than engaging all at once. It is intelligent enough to recognize when an enemy poses too much threat and will withdraw to another day. Radiant light infuriates and panics a Shadowstalker, forcing it to become more aggressive and reckless.

## Attack Methods

### Shadow Claws

The Shadowstalker extends claws that seem to be formed of living shadow, and they strike with supernatural force. The wounds they leave are grievous but also numbing—victims feel the cold touch of the necrotic energy, as if the wound itself is draining warmth and life. A claw strike leaves a victim weakened and struggling to act decisively.

### Necrotic Dagger Strike

The creature manifests a blade of shadows and bone and strikes with perfect precision at vital targets. These strikes are less about physical damage and more about spiritual harm—victims report feeling as though the blade reached into them, pulling at something fundamental. Multiple strikes can leave a person hollow, unmotivated, barely alive.

## Special Abilities

### Shadow Mastery

In any shadow or dim light, the Shadowstalker can move with invisibility-like concealment. It can see clearly in darkness and can move through shadows as though they were open space. Darkness is its natural element and its advantage there is overwhelming.

### Stealth Excellence

The creature is nearly impossible to detect when it is being deliberate. It moves without making sound, and its form blends with shadows so completely that even those watching for it often miss its presence. Only active searching or magical detection has a reasonable chance of exposing a hidden Shadowstalker.

### Precision Strike

When attacking from stealth or from surprise, a Shadowstalker's strike is devastatingly accurate. It aims for vulnerabilities in armor, the gaps between defenses, the places where a strike does the most harm.

### Life Drain

The necrotic energy in the creature's attacks drains not merely health but vitality. Victims struck by a Shadowstalker find their strength diminishing, not just from the wounds but from the unnatural cold the creature leaves behind.

### Necrotic Resistance

The Shadowstalker is resistant to necrotic energy and completely immune to normal disease. Radiant energy and light are the primary things that can harm it beyond normal weapons.

## Additional Information

Radiant light is the key counter to a Shadowstalker. Bright magical light forces the creature into a more material state where normal weapons can harm it effectively. Sacred sites and temples empowered by good-natured faiths are places where Shadowstalkers cannot hide. Some Shadowstalkers can be negotiated with, especially those bound to service rather than driven by hunger. Others are utterly implacable and will pursue a target across the world. The most dangerous Shadowstalkers are those that develop obsessions with particular prey—they become unstoppable until either the prey is dead or the Shadowstalker is destroyed.

## Attributes

- **Strength:** 11-16 (1d6+10)

- **Endurance:** 14-17 (1d4+13)

- **Dexterity:** 15-20 (1d6+14)

- **Agility:** 15-20 (1d6+14)

- **Perception:** 14-17 (1d4+13)

- **Aura:** 17-22 (1d6+16)

- **Will:** 15-20 (1d6+14)

- **Reasoning:** 11-16 (1d6+10)

- **Creativity:** 14-17 (1d4+13)
