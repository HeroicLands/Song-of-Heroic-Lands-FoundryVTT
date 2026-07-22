---
aliases:
    - Event Queue
    - Trigger Dispatcher
    - SohlEventQueue
    - sohl.events
    - SohlSubscription
tags:
    - core-system
    - time
    - lifecycle
audience: Developers wiring document behavior to lifecycle moments (combat start/end, round/turn boundaries, world-time scheduling).
---

# Event Queue

How to make something happen on a document **when a moment arrives** — world time
reaching a date, combat starting, a round or turn boundary — without polling and
without the system acting on a character behind the player's back.

This page explains the mechanism and walks through the whole approach with
worked examples from real SoHL usage (injury healing checks, bandit checks,
combat triggers). For the exact parameters of any call, follow the
{@link sohl.entity.event.SohlEventQueue | API links} — this page does not restate
them.

## The mental model: a deferred action runner

`sohl.events` (a {@link sohl.entity.event.SohlEventQueue}) is an in-memory
dispatcher. You register a **subscription** — a
{@link sohl.entity.event.SohlSubscription} — that says, in effect:

> "Run action **`actionName`** on the document **`uuid`** when trigger
> **`triggerName`** arrives."

When that moment fires, the queue runs `actionName` on the document's logic — the
**same action a human could invoke** from a context menu or an action-tab button.
So you don't write a bespoke "event handler"; you write an ordinary
{@link sohl.entity.action.SohlAction} and tell the queue when to run it. One
implementation serves the manual invocation, the chat-card `[Perform]` button, and
the timed event alike.

The queue carries **no game rules** — every rule lives in the action on the
document. It only answers "which subscriptions are due, and in what order?"

## What you actually do

Wiring a timed or lifecycle behavior is four steps:

1. **Write the behavior as an action** on the document's logic — a normal
   executor, registered in `defineIntrinsicActions`, that reads what it needs from
   `context.scope` (see the [self-sufficient action contract](https://kb.heroiclands.org/dev/concepts/action-cards/)).
2. **Pick the moment.** A **world time** (fire at/after a date) or a **lifecycle
   trigger** (`combatStart`, `roundStart`, `turnEnd`, …). See
   [Triggers](#triggers-the-moments-you-can-hook).
3. **Register the subscription.**
    - a **persisted, recurring** schedule → {@link sohl.core.logic.SohlSystem.schedule | sohl.schedule} (writes the durable record **and** arms the queue). It defaults to a **time** schedule (`anchor + interval`); pass a `triggerName` for a **persisted event-driven** schedule (issue #622) — `sohl.schedule(doc, "shockReTest", 0, undefined, undefined, "turnEnd")` re-arms a `turnEnd` subscription on every reload, so a lifecycle cadence survives a reload just like a timed one, and both are offered through the shared {@link sohl.document.item.logic.offerSchedule};
    - a **one-shot** future time → {@link sohl.entity.event.SohlEventQueue.scheduleAt | scheduleAt};
    - a **transient lifecycle** subscription (not persisted; re-derived from live state each prep, e.g. a berserker check that exists only while a condition holds) → {@link sohl.entity.event.SohlEventQueue.subscribe | subscribe}, called directly from the document's `finalize()`.
4. **Let re-arm and reload take care of themselves.** `finalize()` runs on every
   client every preparation, so it is the natural place to (re)register; on world
   load SoHL rebuilds the queue from persisted state for you. For a _recurring_
   schedule, **persist an anchor and derive the next fire time from it** — never
   from the live clock (the [one rule](#the-one-rule-persist-an-anchor-never-the-live-clock)).

You rarely call `fire` — that is the dispatch half, driven for you (below).

## Triggers: the moments you can hook

SoHL's trigger names are **identical to Foundry's
`CONFIG.ActiveEffect.expiryEvents` vocabulary**, so an Active Effect with
`duration.expiry: "turnStart"` and a SoHL subscription on `"turnStart"` respond to
the same moment with the same data. Each trigger hands the action a
{@link sohl.entity.event.SohlTriggerContext} of this shape:

| Trigger           | Context shape                                       |
| ----------------- | --------------------------------------------------- |
| `updateWorldTime` | `{ name, worldTime, dt, options?, userId? }`        |
| `combatStart`     | `{ name, combat }`                                  |
| `combatEnd`       | `{ name, combat }`                                  |
| `roundStart`      | `{ name, combat, round, skipped }`                  |
| `roundEnd`        | `{ name, combat, round, skipped }`                  |
| `turnStart`       | `{ name, combat, combatant, turn, round, skipped }` |
| `turnEnd`         | `{ name, combat, combatant, turn, round, skipped }` |

All Foundry hook wiring lives in one module, `SohlHookBridge`, which translates
Foundry's `updateWorldTime` / `combatStart` / `deleteCombat` / `combatRound` /
`combatTurn` into `queue.fire(ctx)` calls (`combatEnd` from `deleteCombat`;
`roundEnd` / `turnEnd` derived by tracking prior combat state). **Do not call
`Hooks.on(...)` elsewhere for dispatch** — add a built-in trigger by editing that
one file, or a custom one via [custom triggers](#6-a-custom-trigger--fire-your-own-lifecycle-moment).

#### Scene-region & environment triggers (issue #593)

The vocabulary above is **time and combat**. A second, **event-driven** family
covers _where_ characters are and _what the scene is doing_ — Foundry v14 scene
regions and environment changes:

| Trigger                 | Context shape                                                                  | Source                           |
| ----------------------- | ------------------------------------------------------------------------------ | -------------------------------- |
| `regionTokenEnter`      | `{ name, regionUuid, regionId, regionName, tokenUuid, actorUuid?, sceneUuid }` | a `trigger` RegionBehavior       |
| `regionTokenExit`       | (same)                                                                         | a `trigger` RegionBehavior       |
| `regionTokenTurnStart`  | (same)                                                                         | a `trigger` RegionBehavior       |
| `regionTokenTurnEnd`    | (same)                                                                         | a `trigger` RegionBehavior       |
| `regionTokenRoundStart` | (same)                                                                         | a `trigger` RegionBehavior       |
| `regionTokenRoundEnd`   | (same)                                                                         | a `trigger` RegionBehavior       |
| `sceneDarknessChange`   | `{ name, sceneUuid, darkness }`                                                | `SohlHookBridge` (`updateScene`) |

These are **opt-in and GM-gated**. Region triggers fire only from a **"SoHL Event
Trigger" RegionBehavior** a GM drops onto a region (the human-behest surface); the
behavior runs on every client, so the whole forward is gated to the active GM and
dispatches once. The exposed set is deliberately curated to discrete, meaningful
events — Foundry's continuous streams (`tokenMove*`) and view-dependent ones
(`tokenAnimate*`) are **excluded** to keep the queue from flooding. See
{@link sohl.entity.event.SohlRegionTriggerName} and
{@link sohl.entity.event.SCENE_DARKNESS_TRIGGER}. Worked example:
[8. A region trigger](#8-a-scene-region-trigger--offer-a-check-on-entering).

### Two families: time-driven and event-driven

Time is only **one** kind of trigger, and the queue is an _event_ dispatcher — not
a scheduler with extras. The distinction shapes what you can ask of a subscription:

- **Time-driven** (`updateWorldTime` with a `fireAt`) — the moment is a computable
  number. It is orderable, catches up over a time jump, and answers "when is the
  next?" ([query](#7-query-the-schedule--when-is-the-next--last)). The
  [anchor rule](#the-one-rule-persist-an-anchor-never-the-live-clock) applies.
- **Event-driven** (`combatStart`, a token entering a region, darkness falling — a
  trigger with **no** `fireAt`) — the moment depends on play, GM action, or world
  state. There is nothing to order or catch up, and **"when does this next fire?"
  is genuinely undeterminable** — `nextFireTime` returns `undefined` by design, not
  as a gap. Anchor / interval / catch-up simply don't apply.

The practical consequence: for an event-driven subscription the queryable temporal
fact is the **last** occurrence, not the next — so the run record
(`system.lastRun[actionName]`) is not a display nicety, it is the _only_ meaningful
temporal query. The **scene-region and environment triggers** (issue #593) are the
archetypal event-driven case — a token entering a region, darkness falling — with
no `fireAt` at all; `nextFireTime` is `undefined` for them by design, and
`system.lastRun` answers "when did this last happen here?"

## Populate everywhere, fire on the active GM only

The queue is a **pure projection of document state**. Every client — GM or player
— populates its own copy from its own document preparation, so `subscribe`,
`unsubscribe`, and `scheduleAt` run on **all** clients (write the `finalize()`
registration unconditionally — no `game.user.isGM` check). Only
{@link sohl.entity.event.SohlEventQueue.fire | fire} is gated to the active GM.

Because nothing but a document update evolves schedule state, clients can't drift:
a change flows through a `document.update` (which replicates) and its
re-preparation. A player's queue is a permission-scoped subset — enough to answer
sheet-side "when does this fire?" queries locally, without leaking documents they
can't see. If the active GM disconnects, a promoted GM already holds a complete
queue and continues seamlessly.

## Consent: the queue reminds; the human performs

Under the [Prime Directive](https://kb.heroiclands.org/dev/) (issue #579) the queue
does **not** run a due action directly. It posts an owner-gated `[Perform]`
reminder card addressed to the document, and the owner's click runs that same
action. _Reminding is allowed; performing is not._ Everything below is built on
that: a schedule coming due surfaces an offer, never a fait accompli.

## Worked examples

### 1. A recurring on-document check — the injury healing check (#486)

The canonical pattern. A treated wound checks its healing every so often; each
check is a normal action, the schedule lives in the document's
{@link sohl.entity.event.ScheduledAction | `system.scheduledActions`} store, and
`finalize()` re-arms it every prep.

```typescript
// (a) finalize() re-arms whatever the store holds — on every client, every prep.
//     armScheduledActions reads system.scheduledActions and scheduleAt()s each.
override finalize(): void {
    super.finalize();
    if (this.item?.uuid)
        armScheduledActions(this.item.uuid, this.data.scheduledActions, sohl.events);
}

// (b) The action. Its anchor + interval come from the persisted store entry —
//     NEVER the live clock. It catches up every checkpoint the world skipped,
//     then OFFERS the next occurrence instead of auto-re-arming.
async healingCheck(context: SohlActionContext): Promise<void> {
    const entry = this.data.scheduledActions?.find(e => e.actionName === "healingCheck");
    const anchor = entry?.anchor ?? fvttWorldTime();
    const interval = entry?.interval ?? this.healingCheckDurationBase.effective;

    let level = this.data.levelBase;
    for (const t of elapsedCheckpoints(anchor, fvttWorldTime(), interval)) {
        if (level <= 0) break;
        level = await this.rollHealingTest(level, t); // stateful catch-up
    }
    await this.item.update({ "system.levelBase": level });

    if (level <= 0) await sohl.unschedule(this.item, "healingCheck"); // done
    else await offerSchedule(context, this.item, "healingCheck",     // offer next
        this.rollDuration(this.data.healingCheckDurationFormula));
}
```

- {@link sohl.core.logic.SohlSystem.schedule | sohl.schedule} / {@link sohl.core.logic.SohlSystem.unschedule | sohl.unschedule} write the store **and** (un)arm the queue in one call.
- {@link sohl.document.item.logic.offerSchedule} is the shared consent step — accept → `sohl.schedule` the next; decline → `sohl.unschedule` (see [consent](#consent-the-queue-reminds-the-human-performs)).
- {@link sohl.entity.event.armScheduledActions} and {@link sohl.entity.event.elapsedCheckpoints} do the reload re-arm and the catch-up enumeration.

Blood-loss (`bloodLossAdvanceCheck`) and the shock/coma/infection recovery
(`courseCheck`) follow the identical shape; the affliction phase machine
(`onsetCheck` → `resolutionCheck` → recurring `healingCheck`) schedules each next
phase from the transition that precedes it.

### 2. A one-shot deferred action — "at time T, do X once"

For a non-recurring future moment, {@link sohl.entity.event.SohlEventQueue.scheduleAt | scheduleAt}
arms a one-shot `updateWorldTime` subscription that auto-removes when it fires:

```typescript
sohl.events.scheduleAt(item.uuid, "spellExpires", anchor + duration, { ... });
```

`scheduleAt` is the low-level arm; it does **not** persist. If the schedule must
survive a reload, use `sohl.schedule` (which persists to the store) instead — or
re-arm it from `finalize()`.

### 3. A combat-moment subscription — react to combat start

Not everything is time-based. Subscribe to a lifecycle trigger from `finalize()`;
the action runs when that moment fires. A berserker checking their nerve at the
start of every combat:

```typescript
override finalize(): void {
    super.finalize();
    sohl.events.subscribe({
        uuid: this.actor.uuid,
        actionName: "berserkerCheck",
        triggerName: "combatStart",
        payload: { threshold: 12 },
    });
}
```

The action receives the `{ name: "combatStart", combat }`
{@link sohl.entity.event.SohlTriggerContext} (plus `payload`) as its
`context.scope`. See {@link sohl.entity.event.SohlSubscription} for every field a
subscription accepts.

### 4. Gate a subscription with a predicate

Attach a {@link sohl.entity.expr.SafeExpression} `predicate` to fire only when a
condition holds — evaluated against the trigger context; a falsy result skips the
dispatch and keeps the subscription:

```typescript
sohl.events.subscribe({
    uuid,
    actionName: "hazardTick",
    triggerName: "updateWorldTime",
    predicate: new SafeExpression({
        source: "defined(curCombatTime()) && curCombatTime().round > 3",
    }),
});
```

The two axes compose: a concrete `fireAt` is the queryable, orderable "when";
`predicate` adds arbitrary "whether." A predicate that needs live world/combat
time — even on a trigger whose context doesn't carry it — reads it via the
`curWorldTime()` / `curCombatTime()` [expression helpers](../concepts/expressions.md#the-standard-helpers).
Prefer `fireAt` for the common case (a bare `curWorldTime() > X` isn't invertible
to a "next fire" time, so it can't answer [queries](#7-query-the-schedule--when-is-the-next--last)).

### 5. A world-wide or scene-bound schedule — the bandit check (module)

A schedule needs a host document that carries `system.scheduledActions` (an actor
or item). A world event has no natural document, so hang it off the singleton
**world host** actor via {@link sohl.core.logic.SohlSystem.worldHost | sohl.worldHost}:

```js
const host = await sohl.worldHost(); // find-or-create the `_sohlworld` actor
await sohl.schedule(
    host,
    "checkForBandits",
    4 * 3600,
    { visibility: "gm" },
    scene.uuid,
);
```

`{ visibility: "gm" }` whispers the reminder to the GM (no metagame leak); a
`sceneUuid` binds it to a **place** — a check that comes due while the party is
elsewhere is **held, not lost**, and surfaces when they re-enter that scene. Omit
`sceneUuid` for a genuinely world-wide clock (a plague, a season). A world-host
clock is the one case where **unconditional** re-arm (the action calls
`sohl.schedule` again itself) is appropriate — it is ambient and GM-only, not a
character's action. The full module walkthrough is in
[Writing Modules → Scheduling deferred actions](../contributing/module-development.md#scheduling-deferred-actions).

### 6. A custom trigger — fire your own lifecycle moment

Register a SoHL-specific trigger and fire it; firing **dual-dispatches** to both
the queue and Foundry's `ActiveEffect.registry`, so subscriptions and effects
react together:

```typescript
registerSohlTrigger("sohlInjuryHealed", "SOHL.Trigger.InjuryHealed"); // at init
await fireSohlTrigger({ name: "sohlInjuryHealed", injury, actor }); // later
```

{@link sohl.entity.event.fireSohlTrigger} is the **only** way to fire a custom
trigger — never `sohl.events.fire(...)` or `ActiveEffect.registry.refresh(...)`
directly for custom names, which would drift the two systems apart. See
{@link sohl.entity.event.registerSohlTrigger}.

### 7. Query the schedule — "when is the next / last?"

The read-only queries answer on any client for documents it can see:

```typescript
sohl.events.nextFireTime(injury.uuid, "healingCheck"); // absolute world-time, or undefined
sohl.events.timeUntil(injury.uuid, "healingCheck"); // signed seconds from now
sohl.events.isScheduled(injury.uuid, "healingCheck"); // is it armed?
```

These ask the **scheduler** about the _next_ occurrence — see
{@link sohl.entity.event.SohlEventQueue.nextFireTime | nextFireTime} /
{@link sohl.entity.event.SohlEventQueue.timeUntil | timeUntil}. They answer only
for [time-driven](#two-families-time-driven-and-event-driven) subscriptions; for an
event-driven one `nextFireTime` is `undefined` because there is no computable next
fire — a real state, not an error.

The **last performed** occurrence is a document fact, not a queue fact — read the
generic **run record** `doc.system.lastRun[actionName]` (e.g.
`injury.system.lastRun.healingCheck`), which survives after the schedule ends
(declined or resolved) where the queue entry does not. It's one keyed map — the
past-tense mirror of `scheduledActions` — stamped automatically at the action
chokepoint ({@link sohl.entity.action.SohlAction.execute}) for actions whose
definition sets `recordsLastRun`, so any action gets a "when did this last happen
here?" answer with **no bespoke field**. For an event-driven trigger this run
record is the _only_ meaningful temporal query — the queue can tell you a token
entered the crypt an hour ago, but never when it next will.

### 8. A scene-region trigger — offer a check on entering

A GM opts a region into SoHL triggering by dropping a **"SoHL Event Trigger"**
RegionBehavior onto it and choosing the events to forward (and, optionally, an
action to offer). No code is needed for the region-authored case — entering the
region offers the named action to the entering token's actor as a `[Perform]`
reminder:

- **events**: `Region: Token Enters`
- **Action to offer**: `fearCheck` (a shortcode on the entering actor's logic)

The behavior forwards the event **GM-gated, once** (it runs on every client), and
also fires the trigger for any subscriptions. So the same moment can drive a
per-character subscription — "when **my** character enters this crypt, offer a
Fear test" — scoped by a predicate on the entering actor and the region:

```typescript
override finalize(): void {
    super.finalize();
    sohl.events.subscribe({
        uuid: this.actor.uuid,
        actionName: "fearCheck",
        triggerName: "regionTokenEnter",
        // Only when it is *this* character entering *this* region.
        predicate: new SafeExpression({
            source: "actorUuid == '" + this.actor.uuid + "' && regionId == 'crypt'",
        }),
    });
}
```

The action receives the region
{@link sohl.entity.event.SohlTriggerContext} (`{ name: "regionTokenEnter",
regionId, regionName, tokenUuid, actorUuid, sceneUuid }`) as its scope. Because a
region trigger is **event-driven**, `nextFireTime` is `undefined`; flag the action
`recordsLastRun` and read `actor.system.lastRun.fearCheck` for "when did this
character last make a Fear test here?"

The darkness sibling is identical in shape — subscribe to `sceneDarknessChange`
and read `ctx.darkness` — but fires from `SohlHookBridge` on `updateScene`, not a
RegionBehavior.

## The one rule: persist an anchor, never the live clock

The queue is stateless between ticks and **never remembers when a subscription last
fired**. So a recurring consumer must persist an **anchor** and derive the next
`fireAt` from it — for the core effects that anchor is the
{@link sohl.entity.event.ScheduledAction | `system.scheduledActions`} entry
(`anchor + interval`).

> ⚠️ Scheduling from `game.time.worldTime + interval` is a **bug** for recurrence:
> during a time jump the clock is already at the far end, so it skips every
> intermediate occurrence — and because it derives from the live clock rather than
> a stored fact, other clients can't reconstruct it deterministically.

**Time jumps are the consumer's job, not the queue's.** `fire` is single-pass: if
world time leaps from T to T+60d and a wound had one pending check at T+5d, the
queue fires it **once** — it does not itself produce the other eleven. The
action's catch-up loop (example 1) resolves every checkpoint in `(anchor, now]`,
applies each in sequence (stateful — each roll sees the last one's result), and
persists once; `finalize()` then re-arms the single next occurrence beyond `now`.
This split keeps the queue a pure projection: the randomness happens once on the
GM, the re-arm replicates and is deterministic everywhere.

## Cancellation, loops, and errors

- **Cancel** by removing the subscription: `finalize()` stops re-registering (or
  `sohl.unschedule` / `unsubscribe`) when the triggering state is gone; a
  one-shot removes itself before its handler runs; a deleted document's next
  dispatch resolves to `null` and is skipped.
- **Loop protection.** Re-entrant `fire(...)` for the same trigger is capped at 16
  (a backstop for non-time loops, e.g. a `combatStart` handler that fires
  `combatStart`). No same-tick guard is needed — there is no cascade, so a handler
  that re-arms mid-dispatch simply schedules a subscription the _next_ `fire` sees.
- **Predicate errors** are caught and logged; that one dispatch is skipped and the
  subscription preserved (stale data on one tick must not permanently disarm a
  check).

## Inspecting at runtime

```javascript
sohl.events.size; // number of registered subscriptions
sohl.events.debug(); // a sorted snapshot for the console
```

See {@link sohl.entity.event.SohlEventQueue.debug | debug}.

## API reference

Follow these for the exact parameters and return types:

- **The queue** — {@link sohl.entity.event.SohlEventQueue}: `subscribe` · `scheduleAt` · `unsubscribe` · `fire` · `nextFireTime` · `timeUntil` · `isScheduled` · `debug`.
- **A subscription** — {@link sohl.entity.event.SohlSubscription} (every field) and its {@link sohl.entity.event.SohlTriggerContext}.
- **Persisted schedules** — {@link sohl.core.logic.SohlSystem.schedule | sohl.schedule} · {@link sohl.core.logic.SohlSystem.unschedule | sohl.unschedule} · {@link sohl.core.logic.SohlSystem.worldHost | sohl.worldHost}; the store shape {@link sohl.entity.event.ScheduledAction} and its re-arm {@link sohl.entity.event.armScheduledActions}.
- **Consent + catch-up** — {@link sohl.document.item.logic.offerSchedule} · {@link sohl.entity.event.elapsedCheckpoints} · {@link sohl.entity.event.deriveNext}.
- **Custom triggers** — {@link sohl.entity.event.registerSohlTrigger} · {@link sohl.entity.event.fireSohlTrigger}.

## See also

- [Writing Modules → Scheduling deferred actions](../contributing/module-development.md#scheduling-deferred-actions) — the bandit-check example end to end.
- [Action Cards & the Consent Model](../concepts/action-cards.md) — the `[Perform]` reminder and self-sufficient actions.
- [Effects Integration](./effects-integration.md) — the shared trigger vocabulary with `CONFIG.ActiveEffect.expiryEvents`.
- [Calendar](./calendar.md) — formatting event times for sheets and chat.
- [Lifecycle Hooks](../how-to/lifecycle-hooks.md) — where `finalize()` fits in preparation.
