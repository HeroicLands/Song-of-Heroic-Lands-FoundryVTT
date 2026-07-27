---
aliases:
    - Acidtoad
tags:
    - dreadspawn
name:
    full: Acidtoad
    aliases: []
id: ho5hsRAglADOtInP
slug: acidtoad
img: icons/game-icons/lorc/toad-teeth.svg
portrait: ""
type: creature
package: sohl
sohl:
    archetype: 0
    attributes:
        str: 12
        end: 18
        dex: 10
        agl: 8
        per: 16
        aur: 10
        wil: 12
        rea: 8
        cre: 9
    attrRollFormula:
        str: 1d4+9
        end: 1d6+14
        dex: 1d6+6
        agl: 1d6+4
        per: 1d4+13
        aur: 1d6+6
        wil: 1d4+9
        rea: 1d6+4
        cre: 1d6+5
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

The water ahead begins to bubble and steam. A bloated, warty form emerges from beneath the scum—prehistoric, bulbous, its massive body swollen as if overfilled with something vile. Sickly green-yellow skin glistens where it isn't covered in mucus that hisses and pops as it drips onto stone. Its mouth yawns wide, and the stench of old rot mixed with something acrid makes your eyes stream. Where its saliva spatters, stone and wood char.

# Dossier {#dossier}

Acidtoads are shambling amphibian predators of swamps and toxic pools, twisted by corruption into apex hunters of wetlands. These creatures dwelt once as normal toads until something—dark magic, alchemical seepage, or worse—transformed them into sluggish but lethally venomous ambush killers. Adventurers stumble upon Acidtoads in marshes, abandoned alchemical sites, or pools fed by underground rivers running through cursed lands.

## Presentation

The Acidtoad is a massive, toad-like creature roughly six to eight feet in length, covered in warty bumps and weeping sores from which corrosive secretions constantly drain. Its hide is mottled sickly green and jaundiced yellow, allowing it to blend with algae-choked water and marsh vegetation. The interior of its gaping maw is pale and raw-looking, lined with backward-curving teeth; its jaw appears dislocated, capable of opening far wider than any natural toad's. Its eyes are lidless, bulging, a predatory yellowish-green that glow dimly in low light. A constant hissing emanates from it as acidic mucus burns away stone and wood in random sputters.

## Key Behaviors

The Acidtoad is a solitary, patient predator. It stations itself in shallow swamp water, at the margins of toxic pools, or in muddy riverbank hollows where its discolored hide renders it nearly invisible. There it waits—sometimes for days—until movement in the water betrays prey. It does not hunt actively except when starving; it prefers the ambush. When not hunting, it remains nearly comatose, breathing slowly, exuding its corrosive secretions at a reduced rate. Acidtoads show no interest in territories beyond their immediate hunting ground and do not congregate.

## Combat Strategy

The Acidtoad strikes from concealment, attempting to incapacitate or severely injure prey with its initial attack before they can reach safety. If prey proves more resilient than expected, the toad deploys ranged acid attacks while maintaining distance, slowly wearing down armor and health. It does not pursue prey into deep water or up steep banks; if prey reaches defensible ground, the toad retreats to its lair to wait for a better opportunity. Injury causes it to become erratic and dangerous rather than cautious.

## Attack Methods

### Corrosive Spit

The creature projects a stream of caustic fluid from its gaping maw that burns exposed flesh and erodes armor and sohl. This attack can be sustained over multiple rounds if the toad maintains line of sight.

### Venomous Bite

The Acidtoad's bite delivers both crushing trauma and injected venom that weakens muscles and slows reflexes in the bitten limb. Prey bitten in the leg may find movement increasingly difficult; prey bitten in the arm loses grip strength and precision.

### Toxic Slime

The toad's body secretes a mildly corrosive mucus that burns on prolonged contact. Any creature grappled by or in close physical contact with the toad takes cumulative damage from this slime.

## Special Abilities

### Camouflage in Wetlands

The Acidtoad's mottled coloring renders it nearly invisible in shallow water, muddy banks, and algae-choked pools. It gains advantage on concealment checks in these environments and can maintain motionless ambush positions for extended periods without detection.

### Acidic Secretion

The creature's body constantly weeps corrosive slime. Any creature in prolonged contact with the toad takes ongoing acid damage; leather, wood, and organic armor deteriorate rapidly from exposure.

### Venom Potency

The venom injected through the toad's bite and saliva causes progressive debilitation. Victims bitten or struck by acid spit suffer cumulative penalties to movement and fine motor skills, representing muscle weakness and increasing stiffness.

## Additional Information

Cold-based attacks are significantly more effective against Acidtoads, as extreme cold hardens and cracks their moist, soft exoskeletons. Disrupting the creature's ambush position by churning the water or creating vibrations can force it from hiding before it can strike. Once driven from its lair or severely wounded, an Acidtoad will not pursue prey into truly deep water or defensible terrain—it retreats to await a better opportunity.
