---
aliases: []
id: Mi1p8gYEKJ91dxsM
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

> 🧭 **Guided tour.** For a hands-on walkthrough of everything above — arming a
> character, the two-handed/bow arm rule, rolling ATK/BLK/CX, and turning a hit
> into an injury — run the **SoHL: Assisted Combat** tour from
> **Settings → Tour Management**. It is single-actor and needs no token, scene, or
> encounter, and it makes clear that the system rolls but leaves the win/loss
> ruling to you and the rulebook.

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
- **Only the current combatant may start an automated attack.** Automated Combat
  runs off the initiative order: the attacker must be the combatant whose turn it
  is, and no one else can open an automated attack out of turn.
- A **target** must be selected, and the attacker must not be incapacitated,
  defeated, or dead; the target must not be dead. If one of these invariants is
  violated, the attempt is refused with a message explaining why.

The one thing that acts _outside_ the current combatant's turn is a **defensive
response**: when you are attacked, your **counterstrike** strikes back within the
attacker's exchange, and a **Tactical Advantage** you earn can buy a follow-up
strike (see [Blending the two modes](#blending-the-two-modes)). Starting a fresh
automated attack, though, always waits for your turn.

If you don't have (or don't want) a full encounter set up, use **Assisted
Combat** instead.

## How to use it

1. **Set up the encounter.** Place tokens for the combatants and add them to the
   combat tracker (see [Scene Setup](Scene_Setup.md)).
2. **On the attacker's turn, target the opponent** (target their token), then
   **right-click the attacker's row in the combat tracker** and choose
   **Automated Combat**.
3. **Answer the attack dialog** — set the aim and any situational modifier;
   defaults are pre-filled.
4. **The defender responds** using the buttons that appear on their client,
   choosing one of the defenses below.
5. **Read the results in chat.** Impact, hit location, armor, and injury are
   handled for you; the injury lands on the target sheet.

Every automated action lives on the **combatant** — the tracker row, not the
character sheet. See [[Combatant]] for the per-action reference: what each one
asks for, when it refuses, and which are offered only as chat-card buttons.

## The attack dialog

Starting an automated attack opens a small dialog with two fields:

- **Aim** — the body part you are striking at, listed from the defender's own
  body. What you pick matters when the blow lands: an aimed strike hits that part
  when your accuracy is good enough, and otherwise drifts outward to a neighbour
  (see [Hit location: aimed vs. unaimed strikes](#hit-location-aimed-vs-unaimed-strikes)).
- **Additional Modifier** — a whole-number bonus or penalty for the circumstances
  (cover, footing, a called shot's difficulty, a house rule). Leave it at `0`
  when nothing applies; type a negative number for a penalty.

Press OK to roll the attack, or dismiss the dialog to call the whole thing off —
nothing is rolled and nothing is posted.

The weapon and strike mode are not asked for here: the system offers only the
strike modes that can actually reach the target, and defaults to the one this
combatant last attacked with in this fight, falling back to the best chance
available.

## The attack card

The attack roll posts a card spoken by the attacker, titled with the strike mode
(e.g. "Broadsword Melee Attack") and reading "_attacker_ vs. _defender_". It shows
the parameters of the attack so every player can check them:

- **Aim** — the body part being struck at.
- **Aspect** — the damage aspect the strike mode delivers (blunt, edged,
  piercing, …).
- **AML** — the attacker's effective Attack Mastery Level, after every modifier.

Below the card body sit the **defense buttons** — Dodge, Counterstrike, Block,
and Ignore. They are addressed to the **defender**, so they only appear on the
defending player's screen (and the GM's), and only the defenses that character can
actually use are shown. Nothing resolves until the defender presses one.

## The result card

Pressing a defense resolves the exchange and posts a result card:

- **Adjustment tables** — every modifier that went into the attacker's roll, and
  the defender's too when they contested (Block or Dodge).
- **Attack / Defend columns** — the weapon and defense used, each side's effective
  mastery level (Eff. AML and Eff. DML), the roll, and the success level, coloured
  by success or failure.
- **Success Stars** — the victory margin as stars; "None" on a tie.
- **The outcome** — "_attacker_ strikes!" or "Attack misses.", plus any Tactical
  Advantages earned, whether a weapon broke, and whether either side must make a
  **Fumble** or **Stumble** test.
- **Attack Impact** — the impact (damage) formula, when a blow connected.
- **Calculate _name_ Injury** — a button for each side that landed a blow. It opens
  the injury resolution for that character; an aimed blow carries its hit location
  through, an unaimed one asks where it landed.

A **counterstrike** posts **two** of these cards — one for the original attack and
one for the strike back — because both blows can land in the same exchange.

## The defenses

When attacked in Automated Combat, the defender chooses one. These four are
offered **only as buttons on the attack card**, on the defending player's screen —
they are not in the combatant's Actions context menu, because a defense only makes
sense as the answer to a particular attack. Each is filtered to what that
character can actually do (no Dodge skill, no Dodge button), and an incapacitated
defender is limited to Ignore.

- **Block** — parry with a weapon or shield. On a win (or tie), the attack is
  stopped. Blocking asks which strike mode to parry with, pre-selecting the one
  you blocked with last in this fight (otherwise your best chance), plus an
  **Additional Modifier** field for the circumstances.
- **Counterstrike** — defend _and_ strike back at once. Both blows may land: you
  can stop the attack and hit the attacker on the same exchange, at the risk of
  taking the hit if you lose. It asks for an aim and a modifier just like an
  attack, offering only melee strike modes that can counterstrike and that reach
  the attacker.
- **Dodge** — get out of the way (a Dodge-skill roll). Avoids the blow when you
  clearly beat the attack. Nothing is asked; the roll is made when you press the
  button.
- **Ignore** — take no defensive action; the attack simply resolves against you.
  An incapacitated defender is limited to Ignore.

See [[Combatant]] for the full entry on each of these responses.

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
   strike drifts to a random neighboring body part (weighted by probability) —
   the other parts of the same body zone first, then outward to the adjoining
   zones. The check repeats from step 1 with the new part and reduced accuracy.
4. If there are no unvisited neighbors left to drift to, the current part is hit.

High accuracy relative to the target makes aimed strikes reliable; low accuracy
causes the strike to wander outward through the body's zones. Aiming at a small,
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

- [[Combatant]] — the combat-tracker row and its actions: starting an automated
  attack, answering one, and moving a combatant between groups.
- [Skill Tests](Skill_Tests.md) — the d100 roll-under test that underlies every
  combat roll.
- [Working with Gear](Working_with_Gear.md) — equipping weapons, armor, and
  shields.
- [Afflictions & Injuries](Afflictions_Injuries.md) — recording and healing the
  injuries combat produces.
- [Fate System](Fate_System.md) — spending fate to re-roll.
