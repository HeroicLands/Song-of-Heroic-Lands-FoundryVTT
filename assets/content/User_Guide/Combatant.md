---
aliases:
  - Combatant
  - Combatants
id: ORi4BIBMecFVaG4I
type: doc
subType: user-guide
name:
  full: "Combatant"
shortcode: cmbtntug
folder: IgwaG8rAUUO9vrtz
---

A **Combatant** is a character's entry in the **combat tracker** — the row that appears when you add a token to an encounter. It is not a sheet you fill in and keep; it lives only as long as the encounter does, and it holds what the fight needs to know about that character: which combat **group** it belongs to, the **computed move** shown on its row, whether it has acted this turn, and the strike modes it last attacked and blocked with (so those default sensibly next time within the same fight).

Because it is the encounter's record of a character, the Combatant is also where **Automated Combat** actions live: starting an automated attack, answering one as the defender, and moving a combatant between groups. You will not find these on the character sheet — they are on the tracker row and on the chat cards the exchange produces.

> ⚗️ **Automated Combat is still being finished.** It is deliberately outside the frozen feature set for the Being-centric beta, so expect rough edges. The actions below are documented as they exist; [[doc-cmbtbscsug|Assisted Combat]] is the supported path for play in the meantime.

# Combat groups {#combat-groups}

A **combat group** is a named side in a fight — _the Watch_, _Bandits_, the default _Opponents_. Every combatant in an encounter belongs to exactly one, and the group is the answer to the only question the system cannot work out on its own: **who is fighting whom.**

It has to be recorded per encounter, because it is not a fact about the character. The same caravan guard is an ally on the road and an enemy in the tavern brawl a week later; nothing on their sheet could say which. So allegiance lives on the combatant — the encounter's record of that character — and vanishes with the encounter.

The rule is deliberately simple, and there is only one:

> **Two combatants in _different_ groups are enemies. Two in the _same_ group are allies.**

There is nothing else to configure — no allegiance matrix, no degrees of friendliness, no neutral parties. A combatant that somehow has no group at all is treated as everyone's enemy, so an unassigned token is never quietly taken for a friend.

**What that gives you.** Knowing the sides is what lets the system answer questions about a fight rather than just record dice: who is standing with this character, and — the one that matters in play — **who is currently threatening them**. A combatant threatens another when it is an enemy who is still in the fight (not defeated, not unconscious, stunned, restrained, paralyzed, or frozen), is not hidden, and is close enough to reach them with a melee weapon. That is the foundation the engagement rules — being outnumbered, being pinned in melee — are built on.

> ⚗️ **Being built.** The system computes the sides, the ally list, and the threat list correctly today, and the group name is shown on the tracker. But no rule _consumes_ that yet: nothing is currently modified by being outnumbered or engaged. Groups still matter for keeping a fight legible — and for macros and modules, which can query all of it now.

**Where the group comes from.** A combatant joins a group automatically when it enters the encounter, taking the name from its character's **Default Combat Group** (on the Combat tab of the character sheet, GM-only); when that is blank it joins **Opponents**. Matching is case-insensitive, so _bandits_ and _Bandits_ are one group, and a group is created the first time someone needs it. To change it afterwards — a mid-fight betrayal, or just cleaning up after a messy setup — use [[#move-to-group|Move to Group…]].

**What groups do _not_ do.** They do not affect turn order: the tracker sorts by individual initiative, and a group is never moved or rolled as a block. They do not restrict targeting either — nothing stops you attacking someone in your own group, deliberately or by accident. And a group has no leader; if you want a body of troops that acts as one, that is a [[doc-cohortug|Cohort]], not a combat group.

# The combatant row

Each row in the combat tracker is one Combatant. SoHL adds two labels to it:

- **The group chip** — the name of the [[#combat-groups|combat group]] this combatant belongs to (e.g. _Opponents_), shown next to the token name. It tells you at a glance which side this row is on.
- **The move chip** — the combatant's **computed move** in feet per round, shown next to its initiative. It is derived from the character, so it already accounts for their condition and encumbrance.

Two more settings live on the combatant's own configuration sheet (open it from the tracker row's **Update Combatant** control):

- **Move Factor** — a situational multiplier on the computed move for running, sprinting, difficult terrain, and the like. `1` is normal; `0.5` halves the displayed move; `2` doubles it.
- **Tracker Medium** — which kind of movement the row's move chip reports: _Terrestrial_ (the default), _Aquatic_, _Aerial_, _Burrowing_, _Astral_, or _None_. Use it when a fight moves into water or the air, so the tracker shows the speed that matters.

A combatant is placed in a group automatically when it joins the encounter — see [[#combat-groups|Combat groups]] for how that is decided and what it is for.

# Where a combatant's actions live

**Right-click a combatant's row in the combat tracker.** The context menu lists the actions available on that combatant. You only see entries on rows you own (a GM owns every row), and each action can hide itself further — **Move to Group…**, for example, is offered to the GM only.

Two things are deliberately _not_ in this menu:

- **The shared document actions** (Edit, Delete, and the rest described on [[doc-baseitemug|the Base Item page]]) are left out, because the tracker already has its own controls for updating and removing a combatant.
- **The defense responses** (Block, Dodge, Counterstrike, Ignore). They are **hidden actions**: they never appear in the context menu, because they only make sense as an answer to a specific attack. They arrive as **buttons on the attack card** in chat, on the defending player's screen — see [[#answering-an-attack|Answering an attack]].

# Automated Combat

|                |                                                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**       | Automated Combat                                                                                                                                                |
| **Shortcode**  | `automatedCombatStart`                                                                                                                                          |
| **Icon**       | Crossed swords (`ginf-crossed-swords`)                                                                                                                          |
| **Invoked by** | The **Actions context menu** on the combatant's tracker row                                                                                                     |
| **API**        | [`SohlCombatantLogic.startAutomatedAttack`](https://www.heroiclands.org/sohl/api/classes/sohl.document.combatant.logic.SohlCombatantLogic#startautomatedattack) |

**What it does.** This is the **single entry point** for an automated attack — the workflow-driven exchange described under [[doc-cmbtbscsug|Automated Combat in Combat Basics]]. Reach for it when you want the system to run the whole attack-and-defense sequence: your attack roll, the defender's answer, the comparison on the combat tables, and — if the blow lands — impact, hit location, armor, and the injury.

**How to use it.** Target the opponent's token, then right-click **your** combatant's row in the tracker and choose **Automated Combat**.

**What it asks for.** It opens the automated-combat **attack dialog** (Strike Mode, Aim, and an additional modifier). Those fields, and every card the exchange posts, are described in one place — see [[doc-cmbtbscsug|the Automated Combat section of Combat Basics]].

**What happens.** Once you confirm the dialog, the system:

- attacks with the **strike mode you picked**, offered from the weapons and combat techniques that can actually reach — melee modes whose reach covers the distance to the target, missile modes within their base range (a point-blank missile shot also gains its close-range impact bonus);
- **rolls your attack** then and there, so the attack is rolled by the attacker rather than by whoever answers it;
- **remembers the strike mode** you used, so it is the default the next time this combatant attacks in this fight;
- **posts the attack card** to chat, showing your aim, the damage aspect, and your effective Attack Mastery Level, with the defense buttons addressed to the defender.

**When it refuses.** The action checks the combat invariants first and explains itself rather than half-starting an exchange:

- it must be **your turn** — only the current combatant may _start_ an automated attack (a counterstrike, which happens out of turn, comes through the defense buttons instead);
- you must have **targeted** an opponent;
- the attacker must not be **incapacitated, defeated, or dead**;
- the target must be a **combatant in the current encounter**, and not already dead or vanquished;
- a missile shot beyond direct range (a volley) is refused — that case is not supported by the workflow.

# Move to Group… {#move-to-group}

|                |                                                                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**       | Move to Group…                                                                                                                                |
| **Shortcode**  | `moveToGroup`                                                                                                                                 |
| **Icon**       | People (`fa-solid fa-users`)                                                                                                                  |
| **Invoked by** | The **Actions context menu** on the combatant's tracker row — **GM only**                                                                     |
| **API**        | [`SohlCombatantLogic.moveToGroup`](https://www.heroiclands.org/sohl/api/classes/sohl.document.combatant.logic.SohlCombatantLogic#movetogroup) |

**What it does.** Moves this combatant into a different [[#combat-groups|combat group]] — that is, changes which side it is fighting on. Worth doing when a fight starts and the automatic assignment got someone wrong, or when a character changes sides mid-fight.

**The Move to Group dialog.** Choosing the action opens a small dialog with two fields:

- **Group** — a drop-down listing every group that already exists in this encounter, with the combatant's current group pre-selected, plus a final **➕ New group…** entry. Pick the group to move into, or **➕ New group…** to create one.
- **New group name** — the name for the group you are creating. It only matters when you picked **➕ New group…** above; leave it blank and the new group is called **Opponents**.

Press **Move** to apply, or **Cancel** to leave things as they are. Selecting the combatant's current group does nothing. Afterwards the tracker row's group chip shows the new group name.

# Answering an attack {#answering-an-attack}

When someone attacks you in Automated Combat, the attack card that lands in chat carries the defense buttons — **Dodge**, **Counterstrike**, **Block**, and **Ignore**. Pressing one runs the matching action on your combatant and resolves the exchange.

> **These four are hidden actions — they are never in the Actions context menu.** A defense only makes sense as the answer to a particular attack, so it is only ever offered as a button on that attack's card. Nothing is decided for you: the exchange waits until you press one.

**Only the defender sees them.** The buttons are addressed to the defending combatant, so on everyone else's screen they are simply not there. They are also filtered to what your character can actually do:

- **Dodge** appears only if you have a usable Dodge skill.
- **Block** appears only if you carry a weapon, shield, or combat technique with a melee strike mode that can block.
- **Counterstrike** appears only if you have a melee strike mode to strike back with.
- **Ignore** is always available — and if you are **incapacitated**, it is the _only_ button offered.

The cards themselves — what the attack card shows, and how to read the result card the exchange posts — are described under [[doc-cmbtbscsug|Automated Combat in Combat Basics]].

## Block

|                |                                                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**       | Resume (Block)                                                                                                                                                  |
| **Shortcode**  | `automatedBlockResume`                                                                                                                                          |
| **Icon**       | Shield (`fa-solid fa-shield`)                                                                                                                                   |
| **Invoked by** | The **Block** button on the attacker's attack card — **not** in the Actions context menu                                                                        |
| **API**        | [`SohlCombatantLogic.automatedBlockResume`](https://www.heroiclands.org/sohl/api/classes/sohl.document.combatant.logic.SohlCombatantLogic#automatedblockresume) |

Parry the blow with a weapon, shield, or unarmed technique. You are asked which strike mode to block with — the dialog offers every block-capable melee strike mode you have, pre-selecting the one you blocked with last in this fight, or otherwise your best chance — plus an additional modifier for the circumstances. Your block is then rolled against the attack, the result card posts to chat, and the mode you chose becomes your default block for the rest of the fight. If you have nothing that can block, the action says so and stops.

## Dodge

|                |                                                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**       | Resume (Dodge)                                                                                                                                                  |
| **Shortcode**  | `automatedDodgeResume`                                                                                                                                          |
| **Icon**       | Figure stepping aside (`fa-solid fa-person-walking-arrow-loop-left`)                                                                                            |
| **Invoked by** | The **Dodge** button on the attacker's attack card — **not** in the Actions context menu                                                                        |
| **API**        | [`SohlCombatantLogic.automatedDodgeResume`](https://www.heroiclands.org/sohl/api/classes/sohl.document.combatant.logic.SohlCombatantLogic#automateddodgeresume) |

Get out of the way. Dodging is not tied to a weapon, so there is nothing to choose: pressing the button rolls your **Dodge skill** against the attack and posts the result card. If your character has no usable Dodge skill, the button is not offered.

## Counterstrike

|                |                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**       | Resume (Counterstrike)                                                                                                                                                          |
| **Shortcode**  | `automatedCounterstrikeResume`                                                                                                                                                  |
| **Icon**       | Half-filled circle (`fa-solid fa-circle-half-stroke`)                                                                                                                           |
| **Invoked by** | The **Counterstrike** button on the attacker's attack card — **not** in the Actions context menu                                                                                |
| **API**        | [`SohlCombatantLogic.automatedCounterstrikeResume`](https://www.heroiclands.org/sohl/api/classes/sohl.document.combatant.logic.SohlCombatantLogic#automatedcounterstrikeresume) |

Defend by striking back at the attacker in the same instant — both blows can land, so this is the aggressive answer and the risky one. It is a melee response: you are asked to aim and to add any situational modifier, exactly as an attacker is, and only melee strike modes that can counterstrike and that reach the attacker are offered. Because both sides may connect, the exchange posts **two** result cards — one for the original attack, one for your counterstrike — each with its own injury button if that blow landed. This is the one automated action that runs outside its combatant's own turn.

## Ignore

|                |                                                                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**       | Resume (Ignore)                                                                                                                                                   |
| **Shortcode**  | `automatedIgnoreResume`                                                                                                                                           |
| **Icon**       | Slashed circle (`fa-solid fa-ban`)                                                                                                                                |
| **Invoked by** | The **Ignore** button on the attacker's attack card — **not** in the Actions context menu                                                                         |
| **API**        | [`SohlCombatantLogic.automatedIgnoreResume`](https://www.heroiclands.org/sohl/api/classes/sohl.document.combatant.logic.SohlCombatantLogic#automatedignoreresume) |

Take no defensive action. Nothing is asked and nothing is rolled on your side; the attack simply resolves against you and the result card posts. Choose it when a defense would be pointless, when you would rather spend the moment on something else — or because you are incapacitated and it is the only option left.

# See also

- [[doc-cmbtbscsug|Combat Basics]] — Assisted and Automated Combat, the dialogs and cards the automated exchange uses, and how a hit is resolved.
- [[doc-scnsetuptokug|Scene Setup]] — placing tokens and building the encounter the combatant belongs to.
- [[doc-baseitemug|Item Base]] — the shared document actions and dialogs every SoHL document inherits.
- [[doc-actionsug|Actions]] — how actions work in general, and how to add your own.
- [[doc-afflinjug|Afflictions Injuries]] — recording and healing the injuries an exchange produces.
- [[doc-userguide|User Guide]] — back to the index.
