---
shortcode: strkmds
name: {full: Strike Modes, aliases: []}
type: doc
subType: rules
data: {packFolder: rulescombat}
---

A **strike mode** is a specific way an attack can be delivered. It bundles together everything needed to resolve one kind of blow — which skill governs it, how the attack is rolled, how much impact it inflicts and of what aspect, and (for close combat) how it can defend. Strike modes are the common language of every attack, whether it comes from a wielded weapon or from a character's own trained technique.

# Strike Modes {#strike-modes}

A strike mode represents a **particular way of using a weapon or combat technique**. A single instrument of attack rarely does just one thing: a sword can **slash** (edged), **pierce** with the point (piercing), or strike with its **pommel** (blunt) — three separate ways of attacking, and so three separate strike modes on the same weapon. A spear can be **Thrust** in the hand or **Thrown**; a war-axe can **Chop** in melee or be **Hurled** as a missile. A **[[doc-gearrules#weapons|weapon]]** therefore carries **one or more** strike modes, and the wielder chooses which mode to use for a given attack.

Each mode is a distinct attack with its **own properties** — a different **aspect**, a different **impact**, and a different number of **required body parts** (a pommel strike and a two-handed thrust do not demand the same grip). Choosing a strike mode is choosing which of a weapon's attacks to make.

Strike modes are not exclusive to gear. **Combat techniques** — a character's trained unarmed and natural attacks (a punch, a kick, a bite, a claw) — are expressed through strike modes as well, using exactly the same structure. That is why strike modes are documented here as an independent concept rather than buried inside weapons. The techniques themselves, and the manoeuvres that inflict no damage at all, are covered in [[doc-unrmdcmb|Unarmed Combat]].

How a strike mode is then used to resolve an attack — the contest, the defences, the margin, and what a landed blow does — is [[doc-atkreslv|Attack Resolution]].

## Common Properties {#common-properties}

Every strike mode, whatever its type, records:

- **Name** — the label for this mode of attack ("Cut", "Thrust", "Shoot").
- **Associated skill** — the skill whose [[doc-mstrylvl#mastery-level|Mastery Level]] governs attacks made with this mode.
- **Minimum body parts** — the number of body parts required to wield the weapon in this mode. A weapon is **held by body parts that can grip items** (for a human, the hands), and a strike mode is usable only while the weapon is actually held. When a mode needs **more than one** body part, the **same weapon** must be held by each of them: shooting a bow requires two body parts, so a human must hold the bow in **both** hands. If **fewer than the required number of body parts are available** to hold the weapon — a hand is maimed, occupied, or missing — the strike mode **cannot be used** at all.
- **Attack modifier** — an adjustment to the attacker's Mastery Level when attacking with this mode.
- **Impact** — the damage the blow inflicts, expressed as a number of dice, a die size, and a flat modifier, together with its **aspect** (blunt, edged, piercing, or fire).
- **Spread** — how precisely the mode can be aimed at a specific body location.

A strike mode may also be flagged so that it cannot attack at all — some modes exist only to enable a weapon's defensive use.

## The Strength Impact Modifier {#the-strength-impact-modifier}

A strong combatant drives a weapon harder than a weak one. Every melee blow — and every thrown weapon — has its impact adjusted by the attacker's **Strength**:

| Strength | Modifier                       |
| -------- | ------------------------------ |
| 10–11    | none — the unremarkable middle |
| 12–13    | +1                             |
| 14–15    | +2                             |
| 16–17    | +3                             |
| 18–19    | +4                             |

The pattern continues in both directions: **one point of impact for every two points of Strength**, without limit, so a giant's blow lands far heavier than the table's printed end. Below average it falls the same way — 8–9 is −1, 6–7 is −2 — and then more steeply still: a combatant of Strength 4 or less can barely drive a weapon at all, and loses **two** points of impact for every point of Strength below 5, down to −10 at Strength 1.

**This applies to melee attacks and thrown weapons only.** A bow, a crossbow or a sling gets no benefit whatever: the force is in the launcher, not the arm, and a mighty archer's arrows strike no harder than anyone else's. A few weapons are flagged to take no Strength modifier at all, and those never receive it.

Two reductions apply on top, and they stack:

- **Off-hand** — reduce the modifier by **1** when the weapon is held only in the non-favored hand. See [[doc-character#dominance|Dominance]].
- **Thrown** — reduce the modifier by **1** when the weapon is thrown.

## The Impact Tactical Advantage Value {#the-impact-tactical-advantage-value}

A combatant who wins an exchange decisively earns [[doc-atkreslv#tactical-advantages|Tactical Advantages]], and one spent on **Impact** puts extra force behind the blow. How much force depends on what is striking:

> **Impact bonus = (Tactical Advantages spent on Impact) × (the mode's Impact TA value)**

The value belongs to the **aspect**, not to the weapon:

| Aspect   | Each Impact TA is worth |
| -------- | ----------------------- |
| Blunt    | 3                       |
| Edged    | 5                       |
| Piercing | 4                       |
| Fire     | 2                       |

A blunt attack with two Tactical Advantages, both spent on Impact, adds `2 × 3` = **+6**.

Some strike modes **state a value of their own**, and that value **replaces** the aspect's rather than adding to it. A cut listed at 6 is worth 6 per Tactical Advantage instead of edged's 5. This is the knob a creature whose whole method is seizing and crushing is tuned with, so a leviathan's tentacle is worth more per advantage than a brawler's fist.

**Spending a Tactical Advantage is your decision, and it is made aloud.** Say how many of yours go on Impact before the blow is worked out; until you say so, none of them do. A referee may grant an advantage for a circumstance no rule here enumerates, and three of the four kinds are settled between the two of you rather than by arithmetic.

## Melee and Missile {#melee-and-missile}

Strike modes come in two types — **melee** and **missile** — and a single weapon may carry **both**. A thrown spear has a melee **Thrust** and a missile **Throw**; a **bow** shoots arrows through a missile mode but can also be swung in melee as a sort of fragile club through a (poor) melee mode. Which types a weapon offers, and how many of each, is simply a matter of which strike modes it carries.

### Melee Strike Modes {#melee-strike-modes}

A **melee** strike mode is a close-combat attack. In addition to the common properties, it has:

- **Reach** — the effective engagement range of the attack, seeded from the weapon's length and extended by the wielder's own bodily reach.
- **Defense** — the defensive options this mode provides:
  - **Block** — using the weapon to parry an incoming attack.
  - **Counterstrike** — defending by striking back, a defense that is itself an attack.

  Each carries **its own modifier**, applied to the defender's Mastery Level when
  the mode is used for that defence. They are properties of the mode rather than
  of the weapon, so a flail blocks worse than a broadsword and a mode's thrust
  and swing can defend differently. Either defense can also be individually
  disabled — a weapon that cannot block, or a mode with no counterstrike.

#### Shield Mod {#shield-mod}

A **shield** carries one further property, and it is the reason a shield is worth both the weight and the hand it costs: a **Shield Mod**, which assists its wielder rather than the shield's own strike mode.

| Shield          | Shield Mod |
| --------------- | ---------- |
| Buckler         | +5         |
| Roundshield     | +10        |
| Knight's Shield | +10        |
| Kite Shield     | +15        |
| Tower Shield    | +20        |

Three things follow from it being the wielder's bonus:

- **It assists every block, not only the shield's own.** A fighter with a shield on one arm adds its Shield Mod to a block made with the sword in the other. A tower shield is +20 to _every_ block its bearer makes.
- **It assists [[doc-skills|Dodge]] and it assists a [[doc-unrmdcmb|Press]].** Neither belongs to the shield: dodging is the fighter's own skill, and a press is a shove. A raised shield helps both.
- **It must be in hand.** A shield slung on the back or stowed in a pack grants nothing at all.

Two shields grant the **better** of their mods, never the sum — a second shield adds nothing but weight.

### Missile Strike Modes {#missile-strike-modes}

A **missile** strike mode is a ranged attack. In addition to the common properties, it has:

- **Projectile type** — the ammunition it consumes (arrow, bolt, bullet, dart), or **none** when the weapon itself is the missile (a thrown spear or axe). A weapon that fires ammunition draws matching **[[doc-projectilegearug|projectiles]]**, and the projectile's impact combines with the strike mode's to determine the blow.
- **Range** — the base distance of a direct shot, and the measure the [[doc-msslattc#range|range bands]] are read against.
- **Draw** — the pull the weapon demands of whoever shoots it. A bow too heavy to manage is a bow that cannot be shot well; heavy crossbows are spanned with mechanical aid for exactly that reason.
- **Volley multiplier** — how far past its base range the mode can put a **lobbed** shot, as a multiple of that range. A war bow reaching 210 feet directly volleys four times as far; a javelin manages twice its throw.

## The Limb a Technique Needs {#the-limb-a-technique-needs}

A weapon's strike mode is available when enough limbs are gripping the weapon. A combat technique carries no weapon, so what it needs instead is **a limb of the right kind, free to perform it**.

For the three techniques a hand performs — a [[doc-skills#skill-descriptions|Grab]], a [[doc-skills#skill-descriptions|Punch]] and a [[doc-unrmdcmb#limb-block|Limb Block]] — that means **one hand with nothing in it**. One is enough: a fighter with a sword in the right hand still has a left hand to grab with. A shield on that arm, or a weapon that wants both, leaves nothing to perform the technique with, and the technique is unavailable until something is sheathed, dropped, or taken. A hand held fast is no use either, though it keeps whatever it was holding.

The techniques no hand performs are unaffected. A [[doc-unrmdcmb#the-strength-trial|Press]] drives with the body, a Trip sweeps with a leg, a Bite and a Headbutt need no hands at all — so a fighter with a dagger in each fist may still do any of them.

**The same requirement settles which creatures have these techniques.** Most creatures have a limb for fine work and intentional force, but very few have one that can grip: a wolf takes hold of things with its jaws, and jaws are not a hand. So a grab, a punch and a limb block belong to creatures with hands, while every creature keeps the techniques its own anatomy performs.

## Choosing a Strike Mode {#choosing-a-strike-mode}

Because a weapon may offer several strike modes — and some are melee while others are missile — choosing the right mode is part of using the weapon well. A thrown spear and a couched spear are the same item but very different attacks; a broadsword's thrust reaches a piercing-armored foe differently than its cut. The strike mode is where those differences live.
