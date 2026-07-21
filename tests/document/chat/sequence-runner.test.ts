/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import {
    startSequence,
    runSequenceStep,
} from "@src/document/chat/sequence-runner";
import { defineSequence } from "@src/entity/sequence";
import { defaultToJSON } from "@src/utils/helpers";

/** A two-step test sequence: s1 (role a) → s2 (role b) → done. */
beforeAll(() => {
    defineSequence({
        id: "runner-test",
        roles: ["a", "b"],
        initial: "s1",
        steps: {
            s1: {
                by: "a",
                card: () => ({ title: "S1" }),
                choices: [
                    {
                        key: "go",
                        label: "Go",
                        action: "doStep",
                        scope: (s) => ({ x: s.x }),
                        reduce: (s, r) => ({ ...s, r }),
                        next: "s2",
                    },
                ],
            },
            s2: {
                by: "b",
                card: () => ({ title: "S2" }),
                choices: [
                    { key: "end", label: "End", action: "doEnd", next: null },
                ],
            },
        },
    });
});

afterEach(() => vi.restoreAllMocks());

const ROLES = { a: "Actor.a", b: "Actor.b" };

/** A detached sequence button carrying the coordinates + serialized instance. */
function seqBtn(stepId: string, choiceKey: string, state: object): HTMLElement {
    return {
        dataset: {
            sequenceId: "runner-test",
            stepId,
            choiceKey,
            scope: JSON.stringify(defaultToJSON({ roles: ROLES, state })),
        },
    } as unknown as HTMLElement;
}

/** A stub acting logic whose method-fallback actions are vi.fns, with a speaker. */
function actingLogic(methods: Record<string, any>) {
    return {
        actions: new Map(),
        speaker: { toChat: vi.fn().mockResolvedValue(null) },
        ...methods,
    };
}

describe("startSequence", () => {
    it("posts the initial step's card via the initiator's speaker", async () => {
        const speaker = { toChat: vi.fn().mockResolvedValue(null) };
        await startSequence(
            (await import("@src/entity/sequence")).getSequence("runner-test")!,
            ROLES,
            { x: 1 },
            speaker,
        );
        expect(speaker.toChat).toHaveBeenCalledOnce();
        const data = speaker.toChat.mock.calls[0][1];
        expect(data.stepId).toBe("s1");
        // The button targets role a (its handler / gate).
        expect(data.handlerUuid).toBe("Actor.a");
        expect(data.buttons).toEqual([
            expect.objectContaining({ choiceKey: "go", action: "doStep" }),
        ]);
    });
});

describe("runSequenceStep", () => {
    it("runs the choice's action, advances, and posts the next card via the actor who just acted", async () => {
        const doStep = vi.fn().mockResolvedValue({ ok: true });
        const logic = actingLogic({ doStep });

        await runSequenceStep(logic as any, seqBtn("s1", "go", { x: 7 }));

        // The choice's action ran with the ledger-projected scope + skipDialog.
        expect(doStep).toHaveBeenCalledOnce();
        const ctx = doStep.mock.calls[0][0];
        expect(ctx.skipDialog).toBe(true);
        expect(ctx.scope).toEqual({ x: 7 });

        // Advanced to s2; the next card is spoken by the acting logic and its
        // button targets role b.
        expect(logic.speaker.toChat).toHaveBeenCalledOnce();
        const data = logic.speaker.toChat.mock.calls[0][1];
        expect(data.stepId).toBe("s2");
        expect(data.handlerUuid).toBe("Actor.b");
    });

    it("does not advance when the action returns undefined (aborted / self-gated)", async () => {
        // A non-terminal step whose action returns undefined did not complete:
        // the sequence stays put and posts no next card (the card remains live).
        const doStep = vi.fn().mockResolvedValue(undefined);
        const logic = actingLogic({ doStep });
        await runSequenceStep(logic as any, seqBtn("s1", "go", { x: 1 }));
        expect(doStep).toHaveBeenCalledOnce();
        expect(logic.speaker.toChat).not.toHaveBeenCalled(); // no next card
    });

    it("does not post a next card on a terminal choice", async () => {
        const doEnd = vi.fn().mockResolvedValue({ ok: true });
        const logic = actingLogic({ doEnd });
        await runSequenceStep(logic as any, seqBtn("s2", "end", {}));
        expect(doEnd).toHaveBeenCalledOnce();
        // A terminal step folds/records but posts no further card.
        expect(logic.speaker.toChat).not.toHaveBeenCalled();
    });

    it("warns and does nothing for an unknown sequence", async () => {
        const warn = vi.spyOn(sohl.log, "warn");
        const btn = {
            dataset: { sequenceId: "nope", stepId: "s1", choiceKey: "go" },
        } as unknown as HTMLElement;
        await runSequenceStep(actingLogic({}) as any, btn);
        expect(warn).toHaveBeenCalled();
    });

    it("warns for an unknown choice key", async () => {
        const warn = vi.spyOn(sohl.log, "warn");
        await runSequenceStep(
            actingLogic({}) as any,
            seqBtn("s1", "bogus", {}),
        );
        expect(warn).toHaveBeenCalled();
    });
});
