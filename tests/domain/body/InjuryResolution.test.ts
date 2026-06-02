/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { BodyStructure } from "@src/domain/body/BodyStructure";
import {
    injuryLevelFromImpact,
    resolveInjury,
    buildTraumaData,
} from "@src/domain/body/InjuryResolution";
import { IMPACT_ASPECT, TRAUMA_SUBTYPE } from "@src/utils/constants";

// Skull: moderate bleeder, not amputable, real armor on all but fire.
const SKULL_LOC = {
    shortcode: "skull",
    bleedingSusceptibility: "medium",
    amputability: "none",
    shockValue: 3,
    probWeight: 10,
    protectionBase: { blunt: 3, edged: 3, piercing: 3, fire: 0 },
};

// Neck: high bleeder, medium amputability, no armor.
const NECK_LOC = {
    shortcode: "neck",
    bleedingSusceptibility: "high",
    amputability: "medium",
    shockValue: 5,
    probWeight: 2,
    protectionBase: { blunt: 0, edged: 0, piercing: 0, fire: 0 },
};

const CHEST_LOC = {
    shortcode: "chest",
    bleedingSusceptibility: "low",
    amputability: "none",
    shockValue: 4,
    probWeight: 20,
    protectionBase: { blunt: 2, edged: 1, piercing: 1, fire: 0 },
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
        {
            shortcode: "thorax",
            roles: [],
            canHoldItem: false,
            heldItemId: null,
            probWeight: 30,
            locations: [CHEST_LOC],
        },
    ],
    adjacent: [["head", "thorax"]],
} as any;

const MOCK_LINEAGE_LOGIC = {
    actor: null,
    data: { bodyStructure: SAMPLE_DATA },
} as any;

function makeBody(): BodyStructure {
    return new BodyStructure(SAMPLE_DATA, MOCK_LINEAGE_LOGIC);
}

function loc(body: BodyStructure, code: string) {
    return body.getAllLocations().find((l) => l.shortcode === code)!;
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("injuryLevelFromImpact", () => {
    it.each([
        [-3, 0],
        [0, 0],
        [1, 1],
        [4, 1],
        [5, 2],
        [9, 2],
        [10, 3],
        [14, 3],
        [15, 4],
        [19, 4],
        [20, 5],
        [99, 5],
    ])("effective impact %i -> level %i", (impact, level) => {
        expect(injuryLevelFromImpact(impact)).toBe(level);
    });
});

describe("resolveInjury", () => {
    it("uses an explicit location + armorReduction (deterministic, no RNG)", () => {
        const body = makeBody();
        const spy = vi.spyOn(body, "getRandomLocation");
        const injury = resolveInjury({
            impact: 12,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "chest"),
            armorReduction: 2,
        });
        expect(spy).not.toHaveBeenCalled();
        expect(injury.location.shortcode).toBe("chest");
        expect(injury.armorReduction).toBe(2);
        expect(injury.effectiveImpact).toBe(10);
        expect(injury.level).toBe(3);
        expect(injury.levelCode).toBe("S3");
    });

    it("derives armor reduction from the location's protection for the aspect", () => {
        const body = makeBody();
        // Skull edged protection is 3; impact 8 -> effective 5 -> S2.
        const injury = resolveInjury({
            impact: 8,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "skull"),
        });
        expect(injury.armorReduction).toBe(3);
        expect(injury.effectiveImpact).toBe(5);
        expect(injury.levelCode).toBe("S2");
    });

    it("uses the aspect-specific protection value (fire bypasses skull armor)", () => {
        const body = makeBody();
        const injury = resolveInjury({
            impact: 8,
            aspect: IMPACT_ASPECT.FIRE,
            body,
            location: loc(body, "skull"),
        });
        expect(injury.armorReduction).toBe(0);
        expect(injury.effectiveImpact).toBe(8);
        expect(injury.levelCode).toBe("S2");
    });

    it("floors effective impact at 0 when armor exceeds impact", () => {
        const body = makeBody();
        const injury = resolveInjury({
            impact: 2,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "skull"),
        });
        expect(injury.effectiveImpact).toBe(0);
        expect(injury.level).toBe(0);
        expect(injury.levelCode).toBe("NA");
        expect(injury.isBleeder).toBe(false);
    });

    it("flags a bleeder for a G5 edged wound at a high-susceptibility location", () => {
        const body = makeBody();
        const injury = resolveInjury({
            impact: 20,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "neck"),
        });
        expect(injury.levelCode).toBe("G5");
        expect(injury.isBleeder).toBe(true);
    });

    it("does not flag a bleeder for a minor wound", () => {
        const body = makeBody();
        const injury = resolveInjury({
            impact: 3,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "neck"),
        });
        expect(injury.levelCode).toBe("M1");
        expect(injury.isBleeder).toBe(false);
    });

    it("forces a bleeder when extraBleedRisk is set on an actual wound", () => {
        const body = makeBody();
        const injury = resolveInjury({
            impact: 3,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "neck"),
            extraBleedRisk: true,
        });
        expect(injury.levelCode).toBe("M1");
        expect(injury.isBleeder).toBe(true);
    });

    it("never bleeds when there is no injury, even with extraBleedRisk", () => {
        const body = makeBody();
        const injury = resolveInjury({
            impact: 0,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "neck"),
            extraBleedRisk: true,
        });
        expect(injury.level).toBe(0);
        expect(injury.isBleeder).toBe(false);
    });

    it("computes amputation for a G5 edged wound at an amputable location", () => {
        const body = makeBody();
        const injury = resolveInjury({
            impact: 22,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "neck"),
        });
        expect(injury.canAmputate).toBe(true);
        expect(injury.amputationModifier).toBe(0); // medium tier
    });

    it("does not allow amputation for a blunt G5 wound", () => {
        const body = makeBody();
        const injury = resolveInjury({
            impact: 22,
            aspect: IMPACT_ASPECT.BLUNT,
            body,
            location: loc(body, "neck"),
        });
        expect(injury.canAmputate).toBe(false);
        expect(injury.amputationModifier).toBe(null);
    });

    it("resolves the location randomly via the aimed path when no explicit location is given", () => {
        const body = makeBody();
        const target = body.getPartByCode("head")!;
        const spy = vi
            .spyOn(body, "getRandomLocation")
            .mockReturnValue(loc(body, "skull"));
        const injury = resolveInjury({
            impact: 10,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            targetPart: target,
            accuracy: 6,
        });
        expect(spy).toHaveBeenCalledWith({ targetPart: target, accuracy: 6 });
        expect(injury.location.shortcode).toBe("skull");
    });

    it("falls back to unaimed weighted selection when no target part is given", () => {
        const body = makeBody();
        const spy = vi
            .spyOn(body, "getRandomLocation")
            .mockReturnValue(loc(body, "chest"));
        resolveInjury({ impact: 10, aspect: IMPACT_ASPECT.EDGED, body });
        expect(spy).toHaveBeenCalledWith();
    });
});

describe("buildTraumaData", () => {
    it("produces a physical Trauma data shape from a resolved injury", () => {
        const body = makeBody();
        const injury = resolveInjury({
            impact: 22,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "neck"),
        });
        const data = buildTraumaData(injury);
        expect(data).toMatchObject({
            subType: TRAUMA_SUBTYPE.PHYSICAL,
            levelBase: 5,
            healingRateBase: 0,
            aspect: IMPACT_ASPECT.EDGED,
            isTreated: false,
            isBleeding: true,
            bodyLocationCode: "neck",
        });
    });
});
