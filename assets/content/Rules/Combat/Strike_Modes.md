---
aliases:
    - Strike Modes
    - Strike Mode
    - Melee Strike Mode
    - Missile Strike Mode
    - Attack Mode
    - Attack Modes
id: ixrwbYUvFCsmEkO9
type: doc
package: sohl
category: rules
name:
    full: Strike Modes
    aliases: []
folder: rotB8uN12YUN0Oba
shortcode: strkmds
---

A **strike mode** is a specific way an attack can be delivered. It bundles
together everything needed to resolve one kind of blow — which skill
governs it, how the attack is rolled, how much impact it inflicts and of what
aspect, and (for close combat) how it can defend. Strike modes are the common
language of every attack, whether it comes from a wielded weapon or from a
character's own trained technique.

# Strike Modes {#strike-modes}

A strike mode represents a **particular way of using a weapon or combat
technique**. A single instrument of attack rarely does just one thing: a sword can
**slash** (edged), **pierce** with the point (piercing), or strike with its
**pommel** (blunt) — three separate ways of attacking, and so three separate
strike modes on the same weapon. A spear can be **Thrust** in the hand or
**Thrown**; a war-axe can **Chop** in melee or be **Hurled** as a missile. A
**[[doc/gear|weapon]]** therefore carries **one or more** strike modes, and the
wielder chooses which mode to use for a given attack.

Each mode is a distinct attack with its **own properties** — a different
**aspect**, a different **impact**, and a different number of **required body
parts** (a pommel strike and a two-handed thrust do not demand the same grip).
Choosing a strike mode is choosing which of a weapon's attacks to make.

Strike modes are not exclusive to gear. **Combat techniques** — a character's
trained unarmed and natural attacks (a punch, a kick, a bite, a claw) — are
expressed through strike modes as well, using exactly the same structure. That is
why strike modes are documented here as an independent concept rather than buried
inside weapons. The techniques themselves, and the manoeuvres that inflict no
damage at all, are covered in [[doc/unrmdcmb|Unarmed Combat]].

How a strike mode is then used to resolve an attack — the contest, the defences,
the margin, and what a landed blow does — is
[[doc/atkreslv|Attack Resolution]].

## Common Properties {#common-properties}

Every strike mode, whatever its type, records:

- **Name** — the label for this mode of attack ("Cut", "Thrust", "Shoot").
- **Associated skill** — the skill whose
  [[doc/mstrylvl#mastery-level|Mastery Level]] governs attacks made with
  this mode.
- **Minimum body parts** — the number of body parts required to wield the weapon
  in this mode. A weapon is **held by body parts that can grip items** (for a
  human, the hands), and a strike mode is usable only while the weapon is actually
  held. When a mode needs **more than one** body part, the **same weapon** must be
  held by each of them: shooting a bow requires two body parts, so a human must
  hold the bow in **both** hands. If **fewer than the required number of body
  parts are available** to hold the weapon — a hand is maimed, occupied, or
  missing — the strike mode **cannot be used** at all.
- **Attack modifier** — an adjustment to the attacker's Mastery Level when
  attacking with this mode.
- **Impact** — the damage the blow inflicts, expressed as a number of dice, a die
  size, and a flat modifier, together with its **aspect** (blunt, edged,
  piercing, or fire).
- **Spread** — how precisely the mode can be aimed at a specific body location.

A strike mode may also be flagged so that it cannot attack at all — some modes
exist only to enable a weapon's defensive use.

## The Strength Impact Modifier {#the-strength-impact-modifier}

A strong combatant drives a weapon harder than a weak one. Every melee blow —
and every thrown weapon — has its impact adjusted by the attacker's **Strength**:

| Strength | Modifier                       |
| -------- | ------------------------------ |
| 10–11    | none — the unremarkable middle |
| 12–13    | +1                             |
| 14–15    | +2                             |
| 16–17    | +3                             |
| 18–19    | +4                             |

The pattern continues in both directions: **one point of impact for every two
points of Strength**, without limit, so a giant's blow lands far heavier than
the table's printed end. Below average it falls the same way — 8–9 is −1, 6–7 is
−2 — and then more steeply still: a combatant of Strength 4 or less can barely
drive a weapon at all, and loses **two** points of impact for every point of
Strength below 5, down to −10 at Strength 1.

**This applies to melee attacks and thrown weapons only.** A bow, a crossbow or
a sling gets no benefit whatever: the force is in the launcher, not the arm, and
a mighty archer's arrows strike no harder than anyone else's. A few weapons are
flagged to take no Strength modifier at all, and those never receive it.

Two reductions apply on top, and they stack:

- **Off-hand** — reduce the modifier by **1** when the weapon is held only in
  the non-favored hand. See [[doc/bdystrct#dominance|Dominance]].
- **Thrown** — reduce the modifier by **1** when the weapon is thrown.

## Melee and Missile {#melee-and-missile}

Strike modes come in two types — **melee** and **missile** — and a single weapon
may carry **both**. A thrown spear has a melee **Thrust** and a missile **Throw**;
a **bow** shoots arrows through a missile mode but can also be swung in melee as a
sort of fragile club through a (poor) melee mode. Which types a weapon offers, and
how many of each, is simply a matter of which strike modes it carries.

### Melee Strike Modes {#melee-strike-modes}

A **melee** strike mode is a close-combat attack. In addition to the common
properties, it has:

- **Reach** — the effective engagement range of the attack, seeded from the
  weapon's length and extended by the wielder's own bodily reach.
- **Defense** — the defensive options this mode provides:
    - **Block** — using the weapon to parry an incoming attack.
    - **Counterstrike** — defending by striking back, a defense that is itself an
      attack.

    Either defense can be individually disabled — a weapon that cannot block, or a
    mode with no counterstrike.

### Missile Strike Modes {#missile-strike-modes}

A **missile** strike mode is a ranged attack. In addition to the common
properties, it has:

- **Projectile type** — the ammunition it consumes (arrow, bolt, bullet, dart),
  or **none** when the weapon itself is the missile (a thrown spear or axe). A
  weapon that fires ammunition draws matching **[[doc/prjctl|projectiles]]**, and the
  projectile's impact combines with the strike mode's to determine the blow.
- **Range** — the base distance of a direct shot, and the measure the
  [[doc/msslattc#range|range bands]] are read against.
- **Draw** — the pull the weapon demands of whoever shoots it. A bow too heavy
  to manage is a bow that cannot be shot well; heavy crossbows are spanned with
  mechanical aid for exactly that reason.
- **Volley multiplier** — how far past its base range the mode can put a
  **lobbed** shot, as a multiple of that range. A war bow reaching 210 feet
  directly volleys four times as far; a javelin manages twice its throw.

## Choosing a Strike Mode {#choosing-a-strike-mode}

Because a weapon may offer several strike modes — and some are melee while others
are missile — choosing the right mode is part of using the weapon well. A thrown
spear and a couched spear are the same item but very different attacks; a
broadsword's thrust reaches a piercing-armored foe differently than its cut. The
strike mode is where those differences live.
