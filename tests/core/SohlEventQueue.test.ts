import { describe, it } from "vitest";

// NOTE: SohlEventQueue imports @common/foundry-helpers which currently
// fails to resolve in the test environment. Once the alias configuration
// is fixed, the real tests below can be enabled by importing:
//   import { SohlEventQueue } from"@src/common/SohlEventQueue";

describe("SohlEventQueue", () => {
    describe("registerEvent", () => {
        it.todo("adds an event to the queue");
        it.todo("overwrites an existing event with the same uuid+kind");
        it.todo("stores separate events for different kinds on the same uuid");
        it.todo("stores separate events for different uuids with same kind");
        it.todo(
            "discards event with time <= current processing time during dispatch (loop protection)",
        );
    });

    describe("unregisterEvent", () => {
        it.todo("removes an existing event");
        it.todo("is safe to call for non-existent events");
    });

    describe("processDueEvents", () => {
        it.todo("only processes on the active GM client");
        it.todo("dispatches events whose time <= worldTime");
        it.todo("processes events in chronological order (earliest first)");
        it.todo("removes dispatched events from the queue");
        it.todo("calls handleSohlEvent on the resolved document");
        it.todo("skips silently when document UUID no longer resolves");
        it.todo("warns when document does not implement handleSohlEvent");
        it.todo("catches and logs errors from event handlers");
        it.todo("handles cascading events (handler registers new due event)");
        it.todo("resets _processingTime to null after completion");
    });

    describe("size", () => {
        it.todo("returns 0 for an empty queue");
        it.todo("returns the number of registered events");
    });

    describe("nextEventTime", () => {
        it.todo("returns undefined for an empty queue");
        it.todo("returns the earliest scheduled time");
    });

    describe("clear", () => {
        it.todo("removes all events from the queue");
    });

    describe("debug", () => {
        it.todo("returns an empty array for an empty queue");
        it.todo("returns events sorted by ascending time");
        it.todo("includes uuid, kind, time, and payload in each event");
    });
});
