/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    getSequence,
    validateSequence,
    startInstance,
    advanceSequence,
    buildSequenceCardData,
    TREATMENT_SEQUENCE,
    TREATMENT_SEQUENCE_ID,
} from "@src/entity/sequence";

const ROLES = { patient: "Actor.pat", physician: "Actor.phys" };

describe("treatment sequence (reference implementation)", () => {
    it("is registered and structurally valid", () => {
        expect(getSequence(TREATMENT_SEQUENCE_ID)).toBe(TREATMENT_SEQUENCE);
        expect(() => validateSequence(TREATMENT_SEQUENCE)).not.toThrow();
    });

    it("addresses each step to the correct acting role", () => {
        let inst = startInstance(TREATMENT_SEQUENCE, ROLES, {
            injuryUuid: "Item.wound",
        });
        // request → patient
        expect(
            buildSequenceCardData(TREATMENT_SEQUENCE, inst).handlerUuid,
        ).toBe("Actor.pat");
        inst = advanceSequence(inst, TREATMENT_SEQUENCE, "request", {
            ok: true,
        }).instance;
        // perform → physician
        expect(
            buildSequenceCardData(TREATMENT_SEQUENCE, inst).handlerUuid,
        ).toBe("Actor.phys");
        inst = advanceSequence(inst, TREATMENT_SEQUENCE, "perform", {
            healingRate: 4,
        }).instance;
        // accept → patient
        expect(
            buildSequenceCardData(TREATMENT_SEQUENCE, inst).handlerUuid,
        ).toBe("Actor.pat");
    });

    it("threads the wound, request, and result through the ledger and terminates", () => {
        let inst = startInstance(TREATMENT_SEQUENCE, ROLES, {
            injuryUuid: "Item.wound",
        });
        inst = advanceSequence(inst, TREATMENT_SEQUENCE, "request", {
            at: "now",
        }).instance;
        inst = advanceSequence(inst, TREATMENT_SEQUENCE, "perform", {
            healingRate: 4,
        }).instance;
        const end = advanceSequence(inst, TREATMENT_SEQUENCE, "accept", null);
        expect(end.done).toBe(true);
        expect(end.instance.state).toEqual({
            injuryUuid: "Item.wound",
            request: { at: "now" },
            result: { healingRate: 4 },
        });
    });

    it("projects the ledger into each action's scope", () => {
        const inst = startInstance(TREATMENT_SEQUENCE, ROLES, {
            injuryUuid: "Item.wound",
        });
        const performChoice = TREATMENT_SEQUENCE.steps.perform.choices[0];
        expect(performChoice.scope?.({ injuryUuid: "Item.wound" })).toEqual({
            injuryUuid: "Item.wound",
        });
        expect(performChoice.action).toBe("performTreatment");
        // The perform step's card is addressed to the physician.
        expect(TREATMENT_SEQUENCE.steps.perform.by).toBe("physician");
        expect(inst.stepId).toBe("request");
    });
});
