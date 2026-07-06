/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { BodyStructure } from "@src/entity/body/BodyStructure";
import {
    injuryLevelFromImpact,
    resolveInjury,
    buildTraumaData,
} from "@src/entity/body/injury-resolution";
import { IMPACT_ASPECT, TRAUMA_SUBTYPE } from "@src/utils/constants";

// Skull: moderate bleeder, not amputable, real natural armor on all but fire.
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

// Chest: low bleeder, light natural armor, flagged for both stumble and fumble.
const CHEST_LOC = {
    shortcode: "chest",
    bleedingSusceptibility: "low",
    amputability: "none",
    isStumble: true,
    isFumble: true,
    shockValue: 4,
    probWeight: 20,
    protectionBase: { blunt: 2, edged: 2, piercing: 2, fire: 0 },
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
    kind: "lineage",
    actor: null,
    data: { bodyStructure: SAMPLE_DATA },
} as any;

function makeBody(): BodyStructure {
    return new BodyStructure(SAMPLE_DATA, { parent: MOCK_LINEAGE_LOGIC });
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

describe("resolveInjury — armor & effective impact", () => {
    it("derives armorValue from natural protection plus worn armor", () => {
        const body = makeBody();
        const skull = loc(body, "skull");
        // Natural edged 3 + worn armor 2 = total armorValue 5.
        skull.armorProtection.edged = 2;
        skull.armorType = "Mail";
        const injury = resolveInjury({
            impact: 8,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: skull,
        });
        expect(injury.armorValue).toBe(5);
        expect(injury.armorReduction).toBe(0);
        expect(injury.armorType).toBe("Mail");
        expect(injury.effectiveImpact).toBe(3); // 8 - 5
        expect(injury.level).toBe(1);
        expect(injury.levelCode).toBe("M1");
    });

    it("subtracts a manual armorReduction from the armor value", () => {
        const body = makeBody();
        const skull = loc(body, "skull");
        skull.armorProtection.edged = 2; // armorValue 5
        const injury = resolveInjury({
            impact: 8,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: skull,
            armorReduction: 2, // effective protection 3
        });
        expect(injury.armorValue).toBe(5);
        expect(injury.armorReduction).toBe(2);
        expect(injury.effectiveImpact).toBe(5); // 8 - (5 - 2)
        expect(injury.level).toBe(2);
        expect(injury.levelCode).toBe("S2");
    });

    it("floors effective protection at 0 when reduction exceeds armor", () => {
        const body = makeBody();
        const injury = resolveInjury({
            impact: 6,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "skull"), // armorValue 3
            armorReduction: 10,
        });
        expect(injury.effectiveImpact).toBe(6); // protection floored to 0
    });

    it("floors effective impact at 0 when armor exceeds impact", () => {
        const body = makeBody();
        const injury = resolveInjury({
            impact: 2,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "skull"), // armorValue 3
        });
        expect(injury.effectiveImpact).toBe(0);
        expect(injury.level).toBe(0);
        expect(injury.levelCode).toBe("NA");
        expect(injury.isBleeder).toBe(false);
    });

    it("uses the aspect-specific protection value (fire bypasses skull armor)", () => {
        const body = makeBody();
        const injury = resolveInjury({
            impact: 8,
            aspect: IMPACT_ASPECT.FIRE,
            body,
            location: loc(body, "skull"),
        });
        expect(injury.armorValue).toBe(0);
        expect(injury.effectiveImpact).toBe(8);
        expect(injury.levelCode).toBe("S2");
    });

    it("honours an explicit armorValue override (deterministic, no RNG)", () => {
        const body = makeBody();
        const spy = vi.spyOn(body, "getRandomLocation");
        const injury = resolveInjury({
            impact: 12,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "chest"),
            armorValue: 2,
        });
        expect(spy).not.toHaveBeenCalled();
        expect(injury.location.shortcode).toBe("chest");
        expect(injury.armorValue).toBe(2);
        expect(injury.effectiveImpact).toBe(10);
        expect(injury.level).toBe(3);
        expect(injury.levelCode).toBe("S3");
    });
});

describe("resolveInjury — hit location", () => {
    it("resolves the location via the aimed path when targetPart + spread given", () => {
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
            spread: 6,
        });
        expect(spy).toHaveBeenCalledWith({ targetPart: target, spread: 6 });
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

describe("resolveInjury — shock", () => {
    it("computes shock index as location shock value plus injury level", () => {
        const body = makeBody();
        // Skull shock 3, impact 5 vs armorValue 3 -> effImpact 2 -> level 1.
        const injury = resolveInjury({
            impact: 5,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "skull"),
        });
        expect(injury.level).toBe(1);
        expect(injury.shockIndex).toBe(4); // 3 + 1
        expect(injury.needsShockRoll).toBe(false); // 4 is not > 4
        expect(injury.shockRollBonus).toBe(0);
    });

    it("needs a shock roll once the index passes 4", () => {
        const body = makeBody();
        // Skull shock 3, impact 11 vs armorValue 3 -> effImpact 8 -> level 2.
        const injury = resolveInjury({
            impact: 11,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "skull"),
        });
        expect(injury.level).toBe(2);
        expect(injury.shockIndex).toBe(5); // 3 + 2
        expect(injury.needsShockRoll).toBe(true);
    });
});

describe("resolveInjury — glancing blow", () => {
    it("turns an edged 1-4 blow on a rigid location into a level-0 glancing blow", () => {
        const body = makeBody();
        const skull = loc(body, "skull");
        skull.isRigid = true;
        // impact 5 vs armorValue 3 -> effImpact 2 (in 1..4) + rigid + edged.
        const injury = resolveInjury({
            impact: 5,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: skull,
        });
        expect(injury.isGlancingBlow).toBe(true);
        expect(injury.effectiveImpact).toBe(2);
        expect(injury.level).toBe(0);
        expect(injury.levelCode).toBe("NA");
        expect(injury.isBleeder).toBe(false);
        expect(injury.shockIndex).toBe(4); // shock 3 + level 0 + 1 injury shock
        expect(injury.shockRollBonus).toBe(10);
    });

    it("is not a glancing blow for blunt aspect", () => {
        const body = makeBody();
        const skull = loc(body, "skull");
        skull.isRigid = true;
        const injury = resolveInjury({
            impact: 5,
            aspect: IMPACT_ASPECT.BLUNT,
            body,
            location: skull,
        });
        expect(injury.isGlancingBlow).toBe(false);
        expect(injury.level).toBe(1);
        expect(injury.shockRollBonus).toBe(0);
    });

    it("is not a glancing blow on a non-rigid location", () => {
        const body = makeBody();
        const injury = resolveInjury({
            impact: 5,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "skull"), // isRigid false
        });
        expect(injury.isGlancingBlow).toBe(false);
        expect(injury.level).toBe(1);
    });

    it("is not a glancing blow once effective impact reaches 5", () => {
        const body = makeBody();
        const skull = loc(body, "skull");
        skull.isRigid = true;
        // impact 11 vs armorValue 3 -> effImpact 8 (>= 5).
        const injury = resolveInjury({
            impact: 11,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: skull,
        });
        expect(injury.isGlancingBlow).toBe(false);
        expect(injury.level).toBe(2);
    });
});

describe("resolveInjury — stumble & fumble", () => {
    it("requires a roll for a serious injury at a flagged location", () => {
        const body = makeBody();
        // Chest shock irrelevant; impact 9 vs armorValue 2 -> effImpact 7 -> S2.
        const injury = resolveInjury({
            impact: 9,
            aspect: IMPACT_ASPECT.BLUNT,
            body,
            location: loc(body, "chest"),
        });
        expect(injury.level).toBe(2);
        expect(injury.stumble).toBe("roll");
        expect(injury.fumble).toBe("roll");
    });

    it("is automatic for a grievous injury at a flagged location", () => {
        const body = makeBody();
        // impact 19 vs armorValue 2 -> effImpact 17 -> G4.
        const injury = resolveInjury({
            impact: 19,
            aspect: IMPACT_ASPECT.BLUNT,
            body,
            location: loc(body, "chest"),
        });
        expect(injury.level).toBe(4);
        expect(injury.stumble).toBe("auto");
        expect(injury.fumble).toBe("auto");
    });

    it("is none for a minor injury even at a flagged location", () => {
        const body = makeBody();
        // impact 5 vs armorValue 2 -> effImpact 3 -> M1.
        const injury = resolveInjury({
            impact: 5,
            aspect: IMPACT_ASPECT.BLUNT,
            body,
            location: loc(body, "chest"),
        });
        expect(injury.level).toBe(1);
        expect(injury.stumble).toBe("none");
        expect(injury.fumble).toBe("none");
    });

    it("is none at an unflagged location regardless of severity", () => {
        const body = makeBody();
        // Skull is not flagged; impact 11 vs armorValue 3 -> S2.
        const injury = resolveInjury({
            impact: 11,
            aspect: IMPACT_ASPECT.BLUNT,
            body,
            location: loc(body, "skull"),
        });
        expect(injury.level).toBe(2);
        expect(injury.stumble).toBe("none");
        expect(injury.fumble).toBe("none");
    });
});

describe("resolveInjury — bleeding & amputation", () => {
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
