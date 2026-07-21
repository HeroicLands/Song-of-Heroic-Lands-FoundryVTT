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

How documents subscribe to lifecycle moments — combat start/end, round/turn boundaries, world-time arrival — and how those moments are dispatched back to the document.

See also: [Calendar](./calendar.md), [Effects Integration](./effects-integration.md), [Lifecycle Hooks](../how-to/lifecycle-hooks.md).

## What it is

`sohl.events` (an instance of [`SohlEventQueue`](../../src/entity/event/SohlEventQueue.ts)) is a lightweight in-memory **trigger dispatcher**. A document — an injury, an affliction, a cohort, a piece of decaying gear — subscribes to a **trigger** (a named lifecycle moment), and when that trigger fires, the queue calls back into the document.

The queue is a dispatch engine. It carries no game rules — every rule lives in the handler on the document.

## Trigger taxonomy

SoHL's trigger names are **identical to Foundry's `CONFIG.ActiveEffect.expiryEvents` vocabulary**. An Active Effect with `duration.expiry: "turnStart"` and a SoHL subscription on `"turnStart"` are responding to the same moment, in the same shape, with the same data.

| Trigger           | Context shape passed to the handler                 |
| ----------------- | --------------------------------------------------- |
| `updateWorldTime` | `{ name, worldTime, dt, options?, userId? }`        |
| `combatStart`     | `{ name, combat }`                                  |
| `combatEnd`       | `{ name, combat }`                                  |
| `roundStart`      | `{ name, combat, round, skipped }`                  |
| `roundEnd`        | `{ name, combat, round, skipped }`                  |
| `turnStart`       | `{ name, combat, combatant, turn, round, skipped }` |
| `turnEnd`         | `{ name, combat, combatant, turn, round, skipped }` |

`combatEnd` is dispatched when Foundry fires `deleteCombat` (combat document deletion). `roundEnd` / `turnEnd` are derived in [`SohlHookBridge`](../../src/core/logic/SohlHookBridge.ts) by tracking the prior state per-combat across `combatRound` / `combatTurn` invocations.

Custom triggers are registered via [`registerSohlTrigger`](#custom-triggers).

## Architecture

### Identity

Each subscription is keyed by **`(uuid, actionName)`**. A document may have at most one subscription per action name. Re-subscribing with the same identity silently replaces the previous entry (trigger, fireAt, predicate, payload, oneShot are all overwritten).

### Storage

Subscriptions live in an in-memory `Map<key, SohlSubscription>` on `sohl.events`. **Nothing is persisted.** If the world closes and reopens, the queue starts empty. Documents are expected to re-subscribe on every preparation cycle so the queue rebuilds itself on world load.

### Replication — populate everywhere, fire on the active GM only

The queue is a **pure projection of document state**, so **every** client — GM or player — populates its own copy from its own document preparation. `subscribe`, `unsubscribe`, and `scheduleAt` run on **all** clients.

Only **`fire`** is gated to the active GM (`fvttIsActiveGM()`). Because nothing else evolves schedule state, no GM-only side effect can drift clients out of sync: schedule changes flow through document updates (which replicate) and their re-preparation. If the active GM disconnects and another GM is promoted, the promoted client already has a complete queue and continues dispatching seamlessly.

A player client's queue is a **permission-scoped subset** of the active GM's — it holds only the subscriptions for documents that player can prepare (their own actors' items, visible tokens, …). That is exactly enough to answer sheet-side date queries ([`nextFireTime`](#query-api) / [`timeUntil`](#query-api)) locally, and it deliberately does not leak the existence or timing of documents the player can't see. The active GM's queue is the complete, authoritative one that fires.

### Hook integration

All Foundry hook wiring lives in a single module, [`SohlHookBridge`](../../src/core/logic/SohlHookBridge.ts). It listens to `updateWorldTime`, `combatStart`, `deleteCombat`, `combatRound`, and `combatTurn`, and translates each into one or more `queue.fire(ctx)` calls. **Do not call `Hooks.on(...)` from elsewhere for trigger dispatch.** Adding a new built-in trigger means editing one file.

`SohlHookBridge` is wired during system init from [`sohl.ts`](../../src/sohl.ts):

```typescript
wireSohlHookBridge(sohl.events);
```

SoHL does **not** re-fire `ActiveEffect.registry.refresh(...)` for built-in triggers. Foundry's own code already calls the registry next to each hook (`client/helpers/time.mjs`, `client/documents/combat.mjs`), so dual-dispatching would expire effects twice. Only custom triggers fired through [`fireSohlTrigger`](#custom-triggers) dual-dispatch.

## API surface

### `subscribe(sub)`

Register or overwrite a subscription. **Runs on all clients** (the queue is a projection of document state); only `fire` is GM-gated.

```typescript
sohl.events.subscribe({
    uuid: actor.uuid,
    actionName: "berserkerCheck",
    triggerName: "combatStart",
    payload: { threshold: 12 },
});
```

| Field         | Type             | Purpose                                                                                                                                                 |
| ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uuid`        | string           | UUID of the owning document. Resolved via `fromUuid` at dispatch time.                                                                                  |
| `actionName`  | string           | The action to run on the owning document's logic when it fires — the subscription identifier, scoped to the document. Convention: lowerCamelCase verbs. |
| `triggerName` | string           | The trigger to listen to (must match a `ctx.name` passed to `fire`).                                                                                    |
| `fireAt?`     | number           | Optional scheduled world-time. Required for `updateWorldTime` subscriptions when you want time-based dispatch ordering.                                 |
| `predicate?`  | `SafeExpression` | Optional filter — a `SafeExpression` evaluated against the trigger context; a falsy result skips the dispatch (subscription preserved).                 |
| `payload?`    | object           | Optional data handed back to the handler as the third argument.                                                                                         |
| `oneShot?`    | boolean          | If true, the subscription is removed before its handler runs. Set automatically by `scheduleAt`.                                                        |

### `scheduleAt(uuid, actionName, fireAt, payload?)`

Convenience for the most common case: a one-shot `updateWorldTime` subscription that fires when `worldTime >= fireAt`.

```typescript
sohl.events.scheduleAt(
    injury.uuid,
    "healingCheck",
    anchor + interval, // from the persisted store entry, NOT game.time.worldTime
    { atLevel: injury.system.levelBase },
);
```

`scheduleAt` is the low-level arm. Prefer **`sohl.schedule(doc, actionName, interval)`** (which persists **and** arms) for recurring schedules; it and the `finalize()` re-arm both derive `fireAt` from the same `system.scheduledActions` entry, so they cannot drift. See [the owner-persists-the-anchor contract](#the-owner-persists-the-anchor-contract-the-generic-scheduledactions-store).

### `unsubscribe(uuid, actionName)`

Remove a subscription. Safe to call when no subscription exists. **Runs on all clients.**

### Query API

Read-only, and answer on **any** client for documents that client can see:

| Method                           | Returns                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| `nextFireTime(uuid, actionName)` | The subscription's absolute world-time `fireAt`, or `undefined` when absent / no `fireAt`.      |
| `timeUntil(uuid, actionName)`    | Signed seconds from now until it fires (+ future, − past, `0` now), or `undefined` when absent. |
| `isScheduled(uuid, actionName)`  | Whether a subscription is registered for the pair.                                              |

There is at most one subscription per `(uuid, actionName)`, so each returns that single subscription's value. Use these queries to ask _the scheduler_ whether (and when) an action is armed — e.g. "when is the next healing check?" is `sohl.events.nextFireTime(injury.uuid, "healingCheck")`. For the **last performed** occurrence (a fact that survives after the schedule ends — declined or resolved), read the document's own record field (e.g. `injury.system.lastHealingCheckDate`), not the queue.

### `fire(ctx)` _(internal)_

Dispatch a trigger. Called by `SohlHookBridge` and by [`fireSohlTrigger`](#custom-triggers). Active-GM only; you should not call this directly.

`fire` dispatches each matching subscription **once**, from a snapshot taken at the start of the call. For `updateWorldTime`, "matching" additionally requires the subscription be _due_ (`fireAt` undefined or `≤ worldTime`), and due subscriptions dispatch in ascending `fireAt` order. Subscriptions a handler adds mid-dispatch wait for the next `fire` — there is no cascade (see [Time jumps](#time-jumps-are-the-consumers-job-not-the-queues)).

### `size` / `clear()` / `debug()`

Inspection helpers. `debug()` returns a snapshot sorted by `(triggerName, fireAt, actionName)`. `clear()` empties the queue — useful in tests; rarely needed at runtime.

## Dispatching triggers to document actions

A subscription's `actionName` is the **action shortcode** the queue executes on the owning document's logic when the trigger fires. The trigger context — with the subscription's `payload` attached as `ctx.payload` — becomes the action context's `scope`, and `actionName` its `type`. So an event dispatches through the **same action a user could invoke manually**; one implementation serves both, which is why the handler no longer lives in a separate `handleSohlEvent` switch. (Under issue #579 the queue no longer runs the action directly when due — it posts an owner-gated `[Perform]` reminder, and the owner's click runs that same action.)

```typescript
// An intrinsic action on the item's logic, registered via defineIntrinsicActions
// with `executor: "healingCheck"`. Invoked both from the context menu and when the
// "healingCheck" event fires.
async healingCheck(context: SohlActionContext): Promise<void> {
    const ctx = context.scope; // the SohlTriggerContext: ctx.name, ctx.worldTime, ctx.payload, …
    // … roll, apply, re-arm …
}
```

To gate a subscription, attach a `SafeExpression` predicate that reads the trigger context — e.g. `predicate: new SafeExpression({ source: "name === 'combatStart'" }, { parent })`. The dispatcher awaits the action before moving on.

The two gating axes compose: the concrete **`fireAt`** (a number the queue can order, catch up over a time jump, and expose via `nextFireTime` / `timeUntil`) handles the common "when" case declaratively, while a **`predicate`** adds arbitrary state gating. A predicate that needs live world or combat time — even on a trigger whose context doesn't carry it — can read it through the `curWorldTime()` and `curCombatTime()` helpers (e.g. `"curWorldTime() > 2342663"`, or `"defined(curCombatTime()) && curCombatTime().round > 3"`). Prefer `fireAt` for the common case, so the schedule stays introspectable (a bare `curWorldTime() > X` is not invertible to a "next fire" time); reach for the helpers only when a predicate genuinely needs cross-axis or non-monotonic conditions.

## The owner-persists-the-anchor contract (the generic `scheduledActions` store)

The queue is stateless between ticks: it holds only pending occurrences and is rebuilt from document state every preparation cycle. **It never remembers when a subscription last fired.** So any _recurring_ consumer must **persist an anchor on its own document** and derive the next `fireAt` from that anchor — never from `game.time.worldTime`.

> ⚠️ Scheduling from `game.time.worldTime + interval` is a bug for recurrence: during a time jump the clock is already at the far end, so it skips every intermediate occurrence, and because it derives from the live clock rather than a stored fact, other clients cannot reconstruct it deterministically.

The persisted anchor is the generic **`system.scheduledActions`** store (issue #588) — an entry `{ actionName, anchor, interval, sceneUuid?, payload? }` on any actor/item/combatant, whose `anchor + interval` is the next fire time. It replaces the older per-effect `last{Name}Date` schema fields (retired for trauma/affliction). Three first-class calls drive it:

- **`sohl.schedule(doc, actionName, interval, payload?, sceneUuid?)`** — persist **and** arm (both halves): writes the whole `system.scheduledActions` array (anchored at the current world time) and `scheduleAt`s the queue. The document write replicates; every client re-preps and re-arms (the active GM's queue included, which alone `fire`s).
- **`sohl.unschedule(doc, actionName)`** — clear the entry and unsubscribe (ends the recurrence).
- **`armScheduledActions(uuid, list, queue)`** in **`finalize()`** — the generic per-prep re-arm from the store, on every client. `finalize()` no longer invents or cancels a schedule of its own.

**Consent (issue #579): a recurring effect _offers_ its next occurrence — it never auto-re-arms.** When a scheduled effect comes due the queue posts an owner-gated `[Perform]` reminder (it does not run the effect); on the click the executor catches up every elapsed occurrence, then **offers to reschedule** (via `scope.reschedule` or a private default-No dialog, per the [self-sufficient action contract](https://kb.heroiclands.org/dev/concepts/action-cards/)) — accept → `sohl.schedule` the next; decline → `sohl.unschedule`. Nothing schedules or performs without a human.

```typescript
// finalize() runs on EVERY client during data prep — re-arm the store generically.
override finalize(): void {
    super.finalize();
    if (!this.item?.uuid) return;
    armScheduledActions(this.item.uuid, this.data.scheduledActions, sohl.events);
}

// The recurring action (also the [Perform]/context-menu executor). Its anchor and
// interval come from the persisted store entry — never the live clock.
async healingCheck(context) {
    const entry = this.data.scheduledActions?.find(e => e.actionName === "healingCheck");
    const interval = entry?.interval ?? this.healingInterval.effective;
    const anchor = entry?.anchor ?? fvttWorldTime();
    let level = this.data.levelBase;
    // Catch up every checkpoint elapsed since the anchor (stateful — each roll
    // sees the level the previous one left).
    for (const t of elapsedCheckpoints(anchor, fvttWorldTime(), interval)) {
        if (level <= 0) break;
        level = await rollHealingCheck(this, level, t);
    }
    const next = this.rollDuration(this.data.healingCheckDurationFormula);
    await this.item.update({ "system.levelBase": level });
    // Offer the next occurrence (default No) — or end the recurrence when healed.
    if (level <= 0) await sohl.unschedule(this.item, "healingCheck");
    else await offerReschedule(context, this.item, "healingCheck", next);
}
```

### Rolling a test from a handler — roll headlessly, GM-fired

A handler like the `rollHealingCheck` above runs on the **active GM only**, with no
user at a dialog. Resolve a d100 roll-under mastery test in that context with
{@link sohl.entity.modifier.MasteryLevelModifier.successTest} and a **`skipDialog`**
action context: the pre-roll dialog is bypassed, situational inputs are taken from
`context.scope`, and `evaluate()` rolls a fresh d100 and returns the
{@link sohl.entity.result.SuccessTestResult} — the handler reads `normSuccessLevel`
/ `isSuccess` / `isCritical` / `lastDigit` off it and decides what to apply:

```ts
// Inside a GM-fired timed handler (recovery test = Healing Base × Healing Rate):
const mlMod = new entity.MasteryLevelModifier(
    { critSuccessDigits: [0, 5], critFailureDigits: [0, 5] },
    { parent: this }, // this item/actor logic owns the result
).setBase(healingBase * healingRate);

const result = await mlMod.successTest(
    new SohlActionContext({
        speaker: this.actorLogic.speaker, // the GM owns every actor → evaluate() proceeds
        skipDialog: true, // no dialog: take modifiers from scope
        noChat: true, // optional: suppress the card when catching up many checkpoints
        scope: { situationalModifier: 0 },
    }),
);
if (!result) return level; // cancelled / refused (e.g. speaker not owned)
if (result.isSuccess) level -= 1; // heal one level
// A d100 ending in 0 or 5 is a critical (CF0 more severe than CF5) via the
// modifier's critSuccessDigits / critFailureDigits.
```

`skipDialog` makes the test headless (no user needed); `noChat` suppresses the chat
card, which matters when a handler catches up many elapsed checkpoints in one pass.
Because the handler runs as the GM, who owns every actor, the speaker is owned and
`evaluate()` proceeds.

This gives you, for free:

1. **World reload safety.** On load, every document prepares and re-subscribes from its persisted anchor. Nothing is lost across sessions.
2. **No drift.** `fireAt` is a pure function of the persisted anchor, regenerated every prep on every client; nothing ever authors it independently.
3. **Idempotent.** Re-subscribing with the same `(uuid, actionName)` is harmless — only the most recent registration sticks.
4. **Cancellation by state.** When the triggering state goes away, `finalize()` calls `unsubscribe` instead.

## Cancelling subscriptions

| Trigger          | Mechanism                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| State changed    | `finalize()` calls `sohl.events.unsubscribe(uuid, actionName)` because the triggering condition no longer applies. |
| Document deleted | Next dispatch resolves the UUID to `null` and silently skips.                                                      |
| One-shot fired   | `scheduleAt` subscriptions auto-remove before the handler runs.                                                    |
| Handler decides  | The handler may call `unsubscribe` on itself or any document mid-dispatch (subject to loop protection).            |

## Time jumps are the consumer's job, not the queue's

`fire` is **single-pass**: it dispatches each due subscription once and does **not** re-fire successors a handler arms mid-dispatch. So if world time jumps from T to T+60d and an injury only has one pending `healingTest` at T+5d, the queue fires it **once** — it does not itself produce the other eleven checks.

Producing all the elapsed occurrences is the **document's** responsibility, in its handler: loop over every checkpoint in `(lastAnchor, worldTime]`, applying each in sequence (rolls are stateful — each affects the next), then persist the advanced anchor and applied state in **one** update (see the [handler in the pattern above](#the-owner-persists-the-anchor-contract)). Its `finalize()` then re-arms the single next occurrence _beyond_ `worldTime`.

Why this split rather than an in-`fire` cascade: `fire` runs only on the active GM, so any schedule evolution done inside it would happen only on the GM and desync the clients. Routing recurrence through a document update keeps the queue a pure projection — the update replicates, and every client's `finalize()` re-derives the identical next occurrence. The randomness (the roll) happens once on the GM; the reschedule is deterministic everywhere.

## Loop protection

**Depth-counter backstop.** Re-entrant `fire(...)` calls for the same trigger name are capped at 16. Beyond that, the dispatch aborts with a console error citing the trigger name. This catches non-time loops (e.g. a `combatStart` handler that itself fires `combatStart`). No same-tick guard is needed: because there is no cascade, a handler that re-arms during dispatch simply schedules a subscription the _next_ `fire` sees.

## Custom triggers

To add a SoHL-specific trigger (e.g. `"sohlInjuryHealed"`):

```typescript
import {
    registerSohlTrigger,
    fireSohlTrigger,
} from "@src/entity/event/event-trigger";

// During system init — adds the name to CONFIG.ActiveEffect.expiryEvents
// so it appears in the effect-config UI's duration→expiry dropdown.
registerSohlTrigger("sohlInjuryHealed", "SOHL.Trigger.InjuryHealed");

// Later — fire it. This dual-dispatches to BOTH the SoHL queue AND
// Foundry's ActiveEffect.registry, so both subscribers and effects react.
await fireSohlTrigger({ name: "sohlInjuryHealed", injury, actor });
```

`fireSohlTrigger` is the only way to fire a custom trigger. Don't call `sohl.events.fire(...)` or `ActiveEffect.registry.refresh(...)` directly for custom names — that risks the two systems drifting.

## Predicate error policy

Predicates that throw are caught and logged. That dispatch is skipped; the subscription is preserved. Predicates may legitimately fail on stale data (e.g., resolving an effect that was just deleted), and one bad tick should not permanently disarm a healing check.

## Inspection and debugging

```typescript
sohl.events.size; // number of registered subscriptions
sohl.events.debug(); // sorted snapshot for the console
```

`debug()` returns a shallow copy sorted by `(triggerName, fireAt, actionName)`. Useful in the Foundry console:

```javascript
> sohl.events.debug()
[
  { uuid: "Actor.abc", actionName: "berserkerCheck", triggerName: "combatStart" },
  { uuid: "Actor.abc.Item.xyz", actionName: "healingCheck",
    triggerName: "updateWorldTime", fireAt: 1024560, oneShot: true,
    payload: { atLevel: 3 } },
]
```

## Implications for callers

`subscribe` / `unsubscribe` / `scheduleAt` run on **all** clients, so write the canonical `finalize()` subscription unconditionally — no `game.user.isGM` check. Only `fire` is GM-gated, and it is called for you by `SohlHookBridge` / `fireSohlTrigger`. Recurring consumers must persist an anchor and derive `fireAt` from it (never `game.time.worldTime`); see [the contract](#the-owner-persists-the-anchor-contract).

## See also

- [Effects Integration](./effects-integration.md) — the shared trigger vocabulary with `CONFIG.ActiveEffect.expiryEvents`
- [Calendar](./calendar.md) — the formatter for surfacing event times in sheets and chat
- [Lifecycle Hooks](../how-to/lifecycle-hooks.md) — where `finalize()` fits in the preparation cycle
