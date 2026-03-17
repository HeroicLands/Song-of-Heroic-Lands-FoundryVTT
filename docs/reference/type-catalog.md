# SoHL Type Catalog

See also: [Documentation Hub](../README.md), [Architecture Overview](./architecture.md), [Rules Variants and Extension Mechanisms](./rules-variants.md)

This document is an index of the primary SoHL Actor and Item types, plus their most common interactions.
For conceptual details, see `docs/concepts/architecture.md`, `docs/concepts/nested-items.md`, and `docs/concepts/rules-variants.md`.

## Actors

| Actor Type    | Represents                                                                                                   | Commonly interacts with                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Being**     | A single person/creature character or NPC with anatomy, skills, injuries, and gear.                          | Skills, Traits, Injuries, Armor/Gear/Weapons, Movement Profiles, Mysteries/Mystical Abilities/Devices, Effects/Modifiers/Results |
| **Cohort**    | A group acting as a unit (followers, squad, crew element), often simplified vs individual beings.            | Skills (group), Traits, Gear (shared), Injuries/Afflictions, Actions, Domain/Affiliation                                         |
| **Structure** | A fixed installation/location entity (building, fortification, ship component), often targetable/damageable. | Protection, Injuries/Damage abstractions, Domains, Affiliation, Actions                                                          |
| **Vehicle**   | A movable platform (wagon, ship, mount abstraction) with capacity, protection, and possibly crew.            | Container/Storage items, Protection, Injuries/Damage, Actions, Affiliation, Domains                                              |
| **Assembly**  | A hybrid Actor/Item container for complex nested item hierarchies (e.g., enchanted weapon, treasure chest). Variant-invariant. Has its own sidebar tab. See [Assembly Architecture](../concepts/assembly-architecture.md). | Any item type as canonical item; nested items depend on the canonical item's type (e.g., WeaponGear with StrikeModes, ContainerGear with contents). |

## Items

### Actions and identity

| Item Type       | Represents                                                                          | Usually attached to                               |
| --------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| **Action**      | A performable procedure (test, opposed test, maneuver, special ability invocation). | Being, Cohort, sometimes nested in gear/abilities |
| **Affiliation** | Membership / faction identity.                                                      | Being, Cohort, sometimes Structure/Vehicle        |
| **Domain**      | Sphere of authority, influence, or jurisdiction.                                    | Being, Cohort, Structure, Vehicle                 |

### Conditions and harm

| Item Type      | Represents                                                   | Usually attached to                                       |
| -------------- | ------------------------------------------------------------ | --------------------------------------------------------- |
| **Affliction** | Ongoing condition (disease, poison, curse, impairment).      | Being, Cohort                                             |
| **Injury**     | Specific harm instance (wound/trauma) often tied to anatomy. | Being; sometimes Structure/Vehicle as “damage record”     |
| **Protection** | Defensive value source (armor rating, barrier, ward).        | Being, Structure, Vehicle; sometimes nested in Armor/Gear |

### Anatomy model

| Item Type         | Represents                                                    | Usually attached to |
| ----------------- | ------------------------------------------------------------- | ------------------- |
| **Body Location** | Anatomical location (hit location concept).                   | Being               |
| **Body Zone**     | Aggregated region of the body (grouping of locations).        | Being               |
| **Body Part**     | A concrete part (arm, leg, head) often for detailed modeling. | Being               |

### Skills and traits

| Item Type | Represents                                                    | Usually attached to           |
| --------- | ------------------------------------------------------------- | ----------------------------- |
| **Skill** | A trained capability with values, modifiers, tests.           | Being, sometimes Cohort       |
| **Trait** | A characteristic, advantage, drawback, or intrinsic property. | Being, Cohort, sometimes Gear |

### Gear and inventory

| Item Type           | Represents                                  | Usually attached to                         |
| ------------------- | ------------------------------------------- | ------------------------------------------- |
| **Armor Gear**      | Wearable protection gear.                   | Being; may contain nested Protection/traits |
| **Weapon Gear**     | A weapon “container” or base definition.    | Being; may contain nested strike modes      |
| **Misc Gear**       | General equipment not captured elsewhere.   | Being                                       |
| **Container Gear**  | Inventory container or storage unit.        | Being, Vehicle; may contain nested items    |
| **Projectile Gear** | Ammunition / projectile objects.            | Being; used with missile strike modes       |
| **Concoction Gear** | Consumable mixture (potion, poison, salve). | Being; can apply Afflictions/Effects        |

### Movement and combat modes

| Item Type                        | Represents                                                          | Usually attached to                                     |
| -------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------- |
| **Movement Profile**             | Movement capabilities, rates, encumbrance profile, terrain effects. | Being, Cohort, Vehicle                                  |
| **Combat Technique Strike Mode** | A strike mode tied to a combat technique (maneuvering style).       | Being; often nested under a technique/weapon            |
| **Melee Weapon Strike Mode**     | Strike mode for melee weapon usage.                                 | Nested under Weapon Gear (common), or attached to Being |
| **Missile Weapon Strike Mode**   | Strike mode for ranged weapon usage.                                | Nested under Weapon Gear; references Projectile Gear    |

### Mystical / philosophy

| Item Type            | Represents                                                   | Usually attached to                 |
| -------------------- | ------------------------------------------------------------ | ----------------------------------- |
| **Mystery**          | A mystical “school/domain” concept grouping abilities.       | Being                               |
| **Mystical Ability** | A specific power/spell/ability with tests and effects.       | Being; may reference Mystery        |
| **Mystical Device**  | A magical device enabling abilities/effects.                 | Being; may contain nested abilities |
| **Philosophy**       | Belief system / doctrine / ethos; may unlock actions/traits. | Being, Cohort                       |

## Variant invariance

Some types are **variant-invariant**: their logic, data model, and sheet are defined entirely in `src/common/` and do not change between rule variants (Legendary, MistyIsle). Other types are **variant-specific**: they have overrides in `src/legendary/` or `src/mistyisle/` that add or modify behavior.

### Variant-invariant actors

| Actor         | Notes                                                                 |
| ------------- | --------------------------------------------------------------------- |
| **Assembly**  | Hybrid Actor/Item container. See [Assembly Architecture](../concepts/assembly-architecture.md). |
| **Cohort**    | Group entity. Logic and sheet in `src/common/actor/Cohort.ts`.        |
| **Structure** | Fixed installation. Logic and sheet in `src/common/actor/Structure.ts`. |
| **Vehicle**   | Movable platform. Logic and sheet in `src/common/actor/Vehicle.ts`.   |

### Variant-specific actors

| Actor      | Notes                                                              |
| ---------- | ------------------------------------------------------------------ |
| **Being**  | Has variant-specific logic and sheet in `src/legendary/actor/LgndBeing.ts`. |

### Variant-invariant items

| Item                 | Notes                                                                   |
| -------------------- | ----------------------------------------------------------------------- |
| **Action**           | Logic and sheet in `src/common/item/Action.ts`.                         |
| **Affiliation**      | Logic and sheet in `src/common/item/Affiliation.ts`.                    |
| **Affliction**       | Logic and sheet in `src/common/item/Affliction.ts`.                     |
| **Disposition**      | Logic and sheet in `src/common/item/Disposition.ts`.                    |
| **Domain**           | Logic and sheet in `src/common/item/Domain.ts`.                         |
| **Movement Profile** | Logic and sheet in `src/common/item/MovementProfile.ts`.                |
| **Philosophy**       | Logic and sheet in `src/common/item/Philosophy.ts`.                     |
| **Trait**            | Logic and sheet in `src/common/item/Trait.ts`.                          |

### Variant-specific items

| Item                             | Notes                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| **Armor Gear**                   | Variant overrides in `src/legendary/item/LgndArmorGear.ts`.                        |
| **Body Location**                | Variant overrides in `src/legendary/item/LgndBodyLocation.ts`.                     |
| **Body Part**                    | Variant overrides in `src/legendary/item/LgndBodyPart.ts`.                         |
| **Body Zone**                    | Variant overrides in `src/legendary/item/LgndBodyZone.ts`.                         |
| **Combat Technique Strike Mode** | Variant overrides in `src/legendary/item/LgndCombatTechniqueStrikeMode.ts`.        |
| **Concoction Gear**              | Variant overrides in `src/legendary/item/LgndConcoctionGear.ts`.                   |
| **Container Gear**               | Variant overrides in `src/legendary/item/LgndContainerGear.ts`.                    |
| **Injury**                       | Variant overrides in `src/legendary/item/LgndInjury.ts`.                           |
| **Melee Weapon Strike Mode**     | Variant overrides in `src/legendary/item/LgndMeleeWeaponStrikeMode.ts`.            |
| **Misc Gear**                    | Variant overrides in `src/legendary/item/LgndMiscGear.ts`.                         |
| **Missile Weapon Strike Mode**   | Variant overrides in `src/legendary/item/LgndMissileWeaponStrikeMode.ts`.          |
| **Mystery**                      | Variant overrides in `src/legendary/item/LgndMystery.ts`.                          |
| **Mystical Ability**             | Variant overrides in `src/legendary/item/LgndMysticalAbility.ts`.                  |
| **Mystical Device**              | Variant overrides in `src/legendary/item/LgndMysticalDevice.ts`.                   |
| **Projectile Gear**              | Variant overrides in `src/legendary/item/LgndProjectileGear.ts`.                   |
| **Protection**                   | Variant overrides in `src/legendary/item/LgndProtection.ts`.                       |
| **Skill**                        | Variant overrides in `src/legendary/item/LgndSkill.ts`.                            |
| **Weapon Gear**                  | Variant overrides in `src/legendary/item/LgndWeaponGear.ts`.                       |

## Core architecture concepts

- **NestedItems:** SoHL supports “items within items” even though Foundry does not natively. See `docs/concepts/nested-items.md`.
- **Rules Variants:** SoHL supports **Legendary** and **MistyIsle** variants. See `docs/concepts/rules-variants.md`.

## Canonical kinds

Canonical actor/item kind identifiers are defined in `src/utils/constants.ts` (`ACTOR_KIND` and `ITEM_KIND`).
