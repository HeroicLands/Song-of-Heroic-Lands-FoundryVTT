---
aliases:
    - Gear
    - Equipment
    - Inventory
    - Weapons
    - Armor
    - Projectiles
    - Containers
    - Concoctions
    - Encumbrance
id: wjqsgt0VbETSKE6Y
type: doc
package: sohl
category: rules
name:
    full: Gear
    aliases: []
folder: SSkatgtYj9d71kaz
slug: sohl-gear
shortcode: gear
---

**Gear** is the physical property a character owns and carries — weapons, armor,
tools, supplies, coin, and everything in between. Each piece of gear is its own
item, so it can be picked up, dropped, traded, stored in a container, or handed
to another character. This page describes the properties common to all gear, the
way gear burdens the character who carries it, and each of the gear types the
system provides.

# Gear

Every gear item, whatever its type, shares a common set of properties.

| Property       | Meaning                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------- |
| **Quantity**   | How many identical units the item represents (a quiver of 20 arrows, a purse of coins).       |
| **Weight**     | The physical weight of a single unit. Multiplied by quantity, this is what burdens a carrier. |
| **Value**      | The item's worth, for trade and for tallying a character's wealth.                            |
| **Quality**    | The craftsmanship of the item — finer work performs better and lasts longer.                  |
| **Durability** | How well the item resists wear, damage, and breakage over time.                               |
| **Carried**    | Whether the item is currently on the character's person (see _Carrying & Encumbrance_ below). |
| **Container**  | The container, if any, the item is stored inside (see the **Container Gear** page).           |

## Carrying & Encumbrance

Only gear a character is actually **carrying** weighs them down. Gear that has
been set aside, stored in a shelter, or left behind still belongs to the
character and appears in their inventory, but it does not burden them.

The total weight of everything a character carries determines their
**encumbrance** — the drag that heavy loads place on movement and action. The
heavier the load, the greater the encumbrance.

Two rules refine how worn equipment interacts with this total; they are covered
in detail on the **Armor** and **Weapons** pages, but in summary:

- **Worn armor does not weigh you down the way loose cargo does.** The weight of
  armor that is _being worn_ is not counted against encumbrance — a well-fitted
  harness rides the body rather than hanging off it. Armor that is carried but
  **not** worn (bundled in a pack, slung over a shoulder) counts its full weight
  like any other cargo.
- **Some armor and weapons carry an explicit encumbrance value.** This optional
  value represents the awkwardness of the item beyond its raw weight. When such
  an item is worn or wielded, its encumbrance value is added to the character's
  encumbrance.

## Gear Types

The system distinguishes several kinds of gear, each with its own properties and
behavior, described on the pages that follow:

- **Miscellaneous Gear** — ordinary goods with no special mechanics.
- **Container Gear** — gear that holds other gear.
- **Weapons** — instruments of attack, each with one or more strike modes.
- **Projectiles** — ammunition fired or thrown by missile weapons.
- **Armor** — protective equipment, worn or carried.
- **Concoctions** — potions, poisons, medicines, and alchemical preparations.

# Miscellaneous Gear

**Miscellaneous gear** covers everything that has no specialized mechanics of its
own: tools, rations, rope, torches, trade goods, jewelry, coin, personal effects,
and the countless ordinary items a character accumulates. Miscellaneous gear uses
only the common gear properties — quantity, weight, value, quality, and
durability — and burdens its carrier by weight like anything else. When a piece
of equipment does not fit one of the specialized types below, it is
miscellaneous gear.

# Container Gear

**Container gear** is gear whose purpose is to hold other gear — a backpack, a
sack, a chest, a saddlebag, a quiver. In addition to the common gear properties,
a container has a **maximum capacity**: the greatest weight of contents it can
hold.

Any gear item can be placed **inside** a container; while stored there, the item
travels with the container. Containers may themselves be placed inside other
containers (a pouch inside a pack), so a character's belongings form a nested
hierarchy. The weight of a container's contents still counts toward the
character's carried weight while the container is carried — a full pack is no
lighter than the sum of what is in it.

# Weapons

A **weapon** is a piece of gear made for attacking — a sword, a spear, a bow, a
mace, a dagger. Along with the common gear properties, a weapon has:

- **Heft** — a measure of the weapon's weight and balance in the hand, affecting
  how demanding it is to wield.
- an optional **encumbrance value** — see below.
- one or more **[[Strike_Modes|Strike Modes]]**.

## One Weapon, Many Strike Modes

A single weapon is rarely limited to a single kind of attack. A broadsword can
**cut**, **thrust**, or strike with its **pommel**; a spear can be **thrust** in
melee or **thrown**; a war-axe can **chop** in the hand or be **hurled** across
the field. Each of these distinct ways of attacking is a **strike mode**, and a
weapon carries **one or more** of them.

Every strike mode records its own attack and impact characteristics, and (for
melee) its own defensive options. Because strike modes are a self-contained
concept shared with unarmed and natural attacks, they are documented separately —
see **[[Strike_Modes|Strike Modes]]**.

A weapon is **held by body parts that can grip items** (for a human, the hands).
A strike mode can only be used while the weapon is held, and a mode that needs
more than one body part requires the **same weapon** to be held by each — a bow
drawn for a shot occupies both hands. See **[[Strike_Modes|Strike Modes]]** for
the body-part requirement in full.

## Weapon Encumbrance

A weapon **optionally** has an **encumbrance value**. If it does, that value is
added to the character's encumbrance while the weapon is worn or carried ready for
use — a long weapon slung at the hip hampers movement more than its weight alone
would suggest. A weapon with no encumbrance value contributes only its weight.

# Projectiles

**Projectile gear** is the ammunition that missile weapons consume — arrows for
bows, bolts for crossbows, bullets for slings, darts for the hand. Each projectile
declares a **type** (arrow, bolt, bullet, dart, or other) so that a missile weapon
draws only the ammunition it can actually use.

A projectile carries its own **impact** — the damage it delivers on a hit,
expressed as a number of dice, a die size, a flat modifier, and an
**aspect** (blunt, edged, piercing, or fire). When a missile weapon looses a
projectile, the projectile's impact combines with the weapon's missile strike
mode to determine the blow. Projectiles may also carry traits that change how they
behave — for example, a **broadhead** arrow.

Projectiles are ordinarily tracked in quantity (a bundle of arrows) and are
expended as they are used.

# Armor

**Armor** is protective equipment — mail, plate, leather, padding, shields, a
helmet. Beyond the common gear properties, armor has three defining aspects: how
it is protective, where it covers the body, and how it burdens the wearer.

## Worn or Carried

Armor may be either **worn** or merely **carried**. This distinction matters both
to protection and to encumbrance:

- Only **worn** armor protects. Armor that is carried but not worn (in a pack, on
  a packhorse) offers no protection until it is donned.
- **Worn armor weight does not count against encumbrance.** A suit of armor that
  is being worn rides the body and is not tallied as carried load. The same armor
  **carried but not worn** counts its full weight against encumbrance like any
  other cargo.

## Armor Encumbrance

Armor **optionally** has an **encumbrance value**, separate from its weight. If it
does, that value is added to the character's encumbrance **while the armor is
worn** — representing the stiffness and restriction the armor imposes beyond its
mass. Armor with no encumbrance value burdens the wearer only through the general
weight rules (and, since worn, that weight is excluded from encumbrance).

## Protection

Armor is graded by its resistance to each **aspect** of an attack:

- **Blunt**
- **Edged**
- **Piercing**
- **Fire**

For each aspect, the armor has a number representing the amount of impact it can
**absorb**. When a blow lands, the armor absorbs up to that amount of the incoming
impact for the blow's aspect; any **remaining impact passes through** the armor to
harm the wearer. A piece that is proof against edged blows may be far weaker
against a blunt one, so the same armor protects unevenly depending on how it is
struck.

### Layering

Armor can be **layered** — a gambeson beneath a mail hauberk beneath a surcoat.
Where two or more worn pieces cover the same location, **each layer contributes
its absorption** to the total for that location, so stacked armor protects better
than any single piece alone.

## Coverage

A piece of armor **covers one or more body locations** — a helm protects the
head, greaves the legs, a hauberk the torso and arms, and so on. Only the
locations a piece covers receive its protection.

At each covered location the armor is either **flexible** or **rigid**, and the
two behave differently in play. Rigid armor (plate, a steel cap) turns and
deflects blows in ways supple armor cannot — for example, causing a glancing blow
where flexible armor (mail, leather, padding) would simply absorb what it can. The
same piece may be flexible at some locations and rigid at others.

## Sensory Penalties

Certain armor — **particularly helmets** — can impose **sensory perception
penalties** on the wearer. A closed helm narrows vision and muffles hearing, so
while it protects the head it also hampers the wearer's ability to perceive their
surroundings. Such penalties are a deliberate trade-off against the protection the
piece provides.

# Concoctions

**Concoction gear** covers prepared substances — potions, poisons, medicines,
tinctures, and alchemical preparations. Beyond the common gear properties, a
concoction has:

- a **sub-type** describing its nature:
    - **Mundane** — an ordinary, common preparation, usually simple in
      composition (often a single prepared ingredient).
    - **Exotic** — a complex and valuable preparation with medicinal or other
      special properties, but not magical in nature.
    - **Elixir** — an arcane alchemical concoction of great power.
- a **potency** rating (none, mild, strong, or great), describing how forceful its
  effect is.
- a **strength**, a numeric measure used where a concoction's effect is resolved
  against a value.

Concoctions are typically tracked in quantity and expended when used.
