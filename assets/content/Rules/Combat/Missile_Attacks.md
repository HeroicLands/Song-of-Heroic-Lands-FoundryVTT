---
aliases:
    - Missile Attacks
    - Missile Attack
    - Missile Sequence
    - Ranged Attacks
    - Volley
id: rDBP7stlZ05KJIfE
type: doc
package: sohl
category: rules
name:
    full: Missile Attacks
    aliases: []
folder: rotB8uN12YUN0Oba
shortcode: msslattc
---

# Missile Attacks {#missile-attacks}

A **missile attack** is one delivered across ground the attacker does not cross:
an arrow, a bolt, a sling stone, a hurled axe. It resolves through the ordinary
[[doc/atkreslv#resolving-an-attack|attack sequence]], with three things
particular to it — the weapon must be **ready**, the shot has a **range**, and
the target usually cannot strike back.

Every missile attack is made with a **missile [[doc/strkmds|strike mode]]**. A
weapon may carry melee and missile modes both: a spear thrust in the hand and
thrown are the same object and two different attacks.

## The Missile Sequence {#the-missile-sequence}

1. **Ready the weapon.** A launcher must be spanned or drawn and its projectile
   nocked or seated; a thrown weapon must be in hand. A missile strike mode
   cannot be used until it is ready.
2. **Declare the target and read the range.** Distance to the target settles
   which [[#range|range band]] the shot falls in, and the band settles how
   precisely it can be placed and how hard it lands.
3. **Test.** The attacker makes a
   [[doc/sccsstst#success-test|Success Test]] against the Effective Mastery Level
   of the strike mode's skill — **Archery**, **Throwing** or **Sling**.
4. **The target responds.** See
   [[#defending-against-missiles|Defending Against Missiles]] — the choices are
   narrower than in melee.
5. **Resolve.** A landing shot rolls its [[#impact-at-range|impact]], and
   [[doc/character#determining-hit-location|hit location]] follows from the aim
   and the band's scatter.

## Skills and Weapons {#skills-and-weapons}

Three skills cover missile weapons, and which one applies is a property of the
strike mode, not a choice:

| Skill        | Covers                                                              |
| ------------ | ------------------------------------------------------------------- |
| **Archery**  | Hand-drawn stringed weapons — bows of every construction, crossbows |
| **Throwing** | Anything sent by the arm alone — daggers, axes, javelins, rocks     |
| **Sling**    | Hand slings and staff slings                                        |

A missile strike mode also names the **projectile type** it consumes — arrow,
bolt, bullet, dart — or **none**, when the weapon itself is the missile. Where
ammunition is consumed, the projectile's own impact combines with the strike
mode's: the bow and the arrow each contribute to what arrives.

Two properties of the launcher belong to the weapon rather than the shooter.
**Draw** is the pull the weapon demands, and a bow too heavy to manage is a bow
that cannot be shot well; heavy crossbows are spanned with mechanical aid for
exactly this reason. **Volley multiplier** is how far past its base range the
weapon can throw a lobbed shot — see [[#range|Range]].

**Crossbows are the exception to training.** A crossbow is spanned once and then
aimed like a tool, so an untrained shooter is far less handicapped by it than by
a bow: a character shooting one tests the better of their Archery Mastery Level
or an Effective Mastery Level equal to **three times their Archery
[[doc/mstrylvl#skill-base|Skill Base]]**. Anyone at all can pick one up and hit
something; only an archer improves.

## Range {#range}

Every missile strike mode has a **base range**. Distance measured from the
shooter to the target places the shot in one of three bands:

| Band            | Distance                                                                   | Zone die | Impact |
| --------------- | -------------------------------------------------------------------------- | -------- | ------ |
| **Point blank** | Up to **half** base range                                                  | d6       | **+2** |
| **Direct**      | Beyond half base range, up to **base range**                               | d8       | —      |
| **Volley**      | Beyond base range, out to base range × the strike mode's volley multiplier | —        | —      |

**Point blank** is close enough to place the shot: the scatter tightens and the
missile arrives with its flight barely begun, adding two to impact. **Direct** is
the ordinary aimed shot — flat trajectory, the target in view along the shaft.

**Volley** is a different act altogether. Past its base range a missile must be
_lobbed_, arcing up and falling on the target rather than flying at it, and no
aim survives that. A volleyed shot is not aimed at a body part at all: it is
thrown at a place, and where it comes down is a matter of scatter around that
place. It is how massed archery is used and how a wall is shot over — a
deliberately imprecise instrument, valuable for reaching what cannot otherwise be
reached, and for the fact that a hundred of them landing together does not need
to be precise.

A weapon's volley multiplier is what sets that outer limit: a war bow that
reaches 210 feet directly can put an arrow down four times as far, while a
javelin manages twice its throw.

## Aiming at Distance {#aiming-at-distance}

A direct or point-blank shot may be **aimed** at a body part exactly as a melee
blow is, and hit location resolves the same way — the part supplies the target
zone number and the **band** supplies the zone die. Distance is what costs
precision: `d6` at point blank, `d8` at direct range. Because the zone die always
walks the hit _downward_ from the aim, a shot at range drifts low, and a small
target scatters off the edge of itself more readily than a large one.

Nothing is aimed on a volley. The shot is placed by scatter, and whatever it
finds where it lands is what it hits — which is the risk in shooting over your
own front rank.

## Defending Against Missiles {#defending-against-missiles}

A target who does not know the shot is coming defends not at all: the attack is
resolved unopposed. A target who does may:

- **Block**, if they carry something to block with. A shield is the reason
  shields exist; interposing one against an arrow is its plainest use.
- **Dodge**, if they have room and warning enough to move.
- **Ignore**, and trust to armour.

**Counterstrike is not available** against a shooter out of the defender's own
[[doc/mlattcks#reach-and-engagement|reach]]. You cannot answer an archer at two
hundred feet with a blow; you can only close, and closing is a different turn's
business.

**Deliberate evasion** is a separate matter from dodging one particular shot. A
character who commits to evading — moving unpredictably, using cover and broken
ground, presenting nothing to shoot at — imposes a penalty on **every** missile
attacker equal to **five times their Effective Dodge Index**, taken from a Dodge
Mastery Level already reduced by fatigue, impairment and encumbrance. A heavily
laden, badly winded character is not evading anything, and the rule says so. A
character's Acrobatics improves both their Dodge tests and this penalty.

## Impact at Range {#impact-at-range}

Missile impact is the strike mode's impact plus the projectile's, plus **+2** at
point blank.

**Strength does not add to it.** A bow, a crossbow and a sling all put the force
in the launcher rather than the arm, and a mighty archer's arrows strike no
harder than anyone else's. The
[[doc/strkmds#the-strength-impact-modifier|Strength Impact Modifier]] applies
only to **thrown** weapons, where the arm genuinely is the engine — and even
there it is reduced by one, because a thrown weapon is never driven as well as a
held one.

From there the blow resolves like any other: aspect against the struck location's
protection, effective impact into an injury, and on into
[[doc/atkreslv#from-blow-to-trauma|Trauma]].

## Mishaps {#missile-mishaps}

A missile attack's [[doc/sccsstst#success-level|Critical Failure]] reads by its
units digit:

- **Ending in 0 — Fumble.** The weapon is dropped or nearly so; a Fumble Test
  decides which.
- **Ending in 5 — Misfire.** The shot is spoiled in the loosing. A launcher may
  be damaged in the process — a string parts, a prod cracks, a stave splits —
  while a thrown weapon instead risks the thrower's own footing.

See [[doc/atkreslv#mishaps|Mishaps]] for the keep-control tests both lead to.

## See also {#see-also}

- [[doc/atkreslv|Attack Resolution]] — the exchange in full
- [[doc/strkmds|Strike Modes]] — projectile type, range, draw, volley multiplier
- [[doc/mlattcks|Melee Attacks]] — attacking at contact
- [[doc/gear#weapons|Weapons]] — the missile weapons themselves
