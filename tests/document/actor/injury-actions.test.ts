/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi } from "vitest";
import { brandLogic } from "@tests/mocks/brandLogic";
import { BodyStructure } from "@src/entity/body/BodyStructure";
import {
    parseInjuryRequest,
    isAutomatedRequest,
    readInjuryDialogForm,
    buildInjuryCardData,
    resolveAutomatedInjury,
    getActorBodyStructure,
    createTraumaFromInjury,
} from "@src/document/actor/logic/injury-actions";
import { resolveInjury } from "@src/entity/body/injury-resolution";
import { IMPACT_ASPECT, ITEM_KIND } from "@src/utils/constants";
import * as FoundryHelpers from "@src/core/FoundryHelpers";

const SKULL_LOC = {
    shortcode: "skull",
    name: "Skull",
    bleedingSusceptibility: "medium",
    amputability: "none",
    shockValue: 3,
    probWeight: 10,
    protectionBase: { blunt: 3, edged: 3, piercing: 3, fire: 0 },
};

const NECK_LOC = {
    shortcode: "neck",
    name: "Neck",
    bleedingSusceptibility: "high",
    amputability: "medium",
    shockValue: 5,
    probWeight: 2,
    protectionBase: { blunt: 0, edged: 0, piercing: 0, fire: 0 },
};

const SAMPLE_DATA: BodyStructure.Data = {
    parts: [
        {
            shortcode: "head",
            roles: [],
            canHoldItem: false,
            heldItemId: null,
            probWeight: 15,
            locations: [SKULL_LOC, NECK_LOC],
        },
    ],
    adjacent: [],
} as any;

const MOCK_CORPUS_LOGIC = brandLogic({
    kind: "corpus",
    actor: null,
    data: { structure: SAMPLE_DATA },
}) as any;

function makeBody(): BodyStructure {
    return new BodyStructure(SAMPLE_DATA, { parent: MOCK_CORPUS_LOGIC });
}

describe("parseInjuryRequest", () => {
    it("returns null for missing / blank / invalid JSON", () => {
        expect(parseInjuryRequest(undefined)).toBeNull();
        expect(parseInjuryRequest("")).toBeNull();
        expect(parseInjuryRequest("  ")).toBeNull();
        expect(parseInjuryRequest("{not json")).toBeNull();
    });

    it("parses an assisted request (impact + aspect only)", () => {
        const req = parseInjuryRequest(
            JSON.stringify({ impact: 12, aspect: "edged" }),
        );
        expect(req).toEqual({ impact: 12, aspect: IMPACT_ASPECT.EDGED });
    });

    it("parses an automated request with aim + overrides", () => {
        const req = parseInjuryRequest(
            JSON.stringify({
                impact: 9,
                aspect: "piercing",
                targetPart: "head",
                spread: 5,
                location: "skull",
                armorReduction: 2,
                extraBleedRisk: true,
            }),
        );
        expect(req).toMatchObject({
            impact: 9,
            aspect: IMPACT_ASPECT.PIERCING,
            targetPart: "head",
            spread: 5,
            location: "skull",
            armorReduction: 2,
            extraBleedRisk: true,
        });
    });

    it("defaults an unknown aspect to blunt", () => {
        const req = parseInjuryRequest(
            JSON.stringify({ impact: 5, aspect: "frostbite" }),
        );
        expect(req?.aspect).toBe(IMPACT_ASPECT.BLUNT);
    });
});

describe("isAutomatedRequest", () => {
    it("is automated only when both targetPart and spread are present", () => {
        expect(
            isAutomatedRequest({
                impact: 1,
                aspect: IMPACT_ASPECT.EDGED,
                targetPart: "head",
                spread: 0,
            }),
        ).toBe(true);
        expect(
            isAutomatedRequest({
                impact: 1,
                aspect: IMPACT_ASPECT.EDGED,
                targetPart: "head",
            }),
        ).toBe(false);
        expect(
            isAutomatedRequest({ impact: 1, aspect: IMPACT_ASPECT.EDGED }),
        ).toBe(false);
    });
});

describe("readInjuryDialogForm", () => {
    it("normalizes the dialog form data", () => {
        const form = readInjuryDialogForm({
            location: "neck",
            aspect: "edged",
            impactVal: "14",
            armorReduction: "3",
            extraBleedRisk: true,
            addToCharSheet: true,
        });
        expect(form).toEqual({
            locationCode: "neck",
            aspect: IMPACT_ASPECT.EDGED,
            impact: 14,
            armorReduction: 3,
            extraBleedRisk: true,
            addToCharSheet: true,
        });
    });

    it("falls back to sane defaults for empty fields", () => {
        const form = readInjuryDialogForm({});
        expect(form).toEqual({
            locationCode: "",
            aspect: IMPACT_ASPECT.BLUNT,
            impact: 0,
            armorReduction: 0,
            extraBleedRisk: false,
            addToCharSheet: false,
        });
    });
});

describe("resolveAutomatedInjury", () => {
    it("rolls the aimed location via targetPart + spread", () => {
        const body = makeBody();
        const skull = body
            .getAllLocations()
            .find((l) => l.shortcode === "skull")!;
        const spy = vi.spyOn(body, "getRandomLocation").mockReturnValue(skull);
        const injury = resolveAutomatedInjury(
            {
                impact: 8,
                aspect: IMPACT_ASPECT.EDGED,
                targetPart: "head",
                spread: 6,
            },
            body,
        );
        expect(spy).toHaveBeenCalledWith({
            targetPart: body.getPartByCode("head"),
            spread: 6,
        });
        expect(injury.location.shortcode).toBe("skull");
    });

    it("honours an explicit location override without rolling", () => {
        const body = makeBody();
        const spy = vi.spyOn(body, "getRandomLocation");
        const injury = resolveAutomatedInjury(
            {
                impact: 20,
                aspect: IMPACT_ASPECT.EDGED,
                targetPart: "head",
                spread: 6,
                location: "neck",
            },
            body,
        );
        expect(spy).not.toHaveBeenCalled();
        expect(injury.location.shortcode).toBe("neck");
        expect(injury.levelCode).toBe("G5");
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
});

describe("getActorBodyStructure (#268)", () => {
    it("resolves the body structure from the actor logic's logicTypes", () => {
        // The callers pass the BeingLogic (`this`), which exposes `logicTypes`,
        // not the Foundry actor's `itemTypes`. The helper must read the former.
        const body = {} as BodyStructure;
        const logic = {
            logicTypes: { [ITEM_KIND.CORPUS]: [{ structure: body }] },
        };
        expect(getActorBodyStructure(logic)).toBe(body);
    });

    it("returns undefined when there is no corpus logic", () => {
        expect(
            getActorBodyStructure({ logicTypes: { [ITEM_KIND.CORPUS]: [] } }),
        ).toBeUndefined();
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
});
