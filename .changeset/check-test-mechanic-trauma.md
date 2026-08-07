---
"sohl": minor
---

Complete the `*Check` / `*Test` split, anchor recurrences on the last test, and make an affliction's Outcome authorable ([#1181](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1181), [#1182](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1182), [#1128](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1128)).

**A Check offers; a Test acts**

Every recurring cycle on a Trauma now works the way the affliction's already does. A `*Check` posts a card offering its test and writes nothing — anyone may initiate one, and ignoring it costs nothing. A `*Test` rolls **once** and applies the outcome:

| Check                   | Test                                                                       |
| ----------------------- | -------------------------------------------------------------------------- |
| `healingCheck`          | `healingtest` — the Injury Healing Test, until now a stub that only warned |
| `bloodLossAdvanceCheck` | `bloodLossAdvanceTest`                                                     |
| `courseCheck`           | `courseTest`                                                               |
| `psycheRecovery`        | `psycheRecoveryTest`                                                       |
| `auralShockRecovery`    | `auralShockRecoveryTest`                                                   |
| `pallRecovery`          | `pallRecoveryTest`                                                         |

The elapsed-checkpoint catch-up is gone from this path entirely. That loop was the real hazard: successive rolls in a single pass mutated the state each later roll read, so one click could carry a bleeding wound through several blood-loss advances, or an Extended Shock from stable to **dead**, with no opportunity to stop between them.

**Nothing is lost by removing it**

Each test schedules its successor from **the due time of the occurrence it just performed** rather than from the moment the button was pressed, so answering a check late no longer pushes the whole cadence later. On a 5-day cadence anchored at day 0, a check due at day 10 and performed at day 22 leaves the next test due at day 15.

That anchoring can land a fire time already in the past — which is exactly how a player who is behind works through a backlog. The event queue only dispatched on a world-time tick, so `sohl.schedule` now dispatches immediately when the new occurrence is already due; otherwise the schedule sat due-but-silent until someone nudged the clock. Each step still posts a card and stops until a human presses it, so a backlog drains one consent at a time with the illness's or wound's original rhythm intact.

**A modifiable healing target**

`TraumaLogic` gains a **`healing`** ValueModifier — Healing Rate × Healing Base — with a matching `TRAUMA_EFFECT_KEY.HEALING` (`mod:logic.healing`) key, so an Active Effect can change what a wound is tested against instead of that value being an expression buried at the point of the roll. A wound with no Healing Rate leaves the modifier **disabled** rather than zero: untreated is a state, not a target, and it still resolves as a Critical Failure.

**Four Trauma actions were invisible**

Request Treatment, Treat Injury, Treatment Test and Healing Test were gated on `subType === 'physical'` — a **Skill** subtype that no trauma has ever had — so none of them ever appeared in the Actions context menu. They are gated on `'injury'` now, with a test that fails on any visibility expression naming a subtype the enum does not define.

**An affliction's Outcome is authorable at last**

The Outcome select (Death / Cured) was never rendered on the Affliction sheet, so an affliction authored in the UI silently carried the benign default and a lethal poison killed nobody. It now renders beside Outcome Trauma, and the pack builder can author it — along with `onsetFormula`, which it also could not set. The retired `diagnosisBonusBase` is dropped from the builder and from 34 content files.

No world migration ships with any of this: the persisted schedule keys are unchanged, and the system is pre-beta.
