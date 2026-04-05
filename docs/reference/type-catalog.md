# SoHL Type Catalog

See also: [Documentation Hub](../README.md), [Architecture Overview](./architecture.md)

This document is an index of the primary SoHL Actor and Item types, plus their most common interactions.

## Actors

| Actor Type    | Represents                                                                                                   | Commonly interacts with                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| **Being**     | A single person/creature character or NPC with anatomy, skills, injuries, and gear.                          | Skills, Traits, Injuries, Armor/Gear/Weapons, Mysteries/Mystical Abilities, Effects    |
| **Cohort**    | A group acting as a unit (followers, squad, crew element), often simplified vs individual beings.            | Skills (group), Traits, Gear (shared), Injuries/Afflictions, Affiliation               |
| **Structure** | A fixed installation/location entity (building, fortification, ship component), often targetable/damageable. | Injuries/Damage abstractions, Affiliation                                              |
| **Vehicle**   | A movable platform (wagon, ship, mount abstraction) with capacity, protection, and possibly crew.            | Container/Storage items, Injuries/Damage, Affiliation                                  |
| **Assembly**  | A container for grouping related items (e.g., armor set, treasure chest). Variant-invariant. See [Assembly Architecture](../concepts/assembly-architecture.md). | Any item type. |

## Items

### Identity

| Item Type       | Represents                                                                          | Usually attached to                        |
| --------------- | ----------------------------------------------------------------------------------- | ------------------------------------------ |
| **Affiliation** | Membership / faction identity.                                                      | Being, Cohort, sometimes Structure/Vehicle |

### Conditions and harm

| Item Type      | Represents                                                   | Usually attached to                                   |
| -------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| **Affliction** | Ongoing condition (disease, poison, curse, impairment).      | Being, Cohort                                         |
| **Injury**     | Specific harm instance (wound/trauma) often tied to anatomy. | Being; sometimes Structure/Vehicle as "damage record" |

### Skills and traits

| Item Type | Represents                                                    | Usually attached to           |
| --------- | ------------------------------------------------------------- | ----------------------------- |
| **Skill** | A trained capability with values, modifiers, tests.           | Being, sometimes Cohort       |
| **Trait** | A characteristic, advantage, drawback, or intrinsic property. | Being, Cohort, sometimes Gear |

### Gear and inventory

| Item Type           | Represents                                  | Usually attached to                |
| ------------------- | ------------------------------------------- | ---------------------------------- |
| **Armor Gear**      | Wearable protection gear.                   | Being                              |
| **Weapon Gear**     | A weapon with integrated strike modes.      | Being                              |
| **Misc Gear**       | General equipment not captured elsewhere.   | Being                              |
| **Container Gear**  | Inventory container or storage unit.        | Being, Vehicle                     |
| **Projectile Gear** | Ammunition / projectile objects.            | Being                              |
| **Concoction Gear** | Consumable mixture (potion, poison, salve). | Being; can apply Afflictions       |

### Combat

| Item Type              | Represents                                            | Usually attached to |
| ---------------------- | ----------------------------------------------------- | ------------------- |
| **Combat Technique**   | A combat technique with its own integrated strike modes. | Being            |

### Mystical

| Item Type            | Represents                                             | Usually attached to |
| -------------------- | ------------------------------------------------------ | ------------------- |
| **Mystery**          | A mystical concept grouping abilities.                 | Being               |
| **Mystical Ability** | A specific power/spell/ability with tests and effects. | Being               |

## Canonical kinds

Canonical actor/item kind identifiers are defined in `src/utils/constants.ts` (`ACTOR_KIND` and `ITEM_KIND`).
