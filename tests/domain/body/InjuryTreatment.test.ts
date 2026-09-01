import { describe, it, expect } from "vitest";
import {
    TREATMENT_CODE,
    TREATMENT_HEAL,
    injuryBand,
    treatmentHealingRate,
    requiredTreatment,
    treatmentCausesBleeder,
    isBleederFromHealingRate,
    isPermanentImpairmentEligible,
    amputationInjury,
    treatmentOutcome,
} from "@src/entity/body/injury-treatment";
import {
    CRITICAL_FAILURE,
    CRITICAL_SUCCESS,
    IMPACT_ASPECT,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
} from "@src/utils/constants";

describe("injuryBand", () => {
    it("maps injury levels to severity bands", () => {
        expect(injuryBand(1)).toBe("minor");
        expect(injuryBand(2)).toBe("serious");
        expect(injuryBand(3)).toBe("serious");
        expect(injuryBand(4)).toBe("grievous");
        expect(injuryBand(5)).toBe("grievous");
    });

    it("returns undefined for a healed / non-injuring level", () => {
        expect(injuryBand(0)).toBeUndefined();
        expect(injuryBand(-1)).toBeUndefined();
    });
});

describe("treatmentHealingRate — Healing Rate by roll × severity", () => {
    // Treatment table (Injury.md):
    //          Minor  Serious  Grievous
    // CF (-1)  HR 4   HR 3     HR 2
    // MF (0)   HR 5   HR 4     HR 3
    // MS (1)   HR 6   HR 5     HR 4
    // CS (2)   HEAL   HR 6     HR 5
    it.each([
        [CRITICAL_FAILURE, "minor", 4],
        [CRITICAL_FAILURE, "serious", 3],
        [CRITICAL_FAILURE, "grievous", 2],
        [MARGINAL_FAILURE, "minor", 5],
        [MARGINAL_FAILURE, "serious", 4],
        [MARGINAL_FAILURE, "grievous", 3],
        [MARGINAL_SUCCESS, "minor", 6],
        [MARGINAL_SUCCESS, "serious", 5],
        [MARGINAL_SUCCESS, "grievous", 4],
        [CRITICAL_SUCCESS, "serious", 6],
        [CRITICAL_SUCCESS, "grievous", 5],
    ] as const)("roll %i on a %s wound → HR %i", (sl, band, hr) => {
        expect(treatmentHealingRate(sl, band)).toBe(hr);
    });

    it("a critical success on a minor wound heals immediately", () => {
        expect(treatmentHealingRate(CRITICAL_SUCCESS, "minor")).toBe(TREATMENT_HEAL);
    });
});

describe("requiredTreatment — action + difficulty by aspect × severity", () => {
    it.each([
        [IMPACT_ASPECT.BLUNT, "minor", TREATMENT_CODE.COMPRESS, 30],
        [IMPACT_ASPECT.BLUNT, "serious", TREATMENT_CODE.SET, 10],
        [IMPACT_ASPECT.BLUNT, "grievous", TREATMENT_CODE.SURGERY, 0],
        [IMPACT_ASPECT.EDGED, "minor", TREATMENT_CODE.CLEAN, 20],
        [IMPACT_ASPECT.EDGED, "serious", TREATMENT_CODE.CLEAN, 10],
        [IMPACT_ASPECT.EDGED, "grievous", TREATMENT_CODE.SURGERY, 0],
        [IMPACT_ASPECT.PIERCING, "minor", TREATMENT_CODE.CLEAN, 10],
        [IMPACT_ASPECT.PIERCING, "serious", TREATMENT_CODE.CLEAN, 0],
        [IMPACT_ASPECT.PIERCING, "grievous", TREATMENT_CODE.SURGERY, -10],
        [IMPACT_ASPECT.FIRE, "minor", TREATMENT_CODE.COMPRESS, 20],
        [IMPACT_ASPECT.FIRE, "serious", TREATMENT_CODE.CLEAN, 10],
        [IMPACT_ASPECT.FIRE, "grievous", TREATMENT_CODE.CLEAN, 0],
    ] as const)("%s / %s → %s at modifier %i", (aspect, band, code, modifier) => {
        expect(requiredTreatment(aspect, band)).toEqual({ code, modifier });
    });
});

describe("treatmentCausesBleeder — surgical mishap", () => {
    it("EXT or SUR on a marginal or critical failure causes a bleeder", () => {
        expect(treatmentCausesBleeder(TREATMENT_CODE.SURGERY, MARGINAL_FAILURE)).toBe(true);
        expect(treatmentCausesBleeder(TREATMENT_CODE.SURGERY, CRITICAL_FAILURE)).toBe(true);
        expect(treatmentCausesBleeder(TREATMENT_CODE.EXTRACT, MARGINAL_FAILURE)).toBe(true);
    });

    it("EXT or SUR on a success does not cause a bleeder", () => {
        expect(treatmentCausesBleeder(TREATMENT_CODE.SURGERY, MARGINAL_SUCCESS)).toBe(false);
        expect(treatmentCausesBleeder(TREATMENT_CODE.SURGERY, CRITICAL_SUCCESS)).toBe(false);
    });

    it("non-surgical treatments never cause a bleeder", () => {
        expect(treatmentCausesBleeder(TREATMENT_CODE.CLEAN, CRITICAL_FAILURE)).toBe(false);
        expect(treatmentCausesBleeder(TREATMENT_CODE.COMPRESS, MARGINAL_FAILURE)).toBe(false);
        expect(treatmentCausesBleeder(undefined, CRITICAL_FAILURE)).toBe(false);
    });
});

describe("isBleederFromHealingRate — grievous HR 2/3 bleeders", () => {
    it("a grievous blunt/edged/piercing wound at HR 2 or 3 is a bleeder", () => {
        for (const aspect of [
            IMPACT_ASPECT.BLUNT,
            IMPACT_ASPECT.EDGED,
            IMPACT_ASPECT.PIERCING,
        ] as const) {
            expect(isBleederFromHealingRate(aspect, "grievous", 2)).toBe(true);
            expect(isBleederFromHealingRate(aspect, "grievous", 3)).toBe(true);
        }
    });

    it("is not a bleeder outside HR 2–3, non-grievous, or for fire", () => {
        expect(isBleederFromHealingRate(IMPACT_ASPECT.BLUNT, "grievous", 4)).toBe(false);
        expect(isBleederFromHealingRate(IMPACT_ASPECT.EDGED, "serious", 3)).toBe(false);
        expect(isBleederFromHealingRate(IMPACT_ASPECT.FIRE, "grievous", 2)).toBe(false);
    });
});

describe("isPermanentImpairmentEligible", () => {
    // Serious HR 3–4 or Grievous HR 2–4 blunt
    it("blunt: serious HR 3–4, grievous HR 2–4", () => {
        expect(isPermanentImpairmentEligible(IMPACT_ASPECT.BLUNT, "serious", 3)).toBe(true);
        expect(isPermanentImpairmentEligible(IMPACT_ASPECT.BLUNT, "serious", 4)).toBe(true);
        expect(isPermanentImpairmentEligible(IMPACT_ASPECT.BLUNT, "serious", 5)).toBe(false);
        expect(isPermanentImpairmentEligible(IMPACT_ASPECT.BLUNT, "grievous", 2)).toBe(true);
        expect(isPermanentImpairmentEligible(IMPACT_ASPECT.BLUNT, "grievous", 4)).toBe(true);
        expect(isPermanentImpairmentEligible(IMPACT_ASPECT.BLUNT, "grievous", 5)).toBe(false);
    });

    // Grievous HR 2–4 edged
    it("edged: only grievous HR 2–4", () => {
        expect(isPermanentImpairmentEligible(IMPACT_ASPECT.EDGED, "serious", 3)).toBe(false);
        expect(isPermanentImpairmentEligible(IMPACT_ASPECT.EDGED, "grievous", 2)).toBe(true);
        expect(isPermanentImpairmentEligible(IMPACT_ASPECT.EDGED, "grievous", 4)).toBe(true);
    });

    // Serious HR 3 or Grievous HR 2–4 piercing
    it("piercing: serious HR 3 only, grievous HR 2–4", () => {
        expect(isPermanentImpairmentEligible(IMPACT_ASPECT.PIERCING, "serious", 3)).toBe(true);
        expect(isPermanentImpairmentEligible(IMPACT_ASPECT.PIERCING, "serious", 4)).toBe(false);
        expect(isPermanentImpairmentEligible(IMPACT_ASPECT.PIERCING, "grievous", 3)).toBe(true);
    });

    // Grievous HR 1–3 fire
    it("fire: only grievous HR 1–3", () => {
        expect(isPermanentImpairmentEligible(IMPACT_ASPECT.FIRE, "grievous", 1)).toBe(true);
        expect(isPermanentImpairmentEligible(IMPACT_ASPECT.FIRE, "grievous", 3)).toBe(true);
        expect(isPermanentImpairmentEligible(IMPACT_ASPECT.FIRE, "grievous", 4)).toBe(false);
        expect(isPermanentImpairmentEligible(IMPACT_ASPECT.FIRE, "serious", 3)).toBe(false);
    });

    it("minor wounds are never eligible", () => {
        expect(isPermanentImpairmentEligible(IMPACT_ASPECT.BLUNT, "minor", 4)).toBe(false);
    });
});

describe("amputationInjury — the new edged wound an AMP inflicts", () => {
    // Amputation table (Injury.md):
    // CF (-1) → G5 edged, bleeder
    // MF (0)  → G4 edged, bleeder
    // MS (1)  → S3 edged, bleeder
    // CS (2)  → S2 edged, no bleeder
    it.each([
        [CRITICAL_FAILURE, "G", 5, true],
        [MARGINAL_FAILURE, "G", 4, true],
        [MARGINAL_SUCCESS, "S", 3, true],
        [CRITICAL_SUCCESS, "S", 2, false],
    ] as const)("roll %i → %s%i edged (bleeder=%s)", (sl, severity, level, bleeder) => {
        expect(amputationInjury(sl)).toEqual({ severity, level, bleeder });
    });
});

describe("treatmentOutcome — every special effect a treatment produces", () => {
    it("a clean success leaves no special effects", () => {
        expect(
            treatmentOutcome(IMPACT_ASPECT.EDGED, "minor", TREATMENT_CODE.CLEAN, CRITICAL_SUCCESS),
        ).toEqual({
            healingRate: TREATMENT_HEAL,
            infectable: false,
            bleeder: false,
            permanentImpairmentEligible: false,
        });
    });

    it("a failed treatment exposes the wound to infection", () => {
        const out = treatmentOutcome(
            IMPACT_ASPECT.EDGED,
            "serious",
            TREATMENT_CODE.CLEAN,
            MARGINAL_FAILURE,
        );
        expect(out.infectable).toBe(true);
        expect(out.healingRate).toBe(4);
    });

    it("a marginal/critical success clears the infection risk", () => {
        expect(
            treatmentOutcome(IMPACT_ASPECT.EDGED, "serious", TREATMENT_CODE.CLEAN, MARGINAL_SUCCESS)
                .infectable,
        ).toBe(false);
    });

    it("a grievous edged wound at HR 2–3 is a bleeder and impairment-eligible", () => {
        const out = treatmentOutcome(
            IMPACT_ASPECT.EDGED,
            "grievous",
            TREATMENT_CODE.SURGERY,
            CRITICAL_FAILURE,
        );
        expect(out.healingRate).toBe(2);
        expect(out.bleeder).toBe(true);
        expect(out.permanentImpairmentEligible).toBe(true);
    });

    it("a surgical mishap (SUR/EXT on a failure) causes a bleeder", () => {
        expect(
            treatmentOutcome(
                IMPACT_ASPECT.PIERCING,
                "grievous",
                TREATMENT_CODE.SURGERY,
                MARGINAL_FAILURE,
            ).bleeder,
        ).toBe(true);
    });

    it("an AMP reports the amputation wound and folds its bleeder in", () => {
        const out = treatmentOutcome(
            IMPACT_ASPECT.EDGED,
            "grievous",
            TREATMENT_CODE.AMPUTATE,
            MARGINAL_SUCCESS,
        );
        expect(out.amputation).toEqual({
            severity: "S",
            level: 3,
            bleeder: true,
        });
        expect(out.bleeder).toBe(true);
    });

    it("a HEAL result carries no special effects", () => {
        const out = treatmentOutcome(
            IMPACT_ASPECT.BLUNT,
            "minor",
            TREATMENT_CODE.COMPRESS,
            CRITICAL_SUCCESS,
        );
        expect(out.healingRate).toBe(TREATMENT_HEAL);
        expect(out.infectable).toBe(false);
        expect(out.bleeder).toBe(false);
        expect(out.permanentImpairmentEligible).toBe(false);
        expect(out.amputation).toBeUndefined();
    });
});
