---
aliases:
    - Combat Modes
    - Assisted Combat
    - Automated Combat
    - Manual Combat
tags:
    - combat
    - workflow
    - gm-guidance
audience: Players and GMs deciding how to run a combat at the table.
---

# Combat Modes

SoHL supports two ways of running combat: **Assisted** and **Automated**. They cover the same mechanics; they differ in how much of the resolution the system does for you and how much flexibility you keep at each step.

| | Assisted | Automated |
|---|---|---|
| Setup required | Actor sheets only | Foundry combat started, tokens placed, target selected |
| Steps the system runs | Roll the dice you click on | Whole attack → defend → impact → injury chain |
| Number of player clicks | ~4 per exchange | ~3 per exchange, but no rulebook lookups |
| GM can override at any step | Yes — each step is just a chat entry | Limited — the flow is opinionated |
| Best for | Theatre of the mind, edge cases, GM fiat | Routine combats, faster pace |

A combat doesn't have to commit to one mode for the duration — the GM can switch any participant to Assisted mid-encounter when something unusual happens, then back to Automated for the next round.

## Assisted Combat

Assisted combat lets you make each combat roll manually, but with all common modifiers already applied. It's a sequence of separate, player-initiated steps. Nothing in Assisted combat requires a scene, tokens, or the Foundry combat tracker — actor sheets are enough.

The character's **Combat tab** has one row per melee strike mode (and one per range band for ranged weapons). Each row shows Atk, Blk, and CX (Counterstrike) — these are the mastery levels for that weapon, already adjusted for every active modifier.

**Attack.** Click the **Atk** value for the strike mode you want. The system runs a mastery test against that pre-computed value and posts the result to chat. That's it — no other state change, no further consequences. The test result is a chat entry.

**Defend.** To defend with the weapon, click the **Blk** or **CX** value. To dodge, switch to the Skills tab and click the **Dodge** skill. Whichever you choose, the test result lands in chat.

**Impact.** If the combined attack/defense outcome means the strike connects, click the impact formula in the **Impact** column. The system rolls the damage with modifiers applied and posts the resulting impact value to chat.

**Injury.** If impact is positive, the defender clicks **Add Injury** on their Trauma tab and fills in the form: impact value, weapon aspect, the targeted body part, spread, and optionally the specific location (if the GM called one). The system resolves armor reduction, picks a hit location, computes injury level and severity, creates an Injury item on the character sheet, and posts the result to chat.

These four steps are **independent**. The attack result is just a chat entry — the GM can let the player reroll, declare a miss a hit, hand-wave the impact roll, or anything else. The injury form doesn't even need an attack roll to precede it. If a character falls 30 feet and the GM rules 15 blunt impact, the player can open **Add Injury** directly and fill in the numbers.

**Strengths.** Maximum flexibility. Every step is open to GM fiat. Works in theatre of the mind with no scene at all.

**Cost.** More clicks per exchange. Between attack and impact you may need to consult tables to know what happened. For routine exchanges, this overhead dominates.

## Automated Combat

Automated combat collapses the four steps into a single chain that the system walks both players through. The trade-off is that it is **highly opinionated** — it assumes a single, well-formed combat is happening and that nobody wants to deviate from the standard flow. In the 95% of cases where that's true, exchanges run 3–5× faster than Assisted.

**Prerequisites.** A Foundry VTT Combat must be started, with every participant having a Combatant and a token on the active scene.

**Starting an exchange.** Automated combat resolves between **combatants**, not arbitrary tokens — a token that isn't in the current combat cannot be the target. The current combatant's player targets the defender and initiates with a hotkey or by clicking a strike mode on the Combat tab. SoHL looks at the player's targeted tokens and keeps only those that are combatants of the current combat: exactly **one** must remain. If zero or more than one combatant is targeted, SoHL warns that exactly one combatant token must be selected and aborts. (Targeting extra non-combatant tokens is harmless — they're ignored.)

A few preconditions are checked up front, and the attack aborts with a notification if any fails: the attacker can't act while **incapacitated** (dead, defeated, unconscious, asleep, restrained, paralyzed, frozen), and a **dead** target can't be attacked. See [Automated Combat Invariants](./combat.md#automated-combat-invariants) for the full list.

**Choosing the strike.** The system offers only the strike modes that can reach the target right now — melee modes within the mode's reach, and missile modes within the weapon's **base range**. The list defaults to the mode you used last (or, failing that, your best chance to hit). If the target is beyond every mode's range, the system warns and aborts. Then the player picks the body part to aim at.

> **Direct fire only.** Automated combat supports **melee** attacks and **missile _direct_** attacks (target within base range). A missile fired beyond base range is a **volley** — an arcing, area-targeted shot that can't aim at a specific person or body location — and is **not supported** by automated combat; resolve volleys in Assisted mode. A direct missile shot at **point-blank** range (within half the base range) is more accurate and hits a little harder.

**Defender response.** A chat message announces the attack. Only the **defender's owner** (and the GM) sees the response buttons — **Block**, **Counterstrike**, **Dodge**, **Ignore** — and only the ones that apply: Block appears only if the defender has a weapon/shield mode that can block, and Counterstrike only if they have a melee attack mode; Dodge and Ignore are always offered. An **incapacitated** defender (unconscious, asleep, restrained, paralyzed, frozen, or otherwise incapacitated) can do nothing but **Ignore** — the other three are disabled. They pick one. The system rolls both the attack and defense, resolves the success outcome (including any free Tactical Advantage for the defender), and posts the result. If the attack fails, the exchange ends here.

**Impact.** If the attack succeeded, the attacker sees an **Impact** button in chat. Clicking it rolls damage and posts the impact value.

**Injury.** The defender then sees a **Calculate Injury** button. Spread, target part, and impact have all been carried forward — no form to fill in. One click resolves armor, picks a hit location, computes injury level and severity, creates the Injury item, and posts the result to chat.

The exchange is over. Neither player consulted a rulebook; neither typed in a number after the initial weapon/part choice. Every step after that was a single click on a chat-card button.

**Strengths.** Speed. Pace. The system holds the players' hands through the canonical flow.

**Cost.** Inflexibility. The opinionated chain assumes nothing strange is happening — when something does (a third party intervenes, the GM wants to allow a reroll, a non-combat consequence needs to be injected mid-exchange), Automated combat can't accommodate it. Switch the affected character to Assisted for that exchange.

## Choosing between them

| Situation | Use |
|---|---|
| Theatre of the mind, no tokens / scene | Assisted |
| Routine combat on a battle map | Automated |
| GM wants to fudge a result | Assisted |
| Non-combat injury (a fall, a trap, environmental damage) | Assisted (jump straight to **Add Injury**) |
| Combat where multiple intervenors complicate the round | Assisted for the unusual actors, Automated for the rest |
| New players still learning the rules | Automated — the flow teaches itself |
| Veteran group running a tactical fight | Either — pick the pace you want |

## See also

- [Combat](./combat.md) — the underlying mechanics (strike spread, hit location determination)
- [Body Structure](./body-structure.md) — anatomy that drives hit location and injury effects
- [Injuries and Healing](./injuries-healing.md) — what happens after the injury lands
- [Combat Resolution Pipeline](./combat-resolution-pipeline.md) — the internal pipeline that drives both modes (developer-facing)
