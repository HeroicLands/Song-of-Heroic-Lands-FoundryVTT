import { describe, it, expect, vi, afterEach } from "vitest";
import { AfflictionLogic } from "@src/document/item/logic/AfflictionLogic";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import {
    AFFLICTION_SUBTYPE,
    AFFLICTION_TRANSMISSION,
    ITEM_KIND,
} from "@src/utils/constants";
import { makeItemLogic } from "@tests/mocks/logicHarness";

/** Default AfflictionData fields; override per test. */
function afflictionFields(overrides: Record<string, unknown> = {}) {
    return {
        subType: AFFLICTION_SUBTYPE.DISEASE,
        category: "",
        isDormant: false,
        isTreated: false,
        diagnosisBonusBase: 0,
        levelBase: 2,
        healingRateBase: 4,
        contagionIndexBase: 3,
        transmission: AFFLICTION_TRANSMISSION.CONTACT,
        ...overrides,
    };
}

function makeAffliction(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(
        AfflictionLogic,
        ITEM_KIND.AFFLICTION,
        afflictionFields(overrides),
        opts,
    );
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("AfflictionLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object AfflictionData (no Foundry)", () => {
            const logic = makeAffliction();
            expect(logic).toBeInstanceOf(AfflictionLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.AFFLICTION);
        });

        it("builds all intrinsic actions (every executor resolves)", () => {
            const logic = makeAffliction();
            for (const shortcode of [
                "postfinalize",
                "transmitaffliction",
                "contractafflictiontest",
                "coursetest",
                "fatiguetest",
                "moraletest",
                "feartest",
                "treatmenttest",
                "diagnosistest",
                "healingtest",
            ]) {
                expect(logic.actions.has(shortcode), shortcode).toBe(true);
            }
        });

        // The transmitaffliction / contractafflictiontest actions now point at
        // the existing transmit() / contractTest() methods (name mismatch fix).
        it("fatigueTest — warns and resolves null (not yet implemented)", async () => {
            const logic = makeAffliction();
            const warn = vi.spyOn(sohl.log, "uiWarn");
            await expect(logic.fatigueTest({} as any)).resolves.toBeNull();
            expect(warn).toHaveBeenCalled();
        });

        it("moraleTest — warns and resolves null (not yet implemented)", async () => {
            const logic = makeAffliction();
            const warn = vi.spyOn(sohl.log, "uiWarn");
            await expect(logic.moraleTest({} as any)).resolves.toBeNull();
            expect(warn).toHaveBeenCalled();
        });

        it("fearTest — warns and resolves null (not yet implemented)", async () => {
            const logic = makeAffliction();
            const warn = vi.spyOn(sohl.log, "uiWarn");
            await expect(logic.fearTest({} as any)).resolves.toBeNull();
            expect(warn).toHaveBeenCalled();
        });
    });

    describe("getters", () => {
        it("canTransmit - returns true (placeholder)", () => {
            expect(makeAffliction().canTransmit).toBe(true);
        });

        it("canContract - returns true (placeholder)", () => {
            expect(makeAffliction().canContract).toBe(true);
        });

        it("hasCourse - returns true (placeholder)", () => {
            expect(makeAffliction().hasCourse).toBe(true);
        });

        it("canTreat - returns true (placeholder)", () => {
            expect(makeAffliction().canTreat).toBe(true);
        });

        it("canHeal - returns true (placeholder)", () => {
            expect(makeAffliction().canHeal).toBe(true);
        });
    });

    describe("levelLabel", () => {
        // sohl.i18n.localize is identity in tests, so localized labels
        // surface as their localization keys.
        it("maps FEAR levels to named severity labels", () => {
            const logic = makeAffliction({
                subType: AFFLICTION_SUBTYPE.FEAR,
                levelBase: 3,
            });
            logic.initialize();
            expect(logic.levelLabel).toBe("SOHL.Affliction.FEAR_LEVEL.AFRAID");
        });

        it("maps MORALE levels to named severity labels", () => {
            const logic = makeAffliction({
                subType: AFFLICTION_SUBTYPE.MORALE,
                levelBase: 4,
            });
            logic.initialize();
            expect(logic.levelLabel).toBe(
                "SOHL.Affliction.MORALE_LEVEL.ROUTED",
            );
        });

        it("clamps negative effective levels to 0", () => {
            const logic = makeAffliction({
                subType: AFFLICTION_SUBTYPE.FEAR,
                levelBase: -2,
            });
            logic.initialize();
            expect(logic.levelLabel).toBe("SOHL.Affliction.FEAR_LEVEL.NONE");
        });

        it("returns the numeric level as a string for other subtypes", () => {
            const logic = makeAffliction({
                subType: AFFLICTION_SUBTYPE.DISEASE,
                levelBase: 3,
            });
            logic.initialize();
            expect(logic.levelLabel).toBe("3");
        });

        it("falls back to the numeric string for out-of-range FEAR levels", () => {
            const logic = makeAffliction({
                subType: AFFLICTION_SUBTYPE.FEAR,
                levelBase: 7,
            });
            logic.initialize();
            expect(logic.levelLabel).toBe("7");
        });
    });

    describe("categoryLabel", () => {
        it("returns empty string when category is unset", () => {
            const logic = makeAffliction({ category: "" });
            expect(logic.categoryLabel).toBe("");
        });

        it("maps FATIGUE categories to their localized labels", () => {
            const logic = makeAffliction({
                subType: AFFLICTION_SUBTYPE.FATIGUE,
                category: "weariness",
            });
            expect(logic.categoryLabel).toBe(
                "SOHL.Affliction.FATIGUE_CATEGORY.WEARINESS",
            );
        });

        it("maps PRIVATION categories to their localized labels", () => {
            const logic = makeAffliction({
                subType: AFFLICTION_SUBTYPE.PRIVATION,
                category: "cold",
            });
            expect(logic.categoryLabel).toBe(
                "SOHL.Affliction.PRIVATION_CATEGORY.COLD",
            );
        });

        it("returns the raw category for other subtypes", () => {
            const logic = makeAffliction({
                subType: AFFLICTION_SUBTYPE.DISEASE,
                category: "plague",
            });
            expect(logic.categoryLabel).toBe("plague");
        });

        it("returns the raw category for an unknown FATIGUE category", () => {
            const logic = makeAffliction({
                subType: AFFLICTION_SUBTYPE.FATIGUE,
                category: "not-a-category",
            });
            expect(logic.categoryLabel).toBe("not-a-category");
        });
    });

    describe("transmit", () => {
        it("logs a warning (not yet implemented)", async () => {
            const warn = vi.spyOn((globalThis as any).sohl.log, "warn");
            const logic = makeAffliction();
            await expect(logic.transmit({} as any)).resolves.toBeUndefined();
            expect(warn).toHaveBeenCalledWith(
                "Affliction Transmit Not Implemented",
            );
        });
    });

    // The five test methods below currently throw "Not Implemented" — that
    // is their explicit contract pending roadmap T2-1.
    describe("contractTest", () => {
        it("rejects with not implemented error (roadmap T2-1)", async () => {
            const logic = makeAffliction();
            await expect(logic.contractTest({} as any)).rejects.toThrow(
                "Affliction Contract Test Not Implemented",
            );
        });
    });

    describe("courseTest", () => {
        it("rejects with not implemented error (roadmap T2-1)", async () => {
            const logic = makeAffliction();
            await expect(logic.courseTest({} as any)).rejects.toThrow(
                "Affliction Course Test Not Implemented",
            );
        });
    });

    describe("diagnosisTest", () => {
        it("rejects with not implemented error (roadmap T2-1)", async () => {
            const logic = makeAffliction();
            await expect(logic.diagnosisTest({} as any)).rejects.toThrow(
                "Affliction Diagnosis Test Not Implemented",
            );
        });
    });

    describe("treatmentTest", () => {
        it("rejects with not implemented error (roadmap T2-1)", async () => {
            const logic = makeAffliction();
            await expect(logic.treatmentTest({} as any)).rejects.toThrow(
                "Affliction Treatment Test Not Implemented",
            );
        });
    });

    describe("healingTest", () => {
        it("rejects with not implemented error (roadmap T2-1)", async () => {
            const logic = makeAffliction();
            await expect(logic.healingTest({} as any)).rejects.toThrow(
                "Affliction Healing Test Not Implemented",
            );
        });
    });

    describe("initialize", () => {
        it("sets isDormant to false", () => {
            const logic = makeAffliction();
            logic.initialize();
            expect(logic.isDormant).toBe(false);
        });

        it("sets isTreated to false", () => {
            const logic = makeAffliction();
            logic.initialize();
            expect(logic.isTreated).toBe(false);
        });

        it("creates diagnosisBonus ValueModifier", () => {
            // Note: despite the field docs, diagnosisBonus is NOT seeded
            // from data.diagnosisBonusBase — it starts at 0.
            const logic = makeAffliction({ diagnosisBonusBase: 5 });
            logic.initialize();
            expect(logic.diagnosisBonus).toBeInstanceOf(ValueModifier);
            expect(logic.diagnosisBonus.base).toBe(0);
            expect(logic.diagnosisBonus.effective).toBe(0);
        });

        it("creates level ValueModifier from data.levelBase", () => {
            const logic = makeAffliction({ levelBase: 4 });
            logic.initialize();
            expect(logic.level).toBeInstanceOf(ValueModifier);
            expect(logic.level.base).toBe(4);
            expect(logic.level.effective).toBe(4);
        });

        it("creates healingRate ValueModifier from data.healingRateBase", () => {
            const logic = makeAffliction({ healingRateBase: 5 });
            logic.initialize();
            expect(logic.healingRate).toBeInstanceOf(ValueModifier);
            expect(logic.healingRate.base).toBe(5);
            expect(logic.healingRate.effective).toBe(5);
            expect(logic.healingRate.disabled).toBeFalsy();
        });

        it("disables healingRate when healingRateBase is -1", () => {
            const logic = makeAffliction({ healingRateBase: -1 });
            logic.initialize();
            expect(logic.healingRate.disabled).toBe("No Healing Rate");
            expect(logic.healingRate.effective).toBe(0);
        });

        it("creates contagionIndex ValueModifier from data.contagionIndexBase", () => {
            const logic = makeAffliction({ contagionIndexBase: 3 });
            logic.initialize();
            expect(logic.contagionIndex).toBeInstanceOf(ValueModifier);
            expect(logic.contagionIndex.base).toBe(3);
            expect(logic.contagionIndex.effective).toBe(3);
        });

        it("sets transmission to AFFLICTION_TRANSMISSION.NONE", () => {
            // Note: current behavior ignores data.transmission; initialize
            // always resets to NONE.
            const logic = makeAffliction({
                transmission: AFFLICTION_TRANSMISSION.CONTACT,
            });
            logic.initialize();
            expect(logic.transmission).toBe(AFFLICTION_TRANSMISSION.NONE);
        });
    });

    describe("evaluate / finalize", () => {
        it("run without error after initialize", () => {
            const logic = makeAffliction();
            logic.initialize();
            expect(() => {
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });
    });
});

describe("AfflictionDataModel", () => {
    // The DataModel is Foundry-layer (implements AfflictionData via Foundry's
    // schema system); its schema is exercised in Foundry integration, not
    // in unit tests.
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines subType with AfflictionSubTypes choices");
        it.todo("defines category as a StringField");
        it.todo("defines isDormant as a BooleanField");
        it.todo("defines isTreated as a BooleanField");
        it.todo("defines diagnosisBonusBase as a NumberField");
        it.todo("defines levelBase as a NumberField with min 0");
        it.todo("defines healingRateBase as a NumberField");
        it.todo("defines contagionIndexBase as a NumberField with min 0");
        it.todo("defines transmission with AfflictionTransmissions choices");
    });

    it.todo("has kind set to ITEM_KIND.AFFLICTION");
});
