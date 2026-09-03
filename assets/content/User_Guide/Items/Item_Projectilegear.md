---
aliases:
  - Projectile
id: vsv4MPXDQcskQEl9
type: doc
subType: user-guide
name:
  full: "Projectile"
shortcode: projectilegearug
folder: QtOgPodi8X6gDWL0
---

# What are Projectiles?

Projectiles represent ammunition used with ranged weapons — arrows, bolts, sling stones, darts, or any other missile that is launched from a ranged weapon in combat. Projectiles are consumed when used and are referenced by Missile Strike Modes to determine which ammunition a ranged attack uses.

# Where It Appears

Projectiles appear on the Being sheet's **Gear** tab and can be nested inside Containers (such as a quiver). When a character makes a ranged attack using a Missile Strike Mode, the strike mode references the appropriate Projectile to determine ammunition availability and any damage modifiers the projectile provides.

# Additional Properties

In addition to the [[doc-gearug|Standard Gear Properties]], the following additional properties are defined for projectiles:

- **SubType:** Type of ranged weapon. This is used to determine what sort of weapon the projectile can be used as ammunition for. Types include:
  - **Arrow:** A projectile that is fired from a bow.
  - **Bolt:** A projectile that is fired from a crossbow.
  - **Bullet:** A stone or metal bullet that is fired from a sling or slingshot or similar.
  - **Dart:** A lightweight dart that is shot from a blowgun or similar weapon.
  - **Other:** A projectile that does not meet any of the other descriptions.
- **Impact:** Specific overrides for the impact from the weapon strike mode.
  - **Override Dice:** Should the dice be overriden. If true, then the following fields appear:
    - **Num Dice:** Number of dice to use.
    - **Die Sides:** Number of die sides (6 = d6).
  - **Override Modifier:** Should the modifier be overridden. If true, then the following fields appear:
    - **Modifier:** The modifier value.
  - **Aspect:** Overrides the missile strike mode impact. (note that there are such things as blunt arrows and such, so this is in fact important to specify.)
- **Traits:** Various traits for the projectile weapon.

# Intrinsic Actions

A projectile defines no actions of its own. Everything you can run against one is a standard action it already inherits:

| Action                     | Shortcode           |
| -------------------------- | ------------------- |
| Edit                       | `editDocument`      |
| Delete                     | `deleteDocument`    |
| Output Description to Chat | `outputDescription` |
| Toggle Carried             | `toggleCarried`     |

The first three belong to every item and are described on [[doc-baseitemug|Base Item]]; **Toggle Carried** belongs to every piece of gear and is described on [[doc-gearug|Gear]]. Those pages cover what each one does, how it is invoked, and what it produces — none of it changes for a projectile. Shooting one is not an action on the projectile itself: you attack with the ranged weapon, whose Missile Strike Mode names the ammunition it uses — see [[doc-weapongearug|Weapon]].

# See also

- [[doc-ugitems|Items]] — every item type at a glance.
- [[doc-gearug|Gear]] — the properties and the **Toggle Carried** action every carried thing has.
- [[doc-weapongearug|Weapon]] — the missile strike mode that names the ammunition and makes the attack.
- [[doc-baseitemug|Base Item]] — the three shared actions named above.
- [[doc-syssetngug|System Settings]] — the **Track Projectiles** setting.
- [[doc-userguide|User Guide]] — back to the index.
