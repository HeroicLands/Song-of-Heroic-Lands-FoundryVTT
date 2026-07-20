---
aliases:
    - Morale
    - Morale Test
    - Rally Test
    - Reaction Test
id: Mor4l3Kp9mQ2vT7x
type: doc
package: sohl
category: user-guide
name:
    full: Morale
    aliases: []
folder: RqKUTBUBN2Y3MHYB
slug: sohl-morale
---

**Morale** is a fighter's nerve — their willingness to stay in the fight. Most
combatants lose heart before their bodies give out, so morale tracks the moment
resolve cracks rather than the moment flesh fails.

The **Morale Test** is a test of the **Initiative** skill. (For the `CF0`/`CF5`
split, see [Fear](Fear.md).)

| Result               | State and effect                                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CF0** — Catatonic  | Gains **2 Psyche Stress Levels**. Unaware and unable to move, act, or defend. Makes a [Reaction Test](#reaction-test) at the end of every round; on success the state improves to Routed.                                       |
| **CF5** — Routed     | Gains **1 Psyche Stress Level**. Flees the source at full Move (or, if movement is impossible, Passes and surrenders). Once out of line of sight and safe, makes a Reaction Test every five minutes; on success becomes Steady. |
| **MF** — Withdrawing | Takes the Move action each turn, retreating at half-Move or more (or Passes). Once no longer threatened, makes a Reaction Test once per minute; on success becomes Steady.                                                      |
| **MS** — Steady      | May take any action.                                                                                                                                                                                                            |
| **CS** — Brave       | May take any action, and gains **+20** to all Morale and Fear tests for five minutes.                                                                                                                                           |

When several morale-failure sources are present, only the **most severe** state
affects the victim.

## Morale triggers

A morale check is called for when a combatant:

- takes a Serious or Grievous wound, once they have resolved that wound's
  [Shock](Shock.md) test and shaken off any resulting shock state;
- notices that **half or more** of their allies have been put out of action
  (judged against the survivors each time, so it can fire repeatedly as a fight
  wears a group down);
- watches a leader fall;
- is suddenly badly outnumbered;
- is disarmed while enemies remain armed; or
- meets any other GM-designated situation.

## Rally Test

Once per round, as a free action, any character who is **not vanquished** may
make a **Rally Test** — a **Command (Initiative)** test — to steady **Routed** and
**Withdrawing** allies within clear earshot who can understand them (allies of
doubtful perception test Awareness first).

| Result  | Effect                                                                                                      |
| ------- | ----------------------------------------------------------------------------------------------------------- |
| CF (−1) | **Unresponsive** — no response; no further Rally Tests for five minutes.                                    |
| MF (0)  | **Unresponsive** — no response; no further Rally Tests for one minute.                                      |
| MS (1)  | Allies make a [Reaction Test](#reaction-test) at the end of their next turn; on success they become Steady. |
| CS (2)  | Allies become **Steady**.                                                                                   |

## Reaction Test

A **Reaction Test** is an **Initiative** test a character makes to shake off a
compromised state — being confused, caught unaware, or left helpless — or to
respond to an ally's [Rally Test](#rally-test). It is rolled at the **end of the
character's next turn**. Succeeding snaps them back to normal: from then on they
may choose any defense and act freely on the following turn. Failing means the
condition persists, and they try the Reaction Test again at the end of the next
turn.

## See also

- [Fear](Fear.md), [Shock](Shock.md),
  [Psychological Condition](Psychological_Condition.md), [Trauma](Trauma.md).
