/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { BodyStructure } from "@src/entity/body/BodyStructure";
import {
    locationData,
    makeBody as makeBodyFixture,
    partData,
    zoneData,
} from "@tests/mocks/bodyFixture";
import {
    injuryLevelFromImpact,
    resolveInjury,
    buildTraumaData,
} from "@src/entity/body/injury-resolution";
import { IMPACT_ASPECT, TRAUMA_SUBTYPE } from "@src/utils/constants";

const SAMPLE_DATA: BodyStructure.Data = {
    zones: [zoneData("headzone", 1), zoneData("bodyzone", 2)],
    parts: [
        partData("head", "headzone", 15),
        partData("thorax", "bodyzone", 30),
    ],
    locations: [
        // Skull: moderate bleeder, not amputable, real natural armor on all but fire.
        locationData("skull", "head", 10, {
            bleedingSusceptibility: "medium",
            shockValue: 3,
            protectionBase: { blunt: 3, edged: 3, piercing: 3, fire: 0 },
        }),
        // Neck: high bleeder, medium amputability, no armor.
        locationData("neck", "head", 2, {
            bleedingSusceptibility: "high",
            amputability: "medium",
            shockValue: 5,
        }),
        // Chest: low bleeder, light natural armor, flagged for stumble and fumble.
        locationData("chest", "thorax", 20, {
            bleedingSusceptibility: "low",
            isStumble: true,
            isFumble: true,
            shockValue: 4,
            protectionBase: { blunt: 2, edged: 2, piercing: 2, fire: 0 },
        }),
    ],
};

function makeBody(): BodyStructure {
    return makeBodyFixture(SAMPLE_DATA);
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

    // Per-creature scaling (#468): the same absolute impact reads differently
    // against a scaled threshold table.
    const scale = (factor: number) => [1, 5, 10, 15, 20].map((t) => t * factor);

    it("scales severity by the creature's table — 2 impact is S2 on a cat but nothing on a cow", () => {
        expect(injuryLevelFromImpact(2, scale(0.27))).toBe(2); // small/frail cat → S2
        expect(injuryLevelFromImpact(2, scale(2.9))).toBe(0); // large/tough cow → ignored
        expect(injuryLevelFromImpact(2)).toBe(1); // human default unchanged → M1
    });

    it("ignores an impact below the smallest scaled threshold (cow needs ≥ 3 for M1)", () => {
        // Cow M1 threshold is ~2.9: 1 and 2 are ignored; 3 leaves a minor wound.
        expect(injuryLevelFromImpact(1, scale(2.9))).toBe(0);
        expect(injuryLevelFromImpact(2, scale(2.9))).toBe(0);
        expect(injuryLevelFromImpact(3, scale(2.9))).toBe(1);
    });

    it("defaults to the human master table when no thresholds are given", () => {
        expect(injuryLevelFromImpact(12)).toBe(
            injuryLevelFromImpact(12, scale(1)),
        );
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
    it("uses the explicit location override when one is given", () => {
        // Zone-Number + Zone-Die aiming is resolved upstream (BodyStructure.aimZone);
        // resolveInjury itself takes the already-chosen location.
        const body = makeBody();
        const injury = resolveInjury({
            impact: 10,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "skull"),
        });
        expect(injury.location.shortcode).toBe("skull");
    });

    it("falls back to unaimed weighted selection when no location is given", () => {
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

describe("resolveInjury — bleedImpactPenalty", () => {
    it("bleeds a wound whose boosted bleed impact reaches a bleeding severity", () => {
        const body = makeBody();
        // Neck (high susceptibility), edged. Impact 9 → effImpact 9 → level 2
        // (S2, never bleeds). +6 bleed penalty → bleed impact 15 → G4 → bleeds.
        const injury = resolveInjury({
            impact: 9,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "neck"),
            bleedImpactPenalty: 6,
        });
        expect(injury.level).toBe(2); // injury level unaffected by the penalty
        expect(injury.isBleeder).toBe(true); // bleed severity is boosted
        expect(injury.bleedRisk).toBe("high");
    });

    it("with no penalty the bleed severity equals the injury severity", () => {
        const body = makeBody();
        const injury = resolveInjury({
            impact: 9,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "neck"),
        });
        expect(injury.level).toBe(2);
        expect(injury.isBleeder).toBe(false); // S2 never bleeds
    });

    it("never bleeds a no-injury (level 0) wound even with a large penalty", () => {
        const body = makeBody();
        const injury = resolveInjury({
            impact: 0,
            aspect: IMPACT_ASPECT.EDGED,
            body,
            location: loc(body, "neck"),
            bleedImpactPenalty: 50,
        });
        expect(injury.level).toBe(0);
        expect(injury.isBleeder).toBe(false);
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
            subType: TRAUMA_SUBTYPE.INJURY,
            levelBase: 5,
            // A new wound carries NO Healing Rate (#1148) — `null`, not the
            // catastrophic real rate `0`.
            healingRateBase: null,
            treatmentModifierBase: 0,
            aspect: IMPACT_ASPECT.EDGED,
            // Bleeding is derived (#482): a bleeder is marked by a non-null
            // blood-loss timer placeholder (seeded to its real interval in
            // TraumaDataModel._preCreate).
            bloodLossAdvanceDurationBase: 0,
            bodyLocationCode: "neck",
        });
    });

    it("seeds the treatment modifier and honours a bleeder override", () => {
        const body = makeBody();
        // A minor blunt neck wound — not a table bleeder.
        const injury = resolveInjury({
            impact: 3,
            aspect: IMPACT_ASPECT.BLUNT,
            body,
            location: loc(body, "neck"),
        });
        expect(injury.isBleeder).toBe(false);
        const data = buildTraumaData(injury, {
            treatmentModifier: -10,
            isBleeder: true, // e.g. amputation made it bleed
        });
        expect(data.treatmentModifierBase).toBe(-10);
        expect(data.bloodLossAdvanceDurationBase).toBe(0); // overridden to bleed
    });

    it("marks a non-bleeder with a null blood-loss timer (#482)", () => {
        const body = makeBody();
        const injury = resolveInjury({
            impact: 3,
            aspect: IMPACT_ASPECT.BLUNT,
            body,
            location: loc(body, "neck"),
        });
        expect(injury.isBleeder).toBe(false);
        expect(buildTraumaData(injury).bloodLossAdvanceDurationBase).toBe(null);
    });
});
