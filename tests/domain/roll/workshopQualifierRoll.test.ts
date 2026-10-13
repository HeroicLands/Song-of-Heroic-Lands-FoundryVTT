/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { afterEach, describe, expect, it } from "vitest";
import { workshopQualifierRoll } from "@src/entity/roll/workshopQualifierRoll";
import { qualifierRoll } from "@src/entity/roll/qualifierRoll";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { StructureLogic } from "@src/document/actor/logic/StructureLogic";
import { makeActorLogic, makeMockActor } from "@tests/mocks/logicHarness";

const crafter = makeMockActor().logic;
const ladder = ["plain", "one", "two", "three", "four", "five"];
afterEach(() => SimpleRoll.clearForced());
describe("explicitly selected workshop qualifiers", () => {
    it.each([1, 2, 3, 4, 5])(
        "uses %i workshop stars as TN without changing the chosen Structure",
        (rating) => {
            const workshop = makeActorLogic(StructureLogic, "structure", {
                workshopRating: rating,
            });
            SimpleRoll.forceValues(1, 2, 3, 4, 5);
            const result = workshopQualifierRoll(5, workshop, ladder, crafter);
            expect(result.rolls).toEqual([1, 2, 3, 4, 5]);
            expect(result.successCount).toBe(rating);
            expect(result.result).toBe(ladder[rating]);
            expect(workshop.data.update).not.toHaveBeenCalled();
            expect(SimpleRoll.forcedRemaining).toBe(0);
        },
    );
    it.each([0, undefined, -1, 6, 1.5, NaN, Infinity, "4"])(
        "rejects unrated or invalid workshop %s before drawing dice",
        (rating) => {
            const workshop = makeActorLogic(StructureLogic, "structure", {
                workshopRating: rating,
            });
            SimpleRoll.forceValues(4);
            expect(() => workshopQualifierRoll(1, workshop, ladder, crafter)).toThrow(RangeError);
            expect(SimpleRoll.forcedRemaining).toBe(1);
        },
    );
    it("rejects a different actor kind and leaves other routines' explicit TN unchanged", () => {
        SimpleRoll.forceValues(8);
        expect(() => workshopQualifierRoll(1, crafter as any, ladder, crafter)).toThrow(RangeError);
        expect(qualifierRoll(1, 8, ladder, crafter).successCount).toBe(1);
    });
});
