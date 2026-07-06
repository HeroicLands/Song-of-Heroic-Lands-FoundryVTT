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

`combatEnd` is dispatched when Foundry fires `deleteCombat` (combat document deletion). `roundEnd` / `turnEnd` are derived in [`SohlHookBridge`](../../src/core/SohlHookBridge.ts) by tracking the prior state per-combat across `combatRound` / `combatTurn` invocations.

Custom triggers are registered via [`registerSohlTrigger`](#custom-triggers).

## Architecture

### Identity

Each subscription is keyed by **`(uuid, kind)`**. A document may have at most one subscription per kind. Re-subscribing with the same identity silently replaces the previous entry (trigger, fireAt, predicate, payload, oneShot are all overwritten).

### Storage

Subscriptions live in an in-memory `Map<key, SohlSubscription>` on `sohl.events`. **Nothing is persisted.** If the world closes and reopens, the queue starts empty. Documents are expected to re-subscribe on every preparation cycle so the queue rebuilds itself on world load.

### Replication

Every **GM** client maintains its own copy of the queue, populated by its own document preparation. Only the **active GM** dispatches triggers — every `fire` call is gated by `fvttIsActiveGM()`. If the active GM disconnects and another GM is promoted, the promoted client already has a complete queue and continues dispatching seamlessly.

**Non-GM clients are entirely opted out.** `subscribe`, `unsubscribe`, `scheduleAt`, and `fire` all early-return when the local user is not a GM (or not the active GM for `fire`). A player client's queue stays empty.

### Hook integration

All Foundry hook wiring lives in a single module, [`SohlHookBridge`](../../src/core/SohlHookBridge.ts). It listens to `updateWorldTime`, `combatStart`, `deleteCombat`, `combatRound`, and `combatTurn`, and translates each into one or more `queue.fire(ctx)` calls. **Do not call `Hooks.on(...)` from elsewhere for trigger dispatch.** Adding a new built-in trigger means editing one file.

`SohlHookBridge` is wired during system init from [`sohl.ts`](../../src/sohl.ts):

```typescript
wireSohlHookBridge(sohl.events);
```

SoHL does **not** re-fire `ActiveEffect.registry.refresh(...)` for built-in triggers. Foundry's own code already calls the registry next to each hook (`client/helpers/time.mjs`, `client/documents/combat.mjs`), so dual-dispatching would expire effects twice. Only custom triggers fired through [`fireSohlTrigger`](#custom-triggers) dual-dispatch.

## API surface

### `subscribe(sub)`

Register or overwrite a subscription. **No-op on non-GM clients.**

```typescript
sohl.events.subscribe({
    uuid: actor.uuid,
    kind: "berserkerCheck",
    triggerName: "combatStart",
    payload: { threshold: 12 },
});
```

| Field         | Type               | Purpose                                                                                                                 |
| ------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `uuid`        | string             | UUID of the owning document. Resolved via `fromUuid` at dispatch time.                                                  |
| `kind`        | string             | Subscription identifier, scoped to the document. Convention: lowerCamelCase verbs.                                      |
| `triggerName` | string             | The trigger to listen to (must match a `ctx.name` passed to `fire`).                                                    |
| `fireAt?`     | number             | Optional scheduled world-time. Required for `updateWorldTime` subscriptions when you want time-based dispatch ordering. |
| `predicate?`  | `(ctx) => boolean` | Optional filter. Returning false skips this dispatch (subscription preserved).                                          |
| `payload?`    | object             | Optional data handed back to the handler as the third argument.                                                         |
| `oneShot?`    | boolean            | If true, the subscription is removed before its handler runs. Set automatically by `scheduleAt`.                        |

### `scheduleAt(uuid, kind, fireAt, payload?)`

Convenience for the most common case: a one-shot `updateWorldTime` subscription that fires when `worldTime >= fireAt`.

```typescript
sohl.events.scheduleAt(
    injury.uuid,
    "healingTest",
    game.time.worldTime + healingInterval,
    { atLevel: injury.system.levelBase },
);
```

The subscription auto-removes after firing. Recurring schedules require the handler to call `scheduleAt` again — see [The re-subscription pattern](#the-re-subscription-pattern).

### `unsubscribe(uuid, kind)`

Remove a subscription. Safe to call when no subscription exists. **No-op on non-GM clients.**

### `fire(ctx)` _(internal)_

Dispatch a trigger. Called by `SohlHookBridge` and by [`fireSohlTrigger`](#custom-triggers). You should not call this directly.

For `updateWorldTime`, `fire` uses a cascading loop so handlers may schedule successors that dispatch within the same call (see [Cascading dispatch](#cascading-dispatch-on-updateworldtime)). For all other triggers, `fire` dispatches each matching subscription once in insertion order.

### `size` / `clear()` / `debug()`

Inspection helpers. `debug()` returns a snapshot sorted by `(triggerName, fireAt, kind)`. `clear()` empties the queue — useful in tests; rarely needed at runtime.

## Handling triggers on documents

Both [`SohlItem`](../../src/document/item/foundry/SohlItem.ts) and [`SohlActor`](../../src/document/actor/foundry/SohlActor.ts) declare an `async handleSohlEvent(kind, context, payload?)` method. The base implementations log a warning for unhandled kinds; document subclasses override to implement behavior.

```typescript
async handleSohlEvent(
    kind: string,
    context: SohlTriggerContext,
    payload?: Record<string, unknown>,
): Promise<void> {
    switch (kind) {
        case "healingTest":
            // context.name === "updateWorldTime"
            await this.runHealingTest(context.worldTime, payload);
            break;
        case "berserkerCheck":
            // context.name === "combatStart"
            await this.runBerserkerCheck(context.combat);
            break;
        default:
            return super.handleSohlEvent(kind, context, payload);
    }
}
```

Always delegate unknown kinds to `super.handleSohlEvent` so the base "unhandled event" warning fires for typos. Always `await` your mutations — the dispatcher awaits your handler before moving on.

## The re-subscription pattern

The queue isn't persisted; it rebuilds from document state on every preparation cycle. The canonical pattern is to register subscriptions from a Logic class's `finalize()`:

```typescript
finalize(): void {
    super.finalize();

    if (this.data.levelBase <= 0) {
        sohl.events.unsubscribe(this.item.uuid, "healingTest");
        return;
    }

    const interval = game.settings.get("sohl", "healingSeconds") as number;
    sohl.events.scheduleAt(
        this.item.uuid,
        "healingTest",
        game.time.worldTime + interval,
        { atLevel: this.data.levelBase },
    );
}
```

This pattern gives you four properties for free:

1. **World reload safety.** When the world loads, every document prepares and re-subscribes. Nothing is lost across sessions.
2. **No drift.** A handler that updates the document triggers re-preparation, which re-runs `finalize()` and schedules the next event. No manual "schedule the next one" call needed.
3. **Idempotent.** Re-subscribing with the same `(uuid, kind)` is harmless — only the most recent registration sticks.
4. **Cancellation by state.** When the triggering state goes away, `finalize()` calls `unsubscribe` instead of `subscribe`.

## Cancelling subscriptions

| Trigger          | Mechanism                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| State changed    | `finalize()` calls `sohl.events.unsubscribe(uuid, kind)` because the triggering condition no longer applies. |
| Document deleted | Next dispatch resolves the UUID to `null` and silently skips.                                                |
| One-shot fired   | `scheduleAt` subscriptions auto-remove before the handler runs.                                              |
| Handler decides  | The handler may call `unsubscribe` on itself or any document mid-dispatch (subject to loop protection).      |

## Cascading dispatch on `updateWorldTime`

If world time advances from T to T+60d and an injury's `scheduleAt` fires at T+5d whose handler re-schedules at `prevFireAt + 5d`, all 12 intermediate checks fire in chronological order inside the single `fire(...)` call. The algorithm:

1. Find every `updateWorldTime` subscription whose `fireAt` is undefined or ≤ current `worldTime` and whose predicate passes.
2. Dispatch the one with the smallest `fireAt`.
3. The handler may schedule a successor.
4. Repeat until no `updateWorldTime` subscriptions remain due.

Subscriptions added mid-cascade with `fireAt > worldTime` wait for the next `updateWorldTime` invocation. Non-`updateWorldTime` subscriptions added mid-cascade wait for the next dispatch of their trigger.

## Loop protection

Two layers:

**Same-tick guard.** During an `updateWorldTime` dispatch the queue tracks `_processingFireAt` — the scheduled time of the event currently firing. A call to `scheduleAt(uuid, kind, fireAt)` with `fireAt ≤ _processingFireAt` is discarded with a console warning. Re-scheduling at strictly greater `fireAt` (cascading) is allowed.

**Depth-counter backstop.** Re-entrant `fire(...)` calls for the same trigger name are capped at 16. Beyond that, the dispatch aborts with a console error citing the trigger name and offending `(uuid, kind)`. This catches non-time loops the same-tick guard can't see (e.g., a `combatStart` handler that itself fires `combatStart`).

Implication: don't try to "fire myself again for right now" from a handler. Advance `fireAt` by at least one second, or let the handler complete and rely on re-preparation to re-subscribe.

## Custom triggers

To add a SoHL-specific trigger (e.g. `"sohlInjuryHealed"`):

```typescript
import {
    registerSohlTrigger,
    fireSohlTrigger,
} from "@src/entity/event/SohlEventTrigger";

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

`debug()` returns a shallow copy sorted by `(triggerName, fireAt, kind)`. Useful in the Foundry console:

```javascript
> sohl.events.debug()
[
  { uuid: "Actor.abc", kind: "berserkerCheck", triggerName: "combatStart" },
  { uuid: "Actor.abc.Item.xyz", kind: "healingTest",
    triggerName: "updateWorldTime", fireAt: 1024560, oneShot: true,
    payload: { atLevel: 3 } },
]
```

## Implications for callers

Because every write method is a no-op on non-GM clients, code that subscribes does **not** need to check `game.user.isGM` first — the queue handles the gate itself. Write the canonical `finalize()` subscription unconditionally.

## See also

- [Effects Integration](./effects-integration.md) — the shared trigger vocabulary with `CONFIG.ActiveEffect.expiryEvents`
- [Calendar](./calendar.md) — the formatter for surfacing event times in sheets and chat
- [Lifecycle Hooks](../how-to/lifecycle-hooks.md) — where `finalize()` fits in the preparation cycle
