/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    defineSequence,
    getSequence,
    validateSequence,
    startInstance,
    renderableChoices,
    advanceSequence,
    buildSequenceCardData,
    type SequenceDefinition,
} from "@src/entity/sequence";

/** A tiny 3-step request → perform → accept sequence for driving the engine. */
function makeDef(id = "test-seq"): SequenceDefinition {
    return {
        id,
        roles: ["patient", "physician"],
        initial: "request",
        steps: {
            request: {
                by: "patient",
                card: (s) => ({ title: "Request", body: `wound ${s.wound}` }),
                choices: [
                    {
                        key: "request",
                        label: "Request Treatment",
                        action: "requestTreatment",
                        scope: (s) => ({ wound: s.wound }),
                        reduce: (s, r) => ({ ...s, requested: r }),
                        next: "perform",
                    },
                ],
            },
            perform: {
                by: "physician",
                card: () => ({ title: "Perform Treatment Test" }),
                choices: [
                    {
                        key: "perform",
                        label: "Perform",
                        action: "treatmenttest",
                        reduce: (s, r) => ({ ...s, result: r }),
                        next: "accept",
                    },
                ],
            },
            accept: {
                by: "patient",
                card: (s) => ({ title: `Result: ${s.result}` }),
                choices: [
                    {
                        key: "accept",
                        label: "Accept",
                        action: "acceptTreatment",
                        next: null,
                    },
                ],
            },
        },
    };
}

const ROLES = { patient: "Actor.pat", physician: "Actor.phys" };

describe("validateSequence", () => {
    it("accepts a well-formed definition", () => {
        expect(() => validateSequence(makeDef())).not.toThrow();
    });

    it("rejects an initial step that does not exist", () => {
        const def = makeDef();
        def.initial = "nope";
        expect(() => validateSequence(def)).toThrow(/initial/i);
    });

    it("rejects a static next target that does not exist", () => {
        const def = makeDef();
        (def.steps.request.choices[0] as any).next = "nowhere";
        expect(() => validateSequence(def)).toThrow(/next/i);
    });

    it("rejects a step whose `by` role is not declared", () => {
        const def = makeDef();
        (def.steps.request as any).by = "stranger";
        expect(() => validateSequence(def)).toThrow(/role/i);
    });
});

describe("defineSequence / getSequence", () => {
    it("registers and retrieves a sequence by id", () => {
        const def = makeDef("reg-1");
        expect(defineSequence(def)).toBe(def);
        expect(getSequence("reg-1")).toBe(def);
    });

    it("rejects a duplicate id", () => {
        defineSequence(makeDef("reg-2"));
        expect(() => defineSequence(makeDef("reg-2"))).toThrow(/already/i);
    });

    it("returns undefined for an unknown id", () => {
        expect(getSequence("no-such-seq")).toBeUndefined();
    });
});

describe("startInstance", () => {
    it("starts at the initial step with the given roles and state", () => {
        const inst = startInstance(makeDef(), ROLES, { wound: "arm" });
        expect(inst).toEqual({
            sequenceId: "test-seq",
            stepId: "request",
            roles: ROLES,
            state: { wound: "arm" },
        });
    });
});

describe("renderableChoices", () => {
    it("returns all choices whose `when` passes (default: always)", () => {
        const step = makeDef().steps.request;
        expect(renderableChoices(step, {}).map((c) => c.key)).toEqual([
            "request",
        ]);
    });

    it("filters out choices whose `when` is false", () => {
        const step = {
            by: "patient",
            card: () => ({ title: "x" }),
            choices: [
                { key: "a", label: "A", action: "act", next: null },
                {
                    key: "b",
                    label: "B",
                    action: "act",
                    when: (s: any) => s.showB === true,
                    next: null,
                },
            ],
        } as any;
        expect(
            renderableChoices(step, { showB: false }).map((c) => c.key),
        ).toEqual(["a"]);
        expect(
            renderableChoices(step, { showB: true }).map((c) => c.key),
        ).toEqual(["a", "b"]);
    });
});

describe("advanceSequence", () => {
    it("folds the action result via reduce and moves to the static next step", () => {
        const def = makeDef();
        const inst = startInstance(def, ROLES, { wound: "arm" });
        const { instance, done } = advanceSequence(inst, def, "request", {
            ok: true,
        });
        expect(done).toBe(false);
        expect(instance.stepId).toBe("perform");
        expect(instance.state).toEqual({
            wound: "arm",
            requested: { ok: true },
        });
    });

    it("is terminal (done) when next is null", () => {
        const def = makeDef();
        const inst = {
            sequenceId: def.id,
            stepId: "accept",
            roles: ROLES,
            state: { result: "MS" },
        };
        const { done } = advanceSequence(inst, def, "accept", null);
        expect(done).toBe(true);
    });

    it("supports a function `next(result)`", () => {
        const def = makeDef();
        (def.steps.request.choices[0] as any).next = (r: any) =>
            r.branch === "x" ? "accept" : "perform";
        const inst = startInstance(def, ROLES, {});
        expect(
            advanceSequence(inst, def, "request", { branch: "x" }).instance
                .stepId,
        ).toBe("accept");
        expect(
            advanceSequence(inst, def, "request", { branch: "y" }).instance
                .stepId,
        ).toBe("perform");
    });

    it("throws for an unknown choice key", () => {
        const def = makeDef();
        const inst = startInstance(def, ROLES, {});
        expect(() => advanceSequence(inst, def, "nope", null)).toThrow(
            /choice/i,
        );
    });
});

describe("buildSequenceCardData", () => {
    it("renders the step content, the acting role's handler uuid, and a button per choice", () => {
        const def = makeDef();
        const inst = startInstance(def, ROLES, { wound: "arm" });
        const data = buildSequenceCardData(def, inst);
        expect(data).toMatchObject({
            sequenceId: "test-seq",
            stepId: "request",
            title: "Request",
            body: "wound arm",
            handlerUuid: "Actor.pat", // the `by: patient` role
        });
        expect(data.buttons).toEqual([
            {
                action: "requestTreatment",
                choiceKey: "request",
                label: "Request Treatment",
                iconFAClass: undefined,
            },
        ]);
    });

    it("addresses the card to the current step's acting role", () => {
        const def = makeDef();
        const inst = { ...startInstance(def, ROLES, {}), stepId: "perform" };
        expect(buildSequenceCardData(def, inst).handlerUuid).toBe("Actor.phys");
    });
});

describe("end-to-end walk of the treatment-shaped sequence", () => {
    it("threads state through request → perform → accept and terminates", () => {
        const def = makeDef();
        let inst = startInstance(def, ROLES, { wound: "arm" });

        // request (patient) → perform
        expect(buildSequenceCardData(def, inst).handlerUuid).toBe("Actor.pat");
        inst = advanceSequence(inst, def, "request", { ok: true }).instance;
        expect(inst.stepId).toBe("perform");

        // perform (physician) → accept
        expect(buildSequenceCardData(def, inst).handlerUuid).toBe("Actor.phys");
        inst = advanceSequence(inst, def, "perform", "MS").instance;
        expect(inst.stepId).toBe("accept");
        expect(buildSequenceCardData(def, inst).title).toBe("Result: MS");

        // accept (patient) → done
        expect(buildSequenceCardData(def, inst).handlerUuid).toBe("Actor.pat");
        const end = advanceSequence(inst, def, "accept", null);
        expect(end.done).toBe(true);
        expect(end.instance.state).toEqual({
            wound: "arm",
            requested: { ok: true },
            result: "MS",
        });
    });
});
