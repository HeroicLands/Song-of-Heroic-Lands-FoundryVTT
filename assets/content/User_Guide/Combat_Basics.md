---
aliases: []
id: dBArbNMvf0tgdZZJ
type: doc
package: sohl
category: user-guide
name:
    full: "Combat Basics"
slug: "combat-basics"
folder: IgwaG8rAUUO9vrtz
---

# Overview

Combat is the heart of Song of Heroic Lands, and also its most detailed
subsystem. A single exchange can involve the attacker choosing a weapon and a
strike mode, the defender choosing among several defenses, both sides rolling,
consulting combat tables, rolling damage, determining where the blow lands,
comparing that to armor, and finally recording an injury. Done entirely by hand,
even a short fight can eat up a lot of table time.

SoHL gives you **two ways to run combat**, and you can freely mix them:

|                           | **Assisted Combat**                                                       | **Automated Combat**                             |
| ------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------ |
| What it does              | Makes the individual **rolls** for you, with all weapon modifiers applied | Runs the whole **exchange** as a guided workflow |
| Opinion                   | None — rolls anytime                                                      | Highly opinionated — drives the sequence         |
| Needs a combat encounter? | No                                                                        | Yes                                              |
| Best for                  | Theatre of the Mind, one-off rolls, edge cases                            | Standard tactical fights                         |

Both modes use the **same underlying rules and the same dice** — they differ
only in how much of the sequence the system drives for you. You are never locked
into one; a fight can start automated and drop to assisted the moment something
unusual comes up, then pick back up.

# Assisted Combat

**Assisted Combat lets you make any single combat roll — attack, block,
counterstrike, dodge, or impact (damage) — with all of the weapon's bonuses and
penalties already applied.** There is no workflow: it simply makes the roll you
ask for and posts the result to chat.

## Why it helps

Rolling a raw Melee skill leaves you to remember and add up every modifier that
applies to a given weapon and strike mode — strength bonuses, one- vs.
two-handed use and its effect on heft, the strike mode's own attack or defense
modifiers, and so on. Assisted Combat does that arithmetic for you, every time,
so a "swing" and a "thrust" of the same sword roll at their correct, different
values without you tracking why. It also gives you the correct **impact
(damage)** roll for that strike mode at the press of a button.

## When to use it

The great strength of Assisted Combat is that it is **unopinionated and
context-free**. You can make an Assisted attack roll:

- whether or not a combat encounter is running,
- whether or not it is your turn,
- even if your character has no token on the scene.

That makes it ideal for **Theatre of the Mind**, for quick "just roll it"
moments, and for any situation where the full Automated Combat workflow would get
in the way. Because there is no context behind an Assisted roll, it can be made
at any time.

## How to use it

Open the character sheet and go to the **Combat** tab. Each weapon (and combat
technique) lists its **strike modes**, and each strike-mode row shows clickable
values:

- **Atk** — roll an attack with this strike mode.
- **Blk** — roll a block with this strike mode.
- **CX** — roll a counterstrike with this strike mode.
- **Impact** — roll this strike mode's damage.

Click a value to roll it; the result posts to chat with the applicable modifiers
shown. (Shift-click to skip the roll dialog and use the defaults.) A value that
does not apply to a strike mode — a mode that cannot block, for instance — is not
shown as clickable.

> **Dodge** is rolled from the **Dodge skill** (a normal skill test), not from a
> weapon's Combat-tab row — dodging is not tied to a particular weapon.

# Automated Combat

Assisted Combat speeds up the _rolls_, but it does not address the real burden:
the **complexity of the exchange** itself. **Automated Combat takes an
opinionated, workflow-driven approach — it runs the whole attack-and-defense
sequence for you**, prompting each participant for the choices only they can
make and resolving all the tables and rules in between.

## What it does

When an attacker begins Automated Combat, the system starts a guided sequence:

1. The **attacker** rolls the attack (with sensible defaults offered from
   context and past choices).
2. The result posts to chat, and **response buttons appear on the defender's
   client** offering their available defenses.
3. The **defender** picks a defense and rolls it.
4. The system **resolves the exchange** — comparing attack and defense on the
   combat tables to decide who lands a blow and by how much (the victory
   margin), including any Tactical Advantages earned.
5. If a blow connects, **impact is rolled**, the **hit location** is determined,
   the target's **armor** at that location is applied, and the resulting
   **injury is entered automatically** on the target's sheet.

Each stage outputs to the chat log, and prompts guide the players through the
decisions along the way.

## What it needs

Automated Combat is **opinionated on purpose**, and it relies on the combat
encounter to know who is acting. To start an automated attack:

- A **combat encounter must be running** (the combat tracker), and **both the
  attacker and the target must be combatants in it**.
- Both need **tokens on the scene** (targeting and range use them).
- It is generally the **current combatant's** turn to attack.
- The attacker must not be incapacitated, defeated, or dead; the target must not
  be dead. If an invariant is violated, the attempt is refused with a message
  explaining why.

If you don't have (or don't want) a full encounter set up, use **Assisted
Combat** instead.

## How to use it

1. **Set up the encounter.** Place tokens for the combatants and add them to the
   combat tracker (see [Scene Setup](Scene_Setup.md)).
2. **On the attacker's turn, target the opponent** (target their token) and
   start the weapon's automated attack.
3. **Answer the prompts** — choose the strike mode and any situational
   modifiers; defaults are pre-filled.
4. **The defender responds** using the buttons that appear on their client,
   choosing one of the defenses below.
5. **Read the results in chat.** Impact, hit location, armor, and injury are
   handled for you; the injury lands on the target sheet.

## The defenses

When attacked in Automated Combat, the defender chooses one:

- **Block** — parry with a weapon or shield. On a win (or tie), the attack is
  stopped.
- **Counterstrike** — defend _and_ strike back at once. Both blows may land: you
  can stop the attack and hit the attacker on the same exchange, at the risk of
  taking the hit if you lose.
- **Dodge** — get out of the way (a Dodge-skill roll). Avoids the blow when you
  clearly beat the attack.
- **Ignore** — take no defensive action; the attack simply resolves against you.
  An incapacitated defender is limited to Ignore.

# Blending the two modes

Nothing requires you to stay in one mode. A common pattern:

> You start in **Automated Combat**. The attacker attacks, the defender chooses a
> **counterstrike**, and wins — earning a **Tactical Advantage**. The automated
> workflow doesn't yet fold Tactical Advantages into its calculations, so at that
> point you switch to **Assisted Combat** to make the extra strike the advantage
> grants, then continue in Assisted Combat to finish out the original exchange.

Because both modes share the same rules and rolls, moving between them mid-fight
is seamless: Automated Combat for the common case, Assisted Combat whenever a
special rule, a house rule, or an unusual circumstance falls outside the
workflow.

# How a hit is resolved (shared by both modes)

Under the hood, both modes resolve an exchange the same way:

- Each roll is a **d100 roll-under** against the effective mastery level,
  producing a **success level** (how far above or below the mark) and possibly a
  **critical** success or failure.
- An attack and its defense form an **opposed test**: the outcome is decided by
  the **victory score** — the difference between the attacker's and the
  defender's success levels. The less-bad of two failures can still "win" the
  exchange.
- A decisive exchange (a victory score of 2 or more either way) awards **Tactical
  Advantages** to the winner, which can be spent on follow-up actions.
- "Landing a blow" means the blow **connected** — it may still be fully absorbed
  by armor when impact is resolved, so a connected hit does not automatically
  mean damage.

# Hit location: aimed vs. unaimed strikes

When an attack lands, the system determines which body part is struck. This
works differently depending on whether the attacker aimed at a specific part.

## Unaimed strikes

An unaimed strike selects the hit location randomly, weighted by each body
part's probability weight. Larger or more exposed parts (like the thorax) are
struck more often than smaller ones (like the head). No accuracy value is
involved.

## Aimed strikes

An aimed strike targets a specific body part and uses the attacker's
**accuracy** to determine whether the strike lands where intended or drifts to a
neighboring part:

1. If accuracy is less than or equal to the target part's probability weight, the
   aimed part is always hit.
2. Otherwise, a random number from 1 to accuracy is rolled. If the roll is within
   the part's probability weight, that part is hit.
3. On a miss, the accuracy is reduced by the part's probability weight, and the
   strike drifts to a random adjacent body part (weighted by probability). The
   check repeats from step 1 with the new part and reduced accuracy.
4. If there are no more adjacent parts to drift to, the current part is hit.

High accuracy relative to the target makes aimed strikes reliable; low accuracy
causes the strike to wander along the body's adjacency graph. Aiming at a small,
hard-to-hit part with insufficient accuracy will often hit a neighbor instead.

# Impact, armor, and injury

Once a blow connects and a location is chosen:

- **Impact (damage) is rolled** for the strike mode, by damage **aspect** (blunt,
  edged, piercing, etc.).
- The location's **effective protection** — its natural protection plus any worn
  armor covering it — is subtracted from the impact.
- The remaining effective impact maps to an **injury level** (from a light M1 up
  through the grievous G-levels), and the system derives the **Shock Index**,
  whether it was a glancing blow, any stumble/fumble, and whether **bleeding** or
  **amputation** results.
- In Automated Combat the injury is recorded on the target sheet for you; you can
  also produce the same injury by hand via the **Add Injury** flow (see
  [Afflictions & Injuries](Afflictions_Injuries.md)).

# Tips

- **Reach for Assisted Combat by default outside a set-piece fight** — it needs
  no setup and works anywhere.
- **Use Automated Combat for standard tactical encounters** where the workflow
  saves the most time.
- **Don't fight the workflow.** When a Tactical Advantage, special rule, or house
  rule falls outside Automated Combat, switch to Assisted Combat rather than
  forcing it.
- **Keep both combatants' sheets handy** when you're learning the flow, and apply
  results as they post to avoid drift.
- **Name weapons and strike modes clearly** so the right one is easy to pick.

# See also

- [Skill Tests](Skill_Tests.md) — the d100 roll-under test that underlies every
  combat roll.
- [Working with Gear](Working_with_Gear.md) — equipping weapons, armor, and
  shields.
- [Afflictions & Injuries](Afflictions_Injuries.md) — recording and healing the
  injuries combat produces.
- [Fate System](Fate_System.md) — spending fate to re-roll.
