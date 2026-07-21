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

// The `self` role is bound to the @self sentinel (open); `injury` to the wound.
const ROLES = { self: "@self", injury: "Item.wound" };

describe("treatment sequence (reference implementation)", () => {
    it("is registered and structurally valid", () => {
        expect(getSequence(TREATMENT_SEQUENCE_ID)).toBe(TREATMENT_SEQUENCE);
        expect(() => validateSequence(TREATMENT_SEQUENCE)).not.toThrow();
    });

    it("opens with the perform card (self), then targets the injury for accept", () => {
        let inst = startInstance(TREATMENT_SEQUENCE, ROLES, {
            injuryUuid: "Item.wound",
            patientName: "Aldric",
        });
        // perform → open (@self): any player answers with their own character.
        expect(inst.stepId).toBe("perform");
        expect(
            buildSequenceCardData(TREATMENT_SEQUENCE, inst).handlerUuid,
        ).toBe("@self");
        inst = advanceSequence(inst, TREATMENT_SEQUENCE, "perform", {
            healingRate: 4,
            physicianName: "Brygga",
        }).instance;
        // accept → the injury (owned by the patient).
        expect(inst.stepId).toBe("accept");
        expect(
            buildSequenceCardData(TREATMENT_SEQUENCE, inst).handlerUuid,
        ).toBe("Item.wound");
    });

    it("threads the result through the ledger and terminates on accept", () => {
        let inst = startInstance(TREATMENT_SEQUENCE, ROLES, {
            injuryUuid: "Item.wound",
        });
        inst = advanceSequence(inst, TREATMENT_SEQUENCE, "perform", {
            healingRate: 4,
            physicianName: "Brygga",
        }).instance;
        const end = advanceSequence(inst, TREATMENT_SEQUENCE, "accept", {
            healingRate: 4,
        });
        expect(end.done).toBe(true);
        expect(end.instance.state).toEqual({
            injuryUuid: "Item.wound",
            result: { healingRate: 4, physicianName: "Brygga" },
        });
    });

    it("the accept step hands treatInjury the proposed Healing Rate", () => {
        const inst = advanceSequence(
            startInstance(TREATMENT_SEQUENCE, ROLES, {
                injuryUuid: "Item.wound",
            }),
            TREATMENT_SEQUENCE,
            "perform",
            { healingRate: 4, physicianName: "Brygga" },
        ).instance;
        const acceptChoice = TREATMENT_SEQUENCE.steps.accept.choices[0];
        expect(acceptChoice.action).toBe("treatInjury");
        expect(acceptChoice.scope?.(inst.state)).toEqual({
            injuryUuid: "Item.wound",
            healingRate: 4,
        });
        // The perform step is the open one; accept targets the injury.
        expect(TREATMENT_SEQUENCE.steps.perform.by).toBe("self");
        expect(TREATMENT_SEQUENCE.steps.accept.by).toBe("injury");
    });
});
