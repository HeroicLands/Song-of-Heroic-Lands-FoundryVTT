/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi } from "vitest";
import { BodyStructure } from "@src/entity/body/BodyStructure";
import {
    locationData,
    makeBody as makeBodyFixture,
    partData,
    zoneData,
} from "@tests/mocks/bodyFixture";
import {
    buildResolveInjuryData,
    readResolveInjuryForm,
    buildInjuryCardData,
    buildMissCardData,
    getActorBodyStructure,
    createTraumaFromInjury,
} from "@src/document/actor/logic/injury-actions";
import { resolveInjury } from "@src/entity/body/injury-resolution";
import { IMPACT_ASPECT, ITEM_KIND } from "@src/utils/constants";
import * as FoundryHelpers from "@src/core/FoundryHelpers";

const SAMPLE_DATA: BodyStructure.Data = {
    zones: [zoneData("headzone", 1)],
    parts: [partData("head", "headzone", 15)],
    locations: [
        locationData("skull", "head", 10, {
            name: "Skull",
            bleedingSusceptibility: "medium",
            shockValue: 3,
            protectionBase: { blunt: 3, edged: 3, piercing: 3, fire: 0 },
        }),
        locationData("neck", "head", 2, {
            name: "Neck",
            bleedingSusceptibility: "high",
            amputability: "medium",
            shockValue: 5,
        }),
    ],
};

function makeBody(): BodyStructure {
    return makeBodyFixture(SAMPLE_DATA);
}

describe("buildResolveInjuryData", () => {
    it("fills spec defaults for an empty / missing / invalid scope", () => {
        for (const input of [undefined, "", "  ", "{not json", {}]) {
            expect(buildResolveInjuryData(input, true)).toEqual({
                bodyLocationCode: "",
                // targetZoneNumber defaults to 1; zoneDie 0 is the "unset"
                // sentinel — the executor fills it with the body's max zone
                // number so an unaimed derive covers the whole body.
                targetZoneNumber: 1,
                zoneDie: 0,
                impact: 0,
                aspect: IMPACT_ASPECT.BLUNT,
                armorReduction: 0,
                treatmentModifier: 0,
                bleedImpactPenalty: 0,
                autoAddInjury: true,
                bodyLocationOverriden: false,
            });
        }
    });

    it("reads the zone-die vocabulary from an object scope", () => {
        const data = buildResolveInjuryData(
            {
                bodyLocationCode: "neck",
                targetZoneNumber: 3,
                zoneDie: 4,
                impact: 12,
                aspect: "edged",
                armorReduction: 2,
                treatmentModifier: -5,
                bleedImpactPenalty: 3,
            },
            false,
        );
        expect(data).toMatchObject({
            bodyLocationCode: "neck",
            targetZoneNumber: 3,
            zoneDie: 4,
            impact: 12,
            aspect: IMPACT_ASPECT.EDGED,
            armorReduction: 2,
            treatmentModifier: -5,
            bleedImpactPenalty: 3,
            autoAddInjury: false,
        });
    });

    it("accepts the combat wire from a JSON string (zone aim + location alias)", () => {
        const data = buildResolveInjuryData(
            JSON.stringify({
                impact: 9,
                aspect: "piercing",
                targetZoneNumber: 2,
                zoneDie: 5,
                location: "skull",
            }),
            true,
        );
        expect(data).toMatchObject({
            impact: 9,
            aspect: IMPACT_ASPECT.PIERCING,
            targetZoneNumber: 2,
            zoneDie: 5,
            bodyLocationCode: "skull",
        });
    });

    it("defaults an unknown aspect to blunt", () => {
        expect(
            buildResolveInjuryData({ impact: 5, aspect: "frostbite" }, true)
                .aspect,
        ).toBe(IMPACT_ASPECT.BLUNT);
    });
});

describe("readResolveInjuryForm", () => {
    it("normalizes the dialog form data", () => {
        const form = readResolveInjuryForm({
            bodyLocationCode: "neck",
            targetZoneNumber: "3",
            zoneDie: "4",
            aspect: "edged",
            impact: "14",
            armorReduction: "3",
            treatmentModifier: "-5",
            bleedImpactPenalty: "2",
            autoAddInjury: true,
        });
        expect(form).toEqual({
            bodyLocationCode: "neck",
            targetZoneNumber: 3,
            zoneDie: 4,
            aspect: IMPACT_ASPECT.EDGED,
            impact: 14,
            armorReduction: 3,
            treatmentModifier: -5,
            bleedImpactPenalty: 2,
            autoAddInjury: true,
            bodyLocationOverriden: false,
        });
    });

    it("falls back to sane defaults for empty fields", () => {
        expect(readResolveInjuryForm({})).toEqual({
            bodyLocationCode: "",
            targetZoneNumber: 1,
            zoneDie: 0,
            aspect: IMPACT_ASPECT.BLUNT,
            impact: 0,
            armorReduction: 0,
            treatmentModifier: 0,
            bleedImpactPenalty: 0,
            autoAddInjury: false,
            bodyLocationOverriden: false,
        });
    });
});

describe("buildInjuryCardData", () => {
    it("maps a resolved injury onto the card render context", () => {
        const body = makeBody();
        const neck = body
            .getAllLocations()
            .find((l) => l.shortcode === "neck")!;
        const injury = resolveInjury({
            impact: 22,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: neck,
        });
        const data = buildInjuryCardData(injury, {
            actorId: "actor1",
            handlerActorUuid: "Actor.actor1",
            name: "Longsword",
            addToCharSheet: true,
        });
        expect(data).toMatchObject({
            actorId: "actor1",
            handlerActorUuid: "Actor.actor1",
            name: "Longsword",
            bodyZoneName: "Neck",
            bodyPartName: "head",
            aspect: IMPACT_ASPECT.EDGED,
            impactVal: 22,
            isInjured: true,
            injuryLevelText: "G5",
            isBleeder: true,
            canAmputate: true,
            addToCharSheet: true,
        });
    });

    it("carries the Shock Roll button's scope (#555)", () => {
        const body = makeBody();
        const neck = body
            .getAllLocations()
            .find((l) => l.shortcode === "neck")!;
        const injury = resolveInjury({
            impact: 22,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: neck,
        });
        const data = buildInjuryCardData(injury, {
            actorId: "actor1",
            handlerActorUuid: "Actor.actor1",
            name: "Longsword",
            addToCharSheet: true,
        });
        expect(data.shockScope).toEqual({
            shockIndex: injury.shockIndex,
            shockBonus: injury.shockRollBonus,
        });
    });

    it("renders a performed amputation outcome and folds the shock penalty in", () => {
        const body = makeBody();
        const neck = body
            .getAllLocations()
            .find((l) => l.shortcode === "neck")!;
        const injury = resolveInjury({
            impact: 22,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: neck,
        });
        const data = buildInjuryCardData(injury, {
            actorId: "a1",
            handlerActorUuid: "Actor.a1",
            name: "Axe",
            addToCharSheet: true,
            treatmentModifier: -5,
            isBleeder: true,
            amputation: { severed: false, died: false, shockPenalty: -20 },
        });
        expect(data).toMatchObject({
            amputationTested: true,
            amputationSevered: false,
            amputationDied: false,
            treatmentModifier: -5,
            isBleeder: true,
            // -20 amputation penalty folded into the shock bonus + button scope.
            shockRollBonus: injury.shockRollBonus - 20,
        });
        expect(data.shockScope).toEqual({
            shockIndex: injury.shockIndex,
            shockBonus: injury.shockRollBonus - 20,
        });
    });

    it("carries the zone-die aim trace when the location was derived (#828)", () => {
        const body = makeBody();
        const neck = body
            .getAllLocations()
            .find((l) => l.shortcode === "neck")!;
        const injury = resolveInjury({
            impact: 22,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: neck,
        });
        const data = buildInjuryCardData(injury, {
            actorId: "a1",
            handlerActorUuid: "Actor.a1",
            name: "Axe",
            addToCharSheet: true,
            aim: {
                targetZoneNumber: 2,
                zoneDie: 6,
                zoneDieResult: 3,
                hitZoneNumber: 4,
                zoneName: "Torso",
            },
        });
        expect(data).toMatchObject({
            locationDerived: true,
            locationOverridden: false,
            targetZoneNumber: 2,
            zoneDie: 6,
            zoneDieLabel: "d6",
            zoneDieResult: 3,
            hitZoneNumber: 4,
            hitZoneName: "Torso",
            isMiss: false,
        });
    });

    it("flags a player-overridden location when set manually (#828)", () => {
        const body = makeBody();
        const neck = body
            .getAllLocations()
            .find((l) => l.shortcode === "neck")!;
        const injury = resolveInjury({
            impact: 22,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: neck,
        });
        const data = buildInjuryCardData(injury, {
            actorId: "a1",
            handlerActorUuid: "Actor.a1",
            name: "Axe",
            addToCharSheet: true,
            locationOverridden: true,
        });
        expect(data).toMatchObject({
            locationDerived: false,
            locationOverridden: true,
            isMiss: false,
        });
    });
});

describe("buildMissCardData (#828)", () => {
    it("builds a no-impact card carrying the aim trace and a miss flag", () => {
        const data = buildMissCardData(
            {
                targetZoneNumber: 3,
                zoneDie: 6,
                zoneDieResult: 5,
                hitZoneNumber: 7,
            },
            {
                actorId: "a1",
                handlerActorUuid: "Actor.a1",
                name: "Arrow",
            },
        );
        expect(data).toMatchObject({
            isMiss: true,
            actorId: "a1",
            handlerActorUuid: "Actor.a1",
            name: "Arrow",
            targetZoneNumber: 3,
            zoneDie: 6,
            zoneDieLabel: "d6",
            zoneDieResult: 5,
            hitZoneNumber: 7,
            isInjured: false,
            addToCharSheet: false,
        });
    });
});

describe("getActorBodyStructure (#268)", () => {
    it("resolves the body structure from the being's body sub-object", () => {
        // The callers pass the BeingLogic (`this`), which exposes its `body`
        // sub-object; the helper reads `body.structure` (via getActorBody).
        const structure = {} as BodyStructure;
        const logic = { body: { structure } };
        expect(getActorBodyStructure(logic)).toBe(structure);
    });

    it("returns undefined when the being has no body (incorporeal / non-being)", () => {
        expect(getActorBodyStructure({})).toBeUndefined();
        expect(getActorBodyStructure(undefined)).toBeUndefined();
    });
});

describe("createTraumaFromInjury (#286)", () => {
    afterEach(() => vi.restoreAllMocks());

    it("creates the trauma via the actor logic through the boundary (not on the logic directly)", async () => {
        const spy = vi
            .spyOn(FoundryHelpers, "fvttCreateEmbeddedItems")
            .mockResolvedValue([]);
        // A logic instance — deliberately WITHOUT createEmbeddedDocuments — to
        // prove the write is routed through the boundary, not called on `logic`.
        const logic = { name: "Hero" } as any;
        const body = makeBody();
        const neck = body
            .getAllLocations()
            .find((l) => l.shortcode === "neck")!;
        const injury = resolveInjury({
            impact: 22,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: neck,
        });

        await createTraumaFromInjury(logic, injury);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(logic, [
            expect.objectContaining({
                type: ITEM_KIND.TRAUMA,
                name: expect.stringContaining("Neck"),
            }),
        ]);
    });

    /** A resolved wound + a mock created Trauma carrying its healing cadence. */
    function woundAndTrauma() {
        const body = makeBody();
        const neck = body
            .getAllLocations()
            .find((l) => l.shortcode === "neck")!;
        const injury = resolveInjury({
            impact: 22,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: neck,
        });
        const trauma = {
            uuid: "Item.trauma0000",
            system: { healingCheckDurationBase: 432000 }, // 5 days
        };
        vi.spyOn(FoundryHelpers, "fvttCreateEmbeddedItems").mockResolvedValue([
            trauma,
        ]);
        return { injury, trauma };
    }

    it("OFFERS the first healing check after creating the wound — accept schedules it (#579)", async () => {
        const { injury, trauma } = woundAndTrauma();
        const schedule = vi.spyOn((globalThis as any).sohl, "schedule");
        // A pre-answered context (e.g. scripted) — schedule: true accepts.
        await createTraumaFromInjury({ name: "Hero" } as any, injury, {
            skipDialog: true,
            scope: { schedule: true },
        });
        expect(schedule).toHaveBeenCalledWith(trauma, "healingCheck", 432000);
    });

    it("does NOT auto-arm — declining the offer leaves it unscheduled (#579)", async () => {
        const { injury, trauma } = woundAndTrauma();
        const schedule = vi.spyOn((globalThis as any).sohl, "schedule");
        const unschedule = vi.spyOn((globalThis as any).sohl, "unschedule");
        await createTraumaFromInjury({ name: "Hero" } as any, injury, {
            skipDialog: true,
            scope: { schedule: false },
        });
        expect(schedule).not.toHaveBeenCalled();
        expect(unschedule).toHaveBeenCalledWith(trauma, "healingCheck");
    });

    it("also OFFERS the blood-loss advance when the wound bleeds on infliction (#579)", async () => {
        const body = makeBody();
        const neck = body
            .getAllLocations()
            .find((l) => l.shortcode === "neck")!;
        const injury = resolveInjury({
            impact: 22,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: neck,
        });
        const trauma = {
            uuid: "Item.trauma0000",
            system: {
                healingCheckDurationBase: 432000,
                bloodLossAdvanceDurationBase: 86400, // a bleeder-at-creation
            },
        };
        vi.spyOn(FoundryHelpers, "fvttCreateEmbeddedItems").mockResolvedValue([
            trauma,
        ]);
        const schedule = vi.spyOn((globalThis as any).sohl, "schedule");
        await createTraumaFromInjury({ name: "Hero" } as any, injury, {
            skipDialog: true,
            scope: { schedule: true },
        });
        expect(schedule).toHaveBeenCalledWith(trauma, "healingCheck", 432000);
        expect(schedule).toHaveBeenCalledWith(
            trauma,
            "bloodLossAdvanceCheck",
            86400,
        );
    });
});
