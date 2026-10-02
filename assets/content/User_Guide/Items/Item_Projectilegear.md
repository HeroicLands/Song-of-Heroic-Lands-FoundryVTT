---
shortcode: projectilegearug
name: {full: "Projectile"}
type: doc
subType: userguide
data: {packFolder: items}
---

# What are Projectiles?

Projectiles represent ammunition used with ranged weapons — arrows, bolts, sling stones, darts, or any other missile that is launched from a ranged weapon in combat. Projectiles are consumed when used and are referenced by Missile Strike Modes to determine which ammunition a ranged attack uses.

# Where It Appears

Projectiles appear on the Being sheet's **Gear** tab and can be nested inside Containers (such as a quiver). When a character makes a ranged attack using a Missile Strike Mode, the strike mode references the appropriate Projectile to determine ammunition availability and any damage modifiers the projectile provides.

# Additional Properties

Along with the [[doc-gearug|Standard Gear Properties]], the following additional properties are defined for projectiles:

- **Short Name:** An abbreviated name for the projectile, used wherever a compact display has no room for the full name.
- **Impact:** The projectile's own damage characteristics, which combine with the weapon's strike mode at the moment of attack:
  - **Number of Dice**, **Die Type**, and **Modifier:** Leave any of these blank to take the loosing weapon's own value; set one to override it for this projectile specifically.
  - **Aspect:** The kind of harm the projectile does — **Blunt**, **Edged**, **Piercing**, or **Fire** — always its own, never the weapon's. Worth setting deliberately: a blunt arrow is a real and different thing from a broadhead one.
- **Broadhead** (under **Impact**): Whether this projectile carries a cutting head rather than a blunt or simple point.

A projectile's **Type** — which launcher it can be loosed from: **None**, **Arrow**, **Bolt**, **Bullet**, **Dart**, or **Other** — has no field on the Properties tab; it is set in the compendium entry rather than on the sheet.

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
