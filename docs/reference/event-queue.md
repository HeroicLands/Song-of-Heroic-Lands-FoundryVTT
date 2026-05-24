---
aliases:
    - Event Queue
    - Timed Events
    - SohlEventQueue
    - sohl.events
tags:
    - core-system
    - time
    - lifecycle
audience: Developers wiring time-based document behavior (healing, ageing, bleeding, scheduled checks).
---

# Event Queue

How documents schedule work to fire at a future in-world time, and how that work is dispatched when world time advances.

See also: [Calendar](./calendar.md), [Injuries and Healing](./injuries-healing.md), [Lifecycle Hooks](../how-to/lifecycle-hooks.md).

## What it is

`sohl.events` (an instance of [`SohlEventQueue`](../../src/core/SohlEventQueue.ts)) is a lightweight in-memory dispatcher for timed events. A document — an injury, an affliction, a cohort, a piece of decaying gear — can register an event to fire at some `worldTime` in the future. When `game.time.worldTime` advances past that time, the queue calls back into the document, which decides what to do.

The queue is a **dispatch engine**. It carries no game rules — every rule lives in the handler on the document.

## Architecture

### Identity

Each event is keyed by **`uuid + kind`**. A document may have at most one pending event of a given kind. Registering a new event with the same identity silently replaces the previous one — this is the intended pattern (see [The re-registration pattern](#the-re-registration-pattern)).

### Storage

Events live in an in-memory `Map<key, SohlTimedEvent>` on `sohl.events`. **Nothing is persisted.** If the world closes and reopens, the queue starts empty. Documents are expected to re-register their events on every preparation cycle, so the queue rebuilds itself on world load.

### Replication

Every **GM** client maintains its own copy of the queue, populated by its own document preparation. Only the **primary GM** dispatches events (`fvttIsActiveGM()` gate inside `processDueEvents`). If the primary GM disconnects and another GM is promoted, the promoted client already has a complete queue and starts dispatching seamlessly.

**Non-GM clients are entirely opted out.** `registerEvent`, `unregisterEvent`, and `processDueEvents` all early-return when `fvttIsCurrentUserGM()` is false. A player client's queue stays empty — no memory cost, no work, no need to handle "what does a player see when an event fires." Player-facing UI surfaces (e.g., a sheet showing "next healing check at …") that depend on event data should read it from the document's persisted state, not from `sohl.events`.

### Hook integration

The system installs an `updateWorldTime` hook in [src/sohl.ts:270-276](../../src/sohl.ts#L270-L276):

```typescript
Hooks.on("updateWorldTime", async (worldTime: number) => {
    if (!game.user?.isActiveGM) return;
    await sohl.events.processDueEvents(worldTime);
});
```

Anything that advances world time — combat round ticks, the time control UI, a calendar module, `game.time.advance()` — triggers this hook. The GM's client then processes every due event before the hook chain returns.

## API surface

### `registerEvent(uuid, kind, time, payload?)`

Schedule a new event, or overwrite an existing one with the same `uuid + kind`. **No-op on non-GM clients.**

| Parameter | Type                                 | Purpose                                                                                                                                           |
| --------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uuid`    | string                               | UUID of the owning document. Used at dispatch time to resolve the live document via `fromUuid`.                                                   |
| `kind`    | string                               | Event kind identifier, scoped to the document. Convention: lowerCamelCase verbs (`"healingTest"`, `"bleedingCheck"`, `"courseTest"`).             |
| `time`    | number                               | Trigger time in world seconds — same units as `game.time.worldTime`.                                                                              |
| `payload` | `Record<string, unknown>` (optional) | Plain-object context handed back to the handler. Use for values that may change after registration (e.g., the injury level at registration time). |

Loop protection: if called during event processing with a `time ≤ the currently-processing event's time`, the registration is discarded and a warning is logged. See [Loop protection](#loop-protection).

### `unregisterEvent(uuid, kind)`

Remove an event by `uuid + kind`. Safe to call even if no such event exists. **No-op on non-GM clients.**

### `processDueEvents(worldTime)` _(internal)_

Called by the `updateWorldTime` hook. You should not call this directly.

The loop: find the earliest event → if its `time > worldTime`, stop → otherwise remove it → resolve the document → call `doc.handleSohlEvent(kind, time, payload)` → repeat. The event is removed from the queue **before** dispatch, so a handler that throws can't be re-dispatched in a loop; the error is logged and processing continues.

### `size` / `nextEventTime` / `clear()` / `debug()`

Inspection helpers. `debug()` returns a time-sorted snapshot for use in dev tooling. `clear()` empties the queue — useful in tests; rarely needed at runtime.

## Handling events on documents

Both [`SohlItem`](../../src/document/item/foundry/SohlItem.ts) and [`SohlActor`](../../src/document/actor/foundry/SohlActor.ts) declare an `async handleSohlEvent(kind, time, payload?)` method. The base implementations are no-op stubs that log a warning for unhandled kinds. **Document subclasses (or their Logic classes) are expected to override this method** to implement per-kind behavior.

The base signature:

```typescript
async handleSohlEvent(
    kind: string,
    time: number,
    payload?: Record<string, unknown>,
): Promise<void>;
```

A typical override dispatches on `kind`:

```typescript
async handleSohlEvent(
    kind: string,
    time: number,
    payload?: Record<string, unknown>,
): Promise<void> {
    switch (kind) {
        case "healingTest":
            await this.runHealingTest(payload);
            break;
        case "bleedingCheck":
            await this.runBleedingCheck(payload);
            break;
        default:
            return super.handleSohlEvent(kind, time, payload);
    }
}
```

Always delegate unknown kinds to `super.handleSohlEvent` so the base "unhandled event" warning fires for typos. Always `await` your mutations — the dispatcher awaits your handler before moving to the next event.

## The re-registration pattern

The queue isn't persisted; it's rebuilt from document state on every preparation cycle. The canonical pattern is to register events from a Logic class's `finalize()` (or equivalent end-of-preparation hook):

```typescript
// In a Logic class that owns the lifecycle for an Injury item
finalize(): void {
    super.finalize();

    if (this.data.levelBase <= 0) {
        // Fully healed — make sure no stale event lingers
        sohl.events.unregisterEvent(this.item.uuid, "healingTest");
        return;
    }

    const interval = game.settings.get("sohl", "healingSeconds") as number;
    sohl.events.registerEvent(
        this.item.uuid,
        "healingTest",
        game.time.worldTime + interval,
        { atLevel: this.data.levelBase },
    );
}
```

This pattern gives you four properties for free:

1. **World reload safety.** When the world loads, every document prepares and re-registers its events. Nothing is lost across sessions.
2. **No drift.** A handler that updates the document triggers re-preparation, which re-runs `finalize()` and registers the next event. No manual "schedule the next one" call needed.
3. **Idempotent.** Registering the same `uuid + kind` repeatedly is harmless — only the most recent registration sticks.
4. **Cancellation by state.** When the triggering state goes away (injury healed, affliction cured, gear destroyed), `finalize()` calls `unregisterEvent` instead of `registerEvent`.

## Cancelling events

Three ways an event can stop firing:

| Trigger          | Mechanism                                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| State changed    | The document's `finalize()` calls `sohl.events.unregisterEvent(uuid, kind)` because the triggering condition no longer applies.                                  |
| Document deleted | Next dispatch attempt resolves the UUID to `null` via `fvttResolveUuidAsync` and skips silently. The event entry is removed before dispatch, so it doesn't leak. |
| Handler decides  | The handler can call `sohl.events.unregisterEvent` on itself or any other document mid-dispatch (subject to loop protection).                                    |

There is no "fire once and clean up" affordance — events are always removed before dispatch. If you want a recurring event, the handler (or the document's `finalize()`) must register the next one explicitly.

## Loop protection

If a handler — or any code that runs during dispatch — calls `registerEvent(uuid, kind, time)` with `time ≤ the currently-processing event's time`, the registration is **discarded** and a warning is logged. This prevents an infinite loop where a handler re-registers itself at the same moment.

The protection only applies inside the dispatch loop. Normal preparation-time `registerEvent` calls always succeed.

Implication: don't try to "register myself again for right now" from a handler. Either advance the trigger time by at least one second, or let the handler complete and rely on document re-preparation to re-register.

## Large time jumps

When world time advances by hours, days, or months in a single step (`game.time.advance(seconds)`, calendar UI, etc.), the queue processes **every** due event in sequence. If an injury schedules a healing check every 5 days and the GM advances time by a month, six healing checks fire in chronological order, each producing its own document mutation and re-registration.

This is the right behavior for most use cases. If you have a kind where "skip to the latest" makes more sense than "replay every step", encode that explicitly in the handler — the queue won't do it for you.

## Inspection and debugging

```typescript
sohl.events.size; // number of queued events
sohl.events.nextEventTime; // worldTime of the next event, or undefined
sohl.events.debug(); // sorted snapshot for the console
```

`debug()` returns a shallow copy of the queue sorted ascending by time. Useful in the Foundry console:

```javascript
> sohl.events.debug()
[
  { uuid: "Actor.abc.Item.xyz", kind: "healingTest", time: 1024560, payload: { atLevel: 3 } },
  { uuid: "Actor.abc.Item.def", kind: "bleedingCheck", time: 1024860, payload: undefined },
]
```

## Implications for callers

Because every public method is a no-op on non-GM clients, code that registers events does **not** need to check `game.user.isGM` first — the queue handles the gate itself. Write the canonical `finalize()` registration unconditionally:

```typescript
finalize(): void {
    super.finalize();
    sohl.events.registerEvent(this.item.uuid, "healingTest", nextTime);
}
```

On a player client this call returns immediately. On every GM client it inserts (or overwrites) the event. The queue's `_events` Map on a player stays empty for the life of the session.

## See also

- [Calendar](./calendar.md) — the formatter for surfacing event times in sheets and chat
- [Injuries and Healing](./injuries-healing.md) — the first user of the queue
- [Lifecycle Hooks](../how-to/lifecycle-hooks.md) — where `finalize()` fits in the preparation cycle
